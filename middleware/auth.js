const { UnauthenticatedError, UnauthorizedError } = require('../errors');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateUser = async (req, res, next) => {
  try {
    // Check header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid auth header found');
      throw new UnauthenticatedError('Authentication invalid');
    }
    const token = authHeader.split(' ')[1];

    let payload;
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new UnauthenticatedError('JWT configuration error');
      }
      payload = jwt.verify(token, jwtSecret);
      console.log('JWT verified, userId:', payload.userId);
    } catch (error) {
      console.log('JWT verification failed:', error.message);
      throw new UnauthenticatedError('Authentication invalid');
    }

    // Fetch full user from database to ensure _id is available
    console.log('Fetching user with ID:', payload.userId);
    const user = await User.findById(payload.userId).lean();
    console.log('User lookup result:', user ? 'Found' : 'Not found');
    
    if (!user) {
      console.log('User not found in database:', payload.userId);
      throw new UnauthenticatedError('User not found');
    }
    
    // Ensure _id exists - use fallback to payload.userId if needed
    let userId = payload.userId;
    if (user._id !== undefined && user._id !== null) {
      userId = String(user._id);
    }
    console.log('User found. Using ID:', userId, 'Role:', user.role);
    
    // Attach the user to the routes
    req.user = { 
      _id: userId,
      userId: payload.userId, 
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      permissions: payload.permissions || {},
      customPermissions: user.customPermissions || {}  // Add custom permissions
    };
    console.log('req.user set successfully');
    next();
  } catch (error) {
    console.error('Auth Error:', error.message, error.statusCode);
    next(error);
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
