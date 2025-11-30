const express = require('express');
const router = express.Router();
const ShippingAgentController = require('../controllers/ShippingAgent_controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication and shipping_agent role
const agentAuth = [authenticateToken, authorizeRoles('shipping_agent')];

/**
 * Shipping Agent Routes
 * Base path: /api/agent
 */

// ================== DASHBOARD ==================
// GET /api/agent/dashboard - Get agent dashboard stats
router.get('/dashboard', agentAuth, ShippingAgentController.getDashboard);

// GET /api/agent/profile - Get agent profile
router.get('/profile', agentAuth, ShippingAgentController.getProfile);

// ================== OPPORTUNITIES ==================
// GET /api/agent/opportunities - Get available pickup opportunities
router.get('/opportunities', agentAuth, ShippingAgentController.getOpportunities);

// POST /api/agent/opportunities/:orderId/interest - Express interest in an opportunity
router.post('/opportunities/:orderId/interest', agentAuth, ShippingAgentController.expressInterest);

// POST /api/agent/opportunities/:orderId/accept - Accept an assigned delivery
router.post('/opportunities/:orderId/accept', agentAuth, ShippingAgentController.acceptDelivery);

// ================== DELIVERIES ==================
// GET /api/agent/deliveries - Get assigned deliveries
router.get('/deliveries', agentAuth, ShippingAgentController.getAssignedDeliveries);

// POST /api/agent/deliveries/:orderId/pickup - Confirm pickup from artisan
router.post('/deliveries/:orderId/pickup', agentAuth, ShippingAgentController.confirmPickup);

// POST /api/agent/deliveries/:orderId/deliver - Mark order as delivered
router.post('/deliveries/:orderId/deliver', agentAuth, ShippingAgentController.markDelivered);

// GET /api/agent/deliveries/history - Get delivery history
router.get('/deliveries/history', agentAuth, ShippingAgentController.getDeliveryHistory);

// ================== EARNINGS & PAYOUTS ==================
// GET /api/agent/earnings - Get earnings and wallet info
router.get('/earnings', agentAuth, ShippingAgentController.getEarnings);

// POST /api/agent/payout - Request payout
router.post('/payout', agentAuth, ShippingAgentController.requestPayout);

// PUT /api/agent/bank-details - Update bank details
router.put('/bank-details', agentAuth, ShippingAgentController.updateBankDetails);

// PUT /api/agent/service-areas - Update service areas
router.put('/service-areas', agentAuth, ShippingAgentController.updateServiceAreas);

module.exports = router;
