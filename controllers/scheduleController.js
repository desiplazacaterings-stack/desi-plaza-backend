// Mark a schedule as completed
exports.completeSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByIdAndUpdate(id, { completed: true }, { new: true });
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete schedule', details: err.message });
  }
};
const Schedule = require('../models/Schedule');

// Create a new schedule
exports.createSchedule = async (req, res) => {
  try {
    const { enquiryId, customerName, date, time, place } = req.body;
    const schedule = new Schedule({ enquiryId, customerName, date, time, place });
    await schedule.save();
    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create schedule', details: err.message });
  }
};

// Get all schedules
exports.getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().populate('enquiryId');
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schedules', details: err.message });
  }
};
