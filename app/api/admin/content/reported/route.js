import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Post from '@/models/Post'
import { getCurrentUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

export async function GET(request) {
  try {
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const reported = await Post.find({
      reportCount: { $gt: 0 },
      isDeleted: { $ne: true }
    })
    .sort({ reportCount: -1 })
    .limit(50)
    .populate('author', 'name username college avatar isVerified')
    .select('content reportCount isHidden isFeatured createdAt author images')
    .lean()

    return NextResponse.json({ posts: reported })
  } catch (error) {
    console.error('[AdminContentReportedGET] Error:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
