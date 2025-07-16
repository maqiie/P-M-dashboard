import React, { useState, useEffect } from 'react';
import {
  CheckSquare, Plus, Search, Filter, Clock, Calendar, Users,
  AlertTriangle, Flag, Star, Eye, Edit, Trash2, MoreVertical,
  CheckCircle, Circle, PlayCircle, Pause, Target, User,
  Building2, Tag, MessageSquare, Paperclip, ChevronDown
} from 'lucide-react';

const TasksPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [viewMode, setViewMode] = useState('list');

  const [tasks] = useState([
    {
      id: 1,
      title: 'Foundation Excavation',
      description: 'Complete excavation work for building foundation',
      project: 'Downtown Office Complex',
      projectId: 1,
      assignee: 'Mike Johnson',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2024-07-20',
      createdDate: '2024-07-10',
      progress: 65,
      estimatedHours: 40,
      loggedHours: 26,
      tags: ['excavation', 'foundation', 'urgent'],
      comments: 3,
      attachments: 2
    },
    {
      id: 2,
      title: 'Steel Frame Installation',
      description: 'Install main structural steel framework',
      project: 'Downtown Office Complex',
      projectId: 1,
      assignee: 'Sarah Wilson',
      status: 'pending',
      priority: 'high',
      dueDate: '2024-07-25',
      createdDate: '2024-07-08',
      progress: 0,
      estimatedHours: 60,
      loggedHours: 0,
      tags: ['steel', 'structure', 'framework'],
      comments: 1,
      attachments: 5
    },
    {
      id: 3,
      title: 'Electrical Rough-in',
      description: 'Install electrical wiring throughout floors 1-5',
      project: 'Riverside Residential',
      projectId: 2,
      assignee: 'David Chen',
      status: 'completed',
      priority: 'medium',
      dueDate: '2024-07-15',
      createdDate: '2024-07-01',
      progress: 100,
      estimatedHours: 35,
      loggedHours: 32,
      tags: ['electrical', 'wiring', 'residential'],
      comments: 8,
      attachments: 3
    },
    {
      id: 4,
      title: 'Plumbing Installation',
      description: 'Install main water and sewer lines',
      project: 'Riverside Residential',
      projectId: 2,
      assignee: 'Lisa Brown',
      status: 'in-progress',
      priority: 'medium',
      dueDate: '2024-07-22',
      createdDate: '2024-07-05',
      progress: 45,
      estimatedHours: 28,
      loggedHours: 13,
      tags: ['plumbing', 'water', 'sewer'],
      comments: 2,
      attachments: 1
    },
    {
      id: 5,
      title: 'Site Safety Inspection',
      description: 'Weekly safety inspection and compliance check',
      project: 'Bridge Construction',
      projectId: 5,
      assignee: 'John Smith',
      status: 'overdue',
      priority: 'high',
      dueDate: '2024-07-12',
      createdDate: '2024-07-08',
      progress: 0,
      estimatedHours: 4,
      loggedHours: 0,
      tags: ['safety', 'inspection', 'compliance'],
      comments: 0,
      attachments: 0
    },
    {
      id: 6,
      title: 'Material Procurement',
      description: 'Order and schedule delivery of concrete materials',
      project: 'Bridge Construction',
      projectId: 5,
      assignee: 'Emily Davis',
      status: 'pending',
      priority: 'medium',
      dueDate: '2024-07-18',
      createdDate: '2024-07-11',
      progress: 0,
      estimatedHours: 8,
      loggedHours: 0,
      tags: ['procurement', 'materials', 'concrete'],
      comments: 5,
      attachments: 2
    },
    {
      id: 7,
      title: 'Quality Assessment',
      description: 'Assess concrete pour quality and structural integrity',
      project: 'Shopping Mall Renovation',
      projectId: 4,
      assignee: 'Robert Garcia',
      status: 'in-progress',
      priority: 'low',
      dueDate: '2024-07-30',
      createdDate: '2024-07-09',
      progress: 25,
      estimatedHours: 16,
      loggedHours: 4,
      tags: ['quality', 'assessment', 'concrete'],
      comments: 1,
      attachments: 3
    },
    {
      id: 8,
      title: 'Final Walkthrough',
      description: 'Complete final inspection with client',
      project: 'Industrial Warehouse',
      projectId: 3,
      assignee: 'Mike Wilson',
      status: 'completed',
      priority: 'high',
      dueDate: '2024-07-10',
      createdDate: '2024-07-08',
      progress: 100,
      estimatedHours: 6,
      loggedHours: 5,
      tags: ['inspection', 'client', 'final'],
      comments: 12,
      attachments: 8
    }
  ]);

  const statusOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const projects = ['All Projects', 'Downtown Office Complex', 'Riverside Residential', 'Bridge Construction', 'Shopping Mall Renovation', 'Industrial Warehouse'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Circle className="h-5 w-5" />;
      case 'in-progress': return <PlayCircle className="h-5 w-5" />;
      case 'completed': return <CheckCircle className="h-5 w-5" />;
      case 'overdue': return <AlertTriangle className="h-5 w-5" />;
      default: return <Circle className="h-5 w-5" />;
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

  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.project.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesProject = projectFilter === 'all' || projectFilter === 'All Projects' || task.project === projectFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate': return new Date(a.dueDate) - new Date(b.dueDate);
        case 'priority': 
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'progress': return b.progress - a.progress;
        case 'assignee': return a.assignee.localeCompare(b.assignee);
        default: return a.title.localeCompare(b.title);
      }
    });

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
    totalHours: tasks.reduce((sum, t) => sum + t.loggedHours, 0),
    avgProgress: Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length)
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <h1 className="text-6xl font-bold text-gray-900 mb-4 tracking-tight">
              Tasks
            </h1>
            <p className="text-2xl text-gray-600 leading-relaxed">
              Track and manage all project tasks with detailed progress monitoring
            </p>
          </div>
          
          <button className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-semibold rounded-2xl hover:shadow-xl transition-all duration-300">
            <Plus className="h-6 w-6" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <CheckSquare className="h-10 w-10 text-blue-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">{taskStats.total}</p>
          <p className="text-lg text-gray-600">Total Tasks</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <Circle className="h-10 w-10 text-orange-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">{taskStats.pending}</p>
          <p className="text-lg text-gray-600">Pending</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <PlayCircle className="h-10 w-10 text-blue-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">{taskStats.inProgress}</p>
          <p className="text-lg text-gray-600">In Progress</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">{taskStats.completed}</p>
          <p className="text-lg text-gray-600">Completed</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">{taskStats.overdue}</p>
          <p className="text-lg text-gray-600">Overdue</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <Clock className="h-10 w-10 text-purple-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">{taskStats.totalHours}</p>
          <p className="text-lg text-gray-600">Hours Logged</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-xl border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xl px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xl px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="text-xl px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
          >
            {projects.map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-6">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              {/* Main Task Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className={`w-4 h-4 rounded-full ${getPriorityColor(task.priority)}`} />
                      <span className={`px-4 py-2 rounded-full text-lg font-semibold border ${getStatusColor(task.status)}`}>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(task.status)}
                          <span className="capitalize">{task.status.replace('-', ' ')}</span>
                        </div>
                      </span>
                      {isOverdue(task.dueDate) && task.status !== 'completed' && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                          OVERDUE
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h3>
                    <p className="text-xl text-gray-600 mb-4">{task.description}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {task.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button className="p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
                    <MoreVertical className="h-6 w-6" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">Progress</span>
                    <span className="text-lg font-bold text-gray-900">{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>

                {/* Task Details Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Project</p>
                      <p className="text-lg font-semibold text-gray-900">{task.project}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Assignee</p>
                      <p className="text-lg font-semibold text-gray-900">{task.assignee}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p className={`text-lg font-semibold ${isOverdue(task.dueDate) && task.status !== 'completed' ? 'text-red-600' : 'text-gray-900'}`}>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">Time Logged</p>
                      <p className="text-lg font-semibold text-gray-900">{task.loggedHours}h / {task.estimatedHours}h</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Sidebar */}
              <div className="flex lg:flex-col space-x-3 lg:space-x-0 lg:space-y-3 shrink-0">
                <button className="flex items-center space-x-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all">
                  <Eye className="h-5 w-5" />
                  <span className="font-semibold">View</span>
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all">
                  <Edit className="h-5 w-5" />
                  <span className="font-semibold">Edit</span>
                </button>
                
                <div className="flex items-center space-x-4 px-4 py-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-sm font-medium">{task.comments}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Paperclip className="h-5 w-5" />
                    <span className="text-sm font-medium">{task.attachments}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-16">
          <CheckSquare className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-gray-900 mb-4">No tasks found</h3>
          <p className="text-xl text-gray-600 mb-8">Try adjusting your search or filter criteria</p>
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-semibold rounded-2xl hover:shadow-xl transition-all duration-300">
            Create New Task
          </button>
        </div>
      )}
    </div>
  );
};

export default TasksPage;