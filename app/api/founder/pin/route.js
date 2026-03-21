import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Post from '@/models/Post'
import { FOUNDER_USERNAME, isFounder } from '@/lib/founder'
import { getCurrentUser } from '@/lib/auth'
import { validateObjectId } from '@/utils/validators'
import { sanitizeMongoInput } from '@/lib/sanitize'

export async function POST(request) {
  try {
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser || !isFounder(currentUser.username)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    let body;
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 })
    }

    const cleanBody = sanitizeMongoInput(body);
    const { postId } = cleanBody;

    if (!postId) {
      // Unpin
      await User.findOneAndUpdate(
        { username: { $regex: new RegExp(`^${FOUNDER_USERNAME}$`, 'i') } },
        { $set: { pinnedPost: null } }
      )
      return NextResponse.json({ success: true, pinnedPost: null })
    }

    // Validate postId
    if (!validateObjectId(postId)) {
      return NextResponse.json({ message: 'Invalid Post ID' }, { status: 400 })
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
