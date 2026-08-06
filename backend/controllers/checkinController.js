const Checkin = require('../models/Checkin');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Task = require('../models/Task');
const TaskAssignment = require('../models/TaskAssignment');

/**
 * Task 5.A.1 — Check-in endpoint with duplicate detection
 * POST /api/checkins
 */
exports.createCheckin = async (req, res) => {
  const { qrToken, registrationId, eventId, type = 'checkin' } = req.body;

  try {
    let registration = null;
    if (qrToken) {
      registration = await Registration.findOne({ qrToken });
    } else if (registrationId) {
      registration = await Registration.findById(registrationId);
    }

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (eventId && registration.eventId.toString() !== eventId.toString()) {
      return res.status(400).json({ error: 'QR token does not match event' });
    }

    // Check duplicate scan within last 10 seconds
    const tenSecondsAgo = new Date(Date.now() - 10000);
    const duplicateScan = await Checkin.findOne({
      registrationId: registration._id,
      type,
      createdAt: { $gte: tenSecondsAgo },
    });

    if (duplicateScan) {
      return res.status(400).json({
        error: 'Duplicate scan detected. Please wait 10 seconds before scanning again.',
      });
    }

    const checkin = await Checkin.create({
      registrationId: registration._id,
      eventId: registration.eventId,
      type,
    });

    return res.status(201).json({
      message: 'Check-in successful',
      checkin,
      registration,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to process check-in' });
  }
};

/**
 * Task 5.A.3 — Extended live aggregation endpoint
 * GET /api/events/:id/checkins/live
 */
exports.getLiveCheckins = async (req, res) => {
  const { id: eventId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // 1. Registered count
    const registered = await Registration.countDocuments({
      eventId,
      status: { $ne: 'cancelled' },
    });

    // 2. Fetch checkins for this event
    const checkins = await Checkin.find({ eventId }).sort({ createdAt: 1 });

    // Group checkins by registrationId
    const regCheckinsMap = new Map();
    checkins.forEach((c) => {
      const regId = c.registrationId.toString();
      if (!regCheckinsMap.has(regId)) {
        regCheckinsMap.set(regId, []);
      }
      regCheckinsMap.get(regId).push(c);
    });

    let checkedIn = 0;
    let inside = 0;
    let left = 0;

    regCheckinsMap.forEach((userCheckins) => {
      const hasCheckin = userCheckins.some((c) => c.type === 'checkin');
      if (hasCheckin) {
        checkedIn += 1;
      }

      const latest = userCheckins[userCheckins.length - 1];
      if (latest.type === 'checkin') {
        inside += 1;
      } else if (latest.type === 'checkout') {
        left += 1;
      }
    });

    // 3. Capacity & Occupancy %
    const capacity = event.capacity || 0;
    const occupancyPercent = capacity > 0 ? Math.round((inside / capacity) * 100) : 0;

    // 4. Active Volunteers count
    const tasks = await Task.find({ eventId }).select('_id');
    const taskIds = tasks.map((t) => t._id);
    const activeVolunteers = await TaskAssignment.countDocuments({
      taskId: { $in: taskIds },
      status: { $in: ['assigned', 'in_progress'] },
    });

    // 5. Event status
    const eventStatus = event.status || 'Upcoming';

    return res.json({
      registered,
      checkedIn,
      inside,
      left,
      capacity,
      occupancyPercent,
      activeVolunteers,
      eventStatus,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to fetch live checkin metrics' });
  }
};
