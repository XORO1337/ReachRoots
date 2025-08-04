import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('customer' | 'artisan' | 'distributor' | 'admin')[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  redirectTo = '/login' 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log('🔍 ProtectedRoute Debug - Auth State:');
  console.log('- isLoading:', isLoading);
  console.log('- isAuthenticated:', isAuthenticated);
  console.log('- user:', user);
  console.log('- allowedRoles:', allowedRoles);
  console.log('- current path:', location.pathname);

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log('🔍 ProtectedRoute Debug - Still loading, showing spinner');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log('🔍 ProtectedRoute Debug - Not authenticated, redirecting to login');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('🔍 ProtectedRoute Debug - Role access denied');
    console.log('- User role:', user.role);
    console.log('- Allowed roles:', allowedRoles);
    
    // Redirect to appropriate dashboard based on user's actual role
    const roleBasedRedirect = {
      customer: '/',
      artisan: '/artisan',
      distributor: '/distributor',
      admin: '/admin'
    };
    
    const redirectPath = roleBasedRedirect[user.role] || '/';
    console.log('🔍 ProtectedRoute Debug - Redirecting to:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  console.log('🔍 ProtectedRoute Debug - Access granted');
  console.log('- User role:', user.role);
  console.log('- Allowed roles:', allowedRoles);
  
  return <>{children}</>;
};

export default ProtectedRoute;
