const User = require('../models/User');

// In-memory OTP storage for MVP
const otpMap = new Map();

/**
 * POST /api/auth/otp/request
 * Body: { email }
 */
async function requestOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    // Generate a 6-digit OTP (for dev/demo default to '123456' or random)
    const otp = '123456';
    otpMap.set(normalizedEmail, otp);

    console.log(`[OTP Request] Email: ${normalizedEmail}, OTP: ${otp}`);

    return res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('requestOtp error:', error);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
}

/**
 * POST /api/auth/otp/verify
 * Body: { email, otp }
 * Query: ?intent=volunteer | organizer | attendee (handled in 1.A.3, but safe to prepare)
 */
async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const storedOtp = otpMap.get(normalizedEmail);

    // Accept stored OTP or '123456' as master/dev fallback
    if (otp !== storedOtp && otp !== '123456') {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Clear used OTP
    otpMap.delete(normalizedEmail);

    // Determine intent from query param if brand new user
    const allowedRoles = ['organizer', 'volunteer', 'attendee'];
    const intent = req.query.intent && allowedRoles.includes(req.query.intent.toLowerCase())
      ? req.query.intent.toLowerCase()
      : 'attendee';

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0],
        role: intent,
      });
    }

    const token = user._id.toString();

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('verifyOtp error:', error);
    return res.status(500).json({ error: 'Verification failed' });
  }
}

/**
 * GET /api/me
 * Protected by auth middleware (req.user set)
 */
async function getMe(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
}

module.exports = {
  requestOtp,
  verifyOtp,
  getMe,
};
