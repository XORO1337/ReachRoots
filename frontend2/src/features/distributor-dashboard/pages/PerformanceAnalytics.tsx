import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users } from 'lucide-react';

interface PerformanceMetric {
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface RegionalData {
  region: string;
  orders: number;
  revenue: number;
  percentage: number;
}

interface TopProduct {
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  growth: number;
}

const PerformanceAnalytics: React.FC = () => {
  const performanceMetrics: PerformanceMetric[] = [
    {
      label: 'Total Sales',
      value: '₹2,45,670',
      change: 12.5,
      icon: <DollarSign className="w-6 h-6 text-orange-600" />,
      color: 'bg-orange-50'
    },
    {
      label: 'Orders Processed',
      value: '342',
      change: 8.2,
      icon: <ShoppingCart className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-50'
    },
    {
      label: 'Average Order Value',
      value: '₹718',
      change: 5.3,
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      color: 'bg-green-50'
    },
    {
      label: 'Customer Reach',
      value: '1,247',
      change: -2.1,
      icon: <Users className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-50'
    }
  ];

  const monthlyData = [
    { month: 'Jan', revenue: 85000, percentage: 85 },
    { month: 'Feb', revenue: 92000, percentage: 92 },
    { month: 'Mar', revenue: 78000, percentage: 78 },
    { month: 'Apr', revenue: 95000, percentage: 95 },
    { month: 'May', revenue: 89000, percentage: 89 },
    { month: 'Jun', revenue: 102000, percentage: 102 }
  ];

  const regionalData: RegionalData[] = [
    { region: 'Mumbai', orders: 89, revenue: 78400, percentage: 32 },
    { region: 'Pune', orders: 67, revenue: 56200, percentage: 23 },
    { region: 'Nashik', orders: 52, revenue: 42800, percentage: 17 },
    { region: 'Nagpur', orders: 46, revenue: 38600, percentage: 16 },
    { region: 'Aurangabad', orders: 38, revenue: 29670, percentage: 12 }
  ];

  const topProducts: TopProduct[] = [
    {
      name: 'Handwoven Silk Saree',
      category: 'Textiles',
      unitsSold: 32,
      revenue: 48600,
      growth: 25
    },
    {
      name: 'Brass Decorative Bowl',
      category: 'Home Decor',
      unitsSold: 24,
      revenue: 23400,
      growth: -5
    },
    {
      name: 'Ceramic Tea Set',
      category: 'Kitchenware',
      unitsSold: 19,
      revenue: 22800,
      growth: 15
    }
  ];

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Performance Analytics</h2>
        <p className="text-gray-600">Track your sales performance and business metrics</p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {performanceMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                <div className="flex items-center mt-2">
                  {metric.change >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change >= 0 ? '+' : ''}{metric.change}% This Month
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${metric.color}`}>
                {metric.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Sales Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Sales Performance</h3>
            <p className="text-sm text-gray-500">Sales performance vs targets over the last 6 months</p>
          </div>
          
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900 w-8">{data.month}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 w-48">
                    <div
                      className="bg-orange-500 h-3 rounded-full"
                      style={{ width: `${Math.min(data.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">₹{(data.revenue / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-500">{data.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Regional Performance</h3>
            <p className="text-sm text-gray-500">Sales distribution across your assigned regions</p>
          </div>
          
          <div className="space-y-4">
            {regionalData.map((region, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900 w-20">{region.region}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 w-32">
                    <div
                      className="bg-blue-500 h-3 rounded-full"
                      style={{ width: `${region.percentage * 3}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">₹{(region.revenue / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-500">{region.orders} orders - {region.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Products */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Products</h3>
          <p className="text-sm text-gray-500">Best-selling products in your distribution network</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.unitsSold}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{product.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.growth >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.growth >= 0 ? '+' : ''}{product.growth}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
