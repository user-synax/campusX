import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth-edge'
import connectDB from '@/lib/db'
import CoinTransaction from '@/models/CoinTransaction'

export async function GET(request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('campusx_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const skip = (page - 1) * limit

    await connectDB()

    const query = { userId: decoded.userId }
    if (type && type !== 'all') {
      if (type === 'earn') query.type = 'earn'
      else if (type === 'spend') query.type = 'spend'
    }

    const [transactions, total] = await Promise.all([
      CoinTransaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CoinTransaction.countDocuments(query)
    ])

    return NextResponse.json({
      transactions,
      total,
      hasMore: total > skip + transactions.length,
      page
    })
  } catch (error) {
    console.error('[API History] Error:', error.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
