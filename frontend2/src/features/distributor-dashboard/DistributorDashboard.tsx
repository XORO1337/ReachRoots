import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './pages/DashboardOverview';
import ProductManagement from './pages/ProductManagement';
import InventoryTracking from './pages/InventoryTracking';
import OrderManagement from './pages/OrderManagement';
import PerformanceAnalytics from './pages/PerformanceAnalytics';
import Communications from './pages/Communications';

type NavigationPage = 'dashboard' | 'products' | 'inventory' | 'orders' | 'analytics' | 'communications';

const DistributorDashboard: React.FC = () => {
  const location = useLocation();
  
  // Extract current page from URL path
  const getCurrentPage = (): NavigationPage => {
    const path = location.pathname.split('/')[2]; // /distributor/[page]
    switch (path) {
      case 'products': return 'products';
      case 'inventory': return 'inventory';
      case 'orders': return 'orders';
      case 'analytics': return 'analytics';
      case 'communications': return 'communications';
      default: return 'dashboard';
    }
  };

  const currentPage = getCurrentPage();

  const getPageTitle = (page: NavigationPage) => {
    switch (page) {
      case 'dashboard': return 'Dashboard Overview';
      case 'products': return 'Product Management';
      case 'inventory': return 'Inventory Tracking';
      case 'orders': return 'Order Management';
      case 'analytics': return 'Performance Analytics';
      case 'communications': return 'Communication Hub';
      default: return 'Dashboard Overview';
    }
  };

  const getPageSubtitle = (page: NavigationPage) => {
    switch (page) {
      case 'dashboard': return 'Welcome to your distributor portal';
      case 'products': return 'Manage your assigned products and inventory';
      case 'inventory': return 'Monitor stock levels and manage inventory across all locations';
      case 'orders': return 'Track and manage customer orders';
      case 'analytics': return 'Track your sales performance and business metrics';
      case 'communications': return 'Stay updated with announcements, notifications, and messages';
      default: return 'Welcome to your distributor portal';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} />
      <div className="flex-1 ml-64">
        <Header title={getPageTitle(currentPage)} subtitle={getPageSubtitle(currentPage)} />
        <main className="overflow-y-auto h-full">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="dashboard" element={<Navigate to="/distributor" replace />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="inventory" element={<InventoryTracking />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="analytics" element={<PerformanceAnalytics />} />
            <Route path="communications" element={<Communications />} />
            <Route path="*" element={<Navigate to="/distributor" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DistributorDashboard;
