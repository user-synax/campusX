import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import { getCurrentUser } from '@/lib/auth';
import { validateObjectId } from '@/utils/validators';
import { deletePostNotifications } from '@/lib/notifications';

export async function DELETE(request) {
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

    if (post.author.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ message: 'Forbidden: You are not the author of this post' }, { status: 403 });
    }

    await Promise.all([
      Comment.deleteMany({ post: postId }),
      Post.findByIdAndDelete(postId),
      deletePostNotifications(postId),
    ]);

    // Remove this post from all users' bookmarks
    await User.updateMany(
      { bookmarks: postId },
      { $pull: { bookmarks: postId } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Post deletion error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
