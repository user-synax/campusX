import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { getCurrentUser } from '@/lib/auth';
import { sanitizeMongoInput } from '@/lib/sanitize';

export async function GET(request, { params }) {
  try {
    const currentUser = await getCurrentUser(request);
    const { tag: rawTag } = sanitizeMongoInput(await params);
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

    const postsWithReactions = posts.map(post => {
      const isLiked = currentUser ? post.likes?.some(id => id.toString() === currentUser._id.toString()) : false;

      const { likes, ...postData } = post;

      return {
        ...postData,
        likesCount: post.likesCount ?? post.likes?.length ?? 0,
        _isLiked: isLiked
      };
    });

    return NextResponse.json({
      posts: postsWithReactions,
      hasMore: skip + posts.length < total,
      total,
      tag
    });
  } catch (error) {
    console.error('Hashtag posts error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
