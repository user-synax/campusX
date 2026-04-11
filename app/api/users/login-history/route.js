import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import LoginHistory from '@/models/LoginHistory'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const logins = await LoginHistory.find({ userId: currentUser._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()

    return NextResponse.json({ logins })
  } catch (error) {
    console.error('[LoginHistoryGET] Error:', error.message)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}