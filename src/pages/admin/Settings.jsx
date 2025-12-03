import React, { useState, useEffect } from 'react';
import { 
  User, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Globe,
  Calendar,
  Clock,
  Camera,
  Shield,
  Bell
} from 'lucide-react';
import { getUserDetails } from '../../services/api';

const SettingsPage = () => {
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    location: '',
    bio: '',
    timezone: 'UTC',
    language: 'en',
    avatar: null,
    twoFactorEnabled: false,
    emailNotifications: true
  });

  // Fetch user details on component mount
  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      const data = await getUserDetails();
      setUserDetails(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isDirty) return;
    
    setIsSaving(true);
    try {
      // Simulate API call with realistic timing
      await new Promise(resolve => setTimeout(resolve, 1200));
      setIsDirty(false);
      
      // Show success feedback
      const saveBtn = document.querySelector('.save-button');
      if (saveBtn) {
        saveBtn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Saved!';
        setTimeout(() => {
          saveBtn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg> Save Changes';
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving user details:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setUserDetails(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleFieldChange('avatar', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-4 md:p-8">
      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Account Settings
              </h1>
              <p className="text-gray-600">
                Manage your profile, preferences, and account security
              </p>
            </div>
            
            {isDirty && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="save-button group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                )}
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-8">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                    {userDetails.avatar ? (
                      <img 
                        src={userDetails.avatar} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <>
                        {userDetails.firstName?.charAt(0) || 'U'}
                        {userDetails.lastName?.charAt(0) || 'S'}
                      </>
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Camera className="w-5 h-5 text-gray-700" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900">
                  {userDetails.firstName} {userDetails.lastName}
                </h2>
                <p className="text-gray-600 flex items-center justify-center gap-2 mt-1">
                  <Briefcase className="w-4 h-4" />
                  {userDetails.position || 'No position set'}
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-gray-600">Projects</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">98%</div>
                    <div className="text-sm text-gray-600">Completion</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Preferences Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-500" />
                Security & Preferences
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Auth</p>
                    <p className="text-sm text-gray-600">Extra layer of security</p>
                  </div>
                  <button
                    onClick={() => handleFieldChange('twoFactorEnabled', !userDetails.twoFactorEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${userDetails.twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${userDetails.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive important updates</p>
                  </div>
                  <button
                    onClick={() => handleFieldChange('emailNotifications', !userDetails.emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${userDetails.emailNotifications ? 'bg-blue-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${userDetails.emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Bell className="w-4 h-4" />
                    Manage All Notifications
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Settings Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Form Header */}
              <div className="border-b border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <User className="w-6 h-6 text-blue-500" />
                  Personal Information
                </h2>
                <p className="text-gray-600 mt-1">
                  Update your personal details and contact information
                </p>
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">First Name</label>
                      <input
                        type="text"
                        value={userDetails.firstName}
                        onChange={(e) => handleFieldChange('firstName', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Enter your first name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        type="text"
                        value={userDetails.lastName}
                        onChange={(e) => handleFieldChange('lastName', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={userDetails.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={userDetails.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </label>
                      <input
                        type="text"
                        value={userDetails.location}
                        onChange={(e) => handleFieldChange('location', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Position / Role
                    </label>
                    <input
                      type="text"
                      value={userDetails.position}
                      onChange={(e) => handleFieldChange('position', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="e.g., Project Manager, Developer"
                    />
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Timezone
                      </label>
                      <select
                        value={userDetails.timezone}
                        onChange={(e) => handleFieldChange('timezone', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Europe/London">London</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Language
                      </label>
                      <select
                        value={userDetails.language}
                        onChange={(e) => handleFieldChange('language', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="ja">Japanese</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bio</h3>
                  <textarea
                    value={userDetails.bio}
                    onChange={(e) => handleFieldChange('bio', e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Tell us about yourself..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Brief description for your profile. Max 500 characters.
                  </p>
                </div>
              </div>
            </div>

            {/* Unsaved Changes Banner */}
            {isDirty && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl animate-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">You have unsaved changes</p>
                      <p className="text-sm text-gray-600">Don't forget to save your changes</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Now'}
                  </button>
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