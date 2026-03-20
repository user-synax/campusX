import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Hashtag from '@/models/Hashtag';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit')) || 8, 20);

    await connectDB();

    // Simple CRON-style reset for weeklyCount
    // Check for hashtags not used in 7 days and reset their weeklyCount
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Non-blocking cleanup (don't await)
    Hashtag.updateMany(
      { lastUsedAt: { $lt: sevenDaysAgo }, weeklyCount: { $gt: 0 } },
      { $set: { weeklyCount: 0 } }
    ).catch(err => console.error('Hashtag weekly reset error:', err));

    const hashtags = await Hashtag.find({ postCount: { $gt: 0 } })
      .sort({ weeklyCount: -1 })
      .limit(limit)
      .lean();

    const response = NextResponse.json({ hashtags });
    
    // Set cache header: Cache-Control: public, max-age=300
    response.headers.set('Cache-Control', 'public, max-age=300');

    return response;
  } catch (error) {
    console.error('Trending hashtags error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
