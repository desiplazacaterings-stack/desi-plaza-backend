const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateUser } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/authorization');
const { asyncHandler } = require('../utils/asyncHandler');

// Wrap authenticateUser in asyncHandler to catch any errors
const authMiddleware = asyncHandler(authenticateUser);

// All routes require authentication
router.use(authMiddleware);

// Permissions route - allow staff to view own permissions, admins to view any
router.get('/users/:id/permissions', asyncHandler(adminController.getUserPermissions));

// All other routes require admin role
router.use(asyncHandler(requireAdmin));

// User management routes
router.get('/users', asyncHandler(adminController.getAllUsers));
router.post('/users', asyncHandler(adminController.createUser));
router.get('/users/:id', asyncHandler(adminController.getUser));
router.patch('/users/:id', asyncHandler(adminController.updateUser));
router.delete('/users/:id', asyncHandler(adminController.deleteUser));

// User status and role management
router.patch('/users/:id/status', asyncHandler(adminController.changeUserStatus));
router.patch('/users/:id/role', asyncHandler(adminController.changeUserRole));
router.patch('/users/:id/reset-password', asyncHandler(adminController.resetUserPassword));

// Permission management routes
router.patch('/users/:id/permissions', asyncHandler(adminController.updateUserPermissions));

// Statistics and information routes
router.get('/statistics/users', asyncHandler(adminController.getUserStatistics));
router.get('/roles/available', asyncHandler(adminController.getAvailableRoles));

module.exports = router;
