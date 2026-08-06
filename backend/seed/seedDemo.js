require('dotenv').config();
const crypto = require('crypto');
const mongoose = require('mongoose');

const Registration = require('../models/Registration');
const Checkin = require('../models/Checkin');
const Issue = require('../models/Issue');
const Event = require('../models/Event');
const User = require('../models/User');

async function seedDemoExtras() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event-volunteer-portal';
  await mongoose.connect(mongoUri);

  const event = await Event.findOne({ title: 'TechRush Demo Event' });
  if (!event) {
    throw new Error('Run npm run seed first — TechRush Demo Event not found.');
  }

  const organizer = await User.findOne({ email: 'organizer.seed@example.com' });
  const volunteer = await User.findOne({ email: 'volunteer.seed1@example.com' });

  const attendeeSeeds = [
    { name: 'Alex Rivera', email: 'attendee.demo1@example.com', phone: '555-0101' },
    { name: 'Jordan Lee', email: 'attendee.demo2@example.com', phone: '555-0102' },
    { name: 'Sam Patel', email: 'attendee.demo3@example.com', phone: '555-0103' },
    { name: 'Casey Morgan', email: 'attendee.demo4@example.com', phone: '555-0104' },
    { name: 'Riley Chen', email: 'attendee.demo5@example.com', phone: '555-0105' },
  ];

  const registrations = [];
  for (const attendee of attendeeSeeds) {
    let registration = await Registration.findOne({ eventId: event._id, email: attendee.email });
    if (!registration) {
      registration = await Registration.create({
        eventId: event._id,
        name: attendee.name,
        email: attendee.email,
        phone: attendee.phone,
        status: 'registered',
        qrToken: crypto.randomUUID(),
      });
    }
    registrations.push(registration);
  }

  for (let i = 0; i < registrations.length; i += 1) {
    const registration = registrations[i];
    const hasCheckin = await Checkin.findOne({
      registrationId: registration._id,
      type: 'checkin',
    });

    if (!hasCheckin && i < 4) {
      await Checkin.create({
        registrationId: registration._id,
        eventId: event._id,
        type: 'checkin',
        createdAt: new Date(Date.now() - (4 - i) * 15 * 60 * 1000),
      });
    }

    if (i < 2) {
      const hasCheckout = await Checkin.findOne({
        registrationId: registration._id,
        type: 'checkout',
      });
      if (!hasCheckout) {
        await Checkin.create({
          registrationId: registration._id,
          eventId: event._id,
          type: 'checkout',
          createdAt: new Date(Date.now() - (2 - i) * 10 * 60 * 1000),
        });
      }
    }
  }

  const issueSeeds = [
    {
      type: 'Audio feedback',
      location: 'Hall A stage',
      priority: 'high',
      teamTag: 'technical',
      status: 'new',
    },
    {
      type: 'Water station empty',
      location: 'Lobby north',
      priority: 'medium',
      teamTag: 'hospitality',
      status: 'in_progress',
    },
    {
      type: 'Cabling hazard',
      location: 'Hall B entrance',
      priority: 'low',
      teamTag: 'general',
      status: 'resolved',
      resolvedAt: new Date(),
    },
  ];

  for (const issue of issueSeeds) {
    const exists = await Issue.findOne({
      eventId: event._id,
      type: issue.type,
      location: issue.location,
    });
    if (!exists) {
      await Issue.create({
        eventId: event._id,
        reportedBy: volunteer?._id || organizer?._id,
        ...issue,
      });
    }
  }

  console.log('Demo extras seeded: attendees, check-ins, and sample issues.');
  await mongoose.disconnect();
}

seedDemoExtras().catch(async (error) => {
  console.error('Demo seed failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
