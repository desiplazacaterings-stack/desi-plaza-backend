const mongoose = require('mongoose');

const QuotationSchema = new mongoose.Schema({
  quotationId: { type: String, required: true, unique: true },
  enquiry: {
    customerName: String,
    mobile: String,
    email: String,
    eventType: String,
    eventDate: String,
    location: String,
    guests: Number,
    notes: String
  },
  items: [
    {
      itemName: String,
      unit: String,
      qty: Number,
      price: Number,
      category: String
    }
  ],
  total: Number,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quotation', QuotationSchema);
