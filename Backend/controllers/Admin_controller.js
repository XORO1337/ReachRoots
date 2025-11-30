const AdminService = require('../services/Admin_serv');

/**
 * Admin Controller
 * Handles all admin API endpoints including:
 * - Platform statistics
 * - Order management
 * - User management with flags
 * - Agent management
 * - Pickup request broadcasting
 */

class AdminController {
  // ================== DASHBOARD & STATS ==================

  /**
   * Get platform-wide statistics
   */
  static async getPlatformStats(req, res) {
    try {
      const stats = await AdminService.getPlatformStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get platform stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get platform statistics'
      });
    }
  }

  /**
   * Get activity logs
   */
  static async getActivityLogs(req, res) {
    try {
      const { type, userId, page, limit, dateFrom, dateTo } = req.query;

      const result = await AdminService.getActivityLogs({
        type,
        userId,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50,
        dateFrom,
        dateTo
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get activity logs error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get activity logs'
      });
    }
  }

  // ================== ORDER MANAGEMENT ==================

  /**
   * Get all orders with filtering
   */
  static async getAllOrders(req, res) {
    try {
      const {
        page, limit, status, artisanId, buyerId, agentId,
        search, dateFrom, dateTo, sortBy, sortOrder,
        shippingMethod, hasPendingPickup
      } = req.query;

      const result = await AdminService.getAllOrders({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status,
        artisanId,
        buyerId,
        agentId,
        search,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
        shippingMethod,
        hasPendingPickup: hasPendingPickup === 'true'
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all orders error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get orders'
      });
    }
  }

  /**
   * Get pending pickup requests
   */
  static async getPendingPickupRequests(req, res) {
    try {
      const { pinCode, city, district, page, limit } = req.query;

      const result = await AdminService.getPendingPickupRequests({
        pinCode,
        city,
        district,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get pending pickups error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get pending pickup requests'
      });
    }
  }

  /**
   * Broadcast pickup request to agents
   */
  static async broadcastPickupRequest(req, res) {
    try {
      const { orderId } = req.params;
      const { targetAgentIds, targetPinCodes, targetDistrict, note } = req.body;
      const adminId = req.user.id;

      const result = await AdminService.broadcastPickupRequest(orderId, {
        targetAgentIds,
        targetPinCodes,
        targetDistrict,
        adminId,
        note
      });

      res.json({
        success: true,
        message: `Pickup request broadcasted to ${result.broadcastedTo} agents`,
        data: result
      });
    } catch (error) {
      console.error('Broadcast pickup error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to broadcast pickup request'
      });
    }
  }

  /**
   * Assign agent to order
   */
  static async assignAgentToOrder(req, res) {
    try {
      const { orderId } = req.params;
      const { agentId, note } = req.body;
      const adminId = req.user.id;

      if (!agentId) {
        return res.status(400).json({
          success: false,
          message: 'Agent ID is required'
        });
      }

      const result = await AdminService.assignAgentToOrder(orderId, agentId, adminId, note);

      res.json({
        success: true,
        message: `Agent ${result.agent.name} assigned to order`,
        data: result
      });
    } catch (error) {
      console.error('Assign agent error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to assign agent'
      });
    }
  }

  /**
   * Override order status
   */
  static async overrideOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status, reason } = req.body;
      const adminId = req.user.id;

      if (!status || !reason) {
        return res.status(400).json({
          success: false,
          message: 'Status and reason are required'
        });
      }

      const result = await AdminService.overrideOrderStatus(orderId, status, adminId, reason);

      res.json({
        success: true,
        message: `Order status changed from ${result.previousStatus} to ${result.newStatus}`,
        data: result
      });
    } catch (error) {
      console.error('Override status error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to override order status'
      });
    }
  }

  // ================== USER MANAGEMENT ==================

  /**
   * Add flag to user
   */
  static async addUserFlag(req, res) {
    try {
      const { userId } = req.params;
      const { flag, reason, expiresAt } = req.body;
      const adminId = req.user.id;

      if (!flag) {
        return res.status(400).json({
          success: false,
          message: 'Flag type is required'
        });
      }

      const validFlags = ['scam', 'fraud', 'suspicious', 'trusted', 'vip', 'banned', 'warning'];
      if (!validFlags.includes(flag)) {
        return res.status(400).json({
          success: false,
          message: `Invalid flag. Must be one of: ${validFlags.join(', ')}`
        });
      }

      const user = await AdminService.addUserFlag(userId, { flag, reason, expiresAt }, adminId);

      res.json({
        success: true,
        message: `Flag '${flag}' added to user`,
        data: { userId: user._id, userFlags: user.userFlags }
      });
    } catch (error) {
      console.error('Add user flag error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to add user flag'
      });
    }
  }

  /**
   * Remove flag from user
   */
  static async removeUserFlag(req, res) {
    try {
      const { userId, flag } = req.params;
      const adminId = req.user.id;

      const user = await AdminService.removeUserFlag(userId, flag, adminId);

      res.json({
        success: true,
        message: `Flag '${flag}' removed from user`,
        data: { userId: user._id, userFlags: user.userFlags }
      });
    } catch (error) {
      console.error('Remove user flag error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to remove user flag'
      });
    }
  }

  /**
   * Get flagged users
   */
  static async getFlaggedUsers(req, res) {
    try {
      const { flag, page, limit } = req.query;

      const result = await AdminService.getFlaggedUsers({
        flag,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get flagged users error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get flagged users'
      });
    }
  }

  // ================== AGENT MANAGEMENT ==================

  /**
   * Get all shipping agents
   */
  static async getAllAgents(req, res) {
    try {
      const { isActive, search, sortBy, sortOrder, page, limit } = req.query;

      let isActiveFilter;
      if (isActive === 'true') isActiveFilter = true;
      else if (isActive === 'false') isActiveFilter = false;

      const result = await AdminService.getAllAgents({
        isActive: isActiveFilter,
        search,
        sortBy,
        sortOrder,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all agents error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get agents'
      });
    }
  }

  /**
   * Create shipping agent
   */
  static async createAgent(req, res) {
    try {
      const adminId = req.user.id;
      const {
        name, email, phone, password,
        commissionRate, baseDeliveryFee, serviceAreas,
        vehicleType, vehicleNumber, licenseNumber
      } = req.body;

      if (!name || !email || !phone || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, phone, and password are required'
        });
      }

      const agent = await AdminService.createAgent({
        name,
        email,
        phone,
        password,
        commissionRate,
        baseDeliveryFee,
        serviceAreas,
        vehicleType,
        vehicleNumber,
        licenseNumber
      }, adminId);

      res.status(201).json({
        success: true,
        message: 'Shipping agent created successfully',
        data: {
          id: agent._id,
          name: agent.name,
          email: agent.email,
          phone: agent.phone,
          agentProfile: agent.agentProfile
        }
      });
    } catch (error) {
      console.error('Create agent error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create agent'
      });
    }
  }

  /**
   * Update agent profile
   */
  static async updateAgentProfile(req, res) {
    try {
      const { agentId } = req.params;
      const adminId = req.user.id;
      const updateData = req.body;

      const agent = await AdminService.updateAgentProfile(agentId, updateData, adminId);

      res.json({
        success: true,
        message: 'Agent profile updated',
        data: {
          id: agent._id,
          name: agent.name,
          agentProfile: agent.agentProfile
        }
      });
    } catch (error) {
      console.error('Update agent error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update agent'
      });
    }
  }

  /**
   * Get agent performance stats
   */
  static async getAgentPerformance(req, res) {
    try {
      const { agentId } = req.params;

      const result = await AdminService.getAgentPerformance(agentId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get agent performance error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get agent performance'
      });
    }
  }

  /**
   * Toggle agent active status
   */
  static async toggleAgentStatus(req, res) {
    try {
      const { agentId } = req.params;
      const { isActive } = req.body;
      const adminId = req.user.id;

      const agent = await AdminService.updateAgentProfile(agentId, { isActive }, adminId);

      res.json({
        success: true,
        message: `Agent ${isActive ? 'activated' : 'deactivated'}`,
        data: {
          id: agent._id,
          name: agent.name,
          isActive: agent.agentProfile.isActive
        }
      });
    } catch (error) {
      console.error('Toggle agent status error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to toggle agent status'
      });
    }
  }
}

module.exports = AdminController;
