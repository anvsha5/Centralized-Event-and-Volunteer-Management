const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

router.get('/notifications/me', auth, notificationController.getMyNotifications);
router.patch('/notifications/:id/read', auth, notificationController.markAsRead);

module.exports = router;
