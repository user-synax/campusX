import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import ShopItem from '@/models/ShopItem'
import { getCurrentUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { logAdminAction } from '@/lib/admin-log'

export async function GET(request) {
  try {
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const items = await ShopItem.find({})
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean()

    return NextResponse.json({ items })
  } catch (error) {
    console.error('[AdminShopGET] Error:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      slug, name, description, category, price, visual, 
      rarity, isLimited, limitedUntil, maxStock, sortOrder 
    } = body

    // Validation
    if (!slug || !name || !description || !category || price === undefined || !visual) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Slug validation: unique, lowercase, no spaces
    const cleanSlug = slug.toLowerCase().replace(/\s+/g, '-')
    const existingItem = await ShopItem.findOne({ slug: cleanSlug })
    if (existingItem) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    if (price < 0) {
      return NextResponse.json({ error: 'Price cannot be negative' }, { status: 400 })
    }

    const newItem = await ShopItem.create({
      slug: cleanSlug,
      name,
      description,
      category,
      price,
      visual,
      rarity: rarity || 'common',
      isLimited: !!isLimited,
      limitedUntil: limitedUntil ? new Date(limitedUntil) : null,
      maxStock: maxStock || null,
      sortOrder: sortOrder || 0,
      soldCount: 0,
      isActive: true
    })

    await logAdminAction({
      adminId: currentUser._id,
      action: 'shop_item_add',
      targetType: 'shop_item',
      targetId: newItem._id,
      summary: `Added new shop item: ${name} (${category})`,
      meta: { slug: cleanSlug, price }
    })

    return NextResponse.json({ success: true, item: newItem })
  } catch (error) {
    console.error('[AdminShopPOST] Error:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
