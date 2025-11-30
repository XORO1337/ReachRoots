<<<<<<< HEAD
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
=======
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { API_CONFIG } from '../config/api';
>>>>>>> fixed-repo/main

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

interface AdminAuthProviderProps {
  children: ReactNode;
}

<<<<<<< HEAD
export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
=======
// Session timeout: 30 minutes of inactivity
const SESSION_TIMEOUT = 30 * 60 * 1000;
const ADMIN_TOKEN_KEY = 'adminToken';
const ADMIN_LAST_ACTIVITY_KEY = 'adminLastActivity';

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
    setUser(null);
  }, []);

  const updateActivity = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);
    localStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, now.toString());
  }, []);
>>>>>>> fixed-repo/main

  useEffect(() => {
    // Check if user is already authenticated on app load
    checkAuthStatus();
  }, []);

<<<<<<< HEAD
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        // Verify token with backend
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.success && userData.data.role === 'admin') {
            setUser({
              id: userData.data._id,
              name: userData.data.name,
              email: userData.data.email,
              role: userData.data.role
            });
          } else {
            localStorage.removeItem('adminToken');
          }
        } else {
          localStorage.removeItem('adminToken');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('adminToken');
=======
  // Activity tracking for session timeout
  useEffect(() => {
    if (!user) return;

    const handleActivity = () => {
      updateActivity();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [user, updateActivity]);

  // Session timeout check
  useEffect(() => {
    if (!user) return;

    const checkSessionTimeout = setInterval(() => {
      const storedLastActivity = localStorage.getItem(ADMIN_LAST_ACTIVITY_KEY);
      const lastActivityTime = storedLastActivity ? parseInt(storedLastActivity, 10) : lastActivity;
      
      if (Date.now() - lastActivityTime > SESSION_TIMEOUT) {
        console.log('Admin session timed out due to inactivity');
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkSessionTimeout);
  }, [user, lastActivity, logout]);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      const storedLastActivity = localStorage.getItem(ADMIN_LAST_ACTIVITY_KEY);
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Check session timeout
      if (storedLastActivity) {
        const lastActivityTime = parseInt(storedLastActivity, 10);
        if (Date.now() - lastActivityTime > SESSION_TIMEOUT) {
          // Session expired
          logout();
          setIsLoading(false);
          return;
        }
      }

      // Verify token with backend
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.success && userData.data.role === 'admin') {
          setUser({
            id: userData.data._id,
            name: userData.data.name,
            email: userData.data.email,
            role: userData.data.role
          });
          updateActivity();
        } else {
          logout();
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
>>>>>>> fixed-repo/main
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
<<<<<<< HEAD
      const response = await fetch('/api/auth/login', {
=======
      console.log('Attempting admin login to:', `${API_CONFIG.BASE_URL}/api/auth/admin/login`);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/admin/login`, {
>>>>>>> fixed-repo/main
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Check if user is admin
        if (data.data.user.role !== 'admin') {
          throw new Error('Access denied. Admin privileges required.');
        }

<<<<<<< HEAD
        localStorage.setItem('adminToken', data.data.accessToken);
=======
        localStorage.setItem(ADMIN_TOKEN_KEY, data.data.accessToken);
        updateActivity();
>>>>>>> fixed-repo/main
        setUser({
          id: data.data.user._id,
          name: data.data.user.name,
          email: data.data.user.email,
          role: data.data.user.role
        });
        return true;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

<<<<<<< HEAD
  const logout = () => {
    localStorage.removeItem('adminToken');
    setUser(null);
  };

=======
>>>>>>> fixed-repo/main
  const value: AdminAuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
