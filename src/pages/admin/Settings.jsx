import React, { useState, useEffect } from 'react';
import {
  Settings, User, Bell, Shield, Database, Palette, Globe,
  Monitor, Save, RefreshCw, Download, Upload, Key, Lock,
  Mail, Phone, MapPin, Camera, Edit3, Check, X, AlertTriangle,
  Users, Building2, DollarSign, Calendar, Clock, Target
} from 'lucide-react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profileSettings, setProfileSettings] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@constructpro.com',
    phone: '+1 (555) 123-4567',
    position: 'System Administrator',
    department: 'IT Management',
    location: 'Main Office',
    bio: 'Experienced construction management professional with 10+ years in the industry.',
    avatar: null,
    timezone: 'America/New_York',
    language: 'English',
    dateFormat: 'MM/DD/YYYY'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    projectUpdates: true,
    budgetAlerts: true,
    safetyAlerts: true,
    deadlineReminders: true,
    teamUpdates: false,
    systemMaintenance: true,
    weeklyReports: true,
    monthlyReports: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 60,
    passwordExpiry: 90,
    loginNotifications: true,
    allowMultipleSessions: false,
    ipWhitelist: '',
    automaticLogout: true
  });

  const [systemSettings, setSystemSettings] = useState({
    theme: 'light',
    sidebarCollapsed: false,
    dashboardLayout: 'grid',
    defaultView: 'dashboard',
    autoSave: true,
    dataRetention: 365,
    backupFrequency: 'daily',
    maintenanceMode: false
  });

  const [companySettings, setCompanySettings] = useState({
    companyName: 'ConstructPro',
    address: '123 Business Ave, City, State 12345',
    phone: '+1 (555) 987-6543',
    email: 'info@constructpro.com',
    website: 'www.constructpro.com',
    taxId: '12-3456789',
    industry: 'Construction',
    employeeCount: '50-100',
    currency: 'USD',
    fiscalYearStart: 'January'
  });

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: User, color: 'blue' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'orange' },
    { id: 'security', label: 'Security', icon: Shield, color: 'red' },
    { id: 'system', label: 'System', icon: Settings, color: 'purple' },
    { id: 'company', label: 'Company', icon: Building2, color: 'green' },
    { id: 'data', label: 'Data & Backup', icon: Database, color: 'teal' }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setIsDirty(false);
    }, 1500);
  };

  const handleProfileChange = (field, value) => {
    setProfileSettings(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleNotificationChange = (field, value) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSecurityChange = (field, value) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSystemChange = (field, value) => {
    setSystemSettings(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleCompanyChange = (field, value) => {
    setCompanySettings(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <h1 className="text-6xl font-bold text-gray-900 mb-4 tracking-tight">
              Settings
            </h1>
            <p className="text-2xl text-gray-600 leading-relaxed">
              Configure your system preferences, security, and account settings
            </p>
          </div>
          
          {isDirty && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xl font-semibold rounded-2xl hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {isSaving ? (
                <RefreshCw className="h-6 w-6 animate-spin" />
              ) : (
                <Save className="h-6 w-6" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 sticky top-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings Menu</h2>
            
            <div className="space-y-3">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 text-left ${
                      isActive 
                        ? `bg-${tab.color}-50 text-${tab.color}-700 border-2 border-${tab.color}-200` 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${isActive ? `text-${tab.color}-600` : ''}`} />
                    <span className="text-lg font-semibold">{tab.label}</span>
                  </button>
                );
              })}
            </div>
            
            {isDirty && (
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
                <div className="flex items-center space-x-2 text-orange-700">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm font-medium">Unsaved changes</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div>
                <div className="flex items-center space-x-4 mb-8">
                  <User className="h-8 w-8 text-blue-500" />
                  <h2 className="text-4xl font-bold text-gray-900">Profile Settings</h2>
                </div>

                <div className="space-y-8">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl">
                      {profileSettings.firstName.charAt(0)}{profileSettings.lastName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Profile Picture</h3>
                      <div className="flex space-x-3">
                        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all">
                          <Camera className="h-5 w-5" />
                          <span>Upload Photo</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all">
                          <X className="h-5 w-5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={profileSettings.firstName}
                        onChange={(e) => handleProfileChange('firstName', e.target.value)}
                        className="w-full px-4 py-3 text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profileSettings.lastName}
                        onChange={(e) => handleProfileChange('lastName', e.target.value)}
                        className="w-full px-4 py-3 text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={profileSettings.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        className="w-full px-4 py-3 text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profileSettings.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        className="w-full px-4 py-3 text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-2">Position</label>
                      <input
                        type="text"
                        value={profileSettings.position}
                        onChange={(e) => handleProfileChange('position', e.target.value)}
                        className="w-full px-4 py-3 text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-2">Department</label>
                      <input
                        type="text"
                        value={profileSettings.department}
                        onChange={(e) => handleProfileChange('department', e.target.value)}
                        className="w-full px-4 py-3 text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={profileSettings.bio}
                      onChange={(e) => handleProfileChange('bio', e.target.value)}
                      rows="4"
                      className="w-full px-4 py-3 text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Preferences */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-2">Timezone</label>
                      <select
                        value={profileSettings.timezone}
                        onChange={(e) => handleProfileChange('timezone', e.target.value)}
                        className="w-full px-4 py-3 text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      >
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-2">Language</label>
                      <select
                        value={profileSettings.language}
                        onChange={(e) => handleProfileChange('language', e.target.value)}
                        className="w-full px-4 py-3 text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-2">Date Format</label>
                      <select
                        value={profileSettings.dateFormat}
                        onChange={(e) => handleProfileChange('dateFormat', e.target.value)}
                        className="w-full px-4 py-3 text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div>
                <div className="flex items-center space-x-4 mb-8">
                  <Bell className="h-8 w-8 text-orange-500" />
                  <h2 className="text-4xl font-bold text-gray-900">Notification Settings</h2>
                </div>

                <div className="space-y-8">
                  {/* Delivery Methods */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Delivery Methods</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="p-6 border-2 border-gray-200 rounded-2xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-6 w-6 text-blue-500" />
                            <span className="text-xl font-semibold text-gray-900">Email</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.emailNotifications}
                            onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                            className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div className="p-6 border-2 border-gray-200 rounded-2xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Phone className="h-6 w-6 text-green-500" />
                            <span className="text-xl font-semibold text-gray-900">SMS</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.smsNotifications}
                            onChange={(e) => handleNotificationChange('smsNotifications', e.target.checked)}
                            className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div className="p-6 border-2 border-gray-200 rounded-2xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Bell className="h-6 w-6 text-purple-500" />
                            <span className="text-xl font-semibold text-gray-900">Push</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.pushNotifications}
                            onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                            className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notification Types */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Notification Types</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'projectUpdates', label: 'Project Updates', icon: Building2 },
                        { key: 'budgetAlerts', label: 'Budget Alerts', icon: DollarSign },
                        { key: 'safetyAlerts', label: 'Safety Alerts', icon: AlertTriangle },
                        { key: 'deadlineReminders', label: 'Deadline Reminders', icon: Calendar },
                        { key: 'teamUpdates', label: 'Team Updates', icon: Users },
                        { key: 'systemMaintenance', label: 'System Maintenance', icon: Settings },
                        { key: 'weeklyReports', label: 'Weekly Reports', icon: Target },
                        { key: 'monthlyReports', label: 'Monthly Reports', icon: Target }
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                            <div className="flex items-center space-x-4">
                              <Icon className="h-6 w-6 text-gray-500" />
                              <span className="text-xl font-semibold text-gray-900">{item.label}</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={notificationSettings[item.key]}
                              onChange={(e) => handleNotificationChange(item.key, e.target.checked)}
                              className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div>
                <div className="flex items-center space-x-4 mb-8">
                  <Shield className="h-8 w-8 text-red-500" />
                  <h2 className="text-4xl font-bold text-gray-900">Security Settings</h2>
                </div>

                <div className="space-y-8">
                  {/* Two-Factor Authentication */}
                  <div className="p-6 border-2 border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h3>
                        <p className="text-lg text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={securitySettings.twoFactorAuth}
                        onChange={(e) => handleSecurityChange('twoFactorAuth', e.target.checked)}
                        className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>
                    {securitySettings.twoFactorAuth && (
                      <button className="px-6 py-3 bg-blue-100 text-blue-700 rounded-xl font-semibold hover:bg-blue-200 transition-all">
                        Configure 2FA
                      </button>
                    )}
                  </div>

                  {/* Session Settings */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-2">Session Timeout (minutes)</label>
                      <input
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-4 py-3 text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-2">Password Expiry (days)</label>
                      <input
                        type="number"
                        value={securitySettings.passwordExpiry}
                        onChange={(e) => handleSecurityChange('passwordExpiry', parseInt(e.target.value))}
                        className="w-full px-4 py-3 text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Security Options */}
                  <div className="space-y-4">
                    {[
                      { key: 'loginNotifications', label: 'Login Notifications', description: 'Get notified when someone logs into your account' },
                      { key: 'allowMultipleSessions', label: 'Allow Multiple Sessions', description: 'Allow logging in from multiple devices simultaneously' },
                      { key: 'automaticLogout', label: 'Automatic Logout', description: 'Automatically logout when browser is closed' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">{item.label}</h4>
                          <p className="text-lg text-gray-600">{item.description}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={securitySettings[item.key]}
                          onChange={(e) => handleSecurityChange(item.key, e.target.checked)}
                          className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Change Password */}
                  <div className="p-6 border-2 border-gray-200 rounded-2xl">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Change Password</h3>
                    <button className="px-6 py-3 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition-all">
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* System Settings - placeholder for other tabs */}
            {activeTab === 'system' && (
              <div>
                <div className="flex items-center space-x-4 mb-8">
                  <Settings className="h-8 w-8 text-purple-500" />
                  <h2 className="text-4xl font-bold text-gray-900">System Settings</h2>
                </div>
                <div className="text-center py-16">
                  <Settings className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">System Configuration</h3>
                  <p className="text-xl text-gray-600">System settings panel coming soon...</p>
                </div>
              </div>
            )}

            {/* Company Settings */}
            {activeTab === 'company' && (
              <div>
                <div className="flex items-center space-x-4 mb-8">
                  <Building2 className="h-8 w-8 text-green-500" />
                  <h2 className="text-4xl font-bold text-gray-900">Company Settings</h2>
                </div>
                <div className="text-center py-16">
                  <Building2 className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Company Information</h3>
                  <p className="text-xl text-gray-600">Company settings panel coming soon...</p>
                </div>
              </div>
            )}

            {/* Data & Backup */}
            {activeTab === 'data' && (
              <div>
                <div className="flex items-center space-x-4 mb-8">
                  <Database className="h-8 w-8 text-teal-500" />
                  <h2 className="text-4xl font-bold text-gray-900">Data & Backup Settings</h2>
                </div>
                <div className="text-center py-16">
                  <Database className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Data Management</h3>
                  <p className="text-xl text-gray-600">Data and backup settings panel coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;