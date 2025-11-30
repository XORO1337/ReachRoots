const Order = require('../models/Orders');
const PaymentGatewayService = require('../services/paymentGatewayService');

class PaymentController {
  static async createRazorpayOrder(req, res) {
    try {
      if (!PaymentGatewayService.isConfigured()) {
        return res.status(503).json({
          success: false,
          message: 'Payment gateway is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
        });
      }

      const { orderId, paymentMethod = 'upi' } = req.body;
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'orderId is required'
        });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.buyerId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to pay for this order'
        });
      }

      if (order.paymentStatus === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'This order has already been paid for'
        });
      }

      const amountInPaise = Math.round(order.totalAmount * 100);
      const razorpayOrder = await PaymentGatewayService.createOrder({
        amount: amountInPaise,
        currency: 'INR',
        receipt: order.orderNumber,
        notes: {
          orderId: order._id.toString(),
          buyerId: order.buyerId.toString(),
          artisanId: order.artisanId.toString()
        }
      });

      order.paymentMethod = paymentMethod;
      order.paymentDetails = {
        ...(order.paymentDetails || {}),
        gateway: 'razorpay',
        razorpayOrderId: razorpayOrder.id,
        status: 'created',
        preferredMethod: paymentMethod
      };
      order.paymentStatus = 'pending';
      await order.save();

      res.json({
        success: true,
        message: 'Payment order created successfully',
        data: {
          key: PaymentGatewayService.getKeyId(),
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          orderId: order._id,
          razorpayOrderId: razorpayOrder.id,
          name: 'ReachRoots Marketplace',
          description: `Payment for ${order.orderNumber}`,
          customer: {
            name: order.customerInfo?.name || req.user.name,
            email: order.customerInfo?.email || req.user.email,
            contact: order.customerInfo?.phone || req.user.phone
          }
        }
      });
    } catch (error) {
      console.error('Create Razorpay order error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create payment order'
      });
    }
  }

  static async verifyRazorpayPayment(req, res) {
    try {
      if (!PaymentGatewayService.isConfigured()) {
        return res.status(503).json({
          success: false,
          message: 'Payment gateway is not configured'
        });
      }

      const {
        orderId,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
      } = req.body;

      if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Missing Razorpay verification parameters'
        });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (order.buyerId.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      const isValidSignature = PaymentGatewayService.verifySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isValidSignature) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature'
        });
      }

      const payment = await PaymentGatewayService.fetchPayment(razorpay_payment_id);
      const isCaptured = payment.status === 'captured' || payment.status === 'authorized';

      order.paymentStatus = isCaptured ? 'completed' : 'failed';
      order.paymentMethod = payment.method || order.paymentMethod;
      order.paymentDetails = {
        ...(order.paymentDetails || {}),
        gateway: 'razorpay',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature,
        status: payment.status,
        method: payment.method,
        preferredMethod: order.paymentDetails?.preferredMethod,
        amountPaid: payment.amount ? payment.amount / 100 : undefined,
        currency: payment.currency,
        wallet: payment.wallet,
        bank: payment.bank,
        email: payment.email,
        contact: payment.contact,
        upiId: payment.vpa,
        failureReason: payment.error_description || null,
        capturedAt: payment.captured_at ? new Date(payment.captured_at * 1000) : undefined
      };
      await order.save();

      res.json({
        success: isCaptured,
        message: isCaptured ? 'Payment verified successfully' : 'Payment not captured',
        data: {
          order,
          payment
        }
      });
    } catch (error) {
      console.error('Verify Razorpay payment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to verify payment'
      });
    }
  }

  static async markPaymentFailed(req, res) {
    try {
      const { orderId, reason } = req.body;
      if (!orderId) {
        return res.status(400).json({ success: false, message: 'orderId is required' });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (order.buyerId.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      order.paymentStatus = 'failed';
      order.paymentDetails = {
        ...(order.paymentDetails || {}),
        status: 'failed',
        failureReason: reason || 'Payment cancelled by user'
      };
      await order.save();

      res.json({ success: true, message: 'Payment marked as failed', data: order });
    } catch (error) {
      console.error('Mark payment failed error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to update payment status' });
    }
  }

  // Check if online payment methods are available
  static async checkPaymentAvailability(req, res) {
    try {
      const isRazorpayConfigured = PaymentGatewayService.isConfigured();
      
      res.json({
        success: true,
        data: {
          onlinePaymentsAvailable: isRazorpayConfigured,
          availableMethods: isRazorpayConfigured 
            ? ['cod', 'upi', 'card', 'netbanking', 'wallet']
            : ['cod'],
          message: isRazorpayConfigured 
            ? 'All payment methods available'
            : 'Only Cash on Delivery is available at this time'
        }
      });
    } catch (error) {
      console.error('Check payment availability error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = PaymentController;
