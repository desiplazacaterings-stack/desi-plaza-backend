const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create order
router.post('/', async (req, res) => {
  console.log('Received order data:', req.body);
  const order = new Order(req.body);
  try {
    const newOrder = await order.save();
    console.log('Order saved successfully:', newOrder);
    res.status(201).json(newOrder);
  } catch (err) {
    console.error('Error saving order:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update order status
router.patch('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;