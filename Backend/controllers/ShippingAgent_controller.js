const ShippingAgentService = require('../services/ShippingAgent_serv');

/**
 * Shipping Agent Controller
 * Handles all shipping agent API endpoints including:
 * - Dashboard and stats
 * - Available opportunities
 * - Delivery management
 * - Earnings and payouts
 */

class ShippingAgentController {
  // ================== DASHBOARD ==================

  /**
   * Get agent dashboard
   */
  static async getDashboard(req, res) {
    try {
      const agentId = req.user.id;

      const dashboard = await ShippingAgentService.getAgentDashboard(agentId);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      console.error('Get agent dashboard error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get dashboard'
      });
    }
  }

  // ================== OPPORTUNITIES ==================

  /**
   * Get available pickup opportunities
   */
  static async getOpportunities(req, res) {
    try {
      const agentId = req.user.id;
      const { page, limit, pinCode, district } = req.query;

      const result = await ShippingAgentService.getAvailableOpportunities(agentId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        pinCode,
        district
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get opportunities error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get opportunities'
      });
    }
  }

  /**
   * Express interest in an opportunity
   */
  static async expressInterest(req, res) {
    try {
      const agentId = req.user.id;
      const { orderId } = req.params;

      const result = await ShippingAgentService.expressInterest(orderId, agentId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Express interest error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to express interest'
      });
    }
  }

  /**
   * Accept an assigned delivery
   */
  static async acceptDelivery(req, res) {
    try {
      const agentId = req.user.id;
      const { orderId } = req.params;

      const result = await ShippingAgentService.acceptDelivery(orderId, agentId);

      res.json({
        success: true,
        message: 'Delivery accepted successfully',
        data: result
      });
    } catch (error) {
      console.error('Accept delivery error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to accept delivery'
      });
    }
  }

  // ================== DELIVERY MANAGEMENT ==================

  /**
   * Get assigned deliveries
   */
  static async getAssignedDeliveries(req, res) {
    try {
      const agentId = req.user.id;
      const { status, page, limit } = req.query;

      const result = await ShippingAgentService.getAssignedDeliveries(agentId, {
        status,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get assigned deliveries error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get deliveries'
      });
    }
  }

  /**
   * Confirm pickup from artisan
   */
  static async confirmPickup(req, res) {
    try {
      const agentId = req.user.id;
      const { orderId } = req.params;
      const { note, pickupProofImage } = req.body;

      const result = await ShippingAgentService.confirmPickup(orderId, agentId, {
        note,
        pickupProofImage
      });

      res.json({
        success: true,
        message: result.message,
        data: {
          order: result.order,
          trackingNumber: result.trackingNumber
        }
      });
    } catch (error) {
      console.error('Confirm pickup error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to confirm pickup'
      });
    }
  }

  /**
   * Mark order as delivered
   */
  static async markDelivered(req, res) {
    try {
      const agentId = req.user.id;
      const { orderId } = req.params;
      const { note, deliveryProofImage, signature, otp } = req.body;

      const result = await ShippingAgentService.markDelivered(orderId, agentId, {
        note,
        deliveryProofImage,
        signature,
        otp
      });

      res.json({
        success: true,
        message: result.message,
        data: {
          order: result.order,
          commission: result.commission
        }
      });
    } catch (error) {
      console.error('Mark delivered error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to mark as delivered'
      });
    }
  }

  /**
   * Get delivery history
   */
  static async getDeliveryHistory(req, res) {
    try {
      const agentId = req.user.id;
      const { page, limit, dateFrom, dateTo } = req.query;

      const result = await ShippingAgentService.getDeliveryHistory(agentId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        dateFrom,
        dateTo
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get delivery history error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get delivery history'
      });
    }
  }

  // ================== EARNINGS & PAYOUTS ==================

  /**
   * Get earnings and wallet info
   */
  static async getEarnings(req, res) {
    try {
      const agentId = req.user.id;
      const { period } = req.query;

      const result = await ShippingAgentService.getEarnings(agentId, { period });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get earnings error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get earnings'
      });
    }
  }

  /**
   * Request payout
   */
  static async requestPayout(req, res) {
    try {
      const agentId = req.user.id;
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid amount is required'
        });
      }

      const result = await ShippingAgentService.requestPayout(agentId, amount);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Request payout error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to request payout'
      });
    }
  }

  /**
   * Update bank details
   */
  static async updateBankDetails(req, res) {
    try {
      const agentId = req.user.id;
      const { accountHolder, accountNumber, ifscCode, bankName } = req.body;

      const result = await ShippingAgentService.updateBankDetails(agentId, {
        accountHolder,
        accountNumber,
        ifscCode,
        bankName
      });

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Update bank details error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update bank details'
      });
    }
  }

  /**
   * Update service areas
   */
  static async updateServiceAreas(req, res) {
    try {
      const agentId = req.user.id;
      const { serviceAreas } = req.body;

      if (!Array.isArray(serviceAreas)) {
        return res.status(400).json({
          success: false,
          message: 'Service areas must be an array'
        });
      }

      const result = await ShippingAgentService.updateServiceAreas(agentId, serviceAreas);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Update service areas error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update service areas'
      });
    }
  }

  /**
   * Get agent profile
   */
  static async getProfile(req, res) {
    try {
      const agentId = req.user.id;

      const User = require('../models/User');
      const agent = await User.findById(agentId).select('-password -refreshTokens');

      if (!agent || agent.role !== 'shipping_agent') {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      res.json({
        success: true,
        data: agent
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get profile'
      });
    }
  }
}

module.exports = ShippingAgentController;
