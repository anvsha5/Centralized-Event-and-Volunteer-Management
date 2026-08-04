require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const User = require('../models/User');
const authController = require('../controllers/authController');

async function runTests() {
  console.log('Testing Block 1.A...');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // Clean test users
    await User.deleteMany({ email: { $in: ['test_volunteer@example.com', 'test_organizer@example.com', 'test_default@example.com'] } });

    // Test 1: Request OTP
    const req1 = { body: { email: 'test_volunteer@example.com' } };
    const res1 = { json: (data) => console.log('Req OTP res:', data), status: (code) => res1 };
    await authController.requestOtp(req1, res1);

    // Test 2: Verify OTP with ?intent=volunteer
    const req2 = {
      body: { email: 'test_volunteer@example.com', otp: '123456' },
      query: { intent: 'volunteer' }
    };
    let returnedToken = null;
    const res2 = {
      json: (data) => {
        console.log('Verify OTP res:', data);
        returnedToken = data.token;
      },
      status: (code) => res2
    };
    await authController.verifyOtp(req2, res2);

    // Verify User doc role
    const volUser = await User.findOne({ email: 'test_volunteer@example.com' });
    console.log('Created user role:', volUser?.role);
    if (volUser?.role !== 'volunteer') throw new Error('Role should be volunteer');

    // Test 3: GET /api/me simulation
    const req3 = { user: { id: volUser._id.toString(), email: volUser.email, name: volUser.name, role: volUser.role } };
    const res3 = {
      json: (data) => console.log('getMe res:', data),
      status: (code) => res3
    };
    await authController.getMe(req3, res3);

    console.log('--- BLOCK 1.A ALL VERIFICATIONS PASSED ---');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Verification failed:', err);
    process.exit(1);
  }
}

runTests();
