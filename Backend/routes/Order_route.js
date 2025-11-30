const express = require('express');
const OrderController = require('../controllers/Order_controller.js');
<<<<<<< HEAD
=======
const OrderStatusController = require('../controllers/OrderStatus_controller.js');
>>>>>>> fixed-repo/main
const { authenticateToken } = require('../middleware/auth');
const { validateOrderCreation } = require('../middleware/validation');
const router = express.Router();

// Order creation and management
router.post('/', authenticateToken, validateOrderCreation, OrderController.createOrder);

<<<<<<< HEAD
=======
// Get shipping carriers list (public)
router.get('/shipping-carriers', OrderStatusController.getShippingCarriers);

>>>>>>> fixed-repo/main
// Test route for order creation (temporary)
router.post('/test-create', async (req, res) => {
  try {
    const OrderService = require('../services/Order_serv');
    const testOrderData = {
      buyer: '507f1f77bcf86cd799439011', // Mock buyer ID
      items: [
        {
          id: '507f1f77bcf86cd799439012', // Mock product ID
          name: 'Test Product',
          quantity: 2,
          price: 100,
          artisanId: '507f1f77bcf86cd799439013' // Mock artisan ID
        }
      ],
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        postalCode: '123456'
      }
    };
    
    const order = await OrderService.createOrder(testOrderData);
    res.json({ success: true, order, message: 'Test order created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search and filter routes (must come before ID-based routes)
router.get('/search', authenticateToken, OrderController.searchOrders);
router.get('/status/:status', authenticateToken, OrderController.getOrdersByStatus);
router.get('/order-number/:orderNumber', authenticateToken, OrderController.getOrderByNumber);

// Analytics and reporting
router.get('/analytics/total', authenticateToken, OrderController.getTotalOrderAmount);
router.get('/analytics/date-range', authenticateToken, OrderController.getOrdersByDateRange);
router.get('/analytics/summary', authenticateToken, OrderController.getOrderSummary);

// Order listing and filtering
router.get('/artisan', authenticateToken, OrderController.getArtisanOrders);
router.get('/distributor', authenticateToken, OrderController.getDistributorOrders);
<<<<<<< HEAD
=======
router.get('/buyer/me', authenticateToken, OrderController.getMyOrders); // Get current user's orders
>>>>>>> fixed-repo/main
router.get('/buyer/:buyerId', authenticateToken, OrderController.getOrdersByBuyer);

// Basic CRUD Operations
router.get('/', authenticateToken, OrderController.getAllOrders);
router.get('/:id', authenticateToken, OrderController.getOrderById);
router.put('/:id', authenticateToken, OrderController.updateOrder);
router.delete('/:id', authenticateToken, OrderController.deleteOrder);

<<<<<<< HEAD
// Status management
=======
// ============================================
// ORDER STATUS MANAGEMENT ROUTES
// ============================================

// Get order status with full details
router.get('/:id/status-info', authenticateToken, OrderStatusController.getOrderStatus);

// Get status history timeline
router.get('/:id/history', authenticateToken, OrderStatusController.getStatusHistory);

// Status transition endpoints
router.patch('/:id/receive', authenticateToken, OrderStatusController.markAsReceived);
router.patch('/:id/pack', authenticateToken, OrderStatusController.markAsPacked);
router.post('/:id/request-pickup', authenticateToken, OrderStatusController.requestPickupAgent);
router.post('/:id/self-ship', authenticateToken, OrderStatusController.confirmSelfShipping);
router.patch('/:id/deliver', authenticateToken, OrderStatusController.markAsDelivered);
router.patch('/:id/cancel', authenticateToken, OrderStatusController.cancelOrder);

// Admin/logistics endpoint for confirming pickup
router.post('/:id/confirm-pickup', authenticateToken, OrderStatusController.confirmPickup);

// Add note to order
router.post('/:id/note', authenticateToken, OrderStatusController.addNote);

// Revert status (within 15-minute window)
router.post('/:id/revert', authenticateToken, OrderStatusController.revertStatus);

// Legacy status management (keep for backward compatibility)
>>>>>>> fixed-repo/main
router.patch('/:id/status', authenticateToken, OrderController.updateOrderStatus);

// Order items management
router.post('/:id/items', authenticateToken, OrderController.addOrderItem);
router.put('/:id/items/:itemId', authenticateToken, OrderController.updateOrderItem);
router.delete('/:id/items/:itemId', authenticateToken, OrderController.removeOrderItem);

// Shipping operations
router.patch('/:id/shipping-address', authenticateToken, OrderController.updateShippingAddress);

module.exports = router;
