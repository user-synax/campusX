import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import AnonymousPost from '@/models/AnonymousPost';
import { findPostById } from '@/lib/post-utils';
import { getCurrentUser } from '@/lib/auth';
import { validateObjectId } from '@/utils/validators';
import { createNotification, deleteNotification } from '@/lib/notifications';
import { applyRateLimit } from '@/lib/rate-limit';
import { sanitizeMongoInput } from '@/lib/sanitize';

export async function POST(request) {
  try {
    // Rate limit likes - 60 likes per minute per IP
    const { blocked, response: rateLimitResponse } = applyRateLimit(
      request,
      'post_like',
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
    const { postId } = cleanBody;

    if (!validateObjectId(postId)) {
      return NextResponse.json({ message: 'Invalid Post ID' }, { status: 400 });
    }

    await connectDB();

    const { post, model: PostModel } = await findPostById(postId);
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    const currentUserIdStr = currentUser._id.toString();
    const isLiked = post.likes.some(id => id.toString() === currentUserIdStr);

    let updatedPost;
    if (isLiked) {
      // Unlike optimized: $pull and $inc -1
      updatedPost = await PostModel.findOneAndUpdate(
        { _id: postId },
        { 
          $pull: { likes: currentUser._id },
          $inc: { likesCount: -1 }
        },
        { new: true }
      );

      // Delete notification
      await deleteNotification({
        sender: currentUser._id,
        type: 'like',
        post: postId
      }).catch(err => console.error('Notification error:', err));
    } else {
      // Like optimized: $addToSet and $inc +1
      updatedPost = await PostModel.findOneAndUpdate(
        { _id: postId },
        { 
          $addToSet: { likes: currentUser._id },
          $inc: { likesCount: 1 }
        },
        { new: true }
      );

      // Create notification - ONLY if it's not an anonymous post or if it has an author
      if (!post.isAnonymous && post.author && post.author.toString() !== currentUserIdStr) {
        await createNotification({
          recipient: post.author,
          sender: currentUser._id,
          type: 'like',
          postId: postId
        }).catch(err => console.error('Notification error:', err));
      }
    }

    // Double check count safety (to prevent negative likes if something goes wrong)
    if (updatedPost.likesCount < 0) {
      updatedPost.likesCount = 0;
      await updatedPost.save();
    }

    return NextResponse.json({
      success: true,
      liked: !isLiked,
      likesCount: updatedPost.likesCount
    });

  } catch (error) {
    console.error('Like API error:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: error.message 
    }, { status: 500 });
  }
}
