import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  college: String,
  createdAt: { type: Date, default: Date.now }
});

const Resource = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);

export default Resource;
