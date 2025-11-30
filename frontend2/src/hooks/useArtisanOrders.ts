import { useEffect, useState } from 'react';
import { api } from '../utils/api';

export interface ArtisanOrder {
  _id: string;
  orderNumber: string;
<<<<<<< HEAD
  customerId: {
=======
  buyerId: {
>>>>>>> fixed-repo/main
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
<<<<<<< HEAD
=======
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
>>>>>>> fixed-repo/main
  items: Array<{
    productId: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
<<<<<<< HEAD
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
=======
  status: 'pending' | 'received' | 'processing' | 'packed' | 'pickup_requested' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
>>>>>>> fixed-repo/main
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
<<<<<<< HEAD
=======
  shippingMethod?: 'self_ship' | 'pickup_agent';
  shippingDetails?: {
    carrier?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    proofOfShipment?: string;
  };
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    note?: string;
    updatedBy?: string;
  }>;
  statusNotes?: Array<{
    note: string;
    status: string;
    timestamp: string;
    addedBy?: string;
  }>;
  lastStatusChangeAt?: string;
>>>>>>> fixed-repo/main
  createdAt: string;
  updatedAt: string;
}

export const useArtisanOrders = () => {
  const [orders, setOrders] = useState<ArtisanOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 10
  });

  const fetchOrders = async (page = 1, filters: Record<string, any> = {}) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters
      });

      const response = await api.get(`/api/artisan-dashboard/orders?${params}`);
      
      if (response.data.success) {
        setOrders(response.data.data.orders);
        setPagination(response.data.data.pagination);
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await api.patch(`/api/artisan-dashboard/orders/${orderId}/status`, {
        status
      });
      
      if (response.data.success) {
        // Update the order in the local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, status: status as any, updatedAt: new Date().toISOString() } : order
          )
        );
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update order status');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update order status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    isLoading,
    error,
    pagination,
    fetchOrders,
    updateOrderStatus,
    setError
  };
};
