import React, { useState, useEffect } from 'react';
import {
  Bell, AlertTriangle, CheckCircle, Info, Clock, X, Eye,
  Filter, Search, Settings, MoreVertical, Calendar, Users,
  Building2, DollarSign, Flag, Star, MessageSquare, Target,
  Trash2, Archive, Mail, Phone, Zap, BellRing, Volume2, Menu
} from 'lucide-react';
import { fetchActivities } from '../../services/api';
import AdminSidebar from './AdminSidebar';
const NotificationsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Handle collapse changes from sidebar
  const handleCollapseChange = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // Improved timestamp formatting function
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffHours < 48) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Map API data action/type to notification types (for color/icon etc)
  const mapActionToType = (action) => {
    switch (action) {
      case 'login':
      case 'logout':
      case 'login_attempt':
        return 'info';
      case 'created':
        return 'success';
      case 'updated':
        return 'info';
      case 'deleted':
        return 'warning';
      default:
        return 'info';
    }
  };

  // Compose a display title and message based on API data
  const formatNotificationContent = (notif) => {
    const { action, actor, target, metadata, created_at } = notif;
    const actorName = actor.name || actor.email || 'User';
    const targetTitle = target.title || target.name || `ID: ${target.id || 'N/A'}`;
    const timeStr = formatTimestamp(created_at);
  
    switch (action) {
      case 'login':
        return {
          title: 'User Login',
          message: `${actorName} logged in successfully at ${timeStr}`,
        };
  
      case 'logout':
        return {
          title: 'User Logout',
          message: `${actorName} logged out at ${timeStr}`,
        };
  
      case 'login_attempt':
        return {
          title: 'Login Attempt',
          message: `User ${actorName} attempted login - status: ${metadata?.status || 'unknown'} at ${timeStr}`,
        };
  
      case 'created':
        if (target.target_type) {
          return {
            title: `New ${target.target_type} Created`,
            message: `${actorName} created a new ${target.target_type.toLowerCase()}: "${targetTitle}" at ${timeStr}`,
          };
        }
        return {
          title: 'Created',
          message: `${actorName} created an item: "${targetTitle}" at ${timeStr}`,
        };
  
      case 'updated':
        if (target.target_type) {
          return {
            title: `${target.target_type} Updated`,
            message: `${actorName} updated the ${target.target_type.toLowerCase()}: "${targetTitle}" at ${timeStr}`,
          };
        }
        return {
          title: 'Updated',
          message: `${actorName} updated an item: "${targetTitle}" at ${timeStr}`,
        };
  
      case 'deleted':
        if (target.target_type) {
          return {
            title: `${target.target_type} Deleted`,
            message: `${actorName} deleted the ${target.target_type.toLowerCase()}: "${targetTitle}" at ${timeStr}`,
          };
        }
        return {
          title: 'Deleted',
          message: `${actorName} deleted an item: "${targetTitle}" at ${timeStr}`,
        };
  
      case 'converted':
        return {
          title: 'Tender Converted',
          message: `${actorName} converted tender "${targetTitle}" to a project at ${timeStr}`,
        };
  
      default:
        return {
          title: action.charAt(0).toUpperCase() + action.slice(1),
          message: `${actorName} performed action '${action}' on "${targetTitle}" at ${timeStr}`,
        };
    }
  };
  
  // Fetch notifications from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchActivities();
        setNotifications(data.activities || []);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAsUnread = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: false } : notif
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const toggleSelection = (id) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'warning', label: 'Warnings' },
    { value: 'info', label: 'Information' },
    { value: 'success', label: 'Success' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Notifications' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
    { value: 'action-required', label: 'Action Required' },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-orange-500" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-500" />;
      default:
        return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  const getNotificationBgColor = (type, isRead) => {
    if (isRead) return 'bg-gray-50 border-gray-200';
    switch (type) {
      case 'urgent':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const enhancedNotifications = notifications.map((notif) => {
    const type = mapActionToType(notif.action);
    const { title, message } = formatNotificationContent(notif);
    const isRead = notif.isRead ?? false;
    const category = notif.metadata?.category || 'general';
    const relatedUsers = notif.metadata?.relatedUsers || [];
    return {
      ...notif,
      type,
      title,
      message,
      isRead,
      category,
      relatedUsers,
    };
  });

  const filteredNotifications = enhancedNotifications
    .filter((notif) => {
      const matchesSearch =
        notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (notif.target?.title || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || notif.type === typeFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'unread' && !notif.isRead) ||
        (statusFilter === 'read' && notif.isRead) ||
        (statusFilter === 'action-required' && notif.actionRequired);
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (
            (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
          );
        }
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  const notificationStats = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.isRead).length,
    urgent: notifications.filter((n) => n.type === 'urgent' && !n.isRead).length,
    actionRequired: notifications.filter(
      (n) => n.actionRequired && !n.isRead
    ).length,
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
        <AdminSidebar 
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          onCollapseChange={handleCollapseChange}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 text-xl">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* AdminSidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onCollapseChange={handleCollapseChange}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-auto">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </button>
          <h1 className="ml-4 text-xl font-bold text-gray-900">Notifications</h1>
        </div>

        <div className="p-8">
          {/* Header */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <h1 className="text-6xl font-bold text-gray-900 mb-4 tracking-tight">
                  Notifications
                </h1>
                <p className="text-2xl text-gray-600 leading-relaxed">
                  Stay updated with real-time alerts and important project
                  notifications
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
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {notificationStats.total}
              </p>
              <p className="text-xl text-gray-600">Total Notifications</p>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
              <BellRing className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {notificationStats.unread}
              </p>
              <p className="text-xl text-gray-600">Unread</p>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {notificationStats.urgent}
              </p>
              <p className="text-xl text-gray-600">Urgent</p>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
              <Zap className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {notificationStats.actionRequired}
              </p>
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
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xl px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
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
                  <span className="text-lg text-gray-600">
                    {selectedNotifications.length} selected
                  </span>
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
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-8 rounded-3xl border-2 transition-all duration-300 hover:shadow-lg ${getNotificationBgColor(
                    notification.type,
                    notification.isRead
                  )}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-6 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => toggleSelection(notification.id)}
                        className="mt-2 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-4">
                            <h3
                              className={`text-2xl font-bold ${
                                notification.isRead
                                  ? 'text-gray-700'
                                  : 'text-gray-900'
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-3 h-3 rounded-full bg-blue-600 mt-1" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {formatTimestamp(notification.created_at)}
                          </p>
                        </div>
                        <p className="text-lg text-gray-600">{notification.message}</p>
                      </div>
                    </div>
                    <div className="flex space-x-4 ml-6">
                      {!notification.isRead ? (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          title="Mark as read"
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          <Eye className="h-6 w-6" />
                        </button>
                      ) : (
                        <button
                          onClick={() => markAsUnread(notification.id)}
                          title="Mark as unread"
                          className="text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          <Eye className="h-6 w-6" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        title="Delete notification"
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 text-xl py-20">
                No notifications found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;