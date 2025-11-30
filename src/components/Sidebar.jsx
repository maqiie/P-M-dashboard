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
  RefreshCw,
  Zap,
  TrendingUp,
  Maximize2,
  Minimize2
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, onCollapseChange, theme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState(['projects']);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // User data state
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);
  
  // Stats state with sensible defaults
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
  const [statsLoading, setStatsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [apiAvailable, setApiAvailable] = useState(true);

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsed !== null) {
      const collapsed = JSON.parse(savedCollapsed);
      setIsCollapsed(collapsed);
      if (onCollapseChange) {
        onCollapseChange(collapsed);
      }
    }
  }, []);

  // Fetch user data and stats on component mount
  useEffect(() => {
    fetchUserData();
    fetchStats();
    
    const interval = setInterval(() => {
      if (apiAvailable) {
        fetchStats();
      }
    }, 300000);
    
    return () => clearInterval(interval);
  }, [apiAvailable]);

  const fetchUserData = async () => {
    try {
      setUserLoading(true);
      setUserError(null);
      
      const response = await getUserDetails();
      
      if (response && (response.data || response.user || response)) {
        const userData = response.data || response.user || response;
        setUser(userData);
        setApiAvailable(true);
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      console.warn('Failed to fetch user data (sidebar will still work):', error);
      setUserError('Failed to load user information');
      setApiAvailable(false);
      
      setUser({
        id: 'temp_user',
        name: localStorage.getItem('userName') || 'User',
        email: localStorage.getItem('userEmail') || 'user@example.com',
        role: localStorage.getItem('userRole') || 'Project Manager',
        avatar: null,
        permissions: []
      });
    } finally {
      setUserLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!apiAvailable) return;
    
    try {
      setStatsLoading(true);
      
      const [
        projectsRes,
        tasksRes,
        eventsRes,
        tendersRes,
        teamRes,
        notificationsRes,
        calendarRes
      ] = await Promise.allSettled([
        projectsAPI.getAll().catch(err => ({ projects: [] })),
        tasksAPI.getAll().catch(err => ({ tasks: [] })),
        eventsAPI.getUpcoming(10).catch(err => ({ events: [] })),
        tendersAPI.getAll().catch(err => ({ tenders: [] })),
        teamMembersAPI.getAll().catch(err => ({ team_members: [] })),
        notificationsAPI.getAll().catch(err => []),
        calendarAPI.getTodayEvents().catch(err => [])
      ]);

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

      const currentUserId = user?.id;
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      const calculatedStats = {
        activeProjects: projects.filter(p => 
          p.status === 'active' || p.status === 'in_progress'
        ).length,
        completedProjects: projects.filter(p => 
          p.status === 'completed'
        ).length,
        
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
        
        upcomingEvents: events.length + todayEvents.length,
        
        activeTenders: tenders.filter(t => 
          t.status === 'active' || t.status === 'open'
        ).length,
        draftTenders: tenders.filter(t => 
          t.status === 'draft'
        ).length,
        
        teamMembers: teamMembers.length,
        
        pendingNotifications: notifications.filter(n => 
          !n.read && !n.is_read
        ).length
      };

      setStats(calculatedStats);
      setLastUpdated(new Date());
      setApiAvailable(true);
      
    } catch (error) {
      console.warn('Failed to fetch stats (using defaults):', error);
      setApiAvailable(false);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authData');
      localStorage.removeItem('userData');
      navigate('/login');
    }
  };

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newCollapsed));
    
    if (onCollapseChange) {
      onCollapseChange(newCollapsed);
    }
    
    if (setIsOpen && window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const getActiveItem = (pathname) => {
    const path = pathname.replace(/^\/(admin|user)/, '');
    
    if (path === '/dashboard' || path === '' || pathname === '/admin' || pathname === '/user') return 'dashboard';
    if (path === '/projects') return 'projects';
    if (path === '/projects/active') return 'active-projects';
    if (path === '/projects/completed') return 'completed-projects';
    if (path === '/tasks' || path === '/tasks/') return 'tasks';
    if (path === '/tasks/active') return 'active-tasks';
    if (path === '/tasks/completed') return 'completed-tasks';
    if (path === '/tasks/overdue') return 'overdue-tasks';
    if (path === '/tasks/my-tasks') return 'my-tasks';
    if (path === '/calendar') return 'calendar';
    if (path === '/team' || path === '/team/overview') return 'team-overview';
    if (path === '/team/performance') return 'team-performance';
    if (path === '/tenders') return 'tenders';
    if (path === '/tenders/active') return 'active-tenders';
    if (path === '/tenders/drafts') return 'draft-tenders';
    if (path === '/locations') return 'locations';
    if (path === '/reports') return 'reports';
    if (path === '/notifications') return 'notifications';
    if (path === '/settings') return 'settings';
    if (path === '/profile') return 'profile';
    return 'dashboard';
  };

  const activeItem = getActiveItem(location.pathname);

  useEffect(() => {
    const pathname = location.pathname;
    const newExpanded = [...expandedItems];
    
    if (pathname.includes('/projects/')) {
      if (!newExpanded.includes('projects')) {
        newExpanded.push('projects');
      }
    }
    if (pathname.includes('/tasks/')) {
      if (!newExpanded.includes('tasks')) {
        newExpanded.push('tasks');
      }
    }
    if (pathname.includes('/team/')) {
      if (!newExpanded.includes('team')) {
        newExpanded.push('team');
      }
    }
    if (pathname.includes('/tenders/')) {
      if (!newExpanded.includes('tenders')) {
        newExpanded.push('tenders');
      }
    }
    if (pathname.includes('/reports/')) {
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

  const getBadgeCount = (count) => {
    return count > 0 ? String(count) : null;
  };

  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '/user';

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: `${basePath}/dashboard`,
      badge: null
    },
    {
      id: 'projects',
      title: 'Projects',
      icon: FolderOpen,
      // href: `${basePath}/projects`,
      badge: getBadgeCount(stats.activeProjects),
      hasSubmenu: true,
      submenu: [
        { 
          id: 'active-projects', 
          title: 'Active Projects', 
          icon: Target, 
          href: `${basePath}/projects/active`,
          badge: getBadgeCount(stats.activeProjects)
        },
      ]
    },
    {
      id: 'tasks',
      title: 'Tasks',
      icon: CheckSquare,
      href: `${basePath}/tasks`,
      badge: getBadgeCount(stats.activeTasks),
      hasSubmenu: true,
      submenu: [
        { 
          id: 'active-tasks', 
          title: 'Active Tasks', 
          icon: List, 
          href: `${basePath}/tasks/active`,
          badge: getBadgeCount(stats.activeTasks)
        },
        { 
          id: 'my-tasks', 
          title: 'My Tasks', 
          icon: User, 
          href: `${basePath}/tasks/my-tasks`,
          badge: getBadgeCount(stats.myTasks)
        },
        { 
          id: 'overdue-tasks', 
          title: 'Overdue', 
          icon: AlertTriangle, 
          href: `${basePath}/tasks/overdue`,
          badge: getBadgeCount(stats.overdueTasks),
          badgeColor: 'red'
        },
        { 
          id: 'completed-tasks', 
          title: 'Completed', 
          icon: CheckCircle, 
          href: `${basePath}/tasks/completed`,
          badge: getBadgeCount(stats.completedTasks)
        }
      ]
    },
    {
      id: 'calendar',
      title: 'Calendar',
      icon: Calendar,
      href: `${basePath}/calendar`,
      badge: getBadgeCount(stats.upcomingEvents)
    },
  {
  id: 'team',
  title: 'Team',
  icon: Users,
  href: null,                     // 🔥 Remove navigation
  hasSubmenu: true,
  badge: getBadgeCount(stats.teamMembers),
  submenu: [
    { id: 'team-overview', title: 'Overview', icon: Users, href: `${basePath}/team/overview` },
    { id: 'team-performance', title: 'Performance', icon: BarChart3, href: `${basePath}/team/performance` },
  ]
},
    {
      id: 'tenders',
      title: 'Tenders',
      icon: Briefcase,
      href: `${basePath}/tenders`,
      badge: getBadgeCount(stats.activeTenders),
      hasSubmenu: true,
      submenu: [
        { 
          id: 'active-tenders', 
          title: 'Active', 
          icon: Clock, 
          href: `${basePath}/tenders/active`,
          badge: getBadgeCount(stats.activeTenders)
        },
        { 
          id: 'draft-tenders', 
          title: 'Drafts', 
          icon: FileText, 
          href: `${basePath}/tenders/drafts`,
          badge: getBadgeCount(stats.draftTenders)
        },
      ]
    },
  ];

  const bottomItems = [
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      href: `${basePath}/notifications`,
      badge: getBadgeCount(stats.pendingNotifications)
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      href: `${basePath}/settings`
    }
  ];

  const MenuItem = ({ item, isSubmenu = false, parentExpanded = true }) => {
    const isActive = activeItem === item.id;
    const isExpanded = expandedItems.includes(item.id);
    const Icon = item.icon;

    const handleClick = () => {
      if (item.hasSubmenu) {
        toggleExpanded(item.id);
        if (item.href) {
          navigate(item.href);
        }
      } else {
        navigate(item.href);
        
        if (setIsOpen && window.innerWidth < 1024) {
          setIsOpen(false);
        }
      }
    };

    const getBadgeColor = () => {
      if (item.badgeColor === 'red') {
        return isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600';
      }
      return isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600';
    };

    return (
      <div className={`${isSubmenu ? 'ml-4' : ''} ${!parentExpanded && isSubmenu ? 'hidden' : ''}`}>
        <button
          onClick={handleClick}
          className={`
            w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-300 group
            ${isActive 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30' 
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }
            ${isSubmenu ? 'text-sm py-2.5' : 'font-semibold text-base'}
            ${isCollapsed && !isSubmenu ? 'justify-center px-3' : ''}
          `}
        >
          <div className="flex items-center min-w-0">
            <Icon className={`
              ${isSubmenu ? 'h-4 w-4' : 'h-5 w-5'} 
              flex-shrink-0 
              ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}
            `} />
            {!isCollapsed && (
              <span className="ml-3 truncate">{item.title}</span>
            )}
          </div>
          
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              {item.badge && (
                <span className={`
                  px-2 py-0.5 text-xs font-bold rounded-full
                  ${getBadgeColor()}
                `}>
                  {item.badge}
                </span>
              )}
              {item.hasSubmenu && (
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              )}
            </div>
          )}
        </button>

        {item.hasSubmenu && !isCollapsed && isExpanded && (
          <div className="mt-1 space-y-1">
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

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isCollapsed ? 'w-20' : 'w-80'} 
        h-screen bg-white border-r-2 border-slate-200 shadow-2xl flex flex-col transition-all duration-300 ease-in-out
        fixed lg:relative z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Header */}
        <div className="p-5 border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div 
                className="flex items-center space-x-3 cursor-pointer group"
                onClick={() => navigate(`${basePath}/dashboard`)}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-105 transition-all">
                  <Building2 className="h-7 w-7 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-lg">Ujenzi & Paints</h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    {user?.role || 'Dashboard'}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={handleToggleCollapse}
              className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        {!isCollapsed && apiAvailable && (
          <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-slate-200">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-2xl font-black text-blue-600">{stats.activeProjects}</div>
                <div className="text-xs text-slate-600 font-semibold">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-emerald-600">{stats.activeTasks}</div>
                <div className="text-xs text-slate-600 font-semibold">Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-purple-600">{stats.teamMembers}</div>
                <div className="text-xs text-slate-600 font-semibold">Team</div>
              </div>
            </div>
            
            <button 
              onClick={fetchStats}
              disabled={statsLoading}
              className="w-full mt-3 flex items-center justify-center px-3 py-2 bg-white border-2 border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:shadow-md transition-all text-sm font-semibold disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
              {statsLoading ? 'Updating...' : 'Refresh Stats'}
            </button>
          </div>
        )}

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}
          </nav>
        </div>

        {/* Bottom Navigation */}
        <div className="border-t-2 border-slate-200 p-4 bg-slate-50">
          <nav className="space-y-2">
            {bottomItems.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}
          </nav>
        </div>

        {/* User Profile Section */}
        {!isCollapsed && user && (
          <div className="border-t-2 border-slate-200 p-4 bg-gradient-to-r from-slate-50 to-white">
            <div 
              className="flex items-center space-x-3 p-3 bg-white rounded-xl border-2 border-slate-200 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group"
              onClick={() => navigate(`${basePath}/profile`)}
            >
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                  {getUserInitials(user.name)}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-slate-500 font-semibold">
                  {user.role || 'Member'}
                </p>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </div>

            {lastUpdated && apiAvailable && (
              <div className="mt-3 text-center text-xs text-slate-500 font-semibold">
                Updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
