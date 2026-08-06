const TaskAssignment = require('../models/TaskAssignment');
const VolunteerProfile = require('../models/VolunteerProfile');

async function recalculateScore(volunteerId) {
  const assignments = await TaskAssignment.find({ volunteerId }).select('status').lean();

  let completedCount = 0;
  let noShowCount = 0;

  for (const assignment of assignments) {
    if (assignment.status === 'completed') completedCount += 1;
    if (assignment.status === 'no_show') noShowCount += 1;
  }

  const denominator = completedCount + noShowCount;
  const reliabilityScore = denominator > 0 ? completedCount / denominator : null;

  await VolunteerProfile.findOneAndUpdate(
    { userId: volunteerId },
    { $set: { reliabilityScore } },
    { new: true }
  );

  return reliabilityScore;
}

module.exports = {
  recalculateScore,
};
