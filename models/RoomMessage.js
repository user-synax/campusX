import mongoose from 'mongoose';

const roomMessageSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyRoom',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 500,
  },
  type: {
    type: String,
    enum: ['text', 'system'],
    default: 'text',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

roomMessageSchema.index({ roomId: 1, createdAt: 1 });

const RoomMessage = mongoose.models.RoomMessage || mongoose.model('RoomMessage', roomMessageSchema);

export default RoomMessage;
