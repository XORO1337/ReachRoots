import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { API_CONFIG } from '../config/api';

interface AgentUser {
  id: string;
  name: string;
  email: string;
  role: 'shipping_agent';
  agentProfile?: {
    isActive: boolean;
    rating: number;
    totalDeliveries: number;
    walletBalance: number;
  };
}

interface AgentAuthContextType {
  user: AgentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AgentAuthContext = createContext<AgentAuthContextType | undefined>(undefined);

const AGENT_TOKEN_KEY = 'agentToken';
const AGENT_USER_KEY = 'agentUser';
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours

export const AgentAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AgentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem(AGENT_TOKEN_KEY);
        const storedUser = localStorage.getItem(AGENT_USER_KEY);
        const storedActivity = localStorage.getItem('agentLastActivity');

        if (!token || !storedUser) {
          setIsLoading(false);
          return;
        }

        // Check session timeout
        if (storedActivity) {
          const lastActivityTime = parseInt(storedActivity, 10);
          if (Date.now() - lastActivityTime > SESSION_TIMEOUT) {
            // Session expired
            logout();
            setIsLoading(false);
            return;
          }
        }

        // Validate token with backend
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Handle different response structures: data.data.user or data.data or data.user
          const userData = data.data?.user || data.data || data.user || data;
          
          if (data.success && userData?.role === 'shipping_agent') {
            setUser({
              id: userData._id || userData.id,
              name: userData.name,
              email: userData.email,
              role: 'shipping_agent',
              agentProfile: userData.agentProfile,
            });
            updateActivity();
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch (error) {
        console.error('Agent auth check failed:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Activity tracking for session timeout
  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
      localStorage.setItem('agentLastActivity', Date.now().toString());
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, []);

  // Session timeout check
  useEffect(() => {
    const checkSessionTimeout = setInterval(() => {
      if (user && Date.now() - lastActivity > SESSION_TIMEOUT) {
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkSessionTimeout);
  }, [user, lastActivity]);

  const updateActivity = () => {
    setLastActivity(Date.now());
    localStorage.setItem('agentLastActivity', Date.now().toString());
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          message: data.message || 'Login failed' 
        };
      }

      if (!data.success) {
        return { 
          success: false, 
          message: data.message || 'Login failed' 
        };
      }

      // Verify user is a shipping agent
      if (data.data.user.role !== 'shipping_agent') {
        return { 
          success: false, 
          message: 'Access denied. Shipping agent account required.' 
        };
      }

      // Check if agent profile is active
      if (data.data.user.agentProfile && !data.data.user.agentProfile.isActive) {
        return { 
          success: false, 
          message: 'Your agent account is currently inactive. Please contact support.' 
        };
      }

      // Store credentials
      localStorage.setItem(AGENT_TOKEN_KEY, data.data.accessToken);
      localStorage.setItem(AGENT_USER_KEY, JSON.stringify(data.data.user));
      updateActivity();

      setUser({
        id: data.data.user._id,
        name: data.data.user.name,
        email: data.data.user.email,
        role: 'shipping_agent',
        agentProfile: data.data.user.agentProfile,
      });

      return { success: true, message: 'Login successful' };
    } catch (error) {
      console.error('Agent login error:', error);
      return { 
        success: false, 
        message: 'An error occurred during login. Please try again.' 
      };
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem(AGENT_TOKEN_KEY);
    localStorage.removeItem(AGENT_USER_KEY);
    localStorage.removeItem('agentLastActivity');
    setUser(null);
  }, []);

  const refreshProfile = async () => {
    const token = localStorage.getItem(AGENT_TOKEN_KEY);
    if (!token) return;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Handle different response structures
        const userData = data.data?.user || data.data || data.user || data;
        
        if (data.success && userData) {
          setUser(prev => prev ? {
            ...prev,
            agentProfile: userData.agentProfile,
          } : null);
          localStorage.setItem(AGENT_USER_KEY, JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.error('Failed to refresh agent profile:', error);
    }
  };

  const value: AgentAuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshProfile,
  };

  return (
    <AgentAuthContext.Provider value={value}>
      {children}
    </AgentAuthContext.Provider>
  );
};

export const useAgentAuth = (): AgentAuthContextType => {
  const context = useContext(AgentAuthContext);
  if (!context) {
    throw new Error('useAgentAuth must be used within an AgentAuthProvider');
  }
  return context;
};

export default AgentAuthContext;
