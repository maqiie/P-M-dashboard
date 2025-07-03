import React, { useState, useEffect } from 'react';
import { getUserDetails } from '../../services/api'; // Import the API function
import { 
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Download,
  Trash2,
  Save,
  Camera,
  Mail,
  Phone,
  MapPin,
  Building2,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Info
} from 'lucide-react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userDataLoading, setUserDataLoading] = useState(false);

  // Profile settings state - will be populated from API
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    department: '',
    location: '',
    bio: '',
    avatar: null
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    projectDeadlines: true,
    budgetAlerts: true,
    teamUpdates: true,
    safetyAlerts: true,
    systemMaintenance: false,
    weeklyReports: true,
    monthlyReports: true
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: '30',
    allowMultipleSessions: true,
    requirePasswordChange: false
  });

  // Appearance settings state
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    colorScheme: 'blue',
    compactMode: false,
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12'
  });

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setUserDataLoading(true);
      
      const response = await getUserDetails();
      console.log('✅ User details loaded for settings:', response);
      
      if (response && (response.data || response.user || response)) {
        const userData = response.data || response.user || response;
        
        // Populate profile data from API response
        setProfileData({
          name: userData.name || userData.full_name || '',
          email: userData.email || '',
          phone: userData.phone || userData.phone_number || '',
          title: userData.title || userData.role || userData.position || '',
          department: userData.department || 'Construction Management',
          location: userData.location || userData.address || '',
          bio: userData.bio || userData.description || '',
          avatar: userData.avatar || userData.profile_picture || null
        });
      }
    } catch (error) {
      console.error('❌ Failed to load user data for settings:', error);
      // Keep default empty values if API fails
    } finally {
      setLoading(false);
      setUserDataLoading(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  };

  const handleNotificationChange = (setting, value) => {
    setNotificationSettings(prev => ({ ...prev, [setting]: value }));
    setUnsavedChanges(true);
  };

  const handleSecurityChange = (setting, value) => {
    setSecuritySettings(prev => ({ ...prev, [setting]: value }));
    setUnsavedChanges(true);
  };

  const handleAppearanceChange = (setting, value) => {
    setAppearanceSettings(prev => ({ ...prev, [setting]: value }));
    setUnsavedChanges(true);
  };

  const saveSettings = async () => {
    try {
      setUserDataLoading(true);
      console.log('💾 Saving settings...');
      
      // TODO: Implement save functionality with your API
      // Example API calls:
      // await updateUserProfile(profileData);
      // await updateNotificationSettings(notificationSettings);
      // await updateSecuritySettings(securitySettings);
      // await updateAppearanceSettings(appearanceSettings);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUnsavedChanges(false);
      console.log('✅ Settings saved successfully');
    } catch (error) {
      console.error('❌ Failed to save settings:', error);
    } finally {
      setUserDataLoading(false);
    }
  };

  const resetSettings = () => {
    // Reload original user data
    loadUserData();
    setUnsavedChanges(false);
  };

  const ProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Picture</h3>
        <div className="flex items-center space-x-6">
          <div className="relative">
            {profileData.avatar ? (
              <img 
                src={profileData.avatar} 
                alt={profileData.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profileData.name.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
              </div>
            )}
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Upload a new profile picture</p>
            <div className="flex space-x-2">
              <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Upload Photo
              </button>
              <button className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
        
        {userDataLoading && (
          <div className="absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => handleProfileChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
            <input
              type="text"
              value={profileData.title}
              onChange={(e) => handleProfileChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your job title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={profileData.department}
              onChange={(e) => handleProfileChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Construction Management">Construction Management</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Operations">Operations</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => handleProfileChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your location"
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            value={profileData.bio}
            onChange={(e) => handleProfileChange('bio', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>
    </div>
  );

  const NotificationsTab = () => (
    <div className="space-y-6">
      {/* Notification Methods */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Methods</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.emailNotifications}
                onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Receive browser push notifications</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.pushNotifications}
                onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-500">Receive notifications via text message</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.smsNotifications}
                onChange={(e) => handleNotificationChange('smsNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'projectDeadlines', label: 'Project Deadlines', description: 'Get notified about upcoming project deadlines' },
            { key: 'budgetAlerts', label: 'Budget Alerts', description: 'Alerts when project budgets exceed thresholds' },
            { key: 'teamUpdates', label: 'Team Updates', description: 'Updates about team member assignments and changes' },
            { key: 'safetyAlerts', label: 'Safety Alerts', description: 'Important safety incidents and reminders' },
            { key: 'systemMaintenance', label: 'System Maintenance', description: 'Notifications about system updates and maintenance' },
            { key: 'weeklyReports', label: 'Weekly Reports', description: 'Automated weekly progress reports' },
            { key: 'monthlyReports', label: 'Monthly Reports', description: 'Comprehensive monthly project summaries' }
          ].map((item) => (
            <div key={item.key} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={notificationSettings[item.key]}
                  onChange={(e) => handleNotificationChange(item.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SecurityTab = () => (
    <div className="space-y-6">
      {/* Password */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm new password"
            />
          </div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Update Password
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Two-Factor Authentication</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Enable Two-Factor Authentication</p>
            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={securitySettings.twoFactorEnabled}
              onChange={(e) => handleSecurityChange('twoFactorEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {securitySettings.twoFactorEnabled && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">Two-factor authentication is enabled. Use your authenticator app to generate codes.</p>
          </div>
        )}
      </div>

      {/* Session Settings */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Session Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <select
              value={securitySettings.sessionTimeout}
              onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="480">8 hours</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Allow Multiple Sessions</p>
              <p className="text-sm text-gray-500">Allow logging in from multiple devices simultaneously</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.allowMultipleSessions}
                onChange={(e) => handleSecurityChange('allowMultipleSessions', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const AppearanceTab = () => (
    <div className="space-y-6">
      {/* Theme */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: 'light', label: 'Light', description: 'Light theme with white backgrounds' },
            { value: 'dark', label: 'Dark', description: 'Dark theme with dark backgrounds' },
            { value: 'auto', label: 'Auto', description: 'Follows your system preference' }
          ].map((theme) => (
            <label key={theme.value} className="relative cursor-pointer">
              <input
                type="radio"
                name="theme"
                value={theme.value}
                checked={appearanceSettings.theme === theme.value}
                onChange={(e) => handleAppearanceChange('theme', e.target.value)}
                className="sr-only peer"
              />
              <div className="p-4 border-2 border-gray-200 rounded-lg peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors">
                <h4 className="font-medium text-gray-900">{theme.label}</h4>
                <p className="text-sm text-gray-500">{theme.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Color Scheme */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Color Scheme</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
            { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
            { value: 'green', label: 'Green', color: 'bg-green-500' },
            { value: 'orange', label: 'Orange', color: 'bg-orange-500' }
          ].map((scheme) => (
            <label key={scheme.value} className="relative cursor-pointer">
              <input
                type="radio"
                name="colorScheme"
                value={scheme.value}
                checked={appearanceSettings.colorScheme === scheme.value}
                onChange={(e) => handleAppearanceChange('colorScheme', e.target.value)}
                className="sr-only peer"
              />
              <div className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors">
                <div className={`w-6 h-6 rounded-full ${scheme.color}`}></div>
                <span className="font-medium text-gray-900">{scheme.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Layout & Localization */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Layout & Localization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={appearanceSettings.language}
              onChange={(e) => handleAppearanceChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={appearanceSettings.timezone}
              onChange={(e) => handleAppearanceChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
            <select
              value={appearanceSettings.dateFormat}
              onChange={(e) => handleAppearanceChange('dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
            <select
              value={appearanceSettings.timeFormat}
              onChange={(e) => handleAppearanceChange('timeFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="12">12-hour (AM/PM)</option>
              <option value="24">24-hour</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Compact Mode</p>
              <p className="text-sm text-gray-500">Use smaller spacing and elements</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={appearanceSettings.compactMode}
                onChange={(e) => handleAppearanceChange('compactMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 font-semibold">Loading Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your account preferences and system settings
            </p>
          </div>
          
          {unsavedChanges && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-medium">Unsaved changes</span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={resetSettings}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={userDataLoading}
                >
                  Reset
                </button>
                <button 
                  onClick={saveSettings}
                  disabled={userDataLoading}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50"
                >
                  {userDataLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg mb-6">
          <div className="flex items-center border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'appearance', label: 'Appearance', icon: Palette }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'appearance' && <AppearanceTab />}
      </div>
    </div>
  );
};

export default SettingsPage;