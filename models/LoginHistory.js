import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    default: 'unknown'
  },
  userAgent: {
    type: String,
    default: ''
  },
  device: {
    type: String,
    enum: ['Mobile', 'Desktop', 'Tablet', 'Unknown'],
    default: 'Unknown'
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  location: {
    type: String,
    default: ''
  },
  isSuspicious: {
    type: Boolean,
    default: false
  }
}, { timestamps: { createdAt: true, updatedAt: false } });

loginHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.LoginHistory || mongoose.model('LoginHistory', loginHistorySchema);