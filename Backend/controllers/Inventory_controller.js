const InventoryService = require('../services/Inventory_serv');

class InventoryController {
  // Create inventory
  static async createInventory(req, res) {
    try {
      const inventory = await InventoryService.createInventory(req.body);
      res.status(201).json({
        success: true,
        message: 'Inventory created successfully',
        data: inventory
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all inventories
  static async getAllInventories(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {};

      // Extract filters from query parameters
      if (req.query.artisanId) filters.artisanId = req.query.artisanId;

      const result = await InventoryService.getAllInventories(page, limit, filters);
      res.status(200).json({
        success: true,
        message: 'Inventories retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get inventory by ID
  static async getInventoryById(req, res) {
    try {
      const inventory = await InventoryService.getInventoryById(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Inventory retrieved successfully',
        data: inventory
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get inventory by artisan ID
  static async getInventoryByArtisanId(req, res) {
    try {
      const inventory = await InventoryService.getInventoryByArtisanId(req.params.artisanId);
      res.status(200).json({
        success: true,
        message: 'Inventory retrieved successfully',
        data: inventory
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update inventory by ID
  static async updateInventory(req, res) {
    try {
      const inventory = await InventoryService.updateInventory(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Inventory updated successfully',
        data: inventory
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete inventory by ID
  static async deleteInventory(req, res) {
    try {
      const inventory = await InventoryService.deleteInventory(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Inventory deleted successfully',
        data: inventory
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete inventory by artisan ID
  static async deleteInventoryByArtisanId(req, res) {
    try {
      const inventory = await InventoryService.deleteInventoryByArtisanId(req.params.artisanId);
      res.status(200).json({
        success: true,
        message: 'Inventory deleted successfully',
        data: inventory
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Add product to inventory
  static async addProduct(req, res) {
    try {
      const { productId, quantity } = req.body;
      
      if (!productId || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Product ID and quantity are required'
        });
      }

      const inventory = await InventoryService.addProduct(req.params.id, { productId, quantity });
      res.status(200).json({
        success: true,
        message: 'Product added to inventory successfully',
        data: inventory
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Remove product from inventory
  static async removeProduct(req, res) {
    try {
      const inventory = await InventoryService.removeProduct(req.params.id, req.params.productId);
      res.status(200).json({
        success: true,
        message: 'Product removed from inventory successfully',
        data: inventory
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update product quantity in inventory
  static async updateProductQuantity(req, res) {
    try {
      const { quantity } = req.body;
      
      if (quantity === undefined || quantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid quantity is required'
        });
      }

      const inventory = await InventoryService.updateProductQuantity(
        req.params.id, 
        req.params.productId, 
        quantity
      );
      res.status(200).json({
        success: true,
        message: 'Product quantity updated successfully',
        data: inventory
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Add raw material to inventory
  static async addRawMaterial(req, res) {
    try {
      const { rawMaterialId, quantity } = req.body;
      
      if (!rawMaterialId || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Raw material ID and quantity are required'
        });
      }

      const inventory = await InventoryService.addRawMaterial(req.params.id, { rawMaterialId, quantity });
      res.status(200).json({
        success: true,
        message: 'Raw material added to inventory successfully',
        data: inventory
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Remove raw material from inventory
  static async removeRawMaterial(req, res) {
    try {
      const inventory = await InventoryService.removeRawMaterial(req.params.id, req.params.rawMaterialId);
      res.status(200).json({
        success: true,
        message: 'Raw material removed from inventory successfully',
        data: inventory
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update raw material quantity in inventory
  static async updateRawMaterialQuantity(req, res) {
    try {
      const { quantity } = req.body;
      
      if (quantity === undefined || quantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid quantity is required'
        });
      }

      const inventory = await InventoryService.updateRawMaterialQuantity(
        req.params.id, 
        req.params.rawMaterialId, 
        quantity
      );
      res.status(200).json({
        success: true,
        message: 'Raw material quantity updated successfully',
        data: inventory
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get low stock products
  static async getLowStockProducts(req, res) {
    try {
      const threshold = parseInt(req.query.threshold) || 10;
      const lowStockProducts = await InventoryService.getLowStockProducts(req.params.id, threshold);
      res.status(200).json({
        success: true,
        message: 'Low stock products retrieved successfully',
        data: lowStockProducts
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get low stock raw materials
  static async getLowStockRawMaterials(req, res) {
    try {
      const threshold = parseInt(req.query.threshold) || 10;
      const lowStockMaterials = await InventoryService.getLowStockRawMaterials(req.params.id, threshold);
      res.status(200).json({
        success: true,
        message: 'Low stock raw materials retrieved successfully',
        data: lowStockMaterials
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = InventoryController;
