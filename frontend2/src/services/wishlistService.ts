import { buildApiUrl } from '../config/api';

export interface WishlistItem {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  productCategory: string;
  artisanName?: string;
  addedAt: string;
}

export interface WishlistData {
  userId: string;
  items: WishlistItem[];
  totalItems: number;
  lastUpdated: string;
}

export interface WishlistStats {
  totalItems: number;
  totalValue: number;
  categories: { name: string; count: number }[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

class WishlistService {
  /**
   * Get user's wishlist from the backend
   */
  static async getWishlist(): Promise<WishlistData | null> {
    try {
      const response = await fetch(buildApiUrl('/api/wishlist'), {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('User not authenticated for wishlist');
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<WishlistData> = await response.json();
      if (result.success && result.data) {
        return result.data;
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      return null;
    }
  }

  /**
   * Add a product to the wishlist
   */
  static async addToWishlist(product: {
    productId: string;
    productName: string;
    productPrice: number;
    productImage: string;
    productCategory: string;
    artisanName?: string;
  }): Promise<boolean> {
    try {
      const response = await fetch(buildApiUrl('/api/wishlist/add'), {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<WishlistData> = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      return false;
    }
  }

  /**
   * Remove a product from the wishlist
   */
  static async removeFromWishlist(productId: string): Promise<boolean> {
    try {
      const response = await fetch(buildApiUrl(`/api/wishlist/remove/${productId}`), {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<WishlistData> = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      return false;
    }
  }

  /**
   * Toggle a product in the wishlist (add if not present, remove if present)
   */
  static async toggleWishlistItem(product: {
    productId: string;
    productName: string;
    productPrice: number;
    productImage: string;
    productCategory: string;
    artisanName?: string;
  }): Promise<{ success: boolean; isInWishlist: boolean }> {
    try {
      const response = await fetch(buildApiUrl('/api/wishlist/toggle'), {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ isInWishlist: boolean }> = await response.json();
      return {
        success: result.success,
        isInWishlist: result.data?.isInWishlist ?? false,
      };
    } catch (error) {
      console.error('Failed to toggle wishlist item:', error);
      return { success: false, isInWishlist: false };
    }
  }

  /**
   * Check if a product is in the wishlist
   */
  static async checkWishlistItem(productId: string): Promise<boolean> {
    try {
      const response = await fetch(buildApiUrl(`/api/wishlist/check/${productId}`), {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        return false;
      }

      const result: ApiResponse<{ isInWishlist: boolean }> = await response.json();
      return result.data?.isInWishlist ?? false;
    } catch (error) {
      console.error('Failed to check wishlist item:', error);
      return false;
    }
  }

  /**
   * Clear the entire wishlist
   */
  static async clearWishlist(): Promise<boolean> {
    try {
      const response = await fetch(buildApiUrl('/api/wishlist/clear'), {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<void> = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      return false;
    }
  }

  /**
   * Get wishlist statistics
   */
  static async getWishlistStats(): Promise<WishlistStats | null> {
    try {
      const response = await fetch(buildApiUrl('/api/wishlist/stats'), {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<WishlistStats> = await response.json();
      return result.data ?? null;
    } catch (error) {
      console.error('Failed to get wishlist stats:', error);
      return null;
    }
  }
}

export default WishlistService;
