import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import AdminLog from '@/models/AdminLog'
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
    const page = parseInt(searchParams.get('page')) || 1
    const limit = 20
    const skip = (page - 1) * limit
    const action = searchParams.get('action')
    const targetType = searchParams.get('targetType')

    const query = {}
    if (action) query.action = action
    if (targetType) query.targetType = targetType

    const [logs, total] = await Promise.all([
      AdminLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('adminId', 'name username avatar')
        .lean(),
      AdminLog.countDocuments(query)
    ])

    return NextResponse.json({
      logs,
      total,
      hasMore: total > skip + logs.length,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('[AdminLogsGET] Error:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
