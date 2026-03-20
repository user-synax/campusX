import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { validateObjectId } from '@/utils/validators';

// GET /api/bookmarks/check?postId=xxx
export async function GET(request) {
  try {
    const currentUserInfo = await getCurrentUser(request);
    if (!currentUserInfo) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId || !validateObjectId(postId)) {
      return NextResponse.json({ message: 'Invalid Post ID' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(currentUserInfo._id).select('bookmarks').lean();
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const isBookmarked = user.bookmarks.some(id => id.toString() === postId);

    return NextResponse.json({ bookmarked: isBookmarked });
  } catch (error) {
    console.error('Bookmark check error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
