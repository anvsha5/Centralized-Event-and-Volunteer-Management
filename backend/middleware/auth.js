const mongoose = require('mongoose');
const User = require('../models/User');

async function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  if (!mongoose.Types.ObjectId.isValid(token)) return null;

  try {
    const user = await User.findById(token).select('_id email name role');
    return user || null;
  } catch (err) {
    return null;
  }
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
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };

  return next();
}

async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const token = header.slice(7);
    const user = await verifySessionToken(token);
    if (user) {
      req.user = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }
  }
  return next();
}

module.exports = { auth, optionalAuth, verifySessionToken };

