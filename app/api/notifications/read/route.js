import { NextResponse } from 'next/server' 
import { getCurrentUser } from '@/lib/auth' 
import connectDB from '@/lib/db' 
import Notification from '@/models/Notification' 
import { triggerPusher } from '@/lib/pusher-server' 
import { validateObjectId } from '@/utils/validators' 
 
export async function PATCH(request) { 
  try { 
    const currentUser = await getCurrentUser(request) 
    if (!currentUser) { 
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) 
    } 
 
    const { notificationId } = await request.json().catch(() => ({})) 
 
    await connectDB() 
 
    if (notificationId) { 
      if (!validateObjectId(notificationId)) { 
        return NextResponse.json({ error: 'Invalid Notification ID' }, { status: 400 }) 
      } 
 
      await Notification.findOneAndUpdate( 
        { 
          _id: notificationId, 
          recipient: currentUser._id 
        }, 
        { read: true } 
      ) 
    } else { 
      await Notification.updateMany( 
        { recipient: currentUser._id, read: false }, 
        { read: true } 
      ) 
    } 
 
    // Tell client via Pusher (so other tabs update too) 
    triggerPusher( 
      `private-notifications-${currentUser._id}`, 
      'notifications-read', 
      { notificationId: notificationId || 'all' } 
    ).catch(() => {}) 
 
    return NextResponse.json({ success: true }) 
 
  } catch (err) { 
    console.error('[Notification Read] Error:', err.message) 
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }) 
  } 
} 
