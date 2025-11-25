const jwt = require('jsonwebtoken');
const User = require('../models/User');
// Import enhanced RBAC middleware
const {
  validateResourceOwnership,
  requirePermission,
  detectMaliciousRequests,
  preventCrossUserAccess,
  securityAuditLogger
} = require('./rbac');

// Generate access token
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h'
  });
};

// Generate refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
};

// Verify JWT token middleware
const authenticateToken = async (req, res, next) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Try to get token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1] || req.cookies.accessToken; // Check both Bearer token and cookie
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // Get user from database to ensure they still exist and are active
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    
    if (user && user.isActive && !user.isLocked) {
      req.user = user;
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Middleware to check if user has verified identity (for artisans and distributors)
const requireIdentityVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Only check for artisans and distributors
  if (['artisan', 'distributor'].includes(req.user.role)) {
    if (!req.user.isIdentityVerified) {
      return res.status(403).json({
        success: false,
        message: 'Identity verification required to access this resource'
      });
    }
  }

  next();
};

// Middleware to check if customer has complete address before ordering
const requireCompleteAddress = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Only check for customers
  if (req.user.role === 'customer') {
    if (!req.user.addresses || req.user.addresses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add a delivery address before placing an order'
      });
    }

    // Check if at least one address is complete
    const hasCompleteAddress = req.user.addresses.some(address => 
      address.houseNo && address.street && address.city && 
      address.district && address.pinCode
    );

    if (!hasCompleteAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a complete delivery address before placing an order'
      });
    }
  }

  next();
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  authenticateToken,
  optionalAuth,
  authorizeRoles,
  requireIdentityVerification,
  requireCompleteAddress,
  // Enhanced RBAC exports
  validateResourceOwnership,
  requirePermission,
  detectMaliciousRequests,
  preventCrossUserAccess,
  securityAuditLogger
};
