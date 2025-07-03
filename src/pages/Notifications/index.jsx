import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import { 
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Calendar,
  Users,
  Building2,
  FileText,
  DollarSign,
  Settings,
  Filter,
  Search,
  MoreHorizontal,
  Trash2,
  Archive,
  Star,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [activeMenuItem, setActiveMenuItem] = useState('notifications');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // In real app, load from API
      const data = getMockNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications(getMockNotifications());
    } finally {
      setLoading(false);
    }
  };

  const getMockNotifications = () => [
    {
      id: 1,
      type: 'deadline',
      priority: 'high',
      title: 'Project Deadline Approaching',
      message: 'Downtown Plaza Development project deadline is in 3 days. Please review progress and ensure timely completion.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      project: 'Downtown Plaza Development',
      actionRequired: true,
      source: 'Project Management System'
    },
    {
      id: 2,
      type: 'budget',
      priority: 'medium',
      title: 'Budget Alert',
      message: 'Green Energy Initiative has used 85% of allocated budget. Consider reviewing expenses.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: false,
      project: 'Green Energy Initiative',
      actionRequired: true,
      source: 'Financial System'
    },
    {
      id: 3,
      type: 'team',
      priority: 'low',
      title: 'New Team Member Assignment',
      message: 'Alex Chen has been assigned to the Smart City Infrastructure project.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      read: true,
      project: 'Smart City Infrastructure',
      actionRequired: false,
      source: 'HR System'
    },
    {
      id: 4,
      type: 'meeting',
      priority: 'high',
      title: 'Urgent Meeting Scheduled',
      message: 'Emergency project review meeting scheduled for tomorrow at 9:00 AM for Highway Bridge Renovation.',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      read: false,
      project: 'Highway Bridge Renovation',
      actionRequired: true,
      source: 'Calendar System'
    },
    {
      id: 5,
      type: 'document',
      priority: 'medium',
      title: 'Document Approval Required',
      message: 'Environmental impact assessment for Municipal Park Upgrade requires your approval.',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      read: true,
      project: 'Municipal Park Upgrade',
      actionRequired: true,
      source: 'Document Management'
    },
    {
      id: 6,
      type: 'system',
      priority: 'low',
      title: 'System Maintenance Complete',
      message: 'Scheduled maintenance of project management system has been completed successfully.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      project: null,
      actionRequired: false,
      source: 'IT Department'
    },
    {
      id: 7,
      type: 'safety',
      priority: 'high',
      title: 'Safety Incident Report',
      message: 'Minor safety incident reported at Residential Complex Phase 2. Investigation initiated.',
      timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000), // 1.5 days ago
      read: false,
      project: 'Residential Complex Phase 2',
      actionRequired: true,
      source: 'Safety Department'
    },
    {
      id: 8,
      type: 'tender',
      priority: 'medium',
      title: 'New Tender Submissions',
      message: '3 new submissions received for Municipal Building Renovation tender.',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
      read: true,
      project: null,
      actionRequired: false,
      source: 'Tender Management'
    },
    {
      id: 9,
      type: 'milestone',
      priority: 'medium',
      title: 'Milestone Achieved',
      message: 'Phase 1 construction completed for Smart City Infrastructure project.',
      timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
      read: true,
      project: 'Smart City Infrastructure',
      actionRequired: false,
      source: 'Project Tracking'
    },
    {
      id: 10,
      type: 'weather',
      priority: 'medium',
      title: 'Weather Alert',
      message: 'Heavy rain forecast for next week may impact outdoor construction activities.',
      timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000), // 4 days ago
      read: true,
      project: null,
      actionRequired: false,
      source: 'Weather Service'
    }
  ];

  const handleMenuItemClick = (itemId, href) => {
    console.log('Navigate to:', href);
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (notification.project && notification.project.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'unread' && !notification.read) ||
                         (statusFilter === 'read' && notification.read) ||
                         (statusFilter === 'action' && notification.actionRequired);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'deadline': return <Clock className="h-5 w-5" />;
      case 'budget': return <DollarSign className="h-5 w-5" />;
      case 'team': return <Users className="h-5 w-5" />;
      case 'meeting': return <Calendar className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      case 'system': return <Settings className="h-5 w-5" />;
      case 'safety': return <AlertTriangle className="h-5 w-5" />;
      case 'tender': return <Building2 className="h-5 w-5" />;
      case 'milestone': return <CheckCircle className="h-5 w-5" />;
      case 'weather': return <Info className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'deadline': return 'bg-red-100 text-red-600';
      case 'budget': return 'bg-yellow-100 text-yellow-600';
      case 'team': return 'bg-blue-100 text-blue-600';
      case 'meeting': return 'bg-purple-100 text-purple-600';
      case 'document': return 'bg-green-100 text-green-600';
      case 'system': return 'bg-gray-100 text-gray-600';
      case 'safety': return 'bg-red-100 text-red-600';
      case 'tender': return 'bg-indigo-100 text-indigo-600';
      case 'milestone': return 'bg-green-100 text-green-600';
      case 'weather': return 'bg-cyan-100 text-cyan-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const toggleSelection = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(notifId => notifId !== id)
        : [...prev, id]
    );
  };

  const handleBulkAction = (action) => {
    switch (action) {
      case 'markRead':
        setNotifications(notifications.map(n => 
          selectedNotifications.includes(n.id) ? { ...n, read: true } : n
        ));
        break;
      case 'delete':
        setNotifications(notifications.filter(n => !selectedNotifications.includes(n.id)));
        break;
    }
    setSelectedNotifications([]);
  };

  const notificationStats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    actionRequired: notifications.filter(n => n.actionRequired && !n.read).length,
    high: notifications.filter(n => n.priority === 'high' && !n.read).length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-xl text-gray-700 font-semibold">Loading Notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
    

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/30 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Stay updated with project alerts, deadlines, and system messages
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => loadNotifications()}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-colors"
                  title="Refresh Notifications"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
                
                <button 
                  onClick={markAllAsRead}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Mark All Read
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          
          {/* Notification Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{notificationStats.total}</p>
                  <p className="text-xs text-gray-600">Total Notifications</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <EyeOff className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{notificationStats.unread}</p>
                  <p className="text-xs text-gray-600">Unread</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{notificationStats.actionRequired}</p>
                  <p className="text-xs text-gray-600">Action Required</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Star className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{notificationStats.high}</p>
                  <p className="text-xs text-gray-600">High Priority</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="deadline">Deadlines</option>
                  <option value="budget">Budget</option>
                  <option value="team">Team</option>
                  <option value="meeting">Meetings</option>
                  <option value="document">Documents</option>
                  <option value="safety">Safety</option>
                  <option value="tender">Tenders</option>
                  <option value="system">System</option>
                </select>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="action">Action Required</option>
                </select>
              </div>
              
              {selectedNotifications.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{selectedNotifications.length} selected</span>
                  <button 
                    onClick={() => handleBulkAction('markRead')}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Mark Read
                  </button>
                  <button 
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 group border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => toggleSelection(notification.id)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    
                    <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            {notification.actionRequired && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                                Action Required
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{formatTime(notification.timestamp)}</span>
                            <span>•</span>
                            <span>{notification.source}</span>
                            {notification.project && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600 font-medium">{notification.project}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="mx-auto h-16 w-16 text-gray-300" />
              <p className="mt-4 text-lg text-gray-500">No notifications found</p>
              <p className="text-sm text-gray-400">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'You\'re all caught up!'
                }
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;