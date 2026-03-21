import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Notification from '@/models/Notification';
import { getCurrentUser } from '@/lib/auth';
import { validateObjectId } from '@/utils/validators';
import { sanitizeMongoInput } from '@/lib/sanitize';

// POST /api/notifications/read
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
      body = {};
    }

    const cleanBody = sanitizeMongoInput(body);
    const { notificationId } = cleanBody;

    await connectDB();

    if (notificationId) {
      if (!validateObjectId(notificationId)) {
        return NextResponse.json({ message: 'Invalid Notification ID' }, { status: 400 });
      }
      await Notification.updateOne(
        { _id: notificationId, recipient: currentUser._id },
        { read: true }
      );
    } else {
      await Notification.updateMany(
        { recipient: currentUser._id, read: false },
        { read: true }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
