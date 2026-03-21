import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { getCurrentUser } from '@/lib/auth';
import { computeReactionSummary, getUserReaction } from '@/lib/reaction-utils';
import { applyRateLimit } from '@/lib/rate-limit';
import { sanitizeMongoInput, sanitizeUser } from '@/lib/sanitize';

export async function GET(request) {
  try {
    // Rate limit search - 30 searches per minute per IP
    const { blocked, response: rateLimitResponse } = applyRateLimit(
      request,
      'search_posts',
      30,
      60 * 1000
    );
    if (blocked) return rateLimitResponse;

    const currentUser = await getCurrentUser(request);
    const { searchParams } = new URL(request.url);
    let q = sanitizeMongoInput(searchParams.get('q') || '');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 50);
    const skip = (page - 1) * limit;

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ message: 'Query too short' }, { status: 400 });
    }

    if (q.length > 100) {
      q = q.toString().substring(0, 100);
    }

    // Sanitize: remove special regex characters
    let sanitizedQuery = q.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Sanitize @ prefix
    if (sanitizedQuery.startsWith('@')) {
      sanitizedQuery = sanitizedQuery.substring(1);
    }

    await connectDB();

    let posts = [];
    let total = 0;

    // Strategy A: MongoDB $text search
    const textQuery = { $text: { $search: sanitizedQuery } };
    [posts, total] = await Promise.all([
      Post.find(textQuery, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .populate('author', 'name username avatar college')
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(textQuery)
    ]);

    if (posts.length === 0) {
      // Strategy B: Fallback regex
      const regexQuery = { content: { $regex: sanitizedQuery, $options: 'i' } };
      [posts, total] = await Promise.all([
        Post.find(regexQuery)
          .sort({ createdAt: -1 })
          .populate('author', 'name username avatar college')
          .skip(skip)
          .limit(limit)
          .lean(),
        Post.countDocuments(regexQuery)
      ]);
    }

    // Add reaction summary and user reaction status
    const postsWithReactions = posts.map(post => {
      const summary = computeReactionSummary(post.reactions, post.likes);
      const userReaction = currentUser ? getUserReaction(post.reactions, currentUser._id, post.likes) : null;
      
      const { reactions, likes, author, ...postData } = post;
      
      return {
        ...postData,
        author: sanitizeUser(author),
        _reactionSummary: summary,
        _userReaction: userReaction
      };
    });

    return NextResponse.json({
      posts: postsWithReactions,
      total,
      hasMore: skip + posts.length < total,
      query: sanitizedQuery
    });
  } catch (error) {
    console.error('Search posts error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
