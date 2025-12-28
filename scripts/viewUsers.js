const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function viewUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/desi_plaza');
    
    const users = await User.find({}, '-password'); // Exclude password field
    
    if (users.length === 0) {
      console.log('❌ No users found in the database');
      process.exit();
    }
    
    console.log('\n📋 ALL USERS IN SYSTEM:\n');
    console.log('─'.repeat(100));
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Mobile: ${user.mobile}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Last Login: ${user.lastLogin || 'Never'}`);
    });
    
    console.log('\n' + '─'.repeat(100) + '\n');
    console.log(`✅ Total Users: ${users.length}\n`);
    
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

viewUsers();
