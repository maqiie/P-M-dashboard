import React, { useState, useEffect } from 'react';
import {
  Building2, Plus, Search, Filter, MapPin, Calendar, Users,
  DollarSign, Clock, CheckCircle, AlertTriangle, Pause,
  Eye, Edit, Trash2, MoreVertical, TrendingUp, Target,
  Activity, Star, ChevronRight, Loader
} from 'lucide-react';

// Import your actual API service
import { projectsAPI, supervisorsAPI, siteManagersAPI, fetchProjectManagers } from '../../services/api';

const ProjectsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [projects, setProjects] = useState([]);
  const [projectManagers, setProjectManagers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [siteManagers, setSiteManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statusOptions = [
    { value: 'all', label: 'All Projects' },
    { value: 'active', label: 'Active' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'planning', label: 'Planning' },
    { value: 'paused', label: 'Paused' }
  ];

  const sortOptions = [
    { value: 'title', label: 'Project Title' },
    { value: 'progress_percentage', label: 'Progress' },
    { value: 'budget', label: 'Budget' },
    { value: 'start_date', label: 'Start Date' },
    { value: 'priority', label: 'Priority' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'planning': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'paused': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'in_progress': return <Activity className="h-5 w-5" />;
      case 'completed': return <CheckCircle className="h-5 w-5" />;
      case 'planning': return <Clock className="h-5 w-5" />;
      case 'paused': return <Pause className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'in_progress': return 'In Progress';
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'planning': return 'Planning';
      case 'paused': return 'Paused';
      default: return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Helper functions to get names by ID
  const getProjectManagerName = (managerId) => {
    if (!managerId) return 'Not assigned';
    const manager = projectManagers.find(pm => pm.id === managerId);
    return manager ? (manager.name || manager.full_name || manager.first_name + ' ' + manager.last_name || `Manager #${managerId}`) : `Manager #${managerId}`;
  };

  const getSupervisorName = (supervisorId) => {
    if (!supervisorId) return 'Not assigned';
    const supervisor = supervisors.find(s => s.id === supervisorId);
    return supervisor ? (supervisor.name || supervisor.full_name || supervisor.first_name + ' ' + supervisor.last_name || `Supervisor #${supervisorId}`) : `Supervisor #${supervisorId}`;
  };

  const getSiteManagerName = (siteManagerId) => {
    if (!siteManagerId) return 'Not assigned';
    const siteManager = siteManagers.find(sm => sm.id === siteManagerId);
    return siteManager ? (siteManager.name || siteManager.full_name || siteManager.first_name + ' ' + siteManager.last_name || `Site Manager #${siteManagerId}`) : `Site Manager #${siteManagerId}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all required data
        const [projectsData, projectManagersData, supervisorsData, siteManagersData] = await Promise.all([
          projectsAPI.getAll(),
          fetchProjectManagers(),
          supervisorsAPI.getAll ? supervisorsAPI.getAll() : supervisorsAPI(),
          siteManagersAPI.getAll ? siteManagersAPI.getAll() : siteManagersAPI()
        ]);
        
        setProjects(projectsData);
        setProjectManagers(projectManagersData);
        setSupervisors(supervisorsData);
        setSiteManagers(siteManagersData);
        setError(null);
      } catch (err) {
        setError("Failed to load projects data. Please try again.");
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = (project.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (project.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (project.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'progress_percentage': return (b.progress_percentage || 0) - (a.progress_percentage || 0);
        case 'budget': return (b.budget || 0) - (a.budget || 0);
        case 'start_date': 
          const dateA = a.start_date ? new Date(a.start_date) : new Date(0);
          const dateB = b.start_date ? new Date(b.start_date) : new Date(0);
          return dateB - dateA;
        case 'priority': 
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        default: 
          const titleA = a.title || '';
          const titleB = b.title || '';
          return titleA.localeCompare(titleB);
      }
    });

  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active' || p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    planning: projects.filter(p => p.status === 'planning').length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    avgProgress: projects.length > 0 ? projects.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / projects.length : 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-2xl text-gray-600">Loading projects...</p>
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Main Content Area - adjusted for dynamic sidebar */}
      <div className="flex-1 transition-all duration-300 ease-in-out lg:ml-16 xl:ml-80">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8 lg:mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-2 lg:mb-4 tracking-tight">
                  Projects
                </h1>
                <p className="text-lg lg:text-2xl text-gray-600 leading-relaxed">
                  Manage and monitor all construction projects from one central location
                </p>
              </div>
              
              <button className="flex items-center space-x-3 px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg lg:text-xl font-semibold rounded-2xl hover:shadow-xl transition-all duration-300 whitespace-nowrap">
                <Plus className="h-5 w-5 lg:h-6 lg:w-6" />
                <span>New Project</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-8 mb-8 lg:mb-12">
            <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-2 lg:mb-4">
                <Building2 className="h-8 w-8 lg:h-12 lg:w-12 text-blue-500" />
                <div className="text-right">
                  <p className="text-2xl lg:text-4xl font-bold text-gray-900">{projectStats.total}</p>
                  <p className="text-sm lg:text-xl text-gray-600">Total Projects</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-2 lg:mb-4">
                <Activity className="h-8 w-8 lg:h-12 lg:w-12 text-green-500" />
                <div className="text-right">
                  <p className="text-2xl lg:text-4xl font-bold text-gray-900">{projectStats.active}</p>
                  <p className="text-sm lg:text-xl text-gray-600">Active Projects</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-2 lg:mb-4">
                <DollarSign className="h-8 w-8 lg:h-12 lg:w-12 text-purple-500" />
                <div className="text-right">
                  <p className="text-2xl lg:text-4xl font-bold text-gray-900">
                    ${projectStats.totalBudget > 0 ? (projectStats.totalBudget / 1000000).toFixed(1) : '0'}M
                  </p>
                  <p className="text-sm lg:text-xl text-gray-600">Total Budget</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-2 lg:mb-4">
                <TrendingUp className="h-8 w-8 lg:h-12 lg:w-12 text-orange-500" />
                <div className="text-right">
                  <p className="text-2xl lg:text-4xl font-bold text-gray-900">
                    {Math.round(projectStats.avgProgress)}%
                  </p>
                  <p className="text-sm lg:text-xl text-gray-600">Avg Progress</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-xl border border-gray-100 mb-8 lg:mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 lg:h-6 lg:w-6 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects, locations, descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 lg:pl-12 pr-4 py-3 lg:py-4 text-base lg:text-xl border-2 border-gray-200 rounded-xl lg:rounded-2xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 lg:h-6 lg:w-6 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-base lg:text-xl px-3 lg:px-4 py-2 lg:py-3 border-2 border-gray-200 rounded-lg lg:rounded-xl focus:border-blue-500 focus:outline-none min-w-0"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-base lg:text-xl px-3 lg:px-4 py-2 lg:py-3 border-2 border-gray-200 rounded-lg lg:rounded-xl focus:border-blue-500 focus:outline-none min-w-0"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>Sort by {option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-8">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4 lg:mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 lg:space-x-3 mb-2 lg:mb-3">
                      <div className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full ${getPriorityColor(project.priority)}`} />
                      <span className={`px-3 lg:px-4 py-1 lg:py-2 rounded-full text-sm lg:text-lg font-semibold border ${getStatusColor(project.status)}`}>
                        <div className="flex items-center space-x-1 lg:space-x-2">
                          {getStatusIcon(project.status)}
                          <span className="capitalize">{getStatusLabel(project.status)}</span>
                        </div>
                      </span>
                    </div>
                    <h3 className="text-lg lg:text-2xl font-bold text-gray-900 mb-1 lg:mb-2">{project.title || 'Untitled Project'}</h3>
                    <p className="text-sm lg:text-lg text-gray-600">{project.description || 'No description available'}</p>
                  </div>
                  
                  <button className="p-2 lg:p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
                    <MoreVertical className="h-5 w-5 lg:h-6 lg:w-6" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4 lg:mb-6">
                  <div className="flex justify-between items-center mb-2 lg:mb-3">
                    <span className="text-sm lg:text-lg font-semibold text-gray-700">Progress</span>
                    <span className="text-sm lg:text-lg font-bold text-gray-900">{project.progress_percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 lg:h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${project.progress_percentage || 0}%` }}
                    />
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-2 lg:space-y-4 mb-4 lg:mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <DollarSign className="h-4 w-4 lg:h-5 lg:w-5 text-green-500" />
                      <span className="text-sm lg:text-lg text-gray-600">Budget</span>
                    </div>
                    <span className="text-sm lg:text-lg font-semibold text-gray-900">
                      {project.budget ? `$${(project.budget / 1000000).toFixed(1)}M` : 'Not set'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <Target className="h-4 w-4 lg:h-5 lg:w-5 text-blue-500" />
                      <span className="text-sm lg:text-lg text-gray-600">Priority</span>
                    </div>
                    <span className={`text-sm lg:text-lg font-semibold capitalize ${
                      project.priority === 'high' ? 'text-red-600' : 
                      project.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {project.priority || 'Not set'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-red-500" />
                      <span className="text-sm lg:text-lg text-gray-600">Location</span>
                    </div>
                    <span className="text-sm lg:text-lg font-semibold text-gray-900 text-right">{project.location || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-purple-500" />
                      <span className="text-sm lg:text-lg text-gray-600">Start Date</span>
                    </div>
                    <span className="text-sm lg:text-lg font-semibold text-gray-900">
                      {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-orange-500" />
                      <span className="text-sm lg:text-lg text-gray-600">Deadline</span>
                    </div>
                    <span className="text-sm lg:text-lg font-semibold text-gray-900">
                      {project.finishing_date ? new Date(project.finishing_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Manager Info */}
                <div className="border-t border-gray-100 pt-4 lg:pt-6 mb-4 lg:mb-6">
                  <div className="flex justify-between items-center mb-2 lg:mb-3">
                    <span className="text-sm lg:text-lg font-semibold text-gray-700">Project Manager</span>
                    <span className="text-sm lg:text-lg text-gray-900 text-right">
                      {getProjectManagerName(project.project_manager_id)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2 lg:mb-3">
                    <span className="text-sm lg:text-lg font-semibold text-gray-700">Supervisor</span>
                    <span className="text-sm lg:text-lg text-gray-900 text-right">
                      {getSupervisorName(project.supervisor_id)}
                    </span>
                  </div>
                  {project.site_manager_id && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm lg:text-lg font-semibold text-gray-700">Site Manager</span>
                      <span className="text-sm lg:text-lg text-gray-900 text-right">
                        {getSiteManagerName(project.site_manager_id)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 lg:space-x-3">
                  <button className="flex-1 flex items-center justify-center space-x-1 lg:space-x-2 px-3 lg:px-4 py-2 lg:py-3 bg-blue-50 text-blue-600 rounded-lg lg:rounded-xl hover:bg-blue-100 transition-all">
                    <Eye className="h-4 w-4 lg:h-5 lg:w-5" />
                    <span className="text-sm lg:text-base font-semibold">View</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-1 lg:space-x-2 px-3 lg:px-4 py-2 lg:py-3 bg-green-50 text-green-600 rounded-lg lg:rounded-xl hover:bg-green-100 transition-all">
                    <Edit className="h-4 w-4 lg:h-5 lg:w-5" />
                    <span className="text-sm lg:text-base font-semibold">Edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProjects.length === 0 && !loading && (
            <div className="text-center py-12 lg:py-16">
              <Building2 className="h-16 w-16 lg:h-24 lg:w-24 text-gray-300 mx-auto mb-4 lg:mb-6" />
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 lg:mb-4">No projects found</h3>
              <p className="text-lg lg:text-xl text-gray-600 mb-6 lg:mb-8">
                {searchQuery || statusFilter !== 'all' 
                  ? "Try adjusting your search or filter criteria" 
                  : "Get started by creating your first project"
                }
              </p>
              <button className="px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg lg:text-xl font-semibold rounded-xl lg:rounded-2xl hover:shadow-xl transition-all duration-300">
                Create New Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;