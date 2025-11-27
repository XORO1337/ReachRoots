import { api } from '../utils/api';

export interface StatusHistoryEntry {
  _id: string;
  status: string;
  statusDisplayName: string;
  timestamp: string;
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  updatedByRole?: string;
  note?: string;
}

export interface OrderStatusInfo {
  currentStatus: string;
  displayName: string;
  canModify: boolean;
  modificationWindowRemaining: number;
  allowedTransitions: string[];
}

export interface StatusHistoryResponse {
  orderNumber: string;
  currentStatus: string;
  statusDisplayName: string;
  history: StatusHistoryEntry[];
  canModify: boolean;
  modificationWindowRemaining: number;
  allowedTransitions: string[];
}

export interface ShippingCarrier {
  id: string;
  name: string;
}

export interface SelfShipData {
  carrier: string;
  trackingNumber: string;
  estimatedDelivery?: string;
  proofOfShipping?: string;
}

export interface PickupAgentRequest {
  scheduledAt?: string;
  note?: string;
}

// Status display information
export const STATUS_INFO: Record<string, { label: string; color: string; bgColor: string; description: string }> = {
  'pending': {
    label: 'Order Placed',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    description: 'Order has been placed and is awaiting acknowledgment'
  },
  'received': {
    label: 'Order Received',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    description: 'Artisan has received and acknowledged the order'
  },
  'packed': {
    label: 'Packed',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
    description: 'Order has been packed and is ready for shipping'
  },
  'pickup_requested': {
    label: 'Pickup Requested',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    description: 'Pickup agent has been requested'
  },
  'processing': {
    label: 'Processing',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    description: 'Order is being processed'
  },
  'shipped': {
    label: 'Shipped',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    description: 'Order has been shipped and is on its way'
  },
  'delivered': {
    label: 'Delivered',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    description: 'Order has been delivered successfully'
  },
  'cancelled': {
    label: 'Cancelled',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    description: 'Order has been cancelled'
  }
};

// Status flow for step indicator
export const STATUS_FLOW = ['pending', 'received', 'packed', 'shipped', 'delivered'];

class OrderStatusService {
  /**
   * Get order status with full details
   */
  static async getOrderStatus(orderId: string) {
    const response = await api.get(`/api/orders/${orderId}/status-info`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get order status');
    }
    return response.data.data;
  }

  /**
   * Get status history timeline
   */
  static async getStatusHistory(orderId: string): Promise<StatusHistoryResponse> {
    const response = await api.get(`/api/orders/${orderId}/history`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get status history');
    }
    return response.data.data;
  }

  /**
   * Mark order as received
   */
  static async markAsReceived(orderId: string, note?: string) {
    const response = await api.patch(`/api/orders/${orderId}/receive`, { note });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to mark order as received');
    }
    return response.data.data;
  }

  /**
   * Mark order as packed
   */
  static async markAsPacked(orderId: string, note?: string) {
    const response = await api.patch(`/api/orders/${orderId}/pack`, { note });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to mark order as packed');
    }
    return response.data.data;
  }

  /**
   * Request pickup agent
   */
  static async requestPickupAgent(orderId: string, data?: PickupAgentRequest) {
    const response = await api.post(`/api/orders/${orderId}/request-pickup`, data || {});
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to request pickup agent');
    }
    return response.data.data;
  }

  /**
   * Confirm self-shipping with tracking details
   */
  static async confirmSelfShipping(orderId: string, data: SelfShipData) {
    const response = await api.post(`/api/orders/${orderId}/self-ship`, data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to confirm shipping');
    }
    return response.data.data;
  }

  /**
   * Mark order as delivered
   */
  static async markAsDelivered(orderId: string, data?: { note?: string; signature?: string; confirmedBy?: string }) {
    const response = await api.patch(`/api/orders/${orderId}/deliver`, data || {});
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to mark order as delivered');
    }
    return response.data.data;
  }

  /**
   * Cancel order
   */
  static async cancelOrder(orderId: string, reason: string) {
    const response = await api.patch(`/api/orders/${orderId}/cancel`, { reason });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to cancel order');
    }
    return response.data.data;
  }

  /**
   * Add note to order
   */
  static async addNote(orderId: string, note: string) {
    const response = await api.post(`/api/orders/${orderId}/note`, { note });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to add note');
    }
    return response.data.data;
  }

  /**
   * Revert status change (within 15-minute window)
   */
  static async revertStatus(orderId: string, reason?: string) {
    const response = await api.post(`/api/orders/${orderId}/revert`, { reason });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to revert status');
    }
    return response.data.data;
  }

  /**
   * Get available shipping carriers
   */
  static async getShippingCarriers(): Promise<ShippingCarrier[]> {
    try {
      const response = await api.get('/api/orders/shipping-carriers');
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return response.data.data;
    } catch (error) {
      // Return default carriers if API fails
      return [
        { id: 'fedex', name: 'FedEx' },
        { id: 'ups', name: 'UPS' },
        { id: 'usps', name: 'USPS' },
        { id: 'dhl', name: 'DHL' },
        { id: 'bluedart', name: 'BlueDart' },
        { id: 'delhivery', name: 'Delhivery' },
        { id: 'dtdc', name: 'DTDC' },
        { id: 'ecom_express', name: 'Ecom Express' },
        { id: 'india_post', name: 'India Post' },
        { id: 'other', name: 'Other' }
      ];
    }
  }

  /**
   * Get status display info
   */
  static getStatusInfo(status: string) {
    return STATUS_INFO[status] || {
      label: status,
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
      description: 'Unknown status'
    };
  }

  /**
   * Check if status is terminal (no further transitions)
   */
  static isTerminalStatus(status: string): boolean {
    return ['delivered', 'cancelled'].includes(status);
  }

  /**
   * Get next expected status in normal flow
   */
  static getNextStatus(currentStatus: string): string | null {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === STATUS_FLOW.length - 1) {
      return null;
    }
    return STATUS_FLOW[currentIndex + 1];
  }

  /**
   * Format time remaining in modification window
   */
  static formatTimeRemaining(seconds: number): string {
    if (seconds <= 0) return 'Expired';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

export default OrderStatusService;
