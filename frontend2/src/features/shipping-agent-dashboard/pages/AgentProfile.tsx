import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import shippingAgentService from '../../../services/shippingAgentService';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  Truck,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Edit2,
  Shield
} from 'lucide-react';

interface AgentProfileData {
  name: string;
  email: string;
  phone: string;
  rating: number;
  totalDeliveries: number;
  successRate: number;
  serviceAreas: Array<{
    district: string;
    city: string;
    pinCodes: string[];
  }>;
  bankDetails: {
    accountHolder: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  vehicleType: string;
  isAvailable: boolean;
}

const AgentProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AgentProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [isEditingAreas, setIsEditingAreas] = useState(false);
  
  const [bankForm, setBankForm] = useState({
    accountHolder: '',
    accountNumber: '',
    ifscCode: '',
    bankName: ''
  });

  const [newServiceArea, setNewServiceArea] = useState({
    district: '',
    city: '',
    pinCodes: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const profileData = await shippingAgentService.getAgentProfile();
      setProfile(profileData);
      if (profileData?.bankDetails) {
        setBankForm(profileData.bankDetails);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
      // Demo data
      setProfile({
        name: user?.name || 'Agent Name',
        email: user?.email || 'agent@example.com',
        phone: user?.phone || '+91 98765 43210',
        rating: 4.8,
        totalDeliveries: 287,
        successRate: 98.5,
        serviceAreas: [
          { district: 'Mumbai', city: 'Bandra', pinCodes: ['400050', '400051'] },
          { district: 'Mumbai', city: 'Andheri', pinCodes: ['400053', '400058'] }
        ],
        bankDetails: {
          accountHolder: '',
          accountNumber: '',
          ifscCode: '',
          bankName: ''
        },
        vehicleType: 'Two Wheeler',
        isAvailable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBankDetails = async () => {
    if (!bankForm.accountHolder || !bankForm.accountNumber || !bankForm.ifscCode || !bankForm.bankName) {
      setError('Please fill all bank details');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await shippingAgentService.updateBankDetails(bankForm);
      setSuccessMessage('Bank details updated successfully');
      setIsEditingBank(false);
      fetchProfile();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update bank details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddServiceArea = async () => {
    if (!newServiceArea.district || !newServiceArea.city || !newServiceArea.pinCodes) {
      setError('Please fill all service area fields');
      return;
    }

    const pinCodesArray = newServiceArea.pinCodes.split(',').map(p => p.trim()).filter(p => p);
    
    if (pinCodesArray.length === 0) {
      setError('Please enter at least one pin code');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const updatedAreas = [
        ...(profile?.serviceAreas || []),
        {
          district: newServiceArea.district,
          city: newServiceArea.city,
          pinCodes: pinCodesArray
        }
      ];
      
      await shippingAgentService.updateServiceAreas(updatedAreas);
      setSuccessMessage('Service area added successfully');
      setNewServiceArea({ district: '', city: '', pinCodes: '' });
      fetchProfile();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add service area');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveServiceArea = async (index: number) => {
    if (!profile?.serviceAreas) return;
    
    setIsSaving(true);
    try {
      const updatedAreas = profile.serviceAreas.filter((_, i) => i !== index);
      await shippingAgentService.updateServiceAreas(updatedAreas);
      setSuccessMessage('Service area removed');
      fetchProfile();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove service area');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-emerald-600">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
          <p className="text-gray-500">Manage your account settings and preferences</p>
        </div>
        <button 
          onClick={fetchProfile}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="text-sm text-emerald-700">{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} className="ml-auto text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-24"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end -mt-12 gap-4">
            <div className="w-24 h-24 bg-white rounded-xl border-4 border-white shadow-lg flex items-center justify-center">
              <User className="w-12 h-12 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{profile?.name}</h3>
              <p className="text-gray-500">Shipping Agent</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-lg font-bold text-gray-900">{profile?.rating?.toFixed(1)}</span>
                </div>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{profile?.totalDeliveries}</p>
                <p className="text-xs text-gray-500">Deliveries</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-600">{profile?.successRate}%</p>
                <p className="text-xs text-gray-500">Success</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{profile?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{profile?.phone}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Truck className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Vehicle Type</p>
              <p className="font-medium text-gray-900">{profile?.vehicleType || 'Not specified'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Shield className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className={`font-medium ${profile?.isAvailable ? 'text-emerald-600' : 'text-red-600'}`}>
                {profile?.isAvailable ? 'Available' : 'Unavailable'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Areas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Service Areas</h3>
          <button
            onClick={() => setIsEditingAreas(!isEditingAreas)}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1"
          >
            <Edit2 className="w-4 h-4" />
            <span>{isEditingAreas ? 'Cancel' : 'Edit'}</span>
          </button>
        </div>

        <div className="space-y-3">
          {profile?.serviceAreas?.map((area, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="font-medium text-gray-900">{area.city}, {area.district}</p>
                  <p className="text-sm text-gray-500">PIN: {area.pinCodes.join(', ')}</p>
                </div>
              </div>
              {isEditingAreas && (
                <button
                  onClick={() => handleRemoveServiceArea(index)}
                  className="p-1 text-red-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {profile?.serviceAreas?.length === 0 && !isEditingAreas && (
            <p className="text-gray-500 text-center py-4">No service areas configured</p>
          )}

          {isEditingAreas && (
            <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
              <h4 className="font-medium text-gray-900">Add New Service Area</h4>
              <div className="grid md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="District"
                  value={newServiceArea.district}
                  onChange={(e) => setNewServiceArea({...newServiceArea, district: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={newServiceArea.city}
                  onChange={(e) => setNewServiceArea({...newServiceArea, city: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="PIN Codes (comma separated)"
                  value={newServiceArea.pinCodes}
                  onChange={(e) => setNewServiceArea({...newServiceArea, pinCodes: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <button
                onClick={handleAddServiceArea}
                disabled={isSaving}
                className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Add Area</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Bank Details</h3>
          <button
            onClick={() => setIsEditingBank(!isEditingBank)}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1"
          >
            <Edit2 className="w-4 h-4" />
            <span>{isEditingBank ? 'Cancel' : 'Edit'}</span>
          </button>
        </div>

        {isEditingBank ? (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={bankForm.accountHolder}
                  onChange={(e) => setBankForm({...bankForm, accountHolder: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({...bankForm, bankName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({...bankForm, accountNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={bankForm.ifscCode}
                  onChange={(e) => setBankForm({...bankForm, ifscCode: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            <button
              onClick={handleSaveBankDetails}
              disabled={isSaving}
              className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Account Holder</p>
              <p className="font-medium text-gray-900">{profile?.bankDetails?.accountHolder || 'Not set'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Bank Name</p>
              <p className="font-medium text-gray-900">{profile?.bankDetails?.bankName || 'Not set'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Account Number</p>
              <p className="font-medium text-gray-900">
                {profile?.bankDetails?.accountNumber 
                  ? `****${profile.bankDetails.accountNumber.slice(-4)}` 
                  : 'Not set'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">IFSC Code</p>
              <p className="font-medium text-gray-900">{profile?.bankDetails?.ifscCode || 'Not set'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentProfile;
