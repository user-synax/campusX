import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';

export async function GET(request, { params }) {
  try {
    const { tag: rawTag } = await params;
    const tag = decodeURIComponent(rawTag).toLowerCase();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 50);
    const skip = (page - 1) * limit;

    await connectDB();

    // Find posts with the specific hashtag
    const posts = await Post.find({ hashtags: tag })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name username avatar college')
      .lean();

    const total = await Post.countDocuments({ hashtags: tag });

    return NextResponse.json({
      posts,
      hasMore: skip + posts.length < total,
      total,
      tag
    });
  } catch (error) {
    console.error('Hashtag posts error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
