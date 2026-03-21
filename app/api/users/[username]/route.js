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
      ...userResult,
      postCount: postCountResult,
      followersCount,
      followingCount,
      isFollowing,
      isMe,
      isFounder: isFounder(userResult.username),
      pinnedPost: userResult.pinnedPost,
      founderData: userResult.founderData
    };

    // Remove sensitive fields
    delete responseData.password;
    delete responseData.__v;
    delete responseData.email; // Privacy
    delete responseData.blockedUsers;
    delete responseData.blockedBy;

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

    await connectDB();

    const updateData = {};
    
    // Name validation: min 2, max 50, required, non-empty after trim
    if (name !== undefined) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return NextResponse.json({ message: 'Name cannot be empty' }, { status: 400 });
      }
      if (trimmedName.length < 2) {
        return NextResponse.json({ message: 'Name must be at least 2 characters long' }, { status: 400 });
      }
      if (trimmedName.length > 50) {
        return NextResponse.json({ message: 'Name must be under 50 characters' }, { status: 400 });
      }
      updateData.name = sanitizeString(trimmedName);
    }

    // Bio validation: max 160
    if (bio !== undefined) {
      const trimmedBio = bio.trim();
      if (trimmedBio.length > 160) {
        return NextResponse.json({ message: 'Bio must be under 160 characters' }, { status: 400 });
      }
      updateData.bio = sanitizeString(trimmedBio);
    }

    // College validation: max 100
    if (college !== undefined) {
      const trimmedCollege = college.trim();
      if (trimmedCollege.length > 100) {
        return NextResponse.json({ message: 'College must be under 100 characters' }, { status: 400 });
      }
      updateData.college = sanitizeString(trimmedCollege);
    }

    // Course validation: max 50
    if (course !== undefined) {
      const trimmedCourse = course.trim();
      if (trimmedCourse.length > 50) {
        return NextResponse.json({ message: 'Course must be under 50 characters' }, { status: 400 });
      }
      updateData.course = sanitizeString(trimmedCourse);
    }

    // Year validation: 1-6
    if (year !== undefined) {
      const yearNum = parseInt(year);
      if (isNaN(yearNum) || yearNum < 1 || yearNum > 6) {
        return NextResponse.json({ message: 'Year must be between 1 and 6' }, { status: 400 });
      }
      updateData.year = yearNum;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No valid fields to update' }, { status: 400 });
    }

    const updatedUser = await User.findOneAndUpdate(
      { username: currentUser.username },
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser.toSafeObject());
  } catch (error) {
    console.error('User profile update error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
