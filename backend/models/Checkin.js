const mongoose = require('mongoose');

const checkinSchema = new mongoose.Schema({
  registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', index: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', index: true },
  type: { type: String, enum: ['checkin', 'checkout'], required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Checkin', checkinSchema);
