import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar';
import UserDashboardRoutes from '../../routes/UserDashboardRoutes';
import { 
  getUserDetails, 
  logout, 
  dashboardAPI,
  createProject,
  supervisorsAPI,
  siteManagersAPI,
  teamAPI,
  projectsAPI
} from '../../services/api';
import ProgressUpdateModal from '../ProgressUpdateModal';
import { progressAPI } from '../../services/progressAPI';
import EnhancedProgressBar from "../EnhancedProgressBar";
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
  DollarSign,
  HardHat,
  Clipboard,
  UserCheck,
  UserX,
  TrendingUp,
  BarChart3,
  Eye,
  ExternalLink,
  Zap,
  Award,
  Gauge,
  TrendingDown
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
  
  // Progress Tracking States - Enhanced
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedProjectForProgress, setSelectedProjectForProgress] = useState(null);
  const [projectsWithProgress, setProjectsWithProgress] = useState([]);
  const [progressOverview, setProgressOverview] = useState({
    totalProjects: 0,
    onTrack: 0,
    behindSchedule: 0,
    aheadOfSchedule: 0,
    averageProgress: 0,
    averageVariance: 0
  });
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(null); // Track which project is being marked
  
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
    status: 'planning',
    supervisorId: '',
    siteManagerId: '',
    projectManagerId: ''
  });

  // Updated state variables for dropdown options with workload information
  const [supervisors, setSupervisors] = useState([]);
  const [siteManagers, setSiteManagers] = useState([]);
  const [projectManagers, setProjectManagers] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

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

  // Calculate progress overview statistics - New Enhanced Function
  const calculateProgressOverview = (projects) => {
    // Filter out completed projects for progress overview
    const activeProjects = projects.filter(p => p.status !== 'completed');
    const totalProjects = activeProjects.length;
    const onTrack = activeProjects.filter(p => p.schedule_status === 'on_track').length;
    const behindSchedule = activeProjects.filter(p => p.schedule_status === 'behind_schedule').length;
    const aheadOfSchedule = activeProjects.filter(p => p.schedule_status === 'ahead_of_schedule').length;
    
    const averageProgress = totalProjects > 0 
      ? activeProjects.reduce((sum, p) => sum + (p.current_progress || p.progress_percentage || 0), 0) / totalProjects 
      : 0;
    
    const averageVariance = totalProjects > 0
      ? activeProjects.reduce((sum, p) => sum + Math.abs(p.progress_variance || 0), 0) / totalProjects
      : 0;

    setProgressOverview({
      totalProjects,
      onTrack,
      behindSchedule,
      aheadOfSchedule,
      averageProgress: Math.round(averageProgress),
      averageVariance: Math.round(averageVariance * 10) / 10
    });
  };

  // Load progress data for projects - Enhanced
  const loadProjectsProgress = async () => {
    if (myProjects.length === 0) return;
    
    try {
      const projectsWithProgressData = await Promise.all(
        myProjects.map(async (project) => {
          try {
            const progressData = await progressAPI.getProgress(project.id);
            return {
              ...project,
              ...progressData
            };
          } catch (error) {
            // If progress API fails, return project with default progress
            return {
              ...project,
              current_progress: project.progress_percentage || 0,
              timeline_progress: 0,
              progress_variance: 0,
              schedule_status: 'Unknown',
              status_color: 'gray'
            };
          }
        })
      );

      setProjectsWithProgress(projectsWithProgressData);
      calculateProgressOverview(projectsWithProgressData); // Enhanced calculation
    } catch (error) {
      console.error('Failed to load projects progress:', error);
      setProjectsWithProgress(myProjects);
      calculateProgressOverview(myProjects); // Calculate even with fallback data
    }
  };

  // Load progress data when projects are loaded
  useEffect(() => {
    if (myProjects.length > 0) {
      loadProjectsProgress();
    }
  }, [myProjects]);

  // Handle progress update
  const handleProgressUpdate = (projectId) => {
    const project = projectsWithProgress.find(p => p.id === projectId);
    if (project) {
      setSelectedProjectForProgress(project);
      setShowProgressModal(true);
    }
  };

  // Handle progress update completion
  const handleProgressUpdated = (updatedProject) => {
    // Update the project in the list
    setProjectsWithProgress(prev => 
      prev.map(p => p.id === updatedProject.id ? { ...p, ...updatedProject } : p)
    );
    
    // Also update myProjects if needed
    setMyProjects(prev => 
      prev.map(p => p.id === updatedProject.id ? { ...p, progress_percentage: updatedProject.progress_percentage } : p)
    );
    
    // Reload progress data to get latest calculations
    loadProjectsProgress();
  };

  // Handle marking project as completed
  const handleMarkAsCompleted = async (projectId, e) => {
    e.stopPropagation(); // Prevent navigation
    
    if (markingComplete) return; // Prevent double clicks
    
    try {
      setMarkingComplete(projectId);
      await projectsAPI.markAsCompleted(projectId);
      
      // Show success message
      const project = projectsWithProgress.find(p => p.id === projectId) || myProjects.find(p => p.id === projectId);
      setSuccessMessage(`Project "${project?.title || project?.name}" marked as completed!`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      
      // Reload dashboard data to update the lists
      loadUserData();
      
      console.log(`✅ Project ${projectId} marked as completed`);
    } catch (error) {
      console.error(`❌ Failed to mark project ${projectId} as completed:`, error);
      setError('Failed to mark project as completed. Please try again.');
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setMarkingComplete(null);
    }
  };

  // Add function to handle project click
  const handleProjectClick = (projectId) => {
    navigate(`/user/projects?projectId=${projectId}`);
  };

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
        const dashboardData = await dashboardAPI.getDashboard();
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
        dashboardAPI.getProjects(),
        dashboardAPI.getUpcomingEvents(10),
        dashboardAPI.getTenders(),
        dashboardAPI.getStatistics()
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

  // Load dropdown data for project creation with workload information
  const loadDropdownData = async () => {
    try {
      setLoadingDropdowns(true);
      console.log('🔄 Loading dropdown data for project creation...');
      
      const [supervisorsData, siteManagersData] = await Promise.allSettled([
        supervisorsAPI.getAll(),
        siteManagersAPI.getAll()
      ]);

      if (supervisorsData.status === 'fulfilled') {
        console.log('✅ Supervisors loaded:', supervisorsData.value);
        setSupervisors(supervisorsData.value || []);
      } else {
        console.error('❌ Failed to load supervisors:', supervisorsData.reason);
        setSupervisors([]);
      }

      if (siteManagersData.status === 'fulfilled') {
        console.log('✅ Site managers loaded:', siteManagersData.value);
        setSiteManagers(siteManagersData.value || []);
      } else {
        console.error('❌ Failed to load site managers:', siteManagersData.reason);
        setSiteManagers([]);
      }

      // For project managers, we can use a fallback or mock data since the API might not exist yet
      setProjectManagers([
        { id: 1, name: "Current User", email: user?.email || "user@example.com", current_projects: [], projects_count: 0 }
      ]);
    } catch (error) {
      console.error('💥 Error loading dropdown data:', error);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const generateRecentTasks = (projects, events) => {
    const tasks = [];
    
    // Generate tasks from projects (only non-completed)
    projects.filter(p => p.status !== 'completed').slice(0, 3).forEach(project => {
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
      // Validate required fields
      if (!newProject.supervisorId) {
        throw new Error('Please select a supervisor');
      }
      
      // Prepare project data for API
      const projectData = {
        title: newProject.title,
        description: newProject.description,
        location: newProject.location,
        budget: newProject.budget ? parseFloat(newProject.budget) : null,
        start_date: newProject.startDate,
        finishing_date: newProject.endDate,
        priority: newProject.priority,
        status: newProject.status,
        supervisor_id: parseInt(newProject.supervisorId),
        site_manager_id: newProject.siteManagerId ? parseInt(newProject.siteManagerId) : null,
        project_manager_id: newProject.projectManagerId ? parseInt(newProject.projectManagerId) : null
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
        status: 'planning',
        supervisorId: '',
        siteManagerId: '',
        projectManagerId: ''
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
                          error.message ||
                          'Failed to create project. Please try again.';
      setError(errorMessage);
    } finally {
      setCreatingProject(false);
    }
  };

  // Handle opening create project modal
  const handleOpenCreateProject = () => {
    setShowCreateProject(true);
    loadDropdownData(); // Load dropdown data when modal opens
  };

  // Helper function to get workload status
  const getWorkloadStatus = (member) => {
    const projectCount = member.projects_count || member.current_projects?.length || 0;
    if (projectCount === 0) return { status: 'available', color: 'green', text: 'Available' };
    if (projectCount <= 2) return { status: 'light', color: 'yellow', text: 'Light Load' };
    if (projectCount <= 4) return { status: 'busy', color: 'orange', text: 'Busy' };
    return { status: 'overloaded', color: 'red', text: 'Overloaded' };
  };

  // Helper function to get workload color classes
  const getWorkloadColorClasses = (color) => {
    switch (color) {
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'orange': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  // Enhanced Progress Overview Section with Pure CSS Charts
  const renderProgressOverview = () => {
    const progressData = [
      { name: 'On Track', value: progressOverview.onTrack, color: '#10B981', percentage: progressOverview.totalProjects > 0 ? (progressOverview.onTrack / progressOverview.totalProjects) * 100 : 0 },
      { name: 'Behind', value: progressOverview.behindSchedule, color: '#EF4444', percentage: progressOverview.totalProjects > 0 ? (progressOverview.behindSchedule / progressOverview.totalProjects) * 100 : 0 },
      { name: 'Ahead', value: progressOverview.aheadOfSchedule, color: '#3B82F6', percentage: progressOverview.totalProjects > 0 ? (progressOverview.aheadOfSchedule / progressOverview.totalProjects) * 100 : 0 }
    ];

    return (
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-white/40 mb-6">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Progress Overview</h3>
                <p className="text-sm text-gray-600 mt-1">Track schedule performance across all projects</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/user/projects')}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="View All Projects"
            >
              <ExternalLink className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Progress Statistics */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">On Track</p>
                      <p className="text-2xl font-bold text-blue-900">{progressOverview.onTrack}</p>
                      <p className="text-xs text-blue-700 mt-1">
                        {progressOverview.totalProjects > 0 ? Math.round((progressOverview.onTrack / progressOverview.totalProjects) * 100) : 0}% of projects
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-red-50 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Behind Schedule</p>
                      <p className="text-2xl font-bold text-red-900">{progressOverview.behindSchedule}</p>
                      <p className="text-xs text-red-700 mt-1">
                        {progressOverview.totalProjects > 0 ? Math.round((progressOverview.behindSchedule / progressOverview.totalProjects) * 100) : 0}% of projects
                      </p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Ahead of Schedule</p>
                      <p className="text-2xl font-bold text-green-900">{progressOverview.aheadOfSchedule}</p>
                      <p className="text-xs text-green-700 mt-1">
                        {progressOverview.totalProjects > 0 ? Math.round((progressOverview.aheadOfSchedule / progressOverview.totalProjects) * 100) : 0}% of projects
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Average Progress</p>
                      <p className="text-2xl font-bold text-purple-900">{progressOverview.averageProgress}%</p>
                      <p className="text-xs text-purple-700 mt-1">
                        ±{progressOverview.averageVariance}% variance
                      </p>
                    </div>
                    <Gauge className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Progress Alerts */}
              {progressOverview.behindSchedule > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-red-900">Projects Need Attention</h4>
                      <p className="text-sm text-red-700 mt-1">
                        {progressOverview.behindSchedule} project{progressOverview.behindSchedule !== 1 ? 's are' : ' is'} behind schedule and require immediate attention
                      </p>
                    </div>
                    <button 
                      onClick={() => navigate('/user/projects?filter=behind_schedule')}
                      className="ml-auto px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                    >
                      View Projects
                    </button>
                  </div>
                </div>
              )}

              {progressOverview.aheadOfSchedule > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-green-900">Great Progress!</h4>
                      <p className="text-sm text-green-700 mt-1">
                        {progressOverview.aheadOfSchedule} project{progressOverview.aheadOfSchedule !== 1 ? 's are' : ' is'} ahead of schedule
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Distribution Chart - Pure CSS */}
            <div className="flex flex-col items-center justify-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Schedule Status Distribution</h4>
              
              {/* CSS-based Donut Chart */}
              <div className="relative w-40 h-40 mb-4">
                <div className="absolute inset-0 rounded-full bg-gray-200"></div>
                
                {/* On Track Segment */}
                <div 
                  className="absolute inset-0 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    background: `conic-gradient(#10B981 0deg ${progressData[0].percentage * 3.6}deg, transparent ${progressData[0].percentage * 3.6}deg 360deg)`,
                    mask: 'radial-gradient(circle at center, transparent 45%, black 45%)',
                    WebkitMask: 'radial-gradient(circle at center, transparent 45%, black 45%)'
                  }}
                ></div>
                
                {/* Behind Schedule Segment */}
                <div 
                  className="absolute inset-0 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    background: `conic-gradient(transparent 0deg ${progressData[0].percentage * 3.6}deg, #EF4444 ${progressData[0].percentage * 3.6}deg ${(progressData[0].percentage + progressData[1].percentage) * 3.6}deg, transparent ${(progressData[0].percentage + progressData[1].percentage) * 3.6}deg 360deg)`,
                    mask: 'radial-gradient(circle at center, transparent 45%, black 45%)',
                    WebkitMask: 'radial-gradient(circle at center, transparent 45%, black 45%)'
                  }}
                ></div>
                
                {/* Ahead of Schedule Segment */}
                <div 
                  className="absolute inset-0 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    background: `conic-gradient(transparent 0deg ${(progressData[0].percentage + progressData[1].percentage) * 3.6}deg, #3B82F6 ${(progressData[0].percentage + progressData[1].percentage) * 3.6}deg 360deg)`,
                    mask: 'radial-gradient(circle at center, transparent 45%, black 45%)',
                    WebkitMask: 'radial-gradient(circle at center, transparent 45%, black 45%)'
                  }}
                ></div>
                
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{progressOverview.totalProjects}</div>
                    <div className="text-xs text-gray-500">Active Projects</div>
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="space-y-2 w-full">
                {progressData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">{item.value}</span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({item.percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced project cards rendering with progress tracking
  const renderProjectCards = () => {
    const projects = projectsWithProgress.length > 0 ? projectsWithProgress : myProjects;
    
    // Filter out completed projects
    const activeProjects = projects.filter(p => p.status !== 'completed');
    
    if (activeProjects.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="relative">
            <Building2 className="mx-auto h-20 w-20 text-gray-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
          </div>
          <h3 className="mt-6 text-xl font-semibold text-gray-900">No active projects</h3>
          <p className="text-gray-500 mt-2 mb-6">Create your first project to get started with project management</p>
          <button 
            onClick={handleOpenCreateProject}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Project
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeProjects.map((project) => (
          <div 
            key={project.id} 
            className="bg-gradient-to-br from-white via-white to-gray-50/30 rounded-2xl p-6 border border-gray-100/50 hover:shadow-2xl hover:border-blue-200/50 transition-all duration-300 group relative overflow-hidden"
          >
            {/* Enhanced Priority Indicator */}
            <div className={`absolute top-0 left-0 w-full h-1.5 ${getPriorityIndicator(project.priority)}`}></div>
            
            {/* Progress Status Indicator */}
            {project.progress_variance !== undefined && (
              <div className="absolute top-4 left-4">
                <div className={`w-3 h-3 rounded-full ${
                  project.progress_variance < -5 ? 'bg-red-400' :
                  project.progress_variance > 5 ? 'bg-green-400' :
                  'bg-blue-400'
                }`} title={`${project.schedule_status} - ${project.progress_variance > 0 ? '+' : ''}${project.progress_variance?.toFixed(1)}% variance`}></div>
              </div>
            )}

            {/* Floating Action Indicators */}
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={(e) => handleMarkAsCompleted(project.id, e)}
                disabled={markingComplete === project.id}
                className={`text-white p-2 rounded-full shadow-lg transition-colors ${
                  markingComplete === project.id
                    ? 'bg-gray-400 cursor-wait'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
                title="Mark as Completed"
              >
                {markingComplete === project.id ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="h-3 w-3" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleProgressUpdate(project.id);
                }}
                className="bg-green-600 text-white p-2 rounded-full shadow-lg hover:bg-green-700 transition-colors"
                title="Update Progress"
              >
                <TrendingUp className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleProjectClick(project.id);
                }}
                className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                title="View Details"
              >
                <Eye className="h-3 w-3" />
              </button>
            </div>

            {/* Header Section */}
            <div className="flex items-start justify-between mb-4 mt-6">
              <div className="flex-1 pr-16">
                <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors text-base leading-tight">
                  {project.title || project.name}
                </h4>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                    {project.status?.replace('_', ' ') || 'Planning'}
                  </span>
                  {project.progress_variance !== undefined && (
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      project.progress_variance < -5 ? 'bg-red-100 text-red-700' :
                      project.progress_variance > 5 ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {project.progress_variance > 0 ? '+' : ''}{project.progress_variance?.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                {project.location || 'No location set'}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2 text-gray-400" />
                {project.responsible || project.manager || 'Unassigned'}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                Due: {project.finishing_date ? new Date(project.finishing_date).toLocaleDateString() : 'No deadline'}
              </div>
              {project.days_remaining !== undefined && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span className={project.days_remaining < 30 ? 'text-red-600 font-medium' : ''}>
                    {project.days_remaining} days remaining
                  </span>
                </div>
              )}
            </div>

            {/* Enhanced Progress Section with Timeline Comparison */}
            <div className="space-y-4">
              <EnhancedProgressBar 
                project={project}
                showTimeline={true}
                showVariance={true}
              />
              
              {/* Progress Stats Row */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100/50">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-xs text-gray-500">
                    <Users className="h-3 w-3 mr-1" />
                    <span className="font-medium">{project.team_size || 0}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <DollarSign className="h-3 w-3 mr-1" />
                    <span className="font-medium">{project.budget_used || 0}%</span>
                  </div>
                  {project.timeline_progress !== undefined && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span className="font-medium">Expected: {project.timeline_progress}%</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {project.behind_schedule && (
                    <div className="flex items-center text-red-600">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      <span className="text-xs font-medium">Behind</span>
                    </div>
                  )}
                  {project.ahead_of_schedule && (
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span className="text-xs font-medium">Ahead</span>
                    </div>
                  )}
                  <Zap className="h-3 w-3 text-yellow-500" />
                </div>
              </div>

              {/* Quick Progress Actions */}
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={(e) => handleMarkAsCompleted(project.id, e)}
                  disabled={markingComplete === project.id}
                  className={`flex-1 py-2 px-3 text-xs rounded-lg transition-colors font-medium flex items-center justify-center ${
                    markingComplete === project.id
                      ? 'bg-gray-100 text-gray-400 cursor-wait'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {markingComplete === project.id ? (
                    <>
                      <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Mark Complete
                    </>
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProgressUpdate(project.id);
                  }}
                  className="flex-1 py-2 px-3 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  Update Progress
                </button>
              </div>
            </div>

            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
          </div>
        ))}
      </div>
    );
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
          <p className="text-sm text-gray-500 mt-2">Connecting to server and gathering your progress data</p>
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
            {/* Top Header - Enhanced with Progress Info */}
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
                        Welcome back, {user?.name || 'User'} • {calculatedStats.activeProjects} active projects • {progressOverview.averageProgress}% avg progress • {progressOverview.behindSchedule} behind schedule
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
                        {calculatedStats.pendingTasks + progressOverview.behindSchedule}
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
              
              {/* Enhanced Progress Overview Section */}
              {projectsWithProgress.filter(p => p.status !== 'completed').length > 0 && renderProgressOverview()}

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
                
                {/* Projects Section - Enhanced with Progress Tracking */}
                <div className="lg:col-span-3 order-2 lg:order-1">
                  <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl border border-white/40 h-full overflow-hidden">
                    {/* Enhanced Header */}
                    <div className="p-6 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/80 to-white/80">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">My Projects</h3>
                            <p className="text-sm text-gray-600 mt-1">Track progress and manage your project portfolio</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => navigate('/user/projects')}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="View All Projects"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <Filter className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={handleOpenCreateProject}
                            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">New Project</span>
                            <span className="sm:hidden">New</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Projects Grid */}
                    <div className="p-6">
                      {renderProjectCards()}
                      
                      {/* View All Projects Link */}
                      {(projectsWithProgress.length > 0 || myProjects.length > 0) && (
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <button 
                            onClick={() => navigate('/user/projects')}
                            className="w-full flex items-center justify-center py-3 text-blue-600 hover:text-blue-700 font-medium text-sm rounded-xl hover:bg-blue-50 transition-all duration-200"
                          >
                            View All Projects
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Sidebar - Enhanced */}
                <div className="space-y-6 order-1 lg:order-2">
                  
                  {/* Today's Tasks */}
                  <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-white/40">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Today's Tasks</h3>
                      </div>
                    </div>
                    <div className="p-4">
                      {recentTasks.length > 0 ? (
                        <div className="space-y-3">
                          {recentTasks.slice(0, 4).map((task) => (
                            <div key={task.id} className={`p-3 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md ${
                              task.status === 'completed' ? 'bg-green-50/80 border-green-400' :
                              task.status === 'pending' ? 'bg-red-50/80 border-red-400' :
                              'bg-blue-50/80 border-blue-400'
                            }`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{task.task}</p>
                                  <p className="text-xs text-gray-600 mt-1">{task.project}</p>
                                  <p className="text-xs text-gray-500 mt-1">Due: {task.due}</p>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${
                                  task.status === 'completed' ? 'bg-green-400' :
                                  task.status === 'pending' ? 'bg-red-400' :
                                  'bg-blue-400'
                                }`}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Award className="mx-auto h-10 w-10 text-gray-300" />
                          <p className="mt-2 text-sm text-gray-500">All caught up!</p>
                        </div>
                      )}
                      <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center py-2 rounded-lg hover:bg-blue-50 transition-colors">
                        View All Tasks
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>

                  {/* Upcoming Events */}
                  <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-white/40">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">This Week</h3>
                      </div>
                    </div>
                    <div className="p-4">
                      {upcomingEvents.length > 0 ? (
                        <div className="space-y-4">
                          {upcomingEvents.slice(0, 3).map((event) => (
                            <div key={event.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50/80 rounded-xl transition-colors">
                              <div className={`w-2 h-12 rounded-full ${
                                event.type === 'meeting' ? 'bg-blue-400' :
                                event.type === 'review' ? 'bg-purple-400' :
                                'bg-green-400'
                              }`}></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{event.description}</p>
                                <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                                <p className="text-xs text-blue-600 font-medium">{event.responsible}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="mx-auto h-10 w-10 text-gray-300" />
                          <p className="mt-2 text-sm text-gray-500">No events this week</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tender Deadlines */}
                  <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-white/40">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Tender Deadlines</h3>
                      </div>
                    </div>
                    <div className="p-4">
                      {tenders.length > 0 ? (
                        <div className="space-y-3">
                          {tenders.map((tender) => (
                            <div key={tender.id} className="p-3 bg-gradient-to-r from-orange-50/80 to-red-50/80 rounded-xl border border-orange-200/50 hover:shadow-md transition-all duration-200">
                              <h4 className="font-medium text-gray-900 text-sm mb-2">{tender.title}</h4>
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
                        <div className="text-center py-8">
                          <FileText className="mx-auto h-10 w-10 text-gray-300" />
                          <p className="mt-2 text-sm text-gray-500">No active tenders</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </main>

            {/* Progress Update Modal */}
            <ProgressUpdateModal
              project={selectedProjectForProgress}
              isOpen={showProgressModal}
              onClose={() => {
                setShowProgressModal(false);
                setSelectedProjectForProgress(null);
              }}
              onProgressUpdated={handleProgressUpdated}
            />

            {/* Enhanced Create Project Modal with Team Workload */}
            {showCreateProject && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
                      <p className="text-sm text-gray-600 mt-1">Set up a new construction project and assign team members</p>
                    </div>
                    <button 
                      onClick={() => setShowCreateProject(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div onSubmit={handleCreateProject} className="p-6 space-y-6">
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

                    {/* Team Assignment Section */}
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Users className="h-5 w-5 mr-2 text-blue-600" />
                        Team Assignment
                      </h3>
                      {loadingDropdowns ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-500">Loading team members...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Supervisor Selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              <div className="flex items-center">
                                <HardHat className="h-4 w-4 mr-2 text-blue-600" />
                                Supervisor *
                              </div>
                            </label>
                            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                              {supervisors.length > 0 ? (
                                supervisors.map((supervisor) => {
                                  const workload = getWorkloadStatus(supervisor);
                                  return (
                                    <div
                                      key={supervisor.id}
                                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                        newProject.supervisorId === supervisor.id.toString()
                                          ? 'border-blue-500 bg-blue-50'
                                          : 'border-gray-200 hover:border-gray-300 bg-white'
                                      }`}
                                      onClick={() => setNewProject({...newProject, supervisorId: supervisor.id.toString()})}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-2">
                                            <p className="font-medium text-gray-900">{supervisor.name}</p>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getWorkloadColorClasses(workload.color)}`}>
                                              {workload.text}
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-600 mt-1">{supervisor.email}</p>
                                          <div className="flex items-center mt-2 space-x-4">
                                            <div className="flex items-center text-xs text-gray-500">
                                              <Building2 className="h-3 w-3 mr-1" />
                                              {supervisor.projects_count || supervisor.current_projects?.length || 0} projects
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500">
                                              <TrendingUp className="h-3 w-3 mr-1" />
                                              {supervisor.experience_years || 0}y exp.
                                            </div>
                                          </div>
                                          {supervisor.current_projects && supervisor.current_projects.length > 0 && (
                                            <div className="mt-2">
                                              <p className="text-xs text-gray-500 mb-1">Current projects:</p>
                                              <div className="flex flex-wrap gap-1">
                                                {supervisor.current_projects.slice(0, 2).map((project, index) => (
                                                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                    {project}
                                                  </span>
                                                ))}
                                                {supervisor.current_projects.length > 2 && (
                                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                    +{supervisor.current_projects.length - 2} more
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        <div className="ml-2">
                                          {newProject.supervisorId === supervisor.id.toString() ? (
                                            <UserCheck className="h-5 w-5 text-blue-600" />
                                          ) : (
                                            <div className="h-5 w-5 border-2 border-gray-300 rounded"></div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-center py-4 text-gray-500">
                                  <HardHat className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                                  <p className="text-sm">No supervisors available</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Site Manager Selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              <div className="flex items-center">
                                <Clipboard className="h-4 w-4 mr-2 text-purple-600" />
                                Site Manager (Optional)
                              </div>
                            </label>
                            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                              {/* None option */}
                              <div
                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                  newProject.siteManagerId === ''
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                                onClick={() => setNewProject({...newProject, siteManagerId: ''})}
                              >
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-gray-600">No Site Manager</p>
                                  {newProject.siteManagerId === '' ? (
                                    <UserCheck className="h-5 w-5 text-purple-600" />
                                  ) : (
                                    <div className="h-5 w-5 border-2 border-gray-300 rounded"></div>
                                  )}
                                </div>
                              </div>
                              
                              {siteManagers.length > 0 ? (
                                siteManagers.map((siteManager) => {
                                  const workload = getWorkloadStatus(siteManager);
                                  return (
                                    <div
                                      key={siteManager.id}
                                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                        newProject.siteManagerId === siteManager.id.toString()
                                          ? 'border-purple-500 bg-purple-50'
                                          : 'border-gray-200 hover:border-gray-300 bg-white'
                                      }`}
                                      onClick={() => setNewProject({...newProject, siteManagerId: siteManager.id.toString()})}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-2">
                                            <p className="font-medium text-gray-900">{siteManager.name}</p>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getWorkloadColorClasses(workload.color)}`}>
                                              {workload.text}
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-600 mt-1">{siteManager.email}</p>
                                          <div className="flex items-center mt-2 space-x-4">
                                            <div className="flex items-center text-xs text-gray-500">
                                              <Building2 className="h-3 w-3 mr-1" />
                                              {siteManager.projects_count || siteManager.current_projects?.length || 0} projects
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500">
                                              <TrendingUp className="h-3 w-3 mr-1" />
                                              {siteManager.experience_years || 0}y exp.
                                            </div>
                                          </div>
                                          {siteManager.current_projects && siteManager.current_projects.length > 0 && (
                                            <div className="mt-2">
                                              <p className="text-xs text-gray-500 mb-1">Current projects:</p>
                                              <div className="flex flex-wrap gap-1">
                                                {siteManager.current_projects.slice(0, 2).map((project, index) => (
                                                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                    {project}
                                                  </span>
                                                ))}
                                                {siteManager.current_projects.length > 2 && (
                                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                    +{siteManager.current_projects.length - 2} more
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        <div className="ml-2">
                                          {newProject.siteManagerId === siteManager.id.toString() ? (
                                            <UserCheck className="h-5 w-5 text-purple-600" />
                                          ) : (
                                            <div className="h-5 w-5 border-2 border-gray-300 rounded"></div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-center py-4 text-gray-500">
                                  <Clipboard className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                                  <p className="text-sm">No site managers available</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowCreateProject(false)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateProject}
                        disabled={creatingProject || !newProject.title || !newProject.supervisorId}
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
                  </div>
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








// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import Sidebar from '../Sidebar';
// import UserDashboardRoutes from '../../routes/UserDashboardRoutes';
// import { 
//   getUserDetails, 
//   logout, 
//   dashboardAPI,
//   projectManagerAPI,
//   projectsAPI,
//   createProject,
//   supervisorsAPI,
//   siteManagersAPI,
//   teamAPI,
//   tendersAPI,
//   tasksAPI,
//   eventsAPI
// } from '../../services/api';
// import ProgressUpdateModal from '../ProgressUpdateModal';
// import { progressAPI } from '../../services/progressAPI';
// import EnhancedProgressBar from "../EnhancedProgressBar";
// import { 
//   Calendar, 
//   Clock,
//   LogOut,
//   Bell,
//   CheckCircle,
//   Users,
//   FileText,
//   AlertTriangle,
//   Plus,
//   MapPin,
//   User,
//   Building2,
//   Search,
//   ArrowRight,
//   Briefcase,
//   Activity,
//   Menu,
//   Wifi,
//   WifiOff,
//   X,
//   Save,
//   DollarSign,
//   HardHat,
//   Clipboard,
//   UserCheck,
//   TrendingUp,
//   Eye,
//   Zap,
//   Gauge,
//   TrendingDown,
//   RefreshCw,
//   ChevronRight,
//   Folder,
//   Package,
//   CircleDot,
//   Sparkles,
//   BarChart3,
//   PieChart,
//   Target,
//   ChevronLeft,
//   Star,
//   Award,
//   Timer,
//   Layers
// } from 'lucide-react';

// const UserDashboard = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
  
//   // User and data states
//   const [user, setUser] = useState(null);
//   const [myProjects, setMyProjects] = useState([]);
//   const [upcomingEvents, setUpcomingEvents] = useState([]);
//   const [tenders, setTenders] = useState([]);
//   const [recentTasks, setRecentTasks] = useState([]);
//   const [dashboardStats, setDashboardStats] = useState({});
  
//   // Progress Tracking States
//   const [showProgressModal, setShowProgressModal] = useState(false);
//   const [selectedProjectForProgress, setSelectedProjectForProgress] = useState(null);
//   const [projectsWithProgress, setProjectsWithProgress] = useState([]);
//   const [progressOverview, setProgressOverview] = useState({
//     totalProjects: 0,
//     onTrack: 0,
//     behindSchedule: 0,
//     aheadOfSchedule: 0,
//     averageProgress: 0,
//     averageVariance: 0
//   });
  
//   // UI states
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [successMessage, setSuccessMessage] = useState(null);
//   const [isOnline, setIsOnline] = useState(navigator.onLine);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [showCreateProject, setShowCreateProject] = useState(false);
//   const [creatingProject, setCreatingProject] = useState(false);
  
//   // Calendar state
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState(new Date());
  
//   // Check if we're on the main dashboard route
//   const isMainDashboard = location.pathname === '/user' || 
//                          location.pathname === '/user/' || 
//                          location.pathname === '/user/dashboard';
  
//   // Project creation form state
//   const [newProject, setNewProject] = useState({
//     title: '',
//     description: '',
//     location: '',
//     budget: '',
//     startDate: '',
//     endDate: '',
//     priority: 'medium',
//     status: 'planning',
//     supervisorId: '',
//     siteManagerId: '',
//     projectManagerId: ''
//   });
  
//   // Team dropdown states
//   const [supervisors, setSupervisors] = useState([]);
//   const [siteManagers, setSiteManagers] = useState([]);
//   const [projectManagers, setProjectManagers] = useState([]);
//   const [loadingDropdowns, setLoadingDropdowns] = useState(false);

//   useEffect(() => {
//     if (isMainDashboard) {
//       loadUserData();
//     }
    
//     const handleOnline = () => setIsOnline(true);
//     const handleOffline = () => setIsOnline(false);
    
//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);
    
//     return () => {
//       window.removeEventListener('online', handleOnline);
//       window.removeEventListener('offline', handleOffline);
//     };
//   }, [isMainDashboard]);

//   useEffect(() => {
//     if (myProjects.length > 0) {
//       loadProjectsProgress();
//     }
//   }, [myProjects]);

//   const calculateProgressOverview = (projects) => {
//     const totalProjects = projects.length;
//     const onTrack = projects.filter(p => p.schedule_status === 'on_track').length;
//     const behindSchedule = projects.filter(p => p.schedule_status === 'behind_schedule').length;
//     const aheadOfSchedule = projects.filter(p => p.schedule_status === 'ahead_of_schedule').length;
    
//     const averageProgress = totalProjects > 0 
//       ? projects.reduce((sum, p) => sum + (p.current_progress || p.progress_percentage || 0), 0) / totalProjects 
//       : 0;
    
//     const averageVariance = totalProjects > 0
//       ? projects.reduce((sum, p) => sum + Math.abs(p.progress_variance || 0), 0) / totalProjects
//       : 0;

//     setProgressOverview({
//       totalProjects,
//       onTrack,
//       behindSchedule,
//       aheadOfSchedule,
//       averageProgress: Math.round(averageProgress),
//       averageVariance: Math.round(averageVariance * 10) / 10
//     });
//   };

//   const loadProjectsProgress = async () => {
//     if (myProjects.length === 0) return;
    
//     try {
//       console.log(`🔄 Loading progress for ${myProjects.length} projects...`);
      
//       const projectsWithProgressData = await Promise.all(
//         myProjects.map(async (project) => {
//           try {
//             // Try to get progress from the progress API
//             const progressData = await progressAPI.getProgress(project.id);
//             console.log(`✅ Progress loaded for project ${project.id}:`, progressData);
            
//             return { 
//               ...project, 
//               current_progress: progressData.current_progress || progressData.progress_percentage || project.progress_percentage || 0,
//               timeline_progress: progressData.timeline_progress || 0,
//               progress_variance: progressData.progress_variance || 0,
//               schedule_status: progressData.schedule_status || 'unknown',
//               status_color: progressData.status_color || 'gray'
//             };
//           } catch (error) {
//             console.warn(`⚠️ Progress API failed for project ${project.id}, using project data`);
//             // Fallback to project data
//             return {
//               ...project,
//               current_progress: project.progress_percentage || project.current_progress || 0,
//               timeline_progress: project.timeline_progress || 0,
//               progress_variance: project.progress_variance || 0,
//               schedule_status: project.schedule_status || 'unknown',
//               status_color: project.status_color || 'gray'
//             };
//           }
//         })
//       );
      
//       console.log('✅ All project progress loaded:', projectsWithProgressData);
//       setProjectsWithProgress(projectsWithProgressData);
//       calculateProgressOverview(projectsWithProgressData);
//     } catch (error) {
//       console.error('❌ Failed to load projects progress:', error);
//       // Use projects as-is
//       setProjectsWithProgress(myProjects);
//       calculateProgressOverview(myProjects);
//     }
//   };

//   const handleProgressUpdate = (projectId) => {
//     const project = projectsWithProgress.find(p => p.id === projectId);
//     if (project) {
//       setSelectedProjectForProgress(project);
//       setShowProgressModal(true);
//     }
//   };

//   const handleProgressUpdated = (updatedProject) => {
//     setProjectsWithProgress(prev => 
//       prev.map(p => p.id === updatedProject.id ? { ...p, ...updatedProject } : p)
//     );
    
//     setMyProjects(prev => 
//       prev.map(p => p.id === updatedProject.id ? { ...p, progress_percentage: updatedProject.progress_percentage } : p)
//     );
    
//     loadProjectsProgress();
//   };

//   const handleProjectClick = (projectId) => {
//     navigate(`/user/projects?projectId=${projectId}`);
//   };

//   const loadUserData = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       console.log('🔄 Loading dashboard data...');
      
//       // Load user details
//       const userResponse = await getUserDetails();
//       console.log('✅ User details loaded:', userResponse);
      
//       if (userResponse && (userResponse.data || userResponse.user || userResponse)) {
//         const userData = userResponse.data || userResponse.user || userResponse;
//         setUser(userData);
//       }

//       // Try project manager dashboard endpoint first
//       try {
//         console.log('🔄 Attempting projectManagerAPI.getDashboard()...');
//         const dashboardData = await projectManagerAPI.getDashboard();
//         console.log('✅ Dashboard data loaded:', dashboardData);
        
//         if (dashboardData) {
//           // Set projects from dashboard data
//           const projects = dashboardData.projects || dashboardData.data?.projects || [];
//           setMyProjects(Array.isArray(projects) ? projects : []);
//           console.log(`📊 Projects loaded: ${projects.length}`);
          
//           // Set events
//           const events = dashboardData.events || dashboardData.upcoming_events || dashboardData.data?.events || [];
//           setUpcomingEvents(Array.isArray(events) ? events : []);
//           console.log(`📅 Events loaded: ${events.length}`);
          
//           // Set tenders
//           const tenders = dashboardData.tenders || dashboardData.data?.tenders || [];
//           setTenders(Array.isArray(tenders) ? tenders : []);
//           console.log(`📋 Tenders loaded: ${tenders.length}`);
          
//           // Set statistics
//           const stats = dashboardData.statistics || dashboardData.stats || dashboardData.data?.statistics || {};
//           setDashboardStats(stats);
//           console.log('📈 Statistics loaded:', stats);
          
//           // Generate tasks from projects and events
//           generateRecentTasks(projects, events);
          
//           return;
//         }
//       } catch (dashboardError) {
//         console.warn('⚠️ Dashboard endpoint failed, loading individual endpoints:', dashboardError.message);
//       }
      
//       // Fallback: Load individual endpoints
//       console.log('🔄 Loading data from individual endpoints...');
      
//       const [projectsResult, eventsResult, tendersResult, statsResult] = await Promise.allSettled([
//         projectManagerAPI.getMyProjects(),
//         projectManagerAPI.getUpcomingEvents(10),
//         tendersAPI.getMy(),
//         projectManagerAPI.getStatistics()
//       ]);

//       // Handle projects
//       if (projectsResult.status === 'fulfilled') {
//         const projectsData = projectsResult.value;
//         const projects = projectsData.projects || projectsData.data?.projects || projectsData || [];
//         setMyProjects(Array.isArray(projects) ? projects : []);
//         console.log(`✅ Projects loaded from individual endpoint: ${projects.length}`);
//       } else {
//         console.error('❌ Projects failed:', projectsResult.reason);
//         setMyProjects([]);
//       }

//       // Handle events
//       if (eventsResult.status === 'fulfilled') {
//         const eventsData = eventsResult.value;
//         const events = eventsData.events || eventsData.data?.events || eventsData || [];
//         setUpcomingEvents(Array.isArray(events) ? events : []);
//         console.log(`✅ Events loaded: ${events.length}`);
//       } else {
//         console.error('❌ Events failed:', eventsResult.reason);
//         setUpcomingEvents([]);
//       }

//       // Handle tenders
//       if (tendersResult.status === 'fulfilled') {
//         const tendersData = tendersResult.value;
//         const tenders = tendersData.tenders || tendersData.data?.tenders || tendersData || [];
//         setTenders(Array.isArray(tenders) ? tenders : []);
//         console.log(`✅ Tenders loaded: ${tenders.length}`);
//       } else {
//         console.error('❌ Tenders failed:', tendersResult.reason);
//         setTenders([]);
//       }

//       // Handle statistics
//       if (statsResult.status === 'fulfilled') {
//         const statsData = statsResult.value;
//         const stats = statsData.statistics || statsData.stats || statsData.data || statsData || {};
//         setDashboardStats(stats);
//         console.log('✅ Statistics loaded:', stats);
//       } else {
//         console.error('❌ Statistics failed:', statsResult.reason);
//         setDashboardStats({});
//       }
      
//       // Generate tasks from loaded data
//       const projects = projectsResult.status === 'fulfilled' 
//         ? (projectsResult.value.projects || projectsResult.value.data?.projects || projectsResult.value || [])
//         : [];
//       const events = eventsResult.status === 'fulfilled'
//         ? (eventsResult.value.events || eventsResult.value.data?.events || eventsResult.value || [])
//         : [];
//       generateRecentTasks(projects, events);
      
//     } catch (error) {
//       console.error('💥 Error loading dashboard:', error);
//       setError('Failed to load dashboard data. Please check your connection.');
      
//       if (error.response?.status === 401) {
//         navigate('/login');
//         return;
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadDropdownData = async () => {
//     try {
//       setLoadingDropdowns(true);
      
//       const [supervisorsData, siteManagersData] = await Promise.allSettled([
//         supervisorsAPI.getAll(),
//         siteManagersAPI.getAll()
//       ]);

//       if (supervisorsData.status === 'fulfilled') {
//         setSupervisors(supervisorsData.value || []);
//       } else {
//         setSupervisors([]);
//       }

//       if (siteManagersData.status === 'fulfilled') {
//         setSiteManagers(siteManagersData.value || []);
//       } else {
//         setSiteManagers([]);
//       }

//       setProjectManagers([
//         { id: 1, name: "Current User", email: user?.email || "user@example.com", current_projects: [], projects_count: 0 }
//       ]);
//     } catch (error) {
//       console.error('💥 Error loading team data:', error);
//     } finally {
//       setLoadingDropdowns(false);
//     }
//   };

//   const generateRecentTasks = (projects, events) => {
//     const tasks = [];
    
//     projects.slice(0, 3).forEach(project => {
//       if (project.status === 'in_progress') {
//         tasks.push({
//           id: `project_${project.id}_review`,
//           task: `Review progress for ${project.title}`,
//           project: project.title,
//           due: "Today",
//           status: "pending",
//           priority: project.priority || "medium"
//         });
//       }
      
//       if (project.status === 'planning') {
//         tasks.push({
//           id: `project_${project.id}_plan`,
//           task: `Finalize planning for ${project.title}`,
//           project: project.title,
//           due: "Tomorrow",
//           status: "pending",
//           priority: project.priority || "medium"
//         });
//       }
//     });
    
//     events.slice(0, 2).forEach(event => {
//       tasks.push({
//         id: `event_${event.id}_prep`,
//         task: `Prepare for ${event.description}`,
//         project: event.project_title || "General",
//         due: new Date(event.date).toLocaleDateString(),
//         status: new Date(event.date) <= new Date() ? "completed" : "in_progress",
//         priority: "high"
//       });
//     });
    
//     setRecentTasks(tasks.slice(0, 6));
//   };

//   const handleLogout = async () => {
//     try {
//       await logout();
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       localStorage.clear();
//       navigate('/login');
//     }
//   };

//   const handleRefresh = () => {
//     loadUserData();
//   };

//   const handleCreateProject = async (e) => {
//     e.preventDefault();
//     setCreatingProject(true);
//     setError(null);
    
//     try {
//       if (!newProject.supervisorId) {
//         throw new Error('Please select a supervisor');
//       }
      
//       const projectData = {
//         title: newProject.title,
//         description: newProject.description,
//         location: newProject.location,
//         budget: newProject.budget ? parseFloat(newProject.budget) : null,
//         start_date: newProject.startDate,
//         finishing_date: newProject.endDate,
//         priority: newProject.priority,
//         status: newProject.status,
//         supervisor_id: parseInt(newProject.supervisorId),
//         site_manager_id: newProject.siteManagerId ? parseInt(newProject.siteManagerId) : null,
//         project_manager_id: newProject.projectManagerId ? parseInt(newProject.projectManagerId) : null
//       };
      
//       const result = await createProject(projectData);
//       setSuccessMessage(`Project "${newProject.title}" created successfully!`);
      
//       setNewProject({
//         title: '',
//         description: '',
//         location: '',
//         budget: '',
//         startDate: '',
//         endDate: '',
//         priority: 'medium',
//         status: 'planning',
//         supervisorId: '',
//         siteManagerId: '',
//         projectManagerId: ''
//       });
      
//       setShowCreateProject(false);
//       setTimeout(() => setSuccessMessage(null), 5000);
//       loadUserData();
      
//     } catch (error) {
//       console.error('❌ Error creating project:', error);
//       const errorMessage = error.response?.data?.errors?.join(', ') || 
//                           error.response?.data?.message || 
//                           error.message ||
//                           'Failed to create project. Please try again.';
//       setError(errorMessage);
//     } finally {
//       setCreatingProject(false);
//     }
//   };

//   const handleOpenCreateProject = () => {
//     setShowCreateProject(true);
//     loadDropdownData();
//   };

//   const getWorkloadStatus = (member) => {
//     const projectCount = member.projects_count || member.current_projects?.length || 0;
//     if (projectCount === 0) return { status: 'available', color: 'green', text: 'Available' };
//     if (projectCount <= 2) return { status: 'light', color: 'yellow', text: 'Light Load' };
//     if (projectCount <= 4) return { status: 'busy', color: 'orange', text: 'Busy' };
//     return { status: 'overloaded', color: 'red', text: 'Overloaded' };
//   };

//   const getWorkloadColorClasses = (color) => {
//     const colors = {
//       green: 'bg-green-100 text-green-700 border-green-200',
//       yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
//       orange: 'bg-orange-100 text-orange-700 border-orange-200',
//       red: 'bg-red-100 text-red-700 border-red-200'
//     };
//     return colors[color] || 'bg-gray-100 text-gray-700 border-gray-200';
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       in_progress: 'bg-blue-100 text-blue-700',
//       planning: 'bg-yellow-100 text-yellow-700',
//       review: 'bg-purple-100 text-purple-700',
//       completed: 'bg-green-100 text-green-700',
//       on_hold: 'bg-gray-100 text-gray-700'
//     };
//     return colors[status] || 'bg-gray-100 text-gray-700';
//   };

//   const getPriorityIndicator = (priority) => {
//     const colors = {
//       high: 'bg-red-500',
//       medium: 'bg-yellow-500',
//       low: 'bg-green-500'
//     };
//     return colors[priority] || 'bg-gray-400';
//   };

//   const getUserInitials = (name) => {
//     if (!name) return 'U';
//     return name
//       .split(' ')
//       .map(part => part.charAt(0))
//       .join('')
//       .substring(0, 2)
//       .toUpperCase();
//   };

//   // Calendar functions
//   const getDaysInMonth = (date) => {
//     const year = date.getFullYear();
//     const month = date.getMonth();
//     const daysInMonth = new Date(year, month + 1, 0).getDate();
//     const firstDay = new Date(year, month, 1).getDay();
//     return { daysInMonth, firstDay };
//   };

//   const changeMonth = (increment) => {
//     setCurrentDate(prev => {
//       const newDate = new Date(prev);
//       newDate.setMonth(prev.getMonth() + increment);
//       return newDate;
//     });
//   };

//   const isToday = (day) => {
//     const today = new Date();
//     return day === today.getDate() && 
//            currentDate.getMonth() === today.getMonth() && 
//            currentDate.getFullYear() === today.getFullYear();
//   };

//   const hasEvent = (day) => {
//     return upcomingEvents.some(event => {
//       const eventDate = new Date(event.date);
//       return eventDate.getDate() === day && 
//              eventDate.getMonth() === currentDate.getMonth() && 
//              eventDate.getFullYear() === currentDate.getFullYear();
//     });
//   };

//   const getEventsForDay = (day) => {
//     return upcomingEvents.filter(event => {
//       const eventDate = new Date(event.date);
//       return eventDate.getDate() === day && 
//              eventDate.getMonth() === currentDate.getMonth() && 
//              eventDate.getFullYear() === currentDate.getFullYear();
//     });
//   };

//   const handleFinishProject = async (projectId, e) => {
//     e.stopPropagation();
    
//     if (!window.confirm('Are you sure you want to mark this project as completed?')) {
//       return;
//     }

//     try {
//       console.log(`🔄 Marking project ${projectId} as completed...`);
      
//       // Try to update project status
//       try {
//         await projectsAPI.update(projectId, { status: 'completed' });
//       } catch (updateError) {
//         // Fallback: try other methods
//         console.warn('⚠️ Standard update failed, trying alternative');
//         await projectsAPI.updateProgress(projectId, { status: 'completed' });
//       }
      
//       setSuccessMessage('Project marked as completed!');
//       setTimeout(() => setSuccessMessage(null), 3000);
//       console.log('✅ Project completed successfully');
      
//       loadUserData();
//     } catch (error) {
//       console.error('❌ Failed to complete project:', error);
//       setError('Failed to mark project as completed. Please try again.');
//       setTimeout(() => setError(null), 3000);
//     }
//   };

//   const calculatedStats = {
//     activeProjects: myProjects.filter(p => p.status !== 'completed').length,
//     completedProjects: myProjects.filter(p => p.status === 'completed').length,
//     totalTeamMembers: myProjects.reduce((sum, p) => sum + (p.team_size || 0), 0),
//     activeTenders: tenders.filter(t => t.status === 'open' || t.status === 'pending').length,
//     pendingTasks: recentTasks.filter(t => t.status === 'pending').length,
//     upcomingEvents: upcomingEvents.length
//   };

//   // Loading state
//   if (loading && isMainDashboard) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
//         <div className="text-center">
//           <div className="relative inline-block mb-6">
//             <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
//             <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-20 blur-2xl animate-pulse"></div>
//           </div>
//           <p className="text-xl text-gray-900 font-bold">Loading Dashboard...</p>
//           <p className="text-sm text-gray-600 mt-2">Preparing your workspace</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
//       <Sidebar 
//         isCollapsed={sidebarCollapsed}
//         onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
//       />

//       <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
//         {isMainDashboard ? (
//           <>
//             {/* Modern Gradient Header */}
//             <header className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200 sticky top-0 z-30">
//               <div className="px-6 py-5">
//                 <div className="flex justify-between items-center">
//                   <div className="flex items-center gap-4">
//                     <button
//                       onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
//                       className="p-2.5 text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all lg:hidden"
//                     >
//                       <Menu className="h-6 w-6" />
//                     </button>
                    
//                     <div>
//                       <div className="flex items-center gap-3">
//                         <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
//                           Dashboard
//                         </h1>
//                         <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
//                       </div>
//                       <p className="text-sm text-gray-600 mt-1 font-medium">
//                         Welcome back, {user?.name?.split(' ')[0] || 'User'} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3">
//                     <button
//                       onClick={handleRefresh}
//                       className="p-3 text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all hover:rotate-180 duration-500"
//                     >
//                       <RefreshCw className="h-5 w-5" />
//                     </button>
                    
//                     <button className="relative p-3 text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all">
//                       <Bell className="h-5 w-5" />
//                       {(calculatedStats.pendingTasks + progressOverview.behindSchedule) > 0 && (
//                         <span className="absolute top-1.5 right-1.5 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs text-white flex items-center justify-center font-bold animate-pulse shadow-lg">
//                           {calculatedStats.pendingTasks + progressOverview.behindSchedule}
//                         </span>
//                       )}
//                     </button>

//                     <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-2 border border-blue-100">
//                       <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">
//                         {getUserInitials(user?.name)}
//                       </div>
//                       <div className="hidden sm:block pr-2">
//                         <p className="text-sm font-bold text-gray-900">{user?.name || 'User'}</p>
//                         <p className="text-xs text-gray-600">{user?.role || 'Manager'}</p>
//                       </div>
//                       <button
//                         onClick={handleLogout}
//                         className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
//                       >
//                         <LogOut className="h-4 w-4" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </header>

//             {/* Alerts */}
//             {error && (
//               <div className="mx-6 mt-4 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-xl p-4 shadow-lg">
//                 <div className="flex items-center gap-3">
//                   <AlertTriangle className="h-5 w-5 text-red-600" />
//                   <p className="text-red-700 font-medium flex-1">{error}</p>
//                   <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 font-bold">×</button>
//                 </div>
//               </div>
//             )}

//             {successMessage && (
//               <div className="mx-6 mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl p-4 shadow-lg">
//                 <div className="flex items-center gap-3">
//                   <CheckCircle className="h-5 w-5 text-green-600" />
//                   <p className="text-green-700 font-medium flex-1">{successMessage}</p>
//                   <button onClick={() => setSuccessMessage(null)} className="text-green-600 hover:text-green-800 font-bold">×</button>
//                 </div>
//               </div>
//             )}

//             {/* Main Content */}
//             <main className="flex-1 overflow-y-auto p-6">
//               {/* Hero Stats Cards with Gradients */}
//               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
//                 {[
//                   { icon: Building2, label: 'Active Projects', value: calculatedStats.activeProjects, gradient: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 to-cyan-50' },
//                   { icon: CheckCircle, label: 'Completed', value: calculatedStats.completedProjects, gradient: 'from-green-500 to-emerald-500', bg: 'from-green-50 to-emerald-50' },
//                   { icon: Users, label: 'Team Members', value: calculatedStats.totalTeamMembers, gradient: 'from-purple-500 to-pink-500', bg: 'from-purple-50 to-pink-50' },
//                   { icon: FileText, label: 'Active Tenders', value: calculatedStats.activeTenders, gradient: 'from-orange-500 to-red-500', bg: 'from-orange-50 to-red-50' },
//                   { icon: AlertTriangle, label: 'Pending Tasks', value: calculatedStats.pendingTasks, gradient: 'from-yellow-500 to-orange-500', bg: 'from-yellow-50 to-orange-50' },
//                   { icon: Calendar, label: 'Events', value: calculatedStats.upcomingEvents, gradient: 'from-indigo-500 to-purple-500', bg: 'from-indigo-50 to-purple-50' }
//                 ].map((stat, index) => (
//                   <div 
//                     key={index} 
//                     className={`bg-gradient-to-br ${stat.bg} rounded-2xl p-5 border border-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer`}
//                   >
//                     <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
//                       <stat.icon className="h-6 w-6 text-white" />
//                     </div>
//                     <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
//                     <div className="text-xs font-semibold text-gray-600">{stat.label}</div>
//                   </div>
//                 ))}
//               </div>

//               {/* Three Column Layout */}
//               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//                 {/* Left Column - Projects & Tenders (6 cols) */}
//                 <div className="lg:col-span-6 space-y-6">
//                   {/* Projects with Chart */}
//                   <div className="bg-white/90 backdrop-blur-xl rounded-3xl border-2 border-gray-100 shadow-xl overflow-hidden">
//                     <div className="p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-gray-100">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
//                             <Building2 className="h-6 w-6 text-white" />
//                           </div>
//                           <div>
//                             <h3 className="text-xl font-black text-gray-900">Active Projects</h3>
//                             <p className="text-sm text-gray-600">{calculatedStats.activeProjects} in progress</p>
//                           </div>
//                         </div>
//                         <button 
//                           onClick={handleOpenCreateProject}
//                           className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all font-bold"
//                         >
//                           <Plus className="h-5 w-5" />
//                           New
//                         </button>
//                       </div>
//                     </div>

//                     <div className="p-6">
//                       {/* Debug Info - Remove after fixing */}
//                       {myProjects.length > 0 && (
//                         <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
//                           <div className="flex items-center gap-2 mb-2">
//                             <AlertTriangle className="h-5 w-5 text-yellow-600" />
//                             <h4 className="font-bold text-yellow-900">Debug Info</h4>
//                           </div>
//                           <div className="text-xs text-yellow-800 space-y-1">
//                             <p>Total Projects: {myProjects.length}</p>
//                             <p>Projects with Progress Data: {projectsWithProgress.length}</p>
//                             {myProjects.slice(0, 2).map((p, i) => (
//                               <div key={i} className="mt-2 p-2 bg-white rounded">
//                                 <p className="font-bold">{p.title}:</p>
//                                 <p>progress_percentage: {p.progress_percentage || 'undefined'}</p>
//                                 <p>current_progress: {p.current_progress || 'undefined'}</p>
//                                 <p>All keys: {Object.keys(p).join(', ')}</p>
//                               </div>
//                             ))}
//                           </div>
//                           <button 
//                             onClick={() => console.log('All Projects Data:', myProjects)}
//                             className="mt-2 text-xs text-yellow-700 underline"
//                           >
//                             Log all project data to console
//                           </button>
//                         </div>
//                       )}
                      
//                       {myProjects.length === 0 ? (
//                         <div className="text-center py-16">
//                           <div className="relative inline-block mb-6">
//                             <Folder className="h-20 w-20 text-gray-300" />
//                             <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
//                           </div>
//                           <h4 className="text-xl font-bold text-gray-900 mb-2">No Projects Yet</h4>
//                           <p className="text-gray-600 mb-6">Start by creating your first project</p>
//                           <button 
//                             onClick={handleOpenCreateProject}
//                             className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:shadow-2xl hover:scale-105 transition-all font-bold"
//                           >
//                             <Plus className="h-6 w-6" />
//                             Create First Project
//                           </button>
//                         </div>
//                       ) : (
//                         <div className="space-y-4">
//                           {(projectsWithProgress.length > 0 ? projectsWithProgress : myProjects).slice(0, 5).map((project) => {
//                             // Get progress from multiple possible sources
//                             const progressPercentage = project.current_progress || project.progress_percentage || 0;
//                             const timelineProgress = project.timeline_progress || 0;
//                             const progressVariance = project.progress_variance || 0;
//                             const isCompleted = project.status === 'completed';
                            
//                             // Debug logging
//                             console.log('Project:', project.title, 'Progress:', progressPercentage, 'Timeline:', timelineProgress, 'Variance:', progressVariance);
                            
//                             return (
//                             <div 
//                               key={project.id}
//                               className="group p-5 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 rounded-2xl hover:border-blue-300 hover:shadow-xl transition-all cursor-pointer"
//                               onClick={() => handleProjectClick(project.id)}
//                             >
//                               <div className="flex items-start justify-between mb-4">
//                                 <div className="flex-1">
//                                   <h4 className="text-lg font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{project.title || project.name}</h4>
//                                   <div className="flex flex-wrap items-center gap-2">
//                                     <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${getStatusColor(project.status)}`}>
//                                       {project.status?.replace('_', ' ').toUpperCase()}
//                                     </span>
//                                     <div className="flex items-center gap-1 text-sm text-gray-600">
//                                       <MapPin className="h-4 w-4" />
//                                       <span>{project.location || 'No location'}</span>
//                                     </div>
//                                   </div>
//                                 </div>
//                                 <div className="flex gap-2">
//                                   <button
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       handleProgressUpdate(project.id);
//                                     }}
//                                     className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all"
//                                     title="Update Progress"
//                                   >
//                                     <TrendingUp className="h-5 w-5" />
//                                   </button>
//                                   {!isCompleted && (
//                                     <button
//                                       onClick={(e) => handleFinishProject(project.id, e)}
//                                       className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 text-green-600 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all"
//                                       title="Mark as Completed"
//                                     >
//                                       <CheckCircle className="h-5 w-5" />
//                                     </button>
//                                   )}
//                                 </div>
//                               </div>

//                               {/* Progress Bar with actual data */}
//                               <div className="mb-3">
//                                 <div className="flex items-center justify-between text-sm mb-2">
//                                   <span className="font-semibold text-gray-700">Project Progress</span>
//                                   <span className="font-black text-gray-900">{Math.round(progressPercentage)}%</span>
//                                 </div>
//                                 <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
//                                   <div 
//                                     className={`h-full rounded-full transition-all duration-500 ${
//                                       progressPercentage >= 100 
//                                         ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
//                                         : progressPercentage >= 75 
//                                         ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
//                                         : progressPercentage >= 50 
//                                         ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
//                                         : progressPercentage > 0
//                                         ? 'bg-gradient-to-r from-red-500 to-pink-500'
//                                         : 'bg-gray-300'
//                                     }`}
//                                     style={{ width: `${Math.min(progressPercentage, 100)}%` }}
//                                   ></div>
//                                 </div>
                                
//                                 {/* Show message if no progress data */}
//                                 {progressPercentage === 0 && (
//                                   <div className="mt-2 text-xs text-gray-500 italic">
//                                     No progress updates yet. Click "Update Progress" to add.
//                                   </div>
//                                 )}
                                
//                                 {/* Timeline progress if available */}
//                                 {timelineProgress > 0 && (
//                                   <div className="mt-2">
//                                     <div className="flex items-center justify-between text-xs text-gray-600">
//                                       <span>Timeline Progress</span>
//                                       <span className="font-bold">{Math.round(timelineProgress)}%</span>
//                                     </div>
//                                     <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
//                                       <div 
//                                         className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500"
//                                         style={{ width: `${Math.min(timelineProgress, 100)}%` }}
//                                       ></div>
//                                     </div>
//                                   </div>
//                                 )}
                                
//                                 {/* Progress variance indicator */}
//                                 {Math.abs(progressVariance) > 5 && (
//                                   <div className="mt-2 flex items-center gap-2">
//                                     {progressVariance > 0 ? (
//                                       <>
//                                         <TrendingUp className="h-4 w-4 text-green-600" />
//                                         <span className="text-xs font-bold text-green-600">
//                                           {progressVariance.toFixed(1)}% ahead of schedule
//                                         </span>
//                                       </>
//                                     ) : (
//                                       <>
//                                         <TrendingDown className="h-4 w-4 text-red-600" />
//                                         <span className="text-xs font-bold text-red-600">
//                                           {Math.abs(progressVariance).toFixed(1)}% behind schedule
//                                         </span>
//                                       </>
//                                     )}
//                                   </div>
//                                 )}
//                               </div>

//                               <div className="flex items-center justify-between text-sm text-gray-600">
//                                 <div className="flex items-center gap-2">
//                                   <Calendar className="h-4 w-4" />
//                                   <span>{project.finishing_date ? new Date(project.finishing_date).toLocaleDateString() : 'No deadline'}</span>
//                                 </div>
//                                 <div className="flex items-center gap-2 text-blue-600 font-semibold">
//                                   <Eye className="h-4 w-4" />
//                                   <span>View Details</span>
//                                 </div>
//                               </div>
//                             </div>
//                           )})}

//                           {myProjects.length > 5 && (
//                             <button 
//                               onClick={() => navigate('/user/projects')}
//                               className="w-full py-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 text-gray-700 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all font-bold"
//                             >
//                               View All {myProjects.length} Projects →
//                             </button>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Distribution Chart */}
//                   <div className="bg-white/90 backdrop-blur-xl rounded-3xl border-2 border-gray-100 shadow-xl overflow-hidden">
//                     <div className="p-6 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 border-b-2 border-gray-100">
//                       <div className="flex items-center gap-3">
//                         <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
//                           <PieChart className="h-6 w-6 text-white" />
//                         </div>
//                         <div>
//                           <h3 className="text-xl font-black text-gray-900">Work Distribution</h3>
//                           <p className="text-sm text-gray-600">Overview of your workload</p>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="p-6">
//                       <div className="grid grid-cols-3 gap-4">
//                         {[
//                           { label: 'Projects', value: calculatedStats.activeProjects + calculatedStats.completedProjects, color: 'from-blue-500 to-cyan-500', percentage: 40 },
//                           { label: 'Tenders', value: calculatedStats.activeTenders, color: 'from-orange-500 to-red-500', percentage: 30 },
//                           { label: 'Tasks', value: calculatedStats.pendingTasks, color: 'from-purple-500 to-pink-500', percentage: 30 }
//                         ].map((item, index) => (
//                           <div key={index} className="text-center">
//                             <div className="relative w-24 h-24 mx-auto mb-3">
//                               <svg className="transform -rotate-90 w-24 h-24">
//                                 <circle
//                                   cx="48"
//                                   cy="48"
//                                   r="40"
//                                   stroke="currentColor"
//                                   strokeWidth="8"
//                                   fill="none"
//                                   className="text-gray-200"
//                                 />
//                                 <circle
//                                   cx="48"
//                                   cy="48"
//                                   r="40"
//                                   stroke="url(#gradient-${index})"
//                                   strokeWidth="8"
//                                   fill="none"
//                                   strokeDasharray={`${item.percentage * 2.51} ${251 - item.percentage * 2.51}`}
//                                   className="transition-all duration-1000"
//                                 />
//                                 <defs>
//                                   <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
//                                     <stop offset="0%" className={`text-${item.color.split(' ')[0].replace('from-', '')}`} stopColor="currentColor" />
//                                     <stop offset="100%" className={`text-${item.color.split(' ')[2]}`} stopColor="currentColor" />
//                                   </linearGradient>
//                                 </defs>
//                               </svg>
//                               <div className="absolute inset-0 flex items-center justify-center">
//                                 <span className="text-2xl font-black text-gray-900">{item.value}</span>
//                               </div>
//                             </div>
//                             <p className="text-sm font-bold text-gray-900">{item.label}</p>
//                             <p className="text-xs text-gray-600">{item.percentage}% of work</p>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Middle Column - Calendar & Tasks (3 cols) */}
//                 <div className="lg:col-span-3 space-y-6">
//                   {/* Mini Calendar */}
//                   <div className="bg-white/90 backdrop-blur-xl rounded-3xl border-2 border-gray-100 shadow-xl overflow-hidden">
//                     <div className="p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b-2 border-gray-100">
//                       <div className="flex items-center justify-between mb-4">
//                         <button 
//                           onClick={() => changeMonth(-1)}
//                           className="p-2 hover:bg-white/50 rounded-lg transition-all"
//                         >
//                           <ChevronLeft className="h-5 w-5 text-gray-700" />
//                         </button>
//                         <h3 className="text-lg font-black text-gray-900">
//                           {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
//                         </h3>
//                         <button 
//                           onClick={() => changeMonth(1)}
//                           className="p-2 hover:bg-white/50 rounded-lg transition-all"
//                         >
//                           <ChevronRight className="h-5 w-5 text-gray-700" />
//                         </button>
//                       </div>
//                     </div>

//                     <div className="p-6">
//                       <div className="grid grid-cols-7 gap-2 mb-2">
//                         {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
//                           <div key={day} className="text-center text-xs font-bold text-gray-600">
//                             {day}
//                           </div>
//                         ))}
//                       </div>
//                       <div className="grid grid-cols-7 gap-2">
//                         {Array.from({ length: getDaysInMonth(currentDate).firstDay }).map((_, index) => (
//                           <div key={`empty-${index}`} className="aspect-square" />
//                         ))}
//                         {Array.from({ length: getDaysInMonth(currentDate).daysInMonth }).map((_, index) => {
//                           const day = index + 1;
//                           const today = isToday(day);
//                           const dayEvents = getEventsForDay(day);
//                           const hasEventOnDay = dayEvents.length > 0;
                          
//                           return (
//                             <div
//                               key={day}
//                               className={`aspect-square flex flex-col items-center justify-center text-sm font-bold rounded-xl cursor-pointer transition-all relative group ${
//                                 today
//                                   ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-110'
//                                   : hasEventOnDay
//                                   ? 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-900 hover:scale-110'
//                                   : 'hover:bg-gray-100 text-gray-700 hover:scale-105'
//                               }`}
//                             >
//                               {day}
//                               {hasEventOnDay && (
//                                 <>
//                                   <div className="flex gap-0.5 mt-1">
//                                     {dayEvents.slice(0, 3).map((_, i) => (
//                                       <div key={i} className={`w-1 h-1 rounded-full ${today ? 'bg-white' : 'bg-purple-600'}`}></div>
//                                     ))}
//                                   </div>
//                                   {/* Tooltip */}
//                                   <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
//                                     <div className="bg-gray-900 text-white text-xs rounded-lg p-2 whitespace-nowrap shadow-xl">
//                                       <div className="space-y-1">
//                                         {dayEvents.slice(0, 3).map((event, i) => (
//                                           <div key={i}>{event.title || event.description}</div>
//                                         ))}
//                                         {dayEvents.length > 3 && (
//                                           <div className="text-gray-400">+{dayEvents.length - 3} more</div>
//                                         )}
//                                       </div>
//                                       <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
//                                         <div className="border-4 border-transparent border-t-gray-900"></div>
//                                       </div>
//                                     </div>
//                                   </div>
//                                 </>
//                               )}
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Recent Tasks */}
//                   <div className="bg-white/90 backdrop-blur-xl rounded-3xl border-2 border-gray-100 shadow-xl overflow-hidden">
//                     <div className="p-6 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-b-2 border-gray-100">
//                       <div className="flex items-center gap-3">
//                         <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
//                           <CheckCircle className="h-6 w-6 text-white" />
//                         </div>
//                         <div>
//                           <h3 className="text-xl font-black text-gray-900">Tasks</h3>
//                           <p className="text-sm text-gray-600">{recentTasks.length} total tasks</p>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="p-6 max-h-96 overflow-y-auto">
//                       {recentTasks.length === 0 ? (
//                         <div className="text-center py-12">
//                           <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-3" />
//                           <p className="text-sm text-gray-600 font-medium">No tasks available</p>
//                         </div>
//                       ) : (
//                         <div className="space-y-3">
//                           {recentTasks.map((task) => (
//                             <div 
//                               key={task.id}
//                               className="p-4 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 rounded-xl hover:border-green-200 hover:shadow-lg transition-all"
//                             >
//                               <div className="flex items-start gap-3">
//                                 <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${getPriorityIndicator(task.priority)}`}></div>
                                
//                                 <div className="flex-1">
//                                   <h4 className="font-bold text-gray-900 text-sm mb-2">{task.task}</h4>
//                                   <div className="flex items-center gap-3 text-xs text-gray-600">
//                                     <div className="flex items-center gap-1">
//                                       <Building2 className="h-3 w-3" />
//                                       <span className="truncate">{task.project}</span>
//                                     </div>
//                                     <div className="flex items-center gap-1">
//                                       <Clock className="h-3 w-3" />
//                                       <span>{task.due}</span>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Right Column - Events & Tenders (3 cols) */}
//                 <div className="lg:col-span-3 space-y-6">
//                   {/* Upcoming Events */}
//                   <div className="bg-white/90 backdrop-blur-xl rounded-3xl border-2 border-gray-100 shadow-xl overflow-hidden">
//                     <div className="p-6 bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 border-b-2 border-gray-100">
//                       <div className="flex items-center gap-3">
//                         <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
//                           <Calendar className="h-6 w-6 text-white" />
//                         </div>
//                         <div>
//                           <h3 className="text-xl font-black text-gray-900">Events</h3>
//                           <p className="text-sm text-gray-600">{upcomingEvents.length} upcoming</p>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="p-6 max-h-96 overflow-y-auto">
//                       {upcomingEvents.length === 0 ? (
//                         <div className="text-center py-12">
//                           <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-3" />
//                           <p className="text-sm text-gray-600 font-medium">No upcoming events</p>
//                         </div>
//                       ) : (
//                         <div className="space-y-3">
//                           {upcomingEvents.slice(0, 5).map((event) => (
//                             <div 
//                               key={event.id}
//                               className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-100 rounded-xl hover:shadow-lg transition-all"
//                             >
//                               <div className="flex gap-3">
//                                 <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex flex-col items-center justify-center flex-shrink-0 shadow-lg">
//                                   <span className="text-xs font-bold text-cyan-100">
//                                     {new Date(event.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
//                                   </span>
//                                   <span className="text-xl font-black text-white">
//                                     {new Date(event.date).getDate()}
//                                   </span>
//                                 </div>
                                
//                                 <div className="flex-1 min-w-0">
//                                   <h4 className="font-bold text-gray-900 text-sm mb-2 truncate">
//                                     {event.title || event.description}
//                                   </h4>
//                                   <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
//                                     <Clock className="h-3 w-3" />
//                                     <span>{event.time || new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
//                                   </div>
//                                   {event.project_title && (
//                                     <div className="flex items-center gap-2 text-xs text-gray-600">
//                                       <Building2 className="h-3 w-3" />
//                                       <span className="truncate">{event.project_title}</span>
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Tenders */}
//                   <div className="bg-white/90 backdrop-blur-xl rounded-3xl border-2 border-gray-100 shadow-xl overflow-hidden">
//                     <div className="p-6 bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 border-b-2 border-gray-100">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
//                             <Package className="h-6 w-6 text-white" />
//                           </div>
//                           <div>
//                             <h3 className="text-xl font-black text-gray-900">Tenders</h3>
//                             <p className="text-sm text-gray-600">{tenders.length} active</p>
//                           </div>
//                         </div>
//                         <button 
//                           onClick={() => navigate('/user/tenders')}
//                           className="text-sm text-orange-600 hover:text-orange-700 font-bold"
//                         >
//                           View All →
//                         </button>
//                       </div>
//                     </div>

//                     <div className="p-6">
//                       {tenders.length === 0 ? (
//                         <div className="text-center py-12">
//                           <Package className="h-16 w-16 text-gray-300 mx-auto mb-3" />
//                           <p className="text-sm text-gray-600 font-medium">No active tenders</p>
//                         </div>
//                       ) : (
//                         <div className="space-y-3">
//                           {tenders.slice(0, 4).map((tender) => (
//                             <div 
//                               key={tender.id}
//                               className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-100 rounded-xl hover:shadow-lg transition-all cursor-pointer"
//                               onClick={() => navigate(`/user/tenders/${tender.id}`)}
//                             >
//                               <h4 className="font-bold text-gray-900 text-sm mb-3">{tender.title || tender.name}</h4>
//                               <div className="grid grid-cols-2 gap-2 text-xs">
//                                 <div className="flex items-center gap-1 text-gray-600">
//                                   <DollarSign className="h-3 w-3" />
//                                   <span className="font-semibold">${tender.budget?.toLocaleString() || 'N/A'}</span>
//                                 </div>
//                                 <div className="flex items-center gap-1 text-gray-600">
//                                   <Calendar className="h-3 w-3" />
//                                   <span className="font-semibold">{tender.deadline ? new Date(tender.deadline).toLocaleDateString() : 'N/A'}</span>
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </main>

//             {/* Progress Modal */}
//             <ProgressUpdateModal
//               project={selectedProjectForProgress}
//               isOpen={showProgressModal}
//               onClose={() => {
//                 setShowProgressModal(false);
//                 setSelectedProjectForProgress(null);
//               }}
//               onProgressUpdated={handleProgressUpdated}
//             />

//             {/* Create Project Modal */}
//             {showCreateProject && (
//               <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//                 <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
//                   <div className="flex items-center justify-between p-6 border-b-2 border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
//                     <h2 className="text-2xl font-black text-gray-900">Create New Project</h2>
//                     <button 
//                       onClick={() => setShowCreateProject(false)}
//                       className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
//                     >
//                       <X className="h-6 w-6" />
//                     </button>
//                   </div>

//                   <form onSubmit={handleCreateProject} className="p-6 space-y-6">
//                     <div>
//                       <label className="block text-sm font-bold text-gray-700 mb-2">Project Title *</label>
//                       <input
//                         type="text"
//                         required
//                         value={newProject.title}
//                         onChange={(e) => setNewProject({...newProject, title: e.target.value})}
//                         className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Enter project title"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
//                       <textarea
//                         value={newProject.description}
//                         onChange={(e) => setNewProject({...newProject, description: e.target.value})}
//                         rows={3}
//                         className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//                         placeholder="Brief project description"
//                       />
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
//                         <input
//                           type="text"
//                           value={newProject.location}
//                           onChange={(e) => setNewProject({...newProject, location: e.target.value})}
//                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           placeholder="Project location"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-bold text-gray-700 mb-2">Budget</label>
//                         <input
//                           type="number"
//                           value={newProject.budget}
//                           onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
//                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           placeholder="0.00"
//                         />
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
//                         <input
//                           type="date"
//                           value={newProject.startDate}
//                           onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
//                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
//                         <input
//                           type="date"
//                           value={newProject.endDate}
//                           onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
//                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
//                         <select
//                           value={newProject.priority}
//                           onChange={(e) => setNewProject({...newProject, priority: e.target.value})}
//                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         >
//                           <option value="low">Low</option>
//                           <option value="medium">Medium</option>
//                           <option value="high">High</option>
//                         </select>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
//                         <select
//                           value={newProject.status}
//                           onChange={(e) => setNewProject({...newProject, status: e.target.value})}
//                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         >
//                           <option value="planning">Planning</option>
//                           <option value="in_progress">In Progress</option>
//                           <option value="on_hold">On Hold</option>
//                         </select>
//                       </div>
//                     </div>

//                     <div className="border-t-2 border-gray-200 pt-6">
//                       <h3 className="text-lg font-bold text-gray-900 mb-4">Team Assignment</h3>
                      
//                       {loadingDropdowns ? (
//                         <div className="text-center py-8">
//                           <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
//                         </div>
//                       ) : (
//                         <div className="space-y-4">
//                           <div>
//                             <label className="block text-sm font-bold text-gray-700 mb-2">Supervisor *</label>
//                             <select
//                               required
//                               value={newProject.supervisorId}
//                               onChange={(e) => setNewProject({...newProject, supervisorId: e.target.value})}
//                               className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             >
//                               <option value="">Select supervisor</option>
//                               {supervisors.map((supervisor) => (
//                                 <option key={supervisor.id} value={supervisor.id}>
//                                   {supervisor.name} ({supervisor.projects_count || 0} projects)
//                                 </option>
//                               ))}
//                             </select>
//                           </div>

//                           <div>
//                             <label className="block text-sm font-bold text-gray-700 mb-2">Site Manager (Optional)</label>
//                             <select
//                               value={newProject.siteManagerId}
//                               onChange={(e) => setNewProject({...newProject, siteManagerId: e.target.value})}
//                               className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             >
//                               <option value="">No site manager</option>
//                               {siteManagers.map((manager) => (
//                                 <option key={manager.id} value={manager.id}>
//                                   {manager.name} ({manager.projects_count || 0} projects)
//                                 </option>
//                               ))}
//                             </select>
//                           </div>
//                         </div>
//                       )}
//                     </div>

//                     <div className="flex gap-3 pt-6 border-t-2 border-gray-200">
//                       <button
//                         type="button"
//                         onClick={() => setShowCreateProject(false)}
//                         className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold"
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         type="submit"
//                         disabled={creatingProject || !newProject.title || !newProject.supervisorId}
//                         className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed font-bold"
//                       >
//                         {creatingProject ? 'Creating...' : 'Create Project'}
//                       </button>
//                     </div>
//                   </form>
//                 </div>
//               </div>
//             )}
//           </>
//         ) : (
//           <UserDashboardRoutes />
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserDashboard;