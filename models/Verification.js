import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

// Index for faster lookups
verificationSchema.index({ identifier: 1 });
verificationSchema.index({ expiresAt: 1 });

const Verification = mongoose.model('Verification', verificationSchema);

export default Verification;
