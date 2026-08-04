const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', index: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, default: null },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  status: {
    type: String,
    enum: ['registered', 'waitlisted', 'cancelled'],
    default: 'registered',
  },
  qrToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Registration', registrationSchema);
