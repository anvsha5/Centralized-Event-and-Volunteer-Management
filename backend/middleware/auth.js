const User = require('../models/User');

async function verifySessionToken(token) {
  if (!token) return null;

  // Phase 1 will replace this with full OTP session token verification.
  const user = await User.findById(token).select('_id email name role');
  return user || null;
}

async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = header.slice(7);
  const user = await verifySessionToken(token);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  return next();
}

module.exports = { auth, verifySessionToken };
