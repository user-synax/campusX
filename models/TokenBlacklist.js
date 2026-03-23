import mongoose from 'mongoose' 
 
const tokenBlacklistSchema = new mongoose.Schema({ 
  token: { 
    type: String, 
    required: true, 
    index: true 
  }, 
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    index: true 
  }, 
  expiresAt: { 
    type: Date, 
    required: true 
  } 
}, { timestamps: true }) 
 
// Auto-delete expired tokens 
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) 
 
export default mongoose.models.TokenBlacklist || 
  mongoose.model('TokenBlacklist', tokenBlacklistSchema) 
