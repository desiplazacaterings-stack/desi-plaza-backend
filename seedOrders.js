const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('./models/Order');

const testOrders = [
  {
    customerName: "Raj Patel",
    customerEmail: "raj@example.com",
    customerPhone: "9876543210",
    eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    eventType: "Wedding",
    guestCount: 150,
    items: [],
    totalAmount: 45000,
    amountReceived: 15000,
    advance: 15000,
    notes: "Wedding reception for 150 guests",
    status: "Confirmed",
    paymentStatus: "Partial"
  },
  {
    customerName: "Priya Singh",
    customerEmail: "priya@example.com",
    customerPhone: "9876543211",
    eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    eventType: "Birthday Party",
    guestCount: 50,
    items: [],
    totalAmount: 12000,
    amountReceived: 0,
    advance: 0,
    notes: "Birthday celebration for 50 people",
    status: "Confirmed",
    paymentStatus: "Pending"
  },
  {
    customerName: "Amit Kumar",
    customerEmail: "amit@example.com",
    customerPhone: "9876543212",
    eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    eventType: "Corporate Event",
    guestCount: 200,
    items: [],
    totalAmount: 75000,
    amountReceived: 75000,
    advance: 75000,
    notes: "Corporate dinner for 200 guests",
    status: "Confirmed",
    paymentStatus: "Paid"
  },
  {
    customerName: "Neha Sharma",
    customerEmail: "neha@example.com",
    customerPhone: "9876543213",
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    eventType: "Engagement",
    guestCount: 100,
    items: [],
    totalAmount: 35000,
    amountReceived: 10000,
    advance: 10000,
    notes: "Engagement ceremony for 100 guests",
    status: "Confirmed",
    paymentStatus: "Partial"
  },
  {
    customerName: "Vikram Verma",
    customerEmail: "vikram@example.com",
    customerPhone: "9876543214",
    eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    eventType: "Anniversary",
    guestCount: 75,
    items: [],
    totalAmount: 22000,
    amountReceived: 0,
    advance: 0,
    notes: "Anniversary celebration for 75 guests",
    status: "Confirmed",
    paymentStatus: "Pending"
  }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/desi_plaza')
  .then(async () => {
    console.log('Connected to MongoDB');
    console.log('Seeding orders...');
    
    // Clear existing orders
    await Order.deleteMany({});
    console.log('Cleared existing orders');
    
    // Insert test orders
    const insertedOrders = await Order.insertMany(testOrders);
    console.log(`Successfully seeded ${insertedOrders.length} orders`);
    console.log('Seeded orders:');
    insertedOrders.forEach((order, index) => {
      console.log(`  ${index + 1}. ${order.customerName} - ${order.eventType} - $${order.totalAmount}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error seeding database:', err);
    process.exit(1);
  });
