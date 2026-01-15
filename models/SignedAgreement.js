const mongoose = require('mongoose');

const SignedAgreementSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  shareToken: {
    type: String,
    required: true,
    unique: true
  },
  customerName: String,
  mobile: String,
  email: String,
  eventType: String,
  eventDate: Date,
  eventTime: String,
  guests: Number,
  location: String,
  notes: String,
  
  // Customer Signature
  customerSignatureData: String, // Base64 encoded signature image
  customerSignedBy: String,
  customerSignedAt: Date,
  
  // Business Signature
  businessSignatureData: String, // Base64 encoded signature image
  businessSignedBy: String,
  businessSignedAt: Date,
  
  // PDF Document
  pdfData: String, // Base64 encoded PDF document
  pdfGeneratedAt: Date,
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
  }
});

module.exports = mongoose.model('SignedAgreement', SignedAgreementSchema);
