import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Post from '@/models/Post';
import { withCache } from '@/lib/cache';
import { getCurrentUser } from '@/lib/auth';
import { sanitizeUser } from '@/lib/sanitize';

export async function GET(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await withCache(`explore_users_${currentUser.id}`, 300, async () => {
      await connectDB();

      // Get current user's profile for personalization
      const userProfile = await User.findById(currentUser.id)
        .select('college course interests following blockedUsers mutedUsers')
        .lean();

      if (!userProfile) {
        return { users: [] };
      }

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Build recommendation pipeline
      const pipeline = [
        // Filter out current user and blocked/muted users
        {
          $match: {
            _id: { 
              $ne: currentUser.id,
              $nin: [...(userProfile.blockedUsers || []), ...(userProfile.mutedUsers || []), ...(userProfile.following || [])]
            },
            isBanned: false,
            isDeleted: false,
            emailVerified: true
          }
        },

        // Add scoring fields
        {
          $addFields: {
            // Same college score
            collegeScore: {
              $cond: [
                { $eq: ['$college', userProfile.college] },
                userProfile.college ? 30 : 0,
                0
              ]
            },
            // Same course score
            courseScore: {
              $cond: [
                { $eq: ['$course', userProfile.course] },
                userProfile.course ? 25 : 0,
                0
              ]
            },
            // Shared interests score
            interestsScore: {
              $multiply: [
                { $size: { $setIntersection: [userProfile.interests || [], '$interests'] } },
                20
              ]
            },
            // Mutual connections score
            mutualConnectionsScore: {
              $multiply: [
                { $size: { $setIntersection: [userProfile.following || [], '$followers'] } },
                15
              ]
            },
            // High activity score (recent posts)
            activityScore: {
              $cond: [
                { $gte: ['$lastActiveDate', thirtyDaysAgo] },
                10,
                0
              ]
            },
            // New user score
            newUserScore: {
              $cond: [
                { $gte: [thirtyDaysAgo, '$createdAt'] },
                5,
                0
              ]
            }
          }
        },

        // Calculate total score
        {
          $addFields: {
            totalScore: {
              $add: [
                '$collegeScore',
                '$courseScore',
                '$interestsScore',
                '$mutualConnectionsScore',
                '$activityScore',
                '$newUserScore'
              ]
            }
          }
        },

        // Sort by score and then by recent activity
        { $sort: { totalScore: -1, lastActiveDate: -1 } },

        // Limit to top recommendations
        { $limit: 20 },

        // Project needed fields
        {
          $project: {
            name: 1,
            username: 1,
            avatar: 1,
            bio: 1,
            college: 1,
            course: 1,
            interests: 1,
            followersCount: { $size: { $ifNull: ['$followers', []] } },
            followingCount: { $size: { $ifNull: ['$following', []] } },
            isVerified: 1,
            verificationType: 1,
            totalScore: 1,
            lastActiveDate: 1
          }
        }
      ];

      const users = await User.aggregate(pipeline);

      // Sanitize user data
      const sanitizedUsers = users.map(user => sanitizeUser(user));

      return { users: sanitizedUsers };
    });

    const response = NextResponse.json(data);

    // Cache for 5 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');

    return response;
  } catch (error) {
    console.error('Explore users error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
