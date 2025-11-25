import React, { useState } from 'react';
import { Search, Filter, Package, AlertTriangle, CheckCircle } from 'lucide-react';

interface InventoryItem {
  id: string;
  product: string;
  category: string;
  sku: string;
  currentStock: number;
  minStock: number;
  stockLevel: number; // percentage
  daysUntilStockout: number;
  value: number;
  location: string;
  status: 'Normal' | 'Low Stock' | 'Out of Stock';
}

const mockInventory: InventoryItem[] = [
  {
    id: '1',
    product: 'Handwoven Silk Saree',
    category: 'Textiles',
    sku: 'HSS-001',
    currentStock: 45,
    minStock: 20,
    stockLevel: 85,
    daysUntilStockout: 19,
    value: 67500,
    location: 'Warehouse A-1',
    status: 'Normal'
  },
  {
    id: '2',
    product: 'Brass Decorative Bowl',
    category: 'Home Decor',
    sku: 'BDB-002',
    currentStock: 12,
    minStock: 15,
    stockLevel: 20,
    daysUntilStockout: 7,
    value: 10200,
    location: 'Warehouse B-2',
    status: 'Low Stock'
  },
  {
    id: '3',
    product: 'Wooden Jewelry Box',
    category: 'Accessories',
    sku: 'WJB-003',
    currentStock: 0,
    minStock: 10,
    stockLevel: 0,
    daysUntilStockout: 0,
    value: 0,
    location: 'Warehouse C-1',
    status: 'Out of Stock'
  },
  {
    id: '4',
    product: 'Ceramic Tea Set',
    category: 'Kitchenware',
    sku: 'CTS-004',
    currentStock: 28,
    minStock: 15,
    stockLevel: 87,
    daysUntilStockout: 16,
    value: 33600,
    location: 'Warehouse A-2',
    status: 'Normal'
  }
];

const InventoryTracking: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'current' | 'movements' | 'alerts'>('current');
  const [inventory] = useState<InventoryItem[]>(mockInventory);

  const filteredInventory = inventory.filter(item =>
    item.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal':
        return 'bg-green-100 text-green-800';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockLevelColor = (level: number) => {
    if (level > 50) return 'bg-green-500';
    if (level > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const totalValue = inventory.reduce((sum, item) => sum + item.value, 0);
  const inStockItems = inventory.filter(item => item.status === 'Normal').length;
  const lowStockItems = inventory.filter(item => item.status === 'Low Stock').length;
  const outOfStockItems = inventory.filter(item => item.status === 'Out of Stock').length;

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Inventory Tracking</h2>
        <p className="text-gray-600">Monitor stock levels and manage inventory across all locations</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalValue.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Items in Stock</p>
              <p className="text-2xl font-bold text-green-600">{inStockItems}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStockItems}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('current')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'current'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Current Inventory
            </button>
            <button
              onClick={() => setSelectedTab('movements')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'movements'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Stock Movements
            </button>
            <button
              onClick={() => setSelectedTab('alerts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'alerts'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reorder Alerts
            </button>
          </nav>
        </div>
      </div>

      {/* Current Inventory Tab */}
      {selectedTab === 'current' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Inventory Overview</h3>
              <p className="text-sm text-gray-500">Current stock levels and inventory status</p>
            </div>
            
            {/* Search and Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products or SKU..."
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Until Stockout</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.product}</div>
                        <div className="text-sm text-gray-500">{item.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.currentStock}
                        <span className="text-gray-500 ml-1">/ Min: {item.minStock}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${getStockLevelColor(item.stockLevel)}`}
                            style={{ width: `${item.stockLevel}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{item.stockLevel}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${item.daysUntilStockout <= 7 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                        {item.daysUntilStockout === 0 ? '0 days' : `${item.daysUntilStockout} days`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{item.value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Placeholder for other tabs */}
      {selectedTab === 'movements' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Movements</h3>
          <p className="text-gray-500">Stock movement tracking coming soon...</p>
        </div>
      )}

      {selectedTab === 'alerts' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reorder Alerts</h3>
          <p className="text-gray-500">Automated reorder alerts coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default InventoryTracking;
