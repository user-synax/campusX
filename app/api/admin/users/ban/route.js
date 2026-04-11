import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { getCurrentUser } from '@/lib/auth'
import { isAdmin, isFounder } from '@/lib/admin'
import { validateObjectId } from '@/utils/validators'
import { logAdminAction } from '@/lib/admin-log'

export async function POST(request) {
  try {
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ message: 'User ID required' }, { status: 400 })
    }

    if (!validateObjectId(userId)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 })
    }

    const targetUser = await User.findById(userId)

    if (!targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    if (targetUser.username === process.env.NEXT_PUBLIC_FOUNDER_USERNAME) {
      return NextResponse.json({ message: 'Cannot ban the founder' }, { status: 400 })
    }

    if (targetUser.role === 'admin') {
      return NextResponse.json({ message: 'Cannot ban another admin' }, { status: 400 })
    }

    targetUser.isBanned = true
    await targetUser.save()

    await logAdminAction({
      adminId: currentUser._id,
      action: 'user_ban',
      targetType: 'user',
      targetId: userId,
      summary: `Banned user @${targetUser.username}`
    })

    return NextResponse.json({ message: 'User banned successfully' })
  } catch (error) {
    console.error('[AdminBanUserPOST] Error:', error.message)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}