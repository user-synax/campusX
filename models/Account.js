import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  accountId: {
    type: String,
    required: true,
  },
  providerId: {
    type: String,
    required: true,
  },
  accessToken: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
  expiresAt: {
    type: Date,
  },
}, { timestamps: true });

// Index for faster lookups
accountSchema.index({ userId: 1 });
accountSchema.index({ accountId: 1, providerId: 1 }, { unique: true });

const Account = mongoose.model('Account', accountSchema);

export default Account;
