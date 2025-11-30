const User = require('../models/User');
const Order = require('../models/Orders');
const Product = require('../models/Product');
const mongoose = require('mongoose');

/**
 * Admin Service
 * Handles all admin-related business logic including:
 * - Order management across the platform
 * - User management with flags
 * - Agent management
 * - Analytics and reporting
 * - Pickup request broadcasting
 */

class AdminService {
  /**
   * Get platform-wide statistics
   */
  static async getPlatformStats() {
    const [
      totalUsers,
      activeUsers,
      usersByRole,
      orderStats,
      revenueStats,
      flaggedUsers,
      activeAgents
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalValue: { $sum: '$totalAmount' }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            status: 'delivered',
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 }
          }
        }
      ]),
      User.countDocuments({ 'userFlags.0': { $exists: true } }),
      User.countDocuments({ role: 'shipping_agent', 'agentProfile.isActive': true })
    ]);

    const roleMap = {};
    usersByRole.forEach(r => { roleMap[r._id] = r.count; });

    const statusMap = {};
    let totalOrderValue = 0;
    orderStats.forEach(s => {
      statusMap[s._id] = { count: s.count, value: s.totalValue };
      totalOrderValue += s.totalValue;
    });

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        byRole: roleMap,
        flagged: flaggedUsers
      },
      orders: {
        byStatus: statusMap,
        totalValue: totalOrderValue,
        pendingPickups: statusMap['pickup_requested']?.count || 0
      },
      revenue: {
        last30Days: revenueStats[0]?.totalRevenue || 0,
        ordersLast30Days: revenueStats[0]?.orderCount || 0
      },
      agents: {
        active: activeAgents,
        total: roleMap['shipping_agent'] || 0
      }
    };
  }

  /**
   * Get all orders with advanced filtering
   */
  static async getAllOrders(filters = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      artisanId,
      buyerId,
      agentId,
      search,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      shippingMethod,
      hasPendingPickup
    } = filters;

    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (artisanId) {
      query.artisanId = artisanId;
    }

    if (buyerId) {
      query.buyerId = buyerId;
    }

    if (agentId) {
      query['shippingDetails.assignedAgentId'] = agentId;
    }

    if (shippingMethod) {
      query.shippingMethod = shippingMethod;
    }

    if (hasPendingPickup) {
      query.status = 'pickup_requested';
      query['shippingDetails.assignedAgentId'] = { $exists: false };
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingDetails.trackingNumber': { $regex: search, $options: 'i' } }
      ];
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const orders = await Order.find(query)
      .populate('buyerId', 'name email phone')
      .populate('artisanId', 'name email phone')
      .populate('shippingDetails.assignedAgentId', 'name email phone agentProfile')
      .populate('items.productId', 'name price images')
      .sort(sortOptions)
      .limit(limit)
      .skip((page - 1) * limit);

    const totalOrders = await Order.countDocuments(query);

    return {
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasMore: page * limit < totalOrders
      }
    };
  }

  /**
   * Get pending pickup requests for broadcasting
   */
  static async getPendingPickupRequests(filters = {}) {
    const { pinCode, city, district, page = 1, limit = 20 } = filters;

    let query = {
      status: 'pickup_requested',
      $or: [
        { 'shippingDetails.assignedAgentId': { $exists: false } },
        { 'shippingDetails.assignedAgentId': null }
      ]
    };

    // Location-based filtering for targeted broadcasting
    if (pinCode) {
      query['shippingAddress.pinCode'] = pinCode;
    }
    if (city) {
      query['shippingAddress.city'] = { $regex: city, $options: 'i' };
    }
    if (district) {
      query['shippingAddress.district'] = { $regex: district, $options: 'i' };
    }

    const requests = await Order.find(query)
      .populate('buyerId', 'name phone addresses')
      .populate('artisanId', 'name phone addresses')
      .populate('items.productId', 'name')
      .sort({ 'shippingDetails.pickupRequestedAt': -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    return {
      requests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total
      }
    };
  }

  /**
   * Broadcast pickup request to agents
   */
  static async broadcastPickupRequest(orderId, options = {}) {
    const { targetAgentIds, targetPinCodes, targetDistrict, adminId, note } = options;

    const order = await Order.findById(orderId)
      .populate('artisanId', 'name phone addresses');

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'pickup_requested') {
      throw new Error('Order is not in pickup_requested status');
    }

    // Find eligible agents based on criteria
    let agentQuery = {
      role: 'shipping_agent',
      'agentProfile.isActive': true,
      isActive: true
    };

    if (targetAgentIds && targetAgentIds.length > 0) {
      agentQuery._id = { $in: targetAgentIds };
    } else if (targetPinCodes && targetPinCodes.length > 0) {
      agentQuery['agentProfile.serviceAreas.pinCodes'] = { $in: targetPinCodes };
    } else if (targetDistrict) {
      agentQuery['agentProfile.serviceAreas.district'] = { $regex: targetDistrict, $options: 'i' };
    }

    const eligibleAgents = await User.find(agentQuery)
      .select('_id name email phone agentProfile');

    // Update order with broadcast info
    order.shippingDetails = order.shippingDetails || {};
    order.shippingDetails.broadcastInfo = {
      broadcastedAt: new Date(),
      broadcastedBy: adminId,
      broadcastNote: note,
      targetedAgentIds: eligibleAgents.map(a => a._id),
      interestedAgents: []
    };

    await order.save();

    // In a real app, you'd send push notifications/SMS to agents here
    console.log(`[Admin] Broadcasted pickup request ${order.orderNumber} to ${eligibleAgents.length} agents`);

    return {
      order,
      broadcastedTo: eligibleAgents.length,
      agents: eligibleAgents.map(a => ({
        id: a._id,
        name: a.name,
        phone: a.phone,
        rating: a.agentProfile?.rating || 0
      }))
    };
  }

  /**
   * Assign agent to order
   */
  static async assignAgentToOrder(orderId, agentId, adminId, note = '') {
    const [order, agent] = await Promise.all([
      Order.findById(orderId),
      User.findById(agentId)
    ]);

    if (!order) {
      throw new Error('Order not found');
    }

    if (!agent || agent.role !== 'shipping_agent') {
      throw new Error('Invalid shipping agent');
    }

    if (!agent.agentProfile?.isActive) {
      throw new Error('Agent is not active');
    }

    order.shippingDetails = order.shippingDetails || {};
    order.shippingDetails.assignedAgentId = agentId;
    order.shippingDetails.agentAssignedAt = new Date();
    order.shippingDetails.agentAssignedBy = adminId;
    order.shippingDetails.assignmentNote = note;
    order.shippingDetails.pickupAgentName = agent.name;
    order.shippingDetails.pickupAgentPhone = agent.phone;

    // Add to status history
    order.statusHistory.push({
      status: order.status,
      changedAt: new Date(),
      changedBy: adminId,
      note: `Agent assigned: ${agent.name} (${agent.phone})`,
      metadata: { agentId, agentName: agent.name }
    });

    await order.save();

    return {
      order,
      agent: {
        id: agent._id,
        name: agent.name,
        phone: agent.phone,
        rating: agent.agentProfile?.rating
      }
    };
  }

  /**
   * Override order status (admin only)
   */
  static async overrideOrderStatus(orderId, newStatus, adminId, reason) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    const previousStatus = order.status;

    order.statusHistory.push({
      status: previousStatus,
      changedAt: new Date(),
      changedBy: adminId,
      note: `Admin override: ${previousStatus} → ${newStatus}. Reason: ${reason}`,
      metadata: { adminOverride: true, previousStatus, reason }
    });

    order.status = newStatus;
    order.lastStatusChangeAt = new Date();

    await order.save();

    return {
      order,
      previousStatus,
      newStatus
    };
  }

  // ================== USER MANAGEMENT ==================

  /**
   * Add flag to user
   */
  static async addUserFlag(userId, flagData, adminId) {
    const { flag, reason, expiresAt } = flagData;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if flag already exists
    const existingFlag = user.userFlags?.find(f => f.flag === flag);
    if (existingFlag) {
      throw new Error(`User already has '${flag}' flag`);
    }

    user.userFlags = user.userFlags || [];
    user.userFlags.push({
      flag,
      reason,
      addedBy: adminId,
      addedAt: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    // If flagged as scam or banned, deactivate account
    if (['scam', 'fraud', 'banned'].includes(flag)) {
      user.isActive = false;
    }

    await user.save();

    return user;
  }

  /**
   * Remove flag from user
   */
  static async removeUserFlag(userId, flag, adminId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const flagIndex = user.userFlags?.findIndex(f => f.flag === flag);
    if (flagIndex === -1) {
      throw new Error(`User does not have '${flag}' flag`);
    }

    user.userFlags.splice(flagIndex, 1);
    await user.save();

    return user;
  }

  /**
   * Get flagged users
   */
  static async getFlaggedUsers(filters = {}) {
    const { flag, page = 1, limit = 20 } = filters;

    let query = { 'userFlags.0': { $exists: true } };

    if (flag) {
      query['userFlags.flag'] = flag;
    }

    const users = await User.find(query)
      .select('-password -refreshTokens')
      .sort({ 'userFlags.addedAt': -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    return {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total
      }
    };
  }

  // ================== AGENT MANAGEMENT ==================

  /**
   * Get all shipping agents
   */
  static async getAllAgents(filters = {}) {
    const { isActive, search, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 20 } = filters;

    let query = { role: 'shipping_agent' };

    if (typeof isActive === 'boolean') {
      query['agentProfile.isActive'] = isActive;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    if (sortBy === 'rating') {
      sortOptions['agentProfile.rating'] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'deliveries') {
      sortOptions['agentProfile.totalDeliveries'] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const agents = await User.find(query)
      .select('-password -refreshTokens')
      .sort(sortOptions)
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    return {
      agents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total
      }
    };
  }

  /**
   * Create shipping agent account
   */
  static async createAgent(agentData, adminId) {
    const {
      name, email, phone, password,
      commissionRate, baseDeliveryFee, serviceAreas,
      vehicleType, vehicleNumber, licenseNumber
    } = agentData;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      throw new Error('User with this email or phone already exists');
    }

    const agent = new User({
      name,
      email,
      phone,
      password,
      role: 'shipping_agent',
      isActive: true,
      agentProfile: {
        isActive: true,
        commissionRate: commissionRate || 5,
        baseDeliveryFee: baseDeliveryFee || 50,
        serviceAreas: serviceAreas || [],
        vehicleType,
        vehicleNumber,
        licenseNumber,
        walletBalance: 0,
        totalEarnings: 0,
        totalDeliveries: 0,
        successfulDeliveries: 0,
        rating: 0,
        totalRatings: 0
      }
    });

    await agent.save();

    return agent;
  }

  /**
   * Update agent profile
   */
  static async updateAgentProfile(agentId, updateData, adminId) {
    const agent = await User.findById(agentId);

    if (!agent || agent.role !== 'shipping_agent') {
      throw new Error('Agent not found');
    }

    const allowedUpdates = [
      'agentProfile.isActive',
      'agentProfile.commissionRate',
      'agentProfile.baseDeliveryFee',
      'agentProfile.serviceAreas',
      'agentProfile.vehicleType',
      'agentProfile.vehicleNumber',
      'agentProfile.licenseNumber'
    ];

    // Apply updates
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(`agentProfile.${key}`) || allowedUpdates.includes(key)) {
        if (key.startsWith('agentProfile.')) {
          const nestedKey = key.replace('agentProfile.', '');
          agent.agentProfile[nestedKey] = updateData[key];
        } else {
          agent.agentProfile[key] = updateData[key];
        }
      }
    });

    await agent.save();

    return agent;
  }

  /**
   * Get agent performance stats
   */
  static async getAgentPerformance(agentId) {
    const agent = await User.findById(agentId);

    if (!agent || agent.role !== 'shipping_agent') {
      throw new Error('Agent not found');
    }

    // Get recent deliveries
    const recentDeliveries = await Order.find({
      'shippingDetails.assignedAgentId': agentId,
      status: { $in: ['shipped', 'delivered'] }
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('orderNumber status totalAmount createdAt updatedAt');

    // Get monthly stats
    const monthlyStats = await Order.aggregate([
      {
        $match: {
          'shippingDetails.assignedAgentId': new mongoose.Types.ObjectId(agentId),
          status: 'delivered',
          updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: null,
          deliveries: { $sum: 1 },
          totalValue: { $sum: '$totalAmount' }
        }
      }
    ]);

    return {
      agent: {
        id: agent._id,
        name: agent.name,
        profile: agent.agentProfile
      },
      recentDeliveries,
      monthlyStats: monthlyStats[0] || { deliveries: 0, totalValue: 0 }
    };
  }

  /**
   * Get activity logs
   */
  static async getActivityLogs(filters = {}) {
    const { type, userId, page = 1, limit = 50, dateFrom, dateTo } = filters;

    // For now, we'll get recent order status changes as activity
    let query = { 'statusHistory.0': { $exists: true } };

    if (userId) {
      query.$or = [
        { buyerId: userId },
        { artisanId: userId },
        { 'shippingDetails.assignedAgentId': userId }
      ];
    }

    if (dateFrom || dateTo) {
      query.updatedAt = {};
      if (dateFrom) query.updatedAt.$gte = new Date(dateFrom);
      if (dateTo) query.updatedAt.$lte = new Date(dateTo);
    }

    const orders = await Order.find(query)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .select('orderNumber status statusHistory buyerId artisanId updatedAt')
      .populate('buyerId', 'name')
      .populate('artisanId', 'name');

    // Flatten status history into activity log format
    const activities = [];
    orders.forEach(order => {
      order.statusHistory.forEach(entry => {
        activities.push({
          type: 'order_status_change',
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: entry.status,
          note: entry.note,
          changedBy: entry.changedBy,
          changedAt: entry.changedAt,
          metadata: entry.metadata,
          buyer: order.buyerId?.name,
          artisan: order.artisanId?.name
        });
      });
    });

    // Sort by date
    activities.sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));

    return {
      activities: activities.slice(0, limit),
      total: activities.length
    };
  }
}

module.exports = AdminService;
