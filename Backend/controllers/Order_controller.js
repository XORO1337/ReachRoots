const OrderService = require('../services/Order_serv');

class OrderController {
  // Create new order
  static async createOrder(req, res) {
    try {
      const { items = [], shippingAddress, status = 'pending' } = req.body;
      const orderData = {
        buyer: req.user.id,
        items,
        shippingAddress,
        status
      };

      const order = await OrderService.createOrder(orderData);
      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all orders
  static async getAllOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {};

      if (req.query.status) filters.status = req.query.status;
      if (req.query.paymentStatus) filters.paymentStatus = req.query.paymentStatus;
      if (req.query.buyerId) filters.buyerId = req.query.buyerId;
      if (req.query.artisanId) filters.artisanId = req.query.artisanId;
      if (req.query.orderNumber) filters.orderNumber = req.query.orderNumber;
      if (req.query.minAmount) filters.minAmount = parseFloat(req.query.minAmount);
      if (req.query.maxAmount) filters.maxAmount = parseFloat(req.query.maxAmount);

      const result = await OrderService.getAllOrders(page, limit, filters);
      res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get order by ID
  static async getOrderById(req, res) {
    try {
      const order = await OrderService.getOrderById(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: order
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get order by order number
  static async getOrderByNumber(req, res) {
    try {
      const order = await OrderService.getOrderByNumber(req.params.orderNumber);
      res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: order
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update order by ID
  static async updateOrder(req, res) {
    try {
      const order = await OrderService.updateOrder(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Order updated successfully',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete order by ID
  static async deleteOrder(req, res) {
    try {
      const result = await OrderService.deleteOrder(req.params.id);
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

  // Get orders by buyer
  static async getOrdersByBuyer(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await OrderService.getOrdersByBuyer(req.params.buyerId, page, limit);
      res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

    // Get artisan orders
  static async getArtisanOrders(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const orders = await OrderService.getArtisanOrders(req.user.id, parseInt(page), parseInt(limit));
      return res.status(200).json({
        success: true,
        message: 'Artisan orders retrieved successfully',
        data: orders
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get distributor orders
  static async getDistributorOrders(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const orders = await OrderService.getDistributorOrders(req.user.id, parseInt(page), parseInt(limit));
      return res.status(200).json({
        success: true,
        message: 'Distributor orders retrieved successfully',
        data: orders
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get orders by status
  static async getOrdersByStatus(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await OrderService.getOrdersByStatus(req.params.status, page, limit);
      res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update order status
  static async updateOrderStatus(req, res) {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const order = await OrderService.updateOrderStatus(req.params.id, status);
      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
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

      const order = await OrderService.updatePaymentStatus(req.params.id, paymentStatus);
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

  // Get order statistics
  static async getOrderStatistics(req, res) {
    try {
      const filters = {};
      
      if (req.query.artisanId) filters.artisanId = req.query.artisanId;
      if (req.query.buyerId) filters.buyerId = req.query.buyerId;
      if (req.query.startDate) filters.startDate = req.query.startDate;
      if (req.query.endDate) filters.endDate = req.query.endDate;

      const statistics = await OrderService.getOrderStatistics(filters);
      res.status(200).json({
        success: true,
        message: 'Order statistics retrieved successfully',
        data: statistics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Search orders
  static async searchOrders(req, res) {
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
      const result = await OrderService.searchOrders(searchTerm, page, limit);
      res.status(200).json({
        success: true,
        message: 'Orders search completed successfully',
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

      const order = await OrderService.updateShippingAddress(req.params.id, shippingAddress);
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

  // Get recent orders
  static async getRecentOrders(req, res) {
    try {
      const days = parseInt(req.query.days) || 7;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await OrderService.getRecentOrders(days, page, limit);
      res.status(200).json({
        success: true,
        message: 'Recent orders retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Add order item
  static async addOrderItem(req, res) {
    try {
      const { productId, quantity, price } = req.body;
      if (!productId || !quantity || !price) {
        return res.status(400).json({
          success: false,
          message: 'Product ID, quantity, and price are required'
        });
      }

      const order = await OrderService.addOrderItem(req.params.id, { productId, quantity, price });
      res.status(200).json({
        success: true,
        message: 'Order item added successfully',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update order item
  static async updateOrderItem(req, res) {
    try {
      const order = await OrderService.updateOrderItem(req.params.id, req.params.itemId, req.body);
      res.status(200).json({
        success: true,
        message: 'Order item updated successfully',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Remove order item
  static async removeOrderItem(req, res) {
    try {
      const order = await OrderService.removeOrderItem(req.params.id, req.params.itemId);
      res.status(200).json({
        success: true,
        message: 'Order item removed successfully',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get pending shipments
  static async getPendingShipments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await OrderService.getPendingShipments(page, limit);
      res.status(200).json({
        success: true,
        message: 'Pending shipments retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get total order amount
  static async getTotalOrderAmount(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const result = await OrderService.getTotalOrderAmount(startDate, endDate);
      res.status(200).json({
        success: true,
        message: 'Total order amount retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get orders by date range
  static async getOrdersByDateRange(req, res) {
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

      const result = await OrderService.getOrdersByDateRange(startDate, endDate, page, limit);
      res.status(200).json({
        success: true,
        message: 'Orders by date range retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get order summary
  static async getOrderSummary(req, res) {
    try {
      const { period } = req.query; // daily, weekly, monthly
      const result = await OrderService.getOrderSummary(period);
      res.status(200).json({
        success: true,
        message: 'Order summary retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get orders by payment status
  static async getOrdersByPaymentStatus(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await OrderService.getOrdersByPaymentStatus(req.params.paymentStatus, page, limit);
      res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
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

module.exports = OrderController;
