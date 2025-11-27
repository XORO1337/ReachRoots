import React, { useState, useEffect } from 'react';
import shippingAgentService from '../../../services/shippingAgentService';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  Phone,
  RefreshCw,
  AlertCircle,
  Camera,
  Navigation,
  X
} from 'lucide-react';

interface Delivery {
  orderId: string;
  orderNumber: string;
  status: 'accepted' | 'picked_up' | 'in_transit' | 'delivered';
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
  artisanName: string;
  artisanPhone: string;
  customerName: string;
  customerPhone: string;
  productSummary: string;
  orderValue: number;
  commission: number;
  acceptedAt: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  estimatedDelivery: string;
}

const ActiveDeliveries: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'pickup' | 'deliver' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState('');

  useEffect(() => {
    fetchDeliveries();
  }, [activeTab]);

  const fetchDeliveries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await shippingAgentService.getAssignedDeliveries({
        status: activeTab === 'active' ? 'active' : 'completed'
      });
      // Extract deliveries array from response (response can be { deliveries: [], pagination: {} } or just an array)
      const deliveriesData = Array.isArray(response) ? response : (response?.deliveries || []);
      // Map the response to our interface
      const mappedDeliveries: Delivery[] = deliveriesData.map((del: any) => ({
        orderId: del._id,
        orderNumber: del.orderNumber,
        status: del.status === 'shipped' ? 'picked_up' : 
                del.status === 'delivered' ? 'delivered' : 'accepted',
        pickupAddress: {
          street: del.artisanId?.addresses?.[0]?.street || '',
          city: del.artisanId?.addresses?.[0]?.city || '',
          state: del.artisanId?.addresses?.[0]?.state || '',
          pincode: del.artisanId?.addresses?.[0]?.pinCode || ''
        },
        deliveryAddress: {
          street: del.shippingAddress?.street || '',
          city: del.shippingAddress?.city || '',
          state: del.shippingAddress?.state || '',
          pincode: del.shippingAddress?.postalCode || ''
        },
        artisanName: del.artisanId?.name || 'Artisan',
        artisanPhone: del.artisanId?.phone || '',
        customerName: del.buyerId?.name || 'Customer',
        customerPhone: del.buyerId?.phone || '',
        productSummary: del.items?.map((i: any) => `${i.quantity}x ${i.productId?.name}`).join(', ') || 'Products',
        orderValue: del.totalAmount,
        commission: del.shippingDetails?.agentCommission || 30 + (del.totalAmount * 0.02),
        acceptedAt: del.shippingDetails?.agentAcceptedAt || del.createdAt,
        pickedUpAt: del.shippingDetails?.pickedUpAt,
        deliveredAt: del.shippingDetails?.deliveredAt,
        estimatedDelivery: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
      }));
      setDeliveries(mappedDeliveries);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load deliveries');
      // Demo data
      setDeliveries([
        {
          orderId: '507f1f77bcf86cd799439011',
          orderNumber: 'ORD-2024-001',
          status: 'accepted',
          pickupAddress: {
            street: '123 Artisan Lane, Bandra West',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400050'
          },
          deliveryAddress: {
            street: '456 Customer Avenue, Koregaon Park',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411001'
          },
          artisanName: 'Ramesh Crafts',
          artisanPhone: '+91 98765 43210',
          customerName: 'Priya Sharma',
          customerPhone: '+91 87654 32109',
          productSummary: '2x Handwoven Silk Saree',
          orderValue: 7500,
          commission: 180,
          acceptedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          estimatedDelivery: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
        },
        {
          orderId: '507f1f77bcf86cd799439012',
          orderNumber: 'ORD-2024-002',
          status: 'picked_up',
          pickupAddress: {
            street: '789 Crafts Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001'
          },
          deliveryAddress: {
            street: '321 Home Road, Andheri East',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400069'
          },
          artisanName: 'Traditional Arts Co',
          artisanPhone: '+91 98765 11111',
          customerName: 'Amit Patel',
          customerPhone: '+91 87654 22222',
          productSummary: '1x Brass Lamp, 2x Decorative Plates',
          orderValue: 4500,
          commission: 120,
          acceptedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          pickedUpAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          estimatedDelivery: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString()
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" /> Pending Pickup
          </span>
        );
      case 'picked_up':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Truck className="w-3 h-3 mr-1" /> In Transit
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Truck className="w-3 h-3 mr-1" /> In Transit
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Delivered
          </span>
        );
      default:
        return null;
    }
  };

  const handleActionClick = (delivery: Delivery, type: 'pickup' | 'deliver') => {
    setSelectedDelivery(delivery);
    setActionType(type);
    setShowActionModal(true);
    setDeliveryNote('');
  };

  const handleConfirmAction = async () => {
    if (!selectedDelivery || !actionType) return;
    
    setIsProcessing(true);
    try {
      if (actionType === 'pickup') {
        await shippingAgentService.confirmPickup(selectedDelivery.orderId, {
          note: deliveryNote
        });
      } else {
        await shippingAgentService.markDelivered(selectedDelivery.orderId, {
          note: deliveryNote,
          deliveryProofImage: '' // Would be image URL in real implementation
        });
      }
      
      // Refresh list
      fetchDeliveries();
      setShowActionModal(false);
      setSelectedDelivery(null);
      setActionType(null);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${actionType === 'pickup' ? 'confirm pickup' : 'mark delivered'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const openMaps = (address: { street: string; city: string; state: string; pincode: string }) => {
    const query = encodeURIComponent(`${address.street}, ${address.city}, ${address.state} ${address.pincode}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-emerald-600">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading deliveries...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Deliveries</h2>
          <p className="text-gray-500">Manage your active and completed deliveries</p>
        </div>
        <button 
          onClick={fetchDeliveries}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-1 inline-flex">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'active' 
              ? 'bg-emerald-50 text-emerald-700' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Active Deliveries
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'completed' 
              ? 'bg-emerald-50 text-emerald-700' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Completed
        </button>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-700">{error}</p>
        </div>
      )}

      {/* Deliveries List */}
      {deliveries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No {activeTab === 'active' ? 'Active' : 'Completed'} Deliveries
          </h3>
          <p className="text-gray-500">
            {activeTab === 'active' 
              ? 'Accept pickup requests to start delivering'
              : 'Your completed deliveries will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <div 
              key={delivery.orderId} 
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-gray-900">{delivery.orderNumber}</span>
                  {getStatusBadge(delivery.status)}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Commission</p>
                  <p className="font-bold text-emerald-600">{formatCurrency(delivery.commission)}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Pickup Details */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-emerald-600">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-sm font-medium uppercase tracking-wide">Pickup From</span>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <p className="font-medium text-gray-900">{delivery.artisanName}</p>
                      <p className="text-sm text-gray-600">{delivery.pickupAddress.street}</p>
                      <p className="text-sm text-gray-600">
                        {delivery.pickupAddress.city}, {delivery.pickupAddress.state} {delivery.pickupAddress.pincode}
                      </p>
                      <div className="mt-2 flex items-center space-x-3">
                        <a 
                          href={`tel:${delivery.artisanPhone}`}
                          className="inline-flex items-center space-x-1 text-sm text-emerald-600 hover:text-emerald-700"
                        >
                          <Phone className="w-4 h-4" />
                          <span>{delivery.artisanPhone}</span>
                        </a>
                        <button
                          onClick={() => openMaps(delivery.pickupAddress)}
                          className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Navigate</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-red-600">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium uppercase tracking-wide">Deliver To</span>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="font-medium text-gray-900">{delivery.customerName}</p>
                      <p className="text-sm text-gray-600">{delivery.deliveryAddress.street}</p>
                      <p className="text-sm text-gray-600">
                        {delivery.deliveryAddress.city}, {delivery.deliveryAddress.state} {delivery.deliveryAddress.pincode}
                      </p>
                      <div className="mt-2 flex items-center space-x-3">
                        <a 
                          href={`tel:${delivery.customerPhone}`}
                          className="inline-flex items-center space-x-1 text-sm text-red-600 hover:text-red-700"
                        >
                          <Phone className="w-4 h-4" />
                          <span>{delivery.customerPhone}</span>
                        </a>
                        <button
                          onClick={() => openMaps(delivery.deliveryAddress)}
                          className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Navigate</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>{delivery.productSummary}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Order Value:</span> {formatCurrency(delivery.orderValue)}
                    </div>
                    <div>
                      <span className="text-gray-400">Accepted:</span> {formatDateTime(delivery.acceptedAt)}
                    </div>
                    {delivery.pickedUpAt && (
                      <div>
                        <span className="text-gray-400">Picked up:</span> {formatDateTime(delivery.pickedUpAt)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {activeTab === 'active' && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-3">
                    {delivery.status === 'accepted' && (
                      <button
                        onClick={() => handleActionClick(delivery, 'pickup')}
                        className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Pickup</span>
                      </button>
                    )}
                    {(delivery.status === 'picked_up' || delivery.status === 'in_transit') && (
                      <button
                        onClick={() => handleActionClick(delivery, 'deliver')}
                        className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark as Delivered</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {actionType === 'pickup' ? 'Confirm Pickup' : 'Mark as Delivered'}
                </h3>
                <button 
                  onClick={() => setShowActionModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">{selectedDelivery.orderNumber}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {actionType === 'pickup' 
                    ? `Picking up from ${selectedDelivery.artisanName}`
                    : `Delivering to ${selectedDelivery.customerName}`
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add a note (optional)
                </label>
                <textarea
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder={actionType === 'pickup' 
                    ? 'E.g., Package collected, items verified'
                    : 'E.g., Delivered to doorstep, received by customer'}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {actionType === 'deliver' && (
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors">
                  <Camera className="w-5 h-5" />
                  <span>Add Delivery Photo (Optional)</span>
                </button>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isProcessing}
                className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm</span>
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

export default ActiveDeliveries;
