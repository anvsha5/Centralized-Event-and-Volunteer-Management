const mongoose = require('mongoose');

const volunteerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true },
  skills: [{ type: String }],
  availability: [{ type: String }],
  reliabilityScore: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('VolunteerProfile', volunteerProfileSchema);
