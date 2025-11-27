import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Marketplace from '../pages/Marketplace';
import TopArtisans from '../pages/TopArtisans';
import SearchResults from '../pages/SearchResults';
import WishlistPage from '../pages/WishlistPage';
import ArtisanDashboard from '../features/artisan-dashboard';
import ShippingAgentDashboard from '../features/shipping-agent-dashboard';
import AgentLogin from '../features/shipping-agent-dashboard/pages/AgentLogin';
import NotFound from '../pages/NotFound';
import { Login, Signup, OAuthCallback } from '../pages/auth';
import { PartnerWithUs, ApplicationStatus } from '../pages/public';
import { 
  AdminSignIn, 
  AdminDashboard, 
  UserManagement, 
  Notifications, 
  Analytics, 
  Settings, 
  ActivityLogs,
  OrderManagement,
  AgentManagement,
  PickupRequests,
  AgentApplications
} from '../pages/admin';
import DistributorDashboard from '../features/distributor-dashboard';
import AdminLayout from '../components/admin/AdminLayout';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { AgentProtectedRoute } from '../components/agent';
import AuthDebugPanel from '../components/auth/AuthDebugPanel';
import { AdminAuthProvider, AgentAuthProvider } from '../contexts';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { WishlistProvider } from '../contexts/WishlistContext';


const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AdminAuthProvider>
            <AgentAuthProvider>
            <Router>
            <Routes>
            
            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/agent/login" element={<AgentLogin />} />
            
            {/* Public Partner/Agent Recruitment Routes */}
            <Route path="/partner-with-us" element={<PartnerWithUs />} />
            <Route path="/application-status" element={<ApplicationStatus />} />
            
            {/* Admin Routes */}
            <Route path="/admin/signin" element={<AdminSignIn />} />
            <Route 
              path="/admin/*" 
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="pickup-requests" element={<PickupRequests />} />
              <Route path="agents" element={<AgentManagement />} />
              <Route path="applications" element={<AgentApplications />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="activity" element={<ActivityLogs />} />
              <Route path="settings" element={<Settings />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>
            
            {/* Marketplace Routes */}
            <Route path="/" element={<Marketplace />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/wishlist" element={
              <ProtectedRoute allowedRoles={['customer', 'artisan', 'distributor']} redirectTo="/login">
                <WishlistPage />
              </ProtectedRoute>
            } />
            <Route path="/marketplace" element={<Navigate to="/" replace />} />
            <Route path="/artisans/top" element={<TopArtisans />} />
            
            {/* Artisan Dashboard Routes */}
            <Route path="/artisan/*" element={
              <ProtectedRoute allowedRoles={['artisan']} redirectTo="/login">
                <ArtisanDashboard />
              </ProtectedRoute>
            } />
            
            {/* Distributor Dashboard Routes */}
            <Route path="/distributor/*" element={
              <ProtectedRoute allowedRoles={['distributor']}>
                <DistributorDashboard />
              </ProtectedRoute>
            } />

            {/* Shipping Agent Dashboard Routes */}
            <Route path="/agent/*" element={
              <AgentProtectedRoute>
                <ShippingAgentDashboard />
              </AgentProtectedRoute>
            } />
            
            {/* Fallback Routes */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
          <AuthDebugPanel />
        </Router>
      </AgentAuthProvider>
      </AdminAuthProvider>
      </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default AppRouter;
