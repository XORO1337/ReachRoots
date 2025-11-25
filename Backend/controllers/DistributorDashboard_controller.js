const DistributorService = require('../services/Distributor_serv');
const ProductService = require('../services/Product_serv');
const OrderService = require('../services/Order_serv');
const InventoryService = require('../services/Inventory_serv');
const User = require('../models/User');
const Order = require('../models/Orders');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Distributor = require('../models/Distributor');

class DistributorDashboardController {
  // Get comprehensive dashboard statistics
  static async getDashboardStats(req, res) {
    try {
      const distributorUserId = req.user.id;

      // Get distributor profile
      const distributor = await DistributorService.getDistributorProfileByUserId(distributorUserId);
      if (!distributor) {
        return res.status(404).json({
          success: false,
          message: 'Distributor profile not found'
        });
      }

      // Current month date range
      const currentDate = new Date();
      const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

      // Get products distributed by this distributor (products in their distribution areas)
      const distributorProducts = await Product.find({
        region: { $in: distributor.distributionAreas }
      });

      const productIds = distributorProducts.map(p => p._id);

      // Get orders for products in distributor's areas
      const currentMonthOrders = await Order.find({
        'items.productId': { $in: productIds },
        createdAt: { $gte: currentMonth }
      }).populate('items.productId');

      const lastMonthOrders = await Order.find({
        'items.productId': { $in: productIds },
        createdAt: { $gte: lastMonth, $lte: lastMonthEnd }
      }).populate('items.productId');

      // Get total orders for distributor's products
      const totalOrders = await Order.countDocuments({
        'items.productId': { $in: productIds }
      });

      // Get active orders (not delivered/cancelled)
      const activeOrders = await Order.countDocuments({
        'items.productId': { $in: productIds },
        status: { $nin: ['delivered', 'cancelled'] }
      });

      // Get orders in transit
      const ordersInTransit = await Order.countDocuments({
        'items.productId': { $in: productIds },
        status: 'shipped'
      });

      // Calculate sales/revenue from distributor's products
      const currentMonthRevenue = currentMonthOrders.reduce((total, order) => {
        const distributorItems = order.items.filter(item => 
          productIds.some(pid => pid.toString() === item.productId._id.toString())
        );
        const orderTotal = distributorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return total + orderTotal;
      }, 0);

      const lastMonthRevenue = lastMonthOrders.reduce((total, order) => {
        const distributorItems = order.items.filter(item => 
          productIds.some(pid => pid.toString() === item.productId._id.toString())
        );
        const orderTotal = distributorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return total + orderTotal;
      }, 0);

      // Calculate percentage changes
      const revenueChange = lastMonthRevenue === 0 ? 
        (currentMonthRevenue > 0 ? 100 : 0) : 
        ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

      const ordersChange = lastMonthOrders.length === 0 ? 
        (currentMonthOrders.length > 0 ? 100 : 0) : 
        ((currentMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100;

      // Get unique customers who ordered distributor's products
      const allOrders = await Order.find({
        'items.productId': { $in: productIds }
      }).distinct('buyerId');

      const customersReached = allOrders.length;

      const dashboardStats = {
        productsAssigned: productIds.length,
        monthlySales: Number(currentMonthRevenue.toFixed(2)),
        salesChange: Number(revenueChange.toFixed(1)),
        ordersProcessed: totalOrders,
        ordersChange: Number(ordersChange.toFixed(1)),
        activeOrders,
        ordersInTransit,
        customersReached
      };

      res.status(200).json({
        success: true,
        message: 'Distributor dashboard statistics retrieved successfully',
        data: dashboardStats
      });

    } catch (error) {
      console.error('Distributor dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard statistics',
        error: error.message
      });
    }
  }

  // Get recent orders for distributor
  static async getRecentOrders(req, res) {
    try {
      const distributorUserId = req.user.id;
      const { limit = 5 } = req.query;

      // Get distributor profile
      const distributor = await DistributorService.getDistributorProfileByUserId(distributorUserId);
      if (!distributor) {
        return res.status(404).json({
          success: false,
          message: 'Distributor profile not found'
        });
      }

      // Get products in distributor's areas
      const distributorProducts = await Product.find({
        region: { $in: distributor.distributionAreas }
      });

      const productIds = distributorProducts.map(p => p._id);

      // Get recent orders
      const recentOrders = await Order.find({
        'items.productId': { $in: productIds }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('buyerId', 'name email')
      .populate('items.productId', 'name price');

      const formattedOrders = recentOrders.map(order => {
        const distributorItems = order.items.filter(item => 
          productIds.some(pid => pid.toString() === item.productId._id.toString())
        );
        
        const mainProduct = distributorItems[0]?.productId?.name || 'Multiple Products';
        const buyerLocation = distributor.distributionAreas[0] || 'Unknown';

        return {
          orderNumber: order.orderNumber,
          title: `${mainProduct} - ${buyerLocation}`,
          status: order.status,
          createdAt: order.createdAt,
          totalAmount: order.totalAmount,
          customer: order.buyerId
        };
      });

      res.status(200).json({
        success: true,
        message: 'Recent orders retrieved successfully',
        data: formattedOrders
      });

    } catch (error) {
      console.error('Recent orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve recent orders',
        error: error.message
      });
    }
  }

  // Get low stock alerts for distributor's products
  static async getLowStockAlerts(req, res) {
    try {
      const distributorUserId = req.user.id;

      // Get distributor profile
      const distributor = await DistributorService.getDistributorProfileByUserId(distributorUserId);
      if (!distributor) {
        return res.status(404).json({
          success: false,
          message: 'Distributor profile not found'
        });
      }

      // Get products in distributor's areas with inventory information
      const distributorProducts = await Product.find({
        region: { $in: distributor.distributionAreas }
      });

      const productIds = distributorProducts.map(p => p._id);

      // Get inventory for these products
      const inventoryItems = await Inventory.find({
        productId: { $in: productIds }
      }).populate('productId', 'name price');

      const lowStockAlerts = inventoryItems
        .filter(item => item.currentStock <= item.minStock)
        .map(item => ({
          productId: item.productId._id,
          productName: item.productId.name,
          currentStock: item.currentStock,
          minStock: item.minStock,
          alertType: item.currentStock === 0 ? 'Out of Stock' : 'Low Stock',
          stockText: `${item.currentStock} units remaining`
        }))
        .sort((a, b) => a.currentStock - b.currentStock); // Sort by stock level (lowest first)

      res.status(200).json({
        success: true,
        message: 'Low stock alerts retrieved successfully',
        data: lowStockAlerts
      });

    } catch (error) {
      console.error('Low stock alerts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve low stock alerts',
        error: error.message
      });
    }
  }

  // Get sales analytics for distributor
  static async getSalesAnalytics(req, res) {
    try {
      const distributorUserId = req.user.id;
      const { period = 'month' } = req.query; // month, week, year

      // Get distributor profile
      const distributor = await DistributorService.getDistributorProfileByUserId(distributorUserId);
      if (!distributor) {
        return res.status(404).json({
          success: false,
          message: 'Distributor profile not found'
        });
      }

      // Get products in distributor's areas
      const distributorProducts = await Product.find({
        region: { $in: distributor.distributionAreas }
      });

      const productIds = distributorProducts.map(p => p._id);

      // Calculate date range based on period
      const currentDate = new Date();
      let startDate;
      
      switch (period) {
        case 'week':
          startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(currentDate.getFullYear(), 0, 1);
          break;
        default: // month
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      }

      // Get orders for the period
      const orders = await Order.find({
        'items.productId': { $in: productIds },
        createdAt: { $gte: startDate }
      }).populate('items.productId');

      // Group sales by date
      const salesByDate = {};
      orders.forEach(order => {
        const date = order.createdAt.toISOString().split('T')[0];
        const distributorItems = order.items.filter(item => 
          productIds.some(pid => pid.toString() === item.productId._id.toString())
        );
        const dayTotal = distributorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        salesByDate[date] = (salesByDate[date] || 0) + dayTotal;
      });

      // Get top performing products
      const productSales = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          if (productIds.some(pid => pid.toString() === item.productId._id.toString())) {
            const productId = item.productId._id.toString();
            const productName = item.productId.name;
            
            if (!productSales[productId]) {
              productSales[productId] = {
                name: productName,
                totalSales: 0,
                unitsSold: 0
              };
            }
            
            productSales[productId].totalSales += item.price * item.quantity;
            productSales[productId].unitsSold += item.quantity;
          }
        });
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 5);

      const analytics = {
        salesByDate,
        topProducts,
        totalRevenue: Object.values(salesByDate).reduce((sum, val) => sum + val, 0),
        totalOrders: orders.length
      };

      res.status(200).json({
        success: true,
        message: 'Sales analytics retrieved successfully',
        data: analytics
      });

    } catch (error) {
      console.error('Sales analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve sales analytics',
        error: error.message
      });
    }
  }

  // Get distributor's products with inventory status
  static async getProductsWithInventory(req, res) {
    try {
      const distributorUserId = req.user.id;
      const { page = 1, limit = 10, category, status } = req.query;

      // Get distributor profile
      const distributor = await DistributorService.getDistributorProfileByUserId(distributorUserId);
      if (!distributor) {
        return res.status(404).json({
          success: false,
          message: 'Distributor profile not found'
        });
      }

      // Build query for products in distributor's areas
      let productQuery = {
        region: { $in: distributor.distributionAreas }
      };

      if (category && category !== 'all') {
        productQuery.category = category;
      }

      // Get products with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const products = await Product.find(productQuery)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('artisanId', 'name');

      const totalProducts = await Product.countDocuments(productQuery);

      // Get inventory for these products
      const productIds = products.map(p => p._id);
      const inventories = await Inventory.find({
        productId: { $in: productIds }
      });

      // Create inventory map
      const inventoryMap = {};
      inventories.forEach(inv => {
        inventoryMap[inv.productId.toString()] = inv;
      });

      // Format products with inventory data
      const productsWithInventory = products.map(product => {
        const inventory = inventoryMap[product._id.toString()];
        
        let stockStatus = 'In Stock';
        if (!inventory || inventory.currentStock === 0) {
          stockStatus = 'Out of Stock';
        } else if (inventory.currentStock <= inventory.minStock) {
          stockStatus = 'Low Stock';
        }

        return {
          id: product._id,
          name: product.name,
          category: product.category,
          artisan: product.artisanId?.name || 'Unknown',
          price: product.price,
          region: product.region,
          stock: inventory?.currentStock || 0,
          minStock: inventory?.minStock || 0,
          status: stockStatus,
          image: product.images?.[0] || null
        };
      });

      // Filter by status if requested
      let filteredProducts = productsWithInventory;
      if (status && status !== 'all') {
        filteredProducts = productsWithInventory.filter(p => 
          p.status.toLowerCase().replace(' ', '') === status.toLowerCase()
        );
      }

      res.status(200).json({
        success: true,
        message: 'Products with inventory retrieved successfully',
        data: {
          products: filteredProducts,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalProducts / parseInt(limit)),
            totalProducts,
            hasNext: skip + parseInt(limit) < totalProducts,
            hasPrev: parseInt(page) > 1
          }
        }
      });

    } catch (error) {
      console.error('Products with inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve products with inventory',
        error: error.message
      });
    }
  }
}

module.exports = DistributorDashboardController;
