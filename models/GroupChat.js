import mongoose from 'mongoose' 
 
const memberSchema = new mongoose.Schema({ 
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, 
  role: { 
    type: String, 
    enum: ['admin', 'member'], 
    default: 'member' 
  }, 
  joinedAt: { type: Date, default: Date.now }, 
  // Last message they read — for unread count 
  lastReadAt: { type: Date, default: null }, 
  // Muted this group? 
  isMuted: { type: Boolean, default: false } 
}, { _id: false }) 
 
const groupChatSchema = new mongoose.Schema({ 
  name: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 60, 
    minlength: 2 
  }, 
  description: { 
    type: String, 
    trim: true, 
    maxlength: 200, 
    default: '' 
  }, 
  avatar: { 
    type: String, 
    default: ''    // URL — optional group avatar 
  }, 
  college: { 
    type: String, 
    trim: true, 
    default: ''    // Optional college filter 
  }, 
  members: { 
    type: [memberSchema], 
    validate: { 
      validator: (arr) => arr.length <= 200,  // max 200 members 
      message: 'Group cannot have more than 200 members' 
    } 
  }, 
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, 
  // Denormalized for performance 
  messageCount: { type: Number, default: 0 }, 
  lastMessage: { 
    content: String, 
    senderName: String, 
    sentAt: Date, 
    type: { type: String, default: 'text' } 
  }, 
  isActive: { type: Boolean, default: true }, 
 
}, { timestamps: true }) 
 
// ━━━ Indexes ━━━ 
// Finding groups a user belongs to 
groupChatSchema.index({ 'members.userId': 1 }) 
// College-specific groups 
groupChatSchema.index({ college: 1, isActive: 1 }) 
// Latest message for sorting inbox 
groupChatSchema.index({ 'lastMessage.sentAt': -1 }) 
// Creator's groups 
groupChatSchema.index({ createdBy: 1 }) 
 
export default mongoose.models.GroupChat || 
  mongoose.model('GroupChat', groupChatSchema) 
