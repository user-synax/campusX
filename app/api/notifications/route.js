import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Notification from '@/models/Notification';
import User from '@/models/User';
import Post from '@/models/Post';
import Event from '@/models/Event';
import Resource from '@/models/Resource';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/notifications
 * Fetch paginated notifications for the current user.
 */
export async function GET(request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    // Add level_up notifications to the default query
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: currentUser._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actor', 'name username avatar')
        .populate('sender', 'name username avatar')
        .populate('postId', 'content')
        .populate('post', 'content')
        .populate('eventId', 'title')
        .populate('resourceId', 'title')
        .lean(),
      Notification.countDocuments({ recipient: currentUser._id }),
      Notification.countDocuments({ recipient: currentUser._id, read: false })
    ]);

    return NextResponse.json({
      notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/notifications/read
 * Mark all notifications as read for the current user.
 */
export async function POST(request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    await Notification.updateMany(
      { recipient: currentUser._id, read: false },
      { read: true }
    );

    return NextResponse.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications read:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
