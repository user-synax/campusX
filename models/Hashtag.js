import mongoose from 'mongoose';

const hashtagSchema = new mongoose.Schema({
  tag: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  postCount: {
    type: Number,
    default: 1
  },
  weeklyCount: {
    type: Number,
    default: 1
  },
  lastUsedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for trending queries
hashtagSchema.index({ weeklyCount: -1 });
// Index for last used queries
hashtagSchema.index({ lastUsedAt: -1 });

const Hashtag = mongoose.models.Hashtag || mongoose.model('Hashtag', hashtagSchema);

export default Hashtag;
