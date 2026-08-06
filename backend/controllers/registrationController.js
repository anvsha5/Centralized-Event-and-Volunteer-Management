const crypto = require('crypto');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { generateQR } = require('../services/qrService');

/**
 * Register for an event atomically checking capacity via MongoDB session transaction.
 */
exports.register = async (req, res) => {
  const { id: eventId } = req.params;
  const { name, email, phone, sessionId } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  let registrationDoc = null;
  let transactionError = null;

  try {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const event = await Event.findById(eventId).session(session);
        if (!event) {
          throw new Error('EVENT_NOT_FOUND');
        }

        const registeredCount = await Registration.countDocuments({
          eventId,
          status: 'registered',
        }).session(session);

        const isAvailable = event.capacity && registeredCount < event.capacity;
        const status = isAvailable ? 'registered' : 'waitlisted';
        const qrToken = crypto.randomUUID();

        const [createdReg] = await Registration.create(
          [
            {
              eventId,
              sessionId: sessionId || null,
              name,
              email,
              phone: phone || '',
              status,
              qrToken,
            },
          ],
          { session }
        );

        registrationDoc = createdReg;
      });
    } finally {
      await session.endSession();
    }
  } catch (err) {
    transactionError = err;
  }

  // Fallback for standalone MongoDB instances without replica set / transaction support
  if (transactionError || !registrationDoc) {
    if (transactionError && transactionError.message === 'EVENT_NOT_FOUND') {
      return res.status(404).json({ error: 'Event not found' });
    }
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      const registeredCount = await Registration.countDocuments({
        eventId,
        status: 'registered',
      });
      const isAvailable = event.capacity && registeredCount < event.capacity;
      const status = isAvailable ? 'registered' : 'waitlisted';
      const qrToken = crypto.randomUUID();

      registrationDoc = await Registration.create({
        eventId,
        sessionId: sessionId || null,
        name,
        email,
        phone: phone || '',
        status,
        qrToken,
      });
    } catch (fallbackErr) {
      return res.status(500).json({ error: fallbackErr.message || 'Registration failed' });
    }
  }

  const qrCodeData = await generateQR(registrationDoc.qrToken);
  console.log(
    `[EMAIL STUB] Confirmation sent to ${email} for event ${eventId}. Status: ${registrationDoc.status}`
  );

  return res.status(201).json({
    registration: registrationDoc,
    qrCode: qrCodeData,
  });
};

/**
 * Cancel a registration and automatically promote the earliest waitlisted attendee if available.
 */
exports.cancelRegistration = async (req, res) => {
  const { id } = req.params;

  try {
    const reg = await Registration.findById(id);
    if (!reg) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const wasRegistered = reg.status === 'registered';
    reg.status = 'cancelled';
    await reg.save();

    let promotedRegistration = null;

    if (wasRegistered) {
      const waitlisted = await Registration.findOne({
        eventId: reg.eventId,
        status: 'waitlisted',
      }).sort({ createdAt: 1 });

      if (waitlisted) {
        waitlisted.status = 'registered';
        waitlisted.qrToken = crypto.randomUUID();
        await waitlisted.save();
        promotedRegistration = waitlisted;

        console.log(
          `[EMAIL STUB] Auto-promotion notification sent to ${waitlisted.email} for event ${reg.eventId}.`
        );
      }
    }

    return res.json({
      message: 'Registration cancelled',
      registration: reg,
      promotedRegistration,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to cancel registration' });
  }
};

/**
 * Get registration details along with generated QR code.
 */
exports.getRegistration = async (req, res) => {
  const { id } = req.params;
  try {
    const reg = await Registration.findById(id).populate('eventId');
    if (!reg) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const qrCodeData = await generateQR(reg.qrToken);
    return res.json({
      registration: reg,
      qrCode: qrCodeData,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to fetch registration' });
  }
};

/**
 * Task 5.A.2 — Manual override search
 * GET /api/registrations?eventId=&query=
 */
exports.searchRegistrations = async (req, res) => {
  const { eventId, query } = req.query;

  try {
    const filter = {};
    if (eventId) {
      filter.eventId = eventId;
    }
    if (query && query.trim() !== '') {
      const regex = new RegExp(query.trim(), 'i');
      filter.$or = [{ name: regex }, { phone: regex }, { email: regex }];
    }

    const registrations = await Registration.find(filter).limit(50).sort({ name: 1 });
    return res.json(registrations);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to search registrations' });
  }
};

