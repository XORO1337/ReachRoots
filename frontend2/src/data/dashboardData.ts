import { DashboardStats, InventoryItem, Order, Delivery, Analytics } from '../types/dashboard';

export const dashboardStats: DashboardStats = {
  currentMonthEarnings: 2847.50,
  earningsChange: 12.5,
  totalOrders: 1247,
  ordersChange: 8.2,
  activeOrders: 23,
  pendingDelivery: 5,
  customerTypes: {
    normalBuyers: 67,
    distributors: 33,
  },
};

export const inventoryItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Handwoven Silk Scarf',
    description: 'Beautiful handwoven silk scarf with traditional patterns',
    category: 'Textiles',
    price: 85.00,
    cost: 35.00,
    profit: 50.00,
    stock: 12,
    sold: 45,
    status: 'Active',
  },
  {
    id: '2',
    name: 'Ceramic Pottery Bowl',
    description: 'Hand-thrown ceramic bowl with glazed finish',
    category: 'Ceramics',
    price: 45.00,
    cost: 18.00,
    profit: 27.00,
    stock: 8,
    sold: 23,
    status: 'Active',
  },
  {
    id: '3',
    name: 'Wooden Jewelry Box',
    description: 'Handcrafted wooden jewelry box with velvet interior',
    category: 'Woodwork',
    price: 120.00,
    cost: 45.00,
    profit: 75.00,
    stock: 5,
    sold: 12,
    status: 'Low Stock',
  },
  {
    id: '4',
    name: 'Leather Wallet',
    description: 'Premium leather wallet with multiple card slots',
    category: 'Leather Goods',
    price: 65.00,
    cost: 25.00,
    profit: 40.00,
    stock: 0,
    sold: 8,
    status: 'Out of Stock',
  },
];

export const orders: Order[] = [
  {
    id: 'ORD-001',
    customer: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      type: 'Normal Buyer',
    },
    items: 'Handwoven Silk Scarf x2',
    total: 170.00,
    status: 'Pending',
    delivery: 'Preparing',
    date: '2024-01-15',
  },
  {
    id: 'ORD-002',
    customer: {
      name: 'Artisan Distributors Inc.',
      email: 'orders@artisandist.com',
      type: 'Distributor',
    },
    items: 'Ceramic Pottery Bowl x10',
    total: 450.00,
    status: 'Confirmed',
    delivery: 'Shipped',
    date: '2024-01-14',
  },
  {
    id: 'ORD-003',
    customer: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      type: 'Normal Buyer',
    },
    items: 'Wooden Jewelry Box x1',
    total: 120.00,
    status: 'Delivered',
    delivery: 'Delivered',
    date: '2024-01-13',
  },
];

export const deliveries: Delivery[] = [
  {
    id: 'DEL-001',
    orderId: 'ORD-001',
    customer: {
      name: 'Alice Johnson',
      phone: '+1 234-567-6901',
    },
    items: 'Handwoven Silk Scarf x2',
    address: '123 Main St, New York, NY 10001',
    status: 'Preparing',
    progress: 25,
    estimatedDelivery: '2024-01-20',
  },
  {
    id: 'DEL-002',
    orderId: 'ORD-002',
    customer: {
      name: 'Artisan Distributors Inc.',
      phone: '+1 555-123-4567',
    },
    items: 'Ceramic Pottery Bowl x10',
    address: '456 Business Ave, Los Angeles, CA 90210',
    status: 'Shipped',
    progress: 75,
    estimatedDelivery: '2024-01-18',
    trackingNumber: 'TRK123456789',
  },
  {
    id: 'DEL-003',
    orderId: 'ORD-003',
    customer: {
      name: 'Bob Smith',
      phone: '+1 987-654-3210',
    },
    items: 'Wooden Jewelry Box x1',
    address: '789 Oak St, Chicago, IL 60601',
    status: 'Delivered',
    progress: 100,
    estimatedDelivery: '2024-01-16',
    trackingNumber: 'TRK987654321',
  },
  {
    id: 'DEL-004',
    orderId: 'ORD-004',
    customer: {
      name: 'Emma Davis',
      phone: '+1 456-789-0123',
    },
    items: 'Glass Vase x2',
    address: '321 Pine St, Seattle, WA 98101',
    status: 'Preparing',
    progress: 10,
    estimatedDelivery: '2024-01-22',
  },
];

export const analytics: Analytics = {
  totalRevenue: 18000,
  revenueChange: 15.3,
  totalOrders: 312,
  ordersChange: -5.7,
  avgOrderValue: 57.69,
  avgOrderChange: 16.8,
  uniqueCustomers: 156,
  customersChange: 12.1,
  monthlyEarnings: [2500, 1800, 3200, 2900, 3600, 3800],
  ordersTrend: [45, 38, 55, 48, 52, 68],
  salesByCategory: [
    { category: 'Textiles', percentage: 35 },
    { category: 'Ceramics', percentage: 25 },
    { category: 'Woodwork', percentage: 20 },
    { category: 'Leather Goods', percentage: 20 },
  ],
  customerTypes: {
    normalBuyers: 67,
    distributors: 33,
  },
  topPerformingItems: [
    { name: 'Handwoven Silk Scarf', unitsSold: 45, revenue: 3825 },
    { name: 'Ceramic Pottery Bowl', unitsSold: 58, revenue: 1710 },
    { name: 'Wooden Jewelry Box', unitsSold: 25, revenue: 3000 },
    { name: 'Leather Wallet', unitsSold: 22, revenue: 1430 },
    { name: 'Glass Vase', unitsSold: 18, revenue: 1710 },
  ],
};
