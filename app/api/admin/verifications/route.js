import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { getCurrentUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

export async function GET(request) {
  try {
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending' // pending | verified | rejected | all
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const skip = (page - 1) * limit

    // Build query
    const query = { isDeleted: { $ne: true } }
    if (status !== 'all') {
      query.verificationStatus = status
    } else {
      // "all" = anything except "none" (users who have interacted with verification)
      query.verificationStatus = { $in: ['pending', 'verified', 'rejected'] }
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ verificationRequestedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          'name username email avatar college course year ' +
          'isVerified verificationStatus verificationType ' +
          'collegeEmail collegeIdUrl verificationRejectedReason ' +
          'verificationRequestedAt verificationApprovedAt createdAt'
        )
        .lean(),
      User.countDocuments(query),
    ])

    // Gather stats in parallel
    const [
      totalVerified,
      pendingCount,
      rejectedCount,
      collegeEmailAutoVerified,
    ] = await Promise.all([
      User.countDocuments({ verificationStatus: 'verified', isDeleted: { $ne: true } }),
      User.countDocuments({ verificationStatus: 'pending', isDeleted: { $ne: true } }),
      User.countDocuments({ verificationStatus: 'rejected', isDeleted: { $ne: true } }),
      User.countDocuments({
        verificationStatus: 'verified',
        verificationType: 'college_email',
        isDeleted: { $ne: true },
      }),
    ])

    return NextResponse.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats: {
        totalVerified,
        pendingCount,
        rejectedCount,
        collegeEmailAutoVerified,
      },
    })
  } catch (error) {
    console.error('[AdminVerificationsGET] Error:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
