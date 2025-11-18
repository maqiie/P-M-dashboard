import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
} from "recharts";
import {
  Users,
  Building2,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Briefcase,
  HardHat,
  X,
  Menu,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  FileText,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Check,
  Search,
} from "lucide-react";
import {
  fetchProjectManagers,
  projectsAPI,
  tendersAPI,
  tasksAPI,
  eventsAPI,
  supervisorsAPI,
  siteManagersAPI,
  calendarAPI,
  dashboardAPI,
} from "../../services/api";

// Chart Colors
const CHART_COLORS = {
  primary: ["#0ea5e9", "#0284c7", "#0369a1", "#0c4a6e"],
  success: ["#22c55e", "#16a34a", "#15803d", "#166534"],
  warning: ["#f59e0b", "#d97706", "#b45309", "#92400e"],
  danger: ["#ef4444", "#dc2626", "#b91c1c", "#991b1b"],
  purple: ["#a855f7", "#9333ea", "#7c3aed", "#6d28d9"],
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

// Safe string extraction helper - prevents rendering objects directly
const safeString = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    if (value.name) return String(value.name);
    if (value.title) return String(value.title);
    if (value.full_name) return String(value.full_name);
    if (value.username) return String(value.username);
    if (value.email) return String(value.email);
    return "";
  }
  return String(value);
};

// Enhanced function to get project creator/manager name
const getProjectAssignee = (project, managers = []) => {
  // Check all possible fields for project manager/creator (API should return these as strings now)
  const fieldsToCheck = [
    project.project_manager,
    project.manager,
    project.created_by,
    project.creator,
    project.owner,
    project.assigned_to,
    project.lead_person,
    project.responsible,
  ];

  for (const field of fieldsToCheck) {
    const name = safeString(field);
    if (name && name.trim()) {
      return name;
    }
  }

  // Fallback: If project has a manager ID, look up the name from managers list
  if (project.project_manager_id && managers.length > 0) {
    const manager = managers.find(m => m.id === project.project_manager_id);
    if (manager && manager.name) {
      return safeString(manager.name);
    }
  }

  // Also check manager_id field
  if (project.manager_id && managers.length > 0) {
    const manager = managers.find(m => m.id === project.manager_id);
    if (manager && manager.name) {
      return safeString(manager.name);
    }
  }

  return "Unassigned";
};

// Real API Data Hook
const useDashboardData = () => {
  const [data, setData] = useState({
    statistics: {},
    projects: [],
    managers: [],
    rawManagers: [], // Store raw managers for ID lookups
    events: [],
    tasks: [],
    tenders: [],
    supervisors: [],
    siteManagers: [],
    chartData: {},
    trends: {},
    allTeamMembers: [], // Add this for calendar user selection
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

      const [
        projectsResponse,
        managersResponse,
        eventsResponse,
        tasksResponse,
        tendersResponse,
        supervisorsResponse,
        siteManagersResponse,
        calendarEventsResponse,
      ] = await Promise.allSettled([
        // Fetch ALL projects for admin dashboard (not filtered by user)
        projectsAPI.getAll({ all: true, scope: 'admin' }).catch(() => 
          projectsAPI.getAll({ admin: true }).catch(() => 
            projectsAPI.getAll().catch(() => ({ projects: [] }))
          )
        ),
        fetchProjectManagers().catch(() => []),
        eventsAPI.getUpcoming(20).catch(() => ({ events: [] })),
        tasksAPI.getAll({ all: true }).catch(() => tasksAPI.getAll().catch(() => ({ tasks: [] }))),
        tendersAPI.getAll({ all: true }).catch(() => tendersAPI.getAll().catch(() => ({ tenders: [] }))),
        supervisorsAPI.getAll().catch(() => []),
        siteManagersAPI.getAll().catch(() => []),
        calendarAPI.getTodayEvents().catch(() => []),
      ]);

      // Process API responses
      const projectsData = projectsResponse.status === "fulfilled" ? projectsResponse.value : { projects: [] };
      const managersData = managersResponse.status === "fulfilled" ? managersResponse.value : [];
      const eventsData = eventsResponse.status === "fulfilled" ? eventsResponse.value : { events: [] };
      const tasksData = tasksResponse.status === "fulfilled" ? tasksResponse.value : { tasks: [] };
      const tendersData = tendersResponse.status === "fulfilled" ? tendersResponse.value : { tenders: [] };
      const supervisorsData = supervisorsResponse.status === "fulfilled" ? supervisorsResponse.value : [];
      const siteManagersData = siteManagersResponse.status === "fulfilled" ? siteManagersResponse.value : [];
      const calendarEventsData = calendarEventsResponse.status === "fulfilled" ? calendarEventsResponse.value : [];

      // Normalize data arrays
      const projects = Array.isArray(projectsData.projects) ? projectsData.projects : Array.isArray(projectsData) ? projectsData : [];
      const events = Array.isArray(eventsData.events) ? eventsData.events : Array.isArray(eventsData) ? eventsData : [];
      const tasks = Array.isArray(tasksData.tasks) ? tasksData.tasks : Array.isArray(tasksData) ? tasksData : [];
      const tenders = Array.isArray(tendersData.tenders) ? tendersData.tenders : Array.isArray(tendersData) ? tendersData : [];
      const supervisors = Array.isArray(supervisorsData) ? supervisorsData : [];
      const siteManagers = Array.isArray(siteManagersData) ? siteManagersData : [];
      const todayEvents = Array.isArray(calendarEventsData) ? calendarEventsData : [];

      // Store raw managers for ID lookups (before processing)
      const rawManagersData = Array.isArray(managersData) ? managersData : 
        (managersData?.data && Array.isArray(managersData.data)) ? managersData.data : [];

      // Process team members with safe string extraction
      const managers = Array.isArray(managersData)
        ? managersData.map((manager) => {
            const managerProjects = projects.filter(p => 
              p.project_manager_id === manager.id ||
              p.manager_id === manager.id ||
              safeString(p.project_manager) === safeString(manager.name)
            );
            
            const managerName = safeString(manager.name) || "Unknown Manager";
            
            return {
              id: manager.id || Math.random().toString(),
              name: managerName,
              email: safeString(manager.email) || "unknown@email.com",
              projectsCount: manager.number_of_projects || managerProjects.length || 0,
              workload: Math.min(100, (manager.number_of_projects || managerProjects.length || 0) * 25),
              efficiency: 85 + Math.random() * 15,
              avatar: managerName.split(" ").map((n) => n[0]).join("").substring(0, 2) || "M",
              role: "Manager",
              performance: 75 + Math.random() * 25,
              currentProjects: managerProjects.slice(0, 2).map(p => safeString(p.title) || safeString(p.name) || "Untitled"),
            };
          })
        : [];

      const processedSupervisors = supervisors.map((supervisor) => {
        const supervisorProjects = projects.filter(p => 
          p.supervisor_id === supervisor.id ||
          safeString(p.supervisor) === safeString(supervisor.name)
        );
        
        const supervisorName = safeString(supervisor.name) || "Unknown Supervisor";
        
        return {
          id: supervisor.id || Math.random().toString(),
          name: supervisorName,
          email: safeString(supervisor.email) || "unknown@email.com",
          projectsCount: supervisor.number_of_projects || supervisorProjects.length || 0,
          workload: Math.min(100, (supervisor.number_of_projects || supervisorProjects.length || 0) * 20),
          efficiency: 80 + Math.random() * 20,
          avatar: supervisorName.split(" ").map((n) => n[0]).join("").substring(0, 2) || "S",
          role: "Supervisor",
          performance: 70 + Math.random() * 30,
          currentProjects: supervisorProjects.slice(0, 2).map(p => safeString(p.title) || safeString(p.name) || "Untitled"),
        };
      });

      const processedSiteManagers = siteManagers.map((siteManager) => {
        const siteManagerName = safeString(siteManager.name) || "Unknown Site Manager";
        
        return {
          id: siteManager.id || Math.random().toString(),
          name: siteManagerName,
          email: safeString(siteManager.email) || "unknown@email.com",
          projectsCount: siteManager.number_of_projects || 0,
          workload: Math.min(100, (siteManager.number_of_projects || 0) * 25),
          efficiency: 85 + Math.random() * 15,
          avatar: siteManagerName.split(" ").map((n) => n[0]).join("").substring(0, 2) || "SM",
          role: "Site Manager",
          performance: 75 + Math.random() * 25,
        };
      });

      // Create combined team members list for calendar
      const allTeamMembers = [
        ...managers.map(m => ({ ...m, type: 'manager' })),
        ...processedSupervisors.map(s => ({ ...s, type: 'supervisor' })),
        ...processedSiteManagers.map(sm => ({ ...sm, type: 'site_manager' })),
      ];

      // Calculate statistics
      const totalTasks = tasks.length || 0;
      const completedTasks = tasks.filter((t) => t.status === "completed").length || 0;
      const teamSize = (managers.length || 0) + (processedSupervisors.length || 0) + (processedSiteManagers.length || 0);

      const statistics = {
        totalProjects: projects.length || 0,
        activeProjects: projects.filter((p) => p.status === "active" || p.status === "in_progress").length || 0,
        completedProjects: projects.filter((p) => p.status === "completed").length || 0,
        totalTasks,
        completedTasks,
        pendingTasks: tasks.filter((t) => t.status === "pending").length || 0,
        overdueTasks: tasks.filter((t) => {
          if (!t.due_date) return false;
          return new Date(t.due_date) < new Date() && t.status !== "completed";
        }).length || 0,
        teamSize,
        managersCount: managers.length || 0,
        supervisorsCount: processedSupervisors.length || 0,
        siteManagersCount: processedSiteManagers.length || 0,
        activeTenders: tenders.filter((t) => t.status === "active").length || 0,
        totalTenders: tenders.length || 0,
        totalBudget: projects.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0) || 0,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      };

      // Calculate real trends
      const trends = {
        projects: statistics.activeProjects > 0 ? "up" : "neutral",
        projectsValue: statistics.activeProjects > 0 ? `${statistics.activeProjects} active` : "No active",
        budget: statistics.totalBudget > 0 ? "up" : "neutral",
        budgetValue: statistics.totalBudget > 0 ? formatCurrency(statistics.totalBudget) : "$0",
        team: teamSize > 0 ? "neutral" : "down",
        teamValue: `${teamSize} members`,
        completion: statistics.completionRate >= 50 ? "up" : statistics.completionRate > 0 ? "neutral" : "down",
        completionValue: `${statistics.completionRate}%`,
      };

      // Prepare chart data
      const topManagers = managers.sort((a, b) => (b.performance || 0) - (a.performance || 0)).slice(0, 3);
      const topSupervisors = processedSupervisors.sort((a, b) => (b.performance || 0) - (a.performance || 0)).slice(0, 3);

      const statusData = [
        { name: "Active", value: statistics.activeProjects, color: CHART_COLORS.primary[1] },
        { name: "Completed", value: statistics.completedProjects, color: CHART_COLORS.success[1] },
        { name: "Planning", value: Math.max(0, statistics.totalProjects - statistics.activeProjects - statistics.completedProjects), color: CHART_COLORS.warning[1] },
      ].filter(item => item.value > 0);

      const projectProgressData = projects.slice(0, 8).map((project, index) => ({
        name: (safeString(project.title) || safeString(project.name) || `P${index + 1}`).substring(0, 10),
        progress: parseFloat(project.progress_percentage || project.progress || 0),
        budget: parseFloat(project.budget || 0),
      }));

      const chartData = {
        topManagers,
        topSupervisors,
        statusData,
        projectProgressData,
      };

      setData({
        statistics,
        projects,
        managers,
        rawManagers: rawManagersData, // Raw managers for ID lookups
        events: events.concat(todayEvents),
        tasks,
        tenders,
        supervisors: processedSupervisors,
        siteManagers: processedSiteManagers,
        chartData,
        trends,
        allTeamMembers,
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

// Modern KPI Card
const ModernKPICard = ({ label, value, icon: Icon, trend, trendValue, colorScheme = "primary" }) => {
  const colorSchemes = {
    primary: {
      bg: "bg-white",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
      accent: "text-blue-600",
      trendUp: "text-emerald-600 bg-emerald-50",
      trendDown: "text-red-600 bg-red-50",
    },
    success: {
      bg: "bg-white",
      iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      accent: "text-emerald-600",
      trendUp: "text-emerald-600 bg-emerald-50",
      trendDown: "text-red-600 bg-red-50",
    },
    warning: {
      bg: "bg-white",
      iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
      accent: "text-amber-600",
      trendUp: "text-emerald-600 bg-emerald-50",
      trendDown: "text-red-600 bg-red-50",
    },
    purple: {
      bg: "bg-white",
      iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
      accent: "text-purple-600",
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
        <p className="text-xs font-semibold text-slate-900 mt-1">{label}</p>
      </div>
    </div>
  );
};

// Enhanced Interactive Calendar Component with User Tagging
const EnhancedCalendar = ({ events, tasks, onCreateEvent, teamMembers = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAttendeePicker, setShowAttendeePicker] = useState(false);
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'meeting',
    time: '09:00',
    description: '',
    attendees: [],
  });

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

  // Filter team members based on search
  const filteredTeamMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
    member.email.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
    member.role.toLowerCase().includes(attendeeSearch.toLowerCase())
  );

  // Toggle attendee selection
  const toggleAttendee = (member) => {
    setNewEvent(prev => {
      const isSelected = prev.attendees.some(a => a.id === member.id);
      if (isSelected) {
        return {
          ...prev,
          attendees: prev.attendees.filter(a => a.id !== member.id)
        };
      } else {
        return {
          ...prev,
          attendees: [...prev.attendees, { id: member.id, name: member.name, email: member.email, role: member.role }]
        };
      }
    });
  };

  // Remove attendee
  const removeAttendee = (memberId) => {
    setNewEvent(prev => ({
      ...prev,
      attendees: prev.attendees.filter(a => a.id !== memberId)
    }));
  };

  const handleCreateEvent = () => {
    if (newEvent.title.trim()) {
      if (onCreateEvent) {
        onCreateEvent({
          ...newEvent,
          date: selectedDate.toISOString(),
        });
      }
      
      setShowCreateModal(false);
      setShowAttendeePicker(false);
      setAttendeeSearch('');
      setNewEvent({
        title: '',
        type: 'meeting',
        time: '09:00',
        description: '',
        attendees: [],
      });
    }
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const today = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const selectedActivities = getActivitiesForDate(selectedDate);

  return (
    <div className="flex flex-col h-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          <ChevronLeft className="h-4 w-4 text-slate-600" />
        </button>
        <div className="text-center">
          <span className="text-sm font-bold text-slate-900">
            {monthNames[currentDate.getMonth()]}
          </span>
          <span className="text-xs text-slate-500 ml-1">{currentDate.getFullYear()}</span>
        </div>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          <ChevronRight className="h-4 w-4 text-slate-600" />
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayNames.map((day, i) => (
          <div key={i} className="text-center text-[9px] font-semibold text-slate-400 py-1">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0.5 flex-1">
        {calendarDays.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="aspect-square" />;
          
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const activities = getActivitiesForDate(date);
          const isToday = date.toDateString() === today.toDateString();
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          const hasActivities = activities.length > 0;
          const isPast = date < today && !isToday;

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(date)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] font-medium relative transition-all
                ${isToday ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md' : ''}
                ${isSelected && !isToday ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-400' : ''}
                ${!isToday && !isSelected && !isPast ? 'hover:bg-slate-100 text-slate-700' : ''}
                ${isPast && !isToday && !isSelected ? 'text-slate-400' : ''}
              `}
            >
              <span>{day}</span>
              {hasActivities && (
                <div className="flex gap-0.5 mt-0.5">
                  {activities.slice(0, 3).map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-purple-500'}`} 
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Section */}
      <div className="mt-3 pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-xs font-bold text-slate-900">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </h5>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            <Plus className="h-3 w-3" />
            <span className="text-[9px] font-semibold">Add</span>
          </button>
        </div>
        
        <div className="space-y-1.5 max-h-24 overflow-y-auto">
          {selectedActivities.length > 0 ? (
            selectedActivities.slice(0, 4).map((activity, index) => (
              <div
                key={index}
                className={`px-2 py-1.5 rounded-lg text-[9px] flex items-center space-x-2 ${
                  activity.type === 'event' 
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${activity.type === 'event' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                <span className="truncate font-medium">{safeString(activity.title) || safeString(activity.name) || 'Untitled'}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-3">
              <Calendar className="h-6 w-6 text-slate-300 mx-auto mb-1" />
              <p className="text-[9px] text-slate-400">No activities</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Create Event</h3>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setShowAttendeePicker(false);
                  setAttendeeSearch('');
                }}
                className="p-1 rounded hover:bg-slate-100"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Event title..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Type</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="event">Event</option>
                    <option value="deadline">Deadline</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Time</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Attendees Section */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Attendees {newEvent.attendees.length > 0 && `(${newEvent.attendees.length})`}
                </label>
                
                {/* Selected Attendees */}
                {newEvent.attendees.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {newEvent.attendees.map((attendee) => (
                      <div
                        key={attendee.id}
                        className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px]"
                      >
                        <span className="font-medium">{attendee.name}</span>
                        <button
                          onClick={() => removeAttendee(attendee.id)}
                          className="hover:text-purple-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Attendees Button */}
                <button
                  onClick={() => setShowAttendeePicker(!showAttendeePicker)}
                  className="w-full px-3 py-2 text-xs border border-dashed border-slate-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center justify-center space-x-2 text-slate-600"
                >
                  <Users className="h-3 w-3" />
                  <span>{showAttendeePicker ? 'Hide team members' : 'Add team members'}</span>
                </button>

                {/* Attendee Picker */}
                {showAttendeePicker && (
                  <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-slate-200">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                        <input
                          type="text"
                          value={attendeeSearch}
                          onChange={(e) => setAttendeeSearch(e.target.value)}
                          className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                          placeholder="Search team members..."
                        />
                      </div>
                    </div>

                    {/* Team Members List */}
                    <div className="max-h-40 overflow-y-auto">
                      {filteredTeamMembers.length > 0 ? (
                        filteredTeamMembers.map((member) => {
                          const isSelected = newEvent.attendees.some(a => a.id === member.id);
                          return (
                            <button
                              key={member.id}
                              onClick={() => toggleAttendee(member)}
                              className={`w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors ${
                                isSelected ? 'bg-purple-50' : ''
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${
                                  member.type === 'manager' ? 'bg-blue-500' :
                                  member.type === 'supervisor' ? 'bg-purple-500' :
                                  'bg-emerald-500'
                                }`}>
                                  {member.avatar}
                                </div>
                                <div>
                                  <p className="text-[10px] font-semibold text-slate-900">{member.name}</p>
                                  <p className="text-[8px] text-slate-500">{member.role}</p>
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="h-3 w-3 text-purple-600" />
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-[10px] text-slate-400">No team members found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={2}
                  placeholder="Optional description..."
                />
              </div>
              
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowAttendeePicker(false);
                    setAttendeeSearch('');
                  }}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Dashboard Component
const AdminDashboard = () => {
  const currentTime = useCurrentTime();
  const navigate = useNavigate();
  const { data, loading, error, lastUpdated, refreshing, refetch } = useDashboardData();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [showFullscreen, setShowFullscreen] = useState(false);

  const handleCollapseChange = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const handleCreateEvent = (eventData) => {
    console.log('New event created:', eventData);
    // Here you would typically call your API to save the event
    // Example: eventsAPI.create(eventData)
  };

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

  // Loading State
  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
        {!showFullscreen && (
          <AdminSidebar 
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
            onCollapseChange={handleCollapseChange}
          />
        )}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Loading Dashboard</h3>
            <p className="text-sm text-slate-600">Preparing your executive overview</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
        {!showFullscreen && (
          <AdminSidebar 
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
            onCollapseChange={handleCollapseChange}
          />
        )}
        <div className="flex-1 flex items-center justify-center p-6">
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
      </div>
    );
  }

  const activeProjects = data.projects?.filter(p => p.status === "active" || p.status === "in_progress").slice(0, 8) || [];
  const activeTenders = data.tenders?.filter(t => t.status === "active").slice(0, 6) || [];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {!showFullscreen && (
        <AdminSidebar 
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          onCollapseChange={handleCollapseChange}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 py-4 px-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!showFullscreen && (
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
              <div className="text-right hidden sm:block">
                <div className="text-lg font-bold text-slate-900 tabular-nums">
                  {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {currentTime.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
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

        {/* Main Dashboard Grid */}
        <div className="flex-1 overflow-hidden">
          <div className="p-4 h-full flex flex-col gap-4">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
              <ModernKPICard
                label="Active Projects"
                value={data.statistics?.activeProjects || 0}
                icon={Building2}
                trend={data.trends?.projects || "neutral"}
                trendValue={data.trends?.projectsValue || "0 active"}
                colorScheme="primary"
              />
              <ModernKPICard
                label="Total Budget"
                value={formatCurrency(data.statistics?.totalBudget || 0)}
                icon={DollarSign}
                trend={data.trends?.budget || "neutral"}
                trendValue={data.trends?.budgetValue || "$0"}
                colorScheme="success"
              />
              <ModernKPICard
                label="Team Members"
                value={data.statistics?.teamSize || 0}
                icon={Users}
                trend={data.trends?.team || "neutral"}
                trendValue={data.trends?.teamValue || "0 members"}
                colorScheme="purple"
              />
              <ModernKPICard
                label="Completion Rate"
                value={`${data.statistics?.completionRate || 0}%`}
                icon={Target}
                trend={data.trends?.completion || "neutral"}
                trendValue={data.trends?.completionValue || "0%"}
                colorScheme="warning"
              />
            </div>

            {/* Main Content Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 lg:grid-rows-2 gap-3 min-h-0 overflow-auto lg:overflow-hidden">
              {/* Project Status Chart */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900">Project Status</h3>
                  <PieChartIcon className="h-4 w-4 text-slate-400" />
                </div>
                <div className="h-48 lg:h-[calc(100%-2rem)]">
                  {data.chartData?.statusData?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.chartData.statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={50}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {data.chartData.statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{fontSize: '10px'}} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-xs text-slate-400">No project data</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Progress Chart */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900">Progress</h3>
                  <BarChart3 className="h-4 w-4 text-slate-400" />
                </div>
                <div className="h-48 lg:h-[calc(100%-2rem)]">
                  {data.chartData?.projectProgressData?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.chartData.projectProgressData.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" fontSize={9} />
                        <YAxis fontSize={9} />
                        <Tooltip />
                        <Bar dataKey="progress" fill={CHART_COLORS.primary[0]} radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-xs text-slate-400">No progress data</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Activity Calendar */}
              <div className="lg:row-span-2 bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-900">Calendar</h3>
                </div>
                <EnhancedCalendar 
                  events={data.events} 
                  tasks={data.tasks} 
                  onCreateEvent={handleCreateEvent}
                  teamMembers={data.allTeamMembers || []}
                />
              </div>

              {/* Active Projects List */}
              <div className="lg:row-span-2 bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <PlayCircle className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">Active Projects</h3>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">{activeProjects.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {activeProjects.length > 0 ? (
                    activeProjects.slice(0, 6).map((project, index) => (
                      <div 
                        key={project.id || index} 
                        className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
                        onClick={() => navigate(`/admin/projects/${project.id}`)}
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <h4 className="text-xs font-semibold text-slate-900 truncate flex-1">
                            {safeString(project.title) || safeString(project.name) || "Untitled"}
                          </h4>
                          <span className="text-xs font-bold text-blue-600 ml-2">
                            {Math.round(project.progress_percentage || project.progress || 0)}%
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1 mb-1.5">
                          <User className="h-3 w-3 text-slate-400" />
                          <span className="text-[9px] text-slate-500 truncate">
                            {getProjectAssignee(project, data.rawManagers || data.managers)}
                          </span>
                        </div>
                        
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${project.progress_percentage || project.progress || 0}%` }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-xs text-slate-400">No active projects</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Tenders */}
              <div className="lg:row-span-2 bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col">
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
                      <div 
                        key={tender.id || index} 
                        className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-all"
                        onClick={() => navigate(`/admin/tenders/${tender.id}`)}
                      >
                        <h4 className="text-xs font-semibold text-slate-900 truncate mb-1">
                          {safeString(tender.title) || safeString(tender.name) || "Untitled Tender"}
                        </h4>
                        
                        <div className="flex items-center space-x-1 mb-1.5">
                          <User className="h-3 w-3 text-slate-400" />
                          <span className="text-[9px] text-slate-500 truncate">
                            {safeString(tender.created_by) || safeString(tender.project_manager) || safeString(tender.submitted_by) || "System"}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-600">
                            {formatCurrency(tender.budget_estimate || tender.value || tender.amount)}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(tender.deadline || tender.submission_deadline)}</span>
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

              {/* Top Managers */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">Top Managers</h3>
                  </div>
                  <Crown className="h-4 w-4 text-amber-500" />
                </div>
                <div className="space-y-2">
                  {(data.chartData?.topManagers || []).length > 0 ? (
                    data.chartData.topManagers.slice(0, 3).map((manager, index) => (
                      <div 
                        key={manager.id || index} 
                        className="p-2 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 hover:shadow-md transition-all"
                        onClick={() => navigate(`/admin/project-manager/${manager.id}`)}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-[10px]">
                            {manager.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">{manager.name}</p>
                            <p className="text-[10px] text-blue-600 font-medium">{Math.round(manager.performance)}% perf</p>
                          </div>
                        </div>
                        {manager.currentProjects && manager.currentProjects.length > 0 && (
                          <div className="mt-1 pt-1 border-t border-blue-200">
                            <p className="text-[8px] text-slate-500 mb-0.5">Working on:</p>
                            {manager.currentProjects.slice(0, 2).map((proj, idx) => (
                              <p key={idx} className="text-[9px] text-blue-700 truncate">• {proj}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">No managers</p>
                  )}
                </div>
              </div>

              {/* Top Supervisors */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <HardHat className="h-4 w-4 text-purple-600" />
                    <h3 className="text-sm font-bold text-slate-900">Top Supervisors</h3>
                  </div>
                  <Crown className="h-4 w-4 text-amber-500" />
                </div>
                <div className="space-y-2">
                  {(data.chartData?.topSupervisors || []).length > 0 ? (
                    data.chartData.topSupervisors.slice(0, 3).map((supervisor, index) => (
                      <div 
                        key={supervisor.id || index} 
                        className="p-2 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 hover:shadow-md transition-all"
                        onClick={() => navigate(`/admin/supervisor/${supervisor.id}`)}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px]">
                            {supervisor.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">{supervisor.name}</p>
                            <p className="text-[10px] text-purple-600 font-medium">{Math.round(supervisor.performance)}% perf</p>
                          </div>
                        </div>
                        {supervisor.currentProjects && supervisor.currentProjects.length > 0 && (
                          <div className="mt-1 pt-1 border-t border-purple-200">
                            <p className="text-[8px] text-slate-500 mb-0.5">Working on:</p>
                            {supervisor.currentProjects.slice(0, 2).map((proj, idx) => (
                              <p key={idx} className="text-[9px] text-purple-700 truncate">• {proj}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">No supervisors</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 py-4 px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-slate-600 gap-2">
            <div className="flex items-center space-x-4">
              <span className="font-semibold">© 2025 Ujenzi & Paints</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "Never"}</span>
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
// import React, { useState, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import AdminSidebar from "../../pages/admin/AdminSidebar";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   Legend,
// } from "recharts";
// import {
//   Users,
//   Building2,
//   RefreshCw,
//   AlertTriangle,
//   DollarSign,
//   Target,
//   ArrowUpRight,
//   ArrowDownRight,
//   Crown,
//   Briefcase,
//   HardHat,
//   X,
//   Menu,
//   BarChart3,
//   PieChart as PieChartIcon,
//   Calendar,
//   FileText,
//   PlayCircle,
//   ChevronLeft,
//   ChevronRight,
//   Plus,
//   Clock,
//   User,
//   Check,
//   Search,
// } from "lucide-react";
// import {
//   fetchProjectManagers,
//   projectsAPI,
//   tendersAPI,
//   tasksAPI,
//   eventsAPI,
//   supervisorsAPI,
//   siteManagersAPI,
//   calendarAPI,
//   dashboardAPI,
// } from "../../services/api";

// // Chart Colors
// const CHART_COLORS = {
//   primary: ["#0ea5e9", "#0284c7", "#0369a1", "#0c4a6e"],
//   success: ["#22c55e", "#16a34a", "#15803d", "#166534"],
//   warning: ["#f59e0b", "#d97706", "#b45309", "#92400e"],
//   danger: ["#ef4444", "#dc2626", "#b91c1c", "#991b1b"],
//   purple: ["#a855f7", "#9333ea", "#7c3aed", "#6d28d9"],
// };

// // Custom Hooks
// const useCurrentTime = () => {
//   const [currentTime, setCurrentTime] = useState(new Date());
//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);
//   return currentTime;
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
//   if (!dateString) return "No date";
//   try {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//     });
//   } catch {
//     return "Invalid";
//   }
// };

// // Safe string extraction helper - prevents rendering objects directly
// const safeString = (value) => {
//   if (value === null || value === undefined) return "";
//   if (typeof value === "string") return value;
//   if (typeof value === "number") return String(value);
//   if (typeof value === "object") {
//     if (value.name) return String(value.name);
//     if (value.title) return String(value.title);
//     if (value.full_name) return String(value.full_name);
//     if (value.username) return String(value.username);
//     if (value.email) return String(value.email);
//     return "";
//   }
//   return String(value);
// };

// // Enhanced function to get project creator/manager name
// const getProjectAssignee = (project) => {
//   // Check all possible fields for project manager/creator
//   const fieldsToCheck = [
//     project.project_manager,
//     project.manager,
//     project.created_by,
//     project.creator,
//     project.owner,
//     project.assigned_to,
//     project.author,
//     project.user,
//     project.admin,
//   ];

//   for (const field of fieldsToCheck) {
//     const name = safeString(field);
//     if (name && name.trim()) {
//       return name;
//     }
//   }

//   // If still no name found, check for ID-based references and return a formatted version
//   if (project.project_manager_id) {
//     return `Manager #${project.project_manager_id}`;
//   }
//   if (project.created_by_id || project.creator_id || project.user_id) {
//     return `User #${project.created_by_id || project.creator_id || project.user_id}`;
//   }

//   return "Unassigned";
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
//     chartData: {},
//     trends: {},
//     allTeamMembers: [], // Add this for calendar user selection
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

//       const [
//         projectsResponse,
//         managersResponse,
//         eventsResponse,
//         tasksResponse,
//         tendersResponse,
//         supervisorsResponse,
//         siteManagersResponse,
//         calendarEventsResponse,
//       ] = await Promise.allSettled([
//         projectsAPI.getAll().catch(() => ({ projects: [] })),
//         fetchProjectManagers().catch(() => []),
//         eventsAPI.getUpcoming(20).catch(() => ({ events: [] })),
//         tasksAPI.getAll().catch(() => ({ tasks: [] })),
//         tendersAPI.getAll().catch(() => ({ tenders: [] })),
//         supervisorsAPI.getAll().catch(() => []),
//         siteManagersAPI.getAll().catch(() => []),
//         calendarAPI.getTodayEvents().catch(() => []),
//       ]);

//       // Process API responses
//       const projectsData = projectsResponse.status === "fulfilled" ? projectsResponse.value : { projects: [] };
//       const managersData = managersResponse.status === "fulfilled" ? managersResponse.value : [];
//       const eventsData = eventsResponse.status === "fulfilled" ? eventsResponse.value : { events: [] };
//       const tasksData = tasksResponse.status === "fulfilled" ? tasksResponse.value : { tasks: [] };
//       const tendersData = tendersResponse.status === "fulfilled" ? tendersResponse.value : { tenders: [] };
//       const supervisorsData = supervisorsResponse.status === "fulfilled" ? supervisorsResponse.value : [];
//       const siteManagersData = siteManagersResponse.status === "fulfilled" ? siteManagersResponse.value : [];
//       const calendarEventsData = calendarEventsResponse.status === "fulfilled" ? calendarEventsResponse.value : [];

//       // Normalize data arrays
//       const projects = Array.isArray(projectsData.projects) ? projectsData.projects : Array.isArray(projectsData) ? projectsData : [];
//       const events = Array.isArray(eventsData.events) ? eventsData.events : Array.isArray(eventsData) ? eventsData : [];
//       const tasks = Array.isArray(tasksData.tasks) ? tasksData.tasks : Array.isArray(tasksData) ? tasksData : [];
//       const tenders = Array.isArray(tendersData.tenders) ? tendersData.tenders : Array.isArray(tendersData) ? tendersData : [];
//       const supervisors = Array.isArray(supervisorsData) ? supervisorsData : [];
//       const siteManagers = Array.isArray(siteManagersData) ? siteManagersData : [];
//       const todayEvents = Array.isArray(calendarEventsData) ? calendarEventsData : [];

//       // Process team members with safe string extraction
//       const managers = Array.isArray(managersData)
//         ? managersData.map((manager) => {
//             const managerProjects = projects.filter(p => 
//               p.project_manager_id === manager.id ||
//               p.manager_id === manager.id ||
//               safeString(p.project_manager) === safeString(manager.name)
//             );
            
//             const managerName = safeString(manager.name) || "Unknown Manager";
            
//             return {
//               id: manager.id || Math.random().toString(),
//               name: managerName,
//               email: safeString(manager.email) || "unknown@email.com",
//               projectsCount: manager.number_of_projects || managerProjects.length || 0,
//               workload: Math.min(100, (manager.number_of_projects || managerProjects.length || 0) * 25),
//               efficiency: 85 + Math.random() * 15,
//               avatar: managerName.split(" ").map((n) => n[0]).join("").substring(0, 2) || "M",
//               role: "Manager",
//               performance: 75 + Math.random() * 25,
//               currentProjects: managerProjects.slice(0, 2).map(p => safeString(p.title) || safeString(p.name) || "Untitled"),
//             };
//           })
//         : [];

//       const processedSupervisors = supervisors.map((supervisor) => {
//         const supervisorProjects = projects.filter(p => 
//           p.supervisor_id === supervisor.id ||
//           safeString(p.supervisor) === safeString(supervisor.name)
//         );
        
//         const supervisorName = safeString(supervisor.name) || "Unknown Supervisor";
        
//         return {
//           id: supervisor.id || Math.random().toString(),
//           name: supervisorName,
//           email: safeString(supervisor.email) || "unknown@email.com",
//           projectsCount: supervisor.number_of_projects || supervisorProjects.length || 0,
//           workload: Math.min(100, (supervisor.number_of_projects || supervisorProjects.length || 0) * 20),
//           efficiency: 80 + Math.random() * 20,
//           avatar: supervisorName.split(" ").map((n) => n[0]).join("").substring(0, 2) || "S",
//           role: "Supervisor",
//           performance: 70 + Math.random() * 30,
//           currentProjects: supervisorProjects.slice(0, 2).map(p => safeString(p.title) || safeString(p.name) || "Untitled"),
//         };
//       });

//       const processedSiteManagers = siteManagers.map((siteManager) => {
//         const siteManagerName = safeString(siteManager.name) || "Unknown Site Manager";
        
//         return {
//           id: siteManager.id || Math.random().toString(),
//           name: siteManagerName,
//           email: safeString(siteManager.email) || "unknown@email.com",
//           projectsCount: siteManager.number_of_projects || 0,
//           workload: Math.min(100, (siteManager.number_of_projects || 0) * 25),
//           efficiency: 85 + Math.random() * 15,
//           avatar: siteManagerName.split(" ").map((n) => n[0]).join("").substring(0, 2) || "SM",
//           role: "Site Manager",
//           performance: 75 + Math.random() * 25,
//         };
//       });

//       // Create combined team members list for calendar
//       const allTeamMembers = [
//         ...managers.map(m => ({ ...m, type: 'manager' })),
//         ...processedSupervisors.map(s => ({ ...s, type: 'supervisor' })),
//         ...processedSiteManagers.map(sm => ({ ...sm, type: 'site_manager' })),
//       ];

//       // Calculate statistics
//       const totalTasks = tasks.length || 0;
//       const completedTasks = tasks.filter((t) => t.status === "completed").length || 0;
//       const teamSize = (managers.length || 0) + (processedSupervisors.length || 0) + (processedSiteManagers.length || 0);

//       const statistics = {
//         totalProjects: projects.length || 0,
//         activeProjects: projects.filter((p) => p.status === "active" || p.status === "in_progress").length || 0,
//         completedProjects: projects.filter((p) => p.status === "completed").length || 0,
//         totalTasks,
//         completedTasks,
//         pendingTasks: tasks.filter((t) => t.status === "pending").length || 0,
//         overdueTasks: tasks.filter((t) => {
//           if (!t.due_date) return false;
//           return new Date(t.due_date) < new Date() && t.status !== "completed";
//         }).length || 0,
//         teamSize,
//         managersCount: managers.length || 0,
//         supervisorsCount: processedSupervisors.length || 0,
//         siteManagersCount: processedSiteManagers.length || 0,
//         activeTenders: tenders.filter((t) => t.status === "active").length || 0,
//         totalTenders: tenders.length || 0,
//         totalBudget: projects.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0) || 0,
//         completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
//       };

//       // Calculate real trends
//       const trends = {
//         projects: statistics.activeProjects > 0 ? "up" : "neutral",
//         projectsValue: statistics.activeProjects > 0 ? `${statistics.activeProjects} active` : "No active",
//         budget: statistics.totalBudget > 0 ? "up" : "neutral",
//         budgetValue: statistics.totalBudget > 0 ? formatCurrency(statistics.totalBudget) : "$0",
//         team: teamSize > 0 ? "neutral" : "down",
//         teamValue: `${teamSize} members`,
//         completion: statistics.completionRate >= 50 ? "up" : statistics.completionRate > 0 ? "neutral" : "down",
//         completionValue: `${statistics.completionRate}%`,
//       };

//       // Prepare chart data
//       const topManagers = managers.sort((a, b) => (b.performance || 0) - (a.performance || 0)).slice(0, 3);
//       const topSupervisors = processedSupervisors.sort((a, b) => (b.performance || 0) - (a.performance || 0)).slice(0, 3);

//       const statusData = [
//         { name: "Active", value: statistics.activeProjects, color: CHART_COLORS.primary[1] },
//         { name: "Completed", value: statistics.completedProjects, color: CHART_COLORS.success[1] },
//         { name: "Planning", value: Math.max(0, statistics.totalProjects - statistics.activeProjects - statistics.completedProjects), color: CHART_COLORS.warning[1] },
//       ].filter(item => item.value > 0);

//       const projectProgressData = projects.slice(0, 8).map((project, index) => ({
//         name: (safeString(project.title) || safeString(project.name) || `P${index + 1}`).substring(0, 10),
//         progress: parseFloat(project.progress_percentage || project.progress || 0),
//         budget: parseFloat(project.budget || 0),
//       }));

//       const chartData = {
//         topManagers,
//         topSupervisors,
//         statusData,
//         projectProgressData,
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
//         chartData,
//         trends,
//         allTeamMembers,
//       });

//       setLastUpdated(new Date());
//     } catch (err) {
//       console.error("❌ Dashboard data fetch failed:", err);
//       setError(err.message || "Failed to load dashboard data");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//     const interval = setInterval(() => fetchData(true), 300000);
//     return () => clearInterval(interval);
//   }, [fetchData]);

//   const refetch = useCallback(() => fetchData(true), [fetchData]);

//   return { data, loading, error, lastUpdated, refreshing, refetch };
// };

// // Modern KPI Card
// const ModernKPICard = ({ label, value, icon: Icon, trend, trendValue, colorScheme = "primary" }) => {
//   const colorSchemes = {
//     primary: {
//       bg: "bg-white",
//       iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
//       accent: "text-blue-600",
//       trendUp: "text-emerald-600 bg-emerald-50",
//       trendDown: "text-red-600 bg-red-50",
//     },
//     success: {
//       bg: "bg-white",
//       iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
//       accent: "text-emerald-600",
//       trendUp: "text-emerald-600 bg-emerald-50",
//       trendDown: "text-red-600 bg-red-50",
//     },
//     warning: {
//       bg: "bg-white",
//       iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
//       accent: "text-amber-600",
//       trendUp: "text-emerald-600 bg-emerald-50",
//       trendDown: "text-red-600 bg-red-50",
//     },
//     purple: {
//       bg: "bg-white",
//       iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
//       accent: "text-purple-600",
//       trendUp: "text-emerald-600 bg-emerald-50",
//       trendDown: "text-red-600 bg-red-50",
//     },
//   };

//   const colors = colorSchemes[colorScheme];

//   return (
//     <div className={`${colors.bg} rounded-xl p-4 border border-slate-200 shadow-sm`}>
//       <div className="flex items-center justify-between">
//         <div className={`p-2 rounded-lg ${colors.iconBg} shadow-md`}>
//           <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
//         </div>
//         {trend && (
//           <div
//             className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
//               trend === "up" ? colors.trendUp : trend === "down" ? colors.trendDown : "bg-slate-100 text-slate-600"
//             }`}
//           >
//             {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
//             <span>{trendValue}</span>
//           </div>
//         )}
//       </div>
//       <div className="mt-3">
//         <h3 className={`text-2xl font-bold ${colors.accent} tracking-tight`}>{value}</h3>
//         <p className="text-xs font-semibold text-slate-900 mt-1">{label}</p>
//       </div>
//     </div>
//   );
// };

// // Enhanced Interactive Calendar Component with User Tagging
// const EnhancedCalendar = ({ events, tasks, onCreateEvent, teamMembers = [] }) => {
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showAttendeePicker, setShowAttendeePicker] = useState(false);
//   const [attendeeSearch, setAttendeeSearch] = useState('');
//   const [newEvent, setNewEvent] = useState({
//     title: '',
//     type: 'meeting',
//     time: '09:00',
//     description: '',
//     attendees: [],
//   });

//   const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
//   const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

//   const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
//   const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

//   const getActivitiesForDate = (date) => {
//     try {
//       const dateStr = date.toISOString().split('T')[0];
      
//       const dayEvents = (events || []).filter(event => {
//         try {
//           const eventDateStr = event.date || event.start_date || event.event_date;
//           if (!eventDateStr) return false;
//           const eventDate = new Date(eventDateStr);
//           if (isNaN(eventDate.getTime())) return false;
//           return eventDate.toISOString().split('T')[0] === dateStr;
//         } catch {
//           return false;
//         }
//       });
      
//       const dayTasks = (tasks || []).filter(task => {
//         try {
//           const taskDateStr = task.due_date || task.deadline;
//           if (!taskDateStr) return false;
//           const taskDate = new Date(taskDateStr);
//           if (isNaN(taskDate.getTime())) return false;
//           return taskDate.toISOString().split('T')[0] === dateStr;
//         } catch {
//           return false;
//         }
//       });
      
//       return [...dayEvents.map(e => ({ ...e, type: 'event' })), ...dayTasks.map(t => ({ ...t, type: 'task' }))];
//     } catch {
//       return [];
//     }
//   };

//   // Filter team members based on search
//   const filteredTeamMembers = teamMembers.filter(member => 
//     member.name.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
//     member.email.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
//     member.role.toLowerCase().includes(attendeeSearch.toLowerCase())
//   );

//   // Toggle attendee selection
//   const toggleAttendee = (member) => {
//     setNewEvent(prev => {
//       const isSelected = prev.attendees.some(a => a.id === member.id);
//       if (isSelected) {
//         return {
//           ...prev,
//           attendees: prev.attendees.filter(a => a.id !== member.id)
//         };
//       } else {
//         return {
//           ...prev,
//           attendees: [...prev.attendees, { id: member.id, name: member.name, email: member.email, role: member.role }]
//         };
//       }
//     });
//   };

//   // Remove attendee
//   const removeAttendee = (memberId) => {
//     setNewEvent(prev => ({
//       ...prev,
//       attendees: prev.attendees.filter(a => a.id !== memberId)
//     }));
//   };

//   const handleCreateEvent = () => {
//     if (newEvent.title.trim()) {
//       if (onCreateEvent) {
//         onCreateEvent({
//           ...newEvent,
//           date: selectedDate.toISOString(),
//         });
//       }
      
//       setShowCreateModal(false);
//       setShowAttendeePicker(false);
//       setAttendeeSearch('');
//       setNewEvent({
//         title: '',
//         type: 'meeting',
//         time: '09:00',
//         description: '',
//         attendees: [],
//       });
//     }
//   };

//   const daysInMonth = getDaysInMonth(currentDate);
//   const firstDayOfMonth = getFirstDayOfMonth(currentDate);
//   const today = new Date();
//   const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//   const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

//   const calendarDays = [];
//   for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
//   for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

//   const selectedActivities = getActivitiesForDate(selectedDate);

//   return (
//     <div className="flex flex-col h-full">
//       {/* Calendar Header */}
//       <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
//         <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
//           <ChevronLeft className="h-4 w-4 text-slate-600" />
//         </button>
//         <div className="text-center">
//           <span className="text-sm font-bold text-slate-900">
//             {monthNames[currentDate.getMonth()]}
//           </span>
//           <span className="text-xs text-slate-500 ml-1">{currentDate.getFullYear()}</span>
//         </div>
//         <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
//           <ChevronRight className="h-4 w-4 text-slate-600" />
//         </button>
//       </div>

//       {/* Day Names */}
//       <div className="grid grid-cols-7 gap-0.5 mb-1">
//         {dayNames.map((day, i) => (
//           <div key={i} className="text-center text-[9px] font-semibold text-slate-400 py-1">{day}</div>
//         ))}
//       </div>

//       {/* Calendar Grid */}
//       <div className="grid grid-cols-7 gap-0.5 flex-1">
//         {calendarDays.map((day, index) => {
//           if (!day) return <div key={`empty-${index}`} className="aspect-square" />;
          
//           const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
//           const activities = getActivitiesForDate(date);
//           const isToday = date.toDateString() === today.toDateString();
//           const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
//           const hasActivities = activities.length > 0;
//           const isPast = date < today && !isToday;

//           return (
//             <button
//               key={day}
//               onClick={() => setSelectedDate(date)}
//               className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] font-medium relative transition-all
//                 ${isToday ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md' : ''}
//                 ${isSelected && !isToday ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-400' : ''}
//                 ${!isToday && !isSelected && !isPast ? 'hover:bg-slate-100 text-slate-700' : ''}
//                 ${isPast && !isToday && !isSelected ? 'text-slate-400' : ''}
//               `}
//             >
//               <span>{day}</span>
//               {hasActivities && (
//                 <div className="flex gap-0.5 mt-0.5">
//                   {activities.slice(0, 3).map((_, idx) => (
//                     <div 
//                       key={idx} 
//                       className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-purple-500'}`} 
//                     />
//                   ))}
//                 </div>
//               )}
//             </button>
//           );
//         })}
//       </div>

//       {/* Selected Date Section */}
//       <div className="mt-3 pt-3 border-t border-slate-200">
//         <div className="flex items-center justify-between mb-2">
//           <h5 className="text-xs font-bold text-slate-900">
//             {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
//           </h5>
//           <button
//             onClick={() => setShowCreateModal(true)}
//             className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
//           >
//             <Plus className="h-3 w-3" />
//             <span className="text-[9px] font-semibold">Add</span>
//           </button>
//         </div>
        
//         <div className="space-y-1.5 max-h-24 overflow-y-auto">
//           {selectedActivities.length > 0 ? (
//             selectedActivities.slice(0, 4).map((activity, index) => (
//               <div
//                 key={index}
//                 className={`px-2 py-1.5 rounded-lg text-[9px] flex items-center space-x-2 ${
//                   activity.type === 'event' 
//                     ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200' 
//                     : 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200'
//                 }`}
//               >
//                 <div className={`w-1.5 h-1.5 rounded-full ${activity.type === 'event' ? 'bg-blue-500' : 'bg-amber-500'}`} />
//                 <span className="truncate font-medium">{safeString(activity.title) || safeString(activity.name) || 'Untitled'}</span>
//               </div>
//             ))
//           ) : (
//             <div className="text-center py-3">
//               <Calendar className="h-6 w-6 text-slate-300 mx-auto mb-1" />
//               <p className="text-[9px] text-slate-400">No activities</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Create Event Modal */}
//       {showCreateModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl p-4 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-sm font-bold text-slate-900">Create Event</h3>
//               <button 
//                 onClick={() => {
//                   setShowCreateModal(false);
//                   setShowAttendeePicker(false);
//                   setAttendeeSearch('');
//                 }}
//                 className="p-1 rounded hover:bg-slate-100"
//               >
//                 <X className="h-4 w-4 text-slate-500" />
//               </button>
//             </div>
            
//             <div className="space-y-3">
//               <div>
//                 <label className="text-xs font-semibold text-slate-700 block mb-1">Title</label>
//                 <input
//                   type="text"
//                   value={newEvent.title}
//                   onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
//                   className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   placeholder="Event title..."
//                 />
//               </div>
              
//               <div className="grid grid-cols-2 gap-2">
//                 <div>
//                   <label className="text-xs font-semibold text-slate-700 block mb-1">Type</label>
//                   <select
//                     value={newEvent.type}
//                     onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
//                     className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   >
//                     <option value="meeting">Meeting</option>
//                     <option value="event">Event</option>
//                     <option value="deadline">Deadline</option>
//                     <option value="reminder">Reminder</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="text-xs font-semibold text-slate-700 block mb-1">Time</label>
//                   <input
//                     type="time"
//                     value={newEvent.time}
//                     onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
//                     className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   />
//                 </div>
//               </div>

//               {/* Attendees Section */}
//               <div>
//                 <label className="text-xs font-semibold text-slate-700 block mb-1">
//                   Attendees {newEvent.attendees.length > 0 && `(${newEvent.attendees.length})`}
//                 </label>
                
//                 {/* Selected Attendees */}
//                 {newEvent.attendees.length > 0 && (
//                   <div className="flex flex-wrap gap-1 mb-2">
//                     {newEvent.attendees.map((attendee) => (
//                       <div
//                         key={attendee.id}
//                         className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px]"
//                       >
//                         <span className="font-medium">{attendee.name}</span>
//                         <button
//                           onClick={() => removeAttendee(attendee.id)}
//                           className="hover:text-purple-900"
//                         >
//                           <X className="h-3 w-3" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {/* Add Attendees Button */}
//                 <button
//                   onClick={() => setShowAttendeePicker(!showAttendeePicker)}
//                   className="w-full px-3 py-2 text-xs border border-dashed border-slate-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center justify-center space-x-2 text-slate-600"
//                 >
//                   <Users className="h-3 w-3" />
//                   <span>{showAttendeePicker ? 'Hide team members' : 'Add team members'}</span>
//                 </button>

//                 {/* Attendee Picker */}
//                 {showAttendeePicker && (
//                   <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden">
//                     {/* Search */}
//                     <div className="p-2 border-b border-slate-200">
//                       <div className="relative">
//                         <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
//                         <input
//                           type="text"
//                           value={attendeeSearch}
//                           onChange={(e) => setAttendeeSearch(e.target.value)}
//                           className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
//                           placeholder="Search team members..."
//                         />
//                       </div>
//                     </div>

//                     {/* Team Members List */}
//                     <div className="max-h-40 overflow-y-auto">
//                       {filteredTeamMembers.length > 0 ? (
//                         filteredTeamMembers.map((member) => {
//                           const isSelected = newEvent.attendees.some(a => a.id === member.id);
//                           return (
//                             <button
//                               key={member.id}
//                               onClick={() => toggleAttendee(member)}
//                               className={`w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors ${
//                                 isSelected ? 'bg-purple-50' : ''
//                               }`}
//                             >
//                               <div className="flex items-center space-x-2">
//                                 <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${
//                                   member.type === 'manager' ? 'bg-blue-500' :
//                                   member.type === 'supervisor' ? 'bg-purple-500' :
//                                   'bg-emerald-500'
//                                 }`}>
//                                   {member.avatar}
//                                 </div>
//                                 <div>
//                                   <p className="text-[10px] font-semibold text-slate-900">{member.name}</p>
//                                   <p className="text-[8px] text-slate-500">{member.role}</p>
//                                 </div>
//                               </div>
//                               {isSelected && (
//                                 <Check className="h-3 w-3 text-purple-600" />
//                               )}
//                             </button>
//                           );
//                         })
//                       ) : (
//                         <div className="p-4 text-center">
//                           <p className="text-[10px] text-slate-400">No team members found</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
              
//               <div>
//                 <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
//                 <textarea
//                   value={newEvent.description}
//                   onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
//                   className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
//                   rows={2}
//                   placeholder="Optional description..."
//                 />
//               </div>
              
//               <div className="flex space-x-2 pt-2">
//                 <button
//                   onClick={() => {
//                     setShowCreateModal(false);
//                     setShowAttendeePicker(false);
//                     setAttendeeSearch('');
//                   }}
//                   className="flex-1 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleCreateEvent}
//                   className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all"
//                 >
//                   Create
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Main Dashboard Component
// const AdminDashboard = () => {
//   const currentTime = useCurrentTime();
//   const navigate = useNavigate();
//   const { data, loading, error, lastUpdated, refreshing, refetch } = useDashboardData();
  
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
//     const saved = localStorage.getItem('sidebar-collapsed');
//     return saved !== null ? JSON.parse(saved) : false;
//   });
//   const [showFullscreen, setShowFullscreen] = useState(false);

//   const handleCollapseChange = (collapsed) => {
//     setSidebarCollapsed(collapsed);
//   };

//   const handleCreateEvent = (eventData) => {
//     console.log('New event created:', eventData);
//     // Here you would typically call your API to save the event
//     // Example: eventsAPI.create(eventData)
//   };

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const isFullscreen = params.get('fullscreen') === 'true' || localStorage.getItem('dashboard-fullscreen') === 'true';
//     setShowFullscreen(isFullscreen);
    
//     if (isFullscreen) {
//       setSidebarOpen(false);
//     }
//   }, []);

//   const toggleFullscreen = () => {
//     const newFullscreen = !showFullscreen;
//     setShowFullscreen(newFullscreen);
//     localStorage.setItem('dashboard-fullscreen', newFullscreen.toString());
    
//     if (newFullscreen) {
//       setSidebarOpen(false);
//     }
//   };

//   // Loading State
//   if (loading) {
//     return (
//       <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
//         {!showFullscreen && (
//           <AdminSidebar 
//             isOpen={sidebarOpen}
//             setIsOpen={setSidebarOpen}
//             onCollapseChange={handleCollapseChange}
//           />
//         )}
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
//             <h3 className="text-xl font-bold text-slate-900 mb-2">Loading Dashboard</h3>
//             <p className="text-sm text-slate-600">Preparing your executive overview</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Error State
//   if (error) {
//     return (
//       <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
//         {!showFullscreen && (
//           <AdminSidebar 
//             isOpen={sidebarOpen}
//             setIsOpen={setSidebarOpen}
//             onCollapseChange={handleCollapseChange}
//           />
//         )}
//         <div className="flex-1 flex items-center justify-center p-6">
//           <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
//             <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
//             <h3 className="text-xl font-bold text-slate-900 mb-2">Connection Error</h3>
//             <p className="text-sm text-slate-600 mb-6">{error}</p>
//             <button 
//               onClick={refetch} 
//               className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all text-sm font-semibold"
//             >
//               Retry Connection
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const activeProjects = data.projects?.filter(p => p.status === "active" || p.status === "in_progress").slice(0, 8) || [];
//   const activeTenders = data.tenders?.filter(t => t.status === "active").slice(0, 6) || [];

//   return (
//     <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
//       {!showFullscreen && (
//         <AdminSidebar 
//           isOpen={sidebarOpen}
//           setIsOpen={setSidebarOpen}
//           onCollapseChange={handleCollapseChange}
//         />
//       )}

//       <div className="flex-1 flex flex-col min-w-0 h-full">
//         {/* Header */}
//         <div className="bg-white border-b border-slate-200 py-4 px-6 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               {!showFullscreen && (
//                 <button
//                   onClick={() => setSidebarOpen(!sidebarOpen)}
//                   className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
//                 >
//                   <Menu className="h-5 w-5 text-slate-700" />
//                 </button>
//               )}
//               <div className="flex items-center space-x-3">
//                 <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
//                   <Building2 className="h-6 w-6 text-white" />
//                 </div>
//                 <div>
//                   <h1 className="text-xl font-bold text-slate-900">Executive Dashboard</h1>
//                   <p className="text-sm text-slate-600">Real-time project overview & analytics</p>
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-center space-x-6">
//               <div className="text-right hidden sm:block">
//                 <div className="text-lg font-bold text-slate-900 tabular-nums">
//                   {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
//                 </div>
//                 <div className="text-xs text-slate-500 font-medium">
//                   {currentTime.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
//                 </div>
//               </div>
              
//               <div className="flex items-center space-x-3">
//                 <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
//                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
//                   <span className="text-sm font-semibold text-emerald-700">LIVE</span>
//                 </div>
                
//                 <button 
//                   onClick={refetch} 
//                   disabled={refreshing}
//                   className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
//                   title="Refresh data"
//                 >
//                   <RefreshCw className={`h-5 w-5 text-slate-700 ${refreshing ? "animate-spin" : ""}`} />
//                 </button>
                
//                 <button 
//                   onClick={toggleFullscreen}
//                   className={`p-2 rounded-lg transition-colors ${
//                     showFullscreen ? 'bg-orange-100 hover:bg-orange-200 text-orange-700' : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
//                   }`}
//                 >
//                   {showFullscreen ? <X className="h-5 w-5" /> : <Target className="h-5 w-5" />}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Dashboard Grid */}
//         <div className="flex-1 overflow-hidden">
//           <div className="p-4 h-full flex flex-col gap-4">
//             {/* Key Metrics Row */}
//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
//               <ModernKPICard
//                 label="Active Projects"
//                 value={data.statistics?.activeProjects || 0}
//                 icon={Building2}
//                 trend={data.trends?.projects || "neutral"}
//                 trendValue={data.trends?.projectsValue || "0 active"}
//                 colorScheme="primary"
//               />
//               <ModernKPICard
//                 label="Total Budget"
//                 value={formatCurrency(data.statistics?.totalBudget || 0)}
//                 icon={DollarSign}
//                 trend={data.trends?.budget || "neutral"}
//                 trendValue={data.trends?.budgetValue || "$0"}
//                 colorScheme="success"
//               />
//               <ModernKPICard
//                 label="Team Members"
//                 value={data.statistics?.teamSize || 0}
//                 icon={Users}
//                 trend={data.trends?.team || "neutral"}
//                 trendValue={data.trends?.teamValue || "0 members"}
//                 colorScheme="purple"
//               />
//               <ModernKPICard
//                 label="Completion Rate"
//                 value={`${data.statistics?.completionRate || 0}%`}
//                 icon={Target}
//                 trend={data.trends?.completion || "neutral"}
//                 trendValue={data.trends?.completionValue || "0%"}
//                 colorScheme="warning"
//               />
//             </div>

//             {/* Main Content Grid */}
//             <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 lg:grid-rows-2 gap-3 min-h-0 overflow-auto lg:overflow-hidden">
//               {/* Project Status Chart */}
//               <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
//                 <div className="flex items-center justify-between mb-3">
//                   <h3 className="text-sm font-bold text-slate-900">Project Status</h3>
//                   <PieChartIcon className="h-4 w-4 text-slate-400" />
//                 </div>
//                 <div className="h-48 lg:h-[calc(100%-2rem)]">
//                   {data.chartData?.statusData?.length > 0 ? (
//                     <ResponsiveContainer width="100%" height="100%">
//                       <PieChart>
//                         <Pie
//                           data={data.chartData.statusData}
//                           cx="50%"
//                           cy="50%"
//                           innerRadius={30}
//                           outerRadius={50}
//                           paddingAngle={2}
//                           dataKey="value"
//                         >
//                           {data.chartData.statusData.map((entry, index) => (
//                             <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
//                           ))}
//                         </Pie>
//                         <Tooltip />
//                         <Legend wrapperStyle={{fontSize: '10px'}} />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   ) : (
//                     <div className="flex items-center justify-center h-full">
//                       <p className="text-xs text-slate-400">No project data</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Project Progress Chart */}
//               <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
//                 <div className="flex items-center justify-between mb-3">
//                   <h3 className="text-sm font-bold text-slate-900">Progress</h3>
//                   <BarChart3 className="h-4 w-4 text-slate-400" />
//                 </div>
//                 <div className="h-48 lg:h-[calc(100%-2rem)]">
//                   {data.chartData?.projectProgressData?.length > 0 ? (
//                     <ResponsiveContainer width="100%" height="100%">
//                       <BarChart data={data.chartData.projectProgressData.slice(0, 5)}>
//                         <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
//                         <XAxis dataKey="name" fontSize={9} />
//                         <YAxis fontSize={9} />
//                         <Tooltip />
//                         <Bar dataKey="progress" fill={CHART_COLORS.primary[0]} radius={[2, 2, 0, 0]} />
//                       </BarChart>
//                     </ResponsiveContainer>
//                   ) : (
//                     <div className="flex items-center justify-center h-full">
//                       <p className="text-xs text-slate-400">No progress data</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Enhanced Activity Calendar */}
//               <div className="lg:row-span-2 bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col">
//                 <div className="flex items-center space-x-2 mb-2">
//                   <Calendar className="h-4 w-4 text-purple-600" />
//                   <h3 className="text-sm font-bold text-slate-900">Calendar</h3>
//                 </div>
//                 <EnhancedCalendar 
//                   events={data.events} 
//                   tasks={data.tasks} 
//                   onCreateEvent={handleCreateEvent}
//                   teamMembers={data.allTeamMembers || []}
//                 />
//               </div>

//               {/* Active Projects List */}
//               <div className="lg:row-span-2 bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="flex items-center space-x-2">
//                     <PlayCircle className="h-4 w-4 text-blue-600" />
//                     <h3 className="text-sm font-bold text-slate-900">Active Projects</h3>
//                   </div>
//                   <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">{activeProjects.length}</span>
//                 </div>
//                 <div className="flex-1 overflow-y-auto space-y-2">
//                   {activeProjects.length > 0 ? (
//                     activeProjects.slice(0, 6).map((project, index) => (
//                       <div 
//                         key={project.id || index} 
//                         className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
//                         onClick={() => navigate(`/admin/projects/${project.id}`)}
//                       >
//                         <div className="flex justify-between items-start mb-1.5">
//                           <h4 className="text-xs font-semibold text-slate-900 truncate flex-1">
//                             {safeString(project.title) || safeString(project.name) || "Untitled"}
//                           </h4>
//                           <span className="text-xs font-bold text-blue-600 ml-2">
//                             {Math.round(project.progress_percentage || project.progress || 0)}%
//                           </span>
//                         </div>
                        
//                         <div className="flex items-center space-x-1 mb-1.5">
//                           <User className="h-3 w-3 text-slate-400" />
//                           <span className="text-[9px] text-slate-500 truncate">
//                             {getProjectAssignee(project)}
//                           </span>
//                         </div>
                        
//                         <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
//                           <div className="h-full bg-blue-500 rounded-full" style={{ width: `${project.progress_percentage || project.progress || 0}%` }} />
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="flex-1 flex items-center justify-center">
//                       <p className="text-xs text-slate-400">No active projects</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Active Tenders */}
//               <div className="lg:row-span-2 bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="flex items-center space-x-2">
//                     <FileText className="h-4 w-4 text-orange-600" />
//                     <h3 className="text-sm font-bold text-slate-900">Active Tenders</h3>
//                   </div>
//                   <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2 py-1 rounded">{activeTenders.length}</span>
//                 </div>
//                 <div className="flex-1 overflow-y-auto space-y-2">
//                   {activeTenders.length > 0 ? (
//                     activeTenders.slice(0, 5).map((tender, index) => (
//                       <div 
//                         key={tender.id || index} 
//                         className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-all"
//                         onClick={() => navigate(`/admin/tenders/${tender.id}`)}
//                       >
//                         <h4 className="text-xs font-semibold text-slate-900 truncate mb-1">
//                           {safeString(tender.title) || safeString(tender.name) || "Untitled Tender"}
//                         </h4>
                        
//                         <div className="flex items-center space-x-1 mb-1.5">
//                           <User className="h-3 w-3 text-slate-400" />
//                           <span className="text-[9px] text-slate-500 truncate">
//                             {safeString(tender.created_by) || safeString(tender.project_manager) || safeString(tender.submitted_by) || "System"}
//                           </span>
//                         </div>
                        
//                         <div className="flex items-center justify-between">
//                           <span className="text-xs font-bold text-emerald-600">
//                             {formatCurrency(tender.budget_estimate || tender.value || tender.amount)}
//                           </span>
//                           <span className="text-[10px] text-slate-500 flex items-center space-x-1">
//                             <Clock className="h-3 w-3" />
//                             <span>{formatDate(tender.deadline || tender.submission_deadline)}</span>
//                           </span>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="flex-1 flex items-center justify-center">
//                       <p className="text-xs text-slate-400">No active tenders</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Top Managers */}
//               <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="flex items-center space-x-2">
//                     <Briefcase className="h-4 w-4 text-blue-600" />
//                     <h3 className="text-sm font-bold text-slate-900">Top Managers</h3>
//                   </div>
//                   <Crown className="h-4 w-4 text-amber-500" />
//                 </div>
//                 <div className="space-y-2">
//                   {(data.chartData?.topManagers || []).length > 0 ? (
//                     data.chartData.topManagers.slice(0, 3).map((manager, index) => (
//                       <div 
//                         key={manager.id || index} 
//                         className="p-2 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 hover:shadow-md transition-all"
//                         onClick={() => navigate(`/admin/project-manager/${manager.id}`)}
//                       >
//                         <div className="flex items-center space-x-2 mb-1">
//                           <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-[10px]">
//                             {manager.avatar}
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <p className="text-xs font-semibold text-slate-900 truncate">{manager.name}</p>
//                             <p className="text-[10px] text-blue-600 font-medium">{Math.round(manager.performance)}% perf</p>
//                           </div>
//                         </div>
//                         {manager.currentProjects && manager.currentProjects.length > 0 && (
//                           <div className="mt-1 pt-1 border-t border-blue-200">
//                             <p className="text-[8px] text-slate-500 mb-0.5">Working on:</p>
//                             {manager.currentProjects.slice(0, 2).map((proj, idx) => (
//                               <p key={idx} className="text-[9px] text-blue-700 truncate">• {proj}</p>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-xs text-slate-400 text-center py-4">No managers</p>
//                   )}
//                 </div>
//               </div>

//               {/* Top Supervisors */}
//               <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="flex items-center space-x-2">
//                     <HardHat className="h-4 w-4 text-purple-600" />
//                     <h3 className="text-sm font-bold text-slate-900">Top Supervisors</h3>
//                   </div>
//                   <Crown className="h-4 w-4 text-amber-500" />
//                 </div>
//                 <div className="space-y-2">
//                   {(data.chartData?.topSupervisors || []).length > 0 ? (
//                     data.chartData.topSupervisors.slice(0, 3).map((supervisor, index) => (
//                       <div 
//                         key={supervisor.id || index} 
//                         className="p-2 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 hover:shadow-md transition-all"
//                         onClick={() => navigate(`/admin/supervisor/${supervisor.id}`)}
//                       >
//                         <div className="flex items-center space-x-2 mb-1">
//                           <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px]">
//                             {supervisor.avatar}
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <p className="text-xs font-semibold text-slate-900 truncate">{supervisor.name}</p>
//                             <p className="text-[10px] text-purple-600 font-medium">{Math.round(supervisor.performance)}% perf</p>
//                           </div>
//                         </div>
//                         {supervisor.currentProjects && supervisor.currentProjects.length > 0 && (
//                           <div className="mt-1 pt-1 border-t border-purple-200">
//                             <p className="text-[8px] text-slate-500 mb-0.5">Working on:</p>
//                             {supervisor.currentProjects.slice(0, 2).map((proj, idx) => (
//                               <p key={idx} className="text-[9px] text-purple-700 truncate">• {proj}</p>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-xs text-slate-400 text-center py-4">No supervisors</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="bg-white border-t border-slate-200 py-4 px-6">
//           <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-slate-600 gap-2">
//             <div className="flex items-center space-x-4">
//               <span className="font-semibold">© 2025 Ujenzi & Paints</span>
//               <span className="hidden sm:inline">•</span>
//               <span className="hidden sm:inline">Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "Never"}</span>
//             </div>
//             <div className="flex items-center space-x-4">
//               <span>Projects: {data.statistics?.totalProjects || 0}</span>
//               <span>•</span>
//               <span>Team: {data.statistics?.teamSize || 0}</span>
//               <span>•</span>
//               <span>Tenders: {data.statistics?.activeTenders || 0}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;