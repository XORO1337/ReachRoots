const express = require('express');
const router = express.Router();
const ArtisanDashboardController = require('../controllers/ArtisanDashboard_controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { uploadMultiple, handleMulterError } = require('../middleware/imageUpload');

// All routes require artisan authentication
router.use(authenticateToken);
router.use(authorizeRoles('artisan'));

// Dashboard statistics
router.get('/stats', ArtisanDashboardController.getDashboardStats);

// Analytics data
router.get('/analytics', ArtisanDashboardController.getAnalytics);

// Image upload utilities
router.get('/upload/auth', ArtisanDashboardController.getImageUploadAuth);
router.post('/upload/images', uploadMultiple, handleMulterError, ArtisanDashboardController.uploadProductImages);

// Items/Products management
router.get('/items', ArtisanDashboardController.getArtisanItems);
router.post('/items', (req, res, next) => {
  // Check if request contains files
  if (req.get('Content-Type')?.includes('multipart/form-data')) {
    uploadMultiple(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  } else {
    next();
  }
}, ArtisanDashboardController.createProduct);
router.put('/items/:productId', ArtisanDashboardController.updateProduct);
router.delete('/items/:productId', ArtisanDashboardController.deleteProduct);

// Orders management
router.get('/orders', ArtisanDashboardController.getArtisanOrders);
router.get('/deliveries', ArtisanDashboardController.getArtisanDeliveries);
router.patch('/orders/:orderId/status', ArtisanDashboardController.updateOrderStatus);

module.exports = router;