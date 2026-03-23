import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import AnonymousPost from '@/models/AnonymousPost';
import { findPostById } from '@/lib/post-utils';
import { validateObjectId } from '@/utils/validators';
import { sanitizeUser, sanitizeMongoInput } from '@/lib/sanitize';
import { getCurrentUser } from '@/lib/auth';
import { computeReactionSummary, getUserReaction } from '@/lib/reaction-utils';
import { attachEquippedToItems } from '@/lib/equipped-helpers';

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

    // Find post from either collection and populate author if present
    const { post, model: PostModel } = await findPostById(postId);
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    let populatedPost = post;
    if (PostModel === Post) {
      populatedPost = await Post.findById(postId)
        .populate('author', 'name username avatar college')
        .lean();
    } else {
      // Anonymous post - no author to populate
      populatedPost = post.toObject ? post.toObject() : post;
    }

    // Add reaction summary and user status
    const summary = computeReactionSummary(populatedPost.reactions, populatedPost.likes);
    const userReaction = currentUser ? getUserReaction(populatedPost.reactions, currentUser._id, populatedPost.likes) : null;
    const isLiked = currentUser ? populatedPost.likes?.some(id => id.toString() === currentUser._id.toString()) : false;

    // Sanitize author and remove sensitive raw fields
    const { reactions, likes, author, ...postData } = populatedPost;
    
    const postResponse = {
      ...postData,
      likesCount: populatedPost.likesCount ?? populatedPost.likes?.length ?? 0,
      author: author ? sanitizeUser(author) : null,
      _reactionSummary: summary,
      _userReaction: userReaction,
      _isLiked: isLiked
    };

    // Attach equipped visuals
    const [postWithEquipped] = await attachEquippedToItems([postResponse]);

    return NextResponse.json(postWithEquipped);
  } catch (error) {
    console.error('Post fetch error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
