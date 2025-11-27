import { api } from '../utils/api';
import { CustomerInfo, PaymentMethod } from '../types/payment';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  // artisanId removed - backend will fetch from product
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface CreateOrderData {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  customerInfo?: CustomerInfo;
  totalAmount: number;
  paymentMethod: PaymentMethod;
}

export interface Order {
  _id: string;
  orderNumber: string;
  buyerId: string;
  items: Array<{
    productId: {
      _id: string;
      name: string;
      price: number;
      images: string[];
    };
    quantity: number;
    price: number;
    artisanId: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  customerInfo?: CustomerInfo;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod: PaymentMethod;
  paymentDetails?: {
    gateway?: string;
    method?: PaymentMethod | string;
    status?: string;
    amountPaid?: number;
    currency?: string;
    wallet?: string;
    bank?: string;
    failureReason?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

class OrderService {
  /**
   * Create a new order
   */
  static async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      const response = await api.post('/api/orders', orderData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create order');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Create order error:', error);
      // Extract detailed validation errors if available
      const errorData = error.response?.data;
      let errorMessage = errorData?.message || error.message || 'Failed to create order';
      
      // If there are validation errors, show the first one
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        errorMessage = errorData.errors.map((e: any) => e.msg || e.message).join(', ');
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Get user orders
   */
  static async getUserOrders(page: number = 1, limit: number = 10): Promise<{orders: Order[], pagination: any}> {
    try {
      const response = await api.get(`/api/orders/buyer/me?page=${page}&limit=${limit}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get orders');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Get user orders error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get orders');
    }
  }

  /**
   * Get order by ID
   */
  static async getOrderById(orderId: string): Promise<Order> {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get order');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Get order error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get order');
    }
  }

  /**
   * Get artisan orders (for artisan dashboard)
   */
  static async getArtisanOrders(page: number = 1, limit: number = 10): Promise<{orders: Order[], pagination: any}> {
    try {
      const response = await api.get(`/api/orders/artisan?page=${page}&limit=${limit}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get artisan orders');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Get artisan orders error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get artisan orders');
    }
  }

  /**
   * Update order status (for artisan dashboard)
   */
  static async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    try {
      const response = await api.patch(`/api/orders/${orderId}/status`, { status });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update order status');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Update order status error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update order status');
    }
  }
}

export default OrderService;
