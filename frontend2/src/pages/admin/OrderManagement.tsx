import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
  Eye,
  AlertTriangle,
  ChevronDown,
  User,
  MapPin,
  Calendar
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  buyerId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  artisanId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  shippingMethod?: string;
  shippingDetails?: {
    assignedAgentId?: {
      _id: string;
      name: string;
      phone: string;
    };
    trackingNumber?: string;
    pickupRequestedAt?: string;
  };
  items: Array<{
    productId: { name: string };
    quantity: number;
    price: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

const OrderManagement: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');

  const statuses = [
    'all', 'pending', 'received', 'packed', 'pickup_requested', 
    'shipped', 'delivered', 'cancelled'
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    received: 'bg-blue-100 text-blue-800',
    packed: 'bg-indigo-100 text-indigo-800',
    pickup_requested: 'bg-orange-100 text-orange-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await adminService.getAllOrders({
        page,
        limit: 20,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      });
      setOrders(result.orders);
      setTotalPages(result.pagination.totalPages);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleStatusOverride = async () => {
    if (!selectedOrder || !newStatus || !statusReason) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await adminService.overrideOrderStatus(selectedOrder._id, newStatus, statusReason);
      toast.success('Order status updated');
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus('');
      setStatusReason('');
      fetchOrders();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'received': return <Package className="h-4 w-4" />;
      case 'packed': return <Package className="h-4 w-4" />;
      case 'pickup_requested': return <Truck className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.orderManagement.title')}</h1>
          <p className="text-gray-500 mt-1">{t('admin.orderManagement.subtitle')}</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          <RefreshCw className="h-4 w-4" />
          {t('common.refresh')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.orderManagement.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </form>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? t('admin.orderManagement.allStatuses') : status.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 text-amber-600 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('admin.orderManagement.noOrdersFound')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.orderManagement.columns.order')}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.orderManagement.columns.customer')}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.orderManagement.columns.artisan')}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.status')}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.orderManagement.columns.amount')}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.orderManagement.columns.date')}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-sm text-gray-500">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </div>
                      {order.shippingDetails?.trackingNumber && (
                        <div className="text-xs text-amber-600">
                          #{order.shippingDetails.trackingNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.buyerId?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">{order.buyerId?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-amber-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.artisanId?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">{order.artisanId?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {getStatusIcon(order.status)}
                        {order.status.replace('_', ' ')}
                      </span>
                      {order.shippingMethod === 'pickup_agent' && order.shippingDetails?.assignedAgentId && (
                        <div className="text-xs text-purple-600 mt-1">
                          Agent: {order.shippingDetails.assignedAgentId.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        ₹{order.totalAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                          title={t('admin.orderManagement.viewDetails')}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowStatusModal(true);
                          }}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title={t('admin.orderManagement.overrideStatus')}
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-200">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {t('common.previous')}
            </button>
            <span className="text-sm text-gray-600">
              {t('admin.orderManagement.pageOf', { current: page, total: totalPages })}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {t('common.next')}
            </button>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && !showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{t('admin.orderManagement.orderDetails')}</h2>
                  <p className="text-gray-500">{selectedOrder.orderNumber}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[selectedOrder.status]}`}>
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Customer & Artisan */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-2">{t('admin.orderManagement.columns.customer')}</div>
                  <div className="font-medium text-gray-900">{selectedOrder.buyerId?.name}</div>
                  <div className="text-sm text-gray-600">{selectedOrder.buyerId?.email}</div>
                  <div className="text-sm text-gray-600">{selectedOrder.buyerId?.phone}</div>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <div className="text-sm font-medium text-amber-700 mb-2">{t('admin.orderManagement.columns.artisan')}</div>
                  <div className="font-medium text-gray-900">{selectedOrder.artisanId?.name}</div>
                  <div className="text-sm text-gray-600">{selectedOrder.artisanId?.email}</div>
                  <div className="text-sm text-gray-600">{selectedOrder.artisanId?.phone}</div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <MapPin className="h-4 w-4" />
                  {t('admin.orderManagement.shippingAddress')}
                </div>
                <div className="text-gray-900">
                  {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}
                </div>
                <div className="text-gray-600">
                  {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode}
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">{t('admin.orderManagement.items')}</div>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{item.productId?.name || t('admin.orderManagement.product')}</div>
                        <div className="text-sm text-gray-500">{t('admin.orderManagement.qty')}: {item.quantity}</div>
                      </div>
                      <div className="font-medium text-gray-900">₹{item.price}</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <span className="font-medium text-gray-900">{t('admin.orderManagement.total')}</span>
                  <span className="text-xl font-bold text-amber-600">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Agent Info */}
              {selectedOrder.shippingDetails?.assignedAgentId && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm font-medium text-purple-700 mb-2">{t('admin.orderManagement.assignedAgent')}</div>
                  <div className="font-medium text-gray-900">
                    {selectedOrder.shippingDetails.assignedAgentId.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedOrder.shippingDetails.assignedAgentId.phone}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowStatusModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  <AlertTriangle className="h-4 w-4" />
                  {t('admin.orderManagement.overrideStatus')}
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Override Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{t('admin.orderManagement.overrideOrderStatus')}</h2>
              <p className="text-gray-500">{t('admin.orderManagement.columns.order')}: {selectedOrder.orderNumber}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.orderManagement.currentStatus')}
                </label>
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[selectedOrder.status]}`}>
                  {selectedOrder.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.orderManagement.newStatus')} *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">{t('admin.orderManagement.selectStatus')}</option>
                  {statuses.filter(s => s !== 'all' && s !== selectedOrder.status).map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.orderManagement.reason')} *
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder={t('admin.orderManagement.reasonPlaceholder')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleStatusOverride}
                  disabled={!newStatus || !statusReason}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  {t('admin.orderManagement.updateStatus')}
                </button>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setNewStatus('');
                    setStatusReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
