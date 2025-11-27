import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Truck,
  XCircle,
  RefreshCw,
  Eye,
  UserPlus,
  Star,
  Phone,
  Mail,
  Activity,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { adminService, ShippingAgent } from '../../services/adminService';
import { toast } from 'react-hot-toast';

const AgentManagement: React.FC = () => {
  const { t } = useTranslation();
  const [agents, setAgents] = useState<ShippingAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAgent, setSelectedAgent] = useState<ShippingAgent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [performance, setPerformance] = useState<any>(null);

  // New agent form state
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    commissionRate: 5,
    baseDeliveryFee: 50,
    vehicleType: '',
    vehicleNumber: '',
    licenseNumber: ''
  });

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const result = await adminService.getAllAgents({
        page,
        limit: 20,
        isActive: activeFilter !== 'all' ? activeFilter === 'active' : undefined,
        search: searchTerm || undefined
      });
      setAgents(result.agents);
      setTotalPages(result.pagination.totalPages);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [page, activeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAgents();
  };

  const handleCreateAgent = async () => {
    if (!newAgent.name || !newAgent.email || !newAgent.phone || !newAgent.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await adminService.createAgent(newAgent);
      toast.success('Agent created successfully');
      setShowCreateModal(false);
      setNewAgent({
        name: '',
        email: '',
        phone: '',
        password: '',
        commissionRate: 5,
        baseDeliveryFee: 50,
        vehicleType: '',
        vehicleNumber: '',
        licenseNumber: ''
      });
      fetchAgents();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create agent');
    }
  };

  const handleToggleStatus = async (agent: ShippingAgent) => {
    try {
      const newStatus = !agent.agentProfile.isActive;
      await adminService.toggleAgentStatus(agent._id, newStatus);
      toast.success(`Agent ${newStatus ? 'activated' : 'deactivated'}`);
      fetchAgents();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update agent status');
    }
  };

  const handleViewPerformance = async (agent: ShippingAgent) => {
    try {
      const result = await adminService.getAgentPerformance(agent._id);
      setPerformance(result);
      setSelectedAgent(agent);
      setShowPerformanceModal(true);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to fetch performance');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.agentManagement')}</h1>
          <p className="text-gray-500 mt-1">{t('admin.manageAgents')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchAgents}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            {t('common.refresh')}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            <UserPlus className="h-4 w-4" />
            {t('admin.addAgent')}
          </button>
        </div>
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
                placeholder={t('admin.searchAgents')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </form>

          {/* Status Filter */}
          <div className="flex gap-2">
            {(['all', 'active', 'inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => { setActiveFilter(status); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === status
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 text-amber-600 animate-spin" />
        </div>
      ) : agents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t('admin.noAgentsFound')}</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            {t('admin.addFirstAgent')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className={`p-4 ${agent.agentProfile.isActive ? 'bg-green-50' : 'bg-gray-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      agent.agentProfile.isActive ? 'bg-green-100' : 'bg-gray-200'
                    }`}>
                      <Truck className={`h-6 w-6 ${agent.agentProfile.isActive ? 'text-green-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {agent.agentProfile.rating.toFixed(1)} ({agent.agentProfile.totalRatings} {t('admin.ratings')})
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(agent)}
                    className="p-1"
                    title={agent.agentProfile.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {agent.agentProfile.isActive ? (
                      <ToggleRight className="h-8 w-8 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-4 space-y-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {agent.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {agent.phone}
                </div>
                {agent.agentProfile.vehicleType && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="h-4 w-4 text-gray-400" />
                    {agent.agentProfile.vehicleType} {agent.agentProfile.vehicleNumber && `- ${agent.agentProfile.vehicleNumber}`}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="p-4 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {agent.agentProfile.totalDeliveries}
                  </div>
                  <div className="text-xs text-gray-500">{t('admin.totalDeliveries')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {agent.agentProfile.totalDeliveries > 0 
                      ? Math.round((agent.agentProfile.successfulDeliveries / agent.agentProfile.totalDeliveries) * 100)
                      : 0}%
                  </div>
                  <div className="text-xs text-gray-500">{t('admin.successRate')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    ₹{agent.agentProfile.totalEarnings.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">{t('admin.totalEarnings')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {agent.agentProfile.commissionRate}%
                  </div>
                  <div className="text-xs text-gray-500">{t('admin.commission')}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-gray-50 flex gap-2">
                <button
                  onClick={() => handleViewPerformance(agent)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
                >
                  <Activity className="h-4 w-4" />
                  {t('admin.performance')}
                </button>
                <button
                  onClick={() => setSelectedAgent(agent)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm"
                >
                  <Eye className="h-4 w-4" />
                  {t('admin.details')}
                </button>
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
            {t('common.previous')}
          </button>
          <span className="text-sm text-gray-600">
            {t('admin.page')} {page} {t('admin.of')} {totalPages}
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

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">{t('admin.addNewAgent')}</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={newAgent.name}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Agent name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={newAgent.email}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={newAgent.phone}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="9876543210"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    value={newAgent.password}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Min 8 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate (%)</label>
                  <input
                    type="number"
                    value={newAgent.commissionRate}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, commissionRate: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    min={0}
                    max={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Fee (₹)</label>
                  <input
                    type="number"
                    value={newAgent.baseDeliveryFee}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, baseDeliveryFee: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <select
                    value={newAgent.vehicleType}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, vehicleType: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select vehicle</option>
                    <option value="bike">Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="car">Car</option>
                    <option value="van">Van</option>
                    <option value="truck">Truck</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    value={newAgent.vehicleNumber}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="MH01AB1234"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <input
                    type="text"
                    value={newAgent.licenseNumber}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="DL-1234567890123"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateAgent}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Create Agent
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Modal */}
      {showPerformanceModal && selectedAgent && performance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Agent Performance</h2>
                  <p className="text-gray-500">{selectedAgent.name}</p>
                </div>
                <button 
                  onClick={() => { setShowPerformanceModal(false); setPerformance(null); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-amber-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {performance.agent.profile.totalDeliveries}
                  </div>
                  <div className="text-sm text-gray-600">Total Deliveries</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{performance.agent.profile.totalEarnings.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Earnings</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    ₹{performance.agent.profile.walletBalance.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Wallet Balance</div>
                </div>
              </div>

              {/* Monthly Stats */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Last 30 Days</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xl font-bold text-gray-900">
                      {performance.monthlyStats.deliveries}
                    </div>
                    <div className="text-sm text-gray-500">Deliveries</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-amber-600">
                      ₹{performance.monthlyStats.totalValue?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-gray-500">Order Value Delivered</div>
                  </div>
                </div>
              </div>

              {/* Recent Deliveries */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Recent Deliveries</h3>
                {performance.recentDeliveries.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent deliveries</p>
                ) : (
                  <div className="space-y-2">
                    {performance.recentDeliveries.map((delivery: any) => (
                      <div key={delivery._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{delivery.orderNumber}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(delivery.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">₹{delivery.totalAmount}</div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            delivery.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {delivery.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => { setShowPerformanceModal(false); setPerformance(null); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Details Modal */}
      {selectedAgent && !showPerformanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Agent Details</h2>
                <button onClick={() => setSelectedAgent(null)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  selectedAgent.agentProfile.isActive ? 'bg-green-100' : 'bg-gray-200'
                }`}>
                  <Truck className={`h-8 w-8 ${selectedAgent.agentProfile.isActive ? 'text-green-600' : 'text-gray-500'}`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedAgent.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {selectedAgent.agentProfile.rating.toFixed(1)} rating
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900">{selectedAgent.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900">{selectedAgent.phone}</span>
                </div>
                {selectedAgent.agentProfile.vehicleType && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Truck className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">
                      {selectedAgent.agentProfile.vehicleType}
                      {selectedAgent.agentProfile.vehicleNumber && ` - ${selectedAgent.agentProfile.vehicleNumber}`}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50 rounded-lg">
                <div>
                  <div className="text-sm text-amber-700">Commission Rate</div>
                  <div className="text-xl font-bold text-amber-800">{selectedAgent.agentProfile.commissionRate}%</div>
                </div>
                <div>
                  <div className="text-sm text-amber-700">Base Fee</div>
                  <div className="text-xl font-bold text-amber-800">₹{selectedAgent.agentProfile.baseDeliveryFee}</div>
                </div>
              </div>

              {selectedAgent.agentProfile.serviceAreas && selectedAgent.agentProfile.serviceAreas.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Service Areas</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.agentProfile.serviceAreas.map((area, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {area.city || area.district}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleViewPerformance(selectedAgent)}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  View Performance
                </button>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentManagement;
