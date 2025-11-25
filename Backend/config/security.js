/**
 * Role-Based Access Control (RBAC) Security Configuration
 * This file defines comprehensive security policies for the application
 */

const SECURITY_CONFIG = {
  // Role hierarchy (higher roles inherit permissions from lower roles)
  roleHierarchy: {
    admin: ['distributor', 'artisan', 'customer'],
    distributor: ['customer'],
    artisan: ['customer'],
    customer: []
  },

  // Resource-specific permissions per role
  permissions: {
    user: {
      customer: ['read:own', 'update:own'],
      artisan: ['read:own', 'read:public', 'update:own'],
      distributor: ['read:own', 'read:public', 'update:own'],
      admin: ['read:all', 'create:all', 'update:all', 'delete:all']
    },
    artisan: {
      customer: ['read:public'],
      artisan: ['read:public', 'create:own', 'update:own'],
      distributor: ['read:public'],
      admin: ['read:all', 'create:all', 'update:all', 'delete:all']
    },
    distributor: {
      customer: ['read:public'],
      artisan: ['read:public'],
      distributor: ['read:public', 'create:own', 'update:own'],
      admin: ['read:all', 'create:all', 'update:all', 'delete:all']
    },
    product: {
      customer: ['read:public'],
      artisan: ['read:all', 'create:own', 'update:own', 'delete:own'],
      distributor: ['read:all'],
      admin: ['read:all', 'create:all', 'update:all', 'delete:all']
    },
    order: {
      customer: ['read:own', 'create:own'],
      artisan: ['read:own', 'update:own'],
      distributor: ['read:own', 'update:own'],
      admin: ['read:all', 'create:all', 'update:all', 'delete:all']
    },
    inventory: {
      customer: [],
      artisan: [],
      distributor: ['read:own', 'create:own', 'update:own', 'delete:own'],
      admin: ['read:all', 'create:all', 'update:all', 'delete:all']
    },
    address: {
      customer: ['read:own', 'create:own', 'update:own', 'delete:own'],
      artisan: ['read:own', 'create:own', 'update:own', 'delete:own'],
      distributor: ['read:own', 'create:own', 'update:own', 'delete:own'],
      admin: ['read:all', 'create:all', 'update:all', 'delete:all']
    }
  },

  // Special requirements for specific actions
  requirements: {
    artisan: {
      productOperations: ['identity_verified'],
      bankDetailsUpdate: ['identity_verified']
    },
    distributor: {
      inventoryOperations: ['identity_verified']
    },
    customer: {
      orderOperations: ['complete_address']
    }
  },

  // Rate limiting per role (requests per window) - Lenient for production testing
  rateLimits: {
    customer: { windowMs: 15 * 60 * 1000, max: 500 }, // Increased from 100 to 500
    artisan: { windowMs: 15 * 60 * 1000, max: 1000 }, // Increased from 200 to 1000
    distributor: { windowMs: 15 * 60 * 1000, max: 1000 }, // Increased from 200 to 1000
    admin: { windowMs: 15 * 60 * 1000, max: 5000 } // Increased from 1000 to 5000
  },

  // Security patterns to detect malicious requests
  securityPatterns: {
    sqlInjection: [
      'DROP TABLE', 'UNION SELECT', "'OR 1=1", '; DELETE FROM',
      'EXEC(', 'EXEC SP_', 'EXEC XP_', '--', '/*', '*/'
    ],
    nosqlInjection: [
      '$where', '$regex', '$ne', '$gt', '$lt', '$gte', '$lte',
      '$in', '$nin', '$exists', '$type', '$size', '$all'
    ],
    pathTraversal: [
      '../', '..\\', '....\\', '..../', './../', '.\\..\\',
      '%2e%2e%2f', '%2e%2e\\', '%252e%252e%252f'
    ],
    xssPatterns: [
      '<script', '</script>', 'javascript:', 'onerror=', 'onload=',
      'onclick=', 'onmouseover=', 'alert(', 'document.cookie'
    ]
  },

  // Monitoring and logging configuration
  monitoring: {
    logSuspiciousActivity: true,
    alertThreshold: 5, // Number of suspicious requests before alerting
    blockAfterSuspicious: 10, // Block after this many suspicious requests
    auditSensitiveOperations: true,
    trackCrossUserAccess: true
  },

  // Resource ownership mappings
  ownershipMappings: {
    user: { ownerField: '_id', checkField: 'id' },
    artisan: { ownerField: 'userId', checkField: 'id' },
    distributor: { ownerField: 'userId', checkField: 'id' },
    product: { ownerField: 'sellerId', checkField: 'id' },
    order: { ownerField: ['buyerId', 'sellerId'], checkField: 'id' },
    inventory: { ownerField: 'distributorId', checkField: 'id' },
    address: { ownerField: 'userId', checkField: 'id' }
  }
};

// Utility functions for permission checking
const hasPermission = (userRole, resource, action, scope = 'own') => {
  const permissions = SECURITY_CONFIG.permissions[resource];
  if (!permissions || !permissions[userRole]) {
    return false;
  }

  const userPermissions = permissions[userRole];
  const requiredPermission = `${action}:${scope}`;
  const allPermission = `${action}:all`;

  return userPermissions.includes(requiredPermission) || 
         userPermissions.includes(allPermission) ||
         userPermissions.includes('*');
};

const getRequiredPermissionLevel = (userRole, resource, action) => {
  const permissions = SECURITY_CONFIG.permissions[resource];
  if (!permissions || !permissions[userRole]) {
    return null;
  }

  const userPermissions = permissions[userRole];
  for (const permission of userPermissions) {
    if (permission.startsWith(`${action}:`)) {
      return permission.split(':')[1];
    }
  }
  return null;
};

const checkRequirements = (userRole, resource, user) => {
  const requirements = SECURITY_CONFIG.requirements[userRole];
  if (!requirements || !requirements[resource]) {
    return { valid: true };
  }

  const resourceRequirements = requirements[resource];
  
  for (const requirement of resourceRequirements) {
    switch (requirement) {
      case 'identity_verified':
        if (!user.isIdentityVerified) {
          return { 
            valid: false, 
            message: 'Identity verification required for this action',
            code: 'IDENTITY_VERIFICATION_REQUIRED'
          };
        }
        break;
      case 'complete_address':
        if (!user.addresses || user.addresses.length === 0) {
          return { 
            valid: false, 
            message: 'Complete address is required for this action',
            code: 'ADDRESS_REQUIRED'
          };
        }
        break;
    }
  }

  return { valid: true };
};

module.exports = {
  SECURITY_CONFIG,
  hasPermission,
  getRequiredPermissionLevel,
  checkRequirements
};
