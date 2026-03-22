import { NextResponse } from 'next/server' 
import { getCurrentUser } from '@/lib/auth' 
import connectDB from '@/lib/db' 
import Notification from '@/models/Notification' 
import { validateObjectId } from '@/utils/validators' 
 
export async function DELETE(request, { params }) { 
  try { 
    const currentUser = await getCurrentUser(request) 
    if (!currentUser) { 
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) 
    } 
 
    const { notificationId } = await params 
 
    if (!validateObjectId(notificationId)) { 
      return NextResponse.json({ error: 'Invalid Notification ID' }, { status: 400 }) 
    } 
 
    await connectDB() 
 
    const result = await Notification.deleteOne({ 
      _id: notificationId, 
      recipient: currentUser._id 
    }) 
 
    if (result.deletedCount === 0) { 
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 }) 
    } 
 
    return NextResponse.json({ success: true }) 
 
  } catch (err) { 
    console.error('[Notification DELETE] Error:', err.message) 
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }) 
  } 
} 
