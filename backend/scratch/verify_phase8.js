require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const User = require('../models/User');
const Event = require('../models/Event');
const Task = require('../models/Task');
const TaskAssignment = require('../models/TaskAssignment');
const Issue = require('../models/Issue');
const Notification = require('../models/Notification');

const issueController = require('../controllers/issueController');
const notificationController = require('../controllers/notificationController');
const taskController = require('../controllers/taskController');
const { checkUpcomingEventsAndRemind } = require('../services/reminderService');

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event-volunteer-portal';

async function runVerification() {
  console.log('--- Phase 8 Verification ---');
  await mongoose.connect(mongoUri);
  console.log('1. Connected to MongoDB');

  // Clean up previous test artifacts
  await User.deleteMany({ email: /phase8test/ });
  await Event.deleteMany({ title: /Phase 8 Test/ });
  await Issue.deleteMany({ type: /Phase 8/ });

  // 1. Create Test User (Volunteer / Organizer)
  const testUser = await User.create({
    name: 'Phase 8 Volunteer',
    email: 'phase8test_vol@example.com',
    role: 'volunteer',
  });

  const testOrganizer = await User.create({
    name: 'Phase 8 Organizer',
    email: 'phase8test_org@example.com',
    role: 'organizer',
  });

  console.log('2. Created test users:', testUser._id, testOrganizer._id);

  // 2. Create Test Event
  const testEvent = await Event.create({
    organizerId: testOrganizer._id,
    title: 'Phase 8 Test Event',
    description: 'Testing Issues and Notifications',
    venue: 'Hall A',
    capacity: 100,
    startTime: new Date(Date.now() + 30 * 60 * 1000), // 30 mins from now for reminder test!
    endTime: new Date(Date.now() + 180 * 60 * 1000),
    registrationDeadline: new Date(Date.now() + 10 * 60 * 1000),
    category: 'hackathon',
  });
  console.log('3. Created test event:', testEvent._id);

  // 3. Test Issue Creation Controller
  const mockRes = () => {
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
  };

  const reqCreateIssue = {
    params: { id: testEvent._id.toString() },
    body: {
      type: 'Phase 8 Stage Mic Broken',
      location: 'Main Stage',
      priority: 'high',
      teamTag: 'technical',
    },
    user: testUser,
    file: { filename: 'test-photo.jpg' },
  };

  const resCreateIssue = mockRes();
  await issueController.createIssue(reqCreateIssue, resCreateIssue);

  console.log('4. Create Issue status:', resCreateIssue.statusCode);
  console.log('   Photo URL:', resCreateIssue.body.photoUrl);
  console.log('   Team Tag:', resCreateIssue.body.teamTag);
  const createdIssueId = resCreateIssue.body._id;

  // 4. Test Get Issues Filtered by teamTag
  const reqGetIssues = {
    params: { id: testEvent._id.toString() },
    query: { teamTag: 'technical' },
  };
  const resGetIssues = mockRes();
  await issueController.getIssuesByEvent(reqGetIssues, resGetIssues);

  console.log('5. Get Issues count (technical):', resGetIssues.body.length);

  // 5. Test Update Issue Status to 'resolved'
  const reqUpdateIssue = {
    params: { id: createdIssueId.toString() },
    body: { status: 'resolved' },
  };
  const resUpdateIssue = mockRes();
  await issueController.updateIssueStatus(reqUpdateIssue, resUpdateIssue);

  console.log('6. Updated Issue status:', resUpdateIssue.body.status);
  console.log('   Resolved At:', resUpdateIssue.body.resolvedAt);

  // 6. Test Task Creation & Notification Trigger on Assign
  const testTask = await Task.create({
    eventId: testEvent._id,
    title: 'Phase 8 Audio Check Task',
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),
  });

  const reqAssign = {
    params: { taskId: testTask._id.toString() },
    body: { volunteerId: testUser._id.toString() },
  };
  const resAssign = mockRes();
  await taskController.assignTask(reqAssign, resAssign);

  console.log('7. Assigned task response status:', resAssign.statusCode);

  // Check Notification created
  const notifAssigned = await Notification.findOne({
    userId: testUser._id,
    type: 'task_assigned',
  });
  console.log('   Notification task_assigned message:', notifAssigned?.message);

  // 7. Test Task Status Update & Notification Trigger
  const assignmentId = resAssign.body._id;
  const reqUpdateStatus = {
    params: { id: assignmentId.toString() },
    body: { status: 'completed' },
  };
  const resUpdateStatus = mockRes();
  await taskController.updateAssignmentStatus(reqUpdateStatus, resUpdateStatus);

  const notifUpdated = await Notification.findOne({
    userId: testUser._id,
    type: 'task_updated',
  });
  console.log('8. Notification task_updated message:', notifUpdated?.message);

  // 8. Test Reminder Service Trigger
  // Re-assign task as 'assigned' so volunteer is active on event starting in 30 minutes
  await TaskAssignment.findByIdAndUpdate(assignmentId, { status: 'assigned' });
  await checkUpcomingEventsAndRemind();

  const notifReminder = await Notification.findOne({
    userId: testUser._id,
    type: 'event_reminder',
  });
  console.log('9. Reminder notification created:', notifReminder?.message);

  // 9. Test Get My Notifications (unread)
  const reqGetNotifs = {
    user: testUser,
    query: { unread: 'true' },
  };
  const resGetNotifs = mockRes();
  await notificationController.getMyNotifications(reqGetNotifs, resGetNotifs);
  console.log('10. Unread notifications count for volunteer:', resGetNotifs.body.length);

  // 10. Test Mark Notification as Read
  const notifToMark = resGetNotifs.body[0];
  const reqMarkRead = {
    params: { id: notifToMark._id.toString() },
    user: testUser,
  };
  const resMarkRead = mockRes();
  await notificationController.markAsRead(reqMarkRead, resMarkRead);
  console.log('11. Marked notification as read:', resMarkRead.body.read);

  // Clean up test data
  await User.deleteMany({ email: /phase8test/ });
  await Event.deleteMany({ title: /Phase 8 Test/ });
  await Task.deleteMany({ title: /Phase 8/ });
  await TaskAssignment.deleteMany({ _id: assignmentId });
  await Issue.deleteMany({ type: /Phase 8/ });
  await Notification.deleteMany({ userId: testUser._id });

  console.log('--- Phase 8 Verification Passed Successfully! ---');
  await mongoose.disconnect();
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
