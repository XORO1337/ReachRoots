const Inventory = require('../models/Inventory');

class InventoryService {
  // Create a new inventory for an artisan
  static async createInventory(inventoryData) {
    try {
      const inventory = new Inventory(inventoryData);
      return await inventory.save();
    } catch (error) {
      throw new Error(`Error creating inventory: ${error.message}`);
    }
  }

  // Get all inventories with optional pagination
  static async getAllInventories(page = 1, limit = 10, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      // Apply filters
      if (filters.artisanId) {
        query.artisanId = filters.artisanId;
      }

      const inventories = await Inventory.find(query)
        .populate('artisanId', 'name email phone')
        .populate('products.productId', 'name category price')
        .populate('rawMaterials.rawMaterialId', 'name category pricePerUnit')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Inventory.countDocuments(query);

      return {
        inventories,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching inventories: ${error.message}`);
    }
  }

  // Get inventory by ID
  static async getInventoryById(id) {
    try {
      const inventory = await Inventory.findById(id)
        .populate('artisanId', 'name email phone role')
        .populate('products.productId', 'name description category price status')
        .populate('rawMaterials.rawMaterialId', 'name description category pricePerUnit stock');
      
      if (!inventory) {
        throw new Error('Inventory not found');
      }
      
      return inventory;
    } catch (error) {
      throw new Error(`Error fetching inventory: ${error.message}`);
    }
  }

  // Get inventory by artisan ID
  static async getInventoryByArtisanId(artisanId) {
    try {
      const inventory = await Inventory.findOne({ artisanId })
        .populate('artisanId', 'name email phone role')
        .populate('products.productId', 'name description category price status')
        .populate('rawMaterials.rawMaterialId', 'name description category pricePerUnit stock');
      
      if (!inventory) {
        throw new Error('Inventory not found for this artisan');
      }
      
      return inventory;
    } catch (error) {
      throw new Error(`Error fetching inventory by artisan ID: ${error.message}`);
    }
  }

  // Update inventory
  static async updateInventory(id, updateData) {
    try {
      const inventory = await Inventory.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )
        .populate('artisanId', 'name email phone role')
        .populate('products.productId', 'name description category price status')
        .populate('rawMaterials.rawMaterialId', 'name description category pricePerUnit stock');

      if (!inventory) {
        throw new Error('Inventory not found');
      }

      return inventory;
    } catch (error) {
      throw new Error(`Error updating inventory: ${error.message}`);
    }
  }

  // Delete inventory
  static async deleteInventory(id) {
    try {
      const inventory = await Inventory.findByIdAndDelete(id);
      
      if (!inventory) {
        throw new Error('Inventory not found');
      }
      
      return inventory;
    } catch (error) {
      throw new Error(`Error deleting inventory: ${error.message}`);
    }
  }

  // Delete inventory by artisan ID
  static async deleteInventoryByArtisanId(artisanId) {
    try {
      const inventory = await Inventory.findOneAndDelete({ artisanId });
      
      if (!inventory) {
        throw new Error('Inventory not found for this artisan');
      }
      
      return inventory;
    } catch (error) {
      throw new Error(`Error deleting inventory: ${error.message}`);
    }
  }

  // Add product to inventory
  static async addProduct(inventoryId, productData) {
    try {
      const { productId, quantity } = productData;
      
      const inventory = await Inventory.findById(inventoryId);
      if (!inventory) {
        throw new Error('Inventory not found');
      }

      // Check if product already exists in inventory
      const existingProductIndex = inventory.products.findIndex(
        p => p.productId.toString() === productId.toString()
      );

      if (existingProductIndex !== -1) {
        // Update existing product quantity
        inventory.products[existingProductIndex].quantity += quantity;
        inventory.products[existingProductIndex].lastUpdated = new Date();
      } else {
        // Add new product
        inventory.products.push({
          productId,
          quantity,
          lastUpdated: new Date()
        });
      }

      const updatedInventory = await inventory.save();
      return await Inventory.findById(updatedInventory._id)
        .populate('artisanId', 'name email phone role')
        .populate('products.productId', 'name description category price status')
        .populate('rawMaterials.rawMaterialId', 'name description category pricePerUnit stock');
    } catch (error) {
      throw new Error(`Error adding product to inventory: ${error.message}`);
    }
  }

  // Remove product from inventory
  static async removeProduct(inventoryId, productId) {
    try {
      const inventory = await Inventory.findByIdAndUpdate(
        inventoryId,
        { $pull: { products: { productId: productId } } },
        { new: true }
      )
        .populate('artisanId', 'name email phone role')
        .populate('products.productId', 'name description category price status')
        .populate('rawMaterials.rawMaterialId', 'name description category pricePerUnit stock');

      if (!inventory) {
        throw new Error('Inventory not found');
      }

      return inventory;
    } catch (error) {
      throw new Error(`Error removing product from inventory: ${error.message}`);
    }
  }

  // Update product quantity in inventory
  static async updateProductQuantity(inventoryId, productId, quantity) {
    try {
      const inventory = await Inventory.findOneAndUpdate(
        { 
          _id: inventoryId,
          'products.productId': productId
        },
        { 
          $set: { 
            'products.$.quantity': quantity,
            'products.$.lastUpdated': new Date()
          }
        },
        { new: true }
      )
        .populate('artisanId', 'name email phone role')
        .populate('products.productId', 'name description category price status')
        .populate('rawMaterials.rawMaterialId', 'name description category pricePerUnit stock');

      if (!inventory) {
        throw new Error('Inventory or product not found');
      }

      return inventory;
    } catch (error) {
      throw new Error(`Error updating product quantity: ${error.message}`);
    }
  }

  // Add raw material to inventory
  static async addRawMaterial(inventoryId, rawMaterialData) {
    try {
      const { rawMaterialId, quantity } = rawMaterialData;
      
      const inventory = await Inventory.findById(inventoryId);
      if (!inventory) {
        throw new Error('Inventory not found');
      }

      // Check if raw material already exists in inventory
      const existingMaterialIndex = inventory.rawMaterials.findIndex(
        rm => rm.rawMaterialId.toString() === rawMaterialId.toString()
      );

      if (existingMaterialIndex !== -1) {
        // Update existing raw material quantity
        inventory.rawMaterials[existingMaterialIndex].quantity += quantity;
        inventory.rawMaterials[existingMaterialIndex].lastUpdated = new Date();
      } else {
        // Add new raw material
        inventory.rawMaterials.push({
          rawMaterialId,
          quantity,
          lastUpdated: new Date()
        });
      }

      const updatedInventory = await inventory.save();
      return await Inventory.findById(updatedInventory._id)
        .populate('artisanId', 'name email phone role')
        .populate('products.productId', 'name description category price status')
        .populate('rawMaterials.rawMaterialId', 'name description category pricePerUnit stock');
    } catch (error) {
      throw new Error(`Error adding raw material to inventory: ${error.message}`);
    }
  }

  // Remove raw material from inventory
  static async removeRawMaterial(inventoryId, rawMaterialId) {
    try {
      const inventory = await Inventory.findByIdAndUpdate(
        inventoryId,
        { $pull: { rawMaterials: { rawMaterialId: rawMaterialId } } },
        { new: true }
      )
        .populate('artisanId', 'name email phone role')
        .populate('products.productId', 'name description category price status')
        .populate('rawMaterials.rawMaterialId', 'name description category pricePerUnit stock');

      if (!inventory) {
        throw new Error('Inventory not found');
      }

      return inventory;
    } catch (error) {
      throw new Error(`Error removing raw material from inventory: ${error.message}`);
    }
  }

  // Update raw material quantity in inventory
  static async updateRawMaterialQuantity(inventoryId, rawMaterialId, quantity) {
    try {
      const inventory = await Inventory.findOneAndUpdate(
        { 
          _id: inventoryId,
          'rawMaterials.rawMaterialId': rawMaterialId
        },
        { 
          $set: { 
            'rawMaterials.$.quantity': quantity,
            'rawMaterials.$.lastUpdated': new Date()
          }
        },
        { new: true }
      )
        .populate('artisanId', 'name email phone role')
        .populate('products.productId', 'name description category price status')
        .populate('rawMaterials.rawMaterialId', 'name description category pricePerUnit stock');

      if (!inventory) {
        throw new Error('Inventory or raw material not found');
      }

      return inventory;
    } catch (error) {
      throw new Error(`Error updating raw material quantity: ${error.message}`);
    }
  }

  // Get low stock products
  static async getLowStockProducts(inventoryId, threshold = 10) {
    try {
      const inventory = await Inventory.findById(inventoryId)
        .populate('products.productId', 'name description category price status');

      if (!inventory) {
        throw new Error('Inventory not found');
      }

      const lowStockProducts = inventory.products.filter(
        product => product.quantity <= threshold
      );

      return lowStockProducts;
    } catch (error) {
      throw new Error(`Error getting low stock products: ${error.message}`);
    }
  }

  // Get low stock raw materials
  static async getLowStockRawMaterials(inventoryId, threshold = 10) {
    try {
      const inventory = await Inventory.findById(inventoryId)
        .populate('rawMaterials.rawMaterialId', 'name description category pricePerUnit stock');

      if (!inventory) {
        throw new Error('Inventory not found');
      }

      const lowStockMaterials = inventory.rawMaterials.filter(
        material => material.quantity <= threshold
      );

      return lowStockMaterials;
    } catch (error) {
      throw new Error(`Error getting low stock raw materials: ${error.message}`);
    }
  }
}

module.exports = InventoryService;
