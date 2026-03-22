import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import AnonymousPost from '@/models/AnonymousPost';
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

    // Strategy A: MongoDB $text search in both collections
    const textQuery = { $text: { $search: sanitizedQuery } };
    
    // For search, we combine both collections using aggregation for better ranking
    const pipeline = [
      { $match: textQuery },
      { $unionWith: { coll: 'anonymousposts', pipeline: [{ $match: textQuery }] } },
      { $addFields: { score: { $meta: 'textScore' } } },
      { $sort: { score: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    posts = await Post.aggregate(pipeline);
    posts = await Post.populate(posts, { path: 'author', select: 'name username avatar college' });
    
    const postCount = await Post.countDocuments(textQuery);
    const anonCount = await AnonymousPost.countDocuments(textQuery);
    total = postCount + anonCount;

    if (posts.length === 0) {
      // Strategy B: Fallback regex in both collections
      const regexQuery = { content: { $regex: sanitizedQuery, $options: 'i' } };
      
      const regexPipeline = [
        { $match: regexQuery },
        { $unionWith: { coll: 'anonymousposts', pipeline: [{ $match: regexQuery }] } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ];

      posts = await Post.aggregate(regexPipeline);
      posts = await Post.populate(posts, { path: 'author', select: 'name username avatar college' });
      
      const regPostCount = await Post.countDocuments(regexQuery);
      const regAnonCount = await AnonymousPost.countDocuments(regexQuery);
      total = regPostCount + regAnonCount;
    }

    // Add reaction summary and user reaction status
    const postsWithReactions = posts.map(post => {
      const summary = computeReactionSummary(post.reactions, post.likes);
      const userReaction = currentUser ? getUserReaction(post.reactions, currentUser._id, post.likes) : null;
      const isLiked = currentUser ? post.likes?.some(id => id.toString() === currentUser._id.toString()) : false;
      
      const { reactions, likes, author, ...postData } = post;
      
      return {
        ...postData,
        likesCount: post.likesCount ?? post.likes?.length ?? 0,
        author: sanitizeUser(author),
        _reactionSummary: summary,
        _userReaction: userReaction,
        _isLiked: isLiked
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
