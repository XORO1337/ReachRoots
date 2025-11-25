const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

class WishlistService {
  // Get user's wishlist
  static async getUserWishlist(userId) {
    try {
      const wishlist = await Wishlist.findOne({ userId })
        .populate({
          path: 'items.productId',
          populate: {
            path: 'artisanId',
            select: 'name email phone city state'
          }
        })
        .sort({ 'items.addedAt': -1 });

      if (!wishlist) {
        return {
          userId,
          items: [],
          totalItems: 0
        };
      }

      // Filter out any null productId (in case product was deleted)
      const validItems = wishlist.items.filter(item => item.productId);

      return {
        userId: wishlist.userId,
        items: validItems,
        totalItems: validItems.length,
        createdAt: wishlist.createdAt,
        updatedAt: wishlist.updatedAt
      };
    } catch (error) {
      throw new Error(`Error fetching wishlist: ${error.message}`);
    }
  }

  // Add product to wishlist
  static async addToWishlist(userId, productId) {
    try {
      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Find or create wishlist
      let wishlist = await Wishlist.findOne({ userId });
      
      if (!wishlist) {
        wishlist = new Wishlist({
          userId,
          items: []
        });
      }

      // Check if product already in wishlist
      const existingItem = wishlist.items.find(
        item => item.productId.toString() === productId
      );

      if (existingItem) {
        throw new Error('Product already in wishlist');
      }

      // Add product to wishlist
      wishlist.items.push({
        productId,
        addedAt: new Date()
      });

      await wishlist.save();

      // Return updated wishlist
      return await this.getUserWishlist(userId);
    } catch (error) {
      throw new Error(`Error adding to wishlist: ${error.message}`);
    }
  }

  // Remove product from wishlist
  static async removeFromWishlist(userId, productId) {
    try {
      const wishlist = await Wishlist.findOne({ userId });
      
      if (!wishlist) {
        throw new Error('Wishlist not found');
      }

      // Remove item from wishlist
      const initialLength = wishlist.items.length;
      wishlist.items = wishlist.items.filter(
        item => item.productId.toString() !== productId
      );

      if (wishlist.items.length === initialLength) {
        throw new Error('Product not found in wishlist');
      }

      await wishlist.save();

      // Return updated wishlist
      return await this.getUserWishlist(userId);
    } catch (error) {
      throw new Error(`Error removing from wishlist: ${error.message}`);
    }
  }

  // Toggle product in wishlist (add if not present, remove if present)
  static async toggleWishlistItem(userId, productId) {
    try {
      const wishlist = await Wishlist.findOne({ userId });
      
      if (!wishlist) {
        // Create new wishlist with the product
        return await this.addToWishlist(userId, productId);
      }

      // Check if product exists in wishlist
      const existingItem = wishlist.items.find(
        item => item.productId.toString() === productId
      );

      if (existingItem) {
        // Remove from wishlist
        return await this.removeFromWishlist(userId, productId);
      } else {
        // Add to wishlist
        return await this.addToWishlist(userId, productId);
      }
    } catch (error) {
      throw new Error(`Error toggling wishlist item: ${error.message}`);
    }
  }

  // Check if product is in user's wishlist
  static async isInWishlist(userId, productId) {
    try {
      const wishlist = await Wishlist.findOne({ userId });
      
      if (!wishlist) {
        return false;
      }

      const item = wishlist.items.find(
        item => item.productId.toString() === productId
      );

      return !!item;
    } catch (error) {
      throw new Error(`Error checking wishlist: ${error.message}`);
    }
  }

  // Clear entire wishlist
  static async clearWishlist(userId) {
    try {
      const wishlist = await Wishlist.findOne({ userId });
      
      if (!wishlist) {
        throw new Error('Wishlist not found');
      }

      wishlist.items = [];
      await wishlist.save();

      return {
        userId,
        items: [],
        totalItems: 0
      };
    } catch (error) {
      throw new Error(`Error clearing wishlist: ${error.message}`);
    }
  }

  // Get wishlist statistics
  static async getWishlistStats(userId) {
    try {
      const wishlist = await Wishlist.findOne({ userId })
        .populate('items.productId', 'price category');

      if (!wishlist) {
        return {
          totalItems: 0,
          totalValue: 0,
          categories: {}
        };
      }

      const validItems = wishlist.items.filter(item => item.productId);
      const totalValue = validItems.reduce((sum, item) => {
        return sum + (item.productId.price || 0);
      }, 0);

      const categories = validItems.reduce((acc, item) => {
        const category = item.productId.category || 'Other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      return {
        totalItems: validItems.length,
        totalValue,
        categories
      };
    } catch (error) {
      throw new Error(`Error getting wishlist stats: ${error.message}`);
    }
  }
}

module.exports = WishlistService;
