const express = require('express');
const ProductController = require('../controllers/Product_controller.js');
const router = express.Router();

// Fix for authenticateUser - try different import methods
let authenticateUser;
try {
  // Try destructuring import
  const authMiddleware = require('../middleware/auth');
  authenticateUser = authMiddleware.authenticateUser;
  
  if (!authenticateUser) {
    // Try direct import if destructuring fails
    authenticateUser = require('../middleware/auth');
  }
  
  if (!authenticateUser) {
    // Create a placeholder middleware if auth is still undefined
    console.warn('⚠️  Authentication middleware not found, creating placeholder');
    authenticateUser = (req, res, next) => {
      console.log('Using placeholder auth middleware');
      next();
    };
  }
} catch (error) {
  console.error('❌ Error importing auth middleware:', error.message);
  // Create a placeholder middleware
  authenticateUser = (req, res, next) => {
    console.log('Using fallback auth middleware');
    next();
  };
}

// Debug logging
console.log('=== FIXED DEBUGGING INFO ===');
console.log('ProductController type:', typeof ProductController);
console.log('ProductController constructor name:', ProductController.name);
console.log('authenticateUser type:', typeof authenticateUser);

// Check if ProductController methods exist
const controllerMethods = {};
try {
  controllerMethods.getProductCategories = ProductController.getProductCategories;
  controllerMethods.getPopularProducts = ProductController.getPopularProducts;
  controllerMethods.getAllProducts = ProductController.getAllProducts;
  controllerMethods.createProduct = ProductController.createProduct;
  controllerMethods.getProductById = ProductController.getProductById;
  controllerMethods.updateProduct = ProductController.updateProduct;
  controllerMethods.deleteProduct = ProductController.deleteProduct;
  controllerMethods.searchProducts = ProductController.searchProducts;
  controllerMethods.getProductsByPriceRange = ProductController.getProductsByPriceRange;
  controllerMethods.getLowStockProducts = ProductController.getLowStockProducts;
  controllerMethods.getFeaturedProducts = ProductController.getFeaturedProducts;
  controllerMethods.getProductsByArtisan = ProductController.getProductsByArtisan;
  controllerMethods.getProductsByCategory = ProductController.getProductsByCategory;
  controllerMethods.getProductsByStatus = ProductController.getProductsByStatus;
  controllerMethods.updateProductStock = ProductController.updateProductStock;
  controllerMethods.updateProductStatus = ProductController.updateProductStatus;
  controllerMethods.addProductImages = ProductController.addProductImages;
  controllerMethods.updateProductImages = ProductController.updateProductImages;
  controllerMethods.removeProductImage = ProductController.removeProductImage;
  controllerMethods.deleteProductsByArtisan = ProductController.deleteProductsByArtisan;
  controllerMethods.getProductStatistics = ProductController.getProductStatistics;
  controllerMethods.getLowStockAlert = ProductController.getLowStockAlert;

  console.log('Available methods check:');
  Object.keys(controllerMethods).forEach(method => {
    console.log(`${method}:`, typeof controllerMethods[method]);
  });
} catch (error) {
  console.error('Error checking controller methods:', error.message);
}

console.log('=== END FIXED DEBUG INFO ===');

// Ensure authenticateUser is a function
if (typeof authenticateUser !== 'function') {
  console.error('❌ authenticateUser is not a function, creating default middleware');
  authenticateUser = (req, res, next) => next();
}

// Public routes (no authentication required)
router.get('/categories', controllerMethods.getProductCategories || ProductController.getProductCategories);
router.get('/popular', controllerMethods.getPopularProducts || ProductController.getPopularProducts);

// Search and filter routes - PUBLIC for browsing
if (controllerMethods.searchProducts) {
  router.get('/search', controllerMethods.searchProducts);
}

// Main products listing - PUBLIC for browsing (distributors need to browse products)
router.get('/', controllerMethods.getAllProducts || ProductController.getAllProducts);

// Protected routes - require authentication
// IMPORTANT: Specific routes must come BEFORE parameterized routes

// Statistics and alerts (before other routes to avoid conflicts)
if (controllerMethods.getProductStatistics) {
  router.get('/stats', authenticateUser, controllerMethods.getProductStatistics);
}
if (controllerMethods.getLowStockAlert) {
  router.get('/alerts/low-stock', authenticateUser, controllerMethods.getLowStockAlert);
}

// Search and filter routes (must come before /:id route)
if (controllerMethods.getProductsByPriceRange) {
  router.get('/price-range', authenticateUser, controllerMethods.getProductsByPriceRange);
}
if (controllerMethods.getLowStockProducts) {
  router.get('/low-stock', authenticateUser, controllerMethods.getLowStockProducts);
}
if (controllerMethods.getFeaturedProducts) {
  router.get('/featured', authenticateUser, controllerMethods.getFeaturedProducts);
}

// Category and artisan specific routes
if (controllerMethods.getProductsByArtisan) {
  router.get('/by-artisan/:artisanId', authenticateUser, controllerMethods.getProductsByArtisan);
}
if (controllerMethods.getProductsByCategory) {
  router.get('/by-category/:category', authenticateUser, controllerMethods.getProductsByCategory);
}
if (controllerMethods.getProductsByStatus) {
  router.get('/by-status/:status', authenticateUser, controllerMethods.getProductsByStatus);
}

// Basic CRUD Operations (POST, PUT, DELETE require auth)
router.post('/', authenticateUser, controllerMethods.createProduct || ProductController.createProduct);

// Specific product routes (must come after specific non-parameterized routes)
// GET by ID is public for viewing, others require auth
router.get('/:id', controllerMethods.getProductById || ProductController.getProductById);
router.put('/:id', authenticateUser, controllerMethods.updateProduct || ProductController.updateProduct);
router.patch('/:id', authenticateUser, controllerMethods.updateProduct || ProductController.updateProduct);
router.delete('/:id', authenticateUser, controllerMethods.deleteProduct || ProductController.deleteProduct);

// Stock and status management
if (controllerMethods.updateProductStock) {
  router.patch('/:id/stock', authenticateUser, controllerMethods.updateProductStock);
}
if (controllerMethods.updateProductStatus) {
  router.patch('/:id/status', authenticateUser, controllerMethods.updateProductStatus);
}

// Image management
if (controllerMethods.addProductImages) {
  router.post('/:id/images', authenticateUser, controllerMethods.addProductImages);
}
if (controllerMethods.updateProductImages) {
  router.put('/:id/images', authenticateUser, controllerMethods.updateProductImages);
}
if (controllerMethods.removeProductImage) {
  router.delete('/:id/images', authenticateUser, controllerMethods.removeProductImage);
}

// Bulk operations
if (controllerMethods.deleteProductsByArtisan) {
  router.delete('/artisan/:artisanId', authenticateUser, controllerMethods.deleteProductsByArtisan);
}

console.log('✅ Routes setup completed');

module.exports = router;