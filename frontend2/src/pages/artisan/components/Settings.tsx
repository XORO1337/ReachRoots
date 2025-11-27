import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Save, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import {
	updateProfile,
	uploadProfilePhoto,
	changePassword,
	UpdateProfileData,
	ChangePasswordPayload
} from '../../../services/profile';

const DEFAULT_BIO = 'Tell us about yourself and your craft...';

const Settings: React.FC = () => {
	const { t } = useTranslation();
	const { user, updateUserData } = useAuth();
	const [activeTab, setActiveTab] = useState('Profile');
	const [isSavingProfile, setIsSavingProfile] = useState(false);
	const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
	const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
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
		}
	}, [user]);

	const tabs = [
		{ key: 'Profile', label: t('artisanDashboard.profile') },
		{ key: 'Business', label: t('artisanDashboard.business') },
		{ key: 'Notifications', label: t('artisanDashboard.notifications') },
		{ key: 'Payments', label: t('artisanDashboard.payments') },
		{ key: 'Security', label: t('artisanDashboard.security') }
	];

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
		try {
			setIsSavingProfile(true);
			const payload: UpdateProfileData = {
				firstName: formData.firstName,
				lastName: formData.lastName,
				phone: formData.phone,
				location: formData.location,
				bio: formData.bio
			};

			const updatedUser = await updateProfile(payload);
			if (updatedUser) {
				updateUserData(updatedUser);
				toast.success('Profile updated successfully');
			}
		} catch (error) {
			console.error('Error updating profile:', error);
			toast.error('Failed to update profile');
		} finally {
			setIsSavingProfile(false);
		}
	};

	const handlePasswordChange = async () => {
		if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
			toast.error('Please fill out all password fields');
			return;
		}

		try {
			setIsUpdatingPassword(true);
			await changePassword(passwordForm);
			toast.success('Password updated successfully');
			setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
		} catch (error: any) {
			console.error('Error updating password:', error);
			const errorMessage = error?.response?.data?.message || 'Failed to update password';
			toast.error(errorMessage);
		} finally {
			setIsUpdatingPassword(false);
		}
	};

	const renderProfileTab = () => (
		<div>
			<h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">👤 {t('artisanDashboard.personalInformation')}</h3>

			<div className="mb-8">
				<label className="block text-sm font-medium text-gray-700 mb-2">{t('artisanDashboard.profilePhoto')}</label>
				<div className="flex items-center space-x-4">
					{user?.photoURL ? (
						<img src={user.photoURL} alt={formData.firstName || 'Profile'} className="w-20 h-20 rounded-full object-cover" />
					) : (
						<div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
							<span className="text-orange-600 text-xl font-medium">
								{(formData.firstName[0] || 'A').toUpperCase()}
								{(formData.lastName[0] || 'R').toUpperCase()}
							</span>
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
						<span>{isUploadingPhoto ? t('artisanDashboard.uploading') : t('artisanDashboard.changePhoto')}</span>
					</button>
					<p className="text-sm text-gray-500">{t('artisanDashboard.photoSizeLimit')}</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="firstName">{t('artisanDashboard.firstName')}</label>
					<input
						id="firstName"
						type="text"
						value={formData.firstName}
						onChange={(e) => handleInputChange('firstName', e.target.value)}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
						placeholder={t('artisanDashboard.enterFirstName')}
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="lastName">{t('artisanDashboard.lastName')}</label>
					<input
						id="lastName"
						type="text"
						value={formData.lastName}
						onChange={(e) => handleInputChange('lastName', e.target.value)}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
						placeholder={t('artisanDashboard.enterLastName')}
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">{t('artisanDashboard.emailAddress')}</label>
					<input
						type="email"
						value={formData.email}
						disabled
						className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
					/>
					<p className="text-xs text-gray-500 mt-1">{t('artisanDashboard.emailCannotBeChanged')}</p>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="phone">{t('artisanDashboard.phoneNumber')}</label>
					<input
						id="phone"
						type="tel"
						value={formData.phone}
						onChange={(e) => handleInputChange('phone', e.target.value)}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
						placeholder={t('artisanDashboard.enterPhoneNumber')}
					/>
				</div>
				<div className="md:col-span-2">
					<label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="location">{t('artisanDashboard.location')}</label>
					<input
						id="location"
						type="text"
						value={formData.location}
						onChange={(e) => handleInputChange('location', e.target.value)}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
						placeholder={t('artisanDashboard.locationPlaceholder')}
					/>
				</div>
				<div className="md:col-span-2">
					<label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="bio">{t('artisanDashboard.bio')}</label>
					<textarea
						id="bio"
						rows={4}
						value={formData.bio}
						onChange={(e) => handleInputChange('bio', e.target.value)}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
						placeholder={t('artisanDashboard.bioPlaceholder')}
					/>
				</div>
			</div>
		</div>
	);

	const renderSecurityTab = () => (
		<div>
			<h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
				<ShieldCheck className="w-5 h-5 text-orange-500" />
				<span>{t('artisanDashboard.securitySettings')}</span>
			</h3>
			<div className="grid grid-cols-1 gap-6 max-w-xl">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="currentPassword">{t('artisanDashboard.currentPassword')}</label>
					<input
						id="currentPassword"
						type="password"
						value={passwordForm.currentPassword}
						onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
						placeholder={t('artisanDashboard.enterCurrentPassword')}
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="newPassword">{t('artisanDashboard.newPassword')}</label>
					<input
						id="newPassword"
						type="password"
						value={passwordForm.newPassword}
						onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
						placeholder={t('artisanDashboard.enterNewPassword')}
					/>
					<p className="text-xs text-gray-500 mt-1">{t('artisanDashboard.passwordRequirements')}</p>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="confirmPassword">{t('artisanDashboard.confirmNewPassword')}</label>
					<input
						id="confirmPassword"
						type="password"
						value={passwordForm.confirmPassword}
						onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
						placeholder={t('artisanDashboard.reenterNewPassword')}
					/>
				</div>
			</div>
		</div>
	);

	const renderPlaceholderTab = (tabName: string) => (
		<div className="flex items-center justify-center h-64">
			<p className="text-gray-500">{tabName} {t('artisanDashboard.settingsComingSoon')}</p>
		</div>
	);

	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="border-b border-gray-200 mb-8">
				<nav className="flex space-x-8">
					{tabs.map((tab) => (
						<button
							key={tab.key}
							onClick={() => setActiveTab(tab.key)}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === tab.key
									? 'border-orange-500 text-orange-600'
									: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
							}`}
						>
							{tab.label}
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
						<span>{isSavingProfile ? t('artisanDashboard.saving') : t('artisanDashboard.saveChanges')}</span>
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
						<span>{isUpdatingPassword ? t('artisanDashboard.updatingPassword') : t('artisanDashboard.updatePassword')}</span>
					</button>
				</div>
			)}
		</div>
	);
};

export default Settings;