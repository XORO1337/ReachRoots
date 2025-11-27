const express = require('express');
const router = express.Router();
const AgentApplicationController = require('../controllers/AgentApplication_controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { generalLimit, authLimit } = require('../middleware/rateLimiting');

/**
 * Agent Application Routes
 * Public routes for application submission and status checking
 * Admin routes for application management
 */

// ========== PUBLIC ROUTES ==========
// These routes are accessible without authentication

// Submit a new agent application
router.post(
  '/submit',
  generalLimit,
  AgentApplicationController.submitApplication
);

// Check application status by application ID or email
router.get(
  '/status/:identifier',
  generalLimit,
  AgentApplicationController.getApplicationStatus
);


// ========== ADMIN ROUTES ==========
// These routes require admin authentication

// Get application statistics (dashboard)
router.get(
  '/admin/stats',
  authenticateToken,
  authorizeRoles('admin'),
  AgentApplicationController.getApplicationStats
);

// Get all applications with filters and pagination
router.get(
  '/admin',
  authenticateToken,
  authorizeRoles('admin'),
  AgentApplicationController.getAllApplications
);

// Get single application details
router.get(
  '/admin/:applicationId',
  authenticateToken,
  authorizeRoles('admin'),
  AgentApplicationController.getApplicationById
);

// Mark application as under review
router.post(
  '/admin/:applicationId/review',
  authenticateToken,
  authorizeRoles('admin'),
  AgentApplicationController.markUnderReview
);

// Request additional information from applicant
router.post(
  '/admin/:applicationId/request-info',
  authenticateToken,
  authorizeRoles('admin'),
  AgentApplicationController.requestMoreInfo
);

// Approve application
router.post(
  '/admin/:applicationId/approve',
  authenticateToken,
  authorizeRoles('admin'),
  AgentApplicationController.approveApplication
);

// Reject application
router.post(
  '/admin/:applicationId/reject',
  authenticateToken,
  authorizeRoles('admin'),
  AgentApplicationController.rejectApplication
);

// Verify a document
router.post(
  '/admin/:applicationId/verify-document',
  authenticateToken,
  authorizeRoles('admin'),
  AgentApplicationController.verifyDocument
);

module.exports = router;
