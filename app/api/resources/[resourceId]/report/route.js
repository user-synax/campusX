import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Resource from '@/models/Resource'
import { getCurrentUser } from '@/lib/auth'
import { isValidObjectId } from '@/utils/validators'
import { applyRateLimit } from '@/lib/rate-limit'

/**
 * POST /api/resources/[resourceId]/report
 * Tracks a report for a resource and auto-hides if it reaches a threshold.
 * Auth: Required
 * Rate limit: 10 reports per user per hour
 */
export async function POST(request, { params }) {
  const { resourceId } = await params

  if (!isValidObjectId(resourceId)) {
    return NextResponse.json({ error: 'Invalid resource ID' }, { status: 400 })
  }

  // ━━━ 1. Rate limit ━━━
  const { blocked, response: limitRes } = applyRateLimit(
    request, 'resource_report', 10, 60 * 60 * 1000 // 10 reports per hour
  )
  if (blocked) return limitRes

  // ━━━ 2. Auth ━━━
  const currentUser = await getCurrentUser(request)
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    // ━━━ 3. Increment reportCount ━━━
    const resource = await Resource.findByIdAndUpdate(
      resourceId,
      { $inc: { reportCount: 1 } },
      { new: true }
    ).select('reportCount').lean()

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // ━━━ 4. Auto-hide if threshold reached (5 reports) ━━━
    if (resource.reportCount >= 5) {
      await Resource.findByIdAndUpdate(resourceId, { isHidden: true })
    }

    return NextResponse.json({
      success: true,
      reported: true,
      message: 'Resource reported. Our moderation team will review it.'
    })

  } catch (err) {
    console.error('[Resource Report POST]', err.message)
    return NextResponse.json(
      { error: 'Failed to report resource' },
      { status: 500 }
    )
  }
}
