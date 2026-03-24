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
    maxlength: [2000, 'Post cannot exceed 2000 characters'],
  },
  images: {
    type: [String],
    validate: [v => v.length <= 6, 'You can upload a maximum of 6 images'],
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
  }],
  studyGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup'
  },
  linkPreview: {
    title: String,
    description: String,
    image: String,
    url: String
  },
  // Admin & Moderation fields
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isHidden: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  reportCount: { type: Number, default: 0, min: 0 }
}, { 
  timestamps: true,toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ hashtags: 1, createdAt: -1 });
postSchema.index({ studyGroup: 1, createdAt: -1 });
postSchema.index({ likes: 1 });
postSchema.index({ content: 'text' });
postSchema.index({ author: 1, isAnonymous: 1, createdAt: -1 });
postSchema.index({ 'reactions.user': 1 });
postSchema.index({ reportCount: -1, isDeleted: 1 });
postSchema.index({ isFeatured: 1, createdAt: -1 });
postSchema.index({ isDeleted: 1, createdAt: -1 });

postSchema.virtual('reactionCount').get(function () {
  return this.reactions.length;
});

postSchema.virtual('hasPoll').get(function () {
  return this.poll?.options?.length > 0;
});

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

export default Post;
