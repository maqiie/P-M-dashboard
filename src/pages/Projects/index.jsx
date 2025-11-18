import React, { useState, useEffect } from 'react';
import {
  Building2, Plus, Search, Filter, MapPin, Calendar, Users,
  DollarSign, Clock, CheckCircle, AlertTriangle, Pause,
  Eye, Edit, Trash2, MoreVertical, TrendingUp, Target,
  Activity, Star, ChevronRight, Loader, BarChart3, Zap,
  Award, Gauge, RefreshCw, Grid3x3, List, X, ExternalLink,
  Sparkles, ArrowUpRight, TrendingDown, CircleDot, Menu
} from 'lucide-react';
// Import your actual API service
import { projectsAPI, supervisorsAPI, siteManagersAPI, fetchProjectManagers } from '../../services/api';

const ProjectsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [projects, setProjects] = useState([]);
  const [projectManagers, setProjectManagers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [siteManagers, setSiteManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statusOptions = [
    { value: 'all', label: 'All Projects', icon: Building2, color: 'gray' },
    { value: 'active', label: 'Active', icon: Activity, color: 'blue' },
    { value: 'in_progress', label: 'In Progress', icon: TrendingUp, color: 'blue' },
    { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'green' },
    { value: 'planning', label: 'Planning', icon: Clock, color: 'orange' },
    { value: 'paused', label: 'Paused', icon: Pause, color: 'red' }
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
      case 'in_progress': return <Activity className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'planning': return <Clock className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
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

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-20 blur-2xl animate-pulse"></div>
          </div>
          <p className="text-2xl text-gray-900 font-black mb-2">Loading Projects</p>
          <p className="text-sm text-gray-600 font-medium">Gathering your construction portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="relative inline-block mb-6">
            <AlertTriangle className="h-20 w-20 text-red-500" />
            <div className="absolute inset-0 bg-red-400/20 rounded-full blur-3xl animate-pulse"></div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-3">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Full-width container with proper padding */}
      <div className="w-full px-6 lg:px-12 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Building2 className="h-9 w-9 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Projects
                  </h1>
                  <p className="text-lg text-gray-600 mt-1">
                    {filteredProjects.length} of {projects.length} projects
                  </p>
                </div>
              </div>
            </div>
            
            <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-lg">
              <Plus className="h-6 w-6 mr-2" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - Full Width */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-3">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <p className="text-4xl font-black text-gray-900 mb-1">{projectStats.total}</p>
              <p className="text-sm text-gray-600 font-semibold">Total Projects</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg mb-3">
                <Activity className="h-7 w-7 text-white" />
              </div>
              <p className="text-4xl font-black text-gray-900 mb-1">{projectStats.active}</p>
              <p className="text-sm text-gray-600 font-semibold">Active</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-3">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
              <p className="text-4xl font-black text-gray-900 mb-1">{projectStats.completed}</p>
              <p className="text-sm text-gray-600 font-semibold">Completed</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg mb-3">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <p className="text-4xl font-black text-gray-900 mb-1">{projectStats.planning}</p>
              <p className="text-sm text-gray-600 font-semibold">Planning</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-3">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
              <p className="text-4xl font-black text-gray-900 mb-1">
                {projectStats.totalBudget > 0 ? `$${(projectStats.totalBudget / 1000000).toFixed(1)}M` : '$0'}
              </p>
              <p className="text-sm text-gray-600 font-semibold">Total Budget</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-3">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <p className="text-4xl font-black text-gray-900 mb-1">{Math.round(projectStats.avgProgress)}%</p>
              <p className="text-sm text-gray-600 font-semibold">Avg Progress</p>
            </div>
          </div>
        </div>

        {/* Filters and Search Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects, locations, descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 text-base border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent border-0 focus:outline-none text-sm font-semibold text-gray-700 cursor-pointer"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="bg-gray-50 rounded-2xl px-4 py-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-0 focus:outline-none text-sm font-semibold text-gray-700 cursor-pointer"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>Sort: {option.label}</option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-xl transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3x3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-xl transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid/List */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-24">
            <div className="relative inline-block mb-6">
              <Building2 className="h-32 w-32 text-gray-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
            </div>
            <h3 className="text-4xl font-black text-gray-900 mb-4">No projects found</h3>
            <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all' 
                ? "Try adjusting your search or filter criteria" 
                : "Get started by creating your first project"
              }
            </p>
            <button className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-xl">
              <Plus className="h-7 w-7 mr-3" />
              Create New Project
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredProjects.map((project) => (
              <div 
                key={project.id} 
                className="group bg-white rounded-3xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Priority Stripe */}
                <div className={`h-2 ${getPriorityColor(project.priority)} group-hover:h-3 transition-all duration-300`}></div>
                
                <div className="p-6">
                  {/* Project Header */}
                  <div className="mb-5">
                    <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {project.title || 'Untitled Project'}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{project.description || 'No description available'}</p>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                        <span>{getStatusLabel(project.status)}</span>
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${getPriorityBadgeColor(project.priority)}`}>
                        <Target className="h-3 w-3" />
                        <span className="capitalize">{project.priority || 'Medium'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-gray-700">Progress</span>
                      <span className="text-lg font-black text-gray-900">{project.progress_percentage || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${project.progress_percentage || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Project Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="flex items-start gap-2">
                      <DollarSign className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600 mb-0.5">Budget</p>
                        <p className="font-black text-gray-900 text-sm truncate">
                          {project.budget ? `$${(project.budget / 1000000).toFixed(1)}M` : 'Not set'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600 mb-0.5">Location</p>
                        <p className="font-black text-gray-900 text-sm truncate">{project.location || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600 mb-0.5">Start Date</p>
                        <p className="font-black text-gray-900 text-xs truncate">
                          {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600 mb-0.5">Deadline</p>
                        <p className="font-black text-gray-900 text-xs truncate">
                          {project.finishing_date ? new Date(project.finishing_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Team Info */}
                  <div className="border-t border-gray-100 pt-4 mb-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 font-semibold">Manager</span>
                      <span className="text-xs font-black text-gray-900 text-right truncate ml-2">
                        {getProjectManagerName(project.project_manager_id)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 font-semibold">Supervisor</span>
                      <span className="text-xs font-black text-gray-900 text-right truncate ml-2">
                        {getSupervisorName(project.supervisor_id)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all font-bold text-sm transform hover:scale-105">
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-xl hover:from-green-100 hover:to-green-200 transition-all font-bold text-sm transform hover:scale-105">
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;