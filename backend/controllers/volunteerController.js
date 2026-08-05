const VolunteerProfile = require('../models/VolunteerProfile');
const TaskAssignment = require('../models/TaskAssignment');

// POST /api/volunteer-profiles
exports.upsertProfile = async (req, res) => {
  try {
    const { skills, availability } = req.body;
    const userId = req.user.id || req.user._id;

    const profile = await VolunteerProfile.findOneAndUpdate(
      { userId },
      {
        userId,
        skills: Array.isArray(skills) ? skills : [],
        availability: Array.isArray(availability) ? availability : [],
      },
      { upsert: true, new: true, runValidators: true }
    ).populate('userId', 'name email role');

    return res.status(200).json(profile);
  } catch (error) {
    console.error('Error upserting volunteer profile:', error);
    return res.status(500).json({ error: 'Failed to save volunteer profile' });
  }
};

// GET /api/volunteers/me/profile
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const profile = await VolunteerProfile.findOne({ userId }).populate('userId', 'name email role');
    if (!profile) {
      return res.status(404).json({ error: 'Volunteer profile not found' });
    }
    return res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching volunteer profile:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// GET /api/volunteers/me/tasks
exports.getMyTasks = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const assignments = await TaskAssignment.find({ volunteerId: userId })
      .populate({
        path: 'taskId',
        populate: {
          path: 'eventId',
          select: 'title venue category startTime endTime',
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching volunteer tasks:', error);
    return res.status(500).json({ error: 'Failed to fetch volunteer tasks' });
  }
};
