import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      case 'dashboard': return t('distributorDashboard.dashboardOverview');
      case 'products': return t('distributorDashboard.productManagement');
      case 'inventory': return t('distributorDashboard.inventoryTracking');
      case 'orders': return t('distributorDashboard.orderManagement');
      case 'analytics': return t('distributorDashboard.performanceAnalytics');
      case 'communications': return t('distributorDashboard.communicationHub');
      default: return t('distributorDashboard.dashboardOverview');
    }
  };

  const getPageSubtitle = (page: NavigationPage) => {
    switch (page) {
      case 'dashboard': return t('distributorDashboard.dashboardSubtitle');
      case 'products': return t('distributorDashboard.productsSubtitle');
      case 'inventory': return t('distributorDashboard.inventorySubtitle');
      case 'orders': return t('distributorDashboard.ordersSubtitle');
      case 'analytics': return t('distributorDashboard.analyticsSubtitle');
      case 'communications': return t('distributorDashboard.communicationsSubtitle');
      default: return t('distributorDashboard.dashboardSubtitle');
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
