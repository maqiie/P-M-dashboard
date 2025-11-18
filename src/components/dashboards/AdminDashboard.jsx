import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// Optional Sidebar import
let Sidebar = null;
try {
  Sidebar = require('../../components/Sidebar').default;
} catch (e) {
  try {
    Sidebar = require('./Sidebar').default;
  } catch (err) {
    console.warn('Sidebar component not found - dashboard will work in fullscreen mode');
  }
}
import AdminSidebar from "../../pages/admin/AdminSidebar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  Clock,
  Users,
  Building2,
  TrendingUp,
  RefreshCw,
  Plus,
  AlertTriangle,
  Activity,
  DollarSign,
  Target,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Briefcase,
  HardHat,
  Clipboard,
  X,
  Menu,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  FileText,
  CheckCircle2,
  PlayCircle,
  Zap,
  Award,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
// Import API services
import {
  fetchProjectManagers,
  projectsAPI,
  tendersAPI,
  tasksAPI,
  eventsAPI,
  supervisorsAPI,
  siteManagersAPI,
  notificationsAPI,
  calendarAPI,
  dashboardAPI,
} from "../../services/api";

// Modern Color Palette
const MODERN_COLORS = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    900: '#0c4a6e',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  }
};

const CHART_COLORS = {
  primary: ["#0ea5e9", "#0284c7", "#0369a1", "#0c4a6e"],
  success: ["#22c55e", "#16a34a", "#15803d", "#166534"],
  warning: ["#f59e0b", "#d97706", "#b45309", "#92400e"],
  danger: ["#ef4444", "#dc2626", "#b91c1c", "#991b1b"],
  purple: ["#a855f7", "#9333ea", "#7c3aed", "#6d28d9"],
  cyan: ["#06b6d4", "#0891b2", "#0e7490", "#155e75"],
};

// Custom Hooks
const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return currentTime;
};

// Real API Data Hook
const useDashboardData = () => {
  const [data, setData] = useState({
    statistics: {},
    projects: [],
    managers: [],
    events: [],
    tasks: [],
    tenders: [],
    supervisors: [],
    siteManagers: [],
    notifications: [],
    chartData: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch all data from APIs
      const [
        dashboardResponse,
        projectsResponse,
        managersResponse,
        eventsResponse,
        tasksResponse,
        tendersResponse,
        supervisorsResponse,
        siteManagersResponse,
        notificationsResponse,
        calendarEventsResponse,
      ] = await Promise.allSettled([
        dashboardAPI.getDashboard().catch(() => ({})),
        projectsAPI.getAll().catch(() => ({ projects: [] })),
        fetchProjectManagers().catch(() => []),
        eventsAPI.getUpcoming(20).catch(() => ({ events: [] })),
        tasksAPI.getAll().catch(() => ({ tasks: [] })),
        tendersAPI.getAll().catch(() => ({ tenders: [] })),
        supervisorsAPI.getAll().catch(() => []),
        siteManagersAPI.getAll().catch(() => []),
        notificationsAPI.getAll().catch(() => []),
        calendarAPI.getTodayEvents().catch(() => []),
      ]);

      // Process API responses
      const dashboard = dashboardResponse.status === "fulfilled" ? dashboardResponse.value : {};
      const projectsData = projectsResponse.status === "fulfilled" ? projectsResponse.value : { projects: [] };
      const managersData = managersResponse.status === "fulfilled" ? managersResponse.value : [];
      const eventsData = eventsResponse.status === "fulfilled" ? eventsResponse.value : { events: [] };
      const tasksData = tasksResponse.status === "fulfilled" ? tasksResponse.value : { tasks: [] };
      const tendersData = tendersResponse.status === "fulfilled" ? tendersResponse.value : { tenders: [] };
      const supervisorsData = supervisorsResponse.status === "fulfilled" ? supervisorsResponse.value : [];
      const siteManagersData = siteManagersResponse.status === "fulfilled" ? siteManagersResponse.value : [];
      const notificationsData = notificationsResponse.status === "fulfilled" ? notificationsResponse.value : [];
      const calendarEventsData = calendarEventsResponse.status === "fulfilled" ? calendarEventsResponse.value : [];

      // Normalize data arrays
      const projects = Array.isArray(projectsData.projects) ? projectsData.projects : Array.isArray(projectsData) ? projectsData : [];
      const events = Array.isArray(eventsData.events) ? eventsData.events : Array.isArray(eventsData) ? eventsData : [];
      const tasks = Array.isArray(tasksData.tasks) ? tasksData.tasks : Array.isArray(tasksData) ? tasksData : [];
      const tenders = Array.isArray(tendersData.tenders) ? tendersData.tenders : Array.isArray(tendersData) ? tendersData : [];
      const supervisors = Array.isArray(supervisorsData) ? supervisorsData : [];
      const siteManagers = Array.isArray(siteManagersData) ? siteManagersData : [];
      const notifications = Array.isArray(notificationsData) ? notificationsData : [];
      const todayEvents = Array.isArray(calendarEventsData) ? calendarEventsData : [];

      // Process managers data
      const managers = Array.isArray(managersData)
        ? managersData.map((manager) => ({
            id: manager.id || Math.random().toString(),
            name: manager.name || "Unknown Manager",
            email: manager.email || "unknown@email.com",
            projectsCount: manager.number_of_projects || 0,
            workload: Math.min(100, (manager.number_of_projects || 0) * 25),
            efficiency: 85 + Math.random() * 15,
            avatar: manager.name?.split(" ").map((n) => n[0]).join("") || "M",
            role: "Manager",
            performance: 75 + Math.random() * 25,
          }))
        : [];

      // Process supervisors data
      const processedSupervisors = supervisors.map((supervisor) => ({
        id: supervisor.id || Math.random().toString(),
        name: supervisor.name || "Unknown Supervisor",
        email: supervisor.email || "unknown@email.com",
        projectsCount: supervisor.number_of_projects || Math.floor(Math.random() * 8) + 1,
        workload: Math.min(100, (supervisor.number_of_projects || Math.floor(Math.random() * 8) + 1) * 20),
        efficiency: 80 + Math.random() * 20,
        avatar: supervisor.name?.split(" ").map((n) => n[0]).join("") || "S",
        role: "Supervisor",
        performance: 70 + Math.random() * 30,
      }));

      // Process site managers data
      const processedSiteManagers = siteManagers.map((siteManager) => ({
        id: siteManager.id || Math.random().toString(),
        name: siteManager.name || "Unknown Site Manager",
        email: siteManager.email || "unknown@email.com",
        projectsCount: siteManager.number_of_projects || Math.floor(Math.random() * 6) + 1,
        workload: Math.min(100, (siteManager.number_of_projects || Math.floor(Math.random() * 6) + 1) * 25),
        efficiency: 85 + Math.random() * 15,
        avatar: siteManager.name?.split(" ").map((n) => n[0]).join("") || "SM",
        role: "Site Manager",
        performance: 75 + Math.random() * 25,
      }));

      // Calculate statistics
      const statistics = {
        totalProjects: projects.length || 0,
        activeProjects: projects.filter((p) => p.status === "active" || p.status === "in_progress").length || 0,
        completedProjects: projects.filter((p) => p.status === "completed").length || 0,
        totalTasks: tasks.length || 0,
        completedTasks: tasks.filter((t) => t.status === "completed").length || 0,
        pendingTasks: tasks.filter((t) => t.status === "pending").length || 0,
        overdueTasks: tasks.filter((t) => {
          if (!t.due_date) return false;
          return new Date(t.due_date) < new Date() && t.status !== "completed";
        }).length || 0,
        teamSize: (managers.length || 0) + (processedSupervisors.length || 0) + (processedSiteManagers.length || 0),
        managersCount: managers.length || 0,
        supervisorsCount: processedSupervisors.length || 0,
        siteManagersCount: processedSiteManagers.length || 0,
        activeTenders: tenders.filter((t) => t.status === "active").length || 0,
        totalTenders: tenders.length || 0,
        totalBudget: projects.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0) || 0,
        totalTenderValue: tenders.reduce((sum, t) => sum + parseFloat(t.budget_estimate || t.value || t.amount || 0), 0) || 0,
        unreadNotifications: notifications.filter((n) => !n.read).length || 0,
        todayEvents: todayEvents.length || 0,
        avgProgress: projects.length > 0 ? projects.reduce((sum, p) => sum + parseFloat(p.progress_percentage || p.progress || 0), 0) / projects.length : 0,
        avgTeamEfficiency: managers.length > 0 ? managers.reduce((sum, m) => sum + (m.efficiency || 0), 0) / managers.length : 0,
      };

      // Prepare chart data
      const topManagers = managers.sort((a, b) => (b.performance || 0) - (a.performance || 0)).slice(0, 3);
      const topSupervisors = processedSupervisors.sort((a, b) => (b.performance || 0) - (a.performance || 0)).slice(0, 3);
      const topSiteManagers = processedSiteManagers.sort((a, b) => (b.performance || 0) - (a.performance || 0)).slice(0, 3);

      const statusData = [
        { name: "Active", value: statistics.activeProjects, color: CHART_COLORS.primary[1] },
        { name: "Completed", value: statistics.completedProjects, color: CHART_COLORS.success[1] },
        { name: "Planning", value: statistics.totalProjects - statistics.activeProjects - statistics.completedProjects, color: CHART_COLORS.warning[1] },
      ];

      const projectProgressData = projects.slice(0, 8).map((project, index) => ({
        name: project.title?.substring(0, 10) || project.name?.substring(0, 10) || `P${index + 1}`,
        progress: parseFloat(project.progress_percentage || project.progress || 0),
        budget: parseFloat(project.budget || 0),
      }));

      const budgetData = projects.slice(0, 6).map((project, index) => ({
        name: project.title?.substring(0, 8) || project.name?.substring(0, 8) || `Project ${index + 1}`,
        budget: parseFloat(project.budget || 0),
        spent: parseFloat(project.budget || 0) * (parseFloat(project.progress_percentage || project.progress || 0) / 100),
      }));

      const chartData = {
        topManagers,
        topSupervisors,
        topSiteManagers,
        statusData,
        projectProgressData,
        budgetData,
      };

      setData({
        statistics,
        projects,
        managers,
        events: events.concat(todayEvents),
        tasks,
        tenders,
        supervisors: processedSupervisors,
        siteManagers: processedSiteManagers,
        notifications,
        chartData,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error("❌ Dashboard data fetch failed:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 300000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return { data, loading, error, lastUpdated, refreshing, refetch };
};

// Utility Functions
const formatCurrency = (amount) => {
  if (!amount) return "$0";
  const num = parseFloat(amount);
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num.toLocaleString()}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "No date";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid";
  }
};

// Modern KPI Card - Compact for boardroom
const ModernKPICard = ({ label, value, icon: Icon, trend, trendValue, colorScheme = "primary", subtitle }) => {
  const colorSchemes = {
    primary: {
      bg: "bg-white",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
      text: "text-slate-900",
      accent: "text-blue-600",
      border: "border-slate-200",
      trendUp: "text-emerald-600 bg-emerald-50",
      trendDown: "text-red-600 bg-red-50",
    },
    success: {
      bg: "bg-white",
      iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      text: "text-slate-900",
      accent: "text-emerald-600",
      border: "border-slate-200",
      trendUp: "text-emerald-600 bg-emerald-50",
      trendDown: "text-red-600 bg-red-50",
    },
    warning: {
      bg: "bg-white",
      iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
      text: "text-slate-900",
      accent: "text-amber-600",
      border: "border-slate-200",
      trendUp: "text-emerald-600 bg-emerald-50",
      trendDown: "text-red-600 bg-red-50",
    },
    purple: {
      bg: "bg-white",
      iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
      text: "text-slate-900",
      accent: "text-purple-600",
      border: "border-slate-200",
      trendUp: "text-emerald-600 bg-emerald-50",
      trendDown: "text-red-600 bg-red-50",
    },
  };
  const colors = colorSchemes[colorScheme];

  return (
    <div className={`${colors.bg} rounded-xl p-4 border border-slate-200 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${colors.iconBg} shadow-md`}>
          <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
        {trend && (
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
              trend === "up" ? colors.trendUp : trend === "down" ? colors.trendDown : "bg-slate-100 text-slate-600"
            }`}
          >
            {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className={`text-2xl font-bold ${colors.accent} tracking-tight`}>{value}</h3>
        <p className={`text-xs font-semibold ${colors.text} mt-1`}>{label}</p>
      </div>
    </div>
  );
};

// Enhanced Team Card
const EnhancedTeamCard = ({ person, rank, colorScheme, role }) => {
  const colors = {
    primary: { 
      gradient: "from-blue-500 to-blue-600", 
      bg: "bg-blue-50", 
      border: "border-blue-200",
      text: "text-blue-700"
    },
    purple: { 
      gradient: "from-purple-500 to-purple-600", 
      bg: "bg-purple-50", 
      border: "border-purple-200",
      text: "text-purple-700"
    },
    cyan: { 
      gradient: "from-cyan-500 to-cyan-600", 
      bg: "bg-cyan-50", 
      border: "border-cyan-200",
      text: "text-cyan-700"
    },
  };
  
  const scheme = colors[colorScheme] || colors.primary;

  return (
    <div className={`${scheme.bg} rounded-xl p-4 border ${scheme.border} hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${scheme.gradient} flex items-center justify-center text-white font-bold text-base shadow-lg`}>
            {person.avatar}
          </div>
          <div className="min-w-0">
            <h4 className="text-base font-bold text-slate-900 truncate">{person.name}</h4>
            <p className="text-sm text-slate-600 font-medium">{role}</p>
          </div>
        </div>
        <div className="text-xl font-bold text-slate-400">#{rank}</div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
        <div className="space-y-1">
          <span className="text-slate-500 font-medium">Projects</span>
          <div className="font-bold text-slate-900">{person.projectsCount}</div>
        </div>
        <div className="space-y-1">
          <span className="text-slate-500 font-medium">Performance</span>
          <div className={`font-bold ${scheme.text}`}>{Math.round(person.performance)}%</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span>Efficiency</span>
          <span className="text-slate-600">{Math.round(person.efficiency)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${scheme.gradient} transition-all duration-500`} 
            style={{ width: `${person.efficiency}%` }} 
          />
        </div>
      </div>
    </div>
  );
};

// Progress Card Component
const ProgressCard = ({ title, progress, status, budget, manager, color = "blue" }) => {
  const colorMap = {
    blue: { from: "from-blue-500", to: "to-blue-600", bg: "bg-blue-50", text: "text-blue-700" },
    green: { from: "from-emerald-500", to: "to-emerald-600", bg: "bg-emerald-50", text: "text-emerald-700" },
    orange: { from: "from-orange-500", to: "to-orange-600", bg: "bg-orange-50", text: "text-orange-700" },
    purple: { from: "from-purple-500", to: "to-purple-600", bg: "bg-purple-50", text: "text-purple-700" },
  };
  
  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all duration-300 h-full">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-900 leading-tight line-clamp-2 mb-2">
            {title}
          </h3>
          <p className="text-sm text-slate-600 font-medium">
            {manager || "No manager assigned"}
          </p>
        </div>
        <div className="flex-shrink-0 ml-3">
          <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${colors.bg} ${colors.text}`}>
            {status || "Active"}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-600">Progress</span>
            <span className="font-bold text-slate-900">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${colors.from} ${colors.to} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {budget && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <div className="flex items-center space-x-2 text-slate-600">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-semibold">Budget</span>
            </div>
            <span className="text-base font-bold text-emerald-600">
              {formatCurrency(budget)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Compact Calendar Component for Boardroom
const CompactCalendar = ({ events, tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getActivitiesForDate = (date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEvents = (events || []).filter(event => {
        try {
          const eventDateStr = event.date || event.start_date || event.event_date;
          if (!eventDateStr) return false;
          const eventDate = new Date(eventDateStr);
          if (isNaN(eventDate.getTime())) return false;
          return eventDate.toISOString().split('T')[0] === dateStr;
        } catch {
          return false;
        }
      });
      
      const dayTasks = (tasks || []).filter(task => {
        try {
          const taskDateStr = task.due_date || task.deadline;
          if (!taskDateStr) return false;
          const taskDate = new Date(taskDateStr);
          if (isNaN(taskDate.getTime())) return false;
          return taskDate.toISOString().split('T')[0] === dateStr;
        } catch {
          return false;
        }
      });
      
      return [...dayEvents.map(e => ({ ...e, type: 'event' })), ...dayTasks.map(t => ({ ...t, type: 'task' }))];
    } catch {
      return [];
    }
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const today = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const selectedActivities = getActivitiesForDate(selectedDate);

  return (
    <div className="flex flex-col h-full">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-slate-100">
          <ChevronLeft className="h-4 w-4 text-slate-600" />
        </button>
        <span className="text-xs font-bold text-slate-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        <button onClick={nextMonth} className="p-1 rounded hover:bg-slate-100">
          <ChevronRight className="h-4 w-4 text-slate-600" />
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayNames.map((day, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-slate-400 py-1">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0.5 flex-1">
        {calendarDays.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} />;
          
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const activities = getActivitiesForDate(date);
          const isToday = date.toDateString() === today.toDateString();
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          const hasActivities = activities.length > 0;

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(date)}
              className={`aspect-square rounded flex items-center justify-center text-[10px] font-medium relative
                ${isToday ? 'bg-purple-600 text-white' : ''}
                ${isSelected && !isToday ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-500' : ''}
                ${!isToday && !isSelected ? 'hover:bg-slate-100 text-slate-700' : ''}
              `}
            >
              {day}
              {hasActivities && !isToday && (
                <div className="absolute bottom-0.5 w-1 h-1 bg-purple-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Activities */}
      <div className="mt-2 pt-2 border-t border-slate-200 flex-1 overflow-hidden">
        <h5 className="text-[10px] font-bold text-slate-700 mb-1">
          {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </h5>
        <div className="space-y-1 overflow-y-auto max-h-20">
          {selectedActivities.length > 0 ? (
            selectedActivities.slice(0, 3).map((activity, index) => (
              <div
                key={index}
                className={`px-2 py-1 rounded text-[9px] truncate ${
                  activity.type === 'event' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                }`}
              >
                {activity.title || activity.name || 'Untitled'}
              </div>
            ))
          ) : (
            <p className="text-[9px] text-slate-400">No activities</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const AdminDashboard = () => {
  const currentTime = useCurrentTime();
  const navigate = useNavigate();
  const { data, loading, error, lastUpdated, refreshing, refetch } = useDashboardData();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isFullscreen = params.get('fullscreen') === 'true' || localStorage.getItem('dashboard-fullscreen') === 'true';
    setShowFullscreen(isFullscreen);
    
    if (isFullscreen) {
      setSidebarOpen(false);
    }
  }, []);

  const toggleFullscreen = () => {
    const newFullscreen = !showFullscreen;
    setShowFullscreen(newFullscreen);
    localStorage.setItem('dashboard-fullscreen', newFullscreen.toString());
    
    if (newFullscreen) {
      setSidebarOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Loading Dashboard</h3>
          <p className="text-sm text-slate-600">Preparing your executive overview</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Connection Error</h3>
          <p className="text-sm text-slate-600 mb-6">{error}</p>
          <button 
            onClick={refetch} 
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all text-sm font-semibold"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const activeProjects = data.projects?.filter(p => p.status === "active" || p.status === "in_progress").slice(0, 8) || [];
  const activeTenders = data.tenders?.filter(t => t.status === "active").slice(0, 6) || [];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {/* AdminSidebar - Same as other pages */}
      {!showFullscreen && (
        <AdminSidebar 
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
      )}

      {/* Main Content - Takes remaining space */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Enhanced Header */}
        <div className="bg-white border-b border-slate-200 py-4 px-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!showFullscreen && Sidebar && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <Menu className="h-5 w-5 text-slate-700" />
                </button>
              )}
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Executive Dashboard</h1>
                  <p className="text-sm text-slate-600">Real-time project overview & analytics</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-lg font-bold text-slate-900 tabular-nums">
                  {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {currentTime.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-emerald-700">LIVE</span>
                </div>
                
                <button 
                  onClick={refetch} 
                  disabled={refreshing}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                  title="Refresh data"
                >
                  <RefreshCw className={`h-5 w-5 text-slate-700 ${refreshing ? "animate-spin" : ""}`} />
                </button>
                
                <button 
                  onClick={toggleFullscreen}
                  className={`p-2 rounded-lg transition-colors ${
                    showFullscreen ? 'bg-orange-100 hover:bg-orange-200 text-orange-700' : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                  }`}
                >
                  {showFullscreen ? <X className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid - Single Page Boardroom Layout */}
        <div className="flex-1 overflow-hidden">
          <div className="p-4 h-full flex flex-col gap-4">
            {/* Key Metrics Row - Compact */}
            <div className="grid grid-cols-4 gap-3 flex-shrink-0">
              <ModernKPICard
                label="Active Projects"
                value={data.statistics?.activeProjects || 0}
                icon={Building2}
                trend="up"
                trendValue="+12%"
                colorScheme="primary"
                subtitle="In progress"
              />
              <ModernKPICard
                label="Total Budget"
                value={formatCurrency(data.statistics?.totalBudget || 0)}
                icon={DollarSign}
                trend="up"
                trendValue="+8%"
                colorScheme="success"
                subtitle="All projects"
              />
              <ModernKPICard
                label="Team Members"
                value={data.statistics?.teamSize || 0}
                icon={Users}
                trend="neutral"
                trendValue="Stable"
                colorScheme="purple"
                subtitle="Active staff"
              />
              <ModernKPICard
                label="Completion Rate"
                value={`${Math.round(((data.statistics?.completedTasks || 0) / (data.statistics?.totalTasks || 1)) * 100)}%`}
                icon={Target}
                trend="up"
                trendValue="+15%"
                colorScheme="warning"
                subtitle="Task completion"
              />
            </div>

            {/* Main Content Grid - Fills remaining space */}
            <div className="flex-1 grid grid-cols-5 grid-rows-2 gap-3 min-h-0">
              {/* Project Status Chart */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900">Project Status</h3>
                  <PieChartIcon className="h-4 w-4 text-slate-400" />
                </div>
                <div className="h-[calc(100%-2rem)]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.chartData?.statusData || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {(data.chartData?.statusData || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{fontSize: '10px'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Project Progress Chart */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900">Progress</h3>
                  <BarChart3 className="h-4 w-4 text-slate-400" />
                </div>
                <div className="h-[calc(100%-2rem)]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.chartData?.projectProgressData?.slice(0, 5) || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" fontSize={9} />
                      <YAxis fontSize={9} />
                      <Tooltip />
                      <Bar dataKey="progress" fill={CHART_COLORS.primary[0]} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Activity Calendar - Compact */}
              <div className="row-span-2 bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <h3 className="text-sm font-bold text-slate-900">Calendar</h3>
                  </div>
                  <button
                    onClick={() => {
                      const today = new Date();
                      // Reset to today functionality
                    }}
                    className="px-2 py-1 text-xs font-semibold text-purple-600 bg-purple-50 rounded hover:bg-purple-100"
                  >
                    Today
                  </button>
                </div>
                <CompactCalendar events={data.events} tasks={data.tasks} />
              </div>

              {/* Active Projects List */}
              <div className="row-span-2 bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <PlayCircle className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">Active Projects</h3>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">{activeProjects.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {activeProjects.slice(0, 6).map((project, index) => (
                    <div key={index} className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-xs font-semibold text-slate-900 truncate flex-1">{project.title || project.name}</h4>
                        <span className="text-xs font-bold text-blue-600 ml-2">{Math.round(project.progress_percentage || project.progress || 0)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${project.progress_percentage || project.progress || 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Tenders */}
              <div className="row-span-2 bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-orange-600" />
                    <h3 className="text-sm font-bold text-slate-900">Active Tenders</h3>
                  </div>
                  <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2 py-1 rounded">{activeTenders.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {activeTenders.length > 0 ? (
                    activeTenders.slice(0, 5).map((tender, index) => (
                      <div key={index} className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <h4 className="text-xs font-semibold text-slate-900 truncate mb-1">
                          {tender.title || tender.name || "Untitled Tender"}
                        </h4>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-600">
                            {formatCurrency(tender.budget_estimate || tender.value || tender.amount)}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {formatDate(tender.deadline || tender.submission_deadline)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-xs text-slate-400">No active tenders</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Managers - Compact */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">Top Managers</h3>
                  </div>
                  <Crown className="h-4 w-4 text-amber-500" />
                </div>
                <div className="space-y-2">
                  {(data.chartData?.topManagers || []).slice(0, 3).map((manager, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                        {manager.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{manager.name}</p>
                        <p className="text-xs text-blue-600">{Math.round(manager.performance)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Supervisors - Compact */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <HardHat className="h-4 w-4 text-purple-600" />
                    <h3 className="text-sm font-bold text-slate-900">Top Supervisors</h3>
                  </div>
                  <Crown className="h-4 w-4 text-amber-500" />
                </div>
                <div className="space-y-2">
                  {(data.chartData?.topSupervisors || []).slice(0, 3).map((supervisor, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                        {supervisor.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{supervisor.name}</p>
                        <p className="text-xs text-purple-600">{Math.round(supervisor.performance)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 py-4 px-6">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center space-x-4">
              <span className="font-semibold">© 2025 Ujenzi & Paints</span>
              <span>•</span>
              <span>Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "Never"}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Projects: {data.statistics?.totalProjects || 0}</span>
              <span>•</span>
              <span>Team: {data.statistics?.teamSize || 0}</span>
              <span>•</span>
              <span>Tenders: {data.statistics?.activeTenders || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   ComposedChart,
//   Tooltip,
//   Legend,
//   RadarChart,
//   Radar,
//   PolarGrid,
//   PolarAngleAxis,
//   PolarRadiusAxis,
// } from "recharts";
// import {
//   Clock,
//   Users,
//   Building2,
//   TrendingUp,
//   TrendingDown,
//   Zap,
//   RefreshCw,
//   Bell,
//   Plus,
//   AlertTriangle,
//   CheckSquare,
//   Activity,
//   Calendar,
//   Menu,
//   Palette,
//   Brush,
//   BarChart3,
//   Maximize2,
//   Minimize2,
//   HardHat,
//   Clipboard,
//   Search,
//   Globe,
//   MapPin,
//   DollarSign,
//   Target,
//   ChevronLeft,
//   Timer,
//   Award,
//   Eye,
//   CalendarDays,
//   ChevronRight,
// } from "lucide-react";

// // Import your actual API services
// import ProjectManagerDetails from "../../pages/admin/ProjectManagerDetails";
// import AdminSidebar from "../../pages/admin/AdminSidebar";
// import {
//   projectManagerAPI,
//   projectsAPI,
//   tendersAPI,
//   tasksAPI,
//   eventsAPI,
//   teamMembersAPI,
//   calendarAPI,
//   dashboardAPI,
//   notificationsAPI,
//   supervisorsAPI,
//   siteManagersAPI,
//   fetchProjectManagers,
// } from "../../services/api";

// // Theme Configuration
// const THEME_CONFIG = {
//   light: {
//     background: "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50",
//     card: "bg-white/95 backdrop-blur-sm",
//     border: "border-gray-200/50",
//     text: "text-gray-900",
//     textSecondary: "text-gray-600",
//     textMuted: "text-gray-500",
//   },
//   dark: {
//     background: "bg-gray-900",
//     card: "bg-gray-800",
//     border: "border-gray-700",
//     text: "text-gray-100",
//     textSecondary: "text-gray-400",
//     textMuted: "text-gray-500",
//   },
// };

// // Custom Hooks
// const useTheme = () => {
//   const [isDark, setIsDark] = useState(false);

//   const toggleTheme = useCallback(() => {
//     setIsDark((prev) => !prev);
//   }, []);

//   const theme = useMemo(
//     () => ({
//       isDark,
//       colors: THEME_CONFIG[isDark ? "dark" : "light"],
//       toggleTheme,
//     }),
//     [isDark, toggleTheme]
//   );

//   return theme;
// };

// const useCurrentTime = () => {
//   const [currentTime, setCurrentTime] = useState(new Date());

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 60000);
//     return () => clearInterval(timer);
//   }, []);

//   return currentTime;
// };

// // Real API Data Hook
// const useDashboardData = () => {
//   const [data, setData] = useState({
//     statistics: {},
//     projects: [],
//     managers: [],
//     events: [],
//     tasks: [],
//     tenders: [],
//     supervisors: [],
//     siteManagers: [],
//     notifications: [],
//     chartData: {
//       teamWorkload: [],
//       projectProgress: [],
//       teamRadar: [],
//       performanceMetrics: [],
//     },
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchData = useCallback(async (showRefreshIndicator = false) => {
//     try {
//       if (showRefreshIndicator) {
//         setRefreshing(true);
//       } else {
//         setLoading(true);
//       }
//       setError(null);

//       // Fetch all data from your real API services with better error handling
//       const [
//         dashboardResponse,
//         projectsResponse,
//         managersResponse,
//         eventsResponse,
//         tasksResponse,
//         tendersResponse,
//         teamMembersResponse,
//         supervisorsResponse,
//         siteManagersResponse,
//         notificationsResponse,
//         calendarEventsResponse,
//       ] = await Promise.allSettled([
//         dashboardAPI.getDashboard().catch((err) => {
//           console.warn("Dashboard API failed:", err.message);
//           return {};
//         }),
//         projectsAPI.getAll().catch((err) => {
//           console.warn("Projects API failed:", err.message);
//           return { projects: [] };
//         }),
//         fetchProjectManagers().catch((err) => {
//           console.warn("Project Managers API failed:", err.message);
//           return [];
//         }),
//         eventsAPI.getUpcoming(20).catch((err) => {
//           console.warn("Events API failed:", err.message);
//           return { events: [] };
//         }),
//         tasksAPI.getAll().catch((err) => {
//           console.warn("Tasks API failed:", err.message);
//           return { tasks: [] };
//         }),
//         tendersAPI.getAll().catch((err) => {
//           console.warn("Tenders API failed:", err.message);
//           return { tenders: [] };
//         }),
//         teamMembersAPI.getAll().catch((err) => {
//           console.warn("Team Members API failed:", err.message);
//           return { team_members: [] };
//         }),
//         supervisorsAPI.getAll().catch((err) => {
//           console.warn("Supervisors API failed:", err.message);
//           return [];
//         }),
//         siteManagersAPI.getAll().catch((err) => {
//           console.warn("Site Managers API failed:", err.message);
//           return [];
//         }),
//         notificationsAPI.getAll().catch((err) => {
//           console.warn("Notifications API failed:", err.message);
//           return [];
//         }),
//         calendarAPI.getTodayEvents().catch((err) => {
//           console.warn("Calendar Events API failed:", err.message);
//           return [];
//         }),
//       ]);

//       // Process responses with fallbacks
//       const dashboard =
//         dashboardResponse.status === "fulfilled" ? dashboardResponse.value : {};
//       const projectsData =
//         projectsResponse.status === "fulfilled"
//           ? projectsResponse.value
//           : { projects: [] };
//       const managersData =
//         managersResponse.status === "fulfilled" ? managersResponse.value : [];
//       const eventsData =
//         eventsResponse.status === "fulfilled"
//           ? eventsResponse.value
//           : { events: [] };
//       const tasksData =
//         tasksResponse.status === "fulfilled"
//           ? tasksResponse.value
//           : { tasks: [] };
//       const tendersData =
//         tendersResponse.status === "fulfilled"
//           ? tendersResponse.value
//           : { tenders: [] };
//       const teamMembersData =
//         teamMembersResponse.status === "fulfilled"
//           ? teamMembersResponse.value
//           : { team_members: [] };
//       const supervisorsData =
//         supervisorsResponse.status === "fulfilled"
//           ? supervisorsResponse.value
//           : [];
//       const siteManagersData =
//         siteManagersResponse.status === "fulfilled"
//           ? siteManagersResponse.value
//           : [];
//       const notificationsData =
//         notificationsResponse.status === "fulfilled"
//           ? notificationsResponse.value
//           : [];
//       const calendarEventsData =
//         calendarEventsResponse.status === "fulfilled"
//           ? calendarEventsResponse.value
//           : [];

//       // Normalize data with safe fallbacks
//       const projects = Array.isArray(projectsData.projects)
//         ? projectsData.projects
//         : Array.isArray(projectsData)
//         ? projectsData
//         : [];
//       const events = Array.isArray(eventsData.events)
//         ? eventsData.events
//         : Array.isArray(eventsData)
//         ? eventsData
//         : [];
//       const tasks = Array.isArray(tasksData.tasks)
//         ? tasksData.tasks
//         : Array.isArray(tasksData)
//         ? tasksData
//         : [];
//       const tenders = Array.isArray(tendersData.tenders)
//         ? tendersData.tenders
//         : Array.isArray(tendersData)
//         ? tendersData
//         : [];
//       const supervisors = Array.isArray(supervisorsData) ? supervisorsData : [];
//       const siteManagers = Array.isArray(siteManagersData)
//         ? siteManagersData
//         : [];
//       const notifications = Array.isArray(notificationsData)
//         ? notificationsData
//         : [];
//       const todayEvents = Array.isArray(calendarEventsData)
//         ? calendarEventsData
//         : [];

//       // Process managers data with safe operations
//       const managers = Array.isArray(managersData)
//         ? managersData.map((manager) => ({
//             id: manager.id || Math.random().toString(),
//             name: manager.name || "Unknown Manager",
//             email: manager.email || "unknown@email.com",
//             projectsCount: manager.number_of_projects || 0,
//             workload: Math.min(100, (manager.number_of_projects || 0) * 25),
//             efficiency: 85 + Math.random() * 15,
//             avatar:
//               manager.name
//                 ?.split(" ")
//                 .map((n) => n[0])
//                 .join("") || "M",
//             role: "Manager",
//             performance: 75 + Math.random() * 25,
//           }))
//         : [];

//       // Process supervisors data with safe operations
//       const processedSupervisors = supervisors.map((supervisor) => ({
//         id: supervisor.id || Math.random().toString(),
//         name: supervisor.name || "Unknown Supervisor",
//         email: supervisor.email || "unknown@email.com",
//         projectsCount:
//           supervisor.number_of_projects || Math.floor(Math.random() * 8) + 1,
//         workload: Math.min(
//           100,
//           (supervisor.number_of_projects || Math.floor(Math.random() * 8) + 1) *
//             20
//         ),
//         efficiency: 80 + Math.random() * 20,
//         avatar:
//           supervisor.name
//             ?.split(" ")
//             .map((n) => n[0])
//             .join("") || "S",
//         role: "Supervisor",
//         performance: 70 + Math.random() * 30,
//         currentSite: supervisor.current_site || "Multiple Sites",
//         teamsManaged:
//           supervisor.teams_managed || Math.floor(Math.random() * 5) + 1,
//       }));

//       // Process site managers data with safe operations
//       const processedSiteManagers = siteManagers.map((siteManager) => ({
//         id: siteManager.id || Math.random().toString(),
//         name: siteManager.name || "Unknown Site Manager",
//         email: siteManager.email || "unknown@email.com",
//         projectsCount:
//           siteManager.number_of_projects || Math.floor(Math.random() * 6) + 1,
//         workload: Math.min(
//           100,
//           (siteManager.number_of_projects ||
//             Math.floor(Math.random() * 6) + 1) * 25
//         ),
//         efficiency: 85 + Math.random() * 15,
//         avatar:
//           siteManager.name
//             ?.split(" ")
//             .map((n) => n[0])
//             .join("") || "SM",
//         role: "Site Manager",
//         performance: 75 + Math.random() * 25,
//         currentSite: siteManager.current_site || "Multiple Sites",
//         workersManaged:
//           siteManager.workers_managed || Math.floor(Math.random() * 20) + 10,
//       }));

//       // Calculate statistics with safe operations
//       const statistics = {
//         totalProjects: projects.length || 0,
//         activeProjects:
//           projects.filter(
//             (p) => p.status === "active" || p.status === "in_progress"
//           ).length || 0,
//         completedProjects:
//           projects.filter((p) => p.status === "completed").length || 0,
//         totalTasks: tasks.length || 0,
//         completedTasks:
//           tasks.filter((t) => t.status === "completed").length || 0,
//         pendingTasks: tasks.filter((t) => t.status === "pending").length || 0,
//         overdueTasks:
//           tasks.filter((t) => {
//             if (!t.due_date) return false;
//             return (
//               new Date(t.due_date) < new Date() && t.status !== "completed"
//             );
//           }).length || 0,
//         teamSize:
//           (managers.length || 0) +
//           (processedSupervisors.length || 0) +
//           (processedSiteManagers.length || 0),
//         activeTenders: tenders.filter((t) => t.status === "active").length || 0,
//         totalBudget:
//           projects.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0) || 0,
//         unreadNotifications: notifications.filter((n) => !n.read).length || 0,
//         todayEvents: todayEvents.length || 0,
//         avgProgress:
//           projects.length > 0
//             ? projects.reduce(
//                 (sum, p) =>
//                   sum + parseFloat(p.progress_percentage || p.progress || 0),
//                 0
//               ) / projects.length
//             : 0,
//         avgTeamEfficiency:
//           managers.length > 0
//             ? managers.reduce((sum, m) => sum + (m.efficiency || 0), 0) /
//               managers.length
//             : 0,
//       };

//       // Generate chart data with safe operations
//       const allTeamMembers = [
//         ...managers.map((m) => ({ ...m, type: "Manager", color: "#3B82F6" })),
//         ...processedSupervisors.map((s) => ({
//           ...s,
//           type: "Supervisor",
//           color: "#8B5CF6",
//         })),
//         ...processedSiteManagers.map((sm) => ({
//           ...sm,
//           type: "Site Manager",
//           color: "#06B6D4",
//         })),
//       ];

//       // Sort by workload and get top 10 busiest with safe operations
//       const busiestTeamMembers = allTeamMembers
//         .filter((member) => member.name && member.workload != null)
//         .sort((a, b) => (b.workload || 0) - (a.workload || 0))
//         .slice(0, 10)
//         .map((member) => ({
//           name: (member.name || "Unknown").split(" ")[0] || "Unknown",
//           workload: member.workload || 0,
//           projects: member.projectsCount || 0,
//           role: member.type || "Team Member",
//           color: member.color || "#6B7280",
//           efficiency: member.efficiency || 0,
//           performance: member.performance || 0,
//         }));

//       // Project progress data with safe operations
//       const projectProgressData = projects
//         .slice(0, 8)
//         .map((project, index) => ({
//           name:
//             project.title?.replace("Project ", "P") ||
//             project.name?.replace("Project ", "P") ||
//             `P${project.id || index + 1}`,
//           progress: parseFloat(
//             project.progress_percentage || project.progress || 0
//           ),
//           budget: parseFloat(project.budget || 0) / 1000000,
//           status: project.status || "unknown",
//         }));

//       // Team radar data with safe calculations
//       const teamRadarData = [
//         {
//           metric: "Efficiency",
//           Managers:
//             managers.length > 0
//               ? managers.reduce((sum, m) => sum + (m.efficiency || 0), 0) /
//                 managers.length
//               : 0,
//           Supervisors:
//             processedSupervisors.length > 0
//               ? processedSupervisors.reduce(
//                   (sum, s) => sum + (s.efficiency || 0),
//                   0
//                 ) / processedSupervisors.length
//               : 0,
//           SiteManagers:
//             processedSiteManagers.length > 0
//               ? processedSiteManagers.reduce(
//                   (sum, sm) => sum + (sm.efficiency || 0),
//                   0
//                 ) / processedSiteManagers.length
//               : 0,
//         },
//         {
//           metric: "Workload",
//           Managers:
//             managers.length > 0
//               ? managers.reduce((sum, m) => sum + (m.workload || 0), 0) /
//                 managers.length
//               : 0,
//           Supervisors:
//             processedSupervisors.length > 0
//               ? processedSupervisors.reduce(
//                   (sum, s) => sum + (s.workload || 0),
//                   0
//                 ) / processedSupervisors.length
//               : 0,
//           SiteManagers:
//             processedSiteManagers.length > 0
//               ? processedSiteManagers.reduce(
//                   (sum, sm) => sum + (sm.workload || 0),
//                   0
//                 ) / processedSiteManagers.length
//               : 0,
//         },
//         {
//           metric: "Performance",
//           Managers:
//             managers.length > 0
//               ? managers.reduce((sum, m) => sum + (m.performance || 0), 0) /
//                 managers.length
//               : 0,
//           Supervisors:
//             processedSupervisors.length > 0
//               ? processedSupervisors.reduce(
//                   (sum, s) => sum + (s.performance || 0),
//                   0
//                 ) / processedSupervisors.length
//               : 0,
//           SiteManagers:
//             processedSiteManagers.length > 0
//               ? processedSiteManagers.reduce(
//                   (sum, sm) => sum + (sm.performance || 0),
//                   0
//                 ) / processedSiteManagers.length
//               : 0,
//         },
//         {
//           metric: "Projects",
//           Managers:
//             managers.length > 0
//               ? (managers.reduce((sum, m) => sum + (m.projectsCount || 0), 0) /
//                   managers.length) *
//                 10
//               : 0,
//           Supervisors:
//             processedSupervisors.length > 0
//               ? (processedSupervisors.reduce(
//                   (sum, s) => sum + (s.projectsCount || 0),
//                   0
//                 ) /
//                   processedSupervisors.length) *
//                 10
//               : 0,
//           SiteManagers:
//             processedSiteManagers.length > 0
//               ? (processedSiteManagers.reduce(
//                   (sum, sm) => sum + (sm.projectsCount || 0),
//                   0
//                 ) /
//                   processedSiteManagers.length) *
//                 10
//               : 0,
//         },
//       ];

//       // Performance metrics over time (simulated)
//       const performanceMetrics = Array.from({ length: 12 }, (_, i) => ({
//         month: [
//           "Jan",
//           "Feb",
//           "Mar",
//           "Apr",
//           "May",
//           "Jun",
//           "Jul",
//           "Aug",
//           "Sep",
//           "Oct",
//           "Nov",
//           "Dec",
//         ][i],
//         projects: Math.floor(Math.random() * 10) + 5,
//         completed: Math.floor(Math.random() * 8) + 2,
//         efficiency: 75 + Math.random() * 25,
//         budget: Math.floor(Math.random() * 5) + 2,
//       }));

//       const chartData = {
//         teamWorkload: busiestTeamMembers,
//         projectProgress: projectProgressData,
//         teamRadar: teamRadarData,
//         performanceMetrics: performanceMetrics,
//       };

//       setData({
//         statistics,
//         projects,
//         managers,
//         events: events.concat(todayEvents),
//         tasks,
//         tenders,
//         supervisors: processedSupervisors,
//         siteManagers: processedSiteManagers,
//         notifications,
//         chartData,
//       });

//       setLastUpdated(new Date());
//       console.log("✅ Dashboard data loaded successfully from real APIs");
//     } catch (err) {
//       console.error("❌ Dashboard data fetch failed:", err);
//       setError(err.message || "Failed to load dashboard data from APIs");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//     const interval = setInterval(() => fetchData(true), 300000); // 5 minutes
//     return () => clearInterval(interval);
//   }, [fetchData]);

//   const refetch = useCallback(() => fetchData(true), [fetchData]);

//   return { data, loading, error, lastUpdated, refreshing, refetch };
// };

// // Utility Functions
// const formatCurrency = (amount) => {
//   if (!amount) return "$0";
//   const num = parseFloat(amount);
//   if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
//   if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
//   return `$${num.toLocaleString()}`;
// };

// const formatDate = (dateString) => {
//   if (!dateString) return "No deadline";
//   try {
//     return new Date(dateString).toLocaleDateString();
//   } catch {
//     return "Invalid date";
//   }
// };

// const getStatusColor = (status) => {
//   const colors = {
//     active:
//       "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300",
//     in_progress:
//       "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300",
//     completed:
//       "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 border-emerald-300",
//     "on-hold":
//       "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 border-amber-300",
//     delayed:
//       "bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-red-300",
//     draft:
//       "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300",
//     evaluation:
//       "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 border-amber-300",
//     closed:
//       "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300",
//   };
//   return (
//     colors[status?.toLowerCase()] ||
//     "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300"
//   );
// };

// const getProgressColor = (progress) => {
//   if (progress >= 80) return "from-emerald-500 to-emerald-600";
//   if (progress >= 50) return "from-blue-500 to-blue-600";
//   if (progress >= 25) return "from-amber-500 to-amber-600";
//   return "from-red-500 to-red-600";
// };

// const getPriorityColor = (priority) => {
//   switch (priority?.toLowerCase()) {
//     case "high":
//       return "bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-red-300";
//     case "medium":
//       return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700 border-yellow-300";
//     case "low":
//       return "bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-green-300";
//     default:
//       return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300";
//   }
// };

// // Reusable Components
// const DashboardPanel = ({ children, title, icon: Icon, className = "" }) => {
//   const theme = useTheme();

//   return (
//     <div
//       className={`${theme.colors.card} rounded-xl border ${theme.colors.border} shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}
//     >
//       {title && (
//         <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
//           <div className="flex items-center space-x-3">
//             {Icon && (
//               <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 shadow-md">
//                 <Icon className="h-5 w-5 text-white" />
//               </div>
//             )}
//             <h3 className={`text-lg font-semibold ${theme.colors.text}`}>
//               {title}
//             </h3>
//           </div>
//         </div>
//       )}
//       <div className="p-6">{children}</div>
//     </div>
//   );
// };

// const StatCard = ({
//   label,
//   value,
//   icon: Icon,
//   color,
//   bgColor,
//   iconBg,
//   change,
//   trend,
// }) => (
//   <div
//     className={`relative overflow-hidden p-5 rounded-xl ${bgColor} border border-gray-200/50 hover:shadow-lg transition-all duration-300 group`}
//   >
//     <div className="flex items-center justify-between">
//       <div className="flex items-center space-x-4">
//         <div
//           className={`p-3 rounded-xl ${iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}
//         >
//           <Icon className="h-6 w-6 text-white" />
//         </div>
//         <div>
//           <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
//           <div className="text-sm font-semibold text-gray-700">{label}</div>
//         </div>
//       </div>
//       <div className="text-right">
//         <div
//           className={`text-xs font-medium ${
//             trend === "up"
//               ? "text-emerald-600"
//               : trend === "down"
//               ? "text-red-500"
//               : "text-gray-600"
//           }`}
//         >
//           {change}
//         </div>
//         {trend !== "neutral" && (
//           <div className="mt-1">
//             {trend === "up" ? (
//               <TrendingUp className="h-4 w-4 text-emerald-500" />
//             ) : (
//               <TrendingDown className="h-4 w-4 text-red-500" />
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//     <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
//   </div>
// );

// // Main Components
// const LiveStatistics = ({ data, theme }) => {
//   const currentTime = useCurrentTime();

//   const stats = [
//     {
//       label: "Active Projects",
//       value: data.statistics?.activeProjects || 0,
//       icon: Building2,
//       color: "text-blue-600",
//       bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
//       iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
//       change: "+2 this week",
//       trend: "up",
//     },
//     {
//       label: "Team Members",
//       value: data.statistics?.teamSize || 0,
//       icon: Users,
//       color: "text-emerald-600",
//       bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
//       iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
//       change: "85% active now",
//       trend: "neutral",
//     },
//     {
//       label: "Pending Tasks",
//       value: data.statistics?.pendingTasks || 0,
//       icon: Timer,
//       color: "text-amber-600",
//       bgColor: "bg-gradient-to-br from-amber-50 to-amber-100",
//       iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
//       change: "-8 since yesterday",
//       trend: "down",
//     },
//     {
//       label: "Project Budget",
//       value: formatCurrency(data.statistics?.totalBudget || 0),
//       icon: DollarSign,
//       color: "text-emerald-600",
//       bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
//       iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
//       change: "92% utilized",
//       trend: "up",
//     },
//   ];

//   return (
//     <DashboardPanel title="Live Dashboard Overview" icon={Activity}>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-2">
//             <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg"></div>
//             <span className="text-sm font-medium text-gray-700">
//               Real-time updates
//             </span>
//           </div>
//           <div className="text-sm text-gray-500 font-mono">
//             {currentTime.toLocaleTimeString()}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 gap-4">
//           {stats.map((stat, index) => (
//             <StatCard key={index} {...stat} />
//           ))}
//         </div>

//         <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200/50">
//           <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200/50">
//             <div className="text-2xl font-bold text-purple-600">
//               {Math.round(data.statistics?.avgProgress || 0)}%
//             </div>
//             <div className="text-xs font-medium text-purple-800">
//               Avg Progress
//             </div>
//           </div>
//           <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200/50">
//             <div className="text-2xl font-bold text-indigo-600">
//               {Math.round(data.statistics?.avgTeamEfficiency || 0)}%
//             </div>
//             <div className="text-xs font-medium text-indigo-800">
//               Team Efficiency
//             </div>
//           </div>
//         </div>
//       </div>
//     </DashboardPanel>
//   );
// };

// const QuickActions = ({ theme }) => {
//   const actions = [
//     {
//       label: "New Project",
//       icon: Plus,
//       color:
//         "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
//       shadow: "hover:shadow-blue-500/25",
//     },
//     {
//       label: "Add Task",
//       icon: Clipboard,
//       color:
//         "bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
//       shadow: "hover:shadow-emerald-500/25",
//     },
//     {
//       label: "Schedule Meeting",
//       icon: Calendar,
//       color:
//         "bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
//       shadow: "hover:shadow-purple-500/25",
//     },
//     {
//       label: "Create Tender",
//       icon: Eye,
//       color:
//         "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
//       shadow: "hover:shadow-orange-500/25",
//     },
//   ];

//   return (
//     <DashboardPanel title="Quick Actions" icon={Zap}>
//       <div className="grid grid-cols-1 gap-4">
//         {actions.map((action, index) => (
//           <button
//             key={index}
//             className={`flex items-center space-x-3 w-full p-4 rounded-xl ${action.color} ${action.shadow} text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
//           >
//             <div className="p-1 rounded-lg bg-white/20">
//               <action.icon className="h-5 w-5" />
//             </div>
//             <span className="font-semibold">{action.label}</span>
//           </button>
//         ))}
//       </div>
//     </DashboardPanel>
//   );
// };

// // Recent Activity Feed - Enhanced styling
// const RecentActivity = ({ data, theme }) => {
//   const [activities, setActivities] = useState([]);

//   useEffect(() => {
//     const recentActivities = [];

//     if (data.tasks && data.tasks.length > 0) {
//       const completedTasks = data.tasks
//         .filter((task) => task.status === "completed")
//         .slice(0, 2)
//         .map((task) => ({
//           action: "Task completed",
//           project: task.project_name || task.title || "Unknown Project",
//           time: "Recently",
//           type: "success",
//           icon: CheckSquare,
//         }));
//       recentActivities.push(...completedTasks);
//     }

//     if (data.tenders && data.tenders.length > 0) {
//       const activeTenders = data.tenders
//         .filter((tender) => tender.status === "active")
//         .slice(0, 1)
//         .map((tender) => ({
//           action: "New tender submission",
//           project: tender.title || tender.name || "Unknown Tender",
//           time: "Recently",
//           type: "info",
//           icon: Eye,
//         }));
//       recentActivities.push(...activeTenders);
//     }

//     if (data.statistics && data.statistics.overdueTasks > 0) {
//       recentActivities.push({
//         action: `${data.statistics.overdueTasks} tasks overdue`,
//         project: "Multiple Projects",
//         time: "Ongoing",
//         type: "warning",
//         icon: AlertTriangle,
//       });
//     }

//     if (data.events && data.events.length > 0) {
//       const recentEvents = data.events.slice(0, 1).map((event) => ({
//         action: "Upcoming meeting",
//         project: event.project_name || event.title || "Team Meeting",
//         time: "Soon",
//         type: "info",
//         icon: Calendar,
//       }));
//       recentActivities.push(...recentEvents);
//     }

//     if (recentActivities.length === 0) {
//       recentActivities.push(
//         {
//           action: "System initialized",
//           project: "Dashboard",
//           time: "Just now",
//           type: "info",
//           icon: Activity,
//         },
//         {
//           action: "Loading data",
//           project: "API Connection",
//           time: "Ongoing",
//           type: "warning",
//           icon: RefreshCw,
//         }
//       );
//     }

//     setActivities(recentActivities.slice(0, 4));
//   }, [data]);

//   const getTypeStyles = (type) => {
//     switch (type) {
//       case "success":
//         return "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200/50";
//       case "warning":
//         return "bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 border-amber-200/50";
//       case "info":
//         return "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border-blue-200/50";
//       default:
//         return "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 border-gray-200/50";
//     }
//   };

//   const getIconColor = (type) => {
//     switch (type) {
//       case "success":
//         return "text-emerald-600";
//       case "warning":
//         return "text-amber-600";
//       case "info":
//         return "text-blue-600";
//       default:
//         return "text-gray-600";
//     }
//   };

//   return (
//     <DashboardPanel title="Recent Activity" icon={Activity}>
//       <div className="space-y-3">
//         {activities.map((activity, index) => (
//           <div
//             key={index}
//             className={`p-4 rounded-xl border ${getTypeStyles(
//               activity.type
//             )} hover:shadow-md transition-all duration-300`}
//           >
//             <div className="flex items-start space-x-3">
//               <div
//                 className={`p-2 rounded-lg bg-white/50 ${getIconColor(
//                   activity.type
//                 )}`}
//               >
//                 <activity.icon className="h-4 w-4" />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="font-semibold text-sm">{activity.action}</p>
//                 <p className="text-xs opacity-80">{activity.project}</p>
//                 <p className="text-xs opacity-60 mt-1">{activity.time}</p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </DashboardPanel>
//   );
// };

// // Tenders Management Section
// const TendersSection = ({ data, theme }) => {
//   return (
//     <DashboardPanel title="Active Tenders" icon={Eye}>
//       <div className="space-y-4">
//         {data.tenders && data.tenders.length > 0 ? (
//           <>
//             {data.tenders.slice(0, 4).map((tender) => (
//               <div
//                 key={tender.id}
//                 className="p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-300 group"
//               >
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-start space-x-4">
//                       <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-md group-hover:scale-110 transition-transform duration-300">
//                         <Eye className="h-5 w-5 text-white" />
//                       </div>
//                       <div className="flex-1">
//                         <h4 className="font-bold text-gray-900 text-lg mb-2">
//                           {tender.title || tender.name || "Untitled Tender"}
//                         </h4>
//                         <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
//                           <span className="flex items-center space-x-1">
//                             <DollarSign className="h-4 w-4" />
//                             <span>
//                               Budget:{" "}
//                               {formatCurrency(
//                                 tender.budget_estimate ||
//                                   tender.value ||
//                                   tender.amount
//                               )}
//                             </span>
//                           </span>
//                           {tender.bidders_count && (
//                             <span className="flex items-center space-x-1">
//                               <Users className="h-4 w-4" />
//                               <span>{tender.bidders_count} Bidders</span>
//                             </span>
//                           )}
//                           <span className="flex items-center space-x-1">
//                             <Calendar className="h-4 w-4" />
//                             <span>
//                               Due:{" "}
//                               {formatDate(
//                                 tender.deadline || tender.submission_deadline
//                               )}
//                             </span>
//                           </span>
//                         </div>
//                         <div className="flex items-center space-x-3">
//                           <span
//                             className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
//                               tender.status
//                             )}`}
//                           >
//                             {tender.status?.toUpperCase() || "UNKNOWN"}
//                           </span>
//                           {tender.priority && (
//                             <span
//                               className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
//                                 tender.priority
//                               )}`}
//                             >
//                               {tender.priority?.toUpperCase()} PRIORITY
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//             <div className="text-center pt-4">
//               <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold shadow-lg hover:shadow-xl">
//                 View All Tenders
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="text-center py-8 text-gray-500">
//             <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
//             <p className="text-lg font-medium">No tenders available</p>
//             <p className="text-sm">
//               Tenders will appear here when loaded from the API
//             </p>
//           </div>
//         )}
//       </div>
//     </DashboardPanel>
//   );
// };

// // Projects Section
// const ProjectsSection = ({ data, theme }) => {
//   return (
//     <DashboardPanel title="Active Projects" icon={Building2}>
//       <div className="space-y-4">
//         {data.projects && data.projects.length > 0 ? (
//           <>
//             {data.projects.slice(0, 4).map((project) => (
//               <div
//                 key={project.id}
//                 className="p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-300 group"
//               >
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex items-start space-x-4">
//                     <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-md group-hover:scale-110 transition-transform duration-300">
//                       <Building2 className="h-5 w-5 text-white" />
//                     </div>
//                     <div>
//                       <h4 className="font-bold text-gray-900 text-lg mb-1">
//                         {project.title || project.name || "Untitled Project"}
//                       </h4>
//                       <p className="text-sm text-gray-600 mb-2">
//                         Manager:{" "}
//                         {project.manager ||
//                           project.project_manager ||
//                           "Unassigned"}
//                       </p>
//                       <div className="flex items-center space-x-4 text-sm text-gray-600">
//                         <span className="flex items-center space-x-1">
//                           <MapPin className="h-4 w-4" />
//                           <span>
//                             {project.location ||
//                               project.site_location ||
//                               "Unknown"}
//                           </span>
//                         </span>
//                         <span className="flex items-center space-x-1">
//                           <Calendar className="h-4 w-4" />
//                           <span>
//                             {formatDate(
//                               project.deadline ||
//                                 project.end_date ||
//                                 project.expected_completion
//                             )}
//                           </span>
//                         </span>
//                         <span className="flex items-center space-x-1">
//                           <DollarSign className="h-4 w-4" />
//                           <span>
//                             {formatCurrency(
//                               project.budget || project.total_budget
//                             )}
//                           </span>
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                   <span
//                     className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
//                       project.status
//                     )}`}
//                   >
//                     {project.status?.toUpperCase() || "UNKNOWN"}
//                   </span>
//                 </div>

//                 <div className="space-y-2">
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="font-medium text-gray-700">Progress</span>
//                     <span className="font-bold text-gray-900">
//                       {Math.round(
//                         project.progress_percentage || project.progress || 0
//                       )}
//                       %
//                     </span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
//                     <div
//                       className={`h-full bg-gradient-to-r ${getProgressColor(
//                         project.progress_percentage || project.progress || 0
//                       )} transition-all duration-500 rounded-full shadow-sm`}
//                       style={{
//                         width: `${
//                           project.progress_percentage || project.progress || 0
//                         }%`,
//                       }}
//                     ></div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//             <div className="text-center pt-4">
//               <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold shadow-lg hover:shadow-xl">
//                 View All Projects
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="text-center py-8 text-gray-500">
//             <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
//             <p className="text-lg font-medium">No projects available</p>
//             <p className="text-sm">
//               Projects will appear here when loaded from the API
//             </p>
//           </div>
//         )}
//       </div>
//     </DashboardPanel>
//   );
// };

// // Project Managers Section with clickable navigation
// const ProjectManagersSection = ({ data, theme, onManagerClick }) => {
//   const navigate = useNavigate();

//   const getWorkloadColor = (workload, status) => {
//     if (status === "overloaded" || workload >= 90)
//       return "from-red-500 to-red-600 text-white";
//     if (workload >= 75) return "from-amber-500 to-amber-600 text-white";
//     if (workload >= 50) return "from-blue-500 to-blue-600 text-white";
//     return "from-emerald-500 to-emerald-600 text-white";
//   };

//   const getStatusBadge = (status) => {
//     switch (status) {
//       case "overloaded":
//         return "bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-red-300";
//       case "busy":
//         return "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 border-amber-300";
//       case "optimal":
//         return "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 border-emerald-300";
//       default:
//         return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300";
//     }
//   };

//   const processedManagers =
//     data.managers?.map((manager) => ({
//       ...manager,
//       status:
//         manager.workload >= 90
//           ? "overloaded"
//           : manager.workload >= 75
//           ? "busy"
//           : "optimal",
//     })) || [];

//   const handleManagerClick = (manager) => {
//     console.log("Manager clicked:", manager);
//     if (onManagerClick && typeof onManagerClick === "function") {
//       onManagerClick(manager);
//     }
//     // Navigate to manager details page
//     navigate(`/admin/project-manager/${manager.id}`);
//   };

//   return (
//     <DashboardPanel title="Project Managers Workload" icon={Users}>
//       <div className="space-y-4">
//         {processedManagers.length > 0 ? (
//           <>
//             <div className="text-sm text-gray-600 mb-4">
//               Click on a manager to view detailed information
//             </div>

//             {processedManagers
//               .sort((a, b) => b.workload - a.workload)
//               .slice(0, 5)
//               .map((manager, index) => (
//                 <div
//                   key={manager.id}
//                   onClick={() => handleManagerClick(manager)}
//                   className="p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-300 group cursor-pointer"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-4">
//                       <div className="relative">
//                         <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform duration-300">
//                           {manager.avatar || manager.name?.charAt(0) || "M"}
//                         </div>
//                         {index === 0 && manager.status === "overloaded" && (
//                           <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
//                             <AlertTriangle className="h-3 w-3 text-white" />
//                           </div>
//                         )}
//                       </div>

//                       <div className="flex-1">
//                         <div className="flex items-center space-x-3 mb-1">
//                           <h4 className="font-bold text-gray-900 text-lg">
//                             {manager.name}
//                           </h4>
//                           {manager.status === "overloaded" && (
//                             <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full">
//                               NEEDS HELP
//                             </span>
//                           )}
//                         </div>
//                         <p className="text-sm text-gray-600 mb-2">
//                           {manager.role || "Project Manager"}
//                         </p>
//                         <div className="flex items-center space-x-4 text-sm text-gray-600">
//                           <span>{manager.projectsCount || 0} Projects</span>
//                           <span>
//                             Efficiency: {Math.round(manager.efficiency || 0)}%
//                           </span>
//                           <span
//                             className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
//                               manager.status
//                             )}`}
//                           >
//                             {manager.status?.toUpperCase()}
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="text-right">
//                       <div
//                         className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getWorkloadColor(
//                           manager.workload,
//                           manager.status
//                         )} font-bold text-lg shadow-md`}
//                       >
//                         {manager.workload || 0}%
//                       </div>
//                       <div className="text-xs text-gray-500 mt-1">Workload</div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//           </>
//         ) : (
//           <div className="text-center py-8 text-gray-500">
//             <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
//             <p className="text-lg font-medium">No project managers available</p>
//             <p className="text-sm">
//               Project managers will appear here when loaded from the API
//             </p>
//           </div>
//         )}
//       </div>
//     </DashboardPanel>
//   );
// };

// // Supervisors Section
// const SupervisorsSection = ({ data, theme }) => {
//   const getWorkloadColor = (workload) => {
//     if (workload >= 80) return "from-red-500 to-red-600";
//     if (workload >= 60) return "from-amber-500 to-amber-600";
//     return "from-emerald-500 to-emerald-600";
//   };

//   return (
//     <DashboardPanel title="Site Supervisors" icon={HardHat}>
//       <div className="space-y-4">
//         {data.supervisors && data.supervisors.length > 0 ? (
//           data.supervisors.slice(0, 4).map((supervisor) => (
//             <div
//               key={supervisor.id}
//               className="p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-300 group"
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-4">
//                   <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform duration-300">
//                     {supervisor.avatar || supervisor.name?.charAt(0) || "S"}
//                   </div>

//                   <div>
//                     <h4 className="font-bold text-gray-900 text-lg mb-1">
//                       {supervisor.name}
//                     </h4>
//                     <p className="text-sm text-gray-600 mb-1">
//                       Current Site: {supervisor.currentSite || "Multiple Sites"}
//                     </p>
//                     <div className="flex items-center space-x-4 text-sm text-gray-600">
//                       <span>{supervisor.projectsCount || 0} Projects</span>
//                       <span>{supervisor.teamsManaged || "N/A"} Teams</span>
//                       <span>
//                         Efficiency: {Math.round(supervisor.efficiency || 0)}%
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="text-right">
//                   <div
//                     className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getWorkloadColor(
//                       supervisor.workload || 0
//                     )} text-white font-bold text-lg shadow-md`}
//                   >
//                     {supervisor.workload || 0}%
//                   </div>
//                   <div className="text-xs text-gray-500 mt-1">Workload</div>
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="text-center py-8 text-gray-500">
//             <HardHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
//             <p className="text-lg font-medium">No supervisors available</p>
//             <p className="text-sm">
//               Supervisors will appear here when loaded from the API
//             </p>
//           </div>
//         )}
//       </div>
//     </DashboardPanel>
//   );
// };

// // Site Managers Section
// const SiteManagersSection = ({ data, theme }) => {
//   const getWorkloadColor = (workload) => {
//     if (workload >= 80) return "from-red-500 to-red-600";
//     if (workload >= 60) return "from-amber-500 to-amber-600";
//     return "from-emerald-500 to-emerald-600";
//   };

//   return (
//     <DashboardPanel title="Site Managers" icon={Clipboard}>
//       <div className="space-y-4">
//         {data.siteManagers && data.siteManagers.length > 0 ? (
//           data.siteManagers.slice(0, 4).map((manager) => (
//             <div
//               key={manager.id}
//               className="p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-300 group"
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-4">
//                   <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform duration-300">
//                     {manager.avatar || manager.name?.charAt(0) || "SM"}
//                   </div>

//                   <div>
//                     <h4 className="font-bold text-gray-900 text-lg mb-1">
//                       {manager.name}
//                     </h4>
//                     <p className="text-sm text-gray-600 mb-1">
//                       Site: {manager.currentSite || "Multiple Sites"}
//                     </p>
//                     <div className="flex items-center space-x-4 text-sm text-gray-600">
//                       <span>{manager.projectsCount || 0} Projects</span>
//                       <span>{manager.workersManaged || "N/A"} Workers</span>
//                       <span>
//                         Efficiency: {Math.round(manager.efficiency || 0)}%
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="text-right">
//                   <div
//                     className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getWorkloadColor(
//                       manager.workload || 0
//                     )} text-white font-bold text-lg shadow-md`}
//                   >
//                     {manager.workload || 0}%
//                   </div>
//                   <div className="text-xs text-gray-500 mt-1">Workload</div>
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="text-center py-8 text-gray-500">
//             <Clipboard className="h-12 w-12 mx-auto mb-4 opacity-50" />
//             <p className="text-lg font-medium">No site managers available</p>
//             <p className="text-sm">
//               Site managers will appear here when loaded from the API
//             </p>
//           </div>
//         )}
//       </div>
//     </DashboardPanel>
//   );
// };

// // Chart Components with enhanced styling
// const TeamWorkloadChart = ({ data, theme }) => (
//   <DashboardPanel title="Team Workload Distribution" icon={BarChart3}>
//     <ResponsiveContainer width="100%" height={400}>
//       <BarChart
//         data={data.chartData?.teamWorkload || []}
//         margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
//       >
//         <defs>
//           <linearGradient id="workloadGradient" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
//             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6} />
//           </linearGradient>
//           <linearGradient id="projectsGradient" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9} />
//             <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.6} />
//           </linearGradient>
//         </defs>
//         <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//         <XAxis
//           dataKey="name"
//           stroke="#64748b"
//           fontSize={12}
//           angle={-45}
//           textAnchor="end"
//           height={80}
//         />
//         <YAxis stroke="#64748b" fontSize={12} />
//         <Tooltip
//           contentStyle={{
//             backgroundColor: "white",
//             border: "1px solid #e2e8f0",
//             borderRadius: "12px",
//             boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
//             padding: "12px",
//           }}
//         />
//         <Bar
//           dataKey="workload"
//           fill="url(#workloadGradient)"
//           radius={[6, 6, 0, 0]}
//           name="Workload %"
//         />
//         <Bar
//           dataKey="projects"
//           fill="url(#projectsGradient)"
//           radius={[6, 6, 0, 0]}
//           name="Projects"
//         />
//       </BarChart>
//     </ResponsiveContainer>
//   </DashboardPanel>
// );

// // Interactive Calendar Component with Event Management
// const InteractiveCalendar = ({ data, theme }) => {
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [calendarEvents, setCalendarEvents] = useState([]);
//   const [showCreateEvent, setShowCreateEvent] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [newEvent, setNewEvent] = useState({
//     title: "",
//     description: "",
//     date: "",
//     time: "",
//     type: "meeting",
//     projectManager: "",
//     project: "",
//     location: "",
//   });

//   useEffect(() => {
//     fetchCalendarEvents();
//   }, [currentDate, data]);

//   const fetchCalendarEvents = async () => {
//     try {
//       setLoading(true);
//       // Combine events from different sources
//       const allEvents = [];

//       // Add project milestones
//       if (data.projects) {
//         data.projects.forEach((project) => {
//           if (
//             project.deadline ||
//             project.end_date ||
//             project.expected_completion
//           ) {
//             allEvents.push({
//               id: `project-${project.id}`,
//               title: `Project Deadline: ${project.title || project.name}`,
//               date:
//                 project.deadline ||
//                 project.end_date ||
//                 project.expected_completion,
//               type: "deadline",
//               project: project.title || project.name,
//               manager:
//                 project.manager || project.project_manager || "Unassigned",
//             });
//           }
//         });
//       }

//       // Add tender deadlines
//       if (data.tenders) {
//         data.tenders.forEach((tender) => {
//           if (tender.deadline || tender.submission_deadline) {
//             allEvents.push({
//               id: `tender-${tender.id}`,
//               title: `Tender Deadline: ${tender.title || tender.name}`,
//               date: tender.deadline || tender.submission_deadline,
//               type: "tender",
//               project: tender.title || tender.name,
//             });
//           }
//         });
//       }

//       // Add task deadlines
//       if (data.tasks) {
//         data.tasks.forEach((task) => {
//           if (task.due_date) {
//             allEvents.push({
//               id: `task-${task.id}`,
//               title: `Task Due: ${task.title}`,
//               date: task.due_date,
//               type: "task",
//               project: task.project_name || "Unknown Project",
//             });
//           }
//         });
//       }

//       // Add existing events
//       if (data.events) {
//         data.events.forEach((event) => {
//           allEvents.push({
//             id: `event-${event.id}`,
//             title: event.title || event.description,
//             date: event.start_date || event.date,
//             type: event.type || "meeting",
//             project: event.project_name,
//             manager: event.manager,
//           });
//         });
//       }

//       setCalendarEvents(allEvents);
//     } catch (error) {
//       console.warn("Failed to fetch calendar events:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getCalendarDays = () => {
//     const year = currentDate.getFullYear();
//     const month = currentDate.getMonth();
//     const firstDay = new Date(year, month, 1);
//     const startDate = new Date(firstDay);
//     startDate.setDate(startDate.getDate() - firstDay.getDay());

//     const days = [];
//     const current = new Date(startDate);

//     for (let i = 0; i < 42; i++) {
//       const dayEvents = calendarEvents.filter((event) => {
//         const eventDate = new Date(event.date);
//         return eventDate.toDateString() === current.toDateString();
//       });

//       days.push({
//         date: new Date(current),
//         isCurrentMonth: current.getMonth() === month,
//         isToday: current.toDateString() === new Date().toDateString(),
//         isSelected: current.toDateString() === selectedDate.toDateString(),
//         events: dayEvents,
//         hasEvents: dayEvents.length > 0,
//       });

//       current.setDate(current.getDate() + 1);
//     }

//     return days;
//   };

//   const navigateMonth = (direction) => {
//     const newDate = new Date(currentDate);
//     newDate.setMonth(newDate.getMonth() + direction);
//     setCurrentDate(newDate);
//   };

//   const handleDateClick = (date) => {
//     setSelectedDate(date);
//     setNewEvent((prev) => ({
//       ...prev,
//       date: date.toISOString().split("T")[0],
//     }));
//   };

//   const getEventTypeColor = (type) => {
//     switch (type?.toLowerCase()) {
//       case "meeting":
//         return "bg-blue-500";
//       case "deadline":
//         return "bg-red-500";
//       case "task":
//         return "bg-yellow-500";
//       case "tender":
//         return "bg-purple-500";
//       case "milestone":
//         return "bg-green-500";
//       case "inspection":
//         return "bg-orange-500";
//       default:
//         return "bg-gray-500";
//     }
//   };

//   const getEventTypeBadgeColor = (type) => {
//     switch (type?.toLowerCase()) {
//       case "meeting":
//         return "bg-blue-100 text-blue-700 border-blue-300";
//       case "deadline":
//         return "bg-red-100 text-red-700 border-red-300";
//       case "task":
//         return "bg-yellow-100 text-yellow-700 border-yellow-300";
//       case "tender":
//         return "bg-purple-100 text-purple-700 border-purple-300";
//       case "milestone":
//         return "bg-green-100 text-green-700 border-green-300";
//       case "inspection":
//         return "bg-orange-100 text-orange-700 border-orange-300";
//       default:
//         return "bg-gray-100 text-gray-700 border-gray-300";
//     }
//   };

//   const handleCreateEvent = async (e) => {
//     e.preventDefault();
//     try {
//       // Here you would call your API to create the event
//       // For now, we'll add it locally
//       const eventToAdd = {
//         id: `custom-${Date.now()}`,
//         title: newEvent.title,
//         description: newEvent.description,
//         date: `${newEvent.date}T${newEvent.time}`,
//         type: newEvent.type,
//         manager: newEvent.projectManager,
//         project: newEvent.project,
//         location: newEvent.location,
//       };

//       setCalendarEvents((prev) => [...prev, eventToAdd]);
//       setShowCreateEvent(false);
//       setNewEvent({
//         title: "",
//         description: "",
//         date: selectedDate.toISOString().split("T")[0],
//         time: "",
//         type: "meeting",
//         projectManager: "",
//         project: "",
//         location: "",
//       });
//     } catch (error) {
//       console.error("Failed to create event:", error);
//     }
//   };

//   const getSelectedDateEvents = () => {
//     return calendarEvents.filter((event) => {
//       const eventDate = new Date(event.date);
//       return eventDate.toDateString() === selectedDate.toDateString();
//     });
//   };

//   const monthNames = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];

//   const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

//   return (
//     <DashboardPanel title="Project Calendar & Events" icon={CalendarDays}>
//       <div className="space-y-6">
//         {/* Calendar Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h4 className="text-lg font-semibold text-gray-900">
//               {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
//             </h4>
//             <p className="text-sm text-gray-500">
//               {calendarEvents.length} activities this month
//             </p>
//           </div>
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={() => navigateMonth(-1)}
//               className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </button>
//             <button
//               onClick={() => setCurrentDate(new Date())}
//               className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
//             >
//               Today
//             </button>
//             <button
//               onClick={() => navigateMonth(1)}
//               className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
//             >
//               <ChevronRight className="h-4 w-4" />
//             </button>
//           </div>
//         </div>

//         {/* Calendar Grid */}
//         <div className="space-y-2">
//           <div className="grid grid-cols-7 gap-1">
//             {dayNames.map((day) => (
//               <div
//                 key={day}
//                 className="text-center text-xs font-medium text-gray-500 py-2"
//               >
//                 {day}
//               </div>
//             ))}
//           </div>
//           <div className="grid grid-cols-7 gap-1">
//             {getCalendarDays().map((day, index) => (
//               <button
//                 key={index}
//                 onClick={() => handleDateClick(day.date)}
//                 className={`
//                   relative p-2 min-h-[50px] text-sm rounded-lg transition-all hover:bg-gray-100 flex flex-col items-center justify-start
//                   ${day.isCurrentMonth ? "text-gray-900" : "text-gray-400"}
//                   ${
//                     day.isToday
//                       ? "bg-blue-500 text-white hover:bg-blue-600"
//                       : ""
//                   }
//                   ${
//                     day.isSelected && !day.isToday
//                       ? "bg-blue-100 text-blue-700"
//                       : ""
//                   }
//                   ${day.hasEvents ? "font-semibold" : ""}
//                 `}
//               >
//                 <span className="mb-1">{day.date.getDate()}</span>
//                 {day.hasEvents && (
//                   <div className="flex flex-wrap gap-1 justify-center">
//                     {day.events.slice(0, 2).map((event, idx) => (
//                       <div
//                         key={idx}
//                         className={`w-2 h-2 rounded-full ${getEventTypeColor(
//                           event.type
//                         )}`}
//                         title={event.title}
//                       ></div>
//                     ))}
//                     {day.events.length > 2 && (
//                       <div className="text-xs text-gray-600">
//                         +{day.events.length - 2}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Selected Date Events */}
//         <div className="border-t pt-4">
//           <div className="flex items-center justify-between mb-3">
//             <h5 className="font-semibold text-gray-900">
//               Events for{" "}
//               {selectedDate.toLocaleDateString("en-US", {
//                 weekday: "long",
//                 month: "long",
//                 day: "numeric",
//               })}
//             </h5>
//             <button
//               onClick={() => setShowCreateEvent(true)}
//               className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all text-sm font-medium shadow-md flex items-center space-x-2"
//             >
//               <Plus className="h-4 w-4" />
//               <span>Add Event</span>
//             </button>
//           </div>
//           <div className="space-y-2 max-h-60 overflow-y-auto">
//             {loading ? (
//               <div className="text-center py-4">
//                 <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
//                 <p className="text-sm text-gray-500 mt-2">Loading events...</p>
//               </div>
//             ) : getSelectedDateEvents().length > 0 ? (
//               getSelectedDateEvents().map((event, index) => (
//                 <div
//                   key={index}
//                   className="flex items-start space-x-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200/50"
//                 >
//                   <div
//                     className={`w-3 h-3 rounded-full mt-1 ${getEventTypeColor(
//                       event.type
//                     )}`}
//                   ></div>
//                   <div className="flex-1 min-w-0">
//                     <p className="font-medium text-gray-900 text-sm">
//                       {event.title}
//                     </p>
//                     {event.description && (
//                       <p className="text-xs text-gray-600 mt-1">
//                         {event.description}
//                       </p>
//                     )}
//                     <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
//                       {event.project && (
//                         <span className="flex items-center space-x-1">
//                           <Building2 className="h-3 w-3" />
//                           <span>{event.project}</span>
//                         </span>
//                       )}
//                       {event.manager && (
//                         <span className="flex items-center space-x-1">
//                           <Users className="h-3 w-3" />
//                           <span>{event.manager}</span>
//                         </span>
//                       )}
//                       {event.location && (
//                         <span className="flex items-center space-x-1">
//                           <MapPin className="h-3 w-3" />
//                           <span>{event.location}</span>
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                   <span
//                     className={`px-2 py-1 text-xs rounded-full font-medium border ${getEventTypeBadgeColor(
//                       event.type
//                     )}`}
//                   >
//                     {event.type?.toUpperCase()}
//                   </span>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-8 text-gray-500">
//                 <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
//                 <p className="text-sm">No events scheduled for this day</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Activity Summary */}
//         <div className="border-t pt-4">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div className="text-center p-3 bg-blue-50 rounded-lg">
//               <div className="text-lg font-bold text-blue-600">
//                 {calendarEvents.filter((e) => e.type === "meeting").length}
//               </div>
//               <div className="text-xs text-blue-800">Meetings</div>
//             </div>
//             <div className="text-center p-3 bg-red-50 rounded-lg">
//               <div className="text-lg font-bold text-red-600">
//                 {calendarEvents.filter((e) => e.type === "deadline").length}
//               </div>
//               <div className="text-xs text-red-800">Deadlines</div>
//             </div>
//             <div className="text-center p-3 bg-yellow-50 rounded-lg">
//               <div className="text-lg font-bold text-yellow-600">
//                 {calendarEvents.filter((e) => e.type === "task").length}
//               </div>
//               <div className="text-xs text-yellow-800">Tasks</div>
//             </div>
//             <div className="text-center p-3 bg-green-50 rounded-lg">
//               <div className="text-lg font-bold text-green-600">
//                 {calendarEvents.filter((e) => e.type === "milestone").length}
//               </div>
//               <div className="text-xs text-green-800">Milestones</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Create Event Modal */}
//       {showCreateEvent && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 Create New Event
//               </h3>
//               <button
//                 onClick={() => setShowCreateEvent(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <ChevronLeft className="h-5 w-5" />
//               </button>
//             </div>
//             <form onSubmit={handleCreateEvent} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Event Title
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={newEvent.title}
//                   onChange={(e) =>
//                     setNewEvent((prev) => ({ ...prev, title: e.target.value }))
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter event title"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Description
//                 </label>
//                 <textarea
//                   value={newEvent.description}
//                   onChange={(e) =>
//                     setNewEvent((prev) => ({
//                       ...prev,
//                       description: e.target.value,
//                     }))
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   rows="2"
//                   placeholder="Event description (optional)"
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Date
//                   </label>
//                   <input
//                     type="date"
//                     required
//                     value={newEvent.date}
//                     onChange={(e) =>
//                       setNewEvent((prev) => ({ ...prev, date: e.target.value }))
//                     }
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Time
//                   </label>
//                   <input
//                     type="time"
//                     value={newEvent.time}
//                     onChange={(e) =>
//                       setNewEvent((prev) => ({ ...prev, time: e.target.value }))
//                     }
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Event Type
//                 </label>
//                 <select
//                   value={newEvent.type}
//                   onChange={(e) =>
//                     setNewEvent((prev) => ({ ...prev, type: e.target.value }))
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="meeting">Meeting</option>
//                   <option value="milestone">Milestone</option>
//                   <option value="inspection">Inspection</option>
//                   <option value="deadline">Deadline</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Assign to Project Manager
//                 </label>
//                 <select
//                   value={newEvent.projectManager}
//                   onChange={(e) =>
//                     setNewEvent((prev) => ({
//                       ...prev,
//                       projectManager: e.target.value,
//                     }))
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">Select Manager (Optional)</option>
//                   {data.managers?.map((manager) => (
//                     <option key={manager.id} value={manager.name}>
//                       {manager.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Related Project
//                 </label>
//                 <select
//                   value={newEvent.project}
//                   onChange={(e) =>
//                     setNewEvent((prev) => ({
//                       ...prev,
//                       project: e.target.value,
//                     }))
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">Select Project (Optional)</option>
//                   {data.projects?.map((project) => (
//                     <option
//                       key={project.id}
//                       value={project.title || project.name}
//                     >
//                       {project.title || project.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Location
//                 </label>
//                 <input
//                   type="text"
//                   value={newEvent.location}
//                   onChange={(e) =>
//                     setNewEvent((prev) => ({
//                       ...prev,
//                       location: e.target.value,
//                     }))
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Event location (optional)"
//                 />
//               </div>
//               <div className="flex space-x-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => setShowCreateEvent(false)}
//                   className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium"
//                 >
//                   Create Event
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </DashboardPanel>
//   );
// };

// const ProjectProgressChart = ({ data, theme }) => (
//   <DashboardPanel title="Project Progress Tracker" icon={TrendingUp}>
//     <ResponsiveContainer width="100%" height={400}>
//       <ComposedChart data={data.chartData?.projectProgress || []}>
//         <defs>
//           <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
//             <stop offset="95%" stopColor="#10b981" stopOpacity={0.6} />
//           </linearGradient>
//         </defs>
//         <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//         <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
//         <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
//         <YAxis
//           yAxisId="right"
//           orientation="right"
//           stroke="#64748b"
//           fontSize={12}
//         />
//         <Tooltip
//           contentStyle={{
//             backgroundColor: "white",
//             border: "1px solid #e2e8f0",
//             borderRadius: "12px",
//             boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
//             padding: "12px",
//           }}
//         />
//         <Bar
//           yAxisId="left"
//           dataKey="progress"
//           fill="url(#progressGradient)"
//           radius={[6, 6, 0, 0]}
//           name="Progress %"
//         />
//         <Line
//           yAxisId="right"
//           type="monotone"
//           dataKey="budget"
//           stroke="#f59e0b"
//           strokeWidth={3}
//           name="Budget (M)"
//         />
//       </ComposedChart>
//     </ResponsiveContainer>
//   </DashboardPanel>
// );

// const TeamRadarChart = ({ data, theme }) => (
//   <DashboardPanel title="Team Performance Analysis" icon={Target}>
//     <ResponsiveContainer width="100%" height={400}>
//       <RadarChart data={data.chartData?.teamRadar || []}>
//         <PolarGrid stroke="#e5e7eb" />
//         <PolarAngleAxis
//           dataKey="metric"
//           tick={{ fontSize: 12, fill: "#6b7280" }}
//         />
//         <PolarRadiusAxis
//           angle={0}
//           domain={[0, 100]}
//           tick={{ fontSize: 10, fill: "#9ca3af" }}
//         />
//         <Radar
//           name="Managers"
//           dataKey="Managers"
//           stroke="#3b82f6"
//           fill="#3b82f6"
//           fillOpacity={0.2}
//           strokeWidth={3}
//         />
//         <Radar
//           name="Supervisors"
//           dataKey="Supervisors"
//           stroke="#8b5cf6"
//           fill="#8b5cf6"
//           fillOpacity={0.2}
//           strokeWidth={3}
//         />
//         <Radar
//           name="Site Managers"
//           dataKey="SiteManagers"
//           stroke="#06b6d4"
//           fill="#06b6d4"
//           fillOpacity={0.2}
//           strokeWidth={3}
//         />
//         <Legend />
//         <Tooltip
//           contentStyle={{
//             backgroundColor: "white",
//             border: "1px solid #e2e8f0",
//             borderRadius: "12px",
//             boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
//           }}
//         />
//       </RadarChart>
//     </ResponsiveContainer>
//   </DashboardPanel>
// );

// // Loading Screen
// const LoadingScreen = ({ theme }) => (
//   <div
//     className={`min-h-screen ${theme.colors.background} flex items-center justify-center`}
//   >
//     <div className="text-center">
//       <div className="relative">
//         <div className="w-32 h-32 border-8 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-8 shadow-lg"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
//           <div className="flex items-center space-x-2">
//             <Palette className="h-8 w-8 text-blue-500 animate-pulse" />
//             <Brush className="h-8 w-8 text-orange-500 animate-pulse" />
//           </div>
//         </div>
//       </div>
//       <h3 className={`text-4xl font-bold ${theme.colors.text} mb-3`}>
//         Ujenzi & Paints
//       </h3>
//       <p className={`text-xl ${theme.colors.textSecondary} mb-2`}>
//         Construction & Paint Management
//       </p>
//       <p className={`text-base ${theme.colors.textMuted}`}>
//         Loading dashboard from API...
//       </p>
//     </div>
//   </div>
// );

// // Main Dashboard Component
// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const theme = useTheme();
//   const currentTime = useCurrentTime();
//   const { data, loading, error, lastUpdated, refreshing, refetch } =
//     useDashboardData();

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [currentView, setCurrentView] = useState("dashboard");
//   const [selectedManager, setSelectedManager] = useState(null);

//   const showingManagerDetails =
//     currentView === "manager-details" && selectedManager;

//   useEffect(() => {
//     const savedCollapsed = localStorage.getItem("sidebar-collapsed");
//     if (savedCollapsed !== null) {
//       setSidebarCollapsed(JSON.parse(savedCollapsed));
//     }
//   }, []);

//   useEffect(() => {
//     setSidebarOpen(false);
//   }, [location?.pathname]);

//   const handleSidebarCollapseChange = (collapsed) => {
//     setSidebarCollapsed(collapsed);
//   };

//   // Handle manager click for navigation
//   const handleManagerClick = (manager) => {
//     console.log("Manager clicked:", manager);
//     setSelectedManager(manager);
//     setCurrentView("manager-details");
//     navigate(`/admin/project-manager/${manager.id}`);
//   };

//   const handleBackToDashboard = () => {
//     setCurrentView("dashboard");
//     setSelectedManager(null);
//   };

//   const toggleSidebarCollapse = useCallback(() => {
//     const newCollapsed = !sidebarCollapsed;
//     setSidebarCollapsed(newCollapsed);
//     localStorage.setItem("sidebar-collapsed", JSON.stringify(newCollapsed));
//   }, [sidebarCollapsed]);

//   if (loading) return <LoadingScreen theme={theme} />;

//   if (error) {
//     return (
//       <div
//         className={`min-h-screen ${theme.colors.background} flex items-center justify-center p-8`}
//       >
//         <DashboardPanel className="max-w-lg w-full text-center">
//           <AlertTriangle className="h-20 w-20 text-red-500 mx-auto mb-6" />
//           <h3 className={`text-3xl font-bold ${theme.colors.text} mb-4`}>
//             API Connection Error
//           </h3>
//           <p className={`text-lg ${theme.colors.textSecondary} mb-8`}>
//             {error}
//           </p>
//           <button
//             onClick={refetch}
//             className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-8 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
//           >
//             Retry Connection
//           </button>
//         </DashboardPanel>
//       </div>
//     );
//   }

//   return (
//     <div
//       className={`min-h-screen w-full ${theme.colors.background} transition-all duration-300`}
//     >
//       <AdminSidebar
//         isOpen={sidebarOpen}
//         setIsOpen={setSidebarOpen}
//         onCollapseChange={handleSidebarCollapseChange}
//         theme={{
//           isDark: theme.isDark,
//           colors: {
//             sidebarBg: "bg-white",
//             text: "text-gray-700",
//             textMuted: "text-gray-500",
//             textSecondary: "text-gray-600",
//             border: "border-gray-200",
//           },
//         }}
//       />

//       <div
//         className={`min-h-screen w-full transition-all duration-300 ease-in-out ${
//           sidebarCollapsed ? "lg:ml-16" : "lg:ml-80"
//         }`}
//       >
//         {showingManagerDetails ? (
//           <div className="p-6">
//             <div className="mb-8">
//               <button
//                 onClick={handleBackToDashboard}
//                 className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl transition-all shadow-md hover:shadow-lg"
//               >
//                 <ChevronLeft className="h-5 w-5" />
//                 <span className="font-semibold">Back to Dashboard</span>
//               </button>
//             </div>
//             {selectedManager && (
//               <ProjectManagerDetails managerId={selectedManager.id} />
//             )}
//           </div>
//         ) : (
//           <div className="w-full">
//             {/* Enhanced Header */}
//             <div className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg">
//               <div className="w-full px-6 lg:px-8 py-5">
//                 <div className="flex items-center justify-between w-full">
//                   <div className="flex items-center space-x-6 flex-shrink-0">
//                     <button
//                       onClick={() => setSidebarOpen(true)}
//                       className="lg:hidden p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
//                     >
//                       <Menu className="h-6 w-6" />
//                     </button>
//                     <button
//                       onClick={toggleSidebarCollapse}
//                       className="hidden lg:flex p-3 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
//                       title={
//                         sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"
//                       }
//                     >
//                       {sidebarCollapsed ? (
//                         <Maximize2 className="h-5 w-5" />
//                       ) : (
//                         <Minimize2 className="h-5 w-5" />
//                       )}
//                     </button>
//                     <div className="flex items-center space-x-4">
//                       <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-xl">
//                         <Building2 className="h-8 lg:h-10 w-8 lg:w-10 text-white" />
//                       </div>
//                     </div>
//                     <div className="hidden sm:block">
//                       <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
//                         Ujenzi & Paints
//                       </h1>
//                       <p className="text-sm lg:text-base text-gray-600 font-medium">
//                         Construction & Paint Management Dashboard
//                       </p>
//                     </div>
//                   </div>

//                   <div className="hidden md:flex items-center space-x-6 flex-1 max-w-3xl mx-8">
//                     <div className="relative flex-1">
//                       <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <input
//                         type="text"
//                         placeholder="Search projects, tasks, or team members..."
//                         className="w-full pl-12 pr-6 py-4 border border-gray-200 rounded-xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all"
//                       />
//                     </div>
//                   </div>

//                   <div className="flex items-center space-x-4 flex-shrink-0">
//                     <div className="hidden xl:block text-right">
//                       <p className="text-sm font-semibold text-gray-900">
//                         {currentTime.toLocaleDateString("en-US", {
//                           weekday: "long",
//                           year: "numeric",
//                           month: "long",
//                           day: "numeric",
//                         })}
//                       </p>
//                       <p className="text-xs text-gray-600">
//                         {currentTime.toLocaleTimeString("en-US", {
//                           hour: "2-digit",
//                           minute: "2-digit",
//                           hour12: true,
//                         })}
//                       </p>
//                     </div>

//                     <div className="hidden lg:block text-right">
//                       <p className={`text-xs ${theme.colors.textSecondary}`}>
//                         Last Updated
//                       </p>
//                       <p
//                         className={`text-sm font-semibold ${theme.colors.text}`}
//                       >
//                         {lastUpdated
//                           ? lastUpdated.toLocaleTimeString()
//                           : "Never"}
//                       </p>
//                     </div>

//                     <button
//                       onClick={refetch}
//                       disabled={refreshing}
//                       className={`p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl ${
//                         refreshing ? "animate-spin" : ""
//                       }`}
//                     >
//                       <RefreshCw className="h-5 w-5" />
//                     </button>

//                     <button className="relative p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg">
//                       <Bell className="h-5 w-5" />
//                       {data.statistics?.unreadNotifications > 0 && (
//                         <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
//                           {data.statistics.unreadNotifications > 9
//                             ? "9+"
//                             : data.statistics.unreadNotifications}
//                         </span>
//                       )}
//                     </button>

//                     <button
//                       onClick={theme.toggleTheme}
//                       className="p-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all shadow-lg text-xl"
//                     >
//                       {theme.isDark ? "☀️" : "🌙"}
//                     </button>

//                     <div className="flex items-center space-x-3 pl-4 border-l border-gray-300">
//                       <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
//                         AD
//                       </div>
//                       <div className="hidden lg:block">
//                         <p className="text-sm font-semibold text-gray-900">
//                           Admin User
//                         </p>
//                         <p className="text-xs text-gray-600">
//                           System Administrator
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Main Content */}
//             <div className="w-full px-6 lg:px-8 py-8 lg:py-12">
//               {/* Top Row - Overview and Actions */}
//               <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-12">
//                 <div className="xl:col-span-2">
//                   <LiveStatistics data={data} theme={theme} />
//                 </div>
//                 <QuickActions theme={theme} />
//                 <RecentActivity data={data} theme={theme} />
//               </div>

//               {/* Main Charts Section */}
//               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
//                 <TeamWorkloadChart data={data} theme={theme} />
//                 <ProjectProgressChart data={data} theme={theme} />
//               </div>

//               {/* Projects and Tenders Section */}
//               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
//                 <TendersSection data={data} theme={theme} />
//                 <ProjectsSection data={data} theme={theme} />
//               </div>

//               {/* Team Management Section */}
//               <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
//                 <ProjectManagersSection
//                   data={data}
//                   theme={theme}
//                   onManagerClick={handleManagerClick}
//                 />
//                 <SupervisorsSection data={data} theme={theme} />
//                 <SiteManagersSection data={data} theme={theme} />
//               </div>

//               {/* Performance Analysis Section */}
//               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
//                 <TeamRadarChart data={data} theme={theme} />
//                 <DashboardPanel title="Monthly Performance" icon={BarChart3}>
//                   <ResponsiveContainer width="100%" height={400}>
//                     <LineChart
//                       data={
//                         data.chartData?.performanceMetrics?.slice(0, 6) || []
//                       }
//                     >
//                       <defs>
//                         <linearGradient
//                           id="projectsLine"
//                           x1="0"
//                           y1="0"
//                           x2="0"
//                           y2="1"
//                         >
//                           <stop
//                             offset="5%"
//                             stopColor="#3b82f6"
//                             stopOpacity={0.8}
//                           />
//                           <stop
//                             offset="95%"
//                             stopColor="#3b82f6"
//                             stopOpacity={0.1}
//                           />
//                         </linearGradient>
//                         <linearGradient
//                           id="completedLine"
//                           x1="0"
//                           y1="0"
//                           x2="0"
//                           y2="1"
//                         >
//                           <stop
//                             offset="5%"
//                             stopColor="#10b981"
//                             stopOpacity={0.8}
//                           />
//                           <stop
//                             offset="95%"
//                             stopColor="#10b981"
//                             stopOpacity={0.1}
//                           />
//                         </linearGradient>
//                       </defs>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//                       <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
//                       <YAxis stroke="#64748b" fontSize={12} />
//                       <Tooltip
//                         contentStyle={{
//                           backgroundColor: "white",
//                           border: "1px solid #e2e8f0",
//                           borderRadius: "12px",
//                           boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
//                         }}
//                       />
//                       <Line
//                         type="monotone"
//                         dataKey="projects"
//                         stroke="#3b82f6"
//                         strokeWidth={4}
//                         fill="url(#projectsLine)"
//                         name="Total Projects"
//                       />
//                       <Line
//                         type="monotone"
//                         dataKey="completed"
//                         stroke="#10b981"
//                         strokeWidth={4}
//                         fill="url(#completedLine)"
//                         name="Completed"
//                       />
//                     </LineChart>
//                   </ResponsiveContainer>
//                 </DashboardPanel>
//               </div>

//               {/* Interactive Calendar Section */}
//               <div className="mb-12">
//                 <InteractiveCalendar data={data} theme={theme} />
//               </div>

//               {/* Enhanced Footer */}
//               <div className="text-center py-12 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/50 rounded-2xl">
//                 <div className="flex items-center justify-center space-x-6 mb-6">
//                   <div className="flex items-center space-x-3">
//                     <Palette className="h-8 w-8 text-blue-500" />
//                     <Building2 className="h-8 w-8 text-orange-500" />
//                     <Brush className="h-8 w-8 text-purple-500" />
//                   </div>
//                 </div>
//                 <div className="space-y-4">
//                   <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
//                     Ujenzi & Paints Enterprise
//                   </h4>
//                   <p className="text-base text-gray-600 font-medium">
//                     Leading Construction & Paint Management Platform in Kenya
//                   </p>
//                   <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500 mt-6">
//                     <span className="font-medium">
//                       © 2025 Ujenzi & Paints Solutions
//                     </span>
//                     <span className="hidden sm:inline">•</span>
//                     <span>Projects: {data.statistics?.totalProjects || 0}</span>
//                     <span className="hidden sm:inline">•</span>
//                     <span>Team: {data.statistics?.teamSize || 0}</span>
//                     <span className="hidden sm:inline">•</span>
//                     <span>
//                       Last updated: {currentTime.toLocaleTimeString()}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Mobile Sidebar Overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
//           onClick={() => setSidebarOpen(false)}
//         ></div>
//       )}
//     </div>
//   );
// };

// export default AdminDashboard;
