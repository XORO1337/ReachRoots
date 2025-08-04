const ProductService = require('../services/Product_serv');

// Create product
const createProduct = async (req, res) => {
  try {
    const product = await ProductService.createProduct(req.body);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all products (enhanced with better filtering)
const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const filters = {};

    // Build filters from query parameters
    if (req.query.category) filters.category = req.query.category;
    if (req.query.name) filters.name = req.query.name;
    if (req.query.artisanId) filters.artisanId = req.query.artisanId;
    if (req.query.minPrice) filters.minPrice = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filters.maxPrice = parseFloat(req.query.maxPrice);
    if (req.query.status) filters.status = req.query.status;
    if (req.query.minStock !== undefined) filters.minStock = parseInt(req.query.minStock);
    if (req.query.artisanLocation) filters.artisanLocation = req.query.artisanLocation;
    
    // Add sorting
    if (req.query.sortBy) filters.sortBy = req.query.sortBy;
    if (req.query.sortOrder) filters.sortOrder = req.query.sortOrder;

    const result = await ProductService.getAllProducts(page, limit, filters);
    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const product = await ProductService.getProductById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// Update product by ID
const updateProduct = async (req, res) => {
  try {
    const product = await ProductService.updateProduct(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete product by ID
const deleteProduct = async (req, res) => {
  try {
    const result = await ProductService.deleteProduct(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await ProductService.getProductsByCategory(req.params.category, page, limit);
    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get products by artisan
const getProductsByArtisan = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await ProductService.getProductsByArtisan(req.params.artisanId, page, limit);
    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update product stock
const updateProductStock = async (req, res) => {
  try {
    const { stockChange } = req.body;
    if (stockChange === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Stock change value is required'
      });
    }

    const product = await ProductService.updateProductStock(req.params.id, stockChange);
    res.status(200).json({
      success: true,
      message: 'Product stock updated successfully',
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get low stock products
const getLowStockProducts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 5;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await ProductService.getLowStockProducts(threshold, page, limit);
    res.status(200).json({
      success: true,
      message: 'Low stock products retrieved successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Enhanced search products with advanced filtering
const searchProducts = async (req, res) => {
  try {
    const searchTerm = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    
    // Build filters object from query parameters
    const filters = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.minPrice) filters.minPrice = req.query.minPrice;
    if (req.query.maxPrice) filters.maxPrice = req.query.maxPrice;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.sortBy) filters.sortBy = req.query.sortBy;
    if (req.query.sortOrder) filters.sortOrder = req.query.sortOrder;
    if (req.query.inStockOnly === 'true') filters.inStockOnly = true;
    if (req.query.artisanLocation) filters.artisanLocation = req.query.artisanLocation;

    const result = await ProductService.searchProducts(searchTerm, page, limit, filters);
    res.status(200).json({
      success: true,
      message: 'Products search completed successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get product categories
const getProductCategories = async (req, res) => {
  try {
    const categories = await ProductService.getProductCategories();
    res.status(200).json({
      success: true,
      message: 'Product categories retrieved successfully',
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await ProductService.getFeaturedProducts(page, limit);
    res.status(200).json({
      success: true,
      message: 'Featured products retrieved successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add product images (append to existing)
const addProductImages = async (req, res) => {
  try {
    const { images } = req.body;
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: 'Images array is required'
      });
    }

    const product = await ProductService.addProductImages(req.params.id, images);
    res.status(200).json({
      success: true,
      message: 'Product images added successfully',
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update product images (replace all images)
const updateProductImages = async (req, res) => {
  try {
    const { images } = req.body;
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: 'Images array is required'
      });
    }

    const product = await ProductService.updateProductImages(req.params.id, images);
    res.status(200).json({
      success: true,
      message: 'Product images updated successfully',
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Remove product image
const removeProductImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required in request body'
      });
    }

    const product = await ProductService.removeProductImage(req.params.id, imageUrl);
    res.status(200).json({
      success: true,
      message: 'Product image removed successfully',
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get popular products
const getPopularProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = await ProductService.getPopularProducts(limit);
    res.status(200).json({
      success: true,
      message: 'Popular products retrieved successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete products by artisan
const deleteProductsByArtisan = async (req, res) => {
  try {
    const result = await ProductService.deleteProductsByArtisan(req.params.artisanId);
    res.status(200).json({
      success: true,
      message: result.message,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get products by status
const getProductsByStatus = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await ProductService.getProductsByStatus(req.params.status, page, limit);
    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update product status
const updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const product = await ProductService.updateProductStatus(req.params.id, status);
    res.status(200).json({
      success: true,
      message: 'Product status updated successfully',
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get products by price range
const getProductsByPriceRange = async (req, res) => {
  try {
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (minPrice === undefined && maxPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'At least one price parameter (minPrice or maxPrice) is required'
      });
    }

    const result = await ProductService.getProductsByPriceRange(minPrice, maxPrice, page, limit);
    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get product statistics
const getProductStatistics = async (req, res) => {
  try {
    // Check if the service method exists
    if (typeof ProductService.getProductStatistics !== 'function') {
      return res.status(501).json({
        success: false,
        message: 'Product statistics feature not implemented yet'
      });
    }

    const stats = await ProductService.getProductStatistics();
    res.status(200).json({
      success: true,
      message: 'Product statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get low stock alert
const getLowStockAlert = async (req, res) => {
  try {
    // Check if the service method exists
    if (typeof ProductService.getLowStockAlert !== 'function') {
      return res.status(501).json({
        success: false,
        message: 'Low stock alert feature not implemented yet'
      });
    }

    const threshold = parseInt(req.query.threshold) || 5;
    const products = await ProductService.getLowStockAlert(threshold);
    res.status(200).json({
      success: true,
      message: 'Low stock alert retrieved successfully',
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Export all functions
module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsByArtisan,
  updateProductStock,
  getLowStockProducts,
  searchProducts,
  getProductCategories,
  getFeaturedProducts,
  addProductImages,
  updateProductImages,
  removeProductImage,
  getPopularProducts,
  deleteProductsByArtisan,
  getProductsByStatus,
  updateProductStatus,
  getProductsByPriceRange,
  getProductStatistics,
  getLowStockAlert
};