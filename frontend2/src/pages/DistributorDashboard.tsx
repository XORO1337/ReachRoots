import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, HeadphonesIcon, TrendingUp, Users, DollarSign, AlertTriangle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DistributorService, { 
  RecentOrder, 
  LowStockAlert, 
  ProductWithInventory 
} from '../services/distributorService';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  activeProducts: number;
  totalCustomers: number;
}

const DistributorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'customers'>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    activeProducts: 0,
    totalCustomers: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [products, setProducts] = useState<ProductWithInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard statistics
      const dashboardStats = await DistributorService.getDashboardStats();
      
      // Transform backend stats to match frontend interface
      setStats({
        totalOrders: dashboardStats.ordersProcessed,
        pendingOrders: dashboardStats.activeOrders,
        completedOrders: dashboardStats.ordersProcessed - dashboardStats.activeOrders,
        totalRevenue: dashboardStats.monthlySales,
        activeProducts: dashboardStats.productsAssigned,
        totalCustomers: dashboardStats.customersReached
      });

      // Fetch additional data for overview
      if (activeTab === 'overview') {
        const [orders, alerts] = await Promise.all([
          DistributorService.getRecentOrders(5),
          DistributorService.getLowStockAlerts()
        ]);
        
        setRecentOrders(orders);
        setLowStockAlerts(alerts);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await DistributorService.getProductsWithInventory(1, 10);
      setProducts(response.products);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    }
  }, [activeTab]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="text-gray-400">
          {icon}
        </div>
      </div>
    </div>
  );

  const TabButton: React.FC<{
    label: string;
    icon: React.ReactNode;
    active: boolean;
    onClick: () => void;
  }> = ({ label, icon, active, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Distributor Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name || 'Distributor'}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Role: <span className="font-medium text-blue-600 capitalize">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
              <button 
                onClick={fetchDashboardData}
                className="ml-auto text-red-600 hover:text-red-800 font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          <TabButton
            label="Overview"
            icon={<TrendingUp size={20} />}
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <TabButton
            label="Orders"
            icon={<ShoppingCart size={20} />}
            active={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
          />
          <TabButton
            label="Products"
            icon={<Package size={20} />}
            active={activeTab === 'products'}
            onClick={() => setActiveTab('products')}
          />
          <TabButton
            label="Customers"
            icon={<Users size={20} />}
            active={activeTab === 'customers'}
            onClick={() => setActiveTab('customers')}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600">Loading dashboard data...</span>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && !loading && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Total Orders"
                value={stats.totalOrders}
                icon={<ShoppingCart size={24} />}
                color="#3B82F6"
                subtitle="All time orders"
              />
              <StatCard
                title="Pending Orders"
                value={stats.pendingOrders}
                icon={<Package size={24} />}
                color="#F59E0B"
                subtitle="Awaiting processing"
              />
              <StatCard
                title="Completed Orders"
                value={stats.completedOrders}
                icon={<TrendingUp size={24} />}
                color="#10B981"
                subtitle="Successfully delivered"
              />
              <StatCard
                title="Monthly Revenue"
                value={`₹${stats.totalRevenue.toLocaleString()}`}
                icon={<DollarSign size={24} />}
                color="#8B5CF6"
                subtitle="Current month earnings"
              />
              <StatCard
                title="Active Products"
                value={stats.activeProducts}
                icon={<Package size={24} />}
                color="#06B6D4"
                subtitle="In distribution"
              />
              <StatCard
                title="Customers Reached"
                value={stats.totalCustomers}
                icon={<Users size={24} />}
                color="#EF4444"
                subtitle="Active relationships"
              />
            </div>

            {/* Recent Orders and Low Stock Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                {recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {recentOrders.map((order, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{order.title}</p>
                          <p className="text-sm text-gray-600">#{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">₹{order.totalAmount}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'delivered' 
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent orders found</p>
                )}
              </div>

              {/* Low Stock Alerts */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h3>
                {lowStockAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {lowStockAlerts.map((alert, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div>
                          <p className="font-medium text-gray-900">{alert.productName}</p>
                          <p className="text-sm text-red-600">{alert.stockText}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          alert.alertType === 'Out of Stock'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alert.alertType}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No stock alerts</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveTab('products')}
                  className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Package className="h-8 w-8 text-blue-600 mb-2" />
                  <p className="font-medium text-blue-900">Browse Products</p>
                  <p className="text-sm text-blue-600">Manage your product catalog</p>
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <ShoppingCart className="h-8 w-8 text-green-600 mb-2" />
                  <p className="font-medium text-green-900">View Orders</p>
                  <p className="text-sm text-green-600">Track order status</p>
                </button>
                <button className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                  <HeadphonesIcon className="h-8 w-8 text-purple-600 mb-2" />
                  <p className="font-medium text-purple-900">Contact Support</p>
                  <p className="text-sm text-purple-600">Get help when you need it</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && !loading && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Order Management</h3>
              <button 
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Orders
              </button>
            </div>
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">#{order.orderNumber}</div>
                            <div className="text-sm text-gray-500">{order.title}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.customer?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{order.customer?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{order.totalAmount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'delivered' 
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
                <p className="text-gray-600">You haven't received any orders yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && !loading && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Product Catalog</h3>
              <button 
                onClick={fetchProducts}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Products
              </button>
            </div>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    {product.image && (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">Category: {product.category}</p>
                    <p className="text-sm text-gray-600 mb-2">Artisan: {product.artisan}</p>
                    <p className="text-lg font-bold text-gray-900 mb-2">₹{product.price}</p>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        product.status === 'In Stock'
                          ? 'bg-green-100 text-green-800'
                          : product.status === 'Low Stock'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status}
                      </span>
                      <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600">No products are currently assigned to your distribution areas.</p>
              </div>
            )}
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && !loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Management</h3>
            <p className="text-gray-600 mb-4">
              You have reached {stats.totalCustomers} customers through your distribution network.
            </p>
            <p className="text-gray-500">Detailed customer management functionality coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistributorDashboard;
