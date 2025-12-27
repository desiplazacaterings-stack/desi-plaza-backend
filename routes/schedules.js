const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

// POST /api/schedules - create a new schedule
router.post('/', scheduleController.createSchedule);

// GET /api/schedules - get all schedules
router.get('/', scheduleController.getSchedules);

// PATCH /api/schedules/:id/complete - mark as completed
router.patch('/:id/complete', scheduleController.completeSchedule);

module.exports = router;
