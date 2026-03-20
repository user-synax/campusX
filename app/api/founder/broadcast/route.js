import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { FOUNDER_USERNAME, isFounder } from '@/lib/founder'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    await connectDB()

    if (!FOUNDER_USERNAME) {
      console.log('FOUNDER_USERNAME not set in broadcast GET')
      return NextResponse.json({ broadcast: null })
    }

    const founder = await User.findOne({ 
      username: { $regex: new RegExp(`^${FOUNDER_USERNAME}$`, 'i') } 
    }).lean()

    console.log('Broadcast check for:', FOUNDER_USERNAME, 'Found:', !!founder, 'Active:', founder?.founderData?.broadcastActive)

    if (!founder || !founder.founderData?.broadcastActive) {
      return NextResponse.json({ broadcast: null }, {
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      })
    }

    const broadcastData = {
      message: founder.founderData.broadcastMessage,
      id: founder.founderData.broadcastId,
      createdAt: founder.founderData.broadcastCreatedAt
    }

    console.log('Returning broadcast data:', broadcastData)

    return NextResponse.json({
      broadcast: broadcastData
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    })
  } catch (error) {
    console.error('Broadcast GET error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser || !isFounder(currentUser.username)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, active } = body

    if (active) {
      if (!message || message.trim().length === 0) {
        return NextResponse.json({ message: 'Message is required when activating broadcast' }, { status: 400 })
      }
      if (message.length > 200) {
        return NextResponse.json({ message: 'Message must be less than 200 characters' }, { status: 400 })
      }

      const uniqueId = Date.now().toString(36) + Math.random().toString(36).slice(2)
      console.log('Activating broadcast for:', FOUNDER_USERNAME, 'with message:', message)
      
      const updatedUser = await User.findOneAndUpdate(
        { username: { $regex: new RegExp(`^${FOUNDER_USERNAME}$`, 'i') } },
        {
          $set: {
            'founderData.broadcastMessage': message,
            'founderData.broadcastId': uniqueId,
            'founderData.broadcastActive': true,
            'founderData.broadcastCreatedAt': new Date()
          }
        },
        { new: true }
      ).select('founderData')

      console.log('Update success:', !!updatedUser, 'Active now:', updatedUser?.founderData?.broadcastActive)

      return NextResponse.json({ success: true, broadcast: updatedUser.founderData })
    } else {
      console.log('Deactivating broadcast for:', FOUNDER_USERNAME)
      const updatedUser = await User.findOneAndUpdate(
        { username: { $regex: new RegExp(`^${FOUNDER_USERNAME}$`, 'i') } },
        {
          $set: {
            'founderData.broadcastActive': false
          }
        },
        { new: true }
      ).select('founderData')

      console.log('Deactivate success:', !!updatedUser, 'Active now:', updatedUser?.founderData?.broadcastActive)

      return NextResponse.json({ success: true, broadcast: updatedUser.founderData })
    }
  } catch (error) {
    console.error('Broadcast POST error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
