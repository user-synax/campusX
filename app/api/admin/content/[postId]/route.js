import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Post from '@/models/Post'
import { getCurrentUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { logAdminAction } from '@/lib/admin-log'
import { createNotification } from '@/lib/notifications'

export async function POST(request, { params }) {
  try {
    const { postId } = await params
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { action, reason } = body

    const targetPost = await Post.findById(postId)
    if (!targetPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    switch (action) {
      case 'delete': {
        await Post.findByIdAndUpdate(postId, {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: currentUser._id
        })

        await createNotification({
          recipient: targetPost.author,
          type: 'system',
          meta: { message: `Your post was deleted for violating platform rules: ${reason || 'Inappropriate content'}` }
        })

        await logAdminAction({
          adminId: currentUser._id,
          action: 'post_delete',
          targetType: 'post',
          targetId: postId,
          summary: `Deleted post by ${targetPost.author}`,
          reason
        })

        return NextResponse.json({ success: true })
      }

      case 'hide': {
        await Post.findByIdAndUpdate(postId, { isHidden: true })

        await logAdminAction({
          adminId: currentUser._id,
          action: 'post_hide',
          targetType: 'post',
          targetId: postId,
          summary: `Hid post by ${targetPost.author}`
        })

        return NextResponse.json({ success: true })
      }

      case 'unhide': {
        await Post.findByIdAndUpdate(postId, { isHidden: false, reportCount: 0 })

        await logAdminAction({
          adminId: currentUser._id,
          action: 'post_unhide',
          targetType: 'post',
          targetId: postId,
          summary: `Unhid post by ${targetPost.author}`
        })

        return NextResponse.json({ success: true })
      }

      case 'feature': {
        await Post.findByIdAndUpdate(postId, { isFeatured: true })

        await logAdminAction({
          adminId: currentUser._id,
          action: 'post_feature',
          targetType: 'post',
          targetId: postId,
          summary: `Featured post by ${targetPost.author}`
        })

        return NextResponse.json({ success: true })
      }

      case 'unfeature': {
        await Post.findByIdAndUpdate(postId, { isFeatured: false })

        await logAdminAction({
          adminId: currentUser._id,
          action: 'post_unfeature',
          targetType: 'post',
          targetId: postId,
          summary: `Unfeatured post by ${targetPost.author}`
        })

        return NextResponse.json({ success: true })
      }

      case 'clear_reports': {
        await Post.findByIdAndUpdate(postId, { reportCount: 0, isHidden: false })

        await logAdminAction({
          adminId: currentUser._id,
          action: 'post_clear_reports',
          targetType: 'post',
          targetId: postId,
          summary: `Cleared reports for post by ${targetPost.author}`
        })

        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('[AdminPostActionPOST] Error:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
