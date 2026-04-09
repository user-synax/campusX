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
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'unspecified'],
    default: 'unspecified',
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
  totalXP: {
    type: Number,
    default: 0,
  },
  weeklyXP: {
    type: Number,
    default: 0,
  },
  // ── Student Verification System ──
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationStatus: {
    type: String,
    enum: ['none', 'pending', 'verified', 'rejected'],
    default: 'none',
  },
  verificationType: {
    type: String,
    enum: ['college_email', 'id_card'],
  },
  collegeEmail: {
    type: String,
    lowercase: true,
    trim: true,
  },
  collegeIdUrl: {
    type: String, // Cloudinary URL for uploaded college ID card
  },
  verificationRejectedReason: {
    type: String,
  },
  verificationRequestedAt: {
    type: Date,
  },
  verificationApprovedAt: {
    type: Date,
  },
  pinnedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  // Moderation fields 
  isBanned: { type: Boolean, default: false }, 
  isDeleted: { type: Boolean, default: false },  // soft delete 
  deletedAt: { type: Date, default: null },
  tokenVersion: { type: Number, default: 0 }, // For force logout

  // Coin display preference 
  showCoinsOnProfile: { type: Boolean, default: true }, 
  
  // Referral 
  referralCode: { type: String, unique: true, sparse: true }, 
  referredBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  }, 
  referralCount: { type: Number, default: 0 }, 
  
  // Streak 
  currentStreak:  { type: Number, default: 0 }, 
  longestStreak:  { type: Number, default: 0 }, 
  lastActiveDate: { type: Date,   default: null },

  // Profile customization
  interests: {
    type: [String],
    validate: {
      validator: (arr) => arr.length <= 8,
      message: 'Maximum 8 interests allowed'
    },
    default: []
  },
  socialLinks: {
    twitter:   { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin:  { type: String, default: '' },
    github:    { type: String, default: '' },
    website:   { type: String, default: '' },
  },
  // Password reset fields
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null },
  // Onboarding status
}, { timestamps: true });

userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ college: 1 });
userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });
userSchema.index({ name: 'text', username: 'text' });
userSchema.index({ totalXP: -1 });
userSchema.index({ weeklyXP: -1 });
userSchema.index({ college: 1, weeklyXP: -1 });
// Moderation index 
userSchema.index({ isBanned: 1 }) 
userSchema.index({ isDeleted: 1, createdAt: -1 }) 
// Verification indexes
userSchema.index({ collegeEmail: 1 }, { unique: true, sparse: true })
userSchema.index({ verificationStatus: 1, verificationRequestedAt: -1 })

// Force re-compilation of the User model in development to pick up schema changes
if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User = mongoose.model('User', userSchema);

export default User;
