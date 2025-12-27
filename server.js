const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Error handler
const errorHandlerMiddleware = (err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const msg = err.message || 'Something went wrong, please try again later';
  res.status(statusCode).json({ 
    success: false,
    error: msg 
  });
};

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/desi_plaza', {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000
})
.then(() => {
  console.log('MongoDB connected');
  // Start server after DB connection
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => console.log(err));

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// Public routes
app.use('/api/auth', authRoutes);


const itemRoutes = require('./routes/items');

// Debug route to inspect all items in DB
app.get('/api/items/debug', async (req, res) => {
  try {
    const Item = require('./models/Item');
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/items', itemRoutes);

const enquiryRoutes = require('./routes/enquiries');
const quotationRoutes = require('./routes/quotations');
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/quotations', quotationRoutes);


const orderRoutes = require('./routes/orders');
app.use('/api/orders', orderRoutes);

// Schedules route
const scheduleRoutes = require('./routes/schedules');
app.use('/api/schedules', scheduleRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(errorHandlerMiddleware);

app.get('/', (req, res) => {
  res.send('Catering Backend API');
});

// Health check endpoint
app.get('/ping', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.status(200).json({ status: 'ok', timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

console.log('DEBUG: This is the backend/server.js file running');

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});
