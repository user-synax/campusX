import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Post from '@/models/Post';
import { getCurrentUser } from '@/lib/auth';
import { sanitizeString } from '@/utils/validators';
import { isFounder } from '@/lib/founder';
import { sanitizeUser, sanitizeText } from '@/lib/sanitize';

// GET /api/users/[username]
export async function GET(request, { params }) {
  try {
    const { username } = await params;
    
    if (!username) {
      return NextResponse.json({ message: 'Username is required' }, { status: 400 });
    }

    await connectDB();
    console.log('Fetching profile for:', username);

    const currentUser = await getCurrentUser(request);
    const escapedUsername = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const userResult = await User.findOne({ 
      username: { $regex: new RegExp(`^${escapedUsername}$`, 'i') } 
    }).populate({
      path: 'pinnedPost',
      populate: {
        path: 'author',
        select: 'name username avatar image'
      }
    }).lean();

    if (!userResult) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const [postCountResult, followersCount, followingCount] = await Promise.all([
      Post.countDocuments({ author: userResult._id, isAnonymous: false }),
      Promise.resolve(userResult.followers?.length || 0),
      Promise.resolve(userResult.following?.length || 0)
    ]);

    // Robust checks for following/me
    const isFollowing = currentUser ? (userResult.followers || []).some(id => id.toString() === currentUser._id.toString()) : false;
    const isMe = currentUser ? currentUser._id.toString() === userResult._id.toString() : false;

    // Create a plain response object
    const responseData = {
      ...sanitizeUser(userResult),
      postCount: postCountResult,
      followersCount,
      followingCount,
      isFollowing,
      isMe,
      isFounder: isFounder(userResult.username),
      pinnedPost: userResult.pinnedPost,
      founderData: userResult.founderData
    };

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

    if (Object.keys(body).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const updateData = {};
    if (name) updateData.name = sanitizeText(name);
    if (bio) updateData.bio = sanitizeText(bio);
    if (college) updateData.college = sanitizeText(college);
    if (course) updateData.course = sanitizeText(course);
    if (year) updateData.year = parseInt(year);

    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({
      success: true,
      user: sanitizeUser(updatedUser)
    });
  } catch (error) {
    console.error('User profile update error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
