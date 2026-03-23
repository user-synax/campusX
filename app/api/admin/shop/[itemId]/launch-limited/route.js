import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import ShopItem from '@/models/ShopItem'
import { getCurrentUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { logAdminAction } from '@/lib/admin-log'
import { createNotification } from '@/lib/notifications'
import User from '@/models/User'

export async function POST(request, { params }) {
  try {
    const { itemId } = await params
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { limitedUntil, maxStock, price } = body

    if (!limitedUntil || price === undefined) {
      return NextResponse.json({ error: 'Missing limitedUntil or price' }, { status: 400 })
    }

    const item = await ShopItem.findByIdAndUpdate(
      itemId,
      { 
        isLimited: true, 
        limitedUntil: new Date(limitedUntil), 
        maxStock: maxStock || null, 
        price: price, 
        soldCount: 0,  // reset for new limited run 
        isActive: true 
      },
      { new: true }
    )

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    await logAdminAction({
      adminId: currentUser._id,
      action: 'shop_item_edit', // Using edit for launch limited
      targetType: 'shop_item',
      targetId: itemId,
      summary: `Launched limited edition for: ${item.name}`,
      meta: { isLimited: true, limitedUntil, maxStock, price }
    })

    // Broadcast announcement via system notification to all users (optional but good)
    // For large user bases, this should be a background task or a broadcast system
    // For now, let's assume we use a broadcast field on the founder's data as per User.js
    const founder = await User.findOne({ username: process.env.NEXT_PUBLIC_FOUNDER_USERNAME })
    if (founder) {
      await User.findByIdAndUpdate(founder._id, {
        'founderData.broadcastMessage': `🎉 Limited item available: ${item.name} — only ${maxStock || 'limited'} left!`,
        'founderData.broadcastActive': true,
        'founderData.broadcastId': `shop_limited_${itemId}_${Date.now()}`,
        'founderData.broadcastCreatedAt': new Date()
      })
    }

    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error('[AdminShopLaunchLimitedPOST] Error:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
