const jwt = require('jsonwebtoken');
const Role = require('../models/Role');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key_here');
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Unauthorized: Token has expired' });
    }
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

// Middleware to verify role and permission for a specific menu and action
const requirePermission = (menu, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: User context missing' });
      }

      // Super Admin bypasses all role checks
      if (req.user.role === 'Super Admin') {
        return next();
      }

      const roleDoc = await Role.findOne({ name: req.user.role });
      if (!roleDoc) {
        return res.status(403).json({ message: 'Forbidden: Role not configured in system' });
      }

      const permission = roleDoc.permissions.find(p => p.menu === menu);
      if (!permission || !permission[action]) {
        return res.status(403).json({ message: `Forbidden: You do not have permission to ${action} on ${menu}` });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Server authorization error', error: error.message });
    }
  };
};

module.exports = { verifyToken, requirePermission };
