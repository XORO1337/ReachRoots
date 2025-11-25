// DataBase Controller for managing materials in the inventory system
// This controller handles CRUD operations for materials, including filtering, pagination, and searching.
// It interacts with the MaterialService to perform operations on the material data.
// It also includes methods for managing material stock, categories, and supplier-specific queries.

const MaterialService = require('../services/Material_serv');

class MaterialController {
  // Create material
  static async createMaterial(req, res) {
    try {
      const material = await MaterialService.createMaterial(req.body);
      res.status(201).json({
        success: true,
        message: 'Material created successfully',
        data: material
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all materials
  static async getAllMaterials(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {};

      if (req.query.category) filters.category = req.query.category;
      if (req.query.name) filters.name = req.query.name;
      if (req.query.minPrice) filters.minPrice = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filters.maxPrice = parseFloat(req.query.maxPrice);
      if (req.query.minStock) filters.minStock = parseInt(req.query.minStock);
      if (req.query.supplierId) filters.supplierId = req.query.supplierId;

      const result = await MaterialService.getAllMaterials(page, limit, filters);
      res.status(200).json({
        success: true,
        message: 'Materials retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get material by ID
  static async getMaterialById(req, res) {
    try {
      const material = await MaterialService.getMaterialById(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Material retrieved successfully',
        data: material
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update material by ID
  static async updateMaterial(req, res) {
    try {
      const material = await MaterialService.updateMaterial(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Material updated successfully',
        data: material
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete material by ID
  static async deleteMaterial(req, res) {
    try {
      const result = await MaterialService.deleteMaterial(req.params.id);
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
  }

  // Get materials by category
  static async getMaterialsByCategory(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await MaterialService.getMaterialsByCategory(req.params.category, page, limit);
      res.status(200).json({
        success: true,
        message: 'Materials retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get materials by supplier
  static async getMaterialsBySupplier(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await MaterialService.getMaterialsBySupplier(req.params.supplierId, page, limit);
      res.status(200).json({
        success: true,
        message: 'Materials retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update material stock
  static async updateMaterialStock(req, res) {
    try {
      const { stockChange } = req.body;
      if (stockChange === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Stock change value is required'
        });
      }

      const material = await MaterialService.updateMaterialStock(req.params.id, stockChange);
      res.status(200).json({
        success: true,
        message: 'Material stock updated successfully',
        data: material
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get low stock materials
  static async getLowStockMaterials(req, res) {
    try {
      const threshold = parseInt(req.query.threshold) || 10;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await MaterialService.getLowStockMaterials(threshold, page, limit);
      res.status(200).json({
        success: true,
        message: 'Low stock materials retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Search materials
  static async searchMaterials(req, res) {
    try {
      const searchTerm = req.query.q;
      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: 'Search term is required'
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await MaterialService.searchMaterials(searchTerm, page, limit);
      res.status(200).json({
        success: true,
        message: 'Materials search completed successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get material categories
  static async getMaterialCategories(req, res) {
    try {
      const categories = await MaterialService.getMaterialCategories();
      res.status(200).json({
        success: true,
        message: 'Material categories retrieved successfully',
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = MaterialController;
