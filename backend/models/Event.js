const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topic: { type: String, default: '' },
  room: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
});

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantityNeeded: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'delivered'],
    default: 'pending',
  },
});

const eventSchema = new mongoose.Schema({
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  venue: { type: String, default: '' },
  capacity: { type: Number, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  category: {
    type: String,
    enum: ['hackathon', 'workshop', 'seminar', 'concert', 'tedx', 'sports', 'other'],
  },
  status: {
    type: String,
    enum: ['draft', 'live', 'closed', 'cancelled'],
    default: 'draft',
  },
  sessions: [sessionSchema],
  resources: [resourceSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Event', eventSchema);
