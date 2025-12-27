require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/desi_plaza';

mongoose.connect(uri).then(async () => {
  console.log('Migrating orders collection...');
  
  try {
    // Drop the existing collection
    await mongoose.connection.db.dropCollection('orders');
    console.log('✓ Dropped old orders collection');
  } catch (err) {
    console.log('ℹ Collection does not exist or already dropped');
  }
  
  console.log('✓ Orders collection reset. Ready to create new orders with updated schema.');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
