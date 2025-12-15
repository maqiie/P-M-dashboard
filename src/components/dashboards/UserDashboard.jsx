import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar";
import UserDashboardRoutes from "../../routes/UserDashboardRoutes";
import {
  getUserDetails,
  logout,
  dashboardAPI,
  createProject,
  supervisorsAPI,
  siteManagersAPI,
  projectsAPI,
  notificationsAPI,
  tasksAPI,
  eventsAPI,
  tendersAPI,
} from "../../services/api";
import ProgressUpdateModal from "../ProgressUpdateModal";
import { progressAPI } from "../../services/progressAPI";
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
  MapPin,
  User,
  Building2,
  Filter,
  Search,
  ArrowRight,
  Activity,
  Menu,
  Wifi,
  WifiOff,
  X,
  Save,
  DollarSign,
  HardHat,
  Clipboard,
  UserCheck,
  TrendingUp,
  BarChart3,
  Eye,
  ExternalLink,
  Zap,
  Award,
  Gauge,
  TrendingDown,
  RefreshCw,
  CheckCheck,
  Archive,
  Loader2,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  Settings,
  Trash2,
  Circle,
  PlayCircle,
  Target,
  Timer,
  CalendarDays,
  CheckSquare,
  Folder,
} from "lucide-react";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Format time ago
const formatTimeAgo = (dateString) => {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

// Format due date for display
const formatDueDate = (dateString) => {
  if (!dateString) return "No due date";

  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((dateOnly - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `In ${diffDays} days`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Check if date is today
const isToday = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// Check if date is this week
const isThisWeek = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return date >= startOfWeek && date < endOfWeek;
};

// Check if task is overdue
const isOverdue = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

// Get days until deadline
const getDaysUntilDeadline = (date) => {
  if (!date) return null;
  return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
};

// ============================================================================
// TOAST COMPONENT
// ============================================================================

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }[type];

  return (
    <div
      className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 z-50 animate-slide-up`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:bg-white/20 rounded-full p-1"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// ============================================================================
// CONFIRM MODAL COMPONENT
// ============================================================================

const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// NOTIFICATION PANEL COMPONENT
// ============================================================================

const NotificationPanel = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  unreadCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-96 max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Notifications</h3>
            <p className="text-xs text-gray-600">{unreadCount} unread</p>
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-y-auto max-h-96">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => onMarkRead(notification.id)}
              className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.read && !notification.isRead
                  ? "bg-blue-50/50"
                  : ""
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    notification.notification_type === "urgent" ||
                    notification.type === "urgent"
                      ? "bg-red-500"
                      : notification.notification_type === "success" ||
                        notification.type === "success"
                      ? "bg-green-500"
                      : notification.notification_type === "warning" ||
                        notification.type === "warning"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {notification.created_at
                      ? formatTimeAgo(notification.created_at)
                      : notification.timeAgo || "Just now"}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        )}
      </div>
      <div className="p-3 border-t border-gray-100 bg-gray-50">
        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All Notifications
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // User and data states
  const [user, setUser] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Loading states for individual sections
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingTenders, setLoadingTenders] = useState(false);

  // Progress Tracking States
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedProjectForProgress, setSelectedProjectForProgress] =
    useState(null);
  const [projectsWithProgress, setProjectsWithProgress] = useState([]);
  const [progressOverview, setProgressOverview] = useState({
    totalProjects: 0,
    onTrack: 0,
    behindSchedule: 0,
    aheadOfSchedule: 0,
    averageProgress: 0,
    averageVariance: 0,
  });

  // UI states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCompletedProjects, setShowCompletedProjects] = useState(false);
  const [projectViewMode, setProjectViewMode] = useState("grid");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    projectId: null,
    projectTitle: "",
  });

  // Task completion state
  const [completingTask, setCompletingTask] = useState(null);

  // Check if we're on the main dashboard route
  const isMainDashboard =
    location.pathname === "/user" ||
    location.pathname === "/user/" ||
    location.pathname === "/user/dashboard";

  // Project creation form state
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    location: "",
    budget: "",
    startDate: "",
    endDate: "",
    priority: "medium",
    status: "planning",
    supervisorId: "",
    siteManagerId: "",
    projectManagerId: "",
  });

  // Dropdown options
  const [supervisors, setSupervisors] = useState([]);
  const [siteManagers, setSiteManagers] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Show toast notification
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  // Hide toast
  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast("Connection restored", "success");
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast("You are offline", "warning");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [showToast]);

  // Load dashboard data
  useEffect(() => {
    if (isMainDashboard) {
      loadUserData();
      loadNotifications();
      loadTasks();
      loadEvents();
      loadTenders();
    }
  }, [isMainDashboard]);

  // ============================================================================
  // DATA LOADING FUNCTIONS
  // ============================================================================

  // Load tasks from API
  const loadTasks = async () => {
    try {
      setLoadingTasks(true);
      console.log("🔄 Loading tasks...");

      let tasksData = [];

      // Try tasksAPI.getAll first
      if (tasksAPI?.getAll) {
        try {
          const response = await tasksAPI.getAll({
            exclude_completed: false,
            limit: 20,
          });
          tasksData = response.tasks || response.data?.tasks || response || [];
          console.log("✅ Tasks loaded via tasksAPI.getAll:", tasksData.length);
        } catch (e) {
          console.warn("tasksAPI.getAll failed:", e.message);
        }
      }

      // Fallback to dashboardAPI.getTasks
      if (tasksData.length === 0 && dashboardAPI?.getTasks) {
        try {
          const response = await dashboardAPI.getTasks();
          tasksData = response.tasks || response.data?.tasks || response || [];
          console.log(
            "✅ Tasks loaded via dashboardAPI.getTasks:",
            tasksData.length
          );
        } catch (e) {
          console.warn("dashboardAPI.getTasks failed:", e.message);
        }
      }

      // Fallback to dashboard recent_tasks
      if (tasksData.length === 0 && dashboardStats?.recent_tasks) {
        tasksData = dashboardStats.recent_tasks;
        console.log("✅ Tasks loaded from dashboard stats:", tasksData.length);
      }

      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      console.error("❌ Failed to load tasks:", error);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Load events from API
  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      console.log("🔄 Loading events...");

      let eventsData = [];

      // Try eventsAPI.getUpcoming
      if (eventsAPI?.getUpcoming) {
        try {
          const response = await eventsAPI.getUpcoming(10);
          eventsData =
            response.events || response.data?.events || response || [];
          console.log(
            "✅ Events loaded via eventsAPI.getUpcoming:",
            eventsData.length
          );
        } catch (e) {
          console.warn("eventsAPI.getUpcoming failed:", e.message);
        }
      }

      // Try eventsAPI.getThisWeek
      if (eventsData.length === 0 && eventsAPI?.getThisWeek) {
        try {
          const response = await eventsAPI.getThisWeek();
          eventsData =
            response.events || response.data?.events || response || [];
          console.log(
            "✅ Events loaded via eventsAPI.getThisWeek:",
            eventsData.length
          );
        } catch (e) {
          console.warn("eventsAPI.getThisWeek failed:", e.message);
        }
      }

      // Try eventsAPI.getAll
      if (eventsData.length === 0 && eventsAPI?.getAll) {
        try {
          const response = await eventsAPI.getAll();
          eventsData =
            response.events || response.data?.events || response || [];
          console.log(
            "✅ Events loaded via eventsAPI.getAll:",
            eventsData.length
          );
        } catch (e) {
          console.warn("eventsAPI.getAll failed:", e.message);
        }
      }

      // Fallback to dashboardAPI.getUpcomingEvents
      if (eventsData.length === 0 && dashboardAPI?.getUpcomingEvents) {
        try {
          const response = await dashboardAPI.getUpcomingEvents(10);
          eventsData =
            response.events || response.data?.events || response || [];
          console.log("✅ Events loaded via dashboardAPI:", eventsData.length);
        } catch (e) {
          console.warn("dashboardAPI.getUpcomingEvents failed:", e.message);
        }
      }

      // Sort by date
      if (Array.isArray(eventsData)) {
        eventsData.sort((a, b) => {
          const dateA = new Date(
            a.date || a.event_date || a.start_date || "9999-12-31"
          );
          const dateB = new Date(
            b.date || b.event_date || b.start_date || "9999-12-31"
          );
          return dateA - dateB;
        });
      }

      setUpcomingEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (error) {
      console.error("❌ Failed to load events:", error);
      setUpcomingEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Load tenders from API
  const loadTenders = async () => {
    try {
      setLoadingTenders(true);
      console.log("🔄 Loading tenders...");

      let tendersData = [];

      // Try tendersAPI.getActive
      if (tendersAPI?.getActive) {
        try {
          const response = await tendersAPI.getActive();
          tendersData =
            response.tenders || response.data?.tenders || response || [];
          console.log(
            "✅ Tenders loaded via tendersAPI.getActive:",
            tendersData.length
          );
        } catch (e) {
          console.warn("tendersAPI.getActive failed:", e.message);
        }
      }

      // Try tendersAPI.getUrgent
      if (tendersData.length === 0 && tendersAPI?.getUrgent) {
        try {
          const response = await tendersAPI.getUrgent();
          tendersData =
            response.tenders || response.data?.tenders || response || [];
          console.log(
            "✅ Tenders loaded via tendersAPI.getUrgent:",
            tendersData.length
          );
        } catch (e) {
          console.warn("tendersAPI.getUrgent failed:", e.message);
        }
      }

      // Try tendersAPI.getAll
      if (tendersData.length === 0 && tendersAPI?.getAll) {
        try {
          const response = await tendersAPI.getAll({ status: "active" });
          tendersData =
            response.tenders || response.data?.tenders || response || [];
          console.log(
            "✅ Tenders loaded via tendersAPI.getAll:",
            tendersData.length
          );
        } catch (e) {
          console.warn("tendersAPI.getAll failed:", e.message);
        }
      }

      // Fallback to dashboardAPI.getTenders
      if (tendersData.length === 0 && dashboardAPI?.getTenders) {
        try {
          const response = await dashboardAPI.getTenders();
          tendersData =
            response.tenders || response.data?.tenders || response || [];
          console.log(
            "✅ Tenders loaded via dashboardAPI:",
            tendersData.length
          );
        } catch (e) {
          console.warn("dashboardAPI.getTenders failed:", e.message);
        }
      }

      // Sort by deadline (soonest first)
      if (Array.isArray(tendersData)) {
        tendersData.sort((a, b) => {
          const dateA = new Date(
            a.deadline || a.due_date || a.submission_deadline || "9999-12-31"
          );
          const dateB = new Date(
            b.deadline || b.due_date || b.submission_deadline || "9999-12-31"
          );
          return dateA - dateB;
        });
      }

      setTenders(Array.isArray(tendersData) ? tendersData : []);
    } catch (error) {
      console.error("❌ Failed to load tenders:", error);
      setTenders([]);
    } finally {
      setLoadingTenders(false);
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    try {
      if (notificationsAPI?.getAll) {
        const response = await notificationsAPI.getAll({ limit: 10 });
        setNotifications(
          response.notifications || response.data?.notifications || []
        );
        setUnreadNotificationCount(
          response.unread_count || response.data?.unread_count || 0
        );
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  // Calculate progress overview
  const calculateProgressOverview = useCallback((projects) => {
    const activeProjects = projects.filter((p) => p.status !== "completed");
    const totalProjects = activeProjects.length;
    const onTrack = activeProjects.filter(
      (p) => p.schedule_status === "on_track"
    ).length;
    const behindSchedule = activeProjects.filter(
      (p) => p.schedule_status === "behind_schedule"
    ).length;
    const aheadOfSchedule = activeProjects.filter(
      (p) => p.schedule_status === "ahead_of_schedule"
    ).length;

    const averageProgress =
      totalProjects > 0
        ? activeProjects.reduce(
            (sum, p) =>
              sum + (p.current_progress || p.progress_percentage || 0),
            0
          ) / totalProjects
        : 0;

    const averageVariance =
      totalProjects > 0
        ? activeProjects.reduce(
            (sum, p) => sum + Math.abs(p.progress_variance || 0),
            0
          ) / totalProjects
        : 0;

    setProgressOverview({
      totalProjects,
      onTrack,
      behindSchedule,
      aheadOfSchedule,
      averageProgress: Math.round(averageProgress),
      averageVariance: Math.round(averageVariance * 10) / 10,
    });
  }, []);

  // Load progress data for projects
  const loadProjectsProgress = useCallback(async () => {
    if (myProjects.length === 0) return;

    try {
      const projectsWithProgressData = await Promise.all(
        myProjects.map(async (project) => {
          try {
            const progressData = await progressAPI.getProgress(project.id);
            return { ...project, ...progressData };
          } catch {
            return {
              ...project,
              current_progress: project.progress_percentage || 0,
              timeline_progress: 0,
              progress_variance: 0,
              schedule_status: "on_track",
              status_color: "blue",
            };
          }
        })
      );
      setProjectsWithProgress(projectsWithProgressData);
      calculateProgressOverview(projectsWithProgressData);
    } catch (error) {
      console.error("Failed to load projects progress:", error);
      setProjectsWithProgress(myProjects);
      calculateProgressOverview(myProjects);
    }
  }, [myProjects, calculateProgressOverview]);

  // Load progress when projects change
  useEffect(() => {
    if (myProjects.length > 0) {
      loadProjectsProgress();
    }
  }, [myProjects, loadProjectsProgress]);

  // Mark notification as read
  const handleMarkNotificationRead = async (notificationId) => {
    try {
      if (notificationsAPI?.markRead) {
        await notificationsAPI.markRead(notificationId);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true, isRead: true } : n
          )
        );
        setUnreadNotificationCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllNotificationsRead = async () => {
    try {
      if (notificationsAPI?.markAllRead) {
        await notificationsAPI.markAllRead();
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true, isRead: true }))
        );
        setUnreadNotificationCount(0);
        showToast("All notifications marked as read", "success");
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // Handle progress update modal
  const handleProgressUpdate = (projectId) => {
    const project = projectsWithProgress.find((p) => p.id === projectId);
    if (project) {
      setSelectedProjectForProgress(project);
      setShowProgressModal(true);
    }
  };

  // Handle progress update completion
  const handleProgressUpdated = (updatedProject) => {
    setProjectsWithProgress((prev) =>
      prev.map((p) =>
        p.id === updatedProject.id ? { ...p, ...updatedProject } : p
      )
    );
    setMyProjects((prev) =>
      prev.map((p) =>
        p.id === updatedProject.id
          ? { ...p, progress_percentage: updatedProject.progress_percentage }
          : p
      )
    );
    loadProjectsProgress();
    showToast("Progress updated successfully", "success");
  };

  // Open confirmation modal for marking complete
  const openMarkCompleteConfirm = (projectId, projectTitle, e) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      projectId,
      projectTitle,
    });
  };

  // Handle marking project as completed
  const handleMarkAsCompleted = async () => {
    const { projectId, projectTitle } = confirmModal;
    if (!projectId || markingComplete) return;

    try {
      setMarkingComplete(projectId);
      await projectsAPI.markAsCompleted(projectId);

      showToast(`Project "${projectTitle}" marked as completed!`, "success");

      setConfirmModal({ isOpen: false, projectId: null, projectTitle: "" });
      await loadUserData();

      console.log(`✅ Project ${projectId} marked as completed`);
    } catch (error) {
      console.error(
        `❌ Failed to mark project ${projectId} as completed:`,
        error
      );
      showToast(
        "Failed to mark project as completed. Please try again.",
        "error"
      );
    } finally {
      setMarkingComplete(null);
    }
  };

  // Handle completing a task
  const handleCompleteTask = async (taskId, e) => {
    e.stopPropagation();
    if (completingTask) return;

    try {
      setCompletingTask(taskId);

      if (tasksAPI?.complete) {
        await tasksAPI.complete(taskId);
      } else if (tasksAPI?.updateStatus) {
        await tasksAPI.updateStatus(taskId, "completed");
      } else if (tasksAPI?.update) {
        await tasksAPI.update(taskId, { status: "completed" });
      }

      showToast("Task completed!", "success");
      await loadTasks();
    } catch (error) {
      console.error("Failed to complete task:", error);
      showToast("Failed to complete task", "error");
    } finally {
      setCompletingTask(null);
    }
  };

  // Navigate to project details
  // const handleProjectClick = (projectId) => {
  //   navigate(`/user/projects?projectId=${projectId}`);
  // };

  // Navigate to task details
  const handleTaskClick = (taskId) => {
    navigate(`/user/tasks?taskId=${taskId}`);
  };

  // Navigate to event details
  const handleEventClick = (eventId) => {
    navigate(`/user/events?eventId=${eventId}`);
  };

  // Navigate to tender details
  const handleTenderClick = (tenderId) => {
    navigate(`/user/tenders?tenderId=${tenderId}`);
  };

  // Load user data
  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Loading user and dashboard data...");

      // Load user details
      const userResponse = await getUserDetails();
      if (userResponse) {
        const userData = userResponse.data || userResponse.user || userResponse;
        setUser(userData);
      }

      // Try main dashboard endpoint first
      try {
        const dashboardData = await dashboardAPI.getDashboard();
        console.log("✅ Dashboard data loaded:", dashboardData);

        if (dashboardData) {
          const allProjects = dashboardData.projects || [];
          const active = allProjects.filter((p) => p.status !== "completed");
          const completed = allProjects.filter((p) => p.status === "completed");

          setMyProjects(active);
          setCompletedProjects(completed);
          setDashboardStats(dashboardData.statistics || {});

          // Set tasks/events/tenders from dashboard if available
          if (
            dashboardData.tasks?.length > 0 ||
            dashboardData.recent_tasks?.length > 0
          ) {
            setTasks(dashboardData.tasks || dashboardData.recent_tasks || []);
          }
          if (dashboardData.events?.length > 0) {
            setUpcomingEvents(dashboardData.events);
          }
          if (dashboardData.tenders?.length > 0) {
            setTenders(dashboardData.tenders);
          }
          return;
        }
      } catch (dashboardError) {
        console.warn(
          "⚠️ Main dashboard endpoint failed, trying individual endpoints"
        );
      }

      // Fallback: Load from individual endpoints
      const [projectsData] = await Promise.allSettled([
        dashboardAPI.getProjects(),
      ]);

      if (projectsData.status === "fulfilled") {
        const allProjects = projectsData.value || [];
        const active = allProjects.filter((p) => p.status !== "completed");
        const completed = allProjects.filter((p) => p.status === "completed");
        setMyProjects(active);
        setCompletedProjects(completed);
      }
    } catch (error) {
      console.error("💥 Error loading dashboard:", error);
      setError(
        "Failed to load dashboard data. Please check your connection and try again."
      );

      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadUserData(),
      loadNotifications(),
      loadTasks(),
      loadEvents(),
      loadTenders(),
    ]);
    showToast("Dashboard refreshed", "info");
    setRefreshing(false);
  };

  // Load dropdown data
  const loadDropdownData = async () => {
    try {
      setLoadingDropdowns(true);

      const [supervisorsData, siteManagersData] = await Promise.allSettled([
        supervisorsAPI.getAll(),
        siteManagersAPI.getAll(),
      ]);

      if (supervisorsData.status === "fulfilled") {
        setSupervisors(supervisorsData.value || []);
      }

      if (siteManagersData.status === "fulfilled") {
        setSiteManagers(siteManagersData.value || []);
      }
    } catch (error) {
      console.error("Error loading dropdown data:", error);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  // Handle create project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreatingProject(true);

    try {
      if (!newProject.supervisorId) {
        throw new Error("Please select a supervisor");
      }

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
        site_manager_id: newProject.siteManagerId
          ? parseInt(newProject.siteManagerId)
          : null,
        project_manager_id: newProject.projectManagerId
          ? parseInt(newProject.projectManagerId)
          : null,
      };

      await createProject(projectData);

      showToast(
        `Project "${newProject.title}" created successfully!`,
        "success"
      );

      setNewProject({
        title: "",
        description: "",
        location: "",
        budget: "",
        startDate: "",
        endDate: "",
        priority: "medium",
        status: "planning",
        supervisorId: "",
        siteManagerId: "",
        projectManagerId: "",
      });
      setShowCreateProject(false);

      await loadUserData();
    } catch (error) {
      console.error("Error creating project:", error);
      const errorMessage =
        error.response?.data?.errors?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "Failed to create project";
      showToast(errorMessage, "error");
    } finally {
      setCreatingProject(false);
    }
  };

  // Open create project modal
  const handleOpenCreateProject = () => {
    setShowCreateProject(true);
    loadDropdownData();
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getWorkloadStatus = (member) => {
    const projectCount =
      member.projects_count || member.current_projects?.length || 0;
    if (projectCount === 0)
      return { status: "available", color: "green", text: "Available" };
    if (projectCount <= 2)
      return { status: "light", color: "yellow", text: "Light Load" };
    if (projectCount <= 4)
      return { status: "busy", color: "orange", text: "Busy" };
    return { status: "overloaded", color: "red", text: "Overloaded" };
  };

  const getWorkloadColorClasses = (color) => {
    const colors = {
      green: "bg-green-100 text-green-800 border-green-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      red: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[color] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusColor = (status) => {
    const colors = {
      in_progress: "bg-blue-100 text-blue-800 border-blue-200",
      planning: "bg-yellow-100 text-yellow-800 border-yellow-200",
      review: "bg-purple-100 text-purple-800 border-purple-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      on_hold: "bg-orange-100 text-orange-800 border-orange-200",
      pending: "bg-gray-100 text-gray-800 border-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getPriorityIndicator = (priority) => {
    const colors = {
      high: "bg-red-500",
      urgent: "bg-red-600",
      medium: "bg-yellow-500",
      low: "bg-green-500",
    };
    return colors[priority] || "bg-gray-400";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "text-red-600 bg-red-50",
      urgent: "text-red-700 bg-red-100",
      medium: "text-yellow-600 bg-yellow-50",
      low: "text-green-600 bg-green-50",
    };
    return colors[priority] || "text-gray-600 bg-gray-50";
  };

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // ============================================================================
  // COMPUTED DATA
  // ============================================================================

  // Filter tasks for today and pending
  const todaysTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const taskDueDate = task.due_date || task.dueDate || task.due;
        const taskStatus = (task.status || "").toLowerCase();

        // Exclude completed and cancelled tasks
        if (taskStatus === "completed" || taskStatus === "cancelled")
          return false;

        // Include today's tasks, overdue tasks, and pending/in_progress tasks
        if (isToday(taskDueDate)) return true;
        if (isOverdue(taskDueDate)) return true;
        if (taskStatus === "pending" || taskStatus === "in_progress")
          return true;

        return false;
      })
      .sort((a, b) => {
        // Sort by due date, then by priority
        const dateA = new Date(
          a.due_date || a.dueDate || a.due || "9999-12-31"
        );
        const dateB = new Date(
          b.due_date || b.dueDate || b.due || "9999-12-31"
        );
        return dateA - dateB;
      })
      .slice(0, 6);
  }, [tasks]);

  // Filter events for this week
  const thisWeekEvents = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return upcomingEvents
      .filter((event) => {
        const eventDate = new Date(
          event.date || event.event_date || event.start_date
        );
        return eventDate >= startOfWeek && eventDate < endOfWeek;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date || a.event_date || a.start_date);
        const dateB = new Date(b.date || b.event_date || b.start_date);
        return dateA - dateB;
      })
      .slice(0, 5);
  }, [upcomingEvents]);

  // Filter tenders with upcoming deadlines
  const urgentTenders = useMemo(() => {
    return tenders
      .filter((tender) => {
        const status = (tender.status || "").toLowerCase();
        return (
          status !== "completed" &&
          status !== "converted" &&
          status !== "cancelled" &&
          status !== "rejected"
        );
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.deadline || a.due_date || a.submission_deadline || "9999-12-31"
        );
        const dateB = new Date(
          b.deadline || b.due_date || b.submission_deadline || "9999-12-31"
        );
        return dateA - dateB;
      })
      .slice(0, 5);
  }, [tenders]);

  // Calculate stats from data
  const calculatedStats = useMemo(
    () => ({
      activeProjects: myProjects.length,
      completedProjects: completedProjects.length,
      totalTeamMembers: myProjects.reduce(
        (sum, p) => sum + (p.team_size || 0),
        0
      ),
      activeTenders: tenders.filter(
        (t) => t.status !== "completed" && t.status !== "converted"
      ).length,
      pendingTasks: tasks.filter(
        (t) => t.status === "pending" || t.status === "in_progress"
      ).length,
      overdueTasks: tasks.filter(
        (t) => isOverdue(t.due_date || t.dueDate) && t.status !== "completed"
      ).length,
      upcomingEvents: thisWeekEvents.length,
    }),
    [myProjects, completedProjects, tenders, tasks, thisWeekEvents]
  );

  // Active projects for display
  const activeProjectsForDisplay = useMemo(() => {
    const projects =
      projectsWithProgress.length > 0 ? projectsWithProgress : myProjects;
    return projects.filter((p) => p.status !== "completed");
  }, [projectsWithProgress, myProjects]);

  // ============================================================================
  // RENDER: TODAY'S TASKS SECTION
  // ============================================================================

  const renderTodaysTasks = () => {
    return (
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-white/40">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <CheckSquare className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Today's Tasks
                </h3>
                {calculatedStats.overdueTasks > 0 && (
                  <p className="text-xs text-red-600">
                    {calculatedStats.overdueTasks} overdue
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {loadingTasks && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              )}
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                {todaysTasks.length}
              </span>
            </div>
          </div>
        </div>
        <div className="p-4">
          {loadingTasks ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-green-500 mx-auto" />
              <p className="mt-2 text-sm text-gray-500">Loading tasks...</p>
            </div>
          ) : todaysTasks.length > 0 ? (
            <div className="space-y-3">
              {todaysTasks.map((task) => {
                const taskDueDate = task.due_date || task.dueDate || task.due;
                const taskIsOverdue =
                  isOverdue(taskDueDate) && task.status !== "completed";
                const taskIsToday = isToday(taskDueDate);
                const taskStatus = (task.status || "").toLowerCase();

                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md cursor-pointer group ${
                      taskStatus === "completed"
                        ? "bg-green-50/80 border-green-400"
                        : taskIsOverdue
                        ? "bg-red-50/80 border-red-400"
                        : taskIsToday
                        ? "bg-yellow-50/80 border-yellow-400"
                        : taskStatus === "in_progress"
                        ? "bg-blue-50/80 border-blue-400"
                        : "bg-gray-50/80 border-gray-400"
                    }`}
                    onClick={() => handleTaskClick(task.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {taskStatus === "completed" ? (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : taskIsOverdue ? (
                            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                          ) : taskStatus === "in_progress" ? (
                            <PlayCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          )}
                          <p
                            className={`text-sm font-medium truncate ${
                              taskStatus === "completed"
                                ? "text-gray-500 line-through"
                                : "text-gray-900"
                            }`}
                          >
                            {task.title || task.task || task.name}
                          </p>
                        </div>

                        <div className="ml-6 space-y-1">
                          {(task.project_title ||
                            task.project?.title ||
                            task.project) && (
                            <p className="text-xs text-gray-600 flex items-center">
                              <Folder className="h-3 w-3 mr-1" />
                              {task.project_title ||
                                task.project?.title ||
                                task.project}
                            </p>
                          )}

                          <div className="flex items-center space-x-3">
                            <p
                              className={`text-xs flex items-center ${
                                taskIsOverdue
                                  ? "text-red-600 font-medium"
                                  : taskIsToday
                                  ? "text-yellow-600 font-medium"
                                  : "text-gray-500"
                              }`}
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDueDate(taskDueDate)}
                            </p>

                            {task.priority && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(
                                  task.priority
                                )}`}
                              >
                                {task.priority}
                              </span>
                            )}
                          </div>

                          {(task.assigned_to?.name ||
                            task.assignee?.name ||
                            task.assignee) && (
                            <p className="text-xs text-gray-500 flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {task.assigned_to?.name ||
                                task.assignee?.name ||
                                task.assignee}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quick complete button */}
                      {taskStatus !== "completed" && (
                        <button
                          onClick={(e) => handleCompleteTask(task.id, e)}
                          disabled={completingTask === task.id}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-all"
                          title="Mark as complete"
                        >
                          {completingTask === task.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">All caught up!</p>
              <p className="text-xs text-gray-400">
                No pending tasks for today
              </p>
            </div>
          )}
          <button
            onClick={() => navigate("/user/tasks")}
            className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            View All Tasks
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER: THIS WEEK EVENTS SECTION
  // ============================================================================

  const renderThisWeekEvents = () => {
    return (
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-white/40">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">This Week</h3>
            </div>
            <div className="flex items-center space-x-2">
              {loadingEvents && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              )}
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                {thisWeekEvents.length}
              </span>
            </div>
          </div>
        </div>
        <div className="p-4">
          {loadingEvents ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
              <p className="mt-2 text-sm text-gray-500">Loading events...</p>
            </div>
          ) : thisWeekEvents.length > 0 ? (
            <div className="space-y-4">
              {thisWeekEvents.map((event) => {
                const eventDate = new Date(
                  event.date || event.event_date || event.start_date
                );
                const eventIsToday = isToday(
                  event.date || event.event_date || event.start_date
                );
                const dayName = eventDate.toLocaleDateString("en-US", {
                  weekday: "short",
                });
                const dayNumber = eventDate.getDate();

                return (
                  <div
                    key={event.id}
                    className="flex items-start space-x-3 p-3 hover:bg-gray-50/80 rounded-xl transition-colors cursor-pointer group"
                    onClick={() => handleEventClick(event.id)}
                  >
                    {/* Date indicator */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center ${
                        eventIsToday
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span className="text-xs font-medium">{dayName}</span>
                      <span className="text-lg font-bold leading-none">
                        {dayNumber}
                      </span>
                    </div>

                    {/* Event details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {event.title || event.description || event.name}
                      </p>

                      {event.time && (
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {event.time}
                        </p>
                      )}

                      {(event.project_title || event.project?.title) && (
                        <p className="text-xs text-purple-600 font-medium mt-1 flex items-center">
                          <Building2 className="h-3 w-3 mr-1" />
                          {event.project_title || event.project?.title}
                        </p>
                      )}

                      {event.location && (
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </p>
                      )}

                      {(event.responsible || event.organizer?.name) && (
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <User className="h-3 w-3 mr-1" />
                          {event.responsible || event.organizer?.name}
                        </p>
                      )}
                    </div>

                    {/* Event type indicator */}
                    <div
                      className={`w-2 h-full min-h-[40px] rounded-full flex-shrink-0 ${
                        event.event_type === "meeting" ||
                        event.type === "meeting"
                          ? "bg-blue-400"
                          : event.event_type === "review" ||
                            event.type === "review"
                          ? "bg-purple-400"
                          : event.event_type === "deadline" ||
                            event.type === "deadline"
                          ? "bg-red-400"
                          : event.event_type === "milestone" ||
                            event.type === "milestone"
                          ? "bg-yellow-400"
                          : "bg-green-400"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">No events this week</p>
              <p className="text-xs text-gray-400">Your schedule is clear</p>
            </div>
          )}
          <button
            onClick={() => navigate("/user/events")}
            className="w-full mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center py-2 rounded-lg hover:bg-purple-50 transition-colors"
          >
            View Calendar
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER: TENDER DEADLINES SECTION
  // ============================================================================

  const renderTenderDeadlines = () => {
    return (
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-white/40">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <Timer className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Tender Deadlines
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              {loadingTenders && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              )}
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                {urgentTenders.length}
              </span>
            </div>
          </div>
        </div>
        <div className="p-4">
          {loadingTenders ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
              <p className="mt-2 text-sm text-gray-500">Loading tenders...</p>
            </div>
          ) : urgentTenders.length > 0 ? (
            <div className="space-y-3">
              {urgentTenders.map((tender) => {
                const deadline =
                  tender.deadline ||
                  tender.due_date ||
                  tender.submission_deadline;
                const daysLeft = getDaysUntilDeadline(deadline);
                const isUrgent = daysLeft !== null && daysLeft <= 7;
                const isOverdueTender = daysLeft !== null && daysLeft < 0;

                return (
                  <div
                    key={tender.id}
                    className={`p-3 rounded-xl border hover:shadow-md transition-all duration-200 cursor-pointer ${
                      isOverdueTender
                        ? "bg-red-50 border-red-200"
                        : isUrgent
                        ? "bg-orange-50 border-orange-200"
                        : "bg-gradient-to-r from-orange-50/80 to-red-50/80 border-orange-200/50"
                    }`}
                    onClick={() => handleTenderClick(tender.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
                          {tender.title || tender.name}
                        </h4>

                        {tender.description && (
                          <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                            {tender.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {(tender.responsible ||
                            tender.project_manager?.name ||
                            tender.client) && (
                            <span className="text-gray-600 flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {tender.responsible ||
                                tender.project_manager?.name ||
                                tender.client}
                            </span>
                          )}

                          {tender.budget_estimate && (
                            <span className="text-gray-600 flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {typeof tender.budget_estimate === "number"
                                ? tender.budget_estimate.toLocaleString()
                                : tender.budget_estimate}
                            </span>
                          )}

                          {tender.status && (
                            <span
                              className={`px-2 py-0.5 rounded-full ${getStatusColor(
                                tender.status
                              )}`}
                            >
                              {tender.status}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Deadline indicator */}
                      <div
                        className={`flex-shrink-0 ml-3 px-2 py-1 rounded-lg text-center ${
                          isOverdueTender
                            ? "bg-red-100 text-red-700"
                            : isUrgent
                            ? "bg-orange-100 text-orange-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          {isOverdueTender ? (
                            <AlertCircle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          <span className="text-xs font-bold">
                            {isOverdueTender
                              ? `${Math.abs(daysLeft)}d late`
                              : daysLeft === 0
                              ? "Today"
                              : daysLeft === 1
                              ? "Tomorrow"
                              : `${daysLeft}d left`}
                          </span>
                        </div>
                        {deadline && (
                          <p className="text-[10px] mt-0.5 opacity-75">
                            {new Date(deadline).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">No active tenders</p>
              <p className="text-xs text-gray-400">
                All tenders are up to date
              </p>
            </div>
          )}
          <button
            onClick={() => navigate("/user/tenders")}
            className="w-full mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center justify-center py-2 rounded-lg hover:bg-orange-50 transition-colors"
          >
            View All Tenders
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER: PROGRESS OVERVIEW
  // ============================================================================

  const renderProgressOverview = () => {
    const progressData = [
      {
        name: "On Track",
        value: progressOverview.onTrack,
        color: "#10B981",
        percentage:
          progressOverview.totalProjects > 0
            ? (progressOverview.onTrack / progressOverview.totalProjects) * 100
            : 0,
      },
      {
        name: "Behind",
        value: progressOverview.behindSchedule,
        color: "#EF4444",
        percentage:
          progressOverview.totalProjects > 0
            ? (progressOverview.behindSchedule /
                progressOverview.totalProjects) *
              100
            : 0,
      },
      {
        name: "Ahead",
        value: progressOverview.aheadOfSchedule,
        color: "#3B82F6",
        percentage:
          progressOverview.totalProjects > 0
            ? (progressOverview.aheadOfSchedule /
                progressOverview.totalProjects) *
              100
            : 0,
      },
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
                <h3 className="text-xl font-bold text-gray-900">
                  Progress Overview
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Track schedule performance across all projects
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/user/projects")}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="View All Projects"
            >
              <ExternalLink className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Grid */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">
                        On Track
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {progressOverview.onTrack}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {progressOverview.totalProjects > 0
                          ? Math.round(
                              (progressOverview.onTrack /
                                progressOverview.totalProjects) *
                                100
                            )
                          : 0}
                        % of projects
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-red-50 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">
                        Behind Schedule
                      </p>
                      <p className="text-2xl font-bold text-red-900">
                        {progressOverview.behindSchedule}
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        {progressOverview.totalProjects > 0
                          ? Math.round(
                              (progressOverview.behindSchedule /
                                progressOverview.totalProjects) *
                                100
                            )
                          : 0}
                        % of projects
                      </p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">
                        Ahead of Schedule
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {progressOverview.aheadOfSchedule}
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        {progressOverview.totalProjects > 0
                          ? Math.round(
                              (progressOverview.aheadOfSchedule /
                                progressOverview.totalProjects) *
                                100
                            )
                          : 0}
                        % of projects
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">
                        Avg Progress
                      </p>
                      <p className="text-2xl font-bold text-purple-900">
                        {progressOverview.averageProgress}%
                      </p>
                      <p className="text-xs text-purple-700 mt-1">
                        ±{progressOverview.averageVariance}% variance
                      </p>
                    </div>
                    <Gauge className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {progressOverview.behindSchedule > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-red-900">
                        Projects Need Attention
                      </h4>
                      <p className="text-sm text-red-700 mt-1">
                        {progressOverview.behindSchedule} project
                        {progressOverview.behindSchedule !== 1
                          ? "s are"
                          : " is"}{" "}
                        behind schedule
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        navigate("/user/projects?filter=behind_schedule")
                      }
                      className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Donut Chart */}
            <div className="flex flex-col items-center justify-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Status Distribution
              </h4>

              <div className="relative w-40 h-40 mb-4">
                <div className="absolute inset-0 rounded-full bg-gray-200" />

                {progressData.map((item, index) => {
                  const previousTotal = progressData
                    .slice(0, index)
                    .reduce((sum, d) => sum + d.percentage, 0);
                  return (
                    <div
                      key={item.name}
                      className="absolute inset-0 rounded-full transition-all duration-1000"
                      style={{
                        background: `conic-gradient(transparent 0deg ${
                          previousTotal * 3.6
                        }deg, ${item.color} ${previousTotal * 3.6}deg ${
                          (previousTotal + item.percentage) * 3.6
                        }deg, transparent ${
                          (previousTotal + item.percentage) * 3.6
                        }deg 360deg)`,
                        mask: "radial-gradient(circle at center, transparent 45%, black 45%)",
                        WebkitMask:
                          "radial-gradient(circle at center, transparent 45%, black 45%)",
                      }}
                    />
                  );
                })}

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {progressOverview.totalProjects}
                    </div>
                    <div className="text-xs text-gray-500">Active</div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2 w-full">
                {progressData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER: PROJECT CARD
  // ============================================================================

  const renderProjectCard = (project) => (
    <div
      key={project.id}
      className="bg-gradient-to-br from-white via-white to-gray-50/30 rounded-2xl p-6 border border-gray-100/50 hover:shadow-2xl hover:border-blue-200/50 transition-all duration-300 group relative overflow-hidden cursor-pointer"
      // onClick={() => handleProjectClick(project.id)}
    >
      {/* Priority Indicator */}
      <div
        className={`absolute top-0 left-0 w-full h-1.5 ${getPriorityIndicator(
          project.priority
        )}`}
      />

      {/* Hover Actions */}
      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <button
          onClick={(e) =>
            openMarkCompleteConfirm(
              project.id,
              project.title || project.name,
              e
            )
          }
          disabled={markingComplete === project.id}
          className={`text-white p-2 rounded-full shadow-lg transition-colors ${
            markingComplete === project.id
              ? "bg-gray-400"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
          title="Mark as Completed"
        >
          {markingComplete === project.id ? (
            <Loader2 className="h-3 w-3 animate-spin" />
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

      {/* Header */}
      <div className="flex items-start justify-between mb-4 mt-6">
        <div className="flex-1 pr-16">
          <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors text-base leading-tight">
            {project.title || project.name}
          </h4>
          <span
            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
              project.status
            )}`}
          >
            {project.status?.replace("_", " ") || "Planning"}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
          <span className="truncate">
            {project.location || "No location set"}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <User className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
          <span className="truncate">
            {project.responsible || project.manager || "Unassigned"}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
          Due:{" "}
          {project.finishing_date
            ? new Date(project.finishing_date).toLocaleDateString()
            : "No deadline"}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-4">
        <EnhancedProgressBar
          project={project}
          showTimeline={true}
          showVariance={true}
        />

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={(e) =>
              openMarkCompleteConfirm(
                project.id,
                project.title || project.name,
                e
              )
            }
            disabled={markingComplete === project.id}
            className={`flex-1 py-2 px-3 text-xs rounded-lg transition-colors font-medium flex items-center justify-center ${
              markingComplete === project.id
                ? "bg-gray-100 text-gray-400"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {markingComplete === project.id ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
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
    </div>
  );

  // ============================================================================
  // RENDER: PROJECT CARDS GRID
  // ============================================================================

  const renderProjectCards = () => {
    if (activeProjectsForDisplay.length === 0) {
      return (
        <div className="text-center py-16">
          <Building2 className="mx-auto h-20 w-20 text-gray-300" />
          <h3 className="mt-6 text-xl font-semibold text-gray-900">
            No active projects
          </h3>
          <p className="text-gray-500 mt-2 mb-6">
            Create your first project to get started
          </p>
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

    if (projectViewMode === "list") {
      return (
        <div className="space-y-3">
          {activeProjectsForDisplay.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-200 flex items-center justify-between cursor-pointer"
              onClick={() => handleProjectClick(project.id)}
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div
                  className={`w-2 h-12 rounded-full ${getPriorityIndicator(
                    project.priority
                  )}`}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {project.title || project.name}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {project.location || "No location"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-32">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">
                      {project.progress_percentage || 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress_percentage || 0}%` }}
                    />
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status?.replace("_", " ")}
                </span>

                <div className="flex space-x-2">
                  <button
                    onClick={(e) =>
                      openMarkCompleteConfirm(
                        project.id,
                        project.title || project.name,
                        e
                      )
                    }
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Mark Complete"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProjectClick(project.id);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeProjectsForDisplay.map(renderProjectCard)}
      </div>
    );
  };

  // ============================================================================
  // RENDER: COMPLETED PROJECTS SECTION
  // ============================================================================

  const renderCompletedProjects = () => {
    if (!showCompletedProjects || completedProjects.length === 0) return null;

    return (
      <div className="mt-6 bg-green-50/50 rounded-xl p-4 border border-green-200/50">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-green-800 flex items-center">
            <Archive className="h-4 w-4 mr-2" />
            Completed Projects ({completedProjects.length})
          </h4>
          <button
            onClick={() => setShowCompletedProjects(false)}
            className="text-green-600 hover:text-green-700 text-sm"
          >
            Hide
          </button>
        </div>
        <div className="space-y-2">
          {completedProjects.slice(0, 5).map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg p-3 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleProjectClick(project.id)}
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    {project.title || project.name}
                  </p>
                  <p className="text-xs text-gray-500">{project.location}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">
                {project.completed_at
                  ? new Date(project.completed_at).toLocaleDateString()
                  : "Completed"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading && isMainDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-20 blur-xl animate-pulse" />
          </div>
          <p className="mt-6 text-xl text-gray-700 font-semibold">
            Loading Dashboard...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Gathering your project data
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      {/* Toast Notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Mark Project as Completed?"
        message={`Are you sure you want to mark "${confirmModal.projectTitle}" as completed? This will move it to your completed projects list.`}
        onConfirm={handleMarkAsCompleted}
        onCancel={() =>
          setConfirmModal({ isOpen: false, projectId: null, projectTitle: "" })
        }
        confirmText="Yes, Mark Complete"
        isLoading={markingComplete === confirmModal.projectId}
      />

      {/* Sidebar */}
   
      <div
        className={`fixed lg:relative inset-y-0 left-0 z-40 transform ${
          sidebarCollapsed
            ? "-translate-x-full"
            : "translate-x-0 lg:translate-x-0"
        } transition-transform duration-300 ease-in-out`}
      >
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          setIsOpen={(open) => setSidebarCollapsed(!open)}
          isOpen={!sidebarCollapsed}
        />
      </div>

      {/* Mobile Overlay - Add this right after the Sidebar */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Mobile Overlay - Add this right after the Sidebar */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {isMainDashboard ? (
          <>
            {/* Header */}
            <header className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/30 sticky top-0 z-30">
              <div className="px-3 lg:px-6 py-3 lg:py-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <button
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-all duration-200 lg:hidden mr-3"
                    >
                      {sidebarCollapsed ? (
                        <Menu className="h-6 w-6" />
                      ) : (
                        <X className="h-6 w-6" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h1 className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                          Dashboard Overview
                        </h1>
                        {isOnline ? (
                          <Wifi
                            className="h-4 w-4 text-green-500"
                            title="Connected"
                          />
                        ) : (
                          <WifiOff
                            className="h-4 w-4 text-red-500"
                            title="Offline"
                          />
                        )}
                      </div>
                      <p className="text-xs lg:text-sm text-gray-600 mt-1">
                        Welcome back, {user?.name || "User"} •{" "}
                        {calculatedStats.activeProjects} active projects
                        {calculatedStats.overdueTasks > 0 && (
                          <span className="text-red-600 ml-2">
                            • {calculatedStats.overdueTasks} overdue tasks
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 lg:space-x-4">
                    {/* Refresh Button */}
                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-all duration-200 disabled:opacity-50"
                      title="Refresh"
                    >
                      <RefreshCw
                        className={`h-5 w-5 ${
                          refreshing ? "animate-spin" : ""
                        }`}
                      />
                    </button>

                    {/* Search */}
                    <div className="relative hidden md:block">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search projects..."
                        className="pl-10 pr-4 py-2 w-48 lg:w-64 bg-white/50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Notifications */}
                    <div className="relative">
                      <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 lg:p-3 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-full transition-all duration-200"
                      >
                        <Bell className="h-5 w-5 lg:h-6 lg:w-6" />
                        {unreadNotificationCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 lg:h-5 lg:w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
                            {unreadNotificationCount > 9
                              ? "9+"
                              : unreadNotificationCount}
                          </span>
                        )}
                      </button>

                      <NotificationPanel
                        isOpen={showNotifications}
                        onClose={() => setShowNotifications(false)}
                        notifications={notifications}
                        onMarkRead={handleMarkNotificationRead}
                        onMarkAllRead={handleMarkAllNotificationsRead}
                        unreadCount={unreadNotificationCount}
                      />
                    </div>

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
                        <p className="text-xs lg:text-sm font-semibold text-gray-900">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user?.role || "Project Manager"}
                        </p>
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
              <div className="bg-red-100 border-l-4 border-red-500 p-4 mx-3 lg:mx-6 mt-3 rounded">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700 text-sm flex-1">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-3 lg:p-6">
              {/* Progress Overview */}
              {activeProjectsForDisplay.length > 0 && renderProgressOverview()}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 mb-6 lg:mb-8">
                {[
                  {
                    label: "Active Projects",
                    value: calculatedStats.activeProjects,
                    icon: Building2,
                    bgColor: "bg-blue-100",
                    iconColor: "text-blue-600",
                  },
                  {
                    label: "Completed",
                    value: calculatedStats.completedProjects,
                    icon: CheckCircle,
                    bgColor: "bg-green-100",
                    iconColor: "text-green-600",
                  },
                  {
                    label: "Team Members",
                    value: calculatedStats.totalTeamMembers,
                    icon: Users,
                    bgColor: "bg-purple-100",
                    iconColor: "text-purple-600",
                  },
                  {
                    label: "Active Tenders",
                    value: calculatedStats.activeTenders,
                    icon: FileText,
                    bgColor: "bg-orange-100",
                    iconColor: "text-orange-600",
                  },
                  {
                    label: "Pending Tasks",
                    value: calculatedStats.pendingTasks,
                    icon: Target,
                    bgColor: "bg-red-100",
                    iconColor: "text-red-600",
                  },
                  {
                    label: "This Week",
                    value: calculatedStats.upcomingEvents,
                    icon: Calendar,
                    bgColor: "bg-yellow-100",
                    iconColor: "text-yellow-600",
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-white/30 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <div
                        className={`w-8 h-8 lg:w-10 lg:h-10 ${stat.bgColor} rounded-lg lg:rounded-xl flex items-center justify-center`}
                      >
                        <stat.icon
                          className={`h-4 w-4 lg:h-5 lg:w-5 ${stat.iconColor}`}
                        />
                      </div>
                      <div>
                        <p className="text-lg lg:text-2xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-600">{stat.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
                {/* Projects Section */}
                <div className="lg:col-span-3 order-2 lg:order-1">
                  <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl border border-white/40 h-full overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/80 to-white/80">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              My Projects
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Track progress and manage your portfolio
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* View Toggle */}
                          <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() => setProjectViewMode("grid")}
                              className={`p-2 rounded-md transition-colors ${
                                projectViewMode === "grid"
                                  ? "bg-white shadow text-blue-600"
                                  : "text-gray-500 hover:text-gray-700"
                              }`}
                            >
                              <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setProjectViewMode("list")}
                              className={`p-2 rounded-md transition-colors ${
                                projectViewMode === "list"
                                  ? "bg-white shadow text-blue-600"
                                  : "text-gray-500 hover:text-gray-700"
                              }`}
                            >
                              <List className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Show Completed Toggle */}
                          {completedProjects.length > 0 && (
                            <button
                              onClick={() =>
                                setShowCompletedProjects(!showCompletedProjects)
                              }
                              className={`p-2 rounded-lg transition-colors ${
                                showCompletedProjects
                                  ? "bg-green-100 text-green-600"
                                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                              }`}
                              title="Toggle completed projects"
                            >
                              <Archive className="h-5 w-5" />
                            </button>
                          )}

                          <button
                            onClick={() => navigate("/user/projects")}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="View All"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </button>

                          <button
                            onClick={handleOpenCreateProject}
                            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">
                              New Project
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Projects Grid */}
                    <div className="p-6">
                      {renderProjectCards()}
                      {renderCompletedProjects()}

                      {/* View All Link */}
                      {activeProjectsForDisplay.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => navigate("/user/projects")}
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

                {/* Right Sidebar - Tasks, Events, Tenders */}
                <div className="space-y-6 order-1 lg:order-2">
                  {/* Today's Tasks */}
                  {renderTodaysTasks()}

                  {/* This Week Events */}
                  {renderThisWeekEvents()}

                  {/* Tender Deadlines */}
                  {renderTenderDeadlines()}
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

            {/* Create Project Modal - Abbreviated for brevity */}
            {showCreateProject && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between p-6 border-b-2 border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h2 className="text-2xl font-black text-gray-900">
                      Create New Project
                    </h2>
                    <button
                      onClick={() => setShowCreateProject(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <form
                    onSubmit={handleCreateProject}
                    className="p-6 space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={newProject.title}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter project title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={newProject.description}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Brief project description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={newProject.location}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              location: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Project location"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Budget
                        </label>
                        <input
                          type="number"
                          value={newProject.budget}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              budget: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={newProject.startDate}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              startDate: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={newProject.endDate}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              endDate: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Priority
                        </label>
                        <select
                          value={newProject.priority}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              priority: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          value={newProject.status}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              status: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="planning">Planning</option>
                          <option value="in_progress">In Progress</option>
                          <option value="on_hold">On Hold</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-t-2 border-gray-200 pt-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Team Assignment
                      </h3>

                      {loadingDropdowns ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              Supervisor *
                            </label>
                            <select
                              required
                              value={newProject.supervisorId}
                              onChange={(e) =>
                                setNewProject({
                                  ...newProject,
                                  supervisorId: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select supervisor</option>
                              {supervisors.map((supervisor) => (
                                <option
                                  key={supervisor.id}
                                  value={supervisor.id}
                                >
                                  {supervisor.name} (
                                  {supervisor.projects_count || 0} projects)
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              Site Manager (Optional)
                            </label>
                            <select
                              value={newProject.siteManagerId}
                              onChange={(e) =>
                                setNewProject({
                                  ...newProject,
                                  siteManagerId: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">No site manager</option>
                              {siteManagers.map((manager) => (
                                <option key={manager.id} value={manager.id}>
                                  {manager.name} ({manager.projects_count || 0}{" "}
                                  projects)
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-6 border-t-2 border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowCreateProject(false)}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={
                          creatingProject ||
                          !newProject.title ||
                          !newProject.supervisorId
                        }
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                      >
                        {creatingProject ? "Creating..." : "Create Project"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        ) : (
          <UserDashboardRoutes />
        )}
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;
