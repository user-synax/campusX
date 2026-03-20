import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-zA-Z0-9_]{3,20}$/,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  college: {
    type: String,
    trim: true,
    default: '',
  },
  course: {
    type: String,
    trim: true,
    default: '',
  },
  year: {
    type: Number,
    min: 1,
    max: 6,
    default: 1,
  },
  bio: {
    type: String,
    maxlength: 160,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: [],
  }],
  // Founder-related fields (only populated for founder account) 
  founderData: { 
    roadmap: {
      type: [{ 
        title: String, 
        status: { 
          type: String, 
          enum: ['done', 'inprogress', 'upcoming'], 
          default: 'upcoming' 
        }, 
        emoji: String, 
        order: Number 
      }],
      default: []
    },
    broadcastMessage: String,  // current site-wide announcement 
    broadcastId: String,       // unique ID per announcement (for dismiss tracking) 
    broadcastActive: Boolean, 
    broadcastCreatedAt: Date, 
    profileViews: { type: Number, default: 0 }, 
    profileViewsToday: { type: Number, default: 0 }, 
    profileViewsResetAt: Date, 
    totalUsersAtJoining: { type: Number, default: 0 }, 
  },
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  pinnedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null }
}, { timestamps: true });

userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.index({ name: 'text', username: 'text', college: 'text' });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
