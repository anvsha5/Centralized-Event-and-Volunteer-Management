const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const { auth } = require('../middleware/auth');

// Volunteer profile onboarding/update
router.post('/volunteer-profiles', auth, volunteerController.upsertProfile);

// Get logged in volunteer profile
router.get('/volunteers/me/profile', auth, volunteerController.getMyProfile);

// Get logged in volunteer assigned tasks
router.get('/volunteers/me/tasks', auth, volunteerController.getMyTasks);

module.exports = router;
