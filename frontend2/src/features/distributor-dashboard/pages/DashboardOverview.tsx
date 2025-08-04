import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle, Loader2 } from 'lucide-react';
import DistributorService, { 
  DistributorStats, 
  RecentOrder, 
  LowStockAlert 
} from '../../../services/distributorService';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  change?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color, change }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {change !== undefined && (
            <div className="flex items-center mt-1">
              <span className={`text-sm font-medium ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

interface OrderCardProps {
  orderNumber: string;
  title: string;
  status: string;
  statusColor: string;
}

const OrderCard: React.FC<OrderCardProps> = ({ orderNumber, title, status, statusColor }) => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div>
        <p className="font-medium text-gray-900">{orderNumber}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
        {status}
      </span>
    </div>
  );
};

interface StockAlertProps {
  productName: string;
  stock: string;
  alertType: 'Out of Stock' | 'Low Stock';
  alertColor: string;
}

const StockAlert: React.FC<StockAlertProps> = ({ productName, stock, alertType, alertColor }) => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div>
        <p className="font-medium text-gray-900">{productName}</p>
        <p className="text-sm text-gray-600">{stock}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${alertColor}`}>
        {alertType}
      </span>
    </div>
  );
};

const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<DistributorStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all dashboard data concurrently
        const [statsData, ordersData, stockData] = await Promise.all([
          DistributorService.getDashboardStats(),
          DistributorService.getRecentOrders(3),
          DistributorService.getLowStockAlerts()
        ]);

        setStats(statsData);
        setRecentOrders(ordersData);
        setLowStockAlerts(stockData.slice(0, 3)); // Limit to 3 alerts

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
      case 'in transit':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertColor = (alertType: string) => {
    return alertType === 'Out of Stock' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Error loading dashboard</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Products Assigned"
          value={stats.productsAssigned.toString()}
          icon={<Package className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50"
        />
        
        <StatCard
          title="Monthly Sales"
          value={`₹${stats.monthlySales.toLocaleString()}`}
          change={stats.salesChange}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          color="bg-green-50"
        />
        
        <StatCard
          title="Orders Processed"
          value={stats.ordersProcessed.toString()}
          change={stats.ordersChange}
          icon={<ShoppingCart className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50"
        />
        
        <StatCard
          title="Customers Reached"
          value={stats.customersReached.toLocaleString()}
          icon={<Users className="w-6 h-6 text-purple-600" />}
          color="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <p className="text-sm text-gray-500">Latest orders in your distribution network</p>
          </div>
          
          <div className="space-y-2">
            {recentOrders.length > 0 ? (
              recentOrders.map((order, index) => (
                <OrderCard
                  key={index}
                  orderNumber={order.orderNumber}
                  title={order.title}
                  status={order.status}
                  statusColor={getStatusColor(order.status)}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent orders found</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
            <p className="text-sm text-gray-500">Products that need restocking</p>
          </div>
          
          <div className="space-y-2">
            {lowStockAlerts.length > 0 ? (
              lowStockAlerts.map((alert, index) => (
                <StockAlert
                  key={index}
                  productName={alert.productName}
                  stock={alert.stockText}
                  alertType={alert.alertType}
                  alertColor={getAlertColor(alert.alertType)}
                />
              ))
            ) : (
              <p className="text-green-600 text-center py-4">All products are well-stocked!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
