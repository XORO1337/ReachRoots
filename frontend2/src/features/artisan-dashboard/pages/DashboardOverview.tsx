import React from 'react';
import { TrendingUp, TrendingDown, IndianRupee, ShoppingBag, Clock, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useArtisanDashboard } from '../../../hooks/useArtisanDashboard';
import { useArtisanItems } from '../../../hooks/useArtisanItems';
import { DashboardStats } from '../../../types/dashboard';


interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}% from last month
              </span>
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

const DashboardOverview: React.FC = () => {
  const { dashboardStats: stats, isLoading, error, refreshData } = useArtisanDashboard();
  const { items, isLoading: itemsLoading } = useArtisanItems();

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 text-center min-h-96 flex flex-col justify-center">
        <div className="text-red-500 mb-4">
          <p className="text-lg font-semibold">Error Loading Dashboard</p>
          <p className="text-sm">{error || 'Failed to load dashboard data'}</p>
        </div>
        <button
          onClick={refreshData}
          className="mx-auto bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'Active';
      case 'low-stock': return 'Low Stock';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  // Defensive: fallback to 0 if any stat is undefined/null
  const currentMonthEarnings = typeof stats?.currentMonthEarnings === 'number' ? stats.currentMonthEarnings : 0;
  const totalOrders = typeof stats?.totalOrders === 'number' ? stats.totalOrders : 0;
  const activeOrders = typeof stats?.activeOrders === 'number' ? stats.activeOrders : 0;
  const pendingDelivery = typeof stats?.pendingDelivery === 'number' ? stats.pendingDelivery : 0;

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Current Month Earnings"
          value={`₹${Number(currentMonthEarnings).toFixed(2)}`}
          change={stats?.earningsChange}
          icon={<IndianRupee className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50"
        />
        
        <StatCard
          title="Total Orders Served"
          value={Number(totalOrders).toLocaleString()}
          change={stats?.ordersChange}
          icon={<ShoppingBag className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50"
        />
        
        <StatCard
          title="Active Orders"
          value={activeOrders.toString()}
          icon={<Clock className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50"
        />
        
        <StatCard
          title="Pending Deliveries"
          value={pendingDelivery.toString()}
          icon={<Users className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50"
        />
      </div>

      {/* My Items Preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">My Items</h2>
          <div className="flex space-x-3">
            <Link 
              to="/artisan/items"
              className="text-orange-500 hover:text-orange-600 font-medium flex items-center"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link
              to="/artisan/items/new"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              + Add New Item
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="pb-3 text-sm font-medium text-gray-600">Item</th>
                <th className="pb-3 text-sm font-medium text-gray-600">Category</th>
                <th className="pb-3 text-sm font-medium text-gray-600">Price</th>
                <th className="pb-3 text-sm font-medium text-gray-600">Stock</th>
                <th className="pb-3 text-sm font-medium text-gray-600">Status</th>
                <th className="pb-3 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {itemsLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading items...</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No items found. Create your first product to get started!
                  </td>
                </tr>
              ) : (
                items.slice(0, 3).map((item) => (
                  <tr key={item._id} className="border-b border-gray-100">
                    <td className="py-4 flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        {item.images && item.images[0] ? (
                          <img 
                            src={item.images[0]} 
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">No IMG</span>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </td>
                    <td className="py-4 text-gray-600">{item.category}</td>
                    <td className="py-4 text-gray-900">₹{item.price.toFixed(2)}</td>
                    <td className="py-4 text-gray-900">{item.stock}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex space-x-2">
                        <button className="text-gray-500 hover:text-gray-700">👁</button>
                        <button className="text-gray-500 hover:text-gray-700">✏️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
