import React, { useState, useEffect } from 'react';
import {
  Building2, Plus, Search, MapPin, Calendar,
  DollarSign, Clock, CheckCircle, AlertTriangle, Pause,
  MoreVertical, TrendingUp, Activity, Loader, Menu
} from 'lucide-react';
import { projectsAPI, supervisorsAPI, siteManagersAPI, fetchProjectManagers } from '../../services/api';
import AdminSidebar from './AdminSidebar';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const extractArray = (response) => {
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.projects && Array.isArray(response.projects)) return response.projects;
    if (response?.records && Array.isArray(response.records)) return response.records;
    return [];
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-blue-100 text-blue-700 border-blue-200',
      in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
      planning: 'bg-orange-100 text-orange-700 border-orange-200',
      paused: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: <Activity className="h-4 w-4" />,
      in_progress: <Activity className="h-4 w-4" />,
      completed: <CheckCircle className="h-4 w-4" />,
      planning: <Clock className="h-4 w-4" />,
      paused: <Pause className="h-4 w-4" />
    };
    return icons[status] || <AlertTriangle className="h-4 w-4" />;
  };

  const getStatusLabel = (status) => {
    const labels = {
      in_progress: 'In Progress',
      active: 'Active',
      completed: 'Completed',
      planning: 'Planning',
      paused: 'Paused'
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  const getProjectManagerName = (managerId) => {
    if (!managerId) return 'Not assigned';
    const manager = projectManagers.find(pm => pm.id === managerId);
    if (!manager) return `Manager #${managerId}`;
    return manager.name || manager.full_name || 
      (manager.first_name && manager.last_name ? `${manager.first_name} ${manager.last_name}` : `Manager #${managerId}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [projectsRes, managersRes, supervisorsRes, siteManagersRes] = await Promise.all([
          projectsAPI.getAll(),
          fetchProjectManagers(),
          supervisorsAPI.getAll ? supervisorsAPI.getAll() : supervisorsAPI(),
          siteManagersAPI.getAll ? siteManagersAPI.getAll() : siteManagersAPI()
        ]);

        setProjects(extractArray(projectsRes));
        setProjectManagers(extractArray(managersRes));
        setSupervisors(extractArray(supervisorsRes));
        setSiteManagers(extractArray(siteManagersRes));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load projects data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProjects = projects
    .filter(project => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        (project.title || '').toLowerCase().includes(searchLower) ||
        (project.location || '').toLowerCase().includes(searchLower) ||
        (project.description || '').toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'progress_percentage':
          return (b.progress_percentage || 0) - (a.progress_percentage || 0);
        case 'budget':
          return (b.budget || 0) - (a.budget || 0);
        case 'start_date':
          return new Date(b.start_date || 0) - new Date(a.start_date || 0);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        default:
          return (a.title || '').localeCompare(b.title || '');
      }
    });

  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active' || p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    planning: projects.filter(p => p.status === 'planning').length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    avgProgress: projects.length > 0 
      ? projects.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / projects.length 
      : 0
  };

  const formatBudget = (amount) => {
    if (!amount) return 'N/A';
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-xl text-gray-600">Loading projects...</p>
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
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

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
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Projects</h1>
                <p className="text-sm text-gray-600">Manage and monitor all construction projects</p>
              </div>
            </div>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Project</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <Building2 className="h-8 w-8 text-blue-500" />
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{projectStats.total}</p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <Activity className="h-8 w-8 text-green-500" />
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{projectStats.active}</p>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <DollarSign className="h-8 w-8 text-purple-500" />
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatBudget(projectStats.totalBudget)}
                  </p>
                  <p className="text-xs text-gray-600">Budget</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-8 w-8 text-orange-500" />
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{Math.round(projectStats.avgProgress)}%</p>
                  <p className="text-xs text-gray-600">Avg Progress</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
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
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>Sort: {option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <div 
                  key={project.id} 
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(project.priority)}`} />
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(project.status)}
                            <span className="capitalize">{getStatusLabel(project.status)}</span>
                          </div>
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 truncate">
                        {project.title || 'Untitled Project'}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {project.description || 'No description'}
                      </p>
                    </div>
                    
                    <button className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-gray-700">Progress</span>
                      <span className="text-xs font-bold text-gray-900">{project.progress_percentage || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress_percentage || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-2 mb-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-3 w-3 text-green-500" />
                        <span className="text-gray-600">Budget</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatBudget(project.budget)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-3 w-3 text-red-500" />
                        <span className="text-gray-600">Location</span>
                      </div>
                      <span className="font-semibold text-gray-900 truncate ml-2">
                        {project.location || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3 text-purple-500" />
                        <span className="text-gray-600">Deadline</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {project.finishing_date 
                          ? new Date(project.finishing_date).toLocaleDateString() 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Manager Info */}
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Manager</span>
                      <span className="font-semibold text-gray-900 truncate ml-2">
                        {getProjectManagerName(project.project_manager_id)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No projects found</h3>
              <p className="text-sm text-gray-600 mb-6">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Get started by creating your first project'}
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
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