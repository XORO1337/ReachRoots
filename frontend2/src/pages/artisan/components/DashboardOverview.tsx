import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Clock, Users } from 'lucide-react';
import { DashboardStats } from '../types/dashboard';

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

interface DashboardOverviewProps {
  stats: DashboardStats;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stats }) => {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Current Month Earnings"
          value={`$${stats.currentMonthEarnings.toFixed(2)}`}
          change={stats.earningsChange}
          icon={<DollarSign className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50"
        />
        
        <StatCard
          title="Total Orders Served"
          value={stats.totalOrders.toLocaleString()}
          change={stats.ordersChange}
          icon={<ShoppingBag className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50"
        />
        
        <StatCard
          title="Active Orders"
          value={stats.activeOrders.toString()}
          icon={<Clock className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50"
        />
        
        <StatCard
          title="Customer Types"
          value={`${stats.customerTypes.normalBuyers}% / ${stats.customerTypes.distributors}%`}
          icon={<Users className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50"
        />
      </div>

      {/* My Items Preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">My Items</h2>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
            + Add New Item
          </button>
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
              <tr className="border-b border-gray-100">
                <td className="py-4 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded"></div>
                  <span className="font-medium text-gray-900">Handwoven Silk Scarf</span>
                </td>
                <td className="py-4 text-gray-600">Textiles</td>
                <td className="py-4 text-gray-900">$85.00</td>
                <td className="py-4 text-gray-900">12</td>
                <td className="py-4">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Active
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex space-x-2">
                    <button className="text-gray-500 hover:text-gray-700">👁</button>
                    <button className="text-gray-500 hover:text-gray-700">✏️</button>
                  </div>
                </td>
              </tr>
              
              <tr className="border-b border-gray-100">
                <td className="py-4 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded"></div>
                  <span className="font-medium text-gray-900">Ceramic Pottery Bowl</span>
                </td>
                <td className="py-4 text-gray-600">Ceramics</td>
                <td className="py-4 text-gray-900">$45.00</td>
                <td className="py-4 text-gray-900">8</td>
                <td className="py-4">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Active
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex space-x-2">
                    <button className="text-gray-500 hover:text-gray-700">👁</button>
                    <button className="text-gray-500 hover:text-gray-700">✏️</button>
                  </div>
                </td>
              </tr>
              
              <tr className="border-b border-gray-100">
                <td className="py-4 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded"></div>
                  <span className="font-medium text-gray-900">Wooden Jewelry Box</span>
                </td>
                <td className="py-4 text-gray-600">Woodwork</td>
                <td className="py-4 text-gray-900">$120.00</td>
                <td className="py-4 text-gray-900">5</td>
                <td className="py-4">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    Low Stock
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex space-x-2">
                    <button className="text-gray-500 hover:text-gray-700">👁</button>
                    <button className="text-gray-500 hover:text-gray-700">✏️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
