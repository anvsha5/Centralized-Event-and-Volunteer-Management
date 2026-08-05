const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { auth } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// Task endpoints
router.post('/tasks', auth, roleGuard('organizer'), taskController.createTask);
router.get('/tasks', auth, taskController.getTasksByEvent);
router.get('/tasks/:taskId/suggested-volunteers', auth, roleGuard('organizer'), taskController.getSuggestedVolunteers);
router.post('/tasks/:taskId/assign', auth, roleGuard('organizer'), taskController.assignTask);

// Task assignment status endpoint
router.put('/task-assignments/:id/status', auth, taskController.updateAssignmentStatus);

module.exports = router;
