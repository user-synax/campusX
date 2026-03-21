import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';
import { slugifyCollege } from '@/utils/formatters';
import { withCache } from '@/lib/cache';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const specificName = searchParams.get('name');

    await connectDB();

    // If requesting stats for a specific community
    if (specificName) {
      const escapedName = specificName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const query = { community: { $regex: new RegExp(`^${escapedName}$`, 'i') } };
      const cacheKey = `community_stats_${escapedName.toLowerCase()}`;
      
      const stats = await withCache(cacheKey, 600, async () => {
        const [postCount, memberCount] = await Promise.all([
          Post.countDocuments(query),
          User.countDocuments({ college: { $regex: new RegExp(`^${escapedName}$`, 'i') } })
        ]);
        return { name: specificName, postCount, memberCount };
      });
      
      return NextResponse.json(stats);
    }

    // Otherwise return list of active communities
    const communitiesWithMembers = await withCache('communities_list', 600, async () => {
      const activeCommunities = await Post.aggregate([
        { $match: { community: { $ne: '' } } },
        { 
          $group: { 
            _id: { $toLower: '$community' }, 
            originalName: { $first: '$community' },
            postCount: { $sum: 1 }, 
            lastPost: { $max: '$createdAt' } 
          } 
        },
        { $sort: { postCount: -1 } },
        { $limit: 50 }
      ]);

      const communitiesMap = new Map();

      activeCommunities.forEach((comm) => {
        const slug = slugifyCollege(comm.originalName);
        if (!communitiesMap.has(slug)) {
          communitiesMap.set(slug, {
            name: comm.originalName,
            slug,
            postCount: comm.postCount,
            lastPost: comm.lastPost
          });
        } else {
          const existing = communitiesMap.get(slug);
          existing.postCount += comm.postCount;
          if (new Date(comm.lastPost) > new Date(existing.lastPost)) {
            existing.lastPost = comm.lastPost;
          }
        }
      });

      return await Promise.all(
        Array.from(communitiesMap.values()).map(async (comm) => {
          const memberCount = await User.countDocuments({ 
            college: { $regex: new RegExp(`^${comm.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
          });
          return { ...comm, memberCount };
        })
      );
    });

    const response = NextResponse.json(communitiesWithMembers);
    response.headers.set('Cache-Control', 'public, max-age=600, stale-while-revalidate=120');
    return response;
  } catch (error) {
    console.error('Communities API error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
