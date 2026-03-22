import mongoose from 'mongoose';

const pollOptionSchema = new mongoose.Schema({
  text: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 80 
  },
  votes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, { _id: true });

const anonymousPostSchema = new mongoose.Schema({
  // NO AUTHOR FIELD - COMPLETELY DETACHED
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [2000, 'Post cannot exceed 2000 characters'],
  },
  images: {
    type: [String],
    validate: [v => v.length <= 4, 'You can upload a maximum of 4 images'],
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: [],
  }],
  likesCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['like', 'funny', 'wow', 'sad', 'respect', 'fire'], required: true }
  }],
  commentsCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  community: {
    type: String,
    trim: true,
    default: '',
  },
  isAnonymous: {
    type: Boolean,
    default: true,
  },
  poll: {
    options: [{
      text: String,
      votes: [mongoose.Schema.Types.ObjectId]
    }],
    expiresAt: Date,
    active: { type: Boolean, default: true }
  },
  hashtags: [{ 
    type: String, 
    lowercase: true, 
    trim: true 
  }],
  linkPreview: {
    title: String,
    description: String,
    image: String,
    url: String
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

anonymousPostSchema.index({ createdAt: -1 });
anonymousPostSchema.index({ community: 1, createdAt: -1 });
anonymousPostSchema.index({ hashtags: 1, createdAt: -1 });
anonymousPostSchema.index({ likes: 1 });
anonymousPostSchema.index({ content: 'text' });
anonymousPostSchema.index({ 'reactions.user': 1 });

anonymousPostSchema.virtual('reactionCount').get(function () {
  return this.reactions.length;
});

// Check if model already exists before creating it
export default mongoose.models.AnonymousPost || mongoose.model('AnonymousPost', anonymousPostSchema);
