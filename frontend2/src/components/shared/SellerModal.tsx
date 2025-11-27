import React, { useEffect, useState } from 'react';
import { X, MapPin, Star, Award, Calendar, Package, Loader2 } from 'lucide-react';
import SellerService, { SellerProfile } from '../../services/sellerService';

interface SellerModalProps {
  sellerId: string | null;
  isOpen: boolean;
  onClose: () => void;
  // Optional: Pass seller data directly if already loaded (from product)
  sellerData?: {
    id: string;
    name: string;
    city: string;
    state: string;
    avatar: string;
    story?: string;
    specialties?: string[];
    rating?: number;
    totalProducts?: number;
    yearsOfExperience?: number;
  };
}

const SellerModal: React.FC<SellerModalProps> = ({
  sellerId,
  isOpen,
  onClose,
  sellerData
}) => {
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !sellerId) {
      setSeller(null);
      setError(null);
      return;
    }

    // If seller data is passed directly, use it
    if (sellerData) {
      setSeller({
        id: sellerData.id,
        name: sellerData.name,
        city: sellerData.city,
        state: sellerData.state,
        avatar: sellerData.avatar,
        story: sellerData.story || 'A skilled artisan creating beautiful handcrafted items with traditional techniques.',
        specialties: sellerData.specialties || [],
        rating: sellerData.rating || 4.5,
        totalProducts: sellerData.totalProducts || 0,
        yearsOfExperience: sellerData.yearsOfExperience || 5,
      });
      return;
    }

    // Otherwise fetch from backend
    const fetchSeller = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedSeller = await SellerService.getSellerById(sellerId);
        if (fetchedSeller) {
          setSeller(fetchedSeller);
        } else {
          setError('Artisan not found');
        }
      } catch (err) {
        console.error('Error fetching seller:', err);
        setError('Failed to load artisan details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeller();
  }, [sellerId, isOpen, sellerData]);

  if (!isOpen || !sellerId) return null;

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto" />
            <p className="mt-4 text-gray-600">Loading artisan details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !seller) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="text-red-500 mb-4">
              <p className="text-lg font-semibold">Unable to Load Artisan</p>
              <p className="text-sm">{error || 'Artisan details not available'}</p>
            </div>
            <button
              onClick={onClose}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="relative h-48 bg-gradient-to-r from-orange-400 to-amber-400">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-6 left-6 flex items-end space-x-4">
              <img
                src={seller.avatar}
                alt={seller.name}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
              />
              <div className="text-white">
                <h1 className="text-2xl font-bold">{seller.name}</h1>
                <div className="flex items-center text-white/90">
                  <MapPin className="h-4 w-4 mr-1" />
                  {seller.city}, {seller.state}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center text-orange-600 mb-2">
                  <Star className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{seller.rating}</div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center text-orange-600 mb-2">
                  <Package className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{seller.totalProducts}</div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center text-orange-600 mb-2">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{seller.yearsOfExperience}</div>
                <div className="text-sm text-gray-600">Years</div>
              </div>
            </div>

            {/* Story */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Award className="h-5 w-5 mr-2 text-orange-600" />
                Artisan Story
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {seller.story}
              </p>
            </div>

            {/* Specialties */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {seller.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-4">
              <button className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
                View All Products
              </button>
              <button className="flex-1 border-2 border-orange-600 text-orange-600 py-3 px-6 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
                Contact Artisan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerModal;