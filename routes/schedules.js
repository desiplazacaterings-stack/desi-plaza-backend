const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { authenticateUser } = require('../middleware/auth');

// POST /api/schedules - create a new schedule (requires createSchedule permission)
router.post('/', authenticateUser, (req, res, next) => {
  // Check permission
  if (!req.user.customPermissions?.canCreateSchedule) {
    return res.status(403).json({ 
      message: 'You do not have permission to create schedules' 
    });
  }
  next();
}, scheduleController.createSchedule);

// GET /api/schedules - get all schedules (requires viewSchedules permission)
router.get('/', authenticateUser, (req, res, next) => {
  // Check permission
  if (!req.user.customPermissions?.canViewSchedules) {
    return res.status(403).json({ 
      message: 'You do not have permission to view schedules' 
    });
  }
  next();
}, scheduleController.getSchedules);

// PATCH /api/schedules/:id/complete - mark as completed (requires completeSchedule permission)
router.patch('/:id/complete', authenticateUser, (req, res, next) => {
  // Check permission
  if (!req.user.customPermissions?.canCompleteSchedule) {
    return res.status(403).json({ 
      message: 'You do not have permission to complete schedules' 
    });
  }
  next();
}, scheduleController.completeSchedule);

module.exports = router;
