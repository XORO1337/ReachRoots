import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/layout/Header';
import Hero from '../components/shared/Hero';
import Categories from '../components/marketplace/Categories';
import ProductGrid from '../components/marketplace/ProductGrid';
import Cart from '../components/marketplace/Cart';
import ProductModal from '../components/marketplace/ProductModal';
import SellerModal from '../components/shared/SellerModal';
import Footer from '../components/layout/Footer';
import LanguageSelectionModal from '../components/shared/LanguageSelectionModal';
<<<<<<< HEAD
import { products as mockProducts } from '../data/mockData';
=======
>>>>>>> fixed-repo/main
import { Product, FilterState } from '../types';
import { useCart } from '../contexts/CartContext';
import { useLanguageSelection } from '../hooks/useLanguageSelection';
import ProductService, { Product as ApiProduct, ProductReviewSummary } from '../services/productService';

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
<<<<<<< HEAD
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(mockProducts);
  const [productsLoading, setProductsLoading] = useState(false);
=======
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
>>>>>>> fixed-repo/main
  const [productsError, setProductsError] = useState<string | null>(null);

  const mapApiProductToCatalog = (apiProduct: ApiProduct): Product => {
    const primaryImage = apiProduct.images && apiProduct.images.length > 0
      ? apiProduct.images[0]
      : '/api/placeholder/400/400';
    const artisan = apiProduct.artisanId && typeof apiProduct.artisanId === 'object'
      ? apiProduct.artisanId
      : null;

    const artisanSummary = {
      id: artisan?._id || 'rootsreach-artisan',
      name: artisan?.name || 'RootsReach Artisan',
      city: artisan?.city || artisan?.location || 'Across India',
      state: artisan?.state || '',
      avatar: artisan?.profileImage?.url || '/api/placeholder/60/60',
      location: artisan?.location || artisan?.city || 'Across India'
    };

    return {
      id: apiProduct._id,
      backendId: apiProduct._id,
      artisan: artisanSummary,
      name: apiProduct.name,
      price: apiProduct.price,
      weightUnit: apiProduct.weightUnit || 'piece',
      originalPrice: undefined,
      image: primaryImage,
      images: apiProduct.images,
      category: apiProduct.category,
      seller: {
        id: artisanSummary.id,
        name: artisanSummary.name,
        city: artisanSummary.city,
        state: artisanSummary.state,
        avatar: artisanSummary.avatar,
        story: '',
        specialties: artisan ? [apiProduct.category] : [],
        rating: apiProduct.averageRating || 4.5,
        totalProducts: 0,
        yearsOfExperience: 0
      },
      description: apiProduct.description,
      materials: [],
      craftType: apiProduct.category,
      rating: apiProduct.averageRating ?? 0,
      reviews: apiProduct.reviewCount ?? 0,
      averageRating: apiProduct.averageRating ?? 0,
      reviewCount: apiProduct.reviewCount ?? 0,
      inStock: apiProduct.stock > 0,
      minOrder: 1
    };
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError(null);
        const result = await ProductService.getProductList({ limit: 24 });
        const mappedProducts = result.products.map(mapApiProductToCatalog);
<<<<<<< HEAD
        setCatalogProducts(mappedProducts.length ? mappedProducts : mockProducts);
        if (!mappedProducts.length) {
          setProductsError('Unable to load live catalog. Showing curated samples instead.');
        }
      } catch (error) {
        console.error('Failed to load products:', error);
        setProductsError('Unable to load live catalog. Showing curated samples instead.');
        setCatalogProducts(mockProducts);
=======
        setCatalogProducts(mappedProducts);
        if (!mappedProducts.length) {
          setProductsError('No products available at the moment. Please check back later.');
        }
      } catch (error) {
        console.error('Failed to load products:', error);
        setProductsError('Unable to load products. Please try again later.');
        setCatalogProducts([]);
>>>>>>> fixed-repo/main
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, []);

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

  const handleReviewSummaryUpdate = (productId: string, summary: ProductReviewSummary) => {
    setCatalogProducts(prev => prev.map(item => {
      const itemId = item.backendId || item.id;
      if (itemId === productId) {
        return {
          ...item,
          rating: summary.averageRating,
          averageRating: summary.averageRating,
          reviewCount: summary.reviewCount,
          reviews: summary.reviewCount
        };
      }
      return item;
    }));

    setSelectedProduct(prev => {
      if (!prev) return prev;
      const prevId = prev.backendId || prev.id;
      if (prevId !== productId) return prev;
      return {
        ...prev,
        rating: summary.averageRating,
        averageRating: summary.averageRating,
        reviewCount: summary.reviewCount,
        reviews: summary.reviewCount
      };
    });
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

      {productsError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
            {productsError}
          </div>
        </div>
      )}
      
      {productsLoading ? (
        <div className="py-16 flex items-center justify-center text-gray-600">
          Loading catalog...
        </div>
      ) : (
        <ProductGrid
          products={catalogProducts}
          filters={filters}
          onAddToCart={handleAddToCart}
          onViewDetails={handleViewDetails}
          onViewSeller={handleViewSeller}
        />
      )}
      
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
        onReviewSummaryUpdate={handleReviewSummaryUpdate}
      />
      
      <SellerModal
        sellerId={selectedSellerId}
        isOpen={isSellerModalOpen}
        onClose={() => {
          setIsSellerModalOpen(false);
          setSelectedSellerId(null);
        }}
<<<<<<< HEAD
=======
        sellerData={selectedSellerId ? catalogProducts.find(p => p.seller.id === selectedSellerId)?.seller : undefined}
>>>>>>> fixed-repo/main
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
