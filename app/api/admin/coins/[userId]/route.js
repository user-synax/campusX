import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Wallet from '@/models/Wallet'
import CoinTransaction from '@/models/CoinTransaction'
import ShopItem from '@/models/ShopItem' // Ensure ShopItem is registered for populate
import { getCurrentUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

export async function GET(request, { params }) {
  try {
    const { userId } = await params
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const [wallet, transactions] = await Promise.all([ 
      Wallet.findOne({ userId }) 
        .populate('inventory.itemId', 'name slug category visual rarity') 
        .lean(), 
      CoinTransaction.find({ userId }) 
        .sort({ createdAt: -1 }) 
        .limit(50) 
        .populate('adminId', 'name username')
        .lean() 
    ]) 

    return NextResponse.json({ wallet, transactions }) 
  } catch (error) {
    console.error('[AdminCoinsHistoryGET] Error:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
