import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import GroupChat from '@/models/GroupChat'
import GroupMessage from '@/models/GroupMessage'
import { getCurrentUser } from '@/lib/auth'
import { sanitizeText, sanitizeMongoInput } from '@/lib/sanitize'
import { applyRateLimit } from '@/lib/rate-limit'
import { triggerPusher } from '@/lib/pusher-server'
import { validateObjectId } from '@/utils/validators'

/**
 * GET /api/groups/[groupId]/messages - Get messages for a group (cursor-based pagination)
 */
export async function GET(request, { params }) {
  try {
    const { groupId } = await params
    if (!validateObjectId(groupId)) {
      return NextResponse.json({ message: 'Invalid Group ID' }, { status: 400 })
    }

    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = Math.min(parseInt(searchParams.get('limit')) || 30, 50)

    await connectDB()

    // 1. Verify member
    const group = await GroupChat.findOne({ _id: groupId, 'members.userId': currentUser._id, isActive: true }).lean()
    if (!group) {
      return NextResponse.json({ message: 'Group not found or not a member' }, { status: 403 })
    }

    // 2. Build query
    const query = { groupId }
    if (cursor && validateObjectId(cursor)) {
      query._id = { $lt: cursor }
    }

    // 3. Fetch messages (newest first)
    const messages = await GroupMessage.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate('sender', 'name username avatar isVerified')
      .lean()

    // 4. Pagination logic
    const hasMore = messages.length > limit
    const paginatedMessages = messages.slice(0, limit)
    
    // 5. Reverse for display (oldest first)
    const reversedMessages = [...paginatedMessages].reverse()

    // 6. Mark as read (fire and forget)
    GroupChat.findOneAndUpdate(
      { _id: groupId, 'members.userId': currentUser._id },
      { $set: { 'members.$.lastReadAt': new Date() } }
    ).catch(() => {})

    return NextResponse.json({
      messages: reversedMessages,
      hasMore,
      nextCursor: hasMore ? paginatedMessages[paginatedMessages.length - 1]._id : null
    })

  } catch (err) {
    console.error('[GroupMessages GET]', err.message)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

/**
 * POST /api/groups/[groupId]/messages - Send message
 */
export async function POST(request, { params }) {
  try {
    const { groupId } = await params
    if (!validateObjectId(groupId)) {
      return NextResponse.json({ message: 'Invalid Group ID' }, { status: 400 })
    }

    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Rate limit: 30 messages per minute
    const { blocked, response: rateLimitResponse } = applyRateLimit(
      request,
      `msg_${currentUser._id}_${groupId}`,
      30,
      60 * 1000
    )
    if (blocked) return rateLimitResponse

    await connectDB()

    // 2. Verify member in group
    const group = await GroupChat.findOne({ _id: groupId, 'members.userId': currentUser._id, isActive: true })
    if (!group) {
      return NextResponse.json({ message: 'Group not found or not a member' }, { status: 403 })
    }

    // Body validation
    let body
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 })
    }

    const { content, type, imageUrl } = sanitizeMongoInput(body)

    // 3. Validate content/type
    if (!['text', 'image'].includes(type)) {
      return NextResponse.json({ message: 'Invalid message type' }, { status: 400 })
    }

    if (type === 'text') {
      if (!content || !content.trim()) {
        return NextResponse.json({ message: 'Message content required' }, { status: 400 })
      }
      if (content.length > 2000) {
        return NextResponse.json({ message: 'Message too long (max 2000 chars)' }, { status: 400 })
      }
    } else if (type === 'image') {
      if (!imageUrl || !imageUrl.startsWith('https://')) {
        return NextResponse.json({ message: 'Invalid image URL' }, { status: 400 })
      }
    }

    // 4. Create message in DB
    const message = await GroupMessage.create({
      groupId,
      sender: currentUser._id,
      content: type === 'text' ? sanitizeText(content) : '',
      type,
      imageUrl: type === 'image' ? imageUrl : ''
    })

    // 5. Populate sender
    const populated = await GroupMessage.findById(message._id)
      .populate('sender', 'name username avatar isVerified')
      .lean()

    // 6. Update group's lastMessage (fire and forget)
    GroupChat.findByIdAndUpdate(groupId, {
      lastMessage: {
        content: type === 'text' ? content.slice(0, 60) : '📷 Image',
        senderName: currentUser.name,
        sentAt: new Date(),
        type
      },
      $inc: { messageCount: 1 }
    }).catch(() => {})

    // 7. Trigger Pusher
    await triggerPusher(`private-group-${groupId}`, 'new-message', {
      ...populated,
      reactions: []
    })

    return NextResponse.json(populated, { status: 201 })

  } catch (err) {
    console.error('[GroupMessages POST]', err.message)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
