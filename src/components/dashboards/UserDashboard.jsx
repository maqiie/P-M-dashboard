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
  teamAPI
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
    const totalProjects = projects.length;
    const onTrack = projects.filter(p => p.schedule_status === 'on_track').length;
    const behindSchedule = projects.filter(p => p.schedule_status === 'behind_schedule').length;
    const aheadOfSchedule = projects.filter(p => p.schedule_status === 'ahead_of_schedule').length;
    
    const averageProgress = totalProjects > 0 
      ? projects.reduce((sum, p) => sum + (p.current_progress || p.progress_percentage || 0), 0) / totalProjects 
      : 0;
    
    const averageVariance = totalProjects > 0
      ? projects.reduce((sum, p) => sum + Math.abs(p.progress_variance || 0), 0) / totalProjects
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
                    <div className="text-xs text-gray-500">Total Projects</div>
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
    
    if (projects.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="relative">
            <Building2 className="mx-auto h-20 w-20 text-gray-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
          </div>
          <h3 className="mt-6 text-xl font-semibold text-gray-900">No projects found</h3>
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
        {projects.map((project) => (
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProgressUpdate(project.id);
                  }}
                  className="flex-1 py-2 px-3 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  Update Progress
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProjectClick(project.id);
                  }}
                  className="flex-1 py-2 px-3 text-xs bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  View Details
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
              {projectsWithProgress.length > 0 && renderProgressOverview()}

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