const { UnauthenticatedError, UnauthorizedError } = require('../errors');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateUser = async (req, res, next) => {
  // Check header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Authentication invalid');
  }
  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    // Attach the user to the routes
    req.user = { 
      userId: payload.userId, 
      name: payload.name, 
      role: payload.role,
      status: payload.status,
      permissions: payload.permissions || {}
    };
    next();
  } catch (error) {
    throw new UnauthenticatedError('Authentication invalid');
  }
};

// Alias for backward compatibility
const authenticate = authenticateUser;

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError('Unauthorized to access this route');
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authenticate,
  authorizePermissions,
};
