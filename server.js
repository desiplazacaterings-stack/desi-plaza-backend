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

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

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
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      bufferCommands: false,
      retryWrites: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    
    // Connection event handlers
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected - attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✓ MongoDB reconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('✗ MongoDB error:', err.message);
    });

    return conn;
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    console.log('\n⚠️  MongoDB is not available. Running in mock mode for development.\n');
    // Set a flag to use mock data instead of database
    global.USE_MOCK_DATA = true;
  }
};

// ============================================
// ROUTES
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

// Import route modules
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const enquiriesRouter = require('./routes/enquiries');
const ordersRouter = require('./routes/orders');
const quotationsRouter = require('./routes/quotations');
const itemsRouter = require('./routes/items');
const schedulesRouter = require('./routes/schedules');
const agreementsRouter = require('./routes/agreements');

// Register routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/enquiries', enquiriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/quotations', quotationsRouter);
app.use('/api/items', itemsRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/agreements', agreementsRouter);

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
  console.error('Error:', err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error('Stack:', err.stack);
  }

  const status = err.statusCode || err.status || 500;
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

// Connect to database and start server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🍽️  DESI PLAZA CATERINGS BACKEND');
    console.log('='.repeat(50));
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${NODE_ENV}`);
    console.log(`✓ Started: ${new Date().toLocaleString()}`);
    console.log('='.repeat(50) + '\n');
  });

  // Handle port errors
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n✗ Port ${PORT} is already in use`);
      console.error('Please close other applications or change PORT in .env\n');
      process.exit(1);
    }
    throw err;
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

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });

}).catch(err => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

module.exports = app;
