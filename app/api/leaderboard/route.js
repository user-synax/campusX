import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { sanitizeUser } from '@/lib/sanitize';
import { attachEquippedToItems } from '@/lib/equipped-helpers';

/**
 * GET /api/leaderboard
 * Fetch top students by XP.
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const college = searchParams.get('college');
    const limit = parseInt(searchParams.get('limit')) || 20;

    const query = {};
    if (college) {
      query.college = college;
    }

    const topUsers = await User.find(query).lean()
      .sort({ xp: -1, level: -1 })
      .limit(limit)
      .select('name username avatar college xp level equipped')
      .lean();

    // Attach equipped visuals in batch
    const usersWithEquipped = await attachEquippedToItems(topUsers);

    const leaderboard = usersWithEquipped.map((user, index) => ({
      ...sanitizeUser(user),
      rank: index + 1,
      xp: user.xp || 0,
      level: user.level || 1,
      equipped: user.equipped
    }));

    return NextResponse.json({
      leaderboard,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
