import { NextResponse } from 'next/server' 
import connectDB from '@/lib/db' 
import { getCurrentUser } from '@/lib/auth' 
import PushSubscription from '@/models/PushSubscription' 
 
export async function GET(request) { 
  const currentUser = await getCurrentUser(request) 
  if (!currentUser) { 
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) 
  } 
 
  try { 
    await connectDB() 
 
    const subs = await PushSubscription.find({ 
      userId: currentUser._id, 
      isActive: true 
    }) 
    .select('deviceName createdAt lastUsedAt endpoint') 
    .lean() 
 
    return NextResponse.json({ subscriptions: subs }) 
 
  } catch (err) { 
    console.error('[Push Status]', err.message) 
    return NextResponse.json( 
      { error: 'Failed to fetch status' }, 
      { status: 500 } 
    ) 
  } 
} 
