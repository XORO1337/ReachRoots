import React from 'react';
import { Product, FilterState } from '../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  filters: FilterState;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onViewSeller: (sellerId: string) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  filters,
  onAddToCart,
  onViewDetails,
  onViewSeller
}) => {
  const filteredProducts = products.filter(product => {
    const matchesSearch = !filters.search || 
      product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.seller.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.seller.city.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.craftType.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = !filters.category || 
      product.category === filters.category;
    
    const matchesLocation = !filters.location || 
      product.seller.city === filters.location;
    
    const matchesCraftType = !filters.craftType || 
      product.craftType === filters.craftType;
    
    const matchesPrice = product.price >= filters.priceRange[0] && 
      product.price <= filters.priceRange[1];
    
    return matchesSearch && matchesCategory && matchesLocation && matchesCraftType && matchesPrice;
  });

  if (filteredProducts.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Products Found</h3>
            <p className="text-gray-600 mb-8">
              Try adjusting your filters or search terms to find what you're looking for.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50" id="featured">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Featured Products
            </h2>
            <p className="text-gray-600">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option>Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating</option>
              <option>Newest</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onViewDetails={onViewDetails}
              onViewSeller={onViewSeller}
            />
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-white border-2 border-orange-600 text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
            Load More Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;