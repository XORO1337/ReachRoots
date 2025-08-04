import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardOverview from './DashboardOverview';
import MyItems from './MyItems';
import Orders from './Orders';
import Deliveries from './Deliveries';
import Analytics from './Analytics';
import Settings from './Settings';
import { NavigationPage } from '../types/dashboard';
import { dashboardStats, inventoryItems, orders, deliveries, analytics } from '../data/dashboardData';

const ArtisanDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');

  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardOverview stats={dashboardStats} />;
      case 'items':
        return <MyItems items={inventoryItems} />;
      case 'orders':
        return <Orders orders={orders} />;
      case 'deliveries':
        return <Deliveries deliveries={deliveries} />;
      case 'analytics':
        return <Analytics analytics={analytics} />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardOverview stats={dashboardStats} />;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard';
      case 'items':
        return 'My Items';
      case 'orders':
        return 'Orders';
      case 'deliveries':
        return 'Deliveries';
      case 'analytics':
        return 'Analytics';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  const getPageSubtitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return "Welcome back! Here's an overview of your artisan business.";
      case 'items':
        return 'Manage your handcrafted items and inventory';
      case 'orders':
        return 'Manage and track all your customer orders';
      case 'deliveries':
        return 'Track and manage all your delivery shipments';
      case 'analytics':
        return 'Detailed insights into your artisan business performance';
      case 'settings':
        return 'Manage your account and business preferences';
      default:
        return "Welcome back! Here's an overview of your artisan business.";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 ml-64">
        <Header title={getPageTitle()} subtitle={getPageSubtitle()} />
        <main className="overflow-y-auto h-full">
          {renderPageContent()}
        </main>
      </div>
    </div>
  );
};

export default ArtisanDashboard;
