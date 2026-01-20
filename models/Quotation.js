const mongoose = require('mongoose');

const QuotationSchema = new mongoose.Schema({
  quotationId: { type: String, required: true, unique: true },
  enquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry' },
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
  subtotal: { type: Number, default: 0 },
  salesTaxRate: { type: Number, default: 0 },
  salesTax: { type: Number, default: 0 },
  serviceChargeRate: { type: Number, default: 0 },
  serviceCharge: { type: Number, default: 0 },
  labourCharges: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  total: Number,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quotation', QuotationSchema);
