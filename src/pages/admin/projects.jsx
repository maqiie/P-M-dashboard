import React, { useState, useEffect } from 'react';
import {
  Building2, Plus, Search, Filter, MapPin, Calendar, Users,
  DollarSign, Clock, CheckCircle, AlertTriangle, Pause,
  Eye, Edit, Trash2, MoreVertical, TrendingUp, Target,
  Activity, Star, ChevronRight
} from 'lucide-react';

const ProjectsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');

  const [projects] = useState([
    {
      id: 1,
      name: 'Downtown Office Complex',
      client: 'Metro Properties',
      status: 'active',
      progress: 68,
      budget: 2500000,
      spent: 1700000,
      startDate: '2024-01-15',
      endDate: '2024-12-20',
      location: 'Downtown, City Center',
      manager: 'John Smith',
      team: 12,
      priority: 'high',
      description: '15-story modern office building with retail space'
    },
    {
      id: 2,
      name: 'Riverside Residential',
      client: 'HomeBuilders Inc',
      status: 'active',
      progress: 45,
      budget: 1800000,
      spent: 810000,
      startDate: '2024-02-01',
      endDate: '2025-01-15',
      location: 'Riverside District',
      manager: 'Sarah Johnson',
      team: 8,
      priority: 'medium',
      description: '50-unit residential complex with amenities'
    },
    {
      id: 3,
      name: 'Industrial Warehouse',
      client: 'LogiCorp',
      status: 'completed',
      progress: 100,
      budget: 950000,
      spent: 920000,
      startDate: '2023-09-01',
      endDate: '2024-03-30',
      location: 'Industrial Zone',
      manager: 'Mike Wilson',
      team: 6,
      priority: 'low',
      description: 'Large-scale warehouse and distribution center'
    },
    {
      id: 4,
      name: 'Shopping Mall Renovation',
      client: 'Retail Ventures',
      status: 'planning',
      progress: 15,
      budget: 3200000,
      spent: 480000,
      startDate: '2024-06-01',
      endDate: '2025-04-30',
      location: 'Westside Mall',
      manager: 'Emily Davis',
      team: 15,
      priority: 'high',
      description: 'Complete renovation of existing shopping center'
    },
    {
      id: 5,
      name: 'Bridge Construction',
      client: 'City Infrastructure',
      status: 'active',
      progress: 82,
      budget: 4500000,
      spent: 3690000,
      startDate: '2023-08-15',
      endDate: '2024-08-15',
      location: 'River Crossing',
      manager: 'David Chen',
      team: 20,
      priority: 'high',
      description: 'New pedestrian and vehicle bridge'
    },
    {
      id: 6,
      name: 'School Extension',
      client: 'Education Board',
      status: 'paused',
      progress: 35,
      budget: 1200000,
      spent: 420000,
      startDate: '2024-03-01',
      endDate: '2024-11-30',
      location: 'Education District',
      manager: 'Lisa Brown',
      team: 10,
      priority: 'medium',
      description: 'Additional classrooms and facilities'
    }
  ]);

  const statusOptions = [
    { value: 'all', label: 'All Projects' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'planning', label: 'Planning' },
    { value: 'paused', label: 'Paused' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Project Name' },
    { value: 'progress', label: 'Progress' },
    { value: 'budget', label: 'Budget' },
    { value: 'startDate', label: 'Start Date' },
    { value: 'priority', label: 'Priority' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'planning': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'paused': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Activity className="h-5 w-5" />;
      case 'completed': return <CheckCircle className="h-5 w-5" />;
      case 'planning': return <Clock className="h-5 w-5" />;
      case 'paused': return <Pause className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
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

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.manager.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'progress': return b.progress - a.progress;
        case 'budget': return b.budget - a.budget;
        case 'startDate': return new Date(b.startDate) - new Date(a.startDate);
        case 'priority': 
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default: return a.name.localeCompare(b.name);
      }
    });

  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    planning: projects.filter(p => p.status === 'planning').length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
    totalSpent: projects.reduce((sum, p) => sum + p.spent, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <h1 className="text-6xl font-bold text-gray-900 mb-4 tracking-tight">
              Projects
            </h1>
            <p className="text-2xl text-gray-600 leading-relaxed">
              Manage and monitor all construction projects from one central location
            </p>
          </div>
          
          <button className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-semibold rounded-2xl hover:shadow-xl transition-all duration-300">
            <Plus className="h-6 w-6" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Building2 className="h-12 w-12 text-blue-500" />
            <div className="text-right">
              <p className="text-4xl font-bold text-gray-900">{projectStats.total}</p>
              <p className="text-xl text-gray-600">Total Projects</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Activity className="h-12 w-12 text-green-500" />
            <div className="text-right">
              <p className="text-4xl font-bold text-gray-900">{projectStats.active}</p>
              <p className="text-xl text-gray-600">Active Projects</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-12 w-12 text-purple-500" />
            <div className="text-right">
              <p className="text-4xl font-bold text-gray-900">${(projectStats.totalBudget / 1000000).toFixed(1)}M</p>
              <p className="text-xl text-gray-600">Total Budget</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-12 w-12 text-orange-500" />
            <div className="text-right">
              <p className="text-4xl font-bold text-gray-900">{Math.round((projectStats.totalSpent / projectStats.totalBudget) * 100)}%</p>
              <p className="text-xl text-gray-600">Budget Used</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects, clients, managers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-xl border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-6 w-6 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xl px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xl px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>Sort by {option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
            {/* Project Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-4 h-4 rounded-full ${getPriorityColor(project.priority)}`} />
                  <span className={`px-4 py-2 rounded-full text-lg font-semibold border ${getStatusColor(project.status)}`}>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(project.status)}
                      <span className="capitalize">{project.status}</span>
                    </div>
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h3>
                <p className="text-lg text-gray-600">{project.description}</p>
              </div>
              
              <button className="p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
                <MoreVertical className="h-6 w-6" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-semibold text-gray-700">Progress</span>
                <span className="text-lg font-bold text-gray-900">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <span className="text-lg text-gray-600">Budget</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  ${(project.budget / 1000000).toFixed(1)}M
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-lg text-gray-600">Team</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{project.team} members</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-red-500" />
                  <span className="text-lg text-gray-600">Location</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{project.location}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <span className="text-lg text-gray-600">Deadline</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {new Date(project.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Client & Manager */}
            <div className="border-t border-gray-100 pt-6 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-semibold text-gray-700">Client</span>
                <span className="text-lg text-gray-900">{project.client}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Manager</span>
                <span className="text-lg text-gray-900">{project.manager}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all">
                <Eye className="h-5 w-5" />
                <span className="font-semibold">View</span>
              </button>
              <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all">
                <Edit className="h-5 w-5" />
                <span className="font-semibold">Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-16">
          <Building2 className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-gray-900 mb-4">No projects found</h3>
          <p className="text-xl text-gray-600 mb-8">Try adjusting your search or filter criteria</p>
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-semibold rounded-2xl hover:shadow-xl transition-all duration-300">
            Create New Project
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;