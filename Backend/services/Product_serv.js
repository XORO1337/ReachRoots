const Product = require('../models/Product');
const mongoosePaginate = require('mongoose-paginate-v2');

// Apply pagination plugin to the schema
Product.schema.plugin(mongoosePaginate);

class ProductService {
  // Create a new product
  static async createProduct(productData) {
    try {
      const product = new Product(productData);
      return await product.save();
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  // Get products with pagination, filters, and sorting (for distributor dashboard)
  static async getProducts(page = 1, limit = 10, filters = {}, sort = { createdAt: -1 }) {
    try {
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        populate: 'artisanId', // Fixed: use consistent field name
        lean: true
      };

      const products = await Product.paginate(filters, options);
      return products;
    } catch (error) {
      throw new Error(`Error getting products: ${error.message}`);
    }
  }

  // Get all products with optional pagination, filters and sorting
  static async getAllProducts(page = 1, limit = 10, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      // Apply filters
      if (filters.category) {
        query.category = { $regex: filters.category, $options: 'i' };
      }
      if (filters.name) {
        query.name = { $regex: filters.name, $options: 'i' };
      }
      if (filters.artisanId) {
        // If specific artisan is requested, use that instead of null filter
        query.artisanId = filters.artisanId;
      } else {
        // Always filter out products without artisans (data integrity)
        query.artisanId = { $exists: true, $ne: null };
      }
      if (filters.minPrice && filters.maxPrice) {
        query.price = { $gte: filters.minPrice, $lte: filters.maxPrice };
      } else if (filters.minPrice) {
        query.price = { $gte: filters.minPrice };
      } else if (filters.maxPrice) {
        query.price = { $lte: filters.maxPrice };
      }
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.minStock !== undefined) {
        query.stock = { $gte: filters.minStock };
      }

      // Build sort object
      let sortObject = { createdAt: -1 }; // default sort
      if (filters.sortBy) {
        sortObject = {};
        sortObject[filters.sortBy] = filters.sortOrder === 'asc' ? 1 : -1;
      }

      // First find products matching basic criteria
      let products = await Product.find(query)
        .populate('artisanId', 'name email phone city state')
        .skip(skip)
        .limit(limit)
        .sort(sortObject);

      // Apply artisan location filter after population if specified
      if (filters.artisanLocation) {
        const locationRegex = new RegExp(filters.artisanLocation, 'i');
        products = products.filter(product => 
          product.artisanId && (
            (product.artisanId.city && locationRegex.test(product.artisanId.city)) ||
            (product.artisanId.state && locationRegex.test(product.artisanId.state))
          )
        );
      }

      // Get total count (this is approximate when location filter is applied)
      let total = await Product.countDocuments(query);
      
      // If location filter is applied, we need to adjust the count
      if (filters.artisanLocation) {
        const allProducts = await Product.find(query).populate('artisanId', 'city state');
        const locationRegex = new RegExp(filters.artisanLocation, 'i');
        total = allProducts.filter(product => 
          product.artisanId && (
            (product.artisanId.city && locationRegex.test(product.artisanId.city)) ||
            (product.artisanId.state && locationRegex.test(product.artisanId.state))
          )
        ).length;
      }

      return {
        products,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  // Get product by ID
  static async getProductById(id) {
    try {
      const product = await Product.findById(id)
        .populate('artisanId', 'name email phone');
      if (!product) {
        throw new Error('Product not found');
      }
      return product;
    } catch (error) {
      throw new Error(`Error fetching product: ${error.message}`);
    }
  }

  // Update product by ID
  static async updateProduct(id, updateData) {
    try {
      const product = await Product.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('artisanId', 'name email phone');

      if (!product) {
        throw new Error('Product not found');
      }
      return product;
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  // Delete product by ID
  static async deleteProduct(id) {
    try {
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        throw new Error('Product not found');
      }
      return { message: 'Product deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  // Get products by category
  static async getProductsByCategory(category, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const products = await Product.find({ 
        category: { $regex: category, $options: 'i' } 
      })
        .populate('artisanId', 'name email phone')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Product.countDocuments({ 
        category: { $regex: category, $options: 'i' } 
      });

      return {
        products,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching products by category: ${error.message}`);
    }
  }

  // Get products by artisan
  static async getProductsByArtisan(artisanId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const products = await Product.find({ artisanId })
        .populate('artisanId', 'name email phone')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Product.countDocuments({ artisanId });

      return {
        products,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching products by artisan: ${error.message}`);
    }
  }

  // Update product stock
  static async updateProductStock(id, stockChange) {
    try {
      const product = await Product.findById(id);
      if (!product) {
        throw new Error('Product not found');
      }

      const newStock = product.stock + stockChange;
      if (newStock < 0) {
        throw new Error('Insufficient stock');
      }

      product.stock = newStock;
      
      // Update status based on stock
      if (newStock === 0) {
        product.status = 'out_of_stock';
      } else if (product.status === 'out_of_stock') {
        product.status = 'active';
      }

      await product.save();

      return await Product.findById(id)
        .populate('artisanId', 'name email phone');
    } catch (error) {
      throw new Error(`Error updating product stock: ${error.message}`);
    }
  }

  // Get low stock products
  static async getLowStockProducts(threshold = 5, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const products = await Product.find({ 
        stock: { $lte: threshold },
        status: { $ne: 'discontinued' }
      })
        .populate('artisanId', 'name email phone')
        .skip(skip)
        .limit(limit)
        .sort({ stock: 1 });

      const total = await Product.countDocuments({ 
        stock: { $lte: threshold },
        status: { $ne: 'discontinued' }
      });

      return {
        products,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching low stock products: ${error.message}`);
    }
  }

  // Enhanced search products with advanced filtering
  static async searchProducts(searchTerm, page = 1, limit = 10, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      // Text search
      if (searchTerm) {
        const searchRegex = { $regex: searchTerm, $options: 'i' };
        query.$or = [
          { name: searchRegex },
          { description: searchRegex },
          { category: searchRegex }
        ];
      }

      // Always filter out products without artisans (data integrity)
      query.artisanId = { $exists: true, $ne: null };

      // Category filter
      if (filters.category) {
        query.category = { $regex: filters.category, $options: 'i' };
      }

      // Price range filter
      if (filters.minPrice || filters.maxPrice) {
        query.price = {};
        if (filters.minPrice) query.price.$gte = parseFloat(filters.minPrice);
        if (filters.maxPrice) query.price.$lte = parseFloat(filters.maxPrice);
      }

      // Status filter
      if (filters.status) {
        query.status = filters.status;
      }

      // Stock filter (only show in-stock items)
      if (filters.inStockOnly) {
        query.stock = { $gt: 0 };
      }

      // Build sort object
      let sortObject = { createdAt: -1 }; // default sort
      if (filters.sortBy) {
        sortObject = {};
        sortObject[filters.sortBy] = filters.sortOrder === 'asc' ? 1 : -1;
      }

      // First find products matching basic criteria
      let productsQuery = Product.find(query)
        .populate('artisanId', 'name email phone city state')
        .skip(skip)
        .limit(limit)
        .sort(sortObject);

      let products = await productsQuery;

      // Apply artisan location filter after population if specified
      if (filters.artisanLocation) {
        const locationRegex = new RegExp(filters.artisanLocation, 'i');
        products = products.filter(product => 
          product.artisanId && (
            (product.artisanId.city && locationRegex.test(product.artisanId.city)) ||
            (product.artisanId.state && locationRegex.test(product.artisanId.state))
          )
        );
      }

      // Get total count (this is approximate when location filter is applied)
      let total = await Product.countDocuments(query);
      
      // If location filter is applied, we need to adjust the count
      if (filters.artisanLocation) {
        // This is a simplified approach - in production you might want to use aggregation
        const allProducts = await Product.find(query).populate('artisanId', 'city state');
        const locationRegex = new RegExp(filters.artisanLocation, 'i');
        total = allProducts.filter(product => 
          product.artisanId && (
            (product.artisanId.city && locationRegex.test(product.artisanId.city)) ||
            (product.artisanId.state && locationRegex.test(product.artisanId.state))
          )
        ).length;
      }

      return {
        products,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error searching products: ${error.message}`);
    }
  }

  // Get product categories
  static async getProductCategories() {
    try {
      const categories = await Product.distinct('category');
      return categories.filter(cat => cat); // Filter out null/undefined values
    } catch (error) {
      throw new Error(`Error fetching product categories: ${error.message}`);
    }
  }

  // Get featured products (top selling or recently added)
  static async getFeaturedProducts(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const products = await Product.find({ 
        status: 'active',
        stock: { $gt: 0 }
      })
        .populate('artisanId', 'name email phone')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Product.countDocuments({ 
        status: 'active',
        stock: { $gt: 0 }
      });

      return {
        products,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching featured products: ${error.message}`);
    }
  }

  // Update product images (replace all images)
  static async updateProductImages(id, images) {
    try {
      const product = await Product.findByIdAndUpdate(
        id,
        { images },
        { new: true, runValidators: true }
      ).populate('artisanId', 'name email phone');

      if (!product) {
        throw new Error('Product not found');
      }
      return product;
    } catch (error) {
      throw new Error(`Error updating product images: ${error.message}`);
    }
  }

  // Add product images (append to existing images)
  static async addProductImages(id, images) {
    try {
      const product = await Product.findByIdAndUpdate(
        id,
        { $addToSet: { images: { $each: images } } },
        { new: true, runValidators: true }
      ).populate('artisanId', 'name email phone');

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    } catch (error) {
      throw new Error(`Error adding product images: ${error.message}`);
    }
  }

  // Remove product image by URL
  static async removeProductImage(id, imageUrl) {
    try {
      const product = await Product.findByIdAndUpdate(
        id,
        { $pull: { images: imageUrl } },
        { new: true, runValidators: true }
      ).populate('artisanId', 'name email phone');

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    } catch (error) {
      throw new Error(`Error removing product image: ${error.message}`);
    }
  }

  // Get popular products (based on a simple popularity metric)
  static async getPopularProducts(limit = 10) {
    try {
      // In a real application, this would be based on sales, views, ratings, etc.
      // For now, we'll sort by creation date and active status
      const products = await Product.find({ 
        status: 'active',
        stock: { $gt: 0 }
      })
        .populate('artisanId', 'name email phone')
        .sort({ createdAt: -1, stock: -1 }) // Recently added with good stock
        .limit(parseInt(limit));

      return products;
    } catch (error) {
      throw new Error(`Error fetching popular products: ${error.message}`);
    }
  }

  // Delete all products by artisan
  static async deleteProductsByArtisan(artisanId) {
    try {
      const result = await Product.deleteMany({ artisanId });
      return { 
        message: `${result.deletedCount} products deleted successfully`,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      throw new Error(`Error deleting products by artisan: ${error.message}`);
    }
  }

  // Get products by status
  static async getProductsByStatus(status, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const products = await Product.find({ status })
        .populate('artisanId', 'name email phone')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Product.countDocuments({ status });

      return {
        products,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching products by status: ${error.message}`);
    }
  }

  // Update product status
  static async updateProductStatus(id, status) {
    try {
      const validStatuses = ['active', 'inactive', 'out_of_stock', 'discontinued'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status. Valid statuses are: ' + validStatuses.join(', '));
      }

      const product = await Product.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      ).populate('artisanId', 'name email phone');

      if (!product) {
        throw new Error('Product not found');
      }
      return product;
    } catch (error) {
      throw new Error(`Error updating product status: ${error.message}`);
    }
  }

  // Get products by price range
  static async getProductsByPriceRange(minPrice, maxPrice, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      if (minPrice !== undefined && maxPrice !== undefined) {
        query.price = { $gte: minPrice, $lte: maxPrice };
      } else if (minPrice !== undefined) {
        query.price = { $gte: minPrice };
      } else if (maxPrice !== undefined) {
        query.price = { $lte: maxPrice };
      }

      const products = await Product.find(query)
        .populate('artisanId', 'name email phone')
        .skip(skip)
        .limit(limit)
        .sort({ price: 1 });

      const total = await Product.countDocuments(query);

      return {
        products,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching products by price range: ${error.message}`);
    }
  }

  // Bulk update products
  static async bulkUpdateProducts(filter, updateData) {
    try {
      const result = await Product.updateMany(filter, updateData);
      return {
        message: `${result.modifiedCount} products updated successfully`,
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      };
    } catch (error) {
      throw new Error(`Error bulk updating products: ${error.message}`);
    }
  }

  // Get product statistics
  static async getProductStatistics() {
    try {
      const stats = await Product.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            activeProducts: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            inactiveProducts: {
              $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
            },
            outOfStockProducts: {
              $sum: { $cond: [{ $eq: ['$status', 'out_of_stock'] }, 1, 0] }
            },
            discontinuedProducts: {
              $sum: { $cond: [{ $eq: ['$status', 'discontinued'] }, 1, 0] }
            },
            totalStock: { $sum: '$stock' },
            averagePrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        }
      ]);

      return stats[0] || {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        outOfStockProducts: 0,
        discontinuedProducts: 0,
        totalStock: 0,
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0
      };
    } catch (error) {
      throw new Error(`Error fetching product statistics: ${error.message}`);
    }
  }

  // Get products with low stock alert
  static async getLowStockAlert(threshold = 5) {
    try {
      const products = await Product.find({
        stock: { $lte: threshold, $gt: 0 },
        status: { $in: ['active', 'inactive'] }
      })
        .populate('artisanId', 'name email phone')
        .sort({ stock: 1 })
        .limit(50); // Limit to prevent overwhelming results

      return products;
    } catch (error) {
      throw new Error(`Error fetching low stock alert: ${error.message}`);
    }
  }
}

module.exports = ProductService;