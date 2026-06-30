import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import DMConversation from '@/models/DMConversation'
import DMMessage from '@/models/DMMessage'
import { getCurrentUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { validateObjectId } from '@/utils/validators'

/**
 * GET /api/admin/dms/[conversationId] - Get DM conversation with messages (admin only)
 */
export async function GET(request, { params }) {
  try {
    const { conversationId } = await params
    if (!validateObjectId(conversationId)) {
      return NextResponse.json({ message: 'Invalid Conversation ID' }, { status: 400 })
    }

    const currentUser = await getCurrentUser(request)
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = Math.min(parseInt(searchParams.get('limit')) || 50, 100)

    await connectDB()

    // Get conversation
    const conversation = await DMConversation.findById(conversationId)
      .populate('participants.userId', 'name username avatar isVerified')
      .lean()

    if (!conversation) {
      return NextResponse.json({ message: 'Conversation not found' }, { status: 404 })
    }

    // Build query for messages
    const query = { conversationId }
    if (cursor && validateObjectId(cursor)) {
      query._id = { $lt: cursor }
    }

    // Fetch messages
    const messages = await DMMessage.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate('sender', 'name username avatar isVerified')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name username' }
      })
      .lean()

    // Pagination
    const hasMore = messages.length > limit
    const paginatedMessages = messages.slice(0, limit)
    const reversedMessages = [...paginatedMessages].reverse()

    return NextResponse.json({
      conversation,
      messages: reversedMessages,
      hasMore,
      nextCursor: hasMore ? paginatedMessages[paginatedMessages.length - 1]._id : null
    })
  } catch (error) {
    console.error('[Admin DM GET]', error.message)
    return NextResponse.json({ error: 'Failed to fetch DM' }, { status: 500 })
  }
}
