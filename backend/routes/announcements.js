const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Announcement = require('../models/Announcement');
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');

// POST /api/events/:id/announcements
router.post('/:id/announcements', auth, async (req, res) => {
  try {
    const { message, target } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    let targetType = target?.type || 'all';
    let sessionId = target?.sessionId || null;

    // Fall back to 'all' if target is 'session' but event has no sessions
    if (targetType === 'session') {
      const hasSessions = Array.isArray(event.sessions) && event.sessions.length > 0;
      if (!hasSessions) {
        targetType = 'all';
        sessionId = null;
      }
    }

    const announcement = new Announcement({
      eventId: req.params.id,
      message: message.trim(),
      target: {
        type: targetType,
        sessionId: targetType === 'session' ? sessionId : null,
      },
    });

    await announcement.save();
    return res.status(201).json(announcement);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to create announcement' });
  }
});

// GET /api/events/:id/announcements?sessionId=
router.get('/:id/announcements', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const { sessionId } = req.query;

    const query = { eventId: req.params.id };

    if (sessionId) {
      query.$or = [
        { 'target.type': 'all' },
        { 'target.type': 'session', 'target.sessionId': sessionId },
      ];
    }

    const announcements = await Announcement.find(query).sort({ createdAt: -1 });
    return res.json(announcements);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to fetch announcements' });
  }
});

module.exports = router;
