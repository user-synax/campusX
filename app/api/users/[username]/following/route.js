import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { getCurrentUser } from '@/lib/auth'
import { sanitizeMongoInput, sanitizeUser } from '@/lib/sanitize'

export async function GET(request, { params }) {
  try {
    const { username } = sanitizeMongoInput(await params)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    await connectDB()

    // 1. Find user by username 
    const escapedUsername = username.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${escapedUsername}$`, 'i') } 
    }).select('following').lean()

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // 2. Get total count 
    const total = user.following?.length || 0

    // 3. Paginate the following array 
    const skip = (page - 1) * limit
    const paginatedIds = (user.following || []).slice(skip, skip + limit)

    // 4. Fetch user details for those IDs 
    const following = await User.find({ _id: { $in: paginatedIds } })
      .select('name username avatar college bio followers')
      .lean()

    // Edge case: filter out any null entries 
    const validFollowing = following.filter(Boolean)

    // 5. Add isFollowedByCurrentUser field 
    const currentUser = await getCurrentUser(request)
    const followingWithFollowStatus = validFollowing.map(u => {
      const isFollowedByCurrentUser = currentUser 
        ? currentUser.following?.some(id => id.toString() === u._id.toString())
        : false
      
      return {
        ...sanitizeUser(u),
        followersCount: (u.followers || []).length,
        isFollowedByCurrentUser
      }
    })

    // 6. Return 
    return NextResponse.json({
      users: followingWithFollowStatus,
      total,
      hasMore: skip + followingWithFollowStatus.length < total
    })
  } catch (error) {
    console.error('Following GET error:', error)
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 })
  }
}
