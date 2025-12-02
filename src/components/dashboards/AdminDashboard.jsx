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
//   Area,
//   AreaChart,
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
//   TrendingUp,
//   Activity,
//   Layers,
//   CheckCircle2,
//   AlertCircle,
//   Timer,
//   MapPin,
//   Phone,
//   Mail,
//   ExternalLink,
//   Edit,
//   Download,
//   Eye,
//   Paperclip,
//   CalendarDays,
//   CircleDollarSign,
//   ClipboardList,
//   Building,
//   Tag,
//   Hash,
//   FileCheck,
//   Award,
//   Banknote,
//   Receipt,
//   Info,
//   Maximize2,
//   Minimize2,
//   Video,
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
//   meetingsAPI,
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

// const formatCurrencyFull = (amount) => {
//   if (!amount) return "$0.00";
//   const num = parseFloat(amount);
//   return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// };

// const formatDate = (dateString) => {
//   if (!dateString) return "No date";
//   try {
//     return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
//   } catch {
//     return "Invalid";
//   }
// };

// const formatDateFull = (dateString) => {
//   if (!dateString) return "Not set";
//   try {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       weekday: "long",
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   } catch {
//     return "Invalid";
//   }
// };

// const getRelativeTime = (dateString) => {
//   if (!dateString) return "";
//   try {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffMs = now - date;
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMs / 3600000);
//     const diffDays = Math.floor(diffMs / 86400000);
//     if (diffMins < 1) return "Just now";
//     if (diffMins < 60) return `${diffMins}m ago`;
//     if (diffHours < 24) return `${diffHours}h ago`;
//     if (diffDays < 7) return `${diffDays}d ago`;
//     return formatDate(dateString);
//   } catch {
//     return "";
//   }
// };

// const getDaysRemaining = (dateString) => {
//   if (!dateString) return null;
//   try {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffMs = date - now;
//     return Math.ceil(diffMs / 86400000);
//   } catch {
//     return null;
//   }
// };

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

// const getProjectAssignee = (project, managers = []) => {
//   const fieldsToCheck = [
//     project.project_manager,
//     project.manager,
//     project.created_by,
//     project.creator,
//     project.owner,
//     project.assigned_to,
//   ];
//   for (const field of fieldsToCheck) {
//     const name = safeString(field);
//     if (name && name.trim()) return name;
//   }
//   if (project.project_manager_id && managers.length > 0) {
//     const manager = managers.find((m) => m.id === project.project_manager_id);
//     if (manager && manager.name) return safeString(manager.name);
//   }
//   if (project.manager_id && managers.length > 0) {
//     const manager = managers.find((m) => m.id === manager.manager_id);
//     if (manager && manager.name) return safeString(manager.name);
//   }
//   return "Unassigned";
// };

// const sortByDateDesc = (items, dateField = "created_at") => {
//   return [...items].sort((a, b) => {
//     const dateA = new Date(a[dateField] || a.updated_at || a.created_at || 0);
//     const dateB = new Date(b[dateField] || b.updated_at || b.created_at || 0);
//     return dateB - dateA;
//   });
// };

// const getStatusConfig = (status) => {
//   const configs = {
//     active: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
//     in_progress: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
//     completed: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
//     pending: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
//     planning: { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
//     on_hold: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
//     paused: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
//     cancelled: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
//     overdue: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
//     open: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
//     closed: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500" },
//     awarded: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
//     draft: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
//   };
//   return configs[status] || { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500" };
// };

// // ============================================
// // PROJECT DETAIL POPUP MODAL
// // ============================================
// const ProjectDetailModal = ({ project, managers, onClose }) => {
//   if (!project) return null;
//   const statusConfig = getStatusConfig(project.status);
//   const progress = parseFloat(project.progress_percentage || project.progress || 0);
//   const budget = parseFloat(project.budget || 0);
//   const spent = parseFloat(project.spent || project.actual_cost || 0);
//   const budgetUsed = budget > 0 ? Math.round((spent / budget) * 100) : 0;
//   const daysRemaining = getDaysRemaining(project.end_date || project.deadline);

//   // Calculate expected progress based on timeline
//   const calculateExpectedProgress = () => {
//     const startDate = project.start_date ? new Date(project.start_date) : null;
//     const endDate = project.end_date || project.deadline ? new Date(project.end_date || project.deadline) : null;
    
//     if (!startDate || !endDate) return null;
    
//     const now = new Date();
//     const totalDuration = endDate.getTime() - startDate.getTime();
//     const elapsed = now.getTime() - startDate.getTime();
    
//     if (totalDuration <= 0) return null;
//     if (elapsed < 0) return 0; // Project hasn't started yet
//     if (elapsed > totalDuration) return 100; // Past deadline
    
//     return Math.round((elapsed / totalDuration) * 100);
//   };

//   const expectedProgress = calculateExpectedProgress();
//   const progressDifference = expectedProgress !== null ? progress - expectedProgress : null;
  
//   // Determine progress status
//   const getProgressStatus = () => {
//     if (progressDifference === null) return { status: "unknown", color: "slate", label: "Timeline not set" };
//     if (progressDifference >= 10) return { status: "ahead", color: "emerald", label: `${Math.abs(progressDifference).toFixed(0)}% ahead of schedule` };
//     if (progressDifference >= 0) return { status: "on-track", color: "blue", label: "On track" };
//     if (progressDifference >= -10) return { status: "slightly-behind", color: "amber", label: `${Math.abs(progressDifference).toFixed(0)}% behind schedule` };
//     return { status: "behind", color: "red", label: `${Math.abs(progressDifference).toFixed(0)}% behind schedule` };
//   };

//   const progressStatus = getProgressStatus();

//   return (
//     <div 
//       className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
//       onClick={onClose}
//     >
//       <div
//         className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
//           >
//             <X className="h-5 w-5" />
//           </button>
//           <div className="flex items-start space-x-4">
//             <div className="p-3 bg-white/20 rounded-xl">
//               <Building2 className="h-8 w-8" />
//             </div>
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center space-x-2 mb-1">
//                 <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
//                   {project.status?.replace(/_/g, " ").toUpperCase()}
//                 </span>
//                 {project.priority && (
//                   <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">
//                     {project.priority} Priority
//                   </span>
//                 )}
//               </div>
//               <h2 className="text-xl font-bold truncate">
//                 {safeString(project.title) || safeString(project.name) || "Untitled Project"}
//               </h2>
//               <p className="text-blue-100 text-sm mt-1">
//                 ID: #{project.id} • Created {getRelativeTime(project.created_at)}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
//           {/* Progress Section - Enhanced with Expected vs Actual */}
//           <div className="mb-6">
//             {/* Progress Status Banner */}
//             {progressStatus.status !== "unknown" && (
//               <div className={`mb-4 p-3 rounded-xl flex items-center justify-between ${
//                 progressStatus.color === "emerald" ? "bg-emerald-50 border border-emerald-200" :
//                 progressStatus.color === "blue" ? "bg-blue-50 border border-blue-200" :
//                 progressStatus.color === "amber" ? "bg-amber-50 border border-amber-200" :
//                 "bg-red-50 border border-red-200"
//               }`}>
//                 <div className="flex items-center space-x-2">
//                   {progressStatus.status === "ahead" && <ArrowUpRight className="h-5 w-5 text-emerald-600" />}
//                   {progressStatus.status === "on-track" && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
//                   {progressStatus.status === "slightly-behind" && <AlertCircle className="h-5 w-5 text-amber-600" />}
//                   {progressStatus.status === "behind" && <AlertTriangle className="h-5 w-5 text-red-600" />}
//                   <span className={`text-sm font-semibold ${
//                     progressStatus.color === "emerald" ? "text-emerald-700" :
//                     progressStatus.color === "blue" ? "text-blue-700" :
//                     progressStatus.color === "amber" ? "text-amber-700" :
//                     "text-red-700"
//                   }`}>
//                     {progressStatus.label}
//                   </span>
//                 </div>
//                 {progressDifference !== null && (
//                   <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
//                     progressStatus.color === "emerald" ? "bg-emerald-100 text-emerald-700" :
//                     progressStatus.color === "blue" ? "bg-blue-100 text-blue-700" :
//                     progressStatus.color === "amber" ? "bg-amber-100 text-amber-700" :
//                     "bg-red-100 text-red-700"
//                   }`}>
//                     {progressDifference >= 0 ? "+" : ""}{progressDifference.toFixed(0)}%
//                   </span>
//                 )}
//               </div>
//             )}

//             {/* Current Progress */}
//             <div className="mb-4">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm font-semibold text-slate-700">Current Progress</span>
//                 <span className="text-lg font-bold text-blue-600">{progress.toFixed(0)}%</span>
//               </div>
//               <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden relative">
//                 <div
//                   className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
//                   style={{ width: `${Math.min(progress, 100)}%` }}
//                 />
//                 {/* Expected progress marker */}
//                 {expectedProgress !== null && (
//                   <div 
//                     className="absolute top-0 h-full w-1 bg-slate-800 opacity-60"
//                     style={{ left: `${Math.min(expectedProgress, 100)}%`, transform: 'translateX(-50%)' }}
//                     title={`Expected: ${expectedProgress}%`}
//                   >
//                     <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-slate-800"></div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Expected Progress */}
//             {expectedProgress !== null && (
//               <div className="mb-4">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-sm font-semibold text-slate-700">Expected Progress</span>
//                   <span className="text-lg font-bold text-slate-500">{expectedProgress}%</span>
//                 </div>
//                 <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
//                   <div
//                     className="h-full bg-gradient-to-r from-slate-400 to-slate-500 rounded-full transition-all duration-500"
//                     style={{ width: `${Math.min(expectedProgress, 100)}%` }}
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Progress Comparison Legend */}
//             {expectedProgress !== null && (
//               <div className="flex items-center justify-center space-x-6 mt-3 pt-3 border-t border-slate-100">
//                 <div className="flex items-center space-x-2">
//                   <div className="w-4 h-3 rounded bg-gradient-to-r from-blue-500 to-blue-600"></div>
//                   <span className="text-xs text-slate-600">Current: {progress.toFixed(0)}%</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <div className="w-4 h-3 rounded bg-gradient-to-r from-slate-400 to-slate-500"></div>
//                   <span className="text-xs text-slate-600">Expected: {expectedProgress}%</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <div className="w-1 h-4 bg-slate-800 opacity-60"></div>
//                   <span className="text-xs text-slate-600">Target Marker</span>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Key Info Grid */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//             <div className="bg-slate-50 rounded-xl p-4">
//               <div className="flex items-center space-x-2 text-slate-500 mb-1">
//                 <CircleDollarSign className="h-4 w-4" />
//                 <span className="text-xs font-medium">Budget</span>
//               </div>
//               <div className="text-lg font-bold text-slate-900">{formatCurrency(budget)}</div>
//             </div>
//             <div className="bg-slate-50 rounded-xl p-4">
//               <div className="flex items-center space-x-2 text-slate-500 mb-1">
//                 <Receipt className="h-4 w-4" />
//                 <span className="text-xs font-medium">Spent</span>
//               </div>
//               <div className="text-lg font-bold text-slate-900">{formatCurrency(spent)}</div>
//               <div className="text-xs text-slate-500">{budgetUsed}% of budget</div>
//             </div>
//             <div className="bg-slate-50 rounded-xl p-4">
//               <div className="flex items-center space-x-2 text-slate-500 mb-1">
//                 <CalendarDays className="h-4 w-4" />
//                 <span className="text-xs font-medium">Start Date</span>
//               </div>
//               <div className="text-sm font-bold text-slate-900">{formatDate(project.start_date)}</div>
//             </div>
//             <div className="bg-slate-50 rounded-xl p-4">
//               <div className="flex items-center space-x-2 text-slate-500 mb-1">
//                 <Timer className="h-4 w-4" />
//                 <span className="text-xs font-medium">End Date</span>
//               </div>
//               <div className="text-sm font-bold text-slate-900">{formatDate(project.end_date || project.deadline)}</div>
//               {daysRemaining !== null && (
//                 <div className={`text-xs ${daysRemaining < 0 ? "text-red-500" : daysRemaining < 7 ? "text-orange-500" : "text-green-500"}`}>
//                   {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Description */}
//           {project.description && (
//             <div className="mb-6">
//               <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
//                 <Info className="h-4 w-4 mr-2" />
//                 Description
//               </h3>
//               <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4">{project.description}</p>
//             </div>
//           )}

//           {/* Team & Details */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//             <div>
//               <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
//                 <Users className="h-4 w-4 mr-2" />
//                 Team
//               </h3>
//               <div className="space-y-3">
//                 <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
//                     {getProjectAssignee(project, managers).split(" ").map((n) => n[0]).join("").substring(0, 2)}
//                   </div>
//                   <div>
//                     <div className="text-sm font-semibold text-slate-900">{getProjectAssignee(project, managers)}</div>
//                     <div className="text-xs text-slate-500">Project Manager</div>
//                   </div>
//                 </div>
//                 {project.supervisor && (
//                   <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
//                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
//                       {safeString(project.supervisor).split(" ").map((n) => n[0]).join("").substring(0, 2) || "S"}
//                     </div>
//                     <div>
//                       <div className="text-sm font-semibold text-slate-900">{safeString(project.supervisor)}</div>
//                       <div className="text-xs text-slate-500">Supervisor</div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div>
//               <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
//                 <ClipboardList className="h-4 w-4 mr-2" />
//                 Details
//               </h3>
//               <div className="space-y-2">
//                 {project.location && (
//                   <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
//                     <MapPin className="h-4 w-4 text-slate-400" />
//                     <span className="text-sm text-slate-700">{safeString(project.location)}</span>
//                   </div>
//                 )}
//                 {project.client && (
//                   <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
//                     <Building className="h-4 w-4 text-slate-400" />
//                     <span className="text-sm text-slate-700">Client: {safeString(project.client)}</span>
//                   </div>
//                 )}
//                 {project.category && (
//                   <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
//                     <Tag className="h-4 w-4 text-slate-400" />
//                     <span className="text-sm text-slate-700">{safeString(project.category)}</span>
//                   </div>
//                 )}
//                 <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
//                   <Clock className="h-4 w-4 text-slate-400" />
//                   <span className="text-sm text-slate-700">Updated {getRelativeTime(project.updated_at)}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Tasks Summary */}
//           {(project.tasks_count || project.total_tasks) && (
//             <div className="mb-6">
//               <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
//                 <CheckCircle2 className="h-4 w-4 mr-2" />
//                 Tasks Overview
//               </h3>
//               <div className="grid grid-cols-4 gap-2">
//                 <div className="text-center p-3 bg-blue-50 rounded-xl">
//                   <div className="text-lg font-bold text-blue-600">{project.total_tasks || project.tasks_count || 0}</div>
//                   <div className="text-xs text-blue-600">Total</div>
//                 </div>
//                 <div className="text-center p-3 bg-green-50 rounded-xl">
//                   <div className="text-lg font-bold text-green-600">{project.completed_tasks || 0}</div>
//                   <div className="text-xs text-green-600">Completed</div>
//                 </div>
//                 <div className="text-center p-3 bg-yellow-50 rounded-xl">
//                   <div className="text-lg font-bold text-yellow-600">{project.pending_tasks || 0}</div>
//                   <div className="text-xs text-yellow-600">Pending</div>
//                 </div>
//                 <div className="text-center p-3 bg-red-50 rounded-xl">
//                   <div className="text-lg font-bold text-red-600">{project.overdue_tasks || 0}</div>
//                   <div className="text-xs text-red-600">Overdue</div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer Actions - Only Close button */}
//         <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-center">
//           <button
//             onClick={onClose}
//             className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============================================
// // TENDER DETAIL POPUP MODAL
// // ============================================
// const TenderDetailModal = ({ tender, onClose }) => {
//   if (!tender) return null;
//   const statusConfig = getStatusConfig(tender.status);
//   const budget = parseFloat(tender.budget_estimate || tender.value || tender.amount || 0);
//   const daysRemaining = getDaysRemaining(tender.deadline || tender.submission_deadline);

//   return (
//     <div 
//       className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
//       onClick={onClose}
//     >
//       <div
//         className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
//           >
//             <X className="h-5 w-5" />
//           </button>
//           <div className="flex items-start space-x-4">
//             <div className="p-3 bg-white/20 rounded-xl">
//               <FileText className="h-8 w-8" />
//             </div>
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center space-x-2 mb-1">
//                 <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
//                   {tender.status?.replace(/_/g, " ").toUpperCase()}
//                 </span>
//                 {tender.type && (
//                   <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">{tender.type}</span>
//                 )}
//               </div>
//               <h2 className="text-xl font-bold truncate">
//                 {safeString(tender.title) || safeString(tender.name) || "Untitled Tender"}
//               </h2>
//               <p className="text-orange-100 text-sm mt-1">
//                 ID: #{tender.id} • Created {getRelativeTime(tender.created_at)}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
//           {/* Deadline Alert */}
//           {daysRemaining !== null && (
//             <div
//               className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
//                 daysRemaining < 0
//                   ? "bg-red-50 border border-red-200"
//                   : daysRemaining < 7
//                   ? "bg-orange-50 border border-orange-200"
//                   : "bg-green-50 border border-green-200"
//               }`}
//             >
//               <Timer
//                 className={`h-5 w-5 ${
//                   daysRemaining < 0 ? "text-red-500" : daysRemaining < 7 ? "text-orange-500" : "text-green-500"
//                 }`}
//               />
//               <div>
//                 <div
//                   className={`text-sm font-semibold ${
//                     daysRemaining < 0 ? "text-red-700" : daysRemaining < 7 ? "text-orange-700" : "text-green-700"
//                   }`}
//                 >
//                   {daysRemaining < 0
//                     ? `Deadline passed ${Math.abs(daysRemaining)} days ago`
//                     : daysRemaining === 0
//                     ? "Deadline is today!"
//                     : `${daysRemaining} days until deadline`}
//                 </div>
//                 <div className="text-xs text-slate-600">
//                   {formatDateFull(tender.deadline || tender.submission_deadline)}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Key Info Grid */}
//           <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
//             <div className="bg-slate-50 rounded-xl p-4">
//               <div className="flex items-center space-x-2 text-slate-500 mb-1">
//                 <Banknote className="h-4 w-4" />
//                 <span className="text-xs font-medium">Budget Estimate</span>
//               </div>
//               <div className="text-lg font-bold text-emerald-600">{formatCurrencyFull(budget)}</div>
//             </div>
//             <div className="bg-slate-50 rounded-xl p-4">
//               <div className="flex items-center space-x-2 text-slate-500 mb-1">
//                 <CalendarDays className="h-4 w-4" />
//                 <span className="text-xs font-medium">Deadline</span>
//               </div>
//               <div className="text-sm font-bold text-slate-900">
//                 {formatDate(tender.deadline || tender.submission_deadline)}
//               </div>
//             </div>
//             <div className="bg-slate-50 rounded-xl p-4">
//               <div className="flex items-center space-x-2 text-slate-500 mb-1">
//                 <FileCheck className="h-4 w-4" />
//                 <span className="text-xs font-medium">Submissions</span>
//               </div>
//               <div className="text-lg font-bold text-slate-900">{tender.submissions_count || tender.bids_count || 0}</div>
//             </div>
//           </div>

//           {/* Description */}
//           {tender.description && (
//             <div className="mb-6">
//               <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
//                 <Info className="h-4 w-4 mr-2" />
//                 Description
//               </h3>
//               <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4">{tender.description}</p>
//             </div>
//           )}

//           {/* Requirements */}
//           {tender.requirements && (
//             <div className="mb-6">
//               <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
//                 <ClipboardList className="h-4 w-4 mr-2" />
//                 Requirements
//               </h3>
//               <div className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4 whitespace-pre-wrap">
//                 {tender.requirements}
//               </div>
//             </div>
//           )}

//           {/* Details Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//             <div>
//               <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
//                 <FileText className="h-4 w-4 mr-2" />
//                 Tender Information
//               </h3>
//               <div className="space-y-2">
//                 {tender.reference_number && (
//                   <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
//                     <Hash className="h-4 w-4 text-slate-400" />
//                     <span className="text-sm text-slate-700">Ref: {tender.reference_number}</span>
//                   </div>
//                 )}
//                 {tender.category && (
//                   <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
//                     <Tag className="h-4 w-4 text-slate-400" />
//                     <span className="text-sm text-slate-700">{safeString(tender.category)}</span>
//                   </div>
//                 )}
//                 {tender.location && (
//                   <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
//                     <MapPin className="h-4 w-4 text-slate-400" />
//                     <span className="text-sm text-slate-700">{safeString(tender.location)}</span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div>
//               <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
//                 <User className="h-4 w-4 mr-2" />
//                 Contact Information
//               </h3>
//               <div className="space-y-2">
//                 <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
//                     {(safeString(tender.created_by) || safeString(tender.project_manager) || "S")
//                       .split(" ")
//                       .map((n) => n[0])
//                       .join("")
//                       .substring(0, 2)}
//                   </div>
//                   <div>
//                     <div className="text-sm font-semibold text-slate-900">
//                       {safeString(tender.created_by) || safeString(tender.project_manager) || "System"}
//                     </div>
//                     <div className="text-xs text-slate-500">Created by</div>
//                   </div>
//                 </div>
//                 {tender.contact_email && (
//                   <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
//                     <Mail className="h-4 w-4 text-slate-400" />
//                     <span className="text-sm text-slate-700">{tender.contact_email}</span>
//                   </div>
//                 )}
//                 {tender.contact_phone && (
//                   <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
//                     <Phone className="h-4 w-4 text-slate-400" />
//                     <span className="text-sm text-slate-700">{tender.contact_phone}</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Winner (if awarded) */}
//           {tender.status === "awarded" && tender.winner && (
//             <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
//               <h3 className="text-sm font-semibold text-emerald-700 mb-2 flex items-center">
//                 <Award className="h-4 w-4 mr-2" />
//                 Awarded To
//               </h3>
//               <div className="flex items-center space-x-3">
//                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
//                   <Award className="h-5 w-5" />
//                 </div>
//                 <div>
//                   <div className="text-sm font-semibold text-emerald-900">{safeString(tender.winner)}</div>
//                   {tender.awarded_amount && (
//                     <div className="text-xs text-emerald-600">Amount: {formatCurrencyFull(tender.awarded_amount)}</div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Attachments */}
//           {tender.attachments && tender.attachments.length > 0 && (
//             <div className="mb-6">
//               <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
//                 <Paperclip className="h-4 w-4 mr-2" />
//                 Attachments ({tender.attachments.length})
//               </h3>
//               <div className="space-y-2">
//                 {tender.attachments.map((attachment, index) => (
//                   <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
//                     <div className="flex items-center space-x-2">
//                       <FileText className="h-4 w-4 text-slate-400" />
//                       <span className="text-sm text-slate-700">{attachment.name || `Attachment ${index + 1}`}</span>
//                     </div>
//                     <button className="p-1 hover:bg-slate-200 rounded">
//                       <Download className="h-4 w-4 text-slate-500" />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer Actions - Only Close button */}
//         <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-center">
//           <button
//             onClick={onClose}
//             className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============================================
// // TASK DETAIL POPUP MODAL
// // ============================================
// const TaskDetailModal = ({ task, onClose }) => {
//   if (!task) return null;
//   const statusConfig = getStatusConfig(task.status);
//   const daysRemaining = getDaysRemaining(task.due_date || task.deadline);

//   return (
//     <div 
//       className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
//       onClick={onClose}
//     >
//       <div
//         className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl transform transition-all"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="relative bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
//           >
//             <X className="h-5 w-5" />
//           </button>
//           <div className="flex items-start space-x-4">
//             <div className="p-3 bg-white/20 rounded-xl">
//               <CheckCircle2 className="h-8 w-8" />
//             </div>
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center space-x-2 mb-1">
//                 <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
//                   {task.status?.replace(/_/g, " ").toUpperCase()}
//                 </span>
//                 {task.priority && (
//                   <span
//                     className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
//                       task.priority === "high"
//                         ? "bg-red-100 text-red-700"
//                         : task.priority === "medium"
//                         ? "bg-yellow-100 text-yellow-700"
//                         : "bg-green-100 text-green-700"
//                     }`}
//                   >
//                     {task.priority}
//                   </span>
//                 )}
//               </div>
//               <h2 className="text-xl font-bold truncate">
//                 {safeString(task.title) || safeString(task.name) || "Untitled Task"}
//               </h2>
//               <p className="text-green-100 text-sm mt-1">
//                 ID: #{task.id} • Created {getRelativeTime(task.created_at)}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
//           {/* Due Date Alert */}
//           {daysRemaining !== null && (
//             <div
//               className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
//                 daysRemaining < 0
//                   ? "bg-red-50 border border-red-200"
//                   : daysRemaining < 3
//                   ? "bg-orange-50 border border-orange-200"
//                   : "bg-green-50 border border-green-200"
//               }`}
//             >
//               <Timer
//                 className={`h-5 w-5 ${
//                   daysRemaining < 0 ? "text-red-500" : daysRemaining < 3 ? "text-orange-500" : "text-green-500"
//                 }`}
//               />
//               <div>
//                 <div
//                   className={`text-sm font-semibold ${
//                     daysRemaining < 0 ? "text-red-700" : daysRemaining < 3 ? "text-orange-700" : "text-green-700"
//                   }`}
//                 >
//                   {daysRemaining < 0
//                     ? `Overdue by ${Math.abs(daysRemaining)} days`
//                     : daysRemaining === 0
//                     ? "Due today!"
//                     : `Due in ${daysRemaining} days`}
//                 </div>
//                 <div className="text-xs text-slate-600">{formatDateFull(task.due_date || task.deadline)}</div>
//               </div>
//             </div>
//           )}

//           {/* Description */}
//           {task.description && (
//             <div className="mb-6">
//               <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
//                 <Info className="h-4 w-4 mr-2" />
//                 Description
//               </h3>
//               <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4">{task.description}</p>
//             </div>
//           )}

//           {/* Details */}
//           <div className="space-y-2">
//             {task.assigned_to && (
//               <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
//                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
//                   {safeString(task.assigned_to).split(" ").map((n) => n[0]).join("").substring(0, 2) || "U"}
//                 </div>
//                 <div>
//                   <div className="text-sm font-semibold text-slate-900">{safeString(task.assigned_to)}</div>
//                   <div className="text-xs text-slate-500">Assigned to</div>
//                 </div>
//               </div>
//             )}
//             {task.project && (
//               <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
//                 <Building2 className="h-4 w-4 text-slate-400" />
//                 <span className="text-sm text-slate-700">Project: {safeString(task.project)}</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Footer - Only Close button */}
//         <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-center">
//           <button
//             onClick={onClose}
//             className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============================================
// // DASHBOARD DATA HOOK
// // ============================================
// const useDashboardData = () => {
//   const [data, setData] = useState({
//     statistics: {},
//     projects: [],
//     managers: [],
//     rawManagers: [],
//     events: [],
//     tasks: [],
//     tenders: [],
//     meetings: [],
//     supervisors: [],
//     siteManagers: [],
//     chartData: {},
//     trends: {},
//     allTeamMembers: [],
//     recentActivity: [],
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
//         meetingsResponse,
//         supervisorsResponse,
//         siteManagersResponse,
//         calendarEventsResponse,
//       ] = await Promise.allSettled([
//         projectsAPI
//           .getAll({ all: true, scope: "admin", admin: true, per_page: 1000, include_all_users: true })
//           .catch(() => projectsAPI.getAll({ admin: true, per_page: 1000 }).catch(() => projectsAPI.getAll({ per_page: 1000 }).catch(() => ({ projects: [] })))),
//         fetchProjectManagers().catch(() => []),
//         eventsAPI.getAll ? eventsAPI.getAll({ all: true, per_page: 100 }).catch(() => eventsAPI.getUpcoming(100).catch(() => ({ events: [] }))) : eventsAPI.getUpcoming(100).catch(() => ({ events: [] })),
//         tasksAPI.getAll({ all: true, scope: "admin", admin: true, per_page: 1000, include_all_users: true }).catch(() => tasksAPI.getAll({ per_page: 1000 }).catch(() => ({ tasks: [] }))),
//         tendersAPI.getAll({ all: true, scope: "admin", admin: true, per_page: 500, include_all_users: true }).catch(() => tendersAPI.getAll({ per_page: 500 }).catch(() => ({ tenders: [] }))),
//         meetingsAPI?.getAll ? meetingsAPI.getAll({ all: true, per_page: 100 }).catch(() => ({ meetings: [] })) : Promise.resolve({ meetings: [] }),
//         supervisorsAPI.getAll().catch(() => []),
//         siteManagersAPI.getAll().catch(() => []),
//         calendarAPI.getTodayEvents ? calendarAPI.getTodayEvents().catch(() => []) : Promise.resolve([]),
//       ]);

//       const projectsData = projectsResponse.status === "fulfilled" ? projectsResponse.value : { projects: [] };
//       const managersData = managersResponse.status === "fulfilled" ? managersResponse.value : [];
//       const eventsData = eventsResponse.status === "fulfilled" ? eventsResponse.value : { events: [] };
//       const tasksData = tasksResponse.status === "fulfilled" ? tasksResponse.value : { tasks: [] };
//       const tendersData = tendersResponse.status === "fulfilled" ? tendersResponse.value : { tenders: [] };
//       const meetingsData = meetingsResponse.status === "fulfilled" ? meetingsResponse.value : { meetings: [] };
//       const supervisorsData = supervisorsResponse.status === "fulfilled" ? supervisorsResponse.value : [];
//       const siteManagersData = siteManagersResponse.status === "fulfilled" ? siteManagersResponse.value : [];
//       const calendarEventsData = calendarEventsResponse.status === "fulfilled" ? calendarEventsResponse.value : [];

//       let projects = Array.isArray(projectsData.projects) ? projectsData.projects : Array.isArray(projectsData) ? projectsData : [];
//       let events = Array.isArray(eventsData.events) ? eventsData.events : Array.isArray(eventsData) ? eventsData : [];
//       let tasks = Array.isArray(tasksData.tasks) ? tasksData.tasks : Array.isArray(tasksData) ? tasksData : [];
//       let tenders = Array.isArray(tendersData.tenders) ? tendersData.tenders : Array.isArray(tendersData) ? tendersData : [];
//       let meetings = Array.isArray(meetingsData.meetings) ? meetingsData.meetings : Array.isArray(meetingsData) ? meetingsData : [];
//       const supervisors = Array.isArray(supervisorsData) ? supervisorsData : [];
//       const siteManagers = Array.isArray(siteManagersData) ? siteManagersData : [];
//       const todayEvents = Array.isArray(calendarEventsData) ? calendarEventsData : [];

//       projects = sortByDateDesc(projects, "created_at");
//       events = sortByDateDesc(events, "date");
//       tasks = sortByDateDesc(tasks, "created_at");
//       tenders = sortByDateDesc(tenders, "created_at");
//       meetings = sortByDateDesc(meetings, "scheduled_at");

//       const rawManagersData = Array.isArray(managersData) ? managersData : managersData?.data && Array.isArray(managersData.data) ? managersData.data : [];

//       const managers = Array.isArray(managersData)
//         ? managersData.map((manager) => {
//             const managerProjects = projects.filter((p) => p.project_manager_id === manager.id || p.manager_id === manager.id || safeString(p.project_manager) === safeString(manager.name));
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
//               currentProjects: managerProjects.slice(0, 2).map((p) => safeString(p.title) || safeString(p.name) || "Untitled"),
//               created_at: manager.created_at,
//             };
//           })
//         : [];

//       const processedSupervisors = supervisors.map((supervisor) => {
//         const supervisorProjects = projects.filter((p) => p.supervisor_id === supervisor.id || safeString(p.supervisor) === safeString(supervisor.name));
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
//           currentProjects: supervisorProjects.slice(0, 2).map((p) => safeString(p.title) || safeString(p.name) || "Untitled"),
//           created_at: supervisor.created_at,
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
//           created_at: siteManager.created_at,
//         };
//       });

//       const allTeamMembers = [
//         ...managers.map((m) => ({ ...m, type: "manager" })),
//         ...processedSupervisors.map((s) => ({ ...s, type: "supervisor" })),
//         ...processedSiteManagers.map((sm) => ({ ...sm, type: "site_manager" })),
//       ];

//       const totalTasks = tasks.length || 0;
//       const completedTasks = tasks.filter((t) => t.status === "completed").length || 0;
//       const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length || 0;
//       const pendingTasks = tasks.filter((t) => t.status === "pending").length || 0;
//       const teamSize = (managers.length || 0) + (processedSupervisors.length || 0) + (processedSiteManagers.length || 0);

//       const overdueTasks = tasks.filter((t) => {
//         if (!t.due_date) return false;
//         return new Date(t.due_date) < new Date() && t.status !== "completed";
//       }).length;

//       const overdueProjects = projects.filter((p) => {
//         if (!p.end_date && !p.deadline) return false;
//         const endDate = new Date(p.end_date || p.deadline);
//         return endDate < new Date() && p.status !== "completed";
//       }).length;

//       const totalBudget = projects.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0);
//       const spentBudget = projects.reduce((sum, p) => sum + parseFloat(p.spent || p.actual_cost || 0), 0);

//       const statistics = {
//         totalProjects: projects.length || 0,
//         activeProjects: projects.filter((p) => p.status === "active" || p.status === "in_progress").length || 0,
//         completedProjects: projects.filter((p) => p.status === "completed").length || 0,
//         planningProjects: projects.filter((p) => p.status === "planning" || p.status === "pending").length || 0,
//         onHoldProjects: projects.filter((p) => p.status === "on_hold" || p.status === "paused").length || 0,
//         overdueProjects,
//         totalTasks,
//         completedTasks,
//         inProgressTasks,
//         pendingTasks,
//         overdueTasks,
//         teamSize,
//         managersCount: managers.length || 0,
//         supervisorsCount: processedSupervisors.length || 0,
//         siteManagersCount: processedSiteManagers.length || 0,
//         totalTenders: tenders.length || 0,
//         activeTenders: tenders.filter((t) => t.status === "active" || t.status === "open").length || 0,
//         closedTenders: tenders.filter((t) => t.status === "closed" || t.status === "awarded").length || 0,
//         pendingTenders: tenders.filter((t) => t.status === "pending" || t.status === "draft").length || 0,
//         totalMeetings: meetings.length || 0,
//         upcomingMeetings: meetings.filter((m) => new Date(m.scheduled_at || m.date || m.start_time) >= new Date()).length || 0,
//         todayMeetings: meetings.filter((m) => {
//           const meetingDate = new Date(m.scheduled_at || m.date || m.start_time);
//           const today = new Date();
//           return meetingDate.toDateString() === today.toDateString();
//         }).length || 0,
//         totalBudget,
//         spentBudget,
//         remainingBudget: totalBudget - spentBudget,
//         budgetUtilization: totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0,
//         completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
//         projectCompletionRate: projects.length > 0 ? Math.round((projects.filter((p) => p.status === "completed").length / projects.length) * 100) : 0,
//         totalEvents: events.length || 0,
//         upcomingEvents: events.filter((e) => new Date(e.date || e.start_date) >= new Date()).length || 0,
//       };

//       const trends = {
//         projects: statistics.activeProjects > 0 ? "up" : "neutral",
//         projectsValue: statistics.activeProjects > 0 ? `${statistics.activeProjects} active` : "No active",
//         budget: statistics.totalBudget > 0 ? "up" : "neutral",
//         budgetValue: statistics.totalBudget > 0 ? formatCurrency(statistics.totalBudget) : "$0",
//         team: teamSize > 0 ? "neutral" : "down",
//         teamValue: `${teamSize} members`,
//         completion: statistics.completionRate >= 50 ? "up" : statistics.completionRate > 0 ? "neutral" : "down",
//         completionValue: `${statistics.completionRate}%`,
//         tasks: statistics.overdueTasks > 0 ? "down" : "up",
//         tasksValue: statistics.overdueTasks > 0 ? `${statistics.overdueTasks} overdue` : "On track",
//       };

//       const topManagers = [...managers].sort((a, b) => (b.performance || 0) - (a.performance || 0)).slice(0, 5);
//       const topSupervisors = [...processedSupervisors].sort((a, b) => (b.performance || 0) - (a.performance || 0)).slice(0, 5);

//       const statusData = [
//         { name: "Active", value: statistics.activeProjects, color: CHART_COLORS.primary[1] },
//         { name: "Completed", value: statistics.completedProjects, color: CHART_COLORS.success[1] },
//         { name: "Planning", value: statistics.planningProjects, color: CHART_COLORS.warning[1] },
//         { name: "On Hold", value: statistics.onHoldProjects, color: CHART_COLORS.danger[1] },
//       ].filter((item) => item.value > 0);

//       const taskStatusData = [
//         { name: "Completed", value: completedTasks, color: CHART_COLORS.success[1] },
//         { name: "In Progress", value: inProgressTasks, color: CHART_COLORS.primary[1] },
//         { name: "Pending", value: pendingTasks, color: CHART_COLORS.warning[1] },
//         { name: "Overdue", value: overdueTasks, color: CHART_COLORS.danger[1] },
//       ].filter((item) => item.value > 0);

//       const monthlyTrend = [];
//       const now = new Date();
//       for (let i = 5; i >= 0; i--) {
//         const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
//         const monthProjects = projects.filter((p) => {
//           const created = new Date(p.created_at);
//           return created.getMonth() === month.getMonth() && created.getFullYear() === month.getFullYear();
//         }).length;
//         monthlyTrend.push({
//           name: month.toLocaleDateString("en-US", { month: "short" }),
//           projects: monthProjects,
//           tasks: tasks.filter((t) => {
//             const created = new Date(t.created_at);
//             return created.getMonth() === month.getMonth() && created.getFullYear() === month.getFullYear();
//           }).length,
//         });
//       }

//       const chartData = { topManagers, topSupervisors, statusData, taskStatusData, monthlyTrend };

//       const recentActivity = [
//         ...projects.slice(0, 10).map((p) => ({
//           id: `project-${p.id}`,
//           type: "project",
//           title: safeString(p.title) || safeString(p.name) || "Untitled Project",
//           status: p.status,
//           date: p.created_at || p.updated_at,
//           user: getProjectAssignee(p, rawManagersData),
//           icon: Building2,
//           color: "blue",
//           data: p,
//         })),
//         ...tasks.slice(0, 10).map((t) => ({
//           id: `task-${t.id}`,
//           type: "task",
//           title: safeString(t.title) || safeString(t.name) || "Untitled Task",
//           status: t.status,
//           date: t.created_at || t.updated_at,
//           user: safeString(t.assigned_to) || safeString(t.assignee) || "Unassigned",
//           icon: CheckCircle2,
//           color: "green",
//           data: t,
//         })),
//         ...tenders.slice(0, 10).map((t) => ({
//           id: `tender-${t.id}`,
//           type: "tender",
//           title: safeString(t.title) || safeString(t.name) || "Untitled Tender",
//           status: t.status,
//           date: t.created_at || t.updated_at,
//           user: safeString(t.created_by) || "System",
//           icon: FileText,
//           color: "orange",
//           data: t,
//         })),
//       ]
//         .sort((a, b) => new Date(b.date) - new Date(a.date))
//         .slice(0, 15);

//       setData({
//         statistics,
//         projects,
//         managers,
//         rawManagers: rawManagersData,
//         events: [...events, ...todayEvents],
//         tasks,
//         tenders,
//         meetings,
//         supervisors: processedSupervisors,
//         siteManagers: processedSiteManagers,
//         chartData,
//         trends,
//         allTeamMembers,
//         recentActivity,
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
//     const interval = setInterval(() => fetchData(true), 120000);
//     return () => clearInterval(interval);
//   }, [fetchData]);

//   const refetch = useCallback(() => fetchData(true), [fetchData]);

//   return { data, loading, error, lastUpdated, refreshing, refetch };
// };

// // ============================================
// // KPI CARD COMPONENT - LARGER FOR BOARDROOM
// // ============================================
// const ModernKPICard = ({ label, value, icon: Icon, trend, trendValue, colorScheme = "primary", subtitle }) => {
//   const colorSchemes = {
//     primary: { bg: "bg-white", iconBg: "bg-gradient-to-br from-blue-500 to-blue-600", accent: "text-blue-600", trendUp: "text-emerald-600 bg-emerald-50", trendDown: "text-red-600 bg-red-50" },
//     success: { bg: "bg-white", iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600", accent: "text-emerald-600", trendUp: "text-emerald-600 bg-emerald-50", trendDown: "text-red-600 bg-red-50" },
//     warning: { bg: "bg-white", iconBg: "bg-gradient-to-br from-amber-500 to-amber-600", accent: "text-amber-600", trendUp: "text-emerald-600 bg-emerald-50", trendDown: "text-red-600 bg-red-50" },
//     purple: { bg: "bg-white", iconBg: "bg-gradient-to-br from-purple-500 to-purple-600", accent: "text-purple-600", trendUp: "text-emerald-600 bg-emerald-50", trendDown: "text-red-600 bg-red-50" },
//     danger: { bg: "bg-white", iconBg: "bg-gradient-to-br from-red-500 to-red-600", accent: "text-red-600", trendUp: "text-emerald-600 bg-emerald-50", trendDown: "text-red-600 bg-red-50" },
//   };
//   const colors = colorSchemes[colorScheme];

//   return (
//     <div className={`${colors.bg} rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all`}>
//       <div className="flex items-start justify-between mb-4">
//         <div className={`p-3 rounded-xl ${colors.iconBg} shadow-lg`}>
//           <Icon className="h-7 w-7 text-white" />
//         </div>
//         {trend && (
//           <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-semibold ${trend === "up" ? colors.trendUp : trend === "down" ? colors.trendDown : "text-slate-600 bg-slate-100"}`}>
//             {trend === "up" ? <ArrowUpRight className="h-4 w-4" /> : trend === "down" ? <ArrowDownRight className="h-4 w-4" /> : null}
//             <span>{trendValue}</span>
//           </div>
//         )}
//       </div>
//       <div className="space-y-1">
//         <div className={`text-4xl font-bold ${colors.accent}`}>{value}</div>
//         <div className="text-base font-semibold text-slate-700">{label}</div>
//         {subtitle && <div className="text-sm text-slate-500">{subtitle}</div>}
//       </div>
//     </div>
//   );
// };

// // ============================================
// // ENHANCED CALENDAR WITH MEETING CREATION
// // ============================================
// const EnhancedCalendar = ({ events, tasks, meetings = [], onCreateMeeting, teamMembers = [], projects = [] }) => {
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [isCreating, setIsCreating] = useState(false);
//   const [newMeeting, setNewMeeting] = useState({
//     title: "",
//     description: "",
//     date: "",
//     start_time: "09:00",
//     end_time: "10:00",
//     location: "",
//     meeting_type: "general",
//     project_id: "",
//     attendees: [],
//   });

//   const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
//   const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
//   const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
//   const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

//   const getActivitiesForDate = (date) => {
//     try {
//       const dateStr = date.toISOString().split("T")[0];
//       const dayEvents = (events || []).filter((event) => {
//         try {
//           const eventDateStr = event.date || event.start_date || event.event_date;
//           if (!eventDateStr) return false;
//           const eventDate = new Date(eventDateStr);
//           if (isNaN(eventDate.getTime())) return false;
//           return eventDate.toISOString().split("T")[0] === dateStr;
//         } catch { return false; }
//       });
//       const dayTasks = (tasks || []).filter((task) => {
//         try {
//           const taskDateStr = task.due_date || task.deadline;
//           if (!taskDateStr) return false;
//           const taskDate = new Date(taskDateStr);
//           if (isNaN(taskDate.getTime())) return false;
//           return taskDate.toISOString().split("T")[0] === dateStr;
//         } catch { return false; }
//       });
//       const dayMeetings = (meetings || []).filter((meeting) => {
//         try {
//           const meetingDateStr = meeting.scheduled_at || meeting.date || meeting.start_time;
//           if (!meetingDateStr) return false;
//           const meetingDate = new Date(meetingDateStr);
//           if (isNaN(meetingDate.getTime())) return false;
//           return meetingDate.toISOString().split("T")[0] === dateStr;
//         } catch { return false; }
//       });
//       return [
//         ...dayEvents.map((e) => ({ ...e, activityType: "event" })),
//         ...dayTasks.map((t) => ({ ...t, activityType: "task" })),
//         ...dayMeetings.map((m) => ({ ...m, activityType: "meeting" })),
//       ];
//     } catch { return []; }
//   };

//   const openCreateModal = (date) => {
//     setSelectedDate(date);
//     setNewMeeting({
//       ...newMeeting,
//       date: date.toISOString().split("T")[0],
//     });
//     setShowCreateModal(true);
//   };

//   const handleAttendeeToggle = (member) => {
//     setNewMeeting((prev) => {
//       const isSelected = prev.attendees.some((a) => a.id === member.id);
//       if (isSelected) {
//         return { ...prev, attendees: prev.attendees.filter((a) => a.id !== member.id) };
//       } else {
//         return { ...prev, attendees: [...prev.attendees, { id: member.id, name: member.name, type: member.type || member.role }] };
//       }
//     });
//   };

//   const handleCreateMeeting = async () => {
//     if (!newMeeting.title.trim()) return;
    
//     setIsCreating(true);
//     try {
//       const meetingData = {
//         ...newMeeting,
//         scheduled_at: `${newMeeting.date}T${newMeeting.start_time}:00`,
//         attendee_ids: newMeeting.attendees.map((a) => a.id),
//       };
      
//       if (onCreateMeeting) {
//         await onCreateMeeting(meetingData);
//       }
      
//       setShowCreateModal(false);
//       setNewMeeting({
//         title: "",
//         description: "",
//         date: "",
//         start_time: "09:00",
//         end_time: "10:00",
//         location: "",
//         meeting_type: "general",
//         project_id: "",
//         attendees: [],
//       });
//     } catch (error) {
//       console.error("Error creating meeting:", error);
//     } finally {
//       setIsCreating(false);
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

//   // Group team members by type
//   const groupedMembers = {
//     managers: teamMembers.filter((m) => m.type === "manager" || m.role === "Manager"),
//     supervisors: teamMembers.filter((m) => m.type === "supervisor" || m.role === "Supervisor"),
//     siteManagers: teamMembers.filter((m) => m.type === "site_manager" || m.role === "Site Manager"),
//   };

//   return (
//     <div className="flex flex-col h-full">
//       <div className="flex items-center justify-between mb-3">
//         <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
//           <ChevronLeft className="h-5 w-5 text-slate-600" />
//         </button>
//         <span className="text-base font-bold text-slate-900">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
//         <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
//           <ChevronRight className="h-5 w-5 text-slate-600" />
//         </button>
//       </div>

//       <div className="grid grid-cols-7 gap-1 mb-2">
//         {dayNames.map((day, i) => (
//           <div key={i} className="text-center text-xs font-semibold text-slate-500 py-1">{day}</div>
//         ))}
//       </div>

//       <div className="grid grid-cols-7 gap-1 flex-1 min-h-0">
//         {calendarDays.map((day, index) => {
//           if (!day) return <div key={index} className="aspect-square"></div>;
//           const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
//           const activities = getActivitiesForDate(date);
//           const isToday = date.toDateString() === today.toDateString();
//           const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
//           const hasActivities = activities.length > 0;
//           const hasMeetings = activities.some((a) => a.activityType === "meeting");
//           const isPast = date < today && !isToday;

//           return (
//             <button 
//               key={index} 
//               onClick={() => setSelectedDate(date)}
//               onDoubleClick={() => openCreateModal(date)}
//               className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-semibold relative transition-all
//                 ${isToday ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md" : ""}
//                 ${isSelected && !isToday ? "bg-purple-100 text-purple-700 ring-2 ring-purple-400" : ""}
//                 ${!isToday && !isSelected && !isPast ? "hover:bg-slate-100 text-slate-700" : ""}
//                 ${isPast && !isToday && !isSelected ? "text-slate-400" : ""}`}
//             >
//               {day}
//               {hasActivities && (
//                 <div className="absolute bottom-1 flex space-x-0.5">
//                   {hasMeetings && <div className={`w-1.5 h-1.5 rounded-full ${isToday ? "bg-yellow-300" : "bg-yellow-500"}`} />}
//                   {activities.filter((a) => a.activityType !== "meeting").slice(0, 2).map((_, idx) => (
//                     <div key={idx} className={`w-1.5 h-1.5 rounded-full ${isToday ? "bg-white" : "bg-purple-500"}`} />
//                   ))}
//                 </div>
//               )}
//             </button>
//           );
//         })}
//       </div>

//       <div className="mt-3 pt-3 border-t border-slate-200">
//         <div className="flex items-center justify-between mb-2">
//           <span className="text-sm font-semibold text-slate-700">
//             {selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
//           </span>
//           <button 
//             onClick={() => openCreateModal(selectedDate)} 
//             className="flex items-center space-x-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
//           >
//             <Plus className="h-4 w-4" />
//             <span className="text-xs font-semibold">Meeting</span>
//           </button>
//         </div>
//         <div className="space-y-1.5 max-h-32 overflow-y-auto">
//           {selectedActivities.length > 0 ? (
//             selectedActivities.slice(0, 4).map((activity, index) => (
//               <div 
//                 key={index} 
//                 className={`p-2 rounded-lg text-sm flex items-center space-x-2 ${
//                   activity.activityType === "meeting" 
//                     ? "bg-yellow-50 text-yellow-700 border border-yellow-200" 
//                     : activity.activityType === "event" 
//                     ? "bg-purple-50 text-purple-700" 
//                     : "bg-blue-50 text-blue-700"
//                 }`}
//               >
//                 {activity.activityType === "meeting" && <Users className="h-3.5 w-3.5 flex-shrink-0" />}
//                 {activity.activityType === "event" && <Calendar className="h-3.5 w-3.5 flex-shrink-0" />}
//                 {activity.activityType === "task" && <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />}
//                 <div className="font-medium truncate">{safeString(activity.title) || safeString(activity.name) || "Untitled"}</div>
//               </div>
//             ))
//           ) : (
//             <div className="text-sm text-slate-400 text-center py-3">No activities • Double-click date to add meeting</div>
//           )}
//         </div>
//       </div>

//       {/* Create Meeting Modal */}
//       {showCreateModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
//           <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
//             {/* Modal Header */}
//             <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-5">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 bg-white/20 rounded-lg">
//                     <Users className="h-6 w-6" />
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-bold">Schedule Meeting</h3>
//                     <p className="text-purple-200 text-sm">
//                       {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
//                     </p>
//                   </div>
//                 </div>
//                 <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-full hover:bg-white/20 transition-colors">
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>
//             </div>

//             {/* Modal Content */}
//             <div className="p-5 overflow-y-auto max-h-[calc(90vh-180px)]">
//               {/* Meeting Title */}
//               <div className="mb-4">
//                 <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Meeting Title *</label>
//                 <input 
//                   type="text" 
//                   value={newMeeting.title} 
//                   onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })} 
//                   className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
//                   placeholder="e.g., Weekly Project Review" 
//                 />
//               </div>

//               {/* Time & Type Row */}
//               <div className="grid grid-cols-3 gap-3 mb-4">
//                 <div>
//                   <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Start Time</label>
//                   <input 
//                     type="time" 
//                     value={newMeeting.start_time} 
//                     onChange={(e) => setNewMeeting({ ...newMeeting, start_time: e.target.value })} 
//                     className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" 
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-semibold text-slate-700 mb-1.5 block">End Time</label>
//                   <input 
//                     type="time" 
//                     value={newMeeting.end_time} 
//                     onChange={(e) => setNewMeeting({ ...newMeeting, end_time: e.target.value })} 
//                     className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" 
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Type</label>
//                   <select 
//                     value={newMeeting.meeting_type} 
//                     onChange={(e) => setNewMeeting({ ...newMeeting, meeting_type: e.target.value })} 
//                     className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   >
//                     <option value="general">General</option>
//                     <option value="project_review">Project Review</option>
//                     <option value="planning">Planning</option>
//                     <option value="standup">Stand-up</option>
//                     <option value="client">Client Meeting</option>
//                     <option value="urgent">Urgent</option>
//                   </select>
//                 </div>
//               </div>

//               {/* Location */}
//               <div className="mb-4">
//                 <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Location</label>
//                 <input 
//                   type="text" 
//                   value={newMeeting.location} 
//                   onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })} 
//                   className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" 
//                   placeholder="e.g., Conference Room A, Zoom, Site Office" 
//                 />
//               </div>

//               {/* Project (Optional) */}
//               <div className="mb-4">
//                 <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Related Project (Optional)</label>
//                 <select 
//                   value={newMeeting.project_id} 
//                   onChange={(e) => setNewMeeting({ ...newMeeting, project_id: e.target.value })} 
//                   className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 >
//                   <option value="">No specific project</option>
//                   {projects.map((project) => (
//                     <option key={project.id} value={project.id}>
//                       {safeString(project.title) || safeString(project.name)}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Description */}
//               <div className="mb-4">
//                 <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Description / Agenda</label>
//                 <textarea 
//                   value={newMeeting.description} 
//                   onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })} 
//                   className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" 
//                   rows={3}
//                   placeholder="Meeting agenda or notes..." 
//                 />
//               </div>

//               {/* Attendees Section */}
//               <div className="mb-4">
//                 <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center justify-between">
//                   <span>Invite Attendees</span>
//                   {newMeeting.attendees.length > 0 && (
//                     <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
//                       {newMeeting.attendees.length} selected
//                     </span>
//                   )}
//                 </label>
                
//                 <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
//                   {/* Project Managers */}
//                   {groupedMembers.managers.length > 0 && (
//                     <div>
//                       <div className="bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 flex items-center space-x-2 sticky top-0">
//                         <Briefcase className="h-3.5 w-3.5" />
//                         <span>Project Managers ({groupedMembers.managers.length})</span>
//                       </div>
//                       {groupedMembers.managers.map((member) => {
//                         const isSelected = newMeeting.attendees.some((a) => a.id === member.id);
//                         return (
//                           <button
//                             key={member.id}
//                             type="button"
//                             onClick={() => handleAttendeeToggle(member)}
//                             className={`w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors ${isSelected ? "bg-purple-50" : ""}`}
//                           >
//                             <div className="flex items-center space-x-2">
//                               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${isSelected ? "bg-purple-600" : "bg-blue-500"}`}>
//                                 {member.avatar || member.name?.split(" ").map((n) => n[0]).join("").substring(0, 2)}
//                               </div>
//                               <span className="text-sm text-slate-700">{member.name}</span>
//                             </div>
//                             {isSelected && <Check className="h-4 w-4 text-purple-600" />}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {/* Supervisors */}
//                   {groupedMembers.supervisors.length > 0 && (
//                     <div>
//                       <div className="bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 flex items-center space-x-2 sticky top-0">
//                         <HardHat className="h-3.5 w-3.5" />
//                         <span>Supervisors ({groupedMembers.supervisors.length})</span>
//                       </div>
//                       {groupedMembers.supervisors.map((member) => {
//                         const isSelected = newMeeting.attendees.some((a) => a.id === member.id);
//                         return (
//                           <button
//                             key={member.id}
//                             type="button"
//                             onClick={() => handleAttendeeToggle(member)}
//                             className={`w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors ${isSelected ? "bg-purple-50" : ""}`}
//                           >
//                             <div className="flex items-center space-x-2">
//                               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${isSelected ? "bg-purple-600" : "bg-purple-500"}`}>
//                                 {member.avatar || member.name?.split(" ").map((n) => n[0]).join("").substring(0, 2)}
//                               </div>
//                               <span className="text-sm text-slate-700">{member.name}</span>
//                             </div>
//                             {isSelected && <Check className="h-4 w-4 text-purple-600" />}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {/* Site Managers */}
//                   {groupedMembers.siteManagers.length > 0 && (
//                     <div>
//                       <div className="bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 flex items-center space-x-2 sticky top-0">
//                         <Building2 className="h-3.5 w-3.5" />
//                         <span>Site Managers ({groupedMembers.siteManagers.length})</span>
//                       </div>
//                       {groupedMembers.siteManagers.map((member) => {
//                         const isSelected = newMeeting.attendees.some((a) => a.id === member.id);
//                         return (
//                           <button
//                             key={member.id}
//                             type="button"
//                             onClick={() => handleAttendeeToggle(member)}
//                             className={`w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors ${isSelected ? "bg-purple-50" : ""}`}
//                           >
//                             <div className="flex items-center space-x-2">
//                               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${isSelected ? "bg-purple-600" : "bg-amber-500"}`}>
//                                 {member.avatar || member.name?.split(" ").map((n) => n[0]).join("").substring(0, 2)}
//                               </div>
//                               <span className="text-sm text-slate-700">{member.name}</span>
//                             </div>
//                             {isSelected && <Check className="h-4 w-4 text-purple-600" />}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {teamMembers.length === 0 && (
//                     <div className="p-4 text-center text-sm text-slate-400">
//                       No team members available
//                     </div>
//                   )}
//                 </div>

//                 {/* Selected Attendees Preview */}
//                 {newMeeting.attendees.length > 0 && (
//                   <div className="mt-3 flex flex-wrap gap-2">
//                     {newMeeting.attendees.map((attendee) => (
//                       <span 
//                         key={attendee.id} 
//                         className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium"
//                       >
//                         <span>{attendee.name}</span>
//                         <button 
//                           type="button"
//                           onClick={() => handleAttendeeToggle(attendee)}
//                           className="hover:text-purple-900"
//                         >
//                           <X className="h-3 w-3" />
//                         </button>
//                       </span>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Modal Footer */}
//             <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-between">
//               <button 
//                 onClick={() => setShowCreateModal(false)} 
//                 className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button 
//                 onClick={handleCreateMeeting}
//                 disabled={!newMeeting.title.trim() || isCreating}
//                 className="flex items-center space-x-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isCreating ? (
//                   <>
//                     <RefreshCw className="h-4 w-4 animate-spin" />
//                     <span>Creating...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Plus className="h-4 w-4" />
//                     <span>Create Meeting</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ============================================
// // RECENT ACTIVITY FEED - LARGER TEXT
// // ============================================
// const RecentActivityFeed = ({ activities, onItemClick }) => {
//   const getTypeColor = (type) => {
//     const colors = { project: "from-blue-500 to-blue-600", task: "from-green-500 to-green-600", tender: "from-orange-500 to-orange-600" };
//     return colors[type] || "from-slate-500 to-slate-600";
//   };

//   return (
//     <div className="space-y-2.5">
//       {activities.length > 0 ? (
//         activities.map((activity, index) => {
//           const Icon = activity.icon || Activity;
//           const statusConfig = getStatusConfig(activity.status);
//           return (
//             <div 
//               key={activity.id || index} 
//               onClick={() => onItemClick && onItemClick(activity)} 
//               className="p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all group"
//             >
//               <div className="flex items-start space-x-3">
//                 <div className={`p-2 rounded-lg bg-gradient-to-br ${getTypeColor(activity.type)} shadow-sm flex-shrink-0`}>
//                   <Icon className="h-4 w-4 text-white" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center justify-between mb-1">
//                     <h4 className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
//                       {activity.title}
//                     </h4>
//                     <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusConfig.bg} ${statusConfig.text}`}>
//                       {activity.status}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-1.5 text-xs text-slate-500">
//                       <User className="h-3.5 w-3.5" />
//                       <span className="truncate max-w-[100px]">{activity.user}</span>
//                     </div>
//                     <span className="text-xs text-slate-400">{getRelativeTime(activity.date)}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })
//       ) : (
//         <div className="flex items-center justify-center h-32">
//           <p className="text-sm text-slate-400">No recent activity</p>
//         </div>
//       )}
//     </div>
//   );
// };

// // ============================================
// // MEETINGS SECTION COMPONENT
// // ============================================
// const MeetingsSection = ({ meetings = [], teamMembers = [], onMeetingClick }) => {
//   const now = new Date();
  
//   // Filter and sort meetings
//   const upcomingMeetings = meetings
//     .filter((m) => {
//       const meetingDate = new Date(m.scheduled_at || m.date || m.start_time);
//       return meetingDate >= now;
//     })
//     .sort((a, b) => {
//       const dateA = new Date(a.scheduled_at || a.date || a.start_time);
//       const dateB = new Date(b.scheduled_at || b.date || b.start_time);
//       return dateA - dateB;
//     })
//     .slice(0, 6);

//   const todayMeetings = meetings.filter((m) => {
//     const meetingDate = new Date(m.scheduled_at || m.date || m.start_time);
//     return meetingDate.toDateString() === now.toDateString();
//   });

//   const formatMeetingTime = (meeting) => {
//     try {
//       const date = new Date(meeting.scheduled_at || meeting.date || meeting.start_time);
//       return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
//     } catch {
//       return meeting.start_time || "TBD";
//     }
//   };

//   const formatMeetingDate = (meeting) => {
//     try {
//       const date = new Date(meeting.scheduled_at || meeting.date || meeting.start_time);
//       const today = new Date();
//       const tomorrow = new Date(today);
//       tomorrow.setDate(tomorrow.getDate() + 1);

//       if (date.toDateString() === today.toDateString()) return "Today";
//       if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
//       return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
//     } catch {
//       return "TBD";
//     }
//   };

//   const getMeetingTypeColor = (type) => {
//     const colors = {
//       general: "bg-slate-100 text-slate-700",
//       project_review: "bg-blue-100 text-blue-700",
//       planning: "bg-purple-100 text-purple-700",
//       standup: "bg-green-100 text-green-700",
//       client: "bg-amber-100 text-amber-700",
//       urgent: "bg-red-100 text-red-700",
//     };
//     return colors[type] || colors.general;
//   };

//   const getAttendeeNames = (meeting) => {
//     if (meeting.attendees && Array.isArray(meeting.attendees)) {
//       return meeting.attendees.map((a) => safeString(a.name) || safeString(a)).filter(Boolean).slice(0, 3);
//     }
//     if (meeting.attendee_ids && Array.isArray(meeting.attendee_ids)) {
//       return meeting.attendee_ids.map((id) => {
//         const member = teamMembers.find((m) => m.id === id);
//         return member ? safeString(member.name) : null;
//       }).filter(Boolean).slice(0, 3);
//     }
//     return [];
//   };

//   return (
//     <div className="space-y-3">
//       {/* Today's Meetings Summary */}
//       {todayMeetings.length > 0 && (
//         <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-3 mb-3">
//           <div className="flex items-center space-x-2 mb-1">
//             <Clock className="h-4 w-4 text-amber-600" />
//             <span className="text-sm font-semibold text-amber-800">Today's Meetings</span>
//             <span className="text-xs font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">{todayMeetings.length}</span>
//           </div>
//           <p className="text-xs text-amber-700">
//             Next: {todayMeetings[0]?.title || "Untitled"} at {formatMeetingTime(todayMeetings[0])}
//           </p>
//         </div>
//       )}

//       {/* Upcoming Meetings List */}
//       {upcomingMeetings.length > 0 ? (
//         upcomingMeetings.map((meeting, index) => {
//           const attendees = getAttendeeNames(meeting);
//           const isToday = formatMeetingDate(meeting) === "Today";
          
//           return (
//             <div 
//               key={meeting.id || index}
//               onClick={() => onMeetingClick && onMeetingClick(meeting)}
//               className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
//                 isToday 
//                   ? "bg-amber-50 border-amber-200 hover:border-amber-300" 
//                   : "bg-white border-slate-200 hover:border-slate-300"
//               }`}
//             >
//               <div className="flex items-start justify-between mb-2">
//                 <div className="flex-1 min-w-0">
//                   <h4 className="text-sm font-semibold text-slate-900 truncate">
//                     {safeString(meeting.title) || "Untitled Meeting"}
//                   </h4>
//                   <div className="flex items-center space-x-2 mt-1">
//                     <span className={`text-xs font-medium px-2 py-0.5 rounded ${getMeetingTypeColor(meeting.meeting_type || meeting.type)}`}>
//                       {(meeting.meeting_type || meeting.type || "general").replace(/_/g, " ")}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="text-right flex-shrink-0 ml-2">
//                   <div className={`text-xs font-bold ${isToday ? "text-amber-700" : "text-slate-700"}`}>
//                     {formatMeetingDate(meeting)}
//                   </div>
//                   <div className="text-sm font-semibold text-slate-900">
//                     {formatMeetingTime(meeting)}
//                   </div>
//                 </div>
//               </div>

//               {/* Location */}
//               {meeting.location && (
//                 <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-2">
//                   <MapPin className="h-3.5 w-3.5" />
//                   <span className="truncate">{meeting.location}</span>
//                 </div>
//               )}

//               {/* Attendees */}
//               {attendees.length > 0 && (
//                 <div className="flex items-center space-x-2">
//                   <div className="flex -space-x-2">
//                     {attendees.slice(0, 4).map((name, idx) => (
//                       <div 
//                         key={idx}
//                         className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold border-2 border-white"
//                         title={name}
//                       >
//                         {name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
//                       </div>
//                     ))}
//                     {meeting.attendees?.length > 4 && (
//                       <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-[10px] font-bold border-2 border-white">
//                         +{meeting.attendees.length - 4}
//                       </div>
//                     )}
//                   </div>
//                   <span className="text-xs text-slate-500">
//                     {attendees.length} {attendees.length === 1 ? "attendee" : "attendees"}
//                   </span>
//                 </div>
//               )}

//               {/* Related Project */}
//               {meeting.project && (
//                 <div className="flex items-center space-x-1.5 text-xs text-blue-600 mt-2 pt-2 border-t border-slate-100">
//                   <Building2 className="h-3.5 w-3.5" />
//                   <span className="truncate">{safeString(meeting.project?.title || meeting.project?.name || meeting.project)}</span>
//                 </div>
//               )}
//             </div>
//           );
//         })
//       ) : (
//         <div className="flex flex-col items-center justify-center py-8 text-center">
//           <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
//             <Calendar className="h-6 w-6 text-slate-400" />
//           </div>
//           <p className="text-sm text-slate-500">No upcoming meetings</p>
//           <p className="text-xs text-slate-400 mt-1">Click on a date to schedule one</p>
//         </div>
//       )}
//     </div>
//   );
// };

// // ============================================
// // QUICK STAT CARD - LARGER
// // ============================================
// const QuickStatCard = ({ label, value, icon: Icon, color = "blue" }) => {
//   const colorClasses = { 
//     blue: "bg-blue-50 text-blue-600 border-blue-200", 
//     green: "bg-green-50 text-green-600 border-green-200", 
//     red: "bg-red-50 text-red-600 border-red-200" 
//   };

//   return (
//     <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl border ${colorClasses[color]}`}>
//       <Icon className="h-5 w-5" />
//       <div>
//         <div className="text-base font-bold">{value}</div>
//         <div className="text-xs opacity-80">{label}</div>
//       </div>
//     </div>
//   );
// };

// // ============================================
// // MAIN DASHBOARD COMPONENT
// // ============================================
// const AdminDashboard = () => {
//   const currentTime = useCurrentTime();
//   const navigate = useNavigate();
//   const { data, loading, error, lastUpdated, refreshing, refetch } = useDashboardData();

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
//     const saved = localStorage.getItem("sidebar-collapsed");
//     return saved !== null ? JSON.parse(saved) : false;
//   });
//   const [showFullscreen, setShowFullscreen] = useState(false);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [selectedTender, setSelectedTender] = useState(null);
//   const [selectedTask, setSelectedTask] = useState(null);
//   const dashboardRef = React.useRef(null);

//   const handleCollapseChange = (collapsed) => setSidebarCollapsed(collapsed);
  
//   const handleCreateMeeting = async (meetingData) => {
//     try {
//       if (meetingsAPI?.create) {
//         await meetingsAPI.create(meetingData);
//         refetch(); // Refresh data after creating meeting
//       } else {
//         console.log("Meeting created (API not available):", meetingData);
//       }
//     } catch (error) {
//       console.error("Error creating meeting:", error);
//       throw error;
//     }
//   };

//   const handleProjectClick = (project) => setSelectedProject(project);
//   const handleTenderClick = (tender) => setSelectedTender(tender);
//   const handleTaskClick = (task) => setSelectedTask(task);
//   const handleMeetingClick = (meeting) => console.log("Meeting clicked:", meeting);

//   const handleActivityClick = (activity) => {
//     if (activity.type === "project") setSelectedProject(activity.data);
//     else if (activity.type === "task") setSelectedTask(activity.data);
//     else if (activity.type === "tender") setSelectedTender(activity.data);
//   };

//   // Listen for fullscreen changes
//   useEffect(() => {
//     const handleFullscreenChange = () => {
//       const isFullscreen = document.fullscreenElement !== null;
//       setShowFullscreen(isFullscreen);
//       localStorage.setItem("dashboard-fullscreen", isFullscreen.toString());
//       if (isFullscreen) setSidebarOpen(false);
//     };

//     document.addEventListener("fullscreenchange", handleFullscreenChange);
//     document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
//     document.addEventListener("mozfullscreenchange", handleFullscreenChange);
//     document.addEventListener("MSFullscreenChange", handleFullscreenChange);

//     return () => {
//       document.removeEventListener("fullscreenchange", handleFullscreenChange);
//       document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
//       document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
//       document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
//     };
//   }, []);

//   // Keyboard shortcuts for fullscreen
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       // F11 to toggle fullscreen
//       if (e.key === "F11") {
//         e.preventDefault();
//         toggleFullscreen();
//       }
//       // Escape to exit fullscreen (browser handles this, but we catch it too)
//       if (e.key === "Escape" && showFullscreen) {
//         exitFullscreen();
//       }
//     };

//     document.addEventListener("keydown", handleKeyDown);
//     return () => document.removeEventListener("keydown", handleKeyDown);
//   }, [showFullscreen]);

//   // Check initial fullscreen state
//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const shouldBeFullscreen = params.get("fullscreen") === "true" || localStorage.getItem("dashboard-fullscreen") === "true";
//     if (shouldBeFullscreen && dashboardRef.current && !document.fullscreenElement) {
//       // Auto-enter fullscreen if saved preference
//       enterFullscreen();
//     }
//   }, []);

//   const enterFullscreen = async () => {
//     try {
//       const elem = dashboardRef.current;
//       if (elem) {
//         if (elem.requestFullscreen) {
//           await elem.requestFullscreen();
//         } else if (elem.webkitRequestFullscreen) {
//           await elem.webkitRequestFullscreen();
//         } else if (elem.mozRequestFullScreen) {
//           await elem.mozRequestFullScreen();
//         } else if (elem.msRequestFullscreen) {
//           await elem.msRequestFullscreen();
//         }
//       }
//     } catch (err) {
//       console.error("Error entering fullscreen:", err);
//       // Fallback to non-API fullscreen
//       setShowFullscreen(true);
//       localStorage.setItem("dashboard-fullscreen", "true");
//       setSidebarOpen(false);
//     }
//   };

//   const exitFullscreen = async () => {
//     try {
//       if (document.exitFullscreen) {
//         await document.exitFullscreen();
//       } else if (document.webkitExitFullscreen) {
//         await document.webkitExitFullscreen();
//       } else if (document.mozCancelFullScreen) {
//         await document.mozCancelFullScreen();
//       } else if (document.msExitFullscreen) {
//         await document.msExitFullscreen();
//       }
//     } catch (err) {
//       console.error("Error exiting fullscreen:", err);
//       // Fallback
//       setShowFullscreen(false);
//       localStorage.setItem("dashboard-fullscreen", "false");
//     }
//   };

//   const toggleFullscreen = () => {
//     if (showFullscreen || document.fullscreenElement) {
//       exitFullscreen();
//     } else {
//       enterFullscreen();
//     }
//   };

//   if (loading) {
//     return (
//       <div ref={dashboardRef} className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
//         {!showFullscreen && <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onCollapseChange={handleCollapseChange} />}
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
//             <h3 className="text-2xl font-bold text-slate-900 mb-3">Loading Dashboard</h3>
//             <p className="text-base text-slate-600">Fetching all system data...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div ref={dashboardRef} className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
//         {!showFullscreen && <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onCollapseChange={handleCollapseChange} />}
//         <div className="flex-1 flex items-center justify-center p-6">
//           <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md text-center">
//             <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
//             <h3 className="text-2xl font-bold text-slate-900 mb-3">Connection Error</h3>
//             <p className="text-base text-slate-600 mb-8">{error}</p>
//             <button onClick={refetch} className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all text-base font-semibold">
//               Retry Connection
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const latestProjects = data.projects?.slice(0, 10) || [];
//   const latestTenders = data.tenders?.slice(0, 8) || [];

//   return (
//     <div 
//       ref={dashboardRef} 
//       className={`flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden ${showFullscreen ? 'fixed inset-0 z-50' : ''}`}
//     >
//       {!showFullscreen && <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onCollapseChange={handleCollapseChange} />}

//       <div className="flex-1 flex flex-col min-w-0 h-full">
//         {/* Header - Hidden in fullscreen or minimal */}
//         {!showFullscreen ? (
//           <div className="bg-white border-b border-slate-200 py-5 px-8 shadow-sm flex-shrink-0">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-5">
//                 {!showFullscreen && (
//                   <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
//                     <Menu className="h-6 w-6 text-slate-700" />
//                   </button>
//                 )}
//                 <div className="flex items-center space-x-4">
//                   <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
//                     <Building2 className="h-8 w-8 text-white" />
//                   </div>
//                   <div>
//                     <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
//                     <p className="text-base text-slate-600">Complete system overview • All users & data</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-center space-x-8">
//                 <div className="hidden xl:flex items-center space-x-3">
//                   <QuickStatCard label="Total" value={data.statistics?.totalProjects || 0} icon={Layers} color="blue" />
//                   <QuickStatCard label="Active" value={data.statistics?.activeProjects || 0} icon={Activity} color="green" />
//                   <QuickStatCard label="Overdue" value={data.statistics?.overdueTasks || 0} icon={AlertCircle} color="red" />
//                 </div>

//                 <div className="text-right hidden sm:block">
//                   <div className="text-2xl font-bold text-slate-900 tabular-nums">
//                     {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
//                   </div>
//                   <div className="text-sm text-slate-500 font-medium">
//                     {currentTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-4">
//                   <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-emerald-50 rounded-lg">
//                     <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
//                     <span className="text-base font-semibold text-emerald-700">LIVE</span>
//                   </div>
//                   <button onClick={refetch} disabled={refreshing} className="p-3 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors" title="Refresh all data">
//                     <RefreshCw className={`h-6 w-6 text-slate-700 ${refreshing ? "animate-spin" : ""}`} />
//                   </button>
//                   <button onClick={toggleFullscreen} className="p-3 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 transition-colors" title="Enter Fullscreen (F11)">
//                     <Maximize2 className="h-6 w-6" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : (
//           /* Fullscreen floating controls */
//           <div className="absolute top-4 right-4 z-50 flex items-center space-x-3">
//             <div className="flex items-center space-x-3 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200">
//               <div className="flex items-center space-x-2">
//                 <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
//                 <span className="text-sm font-semibold text-emerald-700">LIVE</span>
//               </div>
//               <div className="w-px h-6 bg-slate-300"></div>
//               <div className="text-lg font-bold text-slate-900 tabular-nums">
//                 {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
//               </div>
//               <div className="w-px h-6 bg-slate-300"></div>
//               <button onClick={refetch} disabled={refreshing} className="p-2 rounded-lg hover:bg-slate-100 transition-colors" title="Refresh">
//                 <RefreshCw className={`h-5 w-5 text-slate-700 ${refreshing ? "animate-spin" : ""}`} />
//               </button>
//               <button onClick={toggleFullscreen} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors" title="Exit Fullscreen">
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Main Content - Optimized Grid */}
//         <div className="flex-1 overflow-hidden">
//           <div className={`h-full flex flex-col gap-4 ${showFullscreen ? 'p-4' : 'p-5'}`}>
//             {/* KPI Cards - Larger */}
//             <div className={`grid grid-cols-2 lg:grid-cols-5 gap-4 flex-shrink-0 ${showFullscreen ? 'pt-12' : ''}`}>
//               <ModernKPICard label="Total Projects" value={data.statistics?.totalProjects || 0} icon={Building2} trend={data.trends?.projects || "neutral"} trendValue={`${data.statistics?.activeProjects || 0} active`} colorScheme="primary" subtitle="All users combined" />
//               <ModernKPICard label="Total Budget" value={formatCurrency(data.statistics?.totalBudget || 0)} icon={DollarSign} trend={data.trends?.budget || "neutral"} trendValue={`${data.statistics?.budgetUtilization || 0}% used`} colorScheme="success" subtitle="System-wide" />
//               <ModernKPICard label="Team Members" value={data.statistics?.teamSize || 0} icon={Users} trend={data.trends?.team || "neutral"} trendValue={data.trends?.teamValue || "0 members"} colorScheme="purple" subtitle={`${data.statistics?.managersCount || 0} managers`} />
//               <ModernKPICard label="Task Completion" value={`${data.statistics?.completionRate || 0}%`} icon={Target} trend={data.trends?.completion || "neutral"} trendValue={`${data.statistics?.completedTasks || 0}/${data.statistics?.totalTasks || 0}`} colorScheme="warning" subtitle="All tasks" />
//               <ModernKPICard label="Overdue Items" value={(data.statistics?.overdueTasks || 0) + (data.statistics?.overdueProjects || 0)} icon={AlertCircle} trend={(data.statistics?.overdueTasks || 0) > 0 ? "down" : "up"} trendValue={(data.statistics?.overdueTasks || 0) > 0 ? "Needs attention" : "On track"} colorScheme="danger" subtitle={`${data.statistics?.overdueTasks || 0} tasks`} />
//             </div>

//             {/* Main Grid - Fixed Layout to Fill Space */}
//             <div className="flex-1 grid grid-cols-1 lg:grid-cols-6 gap-4 min-h-0 overflow-hidden">
//               {/* Left Column - Charts & Projects */}
//               <div className="lg:col-span-4 flex flex-col gap-4 min-h-0 overflow-hidden">
//                 {/* Top Row - Charts */}
//                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-shrink-0">
//                   {/* Project Status Chart */}
//                   <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
//                     <div className="flex items-center justify-between mb-4">
//                       <h3 className="text-base font-bold text-slate-900">Project Status</h3>
//                       <span className="text-sm text-slate-500">{data.statistics?.totalProjects || 0} total</span>
//                     </div>
//                     <div className="h-44">
//                       {data.chartData?.statusData?.length > 0 ? (
//                         <ResponsiveContainer width="100%" height="100%">
//                           <PieChart>
//                             <Pie data={data.chartData.statusData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
//                               {data.chartData.statusData.map((entry, index) => (
//                                 <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
//                               ))}
//                             </Pie>
//                             <Tooltip />
//                             <Legend wrapperStyle={{ fontSize: "12px" }} />
//                           </PieChart>
//                         </ResponsiveContainer>
//                       ) : (
//                         <div className="flex items-center justify-center h-full">
//                           <p className="text-sm text-slate-400">No project data</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Task Status Chart */}
//                   <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
//                     <div className="flex items-center justify-between mb-4">
//                       <h3 className="text-base font-bold text-slate-900">Task Status</h3>
//                       <span className="text-sm text-slate-500">{data.statistics?.totalTasks || 0} total</span>
//                     </div>
//                     <div className="h-44">
//                       {data.chartData?.taskStatusData?.length > 0 ? (
//                         <ResponsiveContainer width="100%" height="100%">
//                           <PieChart>
//                             <Pie data={data.chartData.taskStatusData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
//                               {data.chartData.taskStatusData.map((entry, index) => (
//                                 <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
//                               ))}
//                             </Pie>
//                             <Tooltip />
//                             <Legend wrapperStyle={{ fontSize: "12px" }} />
//                           </PieChart>
//                         </ResponsiveContainer>
//                       ) : (
//                         <div className="flex items-center justify-center h-full">
//                           <p className="text-sm text-slate-400">No task data</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Monthly Trend */}
//                   <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
//                     <div className="flex items-center justify-between mb-4">
//                       <h3 className="text-base font-bold text-slate-900">Monthly Trend</h3>
//                       <TrendingUp className="h-5 w-5 text-slate-400" />
//                     </div>
//                     <div className="h-44">
//                       {data.chartData?.monthlyTrend?.length > 0 ? (
//                         <ResponsiveContainer width="100%" height="100%">
//                           <AreaChart data={data.chartData.monthlyTrend}>
//                             <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
//                             <XAxis dataKey="name" fontSize={11} />
//                             <YAxis fontSize={11} />
//                             <Tooltip />
//                             <Area type="monotone" dataKey="projects" stackId="1" stroke={CHART_COLORS.primary[0]} fill={CHART_COLORS.primary[0]} fillOpacity={0.6} />
//                             <Area type="monotone" dataKey="tasks" stackId="2" stroke={CHART_COLORS.success[0]} fill={CHART_COLORS.success[0]} fillOpacity={0.6} />
//                           </AreaChart>
//                         </ResponsiveContainer>
//                       ) : (
//                         <div className="flex items-center justify-center h-full">
//                           <p className="text-sm text-slate-400">No trend data</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Bottom Row - Projects, Tenders, Managers */}
//                 <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0 overflow-hidden">
//                   {/* Latest Projects */}
//                   <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col min-h-0">
//                     <div className="flex items-center justify-between mb-4 flex-shrink-0">
//                       <div className="flex items-center space-x-2">
//                         <PlayCircle className="h-5 w-5 text-blue-600" />
//                         <h3 className="text-base font-bold text-slate-900">Latest Projects</h3>
//                       </div>
//                       <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">{data.statistics?.totalProjects || 0}</span>
//                     </div>
//                     <div className="flex-1 overflow-y-auto space-y-2.5">
//                       {latestProjects.length > 0 ? (
//                         latestProjects.slice(0, 8).map((project, index) => {
//                           const statusConfig = getStatusConfig(project.status);
//                           return (
//                             <div key={project.id || index} className="p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group" onClick={() => handleProjectClick(project)}>
//                               <div className="flex justify-between items-start mb-2">
//                                 <h4 className="text-sm font-semibold text-slate-900 truncate flex-1 group-hover:text-blue-600">{safeString(project.title) || safeString(project.name) || "Untitled"}</h4>
//                                 <div className="flex items-center space-x-2 ml-2">
//                                   <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusConfig.bg} ${statusConfig.text}`}>{project.status}</span>
//                                   <span className="text-sm font-bold text-blue-600">{Math.round(project.progress_percentage || project.progress || 0)}%</span>
//                                 </div>
//                               </div>
//                               <div className="flex items-center justify-between mb-2">
//                                 <div className="flex items-center space-x-1.5">
//                                   <User className="h-3.5 w-3.5 text-slate-400" />
//                                   <span className="text-xs text-slate-500 truncate">{getProjectAssignee(project, data.rawManagers || data.managers)}</span>
//                                 </div>
//                                 <span className="text-xs text-slate-400">{getRelativeTime(project.created_at)}</span>
//                               </div>
//                               <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
//                                 <div className="h-full bg-blue-500 rounded-full" style={{ width: `${project.progress_percentage || project.progress || 0}%` }} />
//                               </div>
//                             </div>
//                           );
//                         })
//                       ) : (
//                         <div className="flex-1 flex items-center justify-center">
//                           <p className="text-sm text-slate-400">No projects</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Latest Tenders */}
//                   <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col min-h-0">
//                     <div className="flex items-center justify-between mb-4 flex-shrink-0">
//                       <div className="flex items-center space-x-2">
//                         <FileText className="h-5 w-5 text-orange-600" />
//                         <h3 className="text-base font-bold text-slate-900">Latest Tenders</h3>
//                       </div>
//                       <span className="text-sm font-bold text-orange-700 bg-orange-50 px-3 py-1 rounded-lg">{data.statistics?.totalTenders || 0}</span>
//                     </div>
//                     <div className="flex-1 overflow-y-auto space-y-2.5">
//                       {latestTenders.length > 0 ? (
//                         latestTenders.slice(0, 6).map((tender, index) => {
//                           const statusConfig = getStatusConfig(tender.status);
//                           return (
//                             <div key={tender.id || index} className="p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-all group" onClick={() => handleTenderClick(tender)}>
//                               <div className="flex justify-between items-start mb-1.5">
//                                 <h4 className="text-sm font-semibold text-slate-900 truncate flex-1 group-hover:text-orange-600">{safeString(tender.title) || safeString(tender.name) || "Untitled Tender"}</h4>
//                                 <span className={`text-xs font-medium px-2 py-0.5 rounded ml-2 ${statusConfig.bg} ${statusConfig.text}`}>{tender.status}</span>
//                               </div>
//                               <div className="flex items-center justify-between">
//                                 <span className="text-sm font-bold text-emerald-600">{formatCurrency(tender.budget_estimate || tender.value || tender.amount)}</span>
//                                 <span className="text-xs text-slate-500 flex items-center space-x-1">
//                                   <Clock className="h-3.5 w-3.5" />
//                                   <span>{formatDate(tender.deadline || tender.submission_deadline)}</span>
//                                 </span>
//                               </div>
//                             </div>
//                           );
//                         })
//                       ) : (
//                         <div className="flex-1 flex items-center justify-center">
//                           <p className="text-sm text-slate-400">No tenders</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Top Managers & Supervisors Combined */}
//                   <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col min-h-0">
//                     <div className="flex items-center justify-between mb-4 flex-shrink-0">
//                       <div className="flex items-center space-x-2">
//                         <Crown className="h-5 w-5 text-amber-500" />
//                         <h3 className="text-base font-bold text-slate-900">Top Performers</h3>
//                       </div>
//                     </div>
//                     <div className="flex-1 overflow-y-auto space-y-2.5">
//                       {/* Managers */}
//                       <div className="mb-3">
//                         <div className="flex items-center space-x-2 mb-2">
//                           <Briefcase className="h-4 w-4 text-blue-600" />
//                           <span className="text-xs font-semibold text-slate-500 uppercase">Managers</span>
//                         </div>
//                         {(data.chartData?.topManagers || []).length > 0 ? (
//                           data.chartData.topManagers.slice(0, 3).map((manager, index) => (
//                             <div key={manager.id || index} className="p-2.5 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition-all mb-2" onClick={() => navigate(`/admin/project-manager/${manager.id}`)}>
//                               <div className="flex items-center space-x-2">
//                                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">{manager.avatar}</div>
//                                 <div className="flex-1 min-w-0">
//                                   <p className="text-sm font-semibold text-slate-900 truncate">{manager.name}</p>
//                                   <p className="text-xs text-blue-600 font-medium">{Math.round(manager.performance)}% • {manager.projectsCount} projects</p>
//                                 </div>
//                               </div>
//                             </div>
//                           ))
//                         ) : (
//                           <p className="text-xs text-slate-400 text-center py-2">No managers</p>
//                         )}
//                       </div>

//                       {/* Supervisors */}
//                       <div>
//                         <div className="flex items-center space-x-2 mb-2">
//                           <HardHat className="h-4 w-4 text-purple-600" />
//                           <span className="text-xs font-semibold text-slate-500 uppercase">Supervisors</span>
//                         </div>
//                         {(data.chartData?.topSupervisors || []).length > 0 ? (
//                           data.chartData.topSupervisors.slice(0, 3).map((supervisor, index) => (
//                             <div key={supervisor.id || index} className="p-2.5 bg-purple-50 rounded-xl cursor-pointer hover:bg-purple-100 transition-all mb-2" onClick={() => navigate(`/admin/supervisor/${supervisor.id}`)}>
//                               <div className="flex items-center space-x-2">
//                                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">{supervisor.avatar}</div>
//                                 <div className="flex-1 min-w-0">
//                                   <p className="text-sm font-semibold text-slate-900 truncate">{supervisor.name}</p>
//                                   <p className="text-xs text-purple-600 font-medium">{Math.round(supervisor.performance)}% • {supervisor.projectsCount} projects</p>
//                                 </div>
//                               </div>
//                             </div>
//                           ))
//                         ) : (
//                           <p className="text-xs text-slate-400 text-center py-2">No supervisors</p>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Right Column - Calendar, Meetings & Activity */}
//               <div className="lg:col-span-2 flex flex-col gap-4 min-h-0 overflow-hidden">
//                 {/* Calendar */}
//                 <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col" style={{ minHeight: "320px" }}>
//                   <div className="flex items-center space-x-2 mb-3 flex-shrink-0">
//                     <Calendar className="h-5 w-5 text-purple-600" />
//                     <h3 className="text-base font-bold text-slate-900">Calendar</h3>
//                   </div>
//                   <div className="flex-1 min-h-0">
//                     <EnhancedCalendar 
//                       events={data.events} 
//                       tasks={data.tasks} 
//                       meetings={data.meetings}
//                       onCreateMeeting={handleCreateMeeting} 
//                       teamMembers={data.allTeamMembers || []}
//                       projects={data.projects || []}
//                     />
//                   </div>
//                 </div>

//                 {/* Meetings Section */}
//                 <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col min-h-0" style={{ minHeight: "280px" }}>
//                   <div className="flex items-center justify-between mb-4 flex-shrink-0">
//                     <div className="flex items-center space-x-2">
//                       <Users className="h-5 w-5 text-amber-600" />
//                       <h3 className="text-base font-bold text-slate-900">Upcoming Meetings</h3>
//                     </div>
//                     <span className="text-sm font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg">
//                       {data.statistics?.upcomingMeetings || 0}
//                     </span>
//                   </div>
//                   <div className="flex-1 overflow-y-auto">
//                     <MeetingsSection 
//                       meetings={data.meetings || []} 
//                       teamMembers={data.allTeamMembers || []}
//                       onMeetingClick={handleMeetingClick}
//                     />
//                   </div>
//                 </div>

//                 {/* Recent Activity */}
//                 <div className="flex-1 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col min-h-0">
//                   <div className="flex items-center justify-between mb-4 flex-shrink-0">
//                     <div className="flex items-center space-x-2">
//                       <Activity className="h-5 w-5 text-indigo-600" />
//                       <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
//                     </div>
//                     <span className="text-xs text-slate-500">Click for details</span>
//                   </div>
//                   <div className="flex-1 overflow-y-auto">
//                     <RecentActivityFeed activities={data.recentActivity || []} onItemClick={handleActivityClick} />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer - Hidden in fullscreen */}
//         {!showFullscreen && (
//           <div className="bg-white border-t border-slate-200 py-4 px-8 flex-shrink-0">
//             <div className="flex flex-col sm:flex-row items-center justify-between text-base text-slate-600 gap-2">
//               <div className="flex items-center space-x-5">
//                 <span className="font-semibold">© 2025 Ujenzi & Paints</span>
//                 <span className="hidden sm:inline">•</span>
//                 <span className="hidden sm:inline text-sm">Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "Never"}</span>
//                 <span className="hidden sm:inline">•</span>
//                 <span className="hidden sm:inline text-sm text-emerald-600 font-medium">Showing ALL system data</span>
//               </div>
//               <div className="flex items-center space-x-5 text-sm">
//                 <span>Projects: <strong>{data.statistics?.totalProjects || 0}</strong></span>
//                 <span>•</span>
//                 <span>Tasks: <strong>{data.statistics?.totalTasks || 0}</strong></span>
//                 <span>•</span>
//                 <span>Team: <strong>{data.statistics?.teamSize || 0}</strong></span>
//                 <span>•</span>
//                 <span>Tenders: <strong>{data.statistics?.totalTenders || 0}</strong></span>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* POPUP MODALS - Buttons removed */}
//       {selectedProject && (
//         <ProjectDetailModal 
//           project={selectedProject} 
//           managers={data.rawManagers || data.managers} 
//           onClose={() => setSelectedProject(null)} 
//         />
//       )}
//       {selectedTender && (
//         <TenderDetailModal 
//           tender={selectedTender} 
//           onClose={() => setSelectedTender(null)} 
//         />
//       )}
//       {selectedTask && (
//         <TaskDetailModal 
//           task={selectedTask} 
//           onClose={() => setSelectedTask(null)} 
//         />
//       )}
//     </div>
//   );
// };

// export default AdminDashboard;






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
//   Area,
//   AreaChart,
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
//   TrendingUp,
//   Activity,
//   Layers,
//   CheckCircle2,
//   AlertCircle,
//   Timer,
//   MapPin,
//   Phone,
//   Mail,
//   ExternalLink,
//   Edit,
//   Download,
//   Eye,
//   Paperclip,
//   CalendarDays,
//   CircleDollarSign,
//   ClipboardList,
//   Building,
//   Tag,
//   Hash,
//   FileCheck,
//   Award,
//   Banknote,
//   Receipt,
//   Info,
//   Maximize2,
//   Minimize2,
//   Video,
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
//   meetingsAPI,
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

// // Helper function to extract array from API response - matches your meetings component
// const extractArray = (res, key) => {
//   if (!res) return [];
//   // Handle direct array
//   if (Array.isArray(res)) return res;
//   // Handle { data: [...] } - direct array in data
//   if (Array.isArray(res.data)) return res.data;
//   // Handle { data: { key: [...] } } - nested under key in data
//   if (key && res.data && Array.isArray(res.data[key])) return res.data[key];
//   // Handle { key: [...] } - direct key at root
//   if (key && Array.isArray(res[key])) return res[key];
//   // Handle axios response { data: { data: [...] } }
//   if (res.data && res.data.data && Array.isArray(res.data.data)) return res.data.data;
//   // Handle axios response { data: { data: { key: [...] } } }
//   if (key && res.data && res.data.data && Array.isArray(res.data.data[key])) return res.data.data[key];
//   return [];
// };

// // Utility Functions - UPDATED FOR TZS (Tanzanian Shillings)
// const formatCurrency = (amount) => {
//   if (!amount) return "TZS 0";
//   const num = parseFloat(amount);
//   if (num >= 1000000000) return `TZS ${(num / 1000000000).toFixed(1)}B`;
//   if (num >= 1000000) return `TZS ${(num / 1000000).toFixed(1)}M`;
//   if (num >= 1000) return `TZS ${(num / 1000).toFixed(0)}K`;
//   return `TZS ${num.toLocaleString()}`;
// };

// const formatCurrencyFull = (amount) => {
//   if (!amount) return "TZS 0.00";
//   const num = parseFloat(amount);
//   return `TZS ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// };

// const formatDate = (dateString) => {
//   if (!dateString) return "No date";
//   try {
//     return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
//   } catch {
//     return "Invalid";
//   }
// };

// const formatDateFull = (dateString) => {
//   if (!dateString) return "Not set";
//   try {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       weekday: "long",
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   } catch {
//     return "Invalid";
//   }
// };

// const getRelativeTime = (dateString) => {
//   if (!dateString) return "";
//   try {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffMs = now - date;
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMs / 3600000);
//     const diffDays = Math.floor(diffMs / 86400000);
//     if (diffMins < 1) return "Just now";
//     if (diffMins < 60) return `${diffMins}m ago`;
//     if (diffHours < 24) return `${diffHours}h ago`;
//     if (diffDays < 7) return `${diffDays}d ago`;
//     return formatDate(dateString);
//   } catch {
//     return "";
//   }
// };

// const getDaysRemaining = (dateString) => {
//   if (!dateString) return null;
//   try {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffMs = date - now;
//     return Math.ceil(diffMs / 86400000);
//   } catch {
//     return null;
//   }
// };

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

// const getProjectAssignee = (project, managers = []) => {
//   const fieldsToCheck = [
//     project.project_manager,
//     project.manager,
//     project.created_by,
//     project.creator,
//     project.owner,
//     project.assigned_to,
//   ];
//   for (const field of fieldsToCheck) {
//     const name = safeString(field);
//     if (name && name.trim()) return name;
//   }
//   if (project.project_manager_id && managers.length > 0) {
//     const manager = managers.find((m) => m.id === project.project_manager_id);
//     if (manager && manager.name) return safeString(manager.name);
//   }
//   if (project.manager_id && managers.length > 0) {
//     const manager = managers.find((m) => m.id === project.manager_id);
//     if (manager && manager.name) return safeString(manager.name);
//   }
//   return "Unassigned";
// };

// const sortByDateDesc = (items, dateField = "created_at") => {
//   return [...items].sort((a, b) => {
//     const dateA = new Date(a[dateField] || a.updated_at || a.created_at || 0);
//     const dateB = new Date(b[dateField] || b.updated_at || b.created_at || 0);
//     return dateB - dateA;
//   });
// };

// const getStatusConfig = (status) => {
//   const configs = {
//     active: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
//     in_progress: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
//     completed: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
//     pending: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
//     planning: { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
//     on_hold: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
//     paused: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
//     cancelled: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
//     overdue: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
//     open: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
//     closed: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500" },
//     awarded: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
//     draft: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
//     scheduled: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
//     upcoming: { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
//   };
//   return configs[status] || { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500" };
// };

// // ============================================
// // PROJECT DETAIL POPUP MODAL
// // ============================================
// const ProjectDetailModal = ({ project, managers, onClose }) => {
//   if (!project) return null;
//   const statusConfig = getStatusConfig(project.status);
//   const progress = parseFloat(project.progress_percentage || project.progress || 0);
//   const budget = parseFloat(project.budget || 0);
//   const spent = parseFloat(project.spent || project.actual_cost || 0);
//   const budgetUsed = budget > 0 ? Math.round((spent / budget) * 100) : 0;
//   const daysRemaining = getDaysRemaining(project.end_date || project.deadline);

//   const calculateExpectedProgress = () => {
//     const startDate = project.start_date ? new Date(project.start_date) : null;
//     const endDate = project.end_date || project.deadline ? new Date(project.end_date || project.deadline) : null;
//     if (!startDate || !endDate) return null;
//     const now = new Date();
//     const totalDuration = endDate.getTime() - startDate.getTime();
//     const elapsed = now.getTime() - startDate.getTime();
//     if (totalDuration <= 0) return null;
//     if (elapsed < 0) return 0;
//     if (elapsed > totalDuration) return 100;
//     return Math.round((elapsed / totalDuration) * 100);
//   };

//   const expectedProgress = calculateExpectedProgress();
//   const progressDifference = expectedProgress !== null ? progress - expectedProgress : null;

//   const getProgressStatus = () => {
//     if (progressDifference === null) return { status: "unknown", color: "slate", label: "Timeline not set" };
//     if (progressDifference >= 10) return { status: "ahead", color: "emerald", label: `${Math.abs(progressDifference).toFixed(0)}% ahead of schedule` };
//     if (progressDifference >= 0) return { status: "on-track", color: "blue", label: "On track" };
//     if (progressDifference >= -10) return { status: "slightly-behind", color: "amber", label: `${Math.abs(progressDifference).toFixed(0)}% behind schedule` };
//     return { status: "behind", color: "red", label: `${Math.abs(progressDifference).toFixed(0)}% behind schedule` };
//   };

//   const progressStatus = getProgressStatus();

//   return (
//     <div 
//       className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
//       onClick={onClose}
//     >
//       <div
//         className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
//           >
//             <X className="h-5 w-5" />
//           </button>
//           <div className="flex items-start space-x-4">
//             <div className="p-3 bg-white/20 rounded-xl">
//               <Building2 className="h-8 w-8" />
//             </div>
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center space-x-2 mb-1">
//                 <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
//                   {project.status?.replace(/_/g, " ").toUpperCase()}
//                 </span>
//                 {project.priority && (
//                   <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">
//                     {project.priority} Priority
//                   </span>
//                 )}
//               </div>
//               <h2 className="text-xl font-bold truncate">
//                 {safeString(project.title) || safeString(project.name) || "Untitled Project"}
//               </h2>
//               <p className="text-blue-100 text-sm mt-1">
//                 ID: #{project.id} • Created {getRelativeTime(project.created_at)}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
//           <div className="mb-6">
//             {progressStatus.status !== "unknown" && (
//               <div className={`mb-4 p-3 rounded-xl flex items-center justify-between ${
//                 progressStatus.color === "emerald" ? "bg-emerald-50 border border-emerald-200" :
//                 progressStatus.color === "blue" ? "bg-blue-50 border border-blue-200" :
//                 progressStatus.color === "amber" ? "bg-amber-50 border border-amber-200" :
//                 "bg-red-50 border border-red-200"
//               }`}>
//                 <div className="flex items-center space-x-2">
//                   {progressStatus.status === "ahead" && <ArrowUpRight className="h-5 w-5 text-emerald-600" />}
//                   {progressStatus.status === "on-track" && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
//                   {progressStatus.status === "slightly-behind" && <AlertCircle className="h-5 w-5 text-amber-600" />}
//                   {progressStatus.status === "behind" && <AlertTriangle className="h-5 w-5 text-red-600" />}
//                   <span className={`text-sm font-semibold ${
//                     progressStatus.color === "emerald" ? "text-emerald-700" :
//                     progressStatus.color === "blue" ? "text-blue-700" :
//                     progressStatus.color === "amber" ? "text-amber-700" :
//                     "text-red-700"
//                   }`}>
//                     {progressStatus.label}
//                   </span>
//                 </div>
//                 {progressDifference !== null && (
//                   <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
//                     progressStatus.color === "emerald" ? "bg-emerald-100 text-emerald-700" :
//                     progressStatus.color === "blue" ? "bg-blue-100 text-blue-700" :
//                     progressStatus.color === "amber" ? "bg-amber-100 text-amber-700" :
//                     "bg-red-100 text-red-700"
//                   }`}>
//                     {progressDifference >= 0 ? "+" : ""}{progressDifference.toFixed(0)}%
//                   </span>
//                 )}
//               </div>
//             )}

//             <div className="mb-4">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm font-semibold text-slate-700">Current Progress</span>
//                 <span className="text-lg font-bold text-blue-600">{progress.toFixed(0)}%</span>
//               </div>
//               <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden relative">
//                 <div
//                   className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
//                   style={{ width: `${Math.min(progress, 100)}%` }}
//                 />
//                 {expectedProgress !== null && (
//                   <div 
//                     className="absolute top-0 h-full w-1 bg-slate-800 opacity-60"
//                     style={{ left: `${Math.min(expectedProgress, 100)}%`, transform: 'translateX(-50%)' }}
//                     title={`Expected: ${expectedProgress}%`}
//                   >
//                     <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-slate-800"></div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {expectedProgress !== null && (
//               <div className="mb-4">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-sm font-semibold text-slate-700">Expected Progress</span>
//                   <span className="text-lg font-bold text-slate-500">{expectedProgress}%</span>
//                 </div>
//                 <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
//                   <div
//                     className="h-full bg-gradient-to-r from-slate-400 to-slate-500 rounded-full transition-all duration-500"
//                     style={{ width: `${Math.min(expectedProgress, 100)}%` }}
//                   />
//                 </div>
//               </div>
//             )}

//             {expectedProgress !== null && (
//               <div className="flex items-center justify-center space-x-6 mt-3 pt-3 border-t border-slate-100">
//                 <div className="flex items-center space-x-2">
//                   <div className="w-4 h-3 rounded bg-gradient-to-r from-blue-500 to-blue-600"></div>
//                   <span className="text-xs text-slate-600">Current: {progress.toFixed(0)}%</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <div className="w-4 h-3 rounded bg-gradient-to-r from-slate-400 to-slate-500"></div>
//                   <span className="text-xs text-slate-600">Expected: {expectedProgress}%</span>
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//             <div className="bg-slate-50 rounded-xl p-4">
//               <div className="flex items-center space-x-2 text-slate-500 mb-1">
//                 <CircleDollarSign className="h-4 w-4" />
//                 <span className="text-xs font-medium">Budget</span>
//               </div>
//               <div className="text-lg font-bold text-slate-900">{formatCurrency(budget)}</div>
//             </div>
//             <div className="bg-slate-50 rounded-xl p-4">
//               <div className="flex items-center space-x-2 text-slate-500 mb-1">
//                 <Receipt className="h-4 w-4" />
//                 <span className="text-xs font-medium">Spent</span>
//               </div>
//               <div className="text-lg font-bold text-slate-900">{formatCurrency(spent)}</div>
//               <div className="text-xs text-slate-500">{budgetUsed}% of budget</div>
//             </div>
//             <div className="bg-slate-50 rounded-xl p-4">
//               <div className="flex items-center space-x-2 text-slate-500 mb-1">
//                 <CalendarDays className="h-4 w-4" />
//                 <span className="text-xs font-medium">Start Date</span>
//               </div>
//               <div className="text-sm font-bold text-slate-900">{formatDate(project.start_date)}</div>
//             </div>
//             <div className="bg-slate-50 rounded-xl p-4">
//               <div className="flex items-center space-x-2 text-slate-500 mb-1">
//                 <Timer className="h-4 w-4" />
//                 <span className="text-xs font-medium">End Date</span>
//               </div>
//               <div className="text-sm font-bold text-slate-900">{formatDate(project.end_date || project.deadline)}</div>
//               {daysRemaining !== null && (
//                 <div className={`text-xs ${daysRemaining < 0 ? "text-red-500" : daysRemaining < 7 ? "text-orange-500" : "text-green-500"}`}>
//                   {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
//                 </div>
//               )}
//             </div>
//           </div>

//           {project.description && (
//             <div className="mb-6">
//               <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
//                 <Info className="h-4 w-4 mr-2" />
//                 Description
//               </h3>
//               <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4">{project.description}</p>
//             </div>
//           )}

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//             <div>
//               <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
//                 <Users className="h-4 w-4 mr-2" />
//                 Team
//               </h3>
//               <div className="space-y-3">
//                 <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
//                     {getProjectAssignee(project, managers).split(" ").map((n) => n[0]).join("").substring(0, 2)}
//                   </div>
//                   <div>
//                     <div className="text-sm font-semibold text-slate-900">{getProjectAssignee(project, managers)}</div>
//                     <div className="text-xs text-slate-500">Project Manager</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div>
//               <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
//                 <ClipboardList className="h-4 w-4 mr-2" />
//                 Details
//               </h3>
//               <div className="space-y-2">
//                 {project.location && (
//                   <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
//                     <MapPin className="h-4 w-4 text-slate-400" />
//                     <span className="text-sm text-slate-700">{safeString(project.location)}</span>
//                   </div>
//                 )}
//                 {project.client && (
//                   <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
//                     <Building className="h-4 w-4 text-slate-400" />
//                     <span className="text-sm text-slate-700">Client: {safeString(project.client)}</span>
//                   </div>
//                 )}
//                 <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
//                   <Clock className="h-4 w-4 text-slate-400" />
//                   <span className="text-sm text-slate-700">Updated {getRelativeTime(project.updated_at)}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-center">
//           <button
//             onClick={onClose}
//             className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============================================
// // TENDER DETAIL POPUP MODAL
// // ============================================
// const TenderDetailModal = ({ tender, onClose }) => {
//   if (!tender) return null;
//   const statusConfig = getStatusConfig(tender.status);
//   const budget = parseFloat(tender.budget_estimate || tender.value || tender.amount || 0);
//   const daysRemaining = getDaysRemaining(tender.deadline || tender.submission_deadline);

//   return (
//     <div 
//       className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
//       onClick={onClose}
//     >
//       <div
//         className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
//           >
//             <X className="h-5 w-5" />
//           </button>
//           <div className="flex items-start space-x-4">
//             <div className="p-3 bg-white/20 rounded-xl">
//               <FileText className="h-8 w-8" />
//             </div>
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center space-x-2 mb-1">
//                 <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
//                   {tender.status?.replace(/_/g, " ").toUpperCase()}
//                 </span>
//               </div>
//               <h2 className="text-xl font-bold truncate">
//                 {safeString(tender.title) || safeString(tender.name) || "Untitled Tender"}
//               </h2>
//               <p className="text-orange-100 text-sm mt-1">
//                 ID: #{tender.id} • Created {getRelativeTime(tender.created_at)}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
//           {daysRemaining !== null && (
//             <div
//               className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
//                 daysRemaining < 0
//                   ? "bg-red-50 border border-red-200"
//                   : daysRemaining < 7
//                   ? "bg-orange-50 border border-orange-200"
//                   : "bg-green-50 border border-green-200"
//               }`}
//             >
//               <Timer
//                 className={`h-5 w-5 ${
//                   daysRemaining < 0 ? "text-red-500" : daysRemaining < 7 ? "text-orange-500" : "text-green-500"
//                 }`}
//               />
//               <div>
//                 <div
//                   className={`text-sm font-semibold ${
//                     daysRemaining < 0 ? "text-red-700" : daysRemaining < 7 ? "text-orange-700" : "text-green-700"
//                   }`}
//                 >
//                   {daysRemaining < 0
//                     ? `Deadline passed ${Math.abs(daysRemaining)} days ago`
//                     : daysRemaining === 0
//                     ? "Deadline is today!"
//                     : `${daysRemaining} days until deadline`}
//                 </div>
//                 <div className="text-xs text-slate-600">
//                   {formatDateFull(tender.deadline || tender.submission_deadline)}
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
//             <div className="bg-slate-50 rounded-xl p-4">
//               <div className="flex items-center space-x-2 text-slate-500 mb-1">
//                 <Banknote className="h-4 w-4" />
//                 <span className="text-xs font-medium">Budget Estimate</span>
//               </div>
//               <div className="text-lg font-bold text-emerald-600">{formatCurrencyFull(budget)}</div>
//             </div>
//             <div className="bg-slate-50 rounded-xl p-4">
//               <div className="flex items-center space-x-2 text-slate-500 mb-1">
//                 <CalendarDays className="h-4 w-4" />
//                 <span className="text-xs font-medium">Deadline</span>
//               </div>
//               <div className="text-sm font-bold text-slate-900">
//                 {formatDate(tender.deadline || tender.submission_deadline)}
//               </div>
//             </div>
//             <div className="bg-slate-50 rounded-xl p-4">
//               <div className="flex items-center space-x-2 text-slate-500 mb-1">
//                 <FileCheck className="h-4 w-4" />
//                 <span className="text-xs font-medium">Submissions</span>
//               </div>
//               <div className="text-lg font-bold text-slate-900">{tender.submissions_count || tender.bids_count || 0}</div>
//             </div>
//           </div>

//           {tender.description && (
//             <div className="mb-6">
//               <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
//                 <Info className="h-4 w-4 mr-2" />
//                 Description
//               </h3>
//               <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4">{tender.description}</p>
//             </div>
//           )}
//         </div>

//         <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-center">
//           <button
//             onClick={onClose}
//             className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============================================
// // TASK DETAIL POPUP MODAL
// // ============================================
// const TaskDetailModal = ({ task, onClose }) => {
//   if (!task) return null;
//   const statusConfig = getStatusConfig(task.status);
//   const daysRemaining = getDaysRemaining(task.due_date || task.deadline);

//   return (
//     <div 
//       className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
//       onClick={onClose}
//     >
//       <div
//         className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl transform transition-all"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="relative bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
//           >
//             <X className="h-5 w-5" />
//           </button>
//           <div className="flex items-start space-x-4">
//             <div className="p-3 bg-white/20 rounded-xl">
//               <CheckCircle2 className="h-8 w-8" />
//             </div>
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center space-x-2 mb-1">
//                 <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
//                   {task.status?.replace(/_/g, " ").toUpperCase()}
//                 </span>
//               </div>
//               <h2 className="text-xl font-bold truncate">
//                 {safeString(task.title) || safeString(task.name) || "Untitled Task"}
//               </h2>
//               <p className="text-green-100 text-sm mt-1">
//                 ID: #{task.id} • Created {getRelativeTime(task.created_at)}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
//           {daysRemaining !== null && (
//             <div
//               className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
//                 daysRemaining < 0
//                   ? "bg-red-50 border border-red-200"
//                   : daysRemaining < 3
//                   ? "bg-orange-50 border border-orange-200"
//                   : "bg-green-50 border border-green-200"
//               }`}
//             >
//               <Timer
//                 className={`h-5 w-5 ${
//                   daysRemaining < 0 ? "text-red-500" : daysRemaining < 3 ? "text-orange-500" : "text-green-500"
//                 }`}
//               />
//               <div>
//                 <div
//                   className={`text-sm font-semibold ${
//                     daysRemaining < 0 ? "text-red-700" : daysRemaining < 3 ? "text-orange-700" : "text-green-700"
//                   }`}
//                 >
//                   {daysRemaining < 0
//                     ? `Overdue by ${Math.abs(daysRemaining)} days`
//                     : daysRemaining === 0
//                     ? "Due today!"
//                     : `Due in ${daysRemaining} days`}
//                 </div>
//                 <div className="text-xs text-slate-600">{formatDateFull(task.due_date || task.deadline)}</div>
//               </div>
//             </div>
//           )}

//           {task.description && (
//             <div className="mb-6">
//               <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
//                 <Info className="h-4 w-4 mr-2" />
//                 Description
//               </h3>
//               <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4">{task.description}</p>
//             </div>
//           )}

//           <div className="space-y-2">
//             {task.assigned_to && (
//               <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
//                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
//                   {safeString(task.assigned_to).split(" ").map((n) => n[0]).join("").substring(0, 2) || "U"}
//                 </div>
//                 <div>
//                   <div className="text-sm font-semibold text-slate-900">{safeString(task.assigned_to)}</div>
//                   <div className="text-xs text-slate-500">Assigned to</div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-center">
//           <button
//             onClick={onClose}
//             className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============================================
// // DASHBOARD DATA HOOK - FIXED MEETINGS EXTRACTION
// // ============================================
// const useDashboardData = () => {
//   const [data, setData] = useState({
//     statistics: {},
//     projects: [],
//     managers: [],
//     rawManagers: [],
//     events: [],
//     tasks: [],
//     tenders: [],
//     meetings: [],
//     supervisors: [],
//     siteManagers: [],
//     chartData: {},
//     trends: {},
//     allTeamMembers: [],
//     recentActivity: [],
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
//         meetingsResponse,
//         supervisorsResponse,
//         siteManagersResponse,
//         calendarEventsResponse,
//       ] = await Promise.allSettled([
//         projectsAPI.getAll({ all: true, scope: "admin", admin: true, per_page: 1000, include_all_users: true })
//           .catch(() => projectsAPI.getAll({ admin: true, per_page: 1000 })
//           .catch(() => projectsAPI.getAll({ per_page: 1000 })
//           .catch(() => ({ projects: [] })))),
//         fetchProjectManagers().catch(() => []),
//         eventsAPI.getAll ? eventsAPI.getAll({ all: true, per_page: 100 }).catch(() => eventsAPI.getUpcoming?.(100).catch(() => ({ events: [] }))) : Promise.resolve({ events: [] }),
//         tasksAPI.getAll({ all: true, scope: "admin", admin: true, per_page: 1000, include_all_users: true })
//           .catch(() => tasksAPI.getAll({ per_page: 1000 }).catch(() => ({ tasks: [] }))),
//         tendersAPI.getAll({ all: true, scope: "admin", admin: true, per_page: 500, include_all_users: true })
//           .catch(() => tendersAPI.getAll({ per_page: 500 }).catch(() => ({ tenders: [] }))),
//         meetingsAPI.getAll({ all: true, per_page: 100 }).catch((err) => {
//           console.error('❌ Error fetching meetings:', err);
//           return { meetings: [] };
//         }),
//         supervisorsAPI.getAll().catch(() => []),
//         siteManagersAPI.getAll().catch(() => []),
//         calendarAPI.getTodayEvents ? calendarAPI.getTodayEvents().catch(() => []) : Promise.resolve([]),
//       ]);

//       const projectsData = projectsResponse.status === "fulfilled" ? projectsResponse.value : { projects: [] };
//       const managersData = managersResponse.status === "fulfilled" ? managersResponse.value : [];
//       const eventsData = eventsResponse.status === "fulfilled" ? eventsResponse.value : { events: [] };
//       const tasksData = tasksResponse.status === "fulfilled" ? tasksResponse.value : { tasks: [] };
//       const tendersData = tendersResponse.status === "fulfilled" ? tendersResponse.value : { tenders: [] };
//       const meetingsData = meetingsResponse.status === "fulfilled" ? meetingsResponse.value : { meetings: [] };
//       const supervisorsData = supervisorsResponse.status === "fulfilled" ? supervisorsResponse.value : [];
//       const siteManagersData = siteManagersResponse.status === "fulfilled" ? siteManagersResponse.value : [];
//       const calendarEventsData = calendarEventsResponse.status === "fulfilled" ? calendarEventsResponse.value : [];

//       // Use extractArray helper - matching the user's meetings component extraction
//       let projects = extractArray(projectsData, 'projects');
//       let events = extractArray(eventsData, 'events');
//       let tasks = extractArray(tasksData, 'tasks');
//       let tenders = extractArray(tendersData, 'tenders');
      
//       // Meetings extraction - API returns res.data.meetings
//       console.log('📅 === MEETINGS DEBUG ===');
//       console.log('📅 Raw meetingsData:', meetingsData);
      
//       let meetings = [];
//       if (meetingsData) {
//         // Try different response structures
//         if (Array.isArray(meetingsData)) {
//           meetings = meetingsData;
//         } else if (meetingsData.data && Array.isArray(meetingsData.data.meetings)) {
//           // Axios response: res.data.meetings
//           meetings = meetingsData.data.meetings;
//         } else if (meetingsData.data && Array.isArray(meetingsData.data)) {
//           // Axios response: res.data is array
//           meetings = meetingsData.data;
//         } else if (Array.isArray(meetingsData.meetings)) {
//           // Direct: { meetings: [...] }
//           meetings = meetingsData.meetings;
//         }
//       }
      
//       console.log('📅 Extracted meetings count:', meetings.length);
//       if (meetings.length > 0) console.log('📅 Sample meeting:', meetings[0]);
      
//       const supervisors = extractArray(supervisorsData, 'supervisors');
//       const siteManagers = extractArray(siteManagersData, 'site_managers');
//       const todayEvents = extractArray(calendarEventsData, 'events');

//       projects = sortByDateDesc(projects, "created_at");
//       events = sortByDateDesc(events, "date");
//       tasks = sortByDateDesc(tasks, "created_at");
//       tenders = sortByDateDesc(tenders, "created_at");
      
//       // Sort meetings by scheduled date ascending for upcoming order
//       meetings = [...meetings].sort((a, b) => {
//         const dateA = new Date(a.scheduled_at || a.date || a.start_time || a.start_date || 0);
//         const dateB = new Date(b.scheduled_at || b.date || b.start_time || b.start_date || 0);
//         return dateA - dateB;
//       });

//       const rawManagersData = Array.isArray(managersData) ? managersData : managersData?.data && Array.isArray(managersData.data) ? managersData.data : [];

//       const managers = (Array.isArray(managersData) ? managersData : rawManagersData).map((manager) => {
//         const managerProjects = projects.filter((p) => p.project_manager_id === manager.id || p.manager_id === manager.id || safeString(p.project_manager) === safeString(manager.name));
//         const managerName = safeString(manager.name) || "Unknown Manager";
//         return {
//           id: manager.id || Math.random().toString(),
//           name: managerName,
//           email: safeString(manager.email) || "unknown@email.com",
//           projectsCount: manager.number_of_projects || managerProjects.length || 0,
//           workload: Math.min(100, (manager.number_of_projects || managerProjects.length || 0) * 25),
//           efficiency: 85 + Math.random() * 15,
//           avatar: managerName.split(" ").map((n) => n[0]).join("").substring(0, 2) || "M",
//           role: "Manager",
//           performance: 75 + Math.random() * 25,
//           currentProjects: managerProjects.slice(0, 2).map((p) => safeString(p.title) || safeString(p.name) || "Untitled"),
//           created_at: manager.created_at,
//         };
//       });

//       const processedSupervisors = supervisors.map((supervisor) => {
//         const supervisorProjects = projects.filter((p) => p.supervisor_id === supervisor.id || safeString(p.supervisor) === safeString(supervisor.name));
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
//           currentProjects: supervisorProjects.slice(0, 2).map((p) => safeString(p.title) || safeString(p.name) || "Untitled"),
//           created_at: supervisor.created_at,
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
//           created_at: siteManager.created_at,
//         };
//       });

//       const allTeamMembers = [
//         ...managers.map((m) => ({ ...m, type: "manager" })),
//         ...processedSupervisors.map((s) => ({ ...s, type: "supervisor" })),
//         ...processedSiteManagers.map((sm) => ({ ...sm, type: "site_manager" })),
//       ];

//       const totalTasks = tasks.length || 0;
//       const completedTasks = tasks.filter((t) => t.status === "completed").length || 0;
//       const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length || 0;
//       const pendingTasks = tasks.filter((t) => t.status === "pending").length || 0;
//       const teamSize = (managers.length || 0) + (processedSupervisors.length || 0) + (processedSiteManagers.length || 0);

//       const overdueTasks = tasks.filter((t) => {
//         if (!t.due_date) return false;
//         return new Date(t.due_date) < new Date() && t.status !== "completed";
//       }).length;

//       const overdueProjects = projects.filter((p) => {
//         if (!p.end_date && !p.deadline) return false;
//         const endDate = new Date(p.end_date || p.deadline);
//         return endDate < new Date() && p.status !== "completed";
//       }).length;

//       const totalBudget = projects.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0);
//       const spentBudget = projects.reduce((sum, p) => sum + parseFloat(p.spent || p.actual_cost || 0), 0);

//       // Calculate upcoming meetings - check multiple date fields
//       const now = new Date();
//       const upcomingMeetingsCount = meetings.filter((m) => {
//         const meetingDateStr = m.scheduled_at || m.date || m.start_time || m.start_date;
//         if (!meetingDateStr) return false;
//         const meetingDate = new Date(meetingDateStr);
//         return !isNaN(meetingDate.getTime()) && meetingDate >= now;
//       }).length;

//       const todayMeetingsCount = meetings.filter((m) => {
//         const meetingDateStr = m.scheduled_at || m.date || m.start_time || m.start_date;
//         if (!meetingDateStr) return false;
//         const meetingDate = new Date(meetingDateStr);
//         return !isNaN(meetingDate.getTime()) && meetingDate.toDateString() === now.toDateString();
//       }).length;

//       console.log('📅 Upcoming meetings count:', upcomingMeetingsCount);
//       console.log('📅 Today meetings count:', todayMeetingsCount);

//       const statistics = {
//         totalProjects: projects.length || 0,
//         activeProjects: projects.filter((p) => p.status === "active" || p.status === "in_progress").length || 0,
//         completedProjects: projects.filter((p) => p.status === "completed").length || 0,
//         planningProjects: projects.filter((p) => p.status === "planning" || p.status === "pending").length || 0,
//         onHoldProjects: projects.filter((p) => p.status === "on_hold" || p.status === "paused").length || 0,
//         overdueProjects,
//         totalTasks,
//         completedTasks,
//         inProgressTasks,
//         pendingTasks,
//         overdueTasks,
//         teamSize,
//         managersCount: managers.length || 0,
//         supervisorsCount: processedSupervisors.length || 0,
//         siteManagersCount: processedSiteManagers.length || 0,
//         totalTenders: tenders.length || 0,
//         activeTenders: tenders.filter((t) => t.status === "active" || t.status === "open").length || 0,
//         closedTenders: tenders.filter((t) => t.status === "closed" || t.status === "awarded").length || 0,
//         pendingTenders: tenders.filter((t) => t.status === "pending" || t.status === "draft").length || 0,
//         totalMeetings: meetings.length || 0,
//         upcomingMeetings: upcomingMeetingsCount,
//         todayMeetings: todayMeetingsCount,
//         totalBudget,
//         spentBudget,
//         remainingBudget: totalBudget - spentBudget,
//         budgetUtilization: totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0,
//         completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
//         projectCompletionRate: projects.length > 0 ? Math.round((projects.filter((p) => p.status === "completed").length / projects.length) * 100) : 0,
//         totalEvents: events.length || 0,
//         upcomingEvents: events.filter((e) => new Date(e.date || e.start_date) >= new Date()).length || 0,
//       };

//       const trends = {
//         projects: statistics.activeProjects > 0 ? "up" : "neutral",
//         projectsValue: statistics.activeProjects > 0 ? `${statistics.activeProjects} active` : "No active",
//         budget: statistics.totalBudget > 0 ? "up" : "neutral",
//         budgetValue: statistics.totalBudget > 0 ? formatCurrency(statistics.totalBudget) : "TZS 0",
//         team: teamSize > 0 ? "neutral" : "down",
//         teamValue: `${teamSize} members`,
//         completion: statistics.completionRate >= 50 ? "up" : statistics.completionRate > 0 ? "neutral" : "down",
//         completionValue: `${statistics.completionRate}%`,
//         tasks: statistics.overdueTasks > 0 ? "down" : "up",
//         tasksValue: statistics.overdueTasks > 0 ? `${statistics.overdueTasks} overdue` : "On track",
//       };

//       const topManagers = [...managers].sort((a, b) => (b.performance || 0) - (a.performance || 0)).slice(0, 5);
//       const topSupervisors = [...processedSupervisors].sort((a, b) => (b.performance || 0) - (a.performance || 0)).slice(0, 5);

//       const statusData = [
//         { name: "Active", value: statistics.activeProjects, color: CHART_COLORS.primary[1] },
//         { name: "Completed", value: statistics.completedProjects, color: CHART_COLORS.success[1] },
//         { name: "Planning", value: statistics.planningProjects, color: CHART_COLORS.warning[1] },
//         { name: "On Hold", value: statistics.onHoldProjects, color: CHART_COLORS.danger[1] },
//       ].filter((item) => item.value > 0);

//       const taskStatusData = [
//         { name: "Completed", value: completedTasks, color: CHART_COLORS.success[1] },
//         { name: "In Progress", value: inProgressTasks, color: CHART_COLORS.primary[1] },
//         { name: "Pending", value: pendingTasks, color: CHART_COLORS.warning[1] },
//         { name: "Overdue", value: overdueTasks, color: CHART_COLORS.danger[1] },
//       ].filter((item) => item.value > 0);

//       const monthlyTrend = [];
//       const nowDate = new Date();
//       for (let i = 5; i >= 0; i--) {
//         const month = new Date(nowDate.getFullYear(), nowDate.getMonth() - i, 1);
//         const monthProjects = projects.filter((p) => {
//           const created = new Date(p.created_at);
//           return created.getMonth() === month.getMonth() && created.getFullYear() === month.getFullYear();
//         }).length;
//         monthlyTrend.push({
//           name: month.toLocaleDateString("en-US", { month: "short" }),
//           projects: monthProjects,
//           tasks: tasks.filter((t) => {
//             const created = new Date(t.created_at);
//             return created.getMonth() === month.getMonth() && created.getFullYear() === month.getFullYear();
//           }).length,
//         });
//       }

//       const chartData = { topManagers, topSupervisors, statusData, taskStatusData, monthlyTrend };

//       const recentActivity = [
//         ...projects.slice(0, 10).map((p) => ({
//           id: `project-${p.id}`,
//           type: "project",
//           title: safeString(p.title) || safeString(p.name) || "Untitled Project",
//           status: p.status,
//           date: p.created_at || p.updated_at,
//           user: getProjectAssignee(p, rawManagersData),
//           icon: Building2,
//           color: "blue",
//           data: p,
//         })),
//         ...tasks.slice(0, 10).map((t) => ({
//           id: `task-${t.id}`,
//           type: "task",
//           title: safeString(t.title) || safeString(t.name) || "Untitled Task",
//           status: t.status,
//           date: t.created_at || t.updated_at,
//           user: safeString(t.assigned_to) || safeString(t.assignee) || "Unassigned",
//           icon: CheckCircle2,
//           color: "green",
//           data: t,
//         })),
//         ...tenders.slice(0, 10).map((t) => ({
//           id: `tender-${t.id}`,
//           type: "tender",
//           title: safeString(t.title) || safeString(t.name) || "Untitled Tender",
//           status: t.status,
//           date: t.created_at || t.updated_at,
//           user: safeString(t.created_by) || "System",
//           icon: FileText,
//           color: "orange",
//           data: t,
//         })),
//       ]
//         .sort((a, b) => new Date(b.date) - new Date(a.date))
//         .slice(0, 15);

//       setData({
//         statistics,
//         projects,
//         managers,
//         rawManagers: rawManagersData,
//         events: [...events, ...todayEvents],
//         tasks,
//         tenders,
//         meetings,
//         supervisors: processedSupervisors,
//         siteManagers: processedSiteManagers,
//         chartData,
//         trends,
//         allTeamMembers,
//         recentActivity,
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
//     const interval = setInterval(() => fetchData(true), 120000);
//     return () => clearInterval(interval);
//   }, [fetchData]);

//   const refetch = useCallback(() => fetchData(true), [fetchData]);

//   return { data, loading, error, lastUpdated, refreshing, refetch };
// };

// // ============================================
// // KPI CARD COMPONENT
// // ============================================
// const ModernKPICard = ({ label, value, icon: Icon, trend, trendValue, colorScheme = "primary" }) => {
//   const colorSchemes = {
//     primary: { bg: "bg-white", iconBg: "bg-gradient-to-br from-blue-500 to-blue-600", accent: "text-blue-600", trendUp: "text-emerald-600", trendDown: "text-red-600" },
//     success: { bg: "bg-white", iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600", accent: "text-emerald-600", trendUp: "text-emerald-600", trendDown: "text-red-600" },
//     warning: { bg: "bg-white", iconBg: "bg-gradient-to-br from-amber-500 to-amber-600", accent: "text-amber-600", trendUp: "text-emerald-600", trendDown: "text-red-600" },
//     purple: { bg: "bg-white", iconBg: "bg-gradient-to-br from-purple-500 to-purple-600", accent: "text-purple-600", trendUp: "text-emerald-600", trendDown: "text-red-600" },
//     danger: { bg: "bg-white", iconBg: "bg-gradient-to-br from-red-500 to-red-600", accent: "text-red-600", trendUp: "text-emerald-600", trendDown: "text-red-600" },
//   };
//   const colors = colorSchemes[colorScheme];

//   return (
//     <div className={`${colors.bg} rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all`}>
//       <div className="flex items-center justify-between">
//         <div className={`p-2.5 rounded-xl ${colors.iconBg} shadow-lg`}>
//           <Icon className="h-6 w-6 text-white" />
//         </div>
//         <div className="text-right">
//           <div className={`text-3xl font-bold ${colors.accent}`}>{value}</div>
//           <div className="text-sm font-semibold text-slate-700">{label}</div>
//         </div>
//       </div>
//       {trend && trendValue && (
//         <div className={`mt-2 text-xs font-medium flex items-center justify-end space-x-1 ${trend === "up" ? colors.trendUp : trend === "down" ? colors.trendDown : "text-slate-500"}`}>
//           {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
//           <span>{trendValue}</span>
//         </div>
//       )}
//     </div>
//   );
// };

// // ============================================
// // ENHANCED CALENDAR
// // ============================================
// const EnhancedCalendar = ({ events, tasks, meetings = [], onCreateMeeting, teamMembers = [], projects = [] }) => {
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [isCreating, setIsCreating] = useState(false);
//   const [newMeeting, setNewMeeting] = useState({
//     title: "",
//     description: "",
//     date: "",
//     start_time: "09:00",
//     end_time: "10:00",
//     location: "",
//     meeting_type: "general",
//     project_id: "",
//     attendees: [],
//   });

//   const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
//   const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
//   const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
//   const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

//   const getActivitiesForDate = (date) => {
//     try {
//       const dateStr = date.toISOString().split("T")[0];
//       const dayEvents = (events || []).filter((event) => {
//         try {
//           const eventDateStr = event.date || event.start_date || event.event_date;
//           if (!eventDateStr) return false;
//           const eventDate = new Date(eventDateStr);
//           if (isNaN(eventDate.getTime())) return false;
//           return eventDate.toISOString().split("T")[0] === dateStr;
//         } catch { return false; }
//       });
//       const dayTasks = (tasks || []).filter((task) => {
//         try {
//           const taskDateStr = task.due_date || task.deadline;
//           if (!taskDateStr) return false;
//           const taskDate = new Date(taskDateStr);
//           if (isNaN(taskDate.getTime())) return false;
//           return taskDate.toISOString().split("T")[0] === dateStr;
//         } catch { return false; }
//       });
//       const dayMeetings = (meetings || []).filter((meeting) => {
//         try {
//           const meetingDateStr = meeting.scheduled_at || meeting.date || meeting.start_time || meeting.start_date;
//           if (!meetingDateStr) return false;
//           const meetingDate = new Date(meetingDateStr);
//           if (isNaN(meetingDate.getTime())) return false;
//           return meetingDate.toISOString().split("T")[0] === dateStr;
//         } catch { return false; }
//       });
//       return [
//         ...dayEvents.map((e) => ({ ...e, activityType: "event" })),
//         ...dayTasks.map((t) => ({ ...t, activityType: "task" })),
//         ...dayMeetings.map((m) => ({ ...m, activityType: "meeting" })),
//       ];
//     } catch { return []; }
//   };

//   const openCreateModal = (date) => {
//     setSelectedDate(date);
//     setNewMeeting({
//       ...newMeeting,
//       date: date.toISOString().split("T")[0],
//     });
//     setShowCreateModal(true);
//   };

//   const handleAttendeeToggle = (member) => {
//     setNewMeeting((prev) => {
//       const isSelected = prev.attendees.some((a) => a.id === member.id);
//       if (isSelected) {
//         return { ...prev, attendees: prev.attendees.filter((a) => a.id !== member.id) };
//       } else {
//         return { ...prev, attendees: [...prev.attendees, { id: member.id, name: member.name, type: member.type || member.role }] };
//       }
//     });
//   };

//   const handleCreateMeeting = async () => {
//     if (!newMeeting.title.trim() || !newMeeting.date) return;
//     setIsCreating(true);
//     try {
//       const meetingData = {
//         ...newMeeting,
//         scheduled_at: `${newMeeting.date}T${newMeeting.start_time}:00`,
//         attendee_ids: newMeeting.attendees.map((a) => a.id),
//       };
//       if (onCreateMeeting) {
//         await onCreateMeeting(meetingData);
//       }
//       setShowCreateModal(false);
//       setNewMeeting({
//         title: "",
//         description: "",
//         date: "",
//         start_time: "09:00",
//         end_time: "10:00",
//         location: "",
//         meeting_type: "general",
//         project_id: "",
//         attendees: [],
//       });
//     } catch (error) {
//       console.error("Error creating meeting:", error);
//     } finally {
//       setIsCreating(false);
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

//   const groupedMembers = {
//     managers: teamMembers.filter((m) => m.type === "manager" || m.role === "Manager"),
//     supervisors: teamMembers.filter((m) => m.type === "supervisor" || m.role === "Supervisor"),
//     siteManagers: teamMembers.filter((m) => m.type === "site_manager" || m.role === "Site Manager"),
//   };

//   return (
//     <div className="flex flex-col h-full">
//       <div className="flex items-center justify-between mb-2">
//         <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
//           <ChevronLeft className="h-4 w-4 text-slate-600" />
//         </button>
//         <span className="text-sm font-bold text-slate-900">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
//         <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
//           <ChevronRight className="h-4 w-4 text-slate-600" />
//         </button>
//       </div>

//       <div className="grid grid-cols-7 gap-0.5 mb-1">
//         {dayNames.map((day, i) => (
//           <div key={i} className="text-center text-[10px] font-semibold text-slate-500 py-0.5">{day.substring(0, 2)}</div>
//         ))}
//       </div>

//       <div className="grid grid-cols-7 gap-0.5 flex-1 min-h-0">
//         {calendarDays.map((day, index) => {
//           if (!day) return <div key={index} className="aspect-square"></div>;
//           const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
//           const activities = getActivitiesForDate(date);
//           const isToday = date.toDateString() === today.toDateString();
//           const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
//           const hasActivities = activities.length > 0;
//           const hasMeetings = activities.some((a) => a.activityType === "meeting");
//           const isPast = date < today && !isToday;

//           return (
//             <button 
//               key={index} 
//               onClick={() => setSelectedDate(date)}
//               onDoubleClick={() => openCreateModal(date)}
//               className={`aspect-square rounded flex flex-col items-center justify-center text-xs font-semibold relative transition-all
//                 ${isToday ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-sm" : ""}
//                 ${isSelected && !isToday ? "bg-purple-100 text-purple-700 ring-1 ring-purple-400" : ""}
//                 ${!isToday && !isSelected && !isPast ? "hover:bg-slate-100 text-slate-700" : ""}
//                 ${isPast && !isToday && !isSelected ? "text-slate-400" : ""}`}
//             >
//               {day}
//               {hasActivities && (
//                 <div className="absolute bottom-0.5 flex space-x-0.5">
//                   {hasMeetings && <div className={`w-1 h-1 rounded-full ${isToday ? "bg-yellow-300" : "bg-yellow-500"}`} />}
//                   {activities.filter((a) => a.activityType !== "meeting").slice(0, 1).map((_, idx) => (
//                     <div key={idx} className={`w-1 h-1 rounded-full ${isToday ? "bg-white" : "bg-purple-500"}`} />
//                   ))}
//                 </div>
//               )}
//             </button>
//           );
//         })}
//       </div>

//       <div className="mt-2 pt-2 border-t border-slate-200">
//         <div className="flex items-center justify-between mb-1.5">
//           <span className="text-xs font-semibold text-slate-700">
//             {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
//           </span>
//           <button 
//             onClick={() => openCreateModal(selectedDate)} 
//             className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
//           >
//             <Plus className="h-3 w-3" />
//             <span className="text-[10px] font-semibold">Meeting</span>
//           </button>
//         </div>
//         <div className="space-y-1 max-h-20 overflow-y-auto">
//           {selectedActivities.length > 0 ? (
//             selectedActivities.slice(0, 3).map((activity, index) => (
//               <div 
//                 key={index} 
//                 className={`p-1.5 rounded text-[10px] flex items-center space-x-1.5 ${
//                   activity.activityType === "meeting" 
//                     ? "bg-yellow-50 text-yellow-700 border border-yellow-200" 
//                     : activity.activityType === "event" 
//                     ? "bg-purple-50 text-purple-700" 
//                     : "bg-blue-50 text-blue-700"
//                 }`}
//               >
//                 {activity.activityType === "meeting" && <Users className="h-3 w-3 flex-shrink-0" />}
//                 {activity.activityType === "event" && <Calendar className="h-3 w-3 flex-shrink-0" />}
//                 {activity.activityType === "task" && <CheckCircle2 className="h-3 w-3 flex-shrink-0" />}
//                 <span className="font-medium truncate">{safeString(activity.title) || safeString(activity.name) || "Untitled"}</span>
//               </div>
//             ))
//           ) : (
//             <div className="text-[10px] text-slate-400 text-center py-1">Double-click to add</div>
//           )}
//         </div>
//       </div>

//       {/* Create Meeting Modal */}
//       {showCreateModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
//           <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
//             <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-5">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 bg-white/20 rounded-lg">
//                     <Users className="h-6 w-6" />
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-bold">Schedule Meeting</h3>
//                     <p className="text-purple-200 text-sm">
//                       {newMeeting.date 
//                         ? new Date(newMeeting.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
//                         : "Select a date below"
//                       }
//                     </p>
//                   </div>
//                 </div>
//                 <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-full hover:bg-white/20 transition-colors">
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>
//             </div>

//             <div className="p-5 overflow-y-auto max-h-[calc(90vh-180px)]">
//               <div className="mb-4">
//                 <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Meeting Title *</label>
//                 <input 
//                   type="text" 
//                   value={newMeeting.title} 
//                   onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })} 
//                   className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
//                   placeholder="e.g., Weekly Project Review" 
//                 />
//               </div>

//               <div className="mb-4">
//                 <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Meeting Date *</label>
//                 <input 
//                   type="date" 
//                   value={newMeeting.date} 
//                   onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })} 
//                   className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
//                   min={new Date().toISOString().split("T")[0]}
//                 />
//               </div>

//               <div className="grid grid-cols-3 gap-3 mb-4">
//                 <div>
//                   <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Start Time</label>
//                   <input 
//                     type="time" 
//                     value={newMeeting.start_time} 
//                     onChange={(e) => setNewMeeting({ ...newMeeting, start_time: e.target.value })} 
//                     className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" 
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-semibold text-slate-700 mb-1.5 block">End Time</label>
//                   <input 
//                     type="time" 
//                     value={newMeeting.end_time} 
//                     onChange={(e) => setNewMeeting({ ...newMeeting, end_time: e.target.value })} 
//                     className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" 
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Type</label>
//                   <select 
//                     value={newMeeting.meeting_type} 
//                     onChange={(e) => setNewMeeting({ ...newMeeting, meeting_type: e.target.value })} 
//                     className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   >
//                     <option value="general">General</option>
//                     <option value="project_review">Project Review</option>
//                     <option value="planning">Planning</option>
//                     <option value="standup">Stand-up</option>
//                     <option value="client">Client Meeting</option>
//                     <option value="urgent">Urgent</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Location</label>
//                 <input 
//                   type="text" 
//                   value={newMeeting.location} 
//                   onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })} 
//                   className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" 
//                   placeholder="e.g., Conference Room A, Zoom, Site Office" 
//                 />
//               </div>

//               <div className="mb-4">
//                 <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Related Project (Optional)</label>
//                 <select 
//                   value={newMeeting.project_id} 
//                   onChange={(e) => setNewMeeting({ ...newMeeting, project_id: e.target.value })} 
//                   className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 >
//                   <option value="">No specific project</option>
//                   {projects.map((project) => (
//                     <option key={project.id} value={project.id}>
//                       {safeString(project.title) || safeString(project.name)}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="mb-4">
//                 <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Description / Agenda</label>
//                 <textarea 
//                   value={newMeeting.description} 
//                   onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })} 
//                   className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" 
//                   rows={3}
//                   placeholder="Meeting agenda or notes..." 
//                 />
//               </div>

//               <div className="mb-4">
//                 <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center justify-between">
//                   <span>Invite Attendees</span>
//                   {newMeeting.attendees.length > 0 && (
//                     <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
//                       {newMeeting.attendees.length} selected
//                     </span>
//                   )}
//                 </label>
                
//                 <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
//                   {groupedMembers.managers.length > 0 && (
//                     <div>
//                       <div className="bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 flex items-center space-x-2 sticky top-0">
//                         <Briefcase className="h-3.5 w-3.5" />
//                         <span>Project Managers ({groupedMembers.managers.length})</span>
//                       </div>
//                       {groupedMembers.managers.map((member) => {
//                         const isSelected = newMeeting.attendees.some((a) => a.id === member.id);
//                         return (
//                           <button
//                             key={member.id}
//                             type="button"
//                             onClick={() => handleAttendeeToggle(member)}
//                             className={`w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors ${isSelected ? "bg-purple-50" : ""}`}
//                           >
//                             <div className="flex items-center space-x-2">
//                               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${isSelected ? "bg-purple-600" : "bg-blue-500"}`}>
//                                 {member.avatar || member.name?.split(" ").map((n) => n[0]).join("").substring(0, 2)}
//                               </div>
//                               <span className="text-sm text-slate-700">{member.name}</span>
//                             </div>
//                             {isSelected && <Check className="h-4 w-4 text-purple-600" />}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {groupedMembers.supervisors.length > 0 && (
//                     <div>
//                       <div className="bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 flex items-center space-x-2 sticky top-0">
//                         <HardHat className="h-3.5 w-3.5" />
//                         <span>Supervisors ({groupedMembers.supervisors.length})</span>
//                       </div>
//                       {groupedMembers.supervisors.map((member) => {
//                         const isSelected = newMeeting.attendees.some((a) => a.id === member.id);
//                         return (
//                           <button
//                             key={member.id}
//                             type="button"
//                             onClick={() => handleAttendeeToggle(member)}
//                             className={`w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors ${isSelected ? "bg-purple-50" : ""}`}
//                           >
//                             <div className="flex items-center space-x-2">
//                               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${isSelected ? "bg-purple-600" : "bg-purple-500"}`}>
//                                 {member.avatar || member.name?.split(" ").map((n) => n[0]).join("").substring(0, 2)}
//                               </div>
//                               <span className="text-sm text-slate-700">{member.name}</span>
//                             </div>
//                             {isSelected && <Check className="h-4 w-4 text-purple-600" />}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {groupedMembers.siteManagers.length > 0 && (
//                     <div>
//                       <div className="bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 flex items-center space-x-2 sticky top-0">
//                         <Building2 className="h-3.5 w-3.5" />
//                         <span>Site Managers ({groupedMembers.siteManagers.length})</span>
//                       </div>
//                       {groupedMembers.siteManagers.map((member) => {
//                         const isSelected = newMeeting.attendees.some((a) => a.id === member.id);
//                         return (
//                           <button
//                             key={member.id}
//                             type="button"
//                             onClick={() => handleAttendeeToggle(member)}
//                             className={`w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors ${isSelected ? "bg-purple-50" : ""}`}
//                           >
//                             <div className="flex items-center space-x-2">
//                               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${isSelected ? "bg-purple-600" : "bg-amber-500"}`}>
//                                 {member.avatar || member.name?.split(" ").map((n) => n[0]).join("").substring(0, 2)}
//                               </div>
//                               <span className="text-sm text-slate-700">{member.name}</span>
//                             </div>
//                             {isSelected && <Check className="h-4 w-4 text-purple-600" />}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {teamMembers.length === 0 && (
//                     <div className="p-4 text-center text-sm text-slate-400">
//                       No team members available
//                     </div>
//                   )}
//                 </div>

//                 {newMeeting.attendees.length > 0 && (
//                   <div className="mt-3 flex flex-wrap gap-2">
//                     {newMeeting.attendees.map((attendee) => (
//                       <span 
//                         key={attendee.id} 
//                         className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium"
//                       >
//                         <span>{attendee.name}</span>
//                         <button 
//                           type="button"
//                           onClick={() => handleAttendeeToggle(attendee)}
//                           className="hover:text-purple-900"
//                         >
//                           <X className="h-3 w-3" />
//                         </button>
//                       </span>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-between">
//               <button 
//                 onClick={() => setShowCreateModal(false)} 
//                 className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button 
//                 onClick={handleCreateMeeting}
//                 disabled={!newMeeting.title.trim() || !newMeeting.date || isCreating}
//                 className="flex items-center space-x-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isCreating ? (
//                   <>
//                     <RefreshCw className="h-4 w-4 animate-spin" />
//                     <span>Creating...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Plus className="h-4 w-4" />
//                     <span>Create Meeting</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ============================================
// // RECENT ACTIVITY FEED
// // ============================================
// const RecentActivityFeed = ({ activities, onItemClick }) => {
//   const getTypeColor = (type) => {
//     const colors = { project: "from-blue-500 to-blue-600", task: "from-green-500 to-green-600", tender: "from-orange-500 to-orange-600" };
//     return colors[type] || "from-slate-500 to-slate-600";
//   };

//   return (
//     <div className="space-y-2">
//       {activities.length > 0 ? (
//         activities.slice(0, 10).map((activity, index) => {
//           const Icon = activity.icon || Activity;
//           const statusConfig = getStatusConfig(activity.status);
//           return (
//             <div 
//               key={activity.id || index} 
//               onClick={() => onItemClick && onItemClick(activity)} 
//               className="p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all group"
//             >
//               <div className="flex items-start space-x-2">
//                 <div className={`p-1.5 rounded bg-gradient-to-br ${getTypeColor(activity.type)} shadow-sm flex-shrink-0`}>
//                   <Icon className="h-3 w-3 text-white" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center justify-between mb-0.5">
//                     <h4 className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
//                       {activity.title}
//                     </h4>
//                     <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${statusConfig.bg} ${statusConfig.text}`}>
//                       {activity.status}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span className="text-[10px] text-slate-500 truncate">{activity.user}</span>
//                     <span className="text-[9px] text-slate-400">{getRelativeTime(activity.date)}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })
//       ) : (
//         <div className="flex items-center justify-center h-20">
//           <p className="text-xs text-slate-400">No recent activity</p>
//         </div>
//       )}
//     </div>
//   );
// };

// // ============================================
// // MEETINGS SECTION COMPONENT - FIXED
// // ============================================
// const MeetingsSection = ({ meetings = [], teamMembers = [], onMeetingClick }) => {
//   const now = new Date();

//   // Safe string helper
//   const safeString = (str) => str || "";

//   // 🌟 FIXED: Convert ANY meeting date into a real datetime
//   const extractDateTime = (m) => {
//     // Priority 1: ISO timestamp
//     if (m.start_time) return new Date(m.start_time);
//     if (m.scheduled_at) return new Date(m.scheduled_at);
//     if (m.start_date) return new Date(m.start_date);

//     // Priority 2: Separate date + time
//     if (m.date && m.time) return new Date(`${m.date}T${m.time}`);

//     // Priority 3: Date only
//     if (m.date) return new Date(`${m.date}T00:00`);

//     return null;
//   };

//   // 🌟 FIXED: format date
//   const formatMeetingDate = (meeting) => {
//     const date = extractDateTime(meeting);
//     if (!date || isNaN(date)) return "TBD";

//     const today = new Date();
//     const tomorrow = new Date();
//     tomorrow.setDate(today.getDate() + 1);

//     if (date.toDateString() === today.toDateString()) return "Today";
//     if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

//     return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
//   };

//   // 🌟 FIXED: format time
//   const formatMeetingTime = (meeting) => {
//     const date = extractDateTime(meeting);
//     if (!date || isNaN(date)) return meeting.time || "TBD";

//     return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
//   };

//   // Meeting type color
//   const getMeetingTypeColor = (type) => {
//     const colors = {
//       general: "bg-slate-100 text-slate-600",
//       project_review: "bg-blue-100 text-blue-600",
//       planning: "bg-purple-100 text-purple-600",
//       standup: "bg-green-100 text-green-600",
//       client: "bg-amber-100 text-amber-600",
//       urgent: "bg-red-100 text-red-600",
//     };
//     return colors[type] || colors.general;
//   };

//   // Attendee names
//   const getAttendeeNames = (meeting) => {
//     if (Array.isArray(meeting.participants)) {
//       return meeting.participants.map((p) =>
//         p.name || p.full_name || p
//       );
//     }
//     if (Array.isArray(meeting.attendees)) {
//       return meeting.attendees.map((a) => a.name || a);
//     }
//     if (Array.isArray(meeting.attendee_ids)) {
//       return meeting.attendee_ids
//         .map((id) => teamMembers.find((m) => m.id === id)?.name)
//         .filter(Boolean);
//     }
//     return [];
//   };

//   // 🌟 FIXED: Upcoming meetings
//   const upcomingMeetings = meetings
//     .filter((m) => {
//       const dt = extractDateTime(m);
//       return dt && !isNaN(dt) && dt >= now;
//     })
//     .sort((a, b) => extractDateTime(a) - extractDateTime(b))
//     .slice(0, 6);

//   // 🌟 FIXED: Today meetings
//   const todayMeetings = meetings.filter((m) => {
//     const dt = extractDateTime(m);
//     return (
//       dt &&
//       dt.toDateString() === now.toDateString()
//     );
//   });

//   return (
//     <div className="space-y-2">
//       {/* Today's Meetings Banner */}
//       {todayMeetings.length > 0 && (
//         <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-2 mb-2">
//           <div className="flex items-center space-x-1.5">
//             <Clock className="h-3.5 w-3.5 text-amber-600" />
//             <span className="text-xs font-semibold text-amber-800">
//               Today: {todayMeetings.length}
//             </span>
//           </div>
//           <p className="text-[10px] text-amber-700 mt-0.5 truncate">
//             Next: {todayMeetings[0]?.title || "Untitled"} @ {formatMeetingTime(todayMeetings[0])}
//           </p>
//         </div>
//       )}

//       {/* Upcoming Meetings List */}
//       {upcomingMeetings.length > 0 ? (
//         upcomingMeetings.map((meeting, index) => {
//           const attendees = getAttendeeNames(meeting).slice(0, 3);
//           const countExtra =
//             (meeting.participants?.length || meeting.attendees?.length || 0) - 3;

//           const isToday = formatMeetingDate(meeting) === "Today";

//           return (
//             <div
//               key={meeting.id || index}
//               onClick={() => onMeetingClick?.(meeting)}
//               className={`p-2.5 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
//                 isToday
//                   ? "bg-amber-50 border-amber-200 hover:border-amber-300"
//                   : "bg-white border-slate-200 hover:border-slate-300"
//               }`}
//             >
//               <div className="flex items-start justify-between mb-1.5">
//                 <h4 className="text-xs font-semibold text-slate-900 truncate flex-1 pr-2">
//                   {meeting.title || meeting.name || "Untitled Meeting"}
//                 </h4>
//                 <div className="text-right flex-shrink-0">
//                   <div
//                     className={`text-[10px] font-bold ${
//                       isToday ? "text-amber-700" : "text-slate-600"
//                     }`}
//                   >
//                     {formatMeetingDate(meeting)}
//                   </div>
//                   <div className="text-xs font-semibold text-slate-900">
//                     {formatMeetingTime(meeting)}
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-center justify-between">
//                 <span
//                   className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${getMeetingTypeColor(
//                     meeting.meeting_type || meeting.type
//                   )}`}
//                 >
//                   {(meeting.meeting_type || meeting.type || "general")
//                     .replace(/_/g, " ")}
//                 </span>

//                 {attendees.length > 0 && (
//                   <div className="flex -space-x-1.5">
//                     {attendees.map((name, idx) => (
//                       <div
//                         key={idx}
//                         className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[8px] font-bold border border-white"
//                         title={name}
//                       >
//                         {name
//                           .split(" ")
//                           .map((n) => n[0])
//                           .join("")
//                           .substring(0, 2)}
//                       </div>
//                     ))}
//                     {countExtra > 0 && (
//                       <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-[8px] font-bold border border-white">
//                         +{countExtra}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {meeting.location && (
//                 <div className="flex items-center space-x-1 text-[10px] text-slate-500 mt-1.5">
//                   <MapPin className="h-3 w-3" />
//                   <span className="truncate">{meeting.location}</span>
//                 </div>
//               )}
//             </div>
//           );
//         })
//       ) : (
//         <div className="flex flex-col items-center justify-center py-6 text-center">
//           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
//             <Calendar className="h-5 w-5 text-slate-400" />
//           </div>
//           <p className="text-xs text-slate-500">No upcoming meetings</p>
//           <p className="text-[10px] text-slate-400">Double-click calendar to add</p>
//         </div>
//       )}
//     </div>
//   );
// };



// // ============================================
// // MAIN DASHBOARD COMPONENT
// // ============================================
// const AdminDashboard = () => {
//   const currentTime = useCurrentTime();
//   const navigate = useNavigate();
//   const { data, loading, error, lastUpdated, refreshing, refetch } = useDashboardData();

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
//     const saved = localStorage.getItem("sidebar-collapsed");
//     return saved !== null ? JSON.parse(saved) : false;
//   });
//   const [showFullscreen, setShowFullscreen] = useState(false);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [selectedTender, setSelectedTender] = useState(null);
//   const [selectedTask, setSelectedTask] = useState(null);
//   const dashboardRef = React.useRef(null);

//   const handleCollapseChange = (collapsed) => setSidebarCollapsed(collapsed);
  
//   const handleCreateMeeting = async (meetingData) => {
//     try {
//       if (meetingsAPI?.create) {
//         await meetingsAPI.create(meetingData);
//         refetch();
//       } else {
//         console.log("Meeting created (API not available):", meetingData);
//       }
//     } catch (error) {
//       console.error("Error creating meeting:", error);
//       throw error;
//     }
//   };

//   const handleProjectClick = (project) => setSelectedProject(project);
//   const handleTenderClick = (tender) => setSelectedTender(tender);
//   const handleTaskClick = (task) => setSelectedTask(task);
//   const handleMeetingClick = (meeting) => console.log("Meeting clicked:", meeting);

//   // Navigation handlers for team members
//   const handleManagerClick = (manager) => {
//     console.log('Navigating to manager:', manager.id, manager.name);
//     navigate(`/admin/project-managers/${manager.id}`);
//   };

//   const handleSupervisorClick = (supervisor) => {
//     console.log('Navigating to supervisor:', supervisor.id, supervisor.name);
//     navigate(`/admin/supervisors/${supervisor.id}`);
//   };

//   const handleSiteManagerClick = (siteManager) => {
//     console.log('Navigating to site manager:', siteManager.id, siteManager.name);
//     navigate(`/admin/site-managers/${siteManager.id}`);
//   };

//   const handleActivityClick = (activity) => {
//     if (activity.type === "project") setSelectedProject(activity.data);
//     else if (activity.type === "task") setSelectedTask(activity.data);
//     else if (activity.type === "tender") setSelectedTender(activity.data);
//   };

//   // Fullscreen handlers
//   useEffect(() => {
//     const handleFullscreenChange = () => {
//       const isFullscreen = document.fullscreenElement !== null;
//       setShowFullscreen(isFullscreen);
//       localStorage.setItem("dashboard-fullscreen", isFullscreen.toString());
//       if (isFullscreen) setSidebarOpen(false);
//     };

//     document.addEventListener("fullscreenchange", handleFullscreenChange);
//     document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
//     document.addEventListener("mozfullscreenchange", handleFullscreenChange);
//     document.addEventListener("MSFullscreenChange", handleFullscreenChange);

//     return () => {
//       document.removeEventListener("fullscreenchange", handleFullscreenChange);
//       document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
//       document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
//       document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
//     };
//   }, []);

//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.key === "F11") {
//         e.preventDefault();
//         toggleFullscreen();
//       }
//       if (e.key === "Escape" && showFullscreen) {
//         exitFullscreen();
//       }
//     };

//     document.addEventListener("keydown", handleKeyDown);
//     return () => document.removeEventListener("keydown", handleKeyDown);
//   }, [showFullscreen]);

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const shouldBeFullscreen = params.get("fullscreen") === "true" || localStorage.getItem("dashboard-fullscreen") === "true";
//     if (shouldBeFullscreen && dashboardRef.current && !document.fullscreenElement) {
//       enterFullscreen();
//     }
//   }, []);

//   const enterFullscreen = async () => {
//     try {
//       const elem = dashboardRef.current;
//       if (elem) {
//         if (elem.requestFullscreen) {
//           await elem.requestFullscreen();
//         } else if (elem.webkitRequestFullscreen) {
//           await elem.webkitRequestFullscreen();
//         } else if (elem.mozRequestFullScreen) {
//           await elem.mozRequestFullScreen();
//         } else if (elem.msRequestFullscreen) {
//           await elem.msRequestFullscreen();
//         }
//       }
//     } catch (err) {
//       console.error("Error entering fullscreen:", err);
//       setShowFullscreen(true);
//       localStorage.setItem("dashboard-fullscreen", "true");
//       setSidebarOpen(false);
//     }
//   };

//   const exitFullscreen = async () => {
//     try {
//       if (document.exitFullscreen) {
//         await document.exitFullscreen();
//       } else if (document.webkitExitFullscreen) {
//         await document.webkitExitFullscreen();
//       } else if (document.mozCancelFullScreen) {
//         await document.mozCancelFullScreen();
//       } else if (document.msExitFullscreen) {
//         await document.msExitFullscreen();
//       }
//     } catch (err) {
//       console.error("Error exiting fullscreen:", err);
//       setShowFullscreen(false);
//       localStorage.setItem("dashboard-fullscreen", "false");
//     }
//   };

//   const toggleFullscreen = () => {
//     if (showFullscreen || document.fullscreenElement) {
//       exitFullscreen();
//     } else {
//       enterFullscreen();
//     }
//   };

//   if (loading) {
//     return (
//       <div ref={dashboardRef} className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
//         {!showFullscreen && <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onCollapseChange={handleCollapseChange} />}
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
//             <h3 className="text-2xl font-bold text-slate-900 mb-3">Loading Dashboard</h3>
//             <p className="text-base text-slate-600">Fetching all system data...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div ref={dashboardRef} className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
//         {!showFullscreen && <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onCollapseChange={handleCollapseChange} />}
//         <div className="flex-1 flex items-center justify-center p-6">
//           <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md text-center">
//             <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
//             <h3 className="text-2xl font-bold text-slate-900 mb-3">Connection Error</h3>
//             <p className="text-base text-slate-600 mb-8">{error}</p>
//             <button onClick={refetch} className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all text-base font-semibold">
//               Retry Connection
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const latestProjects = data.projects?.slice(0, 10) || [];
//   const latestTenders = data.tenders?.slice(0, 8) || [];

//   return (
//     <div 
//       ref={dashboardRef} 
//       className={`flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden ${showFullscreen ? 'fixed inset-0 z-50' : ''}`}
//     >
//       {!showFullscreen && <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onCollapseChange={handleCollapseChange} />}

//       <div className="flex-1 flex flex-col min-w-0 h-full">
//         {/* Header */}
//         {!showFullscreen ? (
//           <div className="bg-white border-b border-slate-200 py-3 px-6 shadow-sm flex-shrink-0">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-4">
//                 <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
//                   <Menu className="h-5 w-5 text-slate-700" />
//                 </button>
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
//                     <Building2 className="h-6 w-6 text-white" />
//                   </div>
//                   <div>
//                     <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
//                     <p className="text-xs text-slate-500">Complete system overview</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-center space-x-6">
//                 <div className="text-right">
//                   <div className="text-xl font-bold text-slate-900 tabular-nums">
//                     {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
//                   </div>
//                   <div className="text-xs text-slate-500">
//                     {currentTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-2">
//                   <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg">
//                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
//                     <span className="text-sm font-semibold text-emerald-700">LIVE</span>
//                   </div>
//                   <button onClick={refetch} disabled={refreshing} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors" title="Refresh">
//                     <RefreshCw className={`h-5 w-5 text-slate-700 ${refreshing ? "animate-spin" : ""}`} />
//                   </button>
//                   <button onClick={toggleFullscreen} className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 transition-colors" title="Fullscreen (F11)">
//                     <Maximize2 className="h-5 w-5" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="absolute top-3 right-3 z-50 flex items-center space-x-2">
//             <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200">
//               <div className="flex items-center space-x-1.5">
//                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
//                 <span className="text-xs font-semibold text-emerald-700">LIVE</span>
//               </div>
//               <div className="w-px h-5 bg-slate-300"></div>
//               <div className="text-sm font-bold text-slate-900 tabular-nums">
//                 {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
//               </div>
//               <div className="w-px h-5 bg-slate-300"></div>
//               <button onClick={refetch} disabled={refreshing} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title="Refresh">
//                 <RefreshCw className={`h-4 w-4 text-slate-700 ${refreshing ? "animate-spin" : ""}`} />
//               </button>
//               <button onClick={toggleFullscreen} className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors" title="Exit Fullscreen">
//                 <X className="h-4 w-4" />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Main Content */}
//         <div className="flex-1 overflow-hidden">
//           <div className={`h-full flex flex-col gap-3 ${showFullscreen ? 'p-3' : 'p-4'}`}>
//             {/* KPI Cards Row */}
//             <div className={`grid grid-cols-5 gap-3 flex-shrink-0 ${showFullscreen ? 'pt-10' : ''}`}>
//               <ModernKPICard label="Total Projects" value={data.statistics?.totalProjects || 0} icon={Building2} trend={data.trends?.projects || "neutral"} trendValue={`${data.statistics?.activeProjects || 0} active`} colorScheme="primary" />
//               <ModernKPICard label="Total Budget" value={formatCurrency(data.statistics?.totalBudget || 0)} icon={DollarSign} trend={data.trends?.budget || "neutral"} trendValue={`${data.statistics?.budgetUtilization || 0}% used`} colorScheme="success" />
//               <ModernKPICard label="Team Members" value={data.statistics?.teamSize || 0} icon={Users} trend={data.trends?.team || "neutral"} trendValue={`${data.statistics?.managersCount || 0} PM`} colorScheme="purple" />
//               <ModernKPICard label="Task Completion" value={`${data.statistics?.completionRate || 0}%`} icon={Target} trend={data.trends?.completion || "neutral"} trendValue={`${data.statistics?.completedTasks || 0}/${data.statistics?.totalTasks || 0}`} colorScheme="warning" />
//               <ModernKPICard label="Overdue Items" value={(data.statistics?.overdueTasks || 0) + (data.statistics?.overdueProjects || 0)} icon={AlertCircle} trend={(data.statistics?.overdueTasks || 0) > 0 ? "down" : "up"} trendValue={(data.statistics?.overdueTasks || 0) > 0 ? "Attention" : "On track"} colorScheme="danger" />
//             </div>

//             {/* Main Content Grid - 6 columns */}
//             <div className="flex-1 grid grid-cols-6 gap-3 min-h-0 overflow-hidden">
              
//               {/* Column 1: Charts */}
//               <div className="flex flex-col gap-3 min-h-0">
//                 <div className="flex-1 bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col">
//                   <div className="flex items-center justify-between mb-2 flex-shrink-0">
//                     <h3 className="text-sm font-bold text-slate-900">Projects</h3>
//                     <span className="text-xs font-bold text-blue-600">{data.statistics?.totalProjects || 0}</span>
//                   </div>
//                   <div className="flex-1 min-h-0">
//                     {data.chartData?.statusData?.length > 0 ? (
//                       <ResponsiveContainer width="100%" height="100%">
//                         <PieChart>
//                           <Pie data={data.chartData.statusData} cx="50%" cy="50%" innerRadius={25} outerRadius={45} paddingAngle={2} dataKey="value">
//                             {data.chartData.statusData.map((entry, index) => (
//                               <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
//                             ))}
//                           </Pie>
//                           <Tooltip />
//                         </PieChart>
//                       </ResponsiveContainer>
//                     ) : (
//                       <div className="flex items-center justify-center h-full">
//                         <p className="text-xs text-slate-400">No data</p>
//                       </div>
//                     )}
//                   </div>
//                   <div className="flex flex-wrap gap-1 mt-2 flex-shrink-0">
//                     {data.chartData?.statusData?.slice(0, 4).map((item, idx) => (
//                       <div key={idx} className="flex items-center space-x-1">
//                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
//                         <span className="text-[10px] text-slate-600">{item.name}: {item.value}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="flex-1 bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col">
//                   <div className="flex items-center justify-between mb-2 flex-shrink-0">
//                     <h3 className="text-sm font-bold text-slate-900">Tasks</h3>
//                     <span className="text-xs font-bold text-green-600">{data.statistics?.totalTasks || 0}</span>
//                   </div>
//                   <div className="flex-1 min-h-0">
//                     {data.chartData?.taskStatusData?.length > 0 ? (
//                       <ResponsiveContainer width="100%" height="100%">
//                         <PieChart>
//                           <Pie data={data.chartData.taskStatusData} cx="50%" cy="50%" innerRadius={25} outerRadius={45} paddingAngle={2} dataKey="value">
//                             {data.chartData.taskStatusData.map((entry, index) => (
//                               <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
//                             ))}
//                           </Pie>
//                           <Tooltip />
//                         </PieChart>
//                       </ResponsiveContainer>
//                     ) : (
//                       <div className="flex items-center justify-center h-full">
//                         <p className="text-xs text-slate-400">No data</p>
//                       </div>
//                     )}
//                   </div>
//                   <div className="flex flex-wrap gap-1 mt-2 flex-shrink-0">
//                     {data.chartData?.taskStatusData?.slice(0, 4).map((item, idx) => (
//                       <div key={idx} className="flex items-center space-x-1">
//                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
//                         <span className="text-[10px] text-slate-600">{item.name}: {item.value}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* Column 2: Projects */}
//               <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col min-h-0">
//                 <div className="flex items-center justify-between mb-3 flex-shrink-0">
//                   <div className="flex items-center space-x-2">
//                     <PlayCircle className="h-4 w-4 text-blue-600" />
//                     <h3 className="text-sm font-bold text-slate-900">Projects</h3>
//                   </div>
//                   <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{data.statistics?.totalProjects || 0}</span>
//                 </div>
//                 <div className="flex-1 overflow-y-auto space-y-2">
//                   {latestProjects.length > 0 ? (
//                     latestProjects.slice(0, 8).map((project, index) => {
//                       const statusConfig = getStatusConfig(project.status);
//                       return (
//                         <div key={project.id || index} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all" onClick={() => handleProjectClick(project)}>
//                           <div className="flex justify-between items-start mb-1.5">
//                             <h4 className="text-xs font-semibold text-slate-900 truncate flex-1">{safeString(project.title) || safeString(project.name) || "Untitled"}</h4>
//                             <span className="text-xs font-bold text-blue-600 ml-1">{Math.round(project.progress_percentage || project.progress || 0)}%</span>
//                           </div>
//                           <div className="flex items-center justify-between mb-1.5">
//                             <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusConfig.bg} ${statusConfig.text}`}>{project.status}</span>
//                             <span className="text-[10px] text-slate-400">{getRelativeTime(project.created_at)}</span>
//                           </div>
//                           <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
//                             <div className="h-full bg-blue-500 rounded-full" style={{ width: `${project.progress_percentage || project.progress || 0}%` }} />
//                           </div>
//                         </div>
//                       );
//                     })
//                   ) : (
//                     <div className="flex-1 flex items-center justify-center">
//                       <p className="text-xs text-slate-400">No projects</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Column 3: Tenders + Top Performers */}
//               <div className="flex flex-col gap-3 min-h-0">
//                 <div className="flex-1 bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col min-h-0">
//                   <div className="flex items-center justify-between mb-2 flex-shrink-0">
//                     <div className="flex items-center space-x-1">
//                       <FileText className="h-4 w-4 text-orange-600" />
//                       <h3 className="text-sm font-bold text-slate-900">Tenders</h3>
//                     </div>
//                     <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded">{data.statistics?.totalTenders || 0}</span>
//                   </div>
//                   <div className="flex-1 overflow-y-auto space-y-2">
//                     {latestTenders.length > 0 ? (
//                       latestTenders.slice(0, 4).map((tender, index) => {
//                         const statusConfig = getStatusConfig(tender.status);
//                         return (
//                           <div key={tender.id || index} className="p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-all" onClick={() => handleTenderClick(tender)}>
//                             <div className="flex justify-between items-start mb-1">
//                               <h4 className="text-xs font-semibold text-slate-900 truncate flex-1">{safeString(tender.title) || safeString(tender.name) || "Untitled"}</h4>
//                               <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ml-1 ${statusConfig.bg} ${statusConfig.text}`}>{tender.status}</span>
//                             </div>
//                             <div className="flex items-center justify-between">
//                               <span className="text-xs font-bold text-emerald-600">{formatCurrency(tender.budget_estimate || tender.value || tender.amount)}</span>
//                               <span className="text-[10px] text-slate-500">{formatDate(tender.deadline || tender.submission_deadline)}</span>
//                             </div>
//                           </div>
//                         );
//                       })
//                     ) : (
//                       <p className="text-xs text-slate-400 text-center py-2">No tenders</p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex-1 bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col min-h-0">
//                   <div className="flex items-center space-x-2 mb-2 flex-shrink-0">
//                     <Crown className="h-4 w-4 text-amber-500" />
//                     <h3 className="text-sm font-bold text-slate-900">Top Performers</h3>
//                   </div>
//                   <div className="flex-1 overflow-y-auto space-y-1.5">
//                     {(data.chartData?.topManagers || []).slice(0, 3).map((manager, index) => (
//                       <div 
//                         key={manager.id || index} 
//                         className="p-2 bg-blue-50 rounded-lg flex items-center space-x-2 cursor-pointer hover:bg-blue-100 hover:shadow-sm transition-all"
//                         onClick={() => handleManagerClick(manager)}
//                       >
//                         <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-[10px]">{manager.avatar}</div>
//                         <div className="flex-1 min-w-0">
//                           <p className="text-xs font-semibold text-slate-900 truncate">{manager.name}</p>
//                           <p className="text-[10px] text-blue-600">{Math.round(manager.performance)}% • {manager.projectsCount} proj</p>
//                         </div>
//                       </div>
//                     ))}
//                     {(data.chartData?.topSupervisors || []).slice(0, 2).map((supervisor, index) => (
//                       <div 
//                         key={supervisor.id || index} 
//                         className="p-2 bg-purple-50 rounded-lg flex items-center space-x-2 cursor-pointer hover:bg-purple-100 hover:shadow-sm transition-all"
//                         onClick={() => handleSupervisorClick(supervisor)}
//                       >
//                         <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px]">{supervisor.avatar}</div>
//                         <div className="flex-1 min-w-0">
//                           <p className="text-xs font-semibold text-slate-900 truncate">{supervisor.name}</p>
//                           <p className="text-[10px] text-purple-600">{Math.round(supervisor.performance)}% • {supervisor.projectsCount} proj</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* Column 4: Calendar */}
//               <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col min-h-0">
//                 <div className="flex items-center space-x-2 mb-2 flex-shrink-0">
//                   <Calendar className="h-4 w-4 text-purple-600" />
//                   <h3 className="text-sm font-bold text-slate-900">Calendar</h3>
//                 </div>
//                 <div className="flex-1 min-h-0">
//                   <EnhancedCalendar 
//                     events={data.events} 
//                     tasks={data.tasks} 
//                     meetings={data.meetings}
//                     onCreateMeeting={handleCreateMeeting} 
//                     teamMembers={data.allTeamMembers || []}
//                     projects={data.projects || []}
//                   />
//                 </div>
//               </div>

//               {/* Column 5: Meetings */}
//               <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col min-h-0">
//                 <div className="flex items-center justify-between mb-2 flex-shrink-0">
//                   <div className="flex items-center space-x-2">
//                     <Video className="h-4 w-4 text-amber-600" />
//                     <h3 className="text-sm font-bold text-slate-900">Meetings</h3>
//                   </div>
//                   <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">{data.statistics?.upcomingMeetings || 0}</span>
//                 </div>
//                 <div className="flex-1 overflow-y-auto">
//                   <MeetingsSection 
//                     meetings={data.meetings || []} 
//                     teamMembers={data.allTeamMembers || []}
//                     onMeetingClick={handleMeetingClick}
//                   />
//                 </div>
//               </div>

//               {/* Column 6: Activity */}
//               <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col min-h-0">
//                 <div className="flex items-center justify-between mb-2 flex-shrink-0">
//                   <div className="flex items-center space-x-2">
//                     <Activity className="h-4 w-4 text-indigo-600" />
//                     <h3 className="text-sm font-bold text-slate-900">Activity</h3>
//                   </div>
//                 </div>
//                 <div className="flex-1 overflow-y-auto">
//                   <RecentActivityFeed activities={data.recentActivity || []} onItemClick={handleActivityClick} />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         {!showFullscreen && (
//           <div className="bg-white/80 border-t border-slate-200 py-2 px-6 flex-shrink-0">
//             <div className="flex items-center justify-between text-xs text-slate-500">
//               <span className="font-medium">© 2025 Ujenzi & Paints • Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "Never"}</span>
//               <div className="flex items-center space-x-4">
//                 <span>Projects: <strong className="text-slate-700">{data.statistics?.totalProjects || 0}</strong></span>
//                 <span>Tasks: <strong className="text-slate-700">{data.statistics?.totalTasks || 0}</strong></span>
//                 <span>Team: <strong className="text-slate-700">{data.statistics?.teamSize || 0}</strong></span>
//                 <span>Meetings: <strong className="text-slate-700">{data.statistics?.upcomingMeetings || 0}</strong></span>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Modals */}
//       {selectedProject && (
//         <ProjectDetailModal 
//           project={selectedProject} 
//           managers={data.rawManagers || data.managers} 
//           onClose={() => setSelectedProject(null)} 
//         />
//       )}
//       {selectedTender && (
//         <TenderDetailModal 
//           tender={selectedTender} 
//           onClose={() => setSelectedTender(null)} 
//         />
//       )}
//       {selectedTask && (
//         <TaskDetailModal 
//           task={selectedTask} 
//           onClose={() => setSelectedTask(null)} 
//         />
//       )}
//     </div>
//   );
// };

// export default AdminDashboard;



import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../pages/admin/AdminSidebar";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
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
  Check,
  Activity,
  CheckCircle2,
  AlertCircle,
  Timer,
  MapPin,
  CalendarDays,
  CircleDollarSign,
  Receipt,
  Info,
  Maximize2,
  Minimize2,
  Video,
  Sun,
  Moon,
  Banknote,
  FileCheck,
  TrendingUp,
  Eye,
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
  meetingsAPI,
} from "../../services/api";

// ============================================
// DARK MODE CONTEXT
// ============================================
const DarkModeContext = createContext();

const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error("useDarkMode must be used within DarkModeProvider");
  }
  return context;
};

const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("dashboard-dark-mode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("dashboard-dark-mode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

// ============================================
// CHART COLORS
// ============================================
const CHART_COLORS = {
  primary: ["#0ea5e9", "#0284c7", "#0369a1", "#0c4a6e"],
  success: ["#22c55e", "#16a34a", "#15803d", "#166534"],
  warning: ["#f59e0b", "#d97706", "#b45309", "#92400e"],
  danger: ["#ef4444", "#dc2626", "#b91c1c", "#991b1b"],
  purple: ["#a855f7", "#9333ea", "#7c3aed", "#6d28d9"],
};

// ============================================
// CUSTOM HOOKS
// ============================================
const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return currentTime;
};

// ============================================
// HELPER FUNCTIONS
// ============================================
const extractArray = (res, key) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (key && res.data && Array.isArray(res.data[key])) return res.data[key];
  if (key && Array.isArray(res[key])) return res[key];
  if (res.data && res.data.data && Array.isArray(res.data.data)) return res.data.data;
  if (key && res.data && res.data.data && Array.isArray(res.data.data[key])) return res.data.data[key];
  return [];
};

const formatCurrency = (amount) => {
  if (!amount) return "TZS 0";
  const num = parseFloat(amount);
  if (num >= 1000000000) return "TZS " + (num / 1000000000).toFixed(1) + "B";
  if (num >= 1000000) return "TZS " + (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return "TZS " + (num / 1000).toFixed(0) + "K";
  return "TZS " + num.toLocaleString();
};

const formatCurrencyFull = (amount) => {
  if (!amount) return "TZS 0.00";
  const num = parseFloat(amount);
  return "TZS " + num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
    if (diffMins < 60) return diffMins + "m ago";
    if (diffHours < 24) return diffHours + "h ago";
    if (diffDays < 7) return diffDays + "d ago";
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
  return "Unassigned";
};

const sortByDateDesc = (items, dateField = "created_at") => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a[dateField] || a.updated_at || a.created_at || 0);
    const dateB = new Date(b[dateField] || b.updated_at || b.created_at || 0);
    return dateB - dateA;
  });
};

const getStatusConfig = (status, isDark = false) => {
  const configs = {
    active: { bg: isDark ? "bg-blue-900/40" : "bg-blue-100", text: isDark ? "text-blue-300" : "text-blue-700", dot: "bg-blue-500" },
    in_progress: { bg: isDark ? "bg-blue-900/40" : "bg-blue-100", text: isDark ? "text-blue-300" : "text-blue-700", dot: "bg-blue-500" },
    completed: { bg: isDark ? "bg-green-900/40" : "bg-green-100", text: isDark ? "text-green-300" : "text-green-700", dot: "bg-green-500" },
    pending: { bg: isDark ? "bg-yellow-900/40" : "bg-yellow-100", text: isDark ? "text-yellow-300" : "text-yellow-700", dot: "bg-yellow-500" },
    planning: { bg: isDark ? "bg-purple-900/40" : "bg-purple-100", text: isDark ? "text-purple-300" : "text-purple-700", dot: "bg-purple-500" },
    on_hold: { bg: isDark ? "bg-orange-900/40" : "bg-orange-100", text: isDark ? "text-orange-300" : "text-orange-700", dot: "bg-orange-500" },
    paused: { bg: isDark ? "bg-orange-900/40" : "bg-orange-100", text: isDark ? "text-orange-300" : "text-orange-700", dot: "bg-orange-500" },
    cancelled: { bg: isDark ? "bg-red-900/40" : "bg-red-100", text: isDark ? "text-red-300" : "text-red-700", dot: "bg-red-500" },
    overdue: { bg: isDark ? "bg-red-900/40" : "bg-red-100", text: isDark ? "text-red-300" : "text-red-700", dot: "bg-red-500" },
    open: { bg: isDark ? "bg-green-900/40" : "bg-green-100", text: isDark ? "text-green-300" : "text-green-700", dot: "bg-green-500" },
    closed: { bg: isDark ? "bg-slate-700" : "bg-slate-100", text: isDark ? "text-slate-300" : "text-slate-700", dot: "bg-slate-500" },
    awarded: { bg: isDark ? "bg-emerald-900/40" : "bg-emerald-100", text: isDark ? "text-emerald-300" : "text-emerald-700", dot: "bg-emerald-500" },
    draft: { bg: isDark ? "bg-slate-700" : "bg-slate-100", text: isDark ? "text-slate-400" : "text-slate-600", dot: "bg-slate-400" },
    scheduled: { bg: isDark ? "bg-blue-900/40" : "bg-blue-100", text: isDark ? "text-blue-300" : "text-blue-700", dot: "bg-blue-500" },
    upcoming: { bg: isDark ? "bg-purple-900/40" : "bg-purple-100", text: isDark ? "text-purple-300" : "text-purple-700", dot: "bg-purple-500" },
  };
  return configs[status] || { bg: isDark ? "bg-slate-700" : "bg-slate-100", text: isDark ? "text-slate-300" : "text-slate-700", dot: "bg-slate-500" };
};

// Extract meeting datetime from various possible fields
const extractMeetingDateTime = (meeting) => {
  const dateStr = meeting.start_time || meeting.scheduled_at || meeting.start_date || meeting.date;
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

// ============================================
// PROJECT DETAIL MODAL
// ============================================
const ProjectDetailModal = ({ project, managers, onClose, isDarkMode }) => {
  if (!project) return null;
  
  const statusConfig = getStatusConfig(project.status, isDarkMode);
  const progress = parseFloat(project.progress_percentage || project.progress || 0);
  const budget = parseFloat(project.budget || 0);
  const spent = parseFloat(project.spent || project.actual_cost || 0);
  const budgetUsed = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const daysRemaining = getDaysRemaining(project.end_date || project.deadline);

  // Calculate expected progress based on timeline
  const calculateExpectedProgress = () => {
    const startDate = project.start_date ? new Date(project.start_date) : null;
    const endDate = project.end_date || project.deadline ? new Date(project.end_date || project.deadline) : null;
    if (!startDate || !endDate) return null;
    const now = new Date();
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    if (totalDuration <= 0) return null;
    if (elapsed < 0) return 0;
    if (elapsed > totalDuration) return 100;
    return Math.round((elapsed / totalDuration) * 100);
  };

  const expectedProgress = calculateExpectedProgress();
  const progressDifference = expectedProgress !== null ? progress - expectedProgress : null;

  const getProgressStatus = () => {
    if (progressDifference === null) return { status: "unknown", color: "slate", label: "Timeline not set" };
    if (progressDifference >= 10) return { status: "ahead", color: "emerald", label: Math.abs(progressDifference).toFixed(0) + "% ahead of schedule" };
    if (progressDifference >= 0) return { status: "on-track", color: "blue", label: "On track" };
    if (progressDifference >= -10) return { status: "slightly-behind", color: "amber", label: Math.abs(progressDifference).toFixed(0) + "% behind schedule" };
    return { status: "behind", color: "red", label: Math.abs(progressDifference).toFixed(0) + "% behind schedule" };
  };

  const progressStatus = getProgressStatus();

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={(isDarkMode ? "bg-slate-800" : "bg-white") + " rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all"}
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
                <span className={"px-2 py-0.5 rounded-full text-xs font-semibold " + statusConfig.bg + " " + statusConfig.text}>
                  {(project.status || "unknown").replace(/_/g, " ").toUpperCase()}
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
        <div className={"p-6 overflow-y-auto max-h-[calc(90vh-200px)] " + (isDarkMode ? "text-slate-200" : "")}>
          {/* Progress Status Banner */}
          {progressStatus.status !== "unknown" && (
            <div className={"mb-4 p-3 rounded-xl flex items-center justify-between " + 
              (progressStatus.color === "emerald" ? (isDarkMode ? "bg-emerald-900/30 border border-emerald-700" : "bg-emerald-50 border border-emerald-200") :
               progressStatus.color === "blue" ? (isDarkMode ? "bg-blue-900/30 border border-blue-700" : "bg-blue-50 border border-blue-200") :
               progressStatus.color === "amber" ? (isDarkMode ? "bg-amber-900/30 border border-amber-700" : "bg-amber-50 border border-amber-200") :
               (isDarkMode ? "bg-red-900/30 border border-red-700" : "bg-red-50 border border-red-200"))
            }>
              <div className="flex items-center space-x-2">
                {progressStatus.status === "ahead" && <ArrowUpRight className="h-5 w-5 text-emerald-600" />}
                {progressStatus.status === "on-track" && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                {progressStatus.status === "slightly-behind" && <AlertCircle className="h-5 w-5 text-amber-600" />}
                {progressStatus.status === "behind" && <AlertTriangle className="h-5 w-5 text-red-600" />}
                <span className={"text-sm font-semibold " + 
                  (progressStatus.color === "emerald" ? "text-emerald-700" :
                   progressStatus.color === "blue" ? "text-blue-700" :
                   progressStatus.color === "amber" ? "text-amber-700" : "text-red-700")
                }>
                  {progressStatus.label}
                </span>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className={"text-sm font-semibold " + (isDarkMode ? "text-slate-300" : "text-slate-700")}>Current Progress</span>
              <span className="text-lg font-bold text-blue-600">{progress.toFixed(0)}%</span>
            </div>
            <div className={"w-full h-4 rounded-full overflow-hidden relative " + (isDarkMode ? "bg-slate-700" : "bg-slate-200")}>
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: Math.min(progress, 100) + "%" }}
              />
              {expectedProgress !== null && (
                <div 
                  className="absolute top-0 h-full w-1 bg-slate-800 opacity-60"
                  style={{ left: Math.min(expectedProgress, 100) + "%", transform: "translateX(-50%)" }}
                  title={"Expected: " + expectedProgress + "%"}
                >
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-slate-800"></div>
                </div>
              )}
            </div>
            {expectedProgress !== null && (
              <div className="flex items-center justify-center space-x-6 mt-3 pt-3 border-t border-slate-200">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-3 rounded bg-gradient-to-r from-blue-500 to-blue-600"></div>
                  <span className={"text-xs " + (isDarkMode ? "text-slate-400" : "text-slate-600")}>Current: {progress.toFixed(0)}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-3 rounded bg-slate-500"></div>
                  <span className={"text-xs " + (isDarkMode ? "text-slate-400" : "text-slate-600")}>Expected: {expectedProgress}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={(isDarkMode ? "bg-slate-700" : "bg-slate-50") + " rounded-xl p-4"}>
              <div className={"flex items-center space-x-2 mb-1 " + (isDarkMode ? "text-slate-400" : "text-slate-500")}>
                <CircleDollarSign className="h-4 w-4" />
                <span className="text-xs font-medium">Budget</span>
              </div>
              <div className={"text-lg font-bold " + (isDarkMode ? "text-slate-100" : "text-slate-900")}>{formatCurrency(budget)}</div>
            </div>
            <div className={(isDarkMode ? "bg-slate-700" : "bg-slate-50") + " rounded-xl p-4"}>
              <div className={"flex items-center space-x-2 mb-1 " + (isDarkMode ? "text-slate-400" : "text-slate-500")}>
                <Receipt className="h-4 w-4" />
                <span className="text-xs font-medium">Spent</span>
              </div>
              <div className={"text-lg font-bold " + (isDarkMode ? "text-slate-100" : "text-slate-900")}>{formatCurrency(spent)}</div>
              <div className={"text-xs " + (isDarkMode ? "text-slate-400" : "text-slate-500")}>{budgetUsed}% of budget</div>
            </div>
            <div className={(isDarkMode ? "bg-slate-700" : "bg-slate-50") + " rounded-xl p-4"}>
              <div className={"flex items-center space-x-2 mb-1 " + (isDarkMode ? "text-slate-400" : "text-slate-500")}>
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs font-medium">Start Date</span>
              </div>
              <div className={"text-sm font-bold " + (isDarkMode ? "text-slate-100" : "text-slate-900")}>{formatDate(project.start_date)}</div>
            </div>
            <div className={(isDarkMode ? "bg-slate-700" : "bg-slate-50") + " rounded-xl p-4"}>
              <div className={"flex items-center space-x-2 mb-1 " + (isDarkMode ? "text-slate-400" : "text-slate-500")}>
                <Timer className="h-4 w-4" />
                <span className="text-xs font-medium">End Date</span>
              </div>
              <div className={"text-sm font-bold " + (isDarkMode ? "text-slate-100" : "text-slate-900")}>{formatDate(project.end_date || project.deadline)}</div>
              {daysRemaining !== null && (
                <div className={"text-xs " + (daysRemaining < 0 ? "text-red-500" : daysRemaining < 7 ? "text-orange-500" : "text-green-500")}>
                  {daysRemaining < 0 ? Math.abs(daysRemaining) + " days overdue" : daysRemaining + " days left"}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="mb-6">
              <h3 className={"text-sm font-semibold mb-2 flex items-center " + (isDarkMode ? "text-slate-300" : "text-slate-700")}>
                <Info className="h-4 w-4 mr-2" />
                Description
              </h3>
              <p className={"text-sm rounded-xl p-4 " + (isDarkMode ? "text-slate-400 bg-slate-700" : "text-slate-600 bg-slate-50")}>{project.description}</p>
            </div>
          )}

          {/* Team */}
          <div className="mb-6">
            <h3 className={"text-sm font-semibold mb-3 flex items-center " + (isDarkMode ? "text-slate-300" : "text-slate-700")}>
              <Users className="h-4 w-4 mr-2" />
              Team
            </h3>
            <div className={"flex items-center space-x-3 p-3 rounded-xl " + (isDarkMode ? "bg-slate-700" : "bg-slate-50")}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {getProjectAssignee(project, managers).split(" ").map((n) => n[0]).join("").substring(0, 2)}
              </div>
              <div>
                <div className={"text-sm font-semibold " + (isDarkMode ? "text-slate-200" : "text-slate-900")}>{getProjectAssignee(project, managers)}</div>
                <div className={"text-xs " + (isDarkMode ? "text-slate-400" : "text-slate-500")}>Project Manager</div>
              </div>
            </div>
          </div>

          {/* Location */}
          {project.location && (
            <div className={"flex items-center space-x-3 p-3 rounded-xl " + (isDarkMode ? "bg-slate-700" : "bg-slate-50")}>
              <MapPin className={"h-4 w-4 " + (isDarkMode ? "text-slate-400" : "text-slate-500")} />
              <span className={"text-sm " + (isDarkMode ? "text-slate-300" : "text-slate-700")}>{safeString(project.location)}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={"border-t p-4 flex items-center justify-center " + (isDarkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50")}>
          <button
            onClick={onClose}
            className={"px-6 py-2.5 text-sm font-semibold border rounded-lg transition-colors " + (isDarkMode ? "text-slate-300 bg-slate-700 border-slate-600 hover:bg-slate-600" : "text-slate-600 bg-white border-slate-200 hover:bg-slate-50")}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// TENDER DETAIL MODAL
// ============================================
const TenderDetailModal = ({ tender, onClose, isDarkMode }) => {
  if (!tender) return null;
  
  const statusConfig = getStatusConfig(tender.status, isDarkMode);
  const budget = parseFloat(tender.budget_estimate || tender.value || tender.amount || 0);
  const daysRemaining = getDaysRemaining(tender.deadline || tender.submission_deadline);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={(isDarkMode ? "bg-slate-800" : "bg-white") + " rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"}
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
                <span className={"px-2 py-0.5 rounded-full text-xs font-semibold " + statusConfig.bg + " " + statusConfig.text}>
                  {(tender.status || "unknown").replace(/_/g, " ").toUpperCase()}
                </span>
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
        <div className={"p-6 overflow-y-auto max-h-[calc(90vh-200px)] " + (isDarkMode ? "text-slate-200" : "")}>
          {/* Deadline Banner */}
          {daysRemaining !== null && (
            <div className={"mb-6 p-4 rounded-xl flex items-center space-x-3 " +
              (daysRemaining < 0 
                ? (isDarkMode ? "bg-red-900/30 border border-red-700" : "bg-red-50 border border-red-200")
                : daysRemaining < 7 
                ? (isDarkMode ? "bg-orange-900/30 border border-orange-700" : "bg-orange-50 border border-orange-200")
                : (isDarkMode ? "bg-green-900/30 border border-green-700" : "bg-green-50 border border-green-200"))
            }>
              <Timer className={"h-5 w-5 " + (daysRemaining < 0 ? "text-red-500" : daysRemaining < 7 ? "text-orange-500" : "text-green-500")} />
              <div>
                <div className={"text-sm font-semibold " + (daysRemaining < 0 ? "text-red-700" : daysRemaining < 7 ? "text-orange-700" : "text-green-700")}>
                  {daysRemaining < 0 
                    ? "Deadline passed " + Math.abs(daysRemaining) + " days ago"
                    : daysRemaining === 0 
                    ? "Deadline is today!"
                    : daysRemaining + " days until deadline"}
                </div>
                <div className={"text-xs " + (isDarkMode ? "text-slate-400" : "text-slate-600")}>
                  {formatDateFull(tender.deadline || tender.submission_deadline)}
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className={(isDarkMode ? "bg-slate-700" : "bg-slate-50") + " rounded-xl p-4"}>
              <div className={"flex items-center space-x-2 mb-1 " + (isDarkMode ? "text-slate-400" : "text-slate-500")}>
                <Banknote className="h-4 w-4" />
                <span className="text-xs font-medium">Budget Estimate</span>
              </div>
              <div className="text-lg font-bold text-emerald-600">{formatCurrencyFull(budget)}</div>
            </div>
            <div className={(isDarkMode ? "bg-slate-700" : "bg-slate-50") + " rounded-xl p-4"}>
              <div className={"flex items-center space-x-2 mb-1 " + (isDarkMode ? "text-slate-400" : "text-slate-500")}>
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs font-medium">Deadline</span>
              </div>
              <div className={"text-sm font-bold " + (isDarkMode ? "text-slate-100" : "text-slate-900")}>
                {formatDate(tender.deadline || tender.submission_deadline)}
              </div>
            </div>
            <div className={(isDarkMode ? "bg-slate-700" : "bg-slate-50") + " rounded-xl p-4"}>
              <div className={"flex items-center space-x-2 mb-1 " + (isDarkMode ? "text-slate-400" : "text-slate-500")}>
                <FileCheck className="h-4 w-4" />
                <span className="text-xs font-medium">Submissions</span>
              </div>
              <div className={"text-lg font-bold " + (isDarkMode ? "text-slate-100" : "text-slate-900")}>{tender.submissions_count || tender.bids_count || 0}</div>
            </div>
          </div>

          {/* Description */}
          {tender.description && (
            <div className="mb-6">
              <h3 className={"text-sm font-semibold mb-2 flex items-center " + (isDarkMode ? "text-slate-300" : "text-slate-700")}>
                <Info className="h-4 w-4 mr-2" />
                Description
              </h3>
              <p className={"text-sm rounded-xl p-4 " + (isDarkMode ? "text-slate-400 bg-slate-700" : "text-slate-600 bg-slate-50")}>{tender.description}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={"border-t p-4 flex items-center justify-center " + (isDarkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50")}>
          <button
            onClick={onClose}
            className={"px-6 py-2.5 text-sm font-semibold border rounded-lg transition-colors " + (isDarkMode ? "text-slate-300 bg-slate-700 border-slate-600 hover:bg-slate-600" : "text-slate-600 bg-white border-slate-200 hover:bg-slate-50")}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// TASK DETAIL MODAL
// ============================================
const TaskDetailModal = ({ task, onClose, isDarkMode }) => {
  if (!task) return null;
  
  const statusConfig = getStatusConfig(task.status, isDarkMode);
  const daysRemaining = getDaysRemaining(task.due_date || task.deadline);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={(isDarkMode ? "bg-slate-800" : "bg-white") + " rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"}
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
                <span className={"px-2 py-0.5 rounded-full text-xs font-semibold " + statusConfig.bg + " " + statusConfig.text}>
                  {(task.status || "unknown").replace(/_/g, " ").toUpperCase()}
                </span>
                {task.priority && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">
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
        <div className={"p-6 overflow-y-auto max-h-[calc(90vh-200px)] " + (isDarkMode ? "text-slate-200" : "")}>
          {/* Due Date Banner */}
          {daysRemaining !== null && (
            <div className={"mb-6 p-4 rounded-xl flex items-center space-x-3 " +
              (daysRemaining < 0 
                ? (isDarkMode ? "bg-red-900/30 border border-red-700" : "bg-red-50 border border-red-200")
                : daysRemaining < 3 
                ? (isDarkMode ? "bg-orange-900/30 border border-orange-700" : "bg-orange-50 border border-orange-200")
                : (isDarkMode ? "bg-green-900/30 border border-green-700" : "bg-green-50 border border-green-200"))
            }>
              <Timer className={"h-5 w-5 " + (daysRemaining < 0 ? "text-red-500" : daysRemaining < 3 ? "text-orange-500" : "text-green-500")} />
              <div>
                <div className={"text-sm font-semibold " + (daysRemaining < 0 ? "text-red-700" : daysRemaining < 3 ? "text-orange-700" : "text-green-700")}>
                  {daysRemaining < 0 
                    ? "Overdue by " + Math.abs(daysRemaining) + " days"
                    : daysRemaining === 0 
                    ? "Due today!"
                    : "Due in " + daysRemaining + " days"}
                </div>
                <div className={"text-xs " + (isDarkMode ? "text-slate-400" : "text-slate-600")}>{formatDateFull(task.due_date || task.deadline)}</div>
              </div>
            </div>
          )}

          {/* Description */}
          {task.description && (
            <div className="mb-6">
              <h3 className={"text-sm font-semibold mb-2 flex items-center " + (isDarkMode ? "text-slate-300" : "text-slate-700")}>
                <Info className="h-4 w-4 mr-2" />
                Description
              </h3>
              <p className={"text-sm rounded-xl p-4 " + (isDarkMode ? "text-slate-400 bg-slate-700" : "text-slate-600 bg-slate-50")}>{task.description}</p>
            </div>
          )}

          {/* Assignee */}
          {task.assigned_to && (
            <div className={"flex items-center space-x-3 p-3 rounded-xl " + (isDarkMode ? "bg-slate-700" : "bg-slate-50")}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                {safeString(task.assigned_to).split(" ").map((n) => n[0]).join("").substring(0, 2) || "U"}
              </div>
              <div>
                <div className={"text-sm font-semibold " + (isDarkMode ? "text-slate-200" : "text-slate-900")}>{safeString(task.assigned_to)}</div>
                <div className={"text-xs " + (isDarkMode ? "text-slate-400" : "text-slate-500")}>Assigned to</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={"border-t p-4 flex items-center justify-center " + (isDarkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50")}>
          <button
            onClick={onClose}
            className={"px-6 py-2.5 text-sm font-semibold border rounded-lg transition-colors " + (isDarkMode ? "text-slate-300 bg-slate-700 border-slate-600 hover:bg-slate-600" : "text-slate-600 bg-white border-slate-200 hover:bg-slate-50")}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MEETING DETAIL MODAL
// ============================================
const MeetingDetailModal = ({ meeting, onClose, isDarkMode }) => {
  if (!meeting) return null;
  
  const meetingDate = extractMeetingDateTime(meeting);
  const meetingType = meeting.meeting_type || meeting.type || "general";

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={(isDarkMode ? "bg-slate-800" : "bg-white") + " rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Video className="h-8 w-8" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">
                  {meetingType.replace(/_/g, " ").toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-bold truncate">
                {safeString(meeting.title) || safeString(meeting.name) || "Untitled Meeting"}
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                {meetingDate ? meetingDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "Date TBD"}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={"p-6 overflow-y-auto max-h-[calc(90vh-200px)] " + (isDarkMode ? "text-slate-200" : "")}>
          {/* Time Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={(isDarkMode ? "bg-slate-700" : "bg-slate-50") + " rounded-xl p-4"}>
              <div className={"flex items-center space-x-2 mb-1 " + (isDarkMode ? "text-slate-400" : "text-slate-500")}>
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">Time</span>
              </div>
              <div className={"text-lg font-bold " + (isDarkMode ? "text-slate-100" : "text-slate-900")}>
                {meetingDate ? meetingDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "TBD"}
              </div>
            </div>
            {meeting.location && (
              <div className={(isDarkMode ? "bg-slate-700" : "bg-slate-50") + " rounded-xl p-4"}>
                <div className={"flex items-center space-x-2 mb-1 " + (isDarkMode ? "text-slate-400" : "text-slate-500")}>
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs font-medium">Location</span>
                </div>
                <div className={"text-sm font-bold " + (isDarkMode ? "text-slate-100" : "text-slate-900")}>{meeting.location}</div>
              </div>
            )}
          </div>

          {/* Description */}
          {meeting.description && (
            <div className="mb-6">
              <h3 className={"text-sm font-semibold mb-2 flex items-center " + (isDarkMode ? "text-slate-300" : "text-slate-700")}>
                <Info className="h-4 w-4 mr-2" />
                Agenda / Notes
              </h3>
              <p className={"text-sm rounded-xl p-4 " + (isDarkMode ? "text-slate-400 bg-slate-700" : "text-slate-600 bg-slate-50")}>{meeting.description}</p>
            </div>
          )}

          {/* Attendees */}
          {(meeting.participants || meeting.attendees) && (
            <div>
              <h3 className={"text-sm font-semibold mb-3 flex items-center " + (isDarkMode ? "text-slate-300" : "text-slate-700")}>
                <Users className="h-4 w-4 mr-2" />
                Attendees
              </h3>
              <div className="flex flex-wrap gap-2">
                {(meeting.participants || meeting.attendees || []).map((attendee, idx) => (
                  <div key={idx} className={"flex items-center space-x-2 px-3 py-2 rounded-lg " + (isDarkMode ? "bg-slate-700" : "bg-slate-50")}>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px]">
                      {(attendee.name || attendee.full_name || String(attendee)).split(" ").map((n) => n[0]).join("").substring(0, 2)}
                    </div>
                    <span className={"text-xs font-medium " + (isDarkMode ? "text-slate-300" : "text-slate-700")}>{attendee.name || attendee.full_name || String(attendee)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={"border-t p-4 flex items-center justify-center " + (isDarkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50")}>
          <button
            onClick={onClose}
            className={"px-6 py-2.5 text-sm font-semibold border rounded-lg transition-colors " + (isDarkMode ? "text-slate-300 bg-slate-700 border-slate-600 hover:bg-slate-600" : "text-slate-600 bg-white border-slate-200 hover:bg-slate-50")}
          >
            Close
          </button>
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
    meetings: [],
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
        meetingsResponse,
        supervisorsResponse,
        siteManagersResponse,
      ] = await Promise.allSettled([
        projectsAPI.getAll({ all: true, scope: "admin", admin: true, per_page: 1000 }).catch(() => ({ projects: [] })),
        fetchProjectManagers().catch(() => []),
        eventsAPI.getAll ? eventsAPI.getAll({ all: true, per_page: 100 }).catch(() => ({ events: [] })) : Promise.resolve({ events: [] }),
        tasksAPI.getAll({ all: true, scope: "admin", admin: true, per_page: 1000 }).catch(() => ({ tasks: [] })),
        tendersAPI.getAll({ all: true, scope: "admin", admin: true, per_page: 500 }).catch(() => ({ tenders: [] })),
        meetingsAPI.getAll({ all: true, per_page: 100 }).catch((err) => {
          console.error("Error fetching meetings:", err);
          return { meetings: [] };
        }),
        supervisorsAPI.getAll().catch(() => []),
        siteManagersAPI.getAll().catch(() => []),
      ]);

      const projectsData = projectsResponse.status === "fulfilled" ? projectsResponse.value : { projects: [] };
      const managersData = managersResponse.status === "fulfilled" ? managersResponse.value : [];
      const eventsData = eventsResponse.status === "fulfilled" ? eventsResponse.value : { events: [] };
      const tasksData = tasksResponse.status === "fulfilled" ? tasksResponse.value : { tasks: [] };
      const tendersData = tendersResponse.status === "fulfilled" ? tendersResponse.value : { tenders: [] };
      const meetingsData = meetingsResponse.status === "fulfilled" ? meetingsResponse.value : { meetings: [] };
      const supervisorsData = supervisorsResponse.status === "fulfilled" ? supervisorsResponse.value : [];
      const siteManagersData = siteManagersResponse.status === "fulfilled" ? siteManagersResponse.value : [];

      let projects = extractArray(projectsData, "projects");
      let events = extractArray(eventsData, "events");
      let tasks = extractArray(tasksData, "tasks");
      let tenders = extractArray(tendersData, "tenders");
      
      // Meetings extraction with multiple fallbacks
      console.log("📅 === MEETINGS DEBUG ===");
      console.log("📅 Raw meetingsData:", meetingsData);
      
      let meetings = [];
      if (meetingsData) {
        if (Array.isArray(meetingsData)) {
          meetings = meetingsData;
          console.log("📅 Extracted as direct array");
        } else if (meetingsData.data && Array.isArray(meetingsData.data.meetings)) {
          meetings = meetingsData.data.meetings;
          console.log("📅 Extracted from data.meetings");
        } else if (meetingsData.data && Array.isArray(meetingsData.data)) {
          meetings = meetingsData.data;
          console.log("📅 Extracted from data array");
        } else if (Array.isArray(meetingsData.meetings)) {
          meetings = meetingsData.meetings;
          console.log("📅 Extracted from meetings key");
        }
      }
      
      console.log("📅 Extracted meetings count:", meetings.length);
      if (meetings.length > 0) {
        console.log("📅 Sample meeting:", meetings[0]);
        console.log("📅 Meeting date fields:", {
          start_time: meetings[0].start_time,
          scheduled_at: meetings[0].scheduled_at,
          date: meetings[0].date,
          start_date: meetings[0].start_date,
        });
      }
      
      const supervisors = extractArray(supervisorsData, "supervisors");
      const siteManagers = extractArray(siteManagersData, "site_managers");

      projects = sortByDateDesc(projects, "created_at");
      events = sortByDateDesc(events, "date");
      tasks = sortByDateDesc(tasks, "created_at");
      tenders = sortByDateDesc(tenders, "created_at");
      
      // Sort meetings by date ascending (upcoming first)
      meetings = [...meetings].sort((a, b) => {
        const dateA = extractMeetingDateTime(a);
        const dateB = extractMeetingDateTime(b);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.getTime() - dateB.getTime();
      });
      
      const rawManagersData = Array.isArray(managersData) ? managersData : managersData?.data && Array.isArray(managersData.data) ? managersData.data : [];

      const managers = (Array.isArray(managersData) ? managersData : rawManagersData).map((manager) => {
        const managerProjects = projects.filter((p) => p.project_manager_id === manager.id || p.manager_id === manager.id);
        const managerName = safeString(manager.name) || "Unknown Manager";
        return {
          id: manager.id || Math.random().toString(),
          name: managerName,
          email: safeString(manager.email) || "unknown@email.com",
          projectsCount: manager.number_of_projects || managerProjects.length || 0,
          avatar: managerName.split(" ").map((n) => n[0]).join("").substring(0, 2) || "M",
          role: "Manager",
          performance: 75 + Math.random() * 25,
        };
      });

      const processedSupervisors = supervisors.map((supervisor) => {
        const supervisorName = safeString(supervisor.name) || "Unknown Supervisor";
        return {
          id: supervisor.id || Math.random().toString(),
          name: supervisorName,
          email: safeString(supervisor.email) || "unknown@email.com",
          projectsCount: supervisor.number_of_projects || 0,
          avatar: supervisorName.split(" ").map((n) => n[0]).join("").substring(0, 2) || "S",
          role: "Supervisor",
          performance: 70 + Math.random() * 30,
        };
      });

      const processedSiteManagers = siteManagers.map((siteManager) => {
        const siteManagerName = safeString(siteManager.name) || "Unknown Site Manager";
        return {
          id: siteManager.id || Math.random().toString(),
          name: siteManagerName,
          email: safeString(siteManager.email) || "unknown@email.com",
          projectsCount: siteManager.number_of_projects || 0,
          avatar: siteManagerName.split(" ").map((n) => n[0]).join("").substring(0, 2) || "SM",
          role: "Site Manager",
          performance: 75 + Math.random() * 25,
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
      const teamSize = managers.length + processedSupervisors.length + processedSiteManagers.length;

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

      // Calculate meeting statistics
      const now = new Date();
      const upcomingMeetingsCount = meetings.filter((m) => {
        const meetingDate = extractMeetingDateTime(m);
        return meetingDate && meetingDate >= now;
      }).length;

      const todayMeetingsCount = meetings.filter((m) => {
        const meetingDate = extractMeetingDateTime(m);
        return meetingDate && meetingDate.toDateString() === now.toDateString();
      }).length;

      console.log("📅 Upcoming meetings count:", upcomingMeetingsCount);
      console.log("📅 Today meetings count:", todayMeetingsCount);

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
        totalMeetings: meetings.length || 0,
        upcomingMeetings: upcomingMeetingsCount,
        todayMeetings: todayMeetingsCount,
        totalBudget,
        spentBudget,
        budgetUtilization: totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      };

      const trends = {
        projects: statistics.activeProjects > 0 ? "up" : "neutral",
        projectsValue: statistics.activeProjects + " active",
        budget: statistics.totalBudget > 0 ? "up" : "neutral",
        budgetValue: formatCurrency(statistics.totalBudget),
        team: teamSize > 0 ? "neutral" : "down",
        teamValue: teamSize + " members",
        completion: statistics.completionRate >= 50 ? "up" : statistics.completionRate > 0 ? "neutral" : "down",
        completionValue: statistics.completionRate + "%",
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

      // Monthly trend data
      const monthlyTrend = [];
      const nowDate = new Date();
      for (let i = 5; i >= 0; i--) {
        const month = new Date(nowDate.getFullYear(), nowDate.getMonth() - i, 1);
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
          id: "project-" + p.id,
          type: "project",
          title: safeString(p.title) || safeString(p.name) || "Untitled Project",
          status: p.status,
          date: p.created_at || p.updated_at,
          user: getProjectAssignee(p, rawManagersData),
          icon: Building2,
          data: p,
        })),
        ...tasks.slice(0, 10).map((t) => ({
          id: "task-" + t.id,
          type: "task",
          title: safeString(t.title) || safeString(t.name) || "Untitled Task",
          status: t.status,
          date: t.created_at || t.updated_at,
          user: safeString(t.assigned_to) || "Unassigned",
          icon: CheckCircle2,
          data: t,
        })),
        ...tenders.slice(0, 10).map((t) => ({
          id: "tender-" + t.id,
          type: "tender",
          title: safeString(t.title) || safeString(t.name) || "Untitled Tender",
          status: t.status,
          date: t.created_at || t.updated_at,
          user: safeString(t.created_by) || "System",
          icon: FileText,
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
        events,
        tasks,
        tenders,
        meetings,
        supervisors: processedSupervisors,
        siteManagers: processedSiteManagers,
        chartData,
        trends,
        allTeamMembers,
        recentActivity,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard data fetch failed:", err);
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
const ModernKPICard = ({ label, value, icon: Icon, trend, trendValue, colorScheme = "primary", isDarkMode }) => {
  const colorSchemes = {
    primary: { iconBg: "bg-gradient-to-br from-blue-500 to-blue-600", accent: isDarkMode ? "text-blue-400" : "text-blue-600" },
    success: { iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600", accent: isDarkMode ? "text-emerald-400" : "text-emerald-600" },
    warning: { iconBg: "bg-gradient-to-br from-amber-500 to-amber-600", accent: isDarkMode ? "text-amber-400" : "text-amber-600" },
    purple: { iconBg: "bg-gradient-to-br from-purple-500 to-purple-600", accent: isDarkMode ? "text-purple-400" : "text-purple-600" },
    danger: { iconBg: "bg-gradient-to-br from-red-500 to-red-600", accent: isDarkMode ? "text-red-400" : "text-red-600" },
  };
  const colors = colorSchemes[colorScheme];

  return (
    <div className={(isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200") + " rounded-xl p-4 border shadow-sm hover:shadow-md transition-all"}>
      <div className="flex items-center justify-between">
        <div className={colors.iconBg + " p-2.5 rounded-xl shadow-lg"}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="text-right">
          <div className={"text-3xl font-bold " + colors.accent}>{value}</div>
          <div className={"text-sm font-semibold " + (isDarkMode ? "text-slate-300" : "text-slate-700")}>{label}</div>
        </div>
      </div>
      {trend && trendValue && (
        <div className={"mt-2 text-xs font-medium flex items-center justify-end space-x-1 " + (trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : isDarkMode ? "text-slate-400" : "text-slate-500")}>
          {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
};

// ============================================
// MEETINGS SECTION COMPONENT
// ============================================
const MeetingsSection = ({ meetings = [], teamMembers = [], onMeetingClick, isDarkMode }) => {
  const now = new Date();

  const formatMeetingDate = (meeting) => {
    const date = extractMeetingDateTime(meeting);
    if (!date) return "TBD";
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatMeetingTime = (meeting) => {
    const date = extractMeetingDateTime(meeting);
    if (!date) return meeting.time || "TBD";
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const getMeetingTypeColor = (type) => {
    const colors = {
      general: isDarkMode ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600",
      project_review: isDarkMode ? "bg-blue-900/50 text-blue-300" : "bg-blue-100 text-blue-600",
      planning: isDarkMode ? "bg-purple-900/50 text-purple-300" : "bg-purple-100 text-purple-600",
      standup: isDarkMode ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-600",
      client: isDarkMode ? "bg-amber-900/50 text-amber-300" : "bg-amber-100 text-amber-600",
      urgent: isDarkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-600",
    };
    return colors[type] || colors.general;
  };

  const getAttendeeNames = (meeting) => {
    if (Array.isArray(meeting.participants)) {
      return meeting.participants.map((p) => p.name || p.full_name || String(p)).filter(Boolean);
    }
    if (Array.isArray(meeting.attendees)) {
      return meeting.attendees.map((a) => a.name || String(a)).filter(Boolean);
    }
    return [];
  };

  const upcomingMeetings = meetings
    .filter((m) => {
      const dt = extractMeetingDateTime(m);
      return dt && dt >= now;
    })
    .slice(0, 6);

  const todayMeetings = meetings.filter((m) => {
    const dt = extractMeetingDateTime(m);
    return dt && dt.toDateString() === now.toDateString();
  });

  return (
    <div className="space-y-2">
      {/* Today's Meetings Banner */}
      {todayMeetings.length > 0 && (
        <div className={(isDarkMode ? "bg-amber-900/30 border-amber-700" : "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200") + " border rounded-lg p-2 mb-2"}>
          <div className="flex items-center space-x-1.5">
            <Clock className={(isDarkMode ? "text-amber-400" : "text-amber-600") + " h-3.5 w-3.5"} />
            <span className={(isDarkMode ? "text-amber-300" : "text-amber-800") + " text-xs font-semibold"}>
              Today: {todayMeetings.length} meeting{todayMeetings.length > 1 ? "s" : ""}
            </span>
          </div>
          <p className={(isDarkMode ? "text-amber-400" : "text-amber-700") + " text-[10px] mt-0.5 truncate"}>
            Next: {todayMeetings[0]?.title || "Untitled"} @ {formatMeetingTime(todayMeetings[0])}
          </p>
        </div>
      )}

      {/* Upcoming Meetings List */}
      {upcomingMeetings.length > 0 ? (
        upcomingMeetings.map((meeting, index) => {
          const attendees = getAttendeeNames(meeting).slice(0, 3);
          const countExtra = Math.max(0, (meeting.participants?.length || meeting.attendees?.length || 0) - 3);
          const isToday = formatMeetingDate(meeting) === "Today";

          return (
            <div
              key={meeting.id || index}
              onClick={() => onMeetingClick && onMeetingClick(meeting)}
              className={(isToday 
                ? (isDarkMode ? "bg-amber-900/20 border-amber-700 hover:border-amber-600" : "bg-amber-50 border-amber-200 hover:border-amber-300")
                : (isDarkMode ? "bg-slate-700/50 border-slate-600 hover:border-slate-500" : "bg-white border-slate-200 hover:border-slate-300")
              ) + " p-2.5 rounded-lg border cursor-pointer transition-all hover:shadow-sm"}
            >
              <div className="flex items-start justify-between mb-1.5">
                <h4 className={(isDarkMode ? "text-slate-200" : "text-slate-900") + " text-xs font-semibold truncate flex-1 pr-2"}>
                  {meeting.title || meeting.name || "Untitled Meeting"}
                </h4>
                <div className="text-right flex-shrink-0">
                  <div className={(isToday ? (isDarkMode ? "text-amber-400" : "text-amber-700") : (isDarkMode ? "text-slate-400" : "text-slate-600")) + " text-[10px] font-bold"}>
                    {formatMeetingDate(meeting)}
                  </div>
                  <div className={(isDarkMode ? "text-slate-200" : "text-slate-900") + " text-xs font-semibold"}>
                    {formatMeetingTime(meeting)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={getMeetingTypeColor(meeting.meeting_type || meeting.type) + " text-[9px] font-medium px-1.5 py-0.5 rounded"}>
                  {(meeting.meeting_type || meeting.type || "general").replace(/_/g, " ")}
                </span>

                {attendees.length > 0 && (
                  <div className="flex -space-x-1.5">
                    {attendees.map((name, idx) => (
                      <div
                        key={idx}
                        className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[8px] font-bold border border-white"
                        title={name}
                      >
                        {String(name).split(" ").map((n) => n[0]).join("").substring(0, 2)}
                      </div>
                    ))}
                    {countExtra > 0 && (
                      <div className={(isDarkMode ? "bg-slate-600 text-slate-300" : "bg-slate-200 text-slate-600") + " w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold border border-white"}>
                        +{countExtra}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {meeting.location && (
                <div className={(isDarkMode ? "text-slate-400" : "text-slate-500") + " flex items-center space-x-1 text-[10px] mt-1.5"}>
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{meeting.location}</span>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className={(isDarkMode ? "bg-slate-700" : "bg-slate-100") + " w-10 h-10 rounded-full flex items-center justify-center mb-2"}>
            <Calendar className={(isDarkMode ? "text-slate-500" : "text-slate-400") + " h-5 w-5"} />
          </div>
          <p className={(isDarkMode ? "text-slate-400" : "text-slate-500") + " text-xs"}>No upcoming meetings</p>
          <p className={(isDarkMode ? "text-slate-500" : "text-slate-400") + " text-[10px]"}>Schedule one from calendar</p>
        </div>
      )}
    </div>
  );
};

// ============================================
// RECENT ACTIVITY FEED
// ============================================
const RecentActivityFeed = ({ activities, onItemClick, isDarkMode }) => {
  const getTypeColor = (type) => {
    const colors = { project: "from-blue-500 to-blue-600", task: "from-green-500 to-green-600", tender: "from-orange-500 to-orange-600" };
    return colors[type] || "from-slate-500 to-slate-600";
  };

  return (
    <div className="space-y-2">
      {activities.length > 0 ? (
        activities.slice(0, 10).map((activity, index) => {
          const Icon = activity.icon || Activity;
          const statusConfig = getStatusConfig(activity.status, isDarkMode);
          return (
            <div 
              key={activity.id || index} 
              onClick={() => onItemClick && onItemClick(activity)} 
              className={(isDarkMode ? "bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-slate-500" : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300") + " p-2 rounded-lg border cursor-pointer transition-all group"}
            >
              <div className="flex items-start space-x-2">
                <div className={"p-1.5 rounded bg-gradient-to-br shadow-sm flex-shrink-0 " + getTypeColor(activity.type)}>
                  <Icon className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className={(isDarkMode ? "text-slate-200 group-hover:text-blue-400" : "text-slate-900 group-hover:text-blue-600") + " text-xs font-semibold truncate transition-colors"}>
                      {activity.title}
                    </h4>
                    <span className={statusConfig.bg + " " + statusConfig.text + " text-[9px] font-medium px-1.5 py-0.5 rounded"}>
                      {activity.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={(isDarkMode ? "text-slate-400" : "text-slate-500") + " text-[10px] truncate"}>{activity.user}</span>
                    <span className={(isDarkMode ? "text-slate-500" : "text-slate-400") + " text-[9px]"}>{getRelativeTime(activity.date)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex items-center justify-center h-20">
          <p className={(isDarkMode ? "text-slate-500" : "text-slate-400") + " text-xs"}>No recent activity</p>
        </div>
      )}
    </div>
  );
};

// ============================================
// ENHANCED CALENDAR COMPONENT
// ============================================
const EnhancedCalendar = ({ meetings = [], events = [], tasks = [], onCreateMeeting, teamMembers = [], projects = [], isDarkMode }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    date: "",
    start_time: "09:00",
    end_time: "10:00",
    location: "",
    meeting_type: "general",
    project_id: "",
    attendees: [],
  });

  const today = new Date();
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getActivitiesForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    
    const dayMeetings = meetings.filter((m) => {
      const mDate = extractMeetingDateTime(m);
      return mDate && mDate.toISOString().split("T")[0] === dateStr;
    });

    const dayEvents = events.filter((e) => {
      const eDate = new Date(e.date || e.start_date);
      return !isNaN(eDate.getTime()) && eDate.toISOString().split("T")[0] === dateStr;
    });

    const dayTasks = tasks.filter((t) => {
      const tDate = new Date(t.due_date || t.deadline);
      return !isNaN(tDate.getTime()) && tDate.toISOString().split("T")[0] === dateStr;
    });

    return [...dayMeetings.map(m => ({...m, activityType: "meeting"})), ...dayEvents.map(e => ({...e, activityType: "event"})), ...dayTasks.map(t => ({...t, activityType: "task"}))];
  };

  const openCreateModal = (date) => {
    setSelectedDate(date);
    setNewMeeting({
      ...newMeeting,
      date: date.toISOString().split("T")[0],
    });
    setShowCreateModal(true);
  };

  const handleAttendeeToggle = (member) => {
    setNewMeeting((prev) => {
      const isSelected = prev.attendees.some((a) => a.id === member.id);
      if (isSelected) {
        return { ...prev, attendees: prev.attendees.filter((a) => a.id !== member.id) };
      } else {
        return { ...prev, attendees: [...prev.attendees, { id: member.id, name: member.name, type: member.type || member.role }] };
      }
    });
  };

  const handleCreateMeeting = async () => {
    if (!newMeeting.title.trim() || !newMeeting.date) return;
    setIsCreating(true);
    try {
      const meetingData = {
        ...newMeeting,
        scheduled_at: newMeeting.date + "T" + newMeeting.start_time + ":00",
        attendee_ids: newMeeting.attendees.map((a) => a.id),
      };
      if (onCreateMeeting) {
        await onCreateMeeting(meetingData);
      }
      setShowCreateModal(false);
      setNewMeeting({
        title: "",
        description: "",
        date: "",
        start_time: "09:00",
        end_time: "10:00",
        location: "",
        meeting_type: "general",
        project_id: "",
        attendees: [],
      });
    } catch (error) {
      console.error("Error creating meeting:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const selectedActivities = getActivitiesForDate(selectedDate);

  return (
    <div className="flex flex-col h-full">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className={(isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100") + " p-1.5 rounded-lg transition-colors"}>
          <ChevronLeft className={(isDarkMode ? "text-slate-400" : "text-slate-600") + " h-4 w-4"} />
        </button>
        <span className={(isDarkMode ? "text-slate-200" : "text-slate-900") + " text-sm font-bold"}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
        <button onClick={nextMonth} className={(isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100") + " p-1.5 rounded-lg transition-colors"}>
          <ChevronRight className={(isDarkMode ? "text-slate-400" : "text-slate-600") + " h-4 w-4"} />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayNames.map((day, i) => (
          <div key={i} className={(isDarkMode ? "text-slate-500" : "text-slate-400") + " text-center text-[9px] font-semibold py-0.5"}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0.5 flex-1 min-h-0">
        {calendarDays.map((day, index) => {
          if (!day) return <div key={index} className="aspect-square"></div>;
          
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const activities = getActivitiesForDate(date);
          const isToday = date.toDateString() === today.toDateString();
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          const hasMeetings = activities.some((a) => a.activityType === "meeting");
          const hasOther = activities.some((a) => a.activityType !== "meeting");
          const isPast = date < today && !isToday;
          
          return (
            <button 
              key={index} 
              onClick={() => setSelectedDate(date)}
              onDoubleClick={() => openCreateModal(date)}
              className={"aspect-square rounded flex flex-col items-center justify-center text-[10px] font-medium relative transition-all " +
                (isToday ? "bg-purple-600 text-white" : "") +
                (isSelected && !isToday ? (isDarkMode ? "bg-purple-900/50 text-purple-300 ring-1 ring-purple-500" : "bg-purple-100 text-purple-700 ring-1 ring-purple-400") : "") +
                (!isToday && !isSelected && !isPast ? (isDarkMode ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-100 text-slate-700") : "") +
                (isPast && !isToday && !isSelected ? (isDarkMode ? "text-slate-600" : "text-slate-400") : "")
              }
            >
              {day}
              {(hasMeetings || hasOther) && (
                <div className="absolute bottom-0.5 flex space-x-0.5">
                  {hasMeetings && <div className={(isToday ? "bg-yellow-300" : "bg-amber-500") + " w-1 h-1 rounded-full"}></div>}
                  {hasOther && <div className={(isToday ? "bg-white" : "bg-purple-500") + " w-1 h-1 rounded-full"}></div>}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Info */}
      <div className={"mt-2 pt-2 border-t " + (isDarkMode ? "border-slate-700" : "border-slate-200")}>
        <div className="flex items-center justify-between mb-1.5">
          <span className={(isDarkMode ? "text-slate-300" : "text-slate-700") + " text-xs font-semibold"}>
            {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
          <button 
            onClick={() => openCreateModal(selectedDate)} 
            className={(isDarkMode ? "bg-purple-900/50 text-purple-300 hover:bg-purple-900" : "bg-purple-100 text-purple-700 hover:bg-purple-200") + " flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors"}
          >
            <Plus className="h-3 w-3" />
            <span className="text-[10px] font-semibold">Meeting</span>
          </button>
        </div>
        <div className="space-y-1 max-h-16 overflow-y-auto">
          {selectedActivities.length > 0 ? (
            selectedActivities.slice(0, 3).map((activity, index) => (
              <div 
                key={index} 
                className={"p-1.5 rounded text-[10px] flex items-center space-x-1.5 " + 
                  (activity.activityType === "meeting" 
                    ? (isDarkMode ? "bg-amber-900/30 text-amber-300 border border-amber-700" : "bg-amber-50 text-amber-700 border border-amber-200")
                    : activity.activityType === "event" 
                    ? (isDarkMode ? "bg-purple-900/30 text-purple-300" : "bg-purple-50 text-purple-700")
                    : (isDarkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-50 text-blue-700"))
                }
              >
                {activity.activityType === "meeting" && <Video className="h-3 w-3 flex-shrink-0" />}
                {activity.activityType === "event" && <Calendar className="h-3 w-3 flex-shrink-0" />}
                {activity.activityType === "task" && <CheckCircle2 className="h-3 w-3 flex-shrink-0" />}
                <span className="font-medium truncate">{safeString(activity.title) || safeString(activity.name) || "Untitled"}</span>
              </div>
            ))
          ) : (
            <div className={(isDarkMode ? "text-slate-500" : "text-slate-400") + " text-[10px] text-center py-1"}>Double-click to add meeting</div>
          )}
        </div>
      </div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className={(isDarkMode ? "bg-slate-800" : "bg-white") + " rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"} onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Schedule Meeting</h3>
                    <p className="text-purple-200 text-sm">
                      {newMeeting.date 
                        ? new Date(newMeeting.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                        : "Select a date"}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-full hover:bg-white/20 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className={"p-5 overflow-y-auto max-h-[calc(90vh-180px)] " + (isDarkMode ? "text-slate-200" : "")}>
              <div className="space-y-4">
                <div>
                  <label className={(isDarkMode ? "text-slate-300" : "text-slate-700") + " text-sm font-semibold mb-1.5 block"}>Meeting Title *</label>
                  <input 
                    type="text" 
                    value={newMeeting.title} 
                    onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })} 
                    className={(isDarkMode ? "bg-slate-700 border-slate-600 text-slate-200 focus:ring-purple-500" : "bg-white border-slate-200 focus:ring-purple-500") + " w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"} 
                    placeholder="e.g., Weekly Project Review" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={(isDarkMode ? "text-slate-300" : "text-slate-700") + " text-sm font-semibold mb-1.5 block"}>Date *</label>
                    <input 
                      type="date" 
                      value={newMeeting.date} 
                      onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })} 
                      className={(isDarkMode ? "bg-slate-700 border-slate-600 text-slate-200 focus:ring-purple-500" : "bg-white border-slate-200 focus:ring-purple-500") + " w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2"} 
                    />
                  </div>
                  <div>
                    <label className={(isDarkMode ? "text-slate-300" : "text-slate-700") + " text-sm font-semibold mb-1.5 block"}>Type</label>
                    <select 
                      value={newMeeting.meeting_type} 
                      onChange={(e) => setNewMeeting({ ...newMeeting, meeting_type: e.target.value })} 
                      className={(isDarkMode ? "bg-slate-700 border-slate-600 text-slate-200 focus:ring-purple-500" : "bg-white border-slate-200 focus:ring-purple-500") + " w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2"}
                    >
                      <option value="general">General</option>
                      <option value="project_review">Project Review</option>
                      <option value="planning">Planning</option>
                      <option value="standup">Stand-up</option>
                      <option value="client">Client Meeting</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={(isDarkMode ? "text-slate-300" : "text-slate-700") + " text-sm font-semibold mb-1.5 block"}>Start Time</label>
                    <input 
                      type="time" 
                      value={newMeeting.start_time} 
                      onChange={(e) => setNewMeeting({ ...newMeeting, start_time: e.target.value })} 
                      className={(isDarkMode ? "bg-slate-700 border-slate-600 text-slate-200 focus:ring-purple-500" : "bg-white border-slate-200 focus:ring-purple-500") + " w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2"} 
                    />
                  </div>
                  <div>
                    <label className={(isDarkMode ? "text-slate-300" : "text-slate-700") + " text-sm font-semibold mb-1.5 block"}>End Time</label>
                    <input 
                      type="time" 
                      value={newMeeting.end_time} 
                      onChange={(e) => setNewMeeting({ ...newMeeting, end_time: e.target.value })} 
                      className={(isDarkMode ? "bg-slate-700 border-slate-600 text-slate-200 focus:ring-purple-500" : "bg-white border-slate-200 focus:ring-purple-500") + " w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2"} 
                    />
                  </div>
                </div>

                <div>
                  <label className={(isDarkMode ? "text-slate-300" : "text-slate-700") + " text-sm font-semibold mb-1.5 block"}>Location</label>
                  <input 
                    type="text" 
                    value={newMeeting.location} 
                    onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })} 
                    className={(isDarkMode ? "bg-slate-700 border-slate-600 text-slate-200 focus:ring-purple-500" : "bg-white border-slate-200 focus:ring-purple-500") + " w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2"} 
                    placeholder="e.g., Conference Room A, Zoom" 
                  />
                </div>

                <div>
                  <label className={(isDarkMode ? "text-slate-300" : "text-slate-700") + " text-sm font-semibold mb-1.5 block"}>Description</label>
                  <textarea 
                    value={newMeeting.description} 
                    onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })} 
                    className={(isDarkMode ? "bg-slate-700 border-slate-600 text-slate-200 focus:ring-purple-500" : "bg-white border-slate-200 focus:ring-purple-500") + " w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 resize-none"} 
                    rows={3}
                    placeholder="Meeting agenda..." 
                  />
                </div>

                {/* Attendees Selection */}
                <div>
                  <label className={(isDarkMode ? "text-slate-300" : "text-slate-700") + " text-sm font-semibold mb-2 block flex items-center justify-between"}>
                    <span>Invite Attendees</span>
                    {newMeeting.attendees.length > 0 && (
                      <span className={(isDarkMode ? "text-purple-400 bg-purple-900/50" : "text-purple-600 bg-purple-50") + " text-xs font-medium px-2 py-0.5 rounded-full"}>
                        {newMeeting.attendees.length} selected
                      </span>
                    )}
                  </label>
                  
                  <div className={(isDarkMode ? "border-slate-600" : "border-slate-200") + " border rounded-xl overflow-hidden max-h-40 overflow-y-auto"}>
                    {teamMembers.length > 0 ? (
                      teamMembers.map((member) => {
                        const isSelected = newMeeting.attendees.some((a) => a.id === member.id);
                        return (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => handleAttendeeToggle(member)}
                            className={"w-full flex items-center justify-between px-3 py-2 transition-colors " + 
                              (isSelected 
                                ? (isDarkMode ? "bg-purple-900/30" : "bg-purple-50")
                                : (isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-50"))
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <div className={"w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white " + 
                                (member.type === "manager" ? "bg-blue-500" : member.type === "supervisor" ? "bg-purple-500" : "bg-amber-500")
                              }>
                                {member.avatar || member.name?.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                              </div>
                              <div className="text-left">
                                <span className={(isDarkMode ? "text-slate-200" : "text-slate-700") + " text-sm"}>{member.name}</span>
                                <span className={(isDarkMode ? "text-slate-500" : "text-slate-400") + " text-xs block"}>{member.role}</span>
                              </div>
                            </div>
                            {isSelected && <Check className="h-4 w-4 text-purple-600" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className={(isDarkMode ? "text-slate-500" : "text-slate-400") + " p-4 text-center text-sm"}>
                        No team members available
                      </div>
                    )}
                  </div>

                  {newMeeting.attendees.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {newMeeting.attendees.map((attendee) => (
                        <span 
                          key={attendee.id} 
                          className={(isDarkMode ? "bg-purple-900/50 text-purple-300" : "bg-purple-100 text-purple-700") + " inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium"}
                        >
                          <span>{attendee.name}</span>
                          <button 
                            type="button"
                            onClick={() => handleAttendeeToggle(attendee)}
                            className="hover:text-purple-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={(isDarkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50") + " border-t p-4 flex items-center justify-between"}>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className={(isDarkMode ? "text-slate-300 bg-slate-700 border-slate-600 hover:bg-slate-600" : "text-slate-600 bg-white border-slate-200 hover:bg-slate-50") + " px-5 py-2.5 text-sm font-semibold border rounded-xl transition-colors"}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateMeeting}
                disabled={!newMeeting.title.trim() || !newMeeting.date || isCreating}
                className="flex items-center space-x-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Create Meeting</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
const AdminDashboardContent = () => {
  const currentTime = useCurrentTime();
  const navigate = useNavigate();
  const { data, loading, error, lastUpdated, refreshing, refetch } = useDashboardData();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTender, setSelectedTender] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const dashboardRef = React.useRef(null);

  const handleCollapseChange = (collapsed) => setSidebarCollapsed(collapsed);
  
  const handleCreateMeeting = async (meetingData) => {
    try {
      if (meetingsAPI?.create) {
        await meetingsAPI.create(meetingData);
        refetch();
      } else {
        console.log("Meeting created (API not available):", meetingData);
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      throw error;
    }
  };

  const handleProjectClick = (project) => setSelectedProject(project);
  const handleTenderClick = (tender) => setSelectedTender(tender);
  const handleTaskClick = (task) => setSelectedTask(task);
  const handleMeetingClick = (meeting) => setSelectedMeeting(meeting);

  // FIXED: Navigation handlers for team members
  const handleManagerClick = (manager) => {
    console.log("Navigating to manager:", manager.id, manager.name);
    navigate("/admin/project-managers/" + manager.id);
  };

  const handleSupervisorClick = (supervisor) => {
    console.log("Navigating to supervisor:", supervisor.id, supervisor.name);
    navigate("/admin/supervisors/" + supervisor.id);
  };

  const handleSiteManagerClick = (siteManager) => {
    console.log("Navigating to site manager:", siteManager.id, siteManager.name);
    navigate("/admin/site-managers/" + siteManager.id);
  };

  const handleActivityClick = (activity) => {
    if (activity.type === "project") setSelectedProject(activity.data);
    else if (activity.type === "task") setSelectedTask(activity.data);
    else if (activity.type === "tender") setSelectedTender(activity.data);
  };

  // Fullscreen handlers
  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (dashboardRef.current?.requestFullscreen) {
      dashboardRef.current.requestFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setShowFullscreen(document.fullscreenElement !== null);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div ref={dashboardRef} className={(isDarkMode ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 to-blue-50") + " flex h-screen overflow-hidden"}>
        {!showFullscreen && <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onCollapseChange={handleCollapseChange} />}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className={(isDarkMode ? "text-slate-200" : "text-slate-900") + " text-2xl font-bold mb-3"}>Loading Dashboard</h3>
            <p className={(isDarkMode ? "text-slate-400" : "text-slate-600") + " text-base"}>Fetching all system data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div ref={dashboardRef} className={(isDarkMode ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 to-blue-50") + " flex h-screen overflow-hidden"}>
        {!showFullscreen && <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onCollapseChange={handleCollapseChange} />}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className={(isDarkMode ? "bg-slate-800" : "bg-white") + " rounded-2xl shadow-lg p-10 max-w-md text-center"}>
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h3 className={(isDarkMode ? "text-slate-200" : "text-slate-900") + " text-2xl font-bold mb-3"}>Connection Error</h3>
            <p className={(isDarkMode ? "text-slate-400" : "text-slate-600") + " text-base mb-8"}>{error}</p>
            <button onClick={refetch} className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all text-base font-semibold">
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const latestProjects = data.projects?.slice(0, 10) || [];
  const latestTenders = data.tenders?.slice(0, 8) || [];

  return (
    <div 
      ref={dashboardRef} 
      className={(isDarkMode ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 to-blue-50") + " flex h-screen overflow-hidden " + (showFullscreen ? "fixed inset-0 z-50" : "")}
    >
      {!showFullscreen && <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onCollapseChange={handleCollapseChange} />}

      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <div className={(isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200") + " border-b py-3 px-6 shadow-sm flex-shrink-0"}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className={(isDarkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-100 hover:bg-slate-200") + " lg:hidden p-2 rounded-lg transition-colors"}>
                <Menu className={(isDarkMode ? "text-slate-300" : "text-slate-700") + " h-5 w-5"} />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className={(isDarkMode ? "text-slate-100" : "text-slate-900") + " text-xl font-bold"}>Admin Dashboard</h1>
                  <p className={(isDarkMode ? "text-slate-400" : "text-slate-500") + " text-xs"}>Complete system overview</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={(isDarkMode ? "text-slate-100" : "text-slate-900") + " text-xl font-bold tabular-nums"}>
                  {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
                </div>
                <div className={(isDarkMode ? "text-slate-400" : "text-slate-500") + " text-xs"}>
                  {currentTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className={(isDarkMode ? "bg-emerald-900/30" : "bg-emerald-50") + " flex items-center space-x-1.5 px-3 py-1.5 rounded-lg"}>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className={(isDarkMode ? "text-emerald-400" : "text-emerald-700") + " text-sm font-semibold"}>LIVE</span>
                </div>
                
                {/* Dark Mode Toggle */}
                <button 
                  onClick={toggleDarkMode} 
                  className={(isDarkMode ? "bg-slate-700 hover:bg-slate-600 text-yellow-400" : "bg-slate-100 hover:bg-slate-200 text-slate-700") + " p-2 rounded-lg transition-colors"}
                  title={isDarkMode ? "Light Mode" : "Dark Mode"}
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                
                <button onClick={refetch} disabled={refreshing} className={(isDarkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-100 hover:bg-slate-200") + " p-2 rounded-lg transition-colors"} title="Refresh">
                  <RefreshCw className={(isDarkMode ? "text-slate-300" : "text-slate-700") + " h-5 w-5 " + (refreshing ? "animate-spin" : "")} />
                </button>
                <button onClick={toggleFullscreen} className={(isDarkMode ? "bg-purple-900/50 hover:bg-purple-900 text-purple-400" : "bg-purple-100 hover:bg-purple-200 text-purple-700") + " p-2 rounded-lg transition-colors"} title="Fullscreen (F11)">
                  {showFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className={"h-full flex flex-col gap-3 " + (showFullscreen ? "p-3" : "p-4")}>
            {/* KPI Cards Row */}
            <div className={"grid grid-cols-5 gap-3 flex-shrink-0 " + (showFullscreen ? "pt-10" : "")}>
              <ModernKPICard label="Total Projects" value={data.statistics?.totalProjects || 0} icon={Building2} trend={data.trends?.projects || "neutral"} trendValue={(data.statistics?.activeProjects || 0) + " active"} colorScheme="primary" isDarkMode={isDarkMode} />
              <ModernKPICard label="Total Budget" value={formatCurrency(data.statistics?.totalBudget || 0)} icon={DollarSign} trend={data.trends?.budget || "neutral"} trendValue={(data.statistics?.budgetUtilization || 0) + "% used"} colorScheme="success" isDarkMode={isDarkMode} />
              <ModernKPICard label="Team Members" value={data.statistics?.teamSize || 0} icon={Users} trend={data.trends?.team || "neutral"} trendValue={(data.statistics?.managersCount || 0) + " PM"} colorScheme="purple" isDarkMode={isDarkMode} />
              <ModernKPICard label="Task Completion" value={(data.statistics?.completionRate || 0) + "%"} icon={Target} trend={data.trends?.completion || "neutral"} trendValue={(data.statistics?.completedTasks || 0) + "/" + (data.statistics?.totalTasks || 0)} colorScheme="warning" isDarkMode={isDarkMode} />
              <ModernKPICard label="Overdue Items" value={(data.statistics?.overdueTasks || 0) + (data.statistics?.overdueProjects || 0)} icon={AlertCircle} trend={(data.statistics?.overdueTasks || 0) > 0 ? "down" : "up"} trendValue={(data.statistics?.overdueTasks || 0) > 0 ? "Attention" : "On track"} colorScheme="danger" isDarkMode={isDarkMode} />
            </div>

            {/* Main Content Grid - 6 columns */}
            <div className="flex-1 grid grid-cols-6 gap-3 min-h-0 overflow-hidden">
              
              {/* Column 1: Charts */}
              <div className="flex flex-col gap-3 min-h-0">
                <div className={(isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200") + " flex-1 rounded-xl p-4 border shadow-sm flex flex-col"}>
                  <div className="flex items-center justify-between mb-2 flex-shrink-0">
                    <h3 className={(isDarkMode ? "text-slate-200" : "text-slate-900") + " text-sm font-bold"}>Projects</h3>
                    <span className="text-xs font-bold text-blue-600">{data.statistics?.totalProjects || 0}</span>
                  </div>
                  <div className="flex-1 min-h-0">
                    {data.chartData?.statusData?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={data.chartData.statusData} cx="50%" cy="50%" innerRadius={25} outerRadius={45} paddingAngle={2} dataKey="value">
                            {data.chartData.statusData.map((entry, index) => (
                              <Cell key={"cell-" + index} fill={entry.color} stroke={isDarkMode ? "#1e293b" : "#fff"} strokeWidth={2} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className={(isDarkMode ? "text-slate-500" : "text-slate-400") + " text-xs"}>No data</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className={(isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200") + " flex-1 rounded-xl p-4 border shadow-sm flex flex-col"}>
                  <div className="flex items-center justify-between mb-2 flex-shrink-0">
                    <h3 className={(isDarkMode ? "text-slate-200" : "text-slate-900") + " text-sm font-bold"}>Tasks</h3>
                    <span className="text-xs font-bold text-green-600">{data.statistics?.totalTasks || 0}</span>
                  </div>
                  <div className="flex-1 min-h-0">
                    {data.chartData?.taskStatusData?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={data.chartData.taskStatusData} cx="50%" cy="50%" innerRadius={25} outerRadius={45} paddingAngle={2} dataKey="value">
                            {data.chartData.taskStatusData.map((entry, index) => (
                              <Cell key={"cell-" + index} fill={entry.color} stroke={isDarkMode ? "#1e293b" : "#fff"} strokeWidth={2} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className={(isDarkMode ? "text-slate-500" : "text-slate-400") + " text-xs"}>No data</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Column 2: Projects */}
              <div className={(isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200") + " rounded-xl p-4 border shadow-sm flex flex-col min-h-0"}>
                <div className="flex items-center justify-between mb-3 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <PlayCircle className="h-4 w-4 text-blue-600" />
                    <h3 className={(isDarkMode ? "text-slate-200" : "text-slate-900") + " text-sm font-bold"}>Projects</h3>
                  </div>
                  <span className={(isDarkMode ? "text-blue-400 bg-blue-900/30" : "text-blue-700 bg-blue-50") + " text-xs font-bold px-2 py-0.5 rounded"}>{data.statistics?.totalProjects || 0}</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {latestProjects.length > 0 ? (
                    latestProjects.slice(0, 8).map((project, index) => {
                      const statusConfig = getStatusConfig(project.status, isDarkMode);
                      return (
                        <div key={project.id || index} className={(isDarkMode ? "bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-blue-500" : "bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-300") + " p-2.5 rounded-lg border cursor-pointer transition-all"} onClick={() => handleProjectClick(project)}>
                          <div className="flex justify-between items-start mb-1.5">
                            <h4 className={(isDarkMode ? "text-slate-200" : "text-slate-900") + " text-xs font-semibold truncate flex-1"}>{safeString(project.title) || safeString(project.name) || "Untitled"}</h4>
                            <span className="text-xs font-bold text-blue-600 ml-1">{Math.round(project.progress_percentage || project.progress || 0)}%</span>
                          </div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={statusConfig.bg + " " + statusConfig.text + " text-[10px] font-medium px-1.5 py-0.5 rounded"}>{project.status}</span>
                            <span className={(isDarkMode ? "text-slate-500" : "text-slate-400") + " text-[10px]"}>{getRelativeTime(project.created_at)}</span>
                          </div>
                          <div className={(isDarkMode ? "bg-slate-600" : "bg-slate-200") + " w-full h-1.5 rounded-full overflow-hidden"}>
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: (project.progress_percentage || project.progress || 0) + "%" }} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <p className={(isDarkMode ? "text-slate-500" : "text-slate-400") + " text-xs"}>No projects</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3: Tenders + Top Performers */}
              <div className="flex flex-col gap-3 min-h-0">
                <div className={(isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200") + " flex-1 rounded-xl p-4 border shadow-sm flex flex-col min-h-0"}>
                  <div className="flex items-center justify-between mb-2 flex-shrink-0">
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4 text-orange-600" />
                      <h3 className={(isDarkMode ? "text-slate-200" : "text-slate-900") + " text-sm font-bold"}>Tenders</h3>
                    </div>
                    <span className={(isDarkMode ? "text-orange-400 bg-orange-900/30" : "text-orange-700 bg-orange-50") + " text-xs font-bold px-2 py-0.5 rounded"}>{data.statistics?.totalTenders || 0}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {latestTenders.length > 0 ? (
                      latestTenders.slice(0, 4).map((tender, index) => {
                        const statusConfig = getStatusConfig(tender.status, isDarkMode);
                        return (
                          <div key={tender.id || index} className={(isDarkMode ? "bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-orange-500" : "bg-slate-50 border-slate-200 hover:bg-orange-50 hover:border-orange-300") + " p-2 rounded-lg border cursor-pointer transition-all"} onClick={() => handleTenderClick(tender)}>
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={(isDarkMode ? "text-slate-200" : "text-slate-900") + " text-xs font-semibold truncate flex-1"}>{safeString(tender.title) || safeString(tender.name) || "Untitled"}</h4>
                              <span className={statusConfig.bg + " " + statusConfig.text + " text-[9px] font-medium px-1.5 py-0.5 rounded ml-1"}>{tender.status}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-600">{formatCurrency(tender.budget_estimate || tender.value || tender.amount)}</span>
                              <span className={(isDarkMode ? "text-slate-500" : "text-slate-500") + " text-[10px]"}>{formatDate(tender.deadline || tender.submission_deadline)}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className={(isDarkMode ? "text-slate-500" : "text-slate-400") + " text-xs text-center py-2"}>No tenders</p>
                    )}
                  </div>
                </div>

                {/* Top Performers - FIXED NAVIGATION */}
                <div className={(isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200") + " flex-1 rounded-xl p-4 border shadow-sm flex flex-col min-h-0"}>
                  <div className="flex items-center space-x-2 mb-2 flex-shrink-0">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <h3 className={(isDarkMode ? "text-slate-200" : "text-slate-900") + " text-sm font-bold"}>Top Performers</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1.5">
                    {(data.chartData?.topManagers || []).slice(0, 3).map((manager, index) => (
                      <div 
                        key={manager.id || index} 
                        className={(isDarkMode ? "bg-blue-900/30 hover:bg-blue-900/50" : "bg-blue-50 hover:bg-blue-100") + " p-2 rounded-lg flex items-center space-x-2 cursor-pointer hover:shadow-sm transition-all"}
                        onClick={() => handleManagerClick(manager)}
                      >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-[10px]">{manager.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <p className={(isDarkMode ? "text-slate-200" : "text-slate-900") + " text-xs font-semibold truncate"}>{manager.name}</p>
                          <p className={(isDarkMode ? "text-blue-400" : "text-blue-600") + " text-[10px]"}>{Math.round(manager.performance)}% • {manager.projectsCount} proj</p>
                        </div>
                        <Eye className={(isDarkMode ? "text-slate-500" : "text-slate-400") + " h-3.5 w-3.5"} />
                      </div>
                    ))}
                    {(data.chartData?.topSupervisors || []).slice(0, 2).map((supervisor, index) => (
                      <div 
                        key={supervisor.id || index} 
                        className={(isDarkMode ? "bg-purple-900/30 hover:bg-purple-900/50" : "bg-purple-50 hover:bg-purple-100") + " p-2 rounded-lg flex items-center space-x-2 cursor-pointer hover:shadow-sm transition-all"}
                        onClick={() => handleSupervisorClick(supervisor)}
                      >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px]">{supervisor.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <p className={(isDarkMode ? "text-slate-200" : "text-slate-900") + " text-xs font-semibold truncate"}>{supervisor.name}</p>
                          <p className={(isDarkMode ? "text-purple-400" : "text-purple-600") + " text-[10px]"}>{Math.round(supervisor.performance)}% • {supervisor.projectsCount} proj</p>
                        </div>
                        <Eye className={(isDarkMode ? "text-slate-500" : "text-slate-400") + " h-3.5 w-3.5"} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 4: Calendar */}
              <div className={(isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200") + " rounded-xl p-4 border shadow-sm flex flex-col min-h-0"}>
                <div className="flex items-center space-x-2 mb-2 flex-shrink-0">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <h3 className={(isDarkMode ? "text-slate-200" : "text-slate-900") + " text-sm font-bold"}>Calendar</h3>
                </div>
                <div className="flex-1 min-h-0">
                  <EnhancedCalendar 
                    meetings={data.meetings || []}
                    events={data.events || []}
                    tasks={data.tasks || []}
                    onCreateMeeting={handleCreateMeeting}
                    teamMembers={data.allTeamMembers || []}
                    projects={data.projects || []}
                    isDarkMode={isDarkMode}
                  />
                </div>
              </div>

              {/* Column 5: Meetings */}
              <div className={(isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200") + " rounded-xl p-4 border shadow-sm flex flex-col min-h-0"}>
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <Video className="h-4 w-4 text-amber-600" />
                    <h3 className={(isDarkMode ? "text-slate-200" : "text-slate-900") + " text-sm font-bold"}>Meetings</h3>
                  </div>
                  <span className={(isDarkMode ? "text-amber-400 bg-amber-900/30" : "text-amber-700 bg-amber-50") + " text-xs font-bold px-2 py-0.5 rounded"}>{data.statistics?.upcomingMeetings || 0}</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <MeetingsSection 
                    meetings={data.meetings || []} 
                    teamMembers={data.allTeamMembers || []}
                    onMeetingClick={handleMeetingClick}
                    isDarkMode={isDarkMode}
                  />
                </div>
              </div>

              {/* Column 6: Activity */}
              <div className={(isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200") + " rounded-xl p-4 border shadow-sm flex flex-col min-h-0"}>
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-indigo-600" />
                    <h3 className={(isDarkMode ? "text-slate-200" : "text-slate-900") + " text-sm font-bold"}>Activity</h3>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <RecentActivityFeed activities={data.recentActivity || []} onItemClick={handleActivityClick} isDarkMode={isDarkMode} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {!showFullscreen && (
          <div className={(isDarkMode ? "bg-slate-800/80 border-slate-700" : "bg-white/80 border-slate-200") + " border-t py-2 px-6 flex-shrink-0"}>
            <div className={(isDarkMode ? "text-slate-400" : "text-slate-500") + " flex items-center justify-between text-xs"}>
              <span className="font-medium">© 2025 Ujenzi & Paints • Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "Never"}</span>
              <div className="flex items-center space-x-4">
                <span>Projects: <strong className={isDarkMode ? "text-slate-300" : "text-slate-700"}>{data.statistics?.totalProjects || 0}</strong></span>
                <span>Tasks: <strong className={isDarkMode ? "text-slate-300" : "text-slate-700"}>{data.statistics?.totalTasks || 0}</strong></span>
                <span>Team: <strong className={isDarkMode ? "text-slate-300" : "text-slate-700"}>{data.statistics?.teamSize || 0}</strong></span>
                <span>Meetings: <strong className={isDarkMode ? "text-slate-300" : "text-slate-700"}>{data.statistics?.upcomingMeetings || 0}</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedProject && (
        <ProjectDetailModal 
          project={selectedProject} 
          managers={data.rawManagers || data.managers} 
          onClose={() => setSelectedProject(null)}
          isDarkMode={isDarkMode}
        />
      )}
      {selectedTender && (
        <TenderDetailModal 
          tender={selectedTender} 
          onClose={() => setSelectedTender(null)}
          isDarkMode={isDarkMode}
        />
      )}
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)}
          isDarkMode={isDarkMode}
        />
      )}
      {selectedMeeting && (
        <MeetingDetailModal 
          meeting={selectedMeeting} 
          onClose={() => setSelectedMeeting(null)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

// Wrap with DarkModeProvider
const AdminDashboard = () => {
  return (
    <DarkModeProvider>
      <AdminDashboardContent />
    </DarkModeProvider>
  );
};

export default AdminDashboard;