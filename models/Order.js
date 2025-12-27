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
  total: { type: Number },
  totalAmount: { type: Number },
  advance: { type: Number, default: 0 },
  balance: { type: Number },
  
  // Status
  status: { type: String, enum: ['Placed', 'Preparing', 'Ready', 'Delivered', 'Confirmed'], default: 'Placed' },
  orderType: { type: String, enum: ['Instant', 'Event'], default: 'Instant' },
  
  // Quotation Reference
  quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Order', orderSchema);