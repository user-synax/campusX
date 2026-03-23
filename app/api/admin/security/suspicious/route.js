import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import LoginAttempt from '@/models/LoginAttempt'
import { getCurrentUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

export async function GET(request) {
  try {
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const suspicious = await LoginAttempt.find({ attempts: { $gte: 3 } })
      .sort({ attempts: -1 })
      .limit(50)
      .lean()

    return NextResponse.json({ suspicious })
  } catch (error) {
    console.error('[AdminSecuritySuspiciousGET] Error:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
