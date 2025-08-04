export interface DashboardStats {
  currentMonthEarnings: number;
  earningsChange: number;
  totalOrders: number;
  ordersChange: number;
  activeOrders: number;
  pendingDelivery: number;
  customerTypes: {
    normalBuyers: number;
    distributors: number;
  };
}

export interface Analytics {
  salesByMonth: {
    month: string;
    sales: number;
  }[];
  topProducts: {
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }[];
  orderStatus: {
    status: string;
    count: number;
  }[];
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  profit: number;
  stock: number;
  sold: number;
  status: 'Active' | 'Low Stock' | 'Out of Stock';
  image?: string;
}

export interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    type: 'Normal Buyer' | 'Distributor';
  };
  items: string;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Delivered';
  delivery: 'Preparing' | 'Shipped' | 'Delivered';
  date: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  customer: {
    name: string;
    phone: string;
  };
  items: string;
  address: string;
  status: 'Preparing' | 'Shipped' | 'Delivered';
  progress: number;
  estimatedDelivery: string;
  trackingNumber?: string;
}

export interface Analytics {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  avgOrderValue: number;
  avgOrderChange: number;
  uniqueCustomers: number;
  customersChange: number;
  monthlyEarnings: number[];
  ordersTrend: number[];
  salesByCategory: {
    category: string;
    percentage: number;
  }[];
  customerTypes: {
    normalBuyers: number;
    distributors: number;
  };
  topPerformingItems: {
    name: string;
    unitsSold: number;
    revenue: number;
  }[];
}

export type NavigationPage = 'dashboard' | 'items' | 'orders' | 'deliveries' | 'analytics' | 'settings';
