// src/pages/admin/AdminSidebar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Settings, Calendar, Users, Building2, 
  CheckSquare, BarChart3, FileText, Home, X, Palette,
  Bell, Shield, Target, Activity, Briefcase, Globe,
  Command, Sparkles, ChevronRight, Plus, Star, Brush,
  PaintBucket, Hammer, HardHat, Menu, LogOut, ArrowLeft,
  ChevronLeft, Minimize2, Maximize2
} from 'lucide-react';

const AdminSidebar = ({ isOpen, setIsOpen, onCollapseChange, theme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hovering, setHovering] = useState(false);
  
  // Load collapsed state from localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsed !== null) {
      setIsCollapsed(JSON.parse(savedCollapsed));
    }
  }, []);

  // Save collapsed state to localStorage and notify parent
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]);
  
  // Determine active section from current route
  const getActiveSection = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/dashboard') return 'dashboard';
    if (path.includes('/admin/analytics')) return 'analytics';
    if (path.includes('/admin/projects')) return 'projects';
    if (path.includes('/admin/tasks')) return 'tasks';
    if (path.includes('/admin/tenders')) return 'tenders';
    if (path.includes('/admin/team')) return 'team';
    if (path.includes('/admin/calendar')) return 'calendar';
    if (path.includes('/admin/reports')) return 'reports';
    if (path.includes('/admin/notifications')) return 'notifications';
    if (path.includes('/admin/settings')) return 'settings';
    return 'dashboard';
  };

  const activeSection = getActiveSection();

  const menuSections = [
    {
      title: 'Overview',
      items: [
        { 
          id: 'dashboard', 
          label: 'Dashboard', 
          icon: Home, 
          description: 'Main overview',
          route: '/admin/dashboard'
        },
        { 
          id: 'analytics', 
          label: 'Analytics', 
          icon: BarChart3, 
          description: 'Data insights',
          route: '/admin/analytics'
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
          badge: 18,
          description: 'Construction projects',
          route: '/admin/projects'
        },
        { 
          id: 'tasks', 
          label: 'Tasks', 
          icon: CheckSquare, 
          badge: 12,
          description: 'Task management',
          route: '/admin/tasks'
        },
        { 
          id: 'tenders', 
          label: 'Tenders', 
          icon: FileText, 
          badge: 5,
          description: 'Bid management',
          route: '/admin/tenders'
        }
      ]
    },
    {
      title: 'Team & Resources',
      items: [
        { 
          id: 'team', 
          label: 'Team', 
          icon: Users, 
          description: 'Team members',
          route: '/admin/team'
        },
        { 
          id: 'calendar', 
          label: 'Calendar', 
          icon: Calendar, 
          description: 'Schedule events',
          route: '/admin/calendar'
        },
        { 
          id: 'reports', 
          label: 'Reports', 
          icon: Target, 
          description: 'Performance reports',
          route: '/admin/reports'
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
          badge: 3,
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

  const quickActions = [
    { 
      icon: Plus, 
      label: 'New Project',
      onClick: () => {
        navigate('/admin/projects/new');
        if (window.innerWidth < 1024) setIsOpen(false);
      }
    },
    { 
      icon: Bell, 
      label: 'Alerts',
      onClick: () => {
        navigate('/admin/notifications');
        if (window.innerWidth < 1024) setIsOpen(false);
      }
    },
    { 
      icon: Target, 
      label: 'Reports',
      onClick: () => {
        navigate('/admin/reports');
        if (window.innerWidth < 1024) setIsOpen(false);
      }
    },
    { 
      icon: Star, 
      label: 'Favorites',
      onClick: () => {
        navigate('/admin/dashboard');
        if (window.innerWidth < 1024) setIsOpen(false);
      }
    }
  ];

  const handleNavigateToSection = (route) => {
    navigate(route);
    // Close sidebar on mobile navigation
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

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Calculate sidebar width based on state
  const sidebarWidth = isCollapsed && !hovering ? 'w-16' : 'w-80';
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
          fixed left-0 top-0 h-full z-50 ${sidebarWidth}
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          bg-white shadow-2xl border-r border-gray-200
        `}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="flex flex-col h-full">
          
          {/* Header Section */}
          <div className="flex-shrink-0 p-4 bg-gradient-to-r from-orange-600 to-yellow-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all duration-200"
                  onClick={handleBackToDashboard}
                >
                  <div className="flex items-center space-x-1">
                    <Palette className="h-4 w-4 text-white" />
                    <Brush className="h-4 w-4 text-white" />
                  </div>
                </div>
                {showLabels && (
                  <div 
                    className="cursor-pointer"
                    onClick={handleBackToDashboard}
                  >
                    <h1 className="text-white text-lg font-bold">
                      Ujenzi & Paints
                    </h1>
                    <p className="text-orange-100 text-xs">
                      Construction Suite
                    </p>
                  </div>
                )}
              </div>
              
              {/* Control Buttons */}
              <div className="flex items-center space-x-2">
                {/* Desktop Collapse Toggle */}
                <button
                  onClick={toggleCollapse}
                  className="hidden lg:flex p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
                  title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                  {isCollapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                
                {/* Back to Dashboard Button for non-dashboard pages */}
                {activeSection !== 'dashboard' && showLabels && (
                  <button
                    onClick={handleBackToDashboard}
                    className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
                    title="Back to Dashboard"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                
                {/* Mobile Close Button */}
                <button
                  onClick={handleClose}
                  className="lg:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Search Bar - Only show when expanded */}
            {showLabels && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 bg-white/20 text-white placeholder-white/60 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>
            )}
          </div>
          
          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="p-3 space-y-4">
              {menuSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {/* Section Title - Only show when expanded */}
                  {showLabels && (
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
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
                            w-full flex items-center rounded-lg transition-all duration-200 group text-left relative
                            ${showLabels ? 'justify-between px-3 py-2.5' : 'justify-center px-2 py-3'}
                            ${isActive 
                              ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-sm' 
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }
                          `}
                          title={!showLabels ? item.label : ''}
                        >
                          <div className={`flex items-center ${showLabels ? 'space-x-3' : ''}`}>
                            <div className={`
                              flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200
                              ${isActive 
                                ? 'bg-orange-100 text-orange-600' 
                                : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-600'
                              }
                            `}>
                              <Icon className="h-4 w-4" />
                            </div>
                            {showLabels && (
                              <div className="text-left">
                                <div className="text-sm font-medium">
                                  {item.label}
                                </div>
                                <div className={`text-xs ${isActive ? 'text-orange-500' : 'text-gray-500'}`}>
                                  {item.description}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Badge and Arrow - Only show when expanded */}
                          {showLabels && (
                            <div className="flex items-center space-x-2">
                              {item.badge && (
                                <span className={`
                                  px-2 py-0.5 text-xs font-medium rounded-full
                                  ${isActive 
                                    ? 'bg-orange-200 text-orange-800' 
                                    : 'bg-gray-200 text-gray-600'
                                  }
                                `}>
                                  {item.badge}
                                </span>
                              )}
                              <ChevronRight className={`
                                h-3 w-3 transition-all duration-200
                                ${isActive 
                                  ? 'text-orange-400 transform rotate-90' 
                                  : 'text-gray-400 group-hover:text-gray-600'
                                }
                              `} />
                            </div>
                          )}

                          {/* Badge for collapsed state */}
                          {!showLabels && item.badge && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                              {item.badge}
                            </span>
                          )}

                          {/* Tooltip for collapsed state */}
                          {!showLabels && (
                            <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                              {item.label}
                              <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
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
          
          {/* Quick Actions - Only show when expanded */}
          {showLabels && (
            <div className="flex-shrink-0 p-3 bg-gray-50 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Quick Actions
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="flex flex-col items-center p-2.5 rounded-lg bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group"
                  >
                    <action.icon className="h-4 w-4 text-gray-600 group-hover:text-orange-600 transition-colors duration-200" />
                    <span className="text-xs text-gray-600 group-hover:text-orange-600 mt-1 font-medium">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Quick Actions for Collapsed State */}
          {!showLabels && (
            <div className="flex-shrink-0 p-2 bg-gray-50 border-t border-gray-200">
              <div className="space-y-2">
                {quickActions.slice(0, 2).map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="w-full flex items-center justify-center p-2 rounded-lg bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group relative"
                    title={action.label}
                  >
                    <action.icon className="h-4 w-4 text-gray-600 group-hover:text-orange-600 transition-colors duration-200" />
                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {action.label}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* User Profile Section */}
          <div className="flex-shrink-0 p-3 bg-white border-t border-gray-200">
            {showLabels ? (
              <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">A</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleNavigateToSection('/admin/settings')}
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all duration-200"
                    title="Settings"
                  >
                    <Settings className="h-3 w-3" />
                  </button>
                  <button 
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleNavigateToSection('/admin/settings')}
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all duration-200 relative group"
                    title="Settings"
                  >
                    <Settings className="h-3 w-3" />
                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      Settings
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                  </button>
                  <button 
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 relative group"
                    title="Logout"
                  >
                    <LogOut className="h-3 w-3" />
                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      Logout
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
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