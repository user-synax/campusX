import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'

export async function GET(request, { params }) {
  try {
    const { username } = await params

    await connectDB()

    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
    }).select('followers following').lean()

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      followersCount: (user.followers || []).length,
      followingCount: (user.following || []).length
    })
  } catch (error) {
    console.error('Follow counts GET error:', error)
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 })
  }
}
