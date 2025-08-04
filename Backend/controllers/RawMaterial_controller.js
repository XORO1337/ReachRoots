const RawMaterialService = require('../services/RawMaterial_serv');

class RawMaterialController {
  // Create raw material order
  static async createRawMaterialOrder(req, res) {
    try {
      const order = await RawMaterialService.createRawMaterialOrder(req.body);
      res.status(201).json({
        success: true,
        message: 'Raw material order created successfully',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all raw material orders
  static async getAllRawMaterialOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {};

      if (req.query.status) filters.status = req.query.status;
      if (req.query.paymentStatus) filters.paymentStatus = req.query.paymentStatus;
      if (req.query.artisanId) filters.artisanId = req.query.artisanId;
      if (req.query.orderNumber) filters.orderNumber = req.query.orderNumber;
      if (req.query.minAmount) filters.minAmount = parseFloat(req.query.minAmount);
      if (req.query.maxAmount) filters.maxAmount = parseFloat(req.query.maxAmount);

      const result = await RawMaterialService.getAllRawMaterialOrders(page, limit, filters);
      res.status(200).json({
        success: true,
        message: 'Raw material orders retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get raw material order by ID
  static async getRawMaterialOrderById(req, res) {
    try {
      const order = await RawMaterialService.getRawMaterialOrderById(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Raw material order retrieved successfully',
        data: order
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get raw material order by order number
  static async getRawMaterialOrderByNumber(req, res) {
    try {
      const order = await RawMaterialService.getRawMaterialOrderByNumber(req.params.orderNumber);
      res.status(200).json({
        success: true,
        message: 'Raw material order retrieved successfully',
        data: order
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update raw material order by ID
  static async updateRawMaterialOrder(req, res) {
    try {
      const order = await RawMaterialService.updateRawMaterialOrder(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Raw material order updated successfully',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete raw material order by ID
  static async deleteRawMaterialOrder(req, res) {
    try {
      const result = await RawMaterialService.deleteRawMaterialOrder(req.params.id);
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

  // Get raw material orders by artisan
  static async getRawMaterialOrdersByArtisan(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await RawMaterialService.getRawMaterialOrdersByArtisan(req.params.artisanId, page, limit);
      res.status(200).json({
        success: true,
        message: 'Raw material orders retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get raw material orders by status
  static async getRawMaterialOrdersByStatus(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await RawMaterialService.getRawMaterialOrdersByStatus(req.params.status, page, limit);
      res.status(200).json({
        success: true,
        message: 'Raw material orders retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update raw material order status
  static async updateRawMaterialOrderStatus(req, res) {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const order = await RawMaterialService.updateRawMaterialOrderStatus(req.params.id, status);
      res.status(200).json({
        success: true,
        message: 'Raw material order status updated successfully',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update payment status
  static async updatePaymentStatus(req, res) {
    try {
      const { paymentStatus } = req.body;
      if (!paymentStatus) {
        return res.status(400).json({
          success: false,
          message: 'Payment status is required'
        });
      }

      const order = await RawMaterialService.updatePaymentStatus(req.params.id, paymentStatus);
      res.status(200).json({
        success: true,
        message: 'Payment status updated successfully',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get raw material order statistics
  static async getRawMaterialOrderStatistics(req, res) {
    try {
      const filters = {};
      
      if (req.query.artisanId) filters.artisanId = req.query.artisanId;
      if (req.query.startDate) filters.startDate = req.query.startDate;
      if (req.query.endDate) filters.endDate = req.query.endDate;

      const statistics = await RawMaterialService.getRawMaterialOrderStatistics(filters);
      res.status(200).json({
        success: true,
        message: 'Raw material order statistics retrieved successfully',
        data: statistics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Search raw material orders
  static async searchRawMaterialOrders(req, res) {
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
      const result = await RawMaterialService.searchRawMaterialOrders(searchTerm, page, limit);
      res.status(200).json({
        success: true,
        message: 'Raw material orders search completed successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update shipping address
  static async updateShippingAddress(req, res) {
    try {
      const shippingAddress = req.body;
      if (!shippingAddress) {
        return res.status(400).json({
          success: false,
          message: 'Shipping address is required'
        });
      }

      const order = await RawMaterialService.updateShippingAddress(req.params.id, shippingAddress);
      res.status(200).json({
        success: true,
        message: 'Shipping address updated successfully',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get recent raw material orders
  static async getRecentRawMaterialOrders(req, res) {
    try {
      const days = parseInt(req.query.days) || 7;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await RawMaterialService.getRecentRawMaterialOrders(days, page, limit);
      res.status(200).json({
        success: true,
        message: 'Recent raw material orders retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get pending raw material orders
  static async getPendingRawMaterialOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await RawMaterialService.getPendingRawMaterialOrders(page, limit);
      res.status(200).json({
        success: true,
        message: 'Pending raw material orders retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Add items to raw material order
  static async addItemsToOrder(req, res) {
    try {
      const { items } = req.body;
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          message: 'Items array is required'
        });
      }

      const order = await RawMaterialService.addItemsToOrder(req.params.id, items);
      res.status(200).json({
        success: true,
        message: 'Items added to raw material order successfully',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Remove items from raw material order
  static async removeItemsFromOrder(req, res) {
    try {
      const { itemIds } = req.body;
      if (!itemIds || !Array.isArray(itemIds)) {
        return res.status(400).json({
          success: false,
          message: 'Item IDs array is required'
        });
      }

      const order = await RawMaterialService.removeItemsFromOrder(req.params.id, itemIds);
      res.status(200).json({
        success: true,
        message: 'Items removed from raw material order successfully',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Add raw material order item
  static async addRawMaterialOrderItem(req, res) {
    try {
      const { rawMaterialId, quantity, price } = req.body;
      if (!rawMaterialId || !quantity || !price) {
        return res.status(400).json({
          success: false,
          message: 'Raw material ID, quantity, and price are required'
        });
      }

      const order = await RawMaterialService.addRawMaterialOrderItem(req.params.id, { rawMaterialId, quantity, price });
      res.status(200).json({
        success: true,
        message: 'Raw material order item added successfully',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update raw material order item
  static async updateRawMaterialOrderItem(req, res) {
    try {
      const order = await RawMaterialService.updateRawMaterialOrderItem(req.params.id, req.params.itemId, req.body);
      res.status(200).json({
        success: true,
        message: 'Raw material order item updated successfully',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Remove raw material order item
  static async removeRawMaterialOrderItem(req, res) {
    try {
      const order = await RawMaterialService.removeRawMaterialOrderItem(req.params.id, req.params.itemId);
      res.status(200).json({
        success: true,
        message: 'Raw material order item removed successfully',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get pending raw material shipments
  static async getPendingRawMaterialShipments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await RawMaterialService.getPendingRawMaterialShipments(page, limit);
      res.status(200).json({
        success: true,
        message: 'Pending raw material shipments retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get total raw material order amount
  static async getTotalRawMaterialOrderAmount(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const result = await RawMaterialService.getTotalRawMaterialOrderAmount(startDate, endDate);
      res.status(200).json({
        success: true,
        message: 'Total raw material order amount retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get raw material orders by date range
  static async getRawMaterialOrdersByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const result = await RawMaterialService.getRawMaterialOrdersByDateRange(startDate, endDate, page, limit);
      res.status(200).json({
        success: true,
        message: 'Raw material orders by date range retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get raw material order summary
  static async getRawMaterialOrderSummary(req, res) {
    try {
      const { period } = req.query; // daily, weekly, monthly
      const result = await RawMaterialService.getRawMaterialOrderSummary(period);
      res.status(200).json({
        success: true,
        message: 'Raw material order summary retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create bulk raw material orders
  static async createBulkRawMaterialOrders(req, res) {
    try {
      const { orders } = req.body;
      if (!orders || !Array.isArray(orders)) {
        return res.status(400).json({
          success: false,
          message: 'Orders array is required'
        });
      }

      const result = await RawMaterialService.createBulkRawMaterialOrders(orders);
      res.status(201).json({
        success: true,
        message: 'Bulk raw material orders created successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update bulk raw material order status
  static async updateBulkRawMaterialOrderStatus(req, res) {
    try {
      const { orderIds, status } = req.body;
      if (!orderIds || !Array.isArray(orderIds) || !status) {
        return res.status(400).json({
          success: false,
          message: 'Order IDs array and status are required'
        });
      }

      const result = await RawMaterialService.updateBulkRawMaterialOrderStatus(orderIds, status);
      res.status(200).json({
        success: true,
        message: 'Bulk raw material order status updated successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get raw material orders by payment status
  static async getRawMaterialOrdersByPaymentStatus(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await RawMaterialService.getRawMaterialOrdersByPaymentStatus(req.params.paymentStatus, page, limit);
      res.status(200).json({
        success: true,
        message: 'Raw material orders retrieved successfully',
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

module.exports = RawMaterialController;
