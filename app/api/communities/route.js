import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';
import { slugifyCollege } from '@/utils/formatters';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const specificName = searchParams.get('name');

    await connectDB();

    // If requesting stats for a specific community
    if (specificName) {
      const escapedName = specificName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const query = { community: { $regex: new RegExp(`^${escapedName}$`, 'i') } };
      const [postCount, memberCount] = await Promise.all([
        Post.countDocuments(query),
        User.countDocuments({ college: { $regex: new RegExp(`^${escapedName}$`, 'i') } })
      ]);
      return NextResponse.json({ name: specificName, postCount, memberCount });
    }

    // Otherwise return list of active communities
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
        // Merge counts if slugs collide
        const existing = communitiesMap.get(slug);
        existing.postCount += comm.postCount;
        if (new Date(comm.lastPost) > new Date(existing.lastPost)) {
          existing.lastPost = comm.lastPost;
        }
      }
    });

    const communitiesWithMembers = await Promise.all(
      Array.from(communitiesMap.values()).map(async (comm) => {
        const memberCount = await User.countDocuments({ 
          college: { $regex: new RegExp(`^${comm.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
        });
        return { ...comm, memberCount };
      })
    );

    return NextResponse.json(communitiesWithMembers);
  } catch (error) {
    console.error('Communities API error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
