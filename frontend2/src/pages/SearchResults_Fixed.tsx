import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Grid, 
  List, 
  SlidersHorizontal,
  X,
  Star,
  MapPin,
  ArrowLeft,
  Package,
  Users,
  TrendingUp,
  FilterX
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import ProductModal from '../components/ProductModal';
import SellerModal from '../components/SellerModal';
import { Product, FilterState } from '../types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import SearchService, { SearchFilters as ApiSearchFilters, ApiProduct as ServiceApiProduct } from '../services/searchService';

interface SearchFilters {
  category: string;
  minPrice: string;
  maxPrice: string;
  artisanLocation: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface SearchResults {
  products: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { cartItems, addToCart, updateQuantity, removeItem, getCartItemsCount } = useCart();
  const { user } = useAuth();
  
  // State management
  const [searchResults, setSearchResults] = useState<SearchResults>({
    products: [],
    totalCount: 0,
    totalPages: 0,
    currentPage: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Get search query from URL params
  const searchQuery = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');
  
  // Filter state
  const [filters, setFilters] = useState<SearchFilters>({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    artisanLocation: searchParams.get('location') || '',
    status: searchParams.get('status') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  });

  // Available filter options
  const defaultCategories = [
    'Textiles', 'Jewelry', 'Home Decor', 'Art', 'Pottery', 
    'Woodwork', 'Metalwork', 'Leather Goods', 'Kitchenware', 'Accessories'
  ];

  // Load available categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await SearchService.getProductCategories();
        const allCategories = [...new Set([...defaultCategories, ...categories])];
        setAvailableCategories(allCategories);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setAvailableCategories(defaultCategories);
      }
    };
    loadCategories();
  }, []);

  // Convert API product to frontend Product type
  const convertApiProductToProduct = (apiProduct: ServiceApiProduct): Product => {
    const productImage = apiProduct.images && apiProduct.images.length > 0 
      ? apiProduct.images[0] 
      : '/api/placeholder/300/300';

    const artisan = apiProduct.artisanId || {
      _id: 'default-artisan',
      name: 'RootsReach Artisan',
      email: '',
      phone: '',
      city: 'India',
      state: 'Various'
    };

    return {
      id: apiProduct._id,
      name: apiProduct.name,
      price: apiProduct.price,
      image: productImage,
      category: apiProduct.category,
      description: apiProduct.description,
      materials: [],
      craftType: apiProduct.category,
      rating: 4.5,
      reviews: 12,
      inStock: apiProduct.stock > 0,
      minOrder: 1,
      seller: {
        id: artisan._id,
        name: artisan.name,
        city: artisan.city || 'Unknown',
        state: artisan.state || 'Unknown',
        avatar: '/api/placeholder/60/60',
        story: '',
        specialties: [apiProduct.category],
        rating: 4.5,
        totalProducts: 0,
        yearsOfExperience: 5
      }
    };
  };

  // Fetch search results from API
  const fetchSearchResults = async (query: string, page: number, filters: SearchFilters) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams: ApiSearchFilters & { q?: string; page?: number; limit?: number } = {
        page,
        limit: 12
      };

      if (query) searchParams.q = query;
      if (filters.category) searchParams.category = filters.category;
      if (filters.minPrice) searchParams.minPrice = parseFloat(filters.minPrice);
      if (filters.maxPrice) searchParams.maxPrice = parseFloat(filters.maxPrice);
      if (filters.artisanLocation) searchParams.artisanLocation = filters.artisanLocation;
      if (filters.status) searchParams.status = filters.status;
      if (filters.sortBy) searchParams.sortBy = filters.sortBy;
      if (filters.sortOrder) searchParams.sortOrder = filters.sortOrder;

      const result = await SearchService.searchProducts(searchParams);

      // Convert and sort products
      const convertedProducts: Product[] = result.products
        .map(apiProduct => {
          try {
            return convertApiProductToProduct(apiProduct);
          } catch (error) {
            console.error('Error converting product:', apiProduct, error);
            return null;
          }
        })
        .filter((product): product is Product => product !== null);
      
      const sortedProducts = sortProducts(convertedProducts, filters.sortBy, filters.sortOrder);

      setSearchResults({
        products: sortedProducts,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while searching';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Sort products based on criteria
  const sortProducts = (products: Product[], sortBy: string, sortOrder: 'asc' | 'desc'): Product[] => {
    return [...products].sort((a, b) => {
      let aValue: any = a[sortBy as keyof Product];
      let bValue: any = b[sortBy as keyof Product];

      if (sortBy === 'rating') {
        aValue = a.rating;
        bValue = b.rating;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Update URL params when filters change
  const updateUrlParams = (newFilters: Partial<SearchFilters>, newPage?: number) => {
    const params = new URLSearchParams(searchParams);
    
    if (searchQuery) params.set('q', searchQuery);
    if (newPage) params.set('page', newPage.toString());
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    setSearchParams(params);
  };

  // Handle filter changes
  const handleFilterChange = (filterName: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    updateUrlParams({ [filterName]: value }, 1);
  };

  // Handle sort change
  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    const newFilters = { ...filters, sortBy, sortOrder };
    setFilters(newFilters);
    updateUrlParams({ sortBy, sortOrder });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    updateUrlParams({}, page);
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      artisanLocation: '',
      status: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    params.set('page', '1');
    setSearchParams(params);
  };

  // Enhanced Cart management with better UX
  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      duration: 2000
    });
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

  // Effect to fetch results when search params change
  useEffect(() => {
    fetchSearchResults(searchQuery, currentPage, filters);
  }, [searchQuery, currentPage, filters]);

  // Computed values
  const cartItemsCount = getCartItemsCount();
  const hasActiveFilters = Object.values(filters).some(f => f !== '' && f !== 'createdAt' && f !== 'desc');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartItemsCount={cartItemsCount}
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
        filters={{
          category: filters.category,
          location: filters.artisanLocation,
          priceRange: [parseInt(filters.minPrice) || 0, parseInt(filters.maxPrice) || 5000],
          craftType: '',
          search: searchQuery
        }}
        onFiltersChange={() => {}}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-orange-600 flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Marketplace
          </Link>
          <span className="mx-2">/</span>
          <span>Search Results</span>
          {searchQuery && (
            <>
              <span className="mx-2">/</span>
              <span className="font-medium">"{searchQuery}"</span>
            </>
          )}
        </div>

        {/* Search Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Browse Products'}
              </h1>
              <div className="flex items-center gap-6 mt-2">
                <p className="text-gray-600">
                  {loading ? 'Searching...' : `${searchResults.totalCount} products found`}
                </p>
                {searchResults.totalCount > 0 && (
                  <>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{new Set(searchResults.products.map(p => p.seller.id)).size} artisans</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Package className="w-4 h-4 mr-1" />
                      <span>{searchResults.products.filter(p => p.inStock).length} in stock</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* View Mode and Filter Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-200 ${
                  showFilters 
                    ? 'bg-orange-50 border-orange-300 text-orange-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                )}
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 flex items-center">
                  <FilterX className="w-4 h-4 mr-1" />
                  Active filters:
                </span>
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium underline decoration-dotted"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 h-fit sticky top-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <SlidersHorizontal className="w-5 h-5 mr-2 text-orange-600" />
                    Filters
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Category Filter */}
                  <div className="border-b border-gray-100 pb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Package className="w-4 h-4 mr-2 text-orange-600" />
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    >
                      <option value="">All Categories</option>
                      {availableCategories.map((category: string) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div className="border-b border-gray-100 pb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                      Price Range (₹)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice}
                          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice}
                          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div className="border-b border-gray-100 pb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                      Artisan Location
                    </label>
                    <input
                      type="text"
                      placeholder="Enter city or state"
                      value={filters.artisanLocation}
                      onChange={(e) => handleFilterChange('artisanLocation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Options */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 font-medium">Sort by:</span>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleSortChange(sortBy, sortOrder as 'asc' | 'desc');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={() => fetchSearchResults(searchQuery, currentPage, filters)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* No Results */}
            {!loading && !error && searchResults.products.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your search criteria or clear some filters
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Products Grid/List */}
            {!loading && !error && searchResults.products.length > 0 && (
              <>
                <div className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }>
                  {searchResults.products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onViewDetails={handleViewDetails}
                      onViewSeller={handleViewSeller}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {searchResults.totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-12 gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * 12) + 1} to {Math.min(currentPage * 12, searchResults.totalCount)} of {searchResults.totalCount} products
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        ← Previous
                      </button>

                      {(() => {
                        const totalPages = searchResults.totalPages;
                        const current = currentPage;
                        const pages = [];
                        
                        if (totalPages <= 7) {
                          for (let i = 1; i <= totalPages; i++) {
                            pages.push(i);
                          }
                        } else {
                          if (current <= 4) {
                            pages.push(1, 2, 3, 4, 5, '...', totalPages);
                          } else if (current >= totalPages - 3) {
                            pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                          } else {
                            pages.push(1, '...', current - 1, current, current + 1, '...', totalPages);
                          }
                        }
                        
                        return pages.map((page, index) => {
                          if (page === '...') {
                            return (
                              <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-500">
                                ...
                              </span>
                            );
                          }
                          
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page as number)}
                              className={`px-4 py-2 border rounded-lg transition-all ${
                                page === current
                                  ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                                  : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        });
                      })()}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === searchResults.totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Cart Component */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
      
      {/* Product Modal */}
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
      
      {/* Seller Modal */}
      <SellerModal
        sellerId={selectedSellerId}
        isOpen={isSellerModalOpen}
        onClose={() => {
          setIsSellerModalOpen(false);
          setSelectedSellerId(null);
        }}
      />
    </div>
  );
};

export default SearchResultsPage;
