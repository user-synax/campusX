import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth-edge'
import connectDB from '@/lib/db'
import ShopItem from '@/models/ShopItem'
import Wallet from '@/models/Wallet'

export async function GET(request) {
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
      },

      // ━━━ STUDENT & CAMPUS NICHE ━━━
      {
        slug: 'frame-exam-survivor',
        name: 'Exam Survivor',
        description: 'You fought the papers and won. Barely.',
        category: 'avatar_frame',
        price: 600,
        rarity: 'rare',
        visual: { gradient: 'repeating-linear-gradient(45deg, #fde047, #fde047 10px, #000 10px, #000 20px)', padding: '3px' }
      },
      {
        slug: 'badge-coffee-addict',
        name: 'Coffee Addict',
        description: 'Fueled by caffeine and desperation.',
        category: 'post_badge',
        price: 450,
        rarity: 'uncommon',
        visual: { icon: 'Coffee', color: '#78350f', label: 'CAFFEINE' }
      },
      {
        slug: 'color-all-nighter',
        name: 'All Nighter',
        description: 'The color of the sky at 4 AM when you realize you forgot the intro.',
        category: 'username_color',
        price: 700,
        rarity: 'rare',
        visual: { type: 'gradient', gradient: 'linear-gradient(to right, #1e1b4b, #312e81)', animation: 'text-shimmer 4s infinite' }
      },
      {
        slug: 'banner-study-lofi',
        name: 'Study Lo-Fi',
        description: 'Beats to relax/study/cry to.',
        category: 'profile_banner',
        price: 1200,
        rarity: 'epic',
        visual: { gradient: 'linear-gradient(to bottom, #4c1d95, #1e1b4b)', backgroundSize: 'cover' }
      },

      // ━━━ MEME & INTERNET CULTURE ━━━
      {
        slug: 'frame-chad-aura',
        name: 'GigaChad Aura',
        description: 'Average CampusX enjoyer frame.',
        category: 'avatar_frame',
        price: 3000,
        rarity: 'legendary',
        visual: { gradient: 'linear-gradient(45deg, #94a3b8, #f8fafc, #94a3b8)', animation: 'shimmer 2s infinite', padding: '4px' }
      },
      {
        slug: 'badge-meme-lord',
        name: 'Meme Lord',
        description: 'Your humor is beyond mortal comprehension.',
        category: 'post_badge',
        price: 2000,
        rarity: 'epic',
        visual: { icon: 'Laugh', color: '#ec4899', label: 'MEME' }
      },
      {
        slug: 'color-stonks-green',
        name: 'Stonks Only Go Up',
        description: 'Financial advice not included.',
        category: 'username_color',
        price: 1200,
        rarity: 'epic',
        visual: { type: 'gradient', gradient: 'linear-gradient(to right, #22c55e, #4ade80, #22c55e)', backgroundSize: '200% auto', animation: 'text-shimmer 2s linear infinite' }
      },
      {
        slug: 'bubble-comic-relief',
        name: 'Comic Relief',
        description: 'Making every message a joke.',
        category: 'chat_bubble',
        price: 800,
        rarity: 'rare',
        visual: { background: '#fef08a', textColor: '#854d0e', borderColor: '#eab308' }
      },

      // ━━━ NATURE & RELAXATION ━━━
      {
        slug: 'frame-sakura-drift',
        name: 'Sakura Drift',
        description: 'Spring has arrived on your profile.',
        category: 'avatar_frame',
        price: 1800,
        rarity: 'epic',
        visual: { gradient: 'linear-gradient(45deg, #fce7f3, #fbcfe8, #fce7f3)', animation: 'pulse 3s infinite', padding: '3px' }
      },
      {
        slug: 'color-ocean-breeze',
        name: 'Ocean Breeze',
        description: 'Cool, calm, and collected.',
        category: 'username_color',
        price: 400,
        rarity: 'uncommon',
        visual: { type: 'solid', color: '#06b6d4' }
      },
      {
        slug: 'banner-zen-garden',
        name: 'Zen Garden',
        description: 'Find your inner peace amidst the social chaos.',
        category: 'profile_banner',
        price: 1500,
        rarity: 'epic',
        visual: { gradient: 'radial-gradient(circle, #ecfdf5, #d1fae5)', backgroundSize: '200% 200%', animation: 'gradient-shift 8s ease infinite' }
      },

      // ━━━ TECH & CYBERPUNK ━━━
      {
        slug: 'frame-matrix-glitch',
        name: 'Matrix Glitch',
        description: 'You see the code behind the campus.',
        category: 'avatar_frame',
        price: 2200,
        rarity: 'epic',
        visual: { gradient: 'linear-gradient(to bottom, #15803d, #000, #15803d)', backgroundSize: '100% 200%', animation: 'gradient-shift 2s steps(10) infinite', padding: '3px' }
      },
      {
        slug: 'badge-bug-squasher',
        name: 'Bug Squasher',
        description: 'Keeping the platform clean, one line at a time.',
        category: 'post_badge',
        price: 1200,
        rarity: 'rare',
        visual: { icon: 'ShieldCheck', color: '#06b6d4', label: 'CLEAN' }
      },
      {
        slug: 'color-hacker-green',
        name: 'Terminal Green',
        description: 'Wake up, Neo.',
        category: 'username_color',
        price: 900,
        rarity: 'rare',
        visual: { type: 'solid', color: '#22c55e' }
      },
      {
        slug: 'banner-cyber-neon',
        name: 'Neon District',
        description: 'Bright lights, big campus.',
        category: 'profile_banner',
        price: 2500,
        rarity: 'legendary',
        visual: { gradient: 'linear-gradient(90deg, #ec4899, #06b6d4)', backgroundSize: '200% 100%', animation: 'gradient-shift 5s infinite' }
      },

      // ━━━ GAMING & PIXEL ART ━━━
      {
        slug: 'frame-pixel-heart',
        name: 'Pixel Heart',
        description: 'Extra life for your profile.',
        category: 'avatar_frame',
        price: 1500,
        rarity: 'rare',
        visual: { gradient: 'linear-gradient(45deg, #ef4444, #fca5a5)', padding: '4px' }
      },
      {
        slug: 'badge-pro-gamer',
        name: 'Pro Gamer',
        description: 'High scores and higher standards.',
        category: 'post_badge',
        price: 3000,
        rarity: 'legendary',
        visual: { icon: 'Gamepad2', color: '#8b5cf6', label: 'ELITE' }
      },
      {
        slug: 'color-mana-surge',
        name: 'Mana Surge',
        description: 'Overflowing with magical energy.',
        category: 'username_color',
        price: 1800,
        rarity: 'epic',
        visual: { type: 'gradient', gradient: 'linear-gradient(to right, #3b82f6, #60a5fa, #3b82f6)', animation: 'text-shimmer 3s infinite' }
      },

      // ━━━ MORE MEMES ━━━
      {
        slug: 'frame-diamond-hands',
        name: 'Diamond Hands',
        description: 'HODL your reputation.',
        category: 'avatar_frame',
        price: 4500,
        rarity: 'mythic',
        visual: { gradient: 'linear-gradient(135deg, #e0f2fe, #7dd3fc, #e0f2fe)', animation: 'shimmer 1.5s infinite', padding: '5px' }
      },
      {
        slug: 'badge-doge-vibe',
        name: 'Much Wow',
        description: 'Very coin. So social. Many friends.',
        category: 'post_badge',
        price: 1500,
        rarity: 'rare',
        visual: { icon: 'Smile', color: '#f59e0b', label: 'DOGE' }
      },
      {
        slug: 'color-void-glitch',
        name: 'Void Glitch',
        description: '̷E̷r̷r̷o̷r̷:̷ ̷N̷a̷m̷e̷ ̷n̷o̷t̷ ̷f̷o̷u̷n̷d̷',
        category: 'username_color',
        price: 5555,
        rarity: 'mythic',
        visual: { type: 'gradient', gradient: 'linear-gradient(90deg, #000, #333, #000)', backgroundSize: '300% 100%', animation: 'shimmer 0.5s infinite' }
      },

      // ━━━ MEGA COLLECTION (50+ NEW ITEMS) ━━━

      // --- Avatar Frames ---
      {
        slug: 'frame-ghost-whisper',
        name: 'Ghost Whisper',
        description: 'A spectral, semi-transparent frame that haunts your profile.',
        category: 'avatar_frame',
        price: 12000,
        rarity: 'mythic',
        visual: { gradient: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(200,200,255,0.2))', animation: 'pulse 4s infinite', padding: '4px' }
      },
      {
        slug: 'frame-steampunk-gear',
        name: 'Steampunk Gear',
        description: 'Clockwork precision for the industrially minded.',
        category: 'avatar_frame',
        price: 4000,
        rarity: 'legendary',
        visual: { gradient: 'linear-gradient(45deg, #78350f, #d97706, #78350f)', padding: '3px' }
      },
      {
        slug: 'frame-cyber-ring',
        name: 'Cyber Ring',
        description: 'A glowing circuit board encircling your identity.',
        category: 'avatar_frame',
        price: 2500,
        rarity: 'epic',
        visual: { gradient: 'linear-gradient(to right, #06b6d4, #22d3ee)', padding: '2px' }
      },
      {
        slug: 'frame-galactic-orbit',
        name: 'Galactic Orbit',
        description: 'Planets and stars rotating around you.',
        category: 'avatar_frame',
        price: 15000,
        rarity: 'mythic',
        visual: { gradient: 'radial-gradient(circle, #1e1b4b, #4338ca, #000)', backgroundSize: '200% 200%', animation: 'gradient-shift 5s infinite', padding: '5px' }
      },
      {
        slug: 'frame-neon-zebra',
        name: 'Neon Zebra',
        description: 'Wild stripes with a high-voltage glow.',
        category: 'avatar_frame',
        price: 1200,
        rarity: 'rare',
        visual: { gradient: 'repeating-linear-gradient(45deg, #000, #000 10px, #ff00ff 10px, #ff00ff 20px)', padding: '3px' }
      },
      {
        slug: 'frame-prism-shatter',
        name: 'Prism Shatter',
        description: 'Fractured light in every direction.',
        category: 'avatar_frame',
        price: 2800,
        rarity: 'epic',
        visual: { gradient: 'linear-gradient(135deg, #f472b6, #60a5fa, #fbbf24)', animation: 'shimmer 3s infinite', padding: '3px' }
      },
      {
        slug: 'frame-lava-magma',
        name: 'Lava Magma',
        description: 'Molten rock flowing around your profile.',
        category: 'avatar_frame',
        price: 4500,
        rarity: 'legendary',
        visual: { gradient: 'linear-gradient(to bottom, #7f1d1d, #f97316)', animation: 'pulse 2s infinite', padding: '4px' }
      },
      {
        slug: 'frame-bubble-pop',
        name: 'Bubble Pop',
        description: 'Light, airy, and fun.',
        category: 'avatar_frame',
        price: 500,
        rarity: 'uncommon',
        visual: { gradient: 'radial-gradient(circle, #bae6fd, #7dd3fc)', padding: '2px' }
      },
      {
        slug: 'frame-glitch-vhs',
        name: 'VHS Glitch',
        description: 'Retro distortion from the 80s.',
        category: 'avatar_frame',
        price: 1500,
        rarity: 'rare',
        visual: { gradient: 'linear-gradient(90deg, #ff0000, #00ff00, #0000ff)', animation: 'shimmer 0.5s steps(3) infinite', padding: '3px' }
      },
      {
        slug: 'frame-royal-thorns',
        name: 'Royal Thorns',
        description: 'Beauty with a dangerous edge.',
        category: 'avatar_frame',
        price: 11000,
        rarity: 'mythic',
        visual: { gradient: 'linear-gradient(45deg, #4c1d95, #000, #4c1d95)', padding: '5px' }
      },

      // --- Username Colors ---
      {
        slug: 'color-plasma-purple',
        name: 'Plasma Purple',
        description: 'High-energy ionic flow.',
        category: 'username_color',
        price: 2200,
        rarity: 'epic',
        visual: { type: 'gradient', gradient: 'linear-gradient(to right, #7e22ce, #c026d3)', animation: 'text-shimmer 3s infinite' }
      },
      {
        slug: 'color-deep-ocean',
        name: 'Deep Ocean',
        description: 'The mysteries of the midnight zone.',
        category: 'username_color',
        price: 1000,
        rarity: 'rare',
        visual: { type: 'solid', color: '#1e3a8a' }
      },
      {
        slug: 'color-fire-storm',
        name: 'Fire Storm',
        description: 'Blazing heat in every letter.',
        category: 'username_color',
        price: 3500,
        rarity: 'legendary',
        visual: { type: 'gradient', gradient: 'linear-gradient(to right, #b91c1c, #f97316)', animation: 'text-shimmer 2s infinite' }
      },
      {
        slug: 'color-matrix-binary',
        name: 'Binary Stream',
        description: 'You speak the language of the machines.',
        category: 'username_color',
        price: 8000,
        rarity: 'mythic',
        visual: { type: 'gradient', gradient: 'linear-gradient(to right, #15803d, #22c55e, #15803d)', backgroundSize: '200% auto', animation: 'text-shimmer 1s steps(5) infinite' }
      },
      {
        slug: 'color-candy-floss',
        name: 'Candy Floss',
        description: 'Sweet and sugary.',
        category: 'username_color',
        price: 600,
        rarity: 'uncommon',
        visual: { type: 'solid', color: '#f472b6' }
      },
      {
        slug: 'color-liquid-silver',
        name: 'Liquid Silver',
        description: 'Polished and professional.',
        category: 'username_color',
        price: 2000,
        rarity: 'epic',
        visual: { type: 'gradient', gradient: 'linear-gradient(to right, #94a3b8, #f8fafc, #94a3b8)', animation: 'text-shimmer 4s infinite' }
      },
      {
        slug: 'color-neon-lime',
        name: 'Neon Lime',
        description: 'Impossible to miss.',
        category: 'username_color',
        price: 800,
        rarity: 'rare',
        visual: { type: 'solid', color: '#84cc16' }
      },
      {
        slug: 'color-blood-moon',
        name: 'Blood Moon',
        description: 'An ominous crimson glow.',
        category: 'username_color',
        price: 4000,
        rarity: 'legendary',
        visual: { type: 'gradient', gradient: 'linear-gradient(to right, #450a0a, #991b1b)', animation: 'text-shimmer 5s infinite' }
      },
      {
        slug: 'color-void-purple',
        name: 'Void Purple',
        description: 'The color of nothingness.',
        category: 'username_color',
        price: 9000,
        rarity: 'mythic',
        visual: { type: 'gradient', gradient: 'linear-gradient(to right, #000, #581c87, #000)', backgroundSize: '200% auto', animation: 'text-shimmer 3s infinite' }
      },
      {
        slug: 'color-arctic-frost',
        name: 'Arctic Frost',
        description: 'Frozen solid.',
        category: 'username_color',
        price: 1800,
        rarity: 'epic',
        visual: { type: 'gradient', gradient: 'linear-gradient(to right, #0ea5e9, #bae6fd)', animation: 'text-shimmer 4s infinite' }
      },

      // --- Profile Banners ---
      {
        slug: 'banner-underwater-reef',
        name: 'Underwater Reef',
        description: 'Life beneath the waves.',
        category: 'profile_banner',
        price: 1500,
        rarity: 'rare',
        visual: { gradient: 'linear-gradient(to bottom, #0ea5e9, #1e40af)', backgroundSize: 'cover' }
      },
      {
        slug: 'banner-mountain-peak',
        name: 'Mountain Peak',
        description: 'Reach the summit.',
        category: 'profile_banner',
        price: 800,
        rarity: 'uncommon',
        visual: { gradient: 'linear-gradient(to top, #1e293b, #f8fafc)', backgroundSize: 'cover' }
      },
      {
        slug: 'banner-abstract-waves',
        name: 'Abstract Waves',
        description: 'Flowing lines and shapes.',
        category: 'profile_banner',
        price: 2000,
        rarity: 'epic',
        visual: { gradient: 'linear-gradient(45deg, #6366f1, #ec4899)', animation: 'gradient-shift 10s infinite' }
      },
      {
        slug: 'banner-synthwave-sun',
        name: 'Synthwave Sun',
        description: '80s nostalgia.',
        category: 'profile_banner',
        price: 3500,
        rarity: 'legendary',
        visual: { gradient: 'linear-gradient(to bottom, #f43f5e, #fbbf24)', backgroundSize: 'cover' }
      },
      {
        slug: 'banner-deep-space',
        name: 'Deep Space',
        description: 'Beyond the known universe.',
        category: 'profile_banner',
        price: 12000,
        rarity: 'mythic',
        visual: { gradient: 'radial-gradient(circle at center, #020617 0%, #000 100%)', animation: 'pulse 8s infinite' }
      },
      {
        slug: 'banner-cherry-blossom',
        name: 'Cherry Blossom',
        description: 'Falling petals in the wind.',
        category: 'profile_banner',
        price: 2200,
        rarity: 'epic',
        visual: { gradient: 'linear-gradient(to right, #fce7f3, #fbcfe8)', backgroundSize: 'cover' }
      },
      {
        slug: 'banner-pixel-city',
        name: 'Pixel City',
        description: 'A 16-bit metropolis.',
        category: 'profile_banner',
        price: 1200,
        rarity: 'rare',
        visual: { gradient: 'linear-gradient(to bottom, #1e1b4b, #312e81)', backgroundSize: 'cover' }
      },
      {
        slug: 'banner-burning-sky',
        name: 'Burning Sky',
        description: 'A world on fire.',
        category: 'profile_banner',
        price: 4000,
        rarity: 'legendary',
        visual: { gradient: 'linear-gradient(to top, #7f1d1d, #f97316)', animation: 'gradient-shift 5s infinite' }
      },
      {
        slug: 'banner-frozen-lake',
        name: 'Frozen Lake',
        description: 'Quiet and cold.',
        category: 'profile_banner',
        price: 1000,
        rarity: 'rare',
        visual: { gradient: 'linear-gradient(to right, #bae6fd, #0ea5e9)', backgroundSize: 'cover' }
      },
      {
        slug: 'banner-cyber-corridor',
        name: 'Cyber Corridor',
        description: 'Running through the grid.',
        category: 'profile_banner',
        price: 10000,
        rarity: 'mythic',
        visual: { gradient: 'linear-gradient(90deg, #000, #06b6d4, #000)', backgroundSize: '200% 100%', animation: 'shimmer 3s linear infinite' }
      },

      // --- Chat Bubbles ---
      {
        slug: 'bubble-royal-velvet',
        name: 'Royal Velvet',
        description: 'Deep purple elegance.',
        category: 'chat_bubble',
        price: 3000,
        rarity: 'legendary',
        visual: { background: '#4c1d95', textColor: '#f5f3ff', borderColor: '#6d28d9' }
      },
      {
        slug: 'bubble-glass-frosted',
        name: 'Frosted Glass',
        description: 'Modern blur effect.',
        category: 'chat_bubble',
        price: 2000,
        rarity: 'epic',
        visual: { background: 'rgba(255,255,255,0.1)', textColor: '#fff', borderColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)' }
      },
      {
        slug: 'bubble-neon-glow',
        name: 'Neon Glow',
        description: 'Bright and buzzing.',
        category: 'chat_bubble',
        price: 1200,
        rarity: 'rare',
        visual: { background: '#000', textColor: '#22d3ee', borderColor: '#0891b2' }
      },
      {
        slug: 'bubble-paper-sketch',
        name: 'Paper Sketch',
        description: 'Hand-drawn feel.',
        category: 'chat_bubble',
        price: 400,
        rarity: 'uncommon',
        visual: { background: '#fff7ed', textColor: '#431407', borderColor: '#fed7aa' }
      },
      {
        slug: 'bubble-retro-pixel',
        name: 'Retro Pixel',
        description: 'Old school vibes.',
        category: 'chat_bubble',
        price: 1000,
        rarity: 'rare',
        visual: { background: '#1f2937', textColor: '#4ade80', borderColor: '#111827' }
      },
      {
        slug: 'bubble-gradient-sky',
        name: 'Gradient Sky',
        description: 'Morning colors.',
        category: 'chat_bubble',
        price: 1800,
        rarity: 'epic',
        visual: { background: 'linear-gradient(to right, #0ea5e9, #6366f1)', textColor: '#fff' }
      },
      {
        slug: 'bubble-lava-flow-2',
        name: 'Magma Flow',
        description: 'Intense messages.',
        category: 'chat_bubble',
        price: 3500,
        rarity: 'legendary',
        visual: { background: 'linear-gradient(to bottom, #b91c1c, #f97316)', textColor: '#fff' }
      },
      {
        slug: 'bubble-void-abyss-2',
        name: 'Void Abyss',
        description: 'Messages from the dark.',
        category: 'chat_bubble',
        price: 7000,
        rarity: 'mythic',
        visual: { background: '#000', textColor: '#a855f7', borderColor: '#581c87' }
      },
      {
        slug: 'bubble-gold-leaf',
        name: 'Gold Leaf',
        description: 'Luxurious chatting.',
        category: 'chat_bubble',
        price: 4500,
        rarity: 'legendary',
        visual: { background: 'linear-gradient(45deg, #f59e0b, #fef3c7)', textColor: '#451a03' }
      },
      {
        slug: 'bubble-electric-blue',
        name: 'Electric Blue',
        description: 'Shockingly clear.',
        category: 'chat_bubble',
        price: 900,
        rarity: 'rare',
        visual: { background: '#1e40af', textColor: '#fff', borderColor: '#3b82f6' }
      },

      // --- Post Badges ---
      {
        slug: 'badge-top-tier',
        name: 'Top Tier',
        description: 'Only the best.',
        category: 'post_badge',
        price: 5000,
        rarity: 'legendary',
        visual: { icon: 'Award', color: '#f59e0b', label: 'TOP' }
      },
      {
        slug: 'badge-night-owl-2',
        name: 'Night Owl',
        description: 'Active after dark.',
        category: 'post_badge',
        price: 1200,
        rarity: 'rare',
        visual: { icon: 'Moon', color: '#6366f1', label: 'NIGHT' }
      },
      {
        slug: 'badge-book-worm',
        name: 'Book Worm',
        description: 'Always learning.',
        category: 'post_badge',
        price: 600,
        rarity: 'uncommon',
        visual: { icon: 'BookOpen', color: '#10b981', label: 'STUDY' }
      },
      {
        slug: 'badge-social-butterfly',
        name: 'Social Butterfly',
        description: 'Friends with everyone.',
        category: 'post_badge',
        price: 2500,
        rarity: 'epic',
        visual: { icon: 'Users', color: '#ec4899', label: 'SOCIAL' }
      },
      {
        slug: 'badge-code-ninja',
        name: 'Code Ninja',
        description: 'Master of the syntax.',
        category: 'post_badge',
        price: 4000,
        rarity: 'legendary',
        visual: { icon: 'Terminal', color: '#22c55e', label: 'CODE' }
      },
      {
        slug: 'badge-pixel-master',
        name: 'Pixel Master',
        description: 'Creative soul.',
        category: 'post_badge',
        price: 1500,
        rarity: 'rare',
        visual: { icon: 'Palette', color: '#f43f5e', label: 'ART' }
      },
      {
        slug: 'badge-space-explorer',
        name: 'Space Explorer',
        description: 'Aiming for the stars.',
        category: 'post_badge',
        price: 3000,
        rarity: 'epic',
        visual: { icon: 'Rocket', color: '#0ea5e9', label: 'SPACE' }
      },
      {
        slug: 'badge-heart-breaker',
        name: 'Heart Breaker',
        description: 'Too cool for school.',
        category: 'post_badge',
        price: 1000,
        rarity: 'rare',
        visual: { icon: 'Heart', color: '#ef4444', label: 'HEART' }
      },
      {
        slug: 'badge-crown-jewel',
        name: 'Crown Jewel',
        description: 'The center of attention.',
        category: 'post_badge',
        price: 15000,
        rarity: 'mythic',
        visual: { icon: 'Gem', color: '#3b82f6', label: 'GEM' }
      },

      // ━━━ PREMIUM CUSTOM STYLED BANNERS (NO GIFS) ━━━
      {
        slug: 'banner-lofi-night',
        name: 'Midnight Study',
        description: 'Deep indigo and violet tones for late night productivity.',
        category: 'profile_banner',
        price: 5000,
        rarity: 'epic',
        visual: { 
          gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 10s ease infinite'
        }
      },
      {
        slug: 'banner-cyber-grid-css',
        name: 'Neon Grid 3.0',
        description: 'A pure CSS digital grid with cyan and magenta accents.',
        category: 'profile_banner',
        price: 8000,
        rarity: 'legendary',
        visual: { 
          gradient: 'linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
          backgroundColor: '#000',
          backgroundSize: '20px 20px',
          borderBottom: '2px solid #06b6d4',
          boxShadow: 'inset 0 0 50px rgba(6, 182, 212, 0.2)'
        }
      },
      {
        slug: 'banner-sunset-waves',
        name: 'Solar Tide',
        description: 'Shifting orange and pink gradients like a permanent sunset.',
        category: 'profile_banner',
        price: 6500,
        rarity: 'epic',
        visual: { 
          gradient: 'linear-gradient(45deg, #f59e0b, #ec4899, #8b5cf6)',
          backgroundSize: '300% 300%',
          animation: 'gradient-shift 8s linear infinite'
        }
      },
      {
        slug: 'banner-matrix-css',
        name: 'The Grid',
        description: 'Digital rain effect using pure CSS gradients.',
        category: 'profile_banner',
        price: 12000,
        rarity: 'mythic',
        visual: { 
          gradient: 'linear-gradient(rgba(21, 128, 61, 0.2) 50%, transparent 50%)',
          backgroundColor: '#050505',
          backgroundSize: '100% 4px',
          animation: 'banner-pulse 2s steps(4) infinite'
        }
      },
      {
        slug: 'banner-pearl-essence',
        name: 'Iridescent Pearl',
        description: 'A soft, shimmering white and pastel gradient.',
        category: 'profile_banner',
        price: 4500,
        rarity: 'rare',
        visual: { 
          gradient: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
          backgroundSize: '200% 200%',
          animation: 'shimmer 5s ease infinite'
        }
      },
      {
        slug: 'banner-void-star',
        name: 'Event Horizon',
        description: 'A deep dark void with a central glowing core.',
        category: 'profile_banner',
        price: 15000,
        rarity: 'mythic',
        visual: { 
          gradient: 'radial-gradient(circle at center, #4c1d95 0%, #000 70%)',
          animation: 'pulse 4s ease-in-out infinite'
        }
      },
      {
        slug: 'banner-aurora-css',
        name: 'CSS Aurora',
        description: 'Northern lights simulated with moving CSS blobs.',
        category: 'profile_banner',
        price: 11000,
        rarity: 'legendary',
        visual: { 
          gradient: 'linear-gradient(to right, #064e3b, #0d9488, #4338ca)',
          backgroundSize: '400% 400%',
          animation: 'gradient-shift 15s ease infinite'
        }
      },
      {
        slug: 'banner-gold-dust',
        name: 'Midas Touch',
        description: 'Glittering gold particles across a black canvas.',
        category: 'profile_banner',
        price: 9000,
        rarity: 'legendary',
        visual: { 
          gradient: 'radial-gradient(#f59e0b 1px, transparent 1px)',
          backgroundColor: '#000',
          backgroundSize: '15px 15px',
          animation: 'shimmer 2s infinite'
        }
      },
      {
        slug: 'banner-candy-dream',
        name: 'Sugar Rush',
        description: 'Bright, energetic pink and cyan patterns.',
        category: 'profile_banner',
        price: 3500,
        rarity: 'rare',
        visual: { 
          gradient: 'repeating-linear-gradient(45deg, #f472b6, #f472b6 20px, #22d3ee 20px, #22d3ee 40px)',
          opacity: 0.8
        }
      },
      {
        slug: 'banner-obsidian-flow',
        name: 'Volcanic Glass',
        description: 'Dark, reflective surfaces with subtle movement.',
        category: 'profile_banner',
        price: 7000,
        rarity: 'epic',
        visual: { 
          gradient: 'linear-gradient(to bottom, #0f172a, #020617)',
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)'
        }
      },
      {
        slug: 'banner-cyber-circuit',
        name: 'Logic Board',
        description: 'A futuristic circuit board pattern with pulsing nodes.',
        category: 'profile_banner',
        price: 13000,
        rarity: 'mythic',
        visual: { 
          gradient: 'linear-gradient(90deg, rgba(34, 197, 94, 0.05) 1px, transparent 1px), linear-gradient(rgba(34, 197, 94, 0.05) 1px, transparent 1px)',
          backgroundColor: '#050505',
          backgroundSize: '40px 40px',
          borderBottom: '3px solid #22c55e',
          boxShadow: 'inset 0 0 80px rgba(34, 197, 94, 0.1)',
          animation: 'pulse 3s infinite'
        }
      },
      {
        slug: 'banner-stardust-cosmos',
        name: 'Stardust Cosmos',
        description: 'Infinite space filled with shimmering stars.',
        category: 'profile_banner',
        price: 10000,
        rarity: 'legendary',
        visual: { 
          gradient: 'radial-gradient(white 1px, transparent 1px), radial-gradient(white 1px, transparent 1px)',
          backgroundColor: '#000814',
          backgroundSize: '50px 50px, 100px 100px',
          backgroundPosition: '0 0, 25px 25px',
          animation: 'shimmer 4s infinite'
        }
      },
      {
        slug: 'banner-holographic-css',
        name: 'Holo-Prism',
        description: 'A shifting holographic surface with rainbow refractions.',
        category: 'profile_banner',
        price: 14000,
        rarity: 'mythic',
        visual: { 
          gradient: 'linear-gradient(135deg, #ff00ff, #00ffff, #ffff00, #ff00ff)',
          backgroundSize: '400% 400%',
          animation: 'gradient-shift 5s linear infinite',
          opacity: 0.6
        }
      },
      {
        slug: 'banner-carbon-fiber-css',
        name: 'Carbon Elite',
        description: 'Premium carbon fiber texture for a sleek look.',
        category: 'profile_banner',
        price: 5500,
        rarity: 'epic',
        visual: { 
          gradient: 'linear-gradient(45deg, #111 25%, transparent 25%), linear-gradient(-45deg, #111 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #111 75%), linear-gradient(-45deg, transparent 75%, #111 75%)',
          backgroundColor: '#1a1a1a',
          backgroundSize: '10px 10px'
        }
      },
      {
        slug: 'banner-ocean-depths-css',
        name: 'Deep Sea Current',
        description: 'Flowing blue gradients simulating ocean depths.',
        category: 'profile_banner',
        price: 6000,
        rarity: 'epic',
        visual: { 
          gradient: 'linear-gradient(to bottom, #1e3a8a, #172554)',
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.4)',
          animation: 'pulse 5s infinite'
        }
      },

      {
        slug: 'cosmic-profile',
        name: 'Cosmic Profile',
        description: "Transforms your entire profile with a deep-space nebula and twinkling animated stars.",
        category: 'profile_theme',
        price: 1800,
        rarity: 'legendary',
        visual: { icon: 'Sparkles', color: '#a855f7', emoji: '🌌' }
      },
      {
        slug: 'glitch-username',
        name: 'Glitch Username',
        description: 'Applies a glitch animation to the username.',
        category: 'username_color',
        price: 500,
        rarity: 'epic',
        visual: {
          type: 'animated-gradient',
          gradient: 'linear-gradient(90deg, #ff0000, #00ff00, #0000ff)',
          backgroundSize: '300% 100%',
          animation: 'shimmer 0.2s infinite steps(2)'
        }
      },
      {
        slug: 'holographic-badge',
        name: 'Holographic Badge',
        description: 'A stunning, color-shifting holographic badge.',
        category: 'post_badge',
        price: 1500,
        rarity: 'mythic',
        visual: { icon: 'Shield', color: '#22d3ee', label: 'HOLO' }
      },
      {
        slug: 'spotlight-entry',
        name: 'Spotlight Entry',
        description: "Your messages arrive with a dramatic glowing spotlight pulse, making every entry stand out.",
        category: 'entry_effect',
        price: 750,
        rarity: 'rare',
        visual: { icon: 'Zap', color: '#f59e0b', emoji: '🔦' }
      },
      {
        slug: 'neon-glow-frame',
        name: 'Neon Glow Frame',
        description: "A pulsating neon frame around the user's avatar.",
        category: 'avatar_frame',
        price: 250,
        rarity: 'epic',
        visual: {
          gradient: 'linear-gradient(45deg, #ff00ff, #00ffff, #ff00ff)',
          backgroundSize: '300% 300%',
          animation: 'pulse 2s infinite',
          padding: '3px'
        }
      },
      {
        slug: 'golden-laurel-frame',
        name: 'Golden Laurel Frame',
        description: 'An animated golden laurel wreath around the avatar.',
        category: 'avatar_frame',
        price: 500,
        rarity: 'legendary',
        visual: {
          gradient: 'linear-gradient(45deg, #f59e0b, #fef3c7, #d97706)',
          backgroundSize: '200% 200%',
          animation: 'shimmer 3s linear infinite',
          padding: '4px'
        }
      },
      {
        slug: 'rainbow-wave-username',
        name: 'Rainbow Wave Username',
        description: 'A smooth, flowing rainbow animation on the username.',
        category: 'username_color',
        price: 1000,
        rarity: 'legendary',
        visual: {
          type: 'animated-gradient',
          gradient: 'linear-gradient(to right, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)',
          backgroundSize: '400% auto',
          animation: 'text-shimmer 4s linear infinite'
        }
      },
      {
        slug: 'fire-username',
        name: 'Fire Username',
        description: 'Animated flames that appear on the username text.',
        category: 'username_color',
        price: 500,
        rarity: 'epic',
        visual: {
          type: 'animated-gradient',
          gradient: 'linear-gradient(to right, #7f1d1d, #ef4444, #f97316)',
          backgroundSize: '200% auto',
          animation: 'text-shimmer 2s linear infinite'
        }
      },
      {
        slug: 'waterfall-banner',
        name: 'Waterfall Banner',
        description: 'A looping waterfall vibe for the profile banner.',
        category: 'profile_banner',
        price: 1800,
        rarity: 'legendary',
        visual: {
          gradient: 'linear-gradient(to bottom, #0ea5e9, #1e3a8a)',
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 8s ease infinite'
        }
      },
      {
        slug: 'city-at-night-banner',
        name: 'City at Night Banner',
        description: 'A city skyline with twinkling night lights.',
        category: 'profile_banner',
        price: 750,
        rarity: 'epic',
        visual: {
          gradient: 'linear-gradient(to bottom, #0f172a, #1e1b4b, #0f172a)',
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 10s ease infinite'
        }
      },
      {
        slug: 'comic-book-bubble',
        name: 'Comic Book Bubble',
        description: 'A chat bubble styled like one from a comic book.',
        category: 'chat_bubble',
        price: 300,
        rarity: 'rare',
        visual: { background: '#fef08a', textColor: '#854d0e', borderColor: '#eab308' }
      },
      {
        slug: 'galaxy-bubble',
        name: 'Galaxy Bubble',
        description: 'A chat bubble with a swirling galaxy animation inside.',
        category: 'chat_bubble',
        price: 600,
        rarity: 'epic',
        visual: {
          background: 'linear-gradient(135deg, #1e1b4b, #4338ca, #a855f7)',
          textColor: '#ffffff'
        }
      },
      {
        slug: 'retro-arcade-theme',
        name: 'Retro Arcade Theme',
        description: 'Immerse your profile in 8-bit nostalgia with scanlines and a glowing digital grid background.',
        category: 'profile_theme',
        price: 900,
        rarity: 'epic',
        visual: { icon: 'Gamepad2', color: '#8b5cf6', emoji: '🕹️' }
      },
      {
        slug: 'floating-bubbles',
        name: 'Floating Bubbles',
        description: "Adds a soothing effect where translucent bubbles gently drift upwards across your profile.",
        category: 'effect',
        price: 625,
        rarity: 'rare',
        visual: { icon: 'Sparkles', color: '#38bdf8', emoji: '🫧' }
      },
      {
        slug: 'thunderbolt-entry',
        name: 'Thunderbolt Entry',
        description: 'Messages strike the chat with a high-voltage lightning flash animation.',
        category: 'entry_effect',
        price: 1500,
        rarity: 'epic',
        visual: { icon: 'Zap', color: '#fbbf24', emoji: '⚡' }
      },

      // ━━━ STARTER ITEMS (50–200 coins) — new users can buy something right away ━━━
      {
        slug: 'color-sky-blue',
        name: 'Sky Blue',
        description: 'A clean, calm sky-blue username color.',
        category: 'username_color',
        price: 50,
        rarity: 'common',
        sortOrder: 1,
        visual: { type: 'solid', color: '#38bdf8' }
      },
      {
        slug: 'color-mint-green',
        name: 'Mint Green',
        description: 'Fresh mint green for your username.',
        category: 'username_color',
        price: 50,
        rarity: 'common',
        sortOrder: 2,
        visual: { type: 'solid', color: '#34d399' }
      },
      {
        slug: 'color-rose-pink',
        name: 'Rose Pink',
        description: 'Soft rose pink username color.',
        category: 'username_color',
        price: 75,
        rarity: 'common',
        sortOrder: 3,
        visual: { type: 'solid', color: '#fb7185' }
      },
      {
        slug: 'badge-newcomer',
        name: 'Newcomer',
        description: 'A friendly badge for those just getting started.',
        category: 'post_badge',
        price: 100,
        rarity: 'common',
        sortOrder: 1,
        visual: { icon: 'Star', color: '#94a3b8', label: 'NEW' }
      },
      {
        slug: 'frame-simple-white',
        name: 'Clean White',
        description: 'A minimal clean white border around your avatar.',
        category: 'avatar_frame',
        price: 100,
        rarity: 'common',
        sortOrder: 1,
        visual: { gradient: 'linear-gradient(45deg, #ffffff, #e2e8f0)', padding: '3px' }
      },
      {
        slug: 'frame-simple-dark',
        name: 'Midnight Border',
        description: 'A sleek dark border for a minimal look.',
        category: 'avatar_frame',
        price: 150,
        rarity: 'common',
        sortOrder: 2,
        visual: { gradient: 'linear-gradient(45deg, #1e293b, #334155)', padding: '3px' }
      },
      {
        slug: 'bubble-simple-dark',
        name: 'Dark Mode Bubble',
        description: 'A clean dark chat bubble for night owls.',
        category: 'chat_bubble',
        price: 100,
        rarity: 'common',
        sortOrder: 1,
        visual: { background: '#1e293b', textColor: '#e2e8f0', borderColor: '#334155' }
      },
      {
        slug: 'bubble-simple-purple',
        name: 'Purple Haze Bubble',
        description: 'A soft purple chat bubble.',
        category: 'chat_bubble',
        price: 150,
        rarity: 'common',
        sortOrder: 2,
        visual: { background: '#4c1d95', textColor: '#ede9fe', borderColor: '#7c3aed' }
      },

      // ━━━ BIO THEMES (currently missing from seed) ━━━
      {
        slug: 'bio-minimal-dark',
        name: 'Minimal Dark',
        description: 'A sleek dark background for your bio section.',
        category: 'bio_theme',
        price: 300,
        rarity: 'uncommon',
        sortOrder: 1,
        visual: { background: '#0f172a', textColor: '#94a3b8', borderColor: '#1e293b' }
      },
      {
        slug: 'bio-sunset-glow',
        name: 'Sunset Glow',
        description: 'Warm sunset gradient behind your bio.',
        category: 'bio_theme',
        price: 500,
        rarity: 'rare',
        sortOrder: 2,
        visual: { gradient: 'linear-gradient(135deg, #7f1d1d, #c2410c, #d97706)', textColor: '#fef3c7' }
      },
      {
        slug: 'bio-ocean-breeze',
        name: 'Ocean Breeze',
        description: 'Cool ocean tones for a calm, collected bio.',
        category: 'bio_theme',
        price: 500,
        rarity: 'rare',
        sortOrder: 3,
        visual: { gradient: 'linear-gradient(135deg, #0c4a6e, #0369a1, #0ea5e9)', textColor: '#e0f2fe' }
      },
      {
        slug: 'bio-forest-spirit',
        name: 'Forest Spirit',
        description: 'Deep greens and earthy tones for your bio.',
        category: 'bio_theme',
        price: 600,
        rarity: 'rare',
        sortOrder: 4,
        visual: { gradient: 'linear-gradient(135deg, #14532d, #166534, #15803d)', textColor: '#dcfce7' }
      },
      {
        slug: 'bio-galaxy-ink',
        name: 'Galaxy Ink',
        description: 'A deep space gradient with subtle star shimmer.',
        category: 'bio_theme',
        price: 1200,
        rarity: 'epic',
        sortOrder: 5,
        visual: { gradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', textColor: '#c4b5fd', animation: 'shimmer 6s infinite' }
      },
      {
        slug: 'bio-neon-city',
        name: 'Neon City',
        description: 'Cyberpunk neon vibes for your bio.',
        category: 'bio_theme',
        price: 1500,
        rarity: 'epic',
        sortOrder: 6,
        visual: { gradient: 'linear-gradient(135deg, #0a0a0a, #1a0533)', textColor: '#f0abfc', borderColor: '#d946ef', animation: 'pulse 3s infinite' }
      },
      {
        slug: 'bio-golden-hour',
        name: 'Golden Hour',
        description: 'Luxurious gold tones that make your bio shine.',
        category: 'bio_theme',
        price: 3000,
        rarity: 'legendary',
        sortOrder: 7,
        visual: { gradient: 'linear-gradient(135deg, #78350f, #d97706, #fef3c7, #d97706)', backgroundSize: '300% 300%', textColor: '#1c1917', animation: 'gradient-shift 5s ease infinite' }
      },

      // ━━━ MORE EFFECTS ━━━
      {
        slug: 'effect-confetti',
        name: 'Confetti Burst',
        description: 'Colorful confetti rains down on your profile.',
        category: 'effect',
        price: 400,
        rarity: 'uncommon',
        sortOrder: 1,
        visual: { icon: 'PartyPopper', color: '#f472b6', emoji: '🎉' }
      },
      {
        slug: 'effect-fireflies',
        name: 'Fireflies',
        description: 'Tiny glowing fireflies drift across your profile at night.',
        category: 'effect',
        price: 700,
        rarity: 'rare',
        sortOrder: 2,
        visual: { icon: 'Sparkles', color: '#fde047', emoji: '✨' }
      },
      {
        slug: 'effect-snow',
        name: 'Snowfall',
        description: 'Gentle snowflakes drift down your profile.',
        category: 'effect',
        price: 500,
        rarity: 'rare',
        sortOrder: 3,
        visual: { icon: 'Snowflake', color: '#bae6fd', emoji: '❄️' }
      },
      {
        slug: 'effect-matrix-rain',
        name: 'Matrix Rain',
        description: 'Green code cascades down your profile like the Matrix.',
        category: 'effect',
        price: 1800,
        rarity: 'epic',
        sortOrder: 4,
        visual: { icon: 'Code2', color: '#4ade80', emoji: '💻' }
      },
      {
        slug: 'effect-aurora',
        name: 'Aurora Borealis',
        description: 'Shimmering northern lights dance across your profile.',
        category: 'effect',
        price: 3500,
        rarity: 'legendary',
        sortOrder: 5,
        visual: { icon: 'Waves', color: '#34d399', emoji: '🌌' }
      },
      {
        slug: 'effect-sakura',
        name: 'Sakura Petals',
        description: 'Cherry blossom petals float gently across your profile.',
        category: 'effect',
        price: 2200,
        rarity: 'legendary',
        sortOrder: 6,
        visual: { icon: 'Flower2', color: '#f9a8d4', emoji: '🌸' }
      },

      // ━━━ MORE ENTRY EFFECTS ━━━
      {
        slug: 'entry-smoke',
        name: 'Smoke Entrance',
        description: 'Your messages drift in through a cloud of smoke.',
        category: 'entry_effect',
        price: 400,
        rarity: 'uncommon',
        sortOrder: 1,
        visual: { icon: 'Wind', color: '#94a3b8', emoji: '💨' }
      },
      {
        slug: 'entry-fire-trail',
        name: 'Fire Trail',
        description: 'Messages blaze into the chat leaving a trail of fire.',
        category: 'entry_effect',
        price: 900,
        rarity: 'rare',
        sortOrder: 2,
        visual: { icon: 'Flame', color: '#f97316', emoji: '🔥' }
      },
      {
        slug: 'entry-royal-fanfare',
        name: 'Royal Fanfare',
        description: 'A golden crown animation announces your every message.',
        category: 'entry_effect',
        price: 2500,
        rarity: 'legendary',
        sortOrder: 3,
        visual: { icon: 'Crown', color: '#fbbf24', emoji: '👑' }
      },
      {
        slug: 'entry-glitch-warp',
        name: 'Glitch Warp',
        description: 'Messages tear through reality with a glitch distortion.',
        category: 'entry_effect',
        price: 2000,
        rarity: 'epic',
        sortOrder: 4,
        visual: { icon: 'Zap', color: '#a78bfa', emoji: '🌀' }
      },
      {
        slug: 'entry-meteor',
        name: 'Meteor Strike',
        description: 'Your messages crash into the chat like a meteor.',
        category: 'entry_effect',
        price: 4000,
        rarity: 'legendary',
        sortOrder: 5,
        visual: { icon: 'Rocket', color: '#fb923c', emoji: '☄️' }
      },

      // ━━━ MORE PROFILE THEMES ━━━
      {
        slug: 'theme-cherry-blossom',
        name: 'Cherry Blossom',
        description: 'A soft pink spring theme with floating petals.',
        category: 'profile_theme',
        price: 1200,
        rarity: 'epic',
        sortOrder: 1,
        visual: { icon: 'Flower2', color: '#f9a8d4', emoji: '🌸' }
      },
      {
        slug: 'theme-cyberpunk',
        name: 'Cyberpunk 2099',
        description: 'Neon-lit streets and dark alleys define your profile.',
        category: 'profile_theme',
        price: 2500,
        rarity: 'legendary',
        sortOrder: 2,
        visual: { icon: 'Cpu', color: '#22d3ee', emoji: '🤖' }
      },
      {
        slug: 'theme-enchanted-forest',
        name: 'Enchanted Forest',
        description: 'Mystical glowing trees and fireflies surround your profile.',
        category: 'profile_theme',
        price: 2000,
        rarity: 'legendary',
        sortOrder: 3,
        visual: { icon: 'TreePine', color: '#4ade80', emoji: '🌲' }
      },
      {
        slug: 'theme-lava-world',
        name: 'Lava World',
        description: 'Molten rock and volcanic energy power your profile.',
        category: 'profile_theme',
        price: 3000,
        rarity: 'legendary',
        sortOrder: 4,
        visual: { icon: 'Flame', color: '#ef4444', emoji: '🌋' }
      },
      {
        slug: 'theme-underwater',
        name: 'Deep Ocean',
        description: 'Dive into the abyss with bioluminescent sea creatures.',
        category: 'profile_theme',
        price: 2800,
        rarity: 'legendary',
        sortOrder: 5,
        visual: { icon: 'Waves', color: '#0ea5e9', emoji: '🌊' }
      },

      // ━━━ ENGAGEMENT / GRIND BADGES ━━━
      {
        slug: 'badge-grind-king',
        name: 'Grind King',
        description: 'Awarded to those who hustle hardest. Earned by reaching 5,000 total coins.',
        category: 'special_badge',
        price: 0,
        rarity: 'epic',
        sortOrder: 10,
        isActive: true,
        visual: { icon: 'TrendingUp', color: '#f59e0b', label: 'GRIND' }
      },
      {
        slug: 'badge-streak-7',
        name: 'Week Warrior',
        description: 'You showed up 7 days in a row. Respect.',
        category: 'special_badge',
        price: 0,
        rarity: 'rare',
        sortOrder: 11,
        isActive: true,
        visual: { icon: 'Flame', color: '#f97316', label: '7🔥' }
      },
      {
        slug: 'badge-streak-30',
        name: 'Monthly Legend',
        description: '30-day login streak. You are built different.',
        category: 'special_badge',
        price: 0,
        rarity: 'legendary',
        sortOrder: 12,
        isActive: true,
        visual: { icon: 'Flame', color: '#ef4444', label: '30🔥' }
      },
      {
        slug: 'badge-campus-legend',
        name: 'Campus Legend',
        description: 'A title reserved for those who define campus culture.',
        category: 'post_badge',
        price: 25000,
        rarity: 'mythic',
        sortOrder: 20,
        visual: { icon: 'Trophy', color: '#fbbf24', label: 'LEGEND' }
      },
      {
        slug: 'badge-night-owl',
        name: 'Night Owl',
        description: 'For those who are most active after midnight.',
        category: 'post_badge',
        price: 1200,
        rarity: 'rare',
        sortOrder: 5,
        visual: { icon: 'Moon', color: '#818cf8', label: 'OWL' }
      },
      {
        slug: 'badge-top-contributor',
        name: 'Top Contributor',
        description: 'Recognized for consistently adding value to the community.',
        category: 'post_badge',
        price: 5000,
        rarity: 'epic',
        sortOrder: 6,
        visual: { icon: 'Award', color: '#34d399', label: 'TOP' }
      },
      {
        slug: 'badge-verified-scholar',
        name: 'Verified Scholar',
        description: 'For those who share knowledge and resources generously.',
        category: 'post_badge',
        price: 3500,
        rarity: 'epic',
        sortOrder: 7,
        visual: { icon: 'BookOpen', color: '#60a5fa', label: 'SCHOLAR' }
      },

      // ━━━ STREAK FRAMES (grind to unlock) ━━━
      {
        slug: 'frame-streak-flame',
        name: 'Streak Flame',
        description: 'A blazing frame for those on a 7-day login streak. Keep the fire alive.',
        category: 'avatar_frame',
        price: 2000,
        rarity: 'epic',
        sortOrder: 10,
        visual: { gradient: 'linear-gradient(45deg, #7c2d12, #ea580c, #fbbf24)', backgroundSize: '200% 200%', animation: 'gradient-shift 2s ease infinite', padding: '4px' }
      },
      {
        slug: 'frame-inferno-lord',
        name: 'Inferno Lord',
        description: 'For the 30-day streak holders. You are on fire.',
        category: 'avatar_frame',
        price: 8000,
        rarity: 'mythic',
        sortOrder: 11,
        visual: { gradient: 'linear-gradient(45deg, #450a0a, #991b1b, #f97316, #fbbf24)', backgroundSize: '400% 400%', animation: 'gradient-shift 1.5s ease infinite', padding: '5px' }
      },

      // ━━━ PRESTIGE ITEMS (75,000–100,000 coins — serious grind) ━━━
      {
        slug: 'frame-divine-aura',
        name: 'Divine Aura',
        description: 'A transcendent golden aura only the most dedicated can afford. True prestige.',
        category: 'avatar_frame',
        price: 75000,
        rarity: 'mythic',
        sortOrder: 100,
        visual: { gradient: 'conic-gradient(from 0deg, #fbbf24, #fef3c7, #d97706, #fbbf24)', backgroundSize: '300% 300%', animation: 'gradient-shift 3s linear infinite', padding: '6px' }
      },
      {
        slug: 'color-divine-gold',
        name: 'Divine Gold',
        description: 'The rarest username color. Pure animated gold reserved for legends.',
        category: 'username_color',
        price: 80000,
        rarity: 'mythic',
        sortOrder: 100,
        visual: { type: 'animated-gradient', gradient: 'linear-gradient(to right, #78350f, #d97706, #fef3c7, #d97706, #78350f)', backgroundSize: '400% auto', animation: 'text-shimmer 3s linear infinite' }
      },
      {
        slug: 'theme-god-mode',
        name: 'God Mode',
        description: 'The ultimate profile theme. Reserved for those who have truly grinded.',
        category: 'profile_theme',
        price: 100000,
        rarity: 'mythic',
        sortOrder: 100,
        visual: { icon: 'Crown', color: '#fbbf24', emoji: '👑' }
      },
      {
        slug: 'entry-divine-descent',
        name: 'Divine Descent',
        description: 'Your messages descend from the heavens with golden light. Prestige only.',
        category: 'entry_effect',
        price: 90000,
        rarity: 'mythic',
        sortOrder: 100,
        visual: { icon: 'Crown', color: '#fde047', emoji: '✨' }
      },
      {
        slug: 'badge-og',
        name: 'OG',
        description: 'The original. The one who was here before everyone else.',
        category: 'special_badge',
        price: 50000,
        rarity: 'mythic',
        sortOrder: 100,
        visual: { icon: 'Shield', color: '#fbbf24', label: 'OG' }
      }
    ]

    // ━━━ Clean up old/invalid shop items ━━━
    const deleteResult = await ShopItem.deleteMany({
      $or: [
        { 'visual.url': { $exists: true } },
        { 'visual.gif': { $exists: true } },
        { 'visual.background': /http/i },
        { 'visual.gradient': /http/i }
      ]
    })

    if (deleteResult.deletedCount > 0) {
      console.log(`[API Shop] Cleaned up ${deleteResult.deletedCount} old/invalid items.`)
    }

    for (const item of seedItems) {
      await ShopItem.findOneAndUpdate({ slug: item.slug }, item, { upsert: true })
    }

    // Fetch all active shop items + wallet in parallel for speed
    const REMOVED_CATEGORIES = ['profile_theme', 'bio_theme', 'effect', 'entry_effect', 'special_badge']

    const [items, wallet] = await Promise.all([
      ShopItem.find({ isActive: true, category: { $nin: REMOVED_CATEGORIES } })
        .sort({ rarity: -1, price: 1 })
        .lean(),
      Wallet.findOne({ userId: decoded.userId }).select('inventory').lean()
    ])

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
