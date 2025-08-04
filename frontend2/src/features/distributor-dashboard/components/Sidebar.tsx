import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Package, 
  BarChart3, 
  ShoppingCart, 
  TrendingUp, 
  MessageCircle,
  User
} from 'lucide-react';

type NavigationPage = 'dashboard' | 'products' | 'inventory' | 'orders' | 'analytics' | 'communications';

interface SidebarProps {
  currentPage: NavigationPage;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage }) => {
  const navigationItems = [
    { id: 'dashboard' as NavigationPage, label: 'Dashboard', icon: Home, path: '/distributor' },
    { id: 'products' as NavigationPage, label: 'Product Management', icon: Package, path: '/distributor/products' },
    { id: 'inventory' as NavigationPage, label: 'Inventory Tracking', icon: BarChart3, path: '/distributor/inventory' },
    { id: 'orders' as NavigationPage, label: 'Order Management', icon: ShoppingCart, path: '/distributor/orders' },
    { id: 'analytics' as NavigationPage, label: 'Performance Analytics', icon: TrendingUp, path: '/distributor/analytics' },
    { id: 'communications' as NavigationPage, label: 'Communications', icon: MessageCircle, path: '/distributor/communications' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">RR</span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">RootsReach</h1>
            <p className="text-sm text-gray-500">Distributor Portal</p>
          </div>
        </Link>
      </div>

      {/* Quick Link to Marketplace */}
      <div className="p-4 border-b border-gray-100">
        <Link
          to="/"
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="text-lg">🛒</span>
          <span className="font-medium">Back to Marketplace</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <div className="mb-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Navigation
          </p>
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-500'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Distributor</p>
            <p className="text-xs text-gray-500">Partner</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
