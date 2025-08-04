import { useEffect, useState } from 'react';
import { api } from '../utils/api';

export interface ArtisanDelivery {
  _id: string;
  orderNumber: string;
  buyerId: {
    _id: string;
    name: string;
    phone?: string;
    email: string;
  };
  items: {
    productId: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
  }[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface DeliveryPagination {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  limit: number;
}

export const useArtisanDeliveries = () => {
  const [deliveries, setDeliveries] = useState<ArtisanDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<DeliveryPagination>({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 10
  });

  const fetchDeliveries = async (page = 1, filters: Record<string, any> = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters
      });

      const response = await api.get(`/api/artisan-dashboard/deliveries?${params}`);
      
      if (response.data.success) {
        setDeliveries(response.data.data.orders);
        setPagination(response.data.data.pagination);
      } else {
        throw new Error(response.data.message || 'Failed to fetch deliveries');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch deliveries';
      setError(errorMessage);
      console.error('Error fetching deliveries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDeliveryStatus = async (orderId: string, status: string, trackingNumber?: string) => {
    try {
      const updateData: any = { status };
      if (trackingNumber) {
        updateData.trackingNumber = trackingNumber;
      }

      const response = await api.patch(`/api/artisan-dashboard/orders/${orderId}/status`, updateData);
      
      if (response.data.success) {
        // Update the delivery in the local state
        setDeliveries(prevDeliveries => 
          prevDeliveries.map(delivery => 
            delivery._id === orderId 
              ? { 
                  ...delivery, 
                  status: status as any, 
                  trackingNumber: trackingNumber || delivery.trackingNumber,
                  updatedAt: new Date().toISOString() 
                } 
              : delivery
          )
        );
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update delivery status');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update delivery status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getDeliveryStats = () => {
    const total = deliveries.length;
    const preparing = deliveries.filter(d => d.status === 'processing').length;
    const shipped = deliveries.filter(d => d.status === 'shipped').length;
    const delivered = deliveries.filter(d => d.status === 'delivered').length;

    return {
      total,
      preparing,
      shipped,
      delivered
    };
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  return {
    deliveries,
    isLoading,
    error,
    pagination,
    fetchDeliveries,
    updateDeliveryStatus,
    getDeliveryStats,
    setError
  };
};
