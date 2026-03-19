import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Notification from '@/models/Notification';
import { getCurrentUser } from '@/lib/auth';

// GET /api/notifications
export async function GET(request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 50);
    const skip = (page - 1) * limit;

    await connectDB();

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: currentUser._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'name username avatar')
        .populate({
          path: 'post',
          select: 'content',
          transform: (doc) => {
            if (!doc) return null;
            return {
              _id: doc._id,
              content: doc.content.substring(0, 50) + (doc.content.length > 50 ? '...' : '')
            };
          }
        })
        .lean(),
      Notification.countDocuments({ recipient: currentUser._id }),
      Notification.countDocuments({ recipient: currentUser._id, read: false })
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
      hasMore: skip + notifications.length < total,
      total
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
