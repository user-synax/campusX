import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';

export async function GET(request) {
  try {
    await connectDB();

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [trendingCommunities, activeUsersRaw] = await Promise.all([
      // Trending communities (top 5 in last 7 days)
      Post.aggregate([
        {
          $match: {
            community: { $ne: '' },
            createdAt: { $gte: sevenDaysAgo }
          }
        },
        { $group: { _id: '$community', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),

      // Active users (top 5 by post count in last 7 days)
      Post.aggregate([
        {
          $match: {
            isAnonymous: false,
            createdAt: { $gte: sevenDaysAgo }
          }
        },
        { $group: { _id: '$author', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            count: 1,
            user: {
              name: 1,
              username: 1,
              avatar: 1,
              college: 1
            }
          }
        }
      ])
    ]);

    const activeUsers = activeUsersRaw.map(item => ({
      ...item.user,
      postCount: item.count
    }));

    const response = NextResponse.json({
      trendingCommunities: trendingCommunities.map(c => ({
        name: c._id,
        count: c.count
      })),
      activeUsers
    });

    // Cache for 5 minutes
    response.headers.set('Cache-Control', 'public, max-age=300');

    return response;
  } catch (error) {
    console.error('Fetch trending error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
