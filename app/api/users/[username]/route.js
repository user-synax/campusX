import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Post from '@/models/Post'
import { getCurrentUser } from '@/lib/auth'
import { isFounder } from '@/lib/founder'
import { sanitizeUser, sanitizeText } from '@/lib/sanitize'
import { attachEquippedToItems } from '@/lib/equipped-helpers'

export async function GET(request, { params }) {
  try {
    const { username } = await params
    if (!username) return NextResponse.json({ message: 'Username is required' }, { status: 400 })

    await connectDB()
    const currentUser = await getCurrentUser(request)

    const userResult = await User.findOne({
      username: username.toLowerCase(),
    }).populate({
      path: 'pinnedPost',
      populate: { path: 'author', select: 'name username avatar' },
    }).lean()

    if (!userResult) return NextResponse.json({ message: 'User not found' }, { status: 404 })

    const postCount = await Post.countDocuments({
      author: userResult._id,
      isAnonymous: false,
      isDeleted: false,
    })

    const isFollowingUser = currentUser
      ? (userResult.followers || []).some(id => id.toString() === currentUser._id.toString())
      : false
    const isMe = currentUser
      ? currentUser._id.toString() === userResult._id.toString()
      : false

    const responseData = {
      ...sanitizeUser(userResult),
      postCount,
      followersCount: userResult.followers?.length || 0,
      followingCount: userResult.following?.length || 0,
      isFollowing: isFollowingUser,
      isMe,
      isFounder: isFounder(userResult.username),
      pinnedPost: userResult.pinnedPost,
      founderData: userResult.founderData,
    }

    const [profileWithEquipped] = await attachEquippedToItems([responseData], '')
    return NextResponse.json(profileWithEquipped)
  } catch (error) {
    console.error('[GET /api/users/username]', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { username } = await params
    if (currentUser.username.toLowerCase() !== username.toLowerCase()) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    let body
    try { body = await request.json() }
    catch { return NextResponse.json({ message: 'Invalid request body' }, { status: 400 }) }

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 })
    }

    const { name, bio, college, course, year } = body
    const updateData = {}

    if (name !== undefined)    updateData.name    = sanitizeText(name).slice(0, 50)
    if (bio !== undefined)     updateData.bio     = sanitizeText(bio).slice(0, 160)
    if (college !== undefined) updateData.college = sanitizeText(college).slice(0, 100)
    if (course !== undefined)  updateData.course  = sanitizeText(course).slice(0, 100)
    if (year !== undefined)    updateData.year    = Math.min(6, Math.max(1, parseInt(year) || 1))

    await connectDB()

    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean()

    if (!updatedUser) return NextResponse.json({ message: 'User not found' }, { status: 404 })

    return NextResponse.json({ success: true, user: sanitizeUser(updatedUser) })
  } catch (error) {
    console.error('[PATCH /api/users/username]', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
