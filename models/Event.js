import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: '',
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  college: {
    type: String,
    trim: true,
    required: true,
  },
  location: {
    type: String,
    trim: true,
    maxlength: 200,
    required: true,
  },
  eventDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v > Date.now();
      },
      message: 'Event date must be in the future'
    }
  },
  capacity: {
    type: Number,
    default: 0,
    min: 0, // 0 = unlimited
  },
  rsvps: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  tags: [{
    type: String,
    maxlength: 30,
  }],
  coverImage: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtuals
eventSchema.virtual('rsvpCount').get(function() {
  return this.rsvps ? this.rsvps.length : 0;
});

eventSchema.virtual('isFull').get(function() {
  if (this.capacity === 0) return false;
  return (this.rsvps ? this.rsvps.length : 0) >= this.capacity;
});

eventSchema.virtual('isPast').get(function() {
  return this.eventDate < new Date();
});

// Indexes
eventSchema.index({ eventDate: 1 });
eventSchema.index({ college: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ isActive: 1, eventDate: 1 });

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

export default Event;
