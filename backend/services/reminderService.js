const Event = require('../models/Event');
const Task = require('../models/Task');
const TaskAssignment = require('../models/TaskAssignment');
const Notification = require('../models/Notification');

const checkUpcomingEventsAndRemind = async () => {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() + 25 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 35 * 60 * 1000);

    const upcomingEvents = await Event.find({
      startTime: { $gte: windowStart, $lte: windowEnd },
      status: { $ne: 'cancelled' },
    });

    for (const event of upcomingEvents) {
      const tasks = await Task.find({ eventId: event._id });
      if (tasks.length === 0) continue;

      const taskIds = tasks.map((t) => t._id);
      const assignments = await TaskAssignment.find({
        taskId: { $in: taskIds },
        status: { $in: ['assigned', 'in_progress'] },
      });

      for (const assignment of assignments) {
        const userId = assignment.volunteerId;
        if (!userId) continue;

        // Check if an event_reminder notification was already sent to this volunteer for this event
        const existingNotification = await Notification.findOne({
          userId,
          eventId: event._id,
          type: 'event_reminder',
        });

        if (!existingNotification) {
          await Notification.create({
            userId,
            eventId: event._id,
            type: 'event_reminder',
            message: `Event "${event.title}" starts in 30 minutes! Please check your tasks.`,
            relatedId: event._id,
            read: false,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error running reminder service check:', error);
  }
};

const startReminderService = () => {
  checkUpcomingEventsAndRemind();
  setInterval(checkUpcomingEventsAndRemind, 60 * 1000);
};

module.exports = {
  checkUpcomingEventsAndRemind,
  startReminderService,
};
