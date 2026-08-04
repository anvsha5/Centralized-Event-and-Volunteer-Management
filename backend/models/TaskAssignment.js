const mongoose = require('mongoose');

const taskAssignmentSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', index: true },
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  status: {
    type: String,
    enum: ['assigned', 'completed', 'no_show', 'cancelled'],
    default: 'assigned',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TaskAssignment', taskAssignmentSchema);
