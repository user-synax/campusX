import mongoose from 'mongoose';

const studyRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  subject: {
    type: String,
    trim: true,
    maxlength: 50,
    default: '',
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  college: {
    type: String,
    trim: true,
    default: '',
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  canvasSnapshot: {
    type: String,
    default: '',
  },
  codeSnapshot: {
    code: {
      type: String,
      default: '// Start coding...',
    },
    language: {
      type: String,
      default: 'javascript',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 24 * 60 * 60 * 1000,
  },
});

studyRoomSchema.index({ creator: 1 });
studyRoomSchema.index({ college: 1 });
studyRoomSchema.index({ isPublic: 1 });
studyRoomSchema.index({ expiresAt: 1 });

const StudyRoom = mongoose.models.StudyRoom || mongoose.model('StudyRoom', studyRoomSchema);

export default StudyRoom;
