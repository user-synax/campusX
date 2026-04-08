import mongoose from 'mongoose';

const whiteboardSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    trim: true,
    maxlength: 200,
    default: 'Untitled',
  },
  // Serialized tldraw store + session snapshot
  snapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

whiteboardSchema.index({ owner: 1, updatedAt: -1 });

const Whiteboard = mongoose.models.Whiteboard || mongoose.model('Whiteboard', whiteboardSchema);

export default Whiteboard;
