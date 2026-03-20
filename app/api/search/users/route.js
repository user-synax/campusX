import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let q = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(searchParams.get('limit')) || 10, 30);
    const skip = (page - 1) * limit;

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ message: 'Query too short' }, { status: 400 });
    }

    if (q.length > 100) {
      q = q.substring(0, 100);
    }

    await connectDB();

    let users = [];
    let total = 0;

    if (q.startsWith('@')) {
      const sanitizedUsername = q.substring(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      users = await User.find({ 
        username: { $regex: `^${sanitizedUsername}`, $options: 'i' } 
      })
      .select('name username avatar college bio followers following')
      .skip(skip)
      .limit(limit)
      .lean();
      
      total = await User.countDocuments({ 
        username: { $regex: `^${sanitizedUsername}`, $options: 'i' } 
      });
    } else {
      const sanitizedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Strategy A: MongoDB $text search
      users = await User.find(
        { $text: { $search: sanitizedQuery } },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .select('name username avatar college bio followers following')
      .skip(skip)
      .limit(limit)
      .lean();

      if (users.length > 0) {
        total = await User.countDocuments({ $text: { $search: sanitizedQuery } });
      } else {
        // Strategy B: Fallback regex on name or username
        const regexQuery = { $regex: sanitizedQuery, $options: 'i' };
        users = await User.find({
          $or: [
            { name: regexQuery },
            { username: regexQuery }
          ]
        })
        .select('name username avatar college bio followers following')
        .skip(skip)
        .limit(limit)
        .lean();
        
        total = await User.countDocuments({
          $or: [
            { name: regexQuery },
            { username: regexQuery }
          ]
        });
      }
    }

    // Clean user objects (ensure no sensitive data is returned)
    const cleanedUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return {
        ...safeUser,
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
      };
    });

    return NextResponse.json({
      users: cleanedUsers,
      total,
      hasMore: skip + cleanedUsers.length < total
    });
  } catch (error) {
    console.error('Search users error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
