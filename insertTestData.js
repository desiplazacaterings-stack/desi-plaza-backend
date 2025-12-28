const axios = require('axios');

const testOrders = [
  {
    customerName: "Raj Patel",
    customerEmail: "raj@example.com",
    customerPhone: "9876543210",
    eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
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
    eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
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
    eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
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
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
    eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
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

async function insertData() {
  try {
    for (const order of testOrders) {
      const response = await axios.post('http://localhost:3000/api/orders', order);
      console.log(`✓ Inserted: ${order.customerName} - ${order.eventType}`);
    }
    console.log('\n✅ All test data inserted successfully!');
  } catch (error) {
    console.error('❌ Error inserting data:', error.message);
  }
}

insertData();
