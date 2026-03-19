import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 50);
    const community = searchParams.get('community');
    const username = searchParams.get('username');

    await connectDB();

    const query = {};
    if (community) {
      const escapedCommunity = community.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.community = { $regex: new RegExp(`^${escapedCommunity}$`, 'i') };
    }

    if (username) {
      const user = await User.findOne({ username }).lean();
      if (user) {
        query.author = user._id;
      } else {
        return NextResponse.json({ posts: [], hasMore: false, total: 0 });
      }
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name username avatar college')
        .lean(),
      Post.countDocuments(query),
    ]);

    return NextResponse.json({
      posts,
      hasMore: skip + posts.length < total,
      page,
      total,
    });
  } catch (error) {
    console.error('Post fetching error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
