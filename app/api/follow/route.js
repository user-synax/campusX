import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { validateObjectId } from '@/utils/validators';
import { createNotification, deleteNotification } from '@/lib/notifications';
import { awardXP } from '@/lib/xp';

import { applyRateLimit } from '@/lib/rate-limit';
import { sanitizeMongoInput } from '@/lib/sanitize';

export async function POST(request) {
  try {
    // Rate limit follows - 30 follows per hour per IP
    const { blocked, response: rateLimitResponse } = applyRateLimit(
      request,
      'user_follow',
      30,
      60 * 60 * 1000
    );
    if (blocked) return rateLimitResponse;

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

    const cleanBody = sanitizeMongoInput(body);
    const { targetUserId } = cleanBody;

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

      await deleteNotification({
        sender: currentUser._id,
        recipient: targetUserId,
        type: 'follow'
      }).catch(() => {});
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUser._id);
    }

    await Promise.all([currentUser.save(), targetUser.save()]);

    let xpResult = { xpAwarded: false };
    if (nowFollowing) {
      createNotification({
        recipient: targetUserId,
        sender: currentUser._id,
        type: 'follow'
      }).catch(() => {});

      // Award XP for following someone
      xpResult = await awardXP(currentUser._id, 'follow');
    }

    return NextResponse.json({
      following: nowFollowing,
      followersCount: targetUser.followers.length,
      xpAwarded: xpResult.xpAwarded,
      newXP: xpResult.newXP,
      newLevel: xpResult.newLevel,
      leveledUp: xpResult.leveledUp
    });
  } catch (error) {
    console.error('Follow toggle error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
