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

// Complete event and assign team - MUST BE BEFORE general /:id route
router.patch('/:id/complete', async (req, res) => {
  try {
    const { assignedTeam } = req.body;
    
    // Calculate payment status
    const order = await Order.findById(req.params.id);
    const totalAmount = order.totalAmount || 0;
    const amountReceived = order.advance || 0;
    const balanceDue = totalAmount - amountReceived;
    
    // Determine payment status
    let paymentStatus = 'Pending';
    if (amountReceived === totalAmount) {
      paymentStatus = 'Paid';
    } else if (amountReceived > 0) {
      paymentStatus = 'Partial';
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Completed',
        paymentStatus: paymentStatus,
        assignedTeam: assignedTeam,
        eventCompletedAt: new Date(),
        balanceDue: balanceDue,
        amountReceived: amountReceived
      },
      { new: true }
    );
    
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update order status
router.patch('/:id', async (req, res) => {
  try {
    // If amountReceived is being updated, recalculate payment status
    if (req.body.amountReceived !== undefined) {
      const order = await Order.findById(req.params.id);
      const totalAmount = order.totalAmount || 0;
      const amountReceived = req.body.amountReceived;
      
      // Determine payment status based on new amount received
      let paymentStatus = 'Pending';
      if (amountReceived >= totalAmount) {
        paymentStatus = 'Paid';
      } else if (amountReceived > 0) {
        paymentStatus = 'Partial';
      }
      
      req.body.paymentStatus = paymentStatus;
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;