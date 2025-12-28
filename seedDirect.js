const mongoose = require('mongoose');
const Order = require('./models/Order');

const testOrders = [
  {
    customerName: "Raj Patel",
    mobile: "9876543210",
    email: "raj@example.com",
    eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    eventType: "Wedding",
    total: 45000,
    advance: 15000,
    status: "Confirmed"
  },
  {
    customerName: "Priya Singh",
    mobile: "9876543211",
    email: "priya@example.com",
    eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    eventType: "Birthday Party",
    total: 12000,
    advance: 0,
    status: "Confirmed"
  },
  {
    customerName: "Amit Kumar",
    mobile: "9876543212",
    email: "amit@example.com",
    eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    eventType: "Corporate Event",
    total: 75000,
    advance: 75000,
    status: "Confirmed"
  },
  {
    customerName: "Neha Sharma",
    mobile: "9876543213",
    email: "neha@example.com",
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    eventType: "Engagement",
    total: 35000,
    advance: 10000,
    status: "Confirmed"
  },
  {
    customerName: "Vikram Verma",
    mobile: "9876543214",
    email: "vikram@example.com",
    eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    eventType: "Anniversary",
    total: 22000,
    advance: 0,
    status: "Confirmed"
  }
];

async function insertData() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/desi_plaza', {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('Connected to MongoDB');
    
    // Clear existing orders
    await Order.deleteMany({});
    console.log('Cleared existing orders');
    
    // Insert new orders
    const inserted = await Order.insertMany(testOrders);
    console.log(`✅ Successfully inserted ${inserted.length} test orders!`);
    
    // Verify insertion
    const count = await Order.countDocuments();
    console.log(`Total orders in database: ${count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

insertData();
