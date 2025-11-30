import React, { useCallback, useEffect, useMemo, useState } from 'react';
<<<<<<< HEAD
=======
import { useTranslation } from 'react-i18next';
>>>>>>> fixed-repo/main
import { Product, ProductReview } from '../../types';
import { X, Star, MapPin, ShoppingCart, Heart, Share2 } from 'lucide-react';
import { formatWeightUnit } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import ProductService, { ProductReviewSummary } from '../../services/productService';
import { toast } from 'react-hot-toast';
import { redirectToAppRoute } from '../../utils/navigation';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onViewSeller: (sellerId: string) => void;
  onReviewSummaryUpdate?: (productId: string, summary: ProductReviewSummary) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onViewSeller,
  onReviewSummaryUpdate
}) => {
<<<<<<< HEAD
=======
  const { t } = useTranslation();
>>>>>>> fixed-repo/main
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id;
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [reviewsData, setReviewsData] = useState<ProductReview[]>([]);
  const [averageRating, setAverageRating] = useState<number>(product?.averageRating ?? product?.rating ?? 0);
  const [reviewCount, setReviewCount] = useState<number>(product?.reviewCount ?? product?.reviews ?? 0);
  const [userRating, setUserRating] = useState<number>(0);
  const [userComment, setUserComment] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const productId = product?.backendId || product?.id;

  useEffect(() => {
    setAverageRating(product?.averageRating ?? product?.rating ?? 0);
    setReviewCount(product?.reviewCount ?? product?.reviews ?? 0);
  }, [product]);

  const loadReviews = useCallback(async () => {
    if (!productId) return;
    try {
      setReviewsLoading(true);
      setReviewsError(null);
      const res = await ProductService.getProductReviews(productId, 1, 6);
      const normalizedReviews = (res.reviews as ProductReview[]).map((review) => ({
        ...review,
        userId: review.userId || (typeof review.user === 'object' ? review.user?._id : undefined),
        userName: review.userName || (typeof review.user === 'object' ? review.user?.name : review.userName)
      }));
      setReviewsData(normalizedReviews);
      setAverageRating(res.averageRating ?? 0);
      setReviewCount(res.reviewCount ?? normalizedReviews.length);
    } catch (err) {
      console.error('Failed to load reviews', err);
      const backendMessage = typeof err === 'object' && err !== null && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      const fallbackMessage = err instanceof Error ? err.message : undefined;
      setReviewsError(backendMessage || fallbackMessage || 'Unable to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const currentUserReview = useMemo(() => {
    if (!userId) return undefined;
    return reviewsData.find((review) => (
      review.userId === userId || (typeof review.user === 'object' && review.user?._id === userId)
    ));
  }, [reviewsData, userId]);

  useEffect(() => {
    if (!currentUserReview && !isEditing) {
      setUserRating(0);
      setUserComment('');
    }
  }, [currentUserReview, isEditing]);

  const handleEditReviewClick = () => {
    if (!currentUserReview) return;
    setUserRating(currentUserReview.rating);
    setUserComment(currentUserReview.comment || '');
    setIsEditing(true);
    setReviewsError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUserRating(0);
    setUserComment('');
    setReviewsError(null);
  };

  const handleSubmitReview = async () => {
    if (!productId) return;
    if (!isAuthenticated) {
      redirectToAppRoute('/login');
      return;
    }

    if (userRating < 1 || userRating > 5) {
      setReviewsError('Please provide a rating between 1 and 5');
      return;
    }

    const isUpdatingExistingReview = Boolean(currentUserReview);

    try {
      setSubmitting(true);
      setReviewsError(null);
      const summary = await ProductService.submitProductReview(productId, { rating: userRating, comment: userComment });

      setAverageRating(summary.averageRating);
      setReviewCount(summary.reviewCount);

      if (onReviewSummaryUpdate) {
        onReviewSummaryUpdate(productId, summary);
      }

      await loadReviews();
      setIsEditing(false);
      setUserRating(0);
      setUserComment('');
      toast.success(isUpdatingExistingReview ? 'Review updated successfully' : 'Review submitted successfully');
    } catch (err) {
      console.error('Submit review failed', err);
      const backendMessage = typeof err === 'object' && err !== null && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      const fallbackMessage = err instanceof Error ? err.message : undefined;
      const message = backendMessage || fallbackMessage || 'Failed to submit review';
      setReviewsError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !product) return null;

  const sellerProfile = product.artisan || {
    id: product.seller.id,
    name: product.seller.name,
    city: product.seller.city,
    state: product.seller.state,
    avatar: product.seller.avatar,
    location: `${product.seller.city}${product.seller.state ? `, ${product.seller.state}` : ''}`
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Product Image */}
            <div className="relative h-96 lg:h-full">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.originalPrice && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="p-8 overflow-y-auto">
              <div className="space-y-6">
                {/* Category & Stock */}
                <div className="flex items-center justify-between">
                  <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                    {product.craftType}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.inStock 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
<<<<<<< HEAD
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
=======
                    {product.inStock ? t('productModal.inStock') : t('productCard.outOfStock')}
>>>>>>> fixed-repo/main
                  </span>
                </div>

                {/* Product Name */}
                <h1 className="text-3xl font-bold text-gray-900">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(averageRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {averageRating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{product.price.toLocaleString()}/
                    <span className="text-lg text-gray-600">{formatWeightUnit(product.weightUnit)}</span>
                  </span>
                  {product.originalPrice && (
                    <span className="text-xl text-gray-500 line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Seller Info */}
                <div
                  onClick={() => onViewSeller(sellerProfile.id)}
                  className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={sellerProfile.avatar || product.seller.avatar}
                    alt={sellerProfile.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{sellerProfile.name}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {sellerProfile.city}
                      {sellerProfile.state ? `, ${sellerProfile.state}` : ''}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
<<<<<<< HEAD
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
=======
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('productModal.description')}</h3>
>>>>>>> fixed-repo/main
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Materials */}
                <div>
<<<<<<< HEAD
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Materials Used</h3>
=======
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('productModal.materialsUsed')}</h3>
>>>>>>> fixed-repo/main
                  <div className="flex flex-wrap gap-2">
                    {product.materials.map((material, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </div>

                  {/* Reviews */}
                  <div>
<<<<<<< HEAD
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Reviews</h3>
=======
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('productModal.customerReviews')}</h3>
>>>>>>> fixed-repo/main
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <div className="ml-3 text-sm text-gray-600">{averageRating.toFixed(1)} • {reviewCount} review{reviewCount !== 1 ? 's' : ''}</div>
                    </div>

                    <div className="mb-4 space-y-4">
                      {!isAuthenticated && (
                        <div className="border border-blue-100 bg-blue-50 p-4 rounded-lg text-sm text-blue-800 flex items-center justify-between">
<<<<<<< HEAD
                          <span>Sign in to share your experience with this product.</span>
                          <button onClick={() => redirectToAppRoute('/login')} className="text-blue-700 font-medium underline">Sign in</button>
=======
                          <span>{t('productModal.signInToReview')}</span>
                          <button onClick={() => redirectToAppRoute('/login')} className="text-blue-700 font-medium underline">{t('auth.login')}</button>
>>>>>>> fixed-repo/main
                        </div>
                      )}

                      {isAuthenticated && currentUserReview && !isEditing && (
                        <div className="border border-orange-100 bg-orange-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
<<<<<<< HEAD
                              <p className="text-sm font-semibold text-orange-900">You already reviewed this product</p>
                              <p className="text-xs text-orange-800">Update your review if something changed.</p>
=======
                              <p className="text-sm font-semibold text-orange-900">{t('productModal.alreadyReviewed')}</p>
                              <p className="text-xs text-orange-800">{t('productModal.updateReviewHint')}</p>
>>>>>>> fixed-repo/main
                            </div>
                            <button
                              onClick={handleEditReviewClick}
                              className="text-sm font-medium text-orange-700 underline"
                            >
<<<<<<< HEAD
                              Edit your review
=======
                              {t('productModal.editYourReview')}
>>>>>>> fixed-repo/main
                            </button>
                          </div>
                        </div>
                      )}

                      {isAuthenticated && (!currentUserReview || isEditing) && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
<<<<<<< HEAD
                            <label className="block text-sm font-medium text-gray-700">Your rating</label>
                            {isEditing && (
                              <button className="text-xs text-gray-500 underline" onClick={handleCancelEdit}>
                                Cancel edit
=======
                            <label className="block text-sm font-medium text-gray-700">{t('productModal.yourRating')}</label>
                            {isEditing && (
                              <button className="text-xs text-gray-500 underline" onClick={handleCancelEdit}>
                                {t('productModal.cancelEdit')}
>>>>>>> fixed-repo/main
                              </button>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mb-3">
                            {[1,2,3,4,5].map((val) => (
                              <button
                                key={val}
                                onClick={() => setUserRating(val)}
                                className={`p-1 rounded ${val <= userRating ? 'bg-yellow-100' : 'bg-transparent'}`}
                                aria-label={`Rate ${val} stars`}
                              >
                                <Star className={`h-5 w-5 ${val <= userRating ? 'text-yellow-400' : 'text-gray-300'}`} />
                              </button>
                            ))}
                          </div>
<<<<<<< HEAD
                          <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
=======
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t('productModal.comment')}</label>
>>>>>>> fixed-repo/main
                          <textarea
                            value={userComment}
                            onChange={(e) => setUserComment(e.target.value)}
                            className="w-full border border-gray-200 rounded-md p-2 text-sm"
                            rows={3}
<<<<<<< HEAD
                            placeholder="Share your experience..."
=======
                            placeholder={t('productModal.shareExperience')}
>>>>>>> fixed-repo/main
                          />
                          {reviewsError && <div className="text-sm text-red-600 mt-2">{reviewsError}</div>}
                          <div className="mt-3 flex items-center gap-3">
                            <button
                              onClick={handleSubmitReview}
                              disabled={submitting || userRating === 0}
                              className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-60"
                            >
<<<<<<< HEAD
                              {submitting ? (isEditing ? 'Saving...' : 'Submitting...') : isEditing ? 'Save changes' : 'Submit review'}
                            </button>
                            {isEditing && (
                              <button onClick={handleCancelEdit} className="text-sm text-gray-500 underline">Never mind</button>
=======
                              {submitting ? (isEditing ? t('productModal.saving') : t('productModal.submitting')) : isEditing ? t('productModal.saveChanges') : t('productModal.submitReview')}
                            </button>
                            {isEditing && (
                              <button onClick={handleCancelEdit} className="text-sm text-gray-500 underline">{t('productModal.neverMind')}</button>
>>>>>>> fixed-repo/main
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Reviews list */}
                    <div className="space-y-3">
                      {reviewsLoading ? (
<<<<<<< HEAD
                        <div className="text-sm text-gray-500">Loading reviews...</div>
                      ) : reviewsData.length === 0 ? (
                        <div className="text-sm text-gray-500">No reviews yet. Be the first to review this product.</div>
=======
                        <div className="text-sm text-gray-500">{t('productModal.loadingReviews')}</div>
                      ) : reviewsData.length === 0 ? (
                        <div className="text-sm text-gray-500">{t('productModal.noReviewsYet')}</div>
>>>>>>> fixed-repo/main
                      ) : (
                        reviewsData.map((r, idx) => {
                          const matchesId = currentUserReview?._id && r._id && currentUserReview._id === r._id;
                          const matchesUser = currentUserReview?.userId && r.userId && currentUserReview.userId === r.userId;
                          const isOwnReview = Boolean(matchesId || matchesUser);
                          return (
                            <div
                              key={r._id || `${idx}-${r.userId || 'anon'}`}
                              className={`border p-3 rounded-md ${isOwnReview ? 'border-orange-200 bg-orange-50' : 'border-gray-100'}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm text-gray-700">{(r.userName || 'U')[0]}</div>
                                  <div>
                                    <div className="flex items-center gap-2">
<<<<<<< HEAD
                                      <div className="text-sm font-medium text-gray-900">{r.userName || 'Anonymous'}</div>
                                      {isOwnReview && <span className="text-xs text-orange-700 font-semibold">Your review</span>}
                                      {r.verifiedPurchase && <span className="text-xs text-green-600 font-semibold">Verified purchase</span>}
=======
                                      <div className="text-sm font-medium text-gray-900">{r.userName || t('productModal.anonymous')}</div>
                                      {isOwnReview && <span className="text-xs text-orange-700 font-semibold">{t('productModal.yourReview')}</span>}
                                      {r.verifiedPurchase && <span className="text-xs text-green-600 font-semibold">{t('productModal.verifiedPurchase')}</span>}
>>>>>>> fixed-repo/main
                                    </div>
                                    <div className="text-xs text-gray-500 flex flex-col">
                                      <span>{new Date(r.createdAt || '').toLocaleDateString()}</span>
                                      {r.lastEditedAt && (
<<<<<<< HEAD
                                        <span>Edited {new Date(r.lastEditedAt).toLocaleDateString()}</span>
=======
                                        <span>{t('productModal.edited')} {new Date(r.lastEditedAt).toLocaleDateString()}</span>
>>>>>>> fixed-repo/main
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`h-4 w-4 ${i < Math.floor(r.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                    ))}
                                  </div>
                                  {isOwnReview && !isEditing && (
                                    <button
                                      type="button"
                                      onClick={handleEditReviewClick}
                                      className="text-xs text-orange-700 underline"
                                    >
<<<<<<< HEAD
                                      Edit
=======
                                      {t('common.edit')}
>>>>>>> fixed-repo/main
                                    </button>
                                  )}
                                </div>
                              </div>
                              {r.comment && <p className="text-sm text-gray-700 mt-2">{r.comment}</p>}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Minimum Order */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-800 font-medium">
<<<<<<< HEAD
                      Minimum Order Quantity: {product.minOrder} pieces
=======
                      {t('productModal.minimumOrderQuantity')}: {product.minOrder} {t('units.pieces')}
>>>>>>> fixed-repo/main
                    </p>
                  </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => onAddToCart(product)}
                    disabled={!product.inStock}
                    className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
<<<<<<< HEAD
                    Add to Cart
=======
                    {t('productCard.addToCart')}
>>>>>>> fixed-repo/main
                  </button>
                  <button className="p-3 border-2 border-gray-300 rounded-lg hover:border-red-300 hover:text-red-500 transition-colors">
                    <Heart className="h-5 w-5" />
                  </button>
                  <button className="p-3 border-2 border-gray-300 rounded-lg hover:border-blue-300 hover:text-blue-500 transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;