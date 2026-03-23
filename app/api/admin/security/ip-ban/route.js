import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import IPBan from '@/models/IPBan'
import { getCurrentUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { logAdminAction } from '@/lib/admin-log'

export async function POST(request) {
  try {
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { ip, reason, duration } = body

    // Simple IP validation
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
    if (!ip || !ipRegex.test(ip)) {
      return NextResponse.json({ error: 'Invalid IP address' }, { status: 400 })
    }

    const expiresAt = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null

    const ban = await IPBan.create({
      ip,
      bannedBy: currentUser._id,
      reason,
      expiresAt,
      isActive: true
    })

    await logAdminAction({
      adminId: currentUser._id,
      action: 'ip_ban',
      targetType: 'ip',
      targetId: ip,
      summary: `Banned IP ${ip} (${duration ? duration + ' days' : 'permanent'})`,
      reason
    })

    return NextResponse.json({ success: true, ipBan: ban })
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'IP already banned' }, { status: 400 })
    }
    console.error('[AdminSecurityIPBanPOST] Error:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
