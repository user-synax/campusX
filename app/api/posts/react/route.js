import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { getCurrentUser } from '@/lib/auth';
import { validateObjectId } from '@/utils/validators';
import { createNotification, deleteNotification } from '@/lib/notifications';
import { REACTION_KEYS, computeReactionSummary } from '@/lib/reaction-utils';
import { awardXP } from '@/lib/xp';

export async function POST(request) {
  try {
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

    const { postId, reactionType } = body;

    if (!validateObjectId(postId)) {
      return NextResponse.json({ message: 'Invalid Post ID' }, { status: 400 });
    }

    if (!REACTION_KEYS.includes(reactionType)) {
      return NextResponse.json({ message: 'Invalid Reaction Type' }, { status: 400 });
    }

    await connectDB();

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    const currentUserIdStr = currentUser._id.toString();
    const existingReaction = post.reactions.find(r => r.user.toString() === currentUserIdStr);

    let updatedPost;

    // Backward compatibility: If user is in likes array, remove them first
    if (post.likes.includes(currentUser._id)) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: currentUser._id } });
      // If they were just "liking", remove the like notification before potentially creating a new one
      await deleteNotification({
        sender: currentUser._id,
        type: 'like',
        post: postId
      });
    }

    if (!existingReaction) {
      // CASE A: No existing reaction - $push
      updatedPost = await Post.findOneAndUpdate(
        { _id: postId },
        { $push: { reactions: { user: currentUser._id, type: reactionType } } },
        { new: true }
      );

      // Create notification for all reaction types
      await createNotification({
        recipient: post.author,
        sender: currentUser._id,
        type: 'reaction', // New notification type
        reactionType: reactionType,
        post: postId
      });

      return NextResponse.json({
        success: true,
        reactions: updatedPost.reactions,
        summary: computeReactionSummary(updatedPost.reactions)
      });
    } else if (existingReaction.type === reactionType) {
      // CASE B: Same reaction type - $pull (Toggle off)
      updatedPost = await Post.findOneAndUpdate(
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
      updatedPost = await Post.findOneAndUpdate(
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
      reacted: !!userReaction,
      reactionType: userReaction,
      summary
    });

  } catch (error) {
    console.error('Reaction update error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
