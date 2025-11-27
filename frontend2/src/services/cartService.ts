import { buildApiUrl } from '../config/api';
import { CartItem, Product } from '../types';

export interface CartData {
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  lastUpdated: string;
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

class CartService {
  /**
   * Get user's cart from the backend
   * Note: If backend doesn't have a cart endpoint, this returns null
   * and the frontend falls back to localStorage
   */
  static async getCart(): Promise<CartData | null> {
    try {
      const response = await fetch(buildApiUrl('/api/cart'), {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        // Cart API might not exist yet - this is fine, we'll use localStorage
        if (response.status === 404) {
          return null;
        }
        if (response.status === 401) {
          console.warn('User not authenticated for cart');
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<CartData> = await response.json();
      if (result.success && result.data) {
        return result.data;
      }

      return null;
    } catch (error) {
      // Cart API might not exist - fallback to localStorage
      console.warn('Cart API not available, using localStorage:', error);
      return null;
    }
  }

  /**
   * Sync cart with backend
   * If backend doesn't have cart support, this is a no-op
   */
  static async syncCart(items: CartItem[]): Promise<boolean> {
    try {
      const response = await fetch(buildApiUrl('/api/cart/sync'), {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        // Cart API might not exist yet
        if (response.status === 404) {
          return false;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<CartData> = await response.json();
      return result.success;
    } catch (error) {
      console.warn('Cart sync not available:', error);
      return false;
    }
  }

  /**
   * Add item to cart
   */
  static async addToCart(product: Product, quantity: number = 1): Promise<boolean> {
    try {
      const response = await fetch(buildApiUrl('/api/cart/add'), {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          productId: product.id,
          quantity,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
          },
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return false;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<CartData> = await response.json();
      return result.success;
    } catch (error) {
      console.warn('Cart add not available:', error);
      return false;
    }
  }

  /**
   * Update cart item quantity
   */
  static async updateQuantity(productId: string, quantity: number): Promise<boolean> {
    try {
      const response = await fetch(buildApiUrl(`/api/cart/update/${productId}`), {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return false;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<CartData> = await response.json();
      return result.success;
    } catch (error) {
      console.warn('Cart update not available:', error);
      return false;
    }
  }

  /**
   * Remove item from cart
   */
  static async removeFromCart(productId: string): Promise<boolean> {
    try {
      const response = await fetch(buildApiUrl(`/api/cart/remove/${productId}`), {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return false;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<void> = await response.json();
      return result.success;
    } catch (error) {
      console.warn('Cart remove not available:', error);
      return false;
    }
  }

  /**
   * Clear the entire cart
   */
  static async clearCart(): Promise<boolean> {
    try {
      const response = await fetch(buildApiUrl('/api/cart/clear'), {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return false;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<void> = await response.json();
      return result.success;
    } catch (error) {
      console.warn('Cart clear not available:', error);
      return false;
    }
  }
}

export default CartService;
