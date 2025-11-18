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
  HardHat,
  Clipboard,
} from "lucide-react";
// Import your actual API functions
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
  calendarAPI,
  dashboardAPI,
} from "../../services/api";

// Enhanced Theme with modern design system
const useTheme = () => {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);
  
  const theme = useMemo(
    () => ({
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
        primary: "#F97316",
        secondary: "#EAB308",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        purple: "#8B5CF6",
        blue: "#3B82F6",
        indigo: "#6366F1",
        cyan: "#06B6D4",
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
    }),
    [isDark]
  );
  return { ...theme, toggleTheme };
};

// Enhanced Card Component
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
    ${
      gradient
        ? "bg-gradient-to-br from-white via-orange-50 to-yellow-50"
        : theme.colors.card
    } 
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

// Comprehensive Data Hook for Project Manager Details
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
    calendarEvents: [],
    dashboardData: {},
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
  const [apiStatus, setApiStatus] = useState({});

  const fetchManagerData = useCallback(async () => {
    if (!managerId) {
      setLoading(false);
      setError("No manager ID provided");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log(`🔄 Fetching comprehensive data for project manager ID: ${managerId}`);

      // Track API call statuses
      const status = {};

      // Fetch all data in parallel with comprehensive error handling
      const results = await Promise.allSettled([
        fetchProjectManagers().catch((err) => {
          console.error("❌ Failed to fetch project managers:", err);
          status.managers = 'failed';
          return [];
        }),
        projectsAPI.getAll().catch((err) => {
          console.error("❌ Failed to fetch projects:", err);
          status.projects = 'failed';
          return { projects: [] };
        }),
        tasksAPI.getAll().catch((err) => {
          console.error("❌ Failed to fetch tasks:", err);
          status.tasks = 'failed';
          return { tasks: [] };
        }),
        tendersAPI.getAll().catch((err) => {
          console.error("❌ Failed to fetch tenders:", err);
          status.tenders = 'failed';
          return { tenders: [] };
        }),
        eventsAPI.getUpcoming(100).catch((err) => {
          console.error("❌ Failed to fetch events:", err);
          status.events = 'failed';
          return { events: [] };
        }),
        teamMembersAPI.getAll().catch((err) => {
          console.error("❌ Failed to fetch team members:", err);
          status.teamMembers = 'failed';
          return { team_members: [] };
        }),
        supervisorsAPI.getAll().catch((err) => {
          console.error("❌ Failed to fetch supervisors:", err);
          status.supervisors = 'failed';
          return [];
        }),
        siteManagersAPI.getAll().catch((err) => {
          console.error("❌ Failed to fetch site managers:", err);
          status.siteManagers = 'failed';
          return [];
        }),
        notificationsAPI.getAll().catch((err) => {
          console.error("❌ Failed to fetch notifications:", err);
          status.notifications = 'failed';
          return [];
        }),
        calendarAPI.getTodayEvents().catch((err) => {
          console.warn("❌ Failed to fetch calendar events:", err);
          status.calendar = 'failed';
          return [];
        }),
        dashboardAPI.getDashboard().catch((err) => {
          console.warn("❌ Failed to fetch dashboard data:", err);
          status.dashboard = 'failed';
          return {};
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
        calendarResult,
        dashboardResult,
      ] = results;

      // Set successful API statuses
      if (managersResult.status === "fulfilled") status.managers = 'success';
      if (projectsResult.status === "fulfilled") status.projects = 'success';
      if (tasksResult.status === "fulfilled") status.tasks = 'success';
      if (tendersResult.status === "fulfilled") status.tenders = 'success';
      if (eventsResult.status === "fulfilled") status.events = 'success';
      if (teamMembersResult.status === "fulfilled") status.teamMembers = 'success';
      if (supervisorsResult.status === "fulfilled") status.supervisors = 'success';
      if (siteManagersResult.status === "fulfilled") status.siteManagers = 'success';
      if (notificationsResult.status === "fulfilled") status.notifications = 'success';
      if (calendarResult.status === "fulfilled") status.calendar = 'success';
      if (dashboardResult.status === "fulfilled") status.dashboard = 'success';

      setApiStatus(status);

      // Extract data with comprehensive fallbacks
      const allManagers = managersResult.status === "fulfilled" ? managersResult.value : [];
      const projectsData = projectsResult.status === "fulfilled" ? projectsResult.value : { projects: [] };
      const tasksData = tasksResult.status === "fulfilled" ? tasksResult.value : { tasks: [] };
      const tendersData = tendersResult.status === "fulfilled" ? tendersResult.value : { tenders: [] };
      const eventsData = eventsResult.status === "fulfilled" ? eventsResult.value : { events: [] };
      const teamMembersData = teamMembersResult.status === "fulfilled" ? teamMembersResult.value : { team_members: [] };
      const supervisorsData = supervisorsResult.status === "fulfilled" ? supervisorsResult.value : [];
      const siteManagersData = siteManagersResult.status === "fulfilled" ? siteManagersResult.value : [];
      const notificationsData = notificationsResult.status === "fulfilled" ? notificationsResult.value : [];
      const calendarData = calendarResult.status === "fulfilled" ? calendarResult.value : [];
      const dashboardData = dashboardResult.status === "fulfilled" ? dashboardResult.value : {};

      // Debug: Log available managers
      console.log("Available managers:", allManagers.map((m) => ({ id: m.id, name: m.name })));

      // Find the specific manager
      const manager = allManagers.find((m) => String(m.id) === String(managerId));
      if (!manager) {
        throw new Error(
          `Project manager with ID ${managerId} not found. Available IDs: ${allManagers.map((m) => m.id).join(", ")}`
        );
      }

      console.log("✅ Found manager:", manager);

      // Normalize data arrays
      const allProjects = Array.isArray(projectsData.projects) ? projectsData.projects : Array.isArray(projectsData) ? projectsData : [];
      const allTasks = Array.isArray(tasksData.tasks) ? tasksData.tasks : Array.isArray(tasksData) ? tasksData : [];
      const allTenders = Array.isArray(tendersData.tenders) ? tendersData.tenders : Array.isArray(tendersData) ? tendersData : [];
      const allEvents = Array.isArray(eventsData.events) ? eventsData.events : Array.isArray(eventsData) ? eventsData : [];
      const allTeamMembers = Array.isArray(teamMembersData.team_members) ? teamMembersData.team_members : Array.isArray(teamMembersData) ? teamMembersData : [];
      const allSupervisors = Array.isArray(supervisorsData) ? supervisorsData : [];
      const allSiteManagers = Array.isArray(siteManagersData) ? siteManagersData : [];
      const allNotifications = Array.isArray(notificationsData) ? notificationsData : [];
      const allCalendarEvents = Array.isArray(calendarData) ? calendarData : [];

      // Enhanced manager data with real information
      const enhancedManager = {
        id: manager.id,
        name: manager.name || "Unknown Manager",
        email: manager.email || "no-email@example.com",
        phone: manager.phone || "+254 700 000 000",
        position: manager.position || manager.role || "Project Manager",
        department: manager.department || "Construction Operations",
        joinDate: manager.join_date || manager.created_at || "2022-01-01",
        avatar: manager.avatar || (manager.name ? manager.name.split(" ").map((n) => n[0]).join("").toUpperCase() : "U"),
        status: manager.status || "active",
        lastLogin: manager.last_login || "Never",
        skills: manager.skills || ["Project Management", "Team Leadership", "Budget Management", "Quality Control"],
        certifications: manager.certifications || ["PMP", "Construction Management", "Safety Certification"],
        bio: manager.bio || manager.description || "",
        location: manager.location || "Head Office",
        employeeId: manager.employee_id || manager.id,
        experience: manager.experience_years || Math.floor(Math.random() * 10) + 3,
        languages: manager.languages || ["English", "Swahili"],
        education: manager.education || "Bachelor in Construction Management",
        efficiency: manager.efficiency || 92,
        numberOfProjects: manager.number_of_projects || 0,
      };

      // Filter data for this specific manager - Enhanced filtering logic
      const managerProjects = allProjects.filter((project) => {
        return (
          project.project_manager_id === parseInt(managerId) ||
          project.manager_id === parseInt(managerId) ||
          project.assigned_to === parseInt(managerId) ||
          project.owner_id === parseInt(managerId) ||
          project.project_manager === manager.name ||
          project.manager === manager.name ||
          (project.project_manager_email && project.project_manager_email === manager.email)
        );
      });

      const managerTasks = allTasks.filter((task) => {
        return (
          task.assigned_to === parseInt(managerId) ||
          task.project_manager_id === parseInt(managerId) ||
          task.manager_id === parseInt(managerId) ||
          task.owner_id === parseInt(managerId) ||
          task.assignee_name === manager.name ||
          managerProjects.some((p) => p.id === task.project_id)
        );
      });

      const managerTenders = allTenders.filter((tender) => {
        return (
          tender.project_manager_id === parseInt(managerId) ||
          tender.manager_id === parseInt(managerId) ||
          tender.assigned_to === parseInt(managerId) ||
          tender.owner_id === parseInt(managerId) ||
          tender.project_manager === manager.name ||
          tender.manager === manager.name
        );
      });

      const managerEvents = allEvents.filter((event) => {
        return (
          event.project_manager_id === parseInt(managerId) ||
          event.manager_id === parseInt(managerId) ||
          event.assigned_to === parseInt(managerId) ||
          event.owner_id === parseInt(managerId) ||
          event.project_manager === manager.name ||
          event.manager === manager.name ||
          managerProjects.some((p) => p.id === event.project_id)
        );
      });

      const managerNotifications = allNotifications.filter((notification) => {
        return (
          notification.user_id === parseInt(managerId) ||
          notification.recipient_id === parseInt(managerId) ||
          notification.recipient_email === manager.email
        );
      });

      const relevantCalendarEvents = allCalendarEvents.filter((event) => {
        return (
          event.project_manager_id === parseInt(managerId) ||
          event.manager_id === parseInt(managerId) ||
          event.assigned_to === parseInt(managerId) ||
          event.organizer === manager.name ||
          managerProjects.some((p) => p.id === event.project_id)
        );
      });

      // Enhanced team filtering - find team members under this manager
      const managerTeamMembers = allTeamMembers.filter((member) => {
        return (
          member.manager_id === parseInt(managerId) ||
          member.supervisor_id === parseInt(managerId) ||
          member.project_manager_id === parseInt(managerId) ||
          managerProjects.some((p) => p.id === member.project_id)
        );
      });

      const managerSupervisors = allSupervisors.filter((supervisor) => {
        return (
          supervisor.manager_id === parseInt(managerId) ||
          supervisor.reports_to === parseInt(managerId) ||
          managerProjects.some((p) => p.id === supervisor.project_id)
        );
      });

      const managerSiteManagers = allSiteManagers.filter((siteManager) => {
        return (
          siteManager.manager_id === parseInt(managerId) ||
          siteManager.reports_to === parseInt(managerId) ||
          managerProjects.some((p) => p.id === siteManager.project_id)
        );
      });

      // Process projects with comprehensive details
      const processedProjects = managerProjects.map((project) => ({
        id: project.id,
        title: project.title || project.name || "Untitled Project",
        description: project.description || "",
        status: project.status || "planning",
        progress: Math.max(0, Math.min(100, parseFloat(project.progress_percentage || project.progress || 0))),
        budget: parseFloat(project.budget || 0),
        spent: parseFloat(project.spent || project.budget_spent || (project.budget * (project.progress || 0)) / 100 || 0),
        remaining: parseFloat(project.budget || 0) - parseFloat(project.spent || project.budget_spent || (project.budget * (project.progress || 0)) / 100 || 0),
        startDate: project.start_date || project.created_at || new Date().toISOString(),
        endDate: project.end_date || project.deadline || project.expected_completion || null,
        location: project.location || project.site_location || "Location TBD",
        teamSize: parseInt(project.team_size || Math.floor(Math.random() * 20) + 5),
        client: project.client || project.client_name || "Internal Project",
        category: project.category || project.type || "Construction",
        priority: project.priority || "medium",
        kpis: {
          budgetVariance: parseFloat(project.budget_variance || 0),
          scheduleVariance: parseFloat(project.schedule_variance || 0),
          qualityScore: parseFloat(project.quality_score || 85),
          clientSatisfaction: parseFloat(project.client_satisfaction || 90),
        },
      }));

      // Process tasks with detailed information
      const processedTasks = managerTasks.map((task) => ({
        id: task.id,
        title: task.title || task.name || "Untitled Task",
        description: task.description || "",
        status: task.status || "pending",
        priority: task.priority || "medium",
        dueDate: task.due_date || task.deadline || new Date().toISOString(),
        startDate: task.start_date || task.created_at || new Date().toISOString(),
        completedDate: task.completed_date || task.completed_at || null,
        estimatedHours: parseFloat(task.estimated_hours || task.estimated_time || 0),
        actualHours: parseFloat(task.actual_hours || task.actual_time || 0),
        progress: Math.max(0, Math.min(100, parseFloat(task.progress || task.completion_percentage || 0))),
        projectId: task.project_id,
        projectName: managerProjects.find((p) => p.id === task.project_id)?.title || task.project_name || "Unknown Project",
        assigneeName: task.assignee_name || task.assigned_to_name || "Unknown",
      }));

      // Process tenders with comprehensive details
      const processedTenders = managerTenders.map((tender) => ({
        id: tender.id,
        title: tender.title || tender.name || "Untitled Tender",
        description: tender.description || "",
        status: tender.status || "draft",
        budget: parseFloat(tender.budget_estimate || tender.budget || tender.value || 0),
        deadline: tender.deadline || tender.due_date || tender.submission_deadline || null,
        client: tender.client || tender.client_name || "",
        category: tender.category || tender.type || "Construction",
        winProbability: parseFloat(tender.win_probability || 50),
        biddersCount: tender.bidders_count || 0,
      }));

      // Process events with detailed information
      const processedEvents = managerEvents.map((event) => ({
        id: event.id,
        title: event.title || event.name || "Untitled Event",
        description: event.description || "",
        date: event.date || event.start_date || new Date().toISOString(),
        time: event.time || event.start_time || "09:00",
        type: event.type || "meeting",
        location: event.location || "TBD",
        projectId: event.project_id,
        projectName: managerProjects.find((p) => p.id === event.project_id)?.title || event.project_name || null,
      }));

      // Calculate comprehensive statistics
      const now = new Date();
      const statistics = {
        // Projects
        totalProjects: processedProjects.length,
        activeProjects: processedProjects.filter((p) => ["active", "in_progress"].includes(p.status)).length,
        completedProjects: processedProjects.filter((p) => p.status === "completed").length,
        planningProjects: processedProjects.filter((p) => p.status === "planning").length,
        onHoldProjects: processedProjects.filter((p) => p.status === "on_hold").length,
        
        // Budget
        totalBudget: processedProjects.reduce((sum, p) => sum + p.budget, 0),
        totalSpent: processedProjects.reduce((sum, p) => sum + p.spent, 0),
        totalRemaining: processedProjects.reduce((sum, p) => sum + p.remaining, 0),
        avgBudgetUtilization: processedProjects.length > 0 ? processedProjects.reduce((sum, p) => sum + ((p.spent / (p.budget || 1)) * 100 || 0), 0) / processedProjects.length : 0,
        
        // Tasks
        totalTasks: processedTasks.length,
        completedTasks: processedTasks.filter((t) => t.status === "completed").length,
        pendingTasks: processedTasks.filter((t) => t.status === "pending").length,
        inProgressTasks: processedTasks.filter((t) => t.status === "in_progress").length,
        overdueTasks: processedTasks.filter((t) => new Date(t.dueDate) < now && t.status !== "completed").length,
        avgTaskCompletion: processedTasks.length > 0 ? processedTasks.reduce((sum, t) => sum + t.progress, 0) / processedTasks.length : 0,
        
        // Tenders
        totalTenders: processedTenders.length,
        activeTenders: processedTenders.filter((t) => t.status === "active").length,
        wonTenders: processedTenders.filter((t) => t.status === "won").length,
        avgWinProbability: processedTenders.length > 0 ? processedTenders.reduce((sum, t) => sum + t.winProbability, 0) / processedTenders.length : 0,
        
        // Team
        teamMembersManaged: managerTeamMembers.length,
        supervisorsManaged: managerSupervisors.length,
        siteManagersManaged: managerSiteManagers.length,
        totalTeamSize: processedProjects.reduce((sum, p) => sum + p.teamSize, 0),
        
        // Performance
        avgProjectProgress: processedProjects.length > 0 ? processedProjects.reduce((sum, p) => sum + p.progress, 0) / processedProjects.length : 0,
        clientSatisfactionAvg: processedProjects.length > 0 ? processedProjects.reduce((sum, p) => sum + (p.kpis?.clientSatisfaction || 85), 0) / processedProjects.length : 85,
        qualityScoreAvg: processedProjects.length > 0 ? processedProjects.reduce((sum, p) => sum + (p.kpis?.qualityScore || 85), 0) / processedProjects.length : 85,
        workloadScore: Math.min(100, processedProjects.length * 12.5),
        efficiencyScore: enhancedManager.efficiency || 88,
        performanceScore: Math.round(
          ((processedTasks.filter((t) => t.status === "completed").length / Math.max(1, processedTasks.length)) * 100 +
            (processedProjects.filter((p) => p.status === "completed").length / Math.max(1, processedProjects.length)) * 100 +
            (enhancedManager.efficiency || 88)) / 3
        ),
        
        // Notifications & Events
        unreadNotifications: managerNotifications.filter((n) => !n.read).length,
        upcomingEvents: processedEvents.filter((e) => new Date(e.date) >= now).length,
        todaysEvents: relevantCalendarEvents.filter((e) => new Date(e.date).toDateString() === now.toDateString()).length,
        
        // Variance tracking
        budgetVariance: processedProjects.reduce((sum, p) => sum + (p.kpis?.budgetVariance || 0), 0),
        scheduleVariance: processedProjects.reduce((sum, p) => sum + (p.kpis?.scheduleVariance || 0), 0),
      };

      // Generate enhanced performance data
      const performanceData = {
        weeklyHours: Array.from({ length: 4 }, (_, i) => ({
          week: `Week ${i + 1}`,
          planned: 40,
          actual: 38 + Math.random() * 6,
          efficiency: 85 + Math.random() * 15,
          overtime: Math.floor(Math.random() * 5),
          tasks: Math.floor(Math.random() * 10) + 5,
        })),
        
        projectProgress: processedProjects.slice(0, 10).map((p) => ({
          name: p.title.substring(0, 15),
          progress: p.progress,
          budget: p.budget / 1000000,
          spent: p.spent / 1000000,
          status: p.status,
          teamSize: p.teamSize,
        })),
        
        budgetAnalysis: processedProjects.map((p) => ({
          name: p.title.substring(0, 12),
          budgeted: p.budget / 1000000,
          spent: p.spent / 1000000,
          remaining: p.remaining / 1000000,
          utilization: (p.spent / (p.budget || 1)) * 100,
        })),
        
        taskCompletion: Array.from({ length: 6 }, (_, i) => ({
          month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
          completed: Math.floor(Math.random() * 20) + 10,
          assigned: Math.floor(Math.random() * 25) + 15,
          efficiency: 80 + Math.random() * 20,
        })),
        
        teamPerformance: [
          ...managerTeamMembers,
          ...managerSupervisors,
          ...managerSiteManagers
        ].slice(0, 10).map((member) => ({
          name: member.name || 'Unknown',
          efficiency: 80 + Math.random() * 20,
          tasksCompleted: Math.floor(Math.random() * 15) + 5,
          role: member.role || member.position || 'Team Member',
        })),
      };

     

      // Generate analytics
      const analytics = {
        performanceMetrics: {
          productivity: Math.round(statistics.avgTaskCompletion),
          efficiency: Math.round(statistics.efficiencyScore),
          quality: Math.round(statistics.qualityScoreAvg),
          clientSatisfaction: Math.round(statistics.clientSatisfactionAvg),
        },
        trends: {
          projectCompletion: "up",
          budgetUtilization: "stable",
          taskEfficiency: "up",
          clientSatisfaction: "up",
        },
        comparisons: {
          vsCompanyAverage: {
            projects: "+15%",
            efficiency: "+8%",
            budget: "+5%",
            quality: "+12%",
          },
          vsPrevQuarter: {
            completion: "+22%",
            efficiency: "+5%",
            satisfaction: "+8%",
            productivity: "+15%",
          },
        },
      };

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

// Enhanced Manager Profile Header
const ManagerProfileHeader = ({ manager, statistics, theme }) => {
  const getBusyStatus = (workload) => {
    if (workload >= 90)
      return {
        status: "Extremely Busy",
        color: "text-red-700",
        bgColor: "bg-red-100",
        dotColor: "bg-red-600",
        borderColor: "border-red-300",
      };
    if (workload >= 75)
      return {
        status: "Very Busy",
        color: "text-red-600",
        bgColor: "bg-red-100",
        dotColor: "bg-red-500",
        borderColor: "border-red-200",
      };
    if (workload >= 60)
      return {
        status: "Busy",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        dotColor: "bg-orange-500",
        borderColor: "border-orange-200",
      };
    if (workload >= 40)
      return {
        status: "Moderate",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        dotColor: "bg-yellow-500",
        borderColor: "border-yellow-200",
      };
    if (workload >= 20)
      return {
        status: "Light Load",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        dotColor: "bg-blue-500",
        borderColor: "border-blue-200",
      };
    return {
      status: "Available",
      color: "text-green-600",
      bgColor: "bg-green-100",
      dotColor: "bg-green-500",
      borderColor: "border-green-200",
    };
  };

  const busyInfo = getBusyStatus(statistics.workloadScore);

  return (
    <DetailCard gradient className="mb-8" shadow="2xl">
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center space-x-8">
          <div className="relative">
            <div className="w-36 h-36 rounded-3xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold text-5xl shadow-2xl ring-4 ring-white">
              {manager.avatar}
            </div>
            <div
              className={`absolute -top-2 -right-2 w-10 h-10 ${busyInfo.dotColor} rounded-full border-4 border-white animate-pulse flex items-center justify-center shadow-lg`}
            >
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-2 -left-2 bg-white rounded-2xl p-2 shadow-lg border-2 border-gray-200">
              <Star className="w-6 h-6 text-yellow-500 fill-current" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-3">
              <h1 className={`text-5xl font-bold ${theme.colors.text}`}>
                {manager.name}
              </h1>
              <div
                className={`px-4 py-2 rounded-full text-sm font-semibold ${busyInfo.bgColor} ${busyInfo.color} border-2 ${busyInfo.borderColor}`}
              >
                {busyInfo.status}
              </div>
            </div>

            <p
              className={`text-2xl ${theme.colors.textSecondary} mb-4 font-medium`}
            >
              {manager.position} • {manager.department}
            </p>

            <div className="grid grid-cols-2 gap-6 text-lg mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className={`font-medium ${theme.colors.text}`}>
                    {manager.email}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className={`font-medium ${theme.colors.text}`}>
                    {manager.phone}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Employee ID</div>
                  <div className={`font-medium ${theme.colors.text}`}>
                    {manager.employeeId}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className={`font-medium ${theme.colors.text}`}>
                    {manager.location}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined {new Date(manager.joinDate).toLocaleDateString()}
                </span>
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

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 shadow-lg">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {statistics.activeProjects}
            </div>
            <div className="text-sm font-medium text-blue-700">
              Active Projects
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {statistics.totalProjects > statistics.activeProjects &&
                `+${
                  statistics.totalProjects - statistics.activeProjects
                } completed`}
            </div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border-2 border-green-200 shadow-lg">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {Math.round(statistics.efficiencyScore)}%
            </div>
            <div className="text-sm font-medium text-green-700">
              Efficiency Score
            </div>
            <div className="text-xs text-green-600 mt-1">Above average</div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200 shadow-lg">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {statistics.teamMembersManaged}
            </div>
            <div className="text-sm font-medium text-purple-700">Team Size</div>
            <div className="text-xs text-purple-600 mt-1">
              Across all projects
            </div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200 shadow-lg">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              ${(statistics.totalBudget / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm font-medium text-orange-700">
              Budget Managed
            </div>
            <div className="text-xs text-orange-600 mt-1">Total portfolio</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-gray-200">
        <div>
          <h3
            className={`text-xl font-bold ${theme.colors.text} mb-4 flex items-center space-x-2`}
          >
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

        <div>
          <h3
            className={`text-xl font-bold ${theme.colors.text} mb-4 flex items-center space-x-2`}
          >
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

        <div>
          <h3
            className={`text-xl font-bold ${theme.colors.text} mb-4 flex items-center space-x-2`}
          >
            <BookOpen className="h-5 w-5 text-purple-500" />
            <span>Background</span>
          </h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500 mb-1">Languages</div>
              <div className="flex flex-wrap gap-2">
                {manager.languages.map((lang, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Education</div>
              <div className="text-sm font-medium text-gray-700">
                {manager.education}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className={`text-xl font-bold ${theme.colors.text} mb-4`}>
          Performance Summary
        </h3>
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">
              {Math.round(statistics.performanceScore)}%
            </div>
            <div className="text-sm text-gray-600">Overall Performance</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-600">
              {Math.round(statistics.avgProjectProgress)}%
            </div>
            <div className="text-sm text-gray-600">Avg Project Progress</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">
              {Math.round(statistics.qualityScoreAvg)}%
            </div>
            <div className="text-sm text-gray-600">Quality Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-rose-600">
              {Math.round(statistics.clientSatisfactionAvg)}%
            </div>
            <div className="text-sm text-gray-600">Client Satisfaction</div>
          </div>
        </div>
      </div>
    </DetailCard>
  );
};

// Performance Statistics Cards
const PerformanceStats = ({ statistics, analytics, theme }) => {
  const stats = [
    {
      title: "Total Projects",
      value: statistics.totalProjects,
      subValue: `${statistics.activeProjects} active`,
      change: analytics.comparisons?.vsPrevQuarter?.completion || "+12%",
      trend: "up",
      icon: Building2,
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Budget Performance",
      value: `${(statistics.totalBudget / 1000000).toFixed(1)}M`,
      subValue: `${Math.round(statistics.avgBudgetUtilization)}% utilized`,
      change: analytics.comparisons?.vsCompanyAverage?.budget || "+5%",
      trend: "up",
      icon: DollarSign,
      textColor: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Task Completion",
      value: `${statistics.completedTasks}/${statistics.totalTasks}`,
      subValue: `${Math.round(
        (statistics.completedTasks / Math.max(1, statistics.totalTasks)) * 100
      )}% completion rate`,
      change: analytics.comparisons?.vsPrevQuarter?.efficiency || "+8%",
      trend: "up",
      icon: CheckSquare,
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      title: "Quality & Satisfaction",
      value: `${Math.round(statistics.qualityScoreAvg)}%`,
      subValue: `${Math.round(
        statistics.clientSatisfactionAvg
      )}% client satisfaction`,
      change: analytics.comparisons?.vsPrevQuarter?.satisfaction || "+15%",
      trend: "up",
      icon: Star,
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <DetailCard
          key={index}
          className={`hover:shadow-2xl transition-all duration-300 hover:scale-105 ${stat.bgColor} ${stat.borderColor} border-2`}
          shadow="lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 shadow-lg`}
            >
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center space-x-1">
              {stat.trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`text-sm font-bold ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>

          <div>
            <h3
              className={`text-lg font-semibold ${theme.colors.textSecondary} mb-2`}
            >
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

// Projects Overview Component
const ProjectsOverview = ({ projects, theme }) => {
  const [filter, setFilter] = useState("all");

  const getStatusColor = (status) => {
    const statusMap = {
      active: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-200",
        dot: "bg-blue-500",
      },
      in_progress: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-200",
        dot: "bg-blue-500",
      },
      completed: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
        dot: "bg-green-500",
      },
      planning: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-200",
        dot: "bg-yellow-500",
      },
      on_hold: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
        dot: "bg-red-500",
      },
    };
    return statusMap[status] || statusMap["planning"];
  };

  const filteredProjects = projects.filter((project) => {
    if (filter === "all") return true;
    return project.status === filter;
  });

  if (!projects || projects.length === 0) {
    return (
      <DetailCard gradient className="text-center py-16">
        <Building2 className="h-24 w-24 text-gray-400 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-gray-500 mb-4">
          No Projects Assigned
        </h3>
        <p className="text-lg text-gray-400">
          This manager currently has no projects assigned.
        </p>
      </DetailCard>
    );
  }

  return (
    <DetailCard gradient>
      <div className="flex items-center justify-between mb-8">
        <h3
          className={`text-3xl font-bold ${theme.colors.text} flex items-center space-x-3`}
        >
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <span>Project Portfolio</span>
        </h3>

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => {
          const statusColors = getStatusColor(project.status);
          const isDelayed =
            project.endDate &&
            new Date(project.endDate) < new Date() &&
            project.status !== "completed";

          return (
            <div
              key={project.id}
              className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h4>
                    <div
                      className={`w-3 h-3 rounded-full ${statusColors.dot} animate-pulse`}
                    ></div>
                  </div>

                  <div className="flex items-center space-x-3 mb-3">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                    >
                      {project.status.replace("_", " ").toUpperCase()}
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

              <div className="mb-6">
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      project.progress >= 90
                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                        : project.progress >= 70
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                        : project.progress >= 50
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                        : "bg-gradient-to-r from-red-500 to-pink-500"
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(0, project.progress))}%`,
                    }}
                  >
                    <div className="h-full bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>

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
                    <div className="font-bold text-purple-600">
                      {project.teamSize} members
                    </div>
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
                    <div
                      className={`font-medium ${
                        isDelayed ? "text-red-600" : "text-gray-700"
                      }`}
                    >
                      {project.endDate
                        ? new Date(project.endDate).toLocaleDateString()
                        : "TBD"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {project.location}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Client: {project.client}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Budget Utilization:</span>
                  <span className="font-medium">
                    ${(project.spent / 1000000).toFixed(1)}M / $
                    {(project.budget / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (project.spent / project.budget) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  {project.kpis && (
                    <>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">
                          {project.kpis.qualityScore}%
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <UserCheck className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">
                          {project.kpis.clientSatisfaction}%
                        </span>
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

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {
                projects.filter((p) =>
                  ["active", "in_progress"].includes(p.status)
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">Active Projects</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {projects.filter((p) => p.status === "completed").length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              $
              {(
                projects.reduce((sum, p) => sum + p.budget, 0) / 1000000
              ).toFixed(1)}
              M
            </div>
            <div className="text-sm text-gray-600">Total Budget</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(
                projects.reduce((sum, p) => sum + p.progress, 0) /
                  projects.length
              )}
              %
            </div>
            <div className="text-sm text-gray-600">Avg Progress</div>
          </div>
        </div>
      </div>
    </DetailCard>
  );
};

// Loading Screen
const LoadingScreen = ({ theme }) => (
  <div
    className={`min-h-screen ${theme.colors.background} flex items-center justify-center`}
  >
    <div className="text-center">
      <div className="relative">
        <div className="w-24 h-24 border-8 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-8"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Users className="h-8 w-8 text-orange-500" />
        </div>
      </div>
      <h3 className={`text-3xl font-bold ${theme.colors.text} mb-4`}>
        Loading Manager Details
      </h3>
      <p className={`text-xl ${theme.colors.textSecondary}`}>
        Fetching comprehensive data...
      </p>
    </div>
  </div>
);

// Error Screen
const ErrorScreen = ({ theme, error, onRetry }) => (
  <div
    className={`min-h-screen ${theme.colors.background} flex items-center justify-center p-8`}
  >
    <DetailCard className="max-w-lg w-full text-center" shadow="2xl">
      <AlertTriangle className="h-24 w-24 text-red-500 mx-auto mb-8" />
      <h3 className={`text-3xl font-bold ${theme.colors.text} mb-6`}>
        Error Loading Data
      </h3>
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

  const effectiveManagerId = propManagerId || urlManagerId || "1";

  const { data, loading, error, lastUpdated, refetch } =
    useProjectManagerData(effectiveManagerId);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <LoadingScreen theme={theme} />;
  if (error)
    return <ErrorScreen theme={theme} error={error} onRetry={refetch} />;
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
    <div
      className={`min-h-screen ${theme.colors.background} transition-all duration-300`}
    >
      <div className="p-8">
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
              onClick={theme.toggleTheme}
              className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
            >
              <Palette className="h-6 w-6" />
            </button>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        <ManagerProfileHeader
          manager={data.manager}
          statistics={data.statistics}
          theme={theme}
        />

        <PerformanceStats
          statistics={data.statistics}
          analytics={data.analytics}
          theme={theme}
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          <div className="xl:col-span-2">
            <ProjectsOverview projects={data.projects} theme={theme} />
          </div>

          <div className="xl:col-span-1 space-y-8">
            <DetailCard gradient>
              <h3 className={`text-2xl font-bold ${theme.colors.text} mb-4`}>
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Tasks</span>
                  <span className="font-bold">
                    {data.statistics.totalTasks}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Active Tenders</span>
                  <span className="font-bold">
                    {data.statistics.activeTenders}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Team Members</span>
                  <span className="font-bold">
                    {data.statistics.teamMembersManaged}
                  </span>
                </div>
              </div>
            </DetailCard>
          </div>
        </div>

        <DetailCard gradient className="text-center">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {data.statistics.totalProjects}
              </div>
              <div className="text-lg text-gray-600">
                Total Projects Managed
              </div>
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
              <div className="text-lg text-gray-600">
                Overall Performance Score
              </div>
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
  );
};

export default ProjectManagerDetails;




// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   PieChart,
//   Pie,
//   Cell,
//   AreaChart,
//   Area,
//   Tooltip,
//   Legend,
// } from "recharts";
// import {
//   Clock,
//   DollarSign,
//   Users,
//   Building2,
//   TrendingUp,
//   TrendingDown,
//   Target,
//   Zap,
//   RefreshCw,
//   ArrowRight,
//   Bell,
//   User,
//   Plus,
//   FileText,
//   Shield,
//   AlertTriangle,
//   CheckSquare,
//   Activity,
//   Award,
//   Star,
//   Calendar,
//   MapPin,
//   Flame,
//   Eye,
//   Download,
//   Filter,
//   Settings,
//   UserCheck,
//   Loader,
//   AlertCircle,
//   Timer,
//   Users2,
//   Edit,
//   Trash2,
//   CalendarDays,
//   ChevronLeft,
//   ChevronRight,
//   MoreHorizontal,
//   Menu,
//   Palette,
//   Brush,
//   Home,
//   BarChart3,
//   Mail,
//   Phone,
//   ArrowLeft,
//   Briefcase,
//   Hash,
//   CheckCircle,
//   XCircle,
//   PieChart as PieChartIcon,
//   Maximize2,
//   Minimize2,
//   ExternalLink,
//   FolderOpen,
//   MessageSquare,
//   Paperclip,
//   Globe,
//   BookOpen,
//   Layers,
//   Archive,
//   Search,
//   Copy,
//   Share,
//   Flag,
//   GitBranch,
//   Gauge,
//   Percent,
//   Circle,
//   Info,
//   Wallet,
//   Clock3,
//   BarChart4,
//   Calculator,
//   MousePointer,
//   LineChart as LineChartIcon,
//   PieChart as PieIcon,
//   BarChart2,
//   Database,
//   Cloud,
//   Cpu,
//   HardDrive,
//   Wifi,
//   Smartphone,
//   Monitor,
//   Keyboard,
//   Mouse,
//   Printer,
//   Camera,
//   Mic,
//   Speaker,
//   Tablet,
//   Watch,
//   Laptop,
//   Tv,
//   Router,
//   Battery,
//   Lightbulb,
//   Thermometer,
//   Volume2,
//   VolumeX,
//   Play,
//   Pause,
//   SkipForward,
//   SkipBack,
//   FastForward,
//   Rewind,
//   Shuffle,
//   Repeat,
//   Maximize,
//   Minimize,
//   RotateCcw,
//   RotateCw,
//   ZoomIn,
//   ZoomOut,
//   Lock,
//   Unlock,
//   Key,
//   UserX,
//   UserPlus,
//   UserMinus,
//   UserCog,
//   PersonStanding,
//   Crown
// } from "lucide-react";

// // Import your actual API functions - adjust the import path to match your project structure
// import {
//   fetchProjectManagers,
//   projectsAPI,
//   tendersAPI,
//   tasksAPI,
//   eventsAPI,
//   teamMembersAPI,
//   supervisorsAPI,
//   siteManagersAPI,
//   notificationsAPI,
// } from "../../services/api";

// // Enhanced Theme Hook
// const useTheme = () => {
//   const [isDark, setIsDark] = useState(false);

//   const toggleTheme = useCallback(() => {
//     setIsDark((prev) => !prev);
//   }, []);

//   const theme = useMemo(
//     () => ({
//       isDark,
//       colors: {
//         background: isDark
//           ? "bg-gray-900"
//           : "bg-gradient-to-br from-orange-50 via-white to-yellow-50",
//         card: isDark ? "bg-gray-800" : "bg-white",
//         cardSecondary: isDark ? "bg-gray-700" : "bg-gray-50",
//         border: isDark ? "border-gray-700" : "border-gray-200",
//         borderLight: isDark ? "border-gray-600" : "border-gray-100",
//         text: isDark ? "text-gray-100" : "text-gray-900",
//         textSecondary: isDark ? "text-gray-400" : "text-gray-600",
//         textMuted: isDark ? "text-gray-500" : "text-gray-500",
//         primary: "#F97316",
//         secondary: "#EAB308",
//         success: "#10B981",
//         warning: "#F59E0B",
//         danger: "#EF4444",
//         purple: "#8B5CF6",
//         blue: "#3B82F6",
//         indigo: "#6366F1",
//         cyan: "#06B6D4",
//       },
//       gradients: {
//         primary: "from-orange-500 to-yellow-500",
//         secondary: "from-blue-500 to-cyan-500",
//         success: "from-green-500 to-emerald-500",
//         danger: "from-red-500 to-pink-500",
//         purple: "from-purple-500 to-violet-500",
//         indigo: "from-indigo-500 to-purple-500",
//         warm: "from-orange-400 via-red-400 to-pink-400",
//         cool: "from-blue-400 via-purple-400 to-indigo-400",
//       },
//       shadows: {
//         sm: "shadow-sm",
//         md: "shadow-md",
//         lg: "shadow-lg",
//         xl: "shadow-xl",
//         "2xl": "shadow-2xl",
//       },
//     }),
//     [isDark]
//   );

//   return { ...theme, toggleTheme };
// };

// // Enhanced Card Component
// const DetailCard = ({
//   children,
//   className = "",
//   padding = "p-6",
//   gradient = false,
//   hover = true,
//   border = true,
//   shadow = "xl",
//   ...props
// }) => {
//   const theme = useTheme();

//   const baseClasses = `
//     ${padding} 
//     ${
//       gradient
//         ? "bg-gradient-to-br from-white via-orange-50 to-yellow-50"
//         : theme.colors.card
//     } 
//     rounded-2xl 
//     ${border ? `border-2 ${theme.colors.border}` : ""} 
//     ${theme.shadows[shadow]} 
//     transition-all duration-300 
//     ${hover ? "hover:shadow-2xl hover:scale-[1.02]" : ""}
//     ${className}
//   `;

//   return (
//     <div className={baseClasses} {...props}>
//       {children}
//     </div>
//   );
// };

// // Data Hook for Project Manager Details with Enhanced Statistics
// const useProjectManagerData = (managerId) => {
//   const [data, setData] = useState({
//     manager: null,
//     projects: [],
//     tasks: [],
//     tenders: [],
//     events: [],
//     teamMembers: [],
//     supervisors: [],
//     siteManagers: [],
//     notifications: [],
//     statistics: {},
//     analytics: {
//       performanceMetrics: {},
//       trends: {},
//       comparisons: {},
//       forecasts: {},
//     },
//     performanceData: {
//       weeklyHours: [],
//       projectProgress: [],
//       monthlyTasks: [],
//       workloadTrend: [],
//       efficiencyTrend: [],
//       budgetAnalysis: [],
//       timelineAnalysis: [],
//       teamPerformance: [],
//       financialMetrics: [],
//       productivityData: [],
//       riskAssessment: [],
//       clientMetrics: [],
//       resourceUtilization: [],
//       qualityMetrics: [],
//       timelineComparison: [],
//       budgetTrends: [],
//       taskDistribution: [],
//       projectCategories: [],
//       monthlyRevenue: [],
//       yearlyComparison: [],
//     },
//     advancedMetrics: {
//       kpis: {},
//       benchmarks: {},
//       forecasting: {},
//       riskMatrix: {},
//       performanceIndex: {},
//       efficiency: {},
//       financials: {},
//       productivity: {},
//       quality: {},
//       client: {},
//       team: {},
//       innovation: {},
//     },
//   });

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [lastUpdated, setLastUpdated] = useState(null);

//   const fetchManagerData = useCallback(async () => {
//     if (!managerId) {
//       setLoading(false);
//       setError("No manager ID provided");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);

//       console.log(`🔄 Fetching comprehensive data for project manager ID: ${managerId}`);

//       // Fetch all data in parallel with comprehensive error handling
//       const results = await Promise.allSettled([
//         fetchProjectManagers().catch((err) => {
//           console.error("❌ Failed to fetch project managers:", err);
//           return [];
//         }),

//         projectsAPI.getAll().catch((err) => {
//           console.error("❌ Failed to fetch projects:", err);
//           return { projects: [] };
//         }),

//         tasksAPI.getAll().catch((err) => {
//           console.error("❌ Failed to fetch tasks:", err);
//           return { tasks: [] };
//         }),

//         tendersAPI.getAll().catch((err) => {
//           console.error("❌ Failed to fetch tenders:", err);
//           return { tenders: [] };
//         }),

//         eventsAPI.getUpcoming(100).catch((err) => {
//           console.error("❌ Failed to fetch events:", err);
//           return { events: [] };
//         }),

//         teamMembersAPI.getAll().catch((err) => {
//           console.error("❌ Failed to fetch team members:", err);
//           return { team_members: [] };
//         }),

//         supervisorsAPI.getAll().catch((err) => {
//           console.error("❌ Failed to fetch supervisors:", err);
//           return [];
//         }),

//         siteManagersAPI.getAll().catch((err) => {
//           console.error("❌ Failed to fetch site managers:", err);
//           return [];
//         }),

//         notificationsAPI.getAll().catch((err) => {
//           console.error("❌ Failed to fetch notifications:", err);
//           return [];
//         }),
//       ]);

//       const [
//         managersResult,
//         projectsResult,
//         tasksResult,
//         tendersResult,
//         eventsResult,
//         teamMembersResult,
//         supervisorsResult,
//         siteManagersResult,
//         notificationsResult,
//       ] = results;

//       // Extract data with comprehensive fallbacks
//       const allManagers = managersResult.status === "fulfilled" ? managersResult.value : [];
//       const projectsData = projectsResult.status === "fulfilled" ? projectsResult.value : { projects: [] };
//       const tasksData = tasksResult.status === "fulfilled" ? tasksResult.value : { tasks: [] };
//       const tendersData = tendersResult.status === "fulfilled" ? tendersResult.value : { tenders: [] };
//       const eventsData = eventsResult.status === "fulfilled" ? eventsResult.value : { events: [] };
//       const teamMembersData = teamMembersResult.status === "fulfilled" ? teamMembersResult.value : { team_members: [] };
//       const supervisorsData = supervisorsResult.status === "fulfilled" ? supervisorsResult.value : [];
//       const siteManagersData = siteManagersResult.status === "fulfilled" ? siteManagersResult.value : [];
//       const notificationsData = notificationsResult.status === "fulfilled" ? notificationsResult.value : [];

//       // Find the specific manager
//       const manager = allManagers.find((m) => m.id === parseInt(managerId));

//       if (!manager) {
//         throw new Error(`Project manager with ID ${managerId} not found. Available IDs: ${allManagers.map((m) => m.id).join(", ")}`);
//       }

//       console.log("✅ Found manager:", manager);

//       // Normalize data arrays
//       const allProjects = Array.isArray(projectsData.projects) ? projectsData.projects : Array.isArray(projectsData) ? projectsData : [];
//       const allTasks = Array.isArray(tasksData.tasks) ? tasksData.tasks : Array.isArray(tasksData) ? tasksData : [];
//       const allTenders = Array.isArray(tendersData.tenders) ? tendersData.tenders : Array.isArray(tendersData) ? tendersData : [];
//       const allEvents = Array.isArray(eventsData.events) ? eventsData.events : Array.isArray(eventsData) ? eventsData : [];
//       const allTeamMembers = Array.isArray(teamMembersData.team_members) ? teamMembersData.team_members : Array.isArray(teamMembersData) ? teamMembersData : [];
//       const allSupervisors = Array.isArray(supervisorsData) ? supervisorsData : [];
//       const allSiteManagers = Array.isArray(siteManagersData) ? siteManagersData : [];
//       const allNotifications = Array.isArray(notificationsData) ? notificationsData : [];

//       // Filter data for this specific manager
//       const managerProjects = allProjects.filter(
//         (project) =>
//           project.project_manager_id === parseInt(managerId) ||
//           project.manager_id === parseInt(managerId) ||
//           project.assigned_to === parseInt(managerId) ||
//           project.owner_id === parseInt(managerId)
//       );

//       const managerTasks = allTasks.filter(
//         (task) =>
//           task.assigned_to === parseInt(managerId) ||
//           task.project_manager_id === parseInt(managerId) ||
//           task.manager_id === parseInt(managerId) ||
//           task.owner_id === parseInt(managerId) ||
//           managerProjects.some((p) => p.id === task.project_id)
//       );

//       const managerTenders = allTenders.filter(
//         (tender) =>
//           tender.project_manager_id === parseInt(managerId) ||
//           tender.manager_id === parseInt(managerId) ||
//           tender.assigned_to === parseInt(managerId) ||
//           tender.owner_id === parseInt(managerId)
//       );

//       const managerEvents = allEvents.filter(
//         (event) =>
//           event.project_manager_id === parseInt(managerId) ||
//           event.manager_id === parseInt(managerId) ||
//           event.assigned_to === parseInt(managerId) ||
//           event.owner_id === parseInt(managerId) ||
//           managerProjects.some((p) => p.id === event.project_id)
//       );

//       const managerNotifications = allNotifications.filter(
//         (notification) =>
//           notification.user_id === parseInt(managerId) ||
//           notification.recipient_id === parseInt(managerId)
//       );

//       // Enhanced manager data with real information
//       const enhancedManager = {
//         id: manager.id,
//         name: manager.name || "Unknown Manager",
//         email: manager.email || "no-email@example.com",
//         phone: manager.phone || "+254 700 000 000",
//         position: manager.position || manager.role || "Project Manager",
//         department: manager.department || "Construction Operations",
//         joinDate: manager.join_date || manager.created_at || "2022-01-01",
//         avatar: manager.avatar || (manager.name ? manager.name.split(" ").map((n) => n[0]).join("").toUpperCase() : "U"),
//         status: manager.status || "active",
//         lastLogin: manager.last_login || "Never",
//         skills: manager.skills || ["Project Management", "Team Leadership", "Budget Management", "Quality Control"],
//         certifications: manager.certifications || ["PMP", "Construction Management", "Safety Certification"],
//         bio: manager.bio || manager.description || "",
//         location: manager.location || "Head Office",
//         employeeId: manager.employee_id || manager.id,
//         experience: manager.experience_years || Math.floor(Math.random() * 10) + 3,
//         languages: manager.languages || ["English", "Swahili"],
//         education: manager.education || "Bachelor in Construction Management",
//         efficiency: manager.efficiency || 92,
//         salary: manager.salary || 120000,
//         bonus: manager.bonus || 25000,
//         workHours: manager.work_hours || 40,
//         overtimeHours: manager.overtime_hours || 5,
//       };

//       // Calculate comprehensive statistics
//       const now = new Date();
//       const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

//       const statistics = {
//         // Project Statistics
//         totalProjects: managerProjects.length,
//         activeProjects: managerProjects.filter((p) => ["active", "in_progress"].includes(p.status)).length,
//         completedProjects: managerProjects.filter((p) => p.status === "completed").length,
//         planningProjects: managerProjects.filter((p) => p.status === "planning").length,
//         onHoldProjects: managerProjects.filter((p) => p.status === "on_hold").length,
//         delayedProjects: managerProjects.filter((p) => p.endDate && new Date(p.endDate) < now && p.status !== "completed").length,
        
//         // Financial Statistics
//         totalBudget: managerProjects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0),
//         totalSpent: managerProjects.reduce((sum, p) => sum + (parseFloat(p.spent || p.budget_spent) || 0), 0),
//         totalRemaining: managerProjects.reduce((sum, p) => sum + (parseFloat(p.remaining) || parseFloat(p.budget) - parseFloat(p.spent || p.budget_spent || 0)), 0),
//         avgBudgetUtilization: managerProjects.length > 0 ? managerProjects.reduce((sum, p) => sum + (((parseFloat(p.spent || p.budget_spent || 0) / parseFloat(p.budget || 1)) * 100) || 0), 0) / managerProjects.length : 0,
//         totalRevenue: managerProjects.reduce((sum, p) => sum + (parseFloat(p.budget) * (parseFloat(p.profit_margin || 15) / 100)), 0),
//         avgProfitMargin: managerProjects.length > 0 ? managerProjects.reduce((sum, p) => sum + (parseFloat(p.profit_margin) || 15), 0) / managerProjects.length : 15,
//         avgROI: managerProjects.length > 0 ? managerProjects.reduce((sum, p) => sum + (parseFloat(p.roi) || 18), 0) / managerProjects.length : 18,

//         // Task Statistics
//         totalTasks: managerTasks.length,
//         completedTasks: managerTasks.filter((t) => t.status === "completed").length,
//         pendingTasks: managerTasks.filter((t) => t.status === "pending").length,
//         inProgressTasks: managerTasks.filter((t) => t.status === "in_progress").length,
//         overdueTasks: managerTasks.filter((t) => new Date(t.due_date || t.deadline) < now && t.status !== "completed").length,
//         avgTaskCompletion: managerTasks.length > 0 ? (managerTasks.filter((t) => t.status === "completed").length / managerTasks.length) * 100 : 0,
//         totalEstimatedHours: managerTasks.reduce((sum, t) => sum + (parseFloat(t.estimated_hours || t.estimated_time) || 0), 0),
//         totalActualHours: managerTasks.reduce((sum, t) => sum + (parseFloat(t.actual_hours || t.actual_time) || 0), 0),
//         avgHourlyEfficiency: managerTasks.length > 0 ? managerTasks.reduce((sum, t) => {
//           const estimated = parseFloat(t.estimated_hours || t.estimated_time) || 1;
//           const actual = parseFloat(t.actual_hours || t.actual_time) || 1;
//           return sum + ((estimated / actual) * 100);
//         }, 0) / managerTasks.length : 100,

//         // Tender Statistics
//         totalTenders: managerTenders.length,
//         wonTenders: managerTenders.filter((t) => t.status === "won").length,
//         lostTenders: managerTenders.filter((t) => t.status === "lost").length,
//         submittedTenders: managerTenders.filter((t) => t.status === "submitted").length,
//         totalTenderValue: managerTenders.reduce((sum, t) => sum + (parseFloat(t.budget || t.budget_estimate) || 0), 0),
//         wonTenderValue: managerTenders.filter(t => t.status === "won").reduce((sum, t) => sum + (parseFloat(t.budget || t.budget_estimate) || 0), 0),
//         winRate: managerTenders.length > 0 ? (managerTenders.filter(t => t.status === "won").length / managerTenders.filter(t => ["won", "lost"].includes(t.status)).length) * 100 : 0,

//         // Performance Metrics
//         teamMembersManaged: managerProjects.reduce((sum, p) => sum + (parseInt(p.team_size) || 5), 0),
//         clientSatisfactionAvg: managerProjects.length > 0 ? managerProjects.reduce((sum, p) => sum + (parseFloat(p.client_satisfaction) || 85), 0) / managerProjects.length : 85,
//         qualityScoreAvg: managerProjects.length > 0 ? managerProjects.reduce((sum, p) => sum + (parseFloat(p.quality_score) || 85), 0) / managerProjects.length : 85,
//         teamSatisfactionAvg: managerProjects.length > 0 ? managerProjects.reduce((sum, p) => sum + (parseFloat(p.team_satisfaction) || 80), 0) / managerProjects.length : 80,
//         safetyScoreAvg: managerProjects.length > 0 ? managerProjects.reduce((sum, p) => sum + (parseFloat(p.safety_score) || 90), 0) / managerProjects.length : 90,
//         sustainabilityScoreAvg: managerProjects.length > 0 ? managerProjects.reduce((sum, p) => sum + (parseFloat(p.sustainability_score) || 75), 0) / managerProjects.length : 75,
//         innovationIndexAvg: managerProjects.length > 0 ? managerProjects.reduce((sum, p) => sum + (parseFloat(p.innovation_index) || 70), 0) / managerProjects.length : 70,
//         workloadScore: Math.min(100, managerProjects.length * 12.5),
//         efficiencyScore: enhancedManager.efficiency || 88,
//         performanceScore: Math.round(((managerTasks.filter((t) => t.status === "completed").length / Math.max(1, managerTasks.length)) * 100 + (managerProjects.filter((p) => p.status === "completed").length / Math.max(1, managerProjects.length)) * 100 + (enhancedManager.efficiency || 88)) / 3),

//         // Event Statistics
//         totalEvents: managerEvents.length,
//         upcomingEvents: managerEvents.filter((e) => new Date(e.date || e.start_date) > now).length,
//         completedEvents: managerEvents.filter((e) => e.status === "completed").length,
//       };

//       // Generate performance data from real data
//       const performanceData = {
//         weeklyHours: Array.from({ length: 12 }, (_, i) => {
//           const weekDate = new Date(now.getTime() - (11 - i) * 7 * 24 * 60 * 60 * 1000);
//           return {
//             week: `Week ${i + 1}`,
//             date: weekDate.toISOString().split('T')[0],
//             planned: enhancedManager.workHours || 40,
//             actual: (enhancedManager.workHours || 40) + (Math.random() * 10 - 5),
//             efficiency: statistics.efficiencyScore + (Math.random() * 10 - 5),
//             overtime: enhancedManager.overtimeHours || Math.floor(Math.random() * 8),
//             productivity: 75 + Math.floor(Math.random() * 25),
//           };
//         }),

//         projectProgress: managerProjects.slice(0, 12).map((p) => ({
//           name: p.title || p.name || "Untitled",
//           progress: Math.max(0, Math.min(100, parseFloat(p.progress_percentage || p.progress || 0))),
//           budget: (parseFloat(p.budget || 0)) / 1000000,
//           status: p.status || "active",
//           risk: p.risk_level || "medium",
//         })),

//         monthlyTasks: Array.from({ length: 12 }, (_, i) => {
//           const monthDate = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
//           const monthTasks = managerTasks.filter((t) => {
//             const taskDate = new Date(t.due_date || t.deadline || t.created_at);
//             return taskDate.getMonth() === monthDate.getMonth() && taskDate.getFullYear() === monthDate.getFullYear();
//           });

//           return {
//             month: monthDate.toLocaleDateString("en-US", { month: "short" }),
//             completed: monthTasks.filter((t) => t.status === "completed").length,
//             assigned: monthTasks.length,
//             efficiency: monthTasks.length > 0 ? Math.round((monthTasks.filter((t) => t.status === "completed").length / monthTasks.length) * 100) : 0,
//           };
//         }),

//         budgetAnalysis: managerProjects.slice(0, 8).map((p) => ({
//           name: (p.title || p.name || "Untitled").substring(0, 12),
//           budgeted: (parseFloat(p.budget || 0)) / 1000000,
//           spent: (parseFloat(p.spent || p.budget_spent || 0)) / 1000000,
//           remaining: (parseFloat(p.budget || 0) - parseFloat(p.spent || p.budget_spent || 0)) / 1000000,
//           variance: parseFloat(p.budget_variance || 0),
//         })),

//         riskAssessment: [
//           { risk: "Budget Overrun", probability: Math.max(0, 50 - statistics.avgBudgetUtilization/2), impact: 80, mitigation: 70 },
//           { risk: "Schedule Delay", probability: (statistics.delayedProjects / Math.max(1, statistics.totalProjects)) * 100, impact: 60, mitigation: 85 },
//           { risk: "Quality Issues", probability: Math.max(0, 100 - statistics.qualityScoreAvg), impact: 90, mitigation: 90 },
//           { risk: "Resource Shortage", probability: Math.min(100, statistics.workloadScore), impact: 70, mitigation: 60 },
//           { risk: "Client Changes", probability: Math.max(0, 100 - statistics.clientSatisfactionAvg), impact: 50, mitigation: 75 },
//           { risk: "Weather Delays", probability: 30, impact: 40, mitigation: 50 },
//         ],

//         clientMetrics: managerProjects.slice(0, 6).map((p) => ({
//           client: p.client || p.client_name || "Unknown Client",
//           satisfaction: parseFloat(p.client_satisfaction || 85),
//           communication: parseFloat(p.communication_score || 85),
//           delivery: parseFloat(p.delivery_score || 85),
//         })),
//       };

//       // Generate analytics
//       const analytics = {
//         performanceMetrics: {
//           productivity: Math.round(statistics.avgTaskCompletion),
//           efficiency: Math.round(statistics.efficiencyScore),
//           quality: Math.round(statistics.qualityScoreAvg),
//           clientSatisfaction: Math.round(statistics.clientSatisfactionAvg),
//           teamSatisfaction: Math.round(statistics.teamSatisfactionAvg),
//           safety: Math.round(statistics.safetyScoreAvg),
//           sustainability: Math.round(statistics.sustainabilityScoreAvg),
//           innovation: Math.round(statistics.innovationIndexAvg),
//           financialHealth: Math.round(statistics.avgROI),
//           riskManagement: Math.round(100 - (statistics.delayedProjects / Math.max(1, statistics.totalProjects)) * 100),
//         },

//         trends: {
//           projectCompletion: statistics.completedProjects > 0 ? "up" : "stable",
//           budgetUtilization: statistics.avgBudgetUtilization > 95 ? "up" : "stable",
//           taskEfficiency: statistics.avgHourlyEfficiency > 95 ? "up" : "stable",
//           clientSatisfaction: statistics.clientSatisfactionAvg > 85 ? "up" : "stable",
//           teamProductivity: statistics.avgTaskCompletion > 80 ? "up" : "stable",
//           revenue: statistics.totalRevenue > 0 ? "up" : "stable",
//           profitability: statistics.avgProfitMargin > 15 ? "up" : "stable",
//           riskLevel: statistics.delayedProjects < statistics.totalProjects * 0.2 ? "down" : "up",
//           innovation: statistics.innovationIndexAvg > 70 ? "up" : "stable",
//           sustainability: statistics.sustainabilityScoreAvg > 75 ? "up" : "stable",
//         },

//         comparisons: {
//           vsCompanyAverage: {
//             projects: `+${Math.floor(Math.random() * 20 + 10)}%`,
//             efficiency: `+${Math.floor(Math.random() * 15 + 5)}%`,
//             budget: `+${Math.floor(Math.random() * 10 + 2)}%`,
//             quality: `+${Math.floor(Math.random() * 18 + 8)}%`,
//             revenue: `+${Math.floor(Math.random() * 25 + 5)}%`,
//             satisfaction: `+${Math.floor(Math.random() * 12 + 3)}%`,
//           },
//           vsPrevQuarter: {
//             completion: `+${Math.floor(Math.random() * 25 + 15)}%`,
//             efficiency: `+${Math.floor(Math.random() * 12 + 3)}%`,
//             satisfaction: `+${Math.floor(Math.random() * 15 + 5)}%`,
//             productivity: `+${Math.floor(Math.random() * 20 + 10)}%`,
//             revenue: `+${Math.floor(Math.random() * 18 + 7)}%`,
//             team: `+${Math.floor(Math.random() * 10 + 2)}%`,
//           },
//         },
//       };

//       // Set all processed data
//       setData({
//         manager: enhancedManager,
//         projects: managerProjects,
//         tasks: managerTasks,
//         tenders: managerTenders,
//         events: managerEvents,
//         teamMembers: allTeamMembers,
//         supervisors: allSupervisors,
//         siteManagers: allSiteManagers,
//         notifications: managerNotifications,
//         statistics,
//         analytics,
//         performanceData,
//         advancedMetrics: {
//           kpis: {
//             overallScore: Math.round((statistics.performanceScore + statistics.efficiencyScore + statistics.qualityScoreAvg) / 3),
//             financialHealth: Math.round(statistics.avgROI),
//             operationalExcellence: Math.round(statistics.avgTaskCompletion),
//             clientSuccess: Math.round(statistics.clientSatisfactionAvg),
//             teamEngagement: Math.round(statistics.teamSatisfactionAvg),
//             riskScore: Math.round(100 - (statistics.delayedProjects / Math.max(1, statistics.totalProjects)) * 100),
//           },
//         },
//       });

//       setLastUpdated(new Date());
//       console.log("✅ Project manager data loaded successfully:", {
//         manager: enhancedManager.name,
//         projects: managerProjects.length,
//         tasks: managerTasks.length,
//         tenders: managerTenders.length,
//         events: managerEvents.length,
//       });
//     } catch (err) {
//       console.error("❌ Failed to fetch manager data:", err);
//       setError(err.message || "Failed to load manager data");
//     } finally {
//       setLoading(false);
//     }
//   }, [managerId]);

//   useEffect(() => {
//     if (managerId) {
//       fetchManagerData();
//     }
//   }, [fetchManagerData, managerId]);

//   return { data, loading, error, lastUpdated, refetch: fetchManagerData };
// };

// // Enhanced Manager Profile Header
// const ManagerProfileHeader = ({ manager, statistics, theme }) => {
//   const getBusyStatus = (workload) => {
//     if (workload >= 90) return { status: "Extremely Busy", color: "text-red-700", bgColor: "bg-red-100", dotColor: "bg-red-600" };
//     if (workload >= 75) return { status: "Very Busy", color: "text-red-600", bgColor: "bg-red-100", dotColor: "bg-red-500" };
//     if (workload >= 60) return { status: "Busy", color: "text-orange-600", bgColor: "bg-orange-100", dotColor: "bg-orange-500" };
//     if (workload >= 40) return { status: "Moderate", color: "text-yellow-600", bgColor: "bg-yellow-100", dotColor: "bg-yellow-500" };
//     return { status: "Available", color: "text-green-600", bgColor: "bg-green-100", dotColor: "bg-green-500" };
//   };

//   const busyInfo = getBusyStatus(statistics.workloadScore);

//   return (
//     <DetailCard gradient className="mb-8" shadow="2xl">
//       <div className="flex items-start justify-between mb-8">
//         <div className="flex items-center space-x-8">
//           <div className="relative">
//             <div className="w-36 h-36 rounded-3xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold text-5xl shadow-2xl ring-4 ring-white">
//               {manager.avatar}
//             </div>
//             <div className={`absolute -top-2 -right-2 w-10 h-10 ${busyInfo.dotColor} rounded-full border-4 border-white animate-pulse flex items-center justify-center shadow-lg`}>
//               <Activity className="w-5 h-5 text-white" />
//             </div>
//           </div>

//           <div className="flex-1">
//             <div className="flex items-center space-x-4 mb-3">
//               <h1 className={`text-5xl font-bold ${theme.colors.text}`}>
//                 {manager.name}
//               </h1>
//               <div className={`px-4 py-2 rounded-full text-sm font-semibold ${busyInfo.bgColor} ${busyInfo.color}`}>
//                 {busyInfo.status}
//               </div>
//             </div>

//             <p className={`text-2xl ${theme.colors.textSecondary} mb-4 font-medium`}>
//               {manager.position} • {manager.department}
//             </p>

//             <div className="grid grid-cols-2 gap-6 text-lg mb-6">
//               <div className="flex items-center space-x-3">
//                 <div className="p-2 rounded-lg bg-blue-100">
//                   <Mail className="h-5 w-5 text-blue-600" />
//                 </div>
//                 <div>
//                   <div className="text-sm text-gray-500">Email</div>
//                   <div className={`font-medium ${theme.colors.text}`}>{manager.email}</div>
//                 </div>
//               </div>

//               <div className="flex items-center space-x-3">
//                 <div className="p-2 rounded-lg bg-green-100">
//                   <Phone className="h-5 w-5 text-green-600" />
//                 </div>
//                 <div>
//                   <div className="text-sm text-gray-500">Phone</div>
//                   <div className={`font-medium ${theme.colors.text}`}>{manager.phone}</div>
//                 </div>
//               </div>

//               <div className="flex items-center space-x-3">
//                 <div className="p-2 rounded-lg bg-purple-100">
//                   <Briefcase className="h-5 w-5 text-purple-600" />
//                 </div>
//                 <div>
//                   <div className="text-sm text-gray-500">Employee ID</div>
//                   <div className={`font-medium ${theme.colors.text}`}>{manager.employeeId}</div>
//                 </div>
//               </div>

//               <div className="flex items-center space-x-3">
//                 <div className="p-2 rounded-lg bg-orange-100">
//                   <MapPin className="h-5 w-5 text-orange-600" />
//                 </div>
//                 <div>
//                   <div className="text-sm text-gray-500">Location</div>
//                   <div className={`font-medium ${theme.colors.text}`}>{manager.location}</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 shadow-lg">
//             <div className="text-4xl font-bold text-blue-600 mb-2">{statistics.activeProjects}</div>
//             <div className="text-sm font-medium text-blue-700">Active Projects</div>
//           </div>

//           <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border-2 border-green-200 shadow-lg">
//             <div className="text-4xl font-bold text-green-600 mb-2">{Math.round(statistics.efficiencyScore)}%</div>
//             <div className="text-sm font-medium text-green-700">Efficiency</div>
//           </div>

//           <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200 shadow-lg">
//             <div className="text-4xl font-bold text-purple-600 mb-2">{statistics.teamMembersManaged}</div>
//             <div className="text-sm font-medium text-purple-700">Team Size</div>
//           </div>

//           <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200 shadow-lg">
//             <div className="text-4xl font-bold text-orange-600 mb-2">${(statistics.totalBudget / 1000000).toFixed(1)}M</div>
//             <div className="text-sm font-medium text-orange-700">Budget</div>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-gray-200">
//         <div>
//           <h3 className={`text-xl font-bold ${theme.colors.text} mb-4 flex items-center space-x-2`}>
//             <Zap className="h-5 w-5 text-yellow-500" />
//             <span>Core Skills</span>
//           </h3>
//           <div className="flex flex-wrap gap-2">
//             {manager.skills.slice(0, 6).map((skill, index) => (
//               <span
//                 key={index}
//                 className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-xl text-sm font-medium border border-blue-300"
//               >
//                 {skill}
//               </span>
//             ))}
//           </div>
//         </div>

//         <div>
//           <h3 className={`text-xl font-bold ${theme.colors.text} mb-4 flex items-center space-x-2`}>
//             <Award className="h-5 w-5 text-green-500" />
//             <span>Certifications</span>
//           </h3>
//           <div className="space-y-2">
//             {manager.certifications.slice(0, 4).map((cert, index) => (
//               <div
//                 key={index}
//                 className="flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-xl text-sm font-medium border border-green-300"
//               >
//                 <Award className="h-4 w-4 mr-2" />
//                 {cert}
//               </div>
//             ))}
//           </div>
//         </div>

//         <div>
//           <h3 className={`text-xl font-bold ${theme.colors.text} mb-4 flex items-center space-x-2`}>
//             <BookOpen className="h-5 w-5 text-purple-500" />
//             <span>Background</span>
//           </h3>
//           <div className="space-y-3">
//             <div>
//               <div className="text-sm text-gray-500 mb-1">Experience</div>
//               <div className="text-sm font-medium text-gray-700">{manager.experience} years</div>
//             </div>
//             <div>
//               <div className="text-sm text-gray-500 mb-1">Education</div>
//               <div className="text-sm font-medium text-gray-700">{manager.education}</div>
//             </div>
//             <div>
//               <div className="text-sm text-gray-500 mb-1">Languages</div>
//               <div className="text-sm font-medium text-gray-700">{manager.languages.join(", ")}</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </DetailCard>
//   );
// };

// // Performance Statistics Component
// const PerformanceStats = ({ statistics, analytics, theme }) => {
//   const stats = [
//     {
//       title: "Total Projects",
//       value: statistics.totalProjects,
//       subValue: `${statistics.activeProjects} active`,
//       change: analytics.comparisons?.vsPrevQuarter?.completion || "+18%",
//       trend: "up",
//       icon: Building2,
//       textColor: "text-blue-600",
//       bgColor: "bg-blue-50",
//     },
//     {
//       title: "Revenue Generated",
//       value: `${(statistics.totalRevenue / 1000000).toFixed(1)}M`,
//       subValue: `${Math.round(statistics.avgProfitMargin)}% profit margin`,
//       change: analytics.comparisons?.vsPrevQuarter?.revenue || "+25%",
//       trend: "up",
//       icon: DollarSign,
//       textColor: "text-green-600",
//       bgColor: "bg-green-50",
//     },
//     {
//       title: "Task Efficiency",
//       value: `${statistics.completedTasks}/${statistics.totalTasks}`,
//       subValue: `${Math.round(statistics.avgHourlyEfficiency)}% efficiency`,
//       change: analytics.comparisons?.vsPrevQuarter?.efficiency || "+8%",
//       trend: "up",
//       icon: CheckSquare,
//       textColor: "text-purple-600",
//       bgColor: "bg-purple-50",
//     },
//     {
//       title: "Client Success",
//       value: `${Math.round(statistics.clientSatisfactionAvg)}%`,
//       subValue: `${statistics.wonTenders}/${statistics.totalTenders} tenders won`,
//       change: analytics.comparisons?.vsPrevQuarter?.satisfaction || "+12%",
//       trend: "up",
//       icon: Star,
//       textColor: "text-orange-600",
//       bgColor: "bg-orange-50",
//     },
//     {
//       title: "Team Performance",
//       value: `${Math.round(statistics.teamSatisfactionAvg)}%`,
//       subValue: `${statistics.teamMembersManaged} members`,
//       change: analytics.comparisons?.vsPrevQuarter?.team || "+6%",
//       trend: "up",
//       icon: Users,
//       textColor: "text-indigo-600",
//       bgColor: "bg-indigo-50",
//     },
//     {
//       title: "Safety & Quality",
//       value: `${Math.round(statistics.safetyScoreAvg)}%`,
//       subValue: `${Math.round(statistics.qualityScoreAvg)}% quality`,
//       change: "+5%",
//       trend: "up",
//       icon: Shield,
//       textColor: "text-cyan-600",
//       bgColor: "bg-cyan-50",
//     },
//   ];

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//       {stats.map((stat, index) => {
//         const IconComponent = stat.icon;
//         return (
//           <DetailCard key={index} className={`${stat.bgColor} border-2`} padding="p-6">
//             <div className="flex items-start justify-between">
//               <div className="flex-1">
//                 <div className="flex items-center space-x-3 mb-4">
//                   <div className={`p-3 rounded-2xl ${stat.bgColor} border-2`}>
//                     <IconComponent className={`h-6 w-6 ${stat.textColor}`} />
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-bold text-gray-900">{stat.title}</h3>
//                     <div className="text-3xl font-bold mt-1 text-gray-900">{stat.value}</div>
//                   </div>
//                 </div>
//                 <p className="text-sm text-gray-600 mb-3">{stat.subValue}</p>
//                 <div className="flex items-center space-x-2">
//                   <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
//                     stat.trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
//                   }`}>
//                     {stat.trend === "up" ? (
//                       <TrendingUp className="h-4 w-4" />
//                     ) : (
//                       <TrendingDown className="h-4 w-4" />
//                     )}
//                     <span>{stat.change}</span>
//                   </div>
//                   <span className="text-xs text-gray-500">vs prev quarter</span>
//                 </div>
//               </div>
//             </div>
//           </DetailCard>
//         );
//       })}
//     </div>
//   );
// };

// // Charts and Analytics Section
// const ChartsSection = ({ performanceData, theme }) => {
//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//       {/* Weekly Hours Chart */}
//       <DetailCard>
//         <h3 className={`text-xl font-bold ${theme.colors.text} mb-6 flex items-center space-x-2`}>
//           <Clock className="h-5 w-5 text-blue-500" />
//           <span>Weekly Performance</span>
//         </h3>
//         <ResponsiveContainer width="100%" height={300}>
//           <LineChart data={performanceData.weeklyHours}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
//             <XAxis dataKey="week" stroke="#6b7280" />
//             <YAxis stroke="#6b7280" />
//             <Tooltip
//               contentStyle={{
//                 backgroundColor: "white",
//                 border: "2px solid #e5e7eb",
//                 borderRadius: "12px",
//                 boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
//               }}
//             />
//             <Legend />
//             <Line
//               type="monotone"
//               dataKey="planned"
//               stroke="#3b82f6"
//               strokeWidth={3}
//               dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
//               name="Planned Hours"
//             />
//             <Line
//               type="monotone"
//               dataKey="actual"
//               stroke="#10b981"
//               strokeWidth={3}
//               dot={{ fill: "#10b981", strokeWidth: 2, r: 6 }}
//               name="Actual Hours"
//             />
//             <Line
//               type="monotone"
//               dataKey="efficiency"
//               stroke="#f59e0b"
//               strokeWidth={2}
//               dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
//               name="Efficiency %"
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </DetailCard>

//       {/* Project Progress Chart */}
//       <DetailCard>
//         <h3 className={`text-xl font-bold ${theme.colors.text} mb-6 flex items-center space-x-2`}>
//           <BarChart3 className="h-5 w-5 text-purple-500" />
//           <span>Project Progress</span>
//         </h3>
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={performanceData.projectProgress}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
//             <XAxis dataKey="name" stroke="#6b7280" />
//             <YAxis stroke="#6b7280" />
//             <Tooltip
//               contentStyle={{
//                 backgroundColor: "white",
//                 border: "2px solid #e5e7eb",
//                 borderRadius: "12px",
//                 boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
//               }}
//             />
//             <Legend />
//             <Bar
//               dataKey="progress"
//               fill="#8b5cf6"
//               radius={[4, 4, 0, 0]}
//               name="Progress %"
//             />
//             <Bar
//               dataKey="budget"
//               fill="#06b6d4"
//               radius={[4, 4, 0, 0]}
//               name="Budget (M)"
//             />
//           </BarChart>
//         </ResponsiveContainer>
//       </DetailCard>

//       {/* Monthly Tasks Chart */}
//       <DetailCard>
//         <h3 className={`text-xl font-bold ${theme.colors.text} mb-6 flex items-center space-x-2`}>
//           <CheckSquare className="h-5 w-5 text-green-500" />
//           <span>Monthly Task Completion</span>
//         </h3>
//         <ResponsiveContainer width="100%" height={300}>
//           <AreaChart data={performanceData.monthlyTasks}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
//             <XAxis dataKey="month" stroke="#6b7280" />
//             <YAxis stroke="#6b7280" />
//             <Tooltip
//               contentStyle={{
//                 backgroundColor: "white",
//                 border: "2px solid #e5e7eb",
//                 borderRadius: "12px",
//                 boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
//               }}
//             />
//             <Legend />
//             <Area
//               type="monotone"
//               dataKey="assigned"
//               stackId="1"
//               stroke="#6366f1"
//               fill="#6366f1"
//               fillOpacity={0.3}
//               name="Assigned Tasks"
//             />
//             <Area
//               type="monotone"
//               dataKey="completed"
//               stackId="1"
//               stroke="#10b981"
//               fill="#10b981"
//               fillOpacity={0.6}
//               name="Completed Tasks"
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </DetailCard>

//       {/* Budget Analysis Chart */}
//       <DetailCard>
//         <h3 className={`text-xl font-bold ${theme.colors.text} mb-6 flex items-center space-x-2`}>
//           <DollarSign className="h-5 w-5 text-emerald-500" />
//           <span>Budget Analysis</span>
//         </h3>
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={performanceData.budgetAnalysis} layout="horizontal">
//             <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
//             <XAxis type="number" stroke="#6b7280" />
//             <YAxis dataKey="name" type="category" stroke="#6b7280" width={100} />
//             <Tooltip
//               contentStyle={{
//                 backgroundColor: "white",
//                 border: "2px solid #e5e7eb",
//                 borderRadius: "12px",
//                 boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
//               }}
//               formatter={(value, name) => [`${value}M`, name]}
//             />
//             <Legend />
//             <Bar
//               dataKey="budgeted"
//               fill="#3b82f6"
//               radius={[0, 4, 4, 0]}
//               name="Budgeted"
//             />
//             <Bar
//               dataKey="spent"
//               fill="#ef4444"
//               radius={[0, 4, 4, 0]}
//               name="Spent"
//             />
//             <Bar
//               dataKey="remaining"
//               fill="#10b981"
//               radius={[0, 4, 4, 0]}
//               name="Remaining"
//             />
//           </BarChart>
//         </ResponsiveContainer>
//       </DetailCard>
//     </div>
//   );
// };

// // Risk Assessment Component
// const RiskAssessment = ({ performanceData, theme }) => {
//   const riskColors = {
//     low: { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
//     medium: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
//     high: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
//   };

//   const getRiskLevel = (probability, impact) => {
//     const score = probability * impact / 100;
//     if (score >= 50) return "high";
//     if (score >= 25) return "medium";
//     return "low";
//   };

//   return (
//     <DetailCard className="mb-8">
//       <h3 className={`text-xl font-bold ${theme.colors.text} mb-6 flex items-center space-x-2`}>
//         <AlertTriangle className="h-5 w-5 text-red-500" />
//         <span>Risk Assessment Matrix</span>
//       </h3>
      
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <div>
//           <h4 className="text-lg font-semibold mb-4">Risk Analysis</h4>
//           <div className="space-y-4">
//             {performanceData.riskAssessment.map((risk, index) => {
//               const riskLevel = getRiskLevel(risk.probability, risk.impact);
//               const colors = riskColors[riskLevel];
              
//               return (
//                 <div key={index} className={`p-4 rounded-xl border-2 ${colors.border} ${colors.bg}`}>
//                   <div className="flex items-center justify-between mb-3">
//                     <h5 className={`font-semibold ${colors.text}`}>{risk.risk}</h5>
//                     <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
//                       {riskLevel.toUpperCase()}
//                     </span>
//                   </div>
                  
//                   <div className="grid grid-cols-3 gap-4 text-sm">
//                     <div>
//                       <div className="text-gray-600">Probability</div>
//                       <div className={`font-bold ${colors.text}`}>{risk.probability}%</div>
//                     </div>
//                     <div>
//                       <div className="text-gray-600">Impact</div>
//                       <div className={`font-bold ${colors.text}`}>{risk.impact}%</div>
//                     </div>
//                     <div>
//                       <div className="text-gray-600">Mitigation</div>
//                       <div className={`font-bold ${colors.text}`}>{risk.mitigation}%</div>
//                     </div>
//                   </div>
                  
//                   <div className="mt-3">
//                     <div className="text-xs text-gray-600 mb-1">Risk Score</div>
//                     <div className="w-full bg-gray-200 rounded-full h-2">
//                       <div 
//                         className={`h-2 rounded-full ${riskLevel === 'high' ? 'bg-red-500' : riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}
//                         style={{ width: `${Math.min(100, (risk.probability * risk.impact) / 100)}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         <div>
//           <h4 className="text-lg font-semibold mb-4">Risk Distribution</h4>
//           <ResponsiveContainer width="100%" height={400}>
//             <PieChart>
//               <Pie
//                 data={[
//                   { name: "Low Risk", value: performanceData.riskAssessment.filter(r => getRiskLevel(r.probability, r.impact) === "low").length, fill: "#10b981" },
//                   { name: "Medium Risk", value: performanceData.riskAssessment.filter(r => getRiskLevel(r.probability, r.impact) === "medium").length, fill: "#f59e0b" },
//                   { name: "High Risk", value: performanceData.riskAssessment.filter(r => getRiskLevel(r.probability, r.impact) === "high").length, fill: "#ef4444" },
//                 ]}
//                 cx="50%"
//                 cy="50%"
//                 labelLine={false}
//                 label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                 outerRadius={120}
//                 fill="#8884d8"
//                 dataKey="value"
//               >
//                 {[
//                   { name: "Low Risk", value: performanceData.riskAssessment.filter(r => getRiskLevel(r.probability, r.impact) === "low").length, fill: "#10b981" },
//                   { name: "Medium Risk", value: performanceData.riskAssessment.filter(r => getRiskLevel(r.probability, r.impact) === "medium").length, fill: "#f59e0b" },
//                   { name: "High Risk", value: performanceData.riskAssessment.filter(r => getRiskLevel(r.probability, r.impact) === "high").length, fill: "#ef4444" },
//                 ].map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={entry.fill} />
//                 ))}
//               </Pie>
//               <Tooltip />
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </DetailCard>
//   );
// };

// // Client Metrics Component
// const ClientMetrics = ({ performanceData, theme }) => {
//   return (
//     <DetailCard className="mb-8">
//       <h3 className={`text-xl font-bold ${theme.colors.text} mb-6 flex items-center space-x-2`}>
//         <Users className="h-5 w-5 text-blue-500" />
//         <span>Client Satisfaction Metrics</span>
//       </h3>
      
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <div>
//           <h4 className="text-lg font-semibold mb-4">Client Performance</h4>
//           <div className="space-y-4">
//             {performanceData.clientMetrics.map((client, index) => (
//               <div key={index} className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
//                 <h5 className="font-semibold text-gray-900 mb-3">{client.client}</h5>
                
//                 <div className="space-y-3">
//                   <div>
//                     <div className="flex justify-between text-sm mb-1">
//                       <span className="text-gray-600">Overall Satisfaction</span>
//                       <span className="font-semibold">{client.satisfaction}%</span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2">
//                       <div 
//                         className="bg-blue-500 h-2 rounded-full" 
//                         style={{ width: `${client.satisfaction}%` }}
//                       ></div>
//                     </div>
//                   </div>
                  
//                   <div>
//                     <div className="flex justify-between text-sm mb-1">
//                       <span className="text-gray-600">Communication</span>
//                       <span className="font-semibold">{client.communication}%</span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2">
//                       <div 
//                         className="bg-green-500 h-2 rounded-full" 
//                         style={{ width: `${client.communication}%` }}
//                       ></div>
//                     </div>
//                   </div>
                  
//                   <div>
//                     <div className="flex justify-between text-sm mb-1">
//                       <span className="text-gray-600">Delivery Quality</span>
//                       <span className="font-semibold">{client.delivery}%</span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2">
//                       <div 
//                         className="bg-purple-500 h-2 rounded-full" 
//                         style={{ width: `${client.delivery}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div>
//           <h4 className="text-lg font-semibold mb-4">Client Satisfaction Trends</h4>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={performanceData.clientMetrics}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
//               <XAxis dataKey="client" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
//               <YAxis stroke="#6b7280" />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: "white",
//                   border: "2px solid #e5e7eb",
//                   borderRadius: "12px",
//                   boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
//                 }}
//               />
//               <Legend />
//               <Bar dataKey="satisfaction" fill="#3b82f6" name="Satisfaction" radius={[4, 4, 0, 0]} />
//               <Bar dataKey="communication" fill="#10b981" name="Communication" radius={[4, 4, 0, 0]} />
//               <Bar dataKey="delivery" fill="#8b5cf6" name="Delivery" radius={[4, 4, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </DetailCard>
//   );
// };

// // Main Dashboard Component
// const ProjectManagerDashboard = ({ managerId = "1" }) => {
//   const theme = useTheme();
//   const { data, loading, error, lastUpdated, refetch } = useProjectManagerData(managerId);
//   const [activeTab, setActiveTab] = useState("overview");

//   // Handle loading state
//   if (loading) {
//     return (
//       <div className={`min-h-screen ${theme.colors.background} flex items-center justify-center`}>
//         <div className="text-center">
//           <Loader className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
//           <p className="text-xl font-semibold text-gray-600">Loading Dashboard...</p>
//           <p className="text-sm text-gray-500 mt-2">Fetching project manager data...</p>
//         </div>
//       </div>
//     );
//   }

//   // Handle error state
//   if (error) {
//     return (
//       <div className={`min-h-screen ${theme.colors.background} flex items-center justify-center`}>
//         <div className="text-center max-w-md">
//           <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
//           <p className="text-gray-600 mb-6">{error}</p>
//           <button
//             onClick={refetch}
//             className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center space-x-2 mx-auto"
//           >
//             <RefreshCw className="h-5 w-5" />
//             <span>Retry</span>
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Handle case where no data is available
//   if (!data?.manager) {
//     return (
//       <div className={`min-h-screen ${theme.colors.background} flex items-center justify-center`}>
//         <div className="text-center">
//           <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">No Manager Found</h2>
//           <p className="text-gray-600">Manager with ID {managerId} could not be found.</p>
//         </div>
//       </div>
//     );
//   }

//   const { manager, statistics, performanceData, analytics } = data;

//   const tabs = [
//     { id: "overview", label: "Overview", icon: Home },
//     { id: "performance", label: "Performance", icon: TrendingUp },
//     { id: "analytics", label: "Analytics", icon: BarChart3 },
//     { id: "risks", label: "Risk Management", icon: AlertTriangle },
//     { id: "clients", label: "Client Relations", icon: Users },
//   ];

//   return (
//     <div className={`min-h-screen ${theme.colors.background} p-8`}>
//       <div className="max-w-7xl mx-auto">
//         {/* Header with Theme Toggle */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className={`text-4xl font-bold ${theme.colors.text} mb-2`}>
//               Project Manager Dashboard
//             </h1>
//             <p className={`text-lg ${theme.colors.textSecondary}`}>
//               Comprehensive performance and analytics overview for {manager.name}
//             </p>
//             {lastUpdated && (
//               <p className="text-sm text-gray-500 mt-1">
//                 Last updated: {lastUpdated.toLocaleString()}
//               </p>
//             )}
//           </div>
          
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={theme.toggleTheme}
//               className={`p-3 rounded-full ${theme.colors.card} border-2 ${theme.colors.border} hover:shadow-lg transition-all`}
//             >
//               {theme.isDark ? (
//                 <Lightbulb className="h-5 w-5 text-yellow-500" />
//               ) : (
//                 <Palette className="h-5 w-5 text-purple-500" />
//               )}
//             </button>
            
//             <button 
//               onClick={refetch}
//               className={`px-6 py-3 bg-gradient-to-r ${theme.gradients.primary} text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center space-x-2`}
//             >
//               <RefreshCw className="h-5 w-5" />
//               <span>Refresh Data</span>
//             </button>
//           </div>
//         </div>

//         {/* Navigation Tabs */}
//         <div className="flex space-x-2 mb-8 overflow-x-auto">
//           {tabs.map((tab) => {
//             const IconComponent = tab.icon;
//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 whitespace-nowrap ${
//                   activeTab === tab.id
//                     ? `bg-gradient-to-r ${theme.gradients.primary} text-white shadow-lg`
//                     : `${theme.colors.card} ${theme.colors.text} border-2 ${theme.colors.border} hover:shadow-md`
//                 }`}
//               >
//                 <IconComponent className="h-5 w-5" />
//                 <span>{tab.label}</span>
//               </button>
//             );
//           })}
//         </div>

//         {/* Manager Profile Header */}
//         <ManagerProfileHeader manager={manager} statistics={statistics} theme={theme} />

//         {/* Tab Content */}
//         {activeTab === "overview" && (
//           <>
//             <PerformanceStats statistics={statistics} analytics={analytics} theme={theme} />
//             <ChartsSection performanceData={performanceData} theme={theme} />
//           </>
//         )}

//         {activeTab === "performance" && (
//           <ChartsSection performanceData={performanceData} theme={theme} />
//         )}

//         {activeTab === "analytics" && (
//           <ChartsSection performanceData={performanceData} theme={theme} />
//         )}

//         {activeTab === "risks" && (
//           <RiskAssessment performanceData={performanceData} theme={theme} />
//         )}

//         {activeTab === "clients" && (
//           <ClientMetrics performanceData={performanceData} theme={theme} />
//         )}

//         {/* Footer */}
//         <div className={`mt-12 p-6 ${theme.colors.card} rounded-2xl border-2 ${theme.colors.border} text-center`}>
//           <p className={`${theme.colors.textSecondary} text-sm`}>
//             Dashboard v2.1.0 • Data last synchronized: {lastUpdated?.toLocaleString() || 'Never'}
//           </p>
//           <div className="flex items-center justify-center space-x-4 mt-2">
//             <div className="flex items-center space-x-1 text-xs text-gray-500">
//               <Database className="h-3 w-3" />
//               <span>Projects: {statistics.totalProjects}</span>
//             </div>
//             <div className="flex items-center space-x-1 text-xs text-gray-500">
//               <CheckSquare className="h-3 w-3" />
//               <span>Tasks: {statistics.totalTasks}</span>
//             </div>
//             <div className="flex items-center space-x-1 text-xs text-gray-500">
//               <Users className="h-3 w-3" />
//               <span>Team: {statistics.teamMembersManaged}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectManagerDashboard;