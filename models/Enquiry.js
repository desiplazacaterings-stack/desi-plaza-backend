const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  eventType: { type: String },
  eventDate: { type: String },
  location: { type: String },
  guests: { type: String },
  notes: { type: String },
  quotationStatus: { type: String, default: 'Pending', enum: ['Pending', 'Quotation Generated'] },
  status: { type: String, default: 'Active', enum: ['Active', 'Cancelled'] },
  cancellationReason: { type: String, default: '' },
  cancelledAt: { type: Date, default: null },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Enquiry', enquirySchema);