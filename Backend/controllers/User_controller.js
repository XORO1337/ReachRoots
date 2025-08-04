const UserService = require('../services/User_serv');

class UserController {
  // Create user
  static async createUser(req, res) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all users
  static async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {};

      if (req.query.role) filters.role = req.query.role;
      if (req.query.isVerified !== undefined) filters.isVerified = req.query.isVerified === 'true';
      if (req.query.email) filters.email = req.query.email;
      if (req.query.name) filters.name = req.query.name;

      const result = await UserService.getAllUsers(page, limit, filters);
      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user by ID
  static async getUserById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user by email
  static async getUserByEmail(req, res) {
    try {
      const user = await UserService.getUserByEmail(req.params.email);
      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update user by ID
  static async updateUser(req, res) {
    try {
      const user = await UserService.updateUser(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete user by ID
  static async deleteUser(req, res) {
    try {
      const result = await UserService.deleteUser(req.params.id);
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

  // Get users by role
  static async getUsersByRole(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await UserService.getUsersByRole(req.params.role, page, limit);
      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Verify user email
  static async verifyUser(req, res) {
    try {
      const user = await UserService.verifyUser(req.params.id);
      res.status(200).json({
        success: true,
        message: 'User verified successfully',
        data: user
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update user address
  static async updateUserAddress(req, res) {
    try {
      const user = await UserService.updateUserAddress(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'User address updated successfully',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Search users
  static async searchUsers(req, res) {
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
      const result = await UserService.searchUsers(searchTerm, page, limit);
      res.status(200).json({
        success: true,
        message: 'Users search completed successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = UserController;
