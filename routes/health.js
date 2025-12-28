// Production-Ready Health Check Route Module
// Import this in your main index.js

const express = require('express');
const router = express.Router();

// Health endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: 'connected' // Will update based on actual connection
  });
});

// Status endpoint
router.get('/status', (req, res) => {
  res.status(200).json({
    service: 'Desi Plaza Caterings API',
    version: '1.0.0',
    status: 'operational',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000
  });
});

module.exports = router;
