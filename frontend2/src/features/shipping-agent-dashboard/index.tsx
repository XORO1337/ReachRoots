import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ShippingAgentLayout from './components/ShippingAgentLayout';
import DashboardOverview from './pages/DashboardOverview';
import PendingOpportunities from './pages/PendingOpportunities';
import ActiveDeliveries from './pages/ActiveDeliveries';
import Earnings from './pages/Earnings';
import AgentProfile from './pages/AgentProfile';

const ShippingAgentDashboard: React.FC = () => {
  return (
    <ShippingAgentLayout>
      <Routes>
        <Route path="/" element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<DashboardOverview />} />
        <Route path="opportunities" element={<PendingOpportunities />} />
        <Route path="deliveries" element={<ActiveDeliveries />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="profile" element={<AgentProfile />} />
      </Routes>
    </ShippingAgentLayout>
  );
};

export default ShippingAgentDashboard;
