import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, Download, Plus, CheckCircle, Clock, Truck, Package } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  products: number;
  amount: number;
  status: 'Pending' | 'Processing' | 'In Transit' | 'Delivered';
  orderDate: string;
  deliveryDate?: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-12345',
    customer: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    products: 2,
    amount: 3850,
    status: 'Delivered',
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-18'
  },
  {
    id: '2',
    orderNumber: 'ORD-12346',
    customer: 'Priya Sharma',
    email: 'priya@example.com',
    products: 2,
    amount: 2500,
    status: 'In Transit',
    orderDate: '2024-01-18',
    deliveryDate: '2024-01-22'
  },
  {
    id: '3',
    orderNumber: 'ORD-12347',
    customer: 'Amit Patel',
    email: 'amit@example.com',
    products: 1,
    amount: 950,
    status: 'Processing',
    orderDate: '2024-01-20',
    deliveryDate: '2024-01-25'
  },
  {
    id: '4',
    orderNumber: 'ORD-12348',
    customer: 'Sunita Devi',
    email: 'sunita@example.com',
    products: 2,
    amount: 2700,
    status: 'Pending',
    orderDate: '2024-01-21',
    deliveryDate: '2024-01-26'
  }
];

const OrderManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'transit' | 'delivered'>('all');
  const [orders] = useState<Order[]>(mockOrders);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedTab === 'all') return matchesSearch;
    if (selectedTab === 'pending') return matchesSearch && order.status === 'Pending';
    if (selectedTab === 'transit') return matchesSearch && order.status === 'In Transit';
    if (selectedTab === 'delivered') return matchesSearch && order.status === 'Delivered';
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-4 h-4 text-gray-600" />;
      case 'Processing':
        return <Package className="w-4 h-4 text-yellow-600" />;
      case 'In Transit':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'Delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const processingOrders = orders.filter(o => o.status === 'Processing').length;
  const inTransitOrders = orders.filter(o => o.status === 'In Transit').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Management</h2>
            <p className="text-gray-600">Track and manage customer orders</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              <span>Export Orders</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              <Plus className="w-4 h-4" />
              <span>New Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
          <p className="text-sm text-gray-600">Total Orders</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-2xl font-bold text-gray-600">{pendingOrders}</p>
          <p className="text-sm text-gray-600">Pending</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-2xl font-bold text-yellow-600">{processingOrders}</p>
          <p className="text-sm text-gray-600">Processing</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-2xl font-bold text-blue-600">{inTransitOrders}</p>
          <p className="text-sm text-gray-600">In Transit</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-2xl font-bold text-green-600">{deliveredOrders}</p>
          <p className="text-sm text-gray-600">Delivered</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'all'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setSelectedTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'pending'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Orders
            </button>
            <button
              onClick={() => setSelectedTab('transit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'transit'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              In Transit
            </button>
            <button
              onClick={() => setSelectedTab('delivered')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'delivered'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Delivered
            </button>
          </nav>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">All Orders</h3>
            <p className="text-sm text-gray-500">Complete list of customer orders</p>
          </div>
          
          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders or customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                      <div className="text-sm text-gray-500">{order.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.products} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{order.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.orderDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.deliveryDate || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
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

export default OrderManagement;
