const User = require('../models/User');

/**
 * Enhanced Role-Based Access Control (RBAC) Middleware
 * Provides comprehensive security for API endpoints including:
 * - Resource ownership validation
 * - Cross-user access prevention
 * - Role-based permissions
 * - Malicious request detection
 */

// Resource ownership validation middleware
const validateResourceOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const resourceId = req.params.id || req.params.userId || req.params.artisanId || req.params.distributorId;

      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID is required'
        });
      }

      // Admin users can access any resource
      if (req.user.role === 'admin') {
        return next();
      }

      let hasAccess = false;
      let resource = null;

      switch (resourceType) {
        case 'user':
          // Users can only access their own user profile
          hasAccess = resourceId === userId;
          break;

        case 'artisan':
          // Check if the artisan profile belongs to the authenticated user
          const ArtisanService = require('../services/Artisan_serv');
          try {
            resource = await ArtisanService.getArtisanProfileById(resourceId);
            hasAccess = resource.userId.toString() === userId;
          } catch (error) {
            return res.status(404).json({
              success: false,
              message: 'Artisan profile not found'
            });
          }
          break;

        case 'distributor':
          // Check if the distributor profile belongs to the authenticated user
          const DistributorService = require('../services/Distributor_serv');
          try {
            resource = await DistributorService.getDistributorProfileById(resourceId);
            hasAccess = resource.userId.toString() === userId;
          } catch (error) {
            return res.status(404).json({
              success: false,
              message: 'Distributor profile not found'
            });
          }
          break;

        case 'product':
          // Check if the product belongs to the authenticated user
          const ProductService = require('../services/Product_serv');
          try {
            resource = await ProductService.getProductById(resourceId);
            hasAccess = resource.sellerId.toString() === userId;
          } catch (error) {
            return res.status(404).json({
              success: false,
              message: 'Product not found'
            });
          }
          break;

        case 'order':
          // Check if the order belongs to the authenticated user (buyer or seller)
          const OrderService = require('../services/Order_serv');
          try {
            resource = await OrderService.getOrderById(resourceId);
            hasAccess = resource.buyerId.toString() === userId || resource.sellerId.toString() === userId;
          } catch (error) {
            return res.status(404).json({
              success: false,
              message: 'Order not found'
            });
          }
          break;

        case 'address':
          // Check if the address belongs to the authenticated user
          const user = await User.findById(userId);
          if (user && user.addresses) {
            hasAccess = user.addresses.some(addr => addr._id.toString() === resourceId);
          }
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid resource type'
          });
      }

      if (!hasAccess) {
        // Log potential malicious attempt with enhanced details
        const violation = `Unauthorized ${resourceType} access: User ${userId} (${req.user.role}) tried to access ${resourceType} ${resourceId}`;
        console.warn(`⚠️ ${violation}`);
        
        // Store security violation for request logger
        res.locals.securityViolation = violation;
        res.locals.errorMessage = `Access denied. You can only access your own ${resourceType} resources.`;
        
        return res.status(403).json({
          success: false,
          message: `Access denied. You can only access your own ${resourceType} resources.`,
          code: 'RESOURCE_ACCESS_DENIED'
        });
      }

      // Attach resource to request for use in controller
      req.resourceData = resource;
      next();

    } catch (error) {
      console.error('Resource ownership validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate resource ownership'
      });
    }
  };
};

// Enhanced role permissions with action-based access control
const rolePermissions = {
  customer: {
    canRead: ['user', 'artisan', 'distributor', 'product'],
    canCreate: ['order', 'address'],
    canUpdate: ['user', 'address'],
    canDelete: ['address'],
    canSearch: ['user', 'artisan', 'distributor', 'product'],
    restrictions: {
      requiresAddress: ['order'],
      publicReadOnly: ['artisan', 'distributor', 'product']
    }
  },
  artisan: {
    canRead: ['user', 'artisan', 'distributor', 'product', 'order'],
    canCreate: ['artisan', 'product'],
    canUpdate: ['user', 'artisan', 'product'],
    canDelete: ['product'],
    canSearch: ['user', 'artisan', 'distributor', 'product', 'order'],
    restrictions: {
      requiresIdentityVerification: ['product'],
      ownResourcesOnly: ['artisan', 'product', 'order']
    }
  },
  distributor: {
    canRead: ['user', 'artisan', 'distributor', 'product', 'order', 'inventory'],
    canCreate: ['distributor', 'inventory'],
    canUpdate: ['user', 'distributor', 'inventory'],
    canDelete: ['inventory'],
    canSearch: ['user', 'artisan', 'distributor', 'product', 'order', 'inventory'],
    restrictions: {
      requiresIdentityVerification: ['inventory'],
      ownResourcesOnly: ['distributor', 'inventory', 'order']
    }
  },
  admin: {
    canRead: ['*'],
    canCreate: ['*'],
    canUpdate: ['*'],
    canDelete: ['*'],
    canSearch: ['*'],
    restrictions: {}
  }
};

// Action-based permission middleware
const requirePermission = (action, resourceType) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;
      const permissions = rolePermissions[userRole];

      if (!permissions) {
        return res.status(403).json({
          success: false,
          message: 'Invalid user role'
        });
      }

      // Admin has all permissions
      if (userRole === 'admin') {
        return next();
      }

      // Check if user has permission for this action
      const hasPermission = permissions[`can${action.charAt(0).toUpperCase() + action.slice(1)}`];
      
      if (!hasPermission || (!hasPermission.includes(resourceType) && !hasPermission.includes('*'))) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Your role (${userRole}) does not have ${action} permission for ${resourceType}`,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      // Check role-specific restrictions
      const restrictions = permissions.restrictions;

      // Identity verification requirement
      if (restrictions.requiresIdentityVerification && 
          restrictions.requiresIdentityVerification.includes(resourceType) &&
          !req.user.isIdentityVerified) {
        return res.status(403).json({
          success: false,
          message: 'Identity verification required for this action',
          code: 'IDENTITY_VERIFICATION_REQUIRED'
        });
      }

      // Address requirement for customers
      if (restrictions.requiresAddress && 
          restrictions.requiresAddress.includes(resourceType) &&
          (!req.user.addresses || req.user.addresses.length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'Complete address is required for this action',
          code: 'ADDRESS_REQUIRED'
        });
      }

      next();

    } catch (error) {
      console.error('Permission validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate permissions'
      });
    }
  };
};

// Malicious request detection middleware
const detectMaliciousRequests = async (req, res, next) => {
  try {
    const suspiciousPatterns = [];
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Check for suspicious path traversal attempts
    if (req.originalUrl.includes('../') || req.originalUrl.includes('..\\')) {
      suspiciousPatterns.push('PATH_TRAVERSAL');
    }

    // Check for SQL injection patterns in query parameters
    const sqlPatterns = ['DROP TABLE', 'UNION SELECT', "'OR 1=1", '; DELETE FROM'];
    const queryString = JSON.stringify(req.query).toUpperCase();
    if (sqlPatterns.some(pattern => queryString.includes(pattern))) {
      suspiciousPatterns.push('SQL_INJECTION');
    }

    // Check for NoSQL injection patterns
    if (typeof req.body === 'object' && req.body !== null) {
      const bodyString = JSON.stringify(req.body);
      if (bodyString.includes('$where') || bodyString.includes('$regex') || bodyString.includes('$ne')) {
        suspiciousPatterns.push('NOSQL_INJECTION');
      }
    }

    // Check for attempts to access admin endpoints by non-admin users
    if (req.originalUrl.includes('/admin/') && userRole !== 'admin') {
      suspiciousPatterns.push('UNAUTHORIZED_ADMIN_ACCESS');
    }

    // Check for mass data requests (potential data scraping)
    const limit = parseInt(req.query.limit) || 10;
    if (limit > 100 && userRole !== 'admin') {
      suspiciousPatterns.push('POTENTIAL_DATA_SCRAPING');
    }

    // Check for rapid-fire requests to different user IDs (potential enumeration)
    const targetUserId = req.params.userId || req.params.id;
    if (targetUserId && targetUserId !== userId && userRole !== 'admin') {
      // This would require implementing request tracking - simplified version
      if (req.headers['x-forwarded-for'] || req.connection.remoteAddress) {
        // Log for monitoring
        console.info(`🔍 Cross-user access: ${userId} accessing ${targetUserId}`);
      }
    }

    // If suspicious patterns detected, log and potentially block
    if (suspiciousPatterns.length > 0) {
      const violation = `Suspicious patterns detected: ${suspiciousPatterns.join(', ')} from ${req.ip}`;
      console.warn(`🚨 ${violation}`, {
        patterns: suspiciousPatterns,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      });

      // Store security violation for request logger
      res.locals.securityViolation = violation;
      
      // For severe patterns, block the request
      const severePatterns = ['SQL_INJECTION', 'NOSQL_INJECTION', 'PATH_TRAVERSAL'];
      if (suspiciousPatterns.some(pattern => severePatterns.includes(pattern))) {
        res.locals.errorMessage = 'Request blocked due to security concerns';
        return res.status(400).json({
          success: false,
          message: 'Request blocked due to security concerns',
          code: 'SECURITY_VIOLATION'
        });
      }
    }

    next();

  } catch (error) {
    console.error('Malicious request detection error:', error);
    next(); // Continue processing even if detection fails
  }
};

// Cross-user protection middleware
const preventCrossUserAccess = (req, res, next) => {
  const authenticatedUserId = req.user.id;
  const targetUserId = req.params.userId || req.body.userId;

  // Admin can access any user
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if user is trying to access/modify another user's data
  if (targetUserId && targetUserId !== authenticatedUserId) {
    console.warn(`⚠️ Cross-user access attempt: ${authenticatedUserId} tried to access ${targetUserId}`);
    
    return res.status(403).json({
      success: false,
      message: 'You can only access your own resources',
      code: 'CROSS_USER_ACCESS_DENIED'
    });
  }

  next();
};

// Rate limiting per role - Lenient for production testing
const roleBasedRateLimit = {
  customer: { windowMs: 15 * 60 * 1000, max: 500 }, // Increased from 100 to 500 requests per 15 minutes
  artisan: { windowMs: 15 * 60 * 1000, max: 1000 },  // Increased from 200 to 1000 requests per 15 minutes
  distributor: { windowMs: 15 * 60 * 1000, max: 1000 }, // Increased from 200 to 1000 requests per 15 minutes
  admin: { windowMs: 15 * 60 * 1000, max: 5000 }    // Increased from 1000 to 5000 requests per 15 minutes
};

// Security audit logging
const securityAuditLogger = (action, resourceType) => {
  return (req, res, next) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const resourceId = req.params.id || req.params.userId;
    
    // Log the action for security audit
    console.info(`🔐 Security Audit: ${userRole} ${userId} performed ${action} on ${resourceType} ${resourceId || 'N/A'}`);
    
    // Add audit trail to response headers (for debugging)
    res.setHeader('X-Audit-Trail', `${action}-${resourceType}-${Date.now()}`);
    
    next();
  };
};

module.exports = {
  validateResourceOwnership,
  requirePermission,
  detectMaliciousRequests,
  preventCrossUserAccess,
  rolePermissions,
  roleBasedRateLimit,
  securityAuditLogger
};
