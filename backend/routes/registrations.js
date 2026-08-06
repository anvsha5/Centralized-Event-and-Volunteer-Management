const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

// Public route to register for an event
router.post('/events/:id/register', registrationController.register);

// Search registrations for manual override
router.get('/registrations', registrationController.searchRegistrations);

// Get registration details + QR
router.get('/registrations/:id', registrationController.getRegistration);


// Cancel registration
router.put('/registrations/:id/cancel', registrationController.cancelRegistration);

module.exports = router;
