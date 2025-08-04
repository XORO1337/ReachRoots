import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users } from 'lucide-react';
import { Analytics } from '../types/dashboard';

interface AnalyticsProps {
  analytics: Analytics;
}

const AnalyticsPage: React.FC<AnalyticsProps> = ({ analytics }) => {
  const StatCard: React.FC<{
    title: string;
    value: string;
    change: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, icon, color }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
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
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const maxEarnings = Math.max(...analytics.monthlyEarnings);
  const maxOrders = Math.max(...analytics.ordersTrend);

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`$${analytics.totalRevenue.toLocaleString()}`}
          change={analytics.revenueChange}
          icon={<DollarSign className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50"
        />
        
        <StatCard
          title="Total Orders"
          value={analytics.totalOrders.toString()}
          change={analytics.ordersChange}
          icon={<ShoppingBag className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50"
        />
        
        <StatCard
          title="Avg Order Value"
          value={`$${analytics.avgOrderValue.toFixed(2)}`}
          change={analytics.avgOrderChange}
          icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50"
        />
        
        <StatCard
          title="Unique Customers"
          value={analytics.uniqueCustomers.toString()}
          change={analytics.customersChange}
          icon={<Users className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Earnings Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Monthly Earnings</h3>
          <div className="space-y-4">
            {analytics.monthlyEarnings.map((earning, index) => (
              <div key={index} className="flex items-center">
                <div className="w-8 text-sm text-gray-600">{monthLabels[index]}</div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-8">
                    <div
                      className="bg-orange-500 h-8 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(earning / maxEarnings) * 100}%` }}
                    >
                      <span className="text-white text-xs font-medium">${earning}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Trend Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Orders Trend</h3>
          <div className="space-y-4">
            {analytics.ordersTrend.map((orders, index) => (
              <div key={index} className="flex items-center">
                <div className="w-8 text-sm text-gray-600">{monthLabels[index]}</div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-8">
                    <div
                      className="bg-blue-500 h-8 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(orders / maxOrders) * 100}%` }}
                    >
                      <span className="text-white text-xs font-medium">{orders}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
          <div className="space-y-4">
            {analytics.salesByCategory.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded mr-3 ${
                      index === 0 ? 'bg-orange-500' :
                      index === 1 ? 'bg-orange-400' :
                      index === 2 ? 'bg-orange-300' : 'bg-orange-200'
                    }`}
                  ></div>
                  <span className="text-sm text-gray-900">{category.category}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{category.percentage}%</span>
              </div>
            ))}
          </div>
          
          {/* Pie Chart Representation */}
          <div className="mt-6 flex justify-center">
            <div className="w-32 h-32 rounded-full relative" style={{
              background: `conic-gradient(
                #f97316 0deg ${analytics.salesByCategory[0].percentage * 3.6}deg,
                #fb923c ${analytics.salesByCategory[0].percentage * 3.6}deg ${(analytics.salesByCategory[0].percentage + analytics.salesByCategory[1].percentage) * 3.6}deg,
                #fdba74 ${(analytics.salesByCategory[0].percentage + analytics.salesByCategory[1].percentage) * 3.6}deg ${(analytics.salesByCategory[0].percentage + analytics.salesByCategory[1].percentage + analytics.salesByCategory[2].percentage) * 3.6}deg,
                #fed7aa ${(analytics.salesByCategory[0].percentage + analytics.salesByCategory[1].percentage + analytics.salesByCategory[2].percentage) * 3.6}deg 360deg
              )`
            }}></div>
          </div>
        </div>

        {/* Customer Types and Top Performing Items */}
        <div className="space-y-6">
          {/* Customer Types */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Types</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-900">Normal Buyers</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{analytics.customerTypes.normalBuyers}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-300 rounded mr-3"></div>
                  <span className="text-sm text-gray-900">Distributors</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{analytics.customerTypes.distributors}%</span>
              </div>
            </div>
            
            {/* Customer Types Pie Chart */}
            <div className="mt-4 flex justify-center">
              <div className="w-24 h-24 rounded-full" style={{
                background: `conic-gradient(
                  #f97316 0deg ${analytics.customerTypes.normalBuyers * 3.6}deg,
                  #fdba74 ${analytics.customerTypes.normalBuyers * 3.6}deg 360deg
                )`
              }}></div>
            </div>
          </div>

          {/* Top Performing Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Items</h3>
            <div className="space-y-3">
              {analytics.topPerformingItems.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-bold text-orange-600">{index + 1}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.unitsSold} units sold</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">${item.revenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
