import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    const { username } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20

    await connectDB()

    // 1. Find user by username 
    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
    }).select('followers').lean()

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // 2. Get total count 
    const total = user.followers?.length || 0

    // 3. Paginate the followers array 
    const skip = (page - 1) * limit
    const paginatedIds = (user.followers || []).slice(skip, skip + limit)

    // 4. Fetch user details for those IDs 
    const followers = await User.find({ _id: { $in: paginatedIds } })
      .select('name username avatar college bio followers')
      .lean()

    // Edge case: filter out any null entries (if users were deleted but not removed from array)
    const validFollowers = followers.filter(Boolean)

    // 5. Add isFollowedByCurrentUser field 
    const currentUser = await getCurrentUser(request)
    const followersWithFollowStatus = validFollowers.map(follower => {
      const isFollowedByCurrentUser = currentUser 
        ? currentUser.following?.some(id => id.toString() === follower._id.toString())
        : false
      
      return {
        ...follower,
        followersCount: (follower.followers || []).length,
        isFollowedByCurrentUser
      }
    })

    // 6. Return 
    return NextResponse.json({
      users: followersWithFollowStatus,
      total,
      hasMore: skip + followersWithFollowStatus.length < total
    })
  } catch (error) {
    console.error('Followers GET error:', error)
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 })
  }
}
