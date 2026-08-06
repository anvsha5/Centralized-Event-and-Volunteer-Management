const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const volunteerController = require('../controllers/volunteerController');
const { auth } = require('../middleware/auth');
const VolunteerProfile = require('../models/VolunteerProfile');
const TaskAssignment = require('../models/TaskAssignment');
const { summarizeVolunteer, summarizeSkillMatch } = require('../services/aiService');

// Volunteer profile onboarding/update
router.post('/volunteer-profiles', auth, volunteerController.upsertProfile);

// Get logged in volunteer profile
router.get('/volunteers/me/profile', auth, volunteerController.getMyProfile);

// Get logged in volunteer assigned tasks
router.get('/volunteers/me/tasks', auth, volunteerController.getMyTasks);

// GET /api/volunteers/:id/trust-card
router.get('/volunteers/:id/trust-card', auth, async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ error: 'Invalid volunteer id' });
		}

		if (req.user.role === 'volunteer' && req.user.id !== id) {
			return res.status(403).json({ error: 'Forbidden' });
		}

		const profile = await VolunteerProfile.findOne({ userId: id }).lean();
		if (!profile) {
			return res.status(404).json({ error: 'Volunteer profile not found' });
		}

		const assignments = await TaskAssignment.find({ volunteerId: id })
			.populate('taskId', 'title')
			.sort({ createdAt: -1 })
			.lean();

		const completedAssignments = assignments.filter((a) => a.status === 'completed');
		const noShowAssignments = assignments.filter((a) => a.status === 'no_show');

		const recentTaskTitles = completedAssignments
			.map((a) => a.taskId?.title)
			.filter(Boolean)
			.slice(0, 5);

		const stats = {
			skills: Array.isArray(profile.skills) ? profile.skills : [],
			reliabilityScore: profile.reliabilityScore,
			completedCount: completedAssignments.length,
			noShowCount: noShowAssignments.length,
			recentTaskTitles,
		};

		const [reliabilitySummary, skillMatchSummary] = await Promise.all([
			summarizeVolunteer(stats),
			summarizeSkillMatch(stats),
		]);

		return res.status(200).json({
			skills: stats.skills,
			reliabilityScore: stats.reliabilityScore,
			reliabilitySummary,
			skillMatchSummary,
			recentTasks: recentTaskTitles,
		});
	} catch (error) {
		console.error('Error fetching trust card:', error);
		return res.status(500).json({ error: 'Failed to fetch trust card' });
	}
});

module.exports = router;
