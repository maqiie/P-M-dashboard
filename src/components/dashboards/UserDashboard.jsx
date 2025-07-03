import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar';
import UserDashboardRoutes from '../../routes/UserDashboardRoutes'; // Import your routes
import { 
  getUserDetails, 
  logout, 
  getProjectManagerDashboard,
  getMyProjects,
  getUpcomingEvents,
  getMyTenders,
  getDashboardStatistics,
  createProject
} from '../../services/api';
import { 
  Calendar, 
  Clock,
  LogOut,
  Bell,
  CheckCircle,
  Users,
  FileText,
  AlertTriangle,
  Plus,
  MoreHorizontal,
  MapPin,
  User,
  Building2,
  Filter,
  Search,
  ArrowRight,
  Target,
  Briefcase,
  Activity,
  Menu,
  Wifi,
  WifiOff,
  X,
  Save,
  Upload,
  DollarSign
} from 'lucide-react';

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // User and data states
  const [user, setUser] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);

  // Check if we're on the main dashboard route
  const isMainDashboard = location.pathname === '/user' || 
                         location.pathname === '/user/' || 
                         location.pathname === '/user/dashboard';

  // Project creation form state
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    location: '',
    budget: '',
    startDate: '',
    endDate: '',
    priority: 'medium',
    status: 'planning'
  });

  useEffect(() => {
    // Only load dashboard data if we're on the main dashboard
    if (isMainDashboard) {
      loadUserData();
    }
    
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isMainDashboard]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading user and dashboard data...');
      
      // Load user details first
      const userResponse = await getUserDetails();
      console.log('✅ User details loaded:', userResponse);
      
      if (userResponse && (userResponse.data || userResponse.user || userResponse)) {
        const userData = userResponse.data || userResponse.user || userResponse;
        setUser(userData);
      }

      // Try to get all dashboard data in one call first
      try {
        const dashboardData = await getProjectManagerDashboard();
        console.log('✅ Dashboard data loaded successfully:', dashboardData);
        
        if (dashboardData) {
          setMyProjects(dashboardData.projects || []);
          setUpcomingEvents(dashboardData.events || []);
          setTenders(dashboardData.tenders || []);
          setRecentTasks(dashboardData.recent_tasks || []);
          setDashboardStats(dashboardData.statistics || {});
          generateRecentTasks(dashboardData.projects || [], dashboardData.events || []);
          return; // Success, exit early
        }
      } catch (dashboardError) {
        console.warn('⚠️ Main dashboard endpoint failed, trying individual endpoints:', dashboardError);
      }
      
      // Fallback: Load data from individual endpoints
      console.log('🔄 Loading data from individual endpoints...');
      
      const [projectsData, eventsData, tendersData, statsData] = await Promise.allSettled([
        getMyProjects(),
        getUpcomingEvents(10),
        getMyTenders(),
        getDashboardStatistics()
      ]);

      // Handle projects data
      if (projectsData.status === 'fulfilled') {
        console.log('✅ Projects loaded:', projectsData.value);
        setMyProjects(projectsData.value || []);
      } else {
        console.error('❌ Failed to load projects:', projectsData.reason);
        setMyProjects([]);
      }

      // Handle events data
      if (eventsData.status === 'fulfilled') {
        console.log('✅ Events loaded:', eventsData.value);
        setUpcomingEvents(eventsData.value || []);
      } else {
        console.error('❌ Failed to load events:', eventsData.reason);
        setUpcomingEvents([]);
      }

      // Handle tenders data
      if (tendersData.status === 'fulfilled') {
        console.log('✅ Tenders loaded:', tendersData.value);
        setTenders(tendersData.value || []);
      } else {
        console.error('❌ Failed to load tenders:', tendersData.reason);
        setTenders([]);
      }

      // Handle statistics data
      if (statsData.status === 'fulfilled') {
        console.log('✅ Statistics loaded:', statsData.value);
        setDashboardStats(statsData.value || {});
      } else {
        console.error('❌ Failed to load statistics:', statsData.reason);
        setDashboardStats({});
      }
      
      generateRecentTasks(projectsData.value || [], eventsData.value || []);
      
    } catch (error) {
      console.error('💥 Critical error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please check your connection and try again.');
      
      // If authentication error, redirect to login
      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }
      
    } finally {
      setLoading(false);
    }
  };

  const generateRecentTasks = (projects, events) => {
    const tasks = [];
    
    // Generate tasks from projects
    projects.slice(0, 3).forEach(project => {
      if (project.status === 'in_progress') {
        tasks.push({
          id: `project_${project.id}_review`,
          task: `Review progress for ${project.title}`,
          project: project.title,
          due: "Today",
          status: "pending",
          priority: project.priority || "medium"
        });
      }
      
      if (project.status === 'planning') {
        tasks.push({
          id: `project_${project.id}_plan`,
          task: `Finalize planning for ${project.title}`,
          project: project.title,
          due: "Tomorrow",
          status: "pending",
          priority: project.priority || "medium"
        });
      }
    });
    
    // Generate tasks from upcoming events
    events.slice(0, 2).forEach(event => {
      tasks.push({
        id: `event_${event.id}_prep`,
        task: `Prepare for ${event.description}`,
        project: event.project_title || "General",
        due: new Date(event.date).toLocaleDateString(),
        status: new Date(event.date) <= new Date() ? "completed" : "in_progress",
        priority: "high"
      });
    });
    
    setRecentTasks(tasks.slice(0, 6));
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

  const handleRefresh = () => {
    loadUserData();
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreatingProject(true);
    setError(null); // Clear any existing errors
    
    try {
      // Prepare project data for API
      const projectData = {
        title: newProject.title,
        description: newProject.description,
        location: newProject.location,
        budget: newProject.budget ? parseFloat(newProject.budget) : null,
        start_date: newProject.startDate,
        finishing_date: newProject.endDate,
        priority: newProject.priority,
        status: newProject.status
      };
      console.log('Creating project with data:', projectData);
      
      // Call your createProject API function
      const result = await createProject(projectData);
      console.log('✅ Project created successfully:', result);
      
      // Show success message
      setSuccessMessage(`Project "${newProject.title}" created successfully!`);
      
      // Reset form and close modal
      setNewProject({
        title: '',
        description: '',
        location: '',
        budget: '',
        startDate: '',
        endDate: '',
        priority: 'medium',
        status: 'planning'
      });
      setShowCreateProject(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      
      // Reload dashboard data to show the new project
      loadUserData();
      
    } catch (error) {
      console.error('❌ Error creating project:', error);
      const errorMessage = error.response?.data?.errors?.join(', ') || 
                          error.response?.data?.message || 
                          'Failed to create project. Please try again.';
      setError(errorMessage);
    } finally {
      setCreatingProject(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIndicator = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getDaysUntilDeadline = (date) => {
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Generate user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Calculate stats from actual data
  const calculatedStats = {
    activeProjects: myProjects.filter(p => p.status !== 'completed').length,
    completedProjects: myProjects.filter(p => p.status === 'completed').length,
    totalTeamMembers: myProjects.reduce((sum, p) => sum + (p.team_size || 0), 0),
    activeTenders: tenders.length,
    pendingTasks: recentTasks.filter(t => t.status === 'pending').length,
    upcomingEvents: upcomingEvents.length
  };

  // Show loading only for main dashboard
  if (loading && isMainDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-20 blur-xl animate-pulse"></div>
          </div>
          <p className="mt-6 text-xl text-gray-700 font-semibold">Loading Project Dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Connecting to server and gathering your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Conditional Rendering: Dashboard content OR routed pages */}
        {isMainDashboard ? (
          <>
            {/* Top Header */}
            <header className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/30 sticky top-0 z-30">
              <div className="px-3 lg:px-6 py-3 lg:py-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {/* Mobile Menu Button */}
                    <button
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-all duration-200 lg:hidden mr-3"
                    >
                      <Menu className="h-6 w-6" />
                    </button>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h1 className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                          Dashboard Overview
                        </h1>
                        {/* Connection Status Indicator */}
                        <div className="flex items-center">
                          {isOnline ? (
                            <Wifi className="h-4 w-4 text-green-500" title="Connected" />
                          ) : (
                            <WifiOff className="h-4 w-4 text-red-500" title="Offline" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs lg:text-sm text-gray-600 mt-1">
                        Welcome back, {user?.name || 'User'} • {calculatedStats.activeProjects} active projects
                        {error && (
                          <span className="text-orange-600 ml-2">• Using cached data</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 lg:space-x-4">
                    {/* Refresh Button */}
                    <button
                      onClick={handleRefresh}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-all duration-200"
                      title="Refresh Data"
                    >
                      <Activity className="h-5 w-5" />
                    </button>

                    {/* Search - Hidden on mobile */}
                    <div className="relative hidden md:block">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search projects..." 
                        className="pl-10 pr-4 py-2 w-48 lg:w-64 bg-white/50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2 lg:p-3 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-full transition-all duration-200">
                      <Bell className="h-5 w-5 lg:h-6 lg:w-6" />
                      <span className="absolute -top-1 -right-1 h-4 w-4 lg:h-5 lg:w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
                        {calculatedStats.pendingTasks}
                      </span>
                    </button>
                    
                    {/* User Profile */}
                    <div className="flex items-center space-x-2 lg:space-x-3 bg-white/60 rounded-full p-1 lg:p-2 border border-white/50">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {getUserInitials(user?.name)}
                        </div>
                      )}
                      <div className="text-right pr-2 hidden sm:block">
                        <p className="text-xs lg:text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user?.role || 'Project Manager'}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="p-1 lg:p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                        title="Logout"
                      >
                        <LogOut className="h-3 w-3 lg:h-4 lg:w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Error Banner */}
            {error && (
              <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mx-3 lg:mx-6 mt-3 rounded">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                  <p className="text-orange-700 text-sm">{error}</p>
                  <button 
                    onClick={() => setError(null)}
                    className="ml-auto text-orange-600 hover:text-orange-800 text-sm font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="bg-green-100 border-l-4 border-green-500 p-4 mx-3 lg:mx-6 mt-3 rounded">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-green-700 text-sm">{successMessage}</p>
                  <button 
                    onClick={() => setSuccessMessage(null)}
                    className="ml-auto text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Main Dashboard Content */}
            <main className="flex-1 overflow-y-auto p-3 lg:p-6">
              
              {/* Quick Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 mb-6 lg:mb-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-white/30 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                      <Building2 className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-lg lg:text-2xl font-bold text-gray-900">{calculatedStats.activeProjects}</p>
                      <p className="text-xs text-gray-600">Active Projects</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-white/30 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-lg lg:text-2xl font-bold text-gray-900">{calculatedStats.completedProjects}</p>
                      <p className="text-xs text-gray-600">Completed</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-white/30 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-purple-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                      <Users className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-lg lg:text-2xl font-bold text-gray-900">{calculatedStats.totalTeamMembers}</p>
                      <p className="text-xs text-gray-600">Team Members</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-white/30 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-orange-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                      <FileText className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-lg lg:text-2xl font-bold text-gray-900">{calculatedStats.activeTenders}</p>
                      <p className="text-xs text-gray-600">Active Tenders</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-white/30 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-red-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 lg:h-5 lg:w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-lg lg:text-2xl font-bold text-gray-900">{calculatedStats.pendingTasks}</p>
                      <p className="text-xs text-gray-600">Pending Tasks</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-white/30 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-yellow-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                      <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-lg lg:text-2xl font-bold text-gray-900">{calculatedStats.upcomingEvents}</p>
                      <p className="text-xs text-gray-600">This Week</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
                
                {/* Projects Section - Takes 3 columns on desktop, full width on mobile */}
                <div className="lg:col-span-3 order-2 lg:order-1">
                  <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-xl lg:rounded-2xl border border-white/30 h-full">
                    <div className="p-4 lg:p-6 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg lg:text-xl font-bold text-gray-900">My Projects</h3>
                          <p className="text-xs lg:text-sm text-gray-600 mt-1">Track progress and manage your project portfolio</p>
                        </div>
                        <div className="flex items-center space-x-2 lg:space-x-3">
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <Filter className="h-4 w-4 lg:h-5 lg:w-5" />
                          </button>
                          <button 
                            onClick={() => setShowCreateProject(true)}
                            className="flex items-center px-3 py-2 lg:px-4 lg:py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg lg:rounded-xl hover:shadow-lg transition-all duration-200 text-xs lg:text-sm font-medium"
                          >
                            <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                            <span className="hidden sm:inline">New Project</span>
                            <span className="sm:hidden">New</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 lg:p-6">
                      {myProjects.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                          {myProjects.map((project) => (
                            <div key={project.id} className="bg-gradient-to-br from-white to-gray-50/50 rounded-lg lg:rounded-xl p-4 lg:p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                              {/* Priority Indicator */}
                              <div className={`absolute top-0 left-0 w-full h-1 ${getPriorityIndicator(project.priority)}`}></div>
                              
                              <div className="flex items-start justify-between mb-3 lg:mb-4">
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors text-sm lg:text-base">
                                    {project.title || project.name}
                                  </h4>
                                  <span className={`inline-flex px-2 lg:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                                    {project.status?.replace('_', ' ') || 'Planning'}
                                  </span>
                                </div>
                                <button className="p-1 lg:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                  <MoreHorizontal className="h-4 w-4 lg:h-5 lg:w-5" />
                                </button>
                              </div>

                              <div className="space-y-2 lg:space-y-3 mb-3 lg:mb-4">
                                <div className="flex items-center text-xs lg:text-sm text-gray-600">
                                  <MapPin className="h-3 w-3 lg:h-4 lg:w-4 mr-2 text-gray-400" />
                                  {project.location || 'No location set'}
                                </div>
                                <div className="flex items-center text-xs lg:text-sm text-gray-600">
                                  <User className="h-3 w-3 lg:h-4 lg:w-4 mr-2 text-gray-400" />
                                  {project.responsible || project.manager || 'Unassigned'}
                                </div>
                                <div className="flex items-center text-xs lg:text-sm text-gray-600">
                                  <Calendar className="h-3 w-3 lg:h-4 lg:w-4 mr-2 text-gray-400" />
                                  Due: {project.finishing_date ? new Date(project.finishing_date).toLocaleDateString() : 'No deadline'}
                                </div>
                              </div>

                              {/* Progress Section */}
                              <div className="space-y-2 lg:space-y-3">
                                <div className="flex justify-between text-xs lg:text-sm">
                                  <span className="text-gray-600">Progress</span>
                                  <span className="font-semibold text-gray-900">{project.progress || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500" 
                                    style={{width: `${project.progress || 0}%`}}
                                  ></div>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Users className="h-3 w-3 mr-1" />
                                    {project.team_size || 0} members
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Budget: {project.budget_used || 0}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Building2 className="mx-auto h-16 w-16 text-gray-300" />
                          <p className="mt-4 text-lg text-gray-500">No projects found</p>
                          <p className="text-sm text-gray-400">Create your first project to get started</p>
                          <button 
                            onClick={() => setShowCreateProject(true)}
                            className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                          >
                            Create Project
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Sidebar - Stacks on mobile */}
                <div className="space-y-4 lg:space-y-6 order-1 lg:order-2">
                  
                  {/* Today's Tasks */}
                  <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-xl lg:rounded-2xl border border-white/30">
                    <div className="p-3 lg:p-4 border-b border-gray-100">
                      <h3 className="text-base lg:text-lg font-bold text-gray-900">Today's Tasks</h3>
                    </div>
                    <div className="p-3 lg:p-4">
                      {recentTasks.length > 0 ? (
                        <div className="space-y-2 lg:space-y-3">
                          {recentTasks.slice(0, 4).map((task) => (
                            <div key={task.id} className={`p-2 lg:p-3 rounded-lg border-l-4 ${
                              task.status === 'completed' ? 'bg-green-50 border-green-400' :
                              task.status === 'pending' ? 'bg-red-50 border-red-400' :
                              'bg-blue-50 border-blue-400'
                            }`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-xs lg:text-sm font-medium text-gray-900">{task.task}</p>
                                  <p className="text-xs text-gray-500 mt-1">{task.project}</p>
                                  <p className="text-xs text-gray-400 mt-1">Due: {task.due}</p>
                                </div>
                                <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${
                                  task.status === 'completed' ? 'bg-green-400' :
                                  task.status === 'pending' ? 'bg-red-400' :
                                  'bg-blue-400'
                                }`}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <CheckCircle className="mx-auto h-8 w-8 text-gray-300" />
                          <p className="mt-2 text-sm text-gray-500">No tasks today</p>
                        </div>
                      )}
                      <button className="w-full mt-3 lg:mt-4 text-xs lg:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center">
                        View All Tasks
                        <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4 ml-1" />
                      </button>
                    </div>
                  </div>

                  {/* Upcoming Events */}
                  <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-xl lg:rounded-2xl border border-white/30">
                    <div className="p-3 lg:p-4 border-b border-gray-100">
                      <h3 className="text-base lg:text-lg font-bold text-gray-900">This Week</h3>
                    </div>
                    <div className="p-3 lg:p-4">
                      {upcomingEvents.length > 0 ? (
                        <div className="space-y-2 lg:space-y-3">
                          {upcomingEvents.slice(0, 3).map((event) => (
                            <div key={event.id} className="flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 hover:bg-gray-50 rounded-lg transition-colors">
                              <div className={`w-1 lg:w-2 h-8 lg:h-10 rounded-full ${
                                event.type === 'meeting' ? 'bg-blue-400' :
                                event.type === 'review' ? 'bg-purple-400' :
                                'bg-green-400'
                              }`}></div>
                              <div className="flex-1">
                                <p className="text-xs lg:text-sm font-medium text-gray-900">{event.description}</p>
                                <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                                <p className="text-xs text-blue-600 font-medium">{event.responsible}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Calendar className="mx-auto h-8 w-8 text-gray-300" />
                          <p className="mt-2 text-sm text-gray-500">No events this week</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tender Deadlines */}
                  <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-xl lg:rounded-2xl border border-white/30">
                    <div className="p-3 lg:p-4 border-b border-gray-100">
                      <h3 className="text-base lg:text-lg font-bold text-gray-900">Tender Deadlines</h3>
                    </div>
                    <div className="p-3 lg:p-4">
                      {tenders.length > 0 ? (
                        <div className="space-y-2 lg:space-y-3">
                          {tenders.map((tender) => (
                            <div key={tender.id} className="p-2 lg:p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                              <h4 className="font-medium text-gray-900 text-xs lg:text-sm mb-1 lg:mb-2">{tender.title}</h4>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">{tender.responsible}</span>
                                <div className="flex items-center text-red-600 font-medium">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {getDaysUntilDeadline(tender.deadline)} days
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <FileText className="mx-auto h-8 w-8 text-gray-300" />
                          <p className="mt-2 text-sm text-gray-500">No active tenders</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </main>

            {/* Create Project Modal */}
            {showCreateProject && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
                      <p className="text-sm text-gray-600 mt-1">Set up a new construction project</p>
                    </div>
                    <button 
                      onClick={() => setShowCreateProject(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <form onSubmit={handleCreateProject} className="p-6 space-y-6">
                    {/* Project Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={newProject.title}
                        onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter project title"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={newProject.description}
                        onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief project description"
                      />
                    </div>

                    {/* Location and Budget */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={newProject.location}
                          onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Project location"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Budget
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="number"
                            value={newProject.budget}
                            onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Start and End Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={newProject.startDate}
                          onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={newProject.endDate}
                          onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Priority and Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority
                        </label>
                        <select
                          value={newProject.priority}
                          onChange={(e) => setNewProject({...newProject, priority: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Initial Status
                        </label>
                        <select
                          value={newProject.status}
                          onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="planning">Planning</option>
                          <option value="in_progress">In Progress</option>
                          <option value="on_hold">On Hold</option>
                        </select>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowCreateProject(false)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={creatingProject || !newProject.title}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {creatingProject ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Create Project
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Render routed pages for paths like /user/projects, /user/locations, etc. */
          <UserDashboardRoutes />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;