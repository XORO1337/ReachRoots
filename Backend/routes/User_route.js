const express = require('express');
const UserController = require('../controllers/User_controller');
const { 
  authenticateToken, 
  authorizeRoles, 
  optionalAuth,
  validateResourceOwnership,
  requirePermission,
  detectMaliciousRequests,
  preventCrossUserAccess,
  securityAuditLogger
} = require('../middleware/auth');
const router = express.Router();

// Public routes (with optional authentication for enhanced data)
router.get('/search/users', optionalAuth, UserController.searchUsers);

// Admin-only routes
router.post('/', 
  authenticateToken, 
  authorizeRoles('admin'), 
  detectMaliciousRequests,
  requirePermission('create', 'user'),
  securityAuditLogger('create', 'user'),
  UserController.createUser
);

router.get('/', 
  authenticateToken, 
  authorizeRoles('admin'), 
  detectMaliciousRequests,
  requirePermission('read', 'user'),
  securityAuditLogger('read', 'user'),
  UserController.getAllUsers
);

router.get('/role/:role', 
  authenticateToken, 
  authorizeRoles('admin'), 
  detectMaliciousRequests,
  requirePermission('read', 'user'),
  securityAuditLogger('read', 'user'),
  UserController.getUsersByRole
);

// Protected routes with resource ownership validation
router.get('/:id', 
  authenticateToken, 
  detectMaliciousRequests,
  validateResourceOwnership('user'),
  requirePermission('read', 'user'),
  securityAuditLogger('read', 'user'),
  UserController.getUserById
);

router.put('/:id', 
  authenticateToken, 
  detectMaliciousRequests,
  validateResourceOwnership('user'),
  requirePermission('update', 'user'),
  securityAuditLogger('update', 'user'),
  UserController.updateUser
);

// Admin-only sensitive operations
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('admin'), 
  detectMaliciousRequests,
  requirePermission('delete', 'user'),
  securityAuditLogger('delete', 'user'),
  UserController.deleteUser
);

router.patch('/:id/verify', 
  authenticateToken, 
  authorizeRoles('admin'), 
  detectMaliciousRequests,
  requirePermission('update', 'user'),
  securityAuditLogger('verify', 'user'),
  UserController.verifyUser
);

// User-specific operations
router.get('/email/:email', 
  authenticateToken, 
  authorizeRoles('admin'), 
  detectMaliciousRequests,
  requirePermission('read', 'user'),
  securityAuditLogger('read', 'user'),
  UserController.getUserByEmail
);

router.patch('/:id/address', 
  authenticateToken, 
  detectMaliciousRequests,
  validateResourceOwnership('user'),
  requirePermission('update', 'user'),
  securityAuditLogger('update', 'user'),
  UserController.updateUserAddress
);

module.exports = router;