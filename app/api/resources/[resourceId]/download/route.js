import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Resource from '@/models/Resource'
import { isValidObjectId } from '@/utils/validators'

/**
 * POST /api/resources/[resourceId]/download
 * Tracks a download by incrementing the downloadCount
 * Auth: Optional (anyone can download and trigger increment)
 */
export async function POST(request, { params }) {
  const { resourceId } = await params

  if (!isValidObjectId(resourceId)) {
    return NextResponse.json({ error: 'Invalid resource ID' }, { status: 400 })
  }

  try {
    await connectDB()

    // Increment downloadCount (fire and forget from client perspective)
    // We don't await this so the client gets an instant response
    Resource.findByIdAndUpdate(
      resourceId,
      { $inc: { downloadCount: 1 } },
      { timestamps: false } // don't update updatedAt for a simple count change
    ).catch(err => console.error('[Download Count Increment Error]', err.message))

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('[Resource Download POST]', err.message)
    return NextResponse.json(
      { error: 'Failed to track download' },
      { status: 500 }
    )
  }
}
