const mongoose = require('mongoose');
require('dotenv').config();

const Item = require('./models/Item');

const menuData = require('./output/menu.mongodb.json');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/desi_plaza')
.then(async () => {
  console.log('Seeding database...');
  await Item.deleteMany(); // Clear existing
  // Add default veg_nonveg value if missing
  const enrichedMenu = menuData.map(item => ({
    ...item,
    veg_nonveg: item.veg_nonveg || (item.category && item.category.toLowerCase().includes('chicken') || item.category.toLowerCase().includes('mutton') || item.category.toLowerCase().includes('fish') || item.category.toLowerCase().includes('goat') || item.category.toLowerCase().includes('lamb') || item.category.toLowerCase().includes('egg') || item.category.toLowerCase().includes('shrimp') ? 'Non-Veg' : 'Veg')
  }));
  await Item.insertMany(enrichedMenu);
  console.log('Seeded successfully');
  process.exit();
})
.catch(err => console.log(err));
