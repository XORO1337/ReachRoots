import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Marketplace from '../pages/Marketplace';
import SearchResults from '../pages/SearchResults';
import WishlistPage from '../pages/WishlistPage';
import ArtisanDashboard from '../features/artisan-dashboard';
import NotFound from '../pages/NotFound';
import { Login, Signup, OAuthCallback } from '../pages/auth';
import { AdminSignIn, AdminDashboard, UserManagement, Notifications, Analytics, Settings, ActivityLogs } from '../pages/admin';
import DistributorDashboard from '../features/distributor-dashboard';
import AdminLayout from '../components/AdminLayout';
import AdminProtectedRoute from '../components/AdminProtectedRoute';
import ProtectedRoute from '../components/ProtectedRoute';
import AuthDebugPanel from '../components/AuthDebugPanel';
import { AdminAuthProvider } from '../contexts';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { WishlistProvider } from '../contexts/WishlistContext';


const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AdminAuthProvider>
            <Router>
            <Routes>
            
            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            
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
      </AdminAuthProvider>
      </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default AppRouter;
