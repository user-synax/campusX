import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Resource from '@/models/Resource'
import { getCurrentUser } from '@/lib/auth'
import { isValidObjectId } from '@/utils/validators'

/**
 * POST /api/resources/[resourceId]/save
 * Toggles a save/bookmark for the current user.
 * Auth: Required
 */
export async function POST(request, { params }) {
  const { resourceId } = await params

  if (!isValidObjectId(resourceId)) {
    return NextResponse.json({ error: 'Invalid resource ID' }, { status: 400 })
  }

  const currentUser = await getCurrentUser(request)
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    // 1. Check if resource exists and is approved
    const resource = await Resource.findOne({
      _id: resourceId,
      status: 'approved',
      isHidden: false
    }).select('_id saves saveCount').lean()

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found or not approved' }, { status: 404 })
    }

    // 2. Check if already saved
    // We check the saves array manually since we have the lean object
    // But for a toggle, we can use $pull and $addToSet with findOneAndUpdate
    const alreadySaved = await Resource.exists({
      _id: resourceId,
      saves: currentUser._id
    })

    let updatedResource
    if (alreadySaved) {
      // Unsave
      updatedResource = await Resource.findByIdAndUpdate(resourceId, {
        $pull: { saves: currentUser._id },
        $inc: { saveCount: -1 }
      }, { new: true }).select('saveCount').lean()
    } else {
      // Save
      updatedResource = await Resource.findByIdAndUpdate(resourceId, {
        $addToSet: { saves: currentUser._id },
        $inc: { saveCount: 1 }
      }, { new: true }).select('saveCount').lean()
    }

    return NextResponse.json({
      success: true,
      saved: !alreadySaved,
      saveCount: updatedResource.saveCount
    })

  } catch (err) {
    console.error('[Resource Save POST]', err.message)
    return NextResponse.json(
      { error: 'Failed to toggle save' },
      { status: 500 }
    )
  }
}
