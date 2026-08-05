const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const eventController = require('../controllers/eventController');

router.post('/', auth, roleGuard('organizer'), eventController.createEvent);
router.get('/', auth, eventController.listEvents);
router.get('/:id', eventController.getEvent);
router.put('/:id', auth, roleGuard('organizer'), eventController.updateEvent);
router.patch('/:id/resources/:resourceId', auth, eventController.patchResourceStatus);

module.exports = router;
