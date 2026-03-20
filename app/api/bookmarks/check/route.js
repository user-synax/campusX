
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import User from '@/models/User';
import dbConnect from '@/lib/db';

export async function GET(req) {
  await dbConnect();
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });
    }

    const user = await User.findById(token.id).select('bookmarks').lean();

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const bookmarked = user.bookmarks.some(bm => bm.toString() === postId);

    return NextResponse.json({ bookmarked });

  } catch (error) {
    console.error('Error checking bookmark:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
