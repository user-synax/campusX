import mongoose from 'mongoose' 
 
const shopItemSchema = new mongoose.Schema({ 
 
  // Unique identifier — used in equipped object 
  // e.g. 'gold-frame', 'fire-badge' 
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
      'bio_theme', 
      'special_badge',
      'profile_theme',
      'effect'
    ] 
  }, 
 
  price: { 
    type: Number, 
    required: true, 
    min: 0  // 0 = free / auto-awarded 
  }, 
 
  rarity: { 
    type: String, 
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'], 
    default: 'common' 
  }, 
 
  // CSS/visual data — interpreted by frontend 
  visual: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  }, 
 
  // Limited edition 
  isLimited:   { type: Boolean, default: false }, 
  limitedUntil:{ type: Date,    default: null }, 
  maxStock:    { type: Number,  default: null }, 
  soldCount:   { type: Number,  default: 0, min: 0 }, 
 
  // Purchasable in shop? 
  isActive:    { type: Boolean, default: true }, 
 
  // Display order in shop 
  sortOrder:   { type: Number,  default: 0 } 
 
}, { timestamps: true }) 
 
shopItemSchema.index({ category: 1, isActive: 1, sortOrder: 1 }) 
shopItemSchema.index({ rarity: 1 }) 
shopItemSchema.index({ slug: 1 }, { unique: true }) 
shopItemSchema.index({ isActive: 1, sortOrder: 1 }) 
 
export default mongoose.models.ShopItem || 
  mongoose.model('ShopItem', shopItemSchema) 
