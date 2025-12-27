const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry');
const multer = require('multer');
const upload = multer();

// GET: Retrieve all enquiries (to check saved data)
router.get('/', async (req, res) => {
  try {
    // Fetch all enquiries and sort by newest first
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Save a new enquiry (from the enquiry form)
router.post('/', upload.none(), async (req, res) => {
  console.log('Received enquiry payload:', req.body);

  const { customerName, mobile, email, eventType, eventDate, location, guests, notes } = req.body;

  // Validate required fields
  const missingFields = [];
  if (!customerName) missingFields.push('customerName');
  if (!mobile) missingFields.push('mobile');
  if (!email) missingFields.push('email');

  if (missingFields.length > 0) {
    return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
  }

  const enquiry = new Enquiry({
    customerName,
    mobile,
    email,
    eventType,
    eventDate,
    location,
    guests,
    notes
  });

  try {
    const newEnquiry = await enquiry.save();
    res.status(201).json(newEnquiry);
  } catch (err) {
    console.error('Error saving enquiry:', err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;