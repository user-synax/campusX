import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Report from '@/models/Report'
import Post from '@/models/Post'
import { getCurrentUser } from '@/lib/auth'
import { validateObjectId } from '@/utils/validators'

export async function POST(request) {
  try {
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { postId, reason, description } = body

    if (!postId || !reason) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    if (!validateObjectId(postId)) {
      return NextResponse.json({ message: 'Invalid post ID' }, { status: 400 })
    }

    const post = await Post.findById(postId)
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 })
    }

    const report = await Report.create({
      postId,
      reportedBy: currentUser._id,
      reason,
      description: description || ''
    })

    await Post.findByIdAndUpdate(postId, {
      $inc: { reportCount: 1 }
    })

    return NextResponse.json({ 
      message: 'Report submitted successfully',
      reportId: report._id 
    })
  } catch (error) {
    console.error('[ReportPOST] Error:', error.message)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    const reports = await Report.find({ status })
      .populate('postId', 'content images author')
      .populate('reportedBy', 'name username')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('[ReportGET] Error:', error.message)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}