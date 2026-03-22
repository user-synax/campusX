import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import AnonymousPost from '@/models/AnonymousPost';
import { findPostById } from '@/lib/post-utils';
import { validateObjectId } from '@/utils/validators';
import { sanitizeUser, sanitizeMongoInput } from '@/lib/sanitize';

/**
 * GET /api/posts/[postId]/reactions
 * Fetch detailed reactions for a post, including user info.
 */
export async function GET(request, { params }) {
  try {
    const { postId } = sanitizeMongoInput(await params);

    if (!validateObjectId(postId)) {
      return NextResponse.json({ message: 'Invalid Post ID' }, { status: 400 });
    }

    await connectDB();

    const { post, model: PostModel } = await findPostById(postId);
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    // Anonymous posts don't show user reactions publicly for privacy
    if (PostModel === AnonymousPost) {
      return NextResponse.json({ reactions: [] });
    }

    // Fetch full post with populated reactions
    const populatedPost = await Post.findById(postId)
      .populate('reactions.userId', 'name username avatar college')
      .populate('likes', 'name username avatar college')
      .lean();

    // Transform reactions into a grouped format
    const detailedReactions = populatedPost.reactions.map(r => ({
      userId: sanitizeUser(r.userId),
      type: r.type,
      createdAt: r.createdAt
    }));

    const detailedLikes = populatedPost.likes.map(u => ({
      userId: sanitizeUser(u),
      type: 'LIKE',
      createdAt: populatedPost.createdAt // We don't track like time separately yet
    }));

    return NextResponse.json({ 
      reactions: [...detailedLikes, ...detailedReactions] 
    });

  } catch (error) {
    console.error('[Post Reactions GET Error]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
