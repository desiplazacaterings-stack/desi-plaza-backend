const express = require('express');
const mongoose = require('mongoose');
const Item = require('../models/Item');
const router = express.Router();

// Get all items
router.get('/', async (req, res) => {
  console.log('Fetching items...');
  if (mongoose.connection.readyState !== 1) {
    return res.status(500).json({ message: 'Database not connected' });
  }
  try {
    const items = await Item.find();
    console.log('Items fetched:', items.length);
    res.json(items);
  } catch (err) {
    console.log('Error fetching items:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Create item
router.post('/', async (req, res) => {
  const item = new Item(req.body);
  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;