const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const { authenticateUser } = require('../middleware/auth');

// GET all quotations (requires authentication + viewQuotations permission)
router.get('/', authenticateUser, async (req, res) => {
  try {
    // Check permission
    if (!req.user.customPermissions?.canViewQuotations) {
      return res.status(403).json({ 
        message: 'You do not have permission to view quotations' 
      });
    }
    
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    res.json(quotations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new quotation (public - for event creation and regular quotation page)
router.post('/', async (req, res) => {
  try {
    // If no enquiry is selected, allow manual customerName and mobile
    if (!req.body.enquiry) req.body.enquiry = {};
    if (!req.body.enquiry.customerName && req.body.customerName) {
      req.body.enquiry.customerName = req.body.customerName;
    }
    if (!req.body.enquiry.mobile && req.body.mobile) {
      req.body.enquiry.mobile = req.body.mobile;
    }
    const quotation = new Quotation(req.body);
    await quotation.save();
    res.status(201).json(quotation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update quotation status (requires authentication + editQuotation permission)
router.patch('/:id', authenticateUser, async (req, res) => {
  try {
    // Check permission
    if (!req.user.customPermissions?.canEditQuotation) {
      return res.status(403).json({ 
        message: 'You do not have permission to edit quotations' 
      });
    }

    const quotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    res.json(quotation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
