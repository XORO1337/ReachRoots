import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, HeadphonesIcon, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DistributorStats {
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
  const [stats, setStats] = useState<DistributorStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    activeProducts: 0,
    totalCustomers: 0
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    setStats({
      totalOrders: 156,
      pendingOrders: 23,
      completedOrders: 133,
      totalRevenue: 45000,
      activeProducts: 89,
      totalCustomers: 45
    });
  }, []);

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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
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
                title="Total Revenue"
                value={`₹${stats.totalRevenue.toLocaleString()}`}
                icon={<DollarSign size={24} />}
                color="#8B5CF6"
                subtitle="All time earnings"
              />
              <StatCard
                title="Active Products"
                value={stats.activeProducts}
                icon={<Package size={24} />}
                color="#06B6D4"
                subtitle="In distribution"
              />
              <StatCard
                title="Total Customers"
                value={stats.totalCustomers}
                icon={<Users size={24} />}
                color="#EF4444"
                subtitle="Active relationships"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                  <Package className="h-8 w-8 text-blue-600 mb-2" />
                  <p className="font-medium text-blue-900">Browse Products</p>
                  <p className="text-sm text-blue-600">Find new products to distribute</p>
                </button>
                <button className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                  <ShoppingCart className="h-8 w-8 text-green-600 mb-2" />
                  <p className="font-medium text-green-900">View Orders</p>
                  <p className="text-sm text-green-600">Manage your order history</p>
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

        {/* Other Tabs - Placeholder content */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Orders Management</h3>
            <p className="text-gray-600">Order management functionality coming soon...</p>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Catalog</h3>
            <p className="text-gray-600">Product catalog functionality coming soon...</p>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Management</h3>
            <p className="text-gray-600">Customer management functionality coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistributorDashboard;
