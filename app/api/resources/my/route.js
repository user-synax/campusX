import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Resource from '@/models/Resource'
import { getCurrentUser } from '@/lib/auth'

/**
 * GET /api/resources/my?page=1&limit=10
 * Returns resources uploaded by the current user
 */
export async function GET(request) {
  const currentUser = await getCurrentUser(request)
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const skip = (page - 1) * limit

    const [resources, total] = await Promise.all([
      Resource.find({ uploadedBy: currentUser._id })
        .select('title category status fileType fileSize reviewNote downloadCount viewCount saveCount createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Resource.countDocuments({ uploadedBy: currentUser._id })
    ])

    const hasMore = total > skip + resources.length

    return NextResponse.json({
      resources,
      total,
      hasMore,
      page,
      limit
    })

  } catch (err) {
    console.error('[My Resources GET]', err.message)
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}
