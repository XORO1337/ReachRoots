const Order = require('../models/Orders');
const mongoose = require('mongoose');
const emailService = require('./emailService');

// Valid status transitions map
const STATUS_TRANSITIONS = {
  'pending': ['received', 'cancelled'],
  'received': ['packed', 'cancelled'],
  'packed': ['pickup_requested', 'shipped', 'cancelled'], // pickup_requested for agent, shipped for self-ship
  'pickup_requested': ['shipped', 'cancelled'],
  'processing': ['shipped', 'cancelled'], // Legacy status support
  'shipped': ['delivered', 'cancelled'],
  'delivered': [], // Terminal state
  'cancelled': [] // Terminal state
};

// Status display names
const STATUS_DISPLAY_NAMES = {
  'pending': 'Order Placed',
  'received': 'Order Received',
  'packed': 'Packed',
  'pickup_requested': 'Pickup Requested',
  'processing': 'Processing',
  'shipped': 'Shipped',
  'delivered': 'Delivered',
  'cancelled': 'Cancelled'
};

// Shipping carriers with tracking number patterns
const SHIPPING_CARRIERS = {
  'fedex': { name: 'FedEx', pattern: /^[0-9]{12,22}$/ },
  'ups': { name: 'UPS', pattern: /^1Z[A-Z0-9]{16}$/ },
  'usps': { name: 'USPS', pattern: /^[0-9]{20,22}$/ },
  'dhl': { name: 'DHL', pattern: /^[0-9]{10,11}$/ },
  'bluedart': { name: 'BlueDart', pattern: /^[0-9]{11}$/ },
  'delhivery': { name: 'Delhivery', pattern: /^[0-9]{13,14}$/ },
  'dtdc': { name: 'DTDC', pattern: /^[A-Z][0-9]{8}$/ },
  'ecom_express': { name: 'Ecom Express', pattern: /^[0-9]{11}$/ },
  'india_post': { name: 'India Post', pattern: /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/ },
  'other': { name: 'Other', pattern: /^.{5,50}$/ } // Generic pattern for other carriers
};

// Modification window in milliseconds (15 minutes)
const MODIFICATION_WINDOW_MS = 15 * 60 * 1000;

class OrderStatusService {
  /**
   * Check if a status transition is valid
   */
  static isValidTransition(currentStatus, newStatus) {
    const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
  }

  /**
   * Validate status transition and throw error if invalid
   */
  static validateStatusTransition(currentStatus, newStatus) {
    if (!this.isValidTransition(currentStatus, newStatus)) {
      const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];
      throw new Error(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'. ` +
        `Allowed transitions: ${allowedTransitions.length > 0 ? allowedTransitions.join(', ') : 'none (terminal state)'}`
      );
    }
  }

  /**
   * Check if the order can still be modified (within 15-minute window)
   */
  static canModifyStatus(order) {
    if (!order.lastStatusChangeAt) return false;
    const timeSinceChange = Date.now() - new Date(order.lastStatusChangeAt).getTime();
    return timeSinceChange <= MODIFICATION_WINDOW_MS;
  }

  /**
   * Get remaining time in modification window (in seconds)
   */
  static getModificationWindowRemaining(order) {
    if (!order.lastStatusChangeAt) return 0;
    const timeSinceChange = Date.now() - new Date(order.lastStatusChangeAt).getTime();
    const remaining = MODIFICATION_WINDOW_MS - timeSinceChange;
    return Math.max(0, Math.floor(remaining / 1000));
  }

  /**
   * Update order status with history tracking
   */
  static async updateStatusWithHistory(orderId, newStatus, userId, userRole, note = null) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Validate transition
    this.validateStatusTransition(order.status, newStatus);

    const previousStatus = order.status;

    // Add to status history
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      updatedBy: userId,
      updatedByRole: userRole,
      note: note
    });

    // Update current status
    order.status = newStatus;
    order.lastStatusChangeAt = new Date();

    await order.save();

    // Send email notification for status updates
    // Skip for statuses that have their own specific email handlers
    const skipEmailStatuses = ['shipped', 'delivered', 'pickup_requested'];
    if (!skipEmailStatuses.includes(newStatus)) {
      const populatedOrder = await Order.findById(orderId).populate('buyerId', 'name email');
      if (populatedOrder?.buyerId?.email) {
        try {
          await emailService.sendOrderStatusUpdateEmail({
            email: populatedOrder.buyerId.email,
            name: populatedOrder.buyerId.name || 'Customer',
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            status: newStatus,
            note: note
          });
        } catch (emailError) {
          console.error('Failed to send status update email:', emailError);
        }
      }
    }

    return {
      order,
      previousStatus,
      newStatus
    };
  }

  /**
   * Mark order as received (artisan acknowledges order)
   */
  static async markAsReceived(orderId, userId, userRole, note = null) {
    return this.updateStatusWithHistory(orderId, 'received', userId, userRole, note || 'Order received by artisan');
  }

  /**
   * Mark order as packed
   */
  static async markAsPacked(orderId, userId, userRole, note = null) {
    return this.updateStatusWithHistory(orderId, 'packed', userId, userRole, note || 'Order has been packed');
  }

  /**
   * Request pickup agent
   */
  static async requestPickupAgent(orderId, userId, userRole, pickupDetails = {}) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Validate transition
    this.validateStatusTransition(order.status, 'pickup_requested');

    // Update shipping method and details
    order.shippingMethod = 'pickup_agent';
    order.shippingDetails = {
      ...order.shippingDetails,
      pickupRequestedAt: new Date(),
      pickupScheduledAt: pickupDetails.scheduledAt || null
    };

    // Add to status history
    order.statusHistory.push({
      status: 'pickup_requested',
      timestamp: new Date(),
      updatedBy: userId,
      updatedByRole: userRole,
      note: 'Pickup agent requested'
    });

    order.status = 'pickup_requested';
    order.lastStatusChangeAt = new Date();

    await order.save();

    // Send notification to buyer about pickup
    const populatedOrder = await Order.findById(orderId).populate('buyerId', 'name email');
    if (populatedOrder?.buyerId?.email) {
      try {
        await emailService.sendOrderStatusUpdateEmail({
          email: populatedOrder.buyerId.email,
          name: populatedOrder.buyerId.name || 'Customer',
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          status: 'pickup_requested',
          note: 'A pickup agent has been requested and your order will be shipped soon!'
        });
      } catch (emailError) {
        console.error('Failed to send pickup requested email:', emailError);
      }
    }

    return {
      order,
      previousStatus: 'packed',
      newStatus: 'pickup_requested',
      message: 'Pickup agent has been requested. You will receive confirmation shortly.'
    };
  }

  /**
   * Confirm self-shipping with tracking details
   */
  static async confirmSelfShipping(orderId, userId, userRole, shippingData) {
    const { carrier, trackingNumber, estimatedDelivery, proofOfShipping } = shippingData;

    if (!carrier) {
      throw new Error('Shipping carrier is required');
    }
    if (!trackingNumber) {
      throw new Error('Tracking number is required');
    }

    // Validate tracking number format if carrier is known
    const carrierInfo = SHIPPING_CARRIERS[carrier.toLowerCase()];
    if (carrierInfo && carrier.toLowerCase() !== 'other') {
      if (!carrierInfo.pattern.test(trackingNumber)) {
        throw new Error(`Invalid tracking number format for ${carrierInfo.name}. Please verify the tracking number.`);
      }
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Validate transition (can go from packed or pickup_requested to shipped)
    if (!['packed', 'pickup_requested'].includes(order.status)) {
      throw new Error(`Cannot ship order with status '${order.status}'. Order must be packed first.`);
    }

    // Update shipping details
    order.shippingMethod = 'self_ship';
    order.shippingDetails = {
      ...order.shippingDetails,
      carrier: carrier,
      trackingNumber: trackingNumber,
      proofOfShipping: proofOfShipping || null,
      shippedAt: new Date()
    };
    order.trackingNumber = trackingNumber;
    
    if (estimatedDelivery) {
      order.estimatedDelivery = new Date(estimatedDelivery);
    } else {
      // Default to 7 days from now
      const defaultDelivery = new Date();
      defaultDelivery.setDate(defaultDelivery.getDate() + 7);
      order.estimatedDelivery = defaultDelivery;
    }

    // Add to status history
    order.statusHistory.push({
      status: 'shipped',
      timestamp: new Date(),
      updatedBy: userId,
      updatedByRole: userRole,
      note: `Shipped via ${carrierInfo?.name || carrier}. Tracking: ${trackingNumber}`
    });

    order.status = 'shipped';
    order.lastStatusChangeAt = new Date();

    await order.save();

    // Populate buyer for email notification
    const populatedOrder = await Order.findById(orderId).populate('buyerId', 'name email');
    if (populatedOrder?.buyerId?.email) {
      try {
        await emailService.sendOrderShippedEmail({
          email: populatedOrder.buyerId.email,
          name: populatedOrder.buyerId.name || 'Customer',
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          carrier: carrierInfo?.name || carrier,
          trackingNumber: trackingNumber,
          estimatedDelivery: order.estimatedDelivery
        });
      } catch (emailError) {
        console.error('Failed to send shipped email:', emailError);
        // Don't fail the operation if email fails
      }
    }

    return {
      order,
      previousStatus: order.status,
      newStatus: 'shipped',
      trackingNumber,
      carrier: carrierInfo?.name || carrier
    };
  }

  /**
   * Mark order as delivered
   */
  static async markAsDelivered(orderId, userId, userRole, deliveryConfirmation = {}) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Validate transition
    this.validateStatusTransition(order.status, 'delivered');

    // Add delivery confirmation details if provided
    if (deliveryConfirmation.signature || deliveryConfirmation.confirmedBy) {
      order.deliveryConfirmation = {
        confirmedAt: new Date(),
        signature: deliveryConfirmation.signature,
        confirmedBy: deliveryConfirmation.confirmedBy
      };
    }

    // Add to status history
    order.statusHistory.push({
      status: 'delivered',
      timestamp: new Date(),
      updatedBy: userId,
      updatedByRole: userRole,
      note: deliveryConfirmation.note || 'Order delivered successfully'
    });

    order.status = 'delivered';
    order.lastStatusChangeAt = new Date();

    await order.save();

    // Send delivery notification to buyer
    const populatedOrder = await Order.findById(orderId).populate('buyerId', 'name email');
    if (populatedOrder?.buyerId?.email) {
      try {
        await emailService.sendOrderDeliveredEmail({
          email: populatedOrder.buyerId.email,
          name: populatedOrder.buyerId.name || 'Customer',
          orderId: order._id.toString(),
          orderNumber: order.orderNumber
        });
      } catch (emailError) {
        console.error('Failed to send delivered email:', emailError);
      }
    }

    return {
      order,
      previousStatus: 'shipped',
      newStatus: 'delivered'
    };
  }

  /**
   * Cancel order
   */
  static async cancelOrder(orderId, userId, userRole, reason) {
    if (!reason) {
      throw new Error('Cancellation reason is required');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Check if cancellation is allowed
    if (!this.isValidTransition(order.status, 'cancelled')) {
      throw new Error(`Cannot cancel order with status '${order.status}'`);
    }

    const previousStatus = order.status;

    // Add to status history
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      updatedBy: userId,
      updatedByRole: userRole,
      note: `Cancelled: ${reason}`
    });

    order.status = 'cancelled';
    order.lastStatusChangeAt = new Date();
    order.cancellation = {
      reason,
      cancelledBy: userId,
      cancelledAt: new Date(),
      refundStatus: order.paymentStatus === 'completed' ? 'pending' : null
    };

    await order.save();

    return {
      order,
      previousStatus,
      newStatus: 'cancelled',
      refundRequired: order.paymentStatus === 'completed'
    };
  }

  /**
   * Add a note to the current status without changing it
   */
  static async addStatusNote(orderId, userId, userRole, note) {
    if (!note) {
      throw new Error('Note is required');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Add note to history (same status, just a note)
    order.statusHistory.push({
      status: order.status,
      timestamp: new Date(),
      updatedBy: userId,
      updatedByRole: userRole,
      note: note
    });

    await order.save();

    return { order, note };
  }

  /**
   * Revert to previous status (within 15-minute window)
   */
  static async revertStatus(orderId, userId, userRole, reason) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Check modification window
    if (!this.canModifyStatus(order)) {
      throw new Error('Modification window has expired. Status can no longer be reverted.');
    }

    // Can't revert terminal states
    if (['delivered', 'cancelled'].includes(order.status)) {
      throw new Error(`Cannot revert from '${order.status}' status`);
    }

    // Find the previous status from history
    const history = order.statusHistory;
    if (history.length < 2) {
      throw new Error('No previous status to revert to');
    }

    // Get the status before the current one
    const previousEntry = history[history.length - 2];
    const previousStatus = previousEntry.status;

    // Add revert entry to history
    order.statusHistory.push({
      status: previousStatus,
      timestamp: new Date(),
      updatedBy: userId,
      updatedByRole: userRole,
      note: `Reverted from '${order.status}': ${reason || 'Status correction'}`
    });

    const revertedFrom = order.status;
    order.status = previousStatus;
    order.lastStatusChangeAt = new Date();

    await order.save();

    return {
      order,
      revertedFrom,
      revertedTo: previousStatus
    };
  }

  /**
   * Get status history for an order
   */
  static async getStatusHistory(orderId) {
    const order = await Order.findById(orderId)
      .populate('statusHistory.updatedBy', 'name email')
      .select('orderNumber status statusHistory lastStatusChangeAt');

    if (!order) {
      throw new Error('Order not found');
    }

    const canModify = this.canModifyStatus(order);
    const modificationWindowRemaining = this.getModificationWindowRemaining(order);

    return {
      orderNumber: order.orderNumber,
      currentStatus: order.status,
      statusDisplayName: STATUS_DISPLAY_NAMES[order.status],
      history: order.statusHistory.map(entry => ({
        ...entry.toObject(),
        statusDisplayName: STATUS_DISPLAY_NAMES[entry.status]
      })),
      canModify,
      modificationWindowRemaining,
      allowedTransitions: STATUS_TRANSITIONS[order.status] || []
    };
  }

  /**
   * Get available shipping carriers
   */
  static getShippingCarriers() {
    return Object.entries(SHIPPING_CARRIERS).map(([key, value]) => ({
      id: key,
      name: value.name
    }));
  }

  /**
   * Get status display names
   */
  static getStatusDisplayNames() {
    return STATUS_DISPLAY_NAMES;
  }

  /**
   * Confirm pickup by agent
   */
  static async confirmPickup(orderId, userId, userRole, agentDetails) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'pickup_requested') {
      throw new Error('Order is not awaiting pickup');
    }

    // Update with agent details and transition to shipped
    order.shippingDetails = {
      ...order.shippingDetails,
      pickupConfirmedAt: new Date(),
      pickupAgentName: agentDetails.agentName,
      pickupAgentPhone: agentDetails.agentPhone,
      trackingNumber: agentDetails.trackingNumber
    };
    order.trackingNumber = agentDetails.trackingNumber;

    if (agentDetails.estimatedDelivery) {
      order.estimatedDelivery = new Date(agentDetails.estimatedDelivery);
    }

    // Add to status history
    order.statusHistory.push({
      status: 'shipped',
      timestamp: new Date(),
      updatedBy: userId,
      updatedByRole: userRole,
      note: `Picked up by ${agentDetails.agentName}. Tracking: ${agentDetails.trackingNumber}`
    });

    order.status = 'shipped';
    order.lastStatusChangeAt = new Date();

    await order.save();

    return {
      order,
      previousStatus: 'pickup_requested',
      newStatus: 'shipped'
    };
  }
}

module.exports = OrderStatusService;
