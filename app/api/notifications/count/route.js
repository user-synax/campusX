import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Notification from '@/models/Notification';
import User from '@/models/User';
import Post from '@/models/Post';
import Event from '@/models/Event';
import Resource from '@/models/Resource';
import { getCurrentUser } from '@/lib/auth';

// GET /api/notifications/count
export async function GET(request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const count = await Notification.countDocuments({
      recipient: currentUser._id,
      read: false
    });

    return NextResponse.json({ count: Math.min(count, 99) });
  } catch (error) {
    console.error('Fetch notification count error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
