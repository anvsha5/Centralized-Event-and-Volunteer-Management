const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Feedback = require('../models/Feedback');

router.post('/registrations/:id/feedback', async (req, res) => {
  const { id } = req.params;
  const { rating, comment = '' } = req.body;

  const parsedRating = Number(rating);
  if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ error: 'rating must be an integer from 1 to 5' });
  }

  try {
    const registration = await Registration.findById(id);
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const feedback = await Feedback.create({
      registrationId: id,
      rating: parsedRating,
      comment,
    });

    return res.status(201).json({ feedback });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Feedback already submitted' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message || 'Failed to submit feedback' });
  }
});

module.exports = router;