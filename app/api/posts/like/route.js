import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { getCurrentUser } from '@/lib/auth';
import { validateObjectId } from '@/utils/validators';
import { createNotification, deleteNotification } from '@/lib/notifications';

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

    const { postId } = body;

    if (!validateObjectId(postId)) {
      return NextResponse.json({ message: 'Invalid Post ID' }, { status: 400 });
    }

    await connectDB();

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    const wasLiked = post.likes.includes(currentUser._id);
    const nowLiked = !wasLiked;

    if (wasLiked) {
      post.likes.pull(currentUser._id);
    } else {
      post.likes.push(currentUser._id);
    }

    await post.save();

    // Notifications
    if (nowLiked) {
      await createNotification({
        recipient: post.author,
        sender: currentUser._id,
        type: 'like',
        post: postId
      });
    } else {
      await deleteNotification({
        sender: currentUser._id,
        type: 'like',
        post: postId
      });
    }

    return NextResponse.json({
      liked: nowLiked,
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error('Like toggle error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
