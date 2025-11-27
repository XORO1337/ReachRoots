import React, { useState, useEffect } from 'react';
import shippingAgentService from '../../../services/shippingAgentService';
import {
  Package,
  Clock,
  ArrowRight,
  RefreshCw,
  Truck,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';

interface PickupOpportunity {
  orderId: string;
  orderNumber: string;
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  estimatedEarnings: number;
  baseCommission: number;
  percentageCommission: number;
  distance: number;
  orderValue: number;
  requestedAt: string;
  expiresAt: string;
  artisanName: string;
  productSummary: string;
  weight: string;
  priority: 'normal' | 'urgent' | 'express';
}

const PendingOpportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<PickupOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<PickupOpportunity | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState('30');
  const [filter, setFilter] = useState<'all' | 'nearby' | 'high-value'>('all');

  useEffect(() => {
    fetchOpportunities();
  }, [filter]);

  const fetchOpportunities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await shippingAgentService.getOpportunities({ 
        limit: 50 
      });
      // Handle response - it might be array or object with opportunities property
      const opportunitiesData = Array.isArray(response) 
        ? response 
        : (response?.opportunities || response?.data || []);
      // Map the response to our interface format
      const mappedOpportunities: PickupOpportunity[] = (opportunitiesData || []).map((opp: any) => ({
        orderId: opp._id,
        orderNumber: opp.orderNumber,
        pickupAddress: {
          street: opp.artisanId?.addresses?.[0]?.street || '',
          city: opp.artisanId?.addresses?.[0]?.city || '',
          state: opp.artisanId?.addresses?.[0]?.state || '',
          pincode: opp.artisanId?.addresses?.[0]?.pinCode || ''
        },
        deliveryAddress: {
          street: opp.shippingAddress?.street || '',
          city: opp.shippingAddress?.city || '',
          state: opp.shippingAddress?.state || '',
          pincode: opp.shippingAddress?.postalCode || ''
        },
        estimatedEarnings: opp.estimatedCommission || 30 + (opp.totalAmount * 0.02),
        baseCommission: 30,
        percentageCommission: opp.totalAmount * 0.02,
        distance: 10, // Would be calculated based on addresses
        orderValue: opp.totalAmount,
        requestedAt: opp.shippingDetails?.pickupRequestedAt || opp.createdAt,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        artisanName: opp.artisanId?.name || 'Artisan',
        productSummary: opp.items?.map((i: any) => `${i.quantity}x ${i.productId?.name}`).join(', ') || 'Products',
        weight: '1 kg',
        priority: 'normal' as const
      }));
      setOpportunities(mappedOpportunities);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load opportunities');
      // Demo data for development
      setOpportunities([
        {
          orderId: '507f1f77bcf86cd799439011',
          orderNumber: 'ORD-2024-001',
          pickupAddress: {
            street: '123 Artisan Lane',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001'
          },
          deliveryAddress: {
            street: '456 Customer Street',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411001'
          },
          estimatedEarnings: 180,
          baseCommission: 30,
          percentageCommission: 150,
          distance: 150,
          orderValue: 7500,
          requestedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          artisanName: 'Ramesh Crafts',
          productSummary: '2x Handwoven Silk Saree',
          weight: '1.5 kg',
          priority: 'normal'
        },
        {
          orderId: '507f1f77bcf86cd799439012',
          orderNumber: 'ORD-2024-002',
          pickupAddress: {
            street: '789 Pottery Street',
            city: 'Jaipur',
            state: 'Rajasthan',
            pincode: '302001'
          },
          deliveryAddress: {
            street: '321 Home Avenue',
            city: 'Delhi',
            state: 'Delhi',
            pincode: '110001'
          },
          estimatedEarnings: 90,
          baseCommission: 30,
          percentageCommission: 60,
          distance: 280,
          orderValue: 3000,
          requestedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
          artisanName: 'Blue Pottery Works',
          productSummary: '4x Ceramic Vase Set',
          weight: '3 kg',
          priority: 'urgent'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  const getTimeRemaining = (expiresAt: string) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diffMs = expires.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} mins left`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m left`;
  };

  const handleAcceptClick = (opportunity: PickupOpportunity) => {
    setSelectedOpportunity(opportunity);
    setShowAcceptModal(true);
  };

  const handleAcceptPickup = async () => {
    if (!selectedOpportunity) return;
    
    setIsAccepting(true);
    try {
      await shippingAgentService.expressInterest(selectedOpportunity.orderId);
      
      // Remove from list
      setOpportunities(prev => prev.filter(o => o.orderId !== selectedOpportunity.orderId));
      setShowAcceptModal(false);
      setSelectedOpportunity(null);
      
      // Show success message or redirect
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept pickup');
    } finally {
      setIsAccepting(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">Urgent</span>;
      case 'express':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">Express</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">Normal</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-emerald-600">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading opportunities...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Available Pickups</h2>
          <p className="text-gray-500">Accept deliveries to earn commissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchOpportunities}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
            {['all', 'nearby', 'high-value'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as typeof filter)}
                className={`px-3 py-2 text-sm font-medium capitalize transition-colors ${
                  filter === f 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-700">{error}</p>
        </div>
      )}

      {/* Opportunities List */}
      {opportunities.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Opportunities Available</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            There are no pickup requests in your area right now. Check back later or expand your service area.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {opportunities.map((opportunity) => (
            <div 
              key={opportunity.orderId} 
              className="bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left: Order Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">{opportunity.orderNumber}</h3>
                      {getPriorityBadge(opportunity.priority)}
                      <span className="text-xs text-gray-400">{formatTimeAgo(opportunity.requestedAt)}</span>
                    </div>

                    {/* Route */}
                    <div className="flex items-start space-x-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <div className="w-0.5 h-8 bg-gray-200"></div>
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Pickup</p>
                          <p className="text-sm font-medium text-gray-900">{opportunity.artisanName}</p>
                          <p className="text-sm text-gray-600">
                            {opportunity.pickupAddress.city}, {opportunity.pickupAddress.state}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Delivery</p>
                          <p className="text-sm text-gray-600">
                            {opportunity.deliveryAddress.street}, {opportunity.deliveryAddress.city}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Package className="w-4 h-4" />
                        <span>{opportunity.productSummary}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Truck className="w-4 h-4" />
                        <span>~{opportunity.distance} km</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-orange-600 font-medium">{getTimeRemaining(opportunity.expiresAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Earnings & Action */}
                  <div className="flex flex-col items-end space-y-3 lg:min-w-[180px]">
                    <div className="bg-emerald-50 rounded-lg p-3 text-center w-full lg:w-auto">
                      <p className="text-xs text-emerald-600 font-medium">Your Earnings</p>
                      <p className="text-2xl font-bold text-emerald-700">{formatCurrency(opportunity.estimatedEarnings)}</p>
                      <p className="text-xs text-gray-500">
                        ₹30 base + 2% of {formatCurrency(opportunity.orderValue)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAcceptClick(opportunity)}
                      className="w-full lg:w-auto px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>Accept Pickup</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accept Modal */}
      {showAcceptModal && selectedOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Accept Pickup Request</h3>
                <button 
                  onClick={() => setShowAcceptModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900 mb-2">{selectedOpportunity.orderNumber}</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>From:</strong> {selectedOpportunity.artisanName}</p>
                  <p><strong>Pickup:</strong> {selectedOpportunity.pickupAddress.city}, {selectedOpportunity.pickupAddress.state}</p>
                  <p><strong>Delivery:</strong> {selectedOpportunity.deliveryAddress.city}, {selectedOpportunity.deliveryAddress.state}</p>
                  <p><strong>Items:</strong> {selectedOpportunity.productSummary}</p>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <p className="text-sm text-emerald-600">You will earn</p>
                <p className="text-3xl font-bold text-emerald-700">{formatCurrency(selectedOpportunity.estimatedEarnings)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated pickup time (minutes)
                </label>
                <select
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="15">Within 15 minutes</option>
                  <option value="30">Within 30 minutes</option>
                  <option value="45">Within 45 minutes</option>
                  <option value="60">Within 1 hour</option>
                  <option value="90">Within 1.5 hours</option>
                  <option value="120">Within 2 hours</option>
                </select>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">By accepting this pickup:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>You commit to picking up within the estimated time</li>
                      <li>The artisan and customer will be notified</li>
                      <li>Cancellation may affect your rating</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptPickup}
                disabled={isAccepting}
                className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isAccepting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Accepting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Acceptance</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingOpportunities;
