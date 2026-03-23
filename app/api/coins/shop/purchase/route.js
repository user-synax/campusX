import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth-edge'
import { spendCoins } from '@/lib/coins'

export async function POST(request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('campusx_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { itemSlug } = await request.json()
    if (!itemSlug) return NextResponse.json({ error: 'Item slug required' }, { status: 400 })

    const result = await spendCoins(decoded.userId, itemSlug)

    if (!result.success) {
      console.error('[API Purchase] Spend failed:', result.reason, { userId: decoded.userId, itemSlug })
      return NextResponse.json({ 
        error: result.reason,
        details: result.reason === 'insufficient_balance' ? {
          required: result.required,
          current: result.current,
          shortfall: result.shortfall
        } : null
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Purchased ${result.item.name}!`,
      newBalance: result.newBalance 
    })
  } catch (error) {
    console.error('[API Purchase] Error:', error.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
