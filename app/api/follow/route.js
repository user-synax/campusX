import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { validateObjectId } from '@/utils/validators';
import { createNotification } from '@/lib/notifications';
import { awardXP } from '@/lib/xp';

export async function POST(request) {
  try {
    const currentUserInfo = await getCurrentUser(request);
    if (!currentUserInfo) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { targetUserId } = body;

    if (!validateObjectId(targetUserId)) {
      return NextResponse.json({ message: 'Invalid User ID' }, { status: 400 });
    }

    if (targetUserId === currentUserInfo._id.toString()) {
      return NextResponse.json({ message: 'You cannot follow yourself' }, { status: 400 });
    }

    await connectDB();

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserInfo._id),
      User.findById(targetUserId)
    ]);

    if (!targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const wasFollowing = currentUser.following.includes(targetUserId);
    const nowFollowing = !wasFollowing;

    if (wasFollowing) {
      // Unfollow
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUser._id);
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUser._id);
    }

    await Promise.all([currentUser.save(), targetUser.save()]);

    // Notification
    if (nowFollowing) {
      await createNotification({
        recipient: targetUserId,
        sender: currentUser._id,
        type: 'follow'
      });
    }

    return NextResponse.json({
      following: nowFollowing,
      followersCount: targetUser.followers.length,
    });
  } catch (error) {
    console.error('Follow toggle error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
