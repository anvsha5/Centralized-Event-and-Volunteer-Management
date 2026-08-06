const Issue = require('../models/Issue');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

// POST /api/events/:id/issues
exports.createIssue = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const { type, location, priority, teamTag } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'Issue type is required' });
    }

    const eventExists = await Event.findById(eventId);
    if (!eventExists) {
      return res.status(404).json({ error: 'Event not found' });
    }

    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/issues/${req.file.filename}`;
    }

    const issue = new Issue({
      eventId,
      reportedBy: req.user ? req.user._id : null,
      type,
      location: location || '',
      priority: priority || 'medium',
      teamTag: teamTag || 'general',
      photoUrl,
      status: 'new',
    });

    await issue.save();
    await issue.populate('reportedBy', 'name email role');

    // Create Notification trigger for organizer (issue_assigned) if organizer exists
    if (eventExists.organizerId) {
      try {
        await Notification.create({
          userId: eventExists.organizerId,
          eventId: eventExists._id,
          type: 'issue_assigned',
          message: `New ${issue.teamTag} issue reported: "${issue.type}" at ${issue.location || 'venue'}`,
          relatedId: issue._id,
          read: false,
        });
      } catch (notifErr) {
        console.error('Failed to create issue_assigned notification:', notifErr);
      }
    }

    return res.status(201).json(issue);
  } catch (error) {
    console.error('Error creating issue:', error);
    return res.status(500).json({ error: 'Failed to create issue' });
  }
};

// GET /api/events/:id/issues?teamTag=...
exports.getIssuesByEvent = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const { teamTag } = req.query;

    const filter = { eventId };
    if (teamTag) {
      filter.teamTag = teamTag;
    }

    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'name email role')
      .lean();

    return res.status(200).json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    return res.status(500).json({ error: 'Failed to fetch issues' });
  }
};

// PUT /api/issues/:id
exports.updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'in_progress', 'resolved'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    issue.status = status;
    if (status === 'resolved') {
      issue.resolvedAt = new Date();
    } else {
      issue.resolvedAt = null;
    }

    await issue.save();
    await issue.populate('reportedBy', 'name email role');

    return res.status(200).json(issue);
  } catch (error) {
    console.error('Error updating issue status:', error);
    return res.status(500).json({ error: 'Failed to update issue status' });
  }
};
