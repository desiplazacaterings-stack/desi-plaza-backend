const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const SignedAgreement = require('../models/SignedAgreement');
const Order = require('../models/Order');

// Generate shareable agreement link
router.post('/generate-link', async (req, res) => {
  try {
    const { orderId, customerData } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Generate unique token
    const shareToken = crypto.randomBytes(32).toString('hex');

    // Create signed agreement record
    const signedAgreement = new SignedAgreement({
      orderId,
      shareToken,
      customerName: customerData.customerName,
      mobile: customerData.mobile,
      email: customerData.email,
      eventType: customerData.eventType,
      eventDate: customerData.eventDate,
      eventTime: customerData.eventTime,
      guests: customerData.guests,
      location: customerData.location,
      notes: customerData.notes
    });

    await signedAgreement.save();

    // Generate shareable URL
    const shareableUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/sign-agreement/${shareToken}`;

    res.json({
      success: true,
      shareableUrl,
      shareToken,
      agreementId: signedAgreement._id
    });
  } catch (error) {
    console.error('Error generating shareable link:', error);
    res.status(500).json({ message: 'Failed to generate shareable link', error: error.message });
  }
});

// Get agreement by share token (public endpoint - no auth required)
router.get('/view/:shareToken', async (req, res) => {
  try {
    const { shareToken } = req.params;

    const agreement = await SignedAgreement.findOne({ shareToken });

    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found or link has expired' });
    }

    // Check if link has expired
    if (agreement.expiresAt < new Date()) {
      return res.status(410).json({ message: 'Agreement link has expired' });
    }

    res.json({
      success: true,
      agreement: {
        _id: agreement._id,
        customerName: agreement.customerName,
        mobile: agreement.mobile,
        email: agreement.email,
        eventType: agreement.eventType,
        eventDate: agreement.eventDate,
        eventTime: agreement.eventTime,
        guests: agreement.guests,
        location: agreement.location,
        notes: agreement.notes,
        isSigned: !!agreement.signedAt,
        signedAt: agreement.isSigned ? agreement.signedAt : null
      }
    });
  } catch (error) {
    console.error('Error fetching agreement:', error);
    res.status(500).json({ message: 'Failed to fetch agreement', error: error.message });
  }
});

// Submit signature (customer or business)
router.post('/submit-signature/:shareToken', async (req, res) => {
  try {
    const { shareToken } = req.params;
    const { signatureData, signedBy, role } = req.body;

    if (!signatureData || !signedBy || !role) {
      return res.status(400).json({ message: 'Signature data, signer name, and role are required' });
    }

    const agreement = await SignedAgreement.findOne({ shareToken });

    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    if (agreement.expiresAt < new Date()) {
      return res.status(410).json({ message: 'Agreement link has expired' });
    }

    // Update based on role
    if (role === 'customer') {
      agreement.customerSignatureData = signatureData;
      agreement.customerSignedBy = signedBy;
      agreement.customerSignedAt = new Date();
    } else if (role === 'business') {
      agreement.businessSignatureData = signatureData;
      agreement.businessSignedBy = signedBy;
      agreement.businessSignedAt = new Date();
    } else {
      return res.status(400).json({ message: 'Invalid role. Must be "customer" or "business"' });
    }

    await agreement.save();

    // If both have signed, update order status
    if (agreement.customerSignedAt && agreement.businessSignedAt) {
      await Order.findByIdAndUpdate(agreement.orderId, {
        agreementSigned: true,
        agreementSignedAt: new Date(),
        signedAgreementId: agreement._id
      });
    }

    res.json({
      success: true,
      message: `Agreement signed by ${role}`,
      signedAt: role === 'customer' ? agreement.customerSignedAt : agreement.businessSignedAt
    });
  } catch (error) {
    console.error('Error submitting signature:', error);
    res.status(500).json({ message: 'Failed to submit signature', error: error.message });
  }
});

// Get signed agreement by ID (for admin/staff)
router.get('/:agreementId', async (req, res) => {
  try {
    const { agreementId } = req.params;

    const agreement = await SignedAgreement.findById(agreementId);

    if (!agreement) {
      return res.status(404).json({ message: 'Signed agreement not found' });
    }

    res.json({
      success: true,
      agreement
    });
  } catch (error) {
    console.error('Error fetching signed agreement:', error);
    res.status(500).json({ message: 'Failed to fetch signed agreement', error: error.message });
  }
});

// Save PDF document
router.post('/save-pdf/:shareToken', async (req, res) => {
  try {
    const { shareToken } = req.params;
    const { pdfData } = req.body;

    if (!pdfData) {
      return res.status(400).json({ message: 'PDF data is required' });
    }

    const agreement = await SignedAgreement.findOne({ shareToken });

    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    agreement.pdfData = pdfData;
    agreement.pdfGeneratedAt = new Date();

    await agreement.save();

    res.json({
      success: true,
      message: 'PDF saved successfully',
      agreementId: agreement._id
    });
  } catch (error) {
    console.error('Error saving PDF:', error);
    res.status(500).json({ message: 'Failed to save PDF', error: error.message });
  }
});

// Get PDF (download/view)
router.get('/pdf/:agreementId', async (req, res) => {
  try {
    const { agreementId } = req.params;

    const agreement = await SignedAgreement.findById(agreementId);

    if (!agreement) {
      return res.status(404).json({ message: 'Signed agreement not found' });
    }

    if (!agreement.pdfData) {
      return res.status(404).json({ message: 'PDF not yet generated' });
    }

    // Return the PDF data as data URI
    res.json({
      success: true,
      pdfData: agreement.pdfData,
      customerName: agreement.customerName,
      eventDate: agreement.eventDate
    });
  } catch (error) {
    console.error('Error fetching PDF:', error);
    res.status(500).json({ message: 'Failed to fetch PDF', error: error.message });
  }
});

module.exports = router;
