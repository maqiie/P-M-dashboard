import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Search, Filter, Mail, Phone, MapPin, Calendar,
  Award, TrendingUp, Clock, CheckCircle, Building2, Star,
  Edit, Eye, MoreVertical, Target, Activity, Shield, Crown,
  Briefcase, GraduationCap, MessageCircle, UserPlus, Loader,
  AlertTriangle, Menu
} from 'lucide-react';
// Import your API functions
import { 
  fetchProjectManagers, 
  supervisorsAPI, 
  siteManagersAPI, 
  teamMembersAPI 
} from '../../services/api';

// Import Sidebar
import AdminSidebar from './AdminSidebar';
const TeamPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch team members data from API
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        
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
            email: manager.email || 'No email',
            phone: manager.phone || manager.phone_number || 'No phone',
            avatar: getInitials(manager.name || manager.full_name || `${manager.first_name || ''} ${manager.last_name || ''}`),
            status: manager.status || (manager.active ? 'active' : 'inactive'),
            location: manager.location || 'Main Office',
            joinDate: manager.created_at || manager.join_date,
            completedProjects: manager.completed_projects_count || 0,
            tasksCompleted: manager.tasks_completed || 0,
            efficiency: manager.efficiency || 85,
            rating: manager.rating || 4.0,
            experience: manager.experience_years ? `${manager.experience_years} yrs` : 'N/A',
          }));
          allTeamMembers = [...allTeamMembers, ...normalizedManagers];
        }

        // Process Supervisors
        if (supervisorsData.status === 'fulfilled') {
          const supervisors = Array.isArray(supervisorsData.value) ? supervisorsData.value : [];
          const normalizedSupervisors = supervisors.map(supervisor => ({
            id: `sup_${supervisor.id}`,
            name: supervisor.name || supervisor.full_name || `${supervisor.first_name || ''} ${supervisor.last_name || ''}`.trim() || 'Unnamed Supervisor',
            role: 'Supervisor',
            roleType: 'supervisor',
            department: 'Operations',
            email: supervisor.email || 'No email',
            phone: supervisor.phone || supervisor.phone_number || 'No phone',
            avatar: getInitials(supervisor.name || supervisor.full_name || `${supervisor.first_name || ''} ${supervisor.last_name || ''}`),
            status: supervisor.status || (supervisor.active ? 'active' : 'inactive'),
            location: supervisor.location || 'Field Site',
            joinDate: supervisor.created_at || supervisor.join_date,
            completedProjects: supervisor.completed_projects_count || 0,
            tasksCompleted: supervisor.tasks_completed || 0,
            efficiency: supervisor.efficiency || 85,
            rating: supervisor.rating || 4.0,
            experience: supervisor.experience_years ? `${supervisor.experience_years} yrs` : 'N/A',
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
            email: siteManager.email || 'No email',
            phone: siteManager.phone || siteManager.phone_number || 'No phone',
            avatar: getInitials(siteManager.name || siteManager.full_name || `${siteManager.first_name || ''} ${siteManager.last_name || ''}`),
            status: siteManager.status || (siteManager.active ? 'active' : 'inactive'),
            location: siteManager.location || 'Construction Site',
            joinDate: siteManager.created_at || siteManager.join_date,
            completedProjects: siteManager.completed_projects_count || 0,
            tasksCompleted: siteManager.tasks_completed || 0,
            efficiency: siteManager.efficiency || 85,
            rating: siteManager.rating || 4.0,
            experience: siteManager.experience_years ? `${siteManager.experience_years} yrs` : 'N/A',
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

  const getInitials = (name) => {
    if (!name) return 'U';
    const words = name.trim().split(' ').filter(word => word.length > 0);
    if (words.length === 0) return 'U';
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    ...Array.from(new Set(teamMembers.map(member => member.role)))
      .map(role => ({ value: role, label: role }))
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'on-leave', label: 'On Leave' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'on-leave': return 'bg-orange-100 text-orange-700';
      case 'inactive': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Project Manager': return <Crown className="h-4 w-4" />;
      case 'Supervisor': return <Shield className="h-4 w-4" />;
      case 'Site Manager': return <Building2 className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const filteredMembers = teamMembers
    .filter(member => {
      const searchText = [
        member.name || '',
        member.role || '',
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
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        default: return (a.name || '').localeCompare(b.name || '');
      }
    });

  const teamStats = {
    total: teamMembers.length,
    active: teamMembers.filter(m => m.status === 'active').length,
    avgEfficiency: teamMembers.length > 0 ? Math.round(teamMembers.reduce((sum, m) => sum + (m.efficiency || 0), 0) / teamMembers.length) : 0,
    avgRating: teamMembers.length > 0 ? (teamMembers.reduce((sum, m) => sum + (m.rating || 0), 0) / teamMembers.length).toFixed(1) : '0.0'
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-xl text-gray-600">Loading team members...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-xl text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <Menu className="h-5 w-5 text-slate-700" />
              </button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Team</h1>
                <p className="text-sm text-gray-600">Manage team members and performance</p>
              </div>
            </div>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Member</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
              <Users className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{teamStats.total}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{teamStats.active}</p>
              <p className="text-xs text-gray-600">Active</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
              <TrendingUp className="h-6 w-6 text-purple-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{teamStats.avgEfficiency}%</p>
              <p className="text-xs text-gray-600">Efficiency</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
              <Star className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{teamStats.avgRating}</p>
              <p className="text-xs text-gray-600">Avg Rating</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="name">Sort: Name</option>
                <option value="efficiency">Sort: Efficiency</option>
                <option value="rating">Sort: Rating</option>
              </select>
            </div>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                {/* Member Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {member.avatar}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{member.name}</h3>
                      <div className="flex items-center space-x-1 text-xs text-gray-600">
                        {getRoleIcon(member.role)}
                        <span>{member.role}</span>
                      </div>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(member.status)}`}>
                    {(member.status || 'unknown').toUpperCase()}
                  </span>
                </div>

                {/* Member Stats */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <p className="text-sm font-bold text-blue-600">{member.efficiency}%</p>
                    <p className="text-[10px] text-gray-600">Efficiency</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <p className="text-sm font-bold text-green-600">{member.rating}</p>
                    <p className="text-[10px] text-gray-600">Rating</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded-lg">
                    <p className="text-sm font-bold text-purple-600">{member.completedProjects}</p>
                    <p className="text-[10px] text-gray-600">Projects</p>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded-lg">
                    <p className="text-sm font-bold text-orange-600">{member.tasksCompleted}</p>
                    <p className="text-[10px] text-gray-600">Tasks</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-1.5 mb-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-600 truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-600">{member.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-600">{member.location}</span>
                  </div>
                </div>

                {/* Experience */}
                <div className="flex justify-between items-center py-2 border-t border-gray-100 mb-3 text-xs">
                  <span className="text-gray-500">Experience</span>
                  <span className="font-semibold text-gray-900">{member.experience}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-xs font-semibold">
                    <Eye className="h-3 w-3" />
                    <span>Profile</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all text-xs font-semibold">
                    <MessageCircle className="h-3 w-3" />
                    <span>Message</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredMembers.length === 0 && !loading && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No team members found</h3>
              <p className="text-sm text-gray-600 mb-6">
                {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                  ? "Try adjusting your filters" 
                  : "Add your first team member to get started"
                }
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
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