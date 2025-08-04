import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './pages/DashboardOverview';
import MyItems from './pages/MyItems';
import Orders from './pages/Orders';
import Deliveries from './pages/Deliveries';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { NavigationPage } from '../../types/dashboard';

const ArtisanDashboard: React.FC = () => {
  const location = useLocation();
  
  // Extract current page from URL path
  const getCurrentPage = (): NavigationPage => {
    const path = location.pathname.split('/')[2]; // /artisan/[page]
    switch (path) {
      case 'items': return 'items';
      case 'orders': return 'orders';
      case 'deliveries': return 'deliveries';
      case 'analytics': return 'analytics';
      case 'settings': return 'settings';
      default: return 'dashboard';
    }
  };

  const currentPage = getCurrentPage();

  const getPageTitle = (page: NavigationPage) => {
    switch (page) {
      case 'dashboard': return 'Dashboard';
      case 'items': return 'My Items';
      case 'orders': return 'Orders';
      case 'deliveries': return 'Deliveries';
      case 'analytics': return 'Analytics';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  const getPageSubtitle = (page: NavigationPage) => {
    switch (page) {
      case 'dashboard': return "Welcome back! Here's an overview of your artisan business.";
      case 'items': return 'Manage your handcrafted items and inventory';
      case 'orders': return 'Manage and track all your customer orders';
      case 'deliveries': return 'Track and manage all your delivery shipments';
      case 'analytics': return 'Detailed insights into your artisan business performance';
      case 'settings': return 'Manage your account and business preferences';
      default: return "Welcome back! Here's an overview of your artisan business.";
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
            <Route path="dashboard" element={<Navigate to="/artisan" replace />} />
            <Route path="items" element={<MyItems />} />
            <Route path="orders" element={<Orders />} />
            <Route path="deliveries" element={<Deliveries />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/artisan" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default ArtisanDashboard;
