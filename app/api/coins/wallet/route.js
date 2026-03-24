import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth-edge'
import { getWalletData } from '@/lib/coins'

export async function GET(request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('campusx_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const includeInventory = searchParams.get('inventory') === 'true'

    const walletData = await getWalletData(decoded.userId, { includeInventory })
    return NextResponse.json(walletData)
  } catch (error) {
    console.error('[API Wallet] Error:', error.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
