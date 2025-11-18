import React, { useState, useEffect } from 'react';
import {
  CheckSquare, Plus, Search, Filter, Clock, Calendar, Users,
  AlertTriangle, Flag, Star, Eye, Edit, Trash2, MoreVertical,
  CheckCircle, Circle, PlayCircle, Pause, Target, User,
  Building2, Tag, MessageSquare, Paperclip, ChevronDown, Loader, Menu
} from 'lucide-react';
// Import your API functions
import { tasksAPI, projectsAPI } from '../../services/api';

// Import Sidebar
import AdminSidebar from './AdminSidebar';
const TasksPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [viewMode, setViewMode] = useState('list');
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'on_hold', label: 'On Hold' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  // Fetch tasks and projects data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [tasksResponse, projectsResponse] = await Promise.allSettled([
          tasksAPI.getAll(),
          projectsAPI.getAll()
        ]);

        let tasksData = [];
        if (tasksResponse.status === 'fulfilled') {
          const tasks = tasksResponse.value?.tasks || tasksResponse.value?.data || tasksResponse.value || [];
          tasksData = Array.isArray(tasks) ? tasks : [];
        }

        let projectsData = [];
        if (projectsResponse.status === 'fulfilled') {
          const projects = projectsResponse.value?.projects || projectsResponse.value?.data || projectsResponse.value || [];
          projectsData = Array.isArray(projects) ? projects : [];
        }

        setTasks(tasksData);
        setProjects(['All Projects', ...projectsData.map(p => p.title || p.name || 'Untitled Project')]);
        setError(null);
      } catch (err) {
        setError('Failed to load tasks. Please try again.');
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'in-progress':
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
      case 'on_hold': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Circle className="h-3 w-3" />;
      case 'in-progress':
      case 'in_progress': return <PlayCircle className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'overdue': return <AlertTriangle className="h-3 w-3" />;
      case 'on_hold': return <Pause className="h-3 w-3" />;
      default: return <Circle className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
      case 'urgent': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    const deadline = new Date(dueDate);
    return deadline < today && deadline.toDateString() !== today.toDateString();
  };

  const normalizeStatus = (status) => {
    if (status === 'in_progress') return 'in-progress';
    return status;
  };

  const filteredTasks = tasks
    .filter(task => {
      const searchText = [
        task.title || '',
        task.description || '',
        task.assignee || task.assigned_to || '',
        task.project || task.project_name || ''
      ].join(' ').toLowerCase();
      
      const matchesSearch = searchText.includes(searchQuery.toLowerCase());
      const taskStatus = normalizeStatus(task.status);
      const matchesStatus = statusFilter === 'all' || taskStatus === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const taskProject = task.project || task.project_name || '';
      const matchesProject = projectFilter === 'all' || projectFilter === 'All Projects' || taskProject === projectFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate': 
          const dueDateA = a.due_date || a.dueDate || a.deadline;
          const dueDateB = b.due_date || b.dueDate || b.deadline;
          if (!dueDateA && !dueDateB) return 0;
          if (!dueDateA) return 1;
          if (!dueDateB) return -1;
          return new Date(dueDateA) - new Date(dueDateB);
        case 'priority': 
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'progress': 
          return (b.progress || 0) - (a.progress || 0);
        default: 
          return (a.title || '').localeCompare(b.title || '');
      }
    });

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress' || t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => isOverdue(t.due_date || t.dueDate || t.deadline)).length
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-xl text-gray-600">Loading tasks...</p>
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
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Tasks</h1>
                <p className="text-sm text-gray-600">Track and manage all project tasks</p>
              </div>
            </div>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
              <CheckSquare className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{taskStats.total}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
              <Circle className="h-6 w-6 text-orange-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{taskStats.pending}</p>
              <p className="text-xs text-gray-600">Pending</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
              <PlayCircle className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{taskStats.inProgress}</p>
              <p className="text-xs text-gray-600">In Progress</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{taskStats.completed}</p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
              <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{taskStats.overdue}</p>
              <p className="text-xs text-gray-600">Overdue</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="sm:col-span-2 lg:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
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
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                {projects.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="dueDate">Sort: Due Date</option>
                <option value="priority">Sort: Priority</option>
                <option value="progress">Sort: Progress</option>
                <option value="title">Sort: Title</option>
              </select>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const dueDate = task.due_date || task.dueDate || task.deadline;
              const assignee = task.assignee || task.assigned_to || 'Unassigned';
              const projectName = task.project || task.project_name || 'No Project';
              const progress = task.progress || task.completion_percentage || 0;
              
              return (
                <div key={task.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Main Task Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(task.status)}
                            <span className="capitalize">{(task.status || '').replace(/[-_]/g, ' ')}</span>
                          </div>
                        </span>
                        {isOverdue(dueDate) && task.status !== 'completed' && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            OVERDUE
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-base font-bold text-gray-900 truncate mb-1">{task.title}</h3>
                      <p className="text-xs text-gray-600 line-clamp-1 mb-2">{task.description || 'No description'}</p>
                      
                      {/* Progress Bar */}
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-500">Progress</span>
                          <span className="text-xs font-bold text-gray-900">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Task Details */}
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate max-w-[100px]">{projectName}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-600">
                          <User className="h-3 w-3" />
                          <span className="truncate max-w-[80px]">{assignee}</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${isOverdue(dueDate) && task.status !== 'completed' ? 'text-red-600' : 'text-gray-600'}`}>
                          <Calendar className="h-3 w-3" />
                          <span>{dueDate ? new Date(dueDate).toLocaleDateString() : 'No date'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <button className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-xs font-semibold">
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </button>
                      <button className="flex items-center space-x-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all text-xs font-semibold">
                        <Edit className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                      <button className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredTasks.length === 0 && !loading && (
            <div className="text-center py-12">
              <CheckSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No tasks found</h3>
              <p className="text-sm text-gray-600 mb-6">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? "Try adjusting your filters" 
                  : "Create your first task to get started"
                }
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
                Create New Task
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;