import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth-edge'
import connectDB from '@/lib/db'
import ShopItem from '@/models/ShopItem'
import Wallet from '@/models/Wallet'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('campusx_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    await connectDB()

    // ━━━ Seed Shop Items (Ensuring 40+ items exist) ━━━
    const seedItems = [
      // ━━━ MYTHIC (TOP TIER - 5,000-15,000 COINS) ━━━
      {
        slug: 'frame-dragon-soul',
        name: 'Dragon Soul',
        description: 'Breathe life into your profile with ancient draconic flames.',
        category: 'avatar_frame',
        price: 10000,
        rarity: 'mythic',
        visual: { gradient: 'linear-gradient(45deg, #7f1d1d, #ef4444, #f97316)', animation: 'pulse 1.5s infinite', padding: '5px' }
      },
      {
        slug: 'frame-quantum-ghost',
        name: 'Quantum Ghost',
        description: 'A shifting, semi-transparent frame from another dimension.',
        category: 'avatar_frame',
        price: 8000,
        rarity: 'mythic',
        visual: { gradient: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(139,92,246,0.5), rgba(255,255,255,0.1))', animation: 'shimmer 2s infinite', padding: '4px' }
      },
      {
        slug: 'frame-stellar-nova',
        name: 'Stellar Nova',
        description: 'The explosive power of a dying star encircling you.',
        category: 'avatar_frame',
        price: 12000,
        rarity: 'mythic',
        visual: { gradient: 'radial-gradient(circle, #fde047, #f97316, #7c2d12)', backgroundSize: '200% 200%', animation: 'gradient-shift 3s infinite', padding: '6px' }
      },
      {
        slug: 'frame-chrono-shift',
        name: 'Chrono Shift',
        description: 'Glitch through time with this high-tech artifact.',
        category: 'avatar_frame',
        price: 9000,
        rarity: 'mythic',
        visual: { gradient: 'linear-gradient(90deg, #06b6d4, #ffffff, #06b6d4)', backgroundSize: '300% 100%', animation: 'shimmer 1.5s infinite', padding: '4px' }
      },
      {
        slug: 'color-prismatic-flow',
        name: 'Prismatic Flow',
        description: 'Your name flows through every color of the spectrum.',
        category: 'username_color',
        price: 7500,
        rarity: 'mythic',
        visual: { type: 'gradient', gradient: 'linear-gradient(to right, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)', backgroundSize: '400% auto', animation: 'text-shimmer 4s linear infinite' }
      },
      {
        slug: 'color-shadow-flame',
        name: 'Shadow Flame',
        description: 'A dark, burning presence in every message.',
        category: 'username_color',
        price: 6500,
        rarity: 'mythic',
        visual: { type: 'gradient', gradient: 'linear-gradient(to right, #000000, #450a0a, #991b1b)', backgroundSize: '200% auto', animation: 'text-shimmer 3s ease-in-out infinite' }
      },
      {
        slug: 'color-nebula-dream',
        name: 'Nebula Dream',
        description: 'Deep space particles moving through your identity.',
        category: 'username_color',
        price: 7000,
        rarity: 'mythic',
        visual: { type: 'gradient', gradient: 'linear-gradient(to right, #1e1b4b, #4338ca, #818cf8, #1e1b4b)', backgroundSize: '300% auto', animation: 'text-shimmer 5s linear infinite' }
      },
      {
        slug: 'banner-event-horizon',
        name: 'Event Horizon',
        description: 'The edge of a black hole, where light itself cannot escape.',
        category: 'profile_banner',
        price: 15000,
        rarity: 'mythic',
        visual: { gradient: 'radial-gradient(circle at center, #000000 30%, #1e1b4b 70%, #000000 100%)', backgroundSize: '200% 200%', animation: 'gradient-shift 10s linear infinite' }
      },
      {
        slug: 'banner-heavenly-gates',
        name: 'Heavenly Gates',
        description: 'Divine light and golden clouds.',
        category: 'profile_banner',
        price: 13000,
        rarity: 'mythic',
        visual: { gradient: 'linear-gradient(to top, #fef3c7, #fde68a, #ffffff)', backgroundSize: '100% 200%', animation: 'gradient-shift 6s ease-in-out infinite' }
      },
      {
        slug: 'banner-cyber-glitch',
        name: 'Cyber Glitch 2077',
        description: 'A futuristic city undergoing a massive system failure.',
        category: 'profile_banner',
        price: 11000,
        rarity: 'mythic',
        visual: { gradient: 'linear-gradient(90deg, #000000, #06b6d4, #000000, #ec4899, #000000)', backgroundSize: '400% 100%', animation: 'shimmer 2s steps(4) infinite' }
      },
      {
        slug: 'bubble-crystal-prism',
        name: 'Crystal Prism',
        description: 'Glassy refraction for the most elegant messages.',
        category: 'chat_bubble',
        price: 6000,
        rarity: 'mythic',
        visual: { background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))', textColor: '#ffffff', borderColor: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)' }
      },
      {
        slug: 'bubble-inferno',
        name: 'Inferno Bubble',
        description: 'Messages that leave a burning impression.',
        category: 'chat_bubble',
        price: 5500,
        rarity: 'mythic',
        visual: { background: 'linear-gradient(to bottom, #7f1d1d, #b91c1c)', textColor: '#fef3c7', borderColor: '#f97316' }
      },
      {
        slug: 'badge-godlike',
        name: 'Godlike Status',
        description: 'Beyond legend. The ultimate mark of existence.',
        category: 'post_badge',
        price: 25000,
        rarity: 'mythic',
        visual: { icon: 'Zap', color: '#fde047', label: 'GOD' }
      },
      {
        slug: 'badge-community-legend',
        name: 'Community Legend',
        description: 'For those whose names will be etched in history.',
        category: 'post_badge',
        price: 15000,
        rarity: 'mythic',
        visual: { icon: 'Crown', color: '#a855f7', label: 'LEGEND' }
      },
      {
        slug: 'frame-void-reaver',
        name: 'Void Reaver',
        description: 'A terrifying frame that consumes all light around it.',
        category: 'avatar_frame',
        price: 11000,
        rarity: 'mythic',
        visual: { gradient: 'linear-gradient(to right, #000000, #1e1b4b, #000000)', backgroundSize: '200% 100%', animation: 'gradient-shift 3s ease infinite', padding: '5px' }
      },
      {
        slug: 'frame-phoenix-wing',
        name: 'Phoenix Wing',
        description: 'Rise from the ashes with this eternal flame frame.',
        category: 'avatar_frame',
        price: 14000,
        rarity: 'mythic',
        visual: { gradient: 'linear-gradient(45deg, #f97316, #ef4444, #f59e0b)', backgroundSize: '300% 300%', animation: 'pulse 1s infinite', padding: '6px' }
      },
      {
        slug: 'color-liquid-gold',
        name: 'Liquid Gold',
        description: 'Your name flows like molten 24k gold.',
        category: 'username_color',
        price: 9500,
        rarity: 'mythic',
        visual: { type: 'gradient', gradient: 'linear-gradient(to right, #f59e0b, #fef3c7, #d97706)', backgroundSize: '200% auto', animation: 'text-shimmer 2s linear infinite' }
      },
      {
        slug: 'banner-aurora-sky',
        name: 'Aurora Sky',
        description: 'A breathtaking view of the northern lights in high definition.',
        category: 'profile_banner',
        price: 12000,
        rarity: 'mythic',
        visual: { gradient: 'linear-gradient(to right, #064e3b, #0d9488, #4338ca)', backgroundSize: '200% 100%', animation: 'gradient-shift 8s linear infinite' }
      },
      {
        slug: 'bubble-neon-grid',
        name: 'Neon Grid',
        description: 'Communicate through a retro-futuristic grid system.',
        category: 'chat_bubble',
        price: 8500,
        rarity: 'mythic',
        visual: { background: 'rgba(0,0,0,0.9)', textColor: '#06b6d4', borderColor: '#06b6d4', boxShadow: '0 0 10px #06b6d4' }
      },
      {
        slug: 'badge-ultimate-champion',
        name: 'Ultimate Champion',
        description: 'The final trophy for the most elite members.',
        category: 'post_badge',
        price: 50000,
        rarity: 'mythic',
        visual: { icon: 'Trophy', color: '#f59e0b', label: 'CHAMP' }
      },
      {
        slug: 'frame-abyssal-tendrils',
        name: 'Abyssal Tendrils',
        description: 'Dark, writhing energy from the deepest parts of the ocean.',
        category: 'avatar_frame',
        price: 13500,
        rarity: 'mythic',
        visual: { gradient: 'linear-gradient(to bottom, #000000, #1e3a8a, #000000)', animation: 'pulse 3s infinite', padding: '5px' }
      },
      {
        slug: 'color-glitch-master',
        name: 'Glitch Master',
        description: 'Your name is literally breaking the simulation.',
        category: 'username_color',
        price: 8888,
        rarity: 'mythic',
        visual: { type: 'gradient', gradient: 'linear-gradient(90deg, #ff0000, #00ff00, #0000ff)', backgroundSize: '300% 100%', animation: 'shimmer 0.2s infinite steps(2)' }
      },
      {
        slug: 'banner-matrix-code',
        name: 'The Source Code',
        description: 'Falling green code. You finally see the truth.',
        category: 'profile_banner',
        price: 11500,
        rarity: 'mythic',
        visual: { gradient: 'linear-gradient(to bottom, #000000, #15803d, #000000)', backgroundSize: '100% 400%', animation: 'gradient-shift 15s linear infinite' }
      },
      {
        slug: 'bubble-holographic',
        name: 'Hologram Projection',
        description: 'A flickering blue hologram for your communications.',
        category: 'chat_bubble',
        price: 9200,
        rarity: 'mythic',
        visual: { background: 'rgba(6, 182, 212, 0.1)', textColor: '#22d3ee', borderColor: '#0891b2', animation: 'pulse 2s infinite' }
      },
      {
        slug: 'badge-immortal',
        name: 'Immortal Spirit',
        description: 'A mark that will never fade from the archives.',
        category: 'post_badge',
        price: 33333,
        rarity: 'mythic',
        visual: { icon: 'Infinity', color: '#ffffff', label: 'FOREVER' }
      },

      // ━━━ PREVIOUS ITEMS (LEGENDARY/EPIC/RARE) ━━━
      {
        slug: 'frame-neon-pulse',
        name: 'Neon Pulse',
        description: 'A vibrant, pulsing neon frame for the night owls.',
        category: 'avatar_frame',
        price: 500,
        rarity: 'rare',
        visual: { gradient: 'linear-gradient(45deg, #ff00ff, #00ffff)', animation: 'pulse 2s infinite', padding: '3px' }
      },
      {
        slug: 'frame-golden-glory',
        name: 'Golden Glory',
        description: 'Pure 24k gold finish for the elite.',
        category: 'avatar_frame',
        price: 2500,
        rarity: 'legendary',
        visual: { gradient: 'linear-gradient(45deg, #f59e0b, #fef3c7, #d97706)', backgroundSize: '200% 200%', animation: 'shimmer 3s linear infinite', padding: '4px' }
      },
      {
        slug: 'frame-void-walker',
        name: 'Void Walker',
        description: 'Step into the abyss with this dark, shifting frame.',
        category: 'avatar_frame',
        price: 5000,
        rarity: 'mythic',
        visual: { gradient: 'linear-gradient(135deg, #000000, #4c1d95, #000000)', backgroundSize: '400% 400%', animation: 'gradient-shift 5s ease infinite', padding: '5px' }
      },
      {
        slug: 'frame-emerald-aura',
        name: 'Emerald Aura',
        description: 'A soothing green aura for nature lovers.',
        category: 'avatar_frame',
        price: 400,
        rarity: 'uncommon',
        visual: { gradient: 'linear-gradient(to right, #10b981, #34d399)', padding: '2px' }
      },
      {
        slug: 'frame-frozen-edge',
        name: 'Frozen Edge',
        description: 'Stay cool with this icy blue crystalline frame.',
        category: 'avatar_frame',
        price: 1200,
        rarity: 'epic',
        visual: { gradient: 'linear-gradient(135deg, #7dd3fc, #0ea5e9, #ffffff)', animation: 'shimmer 4s infinite', padding: '3px' }
      },
      {
        slug: 'frame-crimson-tide',
        name: 'Crimson Tide',
        description: 'A dark red frame that flows like liquid fire.',
        category: 'avatar_frame',
        price: 1500,
        rarity: 'epic',
        visual: { gradient: 'linear-gradient(to bottom, #991b1b, #ef4444, #991b1b)', backgroundSize: '100% 200%', animation: 'gradient-shift 3s infinite', padding: '3px' }
      },
      {
        slug: 'color-emerald-spark',
        name: 'Emerald Spark',
        description: 'Make your name glow like a precious gem.',
        category: 'username_color',
        price: 300,
        rarity: 'uncommon',
        visual: { type: 'solid', color: '#10b981' }
      },
      {
        slug: 'color-cosmic-drift',
        name: 'Cosmic Drift',
        description: 'Your name shifts through the colors of the nebula.',
        category: 'username_color',
        price: 1500,
        rarity: 'epic',
        visual: { type: 'gradient', gradient: 'linear-gradient(to right, #6366f1, #a855f7, #ec4899)', backgroundSize: '200% auto', animation: 'text-shimmer 3s linear infinite' }
      },
      {
        slug: 'color-sunset-gold',
        name: 'Sunset Gold',
        description: 'The warm glow of the setting sun on your name.',
        category: 'username_color',
        price: 800,
        rarity: 'rare',
        visual: { type: 'gradient', gradient: 'linear-gradient(to right, #f59e0b, #ef4444)' }
      },
      {
        slug: 'banner-cyber-city',
        name: 'Cyber City',
        description: 'A futuristic cityscape at night.',
        category: 'profile_banner',
        price: 800,
        rarity: 'rare',
        visual: { gradient: 'linear-gradient(to bottom, #0f172a, #1e1b4b, #312e81)', backgroundSize: 'cover' }
      },
      {
        slug: 'banner-solar-flare',
        name: 'Solar Flare',
        description: 'The raw power of a dying star on your profile.',
        category: 'profile_banner',
        price: 3000,
        rarity: 'legendary',
        visual: { gradient: 'linear-gradient(45deg, #fbbf24, #f97316, #ef4444)', backgroundSize: '300% 300%', animation: 'gradient-shift 4s ease infinite' }
      },
      {
        slug: 'banner-lava-flow',
        name: 'Lava Flow',
        description: 'Intense heat and movement from the depths.',
        category: 'profile_banner',
        price: 2000,
        rarity: 'epic',
        visual: { gradient: 'linear-gradient(to right, #450a0a, #991b1b, #ef4444)', backgroundSize: '200% 100%', animation: 'gradient-shift 5s linear infinite' }
      },
      {
        slug: 'bubble-midnight',
        name: 'Midnight Glass',
        description: 'Sleek, semi-transparent chat bubbles.',
        category: 'chat_bubble',
        price: 400,
        rarity: 'rare',
        visual: { background: 'rgba(30, 41, 59, 0.8)', textColor: '#f8fafc', borderColor: '#334155' }
      },
      {
        slug: 'bubble-aurora',
        name: 'Aurora Borealis',
        description: 'Messages that shimmer like the northern lights.',
        category: 'chat_bubble',
        price: 2000,
        rarity: 'epic',
        visual: { background: 'linear-gradient(135deg, #2dd4bf, #3b82f6, #8b5cf6)', textColor: '#ffffff' }
      },
      {
        slug: 'bubble-royal-gold',
        name: 'Royal Gold',
        description: 'Chat like royalty with this golden theme.',
        category: 'chat_bubble',
        price: 3500,
        rarity: 'legendary',
        visual: { background: 'linear-gradient(45deg, #f59e0b, #fbbf24)', textColor: '#451a03' }
      },
      {
        slug: 'badge-verified-pro',
        name: 'Verified Pro',
        description: 'The ultimate mark of authority.',
        category: 'post_badge',
        price: 5000,
        rarity: 'mythic',
        visual: { icon: 'CheckCircle2', color: '#3b82f6', label: 'PRO' }
      },
      {
        slug: 'badge-bug-hunter',
        name: 'Bug Hunter',
        description: 'Awarded for finding and reporting bugs.',
        category: 'post_badge',
        price: 1000,
        rarity: 'rare',
        visual: { icon: 'Bug', color: '#10b981', label: 'BUG' }
      },
      {
        slug: 'badge-top-contributor',
        name: 'Top Contributor',
        description: 'For those who help the community grow.',
        category: 'post_badge',
        price: 2500,
        rarity: 'epic',
        visual: { icon: 'Star', color: '#f59e0b', label: 'STAR' }
      },
      {
        slug: 'badge-early-bird',
        name: 'Early Bird',
        description: 'For the first pioneers of CampusX.',
        category: 'post_badge',
        price: 500,
        rarity: 'uncommon',
        visual: { icon: 'Bird', color: '#0ea5e9', label: 'EARLY' }
      }
    ]

    for (const item of seedItems) {
      await ShopItem.findOneAndUpdate({ slug: item.slug }, item, { upsert: true })
    }

    // Fetch active shop items

    // Fetch active shop items
    const items = await ShopItem.find({ isActive: true })
      .sort({ rarity: -1, price: 1 })
      .lean()

    // Fetch user wallet to check ownership
    const wallet = await Wallet.findOne({ userId: decoded.userId }).select('inventory').lean()
    const ownedItemIds = new Set(wallet?.inventory?.map(i => i.itemId.toString()) || [])

    const itemsWithOwnership = items.map(item => ({
      ...item,
      isOwned: ownedItemIds.has(item._id.toString())
    }))

    return NextResponse.json({ items: itemsWithOwnership })
  } catch (error) {
    console.error('[API Shop] Error:', error.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
