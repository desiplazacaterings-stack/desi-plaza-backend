const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  veg_nonveg: { type: String, enum: ['Veg', 'Non-Veg'], default: 'Veg' },
  prices: [
    {
      unit: { type: String },
      units: { type: Number },
      price: { type: Number }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);