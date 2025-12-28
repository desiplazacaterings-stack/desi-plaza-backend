require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================
// DATABASE CONNECTION
// ============================================
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Initialize database connection
connectDB();

// ============================================
// HEALTH CHECK & ROOT ROUTES
// ============================================

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Desi Plaza Caterings Backend API',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============================================
// API ROUTES (Uncomment as you add them)
// ============================================

// const enquiriesRouter = require('./routes/enquiries');
// const ordersRouter = require('./routes/orders');
// const quotationsRouter = require('./routes/quotations');
// const authRouter = require('./routes/auth');
// const adminRouter = require('./routes/admin');
// const itemsRouter = require('./routes/items');
// const schedulesRouter = require('./routes/schedules');

// app.use('/api/enquiries', enquiriesRouter);
// app.use('/api/orders', ordersRouter);
// app.use('/api/quotations', quotationsRouter);
// app.use('/api/auth', authRouter);
// app.use('/api/admin', adminRouter);
// app.use('/api/items', itemsRouter);
// app.use('/api/schedules', schedulesRouter);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    status: 404
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: {
      status,
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
});

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🍽️  DESI PLAZA CATERINGS BACKEND');
  console.log('='.repeat(50));
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${NODE_ENV}`);
  console.log(`✓ Started: ${new Date().toLocaleString()}`);
  console.log('='.repeat(50) + '\n');
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGINT', () => {
  console.log('\n\n⚠️  Shutting down gracefully...');
  server.close(() => {
    console.log('✓ Server closed');
    mongoose.connection.close();
    console.log('✓ Database connection closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

module.exports = app;
