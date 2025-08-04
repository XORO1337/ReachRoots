const RawMaterialOrder = require('../models/RawMaterial');

class RawMaterialService {
  // Create a new raw material order
  static async createRawMaterialOrder(orderData) {
    try {
      const order = new RawMaterialOrder(orderData);
      return await order.save();
    } catch (error) {
      throw new Error(`Error creating raw material order: ${error.message}`);
    }
  }

  // Get all raw material orders with optional pagination and filters
  static async getAllRawMaterialOrders(page = 1, limit = 10, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.paymentStatus) {
        query.paymentStatus = filters.paymentStatus;
      }
      if (filters.artisanId) {
        query.artisanId = filters.artisanId;
      }
      if (filters.orderNumber) {
        query.orderNumber = { $regex: filters.orderNumber, $options: 'i' };
      }
      if (filters.minAmount && filters.maxAmount) {
        query.totalAmount = { $gte: filters.minAmount, $lte: filters.maxAmount };
      } else if (filters.minAmount) {
        query.totalAmount = { $gte: filters.minAmount };
      } else if (filters.maxAmount) {
        query.totalAmount = { $lte: filters.maxAmount };
      }

      const orders = await RawMaterialOrder.find(query)
        .populate('artisanId', 'name email phone')
        .populate('items.rawMaterialId', 'name pricePerUnit category')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await RawMaterialOrder.countDocuments(query);

      return {
        orders,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching raw material orders: ${error.message}`);
    }
  }

  // Get raw material order by ID
  static async getRawMaterialOrderById(id) {
    try {
      const order = await RawMaterialOrder.findById(id)
        .populate('artisanId', 'name email phone')
        .populate('items.rawMaterialId', 'name pricePerUnit category');
      if (!order) {
        throw new Error('Raw material order not found');
      }
      return order;
    } catch (error) {
      throw new Error(`Error fetching raw material order: ${error.message}`);
    }
  }

  // Get raw material order by order number
  static async getRawMaterialOrderByNumber(orderNumber) {
    try {
      const order = await RawMaterialOrder.findOne({ orderNumber })
        .populate('artisanId', 'name email phone')
        .populate('items.rawMaterialId', 'name pricePerUnit category');
      if (!order) {
        throw new Error('Raw material order not found');
      }
      return order;
    } catch (error) {
      throw new Error(`Error fetching raw material order: ${error.message}`);
    }
  }

  // Update raw material order by ID
  static async updateRawMaterialOrder(id, updateData) {
    try {
      const order = await RawMaterialOrder.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )
        .populate('artisanId', 'name email phone')
        .populate('items.rawMaterialId', 'name pricePerUnit category');

      if (!order) {
        throw new Error('Raw material order not found');
      }
      return order;
    } catch (error) {
      throw new Error(`Error updating raw material order: ${error.message}`);
    }
  }

  // Delete raw material order by ID
  static async deleteRawMaterialOrder(id) {
    try {
      const order = await RawMaterialOrder.findByIdAndDelete(id);
      if (!order) {
        throw new Error('Raw material order not found');
      }
      return { message: 'Raw material order deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting raw material order: ${error.message}`);
    }
  }

  // Get raw material orders by artisan
  static async getRawMaterialOrdersByArtisan(artisanId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const orders = await RawMaterialOrder.find({ artisanId })
        .populate('artisanId', 'name email phone')
        .populate('items.rawMaterialId', 'name pricePerUnit category')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await RawMaterialOrder.countDocuments({ artisanId });

      return {
        orders,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching raw material orders by artisan: ${error.message}`);
    }
  }

  // Get raw material orders by status
  static async getRawMaterialOrdersByStatus(status, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const orders = await RawMaterialOrder.find({ status })
        .populate('artisanId', 'name email phone')
        .populate('items.rawMaterialId', 'name pricePerUnit category')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await RawMaterialOrder.countDocuments({ status });

      return {
        orders,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching raw material orders by status: ${error.message}`);
    }
  }

  // Update raw material order status
  static async updateRawMaterialOrderStatus(id, status) {
    try {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid order status');
      }

      const order = await RawMaterialOrder.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      )
        .populate('artisanId', 'name email phone')
        .populate('items.rawMaterialId', 'name pricePerUnit category');

      if (!order) {
        throw new Error('Raw material order not found');
      }
      return order;
    } catch (error) {
      throw new Error(`Error updating raw material order status: ${error.message}`);
    }
  }

  // Update payment status
  static async updatePaymentStatus(id, paymentStatus) {
    try {
      const validStatuses = ['pending', 'completed', 'failed'];
      if (!validStatuses.includes(paymentStatus)) {
        throw new Error('Invalid payment status');
      }

      const order = await RawMaterialOrder.findByIdAndUpdate(
        id,
        { paymentStatus },
        { new: true, runValidators: true }
      )
        .populate('artisanId', 'name email phone')
        .populate('items.rawMaterialId', 'name pricePerUnit category');

      if (!order) {
        throw new Error('Raw material order not found');
      }
      return order;
    } catch (error) {
      throw new Error(`Error updating payment status: ${error.message}`);
    }
  }

  // Get raw material order statistics
  static async getRawMaterialOrderStatistics(filters = {}) {
    try {
      const query = {};
      
      if (filters.artisanId) {
        query.artisanId = filters.artisanId;
      }
      if (filters.startDate && filters.endDate) {
        query.createdAt = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }

      const totalOrders = await RawMaterialOrder.countDocuments(query);
      const completedOrders = await RawMaterialOrder.countDocuments({ ...query, status: 'delivered' });
      const pendingOrders = await RawMaterialOrder.countDocuments({ ...query, status: 'pending' });
      const cancelledOrders = await RawMaterialOrder.countDocuments({ ...query, status: 'cancelled' });

      const totalAmount = await RawMaterialOrder.aggregate([
        { $match: { ...query, paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      return {
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        totalAmount: totalAmount[0]?.total || 0
      };
    } catch (error) {
      throw new Error(`Error fetching raw material order statistics: ${error.message}`);
    }
  }

  // Search raw material orders
  static async searchRawMaterialOrders(searchTerm, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const searchRegex = { $regex: searchTerm, $options: 'i' };
      
      const query = {
        $or: [
          { orderNumber: searchRegex },
          { 'shippingAddress.city': searchRegex },
          { 'shippingAddress.state': searchRegex }
        ]
      };

      const orders = await RawMaterialOrder.find(query)
        .populate('artisanId', 'name email phone')
        .populate('items.rawMaterialId', 'name pricePerUnit category')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await RawMaterialOrder.countDocuments(query);

      return {
        orders,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error searching raw material orders: ${error.message}`);
    }
  }

  // Update shipping address
  static async updateShippingAddress(id, shippingAddress) {
    try {
      const order = await RawMaterialOrder.findByIdAndUpdate(
        id,
        { shippingAddress },
        { new: true, runValidators: true }
      )
        .populate('artisanId', 'name email phone')
        .populate('items.rawMaterialId', 'name pricePerUnit category');

      if (!order) {
        throw new Error('Raw material order not found');
      }
      return order;
    } catch (error) {
      throw new Error(`Error updating shipping address: ${error.message}`);
    }
  }

  // Get recent raw material orders
  static async getRecentRawMaterialOrders(days = 7, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const orders = await RawMaterialOrder.find({
        createdAt: { $gte: startDate }
      })
        .populate('artisanId', 'name email phone')
        .populate('items.rawMaterialId', 'name pricePerUnit category')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await RawMaterialOrder.countDocuments({
        createdAt: { $gte: startDate }
      });

      return {
        orders,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching recent raw material orders: ${error.message}`);
    }
  }

  // Get pending raw material orders
  static async getPendingRawMaterialOrders(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const orders = await RawMaterialOrder.find({ status: 'pending' })
        .populate('artisanId', 'name email phone')
        .populate('items.rawMaterialId', 'name pricePerUnit category')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await RawMaterialOrder.countDocuments({ status: 'pending' });

      return {
        orders,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching pending raw material orders: ${error.message}`);
    }
  }

  // Add items to raw material order
  static async addItemsToOrder(id, items) {
    try {
      const order = await RawMaterialOrder.findById(id);
      if (!order) {
        throw new Error('Raw material order not found');
      }

      // Add new items to existing items
      order.items.push(...items);
      
      // Recalculate total amount
      let totalAmount = 0;
      for (const item of order.items) {
        totalAmount += item.quantity * item.price;
      }
      order.totalAmount = totalAmount;

      await order.save();

      return await RawMaterialOrder.findById(id)
        .populate('artisanId', 'name email phone')
        .populate('items.rawMaterialId', 'name pricePerUnit category');
    } catch (error) {
      throw new Error(`Error adding items to raw material order: ${error.message}`);
    }
  }

  // Remove items from raw material order
  static async removeItemsFromOrder(id, itemIds) {
    try {
      const order = await RawMaterialOrder.findById(id);
      if (!order) {
        throw new Error('Raw material order not found');
      }

      // Remove items with specified IDs
      order.items = order.items.filter(item => !itemIds.includes(item._id.toString()));
      
      // Recalculate total amount
      let totalAmount = 0;
      for (const item of order.items) {
        totalAmount += item.quantity * item.price;
      }
      order.totalAmount = totalAmount;

      await order.save();

      return await RawMaterialOrder.findById(id)
        .populate('artisanId', 'name email phone')
        .populate('items.rawMaterialId', 'name pricePerUnit category');
    } catch (error) {
      throw new Error(`Error removing items from raw material order: ${error.message}`);
    }
  }

  // Add raw material order item
  static async addRawMaterialOrderItem(id, itemData) {
    try {
      const order = await RawMaterialOrder.findById(id);
      if (!order) {
        throw new Error('Raw material order not found');
      }

      order.items.push(itemData);
      
      // Recalculate total amount
      let totalAmount = 0;
      for (const item of order.items) {
        totalAmount += item.quantity * item.price;
      }
      order.totalAmount = totalAmount;

      await order.save();

      return await RawMaterialOrder.findById(id)
        .populate('artisanId', 'name email phone')
        .populate('items.rawMaterialId', 'name pricePerUnit category');
    } catch (error) {
      throw new Error(`Error adding raw material order item: ${error.message}`);
    }
  }

  // Update raw material order item
  static async updateRawMaterialOrderItem(id, itemId, updateData) {
    try {
      const order = await RawMaterialOrder.findById(id);
      if (!order) {
        throw new Error('Raw material order not found');
      }

      const itemIndex = order.items.findIndex(item => item._id.toString() === itemId);
      if (itemIndex === -1) {
        throw new Error('Raw material order item not found');
      }

      Object.assign(order.items[itemIndex], updateData);
      
      // Recalculate total amount
      let totalAmount = 0;
      for (const item of order.items) {
        totalAmount += item.quantity * item.price;
      }
      order.totalAmount = totalAmount;

      await order.save();

      return await RawMaterialOrder.findById(id)
        .populate('artisanId', 'name email phone')
        .populate('items.rawMaterialId', 'name pricePerUnit category');
    } catch (error) {
      throw new Error(`Error updating raw material order item: ${error.message}`);
    }
  }

  // Remove raw material order item
  static async removeRawMaterialOrderItem(id, itemId) {
    try {
      const order = await RawMaterialOrder.findById(id);
      if (!order) {
        throw new Error('Raw material order not found');
      }

      order.items = order.items.filter(item => item._id.toString() !== itemId);
      
      // Recalculate total amount
      let totalAmount = 0;
      for (const item of order.items) {
        totalAmount += item.quantity * item.price;
      }
      order.totalAmount = totalAmount;

      await order.save();

      return await RawMaterialOrder.findById(id)
        .populate('artisanId', 'name email phone')
        .populate('items.rawMaterialId', 'name pricePerUnit category');
    } catch (error) {
      throw new Error(`Error removing raw material order item: ${error.message}`);
    }
  }

  // Get pending raw material shipments
  static async getPendingRawMaterialShipments(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const orders = await RawMaterialOrder.find({ 
        status: { $in: ['pending', 'processing'] }
      })
        .populate('artisanId', 'name email phone')
        .populate('items.rawMaterialId', 'name pricePerUnit category')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await RawMaterialOrder.countDocuments({ 
        status: { $in: ['pending', 'processing'] }
      });

      return {
        orders,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching pending raw material shipments: ${error.message}`);
    }
  }

  // Get total raw material order amount
  static async getTotalRawMaterialOrderAmount(startDate, endDate) {
    try {
      const matchConditions = {};
      
      if (startDate && endDate) {
        matchConditions.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const result = await RawMaterialOrder.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 }
          }
        }
      ]);

      return result[0] || { totalAmount: 0, orderCount: 0 };
    } catch (error) {
      throw new Error(`Error calculating total raw material order amount: ${error.message}`);
    }
  }

  // Get raw material orders by date range
  static async getRawMaterialOrdersByDateRange(startDate, endDate, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const orders = await RawMaterialOrder.find({
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      })
        .populate('artisanId', 'name email phone')
        .populate('items.rawMaterialId', 'name pricePerUnit category')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await RawMaterialOrder.countDocuments({
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      });

      return {
        orders,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching raw material orders by date range: ${error.message}`);
    }
  }

  // Get raw material order summary
  static async getRawMaterialOrderSummary(period = 'daily') {
    try {
      let groupBy = {};
      let dateFormat = '';

      switch (period) {
        case 'daily':
          dateFormat = '%Y-%m-%d';
          groupBy = {
            $dateToString: { format: dateFormat, date: '$createdAt' }
          };
          break;
        case 'weekly':
          groupBy = {
            $concat: [
              { $toString: { $year: '$createdAt' } },
              '-W',
              { $toString: { $week: '$createdAt' } }
            ]
          };
          break;
        case 'monthly':
          dateFormat = '%Y-%m';
          groupBy = {
            $dateToString: { format: dateFormat, date: '$createdAt' }
          };
          break;
        default:
          throw new Error('Invalid period. Use daily, weekly, or monthly');
      }

      const summary = await RawMaterialOrder.aggregate([
        {
          $group: {
            _id: groupBy,
            totalOrders: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            averageOrderValue: { $avg: '$totalAmount' },
            statuses: {
              $push: '$status'
            }
          }
        },
        {
          $addFields: {
            pendingOrders: {
              $size: {
                $filter: {
                  input: '$statuses',
                  cond: { $eq: ['$$this', 'pending'] }
                }
              }
            },
            completedOrders: {
              $size: {
                $filter: {
                  input: '$statuses',
                  cond: { $eq: ['$$this', 'delivered'] }
                }
              }
            }
          }
        },
        {
          $project: {
            statuses: 0
          }
        },
        {
          $sort: { _id: -1 }
        }
      ]);

      return summary;
    } catch (error) {
      throw new Error(`Error generating raw material order summary: ${error.message}`);
    }
  }

  // Create bulk raw material orders
  static async createBulkRawMaterialOrders(ordersData) {
    try {
      const orders = await RawMaterialOrder.insertMany(ordersData);
      return await RawMaterialOrder.find({ _id: { $in: orders.map(o => o._id) } })
        .populate('artisanId', 'name email phone')
        .populate('items.rawMaterialId', 'name pricePerUnit category');
    } catch (error) {
      throw new Error(`Error creating bulk raw material orders: ${error.message}`);
    }
  }

  // Update bulk raw material order status
  static async updateBulkRawMaterialOrderStatus(orderIds, status) {
    try {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid order status');
      }

      const result = await RawMaterialOrder.updateMany(
        { _id: { $in: orderIds } },
        { status },
        { runValidators: true }
      );

      const updatedOrders = await RawMaterialOrder.find({ _id: { $in: orderIds } })
        .populate('artisanId', 'name email phone')
        .populate('items.rawMaterialId', 'name pricePerUnit category');

      return {
        modifiedCount: result.modifiedCount,
        orders: updatedOrders
      };
    } catch (error) {
      throw new Error(`Error updating bulk raw material order status: ${error.message}`);
    }
  }

  // Get raw material orders by payment status
  static async getRawMaterialOrdersByPaymentStatus(paymentStatus, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const orders = await RawMaterialOrder.find({ paymentStatus })
        .populate('artisanId', 'name email phone')
        .populate('items.rawMaterialId', 'name pricePerUnit category')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await RawMaterialOrder.countDocuments({ paymentStatus });

      return {
        orders,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      };
    } catch (error) {
      throw new Error(`Error fetching raw material orders by payment status: ${error.message}`);
    }
  }
}

module.exports = RawMaterialService;
