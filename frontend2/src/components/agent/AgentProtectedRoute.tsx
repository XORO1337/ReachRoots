import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAgentAuth } from '../../contexts/AgentAuthContext';
import { Loader2 } from 'lucide-react';

interface AgentProtectedRouteProps {
  children: React.ReactNode;
}

const AgentProtectedRoute: React.FC<AgentProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAgentAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to agent login with return URL
    return <Navigate to="/agent/login" state={{ from: location }} replace />;
  }

  // Verify user is actually a shipping agent
  if (user?.role !== 'shipping_agent') {
    return <Navigate to="/agent/login" replace />;
  }

  return <>{children}</>;
};

export default AgentProtectedRoute;
