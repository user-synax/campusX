import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow', 'event_cancelled', 'reaction'],
    required: true,
  },
  reactionType: {
    type: String,
    enum: ['like', 'funny', 'wow', 'sad', 'respect', 'fire'],
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  },
  read: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// For fetching user's notifications
notificationSchema.index({ recipient: 1, createdAt: -1 });

// For unread count queries
notificationSchema.index({ recipient: 1, read: 1 });

// For deduplication check (especially for likes)
notificationSchema.index({ recipient: 1, sender: 1, type: 1, post: 1 });

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;
