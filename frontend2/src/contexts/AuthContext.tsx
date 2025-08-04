import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import React from 'react';
import axios from 'axios';

// User type definition
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'artisan' | 'distributor' | 'admin';
  photoURL?: string;
  phone?: string;
  location?: string;
  bio?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isIdentityVerified: boolean;
}

// AuthContext type definition
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  updateUserData: (updatedUser: User) => void;
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component props type
interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Set up axios base URL and interceptors first
    axios.defaults.baseURL = window.location.origin;
    axios.defaults.withCredentials = true;
    
    // Clear any existing interceptors to prevent duplicates
    axios.interceptors.request.clear();
    axios.interceptors.response.clear();
    
    // Request interceptor to always include token
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token expiration
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && isInitialized) {
          console.log('🔍 AuthContext Debug - Token expired, logging out');
          await logout();
        }
        return Promise.reject(error);
      }
    );

    // Initialize auth status
    const initializeAuth = async () => {
      await checkAuthStatus();
      setIsInitialized(true);
    };
    
    initializeAuth();

    // Cleanup interceptors on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 AuthContext Debug - Checking auth status');
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        console.log('🔍 AuthContext Debug - No token found');
        setIsLoading(false);
        return;
      }

      console.log('🔍 AuthContext Debug - Token found, validating with backend');
      
      try {
        // Set up token in axios headers before making request
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const response = await axios.get('/api/auth/profile');
        console.log('🔍 AuthContext Debug - Profile response:', response.data);
        
        if (response.data.success && response.data.data) {
          const backendUserData = response.data.data;
          const userData: User = {
            id: backendUserData.id,
            name: backendUserData.name,
            email: backendUserData.email,
            role: backendUserData.role,
            phone: backendUserData.phone,
            photoURL: backendUserData.photoURL,
            isEmailVerified: backendUserData.isEmailVerified || false,
            isPhoneVerified: backendUserData.isPhoneVerified || false,
            isIdentityVerified: backendUserData.isIdentityVerified || false
          };
          
          console.log('🔍 AuthContext Debug - Setting user with role:', userData.role);
          setUser(userData);
          
          // Update localStorage with fresh data
          localStorage.setItem('userRole', userData.role);
          localStorage.setItem('userName', userData.name);
          localStorage.setItem('userEmail', userData.email);
          localStorage.setItem('userId', userData.id);
          if (userData.photoURL) {
            localStorage.setItem('userPhoto', userData.photoURL);
          }
        } else {
          console.log('🔍 AuthContext Debug - Invalid response from backend');
          throw new Error('Invalid token response');
        }
      } catch (tokenError) {
        console.warn('🔍 AuthContext Debug - Token validation failed:', tokenError.message);
        
        // If it's a network error and we have localStorage data, try to use it temporarily
        if (tokenError.code === 'NETWORK_ERROR' || tokenError.code === 'ERR_NETWORK') {
          const userRole = localStorage.getItem('userRole') as User['role'];
          const userName = localStorage.getItem('userName');
          const userEmail = localStorage.getItem('userEmail');
          const userId = localStorage.getItem('userId');
          const userPhoto = localStorage.getItem('userPhoto');

          if (userRole && userName && userEmail && userId) {
            console.log('🔍 AuthContext Debug - Using localStorage data due to network error, role:', userRole);
            const userData: User = {
              id: userId,
              name: userName,
              email: userEmail,
              role: userRole,
              photoURL: userPhoto || undefined,
              isEmailVerified: true,
              isPhoneVerified: false,
              isIdentityVerified: false
            };
            setUser(userData);
          } else {
            console.log('🔍 AuthContext Debug - No valid localStorage data, logging out');
            await logout();
          }
        } else {
          console.log('🔍 AuthContext Debug - Token invalid, logging out');
          await logout();
        }
      }
    } catch (error) {
      console.error('🔍 AuthContext Debug - Error checking auth status:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User, token: string) => {
    console.log('🔍 AuthContext Debug - Login called with userData:', userData);
    console.log('🔍 AuthContext Debug - User role:', userData.role);
    console.log('🔍 AuthContext Debug - Token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.error('🔍 AuthContext Debug - No token provided to login function');
      return;
    }
    
    // Store in localStorage first (synchronous)
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('userName', userData.name);
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('userId', userData.id);
    if (userData.photoURL) {
      localStorage.setItem('userPhoto', userData.photoURL);
    }
    
    // Set token in axios defaults (synchronous)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Update state (synchronous)
    setUser(userData);
    
    console.log('🔍 AuthContext Debug - Data stored in localStorage');
    console.log('🔍 AuthContext Debug - Stored role:', localStorage.getItem('userRole'));
    console.log('🔍 AuthContext Debug - Auth state updated');
    console.log('🔍 AuthContext Debug - Axios headers updated');
  };

  const logout = async () => {
    try {
      console.log('🔍 AuthContext Debug - Logging out');
      
      // Temporarily disable the response interceptor to prevent infinite loops
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        try {
          // Call backend logout endpoint
          await axios.post('/api/auth/logout', {}, {
            headers: { Authorization: `Bearer ${token}` },
            // Skip interceptors for this request
            transformRequest: [(data, headers) => {
              delete headers.common?.Authorization;
              headers.Authorization = `Bearer ${token}`;
              return data;
            }]
          });
          console.log('🔍 AuthContext Debug - Backend logout successful');
        } catch (logoutError) {
          console.warn('🔍 AuthContext Debug - Backend logout failed:', (logoutError as any)?.message || logoutError);
          // Continue with frontend cleanup even if backend logout fails
        }
      }
      
      // Clear axios default header
      delete axios.defaults.headers.common['Authorization'];
      
      // Clear state
      setUser(null);

      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      localStorage.removeItem('userPhoto');
      
      // Clear any sessionStorage items
      sessionStorage.removeItem('selectedRole');
      
      console.log('🔍 AuthContext Debug - Logout completed');
    } catch (error) {
      console.error('🔍 AuthContext Debug - Error during logout:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);

    // Update localStorage with new values
    if (userData.name) localStorage.setItem('userName', userData.name);
    if (userData.email) localStorage.setItem('userEmail', userData.email);
    if (userData.photoURL) localStorage.setItem('userPhoto', userData.photoURL);
  };

  const updateUserData = (updatedUser: User) => {
    setUser(updatedUser);
    
    // Update localStorage
    localStorage.setItem('userName', updatedUser.name);
    localStorage.setItem('userEmail', updatedUser.email);
    if (updatedUser.photoURL) {
      localStorage.setItem('userPhoto', updatedUser.photoURL);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading || !isInitialized,
    login,
    logout,
    updateUser,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;