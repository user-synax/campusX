import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { FOUNDER_USERNAME, isFounder } from '@/lib/founder'
import { getTokenFromRequest, verifyToken, getCurrentUser } from '@/lib/auth'
import { withCache, deleteCache } from '@/lib/cache'
import { sanitizeText } from '@/lib/sanitize'
import { applyRateLimit } from '@/lib/rate-limit'

export async function GET() {
  try {
    const data = await withCache('founder_broadcast', 60, async () => {
      await connectDB()

      if (!FOUNDER_USERNAME) {

        return { broadcast: null }
      }

      const founder = await User.findOne({ 
        username: { $regex: new RegExp(`^${FOUNDER_USERNAME}$`, 'i') } 
      }).lean()

      if (!founder || !founder.founderData?.broadcastActive) {
        return { broadcast: null }
      }

      return {
        broadcast: {
          message: founder.founderData.broadcastMessage,
          id: founder.founderData.broadcastId,
          createdAt: founder.founderData.broadcastCreatedAt
        }
      }
    });

    const response = NextResponse.json(data);
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');
    return response;
  } catch (error) { 
    console.error('Broadcast GET error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    // Rate limit founder broadcast - 5 per hour per IP
    const { blocked, response: rateLimitResponse } = applyRateLimit(
      request,
      'founder_broadcast',
      5,
      60 * 60 * 1000
    );
    if (blocked) return rateLimitResponse;

    await connectDB();
    const currentUser = await getCurrentUser(request);

    if (!currentUser || !isFounder(currentUser.username)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    let body;
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 })
    }

    const { message, active } = body || {}

    let updatedUser;
    if (active) {
      if (!message || message.trim().length === 0) {
        return NextResponse.json({ message: 'Message is required when activating broadcast' }, { status: 400 })
      }
      if (message.length > 200) {
        return NextResponse.json({ message: 'Message must be less than 200 characters' }, { status: 400 })
      }

      const uniqueId = Date.now().toString(36) + Math.random().toString(36).slice(2)
      const sanitizedMessage = sanitizeText(message);

      
      updatedUser = await User.findOneAndUpdate(
        { username: { $regex: new RegExp(`^${FOUNDER_USERNAME}$`, 'i') } },
        {
          $set: {
            'founderData.broadcastMessage': sanitizedMessage,
            'founderData.broadcastId': uniqueId,
            'founderData.broadcastActive': true,
            'founderData.broadcastCreatedAt': new Date()
          }
        },
        { new: true }
      ).select('founderData')
    } else {

      updatedUser = await User.findOneAndUpdate(
        { username: { $regex: new RegExp(`^${FOUNDER_USERNAME}$`, 'i') } },
        {
          $set: {
            'founderData.broadcastActive': false
          }
        },
        { new: true }
      ).select('founderData')
    }

    // Invalidate cache
    deleteCache('founder_broadcast')

    return NextResponse.json({ success: true, broadcast: updatedUser?.founderData })
  } catch (error) {
    console.error('Broadcast POST error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
