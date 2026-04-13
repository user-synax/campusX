import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Post from '@/models/Post'
import { getCurrentUser } from '@/lib/auth'
import { validateObjectId } from '@/utils/validators'

export async function POST(request, { params }) {
  try {
    const { postId } = await params

    if (!validateObjectId(postId)) {
      return NextResponse.json({ message: 'Invalid post ID' }, { status: 400 })
    }

    await connectDB()

    const post = await Post.findById(postId)

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 })
    }

    const currentUser = await getCurrentUser(request)

    if (currentUser && post.author && post.author.toString() === currentUser._id.toString()) {
      return NextResponse.json({ viewCount: post.viewCount || 0 })
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId, 
      { $inc: { viewCount: 1 } }, 
      { new: true }
    )

    return NextResponse.json({ 
      viewCount: updatedPost?.viewCount || 0 
    })
  } catch (error) {
    console.error('[ViewPOST] Error:', error.message)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}