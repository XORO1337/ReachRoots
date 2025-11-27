import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';
import WishlistService, { WishlistItem, WishlistData } from '../services/wishlistService';

export type { WishlistItem, WishlistData };

interface WishlistContextType {
  wishlist: WishlistData | null;
  isLoading: boolean;
  error: string | null;
  addToWishlist: (product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    artisanName?: string;
  }) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlistItem: (product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    artisanName?: string;
  }) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
  getWishlistItemsCount: () => number;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

interface WishlistProviderProps {
  children: React.ReactNode;
}

// Local storage utilities for fallback/caching
const getWishlistKey = (userId: string) => `wishlist_${userId}`;

const loadWishlistFromStorage = (userId: string): WishlistData | null => {
  try {
    const stored = localStorage.getItem(getWishlistKey(userId));
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    if (parsed && parsed.userId === userId && Array.isArray(parsed.items)) {
      return parsed;
    }
    return null;
  } catch (error) {
    console.error('Error loading wishlist from storage:', error);
    return null;
  }
};

const saveWishlistToStorage = (wishlistData: WishlistData) => {
  try {
    localStorage.setItem(getWishlistKey(wishlistData.userId), JSON.stringify(wishlistData));
  } catch (error) {
    console.error('Error saving wishlist to storage:', error);
  }
};

const createEmptyWishlist = (userId: string): WishlistData => ({
  userId,
  items: [],
  totalItems: 0,
  lastUpdated: new Date().toISOString()
});

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Load wishlist from backend when user logs in
  const loadUserWishlist = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to load from backend first
      const backendWishlist = await WishlistService.getWishlist();
      
      if (backendWishlist) {
        // Use backend data
        setWishlist(backendWishlist);
        // Cache locally
        saveWishlistToStorage(backendWishlist);
      } else {
        // Fallback to local storage
        const localWishlist = loadWishlistFromStorage(user.id) || createEmptyWishlist(user.id);
        setWishlist(localWishlist);
      }
    } catch (err) {
      console.error('Error loading wishlist:', err);
      setError('Failed to load wishlist');
      // Fallback to local storage
      const localWishlist = loadWishlistFromStorage(user.id) || createEmptyWishlist(user.id);
      setWishlist(localWishlist);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadUserWishlist();
    } else {
      // Clear wishlist when user logs out
      setWishlist(null);
      setError(null);
    }
  }, [isAuthenticated, user?.id, loadUserWishlist]);

  const updateLocalWishlist = useCallback((updatedWishlist: WishlistData) => {
    updatedWishlist.lastUpdated = new Date().toISOString();
    updatedWishlist.totalItems = updatedWishlist.items.length;
    setWishlist(updatedWishlist);
    saveWishlistToStorage(updatedWishlist);
  }, []);

  const addToWishlist = async (product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    artisanName?: string;
  }) => {
    if (!isAuthenticated || !user?.id) {
      toast.error('Please log in to add items to your wishlist');
      return;
    }

    if (!wishlist) {
      setError('Wishlist not loaded');
      return;
    }

    // Check if item already exists
    if (wishlist.items.some(item => item.productId === product.id)) {
      toast.error('Product is already in your wishlist');
      return;
    }

    try {
      // Try backend first
      const success = await WishlistService.addToWishlist({
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        productImage: product.image,
        productCategory: product.category,
        artisanName: product.artisanName,
      });

      // Update local state regardless
      const newItem: WishlistItem = {
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        productImage: product.image,
        productCategory: product.category,
        artisanName: product.artisanName,
        addedAt: new Date().toISOString()
      };

      const updatedWishlist = {
        ...wishlist,
        items: [...wishlist.items, newItem]
      };

      updateLocalWishlist(updatedWishlist);

      if (!success) {
        console.warn('Backend sync failed, using local storage only');
      }
      
      toast.success('Added to wishlist!', {
        icon: '❤️',
        duration: 2000
      });
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      toast.error('Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!isAuthenticated || !user?.id || !wishlist) {
      return;
    }

    try {
      // Try backend first
      const success = await WishlistService.removeFromWishlist(productId);

      // Update local state regardless
      const updatedWishlist = {
        ...wishlist,
        items: wishlist.items.filter(item => item.productId !== productId)
      };

      updateLocalWishlist(updatedWishlist);

      if (!success) {
        console.warn('Backend sync failed, using local storage only');
      }
      
      toast.success('Removed from wishlist', {
        icon: '💔',
        duration: 2000
      });
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      toast.error('Failed to remove from wishlist');
    }
  };

  const toggleWishlistItem = async (product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    artisanName?: string;
  }): Promise<boolean> => {
    if (!isAuthenticated || !user?.id) {
      toast.error('Please log in to manage your wishlist');
      return false;
    }

    if (!wishlist) {
      setError('Wishlist not loaded');
      return false;
    }

    try {
      const isCurrentlyInWishlist = wishlist.items.some(item => item.productId === product.id);
      
      if (isCurrentlyInWishlist) {
        await removeFromWishlist(product.id);
        return false;
      } else {
        await addToWishlist(product);
        return true;
      }
    } catch (err) {
      console.error('Error toggling wishlist item:', err);
      toast.error('Failed to update wishlist');
      return false;
    }
  };

  const isInWishlist = (productId: string): boolean => {
    if (!wishlist || !wishlist.items) {
      return false;
    }
    return wishlist.items.some(item => item.productId === productId);
  };

  const clearWishlist = async () => {
    if (!isAuthenticated || !user?.id || !wishlist) {
      return;
    }

    try {
      // Try backend first
      const success = await WishlistService.clearWishlist();

      // Update local state regardless
      const emptyWishlist = createEmptyWishlist(user.id);
      updateLocalWishlist(emptyWishlist);

      if (!success) {
        console.warn('Backend sync failed, using local storage only');
      }
      
      toast.success('Wishlist cleared');
    } catch (err) {
      console.error('Error clearing wishlist:', err);
      toast.error('Failed to clear wishlist');
    }
  };

  const getWishlistItemsCount = (): number => {
    return wishlist?.totalItems || 0;
  };

  const refreshWishlist = async () => {
    await loadUserWishlist();
  };

  const value: WishlistContextType = {
    wishlist,
    isLoading,
    error,
    addToWishlist,
    removeFromWishlist,
    toggleWishlistItem,
    isInWishlist,
    clearWishlist,
    getWishlistItemsCount,
    refreshWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
