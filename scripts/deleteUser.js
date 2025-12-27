// Script to delete a user by email
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

const email = process.argv[2];
if (!email) {
  console.error('Usage: node deleteUser.js <email>');
  process.exit(1);
}

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/desi_plaza');
    const result = await User.deleteOne({ email });
    if (result.deletedCount === 0) {
      console.log('No user found with email:', email);
    } else {
      console.log('User deleted:', email);
    }
  } catch (err) {
    console.error('Error deleting user:', err.message);
  } finally {
    mongoose.disconnect();
  }
}

main();
