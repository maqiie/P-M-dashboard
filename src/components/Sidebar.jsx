import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  getUserDetails, 
  logout,
  projectsAPI,
  tasksAPI,
  eventsAPI,
  tendersAPI,
  teamMembersAPI,
  notificationsAPI,
  calendarAPI
} from '../services/api';
import { 
  Building2, 
  LayoutDashboard, 
  FolderOpen, 
  Calendar, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  Plus,
  Clock,
  Target,
  Briefcase,
  MapPin,
  Bell,
  Search,
  Menu,
  X,
  CheckCircle,
  DollarSign,
  User,
  LogOut,
  AlertTriangle,
  CheckSquare,
  List,
  Timer,
  Flag,
  RefreshCw
} from 'lucide-react';

const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState(['projects']);
  
  // User data state
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  
  // Stats state
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    tasksDueToday: 0,
    myTasks: 0,
    upcomingEvents: 0,
    activeTenders: 0,
    draftTenders: 0,
    teamMembers: 0,
    pendingNotifications: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch user data and stats on component mount
  useEffect(() => {
    fetchUserData();
    fetchStats();
    
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserData = async () => {
    try {
      setUserLoading(true);
      setUserError(null);
      
      const response = await getUserDetails();
      console.log('✅ User details loaded:', response);
      
      if (response && (response.data || response.user || response)) {
        const userData = response.data || response.user || response;
        setUser(userData);
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setUserError('Failed to load user information');
      
      if (error.response?.status === 401 || error.message?.includes('token')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authData');
        navigate('/login');
        return;
      }
      
      // Fallback user data
      setUser({
        id: 'temp_user',
        name: 'Guest User',
        email: 'guest@example.com',
        role: 'Project Manager',
        avatar: null,
        permissions: []
      });
    } finally {
      setUserLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      
      // Fetch all stats in parallel with error handling for each
      const [
        projectsRes,
        tasksRes,
        eventsRes,
        tendersRes,
        teamRes,
        notificationsRes,
        calendarRes
      ] = await Promise.allSettled([
        projectsAPI.getAll().catch(err => {
          console.warn('Projects API failed:', err.message);
          return { projects: [] };
        }),
        tasksAPI.getAll().catch(err => {
          console.warn('Tasks API failed:', err.message);
          return { tasks: [] };
        }),
        eventsAPI.getUpcoming(10).catch(err => {
          console.warn('Events API failed:', err.message);
          return { events: [] };
        }),
        tendersAPI.getAll().catch(err => {
          console.warn('Tenders API failed:', err.message);
          return { tenders: [] };
        }),
        teamMembersAPI.getAll().catch(err => {
          console.warn('Team API failed:', err.message);
          return { team_members: [] };
        }),
        notificationsAPI.getAll().catch(err => {
          console.warn('Notifications API failed:', err.message);
          return [];
        }),
        calendarAPI.getTodayEvents().catch(err => {
          console.warn('Calendar API failed:', err.message);
          return [];
        })
      ]);

      // Process results with safe fallbacks
      const projects = projectsRes.status === 'fulfilled' ? 
        (Array.isArray(projectsRes.value?.projects) ? projectsRes.value.projects : 
         Array.isArray(projectsRes.value) ? projectsRes.value : []) : [];

      const tasks = tasksRes.status === 'fulfilled' ? 
        (Array.isArray(tasksRes.value?.tasks) ? tasksRes.value.tasks : 
         Array.isArray(tasksRes.value) ? tasksRes.value : []) : [];

      const events = eventsRes.status === 'fulfilled' ? 
        (Array.isArray(eventsRes.value?.events) ? eventsRes.value.events : 
         Array.isArray(eventsRes.value) ? eventsRes.value : []) : [];

      const tenders = tendersRes.status === 'fulfilled' ? 
        (Array.isArray(tendersRes.value?.tenders) ? tendersRes.value.tenders : 
         Array.isArray(tendersRes.value) ? tendersRes.value : []) : [];

      const teamMembers = teamRes.status === 'fulfilled' ? 
        (Array.isArray(teamRes.value?.team_members) ? teamRes.value.team_members : 
         Array.isArray(teamRes.value) ? teamRes.value : []) : [];

      const notifications = notificationsRes.status === 'fulfilled' ? 
        (Array.isArray(notificationsRes.value) ? notificationsRes.value : []) : [];

      const todayEvents = calendarRes.status === 'fulfilled' ? 
        (Array.isArray(calendarRes.value) ? calendarRes.value : []) : [];

      // Calculate stats safely
      const currentUserId = user?.id;
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      const calculatedStats = {
        // Projects
        activeProjects: projects.filter(p => 
          p.status === 'active' || p.status === 'in_progress'
        ).length,
        completedProjects: projects.filter(p => 
          p.status === 'completed'
        ).length,

        // Tasks
        activeTasks: tasks.filter(t => 
          t.status === 'pending' || t.status === 'in_progress' || t.status === 'active'
        ).length,
        completedTasks: tasks.filter(t => 
          t.status === 'completed'
        ).length,
        overdueTasks: tasks.filter(t => {
          if (t.status === 'completed') return false;
          const dueDate = t.due_date || t.deadline;
          if (!dueDate) return false;
          return new Date(dueDate) < today;
        }).length,
        tasksDueToday: tasks.filter(t => {
          if (t.status === 'completed') return false;
          const dueDate = t.due_date || t.deadline;
          if (!dueDate) return false;
          return new Date(dueDate).toISOString().split('T')[0] === todayStr;
        }).length,
        myTasks: currentUserId ? tasks.filter(t => 
          (t.assigned_to === currentUserId || t.assignee_id === currentUserId) &&
          (t.status !== 'completed')
        ).length : 0,

        // Events & Calendar
        upcomingEvents: events.length + todayEvents.length,

        // Tenders
        activeTenders: tenders.filter(t => 
          t.status === 'active' || t.status === 'open'
        ).length,
        draftTenders: tenders.filter(t => 
          t.status === 'draft'
        ).length,

        // Team
        teamMembers: teamMembers.length,

        // Notifications
        pendingNotifications: notifications.filter(n => 
          !n.read && !n.is_read
        ).length
      };

      setStats(calculatedStats);
      setLastUpdated(new Date());
      
      console.log('✅ Stats updated:', calculatedStats);
      
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('authToken');
      localStorage.removeItem('authData');
      localStorage.removeItem('userData');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authData');
      localStorage.removeItem('userData');
      navigate('/login');
    }
  };

  // Determine active item based on current route
  const getActiveItem = (pathname) => {
    if (pathname === '/user/dashboard' || pathname === '/user' || pathname === '/dashboard') return 'dashboard';
    if (pathname === '/user/projects') return 'projects';
    if (pathname === '/user/projects/active') return 'active-projects';
    if (pathname === '/user/projects/completed') return 'completed-projects';
    if (pathname === '/user/projects/templates') return 'project-templates';
    if (pathname === '/user/tasks' || pathname === '/user/tasks/') return 'tasks';
    if (pathname === '/user/tasks/active') return 'active-tasks';
    if (pathname === '/user/tasks/completed') return 'completed-tasks';
    if (pathname === '/user/tasks/overdue') return 'overdue-tasks';
    if (pathname === '/user/tasks/my-tasks') return 'my-tasks';
    if (pathname === '/user/calendar') return 'calendar';
    if (pathname === '/user/team' || pathname === '/user/team/overview') return 'team-overview';
    if (pathname === '/user/team/performance') return 'team-performance';
    if (pathname === '/user/team/schedule') return 'team-schedule';
    if (pathname === '/user/tenders') return 'tenders';
    if (pathname === '/user/tenders/active') return 'active-tenders';
    if (pathname === '/user/tenders/drafts') return 'draft-tenders';
    if (pathname === '/user/tenders/history') return 'tender-history';
    if (pathname === '/user/locations') return 'locations';
    if (pathname === '/user/reports') return 'reports';
    if (pathname === '/user/reports/projects') return 'project-reports';
    if (pathname === '/user/reports/financial') return 'financial-reports';
    if (pathname === '/user/reports/team') return 'team-reports';
    if (pathname === '/user/notifications') return 'notifications';
    if (pathname === '/user/settings') return 'settings';
    return 'dashboard';
  };

  const activeItem = getActiveItem(location.pathname);

  // Auto-expand parent menus based on current route
  useEffect(() => {
    const pathname = location.pathname;
    const newExpanded = [...expandedItems];
    
    if (pathname.startsWith('/user/projects/')) {
      if (!newExpanded.includes('projects')) {
        newExpanded.push('projects');
      }
    }
    if (pathname.startsWith('/user/tasks/')) {
      if (!newExpanded.includes('tasks')) {
        newExpanded.push('tasks');
      }
    }
    if (pathname.startsWith('/user/team/')) {
      if (!newExpanded.includes('team')) {
        newExpanded.push('team');
      }
    }
    if (pathname.startsWith('/user/tenders/')) {
      if (!newExpanded.includes('tenders')) {
        newExpanded.push('tenders');
      }
    }
    if (pathname.startsWith('/user/reports/')) {
      if (!newExpanded.includes('reports')) {
        newExpanded.push('reports');
      }
    }
    
    setExpandedItems(newExpanded);
  }, [location.pathname]);

  const toggleExpanded = (item) => {
    setExpandedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Helper function to get badge count safely
  const getBadgeCount = (count) => {
    return count > 0 ? String(count) : null;
  };

  // DYNAMIC MENU ITEMS WITH REAL API DATA
  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/user/dashboard',
      badge: null
    },
    {
      id: 'projects',
      title: 'Projects',
      icon: FolderOpen,
      href: '/user/projects',
      badge: getBadgeCount(stats.activeProjects),
      hasSubmenu: true,
      submenu: [
        { 
          id: 'active-projects', 
          title: 'Active Projects', 
          icon: Target, 
          href: '/user/projects/active',
          badge: getBadgeCount(stats.activeProjects)
        },
        { 
          id: 'completed-projects', 
          title: 'Completed', 
          icon: CheckCircle, 
          href: '/user/projects/completed',
          badge: getBadgeCount(stats.completedProjects)
        },
      ]
    },
    {
      id: 'tasks',
      title: 'Tasks',
      icon: CheckSquare,
      href: '/user/tasks',
      badge: getBadgeCount(stats.activeTasks),
      hasSubmenu: true,
      submenu: [
        { 
          id: 'active-tasks', 
          title: 'Active Tasks', 
          icon: List, 
          href: '/user/tasks/active',
          badge: getBadgeCount(stats.activeTasks)
        },
        { 
          id: 'my-tasks', 
          title: 'My Tasks', 
          icon: User, 
          href: '/user/tasks/my-tasks',
          badge: getBadgeCount(stats.myTasks)
        },
        { 
          id: 'overdue-tasks', 
          title: 'Overdue', 
          icon: AlertTriangle, 
          href: '/user/tasks/overdue',
          badge: getBadgeCount(stats.overdueTasks),
          badgeColor: 'red'
        },
        { 
          id: 'completed-tasks', 
          title: 'Completed', 
          icon: CheckCircle, 
          href: '/user/tasks/completed',
          badge: getBadgeCount(stats.completedTasks)
        }
      ]
    },
    {
      id: 'calendar',
      title: 'Calendar',
      icon: Calendar,
      href: '/user/calendar',
      badge: getBadgeCount(stats.upcomingEvents)
    },
    {
      id: 'team',
      title: 'Team',
      icon: Users,
      href: '/user/team',
      badge: getBadgeCount(stats.teamMembers),
      hasSubmenu: true,
      submenu: [
        { id: 'team-overview', title: 'Overview', icon: Users, href: '/user/team/overview' },
        { id: 'team-performance', title: 'Performance', icon: BarChart3, href: '/user/team/performance' },
      ]
    },
    {
      id: 'tenders',
      title: 'Tenders',
      icon: Briefcase,
      href: '/user/tenders',
      badge: getBadgeCount(stats.activeTenders),
      hasSubmenu: true,
      submenu: [
        { 
          id: 'active-tenders', 
          title: 'Active', 
          icon: Clock, 
          href: '/user/tenders/active',
          badge: getBadgeCount(stats.activeTenders)
        },
        { 
          id: 'draft-tenders', 
          title: 'Drafts', 
          icon: FileText, 
          href: '/user/tenders/drafts',
          badge: getBadgeCount(stats.draftTenders)
        },
        { id: 'tender-history', title: 'History', icon: BarChart3, href: '/user/tenders/history' }
      ]
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: BarChart3,
      href: '/user/reports',
      hasSubmenu: true,
      submenu: [
        { id: 'project-reports', title: 'Project Reports', icon: BarChart3, href: '/user/reports/projects' },
        { id: 'financial-reports', title: 'Financial', icon: DollarSign, href: '/user/reports/financial' },
        { id: 'team-reports', title: 'Team Performance', icon: Users, href: '/user/reports/team' }
      ]
    }
  ];

  // BOTTOM ITEMS WITH REAL DATA
  const bottomItems = [
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      href: '/user/notifications',
      badge: getBadgeCount(stats.pendingNotifications)
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      href: '/user/settings'
    }
  ];

  const MenuItem = ({ item, isSubmenu = false, parentExpanded = true }) => {
    const isActive = activeItem === item.id;
    const isExpanded = expandedItems.includes(item.id);
    const Icon = item.icon;

    const handleClick = () => {
      console.log('Navigating to:', item.href);
      
      if (item.hasSubmenu) {
        toggleExpanded(item.id);
        if (item.href) {
          navigate(item.href);
        }
      } else {
        navigate(item.href);
        
        if (window.innerWidth < 1024) {
          onToggleCollapse();
        }
      }
    };

    // Determine badge color
    const getBadgeColor = () => {
      if (item.badgeColor === 'red') {
        return isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600';
      }
      return isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600';
    };

    return (
      <div className={`${isSubmenu ? 'ml-3 lg:ml-4' : ''} ${!parentExpanded && isSubmenu ? 'hidden' : ''}`}>
        <button
          onClick={handleClick}
          className={`
            w-full flex items-center justify-between px-3 py-2.5 lg:py-3 rounded-lg lg:rounded-xl text-left transition-all duration-200 group touch-manipulation
            ${isActive 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
              : 'text-gray-700 hover:bg-white/60 hover:text-gray-900 active:bg-white/80'
            }
            ${isSubmenu ? 'text-sm py-2' : 'font-medium'}
            ${isCollapsed && !isSubmenu ? 'justify-center px-2' : ''}
          `}
        >
          <div className="flex items-center min-w-0">
            <Icon className={`
              ${isSubmenu ? 'h-4 w-4' : 'h-5 w-5 lg:h-5 lg:w-5'} 
              flex-shrink-0 
              ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}
            `} />
            {!isCollapsed && (
              <span className="ml-2 lg:ml-3 truncate text-sm lg:text-base">{item.title}</span>
            )}
          </div>
          
          {!isCollapsed && (
            <div className="flex items-center space-x-1 lg:space-x-2">
              {item.badge && (
                <span className={`
                  px-1.5 py-0.5 lg:px-2 lg:py-1 text-xs font-bold rounded-full
                  ${getBadgeColor()}
                `}>
                  {item.badge}
                </span>
              )}
              {item.hasSubmenu && (
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4" />
                  ) : (
                    <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4" />
                  )}
                </div>
              )}
            </div>
          )}
        </button>
        {/* Submenu */}
        {item.hasSubmenu && !isCollapsed && isExpanded && (
          <div className="mt-1 lg:mt-2 space-y-1">
            {item.submenu.map((subItem) => (
              <MenuItem 
                key={subItem.id} 
                item={subItem} 
                isSubmenu={true} 
                parentExpanded={isExpanded}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleNewTask = () => {
    navigate('/user/tasks');
  };

  // Show loading state while fetching user data
  if (userLoading) {
    return (
      <div className={`
        ${isCollapsed ? 'w-16 lg:w-16' : 'w-72 sm:w-80 lg:w-64'} 
        h-full bg-white/90 lg:bg-white/80 backdrop-blur-lg border-r border-white/30 shadow-2xl lg:shadow-xl flex flex-col transition-all duration-300
        fixed lg:relative z-50 lg:z-auto
      `}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggleCollapse}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${isCollapsed ? 'w-16 lg:w-16' : 'w-72 sm:w-80 lg:w-64'} 
        h-full bg-white/90 lg:bg-white/80 backdrop-blur-lg border-r border-white/30 shadow-2xl lg:shadow-xl flex flex-col transition-all duration-300
        fixed lg:relative z-50 lg:z-auto
        ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
      `}>
        
        {/* Header */}
        <div className="p-3 lg:p-4 border-b border-gray-100/80">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div 
                className="flex items-center space-x-2 lg:space-x-3 cursor-pointer"
                onClick={() => navigate('/user/dashboard')}
              >
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm lg:text-base">ProjectHub</h2>
                  <p className="text-xs text-gray-500">
                    {user?.role || 'Project Manager'}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={onToggleCollapse}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            >
              {isCollapsed ? (
                <Menu className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5 lg:hidden" />
              )}
              {!isCollapsed && (
                <Menu className="h-5 w-5 hidden lg:block" />
              )}
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {userError && !isCollapsed && (
          <div className="p-3 lg:p-4 border-b border-gray-100/80">
            <div className="flex items-center space-x-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0" />
              <span className="text-xs text-orange-700">{userError}</span>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="p-3 lg:p-4 border-b border-gray-100/80">
            {/* Primary Action - New Task */}
            <button 
              onClick={handleNewTask}
              className="w-full flex items-center justify-center px-3 py-2.5 lg:px-4 lg:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg lg:rounded-xl hover:shadow-lg active:scale-95 transition-all duration-200 font-medium text-sm lg:text-base touch-manipulation"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              New Task
            </button>

            {/* Secondary Action - New Project */}
            <button 
              onClick={() => navigate('/user/projects')}
              className="w-full mt-2 flex items-center justify-center px-3 py-2 lg:px-4 lg:py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg lg:rounded-xl hover:bg-gray-50 hover:shadow-sm active:scale-95 transition-all duration-200 font-medium text-sm touch-manipulation"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </button>
            
            {/* Quick Search */}
            <div className="mt-3 relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Quick search..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm touch-manipulation"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    console.log('Search:', e.target.value);
                  }
                }}
              />
            </div>

            {/* Refresh Stats Button */}
            <button 
              onClick={fetchStats}
              disabled={statsLoading}
              className="w-full mt-2 flex items-center justify-center px-3 py-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm touch-manipulation"
              title="Refresh Statistics"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
              {statsLoading ? 'Updating...' : 'Refresh Stats'}
            </button>
          </div>
        )}

        {/* Task Summary - Now Dynamic */}
        {!isCollapsed && (stats.activeTasks > 0 || stats.tasksDueToday > 0 || stats.overdueTasks > 0) && (
          <div className="px-3 lg:px-4 pb-3 lg:pb-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Today's Tasks</span>
                <Timer className="h-4 w-4 text-blue-600" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-bold text-blue-600">{stats.tasksDueToday}</div>
                  <div className="text-gray-600">Overdue</div>
                </div>
              </div>
              {lastUpdated && (
                <div className="text-center mt-2 text-xs text-gray-500">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Loading Indicator */}
        {statsLoading && !isCollapsed && (
          <div className="px-3 lg:px-4 pb-3">
            <div className="flex items-center justify-center space-x-2 p-2 bg-blue-50 rounded-lg">
              <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
              <span className="text-sm text-blue-700">Updating statistics...</span>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto py-3 lg:py-4 px-3 lg:px-4">
          <nav className="space-y-1 lg:space-y-2">
            {menuItems.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}
          </nav>
        </div>

        {/* Bottom Navigation */}
        <div className="border-t border-gray-100/80 p-3 lg:p-4">
          <nav className="space-y-1 lg:space-y-2">
            {bottomItems.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}
          </nav>
        </div>

        {/* User Profile Section */}
        {!isCollapsed && user && (
          <div className="border-t border-gray-100/80 p-3 lg:p-4">
            <div 
              className="flex items-center space-x-2 lg:space-x-3 p-2.5 lg:p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg lg:rounded-xl border border-gray-200 cursor-pointer hover:shadow-sm transition-all"
              onClick={() => navigate('/user/profile')}
            >
              {/* User Avatar */}
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm lg:text-base">
                  {getUserInitials(user.name)}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm lg:text-sm font-semibold text-gray-900 truncate">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {user.role || 'Project Manager'}
                </p>
              </div>
              {/* Logout button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Stats Summary (when expanded) */}
            {!statsLoading && (
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <div className="font-bold text-blue-600">{stats.activeProjects}</div>
                  <div className="text-gray-600">Projects</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <div className="font-bold text-green-600">{stats.activeTasks}</div>
                  <div className="text-gray-600">Tasks</div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded-lg">
                  <div className="font-bold text-purple-600">{stats.teamMembers}</div>
                  <div className="text-gray-600">Team</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;