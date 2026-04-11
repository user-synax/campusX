import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    required: true,
    enum: ['spam', 'harassment', 'inappropriate', 'misinformation', 'other'],
  },
  description: {
    type: String,
    maxlength: 500,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'dismissed', 'actioned'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ postId: 1 });

if (mongoose.models.Report) {
  delete mongoose.models.Report;
}

const Report = mongoose.model('Report', reportSchema);

export default Report;