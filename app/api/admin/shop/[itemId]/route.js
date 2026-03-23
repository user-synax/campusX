import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import ShopItem from '@/models/ShopItem'
import { getCurrentUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { logAdminAction } from '@/lib/admin-log'

export async function PATCH(request, { params }) {
  try {
    const { itemId } = await params
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, price, sortOrder, limitedUntil, isActive } = body

    const item = await ShopItem.findById(itemId)
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Update only allowed fields
    const updates = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (price !== undefined) updates.price = Math.max(0, price)
    if (sortOrder !== undefined) updates.sortOrder = sortOrder
    if (limitedUntil !== undefined) updates.limitedUntil = limitedUntil ? new Date(limitedUntil) : null
    if (isActive !== undefined) updates.isActive = isActive

    const updatedItem = await ShopItem.findByIdAndUpdate(
      itemId,
      { $set: updates },
      { new: true }
    )

    await logAdminAction({
      adminId: currentUser._id,
      action: 'shop_item_edit',
      targetType: 'shop_item',
      targetId: itemId,
      summary: `Edited shop item: ${updatedItem.name}`,
      meta: { updates }
    })

    return NextResponse.json({ success: true, item: updatedItem })
  } catch (error) {
    console.error('[AdminShopItemPATCH] Error:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { itemId } = await params
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const item = await ShopItem.findByIdAndUpdate(
      itemId,
      { isActive: false },
      { new: true }
    )

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    await logAdminAction({
      adminId: currentUser._id,
      action: 'shop_item_disable',
      targetType: 'shop_item',
      targetId: itemId,
      summary: `Disabled shop item: ${item.name}`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[AdminShopItemDELETE] Error:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
