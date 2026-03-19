import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Post from '@/models/Post';
import { getCurrentUser } from '@/lib/auth';
import { sanitizeString } from '@/utils/validators';

// GET /api/users/[username]
export async function GET(request, { params }) {
  try {
    const { username } = await params;

    await connectDB();

    const user = await User.findOne({ username: { $regex: new RegExp(`^${username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const postCount = await Post.countDocuments({ author: user._id, isAnonymous: false }).lean();



    const userSafe = user.toSafeObject();
    
    return NextResponse.json({
      ...userSafe,
      postCount,
      followersCount: user.followers.length,
      followingCount: user.following.length,
    });
  } catch (error) {
    console.error('User profile fetch error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/users/[username]
export async function PATCH(request, { params }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { username } = await params;

    // Must be the same user
    if (currentUser.username.toLowerCase() !== username.toLowerCase()) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { name, bio, college, course, year } = body;

    await connectDB();

    const updateData = {};
    if (name) updateData.name = sanitizeString(name).slice(0, 50);
    if (bio !== undefined) updateData.bio = sanitizeString(bio).slice(0, 160);
    if (college !== undefined) updateData.college = sanitizeString(college);
    if (course !== undefined) updateData.course = sanitizeString(course);
    if (year !== undefined) {
      const yearNum = parseInt(year);
      if (yearNum >= 1 && yearNum <= 6) {
        updateData.year = yearNum;
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      { username: currentUser.username },
      { $set: updateData },
      { new: true }
    );

    return NextResponse.json(updatedUser.toSafeObject());
  } catch (error) {
    console.error('User profile update error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
