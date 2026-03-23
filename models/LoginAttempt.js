import mongoose from 'mongoose' 
 
const loginAttemptSchema = new mongoose.Schema({ 
  ip: { 
    type: String, 
    required: true, 
    index: true 
  }, 
  email: { 
    type: String, 
    index: true 
  }, 
  attempts: { 
    type: Number, 
    default: 1 
  }, 
  lastAttempt: { 
    type: Date, 
    default: Date.now 
  }, 
  isBlocked: { 
    type: Boolean, 
    default: false 
  }, 
  blockedUntil: { 
    type: Date, 
    default: null 
  } 
}, { timestamps: true }) 
 
// TTL index to auto-clear attempts after 24 hours
loginAttemptSchema.index({ lastAttempt: 1 }, { expireAfterSeconds: 86400 }) 
 
export default mongoose.models.LoginAttempt || 
  mongoose.model('LoginAttempt', loginAttemptSchema) 
