const User = require('../models/User');
const Order = require('../models/Orders');
const mongoose = require('mongoose');

/**
 * Shipping Agent Service
 * Handles all shipping agent-related business logic including:
 * - Viewing available pickup opportunities
 * - Accepting delivery assignments
 * - Managing deliveries (pickup, deliver)
 * - Commission and earnings tracking
 * - Performance metrics
 */

class ShippingAgentService {
  /**
   * Get agent dashboard stats
   */
  static async getAgentDashboard(agentId) {
    const agent = await User.findById(agentId);

    if (!agent || agent.role !== 'shipping_agent') {
      throw new Error('Agent not found');
    }

    // Get counts for different delivery statuses
    const [
      pendingPickups,
      activeDeliveries,
      completedToday,
      completedThisMonth
    ] = await Promise.all([
      // Assigned but not picked up
      Order.countDocuments({
        'shippingDetails.assignedAgentId': agentId,
        status: { $in: ['pickup_requested', 'packed'] }
      }),
      // Picked up, in transit
      Order.countDocuments({
        'shippingDetails.assignedAgentId': agentId,
        status: { $in: ['shipped', 'in_transit', 'out_for_delivery'] }
      }),
      // Delivered today
      Order.countDocuments({
        'shippingDetails.assignedAgentId': agentId,
        status: 'delivered',
        'shippingDetails.deliveredAt': {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }),
      // Delivered this month
      Order.countDocuments({
        'shippingDetails.assignedAgentId': agentId,
        status: 'delivered',
        'shippingDetails.deliveredAt': {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      })
    ]);

    // Calculate today's earnings
    const todaysEarnings = await Order.aggregate([
      {
        $match: {
          'shippingDetails.assignedAgentId': new mongoose.Types.ObjectId(agentId),
          status: 'delivered',
          'shippingDetails.deliveredAt': {
            $gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$shippingDetails.agentCommission' }
        }
      }
    ]);

    return {
      profile: {
        name: agent.name,
        rating: agent.agentProfile?.rating || 0,
        totalDeliveries: agent.agentProfile?.totalDeliveries || 0,
        successRate: agent.agentProfile?.totalDeliveries > 0
          ? Math.round((agent.agentProfile.successfulDeliveries / agent.agentProfile.totalDeliveries) * 100)
          : 0,
        walletBalance: agent.agentProfile?.walletBalance || 0
      },
      stats: {
        pendingPickups,
        activeDeliveries,
        completedToday,
        completedThisMonth,
        todaysEarnings: todaysEarnings[0]?.total || 0
      }
    };
  }

  /**
   * Get available pickup opportunities
   * These are orders that have been broadcasted but not yet accepted
   */
  static async getAvailableOpportunities(agentId, filters = {}) {
    const { page = 1, limit = 20, pinCode, district } = filters;

    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'shipping_agent') {
      throw new Error('Agent not found');
    }

    // Get agent's service areas
    const serviceAreaPinCodes = agent.agentProfile?.serviceAreas?.flatMap(a => a.pinCodes) || [];

    // Build the availability conditions - using $and to combine two $or conditions
    const notAssignedCondition = [
      { 'shippingDetails.assignedAgentId': { $exists: false } },
      { 'shippingDetails.assignedAgentId': null }
    ];

    // Build the targeting/service area conditions
    const targetingConditions = [
      { 'shippingDetails.broadcastInfo.targetedAgentIds': agentId }
    ];
    
    // Add service area condition if agent has configured service areas
    if (serviceAreaPinCodes.length > 0) {
      targetingConditions.push({ 'shippingAddress.pinCode': { $in: serviceAreaPinCodes } });
    }

    // Also show orders that are generally broadcasted (no specific targets)
    targetingConditions.push({
      $or: [
        { 'shippingDetails.broadcastInfo.targetedAgentIds': { $exists: false } },
        { 'shippingDetails.broadcastInfo.targetedAgentIds': { $size: 0 } },
        { 'shippingDetails.broadcastInfo': { $exists: false } }
      ]
    });

    let query = {
      status: 'pickup_requested',
      $and: [
        // Order must not be assigned yet
        { $or: notAssignedCondition },
        // Order must be targeted to this agent OR in their service area OR generally broadcasted
        { $or: targetingConditions }
      ]
    };

    // Additional location filters
    if (pinCode) {
      query['shippingAddress.pinCode'] = pinCode;
    }
    if (district) {
      query['shippingAddress.district'] = { $regex: district, $options: 'i' };
    }

    const opportunities = await Order.find(query)
      .populate('artisanId', 'name phone addresses')
      .populate('buyerId', 'name phone')
      .populate('items.productId', 'name')
      .sort({ 'shippingDetails.pickupRequestedAt': -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    // Calculate estimated commission for each opportunity
    const opportunitiesWithCommission = opportunities.map(order => {
      const commission = this.calculateCommission(order, agent.agentProfile);
      return {
        ...order.toObject(),
        estimatedCommission: commission
      };
    });

    return {
      opportunities: opportunitiesWithCommission,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total
      }
    };
  }

  /**
   * Express interest in a pickup opportunity
   */
  static async expressInterest(orderId, agentId) {
    const [order, agent] = await Promise.all([
      Order.findById(orderId),
      User.findById(agentId)
    ]);

    if (!order) {
      throw new Error('Order not found');
    }

    if (!agent || agent.role !== 'shipping_agent') {
      throw new Error('Agent not found');
    }

    if (!agent.agentProfile?.isActive) {
      throw new Error('Your agent account is not active');
    }

    if (order.status !== 'pickup_requested') {
      throw new Error('This order is no longer available for pickup');
    }

    if (order.shippingDetails?.assignedAgentId) {
      throw new Error('This order has already been assigned to another agent');
    }

    // Add to interested agents list
    order.shippingDetails = order.shippingDetails || {};
    order.shippingDetails.broadcastInfo = order.shippingDetails.broadcastInfo || {};
    order.shippingDetails.broadcastInfo.interestedAgents = 
      order.shippingDetails.broadcastInfo.interestedAgents || [];

    // Check if already interested
    const alreadyInterested = order.shippingDetails.broadcastInfo.interestedAgents
      .some(ia => ia.agentId.toString() === agentId);

    if (alreadyInterested) {
      throw new Error('You have already expressed interest in this order');
    }

    order.shippingDetails.broadcastInfo.interestedAgents.push({
      agentId,
      agentName: agent.name,
      agentPhone: agent.phone,
      agentRating: agent.agentProfile?.rating || 0,
      interestedAt: new Date()
    });

    await order.save();

    return {
      message: 'Interest expressed successfully. Admin will assign the order.',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        interestedAgentsCount: order.shippingDetails.broadcastInfo.interestedAgents.length
      }
    };
  }

  /**
   * Accept an assigned delivery opportunity
   */
  static async acceptDelivery(orderId, agentId) {
    const [order, agent] = await Promise.all([
      Order.findById(orderId)
        .populate('artisanId', 'name phone addresses')
        .populate('buyerId', 'name phone'),
      User.findById(agentId)
    ]);

    if (!order) {
      throw new Error('Order not found');
    }

    if (!agent || agent.role !== 'shipping_agent') {
      throw new Error('Agent not found');
    }

    // Verify this agent is assigned to this order
    if (order.shippingDetails?.assignedAgentId?.toString() !== agentId) {
      throw new Error('You are not assigned to this order');
    }

    if (order.shippingDetails?.agentAcceptedAt) {
      throw new Error('You have already accepted this delivery');
    }

    // Mark as accepted
    order.shippingDetails.agentAcceptedAt = new Date();
    order.shippingDetails.agentAccepted = true;

    // Calculate commission
    const commission = this.calculateCommission(order, agent.agentProfile);
    order.shippingDetails.agentCommission = commission;

    // Add to status history
    order.statusHistory.push({
      status: order.status,
      changedAt: new Date(),
      changedBy: agentId,
      note: `Delivery accepted by agent ${agent.name}`,
      metadata: { agentId, agentName: agent.name }
    });

    await order.save();

    return {
      order,
      commission,
      pickupDetails: {
        artisanName: order.artisanId?.name,
        artisanPhone: order.artisanId?.phone,
        pickupAddress: order.artisanId?.addresses?.find(a => a.isDefault) || order.artisanId?.addresses?.[0]
      },
      deliveryDetails: {
        customerName: order.buyerId?.name,
        customerPhone: order.buyerId?.phone,
        deliveryAddress: order.shippingAddress
      }
    };
  }

  /**
   * Confirm item pickup from artisan
   */
  static async confirmPickup(orderId, agentId, pickupData = {}) {
    const { note, pickupProofImage } = pickupData;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.shippingDetails?.assignedAgentId?.toString() !== agentId) {
      throw new Error('You are not assigned to this order');
    }

    if (order.status === 'shipped') {
      throw new Error('Item has already been picked up');
    }

    // Update order status
    order.status = 'shipped';
    order.lastStatusChangeAt = new Date();
    order.shippingDetails.pickedUpAt = new Date();
    order.shippingDetails.pickedUpBy = agentId;
    if (pickupProofImage) {
      order.shippingDetails.pickupProofImage = pickupProofImage;
    }

    // Generate tracking number if not exists
    if (!order.shippingDetails.trackingNumber) {
      order.shippingDetails.trackingNumber = `RR${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    }

    // Add to status history
    order.statusHistory.push({
      status: 'shipped',
      changedAt: new Date(),
      changedBy: agentId,
      note: note || 'Item picked up by delivery agent',
      metadata: { pickupProofImage }
    });

    await order.save();

    return {
      order,
      trackingNumber: order.shippingDetails.trackingNumber,
      message: 'Pickup confirmed. Item is now in transit.'
    };
  }

  /**
   * Mark order as delivered
   */
  static async markDelivered(orderId, agentId, deliveryData = {}) {
    const { note, deliveryProofImage, signature, otp } = deliveryData;

    const [order, agent] = await Promise.all([
      Order.findById(orderId),
      User.findById(agentId)
    ]);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.shippingDetails?.assignedAgentId?.toString() !== agentId) {
      throw new Error('You are not assigned to this order');
    }

    if (order.status === 'delivered') {
      throw new Error('Order has already been delivered');
    }

    if (order.status !== 'shipped' && order.status !== 'in_transit' && order.status !== 'out_for_delivery') {
      throw new Error('Order must be in transit to mark as delivered');
    }

    // Update order status
    order.status = 'delivered';
    order.lastStatusChangeAt = new Date();
    order.shippingDetails.deliveredAt = new Date();
    order.shippingDetails.deliveredBy = agentId;
    if (deliveryProofImage) {
      order.shippingDetails.deliveryProofImage = deliveryProofImage;
    }
    if (signature) {
      order.shippingDetails.deliverySignature = signature;
    }

    // Add to status history
    order.statusHistory.push({
      status: 'delivered',
      changedAt: new Date(),
      changedBy: agentId,
      note: note || 'Order delivered successfully',
      metadata: { deliveryProofImage, hasSignature: !!signature }
    });

    await order.save();

    // Update agent stats and wallet
    const commission = order.shippingDetails.agentCommission || 0;
    await User.findByIdAndUpdate(agentId, {
      $inc: {
        'agentProfile.totalDeliveries': 1,
        'agentProfile.successfulDeliveries': 1,
        'agentProfile.walletBalance': commission,
        'agentProfile.totalEarnings': commission
      }
    });

    return {
      order,
      commission,
      message: `Order delivered successfully. ₹${commission} added to your wallet.`
    };
  }

  /**
   * Get agent's assigned deliveries
   */
  static async getAssignedDeliveries(agentId, filters = {}) {
    const { status, page = 1, limit = 20 } = filters;

    let query = {
      'shippingDetails.assignedAgentId': agentId
    };

    if (status === 'pending') {
      query.status = { $in: ['pickup_requested', 'packed'] };
    } else if (status === 'active') {
      query.status = { $in: ['shipped', 'in_transit', 'out_for_delivery'] };
    } else if (status === 'completed') {
      query.status = 'delivered';
    }

    const deliveries = await Order.find(query)
      .populate('artisanId', 'name phone addresses')
      .populate('buyerId', 'name phone')
      .populate('items.productId', 'name images')
      .sort({ updatedAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    return {
      deliveries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total
      }
    };
  }

  /**
   * Get agent's delivery history
   */
  static async getDeliveryHistory(agentId, filters = {}) {
    const { page = 1, limit = 20, dateFrom, dateTo } = filters;

    let query = {
      'shippingDetails.assignedAgentId': agentId,
      status: { $in: ['delivered', 'cancelled'] }
    };

    if (dateFrom || dateTo) {
      query['shippingDetails.deliveredAt'] = {};
      if (dateFrom) query['shippingDetails.deliveredAt'].$gte = new Date(dateFrom);
      if (dateTo) query['shippingDetails.deliveredAt'].$lte = new Date(dateTo);
    }

    const history = await Order.find(query)
      .populate('artisanId', 'name')
      .populate('buyerId', 'name')
      .sort({ 'shippingDetails.deliveredAt': -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    return {
      history,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total
      }
    };
  }

  /**
   * Get agent earnings and wallet info
   */
  static async getEarnings(agentId, filters = {}) {
    const { period = 'month' } = filters;

    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'shipping_agent') {
      throw new Error('Agent not found');
    }

    // Calculate date range based on period
    let dateFrom;
    const now = new Date();
    switch (period) {
      case 'today':
        dateFrom = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
      default:
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Get earnings for the period
    const earnings = await Order.aggregate([
      {
        $match: {
          'shippingDetails.assignedAgentId': new mongoose.Types.ObjectId(agentId),
          status: 'delivered',
          'shippingDetails.deliveredAt': { $gte: dateFrom }
        }
      },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: '$shippingDetails.agentCommission' },
          deliveryCount: { $sum: 1 },
          totalOrderValue: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Get daily breakdown for the period
    const dailyBreakdown = await Order.aggregate([
      {
        $match: {
          'shippingDetails.assignedAgentId': new mongoose.Types.ObjectId(agentId),
          status: 'delivered',
          'shippingDetails.deliveredAt': { $gte: dateFrom }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$shippingDetails.deliveredAt' }
          },
          commission: { $sum: '$shippingDetails.agentCommission' },
          deliveries: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    return {
      wallet: {
        balance: agent.agentProfile?.walletBalance || 0,
        totalEarnings: agent.agentProfile?.totalEarnings || 0
      },
      periodEarnings: {
        period,
        totalCommission: earnings[0]?.totalCommission || 0,
        deliveryCount: earnings[0]?.deliveryCount || 0,
        totalOrderValue: earnings[0]?.totalOrderValue || 0
      },
      dailyBreakdown,
      payoutHistory: agent.agentProfile?.payoutHistory || []
    };
  }

  /**
   * Request payout
   */
  static async requestPayout(agentId, amount) {
    const agent = await User.findById(agentId);

    if (!agent || agent.role !== 'shipping_agent') {
      throw new Error('Agent not found');
    }

    const balance = agent.agentProfile?.walletBalance || 0;

    if (amount > balance) {
      throw new Error(`Insufficient balance. Available: ₹${balance}`);
    }

    if (amount < 100) {
      throw new Error('Minimum payout amount is ₹100');
    }

    // Check if bank details are set
    if (!agent.agentProfile?.bankDetails?.accountNumber) {
      throw new Error('Please add bank details before requesting payout');
    }

    // Create payout request
    const payoutRequest = {
      amount,
      transactionId: `PO${Date.now()}`,
      status: 'pending',
      requestedAt: new Date()
    };

    // Deduct from wallet
    await User.findByIdAndUpdate(agentId, {
      $inc: { 'agentProfile.walletBalance': -amount },
      $push: { 'agentProfile.payoutHistory': payoutRequest }
    });

    return {
      message: `Payout request of ₹${amount} submitted successfully`,
      transactionId: payoutRequest.transactionId,
      newBalance: balance - amount
    };
  }

  /**
   * Update agent's bank details
   */
  static async updateBankDetails(agentId, bankDetails) {
    const { accountHolder, accountNumber, ifscCode, bankName } = bankDetails;

    if (!accountHolder || !accountNumber || !ifscCode || !bankName) {
      throw new Error('All bank details are required');
    }

    await User.findByIdAndUpdate(agentId, {
      'agentProfile.bankDetails': {
        accountHolder,
        accountNumber,
        ifscCode,
        bankName
      }
    });

    return { message: 'Bank details updated successfully' };
  }

  /**
   * Update service areas
   */
  static async updateServiceAreas(agentId, serviceAreas) {
    await User.findByIdAndUpdate(agentId, {
      'agentProfile.serviceAreas': serviceAreas
    });

    return { message: 'Service areas updated successfully' };
  }

  // ================== HELPER METHODS ==================

  /**
   * Calculate commission for an order
   */
  static calculateCommission(order, agentProfile) {
    const baseDeliveryFee = agentProfile?.baseDeliveryFee || 50;
    const commissionRate = agentProfile?.commissionRate || 5;
    const orderValue = order.totalAmount || 0;

    // Base fee + percentage of order value
    const commission = baseDeliveryFee + (orderValue * commissionRate / 100);

    return Math.round(commission * 100) / 100; // Round to 2 decimals
  }
}

module.exports = ShippingAgentService;
