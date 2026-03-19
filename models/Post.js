import mongoose from 'mongoose';

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
    default: false,
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

postSchema.index({ createdAt: -1 });
postSchema.index({ community: 1 });
postSchema.index({ author: 1 });

postSchema.virtual('likesCount').get(function () {
  return this.likes.length;
});

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

export default Post;
