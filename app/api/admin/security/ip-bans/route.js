import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import IPBan from '@/models/IPBan'
import { getCurrentUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

export async function GET(request) {
  try {
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const bans = await IPBan.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ ipBans: bans })
  } catch (error) {
    console.error('[AdminSecurityIPBansGET] Error:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
