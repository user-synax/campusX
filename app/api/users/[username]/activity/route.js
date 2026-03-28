import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Post from '@/models/Post'
import Comment from '@/models/Comment'

// GET /api/users/[username]/activity
// Returns daily activity counts for the last 365 days
// Public endpoint — no auth required
export async function GET(request, { params }) {
  try {
    const { username } = await params
    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      isDeleted: false,
    }).select('_id').lean()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const since = new Date()
    since.setFullYear(since.getFullYear() - 1)
    since.setHours(0, 0, 0, 0)

    const dateFormat = '%Y-%m-%d'

    // Run posts + comments aggregations in parallel
    const [postDays, commentDays] = await Promise.all([
      Post.aggregate([
        {
          $match: {
            author: user._id,
            isDeleted: false,
            isAnonymous: false,
            createdAt: { $gte: since },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
      ]),
      Comment.aggregate([
        {
          $match: {
            author: user._id,
            createdAt: { $gte: since },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
      ]),
    ])

    // Merge into a single map: date → total activity count
    const activityMap = {}
    for (const { _id, count } of postDays) {
      activityMap[_id] = (activityMap[_id] || 0) + count
    }
    for (const { _id, count } of commentDays) {
      activityMap[_id] = (activityMap[_id] || 0) + count
    }

    // Return as array sorted ascending
    const activity = Object.entries(activityMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const response = NextResponse.json({ activity })
    // Cache for 5 minutes — activity doesn't need to be real-time
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60')
    return response
  } catch (err) {
    console.error('[Activity API]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
