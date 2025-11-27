import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Eye, 
  Check, 
  X, 
  MessageSquare, 
  Clock, 
  FileCheck,
  Loader2,
  AlertCircle,
  User,
  Car,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_CONFIG } from '../../config/api';

interface Application {
  _id: string;
  applicationId: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'more_info_required';
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: {
      street?: string;
      city: string;
      district: string;
      state: string;
      pinCode: string;
    };
    profilePhoto?: { url: string };
  };
  vehicleDetails: {
    vehicleType: string;
    vehicleRegistrationNumber: string;
    insuranceValidUntil: string;
  };
  documents: {
    driverLicenseFront?: { url: string; verified: boolean };
    driverLicenseBack?: { url: string; verified: boolean };
    vehicleRegistrationCertificate?: { url: string; verified: boolean };
    vehicleInsurance?: { url: string; verified: boolean };
    addressProof?: { url: string; type: string; verified: boolean };
  };
  bankDetails: {
    accountHolderName: string;
    accountNumberMasked?: string;
    ifscCode: string;
    bankName?: string;
  };
  availability: {
    preferredAreas: { city: string; district: string }[];
    availableDays: string[];
    availableTimeSlots: string[];
  };
  review?: {
    reviewedBy?: { name: string };
    reviewedAt?: string;
    notes?: string;
    rejectionReason?: string;
  };
  createdAt: string;
}

interface ApplicationStats {
  statusSummary: {
    pending: number;
    under_review: number;
    approved: number;
    rejected: number;
    more_info_required: number;
    total: number;
  };
}

const statusConfig = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
  under_review: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Under Review' },
  approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
  more_info_required: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'More Info Required' },
};

const AgentApplications: React.FC = () => {
  const { t } = useTranslation();
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [requestedInfo, setRequestedInfo] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [statusFilter, currentPage]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/agent-applications/admin?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setApplications(data.data);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        toast.error(data.message || 'Failed to fetch applications');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/agent-applications/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchApplications();
  };

  const handleApprove = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to approve this application? This will create a delivery agent account.')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/agent-applications/admin/${applicationId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: 'Approved by admin' }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Application approved! Agent account created.');
        if (data.data.tempPassword) {
          toast.success(`Temporary password: ${data.data.tempPassword}`, { duration: 10000 });
        }
        fetchApplications();
        fetchStats();
        setShowDetailModal(false);
      } else {
        toast.error(data.message || 'Failed to approve application');
      }
    } catch (error) {
      toast.error('Failed to approve application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApplication || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/agent-applications/admin/${selectedApplication.applicationId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejectionReason }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Application rejected');
        setShowRejectModal(false);
        setShowDetailModal(false);
        setRejectionReason('');
        fetchApplications();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to reject application');
      }
    } catch (error) {
      toast.error('Failed to reject application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!selectedApplication || !requestedInfo.trim()) {
      toast.error('Please specify what information is needed');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/agent-applications/admin/${selectedApplication.applicationId}/request-info`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestedInfo }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Information request sent');
        setShowRequestInfoModal(false);
        setShowDetailModal(false);
        setRequestedInfo('');
        fetchApplications();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to request information');
      }
    } catch (error) {
      toast.error('Failed to request information');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkUnderReview = async (applicationId: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/agent-applications/admin/${applicationId}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Application marked as under review');
        fetchApplications();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const openDetailModal = (application: Application) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.agentApplications')}</h1>
        <p className="text-gray-600">{t('admin.manageApplications')}</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard label="Total" value={stats.statusSummary.total} color="gray" />
          <StatCard label="Pending" value={stats.statusSummary.pending} color="yellow" />
          <StatCard label="Under Review" value={stats.statusSummary.under_review} color="blue" />
          <StatCard label="Approved" value={stats.statusSummary.approved} color="green" />
          <StatCard label="Rejected" value={stats.statusSummary.rejected} color="red" />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('admin.searchApplications')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </form>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="more_info_required">More Info Required</option>
            </select>
            
            <button
              onClick={() => { fetchApplications(); fetchStats(); }}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t('admin.noApplicationsFound')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm font-medium text-gray-900">{app.applicationId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{app.personalInfo.fullName}</p>
                        <p className="text-sm text-gray-500">{app.personalInfo.email}</p>
                        <p className="text-sm text-gray-500">{app.personalInfo.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="capitalize text-gray-900">{app.vehicleDetails.vehicleType}</p>
                      <p className="text-sm text-gray-500">{app.vehicleDetails.vehicleRegistrationNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusConfig[app.status].bg} ${statusConfig[app.status].text}`}>
                        {statusConfig[app.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(app.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openDetailModal(app)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {app.status === 'pending' && (
                          <button
                            onClick={() => handleMarkUnderReview(app.applicationId)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Mark Under Review"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                        {['pending', 'under_review'].includes(app.status) && (
                          <>
                            <button
                              onClick={() => handleApprove(app.applicationId)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedApplication(app);
                                setShowRejectModal(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
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
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedApplication && (
        <DetailModal
          application={selectedApplication}
          onClose={() => setShowDetailModal(false)}
          onApprove={() => handleApprove(selectedApplication.applicationId)}
          onReject={() => setShowRejectModal(true)}
          onRequestInfo={() => setShowRequestInfoModal(true)}
          actionLoading={actionLoading}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Reject Application</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this application:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason (minimum 10 characters)"
              className="w-full h-32 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || rejectionReason.length < 10}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Info Modal */}
      {showRequestInfoModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Request Additional Information</h3>
            <p className="text-gray-600 mb-4">
              Specify what additional information or documents are needed:
            </p>
            <textarea
              value={requestedInfo}
              onChange={(e) => setRequestedInfo(e.target.value)}
              placeholder="Enter the information you need from the applicant..."
              className="w-full h-32 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRequestInfoModal(false);
                  setRequestedInfo('');
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestInfo}
                disabled={actionLoading || requestedInfo.length < 5}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {actionLoading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => {
  const colorClasses: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <div className={`rounded-lg p-4 ${colorClasses[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm">{label}</p>
    </div>
  );
};

// Detail Modal Component
interface DetailModalProps {
  application: Application;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRequestInfo: () => void;
  actionLoading: boolean;
}

const DetailModal: React.FC<DetailModalProps> = ({
  application,
  onClose,
  onApprove,
  onReject,
  onRequestInfo,
  actionLoading
}) => {
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'vehicle', label: 'Vehicle', icon: Car },
    { id: 'documents', label: 'Documents', icon: FileCheck },
    { id: 'bank', label: 'Bank', icon: CreditCard },
    { id: 'availability', label: 'Availability', icon: MapPin },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Application Details</h2>
            <p className="text-sm text-gray-500">ID: {application.applicationId}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[application.status].bg} ${statusConfig[application.status].text}`}>
              {statusConfig[application.status].label}
            </span>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b px-6">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'border-orange-500 text-orange-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {application.personalInfo.profilePhoto?.url && (
                  <img 
                    src={application.personalInfo.profilePhoto.url} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <InfoField icon={User} label="Full Name" value={application.personalInfo.fullName} />
                  <InfoField icon={Mail} label="Email" value={application.personalInfo.email} />
                  <InfoField icon={Phone} label="Phone" value={application.personalInfo.phone} />
                  <InfoField icon={Calendar} label="Date of Birth" value={new Date(application.personalInfo.dateOfBirth).toLocaleDateString('en-IN')} />
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Address</h4>
                <p className="text-gray-600">
                  {application.personalInfo.address.street && `${application.personalInfo.address.street}, `}
                  {application.personalInfo.address.city}, {application.personalInfo.address.district}, {application.personalInfo.address.state} - {application.personalInfo.address.pinCode}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'vehicle' && (
            <div className="grid grid-cols-2 gap-4">
              <InfoField icon={Car} label="Vehicle Type" value={application.vehicleDetails.vehicleType} />
              <InfoField icon={FileCheck} label="Registration Number" value={application.vehicleDetails.vehicleRegistrationNumber} />
              <InfoField icon={Calendar} label="Insurance Valid Until" value={new Date(application.vehicleDetails.insuranceValidUntil).toLocaleDateString('en-IN')} />
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="grid grid-cols-2 gap-4">
              <DocumentCard label="Driver's License (Front)" doc={application.documents.driverLicenseFront} />
              <DocumentCard label="Driver's License (Back)" doc={application.documents.driverLicenseBack} />
              <DocumentCard label="Vehicle RC" doc={application.documents.vehicleRegistrationCertificate} />
              <DocumentCard label="Vehicle Insurance" doc={application.documents.vehicleInsurance} />
              <DocumentCard 
                label={`Address Proof (${application.documents.addressProof?.type || 'N/A'})`} 
                doc={application.documents.addressProof} 
              />
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="grid grid-cols-2 gap-4">
              <InfoField icon={User} label="Account Holder" value={application.bankDetails.accountHolderName} />
              <InfoField icon={CreditCard} label="Account Number" value={application.bankDetails.accountNumberMasked || '****'} />
              <InfoField icon={FileCheck} label="IFSC Code" value={application.bankDetails.ifscCode} />
              <InfoField icon={CreditCard} label="Bank Name" value={application.bankDetails.bankName || 'N/A'} />
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Preferred Service Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {application.availability.preferredAreas.map((area, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {area.city}, {area.district}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Available Days</h4>
                <div className="flex flex-wrap gap-2">
                  {application.availability.availableDays.map((day, i) => (
                    <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm capitalize">
                      {day}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Time Slots</h4>
                <div className="flex flex-wrap gap-2">
                  {application.availability.availableTimeSlots.map((slot, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm capitalize">
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {['pending', 'under_review', 'more_info_required'].includes(application.status) && (
          <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
            <button
              onClick={onRequestInfo}
              disabled={actionLoading}
              className="px-4 py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-50 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Request Info
            </button>
            <button
              onClick={onReject}
              disabled={actionLoading}
              className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Reject
            </button>
            <button
              onClick={onApprove}
              disabled={actionLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Info Field Component
interface InfoFieldProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string;
}

const InfoField: React.FC<InfoFieldProps> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  </div>
);

// Document Card Component
interface DocumentCardProps {
  label: string;
  doc?: { url: string; verified?: boolean };
}

const DocumentCard: React.FC<DocumentCardProps> = ({ label, doc }) => (
  <div className="border rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="font-medium text-sm">{label}</span>
      {doc?.verified && (
        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Verified</span>
      )}
    </div>
    {doc?.url ? (
      <a 
        href={doc.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block w-full h-32 bg-gray-100 rounded-lg overflow-hidden group relative"
      >
        <img src={doc.url} alt={label} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <ExternalLink className="w-6 h-6 text-white" />
        </div>
      </a>
    ) : (
      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
        Not Uploaded
      </div>
    )}
  </div>
);

export default AgentApplications;
