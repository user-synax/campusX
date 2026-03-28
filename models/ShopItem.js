import mongoose from 'mongoose'

const shopItemSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens']
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: [
      'avatar_frame',
      'username_color',
      'profile_banner',
      'post_badge',
      'chat_bubble',
      'achievement_badge'
    ]
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'],
    default: 'common'
  },
  visual: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  isLimited: { type: Boolean, default: false },
  limitedUntil: { type: Date, default: null },
  maxStock: { type: Number, default: null },
  soldCount: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true })

shopItemSchema.index({ category: 1, isActive: 1, sortOrder: 1 })
shopItemSchema.index({ rarity: 1 })
shopItemSchema.index({ isActive: 1, sortOrder: 1 })

export default mongoose.models.ShopItem || mongoose.model('ShopItem', shopItemSchema)
