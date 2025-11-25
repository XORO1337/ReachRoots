import React, { useState, useMemo } from 'react';
import { Search, Truck, Package, CheckCircle, MapPin } from 'lucide-react';
import { useArtisanDeliveries } from '../../../hooks/useArtisanDeliveries';

const Deliveries: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const { 
    deliveries, 
    isLoading, 
    error, 
    updateDeliveryStatus, 
    getDeliveryStats,
    fetchDeliveries 
  } = useArtisanDeliveries();

  const deliveryStats = getDeliveryStats();

  // Transform backend data to match frontend expectations
  const transformedDeliveries = useMemo(() => {
    return deliveries.map(delivery => ({
      id: delivery._id,
      orderId: delivery.orderNumber,
      customer: {
        name: delivery.buyerId.name,
        phone: delivery.buyerId.phone || delivery.buyerId.email || 'N/A'
      },
      items: delivery.items.map(item => `${item.productId.name} (${item.quantity}x)`).join(', '),
      address: `${delivery.shippingAddress.street}, ${delivery.shippingAddress.city}, ${delivery.shippingAddress.state} ${delivery.shippingAddress.postalCode}`,
      status: delivery.status === 'processing' ? 'Preparing' : 
              delivery.status === 'shipped' ? 'Shipped' : 
              delivery.status === 'delivered' ? 'Delivered' : 'Preparing',
      progress: delivery.status === 'processing' ? 25 :
                delivery.status === 'shipped' ? 75 :
                delivery.status === 'delivered' ? 100 : 25,
      estimatedDelivery: delivery.estimatedDelivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      trackingNumber: delivery.trackingNumber,
      totalAmount: delivery.totalAmount,
      createdAt: delivery.createdAt
    }));
  }, [deliveries]);

  const filteredDeliveries = useMemo(() => {
    if (!transformedDeliveries) return [];
    
    return transformedDeliveries.filter(delivery => {
      const matchesSearch = delivery.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           delivery.orderId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || delivery.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [transformedDeliveries, searchTerm, statusFilter]);

  const handleStatusUpdate = async (deliveryId: string, newStatus: string, trackingNumber?: string) => {
    try {
      setIsUpdating(deliveryId);
      
      // Map frontend status to backend status
      const backendStatus = newStatus === 'Preparing' ? 'processing' :
                           newStatus === 'Shipped' ? 'shipped' :
                           newStatus === 'Delivered' ? 'delivered' : 'processing';
      
      await updateDeliveryStatus(deliveryId, backendStatus, trackingNumber);
      
      // Refresh the deliveries list
      await fetchDeliveries();
    } catch (error) {
      console.error('Failed to update delivery status:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Preparing': return 'bg-orange-100 text-orange-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'Preparing': return 'bg-orange-500';
      case 'Shipped': return 'bg-blue-500';
      case 'Delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="text-gray-600">Loading deliveries...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading deliveries</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalDeliveries = deliveryStats.total;
  const preparingDeliveries = deliveryStats.preparing;
  const inTransitDeliveries = deliveryStats.shipped;
  const deliveredCount = deliveryStats.delivered;

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{totalDeliveries}</div>
              <div className="text-sm text-gray-600">Total Deliveries</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Package className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{preparingDeliveries}</div>
              <div className="text-sm text-gray-600">Preparing</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{inTransitDeliveries}</div>
              <div className="text-sm text-gray-600">In Transit</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{deliveredCount}</div>
              <div className="text-sm text-gray-600">Delivered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Tracking */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Tracking</h2>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search deliveries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option>All Status</option>
              <option>Preparing</option>
              <option>Shipped</option>
              <option>Delivered</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Delivery</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{delivery.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{delivery.orderId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{delivery.customer.name}</div>
                      <div className="text-sm text-gray-500">{delivery.customer.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{delivery.items}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="truncate max-w-xs">{delivery.address}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(delivery.status)}`}>
                      {delivery.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className={`h-2 rounded-full ${getProgressBarColor(delivery.status)}`}
                          style={{ width: `${delivery.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{delivery.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{delivery.estimatedDelivery}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {delivery.status === 'Shipped' && delivery.trackingNumber && (
                        <button 
                          onClick={() => handleStatusUpdate(delivery.id, 'Delivered')}
                          disabled={isUpdating === delivery.id}
                          className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUpdating === delivery.id ? 'Updating...' : 'Mark Delivered'}
                        </button>
                      )}
                      {delivery.status === 'Preparing' && (
                        <button 
                          onClick={() => {
                            const trackingNumber = `TRK${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
                            handleStatusUpdate(delivery.id, 'Shipped', trackingNumber);
                          }}
                          disabled={isUpdating === delivery.id}
                          className="bg-orange-500 text-white px-3 py-1 rounded text-xs hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUpdating === delivery.id ? 'Shipping...' : 'Ship'}
                        </button>
                      )}
                      {delivery.trackingNumber && (
                        <button className="text-blue-600 hover:text-blue-800 text-xs">
                          Track: {delivery.trackingNumber}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Deliveries;
