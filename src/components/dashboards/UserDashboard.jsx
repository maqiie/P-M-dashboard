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
  const handleProjectClick = (projectId) => {
    navigate(`/user/projects?projectId=${projectId}`);
  };

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
      onClick={() => handleProjectClick(project.id)}
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
      {/* Sidebar - Fixed for mobile */}
      {/* Sidebar - Fixed for mobile */}
<div className={`fixed lg:relative inset-y-0 left-0 z-40 transform ${sidebarCollapsed ? '-translate-x-full' : 'translate-x-0 lg:translate-x-0'} transition-transform duration-300 ease-in-out`}>
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
  {sidebarCollapsed ? <Menu className="h-6 w-6" /> : <X className="h-6 w-6" />}
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
