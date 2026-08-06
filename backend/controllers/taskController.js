const Task = require('../models/Task');
const TaskAssignment = require('../models/TaskAssignment');
const VolunteerProfile = require('../models/VolunteerProfile');
const { recalculateScore } = require('../services/reliabilityService');

// POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const { eventId, title, description, location, startTime, endTime, requiredSkills } = req.body;

    if (!eventId || !title || !startTime || !endTime) {
      return res.status(400).json({ error: 'eventId, title, startTime, and endTime are required' });
    }

    const task = new Task({
      eventId,
      title,
      description: description || '',
      location: location || '',
      startTime,
      endTime,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
    });

    await task.save();
    return res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ error: 'Failed to create task' });
  }
};

// GET /api/tasks?eventId=...
exports.getTasksByEvent = async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = eventId ? { eventId } : {};

    const tasks = await Task.find(filter).sort({ startTime: 1 }).lean();

    // Fetch assignments for these tasks
    const taskIds = tasks.map((t) => t._id);
    const assignments = await TaskAssignment.find({ taskId: { $in: taskIds } })
      .populate('volunteerId', 'name email role')
      .lean();

    // Map assignments to tasks
    const assignmentsByTask = {};
    assignments.forEach((a) => {
      if (!assignmentsByTask[a.taskId]) {
        assignmentsByTask[a.taskId] = [];
      }
      assignmentsByTask[a.taskId].push(a);
    });

    const tasksWithAssignments = tasks.map((t) => ({
      ...t,
      assignments: assignmentsByTask[t._id] || [],
    }));

    return res.status(200).json(tasksWithAssignments);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// GET /api/tasks/:taskId/suggested-volunteers
exports.getSuggestedVolunteers = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Fetch all volunteer profiles populated with user details
    const volunteerProfiles = await VolunteerProfile.find()
      .populate('userId', 'name email role')
      .lean();

    const taskSkills = (task.requiredSkills || []).map((s) => s.toLowerCase());

    const scoredVolunteers = volunteerProfiles
      .filter((profile) => profile.userId) // Ensure valid user reference
      .map((profile) => {
        const volunteerSkills = (profile.skills || []).map((s) => s.toLowerCase());

        // 1. skillMatch
        let skillMatch = 1.0;
        if (taskSkills.length > 0) {
          const matchedCount = taskSkills.filter((ts) => volunteerSkills.includes(ts)).length;
          skillMatch = matchedCount / taskSkills.length;
        }

        // 2. availabilityMatch
        let availabilityMatch = 1.0;
        if (profile.availability && profile.availability.length > 0) {
          const startHour = new Date(task.startTime).getHours();
          let taskSlot = 'morning shift';
          if (startHour >= 12 && startHour < 17) taskSlot = 'afternoon shift';
          if (startHour >= 17) taskSlot = 'evening shift';

          const hasMatch = profile.availability.some((a) => {
            const lower = a.toLowerCase();
            return (
              lower.includes('full day') ||
              lower === 'full_day' ||
              lower === 'all' ||
              lower === taskSlot
            );
          });
          availabilityMatch = hasMatch ? 1.0 : 0.5;
        }

        // 3. reliabilityScore (defaults to 0.5 if null/undefined)
        const reliability =
          profile.reliabilityScore !== null && profile.reliabilityScore !== undefined
            ? profile.reliabilityScore
            : 0.5;

        // Formula: skillMatch * 0.5 + availabilityMatch * 0.3 + (reliabilityScore || 0.5) * 0.2
        const rawScore = skillMatch * 0.5 + availabilityMatch * 0.3 + reliability * 0.2;
        const score = Math.round(rawScore * 100) / 100;

        return {
          volunteerProfileId: profile._id,
          volunteerId: profile.userId._id,
          name: profile.userId.name,
          email: profile.userId.email,
          skills: profile.skills || [],
          availability: profile.availability || [],
          reliabilityScore: profile.reliabilityScore,
          score,
          skillMatch: Math.round(skillMatch * 100) / 100,
          availabilityMatch: Math.round(availabilityMatch * 100) / 100,
        };
      });

    // Sort descending by score
    scoredVolunteers.sort((a, b) => b.score - a.score);

    return res.status(200).json(scoredVolunteers);
  } catch (error) {
    console.error('Error calculating suggested volunteers:', error);
    return res.status(500).json({ error: 'Failed to get suggested volunteers' });
  }
};

// POST /api/tasks/:taskId/assign
exports.assignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { volunteerId } = req.body;

    if (!volunteerId) {
      return res.status(400).json({ error: 'volunteerId is required' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Upsert or create assignment
    let assignment = await TaskAssignment.findOne({ taskId, volunteerId });
    if (assignment) {
      assignment.status = 'assigned';
      await assignment.save();
    } else {
      assignment = new TaskAssignment({
        taskId,
        volunteerId,
        status: 'assigned',
      });
      await assignment.save();
    }

    await assignment.populate('volunteerId', 'name email role');
    await assignment.populate('taskId');

    return res.status(201).json(assignment);
  } catch (error) {
    console.error('Error assigning task:', error);
    return res.status(500).json({ error: 'Failed to assign task' });
  }
};

// PUT /api/task-assignments/:id/status
exports.updateAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['assigned', 'in_progress', 'completed', 'no_show', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const assignment = await TaskAssignment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('volunteerId', 'name email role')
      .populate('taskId');

    if (!assignment) {
      return res.status(404).json({ error: 'Task assignment not found' });
    }

    await recalculateScore(assignment.volunteerId?._id || assignment.volunteerId);

    return res.status(200).json(assignment);
  } catch (error) {
    console.error('Error updating task assignment status:', error);
    return res.status(500).json({ error: 'Failed to update task assignment status' });
  }
};
