import mongoose from 'mongoose' 
 
const inventoryItemSchema = new mongoose.Schema({ 
  itemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ShopItem', 
    required: true 
  }, 
  purchasedAt: { type: Date, default: Date.now }, 
  expiresAt: { type: Date, default: null } 
}, { _id: false }) 
 
const equippedSchema = new mongoose.Schema({ 
  avatarFrame:    { type: mongoose.Schema.Types.Mixed, default: null },
  usernameColor:  { type: mongoose.Schema.Types.Mixed, default: null },
  profileBanner:  { type: mongoose.Schema.Types.Mixed, default: null },
  postBadge:      { type: mongoose.Schema.Types.Mixed, default: null },
  chatBubble:     { type: mongoose.Schema.Types.Mixed, default: null },
  bioTheme:       { type: mongoose.Schema.Types.Mixed, default: null },
  profileTheme:   { type: mongoose.Schema.Types.Mixed, default: null },
  effect:         { type: mongoose.Schema.Types.Mixed, default: null },
  entryEffect:    { type: mongoose.Schema.Types.Mixed, default: null }
}, { _id: false }) 
 
const walletSchema = new mongoose.Schema({ 
 
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  }, 
 
  // Current spendable balance — NEVER negative 
  balance: { 
    type: Number, 
    default: 0, 
    min: [0, 'Balance cannot go below 0'] 
  }, 
 
  // Lifetime earned — for Whale badge 
  totalEarned: { 
    type: Number, 
    default: 0, 
    min: 0 
  }, 
 
  // Lifetime spent 
  totalSpent: { 
    type: Number, 
    default: 0, 
    min: 0 
  }, 
 
  // Anti-cheat: today's earned count 
  todayEarned: { 
    type: Number, 
    default: 0, 
    min: 0 
  }, 
 
  // When todayEarned was last reset 
  todayResetAt: { 
    type: Date, 
    default: () => { 
      const d = new Date() 
      d.setHours(0, 0, 0, 0) 
      return d 
    } 
  }, 
 
  // Owned items 
  inventory: { 
    type: [inventoryItemSchema], 
    default: [] 
  }, 
 
  // Currently equipped (stores slugs, not IDs) 
  equipped: { 
    type: equippedSchema, 
    default: () => ({}) 
  } 
 
}, { timestamps: true }) 
 
// Indexes 
walletSchema.index({ userId: 1 }, { unique: true }) 
walletSchema.index({ totalEarned: -1 })  // Whale leaderboard 
walletSchema.index({ balance: -1 })       // Rich leaderboard 
 
export default mongoose.models.Wallet || 
  mongoose.model('Wallet', walletSchema) 
