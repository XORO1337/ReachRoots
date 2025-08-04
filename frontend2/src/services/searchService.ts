import { API_CONFIG } from '../config/api';
import { api } from '../utils/api';

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  artisanLocation?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  inStockOnly?: boolean;
}

export interface SearchParams extends SearchFilters {
  q?: string;
  page?: number;
  limit?: number;
}

export interface ApiProduct {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  weightUnit?: string;
  stock: number;
  images: string[];
  status: string;
  artisanId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    city?: string;
    state?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResponse {
  success: boolean;
  message: string;
  data: {
    products: ApiProduct[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  } | ApiProduct[];
}

export interface ProductSearchResult {
  products: ApiProduct[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

class SearchService {
  /**
   * Search products with filters and pagination
   */
  static async searchProducts(params: SearchParams): Promise<ProductSearchResult> {
    try {
      const searchParams = new URLSearchParams();
      
      // Add search query
      if (params.q) {
        searchParams.append('q', params.q);
      }
      
      // Add pagination
      searchParams.append('page', (params.page || 1).toString());
      searchParams.append('limit', (params.limit || 12).toString());
      
      // Add filters
      if (params.category) searchParams.append('category', params.category);
      if (params.minPrice) searchParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
      if (params.artisanLocation) searchParams.append('artisanLocation', params.artisanLocation);
      if (params.status) searchParams.append('status', params.status);
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
      if (params.inStockOnly) searchParams.append('inStockOnly', 'true');

      // Use search endpoint if there's a query, otherwise get all products
      const endpoint = params.q ? API_CONFIG.ENDPOINTS.PRODUCTS.SEARCH : API_CONFIG.ENDPOINTS.PRODUCTS.BASE;
      
      const response = await api.get(`${endpoint}?${searchParams.toString()}`);
      
      const data: SearchResponse = response.data;
      
      if (!data.success) {
        throw new Error(data.message || 'Search failed');
      }

      // Handle different response formats
      if (Array.isArray(data.data)) {
        // Simple array response
        return {
          products: data.data,
          totalCount: data.data.length,
          totalPages: 1,
          currentPage: 1
        };
      } else {
        // Paginated response
        return {
          products: data.data.products || [],
          totalCount: data.data.totalCount || 0,
          totalPages: data.data.totalPages || 0,
          currentPage: data.data.currentPage || 1
        };
      }

    } catch (error) {
      console.error('Search products error:', error);
      throw error;
    }
  }

  /**
   * Get all products with optional filters
   */
  static async getAllProducts(filters?: SearchFilters, page: number = 1, limit: number = 12): Promise<ProductSearchResult> {
    return this.searchProducts({ ...filters, page, limit });
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(category: string, page: number = 1, limit: number = 12): Promise<ProductSearchResult> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('page', page.toString());
      searchParams.append('limit', limit.toString());

      const response = await api.get(`${API_CONFIG.ENDPOINTS.PRODUCTS.BY_CATEGORY}/${encodeURIComponent(category)}?${searchParams.toString()}`);
      
      const data: SearchResponse = response.data;
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to get products by category');
      }

      if (Array.isArray(data.data)) {
        return {
          products: data.data,
          totalCount: data.data.length,
          totalPages: 1,
          currentPage: 1
        };
      } else {
        return {
          products: data.data.products || [],
          totalCount: data.data.totalCount || 0,
          totalPages: data.data.totalPages || 0,
          currentPage: data.data.currentPage || 1
        };
      }

    } catch (error) {
      console.error('Get products by category error:', error);
      throw error;
    }
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(page: number = 1, limit: number = 12): Promise<ProductSearchResult> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('page', page.toString());
      searchParams.append('limit', limit.toString());

      const response = await api.get(`${API_CONFIG.ENDPOINTS.PRODUCTS.FEATURED}?${searchParams.toString()}`);
      
      const data: SearchResponse = response.data;
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to get featured products');
      }

      if (Array.isArray(data.data)) {
        return {
          products: data.data,
          totalCount: data.data.length,
          totalPages: 1,
          currentPage: 1
        };
      } else {
        return {
          products: data.data.products || [],
          totalCount: data.data.totalCount || 0,
          totalPages: data.data.totalPages || 0,
          currentPage: data.data.currentPage || 1
        };
      }

    } catch (error) {
      console.error('Get featured products error:', error);
      throw error;
    }
  }

  /**
   * Get product categories
   */
  static async getProductCategories(): Promise<string[]> {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.PRODUCTS.CATEGORIES);
      
      const data = response.data;
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to get categories');
      }

      return data.data || [];

    } catch (error) {
      console.error('Get product categories error:', error);
      // Return default categories if API fails
      return [
        'Textiles', 'Jewelry', 'Home Decor', 'Art', 'Pottery', 
        'Woodwork', 'Metalwork', 'Leather Goods', 'Kitchenware', 'Accessories'
      ];
    }
  }
}

export default SearchService;
