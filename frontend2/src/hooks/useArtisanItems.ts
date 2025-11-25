import { useEffect, useState } from 'react';
import { api } from '../utils/api';

export interface ArtisanItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  weightUnit?: string;
  stock: number;
  status: 'active' | 'inactive' | 'low-stock';
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemData {
  name: string;
  description: string;
  category: string;
  price: number;
  weightUnit?: string;
  stock: number;
  status?: 'active' | 'inactive' | 'low-stock';
  images?: string[];
}

export const useArtisanItems = () => {
  const [items, setItems] = useState<ArtisanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  });

  const fetchItems = async (page = 1, filters: Record<string, any> = {}) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters
      });

      const response = await api.get(`/api/artisan-dashboard/items?${params}`);
      
      if (response.data.success) {
        setItems(response.data.data.items);
        setPagination(response.data.data.pagination);
      } else {
        throw new Error(response.data.message || 'Failed to fetch items');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch items');
      console.error('Error fetching items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createItem = async (itemData: CreateItemData) => {
    try {
      const response = await api.post('/api/artisan-dashboard/items', itemData);
      
      if (response.data.success) {
        // Refresh the items list
        await fetchItems(pagination.currentPage);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create item');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateItem = async (itemId: string, updateData: Partial<CreateItemData>) => {
    try {
      const response = await api.put(`/api/artisan-dashboard/items/${itemId}`, updateData);
      
      if (response.data.success) {
        // Update the item in the local state
        setItems(prevItems => 
          prevItems.map(item => 
            item._id === itemId ? { ...item, ...updateData } : item
          )
        );
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update item');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const response = await api.delete(`/api/artisan-dashboard/items/${itemId}`);
      
      if (response.data.success) {
        // Remove the item from local state
        setItems(prevItems => prevItems.filter(item => item._id !== itemId));
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to delete item');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    isLoading,
    error,
    pagination,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    setError
  };
};
