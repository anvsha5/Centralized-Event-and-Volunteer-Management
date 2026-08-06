const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { auth } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// Task 12.A.1 — Funnel analytics
router.get(
  '/events/:id/analytics/funnel',
  auth,
  roleGuard('organizer'),
  analyticsController.getFunnel
);

// Task 12.A.2 — Extended analytics metrics
router.get(
  '/events/:id/analytics/extended',
  auth,
  roleGuard('organizer'),
  analyticsController.getExtended
);

// Task 12.A.3 — AI-generated analytics summary
router.get(
  '/events/:id/analytics/summary',
  auth,
  roleGuard('organizer'),
  analyticsController.getSummary
);

module.exports = router;
