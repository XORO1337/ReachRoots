const RawMaterial = require('../models/Materials');

class MaterialService {
  // Create a new raw material
  static async createMaterial(materialData) {
    try {
      const material = new RawMaterial(materialData);
      return await material.save();
    } catch (error) {
      throw new Error(`Error creating material: ${error.message}`);
    }
  }

  // Get all materials with optional pagination and filters
  static async getAllMaterials(page = 1, limit = 10, filters = {}) {
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
      if (filters.minPrice && filters.maxPrice) {
        query.pricePerUnit = { $gte: filters.minPrice, $lte: filters.maxPrice };
      } else if (filters.minPrice) {
        query.pricePerUnit = { $gte: filters.minPrice };
      } else if (filters.maxPrice) {
        query.pricePerUnit = { $lte: filters.maxPrice };
      }
      if (filters.minStock !== undefined) {
        query.stock = { $gte: filters.minStock };
      }
      if (filters.supplierId) {
        query.supplierId = filters.supplierId;
      }

      const materials = await RawMaterial.find(query)
        .populate('supplierId', 'name email phone')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await RawMaterial.countDocuments(query);

      return {
        materials,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching materials: ${error.message}`);
    }
  }

  // Get material by ID
  static async getMaterialById(id) {
    try {
      const material = await RawMaterial.findById(id)
        .populate('supplierId', 'name email phone');
      if (!material) {
        throw new Error('Material not found');
      }
      return material;
    } catch (error) {
      throw new Error(`Error fetching material: ${error.message}`);
    }
  }

  // Update material by ID
  static async updateMaterial(id, updateData) {
    try {
      const material = await RawMaterial.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('supplierId', 'name email phone');

      if (!material) {
        throw new Error('Material not found');
      }
      return material;
    } catch (error) {
      throw new Error(`Error updating material: ${error.message}`);
    }
  }

  // Delete material by ID
  static async deleteMaterial(id) {
    try {
      const material = await RawMaterial.findByIdAndDelete(id);
      if (!material) {
        throw new Error('Material not found');
      }
      return { message: 'Material deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting material: ${error.message}`);
    }
  }

  // Get materials by category
  static async getMaterialsByCategory(category, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const materials = await RawMaterial.find({ 
        category: { $regex: category, $options: 'i' } 
      })
        .populate('supplierId', 'name email phone')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await RawMaterial.countDocuments({ 
        category: { $regex: category, $options: 'i' } 
      });

      return {
        materials,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching materials by category: ${error.message}`);
    }
  }

  // Get materials by supplier
  static async getMaterialsBySupplier(supplierId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const materials = await RawMaterial.find({ supplierId })
        .populate('supplierId', 'name email phone')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await RawMaterial.countDocuments({ supplierId });

      return {
        materials,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching materials by supplier: ${error.message}`);
    }
  }

  // Update material stock
  static async updateMaterialStock(id, stockChange) {
    try {
      const material = await RawMaterial.findById(id);
      if (!material) {
        throw new Error('Material not found');
      }

      const newStock = material.stock + stockChange;
      if (newStock < 0) {
        throw new Error('Insufficient stock');
      }

      material.stock = newStock;
      await material.save();

      return await RawMaterial.findById(id)
        .populate('supplierId', 'name email phone');
    } catch (error) {
      throw new Error(`Error updating material stock: ${error.message}`);
    }
  }

  // Get low stock materials
  static async getLowStockMaterials(threshold = 10, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const materials = await RawMaterial.find({ stock: { $lte: threshold } })
        .populate('supplierId', 'name email phone')
        .skip(skip)
        .limit(limit)
        .sort({ stock: 1 });

      const total = await RawMaterial.countDocuments({ stock: { $lte: threshold } });

      return {
        materials,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching low stock materials: ${error.message}`);
    }
  }

  // Search materials
  static async searchMaterials(searchTerm, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const searchRegex = { $regex: searchTerm, $options: 'i' };
      
      const query = {
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { category: searchRegex }
        ]
      };

      const materials = await RawMaterial.find(query)
        .populate('supplierId', 'name email phone')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await RawMaterial.countDocuments(query);

      return {
        materials,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error searching materials: ${error.message}`);
    }
  }

  // Get material categories
  static async getMaterialCategories() {
    try {
      const categories = await RawMaterial.distinct('category');
      return categories;
    } catch (error) {
      throw new Error(`Error fetching material categories: ${error.message}`);
    }
  }
}

module.exports = MaterialService;
