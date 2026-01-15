const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemName: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  veg_nonveg: { type: String, enum: ['Veg', 'Non-Veg'], default: 'Veg', index: true },
  image: { type: String, default: null },
  prices: [
    {
      unit: { type: String },
      units: { type: Number },
      price: { type: Number }
    }
  ]
}, { timestamps: true });

// Create indexes for faster queries
itemSchema.index({ itemName: 1, category: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ veg_nonveg: 1 });

module.exports = mongoose.model('Item', itemSchema);