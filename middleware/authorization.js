const { UnauthorizedError } = require('../errors');

// Middleware to check if user has admin role
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError('Not authenticated');
  }
  
  if (req.user.role !== 'admin') {
    throw new UnauthorizedError('Access denied. Admin only');
  }
  
  next();
};

// Middleware to check if user has staff or admin role
const requireStaffOrAdmin = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError('Not authenticated');
  }
  
  if (req.user.role !== 'staff' && req.user.role !== 'admin') {
    throw new UnauthorizedError('Access denied. Staff or Admin only');
  }
  
  next();
};

// Middleware to check if user has specific permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }
    
    if (!req.user.permissions || !req.user.permissions[permission]) {
      throw new UnauthorizedError(`Access denied. Missing permission: ${permission}`);
    }
    
    next();
  };
};

// Middleware to check if user status is active
const checkUserStatus = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError('Not authenticated');
  }
  
  if (req.user.status !== 'active') {
    throw new UnauthorizedError('Your account is not active. Please contact administrator');
  }
  
  next();
};

module.exports = {
  requireAdmin,
  requireStaffOrAdmin,
  requirePermission,
  checkUserStatus
};
