const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  type: {
    type: String,
    enum: ['task_assigned', 'task_updated', 'shift_changed', 'event_reminder', 'issue_assigned'],
  },
  message: { type: String, required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
