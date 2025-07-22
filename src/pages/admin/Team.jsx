import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Search, Filter, Mail, Phone, MapPin, Calendar,
  Award, TrendingUp, Clock, CheckCircle, Building2, Star,
  Edit, Eye, MoreVertical, Target, Activity, Shield, Crown,
  Briefcase, GraduationCap, MessageCircle, UserPlus, Loader,
  AlertTriangle
} from 'lucide-react';

// Import your API functions
import { 
  fetchProjectManagers, 
  supervisorsAPI, 
  siteManagersAPI, 
  teamMembersAPI 
} from '../../services/api';

const TeamPage = ({ sidebarCollapsed = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch team members data from API
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        
        // Fetch all team member types in parallel
        const [projectManagersData, supervisorsData, siteManagersData] = await Promise.allSettled([
          fetchProjectManagers(),
          supervisorsAPI.getAll(),
          siteManagersAPI.getAll()
        ]);

        let allTeamMembers = [];

        // Process Project Managers
        if (projectManagersData.status === 'fulfilled') {
          const managers = Array.isArray(projectManagersData.value) ? projectManagersData.value : [];
          const normalizedManagers = managers.map(manager => ({
            id: `pm_${manager.id}`,
            name: manager.name || manager.full_name || `${manager.first_name || ''} ${manager.last_name || ''}`.trim() || 'Unnamed Manager',
            role: 'Project Manager',
            roleType: 'project_manager',
            department: 'Management',
            email: manager.email || 'No email provided',
            phone: manager.phone || manager.phone_number || 'No phone provided',
            avatar: getInitials(manager.name || manager.full_name || `${manager.first_name || ''} ${manager.last_name || ''}`),
            status: manager.status || (manager.active ? 'active' : 'inactive'),
            location: manager.location || manager.office_location || 'Main Office',
            joinDate: manager.created_at || manager.join_date || manager.hire_date,
            currentProjects: manager.current_projects || manager.projects || [],
            completedProjects: manager.completed_projects_count || manager.projects_completed || 0,
            tasksCompleted: manager.tasks_completed || manager.completed_tasks || 0,
            efficiency: manager.efficiency || manager.performance_rating || 85,
            hoursThisMonth: manager.hours_this_month || manager.monthly_hours || 0,
            certification: manager.certifications || manager.certificates || [],
            specialties: manager.specialties || manager.skills || ['Project Management'],
            rating: manager.rating || manager.performance_score || 4.0,
            experience: manager.experience_years ? `${manager.experience_years} years` : manager.experience || 'Not specified',
            ...manager
          }));
          allTeamMembers = [...allTeamMembers, ...normalizedManagers];
        }

        // Process Supervisors
        if (supervisorsData.status === 'fulfilled') {
          const supervisors = Array.isArray(supervisorsData.value) ? supervisorsData.value : [];
          const normalizedSupervisors = supervisors.map(supervisor => ({
            id: `sup_${supervisor.id}`,
            name: supervisor.name || supervisor.full_name || `${supervisor.first_name || ''} ${supervisor.last_name || ''}`.trim() || 'Unnamed Supervisor',
            role: 'Site Supervisor',
            roleType: 'supervisor',
            department: 'Operations',
            email: supervisor.email || 'No email provided',
            phone: supervisor.phone || supervisor.phone_number || 'No phone provided',
            avatar: getInitials(supervisor.name || supervisor.full_name || `${supervisor.first_name || ''} ${supervisor.last_name || ''}`),
            status: supervisor.status || (supervisor.active ? 'active' : 'inactive'),
            location: supervisor.location || supervisor.site_location || 'Field Site',
            joinDate: supervisor.created_at || supervisor.join_date || supervisor.hire_date,
            currentProjects: supervisor.current_projects || supervisor.projects || [],
            completedProjects: supervisor.completed_projects_count || supervisor.projects_completed || 0,
            tasksCompleted: supervisor.tasks_completed || supervisor.completed_tasks || 0,
            efficiency: supervisor.efficiency || supervisor.performance_rating || 85,
            hoursThisMonth: supervisor.hours_this_month || supervisor.monthly_hours || 0,
            certification: supervisor.certifications || supervisor.certificates || [],
            specialties: supervisor.specialties || supervisor.skills || ['Site Management'],
            rating: supervisor.rating || supervisor.performance_score || 4.0,
            experience: supervisor.experience_years ? `${supervisor.experience_years} years` : supervisor.experience || 'Not specified',
            ...supervisor
          }));
          allTeamMembers = [...allTeamMembers, ...normalizedSupervisors];
        }

        // Process Site Managers
        if (siteManagersData.status === 'fulfilled') {
          const siteManagers = Array.isArray(siteManagersData.value) ? siteManagersData.value : [];
          const normalizedSiteManagers = siteManagers.map(siteManager => ({
            id: `sm_${siteManager.id}`,
            name: siteManager.name || siteManager.full_name || `${siteManager.first_name || ''} ${siteManager.last_name || ''}`.trim() || 'Unnamed Site Manager',
            role: 'Site Manager',
            roleType: 'site_manager',
            department: 'Site Management',
            email: siteManager.email || 'No email provided',
            phone: siteManager.phone || siteManager.phone_number || 'No phone provided',
            avatar: getInitials(siteManager.name || siteManager.full_name || `${siteManager.first_name || ''} ${siteManager.last_name || ''}`),
            status: siteManager.status || (siteManager.active ? 'active' : 'inactive'),
            location: siteManager.location || siteManager.site_location || 'Construction Site',
            joinDate: siteManager.created_at || siteManager.join_date || siteManager.hire_date,
            currentProjects: siteManager.current_projects || siteManager.projects || [],
            completedProjects: siteManager.completed_projects_count || siteManager.projects_completed || 0,
            tasksCompleted: siteManager.tasks_completed || siteManager.completed_tasks || 0,
            efficiency: siteManager.efficiency || siteManager.performance_rating || 85,
            hoursThisMonth: siteManager.hours_this_month || siteManager.monthly_hours || 0,
            certification: siteManager.certifications || siteManager.certificates || [],
            specialties: siteManager.specialties || siteManager.skills || ['Site Management'],
            rating: siteManager.rating || siteManager.performance_score || 4.0,
            experience: siteManager.experience_years ? `${siteManager.experience_years} years` : siteManager.experience || 'Not specified',
            ...siteManager
          }));
          allTeamMembers = [...allTeamMembers, ...normalizedSiteManagers];
        }

        setTeamMembers(allTeamMembers);
        setError(null);
      } catch (err) {
        setError('Failed to load team members. Please try again.');
        console.error('Error fetching team data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  // Helper function to get initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const words = name.trim().split(' ').filter(word => word.length > 0);
    if (words.length === 0) return 'U';
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  // Dynamic role options based on actual data
  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    ...Array.from(new Set(teamMembers.map(member => member.role)))
      .map(role => ({ value: role, label: role }))
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'on-leave', label: 'On Leave' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'on-leave': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'inactive': return 'bg-red-100 text-red-700 border-red-200';
      case 'suspended': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Project Manager': return <Crown className="h-6 w-6" />;
      case 'Site Supervisor': return <Shield className="h-6 w-6" />;
      case 'Site Manager': return <Building2 className="h-6 w-6" />;
      case 'Construction Foreman': return <Briefcase className="h-6 w-6" />;
      case 'Civil Engineer': return <GraduationCap className="h-6 w-6" />;
      case 'Electrical Contractor': return <Activity className="h-6 w-6" />;
      case 'Safety Inspector': return <Shield className="h-6 w-6" />;
      case 'Quality Control': return <Target className="h-6 w-6" />;
      case 'Architect': return <Building2 className="h-6 w-6" />;
      default: return <Users className="h-6 w-6" />;
    }
  };

  const filteredMembers = teamMembers
    .filter(member => {
      const searchText = [
        member.name || '',
        member.role || '',
        member.department || '',
        member.email || ''
      ].join(' ').toLowerCase();
      
      const matchesSearch = searchText.includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'efficiency': return (b.efficiency || 0) - (a.efficiency || 0);
        case 'experience': 
          const expA = parseInt(a.experience) || 0;
          const expB = parseInt(b.experience) || 0;
          return expB - expA;
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        case 'joinDate': 
          const dateA = a.joinDate ? new Date(a.joinDate) : new Date(0);
          const dateB = b.joinDate ? new Date(b.joinDate) : new Date(0);
          return dateB - dateA;
        default: return (a.name || '').localeCompare(b.name || '');
      }
    });

  const teamStats = {
    total: teamMembers.length,
    active: teamMembers.filter(m => m.status === 'active').length,
    onLeave: teamMembers.filter(m => m.status === 'on-leave').length,
    inactive: teamMembers.filter(m => m.status === 'inactive').length,
    avgEfficiency: teamMembers.length > 0 ? Math.round(teamMembers.reduce((sum, m) => sum + (m.efficiency || 0), 0) / teamMembers.length) : 0,
    totalHours: teamMembers.reduce((sum, m) => sum + (m.hoursThisMonth || 0), 0),
    avgRating: teamMembers.length > 0 ? (teamMembers.reduce((sum, m) => sum + (m.rating || 0), 0) / teamMembers.length).toFixed(1) : '0.0'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-2xl text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-2xl text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Main Content Area - adjusted for dynamic sidebar */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          sidebarCollapsed 
            ? 'lg:ml-16' // Collapsed sidebar (64px)
            : 'lg:ml-80' // Expanded sidebar (320px)
        }`}
      >
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8 lg:mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-2 lg:mb-4 tracking-tight">
                  Team
                </h1>
                <p className="text-lg lg:text-2xl text-gray-600 leading-relaxed">
                  Manage your construction team members and monitor their performance
                </p>
              </div>
              
              <button className="flex items-center space-x-3 px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg lg:text-xl font-semibold rounded-2xl hover:shadow-xl transition-all duration-300 whitespace-nowrap">
                <UserPlus className="h-5 w-5 lg:h-6 lg:w-6" />
                <span>Add Team Member</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-6 mb-8 lg:mb-12">
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <Users className="h-6 w-6 lg:h-10 lg:w-10 text-blue-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">{teamStats.total}</p>
              <p className="text-sm lg:text-lg text-gray-600">Total Members</p>
            </div>
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <CheckCircle className="h-6 w-6 lg:h-10 lg:w-10 text-green-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">{teamStats.active}</p>
              <p className="text-sm lg:text-lg text-gray-600">Active</p>
            </div>
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <Calendar className="h-6 w-6 lg:h-10 lg:w-10 text-orange-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">{teamStats.onLeave}</p>
              <p className="text-sm lg:text-lg text-gray-600">On Leave</p>
            </div>
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <TrendingUp className="h-6 w-6 lg:h-10 lg:w-10 text-purple-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">{teamStats.avgEfficiency}%</p>
              <p className="text-sm lg:text-lg text-gray-600">Avg Efficiency</p>
            </div>
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <Clock className="h-6 w-6 lg:h-10 lg:w-10 text-red-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">{teamStats.totalHours}</p>
              <p className="text-sm lg:text-lg text-gray-600">Hours This Month</p>
            </div>
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <Star className="h-6 w-6 lg:h-10 lg:w-10 text-yellow-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">{teamStats.avgRating}</p>
              <p className="text-sm lg:text-lg text-gray-600">Avg Rating</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-xl border border-gray-100 mb-8 lg:mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="lg:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 lg:h-6 lg:w-6 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search team members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 lg:pl-12 pr-4 py-3 lg:py-4 text-base lg:text-xl border-2 border-gray-200 rounded-xl lg:rounded-2xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-base lg:text-xl px-3 lg:px-4 py-3 lg:py-4 border-2 border-gray-200 rounded-xl lg:rounded-2xl focus:border-blue-500 focus:outline-none"
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-base lg:text-xl px-3 lg:px-4 py-3 lg:py-4 border-2 border-gray-200 rounded-xl lg:rounded-2xl focus:border-blue-500 focus:outline-none"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-base lg:text-xl px-3 lg:px-4 py-3 lg:py-4 border-2 border-gray-200 rounded-xl lg:rounded-2xl focus:border-blue-500 focus:outline-none"
              >
                <option value="name">Sort by Name</option>
                <option value="efficiency">Sort by Efficiency</option>
                <option value="experience">Sort by Experience</option>
                <option value="rating">Sort by Rating</option>
                <option value="joinDate">Sort by Join Date</option>
              </select>
            </div>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-8">
            {filteredMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                {/* Member Header */}
                <div className="flex items-start justify-between mb-4 lg:mb-6">
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg lg:text-xl">
                      {member.avatar}
                    </div>
                    <div>
                      <h3 className="text-lg lg:text-2xl font-bold text-gray-900">{member.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {getRoleIcon(member.role)}
                        <span className="text-sm lg:text-lg text-gray-600">{member.role}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-semibold border ${getStatusColor(member.status)}`}>
                      {(member.status || 'unknown').replace('-', ' ').toUpperCase()}
                    </span>
                    <button className="p-1 lg:p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
                      <MoreVertical className="h-4 w-4 lg:h-5 lg:w-5" />
                    </button>
                  </div>
                </div>

                {/* Member Stats */}
                <div className="grid grid-cols-2 gap-2 lg:gap-4 mb-4 lg:mb-6">
                  <div className="text-center p-2 lg:p-4 bg-blue-50 rounded-xl lg:rounded-2xl">
                    <p className="text-lg lg:text-2xl font-bold text-blue-600">{member.efficiency || 0}%</p>
                    <p className="text-xs lg:text-sm text-gray-600">Efficiency</p>
                  </div>
                  <div className="text-center p-2 lg:p-4 bg-green-50 rounded-xl lg:rounded-2xl">
                    <p className="text-lg lg:text-2xl font-bold text-green-600">{member.rating || 0}</p>
                    <p className="text-xs lg:text-sm text-gray-600">Rating</p>
                  </div>
                  <div className="text-center p-2 lg:p-4 bg-purple-50 rounded-xl lg:rounded-2xl">
                    <p className="text-lg lg:text-2xl font-bold text-purple-600">{member.completedProjects || 0}</p>
                    <p className="text-xs lg:text-sm text-gray-600">Projects</p>
                  </div>
                  <div className="text-center p-2 lg:p-4 bg-orange-50 rounded-xl lg:rounded-2xl">
                    <p className="text-lg lg:text-2xl font-bold text-orange-600">{member.tasksCompleted || 0}</p>
                    <p className="text-xs lg:text-sm text-gray-600">Tasks</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <Mail className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500" />
                    <span className="text-sm lg:text-lg text-gray-700 truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <Phone className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500" />
                    <span className="text-sm lg:text-lg text-gray-700">{member.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500" />
                    <span className="text-sm lg:text-lg text-gray-700">{member.location}</span>
                  </div>
                </div>

                {/* Current Projects */}
                <div className="mb-4 lg:mb-6">
                  <h4 className="text-sm lg:text-lg font-semibold text-gray-900 mb-2 lg:mb-3">Current Projects</h4>
                  {Array.isArray(member.currentProjects) && member.currentProjects.length > 0 ? (
                    <div className="space-y-1 lg:space-y-2">
                      {member.currentProjects.slice(0, 2).map((project, index) => (
                        <div key={index} className="flex items-center space-x-2 p-1 lg:p-2 bg-gray-50 rounded-lg">
                          <Building2 className="h-3 w-3 lg:h-4 lg:w-4 text-blue-500" />
                          <span className="text-xs lg:text-sm text-gray-700 truncate">{project}</span>
                        </div>
                      ))}
                      {member.currentProjects.length > 2 && (
                        <p className="text-xs text-gray-500">+{member.currentProjects.length - 2} more</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm">No active projects</p>
                  )}
                </div>

                {/* Specialties */}
                {Array.isArray(member.specialties) && member.specialties.length > 0 && (
                  <div className="mb-4 lg:mb-6">
                    <h4 className="text-sm lg:text-lg font-semibold text-gray-900 mb-2 lg:mb-3">Specialties</h4>
                    <div className="flex flex-wrap gap-1 lg:gap-2">
                      {member.specialties.slice(0, 3).map((specialty, index) => (
                        <span key={index} className="px-2 lg:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs lg:text-sm font-medium">
                          {specialty}
                        </span>
                      ))}
                      {member.specialties.length > 3 && (
                        <span className="text-xs text-gray-500">+{member.specialties.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {Array.isArray(member.certification) && member.certification.length > 0 && (
                  <div className="mb-4 lg:mb-6">
                    <h4 className="text-sm lg:text-lg font-semibold text-gray-900 mb-2 lg:mb-3">Certifications</h4>
                    <div className="flex flex-wrap gap-1 lg:gap-2">
                      {member.certification.slice(0, 2).map((cert, index) => (
                        <span key={index} className="px-2 lg:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs lg:text-sm font-medium">
                          <Award className="h-2 w-2 lg:h-3 lg:w-3 inline mr-1" />
                          {cert}
                        </span>
                      ))}
                      {member.certification.length > 2 && (
                        <span className="text-xs text-gray-500">+{member.certification.length - 2}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-2 lg:gap-4 mb-4 lg:mb-6 pt-3 lg:pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-500">Experience</p>
                    <p className="text-sm lg:text-lg font-semibold text-gray-900">{member.experience}</p>
                  </div>
                  <div>
                    <p className="text-xs lg:text-sm text-gray-500">Hours This Month</p>
                    <p className="text-sm lg:text-lg font-semibold text-gray-900">{member.hoursThisMonth || 0}h</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 lg:space-x-3">
                  <button className="flex-1 flex items-center justify-center space-x-1 lg:space-x-2 px-3 lg:px-4 py-2 lg:py-3 bg-blue-50 text-blue-600 rounded-lg lg:rounded-xl hover:bg-blue-100 transition-all">
                    <Eye className="h-4 w-4 lg:h-5 lg:w-5" />
                    <span className="text-sm lg:text-base font-semibold">Profile</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-1 lg:space-x-2 px-3 lg:px-4 py-2 lg:py-3 bg-green-50 text-green-600 rounded-lg lg:rounded-xl hover:bg-green-100 transition-all">
                    <MessageCircle className="h-4 w-4 lg:h-5 lg:w-5" />
                    <span className="text-sm lg:text-base font-semibold">Message</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredMembers.length === 0 && !loading && (
            <div className="text-center py-12 lg:py-16">
              <Users className="h-16 w-16 lg:h-24 lg:w-24 text-gray-300 mx-auto mb-4 lg:mb-6" />
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 lg:mb-4">No team members found</h3>
              <p className="text-lg lg:text-xl text-gray-600 mb-6 lg:mb-8">
                {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                  ? "Try adjusting your search or filter criteria" 
                  : "Get started by adding your first team member"
                }
              </p>
              <button className="px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg lg:text-xl font-semibold rounded-xl lg:rounded-2xl hover:shadow-xl transition-all duration-300">
                Add Team Member
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamPage;