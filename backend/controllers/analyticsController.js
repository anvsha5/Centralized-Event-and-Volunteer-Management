const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Checkin = require('../models/Checkin');
const Task = require('../models/Task');
const TaskAssignment = require('../models/TaskAssignment');
const VolunteerProfile = require('../models/VolunteerProfile');
const Issue = require('../models/Issue');
const { summarizeAnalytics } = require('../services/aiService');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function formatTime(date) {
  if (!date) return null;
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

async function computePeakTime(eventId, type) {
  const result = await Checkin.aggregate([
    { $match: { eventId: new mongoose.Types.ObjectId(eventId), type } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' },
          minute: { $minute: '$createdAt' },
        },
        count: { $sum: 1 },
        time: { $first: '$createdAt' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);

  if (result.length === 0) {
    return { time: null, count: 0 };
  }

  return {
    time: formatTime(result[0].time),
    count: result[0].count,
  };
}

async function computeMostCrowdedHall(event, eventId) {
  const sessionRoomMap = new Map();
  (event.sessions || []).forEach((session) => {
    sessionRoomMap.set(session._id.toString(), session.room);
  });

  const registrations = await Registration.find({
    eventId,
    status: { $ne: 'cancelled' },
  }).select('_id sessionId');

  const regRoomMap = new Map();
  registrations.forEach((reg) => {
    const room = reg.sessionId
      ? sessionRoomMap.get(reg.sessionId.toString()) || event.venue || 'Main Hall'
      : event.venue || 'Main Hall';
    regRoomMap.set(reg._id.toString(), room);
  });

  const checkins = await Checkin.find({ eventId }).sort({ createdAt: 1 });

  const roomEvents = {};
  checkins.forEach((checkin) => {
    const regId = checkin.registrationId.toString();
    const room = regRoomMap.get(regId) || event.venue || 'Main Hall';
    if (!roomEvents[room]) {
      roomEvents[room] = [];
    }
    roomEvents[room].push({
      time: checkin.createdAt.getTime(),
      delta: checkin.type === 'checkin' ? 1 : -1,
    });
  });

  let mostCrowdedHall = null;
  let peakOccupancy = 0;
  let peakOccupancyPercent = 0;

  const rooms = Object.keys(roomEvents);
  if (rooms.length === 0 && event.venue) {
    return {
      hall: event.venue,
      peakOccupancy: 0,
      peakOccupancyPercent: 0,
    };
  }

  rooms.forEach((room) => {
    const events = roomEvents[room].sort((a, b) => a.time - b.time);
    let current = 0;
    let roomPeak = 0;

    events.forEach((evt) => {
      current += evt.delta;
      if (current > roomPeak) {
        roomPeak = current;
      }
    });

    const roomCapacity = event.capacity || 1;
    const occupancyPct = Math.round((roomPeak / roomCapacity) * 100);

    if (roomPeak > peakOccupancy) {
      peakOccupancy = roomPeak;
      peakOccupancyPercent = occupancyPct;
      mostCrowdedHall = room;
    }
  });

  return {
    hall: mostCrowdedHall,
    peakOccupancy,
    peakOccupancyPercent,
  };
}

async function computeAverageStayTime(eventId) {
  const checkins = await Checkin.find({ eventId }).sort({ createdAt: 1 });

  const regCheckins = new Map();
  checkins.forEach((c) => {
    const regId = c.registrationId.toString();
    if (!regCheckins.has(regId)) {
      regCheckins.set(regId, []);
    }
    regCheckins.get(regId).push(c);
  });

  const durations = [];
  regCheckins.forEach((userCheckins) => {
    const checkinRecord = userCheckins.find((c) => c.type === 'checkin');
    const checkoutRecord = userCheckins.find((c) => c.type === 'checkout');
    if (checkinRecord && checkoutRecord) {
      const durationMs = checkoutRecord.createdAt - checkinRecord.createdAt;
      if (durationMs > 0) {
        durations.push(durationMs);
      }
    }
  });

  if (durations.length === 0) {
    return { averageMinutes: null, sampleSize: 0 };
  }

  const avgMs = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  return {
    averageMinutes: Math.round(avgMs / 60000),
    sampleSize: durations.length,
  };
}

async function computeVolunteerPerformance(eventId) {
  const tasks = await Task.find({ eventId }).select('_id');
  const taskIds = tasks.map((t) => t._id);

  if (taskIds.length === 0) {
    return {
      averageReliabilityScore: null,
      averageReliabilityPercent: null,
      topPerformers: [],
      volunteerCount: 0,
    };
  }

  const assignments = await TaskAssignment.find({ taskId: { $in: taskIds } });
  const volunteerIds = [...new Set(assignments.map((a) => a.volunteerId.toString()))];

  if (volunteerIds.length === 0) {
    return {
      averageReliabilityScore: null,
      averageReliabilityPercent: null,
      topPerformers: [],
      volunteerCount: 0,
    };
  }

  const profiles = await VolunteerProfile.find({
    userId: { $in: volunteerIds },
  }).populate('userId', 'name email');

  const scoredProfiles = profiles.filter(
    (p) => p.reliabilityScore !== null && p.reliabilityScore !== undefined
  );

  const averageReliabilityScore =
    scoredProfiles.length > 0
      ? scoredProfiles.reduce((sum, p) => sum + p.reliabilityScore, 0) / scoredProfiles.length
      : null;

  const topPerformers = scoredProfiles
    .sort((a, b) => b.reliabilityScore - a.reliabilityScore)
    .slice(0, 5)
    .map((p) => ({
      volunteerId: p.userId?._id || p.userId,
      name: p.userId?.name || p.userId?.email || 'Volunteer',
      reliabilityScore: p.reliabilityScore,
      reliabilityPercent: Math.round(p.reliabilityScore * 100),
      skills: p.skills || [],
    }));

  return {
    averageReliabilityScore,
    averageReliabilityPercent:
      averageReliabilityScore !== null ? Math.round(averageReliabilityScore * 100) : null,
    topPerformers,
    volunteerCount: volunteerIds.length,
  };
}

async function computeIssueCount(eventId) {
  const breakdown = await Issue.aggregate([
    { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: '$teamTag',
        count: { $sum: 1 },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
        },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const total = breakdown.reduce((sum, item) => sum + item.count, 0);
  const totalResolved = breakdown.reduce((sum, item) => sum + item.resolved, 0);

  return {
    total,
    totalResolved,
    totalUnresolved: total - totalResolved,
    byTeamTag: breakdown.map((item) => ({
      teamTag: item._id,
      count: item.count,
      resolved: item.resolved,
      unresolved: item.count - item.resolved,
    })),
  };
}

async function computeFunnelMetrics(eventId) {
  const registered = await Registration.countDocuments({
    eventId,
    status: { $ne: 'cancelled' },
  });

  const checkins = await Checkin.find({ eventId, type: 'checkin' });
  const checkedInRegistrationIds = new Set(
    checkins.map((c) => c.registrationId.toString())
  );
  const checkedIn = checkedInRegistrationIds.size;

  const allCheckins = await Checkin.find({ eventId }).sort({ createdAt: 1 });
  const regCheckinsMap = new Map();
  allCheckins.forEach((c) => {
    const regId = c.registrationId.toString();
    if (!regCheckinsMap.has(regId)) {
      regCheckinsMap.set(regId, []);
    }
    regCheckinsMap.get(regId).push(c);
  });

  let stayed = 0;
  regCheckinsMap.forEach((userCheckins) => {
    const hasCheckin = userCheckins.some((c) => c.type === 'checkin');
    const hasCheckout = userCheckins.some((c) => c.type === 'checkout');
    if (hasCheckin && hasCheckout) {
      stayed += 1;
    }
  });

  const dropOffPercent =
    registered > 0 ? Math.round(((registered - checkedIn) / registered) * 100) : 0;

  return { registered, checkedIn, stayed, dropOffPercent };
}

/**
 * Task 12.A.1 — Funnel endpoint
 * GET /api/events/:id/analytics/funnel
 */
exports.getFunnel = async (req, res) => {
  const { id: eventId } = req.params;

  if (!isValidObjectId(eventId)) {
    return res.status(400).json({ error: 'Invalid event ID' });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const funnel = await computeFunnelMetrics(eventId);
    return res.json(funnel);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to compute funnel analytics' });
  }
};

/**
 * Task 12.A.2 — Extended metrics aggregation
 * GET /api/events/:id/analytics/extended
 */
exports.getExtended = async (req, res) => {
  const { id: eventId } = req.params;

  if (!isValidObjectId(eventId)) {
    return res.status(400).json({ error: 'Invalid event ID' });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const [peakEntry, peakExit, crowdedHall, stayTime, volunteerPerformance, issueCount] =
      await Promise.all([
        computePeakTime(eventId, 'checkin'),
        computePeakTime(eventId, 'checkout'),
        computeMostCrowdedHall(event, eventId),
        computeAverageStayTime(eventId),
        computeVolunteerPerformance(eventId),
        computeIssueCount(eventId),
      ]);

    return res.json({
      peakEntryTime: peakEntry.time,
      peakEntryCount: peakEntry.count,
      peakExitTime: peakExit.time,
      peakExitCount: peakExit.count,
      mostCrowdedHall: crowdedHall.hall,
      mostCrowdedHallPeakOccupancy: crowdedHall.peakOccupancy,
      mostCrowdedHallPeakOccupancyPercent: crowdedHall.peakOccupancyPercent,
      averageStayTimeMinutes: stayTime.averageMinutes,
      averageStayTimeSampleSize: stayTime.sampleSize,
      volunteerPerformance,
      issueCount,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to compute extended analytics' });
  }
};

/**
 * Task 12.A.3 — AI narrative summary
 * GET /api/events/:id/analytics/summary
 */
exports.getSummary = async (req, res) => {
  const { id: eventId } = req.params;

  if (!isValidObjectId(eventId)) {
    return res.status(400).json({ error: 'Invalid event ID' });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const funnelData = await computeFunnelMetrics(eventId);

    if (funnelData.checkedIn === 0) {
      return res.json({ summary: 'Not enough data yet' });
    }

    const [peakEntry, peakExit, crowdedHall, stayTime, volunteerPerformance, issueCount] =
      await Promise.all([
        computePeakTime(eventId, 'checkin'),
        computePeakTime(eventId, 'checkout'),
        computeMostCrowdedHall(event, eventId),
        computeAverageStayTime(eventId),
        computeVolunteerPerformance(eventId),
        computeIssueCount(eventId),
      ]);

    const extendedData = {
      peakEntryTime: peakEntry.time,
      peakEntryCount: peakEntry.count,
      peakExitTime: peakExit.time,
      peakExitCount: peakExit.count,
      mostCrowdedHall: crowdedHall.hall,
      mostCrowdedHallPeakOccupancyPercent: crowdedHall.peakOccupancyPercent,
      averageStayTimeMinutes: stayTime.averageMinutes,
      volunteerPerformance,
      issueCount,
    };

    const summary = await summarizeAnalytics(funnelData, extendedData);
    return res.json({ summary });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to generate analytics summary' });
  }
};
