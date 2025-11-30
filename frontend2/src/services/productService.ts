import { API_CONFIG, buildApiUrl } from '../config/api';
import { api } from '../utils/api';

export interface ProductReviewEntry {
  _id?: string;
  user?: {
    _id: string;
    name?: string;
    profileImage?: {
      url?: string;
      thumbnailUrl?: string;
    };
  } | string;
  userName?: string;
  userId?: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  lastEditedAt?: string;
  verifiedPurchase?: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  artisanId: {
    _id: string;
    name: string;
    location?: string;
    city?: string;
    state?: string;
    profileImage?: {
      url?: string;
      thumbnailUrl?: string;
    };
  } | string | null;
  price: number;
  weightUnit: string;
  stock: number;
  images: string[];
  status: 'active' | 'inactive' | 'low-stock';
  averageRating?: number;
  reviewCount?: number;
  reviews?: ProductReviewEntry[];
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
  data: any;
}

export interface ProductListResult {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  name?: string;
  artisanId?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  artisanLocation?: string;
}

export interface ProductReviewsResult {
  reviews: ProductReviewEntry[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  averageRating: number;
  reviewCount: number;
}

export interface ProductReviewSummary {
  reviews: ProductReviewEntry[];
  averageRating: number;
  reviewCount: number;
}

export interface SubmitReviewPayload {
  rating: number;
  comment?: string;
}

const normalizeProductListResponse = (payload: any, fallbackLimit: number = 10): ProductListResult => {
  const defaultPagination = {
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: fallbackLimit,
    hasNext: false,
    hasPrev: false
  };

  if (!payload) {
    return {
      products: [],
      pagination: defaultPagination
    };
  }

  if (Array.isArray(payload)) {
    return {
      products: payload,
      pagination: {
        ...defaultPagination,
        totalProducts: payload.length
      }
    };
  }

  const products = Array.isArray(payload.products) ? payload.products : [];
  const paginationSource = payload.pagination || {};
  const currentPage = paginationSource.currentPage || payload.currentPage || 1;
  const totalPages = paginationSource.totalPages || payload.totalPages || 1;
  const totalProducts = paginationSource.totalProducts || payload.totalCount || products.length;
  const limit = paginationSource.limit || payload.limit || products.length || fallbackLimit;

  return {
    products,
    pagination: {
      currentPage,
      totalPages,
      totalProducts,
      limit,
      hasNext: paginationSource.hasNext ?? currentPage < totalPages,
      hasPrev: paginationSource.hasPrev ?? currentPage > 1
    }
  };
};

class ProductService {
  /**
   * Fetch products with optional filters and pagination
   */
  static async getProductList(params: ProductQueryParams = {}): Promise<ProductListResult> {
    try {
      const searchParams = new URLSearchParams();

      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.category) searchParams.append('category', params.category);
      if (params.name) searchParams.append('name', params.name);
      if (params.artisanId) searchParams.append('artisanId', params.artisanId);
      if (params.status) searchParams.append('status', params.status);
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
      if (params.minPrice !== undefined) searchParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice !== undefined) searchParams.append('maxPrice', params.maxPrice.toString());
      if (params.artisanLocation) searchParams.append('artisanLocation', params.artisanLocation);

      const query = searchParams.toString();
      const endpoint = query
        ? `${API_CONFIG.ENDPOINTS.PRODUCTS.BASE}?${query}`
        : API_CONFIG.ENDPOINTS.PRODUCTS.BASE;

      const response = await api.get(endpoint);
      const result: ProductsResponse = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch products');
      }

      return normalizeProductListResponse(result.data, params.limit);
    } catch (error) {
      console.error('Error fetching product list:', error);
      throw error;
    }
  }

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
<<<<<<< HEAD
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
=======
   * Get categories with counts from optimized backend endpoint
   */
  static async getCategoriesWithCounts(): Promise<Array<{ name: string; productCount: number }>> {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.CATEGORIES_WITH_COUNTS);
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

      const result = await response.json();
      
      if (result.success) {
        return result.data || [];
      } else {
        throw new Error(result.message || 'Failed to fetch categories with counts');
      }
    } catch (error) {
      console.error('Error fetching categories with counts:', error);
      return [];
    }
  }

  /**
   * Get category data with product counts and images (optimized - single API call)
   */
  static async getCategoriesWithDetails(): Promise<CategoryData[]> {
    try {
      // Use optimized endpoint that returns categories with counts in single query
      const categoriesWithCounts = await this.getCategoriesWithCounts();
      
      if (categoriesWithCounts.length === 0) {
        // Fallback to old method if optimized endpoint fails
        const categories = await this.getCategories();
        return categories.map(category => ({
          id: category.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: category,
          image: this.getCategoryImage(category),
          icon: this.getCategoryIcon(category),
          productCount: 0
        }));
      }

      // Map the optimized response to CategoryData format
      return categoriesWithCounts.map(cat => ({
        id: cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: cat.name,
        image: this.getCategoryImage(cat.name),
        icon: this.getCategoryIcon(cat.name),
        productCount: cat.productCount
      }));
>>>>>>> fixed-repo/main
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
      const listResult = await this.getProductList({ category, limit: 1 });
      return listResult.pagination.totalProducts || 0;
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
<<<<<<< HEAD
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
=======
      // Textiles & Fabrics
      'textiles': 'https://images.pexels.com/photos/6292652/pexels-photo-6292652.jpeg?auto=compress&cs=tinysrgb&w=600',
      'textile': 'https://images.pexels.com/photos/6292652/pexels-photo-6292652.jpeg?auto=compress&cs=tinysrgb&w=600',
      'handloom': 'https://images.pexels.com/photos/6292652/pexels-photo-6292652.jpeg?auto=compress&cs=tinysrgb&w=600',
      'weaving': 'https://images.pexels.com/photos/6850602/pexels-photo-6850602.jpeg?auto=compress&cs=tinysrgb&w=600',
      'embroidery': 'https://images.pexels.com/photos/6850602/pexels-photo-6850602.jpeg?auto=compress&cs=tinysrgb&w=600',
      'fabric': 'https://images.pexels.com/photos/6292652/pexels-photo-6292652.jpeg?auto=compress&cs=tinysrgb&w=600',
      
      // Pottery & Ceramics
      'pottery': 'https://images.pexels.com/photos/1081199/pexels-photo-1081199.jpeg?auto=compress&cs=tinysrgb&w=600',
      'ceramics': 'https://images.pexels.com/photos/1081199/pexels-photo-1081199.jpeg?auto=compress&cs=tinysrgb&w=600',
      'terracotta': 'https://images.pexels.com/photos/2162938/pexels-photo-2162938.jpeg?auto=compress&cs=tinysrgb&w=600',
      'clay': 'https://images.pexels.com/photos/1081199/pexels-photo-1081199.jpeg?auto=compress&cs=tinysrgb&w=600',
      
      // Jewelry & Accessories
      'jewelry': 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=600',
      'jewellery': 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=600',
      'accessories': 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=600',
      'ornaments': 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=600',
      
      // Wood & Bamboo
      'wooden crafts': 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600',
      'woodwork': 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600',
      'wood': 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600',
      'bamboo': 'https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg?auto=compress&cs=tinysrgb&w=600',
      'cane': 'https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg?auto=compress&cs=tinysrgb&w=600',
      'furniture': 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600',
      
      // Metal & Brass
      'metalwork': 'https://images.pexels.com/photos/6045247/pexels-photo-6045247.jpeg?auto=compress&cs=tinysrgb&w=600',
      'metal': 'https://images.pexels.com/photos/6045247/pexels-photo-6045247.jpeg?auto=compress&cs=tinysrgb&w=600',
      'brass': 'https://images.pexels.com/photos/6045247/pexels-photo-6045247.jpeg?auto=compress&cs=tinysrgb&w=600',
      'copper': 'https://images.pexels.com/photos/6045247/pexels-photo-6045247.jpeg?auto=compress&cs=tinysrgb&w=600',
      'bell metal': 'https://images.pexels.com/photos/6045247/pexels-photo-6045247.jpeg?auto=compress&cs=tinysrgb&w=600',
      
      // Home & Decor
      'home decor': 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600',
      'home': 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600',
      'decor': 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600',
      'decoration': 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600',
      'wall art': 'https://images.pexels.com/photos/1674049/pexels-photo-1674049.jpeg?auto=compress&cs=tinysrgb&w=600',
      
      // Handicrafts & Art
      'handicrafts': 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600',
      'handicraft': 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600',
      'crafts': 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600',
      'art': 'https://images.pexels.com/photos/1674049/pexels-photo-1674049.jpeg?auto=compress&cs=tinysrgb&w=600',
      'paintings': 'https://images.pexels.com/photos/1674049/pexels-photo-1674049.jpeg?auto=compress&cs=tinysrgb&w=600',
      'painting': 'https://images.pexels.com/photos/1674049/pexels-photo-1674049.jpeg?auto=compress&cs=tinysrgb&w=600',
      
      // Leather
      'leather': 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600',
      'leather goods': 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600',
      'bags': 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600',
      
      // Paper & Stationery
      'paper': 'https://images.pexels.com/photos/6373305/pexels-photo-6373305.jpeg?auto=compress&cs=tinysrgb&w=600',
      'paper crafts': 'https://images.pexels.com/photos/6373305/pexels-photo-6373305.jpeg?auto=compress&cs=tinysrgb&w=600',
      'stationery': 'https://images.pexels.com/photos/6373305/pexels-photo-6373305.jpeg?auto=compress&cs=tinysrgb&w=600',
      
      // Food & Organic
      'food': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
      'organic': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
      'spices': 'https://images.pexels.com/photos/2802527/pexels-photo-2802527.jpeg?auto=compress&cs=tinysrgb&w=600',
      'pickles': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
      
      // Jute & Natural Fiber
      'jute': 'https://images.pexels.com/photos/5603635/pexels-photo-5603635.jpeg?auto=compress&cs=tinysrgb&w=600',
      'jute products': 'https://images.pexels.com/photos/5603635/pexels-photo-5603635.jpeg?auto=compress&cs=tinysrgb&w=600',
      'natural fiber': 'https://images.pexels.com/photos/5603635/pexels-photo-5603635.jpeg?auto=compress&cs=tinysrgb&w=600',
      
      // Stone & Marble
      'stone': 'https://images.pexels.com/photos/2536543/pexels-photo-2536543.jpeg?auto=compress&cs=tinysrgb&w=600',
      'marble': 'https://images.pexels.com/photos/2536543/pexels-photo-2536543.jpeg?auto=compress&cs=tinysrgb&w=600',
      'stone carving': 'https://images.pexels.com/photos/2536543/pexels-photo-2536543.jpeg?auto=compress&cs=tinysrgb&w=600',
      
      // Glass
      'glass': 'https://images.pexels.com/photos/4207908/pexels-photo-4207908.jpeg?auto=compress&cs=tinysrgb&w=600',
      'glasswork': 'https://images.pexels.com/photos/4207908/pexels-photo-4207908.jpeg?auto=compress&cs=tinysrgb&w=600',
      
      // Traditional & Regional
      'traditional': 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600',
      'ethnic': 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600',
      'tribal': 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600',
      
      // Miscellaneous
      'toys': 'https://images.pexels.com/photos/163036/mario-luigi-figures-background-163036.jpeg?auto=compress&cs=tinysrgb&w=600',
      'dolls': 'https://images.pexels.com/photos/163036/mario-luigi-figures-background-163036.jpeg?auto=compress&cs=tinysrgb&w=600',
      'musical instruments': 'https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=600',
      'candles': 'https://images.pexels.com/photos/1123262/pexels-photo-1123262.jpeg?auto=compress&cs=tinysrgb&w=600',
      'incense': 'https://images.pexels.com/photos/4040584/pexels-photo-4040584.jpeg?auto=compress&cs=tinysrgb&w=600',
    };
    
    const key = category.toLowerCase().trim();
    return categoryImages[key] || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600';
>>>>>>> fixed-repo/main
  }

  /**
   * Get category icon based on category name
   */
  private static getCategoryIcon(category: string): string {
    const categoryIcons: Record<string, string> = {
<<<<<<< HEAD
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
=======
      // Textiles & Fabrics
      'textiles': 'Shirt',
      'textile': 'Shirt',
      'handloom': 'Shirt',
      'weaving': 'Layers',
      'embroidery': 'Scissors',
      'fabric': 'Shirt',
      
      // Pottery & Ceramics
      'pottery': 'Cookie',
      'ceramics': 'Cookie',
      'terracotta': 'FlaskConical',
      'clay': 'Cookie',
      
      // Jewelry & Accessories
      'jewelry': 'Gem',
      'jewellery': 'Gem',
      'accessories': 'Watch',
      'ornaments': 'Gem',
      
      // Wood & Bamboo
      'wooden crafts': 'TreePine',
      'woodwork': 'TreePine',
      'wood': 'TreePine',
      'bamboo': 'Leaf',
      'cane': 'Leaf',
      'furniture': 'Armchair',
      
      // Metal & Brass
      'metalwork': 'Wrench',
      'metal': 'Wrench',
      'brass': 'Award',
      'copper': 'Award',
      'bell metal': 'Bell',
      
      // Home & Decor
      'home decor': 'Home',
      'home': 'Home',
      'decor': 'Lamp',
      'decoration': 'Sparkles',
      'wall art': 'Frame',
      
      // Handicrafts & Art
      'handicrafts': 'Palette',
      'handicraft': 'Palette',
      'crafts': 'Palette',
      'art': 'PaintBucket',
      'paintings': 'Paintbrush',
      'painting': 'Paintbrush',
      
      // Leather
      'leather': 'Briefcase',
      'leather goods': 'Briefcase',
      'bags': 'ShoppingBag',
      
      // Paper & Stationery
      'paper': 'FileText',
      'paper crafts': 'FileText',
      'stationery': 'PenTool',
      
      // Food & Organic
      'food': 'Utensils',
      'organic': 'Leaf',
      'spices': 'Flame',
      'pickles': 'Utensils',
      
      // Jute & Natural Fiber
      'jute': 'Wheat',
      'jute products': 'Wheat',
      'natural fiber': 'Wheat',
      
      // Stone & Marble
      'stone': 'Mountain',
      'marble': 'Mountain',
      'stone carving': 'Hammer',
      
      // Glass
      'glass': 'Wine',
      'glasswork': 'Wine',
      
      // Traditional & Regional
      'traditional': 'Star',
      'ethnic': 'Star',
      'tribal': 'Tent',
      
      // Miscellaneous
      'toys': 'Gamepad2',
      'dolls': 'Baby',
      'musical instruments': 'Music',
      'candles': 'Flame',
      'incense': 'Wind',
    };
    
    const key = category.toLowerCase().trim();
>>>>>>> fixed-repo/main
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

  /**
   * Fetch product reviews with pagination
   */
  static async getProductReviews(productId: string, page: number = 1, limit: number = 5): Promise<ProductReviewsResult> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.PRODUCTS.REVIEWS(productId);
      const response = await api.get(`${endpoint}?page=${page}&limit=${limit}`);
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to load product reviews');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  }

  /**
   * Submit or update a product review
   */
  static async submitProductReview(productId: string, payload: SubmitReviewPayload): Promise<ProductReviewSummary> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.PRODUCTS.REVIEWS(productId);
      const response = await api.post(endpoint, payload);
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to submit review');
      }

      return result.data;
    } catch (error) {
      console.error('Error submitting product review:', error);
      throw error;
    }
  }
}

export default ProductService;
