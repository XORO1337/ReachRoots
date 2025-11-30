import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Truck,
  Package,
  Clock,
  CheckCircle,
  RefreshCw,
  Radio,
  UserCheck,
  MapPin,
  Phone,
  User,
  AlertCircle,
  Star
} from 'lucide-react';
import { adminService, PickupRequest, ShippingAgent, InterestedAgent } from '../../services/adminService';
import { toast } from 'react-hot-toast';

const PickupRequests: React.FC = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [agents, setAgents] = useState<ShippingAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [broadcastNote, setBroadcastNote] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [assignNote, setAssignNote] = useState('');

  // Filters
  const [districtFilter, setDistrictFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const result = await adminService.getPendingPickupRequests({
        page,
        limit: 20,
        district: districtFilter || undefined,
        city: cityFilter || undefined
      });
      setRequests(result.requests);
      setTotalPages(result.pagination.totalPages);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to fetch pickup requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const result = await adminService.getAllAgents({ isActive: true, limit: 100 });
      setAgents(result.agents);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchAgents();
  }, [page, districtFilter, cityFilter]);

  const handleBroadcast = async () => {
    if (!selectedRequest) return;

    try {
      const result = await adminService.broadcastPickupRequest(selectedRequest._id, {
        note: broadcastNote
      });
      toast.success(`Broadcasted to ${result.data.broadcastedTo} agents`);
      setShowBroadcastModal(false);
      setBroadcastNote('');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to broadcast');
    }
  };

  const handleAssignAgent = async () => {
    if (!selectedRequest || !selectedAgentId) {
      toast.error('Please select an agent');
      return;
    }

    try {
      await adminService.assignAgentToOrder(selectedRequest._id, selectedAgentId, assignNote);
      toast.success('Agent assigned successfully');
      setShowAssignModal(false);
      setSelectedAgentId('');
      setAssignNote('');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to assign agent');
    }
  };

  const getTimeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.pickupRequests')}</h1>
          <p className="text-gray-500 mt-1">{t('admin.managePickups')}</p>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          <RefreshCw className="h-4 w-4" />
          {t('common.refresh')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{requests.length}</div>
              <div className="text-sm text-gray-500">{t('admin.pickupRequests.pendingPickups')}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{agents.length}</div>
              <div className="text-sm text-gray-500">{t('admin.activeAgents')}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.shippingDetails?.broadcastInfo?.interestedAgents?.length).length}
              </div>
              <div className="text-sm text-gray-500">{t('admin.pickupRequests.withInterestedAgents')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.pickupRequests.district')}</label>
            <input
              type="text"
              placeholder={t('admin.pickupRequests.filterByDistrict')}
              value={districtFilter}
              onChange={(e) => { setDistrictFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.pickupRequests.city')}</label>
            <input
              type="text"
              placeholder={t('admin.pickupRequests.filterByCity')}
              value={cityFilter}
              onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Pickup Requests */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 text-amber-600 animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-500">No pending pickup requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex flex-wrap gap-6 justify-between">
                  {/* Order Info */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-amber-600" />
                      <span className="font-semibold text-gray-900">{request.orderNumber}</span>
                      <span className="text-sm text-gray-500">
                        • {getTimeSince(request.shippingDetails?.pickupRequestedAt || request.createdAt)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {request.items.length} item{request.items.length > 1 ? 's' : ''} • ₹{request.totalAmount.toLocaleString()}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {request.items.slice(0, 2).map((item) => item.productId?.name || 'Product').join(', ')}
                      {request.items.length > 2 && ` +${request.items.length - 2} more`}
                    </div>
                  </div>

                  {/* Pickup Location (Artisan) */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Pickup From</span>
                    </div>
                    <div className="font-medium text-gray-900">{request.artisanId?.name}</div>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {request.artisanId?.phone}
                    </div>
                    {request.artisanId?.addresses?.[0] && (
                      <div className="text-sm text-gray-500 mt-1">
                        {request.artisanId.addresses[0].city}, {request.artisanId.addresses[0].district}
                      </div>
                    )}
                  </div>

                  {/* Delivery Location */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Deliver To</span>
                    </div>
                    <div className="font-medium text-gray-900">{request.buyerId?.name}</div>
                    <div className="text-sm text-gray-600">
                      {request.shippingAddress?.city}, {request.shippingAddress?.state}
                    </div>
                    <div className="text-sm text-gray-500">
                      PIN: {request.shippingAddress?.postalCode}
                    </div>
                  </div>

                  {/* Interested Agents */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Interested Agents</span>
                    </div>
                    {request.shippingDetails?.broadcastInfo?.interestedAgents?.length ? (
                      <div className="space-y-1">
                        {request.shippingDetails.broadcastInfo.interestedAgents.slice(0, 3).map((agent: InterestedAgent, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                              <User className="h-3 w-3 text-purple-600" />
                            </div>
                            <span className="text-gray-900">{agent.agentName}</span>
                            <span className="flex items-center text-yellow-600">
                              <Star className="h-3 w-3" />
                              {agent.agentRating.toFixed(1)}
                            </span>
                          </div>
                        ))}
                        {request.shippingDetails.broadcastInfo.interestedAgents.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{request.shippingDetails.broadcastInfo.interestedAgents.length - 3} more
                          </div>
                        )}
                      </div>
                    ) : request.shippingDetails?.broadcastInfo?.broadcastedAt ? (
                      <div className="text-sm text-gray-500">
                        Broadcasted, waiting for response...
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        Not broadcasted yet
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowBroadcastModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                    >
                      <Radio className="h-4 w-4" />
                      Broadcast
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowAssignModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                    >
                      <UserCheck className="h-4 w-4" />
                      Assign Agent
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Broadcast to Agents</h2>
              <p className="text-gray-500">Order: {selectedRequest.orderNumber}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="text-sm text-orange-800">
                    This will notify all active agents in the service area. 
                    Interested agents can then express their interest.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note to Agents (Optional)
                </label>
                <textarea
                  value={broadcastNote}
                  onChange={(e) => setBroadcastNote(e.target.value)}
                  placeholder="Any special instructions for agents..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleBroadcast}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  <Radio className="h-4 w-4" />
                  Broadcast Now
                </button>
                <button
                  onClick={() => {
                    setShowBroadcastModal(false);
                    setBroadcastNote('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Agent Modal */}
      {showAssignModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Assign Agent</h2>
              <p className="text-gray-500">Order: {selectedRequest.orderNumber}</p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Interested Agents First */}
              {selectedRequest.shippingDetails?.broadcastInfo?.interestedAgents?.length ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interested Agents ({selectedRequest.shippingDetails.broadcastInfo.interestedAgents.length})
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedRequest.shippingDetails.broadcastInfo.interestedAgents.map((agent: InterestedAgent) => (
                      <button
                        key={agent.agentId}
                        onClick={() => setSelectedAgentId(agent.agentId)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                          selectedAgentId === agent.agentId
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Truck className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-gray-900">{agent.agentName}</div>
                            <div className="text-sm text-gray-500">{agent.agentPhone}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Star className="h-4 w-4" />
                          <span className="font-medium">{agent.agentRating.toFixed(1)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* All Agents */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedRequest.shippingDetails?.broadcastInfo?.interestedAgents?.length 
                    ? 'Or Select Other Agent' 
                    : 'Select Agent'}
                </label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Choose an agent...</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name} - {agent.phone} (★{agent.agentProfile.rating.toFixed(1)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Note (Optional)
                </label>
                <textarea
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
                  placeholder="Any special instructions..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAssignAgent}
                  disabled={!selectedAgentId}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  <UserCheck className="h-4 w-4" />
                  Assign Agent
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedAgentId('');
                    setAssignNote('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickupRequests;
