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
  Area,
  AreaChart,
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
  TrendingUp,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  Timer,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Edit,
  Download,
  Eye,
  Paperclip,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Building,
  Tag,
  Hash,
  FileCheck,
  Award,
  Banknote,
  Receipt,
  Info,
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

const formatCurrencyFull = (amount) => {
  if (!amount) return "$0.00";
  const num = parseFloat(amount);
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "No date";
  try {
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Invalid";
  }
};

const formatDateFull = (dateString) => {
  if (!dateString) return "Not set";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Invalid";
  }
};

const getRelativeTime = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  } catch {
    return "";
  }
};

const getDaysRemaining = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date - now;
    return Math.ceil(diffMs / 86400000);
  } catch {
    return null;
  }
};

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

const getProjectAssignee = (project, managers = []) => {
  const fieldsToCheck = [
    project.project_manager,
    project.manager,
    project.created_by,
    project.creator,
    project.owner,
    project.assigned_to,
  ];
  for (const field of fieldsToCheck) {
    const name = safeString(field);
    if (name && name.trim()) return name;
  }
  if (project.project_manager_id && managers.length > 0) {
    const manager = managers.find((m) => m.id === project.project_manager_id);
    if (manager && manager.name) return safeString(manager.name);
  }
  if (project.manager_id && managers.length > 0) {
    const manager = managers.find((m) => m.id === project.manager_id);
    if (manager && manager.name) return safeString(manager.name);
  }
  return "Unassigned";
};

const sortByDateDesc = (items, dateField = "created_at") => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a[dateField] || a.updated_at || a.created_at || 0);
    const dateB = new Date(b[dateField] || b.updated_at || b.created_at || 0);
    return dateB - dateA;
  });
};

const getStatusConfig = (status) => {
  const configs = {
    active: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
    in_progress: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
    completed: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
    pending: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
    planning: { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
    on_hold: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
    paused: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
    cancelled: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
    overdue: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
    open: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
    closed: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500" },
    awarded: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
    draft: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
  };
  return configs[status] || { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500" };
};

// ============================================
// PROJECT DETAIL POPUP MODAL
// ============================================
const ProjectDetailModal = ({ project, managers, onClose, onEdit, onViewFull }) => {
  if (!project) return null;

  const statusConfig = getStatusConfig(project.status);
  const progress = parseFloat(project.progress_percentage || project.progress || 0);
  const budget = parseFloat(project.budget || 0);
  const spent = parseFloat(project.spent || project.actual_cost || 0);
  const budgetUsed = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const daysRemaining = getDaysRemaining(project.end_date || project.deadline);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Building2 className="h-8 w-8" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                  {project.status?.replace(/_/g, " ").toUpperCase()}
                </span>
                {project.priority && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">
                    {project.priority} Priority
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold truncate">
                {safeString(project.title) || safeString(project.name) || "Untitled Project"}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                ID: #{project.id} • Created {getRelativeTime(project.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Progress Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">Project Progress</span>
              <span className="text-lg font-bold text-blue-600">{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-slate-500 mb-1">
                <CircleDollarSign className="h-4 w-4" />
                <span className="text-xs font-medium">Budget</span>
              </div>
              <div className="text-lg font-bold text-slate-900">{formatCurrency(budget)}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-slate-500 mb-1">
                <Receipt className="h-4 w-4" />
                <span className="text-xs font-medium">Spent</span>
              </div>
              <div className="text-lg font-bold text-slate-900">{formatCurrency(spent)}</div>
              <div className="text-xs text-slate-500">{budgetUsed}% of budget</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-slate-500 mb-1">
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs font-medium">Start Date</span>
              </div>
              <div className="text-sm font-bold text-slate-900">{formatDate(project.start_date)}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-slate-500 mb-1">
                <Timer className="h-4 w-4" />
                <span className="text-xs font-medium">End Date</span>
              </div>
              <div className="text-sm font-bold text-slate-900">{formatDate(project.end_date || project.deadline)}</div>
              {daysRemaining !== null && (
                <div className={`text-xs ${daysRemaining < 0 ? "text-red-500" : daysRemaining < 7 ? "text-orange-500" : "text-green-500"}`}>
                  {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Description
              </h3>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4">{project.description}</p>
            </div>
          )}

          {/* Team & Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Team
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {getProjectAssignee(project, managers).split(" ").map((n) => n[0]).join("").substring(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{getProjectAssignee(project, managers)}</div>
                    <div className="text-xs text-slate-500">Project Manager</div>
                  </div>
                </div>
                {project.supervisor && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {safeString(project.supervisor).split(" ").map((n) => n[0]).join("").substring(0, 2) || "S"}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{safeString(project.supervisor)}</div>
                      <div className="text-xs text-slate-500">Supervisor</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <ClipboardList className="h-4 w-4 mr-2" />
                Details
              </h3>
              <div className="space-y-2">
                {project.location && (
                  <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-700">{safeString(project.location)}</span>
                  </div>
                )}
                {project.client && (
                  <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                    <Building className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-700">Client: {safeString(project.client)}</span>
                  </div>
                )}
                {project.category && (
                  <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                    <Tag className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-700">{safeString(project.category)}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-700">Updated {getRelativeTime(project.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Summary */}
          {(project.tasks_count || project.total_tasks) && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Tasks Overview
              </h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <div className="text-lg font-bold text-blue-600">{project.total_tasks || project.tasks_count || 0}</div>
                  <div className="text-xs text-blue-600">Total</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <div className="text-lg font-bold text-green-600">{project.completed_tasks || 0}</div>
                  <div className="text-xs text-green-600">Completed</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-xl">
                  <div className="text-lg font-bold text-yellow-600">{project.pending_tasks || 0}</div>
                  <div className="text-xs text-yellow-600">Pending</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-xl">
                  <div className="text-lg font-bold text-red-600">{project.overdue_tasks || 0}</div>
                  <div className="text-xs text-red-600">Overdue</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(project)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Edit className="h-4 w-4" />
                {/* <span>Edit</span> */}
              </button>
            )}
            {onViewFull && (
              <button
                onClick={() => onViewFull(project)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors"
              >
                {/* <ExternalLink className="h-4 w-4" /> */}
                {/* <span>View Full Details</span> */}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// TENDER DETAIL POPUP MODAL
// ============================================
const TenderDetailModal = ({ tender, onClose, onEdit, onViewFull }) => {
  if (!tender) return null;

  const statusConfig = getStatusConfig(tender.status);
  const budget = parseFloat(tender.budget_estimate || tender.value || tender.amount || 0);
  const daysRemaining = getDaysRemaining(tender.deadline || tender.submission_deadline);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <FileText className="h-8 w-8" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                  {tender.status?.replace(/_/g, " ").toUpperCase()}
                </span>
                {tender.type && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">{tender.type}</span>
                )}
              </div>
              <h2 className="text-xl font-bold truncate">
                {safeString(tender.title) || safeString(tender.name) || "Untitled Tender"}
              </h2>
              <p className="text-orange-100 text-sm mt-1">
                ID: #{tender.id} • Created {getRelativeTime(tender.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Deadline Alert */}
          {daysRemaining !== null && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
                daysRemaining < 0
                  ? "bg-red-50 border border-red-200"
                  : daysRemaining < 7
                  ? "bg-orange-50 border border-orange-200"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              <Timer
                className={`h-5 w-5 ${
                  daysRemaining < 0 ? "text-red-500" : daysRemaining < 7 ? "text-orange-500" : "text-green-500"
                }`}
              />
              <div>
                <div
                  className={`text-sm font-semibold ${
                    daysRemaining < 0 ? "text-red-700" : daysRemaining < 7 ? "text-orange-700" : "text-green-700"
                  }`}
                >
                  {daysRemaining < 0
                    ? `Deadline passed ${Math.abs(daysRemaining)} days ago`
                    : daysRemaining === 0
                    ? "Deadline is today!"
                    : `${daysRemaining} days until deadline`}
                </div>
                <div className="text-xs text-slate-600">
                  {formatDateFull(tender.deadline || tender.submission_deadline)}
                </div>
              </div>
            </div>
          )}

          {/* Key Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-slate-500 mb-1">
                <Banknote className="h-4 w-4" />
                <span className="text-xs font-medium">Budget Estimate</span>
              </div>
              <div className="text-lg font-bold text-emerald-600">{formatCurrencyFull(budget)}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-slate-500 mb-1">
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs font-medium">Deadline</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {formatDate(tender.deadline || tender.submission_deadline)}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-slate-500 mb-1">
                <FileCheck className="h-4 w-4" />
                <span className="text-xs font-medium">Submissions</span>
              </div>
              <div className="text-lg font-bold text-slate-900">{tender.submissions_count || tender.bids_count || 0}</div>
            </div>
          </div>

          {/* Description */}
          {tender.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Description
              </h3>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4">{tender.description}</p>
            </div>
          )}

          {/* Requirements */}
          {tender.requirements && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                <ClipboardList className="h-4 w-4 mr-2" />
                Requirements
              </h3>
              <div className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4 whitespace-pre-wrap">
                {tender.requirements}
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Tender Information
              </h3>
              <div className="space-y-2">
                {tender.reference_number && (
                  <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                    <Hash className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-700">Ref: {tender.reference_number}</span>
                  </div>
                )}
                {tender.category && (
                  <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                    <Tag className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-700">{safeString(tender.category)}</span>
                  </div>
                )}
                {tender.location && (
                  <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-700">{safeString(tender.location)}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Contact Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                    {(safeString(tender.created_by) || safeString(tender.project_manager) || "S")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {safeString(tender.created_by) || safeString(tender.project_manager) || "System"}
                    </div>
                    <div className="text-xs text-slate-500">Created by</div>
                  </div>
                </div>
                {tender.contact_email && (
                  <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-700">{tender.contact_email}</span>
                  </div>
                )}
                {tender.contact_phone && (
                  <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-700">{tender.contact_phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Winner (if awarded) */}
          {tender.status === "awarded" && tender.winner && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <h3 className="text-sm font-semibold text-emerald-700 mb-2 flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Awarded To
              </h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-emerald-900">{safeString(tender.winner)}</div>
                  {tender.awarded_amount && (
                    <div className="text-xs text-emerald-600">Amount: {formatCurrencyFull(tender.awarded_amount)}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Attachments */}
          {tender.attachments && tender.attachments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <Paperclip className="h-4 w-4 mr-2" />
                Attachments ({tender.attachments.length})
              </h3>
              <div className="space-y-2">
                {tender.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-700">{attachment.name || `Attachment ${index + 1}`}</span>
                    </div>
                    <button className="p-1 hover:bg-slate-200 rounded">
                      <Download className="h-4 w-4 text-slate-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(tender)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            )}
            {onViewFull && (
              <button
                onClick={() => onViewFull(tender)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View Full Details</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// TASK DETAIL POPUP MODAL
// ============================================
const TaskDetailModal = ({ task, onClose, onViewFull }) => {
  if (!task) return null;

  const statusConfig = getStatusConfig(task.status);
  const daysRemaining = getDaysRemaining(task.due_date || task.deadline);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                  {task.status?.replace(/_/g, " ").toUpperCase()}
                </span>
                {task.priority && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      task.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : task.priority === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {task.priority}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold truncate">
                {safeString(task.title) || safeString(task.name) || "Untitled Task"}
              </h2>
              <p className="text-green-100 text-sm mt-1">
                ID: #{task.id} • Created {getRelativeTime(task.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Due Date Alert */}
          {daysRemaining !== null && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
                daysRemaining < 0
                  ? "bg-red-50 border border-red-200"
                  : daysRemaining < 3
                  ? "bg-orange-50 border border-orange-200"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              <Timer
                className={`h-5 w-5 ${
                  daysRemaining < 0 ? "text-red-500" : daysRemaining < 3 ? "text-orange-500" : "text-green-500"
                }`}
              />
              <div>
                <div
                  className={`text-sm font-semibold ${
                    daysRemaining < 0 ? "text-red-700" : daysRemaining < 3 ? "text-orange-700" : "text-green-700"
                  }`}
                >
                  {daysRemaining < 0
                    ? `Overdue by ${Math.abs(daysRemaining)} days`
                    : daysRemaining === 0
                    ? "Due today!"
                    : `Due in ${daysRemaining} days`}
                </div>
                <div className="text-xs text-slate-600">{formatDateFull(task.due_date || task.deadline)}</div>
              </div>
            </div>
          )}

          {/* Description */}
          {task.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Description
              </h3>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4">{task.description}</p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-2">
            {task.assigned_to && (
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                  {safeString(task.assigned_to).split(" ").map((n) => n[0]).join("").substring(0, 2) || "U"}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{safeString(task.assigned_to)}</div>
                  <div className="text-xs text-slate-500">Assigned to</div>
                </div>
              </div>
            )}
            {task.project && (
              <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-700">Project: {safeString(task.project)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          {onViewFull && (
            <button
              onClick={() => onViewFull(task)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-colors"
            >
              {/* <ExternalLink className="h-4 w-4" />
              <span>View Full</span> */}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// DASHBOARD DATA HOOK
// ============================================
const useDashboardData = () => {
  const [data, setData] = useState({
    statistics: {},
    projects: [],
    managers: [],
    rawManagers: [],
    events: [],
    tasks: [],
    tenders: [],
    supervisors: [],
    siteManagers: [],
    chartData: {},
    trends: {},
    allTeamMembers: [],
    recentActivity: [],
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
        projectsAPI
          .getAll({ all: true, scope: "admin", admin: true, per_page: 1000, include_all_users: true })
          .catch(() => projectsAPI.getAll({ admin: true, per_page: 1000 }).catch(() => projectsAPI.getAll({ per_page: 1000 }).catch(() => ({ projects: [] })))),
        fetchProjectManagers().catch(() => []),
        eventsAPI.getAll ? eventsAPI.getAll({ all: true, per_page: 100 }).catch(() => eventsAPI.getUpcoming(100).catch(() => ({ events: [] }))) : eventsAPI.getUpcoming(100).catch(() => ({ events: [] })),
        tasksAPI.getAll({ all: true, scope: "admin", admin: true, per_page: 1000, include_all_users: true }).catch(() => tasksAPI.getAll({ per_page: 1000 }).catch(() => ({ tasks: [] }))),
        tendersAPI.getAll({ all: true, scope: "admin", admin: true, per_page: 500, include_all_users: true }).catch(() => tendersAPI.getAll({ per_page: 500 }).catch(() => ({ tenders: [] }))),
        supervisorsAPI.getAll().catch(() => []),
        siteManagersAPI.getAll().catch(() => []),
        calendarAPI.getTodayEvents ? calendarAPI.getTodayEvents().catch(() => []) : Promise.resolve([]),
      ]);

      const projectsData = projectsResponse.status === "fulfilled" ? projectsResponse.value : { projects: [] };
      const managersData = managersResponse.status === "fulfilled" ? managersResponse.value : [];
      const eventsData = eventsResponse.status === "fulfilled" ? eventsResponse.value : { events: [] };
      const tasksData = tasksResponse.status === "fulfilled" ? tasksResponse.value : { tasks: [] };
      const tendersData = tendersResponse.status === "fulfilled" ? tendersResponse.value : { tenders: [] };
      const supervisorsData = supervisorsResponse.status === "fulfilled" ? supervisorsResponse.value : [];
      const siteManagersData = siteManagersResponse.status === "fulfilled" ? siteManagersResponse.value : [];
      const calendarEventsData = calendarEventsResponse.status === "fulfilled" ? calendarEventsResponse.value : [];

      let projects = Array.isArray(projectsData.projects) ? projectsData.projects : Array.isArray(projectsData) ? projectsData : [];
      let events = Array.isArray(eventsData.events) ? eventsData.events : Array.isArray(eventsData) ? eventsData : [];
      let tasks = Array.isArray(tasksData.tasks) ? tasksData.tasks : Array.isArray(tasksData) ? tasksData : [];
      let tenders = Array.isArray(tendersData.tenders) ? tendersData.tenders : Array.isArray(tendersData) ? tendersData : [];
      const supervisors = Array.isArray(supervisorsData) ? supervisorsData : [];
      const siteManagers = Array.isArray(siteManagersData) ? siteManagersData : [];
      const todayEvents = Array.isArray(calendarEventsData) ? calendarEventsData : [];

      projects = sortByDateDesc(projects, "created_at");
      events = sortByDateDesc(events, "date");
      tasks = sortByDateDesc(tasks, "created_at");
      tenders = sortByDateDesc(tenders, "created_at");

      const rawManagersData = Array.isArray(managersData) ? managersData : managersData?.data && Array.isArray(managersData.data) ? managersData.data : [];

      const managers = Array.isArray(managersData)
        ? managersData.map((manager) => {
            const managerProjects = projects.filter((p) => p.project_manager_id === manager.id || p.manager_id === manager.id || safeString(p.project_manager) === safeString(manager.name));
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
              currentProjects: managerProjects.slice(0, 2).map((p) => safeString(p.title) || safeString(p.name) || "Untitled"),
              created_at: manager.created_at,
            };
          })
        : [];

      const processedSupervisors = supervisors.map((supervisor) => {
        const supervisorProjects = projects.filter((p) => p.supervisor_id === supervisor.id || safeString(p.supervisor) === safeString(supervisor.name));
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
          currentProjects: supervisorProjects.slice(0, 2).map((p) => safeString(p.title) || safeString(p.name) || "Untitled"),
          created_at: supervisor.created_at,
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
          created_at: siteManager.created_at,
        };
      });

      const allTeamMembers = [
        ...managers.map((m) => ({ ...m, type: "manager" })),
        ...processedSupervisors.map((s) => ({ ...s, type: "supervisor" })),
        ...processedSiteManagers.map((sm) => ({ ...sm, type: "site_manager" })),
      ];

      const totalTasks = tasks.length || 0;
      const completedTasks = tasks.filter((t) => t.status === "completed").length || 0;
      const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length || 0;
      const pendingTasks = tasks.filter((t) => t.status === "pending").length || 0;
      const teamSize = (managers.length || 0) + (processedSupervisors.length || 0) + (processedSiteManagers.length || 0);

      const overdueTasks = tasks.filter((t) => {
        if (!t.due_date) return false;
        return new Date(t.due_date) < new Date() && t.status !== "completed";
      }).length;

      const overdueProjects = projects.filter((p) => {
        if (!p.end_date && !p.deadline) return false;
        const endDate = new Date(p.end_date || p.deadline);
        return endDate < new Date() && p.status !== "completed";
      }).length;

      const totalBudget = projects.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0);
      const spentBudget = projects.reduce((sum, p) => sum + parseFloat(p.spent || p.actual_cost || 0), 0);

      const statistics = {
        totalProjects: projects.length || 0,
        activeProjects: projects.filter((p) => p.status === "active" || p.status === "in_progress").length || 0,
        completedProjects: projects.filter((p) => p.status === "completed").length || 0,
        planningProjects: projects.filter((p) => p.status === "planning" || p.status === "pending").length || 0,
        onHoldProjects: projects.filter((p) => p.status === "on_hold" || p.status === "paused").length || 0,
        overdueProjects,
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        overdueTasks,
        teamSize,
        managersCount: managers.length || 0,
        supervisorsCount: processedSupervisors.length || 0,
        siteManagersCount: processedSiteManagers.length || 0,
        totalTenders: tenders.length || 0,
        activeTenders: tenders.filter((t) => t.status === "active" || t.status === "open").length || 0,
        closedTenders: tenders.filter((t) => t.status === "closed" || t.status === "awarded").length || 0,
        pendingTenders: tenders.filter((t) => t.status === "pending" || t.status === "draft").length || 0,
        totalBudget,
        spentBudget,
        remainingBudget: totalBudget - spentBudget,
        budgetUtilization: totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        projectCompletionRate: projects.length > 0 ? Math.round((projects.filter((p) => p.status === "completed").length / projects.length) * 100) : 0,
        totalEvents: events.length || 0,
        upcomingEvents: events.filter((e) => new Date(e.date || e.start_date) >= new Date()).length || 0,
      };

      const trends = {
        projects: statistics.activeProjects > 0 ? "up" : "neutral",
        projectsValue: statistics.activeProjects > 0 ? `${statistics.activeProjects} active` : "No active",
        budget: statistics.totalBudget > 0 ? "up" : "neutral",
        budgetValue: statistics.totalBudget > 0 ? formatCurrency(statistics.totalBudget) : "$0",
        team: teamSize > 0 ? "neutral" : "down",
        teamValue: `${teamSize} members`,
        completion: statistics.completionRate >= 50 ? "up" : statistics.completionRate > 0 ? "neutral" : "down",
        completionValue: `${statistics.completionRate}%`,
        tasks: statistics.overdueTasks > 0 ? "down" : "up",
        tasksValue: statistics.overdueTasks > 0 ? `${statistics.overdueTasks} overdue` : "On track",
      };

      const topManagers = [...managers].sort((a, b) => (b.performance || 0) - (a.performance || 0)).slice(0, 5);
      const topSupervisors = [...processedSupervisors].sort((a, b) => (b.performance || 0) - (a.performance || 0)).slice(0, 5);

      const statusData = [
        { name: "Active", value: statistics.activeProjects, color: CHART_COLORS.primary[1] },
        { name: "Completed", value: statistics.completedProjects, color: CHART_COLORS.success[1] },
        { name: "Planning", value: statistics.planningProjects, color: CHART_COLORS.warning[1] },
        { name: "On Hold", value: statistics.onHoldProjects, color: CHART_COLORS.danger[1] },
      ].filter((item) => item.value > 0);

      const taskStatusData = [
        { name: "Completed", value: completedTasks, color: CHART_COLORS.success[1] },
        { name: "In Progress", value: inProgressTasks, color: CHART_COLORS.primary[1] },
        { name: "Pending", value: pendingTasks, color: CHART_COLORS.warning[1] },
        { name: "Overdue", value: overdueTasks, color: CHART_COLORS.danger[1] },
      ].filter((item) => item.value > 0);

      const monthlyTrend = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthProjects = projects.filter((p) => {
          const created = new Date(p.created_at);
          return created.getMonth() === month.getMonth() && created.getFullYear() === month.getFullYear();
        }).length;
        monthlyTrend.push({
          name: month.toLocaleDateString("en-US", { month: "short" }),
          projects: monthProjects,
          tasks: tasks.filter((t) => {
            const created = new Date(t.created_at);
            return created.getMonth() === month.getMonth() && created.getFullYear() === month.getFullYear();
          }).length,
        });
      }

      const chartData = { topManagers, topSupervisors, statusData, taskStatusData, monthlyTrend };

      const recentActivity = [
        ...projects.slice(0, 10).map((p) => ({
          id: `project-${p.id}`,
          type: "project",
          title: safeString(p.title) || safeString(p.name) || "Untitled Project",
          status: p.status,
          date: p.created_at || p.updated_at,
          user: getProjectAssignee(p, rawManagersData),
          icon: Building2,
          color: "blue",
          data: p,
        })),
        ...tasks.slice(0, 10).map((t) => ({
          id: `task-${t.id}`,
          type: "task",
          title: safeString(t.title) || safeString(t.name) || "Untitled Task",
          status: t.status,
          date: t.created_at || t.updated_at,
          user: safeString(t.assigned_to) || safeString(t.assignee) || "Unassigned",
          icon: CheckCircle2,
          color: "green",
          data: t,
        })),
        ...tenders.slice(0, 10).map((t) => ({
          id: `tender-${t.id}`,
          type: "tender",
          title: safeString(t.title) || safeString(t.name) || "Untitled Tender",
          status: t.status,
          date: t.created_at || t.updated_at,
          user: safeString(t.created_by) || "System",
          icon: FileText,
          color: "orange",
          data: t,
        })),
      ]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 15);

      setData({
        statistics,
        projects,
        managers,
        rawManagers: rawManagersData,
        events: [...events, ...todayEvents],
        tasks,
        tenders,
        supervisors: processedSupervisors,
        siteManagers: processedSiteManagers,
        chartData,
        trends,
        allTeamMembers,
        recentActivity,
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
    const interval = setInterval(() => fetchData(true), 120000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return { data, loading, error, lastUpdated, refreshing, refetch };
};

// ============================================
// KPI CARD COMPONENT
// ============================================
const ModernKPICard = ({ label, value, icon: Icon, trend, trendValue, colorScheme = "primary", subtitle }) => {
  const colorSchemes = {
    primary: { bg: "bg-white", iconBg: "bg-gradient-to-br from-blue-500 to-blue-600", accent: "text-blue-600", trendUp: "text-emerald-600 bg-emerald-50", trendDown: "text-red-600 bg-red-50" },
    success: { bg: "bg-white", iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600", accent: "text-emerald-600", trendUp: "text-emerald-600 bg-emerald-50", trendDown: "text-red-600 bg-red-50" },
    warning: { bg: "bg-white", iconBg: "bg-gradient-to-br from-amber-500 to-amber-600", accent: "text-amber-600", trendUp: "text-emerald-600 bg-emerald-50", trendDown: "text-red-600 bg-red-50" },
    purple: { bg: "bg-white", iconBg: "bg-gradient-to-br from-purple-500 to-purple-600", accent: "text-purple-600", trendUp: "text-emerald-600 bg-emerald-50", trendDown: "text-red-600 bg-red-50" },
    danger: { bg: "bg-white", iconBg: "bg-gradient-to-br from-red-500 to-red-600", accent: "text-red-600", trendUp: "text-emerald-600 bg-emerald-50", trendDown: "text-red-600 bg-red-50" },
  };
  const colors = colorSchemes[colorScheme];

  return (
    <div className={`${colors.bg} rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${colors.iconBg} shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold ${trend === "up" ? colors.trendUp : trend === "down" ? colors.trendDown : "text-slate-600 bg-slate-100"}`}>
            {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className={`text-2xl font-bold ${colors.accent}`}>{value}</div>
        <div className="text-sm font-medium text-slate-700">{label}</div>
        {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
      </div>
    </div>
  );
};

// ============================================
// CALENDAR COMPONENT
// ============================================
const EnhancedCalendar = ({ events, tasks, onCreateEvent, teamMembers = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", type: "meeting", time: "09:00", description: "", attendees: [] });

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getActivitiesForDate = (date) => {
    try {
      const dateStr = date.toISOString().split("T")[0];
      const dayEvents = (events || []).filter((event) => {
        try {
          const eventDateStr = event.date || event.start_date || event.event_date;
          if (!eventDateStr) return false;
          const eventDate = new Date(eventDateStr);
          if (isNaN(eventDate.getTime())) return false;
          return eventDate.toISOString().split("T")[0] === dateStr;
        } catch { return false; }
      });
      const dayTasks = (tasks || []).filter((task) => {
        try {
          const taskDateStr = task.due_date || task.deadline;
          if (!taskDateStr) return false;
          const taskDate = new Date(taskDateStr);
          if (isNaN(taskDate.getTime())) return false;
          return taskDate.toISOString().split("T")[0] === dateStr;
        } catch { return false; }
      });
      return [...dayEvents.map((e) => ({ ...e, activityType: "event" })), ...dayTasks.map((t) => ({ ...t, activityType: "task" }))];
    } catch { return []; }
  };

  const handleCreateEvent = () => {
    if (newEvent.title.trim()) {
      if (onCreateEvent) onCreateEvent({ ...newEvent, date: selectedDate.toISOString() });
      setShowCreateModal(false);
      setNewEvent({ title: "", type: "meeting", time: "09:00", description: "", attendees: [] });
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
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-slate-100 transition-colors"><ChevronLeft className="h-4 w-4 text-slate-600" /></button>
        <span className="text-xs font-bold text-slate-900">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
        <button onClick={nextMonth} className="p-1 rounded hover:bg-slate-100 transition-colors"><ChevronRight className="h-4 w-4 text-slate-600" /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayNames.map((day, i) => (<div key={i} className="text-center text-[9px] font-semibold text-slate-500 py-1">{day}</div>))}
      </div>
      <div className="grid grid-cols-7 gap-0.5 flex-1 min-h-0">
        {calendarDays.map((day, index) => {
          if (!day) return <div key={index} className="aspect-square"></div>;
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const activities = getActivitiesForDate(date);
          const isToday = date.toDateString() === today.toDateString();
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          const hasActivities = activities.length > 0;
          const isPast = date < today && !isToday;
          return (
            <button key={index} onClick={() => setSelectedDate(date)} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] font-medium relative transition-all ${isToday ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md" : ""} ${isSelected && !isToday ? "bg-purple-100 text-purple-700 ring-2 ring-purple-400" : ""} ${!isToday && !isSelected && !isPast ? "hover:bg-slate-100 text-slate-700" : ""} ${isPast && !isToday && !isSelected ? "text-slate-400" : ""}`}>
              {day}
              {hasActivities && (<div className="absolute bottom-0.5 flex space-x-0.5">{activities.slice(0, 3).map((_, idx) => (<div key={idx} className={`w-1 h-1 rounded-full ${isToday ? "bg-white" : "bg-purple-500"}`} />))}</div>)}
            </button>
          );
        })}
      </div>
      <div className="mt-2 pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700">{selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"><Plus className="h-3 w-3" /><span className="text-[10px] font-semibold">Add</span></button>
        </div>
        <div className="space-y-1 max-h-24 overflow-y-auto">
          {selectedActivities.length > 0 ? (selectedActivities.slice(0, 4).map((activity, index) => (<div key={index} className={`p-1.5 rounded text-[10px] ${activity.activityType === "event" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}><div className="font-medium truncate">{safeString(activity.title) || safeString(activity.name) || "Untitled"}</div></div>))) : (<div className="text-[10px] text-slate-400 text-center py-2">No activities</div>)}
        </div>
      </div>
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Create Event</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded hover:bg-slate-100"><X className="h-4 w-4 text-slate-500" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-slate-700 mb-1 block">Title</label><input type="text" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Event title..." /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium text-slate-700 mb-1 block">Type</label><select value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"><option value="meeting">Meeting</option><option value="event">Event</option><option value="deadline">Deadline</option></select></div>
                <div><label className="text-xs font-medium text-slate-700 mb-1 block">Time</label><input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
              </div>
              <div className="flex space-x-2 pt-2">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={handleCreateEvent} className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// RECENT ACTIVITY FEED
// ============================================
const RecentActivityFeed = ({ activities, onItemClick }) => {
  const getTypeColor = (type) => {
    const colors = { project: "from-blue-500 to-blue-600", task: "from-green-500 to-green-600", tender: "from-orange-500 to-orange-600" };
    return colors[type] || "from-slate-500 to-slate-600";
  };

  return (
    <div className="space-y-2">
      {activities.length > 0 ? (
        activities.map((activity, index) => {
          const Icon = activity.icon || Activity;
          const statusConfig = getStatusConfig(activity.status);
          return (
            <div key={activity.id || index} onClick={() => onItemClick && onItemClick(activity)} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all group">
              <div className="flex items-start space-x-2.5">
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${getTypeColor(activity.type)} shadow-sm`}><Icon className="h-3 w-3 text-white" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{activity.title}</h4>
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${statusConfig.bg} ${statusConfig.text}`}>{activity.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-[10px] text-slate-500"><User className="h-3 w-3" /><span className="truncate max-w-[80px]">{activity.user}</span></div>
                    <span className="text-[9px] text-slate-400">{getRelativeTime(activity.date)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex items-center justify-center h-24"><p className="text-xs text-slate-400">No recent activity</p></div>
      )}
    </div>
  );
};

// ============================================
// QUICK STAT CARD
// ============================================
const QuickStatCard = ({ label, value, icon: Icon, color = "blue" }) => {
  const colorClasses = { blue: "bg-blue-50 text-blue-600 border-blue-200", green: "bg-green-50 text-green-600 border-green-200", red: "bg-red-50 text-red-600 border-red-200" };
  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${colorClasses[color]}`}>
      <Icon className="h-4 w-4" />
      <div><div className="text-xs font-bold">{value}</div><div className="text-[9px] opacity-80">{label}</div></div>
    </div>
  );
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
const AdminDashboard = () => {
  const currentTime = useCurrentTime();
  const navigate = useNavigate();
  const { data, loading, error, lastUpdated, refreshing, refetch } = useDashboardData();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTender, setSelectedTender] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleCollapseChange = (collapsed) => setSidebarCollapsed(collapsed);
  const handleCreateEvent = (eventData) => console.log("New event created:", eventData);

  const handleProjectClick = (project) => setSelectedProject(project);
  const handleTenderClick = (tender) => setSelectedTender(tender);
  const handleTaskClick = (task) => setSelectedTask(task);

  const handleActivityClick = (activity) => {
    if (activity.type === "project") setSelectedProject(activity.data);
    else if (activity.type === "task") setSelectedTask(activity.data);
    else if (activity.type === "tender") setSelectedTender(activity.data);
  };

  const handleViewFullProject = (project) => { setSelectedProject(null); navigate(`/admin/projects/${project.id}`); };
  const handleViewFullTender = (tender) => { setSelectedTender(null); navigate(`/admin/tenders/${tender.id}`); };
  const handleViewFullTask = (task) => { setSelectedTask(null); navigate(`/admin/tasks/${task.id}`); };
  const handleEditProject = (project) => { setSelectedProject(null); navigate(`/admin/projects/${project.id}/edit`); };
  const handleEditTender = (tender) => { setSelectedTender(null); navigate(`/admin/tenders/${tender.id}/edit`); };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isFullscreen = params.get("fullscreen") === "true" || localStorage.getItem("dashboard-fullscreen") === "true";
    setShowFullscreen(isFullscreen);
    if (isFullscreen) setSidebarOpen(false);
  }, []);

  const toggleFullscreen = () => {
    const newFullscreen = !showFullscreen;
    setShowFullscreen(newFullscreen);
    localStorage.setItem("dashboard-fullscreen", newFullscreen.toString());
    if (newFullscreen) setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
        {!showFullscreen && <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onCollapseChange={handleCollapseChange} />}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Loading Dashboard</h3>
            <p className="text-sm text-slate-600">Fetching all system data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
        {!showFullscreen && <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onCollapseChange={handleCollapseChange} />}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Connection Error</h3>
            <p className="text-sm text-slate-600 mb-6">{error}</p>
            <button onClick={refetch} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all text-sm font-semibold">Retry Connection</button>
          </div>
        </div>
      </div>
    );
  }

  const latestProjects = data.projects?.slice(0, 10) || [];
  const latestTenders = data.tenders?.slice(0, 8) || [];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {!showFullscreen && <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onCollapseChange={handleCollapseChange} />}

      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 py-4 px-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!showFullscreen && (<button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"><Menu className="h-5 w-5 text-slate-700" /></button>)}
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg"><Building2 className="h-6 w-6 text-white" /></div>
                <div><h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1><p className="text-sm text-slate-600">Complete system overview • All users & data</p></div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden xl:flex items-center space-x-2">
                <QuickStatCard label="Total" value={data.statistics?.totalProjects || 0} icon={Layers} color="blue" />
                <QuickStatCard label="Active" value={data.statistics?.activeProjects || 0} icon={Activity} color="green" />
                <QuickStatCard label="Overdue" value={data.statistics?.overdueTasks || 0} icon={AlertCircle} color="red" />
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-lg font-bold text-slate-900 tabular-nums">{currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}</div>
                <div className="text-xs text-slate-500 font-medium">{currentTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 rounded-lg"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div><span className="text-sm font-semibold text-emerald-700">LIVE</span></div>
                <button onClick={refetch} disabled={refreshing} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors" title="Refresh all data"><RefreshCw className={`h-5 w-5 text-slate-700 ${refreshing ? "animate-spin" : ""}`} /></button>
                <button onClick={toggleFullscreen} className={`p-2 rounded-lg transition-colors ${showFullscreen ? "bg-orange-100 hover:bg-orange-200 text-orange-700" : "bg-purple-100 hover:bg-purple-200 text-purple-700"}`}>{showFullscreen ? <X className="h-5 w-5" /> : <Target className="h-5 w-5" />}</button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="p-4 h-full flex flex-col gap-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 flex-shrink-0">
              <ModernKPICard label="Total Projects" value={data.statistics?.totalProjects || 0} icon={Building2} trend={data.trends?.projects || "neutral"} trendValue={`${data.statistics?.activeProjects || 0} active`} colorScheme="primary" subtitle="All users combined" />
              <ModernKPICard label="Total Budget" value={formatCurrency(data.statistics?.totalBudget || 0)} icon={DollarSign} trend={data.trends?.budget || "neutral"} trendValue={`${data.statistics?.budgetUtilization || 0}% used`} colorScheme="success" subtitle="System-wide" />
              <ModernKPICard label="Team Members" value={data.statistics?.teamSize || 0} icon={Users} trend={data.trends?.team || "neutral"} trendValue={data.trends?.teamValue || "0 members"} colorScheme="purple" subtitle={`${data.statistics?.managersCount || 0} managers`} />
              <ModernKPICard label="Task Completion" value={`${data.statistics?.completionRate || 0}%`} icon={Target} trend={data.trends?.completion || "neutral"} trendValue={`${data.statistics?.completedTasks || 0}/${data.statistics?.totalTasks || 0}`} colorScheme="warning" subtitle="All tasks" />
              <ModernKPICard label="Overdue Items" value={(data.statistics?.overdueTasks || 0) + (data.statistics?.overdueProjects || 0)} icon={AlertCircle} trend={(data.statistics?.overdueTasks || 0) > 0 ? "down" : "up"} trendValue={(data.statistics?.overdueTasks || 0) > 0 ? "Needs attention" : "On track"} colorScheme="danger" subtitle={`${data.statistics?.overdueTasks || 0} tasks`} />
            </div>

            {/* Main Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-6 lg:grid-rows-2 gap-3 min-h-0 overflow-auto lg:overflow-hidden">
              {/* Project Status Chart */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-slate-900">Project Status</h3><span className="text-xs text-slate-500">{data.statistics?.totalProjects || 0} total</span></div>
                <div className="h-48 lg:h-[calc(100%-2rem)]">
                  {data.chartData?.statusData?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={data.chartData.statusData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={2} dataKey="value">{data.chartData.statusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />))}</Pie><Tooltip /><Legend wrapperStyle={{ fontSize: "10px" }} /></PieChart>
                    </ResponsiveContainer>
                  ) : (<div className="flex items-center justify-center h-full"><p className="text-xs text-slate-400">No project data</p></div>)}
                </div>
              </div>

              {/* Task Status Chart */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-slate-900">Task Status</h3><span className="text-xs text-slate-500">{data.statistics?.totalTasks || 0} total</span></div>
                <div className="h-48 lg:h-[calc(100%-2rem)]">
                  {data.chartData?.taskStatusData?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={data.chartData.taskStatusData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={2} dataKey="value">{data.chartData.taskStatusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />))}</Pie><Tooltip /><Legend wrapperStyle={{ fontSize: "10px" }} /></PieChart>
                    </ResponsiveContainer>
                  ) : (<div className="flex items-center justify-center h-full"><p className="text-xs text-slate-400">No task data</p></div>)}
                </div>
              </div>

              {/* Monthly Trend */}
              <div className="lg:col-span-2 bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-slate-900">Monthly Trend</h3><TrendingUp className="h-4 w-4 text-slate-400" /></div>
                <div className="h-48 lg:h-[calc(100%-2rem)]">
                  {data.chartData?.monthlyTrend?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.chartData.monthlyTrend}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="name" fontSize={9} /><YAxis fontSize={9} /><Tooltip /><Area type="monotone" dataKey="projects" stackId="1" stroke={CHART_COLORS.primary[0]} fill={CHART_COLORS.primary[0]} fillOpacity={0.6} /><Area type="monotone" dataKey="tasks" stackId="2" stroke={CHART_COLORS.success[0]} fill={CHART_COLORS.success[0]} fillOpacity={0.6} /></AreaChart>
                    </ResponsiveContainer>
                  ) : (<div className="flex items-center justify-center h-full"><p className="text-xs text-slate-400">No trend data</p></div>)}
                </div>
              </div>

              {/* Calendar */}
              <div className="lg:row-span-2 bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-center space-x-2 mb-2"><Calendar className="h-4 w-4 text-purple-600" /><h3 className="text-sm font-bold text-slate-900">Calendar</h3></div>
                <EnhancedCalendar events={data.events} tasks={data.tasks} onCreateEvent={handleCreateEvent} teamMembers={data.allTeamMembers || []} />
              </div>

              {/* Recent Activity */}
              <div className="lg:row-span-2 bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3"><div className="flex items-center space-x-2"><Activity className="h-4 w-4 text-indigo-600" /><h3 className="text-sm font-bold text-slate-900">Recent Activity</h3></div><span className="text-[10px] text-slate-500">Click for details</span></div>
                <div className="flex-1 overflow-y-auto"><RecentActivityFeed activities={data.recentActivity || []} onItemClick={handleActivityClick} /></div>
              </div>

              {/* Latest Projects */}
              <div className="lg:col-span-2 bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2"><PlayCircle className="h-4 w-4 text-blue-600" /><h3 className="text-sm font-bold text-slate-900">Latest Projects</h3></div>
                  <div className="flex items-center space-x-2"><span className="text-[10px] text-slate-500">Click for details</span><span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">{data.statistics?.totalProjects || 0}</span></div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {latestProjects.length > 0 ? (
                    latestProjects.slice(0, 6).map((project, index) => {
                      const statusConfig = getStatusConfig(project.status);
                      return (
                        <div key={project.id || index} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group" onClick={() => handleProjectClick(project)}>
                          <div className="flex justify-between items-start mb-1.5">
                            <h4 className="text-xs font-semibold text-slate-900 truncate flex-1 group-hover:text-blue-600">{safeString(project.title) || safeString(project.name) || "Untitled"}</h4>
                            <div className="flex items-center space-x-2 ml-2">
                              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${statusConfig.bg} ${statusConfig.text}`}>{project.status}</span>
                              <span className="text-xs font-bold text-blue-600">{Math.round(project.progress_percentage || project.progress || 0)}%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center space-x-1"><User className="h-3 w-3 text-slate-400" /><span className="text-[9px] text-slate-500 truncate">{getProjectAssignee(project, data.rawManagers || data.managers)}</span></div>
                            <span className="text-[9px] text-slate-400">{getRelativeTime(project.created_at)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${project.progress_percentage || project.progress || 0}%` }} /></div>
                        </div>
                      );
                    })
                  ) : (<div className="flex-1 flex items-center justify-center"><p className="text-xs text-slate-400">No projects</p></div>)}
                </div>
              </div>

              {/* Latest Tenders */}
              <div className="lg:col-span-2 bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2"><FileText className="h-4 w-4 text-orange-600" /><h3 className="text-sm font-bold text-slate-900">Latest Tenders</h3></div>
                  <div className="flex items-center space-x-2"><span className="text-[10px] text-slate-500">Click for details</span><span className="text-xs font-bold text-orange-700 bg-orange-50 px-2 py-1 rounded">{data.statistics?.totalTenders || 0}</span></div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {latestTenders.length > 0 ? (
                    latestTenders.slice(0, 5).map((tender, index) => {
                      const statusConfig = getStatusConfig(tender.status);
                      return (
                        <div key={tender.id || index} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-all group" onClick={() => handleTenderClick(tender)}>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-xs font-semibold text-slate-900 truncate flex-1 group-hover:text-orange-600">{safeString(tender.title) || safeString(tender.name) || "Untitled Tender"}</h4>
                            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ml-2 ${statusConfig.bg} ${statusConfig.text}`}>{tender.status}</span>
                          </div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-1"><User className="h-3 w-3 text-slate-400" /><span className="text-[9px] text-slate-500 truncate">{safeString(tender.created_by) || safeString(tender.project_manager) || "System"}</span></div>
                            <span className="text-[9px] text-slate-400">{getRelativeTime(tender.created_at)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-600">{formatCurrency(tender.budget_estimate || tender.value || tender.amount)}</span>
                            <span className="text-[10px] text-slate-500 flex items-center space-x-1"><Clock className="h-3 w-3" /><span>{formatDate(tender.deadline || tender.submission_deadline)}</span></span>
                          </div>
                        </div>
                      );
                    })
                  ) : (<div className="flex-1 flex items-center justify-center"><p className="text-xs text-slate-400">No tenders</p></div>)}
                </div>
              </div>

              {/* Top Managers */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3"><div className="flex items-center space-x-2"><Briefcase className="h-4 w-4 text-blue-600" /><h3 className="text-sm font-bold text-slate-900">Top Managers</h3></div><Crown className="h-4 w-4 text-amber-500" /></div>
                <div className="space-y-2">
                  {(data.chartData?.topManagers || []).length > 0 ? (
                    data.chartData.topManagers.slice(0, 3).map((manager, index) => (
                      <div key={manager.id || index} className="p-2 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 hover:shadow-md transition-all" onClick={() => navigate(`/admin/project-manager/${manager.id}`)}>
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-[10px]">{manager.avatar}</div>
                          <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-slate-900 truncate">{manager.name}</p><p className="text-[10px] text-blue-600 font-medium">{Math.round(manager.performance)}% perf • {manager.projectsCount} projects</p></div>
                        </div>
                      </div>
                    ))
                  ) : (<p className="text-xs text-slate-400 text-center py-4">No managers</p>)}
                </div>
              </div>

              {/* Top Supervisors */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3"><div className="flex items-center space-x-2"><HardHat className="h-4 w-4 text-purple-600" /><h3 className="text-sm font-bold text-slate-900">Top Supervisors</h3></div><Crown className="h-4 w-4 text-amber-500" /></div>
                <div className="space-y-2">
                  {(data.chartData?.topSupervisors || []).length > 0 ? (
                    data.chartData.topSupervisors.slice(0, 3).map((supervisor, index) => (
                      <div key={supervisor.id || index} className="p-2 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 hover:shadow-md transition-all" onClick={() => navigate(`/admin/supervisor/${supervisor.id}`)}>
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px]">{supervisor.avatar}</div>
                          <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-slate-900 truncate">{supervisor.name}</p><p className="text-[10px] text-purple-600 font-medium">{Math.round(supervisor.performance)}% perf • {supervisor.projectsCount} projects</p></div>
                        </div>
                      </div>
                    ))
                  ) : (<p className="text-xs text-slate-400 text-center py-4">No supervisors</p>)}
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
              <span className="hidden sm:inline text-xs">Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "Never"}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline text-xs text-emerald-600 font-medium">Showing ALL system data</span>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <span>Projects: <strong>{data.statistics?.totalProjects || 0}</strong></span>
              <span>•</span>
              <span>Tasks: <strong>{data.statistics?.totalTasks || 0}</strong></span>
              <span>•</span>
              <span>Team: <strong>{data.statistics?.teamSize || 0}</strong></span>
              <span>•</span>
              <span>Tenders: <strong>{data.statistics?.totalTenders || 0}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* POPUP MODALS */}
      {selectedProject && <ProjectDetailModal project={selectedProject} managers={data.rawManagers || data.managers} onClose={() => setSelectedProject(null)} onEdit={handleEditProject} onViewFull={handleViewFullProject} />}
      {selectedTender && <TenderDetailModal tender={selectedTender} onClose={() => setSelectedTender(null)} onEdit={handleEditTender} onViewFull={handleViewFullTender} />}
      {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} onViewFull={handleViewFullTask} />}
    </div>
  );
};

export default AdminDashboard;
