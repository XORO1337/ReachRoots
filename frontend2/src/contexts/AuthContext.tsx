import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import React from 'react';
import { api } from '../utils/api';

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
    api.defaults.withCredentials = true;

    const initializeAuth = async () => {
      await checkAuthStatus();
      setIsInitialized(true);
    };

    initializeAuth();
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
        // Ensure API requests include token header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const response = await api.get('/api/auth/profile');
        console.log('🔍 AuthContext Debug - Profile response:', response.data);
        
        if (response.data.success && response.data.data) {
          const backendUserData = response.data.data;
          const userData: User = {
            id: backendUserData.id,
            name: backendUserData.name,
            email: backendUserData.email,
            role: backendUserData.role,
            phone: backendUserData.phone,
            photoURL: backendUserData.photoURL || undefined,
            location: backendUserData.location || undefined,
            bio: backendUserData.bio || undefined,
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
          } else {
            localStorage.removeItem('userPhoto');
          }
          if (userData.location) {
            localStorage.setItem('userLocation', userData.location);
          } else {
            localStorage.removeItem('userLocation');
          }
          if (userData.bio) {
            localStorage.setItem('userBio', userData.bio);
          } else {
            localStorage.removeItem('userBio');
          }
        } else {
          console.log('🔍 AuthContext Debug - Invalid response from backend');
          throw new Error('Invalid token response');
        }
      } catch (tokenError) {
        const err: any = tokenError;
        console.warn('🔍 AuthContext Debug - Token validation failed:', err?.message || err);
        
        // If it's a network error and we have localStorage data, try to use it temporarily
        if (err?.code === 'NETWORK_ERROR' || err?.code === 'ERR_NETWORK') {
          const userRole = localStorage.getItem('userRole') as User['role'];
          const userName = localStorage.getItem('userName');
          const userEmail = localStorage.getItem('userEmail');
          const userId = localStorage.getItem('userId');
          const userPhoto = localStorage.getItem('userPhoto');
          const userLocation = localStorage.getItem('userLocation');
          const userBio = localStorage.getItem('userBio');

          if (userRole && userName && userEmail && userId) {
            console.log('🔍 AuthContext Debug - Using localStorage data due to network error, role:', userRole);
            const userData: User = {
              id: userId,
              name: userName,
              email: userEmail,
              role: userRole,
              photoURL: userPhoto || undefined,
              location: userLocation || undefined,
              bio: userBio || undefined,
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
    } else {
      localStorage.removeItem('userPhoto');
    }
    if (userData.location) {
      localStorage.setItem('userLocation', userData.location);
    } else {
      localStorage.removeItem('userLocation');
    }
    if (userData.bio) {
      localStorage.setItem('userBio', userData.bio);
    } else {
      localStorage.removeItem('userBio');
    }
    
    // Set token in shared API instance (synchronous)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Update state (synchronous)
    setUser(userData);
    
    console.log('🔍 AuthContext Debug - Data stored in localStorage');
    console.log('🔍 AuthContext Debug - Stored role:', localStorage.getItem('userRole'));
    console.log('🔍 AuthContext Debug - Auth state updated');
    console.log('🔍 AuthContext Debug - API headers updated');
  };

  const logout = async () => {
    try {
      console.log('🔍 AuthContext Debug - Logging out');
      
      // Temporarily disable the response interceptor to prevent infinite loops
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        try {
          // Call backend logout endpoint
          await api.post('/api/auth/logout', {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('🔍 AuthContext Debug - Backend logout successful');
        } catch (logoutError) {
          console.warn('🔍 AuthContext Debug - Backend logout failed:', (logoutError as any)?.message || logoutError);
          // Continue with frontend cleanup even if backend logout fails
        }
      }
      
      // Clear API default header
      delete api.defaults.headers.common['Authorization'];
      
      // Clear state
      setUser(null);

      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      localStorage.removeItem('userPhoto');
        localStorage.removeItem('userLocation');
        localStorage.removeItem('userBio');
      
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
    if (userData.photoURL) {
      localStorage.setItem('userPhoto', userData.photoURL);
    } else if (userData.photoURL === null) {
      localStorage.removeItem('userPhoto');
    }
    if (typeof userData.location !== 'undefined') {
      if (userData.location) {
        localStorage.setItem('userLocation', userData.location);
      } else {
        localStorage.removeItem('userLocation');
      }
    }
    if (typeof userData.bio !== 'undefined') {
      if (userData.bio) {
        localStorage.setItem('userBio', userData.bio);
      } else {
        localStorage.removeItem('userBio');
      }
    }
  };

  const updateUserData = (updatedUser: User) => {
    setUser(updatedUser);
    
    // Update localStorage
    localStorage.setItem('userName', updatedUser.name);
    localStorage.setItem('userEmail', updatedUser.email);
    if (updatedUser.photoURL) {
      localStorage.setItem('userPhoto', updatedUser.photoURL);
    } else {
      localStorage.removeItem('userPhoto');
    }
    if (updatedUser.location) {
      localStorage.setItem('userLocation', updatedUser.location);
    } else {
      localStorage.removeItem('userLocation');
    }
    if (updatedUser.bio) {
      localStorage.setItem('userBio', updatedUser.bio);
    } else {
      localStorage.removeItem('userBio');
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