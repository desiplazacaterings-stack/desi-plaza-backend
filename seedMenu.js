require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('./models/Item');
const menuData = require('./output/menu.mongodb.json');

async function seedDatabase() {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable not set');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✓ MongoDB connected');

    console.log('Clearing existing items...');
    const deleted = await Item.deleteMany({});
    console.log(`✓ Deleted ${deleted.deletedCount} existing items`);

    console.log(`Seeding ${menuData.length} menu items...`);
    
    // Add default veg_nonveg value if missing
    const enrichedMenu = menuData.map(item => ({
      ...item,
      veg_nonveg: item.veg_nonveg || (item.category && (
        item.category.toLowerCase().includes('chicken') ||
        item.category.toLowerCase().includes('mutton') ||
        item.category.toLowerCase().includes('fish') ||
        item.category.toLowerCase().includes('goat') ||
        item.category.toLowerCase().includes('lamb') ||
        item.category.toLowerCase().includes('egg') ||
        item.category.toLowerCase().includes('shrimp')
      ) ? 'Non-Veg' : 'Veg')
    }));

    const inserted = await Item.insertMany(enrichedMenu);
    console.log(`✓ Seeded ${inserted.length} menu items successfully`);
    
    // Verify seeding
    const count = await Item.countDocuments();
    console.log(`✓ Total items in database: ${count}`);
    
    console.log('\n📊 Items by Category:');
    const categories = await Item.distinct('category');
    for (const cat of categories.sort()) {
      const catCount = await Item.countDocuments({ category: cat });
      console.log(`   ${cat}: ${catCount} items`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
