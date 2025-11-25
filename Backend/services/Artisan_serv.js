const ArtisanProfile = require('../models/Artisan');

class ArtisanService {
  // Create a new artisan profile
  static async createArtisanProfile(artisanData) {
    try {
      const artisan = new ArtisanProfile(artisanData);
      return await artisan.save();
    } catch (error) {
      throw new Error(`Error creating artisan profile: ${error.message}`);
    }
  }

  // Get all artisan profiles with optional pagination
  static async getAllArtisanProfiles(page = 1, limit = 10, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      // Apply filters
      if (filters.region) {
        query.region = { $regex: filters.region, $options: 'i' };
      }
      if (filters.skills && filters.skills.length > 0) {
        query.skills = { $in: filters.skills };
      }

      const artisans = await ArtisanProfile.find(query)
        .populate('userId', 'name email phone')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await ArtisanProfile.countDocuments(query);

      return {
        artisans,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching artisan profiles: ${error.message}`);
    }
  }

  // Get artisan profile by ID
  static async getArtisanProfileById(id) {
    try {
      const artisan = await ArtisanProfile.findById(id)
        .populate('userId', 'name email phone role');
      
      if (!artisan) {
        throw new Error('Artisan profile not found');
      }
      
      return artisan;
    } catch (error) {
      throw new Error(`Error fetching artisan profile: ${error.message}`);
    }
  }

  // Get artisan profile by user ID
  static async getArtisanProfileByUserId(userId) {
    try {
      console.log('Searching for artisan profile with userId:', userId);
      
      const artisan = await ArtisanProfile.findOne({ userId })
        .populate('userId', 'name email phone role')
        .exec();
      
      if (!artisan) {
        console.log('No artisan profile found for userId:', userId);
        return null;
      }
      
      console.log('Found artisan profile:', artisan._id);
      return artisan;
    } catch (error) {
      console.error('Database error when fetching artisan profile:', error);
      throw error;
    }
  }

  // Update artisan profile
  static async updateArtisanProfile(id, updateData) {
    try {
      const artisan = await ArtisanProfile.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('userId', 'name email phone role');

      if (!artisan) {
        throw new Error('Artisan profile not found');
      }

      return artisan;
    } catch (error) {
      throw new Error(`Error updating artisan profile: ${error.message}`);
    }
  }

  // Update artisan profile by user ID
  static async updateArtisanProfileByUserId(userId, updateData) {
    try {
      const artisan = await ArtisanProfile.findOneAndUpdate(
        { userId },
        updateData,
        { new: true, runValidators: true }
      ).populate('userId', 'name email phone role');

      if (!artisan) {
        throw new Error('Artisan profile not found for this user');
      }

      return artisan;
    } catch (error) {
      throw new Error(`Error updating artisan profile: ${error.message}`);
    }
  }

  // Delete artisan profile
  static async deleteArtisanProfile(id) {
    try {
      const artisan = await ArtisanProfile.findByIdAndDelete(id);
      
      if (!artisan) {
        throw new Error('Artisan profile not found');
      }
      
      return artisan;
    } catch (error) {
      throw new Error(`Error deleting artisan profile: ${error.message}`);
    }
  }

  // Delete artisan profile by user ID
  static async deleteArtisanProfileByUserId(userId) {
    try {
      const artisan = await ArtisanProfile.findOneAndDelete({ userId });
      
      if (!artisan) {
        throw new Error('Artisan profile not found for this user');
      }
      
      return artisan;
    } catch (error) {
      throw new Error(`Error deleting artisan profile: ${error.message}`);
    }
  }

  // Search artisans by skills
  static async searchArtisansBySkills(skills, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const artisans = await ArtisanProfile.find({
        skills: { $in: skills }
      })
        .populate('userId', 'name email phone')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await ArtisanProfile.countDocuments({
        skills: { $in: skills }
      });

      return {
        artisans,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error searching artisans by skills: ${error.message}`);
    }
  }

  // Search artisans by region
  static async searchArtisansByRegion(region, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const artisans = await ArtisanProfile.find({
        region: { $regex: region, $options: 'i' }
      })
        .populate('userId', 'name email phone')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await ArtisanProfile.countDocuments({
        region: { $regex: region, $options: 'i' }
      });

      return {
        artisans,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error searching artisans by region: ${error.message}`);
    }
  }

  // Update bank details
  static async updateBankDetails(id, bankDetails) {
    try {
      const artisan = await ArtisanProfile.findByIdAndUpdate(
        id,
        { bankDetails },
        { new: true, runValidators: true }
      ).populate('userId', 'name email phone role');

      if (!artisan) {
        throw new Error('Artisan profile not found');
      }

      return artisan;
    } catch (error) {
      throw new Error(`Error updating bank details: ${error.message}`);
    }
  }

  // Add skill to artisan
  static async addSkill(id, skill) {
    try {
      const artisan = await ArtisanProfile.findByIdAndUpdate(
        id,
        { $addToSet: { skills: skill } },
        { new: true, runValidators: true }
      ).populate('userId', 'name email phone role');

      if (!artisan) {
        throw new Error('Artisan profile not found');
      }

      return artisan;
    } catch (error) {
      throw new Error(`Error adding skill: ${error.message}`);
    }
  }

  // Remove skill from artisan
  static async removeSkill(id, skill) {
    try {
      const artisan = await ArtisanProfile.findByIdAndUpdate(
        id,
        { $pull: { skills: skill } },
        { new: true, runValidators: true }
      ).populate('userId', 'name email phone role');

      if (!artisan) {
        throw new Error('Artisan profile not found');
      }

      return artisan;
    } catch (error) {
      throw new Error(`Error removing skill: ${error.message}`);
    }
  }
}

module.exports = ArtisanService;