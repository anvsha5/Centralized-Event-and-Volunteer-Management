const eventController = require('../controllers/eventController');
const Event = require('../models/Event');
const Task = require('../models/Task');
const TaskAssignment = require('../models/TaskAssignment');

function mockRes() {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
}

async function runUnitVerification() {
  console.log('--- Phase 9 Unit Verification ---');

  const now = new Date();
  const sessionTime = new Date(now.getTime() + 1000 * 60 * 30); // 30m
  const shiftTime = new Date(now.getTime() + 1000 * 60 * 15); // 15m

  // Mock Event.findById
  Event.findById = async (id) => ({
    _id: id,
    title: 'Test Event',
    venue: 'Main Auditorium',
    sessions: [
      {
        _id: 'sess_1',
        title: 'Keynote Talk',
        room: 'Hall A',
        speaker: 'Dr. Smith',
        startTime: sessionTime,
        endTime: new Date(now.getTime() + 1000 * 60 * 60),
      },
    ],
  });

  // Mock Task.find
  Task.find = async () => [
    {
      _id: 'task_1',
      eventId: 'event_123',
      title: 'Check-in Desk Shift',
      location: 'Entrance Gate',
      startTime: shiftTime,
      endTime: sessionTime,
    },
  ];

  // Mock TaskAssignment.find
  TaskAssignment.find = () => ({
    populate: () => ({
      populate: async () => [
        {
          _id: 'assign_1',
          taskId: {
            _id: 'task_1',
            title: 'Check-in Desk Shift',
            location: 'Entrance Gate',
            startTime: shiftTime,
            endTime: sessionTime,
          },
          volunteerId: {
            _id: 'vol_100',
            name: 'Alice Volunteer',
            email: 'alice@example.com',
          },
          status: 'assigned',
        },
      ],
    }),
  });

  const req = { params: { id: '507f1f77bcf86cd799439011' } };
  const res = mockRes();

  await eventController.getEventTimeline(req, res);

  console.log('1. Timeline Status:', res.statusCode || 200);
  console.log('2. Timeline Item Count:', res.body.length);
  console.log('3. Merged Items:');
  res.body.forEach((item, idx) => {
    console.log(
      `   [${idx + 1}] Type: ${item.type} | Title: "${item.title}" | Time: ${item.time}`
    );
  });

  // Verify sorting
  if (
    res.body.length === 2 &&
    res.body[0].type === 'shift' &&
    res.body[1].type === 'session' &&
    res.body[0].assignedTo === 'vol_100'
  ) {
    console.log('✅ SUCCESS: Timeline merging, sorting, and volunteer mapping verified!');
  } else {
    console.error('❌ ERROR: Verification assertion failed.');
  }
}

runUnitVerification().catch(console.error);
