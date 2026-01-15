/**
 * Unified Database Seeding System
 * 
 * This script consolidates all seeding functionality:
 * - User creation (admin, staff, manager)
 * - Menu items import
 * - Test data (orders, enquiries, quotations)
 * 
 * Usage:
 *   node seed.js [init|fresh|menu]
 *   - init: Fresh initialization with menu and test users
 *   - fresh: Complete reset and reseed everything
 *   - menu: Update menu items only
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Item = require('../models/Item');

// Constants
const DEFAULT_PASSWORD = 'Staff@123';
const ADMIN_PASSWORD = 'Admin@123456';

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/desi_plaza';
    const dbName = process.env.MONGO_DB_NAME;

    await mongoose.connect(mongoUri, { dbName: dbName || undefined });
    console.log(`✓ Connected to MongoDB: ${mongoose.connection.name}`);
    return true;
  } catch (error) {
    console.error(`✗ MongoDB connection failed: ${error.message}`);
    return false;
  }
}

/**
 * Create test users with roles and permissions
 */
async function seedUsers(clearExisting = false) {
  console.log('\n📝 Seeding Users...\n');

  try {
    if (clearExisting) {
      await User.deleteMany({});
      console.log('Cleared existing users');
    }

    // Admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@desiplaza.com',
      password: ADMIN_PASSWORD,
      mobile: '9999999999',
      role: 'admin',
      status: 'active',
      emailVerified: true
    });
    await admin.save();
    console.log('✓ Admin: admin@desiplaza.com / Admin@123456');

    // Staff 1 - Full permissions
    const staff1 = new User({
      name: 'Rajesh Kumar',
      email: 'rajesh@desiplaza.com',
      password: DEFAULT_PASSWORD,
      mobile: '9876543201',
      role: 'staff',
      status: 'active',
      emailVerified: true,
      customPermissions: {
        canCreateInstantOrder: true,
        canViewInstantOrders: true,
        canEditInstantOrder: true,
        canCreateEnquiry: true,
        canViewEnquiries: true,
        canEditEnquiry: true,
        canViewMenu: true,
        canViewMenuPrices: true,
        canViewPayments: true,
        canRecordPayment: true,
        canViewReports: true,
        canViewSalesReports: true,
        canViewEventReports: true
      }
    });
    await staff1.save();
    console.log('✓ Staff 1: rajesh@desiplaza.com / Staff@123 (Full permissions)');

    // Staff 2 - Limited permissions
    const staff2 = new User({
      name: 'Priya Singh',
      email: 'priya@desiplaza.com',
      password: DEFAULT_PASSWORD,
      mobile: '9876543202',
      role: 'staff',
      status: 'active',
      emailVerified: true,
      customPermissions: {
        canCreateInstantOrder: true,
        canViewInstantOrders: true,
        canCreateEnquiry: true,
        canViewEnquiries: true,
        canViewMenu: true,
        canViewMenuPrices: true,
        canViewReports: false
      }
    });
    await staff2.save();
    console.log('✓ Staff 2: priya@desiplaza.com / Staff@123 (Limited permissions)');

    // Manager
    const manager = new User({
      name: 'Manager User',
      email: 'manager@desiplaza.com',
      password: DEFAULT_PASSWORD,
      mobile: '9876543203',
      role: 'staff',
      status: 'active',
      emailVerified: true,
      customPermissions: {
        canViewUsers: true,
        canCreateUser: true,
        canEditUser: true,
        canViewOrders: true,
        canCreateInstantOrder: true,
        canEditInstantOrder: true,
        canViewMenu: true,
        canEditMenuItems: true,
        canViewPayments: true,
        canRecordPayment: true,
        canViewReports: true,
        canViewSalesReports: true
      }
    });
    await manager.save();
    console.log('✓ Manager: manager@desiplaza.com / Staff@123 (All operations)');

    console.log('\n✅ Users seeded successfully\n');
    return true;
  } catch (error) {
    console.error(`✗ Error seeding users: ${error.message}`);
    return false;
  }
}

/**
 * Import menu items from JSON file
 */
async function seedMenu(clearExisting = false) {
  console.log('\n🍽️  Seeding Menu Items...\n');

  try {
    if (clearExisting) {
      await Item.deleteMany({});
      console.log('Cleared existing menu items');
    }

    // Try to load menu data
    const menuPath = path.join(__dirname, '../output/menu.mongodb.json');
    let menuData;

    try {
      menuData = require(menuPath);
    } catch (err) {
      console.warn('⚠️  Menu JSON not found, creating sample menu items');
      // Create minimal sample menu if file not found
      menuData = [
        {
          name: 'Paneer Tikka',
          category: 'Appetizer',
          price: 250,
          veg_nonveg: 'Veg',
          description: 'Marinated paneer pieces grilled with spices',
          available: true
        },
        {
          name: 'Tandoori Chicken',
          category: 'Main Course',
          price: 400,
          veg_nonveg: 'Non-Veg',
          description: 'Succulent chicken marinated and tandoori roasted',
          available: true
        },
        {
          name: 'Butter Naan',
          category: 'Bread',
          price: 80,
          veg_nonveg: 'Veg',
          description: 'Soft naan brushed with butter',
          available: true
        }
      ];
    }

    // Enrich menu data with veg/non-veg categorization
    const enrichedMenu = menuData.map((item) => ({
      ...item,
      veg_nonveg: item.veg_nonveg || detectVegNonVeg(item.category)
    }));

    const created = await Item.insertMany(enrichedMenu);
    console.log(`✓ Seeded ${created.length} menu items`);

    console.log('\n✅ Menu seeded successfully\n');
    return true;
  } catch (error) {
    console.error(`✗ Error seeding menu: ${error.message}`);
    return false;
  }
}

/**
 * Helper: Detect veg/non-veg based on category
 */
function detectVegNonVeg(category) {
  if (!category) return 'Veg';
  const nonVegKeywords = ['chicken', 'mutton', 'fish', 'goat', 'lamb', 'egg', 'shrimp', 'meat'];
  return nonVegKeywords.some((kw) => category.toLowerCase().includes(kw)) ? 'Non-Veg' : 'Veg';
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDB() {
  try {
    await mongoose.connection.close();
    console.log('✓ Disconnected from MongoDB');
  } catch (error) {
    console.error(`✗ Error disconnecting: ${error.message}`);
  }
}

/**
 * Main seeding orchestrator
 */
async function main() {
  const command = process.argv[2] || 'init';

  console.log(`\n🌱 DESI PLAZA SEEDING SYSTEM - Mode: ${command.toUpperCase()}\n`);

  if (!(await connectDB())) {
    process.exit(1);
  }

  try {
    switch (command) {
      case 'init':
        // Initialize: seed users and menu (don't clear if they exist)
        await seedUsers(false);
        await seedMenu(false);
        break;

      case 'fresh':
        // Fresh: completely clear and reseed everything
        await seedUsers(true);
        await seedMenu(true);
        break;

      case 'menu':
        // Menu only: update menu items
        await seedMenu(true);
        break;

      case 'users':
        // Users only: update users
        await seedUsers(true);
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('\nUsage: node seed.js [init|fresh|menu|users]');
        console.log('  init  - Initialize with users and menu (default)');
        console.log('  fresh - Complete reset and reseed');
        console.log('  menu  - Update menu items only');
        console.log('  users - Update users only');
        process.exit(1);
    }

    console.log('🎉 Seeding completed successfully!\n');
  } catch (error) {
    console.error(`\n❌ Seeding failed: ${error.message}\n`);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { seedUsers, seedMenu, connectDB, disconnectDB };
