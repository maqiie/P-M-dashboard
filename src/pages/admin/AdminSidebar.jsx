import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Settings, Calendar, Users, Building2, 
  CheckSquare, BarChart3, FileText, Home, X,
  Bell, History, Menu, LogOut,
  Minimize2, Maximize2
} from 'lucide-react';
// Import your API functions
import { 
  projectsAPI, 
  tasksAPI, 
  tendersAPI, 
  notificationsAPI, 
  authAPI,
  meetingsAPI
} from '../../services/api';

const AdminSidebar = ({ isOpen, setIsOpen, onCollapseChange, theme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [hovering, setHovering] = useState(false);
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  // State for real data
  const [counts, setCounts] = useState({
    projects: 0,
    tasks: 0,
    tenders: 0,
    notifications: 0,
    meetings: 0
  });
  const [user, setUser] = useState({
    name: 'Loading...',
    role: 'User',
    initials: 'U',
    email: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved !== null) {
        const newCollapsed = JSON.parse(saved);
        setIsCollapsed(newCollapsed);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 100);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]);

  // Fetch real data from APIs
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setLoading(true);
        
        const [
          projectsData,
          tasksStats,
          tendersStats,
          notificationCount,
          meetingsData,
          userData
        ] = await Promise.allSettled([
          projectsAPI.getAll(),
          tasksAPI.getStatistics().catch(() => ({ statistics: { total: 0 } })),
          tendersAPI.getStatistics().catch(() => ({ statistics: { total: 0 } })),
          notificationsAPI.getUnreadCount().catch(() => ({ count: 0 })),
          meetingsAPI.getAll({ filter: 'upcoming' }).catch(() => ({ meetings: [] })),
          authAPI.getUserDetails().catch(() => ({ data: null }))
        ]);

        // Process projects count
        let projectCount = 0;
        if (projectsData.status === 'fulfilled') {
          const projects = Array.isArray(projectsData.value) 
            ? projectsData.value 
            : projectsData.value?.projects || projectsData.value?.data || [];
          projectCount = projects.length;
        }

        // Process tasks count
        let taskCount = 0;
        if (tasksStats.status === 'fulfilled') {
          taskCount = tasksStats.value?.statistics?.total || 
                     tasksStats.value?.total || 
                     tasksStats.value?.tasks?.length || 0;
        }

        // Process tenders count
        let tenderCount = 0;
        if (tendersStats.status === 'fulfilled') {
          tenderCount = tendersStats.value?.statistics?.total || 
                       tendersStats.value?.total || 
                       tendersStats.value?.tenders?.length || 0;
        }

        // Process notifications count
        let notifCount = 0;
        if (notificationCount.status === 'fulfilled') {
          notifCount = notificationCount.value?.count || 
                      notificationCount.value?.unread_count || 
                      notificationCount.value?.data?.count || 0;
        }

        // Process meetings count (upcoming meetings)
        let meetingCount = 0;
        if (meetingsData.status === 'fulfilled') {
          const meetings = Array.isArray(meetingsData.value) 
            ? meetingsData.value 
            : meetingsData.value?.meetings || meetingsData.value?.data || [];
          meetingCount = meetings.length;
        }

        // Process user data
        let userInfo = {
          name: 'Admin User',
          role: 'Administrator',
          initials: 'AU',
          email: ''
        };
        if (userData.status === 'fulfilled' && userData.value?.data) {
          const user = userData.value.data;
          userInfo = {
            name: user.name || user.full_name || 'Admin User',
            role: user.admin ? 'Administrator' : 'User',
            email: user.email || '',
            initials: getInitials(user.name || user.full_name || 'Admin User')
          };
        }

        setCounts({
          projects: projectCount,
          tasks: taskCount,
          tenders: tenderCount,
          notifications: notifCount,
          meetings: meetingCount
        });
        setUser(userInfo);
      } catch (error) {
        console.error('❌ Failed to fetch sidebar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
    const interval = setInterval(fetchRealData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };
  
  const getActiveSection = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/dashboard') return 'dashboard';
    if (path.includes('/admin/projects')) return 'projects';
    if (path.includes('/admin/tasks')) return 'tasks';
    if (path.includes('/admin/tenders')) return 'tenders';
    if (path.includes('/admin/team')) return 'team';
    if (path.includes('/admin/meetings')) return 'meetings';
    if (path.includes('/admin/calendar')) return 'calendar';
    if (path.includes('/admin/reports')) return 'reports';
    if (path.includes('/admin/history')) return 'history';
    if (path.includes('/admin/notifications')) return 'notifications';
    if (path.includes('/admin/settings')) return 'settings';
    return 'dashboard';
  };

  const activeSection = getActiveSection();

  // Menu sections with real data
  const menuSections = [
    {
      title: 'Overview',
      items: [
        { 
          id: 'dashboard', 
          label: 'Dashboard', 
          icon: Home, 
          description: 'Main overview & insights',
          route: '/admin/dashboard'
        }
      ]
    },
    {
      title: 'Project Management',
      items: [
        { 
          id: 'projects', 
          label: 'Projects', 
          icon: Building2, 
          badge: counts.projects > 0 ? counts.projects : null,
          description: 'Construction projects',
          route: '/admin/projects'
        },
        { 
          id: 'tasks', 
          label: 'Tasks', 
          icon: CheckSquare, 
          badge: counts.tasks > 0 ? counts.tasks : null,
          description: 'Task management',
          route: '/admin/tasks'
        },
        { 
          id: 'tenders', 
          label: 'Tenders', 
          icon: FileText, 
          badge: counts.tenders > 0 ? counts.tenders : null,
          description: 'Bid management',
          route: '/admin/tenders'
        }
      ]
    },
    {
      title: 'Team & Schedule',
      items: [
        { 
          id: 'team', 
          label: 'Team', 
          icon: Users, 
          description: 'Team members',
          route: '/admin/team'
        },
        { 
          id: 'meetings', 
          label: 'Meetings', 
          icon: Calendar, 
          badge: counts.meetings > 0 ? counts.meetings : null,
          description: 'Schedule meetings',
          route: '/admin/meetings'
        },
        { 
          id: 'calendar', 
          label: 'Calendar', 
          icon: Calendar, 
          description: 'Schedule events',
          route: '/admin/calendar'
        }
      ]
    },
    {
      title: 'Analytics',
      items: [
        // { 
        //   id: 'reports', 
        //   label: 'Reports', 
        //   icon: BarChart3, 
        //   description: 'Analytics & stats',
        //   route: '/admin/reports'
        // },
        { 
          id: 'history', 
          label: 'History', 
          icon: History, 
          description: 'Completed work',
          route: '/admin/history'
        }
      ]
    },
    {
      title: 'System',
      items: [
        { 
          id: 'notifications', 
          label: 'Notifications', 
          icon: Bell, 
          badge: counts.notifications > 0 ? counts.notifications : null,
          description: 'Alerts & updates',
          route: '/admin/notifications'
        },
        { 
          id: 'settings', 
          label: 'Settings', 
          icon: Settings, 
          description: 'System config',
          route: '/admin/settings'
        }
      ]
    }
  ];

  const handleNavigateToSection = (route) => {
    navigate(route);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('authToken');
      localStorage.removeItem('sidebar-collapsed');
      navigate('/login');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      navigate('/login');
    }
  };

  const toggleCollapse = useCallback(() => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newCollapsed));
  }, [isCollapsed]);

  // Calculate actual width based on state
  const actualWidth = isCollapsed && !hovering ? 64 : 280;
  const showLabels = !isCollapsed || hovering;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />
      
      {/* Sidebar Container */}
      <div 
        className={`
          h-full flex-shrink-0 transition-all duration-300 ease-in-out
          ${isOpen ? 'fixed inset-y-0 left-0 z-50 lg:relative' : 'fixed -translate-x-full lg:relative lg:translate-x-0'}
        `}
        style={{ width: actualWidth }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="flex flex-col h-full bg-white border-r border-slate-200 shadow-lg">
          
          {/* Header Section */}
          <div className="flex-shrink-0 p-4 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {showLabels && (
                  <div 
                    className="cursor-pointer"
                    onClick={handleBackToDashboard}
                  >
                    <h1 className="text-white text-lg font-bold leading-tight">
                      Ujenzi & Paints
                    </h1>
                    <p className="text-blue-100 text-xs">
                      Construction Management
                    </p>
                  </div>
                )}
              </div>
              
              {/* Control Buttons */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={toggleCollapse}
                  className="hidden lg:flex p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all"
                  title={isCollapsed ? "Expand" : "Collapse"}
                >
                  {isCollapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                
                <button
                  onClick={handleClose}
                  className="lg:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Search Bar */}
            {showLabels && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-2 bg-white/20 text-white placeholder-white/60 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                />
              </div>
            )}
          </div>
          
          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-4">
              {menuSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="px-3">
                  {showLabels && (
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                      {section.title}
                    </h3>
                  )}
                  
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavigateToSection(item.route)}
                          className={`
                            w-full flex items-center rounded-xl transition-all duration-200 group text-left relative
                            ${showLabels ? 'justify-between px-3 py-2.5' : 'justify-center px-2 py-2.5'}
                            ${isActive 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }
                          `}
                          title={!showLabels ? item.label : ''}
                        >
                          <div className={`flex items-center ${showLabels ? 'space-x-3' : ''}`}>
                            <div className={`
                              flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all
                              ${isActive 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                              }
                            `}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            {showLabels && (
                              <div className="text-left min-w-0">
                                <div className="text-sm font-semibold truncate">
                                  {item.label}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {showLabels && item.badge && (
                            <span className={`
                              px-2 py-0.5 text-xs font-bold rounded-full
                              ${isActive 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-slate-200 text-slate-600'
                              }
                            `}>
                              {item.badge}
                            </span>
                          )}
                          
                          {!showLabels && item.badge && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold">
                              {item.badge > 9 ? '9+' : item.badge}
                            </span>
                          )}
                          
                          {/* Tooltip for collapsed state */}
                          {!showLabels && (
                            <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-slate-900 text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                              {item.label}
                              {item.badge && ` (${item.badge})`}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* User Profile Section */}
          <div className="flex-shrink-0 p-3 border-t border-slate-200">
            {showLabels ? (
              <div className="flex items-center space-x-3 p-2 rounded-xl bg-slate-50">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{user.initials}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.role}</p>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleNavigateToSection('/admin/settings')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    title="Settings"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                    title="Logout"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{user.initials}</span>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleNavigateToSection('/admin/settings')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    title="Settings"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                    title="Logout"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;