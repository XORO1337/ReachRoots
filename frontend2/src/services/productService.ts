import { API_CONFIG, buildApiUrl } from '../config/api';

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  artisanId: {
    _id: string;
    name: string;
    location?: string;
  };
  price: number;
  weightUnit: string;
  stock: number;
  images: string[];
  status: 'active' | 'inactive' | 'low-stock';
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: {
    products: Product[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProducts: number;
      limit: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

class ProductService {
  /**
   * Fetch featured products for display
   */
  static async getFeaturedProducts(limit: number = 4): Promise<Product[]> {
    try {
      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.PRODUCTS.FEATURED}?limit=${limit}`);
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ProductsResponse = await response.json();
      
      if (result.success) {
        return result.data.products;
      } else {
        throw new Error(result.message || 'Failed to fetch featured products');
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
      // Return empty array as fallback
      return [];
    }
  }

  /**
   * Fetch products by category for showcase
   */
  static async getProductsByCategory(category: string, limit: number = 2): Promise<Product[]> {
    try {
      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.PRODUCTS.BASE}?category=${category}&limit=${limit}`);
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ProductsResponse = await response.json();
      
      if (result.success) {
        return result.data.products;
      } else {
        throw new Error(result.message || 'Failed to fetch products by category');
      }
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  /**
   * Get showcase products for hero section
   * Fetches a mix of products from different categories
   */
  static async getHeroShowcaseProducts(): Promise<{
    textiles: Product[];
    pottery: Product[];
    wooden: Product[];
    jewelry: Product[];
  }> {
    try {
      const [textiles, pottery, wooden, jewelry] = await Promise.all([
        this.getProductsByCategory('Textiles', 2),
        this.getProductsByCategory('Pottery', 2),
        this.getProductsByCategory('Wooden Crafts', 2),
        this.getProductsByCategory('Jewelry', 2)
      ]);

      return {
        textiles,
        pottery,
        wooden,
        jewelry
      };
    } catch (error) {
      console.error('Error fetching hero showcase products:', error);
      return {
        textiles: [],
        pottery: [],
        wooden: [],
        jewelry: []
      };
    }
  }
}

export default ProductService;
