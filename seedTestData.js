require('dotenv').config();
const mongoose = require('mongoose');
const Enquiry = require('./models/Enquiry');
const Order = require('./models/Order');
const Quotation = require('./models/Quotation');
const Item = require('./models/Item');

async function seedTestData() {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable not set');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✓ MongoDB connected');

    // Get some items for orders
    const items = await Item.find().limit(5);
    if (items.length === 0) {
      console.error('❌ No menu items found. Please run "npm run seed" first to populate menu items.');
      process.exit(1);
    }

    // Create test enquiries
    console.log('\n📝 Seeding Enquiries...');
    const testEnquiries = [
      {
        customerName: 'Rajesh Kumar',
        mobile: '9876543210',
        email: 'rajesh@email.com',
        eventType: 'Wedding',
        eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        eventTime: '18:00',
        location: 'Hyderabad',
        guests: 200,
        notes: 'Vegetarian guests, no spicy food'
      },
      {
        customerName: 'Priya Singh',
        mobile: '9876543211',
        email: 'priya@email.com',
        eventType: 'Birthday Party',
        eventDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        eventTime: '19:00',
        location: 'Secunderabad',
        guests: 50,
        notes: 'Lots of kids, need vegetarian and mild spice options'
      },
      {
        customerName: 'Amit Sharma',
        mobile: '9876543212',
        email: 'amit@email.com',
        eventType: 'Corporate Event',
        eventDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        eventTime: '12:00',
        location: 'Banjara Hills',
        guests: 100,
        notes: 'Mix of veg and non-veg, premium setup required'
      },
      {
        customerName: 'Sneha Patel',
        mobile: '9876543213',
        email: 'sneha@email.com',
        eventType: 'Engagement',
        eventDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        eventTime: '17:00',
        location: 'Pune',
        guests: 150,
        notes: 'Gujarati vegetarian cuisine preferred'
      },
      {
        customerName: 'Vikram Reddy',
        mobile: '9876543214',
        email: 'vikram@email.com',
        eventType: 'Baby Shower',
        eventDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        eventTime: '16:00',
        location: 'Jubilee Hills',
        guests: 75,
        notes: 'Light snacks and refreshments, sweet items needed'
      }
    ];

    await Enquiry.deleteMany({}); // Clear existing
    const createdEnquiries = await Enquiry.insertMany(testEnquiries);
    console.log(`✓ Seeded ${createdEnquiries.length} test enquiries`);

    // Create test quotations
    console.log('\n📊 Seeding Quotations...');
    const testQuotations = [
      {
        quotationId: `QT-${Date.now()}-001`,
        enquiry: {
          customerName: createdEnquiries[0].customerName,
          mobile: createdEnquiries[0].mobile,
          email: createdEnquiries[0].email,
          eventType: createdEnquiries[0].eventType,
          eventDate: new Date(createdEnquiries[0].eventDate).toLocaleDateString(),
          location: createdEnquiries[0].location,
          guests: createdEnquiries[0].guests,
          notes: createdEnquiries[0].notes
        },
        items: [
          {
            itemName: items[0].itemName,
            unit: 'Full Tray',
            qty: 50,
            price: items[0].prices[0].price,
            category: items[0].category
          },
          {
            itemName: items[1].itemName,
            unit: 'Full Tray',
            qty: 50,
            price: items[1].prices[0].price,
            category: items[1].category
          }
        ],
        total: (50 * items[0].prices[0].price) + (50 * items[1].prices[0].price),
        status: 'Pending'
      },
      {
        quotationId: `QT-${Date.now()}-002`,
        enquiry: {
          customerName: createdEnquiries[1].customerName,
          mobile: createdEnquiries[1].mobile,
          email: createdEnquiries[1].email,
          eventType: createdEnquiries[1].eventType,
          eventDate: new Date(createdEnquiries[1].eventDate).toLocaleDateString(),
          location: createdEnquiries[1].location,
          guests: createdEnquiries[1].guests,
          notes: createdEnquiries[1].notes
        },
        items: [
          {
            itemName: items[0].itemName,
            unit: 'Full Tray',
            qty: 20,
            price: items[0].prices[0].price,
            category: items[0].category
          }
        ],
        total: 20 * items[0].prices[0].price,
        status: 'Accepted'
      },
      {
        quotationId: `QT-${Date.now()}-003`,
        enquiry: {
          customerName: createdEnquiries[2].customerName,
          mobile: createdEnquiries[2].mobile,
          email: createdEnquiries[2].email,
          eventType: createdEnquiries[2].eventType,
          eventDate: new Date(createdEnquiries[2].eventDate).toLocaleDateString(),
          location: createdEnquiries[2].location,
          guests: createdEnquiries[2].guests,
          notes: createdEnquiries[2].notes
        },
        items: [
          {
            itemName: items[2].itemName,
            unit: 'Full Tray',
            qty: 30,
            price: items[2].prices[0].price,
            category: items[2].category
          },
          {
            itemName: items[3].itemName,
            unit: 'Full Tray',
            qty: 30,
            price: items[3].prices[0].price,
            category: items[3].category
          },
          {
            itemName: items[4].itemName,
            unit: 'Full Tray',
            qty: 30,
            price: items[4].prices[0].price,
            category: items[4].category
          }
        ],
        total: (30 * items[2].prices[0].price) + (30 * items[3].prices[0].price) + (30 * items[4].prices[0].price),
        status: 'Accepted'
      }
    ];

    await Quotation.deleteMany({}); // Clear existing
    const createdQuotations = await Quotation.insertMany(testQuotations);
    console.log(`✓ Seeded ${createdQuotations.length} test quotations`);

    // Create test orders
    console.log('\n🍽️ Seeding Orders (Events)...');
    const testOrders = [
      {
        customerName: 'Rajesh Kumar',
        mobile: '9876543210',
        email: 'rajesh@email.com',
        address: 'Hyderabad',
        items: [
          {
            itemName: items[0].itemName,
            qty: 50,
            price: items[0].prices[0].price,
            unit: 'Full Tray',
            category: items[0].category
          }
        ],
        eventType: 'Wedding',
        eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        eventPlace: 'Hyderabad',
        orderType: 'Event',
        status: 'Placed',
        subtotal: 50 * items[0].prices[0].price,
        serviceCharge: 500,
        tax: 50 * items[0].prices[0].price * 0.05,
        total: (50 * items[0].prices[0].price) + 500 + (50 * items[0].prices[0].price * 0.05),
        totalAmount: (50 * items[0].prices[0].price) + 500 + (50 * items[0].prices[0].price * 0.05)
      },
      {
        customerName: 'Priya Singh',
        mobile: '9876543211',
        email: 'priya@email.com',
        address: 'Secunderabad',
        items: [
          {
            itemName: items[0].itemName,
            qty: 20,
            price: items[0].prices[0].price,
            unit: 'Full Tray',
            category: items[0].category
          },
          {
            itemName: items[1].itemName,
            qty: 20,
            price: items[1].prices[0].price,
            unit: 'Full Tray',
            category: items[1].category
          }
        ],
        eventType: 'Birthday Party',
        eventDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        eventPlace: 'Secunderabad',
        orderType: 'Instant',
        status: 'Preparing',
        subtotal: (20 * items[0].prices[0].price) + (20 * items[1].prices[0].price),
        serviceCharge: 300,
        tax: ((20 * items[0].prices[0].price) + (20 * items[1].prices[0].price)) * 0.05,
        total: ((20 * items[0].prices[0].price) + (20 * items[1].prices[0].price)) + 300 + (((20 * items[0].prices[0].price) + (20 * items[1].prices[0].price)) * 0.05),
        totalAmount: ((20 * items[0].prices[0].price) + (20 * items[1].prices[0].price)) + 300 + (((20 * items[0].prices[0].price) + (20 * items[1].prices[0].price)) * 0.05)
      },
      {
        customerName: 'Amit Sharma',
        mobile: '9876543212',
        email: 'amit@email.com',
        address: 'Banjara Hills',
        items: [
          {
            itemName: items[2].itemName,
            qty: 30,
            price: items[2].prices[0].price,
            unit: 'Full Tray',
            category: items[2].category
          }
        ],
        eventType: 'Corporate Event',
        eventDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        eventPlace: 'Banjara Hills',
        orderType: 'Event',
        status: 'Ready',
        subtotal: 30 * items[2].prices[0].price,
        serviceCharge: 800,
        tax: 30 * items[2].prices[0].price * 0.05,
        total: (30 * items[2].prices[0].price) + 800 + (30 * items[2].prices[0].price * 0.05),
        totalAmount: (30 * items[2].prices[0].price) + 800 + (30 * items[2].prices[0].price * 0.05),
        assignedTeam: {
          name: 'Raj Kumar',
          role: 'Event Manager',
          phone: '9876543210'
        }
      },
      {
        customerName: 'Sneha Patel',
        mobile: '9876543213',
        email: 'sneha@email.com',
        address: 'Pune',
        items: [
          {
            itemName: items[3].itemName,
            qty: 40,
            price: items[3].prices[0].price,
            unit: 'Full Tray',
            category: items[3].category
          }
        ],
        eventType: 'Engagement',
        eventDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        eventPlace: 'Pune',
        orderType: 'Instant',
        status: 'Delivered',
        subtotal: 40 * items[3].prices[0].price,
        serviceCharge: 600,
        tax: 40 * items[3].prices[0].price * 0.05,
        total: (40 * items[3].prices[0].price) + 600 + (40 * items[3].prices[0].price * 0.05),
        totalAmount: (40 * items[3].prices[0].price) + 600 + (40 * items[3].prices[0].price * 0.05)
      }
    ];

    await Order.deleteMany({}); // Clear existing
    const createdOrders = await Order.insertMany(testOrders);
    console.log(`✓ Seeded ${createdOrders.length} test orders/events`);

    // Summary
    console.log('\n✅ Test Data Seeding Completed!');
    console.log('📊 Summary:');
    console.log(`   - Menu Items: ${await Item.countDocuments()}`);
    console.log(`   - Enquiries: ${await Enquiry.countDocuments()}`);
    console.log(`   - Quotations: ${await Quotation.countDocuments()}`);
    console.log(`   - Orders/Events: ${await Order.countDocuments()}`);
    
    console.log('\n📍 Test Enquiries:');
    createdEnquiries.forEach((e, i) => {
      const eventDate = new Date(e.eventDate).toLocaleDateString();
      console.log(`   ${i + 1}. ${e.customerName} - ${e.eventType} on ${eventDate}`);
    });
    
    console.log('\n🍽️ Test Orders:');
    createdOrders.forEach((o, i) => {
      console.log(`   ${i + 1}. ${o.customerName} - ${o.orderType} (${o.status})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedTestData();
