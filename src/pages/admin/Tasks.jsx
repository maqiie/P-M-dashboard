import React, { useState, useEffect } from 'react';
import {
  CheckSquare, Plus, Search, Filter, Clock, Calendar, Users,
  AlertTriangle, Flag, Star, Eye, Edit, Trash2, MoreVertical,
  CheckCircle, Circle, PlayCircle, Pause, Target, User,
  Building2, Tag, MessageSquare, Paperclip, ChevronDown, Loader
} from 'lucide-react';

// Import your API functions
import { tasksAPI, projectsAPI } from '../../services/api';

const TasksPage = ({ sidebarCollapsed = false }) => {
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

  const statusOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'in_review', label: 'In Review' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  // Fetch tasks and projects data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch both tasks and projects in parallel
        const [tasksResponse, projectsResponse] = await Promise.allSettled([
          tasksAPI.getAll(),
          projectsAPI.getAll()
        ]);

        // Handle tasks data
        let tasksData = [];
        if (tasksResponse.status === 'fulfilled') {
          const tasks = tasksResponse.value?.tasks || tasksResponse.value?.data || tasksResponse.value || [];
          tasksData = Array.isArray(tasks) ? tasks : [];
        }

        // Handle projects data  
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
      case 'cancelled': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'on_hold': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in_review': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Circle className="h-5 w-5" />;
      case 'in-progress':
      case 'in_progress': return <PlayCircle className="h-5 w-5" />;
      case 'completed': return <CheckCircle className="h-5 w-5" />;
      case 'overdue': return <AlertTriangle className="h-5 w-5" />;
      case 'cancelled': return <Circle className="h-5 w-5" />;
      case 'on_hold': return <Pause className="h-5 w-5" />;
      case 'in_review': return <Eye className="h-5 w-5" />;
      default: return <Circle className="h-5 w-5" />;
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

  // Helper function - moved before it's used
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
          const priorityA = priorityOrder[a.priority] || 0;
          const priorityB = priorityOrder[b.priority] || 0;
          return priorityB - priorityA;
        case 'progress': 
          const progressA = a.progress || a.completion_percentage || 0;
          const progressB = b.progress || b.completion_percentage || 0;
          return progressB - progressA;
        case 'assignee': 
          const assigneeA = a.assignee || a.assigned_to || '';
          const assigneeB = b.assignee || b.assigned_to || '';
          return assigneeA.localeCompare(assigneeB);
        default: 
          const titleA = a.title || '';
          const titleB = b.title || '';
          return titleA.localeCompare(titleB);
      }
    });

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress' || t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status === 'overdue' || isOverdue(t.due_date || t.dueDate || t.deadline)).length,
    cancelled: tasks.filter(t => t.status === 'cancelled').length,
    totalHours: tasks.reduce((sum, t) => sum + (t.logged_hours || t.loggedHours || t.time_spent || 0), 0),
    avgProgress: tasks.length > 0 ? Math.round(tasks.reduce((sum, t) => sum + (t.progress || t.completion_percentage || 0), 0) / tasks.length) : 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-2xl text-gray-600">Loading tasks...</p>
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
                  Tasks
                </h1>
                <p className="text-lg lg:text-2xl text-gray-600 leading-relaxed">
                  Track and manage all project tasks with detailed progress monitoring
                </p>
              </div>
              
              <button className="flex items-center space-x-3 px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg lg:text-xl font-semibold rounded-2xl hover:shadow-xl transition-all duration-300 whitespace-nowrap">
                <Plus className="h-5 w-5 lg:h-6 lg:w-6" />
                <span>New Task</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-6 mb-8 lg:mb-12">
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <CheckSquare className="h-6 w-6 lg:h-10 lg:w-10 text-blue-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">{taskStats.total}</p>
              <p className="text-sm lg:text-lg text-gray-600">Total Tasks</p>
            </div>
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <Circle className="h-6 w-6 lg:h-10 lg:w-10 text-orange-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">{taskStats.pending}</p>
              <p className="text-sm lg:text-lg text-gray-600">Pending</p>
            </div>
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <PlayCircle className="h-6 w-6 lg:h-10 lg:w-10 text-blue-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">{taskStats.inProgress}</p>
              <p className="text-sm lg:text-lg text-gray-600">In Progress</p>
            </div>
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <CheckCircle className="h-6 w-6 lg:h-10 lg:w-10 text-green-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">{taskStats.completed}</p>
              <p className="text-sm lg:text-lg text-gray-600">Completed</p>
            </div>
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <AlertTriangle className="h-6 w-6 lg:h-10 lg:w-10 text-red-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">{taskStats.overdue}</p>
              <p className="text-sm lg:text-lg text-gray-600">Overdue</p>
            </div>
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <Clock className="h-6 w-6 lg:h-10 lg:w-10 text-purple-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">{taskStats.totalHours}</p>
              <p className="text-sm lg:text-lg text-gray-600">Hours Logged</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-xl border border-gray-100 mb-8 lg:mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 lg:h-6 lg:w-6 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 lg:pl-12 pr-4 py-3 lg:py-4 text-base lg:text-xl border-2 border-gray-200 rounded-xl lg:rounded-2xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
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
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-base lg:text-xl px-3 lg:px-4 py-3 lg:py-4 border-2 border-gray-200 rounded-xl lg:rounded-2xl focus:border-blue-500 focus:outline-none"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="text-base lg:text-xl px-3 lg:px-4 py-3 lg:py-4 border-2 border-gray-200 rounded-xl lg:rounded-2xl focus:border-blue-500 focus:outline-none"
              >
                {projects.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-4 lg:space-y-6">
            {filteredTasks.map((task) => {
              const dueDate = task.due_date || task.dueDate || task.deadline;
              const assignee = task.assignee || task.assigned_to || 'Unassigned';
              const projectName = task.project || task.project_name || 'No Project';
              const progress = task.progress || task.completion_percentage || 0;
              const estimatedHours = task.estimated_hours || task.estimatedHours || 0;
              const loggedHours = task.logged_hours || task.loggedHours || task.time_spent || 0;
              const tags = task.tags || [];
              const comments = task.comments || task.comment_count || 0;
              const attachments = task.attachments || task.attachment_count || 0;
              
              return (
                <div key={task.id} className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 lg:gap-6">
                    {/* Main Task Info */}
                    <div className="flex-1 space-y-3 lg:space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 lg:space-x-4 mb-2 lg:mb-3">
                            <div className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full ${getPriorityColor(task.priority)}`} />
                            <span className={`px-3 lg:px-4 py-1 lg:py-2 rounded-full text-sm lg:text-lg font-semibold border ${getStatusColor(task.status)}`}>
                              <div className="flex items-center space-x-1 lg:space-x-2">
                                {getStatusIcon(task.status)}
                                <span className="capitalize">{(task.status || '').replace('-', ' ').replace('_', ' ')}</span>
                              </div>
                            </span>
                            {isOverdue(dueDate) && task.status !== 'completed' && (
                              <span className="px-2 lg:px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs lg:text-sm font-semibold">
                                OVERDUE
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-xl lg:text-3xl font-bold text-gray-900 mb-1 lg:mb-2">{task.title}</h3>
                          <p className="text-base lg:text-xl text-gray-600 mb-2 lg:mb-4">{task.description || 'No description available'}</p>
                          
                          {/* Tags */}
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 lg:gap-2 mb-2 lg:mb-4">
                              {tags.map((tag, index) => (
                                <span key={index} className="px-2 lg:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs lg:text-sm font-medium">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <button className="p-2 lg:p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
                          <MoreVertical className="h-5 w-5 lg:h-6 lg:w-6" />
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm lg:text-lg font-semibold text-gray-700">Progress</span>
                          <span className="text-sm lg:text-lg font-bold text-gray-900">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 lg:h-3 rounded-full transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Task Details Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 pt-3 lg:pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2 lg:space-x-3">
                          <Building2 className="h-4 w-4 lg:h-5 lg:w-5 text-blue-500" />
                          <div>
                            <p className="text-xs lg:text-sm text-gray-500">Project</p>
                            <p className="text-sm lg:text-lg font-semibold text-gray-900">{projectName}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 lg:space-x-3">
                          <User className="h-4 w-4 lg:h-5 lg:w-5 text-green-500" />
                          <div>
                            <p className="text-xs lg:text-sm text-gray-500">Assignee</p>
                            <p className="text-sm lg:text-lg font-semibold text-gray-900">{assignee}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 lg:space-x-3">
                          <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-red-500" />
                          <div>
                            <p className="text-xs lg:text-sm text-gray-500">Due Date</p>
                            <p className={`text-sm lg:text-lg font-semibold ${isOverdue(dueDate) && task.status !== 'completed' ? 'text-red-600' : 'text-gray-900'}`}>
                              {dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 lg:space-x-3">
                          <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-purple-500" />
                          <div>
                            <p className="text-xs lg:text-sm text-gray-500">Time Logged</p>
                            <p className="text-sm lg:text-lg font-semibold text-gray-900">
                              {loggedHours}h{estimatedHours > 0 ? ` / ${estimatedHours}h` : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Sidebar */}
                    <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-3 shrink-0">
                      <button className="flex items-center space-x-1 lg:space-x-2 px-3 lg:px-4 py-2 lg:py-3 bg-blue-50 text-blue-600 rounded-lg lg:rounded-xl hover:bg-blue-100 transition-all">
                        <Eye className="h-4 w-4 lg:h-5 lg:w-5" />
                        <span className="text-sm lg:text-base font-semibold">View</span>
                      </button>
                      
                      <button className="flex items-center space-x-1 lg:space-x-2 px-3 lg:px-4 py-2 lg:py-3 bg-green-50 text-green-600 rounded-lg lg:rounded-xl hover:bg-green-100 transition-all">
                        <Edit className="h-4 w-4 lg:h-5 lg:w-5" />
                        <span className="text-sm lg:text-base font-semibold">Edit</span>
                      </button>
                      
                      <div className="flex items-center space-x-2 lg:space-x-4 px-3 lg:px-4 py-2 lg:py-3 bg-gray-50 rounded-lg lg:rounded-xl">
                        <div className="flex items-center space-x-1 lg:space-x-2 text-gray-600">
                          <MessageSquare className="h-4 w-4 lg:h-5 lg:w-5" />
                          <span className="text-xs lg:text-sm font-medium">{comments}</span>
                        </div>
                        <div className="flex items-center space-x-1 lg:space-x-2 text-gray-600">
                          <Paperclip className="h-4 w-4 lg:h-5 lg:w-5" />
                          <span className="text-xs lg:text-sm font-medium">{attachments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredTasks.length === 0 && !loading && (
            <div className="text-center py-12 lg:py-16">
              <CheckSquare className="h-16 w-16 lg:h-24 lg:w-24 text-gray-300 mx-auto mb-4 lg:mb-6" />
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 lg:mb-4">No tasks found</h3>
              <p className="text-lg lg:text-xl text-gray-600 mb-6 lg:mb-8">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'All Projects'
                  ? "Try adjusting your search or filter criteria" 
                  : "Get started by creating your first task"
                }
              </p>
              <button className="px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg lg:text-xl font-semibold rounded-xl lg:rounded-2xl hover:shadow-xl transition-all duration-300">
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