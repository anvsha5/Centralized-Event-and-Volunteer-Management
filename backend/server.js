require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes (unprotected)
const authRoutes = require('./routes/auth');
const { auth } = require('./middleware/auth');
const authController = require('./controllers/authController');

app.use('/api/auth', authRoutes);
app.get('/api/me', auth, authController.getMe);

const eventRoutes = require('./routes/events');
app.use('/api/events', eventRoutes);

const registrationRoutes = require('./routes/registrations');
app.use('/api', registrationRoutes);

const volunteerRoutes = require('./routes/volunteers');
app.use('/api', volunteerRoutes);

const taskRoutes = require('./routes/tasks');
app.use('/api', taskRoutes);

const checkinRoutes = require('./routes/checkins');
app.use('/api', checkinRoutes);

const issueRoutes = require('./routes/issues');
app.use('/api', issueRoutes);

const notificationRoutes = require('./routes/notifications');
app.use('/api', notificationRoutes);

const { startReminderService } = require('./services/reminderService');

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event-volunteer-portal';

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
    startReminderService();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
