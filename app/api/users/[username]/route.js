import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Post from '@/models/Post';
import { getCurrentUser } from '@/lib/auth';
import { sanitizeString } from '@/utils/validators';
import { isFounder } from '@/lib/founder';

// GET /api/users/[username]
export async function GET(request, { params }) {
  try {
    const username = (await params).username;
    
    if (!username) {
      return NextResponse.json({ message: 'Username is required' }, { status: 400 });
    }

    await connectDB();
    console.log('Fetching profile for:', username);

    const escapedUsername = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const userQuery = User.findOne({ 
      username: { $regex: new RegExp(`^${escapedUsername}$`, 'i') } 
    });

    // Always populate pinnedPost for profiles if it exists
    userQuery.populate({
      path: 'pinnedPost',
      populate: {
        path: 'author',
        select: 'name username avatar image'
      }
    });

    const user = await userQuery.exec();

    console.log('GET User result for:', username, 'Found:', !!user);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    let postCount = 0;
    try {
      postCount = await Post.countDocuments({ author: user._id, isAnonymous: false });
    } catch (e) {
      console.error('Post count error:', e);
    }

    const currentUser = await getCurrentUser(request);
    console.log('Current user:', currentUser?.username);
    
    // Robust checks for following/me
    const isFollowing = currentUser ? (user.followers || []).some(id => id.toString() === currentUser._id.toString()) : false;
    const isMe = currentUser ? currentUser._id.toString() === user._id.toString() : false;

    console.log('Is following:', isFollowing, 'Is me:', isMe);

    const userSafe = typeof user.toSafeObject === 'function' ? user.toSafeObject() : user;
    
    // Create a plain response object
    const responseData = {
      ...(userSafe.toObject && typeof userSafe.toObject === 'function' ? userSafe.toObject() : userSafe),
      postCount,
      followersCount: (user.followers || []).length,
      followingCount: (user.following || []).length,
      isFollowing,
      isMe,
      isFounder: isFounder(user.username),
      pinnedPost: user.pinnedPost,
      founderData: user.founderData
    };

    // Remove sensitive fields just in case
    delete responseData.password;
    delete responseData.__v;

    console.log('Response data keys:', Object.keys(responseData));

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('User profile fetch error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
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
