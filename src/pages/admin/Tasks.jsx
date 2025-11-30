import React, { useState, useEffect } from 'react';
import {
  CheckSquare, Plus, Search, Calendar, X,
  AlertTriangle, User, Building2, MoreVertical,
  CheckCircle, Circle, PlayCircle, Pause, Loader, Menu,
  Clock, Flag, Users, FileText, Tag
} from 'lucide-react';
import { tasksAPI, projectsAPI } from '../../services/api';
import AdminSidebar from './AdminSidebar';

const TasksPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Modal state
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const extractArray = (response) => {
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.tasks && Array.isArray(response.tasks)) return response.tasks;
    if (response?.projects && Array.isArray(response.projects)) return response.projects;
    if (response?.records && Array.isArray(response.records)) return response.records;
    return [];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [tasksResponse, projectsResponse] = await Promise.all([
          tasksAPI.getAll(),
          projectsAPI.getAll()
        ]);

        const tasksData = extractArray(tasksResponse);
        const projectsData = extractArray(projectsResponse);

        setTasks(tasksData);
        setProjects(projectsData);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-orange-100 text-orange-700 border-orange-200',
      'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
      in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
      overdue: 'bg-red-100 text-red-700 border-red-200',
      on_hold: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Circle className="h-3 w-3" />,
      'in-progress': <PlayCircle className="h-3 w-3" />,
      in_progress: <PlayCircle className="h-3 w-3" />,
      completed: <CheckCircle className="h-3 w-3" />,
      overdue: <AlertTriangle className="h-3 w-3" />,
      on_hold: <Pause className="h-3 w-3" />
    };
    return icons[status] || <Circle className="h-3 w-3" />;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-500',
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  const getPriorityBadgeColor = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-700 border-red-200',
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      urgent: 'Urgent',
      high: 'High',
      medium: 'Medium',
      low: 'Low'
    };
    return labels[priority] || priority || 'None';
  };

  const getDueDate = (task) => {
    return task.due_date || task.dueDate || task.deadline || task.end_date;
  };

  const getStartDate = (task) => {
    return task.start_date || task.startDate;
  };

  const isOverdue = (task) => {
    const dueDate = getDueDate(task);
    if (!dueDate || task.status === 'completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(dueDate);
    deadline.setHours(0, 0, 0, 0);
    return deadline < today;
  };

  const isDueToday = (task) => {
    const dueDate = getDueDate(task);
    if (!dueDate) return false;
    const today = new Date();
    const deadline = new Date(dueDate);
    return today.toDateString() === deadline.toDateString();
  };

  const isUpcoming = (task) => {
    const dueDate = getDueDate(task);
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(dueDate);
    deadline.setHours(0, 0, 0, 0);
    return deadline > today;
  };

  const getTimeCategory = (task) => {
    if (task.status === 'completed') return 4;
    if (isOverdue(task)) return 0;
    if (isDueToday(task)) return 1;
    if (isUpcoming(task)) return 2;
    return 3;
  };

  const getTimeCategoryLabel = (task) => {
    if (task.status === 'completed') return 'Completed';
    if (isOverdue(task)) return 'Overdue';
    if (isDueToday(task)) return 'Due Today';
    if (isUpcoming(task)) return 'Upcoming';
    return 'No Due Date';
  };

  const getProjectName = (task) => {
    if (task.project && typeof task.project === 'object') {
      return task.project.title || task.project.name || 'Unknown Project';
    }
    if (task.project && typeof task.project === 'string') {
      return task.project;
    }
    if (task.project_name) return task.project_name;
    if (task.project_id) {
      const project = projects.find(p => p.id === task.project_id);
      return project ? (project.title || project.name) : 'Unknown Project';
    }
    return 'No Project';
  };

  const getProjectDetails = (task) => {
    if (task.project && typeof task.project === 'object') {
      return task.project;
    }
    if (task.project_id) {
      return projects.find(p => p.id === task.project_id) || null;
    }
    return null;
  };

  const getAssigneeName = (task) => {
    if (task.assignees && Array.isArray(task.assignees) && task.assignees.length > 0) {
      const names = task.assignees.map(a => a.name || a.email).filter(Boolean);
      return names.length > 0 ? names.join(', ') : 'Unassigned';
    }
    if (task.assignee && typeof task.assignee === 'object') {
      return task.assignee.name || task.assignee.email || 'Unassigned';
    }
    if (task.assignee && typeof task.assignee === 'string') {
      return task.assignee;
    }
    if (task.assigned_to) return task.assigned_to;
    if (task.assignee_name) return task.assignee_name;
    return 'Unassigned';
  };

  const getAssigneesList = (task) => {
    if (task.assignees && Array.isArray(task.assignees)) {
      return task.assignees;
    }
    return [];
  };

  const getWatchersList = (task) => {
    if (task.watchers && Array.isArray(task.watchers)) {
      return task.watchers;
    }
    return [];
  };

  const getOwnerName = (task) => {
    if (task.user && typeof task.user === 'object') {
      return task.user.name || task.user.email || 'Unknown';
    }
    return 'Unknown';
  };

  const getProjectManagerName = (task) => {
    if (task.project_manager && typeof task.project_manager === 'object') {
      return task.project_manager.name || task.project_manager.email || 'Unknown';
    }
    return 'Unknown';
  };

  const normalizeStatus = (status) => {
    if (status === 'in-progress') return 'in_progress';
    return status;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDueDate = (task) => {
    const dueDate = getDueDate(task);
    if (!dueDate) return 'No date';

    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const getTimeBadge = (task) => {
    if (task.status === 'completed') return null;
    if (isOverdue(task)) {
      return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">OVERDUE</span>;
    }
    if (isDueToday(task)) {
      return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">TODAY</span>;
    }
    return null;
  };

  // Open task detail modal
  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
  };

  const filteredTasks = tasks
    .filter(task => {
      const searchText = [
        task.title || '',
        task.description || '',
        getAssigneeName(task),
        getProjectName(task)
      ].join(' ').toLowerCase();

      const matchesSearch = searchText.includes(searchQuery.toLowerCase());

      const taskStatus = normalizeStatus(task.status);
      let matchesStatus = statusFilter === 'all' || taskStatus === statusFilter;

      if (statusFilter === 'overdue') {
        matchesStatus = isOverdue(task);
      }

      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

      let taskProjectId = task.project_id;
      if (task.project && typeof task.project === 'object') {
        taskProjectId = task.project.id;
      }
      const matchesProject = projectFilter === 'all' ||
        (taskProjectId && taskProjectId.toString() === projectFilter);

      return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          const categoryA = getTimeCategory(a);
          const categoryB = getTimeCategory(b);
          if (categoryA !== categoryB) return categoryA - categoryB;

          const dueDateA = getDueDate(a);
          const dueDateB = getDueDate(b);
          if (!dueDateA && !dueDateB) return 0;
          if (!dueDateA) return 1;
          if (!dueDateB) return -1;
          return new Date(dueDateA) - new Date(dueDateB);

        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);

        case 'progress':
          const progressA = a.progress || a.completion_percentage || 0;
          const progressB = b.progress || b.completion_percentage || 0;
          return progressB - progressA;

        default:
          return (a.title || '').localeCompare(b.title || '');
      }
    });

  // Group tasks by time category
  const groupedTasks = {
    overdue: filteredTasks.filter(t => isOverdue(t) && t.status !== 'completed'),
    today: filteredTasks.filter(t => isDueToday(t) && t.status !== 'completed'),
    upcoming: filteredTasks.filter(t => isUpcoming(t) && t.status !== 'completed'),
    noDueDate: filteredTasks.filter(t => !getDueDate(t) && t.status !== 'completed'),
    completed: filteredTasks.filter(t => t.status === 'completed')
  };

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => normalizeStatus(t.status) === 'pending').length,
    inProgress: tasks.filter(t => normalizeStatus(t.status) === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => isOverdue(t)).length
  };

  // Task Detail Modal Component
  const TaskDetailModal = ({ task, onClose }) => {
    if (!task) return null;

    const project = getProjectDetails(task);
    const assignees = getAssigneesList(task);
    const watchers = getWatchersList(task);
    const progress = task.progress || task.completion_percentage || 0;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(task.status)}
                        <span className="capitalize">{(task.status || '').replace(/[-_]/g, ' ')}</span>
                      </div>
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityBadgeColor(task.priority)}`}>
                      <div className="flex items-center space-x-1">
                        <Flag className="h-3 w-3" />
                        <span>{getPriorityLabel(task.priority)}</span>
                      </div>
                    </span>
                    {getTimeBadge(task)}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{task.title || 'Untitled Task'}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Description
                </h3>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {task.description || 'No description provided'}
                </p>
              </div>

              {/* Progress */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Progress</h3>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{progress}%</span>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Start Date
                  </h3>
                  <p className="text-sm text-gray-600">{formatDate(getStartDate(task))}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Due Date
                  </h3>
                  <p className={`text-sm ${isOverdue(task) ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                    {formatDate(getDueDate(task))}
                  </p>
                </div>
              </div>

              {/* Estimated Hours */}
              {task.estimated_hours && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Estimated Hours</h3>
                  <p className="text-sm text-gray-600">{task.estimated_hours} hours</p>
                </div>
              )}

              {/* Project Details */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  Project Details
                </h3>
                {project ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Project Name:</span>
                      <span className="text-sm font-semibold text-blue-900">{project.title || project.name}</span>
                    </div>
                    {project.status && (
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Project Status:</span>
                        <span className="text-sm font-semibold text-blue-900 capitalize">{project.status}</span>
                      </div>
                    )}
                    {project.location && (
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Location:</span>
                        <span className="text-sm font-semibold text-blue-900">{project.location}</span>
                      </div>
                    )}
                    {project.budget && (
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Budget:</span>
                        <span className="text-sm font-semibold text-blue-900">
                          ${(project.budget / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-blue-700">No project assigned</p>
                )}
              </div>

              {/* People */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Created By */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Created By
                  </h3>
                  <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                      {getOwnerName(task).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{getOwnerName(task)}</p>
                      {task.user?.email && (
                        <p className="text-xs text-gray-500">{task.user.email}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Project Manager */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Project Manager
                  </h3>
                  <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                      {getProjectManagerName(task).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{getProjectManagerName(task)}</p>
                      {task.project_manager?.email && (
                        <p className="text-xs text-gray-500">{task.project_manager.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignees */}
              {assignees.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Assignees ({assignees.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {assignees.map((assignee, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-green-50 rounded-lg px-3 py-2">
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-semibold">
                          {(assignee.name || assignee.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-green-800">{assignee.name || assignee.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Watchers */}
              {watchers.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Watchers ({watchers.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {watchers.map((watcher, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                        <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs font-semibold">
                          {(watcher.name || watcher.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-700">{watcher.name || watcher.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Tag className="h-4 w-4 mr-2" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t border-gray-200 pt-4 text-xs text-gray-500">
                <p>Created: {task.created_at ? new Date(task.created_at).toLocaleString() : 'Unknown'}</p>
                <p>Last Updated: {task.updated_at ? new Date(task.updated_at).toLocaleString() : 'Unknown'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Task Card Component
  const TaskCard = ({ task }) => {
    const progress = task.progress || task.completion_percentage || 0;

    return (
      <div
        onClick={() => openTaskDetail(task)}
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-300 cursor-pointer"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(task.status)}
                  <span className="capitalize">{(task.status || '').replace(/[-_]/g, ' ')}</span>
                </div>
              </span>
              {getTimeBadge(task)}
              <span className="text-xs text-gray-500 capitalize">
                {getPriorityLabel(task.priority)} Priority
              </span>
            </div>

            <h3 className="text-base font-bold text-gray-900 truncate mb-1">
              {task.title || 'Untitled Task'}
            </h3>
            <p className="text-xs text-gray-600 line-clamp-1 mb-2">
              {task.description || 'No description'}
            </p>

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
                <span className="truncate max-w-[120px]">{getProjectName(task)}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600">
                <User className="h-3 w-3" />
                <span className="truncate max-w-[100px]">{getAssigneeName(task)}</span>
              </div>
              <div className={`flex items-center space-x-1 ${isOverdue(task) ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                <Calendar className="h-3 w-3" />
                <span>{formatDueDate(task)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Task Section Component
  const TaskSection = ({ title, tasks, icon: Icon, color }) => {
    if (tasks.length === 0) return null;

    return (
      <div className="mb-6">
        <div className={`flex items-center space-x-2 mb-3 px-1`}>
          <Icon className={`h-5 w-5 ${color}`} />
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold">
            {tasks.length}
          </span>
        </div>
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    );
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
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title || project.name || 'Untitled Project'}
                  </option>
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

          {/* Tasks Grouped by Time */}
          {filteredTasks.length > 0 ? (
            <div>
              <TaskSection
                title="Overdue"
                tasks={groupedTasks.overdue}
                icon={AlertTriangle}
                color="text-red-500"
              />
              <TaskSection
                title="Due Today"
                tasks={groupedTasks.today}
                icon={Clock}
                color="text-orange-500"
              />
              <TaskSection
                title="Upcoming"
                tasks={groupedTasks.upcoming}
                icon={Calendar}
                color="text-blue-500"
              />
              <TaskSection
                title="No Due Date"
                tasks={groupedTasks.noDueDate}
                icon={Circle}
                color="text-gray-500"
              />
              <TaskSection
                title="Completed"
                tasks={groupedTasks.completed}
                icon={CheckCircle}
                color="text-green-500"
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No tasks found</h3>
              <p className="text-sm text-gray-600 mb-6">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first task to get started'}
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
                Create New Task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      {showModal && selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={closeModal} />
      )}
    </div>
  );
};

export default TasksPage;