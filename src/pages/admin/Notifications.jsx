import React, { useState, useEffect } from 'react';
import {
  Bell, AlertTriangle, CheckCircle, Info, Clock, X, Eye,
  Filter, Search, Settings, MoreVertical, Calendar, Users,
  Building2, DollarSign, Flag, Star, MessageSquare, Target,
  Trash2, Archive, Mail, Phone, Zap, BellRing, Volume2
} from 'lucide-react';

const NotificationsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'urgent',
      category: 'safety',
      title: 'Safety Inspection Required',
      message: 'Bridge Construction site safety inspection is overdue by 2 days. Immediate action required.',
      project: 'Bridge Construction',
      sender: 'Safety System',
      timestamp: '2024-07-12T14:30:00Z',
      isRead: false,
      priority: 'high',
      actionRequired: true,
      relatedUsers: ['Lisa Brown', 'Mike Wilson'],
      tags: ['safety', 'inspection', 'overdue']
    },
    {
      id: 2,
      type: 'info',
      category: 'project',
      title: 'Project Milestone Completed',
      message: 'Downtown Office Complex foundation phase has been completed successfully. Moving to next phase.',
      project: 'Downtown Office Complex',
      sender: 'John Smith',
      timestamp: '2024-07-12T12:15:00Z',
      isRead: false,
      priority: 'medium',
      actionRequired: false,
      relatedUsers: ['Sarah Johnson', 'Construction Team'],
      tags: ['milestone', 'completion', 'progress']
    },
    {
      id: 3,
      type: 'warning',
      category: 'budget',
      title: 'Budget Alert',
      message: 'Riverside Residential project is approaching 80% budget utilization. Review recommended.',
      project: 'Riverside Residential',
      sender: 'Finance System',
      timestamp: '2024-07-12T10:45:00Z',
      isRead: false,
      priority: 'high',
      actionRequired: true,
      relatedUsers: ['Emily Davis', 'Finance Team'],
      tags: ['budget', 'alert', 'review']
    },
    {
      id: 4,
      type: 'success',
      category: 'delivery',
      title: 'Material Delivery Confirmed',
      message: 'Steel beams for Industrial Warehouse have been delivered and inspected. Quality approved.',
      project: 'Industrial Warehouse',
      sender: 'David Chen',
      timestamp: '2024-07-12T09:20:00Z',
      isRead: true,
      priority: 'low',
      actionRequired: false,
      relatedUsers: ['Supply Team', 'Quality Control'],
      tags: ['delivery', 'materials', 'approved']
    },
    {
      id: 5,
      type: 'info',
      category: 'meeting',
      title: 'Team Meeting Reminder',
      message: 'Weekly project review meeting scheduled for today at 3:00 PM in Conference Room A.',
      project: 'All Projects',
      sender: 'Calendar System',
      timestamp: '2024-07-12T08:00:00Z',
      isRead: true,
      priority: 'medium',
      actionRequired: false,
      relatedUsers: ['All Team Members'],
      tags: ['meeting', 'reminder', 'weekly']
    },
    {
      id: 6,
      type: 'urgent',
      category: 'deadline',
      title: 'Tender Deadline Approaching',
      message: 'Metro Shopping Center Renovation tender submission deadline is in 3 days.',
      project: 'Metro Shopping Center',
      sender: 'Tender System',
      timestamp: '2024-07-11T16:30:00Z',
      isRead: false,
      priority: 'high',
      actionRequired: true,
      relatedUsers: ['John Smith', 'Proposal Team'],
      tags: ['tender', 'deadline', 'submission']
    },
    {
      id: 7,
      type: 'warning',
      category: 'equipment',
      title: 'Equipment Maintenance Due',
      message: 'Crane #3 is due for scheduled maintenance. Current usage: 480 hours.',
      project: 'Multiple Projects',
      sender: 'Equipment System',
      timestamp: '2024-07-11T14:15:00Z',
      isRead: false,
      priority: 'medium',
      actionRequired: true,
      relatedUsers: ['Equipment Team', 'Site Supervisors'],
      tags: ['equipment', 'maintenance', 'scheduled']
    },
    {
      id: 8,
      type: 'success',
      category: 'approval',
      title: 'Permit Approved',
      message: 'Building permit for Shopping Mall Renovation has been approved by city authorities.',
      project: 'Shopping Mall Renovation',
      sender: 'Permits Office',
      timestamp: '2024-07-11T11:30:00Z',
      isRead: true,
      priority: 'low',
      actionRequired: false,
      relatedUsers: ['Jennifer Lee', 'Legal Team'],
      tags: ['permit', 'approved', 'legal']
    },
    {
      id: 9,
      type: 'info',
      category: 'training',
      title: 'Safety Training Scheduled',
      message: 'Monthly safety training session scheduled for all team members on July 17th.',
      project: 'All Projects',
      sender: 'HR Department',
      timestamp: '2024-07-10T15:45:00Z',
      isRead: true,
      priority: 'medium',
      actionRequired: false,
      relatedUsers: ['All Employees'],
      tags: ['training', 'safety', 'mandatory']
    },
    {
      id: 10,
      type: 'warning',
      category: 'weather',
      title: 'Weather Alert',
      message: 'Heavy rain forecast for next 48 hours. Consider adjusting outdoor work schedules.',
      project: 'All Active Projects',
      sender: 'Weather Service',
      timestamp: '2024-07-10T12:00:00Z',
      isRead: false,
      priority: 'medium',
      actionRequired: true,
      relatedUsers: ['Site Supervisors', 'Project Managers'],
      tags: ['weather', 'alert', 'schedule']
    }
  ]);

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'warning', label: 'Warnings' },
    { value: 'info', label: 'Information' },
    { value: 'success', label: 'Success' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Notifications' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
    { value: 'action-required', label: 'Action Required' }
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="h-6 w-6 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-6 w-6 text-orange-500" />;
      case 'success': return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'info': return <Info className="h-6 w-6 text-blue-500" />;
      default: return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'safety': return <AlertTriangle className="h-5 w-5" />;
      case 'project': return <Building2 className="h-5 w-5" />;
      case 'budget': return <DollarSign className="h-5 w-5" />;
      case 'delivery': return <Target className="h-5 w-5" />;
      case 'meeting': return <Users className="h-5 w-5" />;
      case 'deadline': return <Clock className="h-5 w-5" />;
      case 'equipment': return <Settings className="h-5 w-5" />;
      case 'approval': return <CheckCircle className="h-5 w-5" />;
      case 'training': return <Star className="h-5 w-5" />;
      case 'weather': return <Flag className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationBgColor = (type, isRead) => {
    if (isRead) return 'bg-gray-50 border-gray-200';
    
    switch (type) {
      case 'urgent': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-orange-50 border-orange-200';
      case 'success': return 'bg-green-50 border-green-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-white border-gray-200';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAsUnread = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: false } : notif
      )
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const toggleSelection = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const filteredNotifications = notifications
    .filter(notif => {
      const matchesSearch = notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          notif.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          notif.project.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || notif.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'unread' && !notif.isRead) ||
                           (statusFilter === 'read' && notif.isRead) ||
                           (statusFilter === 'action-required' && notif.actionRequired);
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest': return new Date(a.timestamp) - new Date(b.timestamp);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'type': return a.type.localeCompare(b.type);
        default: return new Date(b.timestamp) - new Date(a.timestamp);
      }
    });

  const notificationStats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    urgent: notifications.filter(n => n.type === 'urgent' && !n.isRead).length,
    actionRequired: notifications.filter(n => n.actionRequired && !n.isRead).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <h1 className="text-6xl font-bold text-gray-900 mb-4 tracking-tight">
              Notifications
            </h1>
            <p className="text-2xl text-gray-600 leading-relaxed">
              Stay updated with real-time alerts and important project notifications
            </p>
          </div>
          
          <button className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-semibold rounded-2xl hover:shadow-xl transition-all duration-300">
            <Settings className="h-6 w-6" />
            <span>Notification Settings</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
          <Bell className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-4xl font-bold text-gray-900 mb-2">{notificationStats.total}</p>
          <p className="text-xl text-gray-600">Total Notifications</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
          <BellRing className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <p className="text-4xl font-bold text-gray-900 mb-2">{notificationStats.unread}</p>
          <p className="text-xl text-gray-600">Unread</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-4xl font-bold text-gray-900 mb-2">{notificationStats.urgent}</p>
          <p className="text-xl text-gray-600">Urgent</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
          <Zap className="h-12 w-12 text-purple-500 mx-auto mb-4" />
          <p className="text-4xl font-bold text-gray-900 mb-2">{notificationStats.actionRequired}</p>
          <p className="text-xl text-gray-600">Action Required</p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-xl border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xl px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

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
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xl px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">By Priority</option>
              <option value="type">By Type</option>
            </select>
          </div>

          {selectedNotifications.length > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-lg text-gray-600">{selectedNotifications.length} selected</span>
              <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all">
                Mark Read
              </button>
              <button className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-8 rounded-3xl border-2 transition-all duration-300 hover:shadow-lg ${getNotificationBgColor(notification.type, notification.isRead)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6 flex-1">
                {/* Selection Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification.id)}
                  onChange={() => toggleSelection(notification.id)}
                  className="mt-2 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />

                {/* Notification Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Notification Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <h3 className={`text-2xl font-bold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                      )}
                      {notification.actionRequired && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                          Action Required
                        </span>
                      )}
                    </div>
                  </div>

                  <p className={`text-xl mb-4 ${notification.isRead ? 'text-gray-600' : 'text-gray-800'}`}>
                    {notification.message}
                  </p>

                  {/* Notification Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-gray-500" />
                      <span className="text-lg text-gray-600">{notification.project}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-gray-500" />
                      <span className="text-lg text-gray-600">{notification.sender}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <span className="text-lg text-gray-600">{formatTimestamp(notification.timestamp)}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(notification.category)}
                      <span className="text-lg text-gray-600 capitalize">{notification.category}</span>
                    </div>
                  </div>

                  {/* Related Users */}
                  <div className="mb-4">
                    <p className="text-lg text-gray-600 mb-2">Related Users:</p>
                    <div className="flex flex-wrap gap-2">
                      {notification.relatedUsers.map((user, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          {user}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {notification.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 ml-6">
                {!notification.isRead ? (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-all"
                    title="Mark as read"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => markAsUnread(notification.id)}
                    className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all"
                    title="Mark as unread"
                  >
                    <Bell className="h-5 w-5" />
                  </button>
                )}

                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"
                  title="Delete notification"
                >
                  <Trash2 className="h-5 w-5" />
                </button>

                <button className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-16">
          <Bell className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-gray-900 mb-4">No notifications found</h3>
          <p className="text-xl text-gray-600 mb-8">
            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'You\'re all caught up! No new notifications.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;