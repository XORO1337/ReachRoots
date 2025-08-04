import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import ProductGrid from '../components/ProductGrid';
import Cart from '../components/Cart';
import ProductModal from '../components/ProductModal';
import SellerModal from '../components/SellerModal';
import Footer from '../components/Footer';
import LanguageSelectionModal from '../components/LanguageSelectionModal';
import { products } from '../data/mockData';
import { Product, FilterState } from '../types';
import { useCart } from '../contexts/CartContext';
import { useLanguageSelection } from '../hooks/useLanguageSelection';

const Marketplace: React.FC = () => {
  const { cartItems, addToCart, updateQuantity, removeItem, getCartItemsCount } = useCart();
  const { t } = useTranslation();
  const { showLanguageModal, closeLanguageModal } = useLanguageSelection();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    location: '',
    priceRange: [0, 5000],
    craftType: '',
    search: ''
  });

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleViewSeller = (sellerId: string) => {
    setSelectedSellerId(sellerId);
    setIsSellerModalOpen(true);
  };

  const handleCategorySelect = (categoryId: string) => {
    setFilters(prev => ({ ...prev, category: categoryId }));
    // Scroll to products section
    document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
  };

  const cartItemsCount = getCartItemsCount();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Artisan Dashboard Link */}
      <div className="fixed top-4 right-4 z-50">
        <Link
          to="/artisan"
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors shadow-lg flex items-center space-x-2"
        >
          <span>🎨</span>
          <span>{t('navigation.artisanDashboard')}</span>
        </Link>
      </div>
      
      <Header
        cartItemsCount={cartItemsCount}
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
        filters={filters}
        onFiltersChange={setFilters}
      />
      
      <Hero />
      
      <Categories onCategorySelect={handleCategorySelect} />
      
      <ProductGrid
        products={products}
        filters={filters}
        onAddToCart={handleAddToCart}
        onViewDetails={handleViewDetails}
        onViewSeller={handleViewSeller}
      />
      
      <Footer />
      
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
      
      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleAddToCart}
        onViewSeller={handleViewSeller}
      />
      
      <SellerModal
        sellerId={selectedSellerId}
        isOpen={isSellerModalOpen}
        onClose={() => {
          setIsSellerModalOpen(false);
          setSelectedSellerId(null);
        }}
      />

      {/* Language Selection Modal */}
      <LanguageSelectionModal 
        isOpen={showLanguageModal} 
        onClose={closeLanguageModal} 
      />
    </div>
  );
};

export default Marketplace;
