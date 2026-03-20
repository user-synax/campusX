import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let q = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 50);
    const skip = (page - 1) * limit;

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ message: 'Query too short' }, { status: 400 });
    }

    if (q.length > 100) {
      q = q.substring(0, 100);
    }

    // Sanitize: remove special regex characters
    let sanitizedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Sanitize @ prefix
    if (sanitizedQuery.startsWith('@')) {
      sanitizedQuery = sanitizedQuery.substring(1);
    }

    await connectDB();

    // Strategy A: MongoDB $text search
    let posts = await Post.find(
      { $text: { $search: sanitizedQuery } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .populate('author', 'name username avatar college')
    .skip(skip)
    .limit(limit)
    .lean();

    let total = 0;
    if (posts.length > 0) {
      total = await Post.countDocuments({ $text: { $search: sanitizedQuery } });
    } else {
      // Strategy B: Fallback regex
      posts = await Post.find({ 
        content: { $regex: sanitizedQuery, $options: 'i' } 
      })
      .sort({ createdAt: -1 })
      .populate('author', 'name username avatar college')
      .skip(skip)
      .limit(limit)
      .lean();
      
      total = await Post.countDocuments({ content: { $regex: sanitizedQuery, $options: 'i' } });
    }

    return NextResponse.json({
      posts,
      total,
      hasMore: skip + posts.length < total,
      query: sanitizedQuery
    });
  } catch (error) {
    console.error('Search posts error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
