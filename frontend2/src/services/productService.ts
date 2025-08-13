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

export interface CategoryData {
  id: string;
  name: string;
  image: string;
  icon: string;
  productCount: number;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: string[];
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
   * Fetch product categories from the database
   */
  static async getCategories(): Promise<string[]> {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.CATEGORIES);
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

      const result: CategoriesResponse = await response.json();
      
      if (result.success) {
        return result.data || [];
      } else {
        throw new Error(result.message || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Get category data with product counts and images
   */
  static async getCategoriesWithDetails(): Promise<CategoryData[]> {
    try {
      const categories = await this.getCategories();
      
      // Create category data with icons and get product counts
      const categoryDetails = await Promise.all(
        categories.map(async (category) => {
          try {
            // Get actual product count for each category
            const productCountResponse = await this.getProductCountByCategory(category);
            
            return {
              id: category.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              name: category,
              image: this.getCategoryImage(category),
              icon: this.getCategoryIcon(category),
              productCount: productCountResponse
            };
          } catch (error) {
            console.error(`Error fetching data for category ${category}:`, error);
            return {
              id: category.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              name: category,
              image: this.getCategoryImage(category),
              icon: this.getCategoryIcon(category),
              productCount: 0
            };
          }
        })
      );

      return categoryDetails;
    } catch (error) {
      console.error('Error fetching category details:', error);
      return [];
    }
  }

  /**
   * Get product count for a specific category
   */
  private static async getProductCountByCategory(category: string): Promise<number> {
    try {
      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.PRODUCTS.BASE}?category=${encodeURIComponent(category)}&limit=1`);
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return 0;
      }

      const result: ProductsResponse = await response.json();
      
      if (result.success && result.data.pagination) {
        return result.data.pagination.totalProducts || 0;
      }
      
      return 0;
    } catch (error) {
      console.error('Error fetching product count for category:', category, error);
      return 0;
    }
  }

  /**
   * Get category image based on category name
   */
  private static getCategoryImage(category: string): string {
    const categoryImages: Record<string, string> = {
      'textiles': 'https://images.pexels.com/photos/6292652/pexels-photo-6292652.jpeg?auto=compress&cs=tinysrgb&w=300',
      'pottery': 'https://images.pexels.com/photos/1081199/pexels-photo-1081199.jpeg?auto=compress&cs=tinysrgb&w=300',
      'jewelry': 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=300',
      'wooden crafts': 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=300',
      'woodwork': 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=300',
      'metalwork': 'https://images.pexels.com/photos/6045247/pexels-photo-6045247.jpeg?auto=compress&cs=tinysrgb&w=300',
      'home decor': 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=300',
      'handicrafts': 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=300',
    };
    
    const key = category.toLowerCase();
    return categoryImages[key] || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=300';
  }

  /**
   * Get category icon based on category name
   */
  private static getCategoryIcon(category: string): string {
    const categoryIcons: Record<string, string> = {
      'textiles': 'Shirt',
      'pottery': 'Cookie',
      'jewelry': 'Gem',
      'wooden crafts': 'TreePine',
      'woodwork': 'TreePine',
      'metalwork': 'Wrench',
      'home decor': 'Home',
      'handicrafts': 'Palette',
    };
    
    const key = category.toLowerCase();
    return categoryIcons[key] || 'Package';
  }
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
