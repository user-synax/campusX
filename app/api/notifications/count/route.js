import { NextResponse } from 'next/server' 
import { getCurrentUser } from '@/lib/auth' 
import connectDB from '@/lib/db' 
import Notification from '@/models/Notification' 
 
export async function GET(request) { 
  try { 
    const currentUser = await getCurrentUser(request) 
    if (!currentUser) { 
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) 
    } 
 
    await connectDB() 
 
    const count = await Notification.countDocuments({ 
      recipient: currentUser._id, 
      read: false 
    }) 
 
    const response = NextResponse.json({ 
      count: Math.min(count, 99) 
    }) 
 
    // Optimized caching: 15s fresh, up to 30s stale-while-revalidate
    response.headers.set('Cache-Control', 'private, max-age=15, stale-while-revalidate=30') 
 
    return response 
 
  } catch (err) { 
    console.error('[Notification Count] Error:', err.message) 
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }) 
  } 
} 
