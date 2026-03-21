import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import { getCurrentUser } from '@/lib/auth';
import { validateObjectId, sanitizeString } from '@/utils/validators';
import { createNotification } from '@/lib/notifications';
import { applyRateLimit } from '@/lib/rate-limit';

// GET /api/posts/[postId]/comments
export async function GET(request, { params }) {
  try {
    const { postId } = await params;

    if (!validateObjectId(postId)) {
      return NextResponse.json({ message: 'Invalid Post ID' }, { status: 400 });
    }

    await connectDB();

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: 1 })
      .populate('author', 'name username avatar')
      .lean();

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Comment fetching error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/posts/[postId]/comments
export async function POST(request, { params }) {
  try {
    // Rate limit comments - 20 comments per 10 minutes per IP
    const { blocked, response: rateLimitResponse } = applyRateLimit(
      request,
      'post_comment',
      20,
      10 * 60 * 1000
    );
    if (blocked) return rateLimitResponse;

    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await params;
    if (!validateObjectId(postId)) {
      return NextResponse.json({ message: 'Invalid Post ID' }, { status: 400 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { content } = body;
    if (!content || !content.trim()) {
      return NextResponse.json({ message: 'Comment content is required' }, { status: 400 });
    }

    const sanitizedContent = sanitizeString(content);
    if (sanitizedContent.length > 280) {
      return NextResponse.json({ message: 'Comment too long' }, { status: 400 });
    }

    await connectDB();

    const comment = await Comment.create({
      post: postId,
      author: currentUser._id,
      content: sanitizedContent,
    });

    const post = await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    // Notification
    if (post && post.author) {
      await createNotification({
        recipient: post.author,
        sender: currentUser._id,
        type: 'comment',
        post: postId,
        comment: comment._id
      });
    }

    await comment.populate('author', 'name username avatar');

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/posts/[postId]/comments
export async function DELETE(request, { params }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await params;
    if (!validateObjectId(postId)) {
      return NextResponse.json({ message: 'Invalid Post ID' }, { status: 400 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { commentId } = body;

    if (!validateObjectId(commentId)) {
      return NextResponse.json({ message: 'Invalid Comment ID' }, { status: 400 });
    }

    await connectDB();

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    // Auth: Comment author OR Post author can delete
    const isCommentAuthor = comment.author.toString() === currentUser._id.toString();
    const isPostAuthor = post.author.toString() === currentUser._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await Comment.findByIdAndDelete(commentId);
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: -1 } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Comment deletion error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
