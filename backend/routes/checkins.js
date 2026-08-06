const express = require('express');
const router = express.Router();
const checkinController = require('../controllers/checkinController');
const { auth } = require('../middleware/auth');

// POST /api/checkins (Task 5.A.1)
router.post('/checkins', auth, checkinController.createCheckin);

// GET /api/events/:id/checkins/live (Task 5.A.3)
router.get('/events/:id/checkins/live', auth, checkinController.getLiveCheckins);

module.exports = router;
