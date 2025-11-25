const express = require('express');
const router = express.Router();
const WishlistController = require('../controllers/Wishlist_controller');
const { authenticateToken } = require('../middleware/auth');

// All wishlist routes require authentication
router.use(authenticateToken);

// Get user's wishlist
router.get('/', WishlistController.getUserWishlist);

// Add product to wishlist
router.post('/add', WishlistController.addToWishlist);

// Toggle product in wishlist (add/remove)
router.post('/toggle', WishlistController.toggleWishlistItem);

// Remove product from wishlist
router.delete('/remove/:productId', WishlistController.removeFromWishlist);

// Check if product is in wishlist
router.get('/check/:productId', WishlistController.checkWishlistItem);

// Clear entire wishlist
router.delete('/clear', WishlistController.clearWishlist);

// Get wishlist statistics
router.get('/stats', WishlistController.getWishlistStats);

module.exports = router;
