const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', index: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, required: true },
  location: { type: String, default: '' },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  photoUrl: { type: String, default: null },
  teamTag: {
    type: String,
    enum: ['technical', 'hospitality', 'stage', 'general'],
    default: 'general',
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved'],
    default: 'new',
  },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null },
});

issueSchema.index({ eventId: 1, teamTag: 1, status: 1 });

module.exports = mongoose.model('Issue', issueSchema);
