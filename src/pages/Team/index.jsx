import React, { useState, useEffect } from 'react';
// Import the correct APIs from the updated api.js file
import { enhancedDashboardAPI, supervisorsAPI, siteManagersAPI, teamAPI } from '../../services/api';
import { 
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  TrendingUp,
  Building2,
  Briefcase,
  User,
  HardHat,
  Clipboard,
  Plus,
  Edit3,
  Trash2,
  Eye,
  X,
  Save
} from 'lucide-react';

const TeamPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Form state for new member
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    specialization: '',
    experience_years: 0,
    role: 'supervisor', // 'supervisor' or 'site_manager'
    availability: 'available',
    certifications: []
  });

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Starting to load team data...');
      
      // Use the enhanced team API that combines supervisors and site managers
      const [teamData, projectsData] = await Promise.allSettled([
        teamAPI.getAllTeamMembers(), // Use the combined team API
        enhancedDashboardAPI.getProjects()
      ]);
      
      if (teamData.status === 'fulfilled') {
        console.log('✅ Team data loaded successfully:', teamData.value);
        // Process and normalize the team data
        const processedTeamData = processTeamData(teamData.value);
        setTeamMembers(processedTeamData);
      } else {
        console.warn('❌ Failed to load team data:', teamData.reason);
        setTeamMembers(getMockTeamMembers());
        setError('Failed to load team data from server. Showing sample data.');
      }
      
      if (projectsData.status === 'fulfilled') {
        console.log('✅ Projects data loaded successfully:', projectsData.value);
        setProjects(projectsData.value);
      } else {
        console.warn('❌ Failed to load projects:', projectsData.reason);
        setProjects([]);
      }
      
    } catch (error) {
      console.error('❌ Error in loadTeamData:', error);
      setError('Failed to connect to server. Showing sample data.');
      setTeamMembers(getMockTeamMembers());
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Process team data from API to ensure consistent format
  const processTeamData = (rawTeamData) => {
    return rawTeamData.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone || 'N/A',
      location: member.location || 'N/A',
      role: member.role || (member.roleType === 'site_manager' ? 'Site Manager' : 'Supervisor'),
      roleType: member.roleType || member.role?.toLowerCase().replace(' ', '_'), // Keep original for filtering
      status: member.status || 'active',
      availability: member.availability || 'available',
      experience_years: member.experience_years || 0,
      specialization: member.specialization || 'General',
      current_projects: member.current_projects || [],
      projects_count: member.projects_count || member.current_projects?.length || 0,
      certifications: member.certifications || [],
      created_at: member.created_at,
      join_date: member.created_at,
      
      // Add computed fields for compatibility with existing UI
      department: member.department || (member.roleType === 'site_manager' ? 'Site Management' : 'Supervision'),
      performance_rating: member.performance_rating || 4.5, // Default rating since not in DB yet
      completed_projects: member.completed_projects || Math.floor(Math.random() * 10) + 5, // Mock data for now
      skills: member.skills || (member.specialization ? [member.specialization] : ['General Construction'])
    }));
  };

  // Mock data fallback (keep the existing function for fallback)
  const getMockTeamMembers = () => [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Project Manager",
      roleType: "project_manager",
      email: "sarah.johnson@company.com",
      phone: "+1 (555) 123-4567",
      location: "New York, NY",
      status: "active",
      join_date: "2023-01-15",
      experience_years: 8,
      current_projects: ["Downtown Plaza Development", "Smart City Infrastructure"],
      completed_projects: 12,
      skills: ["Project Management", "Leadership", "Risk Assessment", "Budgeting"],
      performance_rating: 4.8,
      availability: "available",
      department: "Construction Management",
      specialization: "Project Management",
      projects_count: 2
    },
    {
      id: 2,
      name: "John Davis",
      role: "Supervisor",
      roleType: "supervisor",
      email: "john.davis@company.com",
      phone: "+1 (555) 456-7890",
      location: "Denver, CO",
      status: "active",
      join_date: "2021-11-05",
      experience_years: 10,
      current_projects: ["Green Energy Initiative"],
      completed_projects: 15,
      skills: ["Site Management", "Safety Compliance", "Team Leadership", "Quality Assurance"],
      performance_rating: 4.9,
      availability: "available",
      department: "Operations",
      specialization: "Infrastructure Projects",
      projects_count: 1
    },
    {
      id: 3,
      name: "Mike Wilson",
      role: "Site Manager",
      roleType: "site_manager",
      email: "mike.wilson@company.com",
      phone: "+1 (555) 678-9012",
      location: "Chicago, IL",
      status: "active",
      join_date: "2020-09-18",
      experience_years: 12,
      current_projects: ["Highway Bridge Renovation"],
      completed_projects: 20,
      skills: ["Construction Planning", "Resource Management", "Contract Negotiation", "Cost Control"],
      performance_rating: 4.8,
      availability: "busy",
      department: "Construction Management",
      specialization: "Construction Management",
      projects_count: 1
    }
  ];

  // Filter team members based on search and filters
  const filteredTeamMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || 
                       (roleFilter === 'supervisor' && member.roleType === 'supervisor') ||
                       (roleFilter === 'site_manager' && member.roleType === 'site_manager') ||
                       member.role.toLowerCase().includes(roleFilter.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || member.availability === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Helper functions for UI
  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'busy': return 'bg-red-100 text-red-800 border-red-200';
      case 'vacation': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAvailabilityIcon = (availability) => {
    switch (availability) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'busy': return <AlertTriangle className="h-4 w-4" />;
      case 'vacation': return <Calendar className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getRoleIcon = (roleType) => {
    if (roleType === 'supervisor') return <HardHat className="h-5 w-5 text-blue-600" />;
    if (roleType === 'site_manager') return <Clipboard className="h-5 w-5 text-purple-600" />;
    if (roleType === 'project_manager') return <Briefcase className="h-5 w-5 text-green-600" />;
    return <User className="h-5 w-5" />;
  };

  // Calculate team statistics
  const teamStats = {
    totalMembers: teamMembers.length,
    supervisors: teamMembers.filter(m => m.roleType === 'supervisor').length,
    siteManagers: teamMembers.filter(m => m.roleType === 'site_manager').length,
    availableMembers: teamMembers.filter(m => m.availability === 'available').length,
    busyMembers: teamMembers.filter(m => m.availability === 'busy').length,
    onVacation: teamMembers.filter(m => m.availability === 'vacation').length,
    avgExperience: teamMembers.length > 0 ? 
      teamMembers.reduce((sum, m) => sum + m.experience_years, 0) / teamMembers.length : 0,
    avgRating: teamMembers.length > 0 ? 
      teamMembers.reduce((sum, m) => sum + (m.performance_rating || 4.5), 0) / teamMembers.length : 0
  };

  // Handle member actions
  const handleAddMember = () => {
    setShowAddModal(true);
    setNewMember({
      name: '',
      email: '',
      phone: '',
      location: '',
      specialization: '',
      experience_years: 0,
      role: 'supervisor',
      availability: 'available',
      certifications: []
    });
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewMember({
      name: '',
      email: '',
      phone: '',
      location: '',
      specialization: '',
      experience_years: 0,
      role: 'supervisor',
      availability: 'available',
      certifications: []
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMember(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    
    if (!newMember.name || !newMember.email) {
      alert('Please fill in all required fields (Name and Email).');
      return;
    }

    try {
      setCreating(true);
      console.log('🔄 Creating new member:', newMember);

      // Prepare data for API
      const memberData = {
        name: newMember.name,
        email: newMember.email,
        ...(newMember.phone && { phone: newMember.phone }),
        ...(newMember.location && { location: newMember.location }),
        ...(newMember.specialization && { specialization: newMember.specialization }),
        experience_years: parseInt(newMember.experience_years) || 0,
        ...(newMember.role === 'site_manager' && { 
          availability: newMember.availability,
          status: 'active',
          certifications: newMember.certifications.filter(cert => cert.trim() !== '')
        })
      };

      let createdMember;
      
      // Use the correct API functions
      if (newMember.role === 'supervisor') {
        createdMember = await supervisorsAPI.create(memberData);
        console.log('✅ Supervisor created:', createdMember);
      } else if (newMember.role === 'site_manager') {
        createdMember = await siteManagersAPI.create(memberData);
        console.log('✅ Site manager created:', createdMember);
      }

      // Reload team data to show the new member
      await loadTeamData();
      
      // Close modal and reset form
      handleCloseModal();
      
      alert(`${newMember.role === 'supervisor' ? 'Supervisor' : 'Site Manager'} created successfully!`);
      
    } catch (error) {
      console.error('❌ Failed to create member:', error);
      
      // Extract error message from response
      const errorMessage = error.response?.data?.errors?.join(', ') || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to create team member';
      
      alert(`Failed to create team member: ${errorMessage}`);
    } finally {
      setCreating(false);
    }
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    // You can implement edit modal here
    console.log('Edit member:', member);
  };

  const handleDeleteMember = async (member) => {
    if (window.confirm(`Are you sure you want to delete ${member.name}?`)) {
      try {
        console.log(`🗑️ Deleting ${member.roleType} with ID ${member.id}`);
        
        // Use the correct API functions
        if (member.roleType === 'supervisor') {
          await supervisorsAPI.delete(member.id);
        } else if (member.roleType === 'site_manager') {
          await siteManagersAPI.delete(member.id);
        }
        
        console.log('✅ Member deleted successfully');
        // Reload data after deletion
        await loadTeamData();
      } catch (error) {
        console.error('❌ Failed to delete member:', error);
        alert('Failed to delete team member. Please try again.');
      }
    }
  };

  const addCertification = () => {
    setNewMember(prev => ({
      ...prev,
      certifications: [...prev.certifications, '']
    }));
  };

  const updateCertification = (index, value) => {
    setNewMember(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => i === index ? value : cert)
    }));
  };

  const removeCertification = (index) => {
    setNewMember(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 font-semibold">Loading Team Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Overview</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage supervisors, site managers, and field personnel
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => loadTeamData()}
              className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 font-medium"
            >
              <Clock className="h-5 w-5 mr-2" />
              Refresh
            </button>
            <button 
              onClick={handleAddMember}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Add Member
            </button>
          </div>
        </div>
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{teamStats.totalMembers}</p>
              <p className="text-xs text-gray-600">Total Members</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <HardHat className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{teamStats.supervisors}</p>
              <p className="text-xs text-gray-600">Supervisors</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Clipboard className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{teamStats.siteManagers}</p>
              <p className="text-xs text-gray-600">Site Managers</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{teamStats.availableMembers}</p>
              <p className="text-xs text-gray-600">Available</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{teamStats.busyMembers}</p>
              <p className="text-xs text-gray-600">Busy</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{teamStats.avgExperience.toFixed(1)}</p>
              <p className="text-xs text-gray-600">Avg Experience</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="supervisor">Supervisors</option>
              <option value="site_manager">Site Managers</option>
              <option value="manager">Managers</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="vacation">On Vacation</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{filteredTeamMembers.length} members</span>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New Team Member</h2>
                <button 
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateMember} className="space-y-6">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={newMember.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="supervisor">Supervisor</option>
                    <option value="site_manager">Site Manager</option>
                  </select>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newMember.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={newMember.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={newMember.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={newMember.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={newMember.specialization}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Infrastructure Projects, Construction Management"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      name="experience_years"
                      value={newMember.experience_years}
                      onChange={handleInputChange}
                      min="0"
                      max="50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Site Manager specific fields */}
                {newMember.role === 'site_manager' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Availability
                      </label>
                      <select
                        name="availability"
                        value={newMember.availability}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="vacation">On Vacation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Certifications
                      </label>
                      <div className="space-y-2">
                        {newMember.certifications.map((cert, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={cert}
                              onChange={(e) => updateCertification(index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., PMP, OSHA 30, LEED AP"
                            />
                            <button
                              type="button"
                              onClick={() => removeCertification(index)}
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addCertification}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Certification
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Member
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Team Members Grid */}
      {filteredTeamMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTeamMembers.map((member) => (
            <div key={`${member.roleType}_${member.id}`} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 group">
              
              {/* Member Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{member.name}</h3>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(member.roleType)}
                      <span className="text-sm text-gray-600">{member.role}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => handleEditMember(member)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteMember(member)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Availability Status */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor(member.availability)}`}>
                  {getAvailabilityIcon(member.availability)}
                  <span className="ml-1 capitalize">{member.availability}</span>
                </span>
              </div>
              
              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {member.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  {member.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  {member.location}
                </div>
              </div>
              
              {/* Experience & Projects */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-bold text-gray-900 mb-1">{member.experience_years}y</div>
                  <span className="text-xs text-gray-600">Experience</span>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-bold text-gray-900 mb-1">{member.projects_count}</div>
                  <span className="text-xs text-gray-600">Projects</span>
                </div>
              </div>
              
              {/* Current Projects */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Projects</h4>
                {member.current_projects && member.current_projects.length > 0 ? (
                  <div className="space-y-1">
                    {member.current_projects.slice(0, 2).map((project, index) => (
                      <div key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {project}
                      </div>
                    ))}
                    {member.current_projects.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{member.current_projects.length - 2} more
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">No active projects</span>
                )}
              </div>
              
              {/* Specialization */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Specialization</h4>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {member.specialization}
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => handleEditMember(member)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </button>
                <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <Mail className="h-4 w-4 mr-1" />
                  Contact
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="mx-auto h-16 w-16 text-gray-300" />
          <p className="mt-4 text-lg text-gray-500">No team members found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default TeamPage;