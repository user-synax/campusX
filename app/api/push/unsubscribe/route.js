import { NextResponse } from 'next/server' 
import connectDB from '@/lib/db' 
import { getCurrentUser } from '@/lib/auth' 
import PushSubscription from '@/models/PushSubscription' 
 
export async function DELETE(request) { 
  const currentUser = await getCurrentUser(request) 
  if (!currentUser) { 
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) 
  } 
 
  try { 
    await connectDB() 
 
    const { endpoint } = await request.json() 
 
    if (!endpoint) { 
      return NextResponse.json({ error: 'Endpoint required' }, { status: 400 }) 
    } 
 
    // Mark as inactive (not delete — keep for audit) 
    await PushSubscription.findOneAndUpdate( 
      { endpoint, userId: currentUser._id }, 
      { isActive: false } 
    ) 
 
    return NextResponse.json({ success: true }) 
 
  } catch (err) { 
    console.error('[Push Unsubscribe]', err.message) 
    return NextResponse.json( 
      { error: 'Failed to unsubscribe' }, 
      { status: 500 } 
    ) 
  } 
} 
