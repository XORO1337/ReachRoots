const Razorpay = require('razorpay');
const crypto = require('crypto');
const env = require('../config/environment');

class PaymentGatewayService {
  constructor() {
    this.keyId = env.RAZORPAY_KEY_ID;
    this.keySecret = env.RAZORPAY_KEY_SECRET;
    if (this.keyId && this.keySecret) {
      this.instance = new Razorpay({
        key_id: this.keyId,
        key_secret: this.keySecret
      });
    }
  }

  isConfigured() {
    return Boolean(this.keyId && this.keySecret && this.instance);
  }

  ensureConfigured() {
    if (!this.isConfigured()) {
      throw new Error('Razorpay credentials are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
    }
  }

  getKeyId() {
    return this.keyId;
  }

  async createOrder(options) {
    this.ensureConfigured();
    return this.instance.orders.create(options);
  }

  verifySignature(orderId, paymentId, signature) {
    this.ensureConfigured();
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(body)
      .digest('hex');
    return expectedSignature === signature;
  }

  async fetchPayment(paymentId) {
    this.ensureConfigured();
    return this.instance.payments.fetch(paymentId);
  }
}

module.exports = new PaymentGatewayService();
