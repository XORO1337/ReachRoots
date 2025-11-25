const express = require('express');
const router = express.Router();
const DistributorDashboardController = require('../controllers/DistributorDashboard_controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Apply authentication and role check to all routes
router.use(authenticateToken);
router.use(authorizeRoles('distributor'));

// Dashboard statistics
router.get('/stats', DistributorDashboardController.getDashboardStats);

// Recent orders
router.get('/recent-orders', DistributorDashboardController.getRecentOrders);

// Low stock alerts
router.get('/low-stock-alerts', DistributorDashboardController.getLowStockAlerts);

// Sales analytics
router.get('/analytics', DistributorDashboardController.getSalesAnalytics);

// Products with inventory
router.get('/products', DistributorDashboardController.getProductsWithInventory);

module.exports = router;
