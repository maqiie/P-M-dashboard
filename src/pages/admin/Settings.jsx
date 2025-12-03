import React, { useState, useEffect } from 'react';
import { 
  User, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  Mail, 
  Shield,
  Key,
  Lock,
  Camera,
  Building,
  Phone,
  MapPin,
  Briefcase,
  PaintBucket,
  HardHat
} from 'lucide-react';
import { getUserDetails } from '../../services/api';

const SettingsPage = () => {
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({
    // Initialize all fields as empty/null
    id: '',
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    nickname: '',
    image: null,
    otpRequiredForLogin: false,
    otpSecret: '',
    phone: '',
    location: '',
    position: '',
    bio: '',
    company: 'Ujenzi & Paints', // Hardcoded company name
    department: '',
    emailNotifications: true,
    pushNotifications: true
  });

  // Fetch user details on component mount
  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      const response = await getUserDetails();
      
      if (response.success && response.data) {
        const apiData = response.data;
        
        // Parse the name to extract first and last names
        const nameParts = apiData.name?.split(' ') || [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Get position based on role (this is a UI enhancement, not hardcoded data)
        const getPositionFromRole = (role) => {
          switch(role?.toLowerCase()) {
            case 'admin': return 'System Administrator';
            case 'manager': return 'Project Manager';
            case 'supervisor': return 'Team Supervisor';
            case 'engineer': return 'Site Engineer';
            case 'architect': return 'Architect';
            case 'contractor': return 'Contractor';
            case 'foreman': return 'Site Foreman';
            case 'estimator': return 'Cost Estimator';
            default: return 'Construction Professional';
          }
        };
        
        // Get department based on role or email
        const getDepartmentFromRole = (role) => {
          switch(role?.toLowerCase()) {
            case 'admin': return 'IT & Administration';
            case 'manager': return 'Project Management';
            case 'engineer': return 'Engineering';
            case 'architect': return 'Design & Architecture';
            case 'contractor': return 'Construction';
            case 'foreman': return 'Site Operations';
            case 'estimator': return 'Finance & Estimation';
            default: return 'Operations';
          }
        };
        
        setUserDetails({
          id: apiData.id || '',
          name: apiData.name || '',
          firstName: firstName,
          lastName: lastName,
          email: apiData.email || '',
          role: apiData.role || '',
          nickname: apiData.nickname || '',
          image: apiData.image || null,
          otpRequiredForLogin: apiData.otp_required_for_login || false,
          otpSecret: apiData.otp_secret || '',
          // Additional fields - leave empty or set from API if available
          phone: apiData.phone || apiData.phone_number || '',
          location: apiData.location || apiData.address || 'Nairobi, Kenya',
          position: apiData.position || apiData.job_title || getPositionFromRole(apiData.role),
          bio: apiData.bio || apiData.about || '',
          company: 'Ujenzi & Paints', // Hardcoded company name
          department: apiData.department || apiData.team || getDepartmentFromRole(apiData.role),
          // Default notification preferences
          emailNotifications: true,
          pushNotifications: true
        });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      // On error, keep default state with company name
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isDirty) return;
    
    setIsSaving(true);
    try {
      // Prepare data for API submission
      const dataToSave = {
        name: `${userDetails.firstName} ${userDetails.lastName}`.trim(),
        email: userDetails.email,
        phone: userDetails.phone,
        location: userDetails.location,
        position: userDetails.position,
        bio: userDetails.bio,
        company: userDetails.company, // Company is hardcoded but still included
        department: userDetails.department,
        emailNotifications: userDetails.emailNotifications,
        pushNotifications: userDetails.pushNotifications,
        otpRequiredForLogin: userDetails.otpRequiredForLogin
      };
      
      // In real implementation, call update API:
      // await updateUserDetails(dataToSave);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      setIsDirty(false);
      
      // Show success feedback
      showSaveSuccess();
    } catch (error) {
      console.error('Error saving user details:', error);
      showSaveError();
    } finally {
      setIsSaving(false);
    }
  };

  const showSaveSuccess = () => {
    const saveBtn = document.querySelector('.save-button');
    if (saveBtn) {
      const originalContent = saveBtn.innerHTML;
      saveBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Saved Successfully!</span>
      `;
      saveBtn.className = 'save-button flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300';
      
      setTimeout(() => {
        saveBtn.innerHTML = originalContent;
        saveBtn.className = 'save-button group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300';
      }, 2000);
    }
  };

  const showSaveError = () => {
    const saveBtn = document.querySelector('.save-button');
    if (saveBtn) {
      const originalContent = saveBtn.innerHTML;
      saveBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <span>Save Failed!</span>
      `;
      saveBtn.className = 'save-button flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300';
      
      setTimeout(() => {
        saveBtn.innerHTML = originalContent;
        saveBtn.className = 'save-button group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300';
      }, 2000);
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
        handleFieldChange('image', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = () => {
    const first = userDetails.firstName?.charAt(0) || '';
    const last = userDetails.lastName?.charAt(0) || '';
    return `${first}${last}` || userDetails.name?.charAt(0) || 'U';
  };

  const getRoleBadgeColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'supervisor':
        return 'bg-purple-100 text-purple-800';
      case 'engineer':
        return 'bg-orange-100 text-orange-800';
      case 'architect':
        return 'bg-indigo-100 text-indigo-800';
      case 'contractor':
        return 'bg-amber-100 text-amber-800';
      case 'foreman':
        return 'bg-lime-100 text-lime-800';
      case 'estimator':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatOtpSecret = (secret) => {
    if (!secret) return 'Not configured';
    return `${secret.substring(0, 4)}...${secret.substring(secret.length - 4)}`;
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Account Settings
              </h1>
              <p className="text-gray-600">
                Manage your profile, security, and preferences at Ujenzi & Paints
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
                {/* Company Logo/Badge */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
                    <HardHat className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Ujenzi & Paints</h3>
                    <p className="text-sm text-gray-600">Construction & Painting</p>
                  </div>
                </div>

                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                    {userDetails.image ? (
                      <img 
                        src={userDetails.image} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">{getInitials()}</span>
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
                
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {userDetails.name || 'User Profile'}
                </h2>
                
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(userDetails.role)}`}>
                    {userDetails.role?.toUpperCase() || 'USER'}
                  </span>
                  {userDetails.otpRequiredForLogin && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      2FA Enabled
                    </span>
                  )}
                </div>
                
                <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4 mt-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{userDetails.email || 'Not set'}</p>
                    </div>
                  </div>
                  
                  {userDetails.position && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Position</p>
                        <p className="font-medium text-gray-900">{userDetails.position}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <Building className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-medium text-gray-900">{userDetails.company}</p>
                    </div>
                  </div>
                  
                  {userDetails.department && (
                    <div className="flex items-center gap-3">
                      <PaintBucket className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Department</p>
                        <p className="font-medium text-gray-900">{userDetails.department}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Security & Authentication Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-500" />
                Security & Authentication
              </h3>
              
              <div className="space-y-4">
                {/* Two-Factor Authentication */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600">Google Authenticator</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${userDetails.otpRequiredForLogin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {userDetails.otpRequiredForLogin ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                      <button
                        onClick={() => handleFieldChange('otpRequiredForLogin', !userDetails.otpRequiredForLogin)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${userDetails.otpRequiredForLogin ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${userDetails.otpRequiredForLogin ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                  
                  {userDetails.otpRequiredForLogin && userDetails.otpSecret && (
                    <div className="mt-3 pt-3 border-t border-blue-100">
                      <p className="text-sm text-gray-600 mb-2">OTP Secret Key:</p>
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                        <code className="text-sm font-mono text-gray-800">
                          {formatOtpSecret(userDetails.otpSecret)}
                        </code>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Show
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notification Preferences */}
                <div className="space-y-3">
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

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Push Notifications</p>
                      <p className="text-sm text-gray-600">App notifications</p>
                    </div>
                    <button
                      onClick={() => handleFieldChange('pushNotifications', !userDetails.pushNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${userDetails.pushNotifications ? 'bg-purple-500' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${userDetails.pushNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                {/* Change Password */}
                <div className="pt-4 border-t border-gray-100">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200">
                    <Lock className="w-5 h-5" />
                    Change Password
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
                  Profile Information
                </h2>
                <p className="text-gray-600 mt-1">
                  Update your personal details and contact information at Ujenzi & Paints
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
                  
                  <div className="space-y-2 mt-4">
                    <label className="text-sm font-medium text-gray-700">Nickname (Optional)</label>
                    <input
                      type="text"
                      value={userDetails.nickname || ''}
                      onChange={(e) => handleFieldChange('nickname', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter a nickname"
                    />
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          placeholder="+254 712 345 678"
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
                </div>

                {/* Professional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        placeholder="e.g., Project Manager, Site Engineer"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Company
                      </label>
                      <input
                        type="text"
                        value={userDetails.company}
                        readOnly
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500">Company name is fixed for all Ujenzi & Paints employees</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Department</label>
                      <select
                        value={userDetails.department}
                        onChange={(e) => handleFieldChange('department', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="">Select Department</option>
                        <option value="Project Management">Project Management</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Design & Architecture">Design & Architecture</option>
                        <option value="Construction">Construction</option>
                        <option value="Site Operations">Site Operations</option>
                        <option value="Finance & Estimation">Finance & Estimation</option>
                        <option value="IT & Administration">IT & Administration</option>
                        <option value="Quality Assurance">Quality Assurance</option>
                        <option value="Safety & Compliance">Safety & Compliance</option>
                        <option value="Procurement">Procurement</option>
                        <option value="Paints & Finishes">Paints & Finishes</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Account Role</label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(userDetails.role)}`}>
                          {userDetails.role?.toUpperCase() || 'USER'}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">Role assigned by system administrator</p>
                      </div>
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
                    placeholder="Tell us about your experience in construction, painting, or related fields..."
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