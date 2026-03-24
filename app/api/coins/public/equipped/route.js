import { NextResponse } from 'next/server'
import { getFounderVisuals } from '@/lib/founder-items'
import User from '@/models/User'
import Wallet from '@/models/Wallet'
import ShopItem from '@/models/ShopItem'
import connectDB from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    await connectDB()

    // Get username to check if founder 
    const user = await User.findById(userId) 
      .select('username') 
      .lean() 

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
 
    // Founder check FIRST — skip wallet query entirely 
    const founderVisuals = getFounderVisuals(user.username) 
    if (founderVisuals) { 
      return NextResponse.json({ 
        equipped: founderVisuals, 
        isFounder: true 
      }) 
    } 
 
    // Regular user → fetch wallet as before 
    const wallet = await Wallet.findOne({ userId })
      .select('equipped')
      .lean()

    if (!wallet || !wallet.equipped) {
      return NextResponse.json({ equipped: null })
    }

    // Resolve visuals for shop items
    const equipped = wallet.equipped
    const slugs = Object.values(equipped).filter(Boolean)
    
    if (slugs.length === 0) {
      return NextResponse.json({ equipped: null })
    }

    const shopItems = await ShopItem.find({ slug: { $in: slugs } })
      .select('slug category visual')
      .lean()

    const resolved = {}
    shopItems.forEach(item => {
      // Find which slot this slug belongs to
      for (const [slot, slug] of Object.entries(equipped)) {
        if (slug === item.slug) {
          resolved[slot] = { slug, ...item.visual, category: item.category }
        }
      }
    })

    return NextResponse.json({ 
      equipped: Object.keys(resolved).length > 0 ? resolved : null,
      isFounder: false
    }) 
  } catch (error) {
    console.error('[API Equipped] Error:', error.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
