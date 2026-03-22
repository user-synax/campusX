import { NextResponse } from 'next/server' 
import { getCurrentUser } from '@/lib/auth' 
import { getPusherServer } from '@/lib/pusher-server' 
import connectDB from '@/lib/db' 
import GroupChat from '@/models/GroupChat' 
import { validateObjectId } from '@/utils/validators'

export async function POST(request) { 
  try { 
    // Verify user is logged in 
    const currentUser = await getCurrentUser(request) 
    if (!currentUser) { 
      console.warn('[PusherAuth] Unauthorized — no user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) 
    } 

    const contentType = request.headers.get('content-type') || ''
    console.log(`[PusherAuth] Request received. Content-Type: ${contentType}`)
    let socketId, channelName

    if (contentType.includes('application/json')) {
      const body = await request.json()
      socketId = body.socket_id
      channelName = body.channel_name
    } else {
      const body = await request.text() 
      const params = new URLSearchParams(body) 
      socketId = params.get('socket_id') 
      channelName = params.get('channel_name') 
    }

    console.log(`[PusherAuth] Socket: ${socketId}, Channel: ${channelName}, User: ${currentUser.username}`)

    if (!socketId || !channelName) { 
      console.warn('[PusherAuth] Missing socket_id or channel_name', { socketId, channelName })
      return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 }) 
    } 

    // Extract groupId from channel name: private-group-[groupId] 
    if (channelName.startsWith('private-group-')) { 
      const groupId = channelName.replace('private-group-', '') 

      if (!validateObjectId(groupId)) {
        console.warn('[PusherAuth] Invalid group ID in channel name:', channelName)
        return NextResponse.json({ error: 'Invalid group ID' }, { status: 400 })
      }

      await connectDB() 

      // Verify user is a member of this group 
      const group = await GroupChat.findOne({ 
        _id: groupId, 
        'members.userId': currentUser._id, 
        isActive: true 
      }).lean() 

      if (!group) { 
        console.warn(`[PusherAuth] User ${currentUser._id} is not a member of group ${groupId}`)
        return NextResponse.json( 
          { error: 'Not a member of this group or group inactive' }, 
          { status: 403 } 
        ) 
      } 
    } 

    // Extract userId from channel name: private-notifications-[userId]
    if (channelName.startsWith('private-notifications-')) {
      const channelUserId = channelName.replace('private-notifications-', '')

      // Only allow subscribing to YOUR OWN notification channel
      if (channelUserId !== currentUser._id.toString()) {
        console.warn(`[PusherAuth] User ${currentUser._id} attempted to subscribe to channel for user ${channelUserId}`)
        return NextResponse.json(
          { error: 'Cannot subscribe to another user\'s notifications' },
          { status: 403 }
        )
      }
      // Auth passes — user can subscribe to their own channel
    }

    // Generate Pusher auth response 
    const pusher = getPusherServer() 
    const authResponse = pusher.authorizeChannel(socketId, channelName) 

    console.log('[PusherAuth] Success for channel:', channelName)
    return NextResponse.json(authResponse) 

  } catch (err) { 
    console.error('[PusherAuth Error]', err.stack || err.message) 
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 }) 
  } 
} 
