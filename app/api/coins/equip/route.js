import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth-edge'
import { equipItem, unequipSlot } from '@/lib/coins'

export async function POST(request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('campusx_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { itemSlug, slot, action } = await request.json()

    if (action === 'unequip') {
      if (!slot) return NextResponse.json({ error: 'Slot required' }, { status: 400 })
      const result = await unequipSlot(decoded.userId, slot)
      return NextResponse.json(result)
    }

    if (!itemSlug) return NextResponse.json({ error: 'Item slug required' }, { status: 400 })
    const result = await equipItem(decoded.userId, itemSlug)

    if (!result.success) {
      return NextResponse.json({ error: result.reason }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[API Equip] Error:', error.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
