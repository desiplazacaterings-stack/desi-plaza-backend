const express = require('express');
const mongoose = require('mongoose');
const Item = require('../models/Item');
const router = express.Router();

// Simple in-memory cache
let itemsCache = null;
let cacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get all items with caching
router.get('/', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(500).json({ message: 'Database not connected' });
  }
  
  try {
    // Check if cache is valid
    const now = Date.now();
    if (itemsCache && cacheTime && (now - cacheTime) < CACHE_DURATION) {
      console.log('📦 Serving items from cache');
      return res.json(itemsCache);
    }

    // Fetch from database and cache
    console.log('🔄 Fetching items from database...');
    const items = await Item.find().lean(); // Use lean() for faster queries
    
    // Cache the results
    itemsCache = items;
    cacheTime = now;
    
    console.log(`✓ Items fetched and cached: ${items.length} items`);
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
    // Clear cache when item is added
    itemsCache = null;
    cacheTime = null;
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update item
router.put('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    // Clear cache when item is updated
    itemsCache = null;
    cacheTime = null;
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete item
router.delete('/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    // Clear cache when item is deleted
    itemsCache = null;
    cacheTime = null;
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Clear cache manually (admin only)
router.post('/cache/clear', (req, res) => {
  itemsCache = null;
  cacheTime = null;
  res.json({ message: 'Cache cleared' });
});

module.exports = router;