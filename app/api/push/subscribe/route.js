import { NextResponse } from 'next/server' 
import connectDB from '@/lib/db' 
import { getCurrentUser } from '@/lib/auth' 
import PushSubscription from '@/models/PushSubscription' 
 
export async function POST(request) { 
  const currentUser = await getCurrentUser(request) 
  if (!currentUser) { 
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) 
  } 
 
  try { 
    await connectDB() 
 
    const { endpoint, p256dh, auth, userAgent } = await request.json() 
 
    // Validate 
    if (!endpoint || !p256dh || !auth) { 
      return NextResponse.json( 
        { error: 'Invalid subscription data' }, 
        { status: 400 } 
      ) 
    } 
 
    // Detect device name from user agent 
    const deviceName = parseDeviceName(userAgent || '') 
 
    // Upsert — if endpoint exists, update. If not, create. 
    await PushSubscription.findOneAndUpdate( 
      { endpoint }, 
      { 
        userId: currentUser._id, 
        endpoint, 
        p256dh, 
        auth, 
        userAgent: userAgent || '', 
        deviceName, 
        isActive: true, 
        lastUsedAt: new Date() 
      }, 
      { upsert: true, new: true } 
    ) 
 
    return NextResponse.json({ 
      success: true, 
      message: 'Push notifications enabled' 
    }) 
 
  } catch (err) { 
    console.error('[Push Subscribe]', err.message) 
    return NextResponse.json( 
      { error: 'Failed to save subscription' }, 
      { status: 500 } 
    ) 
  } 
} 
 
function parseDeviceName(ua) { 
  if (!ua) return 'Unknown Device' 
  if (ua.includes('Android')) { 
    if (ua.includes('Chrome')) return 'Chrome on Android' 
    return 'Android Browser' 
  } 
  if (ua.includes('iPhone') || ua.includes('iPad')) { 
    return 'Safari on iOS' 
  } 
  if (ua.includes('Windows')) { 
    if (ua.includes('Chrome')) return 'Chrome on Windows' 
    if (ua.includes('Firefox')) return 'Firefox on Windows' 
    if (ua.includes('Edge')) return 'Edge on Windows' 
    return 'Windows Browser' 
  } 
  if (ua.includes('Mac')) { 
    if (ua.includes('Chrome')) return 'Chrome on Mac' 
    if (ua.includes('Firefox')) return 'Firefox on Mac' 
    if (ua.includes('Safari')) return 'Safari on Mac' 
    return 'Mac Browser' 
  } 
  if (ua.includes('Linux')) return 'Linux Browser' 
  return 'Unknown Device' 
} 
