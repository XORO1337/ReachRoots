import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, Heart, User, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FilterState } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  cartItemsCount: number;
  onCartToggle: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount, onCartToggle, filters, onFiltersChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const { user, logout } = useAuth();
  const { getWishlistItemsCount } = useWishlist();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const wishlistItemsCount = getWishlistItemsCount();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onFiltersChange({ ...filters, search: value });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search page with query
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchButtonClick = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white shadow-xl sticky top-0 z-50 border-b border-gray-100">
      {/* Top Promotional Bar */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <p className="flex items-center font-medium">
                <span className="mr-2">🎯</span>
                Authentic Handmade Crafts from Artisans Across India
              </p>
              <span className="hidden lg:block text-orange-100">|</span>
              <p className="hidden lg:flex items-center text-orange-100">
                <span className="mr-2">🚚</span>
                Free shipping on orders above ₹2,000
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <span className="flex items-center hover:text-orange-200 cursor-pointer transition-colors">
                <span className="mr-2">📞</span>
                Support: 1800-ROOTS-1
              </span>
              <span className="flex items-center hover:text-orange-200 cursor-pointer transition-colors">
                <span className="mr-2">✉️</span>
                help@rootsreach.com
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  RootsReach
                </h1>
                <span className="text-xs text-gray-500 font-medium tracking-wide">AUTHENTIC CRAFTS</span>
              </div>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder={t('marketplace.searchPlaceholder')}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 text-gray-700 placeholder-gray-400"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button
                type="button"
                onClick={handleSearchButtonClick}
                className="absolute inset-y-0 right-0 px-6 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-r-xl hover:from-orange-700 hover:to-orange-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                {t('common.search')}
              </button>
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/wishlist"
                className="relative flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
              >
                <Heart className="h-5 w-5" />
                <span className="text-sm font-medium">{t('navigation.wishlist')}</span>
                {wishlistItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {wishlistItemsCount > 99 ? '99+' : wishlistItemsCount}
                  </span>
                )}
              </Link>

              {/* Language Switcher */}
              <div className="px-2">
                <LanguageSwitcher variant="dropdown" className="text-sm" />
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {user ? user.name : t('navigation.profile')}
                  </span>
                </button>
                
                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {user ? (
                      <>
                        <div className="px-4 py-2">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                        <hr className="my-2 border-gray-200" />
                        {user.role === 'artisan' && (
                          <Link
                            to="/artisan/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            {t('navigation.artisanDashboard')}
                          </Link>
                        )}
                        {user.role === 'customer' && (
                          <Link
                            to="/orders"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            My Orders
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          {t('navigation.logout')}
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          {t('navigation.login')}
                        </Link>
                        <Link
                          to="/signup"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          {t('navigation.register')}
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Cart Button */}
            <button
              onClick={onCartToggle}
              className="relative p-3 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 group"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {cartItemsCount} items
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-3 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="lg:hidden px-4 pb-4 bg-gray-50">
        <form onSubmit={handleSearchSubmit} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder={t('marketplace.searchPlaceholder')}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </form>
      </div>



      {/* Enhanced Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/wishlist"
                className="relative flex items-center justify-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Heart className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-700">{t('navigation.wishlist')}</span>
                {wishlistItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {wishlistItemsCount > 99 ? '99+' : wishlistItemsCount}
                  </span>
                )}
              </Link>
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center justify-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full"
                >
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-700">{t('navigation.profile')}</span>
                </button>
              </div>
            </div>

            {/* Language Switcher for Mobile */}
            <div className="flex justify-center py-2">
              <LanguageSwitcher variant="buttons" className="scale-90" />
            </div>
            {/* Mobile Auth Links */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Link
                to="/login"
                className="flex items-center justify-center py-3 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.login')}
              </Link>
              <Link
                to="/signup"
                className="flex items-center justify-center py-3 px-4 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.register')}
              </Link>
            </div>
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <a href="#categories" className="block py-3 text-gray-700 hover:text-orange-600 font-medium transition-colors">Browse Categories</a>
              <a href="#featured" className="block py-3 text-gray-700 hover:text-orange-600 font-medium transition-colors">Featured Products</a>
              <a href="#artisans" className="block py-3 text-gray-700 hover:text-orange-600 font-medium transition-colors">Meet Our Artisans</a>
              <a href="#about" className="block py-3 text-gray-700 hover:text-orange-600 font-medium transition-colors">About RootsReach</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;