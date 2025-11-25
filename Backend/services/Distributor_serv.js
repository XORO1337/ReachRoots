const Distributor = require('../models/Distributor');

class DistributorService {
  // Create a new distributor profile
  static async createDistributorProfile(distributorData) {
    try {
      const distributor = new Distributor(distributorData);
      return await distributor.save();
    } catch (error) {
      throw new Error(`Error creating distributor profile: ${error.message}`);
    }
  }

  // Get all distributor profiles with optional pagination
  static async getAllDistributorProfiles(page = 1, limit = 10, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      // Apply filters
      if (filters.businessName) {
        query.businessName = { $regex: filters.businessName, $options: 'i' };
      }
      if (filters.distributionAreas && filters.distributionAreas.length > 0) {
        query.distributionAreas = { $in: filters.distributionAreas };
      }

      const distributors = await Distributor.find(query)
        .populate('userId', 'name email phone')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Distributor.countDocuments(query);

      return {
        distributors,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching distributor profiles: ${error.message}`);
    }
  }

  // Get distributor profile by ID
  static async getDistributorProfileById(id) {
    try {
      const distributor = await Distributor.findById(id)
        .populate('userId', 'name email phone role');
      
      if (!distributor) {
        throw new Error('Distributor profile not found');
      }
      
      return distributor;
    } catch (error) {
      throw new Error(`Error fetching distributor profile: ${error.message}`);
    }
  }

  // Get distributor profile by user ID
  static async getDistributorProfileByUserId(userId) {
    try {
      const distributor = await Distributor.findOne({ userId })
        .populate('userId', 'name email phone role');
      
      if (!distributor) {
        throw new Error('Distributor profile not found for this user');
      }
      
      return distributor;
    } catch (error) {
      throw new Error(`Error fetching distributor profile by user ID: ${error.message}`);
    }
  }

  // Update distributor profile
  static async updateDistributorProfile(id, updateData) {
    try {
      const distributor = await Distributor.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('userId', 'name email phone role');

      if (!distributor) {
        throw new Error('Distributor profile not found');
      }

      return distributor;
    } catch (error) {
      throw new Error(`Error updating distributor profile: ${error.message}`);
    }
  }

  // Update distributor profile by user ID
  static async updateDistributorProfileByUserId(userId, updateData) {
    try {
      const distributor = await Distributor.findOneAndUpdate(
        { userId },
        updateData,
        { new: true, runValidators: true }
      ).populate('userId', 'name email phone role');

      if (!distributor) {
        throw new Error('Distributor profile not found for this user');
      }

      return distributor;
    } catch (error) {
      throw new Error(`Error updating distributor profile: ${error.message}`);
    }
  }

  // Delete distributor profile
  static async deleteDistributorProfile(id) {
    try {
      const distributor = await Distributor.findByIdAndDelete(id);
      
      if (!distributor) {
        throw new Error('Distributor profile not found');
      }
      
      return distributor;
    } catch (error) {
      throw new Error(`Error deleting distributor profile: ${error.message}`);
    }
  }

  // Delete distributor profile by user ID
  static async deleteDistributorProfileByUserId(userId) {
    try {
      const distributor = await Distributor.findOneAndDelete({ userId });
      
      if (!distributor) {
        throw new Error('Distributor profile not found for this user');
      }
      
      return distributor;
    } catch (error) {
      throw new Error(`Error deleting distributor profile: ${error.message}`);
    }
  }

  // Search distributors by distribution areas
  static async searchDistributorsByAreas(areas, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const distributors = await Distributor.find({
        distributionAreas: { $in: areas }
      })
        .populate('userId', 'name email phone')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Distributor.countDocuments({
        distributionAreas: { $in: areas }
      });

      return {
        distributors,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error searching distributors by areas: ${error.message}`);
    }
  }

  // Search distributors by business name
  static async searchDistributorsByBusinessName(businessName, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const distributors = await Distributor.find({
        businessName: { $regex: businessName, $options: 'i' }
      })
        .populate('userId', 'name email phone')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Distributor.countDocuments({
        businessName: { $regex: businessName, $options: 'i' }
      });

      return {
        distributors,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error searching distributors by business name: ${error.message}`);
    }
  }

  // Add distribution area to distributor
  static async addDistributionArea(id, area) {
    try {
      const distributor = await Distributor.findByIdAndUpdate(
        id,
        { $addToSet: { distributionAreas: area } },
        { new: true, runValidators: true }
      ).populate('userId', 'name email phone role');

      if (!distributor) {
        throw new Error('Distributor profile not found');
      }

      return distributor;
    } catch (error) {
      throw new Error(`Error adding distribution area: ${error.message}`);
    }
  }

  // Remove distribution area from distributor
  static async removeDistributionArea(id, area) {
    try {
      const distributor = await Distributor.findByIdAndUpdate(
        id,
        { $pull: { distributionAreas: area } },
        { new: true, runValidators: true }
      ).populate('userId', 'name email phone role');

      if (!distributor) {
        throw new Error('Distributor profile not found');
      }

      return distributor;
    } catch (error) {
      throw new Error(`Error removing distribution area: ${error.message}`);
    }
  }
}

module.exports = DistributorService;