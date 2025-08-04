const User = require('../models/User');
const bcrypt = require('bcryptjs');

class UserService {
  // Create a new user
  static async createUser(userData) {
    try {
      // Hash password before saving
      if (userData.password) {
        const saltRounds = 10;
        userData.password = await bcrypt.hash(userData.password, saltRounds);
      }
      
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Get all users with optional pagination and filters
  static async getAllUsers(page = 1, limit = 10, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      // Apply filters
      if (filters.role) {
        query.role = filters.role;
      }
      if (filters.isVerified !== undefined) {
        query.isVerified = filters.isVerified;
      }
      if (filters.email) {
        query.email = { $regex: filters.email, $options: 'i' };
      }
      if (filters.name) {
        query.name = { $regex: filters.name, $options: 'i' };
      }

      const users = await User.find(query)
        .select('-password') // Exclude password from results
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(query);

      return {
        users,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  // Get user by ID
  static async getUserById(id) {
    try {
      const user = await User.findById(id).select('-password');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  // Get user by email
  static async getUserByEmail(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  // Update user by ID
  static async updateUser(id, updateData) {
    try {
      // Hash password if it's being updated
      if (updateData.password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(updateData.password, saltRounds);
      }

      const user = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Delete user by ID
  static async deleteUser(id) {
    try {
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        throw new Error('User not found');
      }
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  // Get users by role
  static async getUsersByRole(role, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const users = await User.find({ role })
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments({ role });

      return {
        users,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching users by role: ${error.message}`);
    }
  }

  // Verify user email
  static async verifyUser(id) {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { isVerified: true },
        { new: true }
      ).select('-password');

      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw new Error(`Error verifying user: ${error.message}`);
    }
  }

  // Update user address
  static async updateUserAddress(id, addressData) {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { address: addressData },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw new Error(`Error updating user address: ${error.message}`);
    }
  }

  // Search users
  static async searchUsers(searchTerm, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const searchRegex = { $regex: searchTerm, $options: 'i' };
      
      const query = {
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ]
      };

      const users = await User.find(query)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(query);

      return {
        users,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error searching users: ${error.message}`);
    }
  }
}

module.exports = UserService;
