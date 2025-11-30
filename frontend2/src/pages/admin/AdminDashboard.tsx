<<<<<<< HEAD
import React from 'react';
=======
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
>>>>>>> fixed-repo/main
import { 
  Users, 
  ShoppingCart, 
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  UserCheck,
  AlertTriangle,
<<<<<<< HEAD
  CheckCircle
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  // Mock data - replace with real API calls
  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12.5%',
      changeType: 'increase' as const,
=======
  CheckCircle,
  RefreshCw,
  Truck,
  Package
} from 'lucide-react';
import * as adminService from '../../services/adminService';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    byRole: Record<string, number>;
    flagged: number;
  };
  orders: {
    byStatus: Record<string, { count: number; value: number }>;
    totalValue: number;
    pendingPickups: number;
  };
  revenue: {
    last30Days: number;
    ordersLast30Days: number;
  };
  agents: {
    active: number;
    total: number;
  };
}

interface ActivityLog {
  id: string;
  type: string;
  action: string;
  user?: string;
  orderId?: string;
  orderNumber?: string;
  details?: string;
  timestamp: string;
}

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [platformStats, setPlatformStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        adminService.getPlatformStats(),
        adminService.getActivityLogs({ limit: 10 })
      ]);
      
      setPlatformStats(statsResponse);
      
      // Map activity logs to our format
      const logs = Array.isArray(activityResponse) 
        ? activityResponse 
        : (activityResponse?.logs || activityResponse?.data || []);
      setRecentActivity(logs.slice(0, 5));
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order_status_change':
      case 'order_placed':
        return { icon: ShoppingCart, color: 'text-blue-500' };
      case 'user_registered':
        return { icon: UserCheck, color: 'text-green-500' };
      case 'delivery_completed':
        return { icon: Truck, color: 'text-emerald-500' };
      case 'product_added':
        return { icon: Package, color: 'text-orange-500' };
      default:
        return { icon: Activity, color: 'text-purple-500' };
    }
  };

  // Calculate stats for display
  const totalOrders = platformStats?.orders?.byStatus 
    ? Object.values(platformStats.orders.byStatus).reduce((sum, s) => sum + s.count, 0)
    : 0;

  const stats = [
    {
      title: t('admin.totalUsers'),
      value: formatNumber(platformStats?.users?.total || 0),
      subValue: `${platformStats?.users?.active || 0} ${t('admin.active')}`,
>>>>>>> fixed-repo/main
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
<<<<<<< HEAD
      title: 'Active Artisans',
      value: '1,234',
      change: '+18.2%',
      changeType: 'increase' as const,
=======
      title: t('admin.activeArtisans'),
      value: formatNumber(platformStats?.users?.byRole?.artisan || 0),
      subValue: `${platformStats?.users?.byRole?.customer || 0} ${t('admin.customers')}`,
>>>>>>> fixed-repo/main
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
<<<<<<< HEAD
      title: 'Monthly Orders',
      value: '5,678',
      change: '+23.1%',
      changeType: 'increase' as const,
=======
      title: t('dashboard.totalOrders'),
      value: formatNumber(totalOrders),
      subValue: `${platformStats?.orders?.pendingPickups || 0} ${t('admin.pendingPickup')}`,
>>>>>>> fixed-repo/main
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
<<<<<<< HEAD
      title: 'Revenue Growth',
      value: '₹4,56,789',
      change: '-2.4%',
      changeType: 'decrease' as const,
=======
      title: t('admin.revenue30Days'),
      value: formatCurrency(platformStats?.revenue?.last30Days || 0),
      subValue: `${platformStats?.revenue?.ordersLast30Days || 0} ${t('dashboard.orders')}`,
>>>>>>> fixed-repo/main
      icon: IndianRupee,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

<<<<<<< HEAD
  const recentActivity = [
    {
      id: 1,
      type: 'user_registered',
      message: 'New artisan registered',
      details: 'Sunita Devi joined as pottery artisan',
      time: '2 min ago',
      icon: UserCheck,
      iconColor: 'text-green-500'
    },
    {
      id: 2,
      type: 'order_placed',
      message: 'Large order placed',
      details: '₹25,000 order from Mumbai customer',
      time: '15 min ago',
      icon: ShoppingCart,
      iconColor: 'text-blue-500'
    },
    {
      id: 3,
      type: 'review_submitted',
      message: 'Product review submitted',
      details: '5-star review for handwoven textile',
      time: '1 hour ago',
      icon: CheckCircle,
      iconColor: 'text-yellow-500'
    },
    {
      id: 4,
      type: 'system_maintenance',
      message: 'System maintenance completed',
      details: 'Database optimization finished',
      time: '3 hours ago',
      icon: Activity,
      iconColor: 'text-purple-500'
    }
  ];

  const userEngagement = [
    { label: 'Daily Active Users', value: 2215, total: 2847 },
    { label: 'Weekly Active Users', value: 1851, total: 2847 },
    { label: 'Monthly Active Users', value: 1281, total: 2847 },
    { label: 'User Retention Rate', value: 82, total: 100, isPercentage: true }
  ];
=======
  const userEngagement = [
    { 
      label: t('admin.activeUsers'), 
      value: platformStats?.users?.active || 0, 
      total: platformStats?.users?.total || 1 
    },
    { 
      label: t('roles.artisan'), 
      value: platformStats?.users?.byRole?.artisan || 0, 
      total: platformStats?.users?.total || 1 
    },
    { 
      label: t('roles.shippingAgent'), 
      value: platformStats?.agents?.active || 0, 
      total: platformStats?.agents?.total || 1 
    },
    { 
      label: t('admin.flaggedUsers'), 
      value: platformStats?.users?.flagged || 0, 
      total: platformStats?.users?.total || 1,
      isWarning: true 
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-orange-600">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }
>>>>>>> fixed-repo/main

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
<<<<<<< HEAD
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Statistics</h1>
          <p className="text-gray-600">Monitor user engagement and platform performance</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

=======
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.title')}</h1>
          <p className="text-gray-600">{t('admin.monitorPlatform')}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchDashboardData}
            className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-sm">{t('common.refresh')}</span>
          </button>
          <div className="text-sm text-gray-500">
            {t('admin.lastUpdated')}: {lastUpdated.toLocaleString()}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium"
          >
            {t('admin.retry')}
          </button>
        </div>
      )}

>>>>>>> fixed-repo/main
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
<<<<<<< HEAD
                <div className={`flex items-center text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'increase' ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  )}
                  {stat.change}
                </div>
=======
>>>>>>> fixed-repo/main
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.title}</p>
<<<<<<< HEAD
                <p className="text-xs text-gray-500 mt-1">from last month</p>
=======
                <p className="text-xs text-gray-500 mt-1">{stat.subValue}</p>
>>>>>>> fixed-repo/main
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Engagement Metrics */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
<<<<<<< HEAD
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement Metrics</h3>
          <p className="text-sm text-gray-600 mb-6">Track user activity and engagement levels across different time periods</p>
=======
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.userEngagementMetrics')}</h3>
          <p className="text-sm text-gray-600 mb-6">{t('admin.trackUserActivity')}</p>
>>>>>>> fixed-repo/main
          
          <div className="space-y-4">
            {userEngagement.map((metric) => (
              <div key={metric.label} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                    <span className="text-sm font-semibold text-gray-900">
<<<<<<< HEAD
                      {metric.isPercentage ? `${metric.value}%` : metric.value.toLocaleString()}
=======
                      {formatNumber(metric.value)}
>>>>>>> fixed-repo/main
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
<<<<<<< HEAD
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(metric.value / metric.total) * 100}%` }}
=======
                      className={`h-2 rounded-full transition-all duration-300 ${
                        metric.isWarning ? 'bg-red-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min((metric.value / metric.total) * 100, 100)}%` }}
>>>>>>> fixed-repo/main
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
<<<<<<< HEAD
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <p className="text-sm text-gray-600 mb-6">Latest user actions and system events</p>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full ${activity.iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-sm text-gray-600">{activity.details}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
=======
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.recentActivity')}</h3>
          <p className="text-sm text-gray-600 mb-6">{t('admin.latestPlatformEvents')}</p>
          
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">{t('admin.noRecentActivity')}</p>
            ) : (
              recentActivity.map((activity, index) => {
                const { icon: Icon, color } = getActivityIcon(activity.type);
                return (
                  <div key={activity.id || index} className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action || activity.type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.details || (activity.orderNumber ? `Order #${activity.orderNumber}` : '')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
>>>>>>> fixed-repo/main
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
<<<<<<< HEAD
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors duration-200">
            <div className="text-center">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Manage Users</span>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors duration-200">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">System Alerts</span>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors duration-200">
            <div className="text-center">
              <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">View Reports</span>
=======
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.quickActions')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/admin/users')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors duration-200"
          >
            <div className="text-center">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">{t('admin.manageUsers')}</span>
            </div>
          </button>
          <button 
            onClick={() => navigate('/admin/orders')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors duration-200"
          >
            <div className="text-center">
              <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">{t('admin.viewOrders')}</span>
            </div>
          </button>
          <button 
            onClick={() => navigate('/admin/activity-logs')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors duration-200"
          >
            <div className="text-center">
              <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">{t('admin.activityLogs')}</span>
>>>>>>> fixed-repo/main
            </div>
          </button>
        </div>
      </div>
<<<<<<< HEAD
=======

      {/* Order Status Overview */}
      {platformStats?.orders?.byStatus && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.orderStatusOverview')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(platformStats.orders.byStatus).map(([status, data]) => (
              <div key={status} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{data.count}</p>
                <p className="text-xs text-gray-600 capitalize">{status.replace(/_/g, ' ')}</p>
                <p className="text-xs text-gray-500">{formatCurrency(data.value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
>>>>>>> fixed-repo/main
    </div>
  );
};

export default AdminDashboard;
