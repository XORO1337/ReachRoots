import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CartItem, Product } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getCartItemsCount: () => number;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user, isAuthenticated } = useAuth();

  // Get cart key based on user authentication status
  const getCartKey = () => {
    if (isAuthenticated && user?.id) {
      return `rootsreach_cart_${user.id}`;
    }
    return 'rootsreach_cart_guest';
  };

  // Load cart from localStorage on component mount or when user changes
  useEffect(() => {
    const cartKey = getCartKey();
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        const prevCartLength = cartItems.length;
        setCartItems(parsedCart);
        
        // Show toast when user logs in and has saved items
        if (isAuthenticated && user?.id && parsedCart.length > 0 && prevCartLength === 0) {
          toast.success(`Welcome back! ${parsedCart.length} item${parsedCart.length > 1 ? 's' : ''} restored to your cart`, {
            icon: '🛒',
            duration: 3000
          });
        }
      } catch (error) {
        console.error('Error parsing saved cart:', error);
        localStorage.removeItem(cartKey);
      }
    } else {
      // If switching from guest to user or vice versa, clear current cart
      setCartItems([]);
    }
  }, [user?.id, isAuthenticated]);

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    const cartKey = getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(cartItems));
  }, [cartItems, user?.id, isAuthenticated]);

  const addToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { product, quantity: product.minOrder || 1 }];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Transfer guest cart to user cart when user logs in
  const transferGuestCart = () => {
    const guestCartKey = 'rootsreach_cart_guest';
    const guestCart = localStorage.getItem(guestCartKey);
    
    if (guestCart && isAuthenticated && user?.id) {
      try {
        const parsedGuestCart = JSON.parse(guestCart);
        if (parsedGuestCart.length > 0) {
          const userCartKey = `rootsreach_cart_${user.id}`;
          const existingUserCart = localStorage.getItem(userCartKey);
          
          if (existingUserCart) {
            // Merge guest cart with existing user cart
            const existingCart = JSON.parse(existingUserCart);
            const mergedCart = [...existingCart];
            
            parsedGuestCart.forEach((guestItem: CartItem) => {
              const existingItemIndex = mergedCart.findIndex((item: CartItem) => item.product.id === guestItem.product.id);
              if (existingItemIndex >= 0) {
                // Update quantity if item already exists
                mergedCart[existingItemIndex].quantity += guestItem.quantity;
              } else {
                // Add new item
                mergedCart.push(guestItem);
              }
            });
            
            setCartItems(mergedCart);
            localStorage.setItem(userCartKey, JSON.stringify(mergedCart));
            toast.success(`${parsedGuestCart.length} item${parsedGuestCart.length > 1 ? 's' : ''} from your session added to your cart!`, {
              icon: '🛒',
              duration: 3000
            });
          } else {
            // No existing user cart, just transfer guest cart
            setCartItems(parsedGuestCart);
            localStorage.setItem(userCartKey, JSON.stringify(parsedGuestCart));
          }
          
          // Clear guest cart
          localStorage.removeItem(guestCartKey);
        }
      } catch (error) {
        console.error('Error transferring guest cart:', error);
      }
    }
  };

  // Call transfer when user authentication status changes from false to true
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      transferGuestCart();
    }
  }, [isAuthenticated, user?.id]);

  const getCartItemsCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    getCartItemsCount,
    getCartTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
