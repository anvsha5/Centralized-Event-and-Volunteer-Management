require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const VolunteerProfile = require('../models/VolunteerProfile');
const Task = require('../models/Task');
const TaskAssignment = require('../models/TaskAssignment');
const Event = require('../models/Event');
const { recalculateScore } = require('../services/reliabilityService');

const SKILL_POOL = [
  'Technical Support',
  'Hospitality',
  'Stage Management',
  'Registration & Checkin',
  'Logistics & Audio',
  'Security & Crowd Control',
  'Design & Media',
  'First Aid',
];

const AVAILABILITY_POOL = ['morning shift', 'afternoon shift', 'evening shift', 'full day'];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMany(arr, count) {
  const copy = [...arr];
  const picked = [];
  while (copy.length > 0 && picked.length < count) {
    const idx = Math.floor(Math.random() * copy.length);
    picked.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return picked;
}

async function ensureSeedEvent(organizerId) {
  let event = await Event.findOne({ title: 'Phase6 Trust Card Seed Event' });
  if (event) return event;

  event = await Event.create({
    organizerId,
    title: 'Phase6 Trust Card Seed Event',
    description: 'Seed event for trust card demo data',
    venue: 'Main Hall',
    capacity: 500,
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 26 * 60 * 60 * 1000),
    registrationDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
    category: 'workshop',
    status: 'live',
    sessions: [],
    resources: [],
  });

  return event;
}

async function seed() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event-volunteer-portal';
  await mongoose.connect(mongoUri);

  let organizer = await User.findOne({ email: 'organizer.seed@example.com' });
  if (!organizer) {
    organizer = await User.create({
      email: 'organizer.seed@example.com',
      name: 'Seed Organizer',
      role: 'organizer',
    });
  }

  const event = await ensureSeedEvent(organizer._id);

  const volunteers = [];
  for (let i = 1; i <= 10; i += 1) {
    const email = `volunteer.seed${i}@example.com`;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name: `Seed Volunteer ${i}`,
        role: 'volunteer',
      });
    }

    const skills = pickMany(SKILL_POOL, 2 + (i % 3));
    const availability = pickMany(AVAILABILITY_POOL, 1 + (i % 2));

    await VolunteerProfile.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        skills,
        availability,
        reliabilityScore: null,
      },
      { upsert: true, new: true, runValidators: true }
    );

    volunteers.push(user);
  }

  const tasks = [];
  for (let i = 1; i <= 20; i += 1) {
    const start = new Date(Date.now() + (i + 2) * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 45 * 60 * 1000);

    const task = await Task.create({
      eventId: event._id,
      title: `Seed Task ${i}`,
      description: 'Generated for trust card seeding',
      location: `Zone ${((i - 1) % 5) + 1}`,
      startTime: start,
      endTime: end,
      requiredSkills: pickMany(SKILL_POOL, 2),
    });

    tasks.push(task);
  }

  for (let i = 0; i < tasks.length; i += 1) {
    const task = tasks[i];
    const volunteer = volunteers[i % volunteers.length];

    const statusRoll = i % 5;
    const status = statusRoll === 0 ? 'no_show' : 'completed';

    await TaskAssignment.create({
      taskId: task._id,
      volunteerId: volunteer._id,
      status,
    });
  }

  for (const volunteer of volunteers) {
    await recalculateScore(volunteer._id);
  }

  console.log('Seed complete: volunteers, profiles, tasks, assignments, and reliability scores updated.');
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
