<<<<<<< HEAD
import React, { useState } from 'react';
import { Search, Eye, IndianRupee, ShoppingBag, CheckCircle } from 'lucide-react';
import { useArtisanOrders } from '../../../hooks/useArtisanOrders';

const Orders: React.FC = () => {
  const { orders, isLoading, error, updateOrderStatus, setError } = useArtisanOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
=======
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Eye, IndianRupee, ShoppingBag, CheckCircle, X, Package, Truck, Clock } from 'lucide-react';
import { useArtisanOrders } from '../../../hooks/useArtisanOrders';
import OrderStatusManager from '../../../components/orders/OrderStatusManager';

interface OrderItem {
  productId: string | { name?: string };
  quantity: number;
  price: number;
  name?: string;
}

interface Order {
  _id: string;
  buyerId?: { name?: string; email?: string; phone?: string };
  customerInfo?: { name?: string; email?: string; phone?: string };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  shippingMethod?: string;
  shippingDetails?: {
    carrier?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    proofOfShipment?: string;
  };
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    note?: string;
    updatedBy?: string;
  }>;
  statusNotes?: Array<{
    note: string;
    status: string;
    timestamp: string;
    addedBy?: string;
  }>;
  lastStatusChangeAt?: string;
}

const Orders: React.FC = () => {
  const { t } = useTranslation();
  const { orders, isLoading, error, updateOrderStatus, setError, fetchOrders } = useArtisanOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Handle opening order detail modal
  const handleViewOrder = useCallback((order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  }, []);

  // Handle closing modal
  const handleCloseModal = useCallback(() => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  }, []);

  // Handle status update from OrderStatusManager
  const handleStatusUpdate = useCallback(async () => {
    // Refetch orders to get updated data
    await fetchOrders();
    // Close modal to show updated list
    // User can reopen to see new status
  }, [fetchOrders]);
>>>>>>> fixed-repo/main

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => {
            setError(null);
            window.location.reload();
          }}
          className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => {
<<<<<<< HEAD
    const matchesSearch = order.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
=======
    const customerName = order.buyerId?.name || order.customerInfo?.name || '';
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
>>>>>>> fixed-repo/main
                         order._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
<<<<<<< HEAD
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
=======
      case 'received': return 'bg-orange-100 text-orange-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'packed': return 'bg-indigo-100 text-indigo-800';
      case 'pickup_requested': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-cyan-100 text-cyan-800';
      case 'in_transit': return 'bg-teal-100 text-teal-800';
      case 'out_for_delivery': return 'bg-lime-100 text-lime-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
>>>>>>> fixed-repo/main
      default: return 'bg-gray-100 text-gray-800';
    }
  };

<<<<<<< HEAD
=======
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'received':
        return <Clock className="w-4 h-4" />;
      case 'processing':
      case 'packed':
        return <Package className="w-4 h-4" />;
      case 'pickup_requested':
      case 'shipped':
      case 'in_transit':
      case 'out_for_delivery':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

>>>>>>> fixed-repo/main
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const totalOrders = orders.length;
<<<<<<< HEAD
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const processingOrders = orders.filter(order => order.status === 'processing').length;
=======
  const newOrders = orders.filter(order => order.status === 'pending' || order.status === 'received').length;
  const readyToShip = orders.filter(order => order.status === 'packed' || order.status === 'processing').length;
  const inTransit = orders.filter(order => ['shipped', 'in_transit', 'out_for_delivery', 'pickup_requested'].includes(order.status)).length;
>>>>>>> fixed-repo/main
  const totalValue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-50 rounded-lg">
<<<<<<< HEAD
              <IndianRupee className="w-6 h-6 text-orange-600" />
=======
              <ShoppingBag className="w-6 h-6 text-orange-600" />
>>>>>>> fixed-repo/main
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{totalOrders}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-50 rounded-lg">
<<<<<<< HEAD
              <ShoppingBag className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{pendingOrders}</div>
              <div className="text-sm text-gray-600">Pending</div>
=======
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{newOrders}</div>
              <div className="text-sm text-gray-600">New Orders</div>
>>>>>>> fixed-repo/main
            </div>
          </div>
        </div>
        
                
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
<<<<<<< HEAD
            <div className="p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{processingOrders}</div>
              <div className="text-sm text-gray-600">Processing</div>
=======
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Package className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{readyToShip}</div>
              <div className="text-sm text-gray-600">Ready to Ship</div>
>>>>>>> fixed-repo/main
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
<<<<<<< HEAD
            <div className="p-3 bg-green-50 rounded-lg">
              <IndianRupee className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">₹{totalValue.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Value</div>
=======
            <div className="p-3 bg-cyan-50 rounded-lg">
              <Truck className="w-6 h-6 text-cyan-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{inTransit}</div>
              <div className="text-sm text-gray-600">In Transit</div>
>>>>>>> fixed-repo/main
            </div>
          </div>
        </div>
      </div>

<<<<<<< HEAD
=======
      {/* Total Value Card */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm">Total Order Value</p>
            <p className="text-3xl font-bold">₹{totalValue.toFixed(2)}</p>
          </div>
          <IndianRupee className="w-12 h-12 text-orange-200" />
        </div>
      </div>

>>>>>>> fixed-repo/main
      {/* Order Management */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Order Management</h2>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option>All Status</option>
<<<<<<< HEAD
                <option>pending</option>
                <option>processing</option>
                <option>shipped</option>
                <option>delivered</option>
                <option>cancelled</option>
=======
                <option value="pending">Pending</option>
                <option value="received">Received</option>
                <option value="processing">Processing</option>
                <option value="packed">Packed</option>
                <option value="pickup_requested">Pickup Requested</option>
                <option value="shipped">Shipped</option>
                <option value="in_transit">In Transit</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
>>>>>>> fixed-repo/main
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
<<<<<<< HEAD
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order._id.slice(-8)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.customerId?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{order.customerId?.email || 'No email'}</div>
=======
                <tr key={order._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewOrder(order as Order)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order._id.slice(-8)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.buyerId?.name || order.customerInfo?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{order.buyerId?.email || order.customerInfo?.email || 'No email'}</div>
>>>>>>> fixed-repo/main
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{order.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
<<<<<<< HEAD
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
=======
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.replace(/_/g, ' ')}
>>>>>>> fixed-repo/main
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
<<<<<<< HEAD
                    <div className="flex space-x-3">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      {order.status === 'pending' && (
                        <button 
                          onClick={() => handleStatusChange(order._id, 'processing')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Accept
                        </button>
                      )}
                      {order.status === 'processing' && (
                        <button 
                          onClick={() => handleStatusChange(order._id, 'shipped')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ship
                        </button>
                      )}
=======
                    <div className="flex space-x-3" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleViewOrder(order as Order)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                        title="View Order Details"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden md:inline">Manage</span>
                      </button>
>>>>>>> fixed-repo/main
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
<<<<<<< HEAD
      </div>
=======

        {/* Empty state */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'All Status' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Orders will appear here when customers make purchases'}
            </p>
          </div>
        )}
      </div>

      {/* Order Detail Modal with Status Manager */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
              onClick={handleCloseModal}
            />

            {/* Modal panel */}
            <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{selectedOrder._id.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal content */}
              <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Order Details */}
                  <div className="lg:col-span-1 space-y-4">
                    {/* Customer Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-500">Name:</span> {selectedOrder.buyerId?.name || selectedOrder.customerInfo?.name || 'N/A'}</p>
                        <p><span className="text-gray-500">Email:</span> {selectedOrder.buyerId?.email || selectedOrder.customerInfo?.email || 'N/A'}</p>
                        <p><span className="text-gray-500">Phone:</span> {selectedOrder.buyerId?.phone || selectedOrder.customerInfo?.phone || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {selectedOrder.shippingAddress && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Shipping Address</h4>
                        <div className="text-sm text-gray-600">
                          <p>{selectedOrder.shippingAddress.street}</p>
                          <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                          <p>{selectedOrder.shippingAddress.pincode}</p>
                          <p>{selectedOrder.shippingAddress.country}</p>
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.name || (typeof item.productId === 'object' ? item.productId?.name : 'Product')}
                              </p>
                              <p className="text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                        <div className="border-t border-gray-200 pt-3 mt-3">
                          <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Manager */}
                  <div className="lg:col-span-2">
                    <OrderStatusManager
                      order={selectedOrder}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
>>>>>>> fixed-repo/main
    </div>
  );
};

export default Orders;
