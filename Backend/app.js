const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/Auth_route');
const userRoutes = require('./routes/User_route');
const artisanRoutes = require('./routes/Artisan_route');
const artisanDashboardRoutes = require('./routes/ArtisanDashboard_route');
const distributorRoutes = require('./routes/Distributor_route');
const distributorDashboardRoutes = require('./routes/DistributorDashboard_route');
const productRoutes = require('./routes/Products_route');
const orderRoutes = require('./routes/Order_route');
const rawMaterialRoutes = require('./routes/RawMaterial_route');
const materialRoutes = require('./routes/Material_route');
const inventoryRoutes = require('./routes/Inventory_route');
const backupRoutes = require('./routes/Backup_route');
const devLogsRoutes = require('./routes/DevLogs_route');
const adminRoutes = require('./routes/Admin_route');
const wishlistRoutes = require('./routes/Wishlist_route');

// Import middleware
const { generalLimit } = require('./middleware/rateLimiting');
const passport = require('./config/passport');
// Import enhanced security middleware
const { detectMaliciousRequests } = require('./middleware/rbac');
// Import request logger
const RequestLogger = require('./middleware/requestLogger');

// Database connection
const { connectDualDB } = require('./db/connect');
const MongoBackupService = require('./services/mongoBackupService');

const app = express();

// Initialize request logger
const requestLogger = new RequestLogger();
app.locals.requestLogger = requestLogger;

// Security middleware with relaxed CSP for development
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: 'https://cautious-zebra-x5549r5475j6f979-5174.app.github.dev',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// Trust proxy for accurate IP detection (more specific for security)
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false);

// Simple CORS configuration
const corsOptions = {
  origin: 'https://cautious-zebra-x5549r5475j6f979-5174.app.github.dev',
  credentials: true
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Request logging middleware
app.use(requestLogger.middleware());

// Global security scanning (applied to all routes)
app.use(detectMaliciousRequests);

// Rate limiting
app.use(generalLimit);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Session middleware for OAuth role persistence
const session = require('express-session');
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Define routes
console.log('Defining authentication routes...');
app.use('/api/auth', authRoutes);

console.log('Defining user routes...');
app.use('/api/users', userRoutes);

console.log('Defining artisan routes...');
app.use('/api/artisans', artisanRoutes);

app.use('/api/artisan-dashboard', artisanDashboardRoutes);

console.log('Defining product routes...');
app.use('/api/products', productRoutes);

console.log('Defining order routes...');
app.use('/api/orders', orderRoutes);

console.log('Defining raw material routes...');
app.use('/api/raw-material-orders', rawMaterialRoutes);

console.log('Defining material routes...');
app.use('/api/materials', materialRoutes);

console.log('Defining inventory routes...');
app.use('/api/inventory', inventoryRoutes);

console.log('Defining distributor routes...');
app.use('/api/distributors', distributorRoutes);

console.log('Defining distributor dashboard routes...');
app.use('/api/distributor-dashboard', distributorDashboardRoutes);

console.log('Defining backup routes...');
app.use('/api/backups', backupRoutes);

console.log('Defining dev logs routes...');
app.use('/api/dev', devLogsRoutes);

console.log('Defining admin routes...');
app.use('/api/admin', adminRoutes);

console.log('Defining wishlist routes...');
app.use('/api/wishlist', wishlistRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend API is running successfully',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Artisan Management System API',
    version: '2.0.0',
    features: [
      'JWT Authentication',
      'Google OAuth 2.0',
      'Phone Number Verification',
      'Role-based Authorization',
      'Identity Verification',
      'Address Management'
    ],
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      artisans: '/api/artisans',
      distributors: '/api/distributors',
      products: '/api/products',
      orders: '/api/orders',
      rawMaterialOrders: '/api/raw-material-orders',
      materials: '/api/materials',
      inventory: '/api/inventory',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5MB'
    });
  }
  
  // CORS errors
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler (updated for Express 5.x)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    // Initialize dual database connections
    await connectDualDB();
    console.log('✅ Connected to MongoDB databases successfully');
    
    // Initialize backup service
    const backupService = new MongoBackupService();
    console.log('🔄 Backup service initialized');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📱 API available at: http://localhost:${PORT}`);
      console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`💾 Backup management: http://localhost:${PORT}/api/backups`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;