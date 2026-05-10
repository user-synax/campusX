import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';
import { withCache } from '@/lib/cache';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    const data = await withCache(`explore_posts_${currentUser.id}_${page}`, 60, async () => {
      await connectDB();

      // Get user's profile data for personalization
      const userProfile = await User.findById(currentUser.id)
        .select('college course interests following blockedUsers mutedUsers')
        .lean();

      if (!userProfile) {
        return { posts: [], hasMore: false };
      }

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Build recommendation query
      const baseQuery = {
        isDeleted: false,
        isHidden: false,
        author: { 
          $ne: currentUser.id,
          $nin: [...(userProfile.blockedUsers || []), ...(userProfile.mutedUsers || [])]
        }
      };

      // Aggregation pipeline for personalized recommendations
      const pipeline = [
        { $match: baseQuery },
        
        // Add scoring fields
        {
          $addFields: {
            // College match score
            collegeMatchScore: {
              $cond: [
                { $eq: ['$author.college', userProfile.college] },
                userProfile.college ? 30 : 0,
                0
              ]
            },
            // Course match score  
            courseMatchScore: {
              $cond: [
                { $eq: ['$author.course', userProfile.course] },
                userProfile.course ? 20 : 0,
                0
              ]
            },
            // Interest match score (based on hashtags)
            interestMatchScore: {
              $size: {
                $setIntersection: [
                  { $ifNull: ['$hashtags', []] },
                  userProfile.interests || []
                ]
              }
            },
            // From followed user score
            followingScore: {
              $cond: [
                { $in: ['$author', userProfile.following || []] },
                25,
                0
              ]
            },
            // High engagement score
            engagementScore: {
              $cond: [
                { $gt: ['$likesCount', 10] },
                10,
                0
              ]
            },
            // Recent activity score
            recentScore: {
              $cond: [
                { $gte: ['$createdAt', oneDayAgo] },
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
                '$collegeMatchScore',
                '$courseMatchScore',
                { $multiply: ['$interestMatchScore', 15] },
                '$followingScore',
                '$engagementScore',
                '$recentScore'
              ]
            }
          }
        },

        // Populate author data
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author',
            pipeline: [
              {
                $project: {
                  name: 1,
                  username: 1,
                  avatar: 1,
                  college: 1,
                  course: 1,
                  isVerified: 1,
                  verificationType: 1
                }
              }
            ]
          }
        },
        { $unwind: '$author' },

        // Sort by score and then by creation date
        { $sort: { totalScore: -1, createdAt: -1 } },

        // Skip and limit for pagination
        { $skip: skip },
        { $limit: limit },

        // Final projection
        {
          $project: {
            content: 1,
            images: 1,
            likesCount: 1,
            commentsCount: 1,
            createdAt: 1,
            hashtags: 1,
            community: 1,
            poll: 1,
            linkPreview: 1,
            isMarkdown: 1,
            contentBlocks: 1,
            author: 1,
            totalScore: 1
          }
        }
      ];

      const posts = await Post.aggregate(pipeline);

      // Get total count for pagination
      const totalPosts = await Post.countDocuments(baseQuery);

      return {
        posts,
        hasMore: skip + posts.length < totalPosts
      };
    });

    const response = NextResponse.json(data);

    // Cache for 1 minute
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');

    return response;
  } catch (error) {
    console.error('Explore posts error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
