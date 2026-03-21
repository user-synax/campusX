import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({ 
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  type: { 
    type: String, 
    enum: ['follow', 'like', 'comment', 'mention', 
           'event_reminder', 'resource_approved', 'resource_rejected', 'level_up'], 
    required: true 
  }, 
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // legacy 
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, 
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // legacy
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, 
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }, 
  read: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now } 
}, { 
  strict: false, 
  strictPopulate: false 
});

// Auto-delete after 30 days 
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

// Force model re-registration in development to pick up schema changes 
if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.Notification;
}

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;
