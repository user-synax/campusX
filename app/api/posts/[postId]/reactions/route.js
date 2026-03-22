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

    // Use the model returned by findPostById to fetch the full populated post
    const populatedPost = await PostModel.findById(postId)
      .populate('reactions.user', 'name username avatar college')
      .populate('likes', 'name username avatar college')
      .lean();

    if (!populatedPost) {
      return NextResponse.json({ message: 'Post not found during population' }, { status: 404 });
    }

    // Transform reactions into a grouped format
    const detailedReactions = (populatedPost.reactions || []).map(r => {
      if (!r.user) return null;
      // If user is not found after population, r.user might be an ID or null
      if (typeof r.user === 'string' || r.user instanceof Object === false) return null;

      return {
        user: sanitizeUser(r.user),
        type: r.type,
        createdAt: r.createdAt || populatedPost.createdAt
      };
    }).filter(Boolean);

    const detailedLikes = (populatedPost.likes || []).map(u => {
      if (!u || typeof u === 'string') return null;
      return {
        user: sanitizeUser(u),
        type: 'like',
        createdAt: populatedPost.createdAt
      };
    }).filter(Boolean);

    // Filter duplicates (if someone is in both likes and reactions)
    const seenUsers = new Set();
    const allReactions = [...detailedReactions, ...detailedLikes].filter(item => {
      const userId = item.user._id.toString();
      if (seenUsers.has(userId)) return false;
      seenUsers.add(userId);
      return true;
    });

    return NextResponse.json({ 
      reactions: allReactions
    });

  } catch (error) {
    console.error('[Post Reactions GET Error]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
