import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Post from '@/models/Post'
import { FOUNDER_USERNAME, isFounder } from '@/lib/founder'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request) {
  try {
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser || !isFounder(currentUser.username)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { postId } = body

    if (!postId) {
      // Unpin
      await User.findOneAndUpdate(
        { username: { $regex: new RegExp(`^${FOUNDER_USERNAME}$`, 'i') } },
        { $set: { pinnedPost: null } }
      )
      return NextResponse.json({ success: true, pinnedPost: null })
    }

    // Pin
    const post = await Post.findById(postId)
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 })
    }

    // Ensure post belongs to founder
    if (post.author.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    await User.findOneAndUpdate(
      { username: { $regex: new RegExp(`^${FOUNDER_USERNAME}$`, 'i') } },
      { $set: { pinnedPost: postId } }
    )

    return NextResponse.json({ success: true, pinnedPost: postId })
  } catch (error) {
    console.error('Pin POST error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
