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

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
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
  },isAnonymous: {
    type: Boolean,
    default: false,
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
  }]
}, { 
  timestamps: true,toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

postSchema.index({ createdAt: -1 });
postSchema.index({ community: 1 });
postSchema.index({ author: 1 });
postSchema.index({ content: 'text' });
postSchema.index({ 'reactions.user': 1 });

postSchema.virtual('likesCount').get(function () {
  return this.likes.length;
});

postSchema.virtual('reactionCount').get(function () {
  return this.reactions.length;
});

postSchema.virtual('hasPoll').get(function () {
  return this.poll?.options?.length > 0;
});

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

export default Post;
