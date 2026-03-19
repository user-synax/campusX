import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { getCurrentUser } from '@/lib/auth';
import { sanitizeString } from '@/utils/validators';

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

    const { content, community, isAnonymous } = body;

    await connectDB();

    if (!content || !content.trim()) {
      return NextResponse.json({ message: 'Content is required' }, { status: 400 });
    }

    const sanitizedContent = sanitizeString(content);
    if (sanitizedContent.length > 500) {
      return NextResponse.json({ message: 'Post too long' }, { status: 400 });
    }

    const post = await Post.create({
      author: currentUser._id,
      content: sanitizedContent,
      community: community || '',
      isAnonymous: isAnonymous || false,
    });

    await post.populate('author', 'name username avatar college');

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Post creation error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
