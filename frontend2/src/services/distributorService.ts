import { buildApiUrl } from '../config/api';

export interface DistributorStats {
  productsAssigned: number;
  monthlySales: number;
  salesChange: number;
  ordersProcessed: number;
  ordersChange: number;
  activeOrders: number;
  ordersInTransit: number;
  customersReached: number;
}

export interface RecentOrder {
  orderNumber: string;
  title: string;
  status: string;
  createdAt: string;
  totalAmount: number;
  customer: {
    name: string;
    email: string;
  };
}

export interface LowStockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  alertType: 'Out of Stock' | 'Low Stock';
  stockText: string;
}

export interface SalesAnalytics {
  salesByDate: Record<string, number>;
  topProducts: Array<{
    name: string;
    totalSales: number;
    unitsSold: number;
  }>;
  totalRevenue: number;
  totalOrders: number;
}

export interface ProductWithInventory {
  id: string;
  name: string;
  category: string;
  artisan: string;
  price: number;
  region: string;
  stock: number;
  minStock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  image?: string;
}

class DistributorService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('accessToken');
    
    // Debug logging to help troubleshoot auth issues
    if (!token) {
      console.warn('DistributorService: No access token found in localStorage');
    }
    
    const response = await fetch(buildApiUrl(endpoint), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      
      // Provide specific error message for authentication issues
      if (response.status === 401) {
        throw new Error('Access token required');
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Get dashboard statistics
  static async getDashboardStats(): Promise<DistributorStats> {
    return this.makeRequest<DistributorStats>('/api/distributor-dashboard/stats');
  }

  // Get recent orders
  static async getRecentOrders(limit: number = 5): Promise<RecentOrder[]> {
    return this.makeRequest<RecentOrder[]>(`/api/distributor-dashboard/recent-orders?limit=${limit}`);
  }

  // Get low stock alerts
  static async getLowStockAlerts(): Promise<LowStockAlert[]> {
    return this.makeRequest<LowStockAlert[]>('/api/distributor-dashboard/low-stock-alerts');
  }

  // Get sales analytics
  static async getSalesAnalytics(period: 'week' | 'month' | 'year' = 'month'): Promise<SalesAnalytics> {
    return this.makeRequest<SalesAnalytics>(`/api/distributor-dashboard/analytics?period=${period}`);
  }

  // Get products with inventory
  static async getProductsWithInventory(
    page: number = 1,
    limit: number = 10,
    category?: string,
    status?: string
  ): Promise<{
    products: ProductWithInventory[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProducts: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (category && category !== 'all') {
      params.append('category', category);
    }
    
    if (status && status !== 'all') {
      params.append('status', status);
    }

    return this.makeRequest<{
      products: ProductWithInventory[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalProducts: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>(`/api/distributor-dashboard/products?${params.toString()}`);
  }
}

export default DistributorService;
