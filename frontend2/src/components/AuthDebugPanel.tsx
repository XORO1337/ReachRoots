import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthDebugPanel: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Get localStorage data
  const localStorageData = {
    accessToken: localStorage.getItem('accessToken') ? 'Present' : 'Missing',
    userRole: localStorage.getItem('userRole'),
    userName: localStorage.getItem('userName'),
    userEmail: localStorage.getItem('userEmail'),
    userId: localStorage.getItem('userId'),
  };

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">🔍 Auth Debug</h3>
      
      <div className="mb-2">
        <strong>Auth State:</strong>
        <div>isLoading: {isLoading ? 'true' : 'false'}</div>
        <div>isAuthenticated: {isAuthenticated ? 'true' : 'false'}</div>
        <div>user: {user ? 'Present' : 'Null'}</div>
        {user && <div>user.role: {user.role}</div>}
      </div>

      <div className="mb-2">
        <strong>localStorage:</strong>
        <div>token: {localStorageData.accessToken}</div>
        <div>role: {localStorageData.userRole || 'Missing'}</div>
        <div>name: {localStorageData.userName || 'Missing'}</div>
        <div>email: {localStorageData.userEmail || 'Missing'}</div>
        <div>userId: {localStorageData.userId || 'Missing'}</div>
      </div>

      <div>
        <strong>Current Path:</strong>
        <div>{window.location.pathname}</div>
      </div>
    </div>
  );
};

export default AuthDebugPanel;
