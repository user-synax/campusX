import mongoose from 'mongoose' 
 
const coinTransactionSchema = new mongoose.Schema({ 
 
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, 
 
  // Direction 
  type: { 
    type: String, 
    enum: ['earn', 'spend', 'gift_sent', 'gift_received', 'admin_adjust'], 
    required: true 
  }, 
 
  // Always positive — type determines direction 
  amount: { 
    type: Number, 
    required: true, 
    min: 1 
  }, 
 
  // Snapshot of balance after this transaction 
  balanceAfter: { 
    type: Number, 
    required: true, 
    min: 0 
  }, 
 
  // What caused this transaction 
  reason: { 
    type: String, 
    required: true, 
    enum: [ 
      'daily_login', 
      'post_created', 
      'first_post_of_day', 
      'like_received', 
      'comment_created', 
      'comment_received', 
      'poll_created', 
      'event_created', 
      'resource_approved', 
      'placement_shared', 
      'lost_found_resolved', 
      'streak_7day', 
      'streak_30day', 
      'referral_bonus', 
      'admin_bonus', 
      'shop_purchase', 
      'gift_sent', 
      'gift_received' 
    ] 
  }, 
 
  // Related content (optional) 
  referenceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    default: null 
  }, 
  referenceType: { 
    type: String, 
    enum: ['post', 'resource', 'shop_item', 'user', null], 
    default: null 
  }, 
 
  // For gifts — who sent/received 
  relatedUserId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  }, 
 
  // Deduplication key — prevents double-rewarding 
  // Format: userId_reason_referenceId_YYYY-MM-DD 
  idempotencyKey: { 
    type: String, 
    unique: true, 
    sparse: true  // allows missing field, but if present must be unique 
  } 
 
}, { 
  timestamps: true, 
}) 
 
// Make immutable after creation 
coinTransactionSchema.pre('findOneAndUpdate', function() { 
  throw new Error('CoinTransactions are immutable — no updates allowed') 
}) 
coinTransactionSchema.pre('updateOne', function() { 
  throw new Error('CoinTransactions are immutable — no updates allowed') 
}) 
coinTransactionSchema.pre('updateMany', function() { 
  throw new Error('CoinTransactions are immutable — no updates allowed') 
}) 
 
// Indexes 
coinTransactionSchema.index({ userId: 1, createdAt: -1 }) 
coinTransactionSchema.index({ userId: 1, type: 1 }) 
coinTransactionSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true }) 
coinTransactionSchema.index({ createdAt: -1 }) 
 
export default mongoose.models.CoinTransaction || 
  mongoose.model('CoinTransaction', coinTransactionSchema) 
