import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { validateObjectId } from '@/utils/validators';

/**
 * GET /api/posts/[postId]
 * Fetch a single post by ID.
 */
export async function GET(request, { params }) {
  try {
    const { postId } = await params;

    // Validate postId is valid ObjectId
    if (!validateObjectId(postId)) {
      return NextResponse.json({ message: 'Invalid Post ID' }, { status: 400 });
    }

    await connectDB();

    // Find post and populate author details
    const post = await Post.findById(postId)
      .populate('author', 'name username avatar college')
      .lean();

    // If not found, return 404
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Post fetch error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
