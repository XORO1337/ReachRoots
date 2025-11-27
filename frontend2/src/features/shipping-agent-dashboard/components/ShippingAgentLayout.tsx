import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAgentAuth } from '../../../contexts/AgentAuthContext';
import {
  LayoutDashboard,
  Package,
  Truck,
  Wallet,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface ShippingAgentLayoutProps {
  children: React.ReactNode;
}

const ShippingAgentLayout: React.FC<ShippingAgentLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAgentAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/agent/overview', 
      icon: LayoutDashboard, 
      current: location.pathname === '/agent/overview' || location.pathname === '/agent'
    },
    { 
      name: 'Available Pickups', 
      href: '/agent/opportunities', 
      icon: Package, 
      current: location.pathname === '/agent/opportunities' 
    },
    { 
      name: 'My Deliveries', 
      href: '/agent/deliveries', 
      icon: Truck, 
      current: location.pathname === '/agent/deliveries' 
    },
    { 
      name: 'Earnings', 
      href: '/agent/earnings', 
      icon: Wallet, 
      current: location.pathname === '/agent/earnings' 
    },
    { 
      name: 'Profile', 
      href: '/agent/profile', 
      icon: User, 
      current: location.pathname === '/agent/profile' 
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/agent/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:flex lg:flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">DeliveryAgent</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Agent Status Card */}
        <div className="p-4 border-b border-gray-200">
          <div className="bg-emerald-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">Online & Available</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <MapPin className="w-3 h-3" />
              <span>Active in service area</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.href);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                  ${item.current 
                    ? 'bg-emerald-50 text-emerald-700 border-l-3 border-emerald-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`w-5 h-5 mr-3 ${item.current ? 'text-emerald-600' : 'text-gray-400'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-700 font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Agent'}</p>
              <p className="text-xs text-gray-500">Shipping Agent</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="ml-2 lg:ml-0 text-lg font-semibold text-gray-900">
              {navigation.find(n => n.current)?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Quick Availability Toggle */}
            <button className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>Available</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ShippingAgentLayout;
