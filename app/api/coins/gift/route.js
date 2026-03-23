import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth-edge'
import { giftCoins } from '@/lib/coins'
import connectDB from '@/lib/db'
import User from '@/models/User'

export async function POST(request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('campusx_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { username, amount } = await request.json()
    if (!username || !amount) return NextResponse.json({ error: 'Username and amount required' }, { status: 400 })

    await connectDB()

    // Find recipient
    const cleanUsername = username.replace('@', '')
    const recipient = await User.findOne({ username: cleanUsername }).select('_id').lean()
    if (!recipient) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const result = await giftCoins(decoded.userId, recipient._id, parseInt(amount))

    if (!result.success) {
      return NextResponse.json({ error: result.reason }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[API Gift] Error:', error.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
