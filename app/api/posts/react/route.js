import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import AnonymousPost from '@/models/AnonymousPost';
import { findPostById } from '@/lib/post-utils';
import { getCurrentUser } from '@/lib/auth';
import { validateObjectId } from '@/utils/validators';
import { createNotification, deleteNotification } from '@/lib/notifications';
import { REACTION_KEYS, computeReactionSummary } from '@/lib/reaction-utils';
import { applyRateLimit } from '@/lib/rate-limit';
import { sanitizeMongoInput } from '@/lib/sanitize';

export async function POST(request) {
  try {
    // Rate limit reactions - 60 reactions per minute per IP
    const { blocked, response: rateLimitResponse } = applyRateLimit(
      request,
      'post_react',
      60,
      60 * 1000
    );
    if (blocked) return rateLimitResponse;

    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const cleanBody = sanitizeMongoInput(body);
    const { postId, reactionType } = cleanBody;

    if (!validateObjectId(postId)) {
      return NextResponse.json({ message: 'Invalid Post ID' }, { status: 400 });
    }

    if (!REACTION_KEYS.includes(reactionType)) {
      return NextResponse.json({ message: 'Invalid Reaction Type' }, { status: 400 });
    }

    await connectDB();

    const { post, model: PostModel } = await findPostById(postId);
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    const currentUserIdStr = currentUser._id.toString();
    const existingReaction = post.reactions.find(r => r.user.toString() === currentUserIdStr);

    let updatedPost;

    // Backward compatibility: If user is in likes array, remove them first
    if (post.likes.includes(currentUser._id)) {
      await PostModel.updateOne({ _id: postId }, { $pull: { likes: currentUser._id } });
      // If they were just "liking", remove the like notification before potentially creating a new one
      await deleteNotification({
        sender: currentUser._id,
        type: 'like',
        post: postId
      });
    }

    if (!existingReaction) {
      // CASE A: No existing reaction - $push
      updatedPost = await PostModel.findOneAndUpdate(
        { _id: postId },
        { $push: { reactions: { user: currentUser._id, type: reactionType } } },
        { new: true }
      );

      // Create notification for all reaction types - ONLY if not anonymous
      if (!post.isAnonymous && post.author && post.author.toString() !== currentUserIdStr) {
        await createNotification({
          recipient: post.author,
          sender: currentUser._id,
          type: 'reaction',
          reactionType: reactionType,
          post: postId
        });
      }
    } else if (existingReaction.type === reactionType) {
      // CASE B: Same reaction type - $pull (Toggle off)
      updatedPost = await PostModel.findOneAndUpdate(
        { _id: postId },
        { $pull: { reactions: { user: currentUser._id } } },
        { new: true }
      );

      // Delete notification
      await deleteNotification({
        sender: currentUser._id,
        type: 'reaction',
        post: postId
      });
    } else {
      // CASE C: Different reaction type - $set (Update)
      updatedPost = await PostModel.findOneAndUpdate(
        { _id: postId, 'reactions.user': currentUser._id },
        { $set: { 'reactions.$.type': reactionType } },
        { new: true }
      );

      // Update notification info if needed (notifications usually just say "reacted")
      // For now, we'll just keep the existing notification or update its type if we want specific notifications per reaction
    }

    const summary = computeReactionSummary(updatedPost.reactions, updatedPost.likes);
    const userReaction = updatedPost.reactions.find(r => r.user.toString() === currentUserIdStr)?.type || null;

    return NextResponse.json({
      success: true,
      reacted: !!userReaction,
      reactionType: userReaction,
      summary
    });

  } catch (error) {
    console.error('Reaction update error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
