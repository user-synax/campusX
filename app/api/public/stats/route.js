import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Post from '@/models/Post';
import { applyRateLimit } from '@/lib/rate-limit';

// Community model placeholder if it doesn't exist yet, or import it
// Assuming we might need to handle cases where models aren't fully defined
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    // Rate limit: 30 requests/minute per IP
    const { blocked, response: rateLimitResponse } = applyRateLimit(request, 'public_stats', 30, 60000);
    if (blocked) return rateLimitResponse;

    await connectDB();

    // Parallel queries for performance
    const [users, posts, communitiesArray] = await Promise.all([
      User.countDocuments().lean(),
      Post.countDocuments().lean(),
      User.distinct('college').lean()
    ]);

    const data = { 
      users: users || 0, 
      posts: posts || 0, 
      communities: communitiesArray?.length || 0 
    };

    const response = NextResponse.json(data);
    
    // Cache for 60 seconds - CDN + browser
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
    
    return response;
  } catch (error) {
    console.error('Public stats API error:', error);
    // Never expose DB errors, return zeros
    return NextResponse.json({ users: 0, posts: 0, communities: 0 });
  }
}
