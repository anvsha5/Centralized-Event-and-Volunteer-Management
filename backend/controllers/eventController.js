const mongoose = require('mongoose');
const Event = require('../models/Event');

async function createEvent(req, res) {
  try {
    const {
      title,
      description,
      venue,
      capacity,
      startTime,
      endTime,
      registrationDeadline,
      category,
      status,
      sessions,
      resources,
    } = req.body;

    if (!title || capacity == null || !startTime || !endTime || !registrationDeadline) {
      return res.status(400).json({ error: 'Missing required event fields' });
    }

    const event = await Event.create({
      organizerId: req.user.id,
      title,
      description: description || '',
      venue: venue || '',
      capacity,
      startTime,
      endTime,
      registrationDeadline,
      category,
      status: status || 'draft',
      sessions: sessions || [],
      resources: (resources || []).map((resource) => ({
        name: resource.name,
        quantityNeeded: resource.quantityNeeded,
        status: resource.status || 'pending',
      })),
    });

    return res.status(201).json(event);
  } catch (error) {
    console.error('createEvent error:', error);
    return res.status(500).json({ error: 'Failed to create event' });
  }
}

async function getEvent(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid event id' });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.json(event);
  } catch (error) {
    console.error('getEvent error:', error);
    return res.status(500).json({ error: 'Failed to fetch event' });
  }
}

async function listEvents(req, res) {
  try {
    const { organizerId } = req.query;

    if (!organizerId) {
      return res.status(400).json({ error: 'organizerId query param is required' });
    }

    let filter;

    if (organizerId === 'me') {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      filter = { organizerId: req.user.id };
    } else {
      if (!mongoose.Types.ObjectId.isValid(organizerId)) {
        return res.status(400).json({ error: 'Invalid organizerId' });
      }
      filter = { organizerId };
    }

    const events = await Event.find(filter).sort({ createdAt: -1 });
    return res.json(events);
  } catch (error) {
    console.error('listEvents error:', error);
    return res.status(500).json({ error: 'Failed to list events' });
  }
}

async function updateEvent(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid event id' });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const {
      title,
      description,
      venue,
      capacity,
      startTime,
      endTime,
      registrationDeadline,
      category,
      status,
      sessions,
      resources,
    } = req.body;

    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (venue !== undefined) event.venue = venue;
    if (capacity !== undefined) event.capacity = capacity;
    if (startTime !== undefined) event.startTime = startTime;
    if (endTime !== undefined) event.endTime = endTime;
    if (registrationDeadline !== undefined) event.registrationDeadline = registrationDeadline;
    if (category !== undefined) event.category = category;
    if (status !== undefined) event.status = status;

    if (sessions !== undefined) {
      event.sessions = sessions;
    }

    if (resources !== undefined) {
      event.resources = resources.map((resource) => ({
        _id: resource._id,
        name: resource.name,
        quantityNeeded: resource.quantityNeeded,
        status: resource.status || 'pending',
      }));
    }

    await event.save();
    return res.json(event);
  } catch (error) {
    console.error('updateEvent error:', error);
    return res.status(500).json({ error: 'Failed to update event' });
  }
}

async function patchResourceStatus(req, res) {
  try {
    const { id, resourceId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({ error: 'Invalid event or resource id' });
    }

    if (!['pending', 'delivered'].includes(status)) {
      return res.status(400).json({ error: "status must be 'pending' or 'delivered'" });
    }

    const result = await Event.updateOne(
      { _id: id, 'resources._id': resourceId },
      { $set: { 'resources.$.status': status } },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Event or resource not found' });
    }

    const event = await Event.findById(id);
    return res.json(event);
  } catch (error) {
    console.error('patchResourceStatus error:', error);
    return res.status(500).json({ error: 'Failed to update resource status' });
  }
}

module.exports = {
  createEvent,
  getEvent,
  listEvents,
  updateEvent,
  patchResourceStatus,
};
