import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Package } from 'lucide-react';
import { useArtisanDashboard } from '../../../hooks/useArtisanDashboard';

const AnalyticsPage: React.FC = () => {
  const { analytics, isLoading, error, refreshData } = useArtisanDashboard();

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-6 text-center min-h-96 flex flex-col justify-center">
        <div className="text-red-500 mb-4">
          <p className="text-lg font-semibold">Error Loading Analytics</p>
          <p className="text-sm">{error || 'Failed to load analytics data'}</p>
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

  const StatCard: React.FC<{
    title: string;
    value: string;
    change?: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, icon, color }) => (
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
                {Math.abs(change)}% vs last period
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

  // Calculate total revenue from sales data
  const totalRevenue = analytics.salesByMonth.reduce((sum, month) => sum + month.sales, 0);
  const totalProducts = analytics.topProducts.length;
  const totalOrders = analytics.orderStatus.reduce((sum, status) => sum + status.count, 0);

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50"
        />
        
        <StatCard
          title="Total Orders"
          value={totalOrders.toString()}
          icon={<ShoppingBag className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50"
        />
        
        <StatCard
          title="Products"
          value={totalProducts.toString()}
          icon={<Package className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50"
        />
        
        <StatCard
          title="Avg Order Value"
          value={totalOrders > 0 ? `$${(totalRevenue / totalOrders).toFixed(2)}` : '$0.00'}
          icon={<Users className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales Trend</h3>
          <div className="space-y-4">
            {analytics.salesByMonth.map((item, index) => {
              const maxSales = Math.max(...analytics.salesByMonth.map(s => s.sales));
              const percentage = maxSales > 0 ? (item.sales / maxSales) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-16">{item.month}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-20 text-right">
                    ${item.sales.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Products</h3>
          <div className="space-y-4">
            {analytics.topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No product data available</p>
            ) : (
              analytics.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">{product.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">${product.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{product.sales} sales</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h3>
          <div className="space-y-4">
            {analytics.orderStatus.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No order data available</p>
            ) : (
              analytics.orderStatus.map((status, index) => {
                const getStatusColor = (statusName: string) => {
                  switch (statusName.toLowerCase()) {
                    case 'delivered': return 'bg-green-500';
                    case 'shipped': return 'bg-blue-500';
                    case 'processing': return 'bg-yellow-500';
                    case 'pending': return 'bg-orange-500';
                    case 'cancelled': return 'bg-red-500';
                    default: return 'bg-gray-500';
                  }
                };

                const percentage = totalOrders > 0 ? (status.count / totalOrders) * 100 : 0;

                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status)} mr-3`}></div>
                      <span className="text-sm font-medium text-gray-900 capitalize">{status.status}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">{status.count}</span>
                      <span className="text-xs text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Insights</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Revenue Growth</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Your sales are trending upward this month!
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <Package className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800">Best Seller</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                {analytics.topProducts.length > 0 
                  ? `${analytics.topProducts[0].name} is your top performer`
                  : 'Add products to see insights'
                }
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center">
                <ShoppingBag className="w-5 h-5 text-orange-600 mr-2" />
                <span className="font-medium text-orange-800">Order Volume</span>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                {totalOrders} total orders processed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
