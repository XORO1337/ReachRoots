import React, { useMemo } from 'react';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Truck, 
  BarChart3, 
  Settings,
  User
} from 'lucide-react';
import { NavigationPage } from '../types/dashboard';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  currentPage: NavigationPage;
  onPageChange: (page: NavigationPage) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { user } = useAuth();

  const displayName = useMemo(() => {
    if (user?.name?.trim()) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Artisan';
  }, [user?.email, user?.name]);

  const initials = useMemo(() => {
    if (user?.name?.trim()) {
      return user.name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase())
        .slice(0, 2)
        .join('');
    }
    if (user?.email) return user.email[0]?.toUpperCase() || 'A';
    return 'AR';
  }, [user?.email, user?.name]);

  const navigationItems = [
    { id: 'dashboard' as NavigationPage, label: 'Dashboard', icon: Home },
    { id: 'items' as NavigationPage, label: 'My Items', icon: Package },
    { id: 'orders' as NavigationPage, label: 'Orders', icon: ShoppingCart },
    { id: 'deliveries' as NavigationPage, label: 'Deliveries', icon: Truck },
    { id: 'analytics' as NavigationPage, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as NavigationPage, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AH</span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Artisan Hub</h1>
            <p className="text-sm text-gray-500">Dashboard</p>
          </div>
        </div>
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
                  <button
                    onClick={() => onPageChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-500'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-700">{initials}</span>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">{displayName}</p>
            <p className="text-xs text-gray-500 flex items-center">
              <User className="w-3 h-3 mr-1" />
              {user?.email || 'Signed in'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
