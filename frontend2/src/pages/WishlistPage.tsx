import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Package, Star, MapPin } from 'lucide-react';
<<<<<<< HEAD
=======
import { useTranslation } from 'react-i18next';
>>>>>>> fixed-repo/main
import { toast } from 'react-hot-toast';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Cart from '../components/marketplace/Cart';
import { Product, FilterState } from '../types';
import { useWishlist, WishlistItem } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { redirectToAppRoute } from '../utils/navigation';

const WishlistPage: React.FC = () => {
<<<<<<< HEAD
=======
  const { t } = useTranslation();
>>>>>>> fixed-repo/main
  const { wishlist, isLoading, removeFromWishlist, clearWishlist } = useWishlist();
  const { cartItems, addToCart, updateQuantity, removeItem, getCartItemsCount } = useCart();
  const { isAuthenticated } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Default filter state for header
  const [filters] = useState<FilterState>({
    category: '',
    location: '',
    priceRange: [0, 5000],
    craftType: '',
    search: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      redirectToAppRoute('/login');
    }
  }, [isAuthenticated]);

  // Convert wishlist item to Product type for cart
  const convertWishlistItemToProduct = (item: WishlistItem): Product => {
    return {
      id: item.productId,
      name: item.productName,
      price: item.productPrice,
      weightUnit: 'g', // Default since not stored in local storage
      image: item.productImage || '/api/placeholder/300/300',
      category: item.productCategory || 'Product',
      description: '', // Not stored in local storage for simplicity
      materials: [],
      craftType: item.productCategory,
      rating: 4.5,
      reviews: 12,
      inStock: true, // Assume in stock since we don't store stock info
      minOrder: 1,
      seller: {
        id: 'local-artisan',
        name: item.artisanName || 'RootsReach Artisan',
        city: 'India',
        state: 'Various',
        avatar: '/api/placeholder/60/60',
        story: '',
        specialties: [item.productCategory || 'Product'],
        rating: 4.5,
        totalProducts: 0,
        yearsOfExperience: 5
      }
    };
  };

  const handleAddToCart = async (item: WishlistItem) => {
    try {
      const product = convertWishlistItemToProduct(item);
      addToCart(product);
<<<<<<< HEAD
      toast.success(`${item.productName} added to cart!`, {
=======
      toast.success(t('wishlist.addedToCart', { name: item.productName }), {
>>>>>>> fixed-repo/main
        icon: '🛒',
        duration: 2000
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
<<<<<<< HEAD
      toast.error('Failed to add item to cart');
=======
      toast.error(t('wishlist.failedToAddToCart'));
>>>>>>> fixed-repo/main
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleClearWishlist = async () => {
    if (!wishlist || wishlist.items.length === 0) {
      return;
    }

<<<<<<< HEAD
    if (window.confirm(`Are you sure you want to remove all ${wishlist.items.length} items from your wishlist?`)) {
      setIsClearing(true);
      try {
        await clearWishlist();
        toast.success('Wishlist cleared successfully');
      } catch (error) {
        console.error('Error clearing wishlist:', error);
        toast.error('Failed to clear wishlist');
=======
    if (window.confirm(t('wishlist.confirmClearAll', { count: wishlist.items.length }))) {
      setIsClearing(true);
      try {
        await clearWishlist();
        toast.success(t('wishlist.clearedSuccess'));
      } catch (error) {
        console.error('Error clearing wishlist:', error);
        toast.error(t('wishlist.failedToClear'));
>>>>>>> fixed-repo/main
      } finally {
        setIsClearing(false);
      }
    }
  };

  const cartItemsCount = getCartItemsCount();

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartItemsCount={cartItemsCount}
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
        filters={filters}
        onFiltersChange={() => {}}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-orange-600 flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" />
<<<<<<< HEAD
            Back to Marketplace
          </Link>
          <span className="mx-2">/</span>
          <span>My Wishlist</span>
=======
            {t('wishlist.backToMarketplace')}
          </Link>
          <span className="mx-2">/</span>
          <span>{t('wishlist.myWishlist')}</span>
>>>>>>> fixed-repo/main
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Heart className="w-6 h-6 mr-2 text-red-500" />
<<<<<<< HEAD
                My Wishlist
              </h1>
              <p className="text-gray-600 mt-1">
                {isLoading ? 'Loading...' : `${wishlist?.totalItems || 0} items saved for later`}
=======
                {t('wishlist.myWishlist')}
              </h1>
              <p className="text-gray-600 mt-1">
                {isLoading ? t('common.loading') : t('wishlist.itemsSaved', { count: wishlist?.totalItems || 0 })}
>>>>>>> fixed-repo/main
              </p>
            </div>
            
            {wishlist && wishlist.items.length > 0 && (
              <button
                onClick={handleClearWishlist}
                disabled={isClearing}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
<<<<<<< HEAD
                <span>{isClearing ? 'Clearing...' : 'Clear All'}</span>
=======
                <span>{isClearing ? t('wishlist.clearing') : t('wishlist.clearAll')}</span>
>>>>>>> fixed-repo/main
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!wishlist || wishlist.items.length === 0) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
<<<<<<< HEAD
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6">
              Save items you love to your wishlist. They'll appear here so you can easily find them later.
=======
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('wishlist.emptyTitle')}</h3>
            <p className="text-gray-500 mb-6">
              {t('wishlist.emptyDescription')}
>>>>>>> fixed-repo/main
            </p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Package className="w-4 h-4" />
<<<<<<< HEAD
              <span>Start Shopping</span>
=======
              <span>{t('wishlist.startShopping')}</span>
>>>>>>> fixed-repo/main
            </Link>
          </div>
        )}

        {/* Wishlist Items */}
        {!isLoading && wishlist && wishlist.items.length > 0 && (
          <div className="space-y-4">
            {wishlist.items
              .filter(item => item && item.productId) // Filter out any items with missing data
              .map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Product Image */}
                  <div className="relative w-full md:w-48 h-48 flex-shrink-0">
                    <img
                      src={item.productImage || '/api/placeholder/300/300'}
                      alt={item.productName || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        {/* Category */}
                        <span className="inline-block text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium mb-2">
                          {item.productCategory || 'Product'}
                        </span>
                        
                        {/* Product Name */}
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {item.productName}
                        </h3>

                        {/* Description - Simplified for local storage */}
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
<<<<<<< HEAD
                          Handcrafted with care by local artisans
=======
                          {t('wishlist.handcraftedByArtisans')}
>>>>>>> fixed-repo/main
                        </p>

                        {/* Seller Info */}
                        <div className="flex items-center mb-3">
                          <img
                            src="/api/placeholder/40/40"
                            alt={item.artisanName || 'Artisan'}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                          <span className="text-sm text-gray-600">
<<<<<<< HEAD
                            by {item.artisanName || 'RootsReach Artisan'}
=======
                            {t('wishlist.byArtisan', { name: item.artisanName || 'RootsReach Artisan' })}
>>>>>>> fixed-repo/main
                          </span>
                          <div className="flex items-center text-xs text-gray-500 ml-4">
                            <MapPin className="h-3 w-3 mr-1" />
                            India
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 ml-2">
<<<<<<< HEAD
                            4.5 (12 reviews)
=======
                            4.5 ({t('wishlist.reviews', { count: 12 })})
>>>>>>> fixed-repo/main
                          </span>
                        </div>

                        {/* Added Date */}
                        <p className="text-xs text-gray-500">
<<<<<<< HEAD
                          Added on {new Date(item.addedAt).toLocaleDateString()}
=======
                          {t('wishlist.addedOn', { date: new Date(item.addedAt).toLocaleDateString() })}
>>>>>>> fixed-repo/main
                        </p>
                      </div>

                      {/* Price and Actions */}
                      <div className="text-right ml-6">
                        <div className="mb-4">
                          <div className="text-2xl font-bold text-gray-900">
                            ₹{(item.productPrice || 0).toLocaleString()}/
<<<<<<< HEAD
                            <span className="text-sm text-gray-600">unit</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            In Stock
=======
                            <span className="text-sm text-gray-600">{t('wishlist.unit')}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {t('wishlist.inStock')}
>>>>>>> fixed-repo/main
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm flex items-center justify-center"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
<<<<<<< HEAD
                            Add to Cart
=======
                            {t('wishlist.addToCart')}
>>>>>>> fixed-repo/main
                          </button>
                          <button
                            onClick={() => handleRemoveFromWishlist(item.productId)}
                            className="w-full border-2 border-red-300 text-red-600 py-2 px-4 rounded-lg font-semibold hover:bg-red-50 transition-colors text-sm flex items-center justify-center"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
<<<<<<< HEAD
                            Remove
=======
                            {t('wishlist.remove')}
>>>>>>> fixed-repo/main
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* Cart Component */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
      />
    </div>
  );
};

export default WishlistPage;
