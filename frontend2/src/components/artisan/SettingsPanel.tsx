import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Save, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  updateProfile,
  uploadProfilePhoto,
  changePassword,
  UpdateProfileData,
  ChangePasswordPayload
} from '@/services/profile';

const DEFAULT_BIO = 'Tell us about yourself and your craft...';
const TABS = ['Profile', 'Business', 'Notifications', 'Payments', 'Security'];

const SettingsPanel: React.FC = () => {
  const { user, updateUserData } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: DEFAULT_BIO
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      const [firstName, ...lastNameParts] = (user.name || '').split(' ');
      setFormData({
        firstName: firstName || '',
        lastName: lastNameParts.join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || DEFAULT_BIO
      });
      setIsInitializing(false);
    }
  }, [user]);

  const initials = useMemo(() => {
    if (!formData.firstName && !formData.lastName) {
      return 'RR';
    }

    const chars = [formData.firstName?.trim()?.[0], formData.lastName?.trim()?.[0]].filter(Boolean);
    return chars.join('').toUpperCase() || 'RR';
  }, [formData.firstName, formData.lastName]);

  const handleInputChange = (field: keyof UpdateProfileData | 'email', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordInputChange = (field: keyof ChangePasswordPayload, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      const updatedUser = await uploadProfilePhoto(file);
      if (updatedUser) {
        updateUserData(updatedUser);
        toast.success('Profile photo updated successfully');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to update profile photo');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveChanges = async () => {
    if (!formData.firstName.trim()) {
      toast.error('First name is required');
      return;
    }

    const payload: UpdateProfileData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone.trim(),
      location: formData.location.trim(),
      bio: formData.bio.trim()
    };

    try {
      setIsSavingProfile(true);
      const updatedUser = await updateProfile(payload);
      if (updatedUser) {
        updateUserData(updatedUser);
        toast.success('Profile updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const message = error?.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill out all password fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(passwordForm.newPassword)) {
      toast.error('Password must include upper, lower, number, special char, and be 8+ chars');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await changePassword(passwordForm);
      toast.success('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Error updating password:', error);
      const message = error?.response?.data?.message || 'Failed to update password';
      toast.error(message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const renderProfileTab = () => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">👤 Personal Information</h3>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
        <div className="flex items-center space-x-4">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={formData.firstName || 'Profile'} className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-xl font-medium">{initials}</span>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPhoto}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {isUploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            <span>{isUploadingPhoto ? 'Uploading...' : 'Change Photo'}</span>
          </button>
          <p className="text-sm text-gray-500">JPG, PNG, or GIF up to 5MB.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter your first name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter your last name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter your phone number"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="City, state or region"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Tell us about yourself and your craft..."
          />
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
        <ShieldCheck className="w-5 h-5 text-orange-500" />
        <span>Security Settings</span>
      </h3>
      <div className="grid grid-cols-1 gap-6 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
          <input
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Enter current password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <input
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Enter new password"
          />
          <p className="text-xs text-gray-500 mt-1">Must include uppercase, lowercase, number, and special character.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
          <input
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Re-enter new password"
          />
        </div>
      </div>
    </div>
  );

  const renderPlaceholderTab = (tabName: string) => (
    <div className="text-center py-12">
      <div className="text-gray-400 text-6xl mb-4">⚙️</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{tabName} Settings</h3>
      <p className="text-gray-600">This section is under development.</p>
    </div>
  );

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === 'Profile' && renderProfileTab()}
        {activeTab === 'Security' && renderSecurityTab()}
        {activeTab !== 'Profile' && activeTab !== 'Security' && renderPlaceholderTab(activeTab)}
      </div>

      {activeTab === 'Profile' && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveChanges}
            disabled={isSavingProfile}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSavingProfile ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      )}

      {activeTab === 'Security' && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handlePasswordChange}
            disabled={isUpdatingPassword}
            className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{isUpdatingPassword ? 'Updating...' : 'Update Password'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
