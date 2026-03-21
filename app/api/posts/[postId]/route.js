import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { validateObjectId } from '@/utils/validators';
import { sanitizeUser, sanitizeMongoInput } from '@/lib/sanitize';
import { getCurrentUser } from '@/lib/auth';
import { computeReactionSummary, getUserReaction } from '@/lib/reaction-utils';

/**
 * GET /api/posts/[postId]
 * Fetch a single post by ID.
 */
export async function GET(request, { params }) {
  try {
    const currentUser = await getCurrentUser(request);
    const { postId } = sanitizeMongoInput(await params);

    // Validate postId is valid ObjectId
    if (!validateObjectId(postId)) {
      return NextResponse.json({ message: 'Invalid Post ID' }, { status: 400 });
    }

    await connectDB();

    // Find post and populate author details
    const post = await Post.findById(postId)
      .populate('author', 'name username avatar college')
      .lean();

    // If not found, return 404
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    // Add reaction summary and user status
    const summary = computeReactionSummary(post.reactions, post.likes);
    const userReaction = currentUser ? getUserReaction(post.reactions, currentUser._id, post.likes) : null;
    const isLiked = currentUser ? post.likes?.some(id => id.toString() === currentUser._id.toString()) : false;

    // Sanitize author and remove sensitive raw fields
    const { reactions, likes, author, ...postData } = post;
    
    return NextResponse.json({
      ...postData,
      likesCount: post.likesCount ?? post.likes?.length ?? 0,
      author: sanitizeUser(author),
      _reactionSummary: summary,
      _userReaction: userReaction,
      _isLiked: isLiked
    });
  } catch (error) {
    console.error('Post fetch error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
