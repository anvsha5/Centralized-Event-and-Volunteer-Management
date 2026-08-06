const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const Registration = require('../models/Registration');
const Checkin = require('../models/Checkin');
const Feedback = require('../models/Feedback');
const Certificate = require('../models/Certificate');
const { generateCertificate } = require('../services/certificateService');

// Public route to register for an event
router.post('/events/:id/register', registrationController.register);

// Search registrations for manual override
router.get('/registrations', registrationController.searchRegistrations);

// Get registration details + QR
router.get('/registrations/:id', registrationController.getRegistration);

router.get('/registrations/:id/certificate', async (req, res) => {
	const { id } = req.params;

	try {
		const registration = await Registration.findById(id).populate('eventId');
		if (!registration) {
			return res.status(404).json({ error: 'Registration not found' });
		}

		const checkin = await Checkin.findOne({ registrationId: id, type: 'checkin' });
		if (!checkin) {
			return res.status(403).json({ error: 'attendance_required' });
		}

		const feedback = await Feedback.findOne({ registrationId: id });
		if (!feedback) {
			return res.status(403).json({ error: 'feedback_required' });
		}

		let certificate = await Certificate.findOne({ registrationId: id });
		if (!certificate) {
			const content = generateCertificate(registration);
			try {
				certificate = await Certificate.create({ registrationId: id, content });
			} catch (err) {
				if (err.code === 11000) {
					certificate = await Certificate.findOne({ registrationId: id });
				} else {
					throw err;
				}
			}
		}

		return res.json({
			registration,
			certificate,
		});
	} catch (err) {
		return res.status(500).json({ error: err.message || 'Failed to fetch certificate' });
	}
});


// Cancel registration
router.put('/registrations/:id/cancel', registrationController.cancelRegistration);

module.exports = router;
