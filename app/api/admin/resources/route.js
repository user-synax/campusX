import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Resource from '@/models/Resource'
import { getCurrentUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

/**
 * GET /api/admin/resources/pending?page=1&limit=20
 * Auth: Required + Admin only
 */
export async function GET(request) {
  const currentUser = await getCurrentUser(request)
  if (!currentUser || !isAdmin(currentUser)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = 20
    const skip = (page - 1) * limit

    // Parallel: pending list + stats
    const [resources, stats] = await Promise.all([
      Resource.find({ status: 'pending' })
        .sort({ createdAt: 1 })           // FIFO — oldest first
        .skip(skip)
        .limit(limit)
        .select('+copyrightFlag +reviewNote') // include internal fields for admin
        .populate('uploadedBy', 'name username college isVerified avatar')
        .lean(),
      Resource.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ])

    // Format stats into a clean object
    const statsFormatted = stats.reduce((acc, s) => {
      acc[s._id] = s.count
      return acc
    }, { pending: 0, approved: 0, rejected: 0 })

    const totalPending = statsFormatted.pending

    return NextResponse.json({
      resources,
      total: totalPending,
      hasMore: skip + resources.length < totalPending,
      stats: statsFormatted
    })

  } catch (err) {
    console.error('[Admin Pending Resources GET]', err.message)
    return NextResponse.json(
      { error: 'Failed to fetch pending resources' },
      { status: 500 }
    )
  }
}
