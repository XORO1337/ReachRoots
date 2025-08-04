const WishlistService = require('../services/Wishlist_serv');

class WishlistController {
  // Get user's wishlist
  static async getUserWishlist(req, res) {
    try {
      const userId = req.user.id;
      const wishlist = await WishlistService.getUserWishlist(userId);
      
      res.status(200).json({
        success: true,
        message: 'Wishlist retrieved successfully',
        data: wishlist
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Add product to wishlist
  static async addToWishlist(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
      }

      const wishlist = await WishlistService.addToWishlist(userId, productId);
      
      res.status(201).json({
        success: true,
        message: 'Product added to wishlist successfully',
        data: wishlist
      });
    } catch (error) {
      const statusCode = error.message.includes('already in wishlist') ? 409 : 
                         error.message.includes('not found') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Remove product from wishlist
  static async removeFromWishlist(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.params;

      const wishlist = await WishlistService.removeFromWishlist(userId, productId);
      
      res.status(200).json({
        success: true,
        message: 'Product removed from wishlist successfully',
        data: wishlist
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Toggle product in wishlist
  static async toggleWishlistItem(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
      }

      const result = await WishlistService.toggleWishlistItem(userId, productId);
      
      // Determine if item was added or removed
      const wasAdded = result.items.some(item => item.productId._id.toString() === productId);
      
      res.status(200).json({
        success: true,
        message: wasAdded ? 'Product added to wishlist' : 'Product removed from wishlist',
        data: {
          ...result,
          action: wasAdded ? 'added' : 'removed'
        }
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Check if product is in wishlist
  static async checkWishlistItem(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.params;

      const isInWishlist = await WishlistService.isInWishlist(userId, productId);
      
      res.status(200).json({
        success: true,
        data: {
          productId,
          isInWishlist
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Clear entire wishlist
  static async clearWishlist(req, res) {
    try {
      const userId = req.user.id;
      const wishlist = await WishlistService.clearWishlist(userId);
      
      res.status(200).json({
        success: true,
        message: 'Wishlist cleared successfully',
        data: wishlist
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get wishlist statistics
  static async getWishlistStats(req, res) {
    try {
      const userId = req.user.id;
      const stats = await WishlistService.getWishlistStats(userId);
      
      res.status(200).json({
        success: true,
        message: 'Wishlist statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = WishlistController;
