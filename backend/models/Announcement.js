const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', index: true },
  message: { type: String, required: true },
  target: {
    type: {
      type: String,
      enum: ['all', 'session'],
      default: 'all',
    },
    sessionId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Announcement', announcementSchema);
