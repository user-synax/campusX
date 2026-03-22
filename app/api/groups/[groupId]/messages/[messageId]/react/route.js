import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import GroupMessage from '@/models/GroupMessage'
import { getCurrentUser } from '@/lib/auth'
import { triggerPusher } from '@/lib/pusher-server'
import { validateObjectId } from '@/utils/validators'
import { sanitizeMongoInput } from '@/lib/sanitize'

const ALLOWED_EMOJIS = ['❤️', '😂', '👍', '🔥', '😮', '😢','🥀']

/**
 * POST /api/groups/[groupId]/messages/[messageId]/react - Add/remove reaction
 */
export async function POST(request, { params }) {
  try {
    const { groupId, messageId } = await params
    if (!validateObjectId(groupId) || !validateObjectId(messageId)) {
      return NextResponse.json({ message: 'Invalid Group or Message ID' }, { status: 400 })
    }

    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Body validation
    let body
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 })
    }

    const { emoji } = sanitizeMongoInput(body)

    // 1. Validate emoji is in allowed list
    if (!emoji || !ALLOWED_EMOJIS.includes(emoji)) {
      return NextResponse.json({ message: 'Invalid reaction emoji' }, { status: 400 })
    }

    await connectDB()

    // 2. Find message
    const message = await GroupMessage.findOne({ _id: messageId, groupId })
    if (!message) {
      return NextResponse.json({ message: 'Message not found' }, { status: 404 })
    }

    // 3. Check if reacting to deleted message
    if (message.isDeleted) {
      return NextResponse.json({ message: 'Cannot react to a deleted message' }, { status: 400 })
    }

    const currentUserIdStr = currentUser._id.toString()
    const existingReaction = message.reactions.find(
      r => r.userId.toString() === currentUserIdStr && r.emoji === emoji
    )

    let updatedMessage;
    if (existingReaction) {
      // 4. If exists: remove it ($pull)
      updatedMessage = await GroupMessage.findOneAndUpdate(
        { _id: messageId, groupId },
        { $pull: { reactions: { userId: currentUser._id, emoji: emoji } } },
        { new: true }
      )
    } else {
      // 5. If not exists: add it ($push) — remove any OTHER reaction from this user first
      updatedMessage = await GroupMessage.findOneAndUpdate(
        { _id: messageId, groupId },
        { 
          $pull: { reactions: { userId: currentUser._id } }, // Remove existing reactions from user
        },
        { new: true }
      )
      
      updatedMessage = await GroupMessage.findOneAndUpdate(
        { _id: messageId, groupId },
        { 
          $push: { reactions: { userId: currentUser._id, emoji: emoji } } 
        },
        { new: true }
      )
    }

    // 6. Trigger Pusher with updated reactions
    await triggerPusher(`private-group-${groupId}`, 'message-reaction', {
      messageId: messageId,
      reactions: updatedMessage.reactions
    })

    return NextResponse.json({ reactions: updatedMessage.reactions })

  } catch (err) {
    console.error('[GroupMessage React POST]', err.message)
    return NextResponse.json({ error: 'Failed to react to message' }, { status: 500 })
  }
}
