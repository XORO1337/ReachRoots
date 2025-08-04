const ArtisanService = require('../services/Artisan_serv');
const ProductService = require('../services/Product_serv');
const OrderService = require('../services/Order_serv');
const InventoryService = require('../services/Inventory_serv');
const User = require('../models/User');
const Order = require('../models/Orders');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');

class ArtisanDashboardController {
  // Get comprehensive dashboard statistics
  static async getDashboardStats(req, res) {
    try {
      const artisanId = req.user.id;

      // Get artisan profile
      const artisan = await ArtisanService.getArtisanProfileByUserId(artisanId);
      if (!artisan) {
        return res.status(404).json({
          success: false,
          message: 'Artisan profile not found'
        });
      }

      // Current month date range
      const currentDate = new Date();
      const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

      // Get artisan orders for current month
      const currentMonthOrders = await Order.find({
        artisanId: artisan._id,
        createdAt: { $gte: currentMonth }
      });

      // Get artisan orders for last month
      const lastMonthOrders = await Order.find({
        artisanId: artisan._id,
        createdAt: { $gte: lastMonth, $lte: lastMonthEnd }
      });

      // Get total orders
      const totalOrders = await Order.countDocuments({ artisanId: artisan._id });

      // Get active orders (not completed/cancelled)
      const activeOrders = await Order.countDocuments({
        artisanId: artisan._id,
        status: { $nin: ['completed', 'cancelled'] }
      });

      // Get pending deliveries
      const pendingDelivery = await Order.countDocuments({
        artisanId: artisan._id,
        status: 'shipped'
      });

      // Calculate earnings
      const currentMonthEarnings = currentMonthOrders.reduce((total, order) => {
        return total + (order.totalAmount || 0);
      }, 0);

      const lastMonthEarnings = lastMonthOrders.reduce((total, order) => {
        return total + (order.totalAmount || 0);
      }, 0);

      // Calculate percentage changes
      const earningsChange = lastMonthEarnings === 0 ? 
        (currentMonthEarnings > 0 ? 100 : 0) : 
        ((currentMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100;

      const ordersChange = lastMonthOrders.length === 0 ? 
        (currentMonthOrders.length > 0 ? 100 : 0) : 
        ((currentMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100;

      // Get customer distribution - this is a simplified calculation
      const customerTypes = {
        normalBuyers: 75, // percentage
        distributors: 25  // percentage
      };

      const dashboardStats = {
        currentMonthEarnings: Number(currentMonthEarnings.toFixed(2)),
        earningsChange: Number(earningsChange.toFixed(1)),
        totalOrders,
        ordersChange: Number(ordersChange.toFixed(1)),
        activeOrders,
        pendingDelivery,
        customerTypes
      };

      res.status(200).json({
        success: true,
        message: 'Dashboard statistics retrieved successfully',
        data: dashboardStats
      });

    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get analytics data
  static async getAnalytics(req, res) {
    try {
      const artisanId = req.user.id;

      // Get artisan profile
      const artisan = await ArtisanService.getArtisanProfileByUserId(artisanId);
      if (!artisan) {
        return res.status(404).json({
          success: false,
          message: 'Artisan profile not found'
        });
      }

      // Sales by month (last 12 months)
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const salesByMonth = await Order.aggregate([
        {
          $match: {
            artisanId: artisan._id,
            createdAt: { $gte: twelveMonthsAgo },
            status: { $in: ['delivered', 'completed'] }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            sales: { $sum: '$totalAmount' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]);

      // Format sales data
      const formattedSalesData = salesByMonth.map(item => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        sales: item.sales
      }));

      // Get top products
      const topProducts = await Order.aggregate([
        {
          $match: {
            artisanId: artisan._id,
            status: { $in: ['delivered', 'completed'] }
          }
        },
        {
          $unwind: '$items'
        },
        {
          $group: {
            _id: '$items.productId',
            sales: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: '$product'
        },
        {
          $project: {
            id: '$_id',
            name: '$product.name',
            sales: 1,
            revenue: 1
          }
        },
        {
          $sort: { sales: -1 }
        },
        {
          $limit: 5
        }
      ]);

      // Order status distribution
      const orderStatus = await Order.aggregate([
        {
          $match: { artisanId: artisan._id }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const formattedOrderStatus = orderStatus.map(item => ({
        status: item._id,
        count: item.count
      }));

      const analytics = {
        salesByMonth: formattedSalesData,
        topProducts,
        orderStatus: formattedOrderStatus
      };

      res.status(200).json({
        success: true,
        message: 'Analytics data retrieved successfully',
        data: analytics
      });

    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve analytics data',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get artisan's products/items
  static async getArtisanItems(req, res) {
    try {
      const artisanId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;
      const category = req.query.category;

      // Get artisan profile
      const artisan = await ArtisanService.getArtisanProfileByUserId(artisanId);
      if (!artisan) {
        return res.status(404).json({
          success: false,
          message: 'Artisan profile not found'
        });
      }

      // Build query
      const query = { artisanId: artisan._id };
      if (status) query.status = status;
      if (category) query.category = category;

      // Get products with pagination
      const skip = (page - 1) * limit;
      const products = await Product.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const totalProducts = await Product.countDocuments(query);

      res.status(200).json({
        success: true,
        message: 'Artisan items retrieved successfully',
        data: {
          items: products,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            totalItems: totalProducts,
            limit
          }
        }
      });

    } catch (error) {
      console.error('Get artisan items error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve artisan items',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get artisan orders
  static async getArtisanOrders(req, res) {
    try {
      const artisanId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;

      // Get artisan profile
      const artisan = await ArtisanService.getArtisanProfileByUserId(artisanId);
      if (!artisan) {
        return res.status(404).json({
          success: false,
          message: 'Artisan profile not found'
        });
      }

      // Build query
      const query = { artisanId: artisan._id };
      if (status) query.status = status;

      // Get orders with pagination
      const skip = (page - 1) * limit;
      const orders = await Order.find(query)
        .populate('customerId', 'name email phone')
        .populate('items.productId', 'name price')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const totalOrders = await Order.countDocuments(query);

      res.status(200).json({
        success: true,
        message: 'Artisan orders retrieved successfully',
        data: {
          orders,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
            totalOrders,
            limit
          }
        }
      });

    } catch (error) {
      console.error('Get artisan orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve artisan orders',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Update order status
  static async updateOrderStatus(req, res) {
    try {
      const artisanId = req.user.id;
      const { orderId } = req.params;
      const { status, trackingNumber, estimatedDelivery } = req.body;

      // Get artisan profile
      const artisan = await ArtisanService.getArtisanProfileByUserId(artisanId);
      if (!artisan) {
        return res.status(404).json({
          success: false,
          message: 'Artisan profile not found'
        });
      }

      // Validate status
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order status'
        });
      }

      // Build update object
      const updateData = { 
        status, 
        updatedAt: new Date() 
      };

      // Add tracking number if provided (usually when shipping)
      if (trackingNumber) {
        updateData.trackingNumber = trackingNumber;
      }

      // Add estimated delivery if provided
      if (estimatedDelivery) {
        updateData.estimatedDelivery = new Date(estimatedDelivery);
      }

      // Auto-set estimated delivery for shipped orders if not provided
      if (status === 'shipped' && !estimatedDelivery && !updateData.estimatedDelivery) {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days from now
        updateData.estimatedDelivery = deliveryDate;
      }

      // Update order
      const order = await Order.findOneAndUpdate(
        { _id: orderId, artisanId: artisan._id },
        updateData,
        { new: true }
      ).populate('buyerId', 'name email phone')
       .populate('items.productId', 'name price');

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found or access denied'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: order
      });

    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update order status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Create new product
  static async createProduct(req, res) {
    try {
      const artisanId = req.user.id;

      // Get artisan profile
      const artisan = await ArtisanService.getArtisanProfileByUserId(artisanId);
      if (!artisan) {
        return res.status(404).json({
          success: false,
          message: 'Artisan profile not found'
        });
      }

      // Add artisan ID to product data
      const productData = {
        ...req.body,
        artisanId: artisan._id
      };

      const product = await ProductService.createProduct(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });

    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Update product
  static async updateProduct(req, res) {
    try {
      const artisanId = req.user.id;
      const { productId } = req.params;

      // Get artisan profile
      const artisan = await ArtisanService.getArtisanProfileByUserId(artisanId);
      if (!artisan) {
        return res.status(404).json({
          success: false,
          message: 'Artisan profile not found'
        });
      }

      // Update product (only if it belongs to the artisan)
      const product = await Product.findOneAndUpdate(
        { _id: productId, artisanId: artisan._id },
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found or access denied'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });

    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Delete product
  static async deleteProduct(req, res) {
    try {
      const artisanId = req.user.id;
      const { productId } = req.params;

      // Get artisan profile
      const artisan = await ArtisanService.getArtisanProfileByUserId(artisanId);
      if (!artisan) {
        return res.status(404).json({
          success: false,
          message: 'Artisan profile not found'
        });
      }

      // Delete product (only if it belongs to the artisan)
      const product = await Product.findOneAndDelete({
        _id: productId,
        artisanId: artisan._id
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found or access denied'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
        data: product
      });

    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get artisan deliveries (orders with processing, shipped, or delivered status)
  static async getArtisanDeliveries(req, res) {
    try {
      const artisanId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;

      // Get artisan profile
      const artisan = await ArtisanService.getArtisanProfileByUserId(artisanId);
      if (!artisan) {
        return res.status(404).json({
          success: false,
          message: 'Artisan profile not found'
        });
      }

      // Build query for delivery-relevant statuses
      const query = { 
        artisanId: artisan._id,
        status: { $in: ['processing', 'shipped', 'delivered'] }
      };
      
      if (status && ['processing', 'shipped', 'delivered'].includes(status)) {
        query.status = status;
      }

      // Get orders with pagination
      const skip = (page - 1) * limit;
      const orders = await Order.find(query)
        .populate('buyerId', 'name email phone')
        .populate('items.productId', 'name price')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const totalOrders = await Order.countDocuments(query);

      res.status(200).json({
        success: true,
        message: 'Artisan deliveries retrieved successfully',
        data: {
          orders,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
            totalOrders,
            limit
          }
        }
      });

    } catch (error) {
      console.error('Get artisan deliveries error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve artisan deliveries',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = ArtisanDashboardController;
