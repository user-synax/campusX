import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { FOUNDER_USERNAME, isFounder } from '@/lib/founder'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request) {
  try {
    await connectDB()

    if (!FOUNDER_USERNAME) {
      return NextResponse.json({ success: false, message: 'Founder not configured' }, { status: 400 })
    }

    const currentUser = await getCurrentUser(request)

    // Don't count if founder visits their own profile 
    if (currentUser && isFounder(currentUser.username)) {
      return NextResponse.json({ success: true, message: 'Founder visit not counted' })
    }

    const founder = await User.findOne({ username: { $regex: new RegExp(`^${FOUNDER_USERNAME}$`, 'i') } })
      .select('founderData.profileViewsToday founderData.profileViewsResetAt')

    if (!founder) {
      return NextResponse.json({ success: false, message: 'Founder not found' }, { status: 404 })
    }

    const now = new Date()
    const lastReset = founder.founderData?.profileViewsResetAt
    const needsReset = !lastReset || 
      new Date(lastReset).toDateString() !== now.toDateString()

    const update = {
      $inc: {
        'founderData.profileViews': 1,
        'founderData.profileViewsToday': needsReset ? 0 : 1
      },
      $set: {
        'founderData.profileViewsResetAt': now
      }
    }

    if (needsReset) {
      update.$set['founderData.profileViewsToday'] = 1
    }

    await User.findOneAndUpdate(
      { username: { $regex: new RegExp(`^${FOUNDER_USERNAME}$`, 'i') } },
      update,
      { new: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile view error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
