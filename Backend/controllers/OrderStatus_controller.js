const OrderStatusService = require('../services/OrderStatusService');
const Order = require('../models/Orders');
const EmailService = require('../services/emailService');

class OrderStatusController {
  /**
   * Get order details with status info
   */
  static async getOrderStatus(req, res) {
    try {
      const orderId = req.params.id;
      const userId = req.user.id;

      const order = await Order.findById(orderId)
        .populate('buyerId', 'name email phone')
        .populate('artisanId', 'name email')
        .populate('items.productId', 'name price images');

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check if user has access (buyer, artisan, or admin)
      const isOwner = order.buyerId._id.toString() === userId || 
                      order.artisanId._id.toString() === userId;
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this order'
        });
      }

      const canModify = OrderStatusService.canModifyStatus(order);
      const modificationWindowRemaining = OrderStatusService.getModificationWindowRemaining(order);
      const statusDisplayNames = OrderStatusService.getStatusDisplayNames();

      res.json({
        success: true,
        data: {
          order,
          statusInfo: {
            currentStatus: order.status,
            displayName: statusDisplayNames[order.status],
            canModify,
            modificationWindowRemaining,
            allowedTransitions: OrderStatusService.isValidTransition ? 
              ['received', 'packed', 'pickup_requested', 'shipped', 'delivered', 'cancelled']
                .filter(s => OrderStatusService.isValidTransition(order.status, s)) : []
          }
        }
      });
    } catch (error) {
      console.error('Get order status error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get order status'
      });
    }
  }

  /**
   * Mark order as received
   */
  static async markAsReceived(req, res) {
    try {
      const orderId = req.params.id;
      const { note } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Verify ownership
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      if (order.artisanId.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      const result = await OrderStatusService.markAsReceived(orderId, userId, userRole, note);

      // Send notification to customer
      await OrderStatusController.sendStatusNotification(result.order, 'received');

      res.json({
        success: true,
        message: 'Order marked as received',
        data: result
      });
    } catch (error) {
      console.error('Mark as received error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update order status'
      });
    }
  }

  /**
   * Mark order as packed
   */
  static async markAsPacked(req, res) {
    try {
      const orderId = req.params.id;
      const { note } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Verify ownership
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      if (order.artisanId.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      const result = await OrderStatusService.markAsPacked(orderId, userId, userRole, note);

      // Send notification to customer
      await OrderStatusController.sendStatusNotification(result.order, 'packed');

      res.json({
        success: true,
        message: 'Order marked as packed',
        data: result
      });
    } catch (error) {
      console.error('Mark as packed error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update order status'
      });
    }
  }

  /**
   * Request pickup agent
   */
  static async requestPickupAgent(req, res) {
    try {
      const orderId = req.params.id;
      const { scheduledAt, note } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Verify ownership
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      if (order.artisanId.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      const result = await OrderStatusService.requestPickupAgent(orderId, userId, userRole, {
        scheduledAt,
        note
      });

      // Send notification to customer
      await OrderStatusController.sendStatusNotification(result.order, 'pickup_requested');

      res.json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      console.error('Request pickup agent error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to request pickup agent'
      });
    }
  }

  /**
   * Confirm self-shipping with tracking details
   */
  static async confirmSelfShipping(req, res) {
    try {
      const orderId = req.params.id;
      const { carrier, trackingNumber, estimatedDelivery, proofOfShipping } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Verify ownership
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      if (order.artisanId.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      const result = await OrderStatusService.confirmSelfShipping(orderId, userId, userRole, {
        carrier,
        trackingNumber,
        estimatedDelivery,
        proofOfShipping
      });

      // Send notification to customer with tracking info
      await OrderStatusController.sendStatusNotification(result.order, 'shipped', {
        trackingNumber: result.trackingNumber,
        carrier: result.carrier
      });

      res.json({
        success: true,
        message: `Order shipped via ${result.carrier}. Tracking number: ${result.trackingNumber}`,
        data: result
      });
    } catch (error) {
      console.error('Confirm self-shipping error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to confirm shipping'
      });
    }
  }

  /**
   * Mark order as delivered
   */
  static async markAsDelivered(req, res) {
    try {
      const orderId = req.params.id;
      const { note, signature, confirmedBy } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Verify ownership (artisan or admin can mark as delivered)
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      
      const isArtisan = order.artisanId.toString() === userId;
      const isAdmin = req.user.role === 'admin';
      
      if (!isArtisan && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      const result = await OrderStatusService.markAsDelivered(orderId, userId, userRole, {
        note,
        signature,
        confirmedBy
      });

      // Send notification to customer
      await OrderStatusController.sendStatusNotification(result.order, 'delivered');

      res.json({
        success: true,
        message: 'Order marked as delivered',
        data: result
      });
    } catch (error) {
      console.error('Mark as delivered error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to mark order as delivered'
      });
    }
  }

  /**
   * Cancel order
   */
  static async cancelOrder(req, res) {
    try {
      const orderId = req.params.id;
      const { reason } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Cancellation reason is required'
        });
      }

      // Verify ownership (buyer, artisan, or admin can cancel)
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      
      const isBuyer = order.buyerId.toString() === userId;
      const isArtisan = order.artisanId.toString() === userId;
      const isAdmin = req.user.role === 'admin';
      
      if (!isBuyer && !isArtisan && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      const result = await OrderStatusService.cancelOrder(orderId, userId, userRole, reason);

      // Send notification
      await OrderStatusController.sendStatusNotification(result.order, 'cancelled', { reason });

      res.json({
        success: true,
        message: 'Order cancelled',
        data: result
      });
    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to cancel order'
      });
    }
  }

  /**
   * Add note to order
   */
  static async addNote(req, res) {
    try {
      const orderId = req.params.id;
      const { note } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (!note) {
        return res.status(400).json({
          success: false,
          message: 'Note is required'
        });
      }

      // Verify ownership
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      
      const isOwner = order.buyerId.toString() === userId || 
                      order.artisanId.toString() === userId;
      const isAdmin = req.user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      const result = await OrderStatusService.addStatusNote(orderId, userId, userRole, note);

      res.json({
        success: true,
        message: 'Note added successfully',
        data: result
      });
    } catch (error) {
      console.error('Add note error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to add note'
      });
    }
  }

  /**
   * Revert status change (within 15-minute window)
   */
  static async revertStatus(req, res) {
    try {
      const orderId = req.params.id;
      const { reason } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Verify ownership
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      if (order.artisanId.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      const result = await OrderStatusService.revertStatus(orderId, userId, userRole, reason);

      res.json({
        success: true,
        message: `Status reverted from '${result.revertedFrom}' to '${result.revertedTo}'`,
        data: result
      });
    } catch (error) {
      console.error('Revert status error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to revert status'
      });
    }
  }

  /**
   * Get status history
   */
  static async getStatusHistory(req, res) {
    try {
      const orderId = req.params.id;
      const userId = req.user.id;

      // Verify ownership
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      
      const isOwner = order.buyerId.toString() === userId || 
                      order.artisanId.toString() === userId;
      const isAdmin = req.user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      const result = await OrderStatusService.getStatusHistory(orderId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get status history error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get status history'
      });
    }
  }

  /**
   * Get available shipping carriers
   */
  static async getShippingCarriers(req, res) {
    try {
      const carriers = OrderStatusService.getShippingCarriers();
      res.json({
        success: true,
        data: carriers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get shipping carriers'
      });
    }
  }

  /**
   * Confirm pickup (admin/logistics endpoint)
   */
  static async confirmPickup(req, res) {
    try {
      const orderId = req.params.id;
      const { agentName, agentPhone, trackingNumber, estimatedDelivery } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (!agentName || !trackingNumber) {
        return res.status(400).json({
          success: false,
          message: 'Agent name and tracking number are required'
        });
      }

      const result = await OrderStatusService.confirmPickup(orderId, userId, userRole, {
        agentName,
        agentPhone,
        trackingNumber,
        estimatedDelivery
      });

      // Notify both artisan and customer
      await OrderStatusController.sendStatusNotification(result.order, 'shipped', {
        trackingNumber,
        carrier: `Pickup Agent (${agentName})`
      });

      res.json({
        success: true,
        message: 'Pickup confirmed',
        data: result
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
   * Helper: Send status notification email
   */
  static async sendStatusNotification(order, status, additionalData = {}) {
    try {
      // Get customer email
      const customerEmail = order.customerInfo?.email || order.buyerId?.email;
      if (!customerEmail) {
        console.log('No customer email available for notification');
        return;
      }

      const statusMessages = {
        'received': 'Your order has been received by the artisan and is being prepared.',
        'packed': 'Great news! Your order has been packed and is ready for shipping.',
        'pickup_requested': 'A pickup agent has been requested for your order. Shipping will begin soon.',
        'shipped': `Your order has been shipped${additionalData.trackingNumber ? ` via ${additionalData.carrier}. Tracking number: ${additionalData.trackingNumber}` : ''}.`,
        'delivered': 'Your order has been delivered. Thank you for shopping with RootsReach!',
        'cancelled': `Your order has been cancelled${additionalData.reason ? `. Reason: ${additionalData.reason}` : ''}.`
      };

      const message = statusMessages[status] || `Your order status has been updated to: ${status}`;

      // Log the notification (actual email implementation would go here)
      console.log(`[Notification] Order ${order.orderNumber} - ${status}: ${message}`);
      console.log(`[Notification] Email would be sent to: ${customerEmail}`);

      // TODO: Implement actual email sending using EmailService
      // await EmailService.sendOrderStatusEmail(customerEmail, {
      //   orderNumber: order.orderNumber,
      //   status,
      //   message,
      //   trackingNumber: additionalData.trackingNumber,
      //   carrier: additionalData.carrier
      // });

    } catch (error) {
      console.error('Failed to send status notification:', error);
      // Don't throw - notification failure shouldn't break the status update
    }
  }
}

module.exports = OrderStatusController;
