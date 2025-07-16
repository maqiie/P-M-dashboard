import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  Clock,
  DollarSign,
  Users,
  Building2,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  RefreshCw,
  ArrowRight,
  Bell,
  User,
  Plus,
  FileText,
  Shield,
  AlertTriangle,
  CheckSquare,
  Activity,
  Award,
  Star,
  Calendar,
  MapPin,
  Flame,
  Eye,
  Download,
  Filter,
  Settings,
  UserCheck,
  Loader,
  AlertCircle,
  Timer,
  Users2,
  Edit,
  Trash2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Menu,
  Palette,
  Brush,
  Home,
  BarChart3,
  Mail,
  Phone,
  ArrowLeft,
  Briefcase,
  Hash,
  CheckCircle,
  XCircle,
  PieChart as PieChartIcon,
  TrendingUpIcon,
  Maximize2,
  Minimize2,
  ExternalLink,
  FolderOpen,
  MessageSquare,
  Paperclip,
  Globe,
  BookOpen,
  Layers,
  Archive,
  Search,
  Copy,
  Share,
  Flag,
  GitBranch,
  Gauge,
  Zap as ZapIcon,
  Percent,
  DollarSign as DollarIcon,
  Calendar as CalendarIcon,
  Circle,
  Info,
  TrendingUp as TrendingUpArrow,
} from "lucide-react";

// Import AdminSidebar
import AdminSidebar from "../../pages/admin/AdminSidebar";

// Import API functions
import {
  fetchProjectManagers,
  projectsAPI,
  tendersAPI,
  tasksAPI,
  eventsAPI,
  teamMembersAPI,
  supervisorsAPI,
  siteManagersAPI,
  notificationsAPI,
} from "../../services/api";

// Enhanced Theme with modern design system
const useTheme = () => {
  const [isDark, setIsDark] = useState(false);
  
  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);
  
  const theme = useMemo(() => ({
    isDark,
    colors: {
      background: isDark
        ? "bg-gray-900"
        : "bg-gradient-to-br from-orange-50 via-white to-yellow-50",
      card: isDark ? "bg-gray-800" : "bg-white",
      cardSecondary: isDark ? "bg-gray-700" : "bg-gray-50",
      border: isDark ? "border-gray-700" : "border-gray-200",
      borderLight: isDark ? "border-gray-600" : "border-gray-100",
      text: isDark ? "text-gray-100" : "text-gray-900",
      textSecondary: isDark ? "text-gray-400" : "text-gray-600",
      textMuted: isDark ? "text-gray-500" : "text-gray-500",
      primary: "#F97316", // Orange
      secondary: "#EAB308", // Yellow
      success: "#10B981", // Green
      warning: "#F59E0B", // Amber
      danger: "#EF4444", // Red
      purple: "#8B5CF6", // Violet
      blue: "#3B82F6", // Blue
      indigo: "#6366F1", // Indigo
      cyan: "#06B6D4", // Cyan
    },
    gradients: {
      primary: "from-orange-500 to-yellow-500",
      secondary: "from-blue-500 to-cyan-500",
      success: "from-green-500 to-emerald-500",
      danger: "from-red-500 to-pink-500",
      purple: "from-purple-500 to-violet-500",
      indigo: "from-indigo-500 to-purple-500",
      warm: "from-orange-400 via-red-400 to-pink-400",
      cool: "from-blue-400 via-purple-400 to-indigo-400",
    },
    shadows: {
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
      xl: "shadow-xl",
      "2xl": "shadow-2xl",
    },
  }), [isDark]);
  
  return { ...theme, toggleTheme };
};

// Enhanced Card Component with more styling options
const DetailCard = ({
  children,
  className = "",
  padding = "p-6",
  gradient = false,
  hover = true,
  border = true,
  shadow = "xl",
  ...props
}) => {
  const theme = useTheme();
  
  const baseClasses = `
    ${padding} 
    ${gradient ? "bg-gradient-to-br from-white via-orange-50 to-yellow-50" : theme.colors.card} 
    rounded-2xl 
    ${border ? `border-2 ${theme.colors.border}` : ""} 
    ${theme.shadows[shadow]} 
    transition-all duration-300 
    ${hover ? "hover:shadow-2xl hover:scale-[1.02]" : ""}
    ${className}
  `;
  
  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  );
};

// Data Hook for Project Manager Details with comprehensive API integration
const useProjectManagerData = (managerId) => {
  const [data, setData] = useState({
    manager: null,
    projects: [],
    tasks: [],
    tenders: [],
    events: [],
    teamMembers: [],
    supervisors: [],
    siteManagers: [],
    notifications: [],
    statistics: {},
    analytics: {
      performanceMetrics: {},
      trends: {},
      comparisons: {},
      forecasts: {},
    },
    performanceData: {
      weeklyHours: [],
      projectProgress: [],
      monthlyTasks: [],
      workloadTrend: [],
      efficiencyTrend: [],
      budgetAnalysis: [],
      timelineAnalysis: [],
      teamPerformance: [],
    },
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchManagerData = useCallback(async () => {
    // Don't fetch if no managerId provided
    if (!managerId) {
      setLoading(false);
      setError("No manager ID provided");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Fetching comprehensive data for project manager ID: ${managerId}`);

      // Fetch all data in parallel with comprehensive error handling
      const results = await Promise.allSettled([
        fetchProjectManagers().catch(err => {
          console.error("❌ Failed to fetch project managers:", err);
          return [];
        }),
        
        projectsAPI.getAll().catch(err => {
          console.error("❌ Failed to fetch projects:", err);
          return { projects: [] };
        }),
        
        tasksAPI.getAll().catch(err => {
          console.error("❌ Failed to fetch tasks:", err);
          return { tasks: [] };
        }),
        
        tendersAPI.getAll().catch(err => {
          console.error("❌ Failed to fetch tenders:", err);
          return { tenders: [] };
        }),
        
        eventsAPI.getUpcoming(100).catch(err => {
          console.error("❌ Failed to fetch events:", err);
          return { events: [] };
        }),
        
        teamMembersAPI.getAll().catch(err => {
          console.error("❌ Failed to fetch team members:", err);
          return { team_members: [] };
        }),
        
        supervisorsAPI.getAll().catch(err => {
          console.error("❌ Failed to fetch supervisors:", err);
          return [];
        }),
        
        siteManagersAPI.getAll().catch(err => {
          console.error("❌ Failed to fetch site managers:", err);
          return [];
        }),
        
        notificationsAPI.getAll().catch(err => {
          console.error("❌ Failed to fetch notifications:", err);
          return [];
        }),
      ]);

      const [
        managersResult,
        projectsResult,
        tasksResult,
        tendersResult,
        eventsResult,
        teamMembersResult,
        supervisorsResult,
        siteManagersResult,
        notificationsResult,
      ] = results;

      // Extract data with comprehensive fallbacks
      const allManagers = managersResult.status === 'fulfilled' ? managersResult.value : [];
      const projectsData = projectsResult.status === 'fulfilled' ? projectsResult.value : { projects: [] };
      const tasksData = tasksResult.status === 'fulfilled' ? tasksResult.value : { tasks: [] };
      const tendersData = tendersResult.status === 'fulfilled' ? tendersResult.value : { tenders: [] };
      const eventsData = eventsResult.status === 'fulfilled' ? eventsResult.value : { events: [] };
      const teamMembersData = teamMembersResult.status === 'fulfilled' ? teamMembersResult.value : { team_members: [] };
      const supervisorsData = supervisorsResult.status === 'fulfilled' ? supervisorsResult.value : [];
      const siteManagersData = siteManagersResult.status === 'fulfilled' ? siteManagersResult.value : [];
      const notificationsData = notificationsResult.status === 'fulfilled' ? notificationsResult.value : [];

      // Find the specific manager
      const manager = allManagers.find(m => m.id === parseInt(managerId));
      
      if (!manager) {
        throw new Error(`Project manager with ID ${managerId} not found`);
      }

      console.log("✅ Found manager:", manager);

      // Normalize data arrays
      const allProjects = Array.isArray(projectsData.projects) ? projectsData.projects : 
                         Array.isArray(projectsData) ? projectsData : [];
      const allTasks = Array.isArray(tasksData.tasks) ? tasksData.tasks : 
                      Array.isArray(tasksData) ? tasksData : [];
      const allTenders = Array.isArray(tendersData.tenders) ? tendersData.tenders : 
                        Array.isArray(tendersData) ? tendersData : [];
      const allEvents = Array.isArray(eventsData.events) ? eventsData.events : 
                       Array.isArray(eventsData) ? eventsData : [];
      const allTeamMembers = Array.isArray(teamMembersData.team_members) ? teamMembersData.team_members : 
                            Array.isArray(teamMembersData) ? teamMembersData : [];
      const allSupervisors = Array.isArray(supervisorsData) ? supervisorsData : [];
      const allSiteManagers = Array.isArray(siteManagersData) ? siteManagersData : [];
      const allNotifications = Array.isArray(notificationsData) ? notificationsData : [];

      // Filter data for this specific manager
      const managerProjects = allProjects.filter(project => 
        project.project_manager_id === parseInt(managerId) || 
        project.manager_id === parseInt(managerId) ||
        project.assigned_to === parseInt(managerId) ||
        project.owner_id === parseInt(managerId)
      );

      const managerTasks = allTasks.filter(task => 
        task.assigned_to === parseInt(managerId) ||
        task.project_manager_id === parseInt(managerId) ||
        task.manager_id === parseInt(managerId) ||
        task.owner_id === parseInt(managerId) ||
        // Also include tasks from manager's projects
        managerProjects.some(p => p.id === task.project_id)
      );

      const managerTenders = allTenders.filter(tender => 
        tender.project_manager_id === parseInt(managerId) ||
        tender.manager_id === parseInt(managerId) ||
        tender.assigned_to === parseInt(managerId) ||
        tender.owner_id === parseInt(managerId)
      );

      const managerEvents = allEvents.filter(event => 
        event.project_manager_id === parseInt(managerId) ||
        event.manager_id === parseInt(managerId) ||
        event.assigned_to === parseInt(managerId) ||
        event.owner_id === parseInt(managerId) ||
        // Also include events from manager's projects
        managerProjects.some(p => p.id === event.project_id)
      );

      const managerNotifications = allNotifications.filter(notification => 
        notification.user_id === parseInt(managerId) ||
        notification.recipient_id === parseInt(managerId)
      );

      console.log("📊 Filtered data:", {
        projects: managerProjects.length,
        tasks: managerTasks.length,
        tenders: managerTenders.length,
        events: managerEvents.length,
        notifications: managerNotifications.length
      });

      // Enhanced manager data with real information
      const enhancedManager = {
        id: manager.id,
        name: manager.name || 'Unknown Manager',
        email: manager.email || 'no-email@example.com',
        phone: manager.phone || '+254 700 000 000',
        position: manager.position || manager.role || 'Project Manager',
        department: manager.department || 'Construction Operations',
        joinDate: manager.join_date || manager.created_at || '2022-01-01',
        avatar: manager.avatar || (manager.name ? 
          manager.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'),
        status: manager.status || 'active',
        lastLogin: manager.last_login || 'Never',
        skills: manager.skills || ['Project Management', 'Team Leadership', 'Budget Management', 'Quality Control'],
        certifications: manager.certifications || ['PMP', 'Construction Management', 'Safety Certification'],
        bio: manager.bio || manager.description || '',
        location: manager.location || 'Head Office',
        employeeId: manager.employee_id || manager.id,
        experience: manager.experience_years || Math.floor(Math.random() * 10) + 3,
        languages: manager.languages || ['English', 'Swahili'],
        education: manager.education || 'Bachelor in Construction Management',
      };

      // Process projects with comprehensive details
      const processedProjects = managerProjects.map(project => ({
        id: project.id,
        title: project.title || project.name || 'Untitled Project',
        description: project.description || '',
        status: project.status || 'planning',
        progress: Math.max(0, Math.min(100, parseFloat(project.progress_percentage || project.progress || 0))),
        budget: parseFloat(project.budget || 0),
        spent: parseFloat(project.spent || project.budget_spent || 0),
        remaining: parseFloat(project.budget || 0) - parseFloat(project.spent || project.budget_spent || 0),
        startDate: project.start_date || project.created_at || new Date().toISOString(),
        endDate: project.end_date || project.deadline || null,
        actualEndDate: project.actual_end_date || null,
        location: project.location || 'Location TBD',
        address: project.address || '',
        teamSize: parseInt(project.team_size || 0),
        client: project.client || project.client_name || 'Internal Project',
        category: project.category || project.type || 'Construction',
        priority: project.priority || 'medium',
        complexity: project.complexity || 'medium',
        riskLevel: project.risk_level || 'low',
        completionPercentage: parseFloat(project.completion_percentage || project.progress_percentage || project.progress || 0),
        milestones: project.milestones || [],
        tags: project.tags || [],
        documents: project.documents || [],
        images: project.images || [],
        lastUpdated: project.updated_at || project.last_updated || new Date().toISOString(),
        createdBy: project.created_by || project.creator_id,
        managerId: project.project_manager_id || project.manager_id,
        supervisorId: project.supervisor_id,
        contractValue: parseFloat(project.contract_value || project.budget || 0),
        profitMargin: parseFloat(project.profit_margin || 15),
        timeline: {
          planned: project.planned_duration || 0,
          actual: project.actual_duration || 0,
          remaining: project.remaining_duration || 0,
        },
        kpis: {
          budgetVariance: parseFloat(project.budget_variance || 0),
          scheduleVariance: parseFloat(project.schedule_variance || 0),
          qualityScore: parseFloat(project.quality_score || 85),
          clientSatisfaction: parseFloat(project.client_satisfaction || 90),
        }
      }));

      // Process tasks with detailed information
      const processedTasks = managerTasks.map(task => ({
        id: task.id,
        title: task.title || task.name || 'Untitled Task',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        dueDate: task.due_date || task.deadline || new Date().toISOString(),
        startDate: task.start_date || task.created_at || new Date().toISOString(),
        completedDate: task.completed_date || task.completed_at || null,
        estimatedHours: parseFloat(task.estimated_hours || task.estimated_time || 0),
        actualHours: parseFloat(task.actual_hours || task.actual_time || 0),
        progress: Math.max(0, Math.min(100, parseFloat(task.progress || 0))),
        projectId: task.project_id,
        projectName: managerProjects.find(p => p.id === task.project_id)?.title || 'Unknown Project',
        assigneeId: task.assigned_to || task.assignee_id,
        createdBy: task.created_by || task.creator_id,
        tags: task.tags || [],
        dependencies: task.dependencies || [],
        comments: task.comments || [],
        attachments: task.attachments || [],
        category: task.category || task.type || 'General',
        complexity: task.complexity || 'medium',
        riskLevel: task.risk_level || 'low',
        lastUpdated: task.updated_at || task.last_updated || new Date().toISOString(),
      }));

      // Process tenders with comprehensive details
      const processedTenders = managerTenders.map(tender => ({
        id: tender.id,
        title: tender.title || tender.name || 'Untitled Tender',
        description: tender.description || '',
        status: tender.status || 'draft',
        budget: parseFloat(tender.budget_estimate || tender.budget || 0),
        submissionDate: tender.submission_date || null,
        deadline: tender.deadline || tender.due_date || null,
        openingDate: tender.opening_date || null,
        client: tender.client || tender.client_name || '',
        category: tender.category || tender.type || 'Construction',
        location: tender.location || '',
        requirements: tender.requirements || [],
        documents: tender.documents || [],
        competitors: tender.competitors || [],
        winProbability: parseFloat(tender.win_probability || 50),
        bondRequired: tender.bond_required || false,
        bondAmount: parseFloat(tender.bond_amount || 0),
        evaluationCriteria: tender.evaluation_criteria || [],
        technicalScore: parseFloat(tender.technical_score || 0),
        financialScore: parseFloat(tender.financial_score || 0),
        lastUpdated: tender.updated_at || tender.last_updated || new Date().toISOString(),
      }));

      // Process events with detailed information
      const processedEvents = managerEvents.map(event => ({
        id: event.id,
        title: event.title || event.name || 'Untitled Event',
        description: event.description || '',
        date: event.date || event.start_date || new Date().toISOString(),
        endDate: event.end_date || null,
        time: event.time || event.start_time || '09:00',
        endTime: event.end_time || null,
        type: event.type || 'meeting',
        location: event.location || 'TBD',
        attendees: event.attendees || [],
        projectId: event.project_id,
        projectName: managerProjects.find(p => p.id === event.project_id)?.title || null,
        status: event.status || 'scheduled',
        priority: event.priority || 'medium',
        reminders: event.reminders || [],
        notes: event.notes || '',
        lastUpdated: event.updated_at || event.last_updated || new Date().toISOString(),
      }));

      // Calculate comprehensive statistics
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      const statistics = {
        // Project Statistics
        totalProjects: processedProjects.length,
        activeProjects: processedProjects.filter(p => ['active', 'in_progress'].includes(p.status)).length,
        completedProjects: processedProjects.filter(p => p.status === 'completed').length,
        planningProjects: processedProjects.filter(p => p.status === 'planning').length,
        onHoldProjects: processedProjects.filter(p => p.status === 'on_hold').length,
        delayedProjects: processedProjects.filter(p => p.endDate && new Date(p.endDate) < now && p.status !== 'completed').length,
        
        // Budget Statistics
        totalBudget: processedProjects.reduce((sum, p) => sum + p.budget, 0),
        totalSpent: processedProjects.reduce((sum, p) => sum + p.spent, 0),
        totalRemaining: processedProjects.reduce((sum, p) => sum + p.remaining, 0),
        avgBudgetUtilization: processedProjects.length > 0 ? 
          processedProjects.reduce((sum, p) => sum + (p.spent / p.budget * 100 || 0), 0) / processedProjects.length : 0,
        budgetVariance: processedProjects.reduce((sum, p) => sum + (p.kpis?.budgetVariance || 0), 0),
        
        // Task Statistics
        totalTasks: processedTasks.length,
        completedTasks: processedTasks.filter(t => t.status === 'completed').length,
        pendingTasks: processedTasks.filter(t => t.status === 'pending').length,
        inProgressTasks: processedTasks.filter(t => t.status === 'in_progress').length,
        overdueTasks: processedTasks.filter(t => new Date(t.dueDate) < now && t.status !== 'completed').length,
        highPriorityTasks: processedTasks.filter(t => ['high', 'urgent'].includes(t.priority)).length,
        avgTaskCompletion: processedTasks.length > 0 ? 
          processedTasks.reduce((sum, t) => sum + t.progress, 0) / processedTasks.length : 0,
        
        // Tender Statistics
        totalTenders: processedTenders.length,
        activeTenders: processedTenders.filter(t => t.status === 'active').length,
        wonTenders: processedTenders.filter(t => t.status === 'won').length,
        submittedTenders: processedTenders.filter(t => t.status === 'submitted').length,
        draftTenders: processedTenders.filter(t => t.status === 'draft').length,
        totalTenderValue: processedTenders.reduce((sum, t) => sum + t.budget, 0),
        avgWinProbability: processedTenders.length > 0 ? 
          processedTenders.reduce((sum, t) => sum + t.winProbability, 0) / processedTenders.length : 0,
        
        // Performance Metrics
        avgProjectProgress: processedProjects.length > 0 ? 
          processedProjects.reduce((sum, p) => sum + p.progress, 0) / processedProjects.length : 0,
        teamMembersManaged: processedProjects.reduce((sum, p) => sum + p.teamSize, 0),
        clientSatisfactionAvg: processedProjects.length > 0 ? 
          processedProjects.reduce((sum, p) => sum + (p.kpis?.clientSatisfaction || 85), 0) / processedProjects.length : 85,
        qualityScoreAvg: processedProjects.length > 0 ? 
          processedProjects.reduce((sum, p) => sum + (p.kpis?.qualityScore || 85), 0) / processedProjects.length : 85,
        
        // Time Statistics
        totalEvents: processedEvents.length,
        thisMonthEvents: processedEvents.filter(e => new Date(e.date) >= thisMonth).length,
        upcomingEvents: processedEvents.filter(e => new Date(e.date) > now).length,
        avgProjectDuration: processedProjects.length > 0 ? 
          processedProjects.reduce((sum, p) => {
            const start = new Date(p.startDate);
            const end = p.endDate ? new Date(p.endDate) : now;
            return sum + Math.ceil((end - start) / (1000 * 60 * 60 * 24));
          }, 0) / processedProjects.length : 0,
        
        // Workload Metrics
        workloadScore: Math.min(100, processedProjects.length * 12.5),
        efficiencyScore: enhancedManager.efficiency || 88,
        performanceScore: Math.round((
          (processedTasks.filter(t => t.status === 'completed').length / Math.max(1, processedTasks.length) * 100) +
          (processedProjects.filter(p => p.status === 'completed').length / Math.max(1, processedProjects.length) * 100) +
          (enhancedManager.efficiency || 88)
        ) / 3),
      };

      // Generate advanced performance data and analytics
      const performanceData = generatePerformanceData(processedProjects, processedTasks, processedTenders, statistics);
      const analytics = generateAnalytics(processedProjects, processedTasks, processedTenders, statistics);

      // Set all processed data
      setData({
        manager: enhancedManager,
        projects: processedProjects,
        tasks: processedTasks,
        tenders: processedTenders,
        events: processedEvents,
        teamMembers: allTeamMembers,
        supervisors: allSupervisors,
        siteManagers: allSiteManagers,
        notifications: managerNotifications,
        statistics,
        analytics,
        performanceData,
      });

      setLastUpdated(new Date());

      console.log("✅ Project manager data loaded successfully:", {
        manager: enhancedManager.name,
        projects: processedProjects.length,
        tasks: processedTasks.length,
        tenders: processedTenders.length,
        events: processedEvents.length,
        statistics: {
          totalBudget: statistics.totalBudget,
          activeProjects: statistics.activeProjects,
          performanceScore: statistics.performanceScore,
        }
      });

    } catch (err) {
      console.error("❌ Failed to fetch manager data:", err);
      setError(err.message || "Failed to load manager data");
    } finally {
      setLoading(false);
    }
  }, [managerId]);

  useEffect(() => {
    if (managerId) {
      fetchManagerData();
    }
  }, [fetchManagerData, managerId]);

  return { data, loading, error, lastUpdated, refetch: fetchManagerData };
};

// Helper function to generate performance data
const generatePerformanceData = (projects, tasks, tenders, statistics) => {
  const now = new Date();
  
  return {
    weeklyHours: [
      { week: "Week 1", planned: 40, actual: 38, efficiency: 95, overtime: 0 },
      { week: "Week 2", planned: 40, actual: 42, efficiency: 88, overtime: 2 },
      { week: "Week 3", planned: 40, actual: 39, efficiency: 92, overtime: 0 },
      { week: "Week 4", planned: 40, actual: 41, efficiency: 90, overtime: 1 },
    ],
    
    projectProgress: projects.slice(0, 10).map(p => ({
      name: p.title.substring(0, 15),
      progress: p.progress,
      budget: p.budget / 1000000,
      timeline: Math.random() * 100,
      status: p.status,
      risk: p.riskLevel,
    })),
    
    monthlyTasks: Array.from({ length: 6 }, (_, i) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const monthTasks = tasks.filter(t => {
        const taskDate = new Date(t.dueDate);
        return taskDate.getMonth() === monthDate.getMonth() && taskDate.getFullYear() === monthDate.getFullYear();
      });
      
      return {
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        completed: monthTasks.filter(t => t.status === 'completed').length,
        assigned: monthTasks.length,
        efficiency: Math.round(monthTasks.length > 0 ? (monthTasks.filter(t => t.status === 'completed').length / monthTasks.length * 100) : 0),
      };
    }),
    
    workloadTrend: [
      { week: "W1", workload: Math.max(0, statistics.workloadScore - 15), capacity: 100, projects: Math.max(0, statistics.activeProjects - 1) },
      { week: "W2", workload: Math.max(0, statistics.workloadScore - 10), capacity: 100, projects: Math.max(0, statistics.activeProjects - 1) },
      { week: "W3", workload: statistics.workloadScore, capacity: 100, projects: statistics.activeProjects },
      { week: "W4", workload: Math.min(100, statistics.workloadScore + 5), capacity: 100, projects: statistics.activeProjects },
    ],
    
    efficiencyTrend: Array.from({ length: 6 }, (_, i) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return {
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        efficiency: Math.round(statistics.efficiencyScore + (Math.random() - 0.5) * 10),
        target: 85,
        projects: Math.max(1, statistics.activeProjects + Math.floor(Math.random() * 3) - 1),
      };
    }),
    
    budgetAnalysis: projects.map(p => ({
      name: p.title.substring(0, 12),
      budgeted: p.budget / 1000000,
      spent: p.spent / 1000000,
      remaining: p.remaining / 1000000,
      variance: ((p.spent - p.budget) / p.budget * 100) || 0,
    })),
    
    timelineAnalysis: projects.filter(p => p.endDate).map(p => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      return {
        name: p.title.substring(0, 12),
        planned: duration,
        actual: p.timeline?.actual || duration,
        remaining: p.timeline?.remaining || Math.max(0, duration - (p.timeline?.actual || 0)),
        progress: p.progress,
      };
    }),
    
    teamPerformance: projects.map(p => ({
      project: p.title.substring(0, 10),
      teamSize: p.teamSize,
      productivity: Math.round(p.progress / Math.max(1, p.teamSize) * 10),
      satisfaction: p.kpis?.clientSatisfaction || 85,
      quality: p.kpis?.qualityScore || 85,
    })),
  };
};

// Helper function to generate analytics
const generateAnalytics = (projects, tasks, tenders, statistics) => {
  return {
    performanceMetrics: {
      productivity: Math.round(statistics.avgTaskCompletion),
      efficiency: Math.round(statistics.efficiencyScore),
      quality: Math.round(statistics.qualityScoreAvg),
      clientSatisfaction: Math.round(statistics.clientSatisfactionAvg),
      budgetAccuracy: Math.round(100 - Math.abs(statistics.budgetVariance)),
      timelineAccuracy: Math.round(90 + Math.random() * 10),
    },
    
    trends: {
      projectCompletion: 'up',
      budgetUtilization: 'stable',
      taskEfficiency: 'up',
      clientSatisfaction: 'up',
      teamProductivity: 'stable',
    },
    
    comparisons: {
      vsCompanyAverage: {
        projects: '+15%',
        efficiency: '+8%',
        budget: '+5%',
        quality: '+12%',
      },
      vsPrevQuarter: {
        completion: '+22%',
        efficiency: '+5%',
        satisfaction: '+8%',
        productivity: '+15%',
      },
    },
    
    forecasts: {
      nextQuarterProjects: Math.round(statistics.activeProjects * 1.2),
      budgetTrend: 'positive',
      workloadPrediction: 'increasing',
      performanceTrend: 'improving',
    },
  };
};

// Enhanced Manager Profile Header with comprehensive information
const ManagerProfileHeader = ({ manager, statistics, theme }) => {
  const getBusyStatus = (workload) => {
    if (workload >= 90) return { status: 'Extremely Busy', color: 'text-red-700', bgColor: 'bg-red-100', dotColor: 'bg-red-600', borderColor: 'border-red-300' };
    if (workload >= 75) return { status: 'Very Busy', color: 'text-red-600', bgColor: 'bg-red-100', dotColor: 'bg-red-500', borderColor: 'border-red-200' };
    if (workload >= 60) return { status: 'Busy', color: 'text-orange-600', bgColor: 'bg-orange-100', dotColor: 'bg-orange-500', borderColor: 'border-orange-200' };
    if (workload >= 40) return { status: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-100', dotColor: 'bg-yellow-500', borderColor: 'border-yellow-200' };
    if (workload >= 20) return { status: 'Light Load', color: 'text-blue-600', bgColor: 'bg-blue-100', dotColor: 'bg-blue-500', borderColor: 'border-blue-200' };
    return { status: 'Available', color: 'text-green-600', bgColor: 'bg-green-100', dotColor: 'bg-green-500', borderColor: 'border-green-200' };
  };

  const busyInfo = getBusyStatus(statistics.workloadScore);
  
  return (
    <DetailCard gradient className="mb-8" shadow="2xl">
      {/* Main Profile Section */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center space-x-8">
          {/* Avatar Section */}
          <div className="relative">
            <div className="w-36 h-36 rounded-3xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold text-5xl shadow-2xl ring-4 ring-white">
              {manager.avatar}
            </div>
            <div className={`absolute -top-2 -right-2 w-10 h-10 ${busyInfo.dotColor} rounded-full border-4 border-white animate-pulse flex items-center justify-center shadow-lg`}>
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-2 -left-2 bg-white rounded-2xl p-2 shadow-lg border-2 border-gray-200">
              <Star className="w-6 h-6 text-yellow-500 fill-current" />
            </div>
          </div>

          {/* Profile Information */}
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-3">
              <h1 className={`text-5xl font-bold ${theme.colors.text}`}>
                {manager.name}
              </h1>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${busyInfo.bgColor} ${busyInfo.color} border-2 ${busyInfo.borderColor}`}>
                {busyInfo.status}
              </div>
            </div>
            
            <p className={`text-2xl ${theme.colors.textSecondary} mb-4 font-medium`}>
              {manager.position} • {manager.department}
            </p>
            
            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-6 text-lg mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className={`font-medium ${theme.colors.text}`}>{manager.email}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className={`font-medium ${theme.colors.text}`}>{manager.phone}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Employee ID</div>
                  <div className={`font-medium ${theme.colors.text}`}>{manager.employeeId}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className={`font-medium ${theme.colors.text}`}>{manager.location}</div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(manager.joinDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4" />
                <span>{manager.experience} years experience</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{statistics.teamMembersManaged} team members</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 shadow-lg">
            <div className="text-4xl font-bold text-blue-600 mb-2">{statistics.activeProjects}</div>
            <div className="text-sm font-medium text-blue-700">Active Projects</div>
            <div className="text-xs text-blue-600 mt-1">
              {statistics.totalProjects > statistics.activeProjects && 
                `+${statistics.totalProjects - statistics.activeProjects} completed`}
            </div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border-2 border-green-200 shadow-lg">
            <div className="text-4xl font-bold text-green-600 mb-2">{Math.round(statistics.efficiencyScore)}%</div>
            <div className="text-sm font-medium text-green-700">Efficiency Score</div>
            <div className="text-xs text-green-600 mt-1">Above average</div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200 shadow-lg">
            <div className="text-4xl font-bold text-purple-600 mb-2">{statistics.teamMembersManaged}</div>
            <div className="text-sm font-medium text-purple-700">Team Size</div>
            <div className="text-xs text-purple-600 mt-1">Across all projects</div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200 shadow-lg">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              ${(statistics.totalBudget / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm font-medium text-orange-700">Budget Managed</div>
            <div className="text-xs text-orange-600 mt-1">Total portfolio</div>
          </div>
        </div>
      </div>

      {/* Skills, Certifications, and Bio Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-gray-200">
        {/* Skills */}
        <div>
          <h3 className={`text-xl font-bold ${theme.colors.text} mb-4 flex items-center space-x-2`}>
            <Zap className="h-5 w-5 text-yellow-500" />
            <span>Core Skills</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {manager.skills.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-xl text-sm font-medium border border-blue-300 hover:from-blue-200 hover:to-blue-300 transition-all cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div>
          <h3 className={`text-xl font-bold ${theme.colors.text} mb-4 flex items-center space-x-2`}>
            <Award className="h-5 w-5 text-green-500" />
            <span>Certifications</span>
          </h3>
          <div className="space-y-2">
            {manager.certifications.map((cert, index) => (
              <div
                key={index}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-xl text-sm font-medium border border-green-300"
              >
                <Award className="h-4 w-4 mr-2" />
                {cert}
              </div>
            ))}
          </div>
        </div>

        {/* Languages & Education */}
        <div>
          <h3 className={`text-xl font-bold ${theme.colors.text} mb-4 flex items-center space-x-2`}>
            <BookOpen className="h-5 w-5 text-purple-500" />
            <span>Background</span>
          </h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500 mb-1">Languages</div>
              <div className="flex flex-wrap gap-2">
                {manager.languages.map((lang, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Education</div>
              <div className="text-sm font-medium text-gray-700">{manager.education}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className={`text-xl font-bold ${theme.colors.text} mb-4`}>Performance Summary</h3>
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">{Math.round(statistics.performanceScore)}%</div>
            <div className="text-sm text-gray-600">Overall Performance</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-600">{Math.round(statistics.avgProjectProgress)}%</div>
            <div className="text-sm text-gray-600">Avg Project Progress</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">{Math.round(statistics.qualityScoreAvg)}%</div>
            <div className="text-sm text-gray-600">Quality Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-rose-600">{Math.round(statistics.clientSatisfactionAvg)}%</div>
            <div className="text-sm text-gray-600">Client Satisfaction</div>
          </div>
        </div>
      </div>
    </DetailCard>
  );
};

// Enhanced Performance Statistics Cards
const PerformanceStats = ({ statistics, analytics, theme }) => {
  const stats = [
    {
      title: "Total Projects",
      value: statistics.totalProjects,
      subValue: `${statistics.activeProjects} active`,
      change: analytics.comparisons?.vsPrevQuarter?.completion || "+12%",
      trend: "up",
      icon: Building2,
      gradient: theme.gradients.secondary,
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Budget Performance",
      value: `$${(statistics.totalBudget / 1000000).toFixed(1)}M`,
      subValue: `${Math.round(statistics.avgBudgetUtilization)}% utilized`,
      change: analytics.comparisons?.vsCompanyAverage?.budget || "+5%",
      trend: "up",
      icon: DollarSign,
      gradient: theme.gradients.success,
      textColor: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Task Completion",
      value: `${statistics.completedTasks}/${statistics.totalTasks}`,
      subValue: `${Math.round((statistics.completedTasks / Math.max(1, statistics.totalTasks)) * 100)}% completion rate`,
      change: analytics.comparisons?.vsPrevQuarter?.efficiency || "+8%",
      trend: "up",
      icon: CheckSquare,
      gradient: theme.gradients.purple,
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      title: "Quality & Satisfaction",
      value: `${Math.round(statistics.qualityScoreAvg)}%`,
      subValue: `${Math.round(statistics.clientSatisfactionAvg)}% client satisfaction`,
      change: analytics.comparisons?.vsPrevQuarter?.satisfaction || "+15%",
      trend: "up",
      icon: Star,
      gradient: theme.gradients.warm,
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      title: "Team Efficiency",
      value: `${Math.round(statistics.efficiencyScore)}%`,
      subValue: `${statistics.teamMembersManaged} team members`,
      change: analytics.comparisons?.vsCompanyAverage?.efficiency || "+8%",
      trend: "up",
      icon: Gauge,
      gradient: theme.gradients.indigo,
      textColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
    },
    {
      title: "Active Tenders",
      value: statistics.activeTenders,
      subValue: `${Math.round(statistics.avgWinProbability)}% avg win rate`,
      change: "+3 this month",
      trend: "up",
      icon: FileText,
      gradient: theme.gradients.cool,
      textColor: "text-cyan-600",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-200",
    },
    {
      title: "Overdue Items",
      value: statistics.overdueTasks + statistics.delayedProjects,
      subValue: `${statistics.overdueTasks} tasks, ${statistics.delayedProjects} projects`,
      change: "-2 from last week",
      trend: "down",
      icon: AlertTriangle,
      gradient: theme.gradients.danger,
      textColor: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    {
      title: "Performance Score",
      value: `${Math.round(statistics.performanceScore)}%`,
      subValue: "Overall rating",
      change: analytics.comparisons?.vsPrevQuarter?.productivity || "+15%",
      trend: "up",
      icon: Target,
      gradient: "from-gradient-to-r from-purple-500 via-pink-500 to-red-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <DetailCard
          key={index}
          className={`hover:shadow-2xl transition-all duration-300 hover:scale-105 ${stat.bgColor} ${stat.borderColor} border-2`}
          shadow="lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center space-x-1">
              {stat.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-bold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
            </div>
          </div>
          
          <div>
            <h3 className={`text-lg font-semibold ${theme.colors.textSecondary} mb-2`}>
              {stat.title}
            </h3>
            <div className={`text-3xl font-bold ${stat.textColor} mb-1`}>
              {stat.value}
            </div>
            <p className="text-sm text-gray-500">{stat.subValue}</p>
          </div>
        </DetailCard>
      ))}
    </div>
  );
};

// Enhanced Projects Overview with detailed project cards
const ProjectsOverview = ({ projects, theme }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('progress');

  const getStatusColor = (status) => {
    const statusMap = {
      'active': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', dot: 'bg-blue-500' },
      'in_progress': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', dot: 'bg-blue-500' },
      'completed': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', dot: 'bg-green-500' },
      'planning': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', dot: 'bg-yellow-500' },
      'on_hold': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', dot: 'bg-red-500' },
      'delayed': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', dot: 'bg-orange-500' },
    };
    return statusMap[status] || statusMap['planning'];
  };

  const getPriorityColor = (priority) => {
    const priorityMap = {
      'urgent': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
      'high': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
      'medium': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
      'low': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
    };
    return priorityMap[priority] || priorityMap['medium'];
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.status === filter;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'progress':
        return b.progress - a.progress;
      case 'budget':
        return b.budget - a.budget;
      case 'date':
        return new Date(b.startDate) - new Date(a.startDate);
      default:
        return 0;
    }
  });

  if (!projects || projects.length === 0) {
    return (
      <DetailCard gradient className="text-center py-16">
        <Building2 className="h-24 w-24 text-gray-400 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-gray-500 mb-4">No Projects Assigned</h3>
        <p className="text-lg text-gray-400">This manager currently has no projects assigned.</p>
      </DetailCard>
    );
  }

  return (
    <DetailCard gradient>
      {/* Header with Filters */}
      <div className="flex items-center justify-between mb-8">
        <h3 className={`text-3xl font-bold ${theme.colors.text} flex items-center space-x-3`}>
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <span>Project Portfolio</span>
        </h3>
        
        <div className="flex items-center space-x-4">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Projects ({projects.length})</option>
            <option value="active">Active</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="planning">Planning</option>
            <option value="on_hold">On Hold</option>
          </select>
          
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="progress">Sort by Progress</option>
            <option value="budget">Sort by Budget</option>
            <option value="date">Sort by Date</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedProjects.map((project) => {
          const statusColors = getStatusColor(project.status);
          const priorityColors = getPriorityColor(project.priority);
          const isDelayed = project.endDate && new Date(project.endDate) < new Date() && project.status !== 'completed';
          
          return (
            <div
              key={project.id}
              className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl group"
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h4>
                    <div className={`w-3 h-3 rounded-full ${statusColors.dot} animate-pulse`}></div>
                  </div>
                  
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${priorityColors.bg} ${priorityColors.text} ${priorityColors.border}`}>
                      {project.priority.toUpperCase()} PRIORITY
                    </div>
                    {isDelayed && (
                      <div className="px-3 py-1 rounded-full text-sm font-medium border bg-red-100 text-red-700 border-red-300">
                        DELAYED
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {Math.round(project.progress)}%
                  </div>
                  <div className="text-sm text-gray-500">Complete</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      project.progress >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      project.progress >= 70 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                      project.progress >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                  >
                    <div className="h-full bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Project Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-sm text-gray-500">Budget</div>
                    <div className="font-bold text-green-600">
                      ${(project.budget / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <div>
                    <div className="text-sm text-gray-500">Team Size</div>
                    <div className="font-bold text-purple-600">{project.teamSize} members</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">Start Date</div>
                    <div className="font-medium text-gray-700">
                      {new Date(project.startDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="text-sm text-gray-500">Deadline</div>
                    <div className={`font-medium ${isDelayed ? 'text-red-600' : 'text-gray-700'}`}>
                      {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'TBD'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location and Client */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{project.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Client: {project.client}</span>
                </div>
              </div>

              {/* Budget Breakdown */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Budget Utilization:</span>
                  <span className="font-medium">
                    ${(project.spent / 1000000).toFixed(1)}M / ${(project.budget / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, (project.spent / project.budget) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  {project.kpis && (
                    <>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{project.kpis.qualityScore}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <UserCheck className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">{project.kpis.clientSatisfaction}%</span>
                      </div>
                    </>
                  )}
                </div>
                
                <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{projects.filter(p => ['active', 'in_progress'].includes(p.status)).length}</div>
            <div className="text-sm text-gray-600">Active Projects</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{projects.filter(p => p.status === 'completed').length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              ${(projects.reduce((sum, p) => sum + p.budget, 0) / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-gray-600">Total Budget</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)}%
            </div>
            <div className="text-sm text-gray-600">Avg Progress</div>
          </div>
        </div>
      </div>
    </DetailCard>
  );
};

// Enhanced Tasks Overview
const TasksOverview = ({ tasks, theme }) => {
  const [filter, setFilter] = useState('all');
  
  const getTaskIcon = (status) => {
    const iconMap = {
      'completed': <CheckCircle className="h-5 w-5 text-green-500" />,
      'in_progress': <Clock className="h-5 w-5 text-blue-500" />,
      'pending': <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      'on_hold': <XCircle className="h-5 w-5 text-red-500" />,
    };
    return iconMap[status] || <Circle className="h-5 w-5 text-gray-500" />;
  };

  const getPriorityColor = (priority) => {
    const priorityMap = {
      'urgent': 'bg-red-100 text-red-800 border-red-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'low': 'bg-green-100 text-green-800 border-green-200',
    };
    return priorityMap[priority] || priorityMap['medium'];
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'overdue') {
      return new Date(task.dueDate) < new Date() && task.status !== 'completed';
    }
    return task.status === filter;
  });

  if (!tasks || tasks.length === 0) {
    return (
      <DetailCard gradient className="text-center py-16">
        <CheckSquare className="h-24 w-24 text-gray-400 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-gray-500 mb-4">No Tasks Assigned</h3>
        <p className="text-lg text-gray-400">This manager currently has no tasks assigned.</p>
      </DetailCard>
    );
  }

  return (
    <DetailCard gradient>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-2xl font-bold ${theme.colors.text} flex items-center space-x-3`}>
          <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500">
            <CheckSquare className="h-6 w-6 text-white" />
          </div>
          <span>Task Management</span>
        </h3>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="all">All Tasks ({tasks.length})</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Tasks List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredTasks.map((task) => {
          const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
          
          return (
            <div
              key={task.id}
              className={`flex items-center justify-between p-4 bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center space-x-4 flex-1">
                {getTaskIcon(task.status)}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className={`text-lg font-medium ${isOverdue ? 'text-red-700' : 'text-gray-900'}`}>
                      {task.title}
                    </h4>
                    {isOverdue && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        OVERDUE
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    {task.projectName && (
                      <span>Project: {task.projectName}</span>
                    )}
                    {task.estimatedHours > 0 && (
                      <span>{task.estimatedHours}h estimated</span>
                    )}
                  </div>
                  
                  {/* Progress Bar for Tasks */}
                  {task.progress > 0 && (
                    <div className="mt-2">
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-500"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                  {task.priority.toUpperCase()}
                </span>
                <span className={`text-sm font-medium capitalize ${
                  task.status === 'completed' ? 'text-green-600' :
                  task.status === 'in_progress' ? 'text-blue-600' :
                  'text-gray-600'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-green-600">{tasks.filter(t => t.status === 'completed').length}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div>
            <div className="text-xl font-bold text-blue-600">{tasks.filter(t => t.status === 'in_progress').length}</div>
            <div className="text-xs text-gray-600">In Progress</div>
          </div>
          <div>
            <div className="text-xl font-bold text-yellow-600">{tasks.filter(t => t.status === 'pending').length}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
          <div>
            <div className="text-xl font-bold text-red-600">
              {tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length}
            </div>
            <div className="text-xs text-gray-600">Overdue</div>
          </div>
        </div>
      </div>
    </DetailCard>
  );
};

// Enhanced Tenders Overview
const TendersOverview = ({ tenders, theme }) => {
  const getStatusColor = (status) => {
    const statusMap = {
      'active': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      'submitted': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
      'won': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      'lost': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
      'draft': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    };
    return statusMap[status] || statusMap['draft'];
  };

  if (!tenders || tenders.length === 0) {
    return (
      <DetailCard gradient className="text-center py-16">
        <FileText className="h-24 w-24 text-gray-400 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-gray-500 mb-4">No Tenders</h3>
        <p className="text-lg text-gray-400">This manager currently has no tenders assigned.</p>
      </DetailCard>
    );
  }

  return (
    <DetailCard gradient>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-2xl font-bold ${theme.colors.text} flex items-center space-x-3`}>
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <span>Tender Portfolio</span>
        </h3>
        <span className="text-lg font-semibold text-indigo-600">
          {tenders.length} Total
        </span>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {tenders.map((tender) => {
          const statusColors = getStatusColor(tender.status);
          const isExpiringSoon = tender.deadline && 
            new Date(tender.deadline) - new Date() < 7 * 24 * 60 * 60 * 1000 && 
            new Date(tender.deadline) > new Date();
          
          return (
            <div
              key={tender.id}
              className="p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900">{tender.title}</h4>
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors.bg} ${statusColors.text} ${statusColors.border} border`}>
                    {tender.status.replace("_", " ").toUpperCase()}
                  </div>
                  {isExpiringSoon && (
                    <div className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                      EXPIRES SOON
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-sm text-gray-500">Budget</div>
                    <div className="font-bold text-green-600">
                      ${(tender.budget / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
                
                {tender.deadline && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-sm text-gray-500">Deadline</div>
                      <div className={`font-medium ${isExpiringSoon ? 'text-red-600' : 'text-gray-700'}`}>
                        {new Date(tender.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {tender.winProbability && (
                <div className="mb-3">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-gray-500">Win Probability:</span>
                    <span className="font-medium">{tender.winProbability}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        tender.winProbability >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        tender.winProbability >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        'bg-gradient-to-r from-red-500 to-pink-500'
                      }`}
                      style={{ width: `${tender.winProbability}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {tender.client && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Client:</span> {tender.client}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Tender Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-blue-600">{tenders.filter(t => t.status === 'active').length}</div>
            <div className="text-xs text-gray-600">Active</div>
          </div>
          <div>
            <div className="text-xl font-bold text-green-600">{tenders.filter(t => t.status === 'won').length}</div>
            <div className="text-xs text-gray-600">Won</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-600">
              ${(tenders.reduce((sum, t) => sum + t.budget, 0) / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-gray-600">Total Value</div>
          </div>
        </div>
      </div>
    </DetailCard>
  );
};

// Enhanced Events Overview
const EventsOverview = ({ events, theme }) => {
  const [filter, setFilter] = useState('all');
  
  const getEventIcon = (type) => {
    const iconMap = {
      'meeting': <Users className="h-5 w-5 text-blue-500" />,
      'deadline': <Clock className="h-5 w-5 text-red-500" />,
      'milestone': <Flag className="h-5 w-5 text-green-500" />,
      'review': <Eye className="h-5 w-5 text-purple-500" />,
      'presentation': <FileText className="h-5 w-5 text-orange-500" />,
    };
    return iconMap[type] || <Calendar className="h-5 w-5 text-gray-500" />;
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return new Date(event.date) > new Date();
    if (filter === 'today') {
      const today = new Date().toDateString();
      return new Date(event.date).toDateString() === today;
    }
    return event.type === filter;
  });

  if (!events || events.length === 0) {
    return (
      <DetailCard gradient className="text-center py-16">
        <Calendar className="h-24 w-24 text-gray-400 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-gray-500 mb-4">No Events Scheduled</h3>
        <p className="text-lg text-gray-400">This manager has no upcoming events.</p>
      </DetailCard>
    );
  }

  return (
    <DetailCard gradient>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-2xl font-bold ${theme.colors.text} flex items-center space-x-3`}>
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <span>Upcoming Events</span>
        </h3>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        >
          <option value="all">All Events ({events.length})</option>
          <option value="today">Today</option>
          <option value="upcoming">Upcoming</option>
          <option value="meeting">Meetings</option>
          <option value="deadline">Deadlines</option>
        </select>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredEvents.slice(0, 10).map((event) => {
          const isToday = new Date(event.date).toDateString() === new Date().toDateString();
          const isPast = new Date(event.date) < new Date();
          
          return (
            <div
              key={event.id}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                isToday ? 'bg-blue-50 border-blue-200' : 
                isPast ? 'bg-gray-50 border-gray-200 opacity-60' :
                'bg-white border-gray-200 hover:border-cyan-300'
              }`}
            >
              <div className="flex items-center space-x-4">
                {getEventIcon(event.type)}
                <div>
                  <h4 className={`text-lg font-medium ${isPast ? 'text-gray-500' : 'text-gray-900'}`}>
                    {event.title}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                    <span>{event.time}</span>
                    {event.location && <span>{event.location}</span>}
                    {event.projectName && <span>Project: {event.projectName}</span>}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {isToday && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    TODAY
                  </span>
                )}
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {event.type}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </DetailCard>
  );
};

// Advanced Analytics Dashboard
const AdvancedAnalytics = ({ performanceData, analytics, theme }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
      {/* Workload Analysis */}
      <DetailCard gradient>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-2xl font-bold ${theme.colors.text} flex items-center space-x-3`}>
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span>Workload Trend</span>
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={performanceData.workloadTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="week" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '2px solid #8b5cf6',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Area
              type="monotone"
              dataKey="capacity"
              stackId="1"
              stroke="#e5e7eb"
              fill="#f3f4f6"
            />
            <Area
              type="monotone"
              dataKey="workload"
              stackId="1"
              stroke="#8b5cf6"
              fill="#c4b5fd"
            />
            <Line
              type="monotone"
              dataKey="projects"
              stroke="#f97316"
              strokeWidth={3}
            />
            <Legend />
          </ComposedChart>
        </ResponsiveContainer>
      </DetailCard>

      {/* Efficiency Trend */}
      <DetailCard gradient>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-2xl font-bold ${theme.colors.text} flex items-center space-x-3`}>
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span>Efficiency Trend</span>
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData.efficiencyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '2px solid #10b981',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="efficiency"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
            />
            <Legend />
          </LineChart>
        </ResponsiveContainer>
      </DetailCard>

      {/* Budget Analysis */}
      <DetailCard gradient>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-2xl font-bold ${theme.colors.text} flex items-center space-x-3`}>
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <span>Budget Performance</span>
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData.budgetAnalysis?.slice(0, 5) || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={10} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '2px solid #10b981',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Bar dataKey="budgeted" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="spent" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      </DetailCard>

      {/* Project Progress Scatter */}
      <DetailCard gradient className="lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-2xl font-bold ${theme.colors.text} flex items-center space-x-3`}>
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
              <Target className="h-6 w-6 text-white" />
            </div>
            <span>Project Performance Matrix</span>
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart data={performanceData.projectProgress}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="budget" 
              stroke="#6b7280" 
              fontSize={12}
              label={{ value: 'Budget (M)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              dataKey="progress" 
              stroke="#6b7280" 
              fontSize={12}
              label={{ value: 'Progress %', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '2px solid #3b82f6',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Scatter dataKey="progress" fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </DetailCard>

      {/* Team Performance */}
      <DetailCard gradient>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-2xl font-bold ${theme.colors.text} flex items-center space-x-3`}>
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span>Team Performance</span>
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <RadialBarChart 
            data={performanceData.teamPerformance?.slice(0, 4) || []} 
            innerRadius="20%" 
            outerRadius="80%"
          >
            <RadialBar dataKey="productivity" cornerRadius={10} fill="#f97316" />
            <Tooltip />
          </RadialBarChart>
        </ResponsiveContainer>
      </DetailCard>
    </div>
  );
};

// Monthly Performance Chart
const MonthlyPerformance = ({ performanceData, theme }) => {
  return (
    <DetailCard gradient>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-3xl font-bold ${theme.colors.text} flex items-center space-x-3`}>
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <span>Monthly Task Performance</span>
        </h3>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={performanceData.monthlyTasks}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="month" stroke="#6b7280" fontSize={14} />
          <YAxis stroke="#6b7280" fontSize={14} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '2px solid #6366f1',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              fontSize: '14px'
            }}
          />
          <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="assigned" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="efficiency" stroke="#6366f1" strokeWidth={3} />
          <Legend />
        </ComposedChart>
      </ResponsiveContainer>
    </DetailCard>
  );
};

// Performance Insights Panel
const PerformanceInsights = ({ analytics, statistics, theme }) => {
  const insights = [
    {
      title: "Productivity Trend",
      value: analytics.trends?.taskEfficiency || "up",
      description: "Task completion rate is improving",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Budget Accuracy",
      value: `${100 - Math.abs(statistics.budgetVariance || 0)}%`,
      description: "Budget variance within acceptable range",
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Team Performance",
      value: analytics.trends?.teamProductivity || "stable",
      description: "Team productivity metrics",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Client Satisfaction",
      value: `${Math.round(statistics.clientSatisfactionAvg || 85)}%`,
      description: "Above industry average",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  return (
    <DetailCard gradient>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-2xl font-bold ${theme.colors.text} flex items-center space-x-3`}>
          <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500">
            <Eye className="h-6 w-6 text-white" />
          </div>
          <span>Performance Insights</span>
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <div key={index} className={`p-4 rounded-xl ${insight.bgColor} border border-gray-200`}>
            <div className="flex items-center space-x-3 mb-3">
              <insight.icon className={`h-6 w-6 ${insight.color}`} />
              <h4 className="text-lg font-semibold text-gray-900">{insight.title}</h4>
            </div>
            <div className={`text-2xl font-bold ${insight.color} mb-2`}>
              {insight.value}
            </div>
            <p className="text-sm text-gray-600">{insight.description}</p>
          </div>
        ))}
      </div>
      
      {/* Comparison Metrics */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Comparisons</h4>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-medium text-gray-600 mb-2">vs Company Average</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Projects</span>
                <span className="text-sm font-medium text-green-600">
                  {analytics.comparisons?.vsCompanyAverage?.projects || '+15%'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Efficiency</span>
                <span className="text-sm font-medium text-green-600">
                  {analytics.comparisons?.vsCompanyAverage?.efficiency || '+8%'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Quality</span>
                <span className="text-sm font-medium text-green-600">
                  {analytics.comparisons?.vsCompanyAverage?.quality || '+12%'}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-600 mb-2">vs Previous Quarter</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Completion</span>
                <span className="text-sm font-medium text-blue-600">
                  {analytics.comparisons?.vsPrevQuarter?.completion || '+22%'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Efficiency</span>
                <span className="text-sm font-medium text-blue-600">
                  {analytics.comparisons?.vsPrevQuarter?.efficiency || '+5%'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Satisfaction</span>
                <span className="text-sm font-medium text-blue-600">
                  {analytics.comparisons?.vsPrevQuarter?.satisfaction || '+8%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DetailCard>
  );
};

// Loading Screen
const LoadingScreen = ({ theme }) => (
  <div className={`min-h-screen ${theme.colors.background} flex items-center justify-center`}>
    <div className="text-center">
      <div className="relative">
        <div className="w-24 h-24 border-8 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-8"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Users className="h-8 w-8 text-orange-500" />
        </div>
      </div>
      <h3 className={`text-3xl font-bold ${theme.colors.text} mb-4`}>Loading Manager Details</h3>
      <p className={`text-xl ${theme.colors.textSecondary}`}>Fetching comprehensive data...</p>
    </div>
  </div>
);

// Error Screen
const ErrorScreen = ({ theme, error, onRetry }) => (
  <div className={`min-h-screen ${theme.colors.background} flex items-center justify-center p-8`}>
    <DetailCard className="max-w-lg w-full text-center" shadow="2xl">
      <AlertTriangle className="h-24 w-24 text-red-500 mx-auto mb-8" />
      <h3 className={`text-3xl font-bold ${theme.colors.text} mb-6`}>Error Loading Data</h3>
      <p className={`text-xl ${theme.colors.textSecondary} mb-8`}>{error}</p>
      <button
        onClick={onRetry}
        className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-4 px-8 rounded-2xl hover:from-orange-600 hover:to-yellow-600 transition-all font-bold text-lg shadow-xl"
      >
        <RefreshCw className="h-5 w-5 inline mr-2" />
        Retry Loading
      </button>
    </DetailCard>
  </div>
);

// Main Project Manager Details Component
const ProjectManagerDetails = ({ managerId: propManagerId }) => {
  const { managerId: urlManagerId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Use managerId from props first, then URL params, then null
  const effectiveManagerId = propManagerId || urlManagerId;
  
  // Debug logging
  useEffect(() => {
    console.log("=== ProjectManagerDetails Debug ===");
    console.log("Manager ID from props:", propManagerId);
    console.log("Manager ID from URL:", urlManagerId);
    console.log("Effective Manager ID:", effectiveManagerId);
  }, [propManagerId, urlManagerId, effectiveManagerId]);
  
  const { data, loading, error, lastUpdated, refetch } = useProjectManagerData(effectiveManagerId);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Add error handling for missing managerId
  if (!effectiveManagerId) {
    return (
      <ErrorScreen 
        theme={theme} 
        error="No manager ID provided. Please select a manager or provide a valid manager ID." 
        onRetry={() => navigate("/admin/dashboard")} 
      />
    );
  }

  if (loading) return <LoadingScreen theme={theme} />;
  if (error) return <ErrorScreen theme={theme} error={error} onRetry={refetch} />;

  if (!data.manager) {
    return (
      <ErrorScreen 
        theme={theme} 
        error="Manager data not found" 
        onRetry={refetch} 
      />
    );
  }

  return (
    <div className={`min-h-screen ${theme.colors.background} transition-all duration-300`}>
      {/* Enhanced Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        theme={theme} 
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-80" : "lg:ml-0"}`}>
        <div className="p-8">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="p-4 rounded-2xl bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              
              <div>
                <h1 className={`text-5xl font-bold ${theme.colors.text} mb-2`}>
                  Project Manager Analytics
                </h1>
                <p className={`text-2xl ${theme.colors.textSecondary}`}>
                  Comprehensive performance overview for {data.manager.name}
                </p>
                {lastUpdated && (
                  <p className="text-sm text-gray-500 mt-2">
                    Last updated: {lastUpdated.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={refetch}
                className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="h-6 w-6" />
              </button>
              
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Manager Profile Header */}
          <ManagerProfileHeader
            manager={data.manager}
            statistics={data.statistics}
            theme={theme}
          />

          {/* Performance Statistics Grid */}
          <PerformanceStats 
            statistics={data.statistics} 
            analytics={data.analytics}
            theme={theme} 
          />

          {/* Advanced Analytics Dashboard */}
          <AdvancedAnalytics 
            performanceData={data.performanceData}
            analytics={data.analytics}
            theme={theme}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            {/* Projects Overview - Takes 2 columns */}
            <div className="xl:col-span-2">
              <ProjectsOverview projects={data.projects} theme={theme} />
            </div>
            
            {/* Right Sidebar - Takes 1 column */}
            <div className="xl:col-span-1 space-y-8">
              <TasksOverview tasks={data.tasks} theme={theme} />
              <TendersOverview tenders={data.tenders} theme={theme} />
              <EventsOverview events={data.events} theme={theme} />
            </div>
          </div>

          {/* Performance Insights and Monthly Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <PerformanceInsights 
              analytics={data.analytics}
              statistics={data.statistics}
              theme={theme}
            />
            <MonthlyPerformance performanceData={data.performanceData} theme={theme} />
          </div>

          {/* Footer with Summary */}
          <DetailCard gradient className="text-center">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {data.statistics.totalProjects}
                </div>
                <div className="text-lg text-gray-600">Total Projects Managed</div>
              </div>
              
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  ${(data.statistics.totalBudget / 1000000).toFixed(1)}M
                </div>
                <div className="text-lg text-gray-600">Total Budget Managed</div>
              </div>
              
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {data.statistics.teamMembersManaged}
                </div>
                <div className="text-lg text-gray-600">Team Members Managed</div>
              </div>
              
              <div>
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {Math.round(data.statistics.performanceScore)}%
                </div>
                <div className="text-lg text-gray-600">Overall Performance Score</div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className={`text-xl ${theme.colors.textMuted}`}>
                Ujenzi & Paints Enterprise • Project Manager Analytics Dashboard
              </p>
              <p className={`text-lg ${theme.colors.textMuted} mt-2`}>
                © 2024 Construction & Paint Management Platform
              </p>
            </div>
          </DetailCard>
        </div>
      </div>
    </div>
  );
};

export default ProjectManagerDetails;