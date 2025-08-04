import React from 'react';
import { useTranslation } from 'react-i18next';
import { Product } from '../types';
import { Star, MapPin, ShoppingCart, Eye, Heart } from 'lucide-react';
import { formatWeightUnit } from '../utils/formatters';
import { useWishlist } from '../contexts/WishlistContext';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onViewSeller: (sellerId: string) => void;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  onViewDetails, 
  onViewSeller,
  viewMode = 'grid'
}) => {
  const { t } = useTranslation();
  const { isInWishlist, toggleWishlistItem } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering other click events
    try {
      await toggleWishlistItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        artisanName: product.seller?.name
      });
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <div className="flex">
          {/* Product Image */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.originalPrice && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                {Math.round((1 - product.price / product.originalPrice) * 100)}{t('productCard.percentOff')}
              </div>
            )}
            {/* Wishlist Heart Icon */}
            <button
              onClick={handleWishlistToggle}
              className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white transition-all duration-200 z-10"
            >
              <Heart 
                className={`h-4 w-4 transition-colors ${
                  isWishlisted 
                    ? 'text-red-500 fill-red-500' 
                    : 'text-gray-400 hover:text-red-500'
                }`} 
              />
            </button>
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{t('productCard.outOfStock')}</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                {/* Category */}
                <span className="inline-block text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium mb-2">
                  {product.craftType}
                </span>
                
                {/* Product Name */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Seller Info */}
                <div
                  onClick={() => onViewSeller(product.seller.id)}
                  className="flex items-center mb-3 hover:text-orange-600 cursor-pointer transition-colors"
                >
                  <img
                    src={product.seller.avatar}
                    alt={product.seller.name}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <span className="text-sm text-gray-600">{t('productCard.by')} {product.seller.name}</span>
                  <div className="flex items-center text-xs text-gray-500 ml-4">
                    <MapPin className="h-3 w-3 mr-1" />
                    {product.seller.city}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">
                    {product.rating} ({product.reviews} {t('productCard.reviews')})
                  </span>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="text-right ml-6">
                <div className="mb-4">
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{product.price.toLocaleString()}/
                    <span className="text-sm text-gray-600">{formatWeightUnit(product.weightUnit)}</span>
                  </div>
                  {product.originalPrice && (
                    <div className="text-sm text-gray-500 line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {t('productCard.minOrder')} {product.minOrder}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => onViewDetails(product)}
                    className="w-full border-2 border-orange-600 text-orange-600 py-2 px-4 rounded-lg font-semibold hover:bg-orange-50 transition-colors text-sm flex items-center justify-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {t('productCard.viewDetails')}
                  </button>
                  <button
                    onClick={() => onAddToCart(product)}
                    disabled={!product.inStock}
                    className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    {t('productCard.addToCart')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group">
      {/* Product Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.originalPrice && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            {Math.round((1 - product.price / product.originalPrice) * 100)}{t('productCard.percentOff')}
          </div>
        )}
        <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Wishlist Heart Icon */}
          <button
            onClick={handleWishlistToggle}
            className="bg-white/90 p-2 rounded-full hover:bg-white transition-colors"
          >
            <Heart 
              className={`h-4 w-4 transition-colors ${
                isWishlisted 
                  ? 'text-red-500 fill-red-500' 
                  : 'text-gray-700 hover:text-red-500'
              }`} 
            />
          </button>
          {/* View Details Icon */}
          <button
            onClick={() => onViewDetails(product)}
            className="bg-white/90 p-2 rounded-full hover:bg-white transition-colors"
          >
            <Eye className="h-4 w-4 text-gray-700" />
          </button>
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">{t('productCard.outOfStock')}</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5">
        {/* Category & Location */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
            {product.craftType}
          </span>
          <div
            onClick={() => onViewSeller(product.seller.id)}
            className="flex items-center text-xs text-gray-500 hover:text-orange-600 cursor-pointer transition-colors"
          >
            <MapPin className="h-3 w-3 mr-1" />
            {product.seller.city}
          </div>
        </div>

        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Seller Info */}
        <div
          onClick={() => onViewSeller(product.seller.id)}
          className="flex items-center mb-3 hover:text-orange-600 cursor-pointer transition-colors"
        >
          <img
            src={product.seller.avatar}
            alt={product.seller.name}
            className="w-6 h-6 rounded-full mr-2"
          />
          <span className="text-sm text-gray-600">{t('productCard.by')} {product.seller.name}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            {product.rating} ({product.reviews} {t('productCard.reviews')})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              ₹{product.price.toLocaleString()}/
              <span className="text-sm text-gray-600">{formatWeightUnit(product.weightUnit)}</span>
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {t('productCard.minOrder')} {product.minOrder}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(product)}
            className="flex-1 border-2 border-orange-600 text-orange-600 py-2 px-4 rounded-lg font-semibold hover:bg-orange-50 transition-colors text-sm"
          >
            {t('productCard.viewDetails')}
          </button>
          <button
            onClick={() => onAddToCart(product)}
            disabled={!product.inStock}
            className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {t('productCard.addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;