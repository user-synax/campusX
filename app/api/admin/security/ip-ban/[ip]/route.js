import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import IPBan from '@/models/IPBan'
import { getCurrentUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { logAdminAction } from '@/lib/admin-log'

export async function DELETE(request, { params }) {
  try {
    const { ip } = await params
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const ban = await IPBan.findOneAndUpdate(
      { ip, isActive: true },
      { isActive: false },
      { new: true }
    )

    if (!ban) {
      return NextResponse.json({ error: 'No active ban found for this IP' }, { status: 404 })
    }

    await logAdminAction({
      adminId: currentUser._id,
      action: 'ip_unban',
      targetType: 'ip',
      targetId: ip,
      summary: `Lifted IP ban for ${ip}`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[AdminSecurityIPBanDELETE] Error:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
