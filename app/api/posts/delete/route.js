import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import AnonymousPost from '@/models/AnonymousPost';
import { findPostById } from '@/lib/post-utils';
import User from '@/models/User';
import Comment from '@/models/Comment';
import { getCurrentUser } from '@/lib/auth';
import { validateObjectId } from '@/utils/validators';
import { removeHashtags } from '@/lib/hashtag-utils';
import { deletePostNotifications } from '@/lib/notifications';
import { applyRateLimit } from '@/lib/rate-limit';
import { sanitizeMongoInput } from '@/lib/sanitize';

export async function DELETE(request) {
  try {
    // Rate limit post deletion - 10 per hour per IP
    const { blocked, response: rateLimitResponse } = applyRateLimit(
      request,
      'post_delete',
      10,
      60 * 60 * 1000
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

    // Anonymous posts don't have an author field, so only admins (if they exist) can delete them
    // For now, let's assume regular users can't delete anonymous posts because we can't verify ownership
    if (post.isAnonymous || !post.author) {
       // Check if user is an admin (this is a placeholder, you might want to implement real admin check)
       const isAdmin = currentUser.role === 'admin' || currentUser.username === 'admin'; 
       if (!isAdmin) {
         return NextResponse.json({ message: 'Forbidden: Anonymous posts can only be deleted by administrators' }, { status: 403 });
       }
    } else if (post.author.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ message: 'Forbidden: You are not the author of this post' }, { status: 403 });
    }

    await Promise.all([
      Comment.deleteMany({ post: postId }),
      PostModel.findByIdAndDelete(postId),
      deletePostNotifications(postId),
    ]);

    // Remove this post from all users' bookmarks
    await User.updateMany(
      { bookmarks: postId },
      { $pull: { bookmarks: postId } }
    );

    // Remove hashtags
    if (post.hashtags?.length > 0) {
      await removeHashtags(post.hashtags);
    }

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Post deletion error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
