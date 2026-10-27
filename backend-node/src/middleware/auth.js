// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ error: 'Missing token' });

  jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err, user) => {
    if (err) {
      logger.error('JWT verification failed');
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user; // attach payload (e.g., { userId })
    next();
  });
}

module.exports = authMiddleware;
