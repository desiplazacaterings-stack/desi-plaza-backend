const mongoose = require('mongoose');

// Delete any existing model to prevent caching issues
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

const orderItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  category: { type: String },
  unit: { type: String },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  // Customer Information
  customerName: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  
  // Event Details
  eventType: { type: String },
  eventDate: { type: Date },
  eventPlace: { type: String },
  subEvents: { type: String },
  eventManager: { type: String },
  
  // Order Details
  items: [orderItemSchema],
  subtotal: { type: Number },
  tax: { type: Number },
  salesTax: { type: Number, default: 0 },
  serviceCharge: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number },
  totalAmount: { type: Number },
  advance: { type: Number, default: 0 },
  balance: { type: Number },
  paymentMode: { type: String, enum: ['Cash', 'Card', 'Online'], default: 'Cash' },
  
  // Status
  status: { type: String, enum: ['Placed', 'Preparing', 'Ready', 'Delivered', 'Confirmed', 'Completed', 'Pending Payment'], default: 'Placed' },
  orderType: { type: String, enum: ['Instant', 'Event'], default: 'Instant' },
  
  // Team Assignment
  assignedTeam: {
    name: { type: String },
    role: { type: String },
    phone: { type: String }
  },
  eventCompletedAt: { type: Date },
  
  // Payment Status
  paymentStatus: { type: String, enum: ['Pending', 'Partial', 'Paid', 'Short Closed'], default: 'Pending' },
  balanceDue: { type: Number },
  amountReceived: { type: Number, default: 0 },
  paymentNotes: { type: String },
  isShortClosed: { type: Boolean, default: false },
  shortCloseAmount: { type: Number, default: 0 },
  shortCloseReason: { type: String, default: '' },
  shortCloseAt: { type: Date, default: null },
  
  // Quotation Reference
  quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
  
  // Agreement Tracking
  agreementSigned: { type: Boolean, default: false },
  agreementSignedAt: { type: Date },
  signedAgreementId: { type: mongoose.Schema.Types.ObjectId, ref: 'SignedAgreement' },
  
  // PDF Document
  hasPDF: { type: Boolean, default: false },
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Order', orderSchema);