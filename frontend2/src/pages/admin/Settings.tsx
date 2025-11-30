<<<<<<< HEAD
import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
=======
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Settings as SettingsIcon, 
>>>>>>> fixed-repo/main
  Shield, 
  Database, 
  Mail,
  Save,
<<<<<<< HEAD
  RefreshCw
} from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    siteName: 'RootsReach',
    adminEmail: 'admin@rootsreach.com',
    maintenanceMode: false,
    emailNotifications: true,
    backupFrequency: 'daily',
    sessionTimeout: '24',
    maxLoginAttempts: '5'
  });
=======
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Truck,
  ShoppingCart
} from 'lucide-react';
import * as adminService from '../../services/adminService';
import type { PlatformSettings } from '../../services/adminService';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getSettings();
      setSettings(data);
      setHasChanges(false);
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      setError(err.response?.data?.message || 'Failed to load settings');
      // Set default settings if API fails
      setSettings({
        general: {
          siteName: 'RootsNReach',
          adminEmail: 'admin@rootsnreach.com',
          supportEmail: 'support@rootsnreach.com',
          maintenanceMode: false,
          maintenanceMessage: 'We are currently undergoing maintenance.'
        },
        security: {
          sessionTimeout: 30,
          maxLoginAttempts: 5,
          lockoutDuration: 15,
          requireTwoFactor: false,
          passwordMinLength: 8
        },
        system: {
          backupFrequency: 'daily',
          lastBackup: null,
          lastSystemCheck: null,
          systemCheckStatus: 'unknown',
          logRetentionDays: 30,
          enableDebugMode: false
        },
        notifications: {
          emailNotifications: true,
          orderNotifications: true,
          userRegistrationNotifications: true,
          securityAlerts: true,
          dailyReports: false,
          weeklyReports: true
        },
        orders: {
          autoConfirmPayment: false,
          requireAddressVerification: false,
          defaultShippingMethod: 'standard',
          maxOrderValue: 100000,
          minOrderValue: 100
        },
        agents: {
          defaultCommissionRate: 5,
          baseDeliveryFee: 30,
          autoAssignAgents: false,
          maxActiveDeliveries: 10
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await adminService.updateSettings(settings);
      setSuccessMessage('Settings saved successfully!');
      setHasChanges(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunSystemCheck = async () => {
    setIsRunningCheck(true);
    try {
      await adminService.runSystemCheck();
      setSuccessMessage('System check completed - Status: Healthy');
      fetchSettings();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'System check failed');
    } finally {
      setIsRunningCheck(false);
    }
  };

  const updateSetting = (section: keyof PlatformSettings, key: string, value: any) => {
    if (!settings) return;
    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };
>>>>>>> fixed-repo/main

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'system', name: 'System', icon: Database },
<<<<<<< HEAD
    { id: 'notifications', name: 'Notifications', icon: Mail }
  ];

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Here you would typically send the settings to your backend
    console.log('Saving settings:', settings);
    // Show success message
  };
=======
    { id: 'notifications', name: 'Notifications', icon: Mail },
    { id: 'orders', name: 'Orders', icon: ShoppingCart },
    { id: 'agents', name: 'Agents', icon: Truck }
  ];

  const Toggle = ({ enabled, onChange, label, description }: {
    enabled: boolean;
    onChange: () => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <h4 className="text-sm font-medium text-gray-900">{label}</h4>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`${
          enabled ? 'bg-orange-600' : 'bg-gray-200'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2`}
      >
        <span
          className={`${
            enabled ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-orange-600">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  if (!settings) return null;
>>>>>>> fixed-repo/main

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your application settings and preferences</p>
        </div>
<<<<<<< HEAD
        <button 
          onClick={handleSave}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

=======
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchSettings}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
              hasChanges 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">×</button>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

>>>>>>> fixed-repo/main
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
<<<<<<< HEAD
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => handleSettingChange('siteName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
=======
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                  <input
                    type="email"
                    value={settings.general.adminEmail}
                    onChange={(e) => updateSetting('general', 'adminEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                  <input
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)}
>>>>>>> fixed-repo/main
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

<<<<<<< HEAD
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Maintenance Mode</h4>
                  <p className="text-sm text-gray-500">Put the site in maintenance mode</p>
                </div>
                <button
                  onClick={() => handleSettingChange('maintenanceMode', !settings.maintenanceMode)}
                  className={`${
                    settings.maintenanceMode ? 'bg-orange-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>
=======
              <Toggle
                enabled={settings.general.maintenanceMode}
                onChange={() => updateSetting('general', 'maintenanceMode', !settings.general.maintenanceMode)}
                label="Maintenance Mode"
                description="Put the site in maintenance mode"
              />

              {settings.general.maintenanceMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Message</label>
                  <textarea
                    value={settings.general.maintenanceMessage}
                    onChange={(e) => updateSetting('general', 'maintenanceMessage', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              )}
>>>>>>> fixed-repo/main
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
<<<<<<< HEAD
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (hours)
                  </label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('maxLoginAttempts', e.target.value)}
=======
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="1440"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                  <input
                    type="number"
                    min="3"
                    max="20"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lockout Duration (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={settings.security.lockoutDuration}
                    onChange={(e) => updateSetting('security', 'lockoutDuration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Password Length</label>
                  <input
                    type="number"
                    min="6"
                    max="32"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
>>>>>>> fixed-repo/main
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
<<<<<<< HEAD
=======

              <Toggle
                enabled={settings.security.requireTwoFactor}
                onChange={() => updateSetting('security', 'requireTwoFactor', !settings.security.requireTwoFactor)}
                label="Require Two-Factor Authentication"
                description="Require 2FA for all admin accounts"
              />
>>>>>>> fixed-repo/main
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
              
<<<<<<< HEAD
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Frequency
                </label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="pt-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200">
                  <RefreshCw className="h-4 w-4" />
                  Run System Check
=======
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                  <select
                    value={settings.system.backupFrequency}
                    onChange={(e) => updateSetting('system', 'backupFrequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Log Retention (days)</label>
                  <input
                    type="number"
                    min="7"
                    max="365"
                    value={settings.system.logRetentionDays}
                    onChange={(e) => updateSetting('system', 'logRetentionDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Backup:</span>
                  <span className="font-medium">{settings.system.lastBackup ? new Date(settings.system.lastBackup).toLocaleString() : 'Never'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last System Check:</span>
                  <span className="font-medium">{settings.system.lastSystemCheck ? new Date(settings.system.lastSystemCheck).toLocaleString() : 'Never'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">System Status:</span>
                  <span className={`font-medium capitalize ${
                    settings.system.systemCheckStatus === 'healthy' ? 'text-green-600' :
                    settings.system.systemCheckStatus === 'warning' ? 'text-yellow-600' :
                    settings.system.systemCheckStatus === 'critical' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>{settings.system.systemCheckStatus}</span>
                </div>
              </div>

              <Toggle
                enabled={settings.system.enableDebugMode}
                onChange={() => updateSetting('system', 'enableDebugMode', !settings.system.enableDebugMode)}
                label="Debug Mode"
                description="Enable detailed logging for troubleshooting"
              />

              <div className="pt-4">
                <button 
                  onClick={handleRunSystemCheck}
                  disabled={isRunningCheck}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isRunningCheck ? 'animate-spin' : ''}`} />
                  {isRunningCheck ? 'Running...' : 'Run System Check'}
>>>>>>> fixed-repo/main
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
              
<<<<<<< HEAD
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive email alerts for important events</p>
                </div>
                <button
                  onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
                  className={`${
                    settings.emailNotifications ? 'bg-orange-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>
            </div>
          )}
=======
              <Toggle
                enabled={settings.notifications.emailNotifications}
                onChange={() => updateSetting('notifications', 'emailNotifications', !settings.notifications.emailNotifications)}
                label="Email Notifications"
                description="Receive email alerts for important events"
              />
              
              <Toggle
                enabled={settings.notifications.orderNotifications}
                onChange={() => updateSetting('notifications', 'orderNotifications', !settings.notifications.orderNotifications)}
                label="Order Notifications"
                description="Get notified when new orders are placed"
              />
              
              <Toggle
                enabled={settings.notifications.userRegistrationNotifications}
                onChange={() => updateSetting('notifications', 'userRegistrationNotifications', !settings.notifications.userRegistrationNotifications)}
                label="User Registration Alerts"
                description="Get notified when new users register"
              />
              
              <Toggle
                enabled={settings.notifications.securityAlerts}
                onChange={() => updateSetting('notifications', 'securityAlerts', !settings.notifications.securityAlerts)}
                label="Security Alerts"
                description="Receive alerts for suspicious activity"
              />
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Report Frequency</h4>
                <Toggle
                  enabled={settings.notifications.dailyReports}
                  onChange={() => updateSetting('notifications', 'dailyReports', !settings.notifications.dailyReports)}
                  label="Daily Reports"
                  description="Receive daily summary reports"
                />
                <Toggle
                  enabled={settings.notifications.weeklyReports}
                  onChange={() => updateSetting('notifications', 'weeklyReports', !settings.notifications.weeklyReports)}
                  label="Weekly Reports"
                  description="Receive weekly analytics reports"
                />
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Order Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.orders.minOrderValue}
                    onChange={(e) => updateSetting('orders', 'minOrderValue', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Order Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.orders.maxOrderValue}
                    onChange={(e) => updateSetting('orders', 'maxOrderValue', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Shipping Method</label>
                  <select
                    value={settings.orders.defaultShippingMethod}
                    onChange={(e) => updateSetting('orders', 'defaultShippingMethod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="standard">Standard Shipping</option>
                    <option value="express">Express Shipping</option>
                    <option value="overnight">Overnight Shipping</option>
                  </select>
                </div>
              </div>

              <Toggle
                enabled={settings.orders.autoConfirmPayment}
                onChange={() => updateSetting('orders', 'autoConfirmPayment', !settings.orders.autoConfirmPayment)}
                label="Auto-Confirm Payments"
                description="Automatically confirm orders after payment verification"
              />
              
              <Toggle
                enabled={settings.orders.requireAddressVerification}
                onChange={() => updateSetting('orders', 'requireAddressVerification', !settings.orders.requireAddressVerification)}
                label="Require Address Verification"
                description="Verify delivery addresses before order confirmation"
              />
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Shipping Agent Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Commission Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={settings.agents.defaultCommissionRate}
                    onChange={(e) => updateSetting('agents', 'defaultCommissionRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Base Delivery Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.agents.baseDeliveryFee}
                    onChange={(e) => updateSetting('agents', 'baseDeliveryFee', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Active Deliveries per Agent</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={settings.agents.maxActiveDeliveries}
                    onChange={(e) => updateSetting('agents', 'maxActiveDeliveries', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              <Toggle
                enabled={settings.agents.autoAssignAgents}
                onChange={() => updateSetting('agents', 'autoAssignAgents', !settings.agents.autoAssignAgents)}
                label="Auto-Assign Agents"
                description="Automatically assign available agents to new deliveries"
              />
            </div>
          )}
>>>>>>> fixed-repo/main
        </div>
      </div>
    </div>
  );
};

export default Settings;
