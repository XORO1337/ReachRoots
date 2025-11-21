import { api } from '../utils/api';
import { PaymentMethod } from '../types/payment';

export interface RazorpayOrderPayload {
  orderId: string;
  paymentMethod: PaymentMethod;
}

export interface RazorpayOrderConfig {
  key: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  orderId: string;
  name: string;
  description: string;
  customer: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

export interface RazorpayVerificationPayload {
  orderId: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentFailurePayload {
  orderId: string;
  reason?: string;
}

class PaymentService {
  static async createRazorpayOrder(payload: RazorpayOrderPayload): Promise<RazorpayOrderConfig> {
    const response = await api.post('/api/payments/razorpay/order', payload);
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to initialize payment');
    }
    return response.data.data;
  }

  static async verifyRazorpayPayment(payload: RazorpayVerificationPayload) {
    const response = await api.post('/api/payments/razorpay/verify', payload);
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Payment verification failed');
    }
    return response.data.data;
  }

  static async markPaymentFailed(payload: PaymentFailurePayload) {
    try {
      await api.post('/api/payments/razorpay/failure', payload);
    } catch (error) {
      console.warn('Failed to mark payment as failed:', error);
    }
  }
}

export default PaymentService;
