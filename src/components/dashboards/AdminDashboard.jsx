

//  import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line,
//   PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Tooltip, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
// } from 'recharts';
// import {
//   Clock, DollarSign, Users, Building2, TrendingUp, TrendingDown,
//   Target, Zap, RefreshCw, ArrowRight, Bell, User, Plus, FileText,
//   Shield, AlertTriangle, CheckSquare, Activity, Award, Star,
//   Calendar, MapPin, Flame, Eye, Download, Filter, Settings,
//   UserCheck, Loader, AlertCircle, Timer, Users2, Edit, Trash2,
//   CalendarDays, ChevronLeft, ChevronRight, MoreHorizontal, Menu,
//   Palette, Brush, Home, BarChart3, X, Maximize2, Minimize2
// } from 'lucide-react';

// // Import your actual API services
// import ProjectManagerDetails from '../../pages/admin/ProjectManagerDetails';
// import AdminSidebar from '../../pages/admin/AdminSidebar';
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
//   fetchProjectManagers
// } from '../../services/api';

// // Theme Hook
// const useTheme = () => {
//   const [isDark, setIsDark] = useState(false);

//   const toggleTheme = useCallback(() => {
//     setIsDark(prev => !prev);
//   }, []);

//   const theme = useMemo(() => ({
//     isDark,
//     colors: {
//       background: isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-yellow-50',
//       card: isDark ? 'bg-gray-800' : 'bg-white',
//       border: isDark ? 'border-gray-700' : 'border-gray-200',
//       text: isDark ? 'text-gray-100' : 'text-gray-900',
//       textSecondary: isDark ? 'text-gray-400' : 'text-gray-600',
//       textMuted: isDark ? 'text-gray-500' : 'text-gray-500',
//       primary: '#F97316',
//       secondary: '#EAB308',
//       success: '#10B981',
//       warning: '#F59E0B',
//       danger: '#EF4444',
//       purple: '#8B5CF6',
//     }
//   }), [isDark]);

//   return { ...theme, toggleTheme };
// };

// // Card Component
// const Card = ({ children, className = "", ...props }) => {
//   const theme = useTheme();
//   return (
//     <div
//       className={`p-6 ${theme.colors.card} rounded-xl border ${theme.colors.border} shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
//       {...props}
//     >
//       {children}
//     </div>
//   );
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
//     teamMembers: [],
//     supervisors: [],
//     siteManagers: [],
//     notifications: [],
//     chartData: {
//       monthlyRevenue: [],
//       projectStatus: [],
//       teamEfficiency: [],
//       projectProgress: [],
//       weeklyTasks: [],
//       tenderStatus: [],
//       taskStatus: []
//     }
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

//       // Fetch all data from your real API services
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
//         calendarEventsResponse
//       ] = await Promise.allSettled([
//         dashboardAPI.getDashboard().catch(() => ({})),
//         projectsAPI.getAll().catch(() => ({ projects: [] })),
//         fetchProjectManagers().catch(() => []),
//         eventsAPI.getUpcoming(20).catch(() => ({ events: [] })),
//         tasksAPI.getAll().catch(() => ({ tasks: [] })),
//         tendersAPI.getAll().catch(() => ({ tenders: [] })),
//         teamMembersAPI.getAll().catch(() => ({ team_members: [] })),
//         supervisorsAPI.getAll().catch(() => []),
//         siteManagersAPI.getAll().catch(() => []),
//         notificationsAPI.getAll().catch(() => []),
//         calendarAPI.getTodayEvents().catch(() => [])
//       ]);

//       // Process responses
//       const dashboard = dashboardResponse.status === 'fulfilled' ? dashboardResponse.value : {};
//       const projectsData = projectsResponse.status === 'fulfilled' ? projectsResponse.value : { projects: [] };
//       const managersData = managersResponse.status === 'fulfilled' ? managersResponse.value : [];
//       const eventsData = eventsResponse.status === 'fulfilled' ? eventsResponse.value : { events: [] };
//       const tasksData = tasksResponse.status === 'fulfilled' ? tasksResponse.value : { tasks: [] };
//       const tendersData = tendersResponse.status === 'fulfilled' ? tendersResponse.value : { tenders: [] };
//       const teamMembersData = teamMembersResponse.status === 'fulfilled' ? teamMembersResponse.value : { team_members: [] };
//       const supervisorsData = supervisorsResponse.status === 'fulfilled' ? supervisorsResponse.value : [];
//       const siteManagersData = siteManagersResponse.status === 'fulfilled' ? siteManagersResponse.value : [];
//       const notificationsData = notificationsResponse.status === 'fulfilled' ? notificationsResponse.value : [];
//       const calendarEventsData = calendarEventsResponse.status === 'fulfilled' ? calendarEventsResponse.value : [];

//       // Normalize data
//       const projects = Array.isArray(projectsData.projects) ? projectsData.projects : (Array.isArray(projectsData) ? projectsData : []);
//       const events = Array.isArray(eventsData.events) ? eventsData.events : (Array.isArray(eventsData) ? eventsData : []);
//       const tasks = Array.isArray(tasksData.tasks) ? tasksData.tasks : (Array.isArray(tasksData) ? tasksData : []);
//       const tenders = Array.isArray(tendersData.tenders) ? tendersData.tenders : (Array.isArray(tendersData) ? tendersData : []);
//       const teamMembers = Array.isArray(teamMembersData.team_members) ? teamMembersData.team_members : (Array.isArray(teamMembersData) ? teamMembersData : []);
//       const supervisors = Array.isArray(supervisorsData) ? supervisorsData : [];
//       const siteManagers = Array.isArray(siteManagersData) ? siteManagersData : [];
//       const notifications = Array.isArray(notificationsData) ? notificationsData : [];
//       const todayEvents = Array.isArray(calendarEventsData) ? calendarEventsData : [];

//       // Process managers data
//       const managers = Array.isArray(managersData) ? managersData.map(manager => ({
//         id: manager.id,
//         name: manager.name,
//         email: manager.email,
//         phone: manager.phone || '+254 700 000 000',
//         location: manager.location || 'Nairobi, Kenya',
//         department: manager.department || 'Construction',
//         joinDate: manager.join_date || 'Jan 2022',
//         projectsCount: manager.number_of_projects || 0,
//         activeProjects: manager.number_of_projects || 0,
//         completedProjects: manager.completed_projects || Math.floor(Math.random() * 20) + 5,
//         lastLogin: manager.last_login,
//         status: manager.status,
//         workload: Math.min(100, (manager.number_of_projects || 0) * 25),
//         efficiency: 85 + Math.random() * 15,
//         avatar: manager.avatar || manager.name?.split(' ').map(n => n[0]).join('') || 'U',
//         role: manager.role || 'Project Manager',
//         totalBudget: (manager.number_of_projects || 0) * 500000 + Math.random() * 2000000
//       })) : [];

//       // Calculate statistics
//       const statistics = {
//         totalProjects: projects.length,
//         activeProjects: projects.filter(p => p.status === 'active' || p.status === 'in_progress').length,
//         completedProjects: projects.filter(p => p.status === 'completed').length,
//         planningProjects: projects.filter(p => p.status === 'planning').length,
//         totalBudget: projects.reduce((sum, p) => sum + (parseFloat(p.budget || 0)), 0),
//         totalTasks: tasks.length,
//         completedTasks: tasks.filter(t => t.status === 'completed').length,
//         pendingTasks: tasks.filter(t => t.status === 'pending').length,
//         overdueTasks: tasks.filter(t => {
//           if (!t.due_date) return false;
//           return new Date(t.due_date) < new Date() && t.status !== 'completed';
//         }).length,
//         teamSize: managers.length + supervisors.length + siteManagers.length,
//         activeTenders: tenders.filter(t => t.status === 'active').length,
//         totalTenderValue: tenders.reduce((sum, t) => sum + (parseFloat(t.budget_estimate || 0)), 0),
//         unreadNotifications: notifications.filter(n => !n.read).length,
//         todayEvents: todayEvents.length,
//         avgProgress: projects.length > 0 ?
//           projects.reduce((sum, p) => sum + (parseFloat(p.progress_percentage || p.progress || 0)), 0) / projects.length : 0,
//         avgTeamEfficiency: managers.length > 0 ?
//           managers.reduce((sum, m) => sum + m.efficiency, 0) / managers.length : 0
//       };

//       // Generate chart data
//       const chartData = {
//         projectStatus: [
//           { name: 'Active', value: statistics.activeProjects, color: '#F97316' },
//           { name: 'Completed', value: statistics.completedProjects, color: '#10B981' },
//           { name: 'Planning', value: Math.max(1, statistics.planningProjects), color: '#EAB308' }
//         ],
//         taskStatus: [
//           { name: 'Completed', value: statistics.completedTasks, color: '#10B981' },
//           { name: 'Pending', value: statistics.pendingTasks, color: '#F59E0B' },
//           { name: 'Overdue', value: statistics.overdueTasks, color: '#EF4444' }
//         ],
//         monthlyRevenue: [
//           { month: 'Jan', revenue: 2.8, target: 2.5 },
//           { month: 'Feb', revenue: 3.2, target: 2.8 },
//           { month: 'Mar', revenue: 3.8, target: 3.2 },
//           { month: 'Apr', revenue: 3.4, target: 3.5 },
//           { month: 'May', revenue: 4.2, target: 3.8 },
//           { month: 'Jun', revenue: 4.8, target: 4.2 }
//         ],
//         weeklyTasks: [
//           { day: 'Mon', completed: Math.floor(statistics.completedTasks * 0.18), pending: Math.floor(statistics.pendingTasks * 0.15) },
//           { day: 'Tue', completed: Math.floor(statistics.completedTasks * 0.22), pending: Math.floor(statistics.pendingTasks * 0.12) },
//           { day: 'Wed', completed: Math.floor(statistics.completedTasks * 0.16), pending: Math.floor(statistics.pendingTasks * 0.18) },
//           { day: 'Thu', completed: Math.floor(statistics.completedTasks * 0.20), pending: Math.floor(statistics.pendingTasks * 0.14) },
//           { day: 'Fri', completed: Math.floor(statistics.completedTasks * 0.24), pending: Math.floor(statistics.pendingTasks * 0.11) },
//           { day: 'Sat', completed: Math.floor(statistics.completedTasks * 0.08), pending: Math.floor(statistics.pendingTasks * 0.06) },
//           { day: 'Sun', completed: Math.floor(statistics.completedTasks * 0.06), pending: Math.floor(statistics.pendingTasks * 0.08) }
//         ]
//       };

//       setData({
//         statistics,
//         projects,
//         managers,
//         events: events.concat(todayEvents),
//         tasks,
//         tenders,
//         teamMembers: teamMembers.concat(supervisors).concat(siteManagers),
//         supervisors,
//         siteManagers,
//         notifications,
//         chartData
//       });

//       setLastUpdated(new Date());
//       console.log('✅ Dashboard data loaded successfully from real APIs');

//     } catch (err) {
//       console.error('❌ Dashboard data fetch failed:', err);
//       setError(err.message || 'Failed to load dashboard data from APIs');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//     const interval = setInterval(() => fetchData(true), 300000); // Refresh every 5 minutes
//     return () => clearInterval(interval);
//   }, [fetchData]);

//   const refetch = useCallback(() => fetchData(true), [fetchData]);

//   return { data, loading, error, lastUpdated, refreshing, refetch };
// };

// // Statistics Grid Component
// const StatsGrid = ({ data, theme }) => {
//   const stats = [
//     {
//       title: 'Total Projects',
//       value: data.statistics?.totalProjects || 0,
//       change: '+12%',
//       trend: 'up',
//       icon: Building2,
//       color: 'text-orange-600',
//       bgColor: 'bg-orange-50',
//       borderColor: 'border-orange-200'
//     },
//     {
//       title: 'Active Projects',
//       value: data.statistics?.activeProjects || 0,
//       change: '+8',
//       trend: 'up',
//       icon: Activity,
//       color: 'text-blue-600',
//       bgColor: 'bg-blue-50',
//       borderColor: 'border-blue-200'
//     },
//     {
//       title: 'Total Tasks',
//       value: data.statistics?.totalTasks || 0,
//       change: '+24',
//       trend: 'up',
//       icon: CheckSquare,
//       color: 'text-green-600',
//       bgColor: 'bg-green-50',
//       borderColor: 'border-green-200'
//     },
//     {
//       title: 'Team Members',
//       value: data.statistics?.teamSize || 0,
//       change: '+3',
//       trend: 'up',
//       icon: Users,
//       color: 'text-purple-600',
//       bgColor: 'bg-purple-50',
//       borderColor: 'border-purple-200'
//     },
//     {
//       title: 'Monthly Revenue',
//       value: `$${((data.statistics?.totalBudget || 0) / 1000000).toFixed(1)}M`,
//       change: '+15.3%',
//       trend: 'up',
//       icon: DollarSign,
//       color: 'text-yellow-600',
//       bgColor: 'bg-yellow-50',
//       borderColor: 'border-yellow-200'
//     },
//     {
//       title: 'This Week Tasks',
//       value: data.statistics?.completedTasks || 0,
//       change: '+18',
//       trend: 'up',
//       icon: Calendar,
//       color: 'text-indigo-600',
//       bgColor: 'bg-indigo-50',
//       borderColor: 'border-indigo-200'
//     },
//     {
//       title: 'Overdue Tasks',
//       value: data.statistics?.overdueTasks || 0,
//       change: '-2',
//       trend: 'down',
//       icon: AlertTriangle,
//       color: 'text-red-600',
//       bgColor: 'bg-red-50',
//       borderColor: 'border-red-200'
//     },
//     {
//       title: 'Team Efficiency',
//       value: `${Math.round(data.statistics?.avgTeamEfficiency || 0)}%`,
//       change: '+4.2%',
//       trend: 'up',
//       icon: Zap,
//       color: 'text-cyan-600',
//       bgColor: 'bg-cyan-50',
//       borderColor: 'border-cyan-200'
//     }
//   ];

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
//       {stats.map((stat, index) => (
//         <Card key={index} className={`hover:shadow-lg transition-all border-2 ${stat.borderColor} relative overflow-hidden`}>
//           <div className="absolute top-0 right-0 w-16 h-16 transform translate-x-6 -translate-y-6">
//             <div className={`w-full h-full rounded-full ${stat.bgColor} opacity-50`} />
//           </div>
//           <div className="relative z-10">
//             <div className="flex items-center justify-between mb-3">
//               <div className={`p-2 rounded-lg ${stat.bgColor} border ${stat.borderColor}`}>
//                 <stat.icon className={`h-5 w-5 ${stat.color}`} />
//               </div>
//               <div className="text-right">
//                 <div className="flex items-center space-x-1">
//                   {stat.trend === 'up' ? (
//                     <TrendingUp className="h-4 w-4 text-green-500" />
//                   ) : (
//                     <TrendingDown className="h-4 w-4 text-red-500" />
//                   )}
//                   <span className={`text-sm font-bold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
//                     {stat.change}
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <div>
//               <p className={`text-sm font-medium ${theme.colors.textSecondary} mb-1`}>{stat.title}</p>
//               <p className={`text-2xl font-bold ${theme.colors.text}`}>{stat.value}</p>
//             </div>
//           </div>
//         </Card>
//       ))}
//     </div>
//   );
// };

// // Manager Card Component
// const ManagerCard = ({ manager, theme, onClick }) => {
//   const getBusyStatus = (workload) => {
//     if (workload >= 80) return { status: 'Very Busy', color: 'text-red-600', bgColor: 'bg-red-100', dotColor: 'bg-red-500' };
//     if (workload >= 60) return { status: 'Busy', color: 'text-orange-600', bgColor: 'bg-orange-100', dotColor: 'bg-orange-500' };
//     if (workload >= 30) return { status: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-100', dotColor: 'bg-yellow-500' };
//     return { status: 'Available', color: 'text-green-600', bgColor: 'bg-green-100', dotColor: 'bg-green-500' };
//   };

//   const busyInfo = getBusyStatus(manager.workload);

//   return (
//     <Card
//       onClick={() => onClick?.(manager)}
//       className="hover:shadow-lg cursor-pointer hover:border-orange-300 transition-all group relative overflow-hidden"
//     >
//       <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//       <div className="relative z-10">
//         <div className="flex items-center space-x-3 mb-4">
//           <div className="relative">
//             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
//               {manager.avatar}
//             </div>
//             <div className={`absolute -top-1 -right-1 w-3 h-3 ${busyInfo.dotColor} rounded-full border-2 border-white`}></div>
//           </div>
//           <div className="flex-1">
//             <h4 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
//               {manager.name}
//             </h4>
//             <p className="text-sm text-gray-600">{manager.email}</p>
//             <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${busyInfo.bgColor} ${busyInfo.color} mt-1`}>
//               {busyInfo.status}
//             </div>
//           </div>
//         </div>

//         <div className="space-y-2">
//           <div className="flex justify-between text-sm">
//             <span className="text-gray-600">Projects</span>
//             <span className="font-semibold text-orange-600">{manager.projectsCount}</span>
//           </div>
//           <div className="flex justify-between text-sm">
//             <span className="text-gray-600">Workload</span>
//             <span className="font-semibold">{Math.round(manager.workload)}%</span>
//           </div>
//           <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
//             <div
//               className={`h-full transition-all duration-500 ${manager.workload >= 80 ? 'bg-red-500' : manager.workload >= 60 ? 'bg-orange-500' : manager.workload >= 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
//               style={{ width: `${manager.workload}%` }}
//             ></div>
//           </div>
//         </div>
//       </div>
//     </Card>
//   );
// };

// // Project Card Component
// const ProjectCard = ({ project, theme, onClick }) => {
//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'active': case 'in_progress': return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
//       case 'completed': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
//       case 'planning': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
//       default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
//     }
//   };

//   const statusInfo = getStatusColor(project.status);

//   return (
//     <Card
//       onClick={() => onClick?.(project)}
//       className="hover:shadow-lg cursor-pointer hover:border-blue-300 transition-all group"
//     >
//       <div className="flex items-start justify-between mb-4">
//         <div className="flex-1">
//           <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
//             {project.title || project.name || 'Untitled Project'}
//           </h4>
//           <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
//             {(project.status || 'unknown').replace('_', ' ').toUpperCase()}
//           </div>
//         </div>
//         <div className="text-right">
//           <div className="text-2xl font-bold text-orange-600">
//             {Math.round(project.progress_percentage || project.progress || 0)}%
//           </div>
//           <div className="text-xs text-gray-500">Complete</div>
//         </div>
//       </div>

//       <div className="space-y-3">
//         <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
//           <div
//             className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-500"
//             style={{ width: `${project.progress_percentage || project.progress || 0}%` }}
//           ></div>
//         </div>
//         <div className="flex justify-between items-center">
//           <span className="text-sm text-gray-600">Budget</span>
//           <div className="flex items-center space-x-1">
//             <DollarSign className="h-4 w-4 text-green-500" />
//             <span className="font-bold text-green-600">
//               ${((project.budget || 0) / 1000000).toFixed(1)}M
//             </span>
//           </div>
//         </div>
//         <div className="flex justify-between items-center">
//           <span className="text-sm text-gray-600">Deadline</span>
//           <span className="text-sm text-gray-800">
//             {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'TBD'}
//           </span>
//         </div>
//       </div>
//     </Card>
//   );
// };

// // Event Creation Modal
// const EventModal = ({ isOpen, onClose, onSubmit, selectedDate, projects }) => {
//   const [formData, setFormData] = useState({
//     description: '',
//     date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
//     project_id: '',
//     responsible: ''
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSubmit(formData);
//     setFormData({ description: '', date: '', project_id: '', responsible: '' });
//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-xl font-bold text-gray-900">Create New Event</h3>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Event Description
//             </label>
//             <textarea
//               value={formData.description}
//               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//               rows={3}
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Date
//             </label>
//             <input
//               type="date"
//               value={formData.date}
//               onChange={(e) => setFormData({ ...formData, date: e.target.value })}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Project
//             </label>
//             <select
//               value={formData.project_id}
//               onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//             >
//               <option value="">Select Project (Optional)</option>
//               {projects.map(project => (
//                 <option key={project.id} value={project.id}>
//                   {project.title || project.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Responsible Person
//             </label>
//             <input
//               type="text"
//               value={formData.responsible}
//               onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//               placeholder="Enter responsible person"
//             />
//           </div>

//           <div className="flex space-x-3 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
//             >
//               Create Event
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // Calendar Component
// const CalendarWidget = ({ data, theme, onCreateEvent }) => {
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [showEventModal, setShowEventModal] = useState(false);

//   const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
//   const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
//   const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December'];
//   const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

//   const goToPrevMonth = () => {
//     setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
//   };

//   const goToNextMonth = () => {
//     setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
//   };

//   const isToday = (day) => {
//     const today = new Date();
//     return day === today.getDate() &&
//            currentDate.getMonth() === today.getMonth() &&
//            currentDate.getFullYear() === today.getFullYear();
//   };

//   const hasEvents = (day) => {
//     return data.events.some(event => {
//       const eventDate = new Date(event.date || event.start_date);
//       return eventDate.getDate() === day &&
//              eventDate.getMonth() === currentDate.getMonth() &&
//              eventDate.getFullYear() === currentDate.getFullYear();
//     });
//   };

//   const getEventsForDate = (day) => {
//     return data.events.filter(event => {
//       const eventDate = new Date(event.date || event.start_date);
//       return eventDate.getDate() === day &&
//              eventDate.getMonth() === currentDate.getMonth() &&
//              eventDate.getFullYear() === currentDate.getFullYear();
//     });
//   };

//   const handleDateClick = (day) => {
//     const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
//     setSelectedDate(clickedDate);
//     setShowEventModal(true);
//   };

//   const handleCreateEvent = (eventData) => {
//     onCreateEvent(eventData);
//   };

//   const renderCalendarDays = () => {
//     const days = [];

//     // Empty cells for days before month starts
//     for (let i = 0; i < firstDayOfMonth; i++) {
//       days.push(<div key={`empty-${i}`} className="h-12"></div>);
//     }

//     // Days of the month
//     for (let day = 1; day <= daysInMonth; day++) {
//       const dayEvents = getEventsForDate(day);
//       days.push(
//         <div
//           key={day}
//           onClick={() => handleDateClick(day)}
//           className={`h-12 flex flex-col items-center justify-center cursor-pointer rounded-lg transition-all duration-200 relative hover:bg-blue-50 ${
//             isToday(day)
//               ? 'bg-gradient-to-br from-orange-500 to-yellow-500 text-white shadow-md'
//               : 'text-gray-700'
//           }`}
//         >
//           <span className="text-sm font-medium">{day}</span>
//           {hasEvents(day) && (
//             <div className="absolute bottom-1 flex space-x-1">
//               {dayEvents.slice(0, 3).map((_, index) => (
//                 <div key={index} className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
//               ))}
//               {dayEvents.length > 3 && (
//                 <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
//               )}
//             </div>
//           )}
//         </div>
//       );
//     }
//     return days;
//   };

//   const todaysEvents = data.events.filter(event => {
//     const today = new Date();
//     const eventDate = new Date(event.date || event.start_date);
//     return eventDate.toDateString() === today.toDateString();
//   });

//   const upcomingEvents = data.events.filter(event => {
//     const eventDate = new Date(event.date || event.start_date);
//     const today = new Date();
//     const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
//     return eventDate > today && eventDate <= oneWeekFromNow;
//   }).sort((a, b) => new Date(a.date || a.start_date) - new Date(b.date || b.start_date));

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//       <div className={`lg:col-span-2 p-6 ${theme.colors.card} rounded-xl border ${theme.colors.border} shadow-sm hover:shadow-md transition-all duration-200`}>
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center space-x-3">
//             <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500">
//               <Calendar className="h-6 w-6 text-white" />
//             </div>
//             <h3 className={`text-2xl font-bold ${theme.colors.text}`}>
//               {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
//             </h3>
//           </div>
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={goToPrevMonth}
//               className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
//             >
//               <ChevronLeft className="h-5 w-5 text-gray-600" />
//             </button>
//             <button
//               onClick={goToNextMonth}
//               className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
//             >
//               <ChevronRight className="h-5 w-5 text-gray-600" />
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-7 gap-2 mb-3">
//           {dayNames.map(day => (
//             <div key={day} className="h-8 flex items-center justify-center">
//               <span className={`text-sm font-semibold ${theme.colors.textSecondary}`}>{day}</span>
//             </div>
//           ))}
//         </div>

//         <div className="grid grid-cols-7 gap-2">
//           {renderCalendarDays()}
//         </div>

//         <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
//           <p className="text-sm text-blue-700 flex items-center">
//             <Calendar className="h-4 w-4 mr-2" />
//             Click on any date to create a new event
//           </p>
//         </div>
//       </div>

//       <div className={`p-6 ${theme.colors.card} rounded-xl border ${theme.colors.border} shadow-sm hover:shadow-md transition-all duration-200`}>
//         <div className="flex items-center space-x-2 mb-4">
//           <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
//             <CalendarDays className="h-6 w-6 text-white" />
//           </div>
//           <h3 className={`text-xl font-bold ${theme.colors.text}`}>Today's Events</h3>
//         </div>

//         <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
//           {todaysEvents.length > 0 ? (
//             todaysEvents.map((event, index) => (
//               <div key={event.id || index} className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
//                 <h4 className="text-sm font-semibold text-blue-900 mb-1">
//                   {event.description || event.title || event.name}
//                 </h4>
//                 <p className="text-xs text-blue-700">{event.responsible || 'Unassigned'}</p>
//                 <div className="flex items-center space-x-1 mt-1">
//                   <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                   <span className="text-xs text-blue-600">
//                     {event.project?.name || 'General Event'}
//                   </span>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="text-center py-4">
//               <CalendarDays className={`h-8 w-8 ${theme.colors.textMuted} mx-auto mb-2 opacity-50`} />
//               <p className={`text-sm ${theme.colors.textMuted}`}>No events today</p>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className={`p-6 ${theme.colors.card} rounded-xl border ${theme.colors.border} shadow-sm hover:shadow-md transition-all duration-200`}>
//         <div className="flex items-center space-x-2 mb-4">
//           <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
//             <Clock className="h-6 w-6 text-white" />
//           </div>
//           <h3 className={`text-xl font-bold ${theme.colors.text}`}>Upcoming Events</h3>
//           <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
//             Next 7 days
//           </span>
//         </div>

//         <div className="space-y-3 max-h-60 overflow-y-auto">
//           {upcomingEvents.length > 0 ? (
//             upcomingEvents.map((event, index) => (
//               <div key={event.id || index} className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
//                 <div className="flex justify-between items-start mb-1">
//                   <h4 className="text-sm font-semibold text-green-900">
//                     {event.description || event.title || event.name}
//                   </h4>
//                   <span className="text-xs text-green-600 font-medium">
//                     {new Date(event.date || event.start_date).toLocaleDateString('en-US', {
//                       month: 'short',
//                       day: 'numeric'
//                     })}
//                   </span>
//                 </div>
//                 <p className="text-xs text-green-700 mb-1">{event.responsible || 'Unassigned'}</p>
//                 <div className="flex items-center space-x-1">
//                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                   <span className="text-xs text-green-600">
//                     {event.project?.name || 'General Event'}
//                   </span>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="text-center py-4">
//               <Clock className={`h-8 w-8 ${theme.colors.textMuted} mx-auto mb-2 opacity-50`} />
//               <p className={`text-sm ${theme.colors.textMuted}`}>No upcoming events</p>
//               <p className={`text-xs ${theme.colors.textMuted} mt-1`}>Create events by clicking on calendar dates</p>
//             </div>
//           )}
//         </div>
//       </div>

//       <EventModal
//         isOpen={showEventModal}
//         onClose={() => setShowEventModal(false)}
//         onSubmit={handleCreateEvent}
//         selectedDate={selectedDate}
//         projects={data.projects}
//       />
//     </div>
//   );
// };

// // Loading Screen
// const LoadingScreen = ({ theme }) => (
//   <div className={`min-h-screen ${theme.colors.background} flex items-center justify-center`}>
//     <div className="text-center">
//       <div className="relative">
//         <div className="w-24 h-24 border-6 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
//           <div className="flex items-center space-x-1">
//             <Palette className="h-6 w-6 text-orange-500" />
//             <Brush className="h-6 w-6 text-yellow-500" />
//           </div>
//         </div>
//       </div>
//       <h3 className={`text-3xl font-bold ${theme.colors.text} mb-2`}>Ujenzi & Paints</h3>
//       <p className={`text-lg ${theme.colors.textSecondary} mb-1`}>Construction & Paint Management</p>
//       <p className={`text-sm ${theme.colors.textMuted}`}>Loading dashboard...</p>
//     </div>
//   </div>
// );

// // Main Dashboard Component
// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const theme = useTheme();
//   const { data, loading, error, lastUpdated, refreshing, refetch } = useDashboardData();

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [currentView, setCurrentView] = useState('dashboard');
//   const [selectedManager, setSelectedManager] = useState(null);

//   const showingManagerDetails = currentView === 'manager-details' && selectedManager;

//   useEffect(() => {
//     const savedCollapsed = localStorage.getItem('sidebar-collapsed');
//     if (savedCollapsed !== null) {
//       setSidebarCollapsed(JSON.parse(savedCollapsed));
//     }
//   }, []);

//   useEffect(() => {
//     setSidebarOpen(false);
//   }, [location.pathname]);

//   const handleSidebarCollapseChange = (collapsed) => {
//     setSidebarCollapsed(collapsed);
//   };

//   const handleManagerClick = (manager) => {
//     setSelectedManager(manager);
//     setCurrentView('manager-details');
//   };

//   const handleProjectClick = (project) => {
//     navigate(`/admin/projects/${project.id}`);
//   };

//   const handleBackToDashboard = () => {
//     setCurrentView('dashboard');
//     setSelectedManager(null);
//   };

//   const handleCreateEvent = async (eventData) => {
//     try {
//       await eventsAPI.create(eventData);
//       refetch(); // Refresh data to show new event
//     } catch (error) {
//       console.error('Failed to create event:', error);
//     }
//   };

//   const toggleSidebarCollapse = () => {
//     const newCollapsed = !sidebarCollapsed;
//     setSidebarCollapsed(newCollapsed);
//     localStorage.setItem('sidebar-collapsed', JSON.stringify(newCollapsed));
//   };

//   if (loading) return <LoadingScreen theme={theme} />;

//   if (error) return (
//     <div className={`min-h-screen ${theme.colors.background} flex items-center justify-center p-8`}>
//       <div className={`max-w-lg w-full text-center p-6 ${theme.colors.card} rounded-xl border ${theme.colors.border} shadow-sm hover:shadow-md transition-all duration-200`}>
//         <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
//         <h3 className={`text-2xl font-bold ${theme.colors.text} mb-4`}>API Connection Error</h3>
//         <p className={`text-lg ${theme.colors.textSecondary} mb-6`}>{error}</p>
//         <button
//           onClick={refetch}
//           className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-6 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all font-semibold"
//         >
//           Retry Connection
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <div className={`min-h-screen ${theme.colors.background} transition-all duration-300`}>
//       {/* AdminSidebar Component */}
//       <AdminSidebar
//         isOpen={sidebarOpen}
//         setIsOpen={setSidebarOpen}
//         onCollapseChange={handleSidebarCollapseChange}
//         theme={{
//           isDark: theme.isDark,
//           colors: {
//             sidebarBg: 'bg-white',
//             text: 'text-gray-700',
//             textMuted: 'text-gray-500',
//             textSecondary: 'text-gray-600',
//             border: 'border-gray-200'
//           }
//         }}
//       />

//       {/* Main Content */}
//       <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-80'}`}>
//         <div className="p-6">
//           {showingManagerDetails ? (
//             <div>
//               <div className="mb-6">
//                 <button
//                   onClick={handleBackToDashboard}
//                   className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
//                 >
//                   <ChevronLeft className="h-4 w-4" />
//                   <span>Back to Dashboard</span>
//                 </button>
//               </div>
//               {selectedManager && (
//                 <ProjectManagerDetails managerId={selectedManager.id} />
//               )}
//             </div>
//           ) : (
//             <>
//               {/* Header */}
//               <div className="flex items-center justify-between mb-8">
//                 <div className="flex items-center space-x-4">
//                   <button
//                     onClick={() => setSidebarOpen(true)}
//                     className="lg:hidden p-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600 transition-all"
//                   >
//                     <Menu className="h-5 w-5" />
//                   </button>

//                   <button
//                     onClick={toggleSidebarCollapse}
//                     className="hidden lg:flex p-3 rounded-xl bg-gray-500 text-white hover:bg-gray-600 transition-all"
//                     title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
//                   >
//                     {sidebarCollapsed ? <Maximize2 className="h-5 w-5" /> : <Minimize2 className="h-5 w-5" />}
//                   </button>

//                   <div>
//                     <div className="flex items-center space-x-3 mb-2">
//                       <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500">
//                         <Palette className="h-8 w-8 text-white" />
//                       </div>
//                       <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
//                         <Building2 className="h-8 w-8 text-white" />
//                       </div>
//                     </div>
//                     <h1 className={`text-4xl font-bold ${theme.colors.text} mb-1 bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600 bg-clip-text text-transparent`}>
//                       Ujenzi & Paints
//                     </h1>
//                     <p className={`text-lg ${theme.colors.textSecondary}`}>
//                       Construction & Paint Management Dashboard
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-4">
//                   <div className="text-right">
//                     <p className={`text-sm ${theme.colors.textSecondary}`}>Last Updated</p>
//                     <p className={`text-lg font-semibold ${theme.colors.text}`}>
//                       {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
//                     </p>
//                   </div>
//                   <button
//                     onClick={refetch}
//                     disabled={refreshing}
//                     className={`p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all ${refreshing ? 'animate-spin' : ''}`}
//                   >
//                     <RefreshCw className="h-5 w-5" />
//                   </button>
//                   <button
//                     onClick={theme.toggleTheme}
//                     className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:from-purple-600 hover:to-violet-600 transition-all"
//                   >
//                     {theme.isDark ? '☀️' : '🌙'}
//                   </button>
//                 </div>
//               </div>

//               {/* Statistics Grid */}
//               <StatsGrid data={data} theme={theme} />

//               {/* Main Content Grid */}
//               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
//                 {/* Monthly Revenue Chart */}
//                 <div className={`p-6 ${theme.colors.card} rounded-xl border ${theme.colors.border} shadow-sm hover:shadow-md transition-all duration-200`}>
//                   <div className="flex items-center justify-between mb-4">
//                     <h4 className={`text-xl font-bold ${theme.colors.text} flex items-center space-x-2`}>
//                       <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
//                         <DollarSign className="h-5 w-5 text-white" />
//                       </div>
//                       <span>Monthly Revenue</span>
//                     </h4>
//                   </div>
//                   <ResponsiveContainer width="100%" height={250}>
//                     <AreaChart data={data.chartData.monthlyRevenue}>
//                       <defs>
//                         <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
//                           <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
//                           <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
//                         </linearGradient>
//                       </defs>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
//                       <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
//                       <YAxis stroke="#6b7280" fontSize={12} />
//                       <Tooltip />
//                       <Area
//                         type="monotone"
//                         dataKey="revenue"
//                         stroke="#f97316"
//                         fill="url(#colorRevenue)"
//                         strokeWidth={2}
//                       />
//                       <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
//                     </AreaChart>
//                   </ResponsiveContainer>
//                 </div>

//                 {/* Weekly Tasks Chart */}
//                 <div className={`p-6 ${theme.colors.card} rounded-xl border ${theme.colors.border} shadow-sm hover:shadow-md transition-all duration-200`}>
//                   <div className="flex items-center justify-between mb-4">
//                     <h4 className={`text-xl font-bold ${theme.colors.text} flex items-center space-x-2`}>
//                       <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
//                         <BarChart3 className="h-5 w-5 text-white" />
//                       </div>
//                       <span>Weekly Tasks</span>
//                     </h4>
//                   </div>
//                   <ResponsiveContainer width="100%" height={250}>
//                     <ComposedChart data={data.chartData.weeklyTasks}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
//                       <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
//                       <YAxis stroke="#6b7280" fontSize={12} />
//                       <Tooltip />
//                       <Legend />
//                       <Bar dataKey="completed" fill="#10b981" radius={[2, 2, 0, 0]} />
//                       <Bar dataKey="pending" fill="#f59e0b" radius={[2, 2, 0, 0]} />
//                     </ComposedChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>

//               {/* Charts Grid */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//                 {/* Task Status Chart */}
//                 <Card>
//                   <div className="flex items-center justify-between mb-4">
//                     <h4 className={`text-lg font-bold ${theme.colors.text} flex items-center space-x-2`}>
//                       <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
//                         <CheckSquare className="h-4 w-4 text-white" />
//                       </div>
//                       <span>Task Status</span>
//                     </h4>
//                   </div>
//                   <ResponsiveContainer width="100%" height={200}>
//                     <PieChart>
//                       <Pie
//                         data={data.chartData.taskStatus}
//                         cx="50%"
//                         cy="50%"
//                         innerRadius={30}
//                         outerRadius={70}
//                         paddingAngle={2}
//                         dataKey="value"
//                       >
//                         {data.chartData.taskStatus.map((entry, index) => (
//                           <Cell key={`cell-${index}`} fill={entry.color} />
//                         ))}
//                       </Pie>
//                       <Tooltip />
//                       <Legend />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </Card>

//                 {/* Project Status Chart */}
//                 <Card>
//                   <div className="flex items-center justify-between mb-4">
//                     <h4 className={`text-lg font-bold ${theme.colors.text} flex items-center space-x-2`}>
//                       <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
//                         <Building2 className="h-4 w-4 text-white" />
//                       </div>
//                       <span>Project Status</span>
//                     </h4>
//                   </div>
//                   <ResponsiveContainer width="100%" height={200}>
//                     <BarChart data={data.chartData.projectStatus}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
//                       <XAxis dataKey="name" stroke="#6b7280" fontSize={10} />
//                       <YAxis stroke="#6b7280" fontSize={10} />
//                       <Tooltip />
//                       <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </Card>
//               </div>

//               {/* Project Managers Section - Dynamic List */}
//               <div className={`p-6 ${theme.colors.card} rounded-xl border ${theme.colors.border} shadow-sm hover:shadow-md transition-all duration-200 mb-8`}>
//                 <div className="flex items-center justify-between mb-6">
//                   <h3 className={`text-2xl font-bold ${theme.colors.text} flex items-center space-x-3`}>
//                     <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500">
//                       <Users className="h-6 w-6 text-white" />
//                     </div>
//                     <span>Project Managers - Workload Priority</span>
//                   </h3>
//                   <div className="text-right">
//                     <div className="text-sm text-gray-600">Total Managers</div>
//                     <div className="text-2xl font-bold text-purple-600">{data.managers.length}</div>
//                   </div>
//                 </div>

//                 {/* Dynamic Manager List - Sorted by Workload */}
//                 <div className="space-y-4">
//                   {data.managers
//                     .sort((a, b) => b.workload - a.workload) // Sort by workload (highest first)
//                     .map((manager, index) => {
//                       const getBusyStatus = (workload) => {
//                         if (workload >= 80) return {
//                           status: 'Very Busy',
//                           color: 'text-red-600',
//                           bgColor: 'bg-red-50',
//                           borderColor: 'border-red-200',
//                           dotColor: 'bg-red-500',
//                           priority: 4
//                         };
//                         if (workload >= 60) return {
//                           status: 'Busy',
//                           color: 'text-orange-600',
//                           bgColor: 'bg-orange-50',
//                           borderColor: 'border-orange-200',
//                           dotColor: 'bg-orange-500',
//                           priority: 3
//                         };
//                         if (workload >= 30) return {
//                           status: 'Moderate',
//                           color: 'text-yellow-600',
//                           bgColor: 'bg-yellow-50',
//                           borderColor: 'border-yellow-200',
//                           dotColor: 'bg-yellow-500',
//                           priority: 2
//                         };
//                         return {
//                           status: 'Available',
//                           color: 'text-green-600',
//                           bgColor: 'bg-green-50',
//                           borderColor: 'border-green-200',
//                           dotColor: 'bg-green-500',
//                           priority: 1
//                         };
//                       };

//                       const busyInfo = getBusyStatus(manager.workload);

//                       return (
//                         <div
//                           key={manager.id || index}
//                           onClick={() => handleManagerClick(manager)}
//                           className={`p-5 bg-white rounded-xl border-2 ${busyInfo.borderColor} hover:shadow-lg cursor-pointer transition-all duration-300 group relative overflow-hidden ${busyInfo.bgColor}`}
//                         >
//                           {/* Priority Indicator */}
//                           <div className="absolute top-3 left-3">
//                             <div className={`w-8 h-8 rounded-full ${busyInfo.bgColor} border-2 ${busyInfo.borderColor} flex items-center justify-center`}>
//                               <span className={`text-sm font-bold ${busyInfo.color}`}>#{index + 1}</span>
//                             </div>
//                           </div>

//                           {/* Workload Level Indicator */}
//                           <div className="absolute top-3 right-3">
//                             <div className={`flex space-x-1`}>
//                               {[...Array(4)].map((_, i) => (
//                                 <div
//                                   key={i}
//                                   className={`w-2 h-6 rounded-full ${
//                                     i < busyInfo.priority ? busyInfo.dotColor : 'bg-gray-200'
//                                   }`}
//                                 ></div>
//                               ))}
//                             </div>
//                           </div>

//                           <div className="flex items-center space-x-4 pl-12 pr-16">
//                             {/* Manager Avatar */}
//                             <div className="relative">
//                               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
//                                 {manager.avatar}
//                               </div>
//                               <div className={`absolute -top-1 -right-1 w-4 h-4 ${busyInfo.dotColor} rounded-full border-2 border-white animate-pulse`}></div>
//                             </div>

//                             {/* Manager Info */}
//                             <div className="flex-1">
//                               <div className="flex items-center space-x-3 mb-2">
//                                 <h4 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
//                                   {manager.name}
//                                 </h4>
//                                 <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${busyInfo.bgColor} ${busyInfo.color} border ${busyInfo.borderColor}`}>
//                                   {busyInfo.status}
//                                 </div>
//                               </div>

//                               <p className="text-sm text-gray-600 mb-3">{manager.email}</p>

//                               {/* Stats Grid */}
//                               <div className="grid grid-cols-4 gap-4">
//                                 <div className="text-center">
//                                   <div className="flex items-center justify-center space-x-1 mb-1">
//                                     <Building2 className="h-4 w-4 text-blue-500" />
//                                     <span className="font-bold text-blue-600">{manager.projectsCount}</span>
//                                   </div>
//                                   <span className="text-xs text-gray-500">Projects</span>
//                                 </div>

//                                 <div className="text-center">
//                                   <div className="flex items-center justify-center space-x-1 mb-1">
//                                     <Target className="h-4 w-4 text-orange-500" />
//                                     <span className="font-bold text-orange-600">{Math.round(manager.workload)}%</span>
//                                   </div>
//                                   <span className="text-xs text-gray-500">Workload</span>
//                                 </div>

//                                 <div className="text-center">
//                                   <div className="flex items-center justify-center space-x-1 mb-1">
//                                     <Zap className="h-4 w-4 text-green-500" />
//                                     <span className="font-bold text-green-600">{Math.round(manager.efficiency)}%</span>
//                                   </div>
//                                   <span className="text-xs text-gray-500">Efficiency</span>
//                                 </div>

//                                 <div className="text-center">
//                                   <div className="flex items-center justify-center space-x-1 mb-1">
//                                     <DollarSign className="h-4 w-4 text-purple-500" />
//                                     <span className="font-bold text-purple-600">${((manager.totalBudget || 0) / 1000000).toFixed(1)}M</span>
//                                   </div>
//                                   <span className="text-xs text-gray-500">Budget</span>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>

//                           {/* Workload Progress Bar */}
//                           <div className="mt-4 pl-12 pr-16">
//                             <div className="flex justify-between text-sm mb-1">
//                               <span className="text-gray-600">Workload Capacity</span>
//                               <span className={`font-semibold ${busyInfo.color}`}>{Math.round(manager.workload)}% / 100%</span>
//                             </div>
//                             <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
//                               <div
//                                 className={`h-full transition-all duration-1000 ease-out ${
//                                   manager.workload >= 80 ? 'bg-gradient-to-r from-red-500 to-red-600' :
//                                   manager.workload >= 60 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
//                                   manager.workload >= 30 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
//                                   'bg-gradient-to-r from-green-500 to-green-600'
//                                 } relative`}
//                                 style={{ width: `${manager.workload}%` }}
//                               >
//                                 <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
//                               </div>
//                             </div>
//                           </div>

//                           {/* Action Indicator */}
//                           <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                             <div className="p-2 bg-purple-500 rounded-full shadow-lg">
//                               <ArrowRight className="h-4 w-4 text-white" />
//                             </div>
//                           </div>

//                           {/* Urgent Badge for Very Busy Managers */}
//                           {manager.workload >= 80 && (
//                             <div className="absolute top-0 right-0 transform translate-x-1 -translate-y-1">
//                               <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-bounce">
//                                 URGENT
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
//                 </div>

//                 {/* Workload Summary */}
//                 <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200">
//                   <h4 className="text-lg font-semibold text-purple-900 mb-3">Workload Distribution Summary</h4>
//                   <div className="grid grid-cols-4 gap-4">
//                     <div className="text-center">
//                       <div className="text-2xl font-bold text-red-600">
//                         {data.managers.filter(m => m.workload >= 80).length}
//                       </div>
//                       <div className="text-sm text-red-700">Very Busy</div>
//                     </div>
//                     <div className="text-center">
//                       <div className="text-2xl font-bold text-orange-600">
//                         {data.managers.filter(m => m.workload >= 60 && m.workload < 80).length}
//                       </div>
//                       <div className="text-sm text-orange-700">Busy</div>
//                     </div>
//                     <div className="text-center">
//                       <div className="text-2xl font-bold text-yellow-600">
//                         {data.managers.filter(m => m.workload >= 30 && m.workload < 60).length}
//                       </div>
//                       <div className="text-sm text-yellow-700">Moderate</div>
//                     </div>
//                     <div className="text-center">
//                       <div className="text-2xl font-bold text-green-600">
//                         {data.managers.filter(m => m.workload < 30).length}
//                       </div>
//                       <div className="text-sm text-green-700">Available</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Active Projects Section */}
//               <div className={`p-6 ${theme.colors.card} rounded-xl border ${theme.colors.border} shadow-sm hover:shadow-md transition-all duration-200 mb-8`}>
//                 <div className="flex items-center justify-between mb-6">
//                   <h3 className={`text-2xl font-bold ${theme.colors.text} flex items-center space-x-3`}>
//                     <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
//                       <Building2 className="h-6 w-6 text-white" />
//                     </div>
//                     <span>Active Projects</span>
//                   </h3>
//                   <div className="text-right">
//                     <div className="text-sm text-gray-600">Active Projects</div>
//                     <div className="text-2xl font-bold text-green-600">{data.statistics.activeProjects}</div>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//                   {data.projects.slice(0, 8).map((project, index) => (
//                     <ProjectCard
//                       key={project.id || index}
//                       project={project}
//                       theme={theme}
//                       onClick={handleProjectClick}
//                     />
//                   ))}
//                 </div>
//                 {data.projects.length > 8 && (
//                   <div className="mt-4 text-center">
//                     <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all">
//                       View All Projects ({data.projects.length})
//                     </button>
//                   </div>
//                 )}
//               </div>

//               {/* Calendar Section */}
//               <div className={`p-6 ${theme.colors.card} rounded-xl border ${theme.colors.border} shadow-sm hover:shadow-md transition-all duration-200 mb-8`}>
//                 <div className="flex items-center space-x-3 mb-6">
//                   <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
//                     <Calendar className="h-6 w-6 text-white" />
//                   </div>
//                   <h2 className={`text-2xl font-bold ${theme.colors.text}`}>Project Calendar & Events</h2>
//                 </div>
//                 <CalendarWidget data={data} theme={theme} onCreateEvent={handleCreateEvent} />
//               </div>

//               {/* Footer */}
//               <div className="text-center py-6 border-t border-gray-200">
//                 <div className="flex items-center justify-center space-x-3 mb-3">
//                   <Palette className="h-6 w-6 text-orange-500" />
//                   <Building2 className="h-6 w-6 text-blue-500" />
//                   <Brush className="h-6 w-6 text-yellow-500" />
//                 </div>
//                 <p className={`text-lg ${theme.colors.textMuted} mb-1`}>
//                   Ujenzi & Paints Enterprise • Construction & Paint Management Platform
//                 </p>
//                 <p className={`text-sm ${theme.colors.textMuted}`}>
//                   © 2024 Ujenzi & Paints Solutions • Last updated: {lastUpdated?.toLocaleString()}
//                 </p>
//                 <p className={`text-xs ${theme.colors.textMuted} mt-1`}>
//                   Projects: {data.projects.length} • Tasks: {data.tasks.length} • Team: {data.statistics.teamSize}
//                 </p>
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Mobile Sidebar Overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         ></div>
//       )}
//     </div>

//   );
// };

// export default AdminDashboard;
















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
//   PieChart,
//   Pie,
//   Cell,
//   AreaChart,
//   Area,
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
//   PieChart as PieChartIcon,
//   Globe,
//   MapPin,
//   DollarSign,
//   Target,
//   ChevronLeft,
//   Timer,
//   Award,
//   Eye,
//   CalendarDays,
//   ChevronRight
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

// // Theme Hook
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
//           : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50",
//         card: isDark ? "bg-gray-800" : "bg-white/95 backdrop-blur-sm",
//         border: isDark ? "border-gray-700" : "border-gray-200/50",
//         text: isDark ? "text-gray-100" : "text-gray-900",
//         textSecondary: isDark ? "text-gray-400" : "text-gray-600",
//         textMuted: isDark ? "text-gray-500" : "text-gray-500",
//       },
//     }),
//     [isDark]
//   );
//   return { ...theme, toggleTheme };
// };

// // Dashboard Panel Component
// const DashboardPanel = ({ children, title, icon: Icon, className = "" }) => {
//   const theme = useTheme();
//   return (
//     <div className={`${theme.colors.card} rounded-xl border ${theme.colors.border} shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}>
//       {title && (
//         <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
//           <div className="flex items-center space-x-3">
//             {Icon && (
//               <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 shadow-md">
//                 <Icon className="h-5 w-5 text-white" />
//               </div>
//             )}
//             <h3 className={`text-lg font-semibold ${theme.colors.text}`}>{title}</h3>
//           </div>
//         </div>
//       )}
//       <div className="p-6">
//         {children}
//       </div>
//     </div>
//   );
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
//       const dashboard = dashboardResponse.status === "fulfilled" ? dashboardResponse.value : {};
//       const projectsData = projectsResponse.status === "fulfilled" ? projectsResponse.value : { projects: [] };
//       const managersData = managersResponse.status === "fulfilled" ? managersResponse.value : [];
//       const eventsData = eventsResponse.status === "fulfilled" ? eventsResponse.value : { events: [] };
//       const tasksData = tasksResponse.status === "fulfilled" ? tasksResponse.value : { tasks: [] };
//       const tendersData = tendersResponse.status === "fulfilled" ? tendersResponse.value : { tenders: [] };
//       const teamMembersData = teamMembersResponse.status === "fulfilled" ? teamMembersResponse.value : { team_members: [] };
//       const supervisorsData = supervisorsResponse.status === "fulfilled" ? supervisorsResponse.value : [];
//       const siteManagersData = siteManagersResponse.status === "fulfilled" ? siteManagersResponse.value : [];
//       const notificationsData = notificationsResponse.status === "fulfilled" ? notificationsResponse.value : [];
//       const calendarEventsData = calendarEventsResponse.status === "fulfilled" ? calendarEventsResponse.value : [];

//       // Normalize data with safe fallbacks
//       const projects = Array.isArray(projectsData.projects) ? projectsData.projects : Array.isArray(projectsData) ? projectsData : [];
//       const events = Array.isArray(eventsData.events) ? eventsData.events : Array.isArray(eventsData) ? eventsData : [];
//       const tasks = Array.isArray(tasksData.tasks) ? tasksData.tasks : Array.isArray(tasksData) ? tasksData : [];
//       const tenders = Array.isArray(tendersData.tenders) ? tendersData.tenders : Array.isArray(tendersData) ? tendersData : [];
//       const supervisors = Array.isArray(supervisorsData) ? supervisorsData : [];
//       const siteManagers = Array.isArray(siteManagersData) ? siteManagersData : [];
//       const notifications = Array.isArray(notificationsData) ? notificationsData : [];
//       const todayEvents = Array.isArray(calendarEventsData) ? calendarEventsData : [];

//       // Process managers data with safe operations
//       const managers = Array.isArray(managersData)
//         ? managersData.map((manager) => ({
//             id: manager.id || Math.random().toString(),
//             name: manager.name || "Unknown Manager",
//             email: manager.email || "unknown@email.com",
//             projectsCount: manager.number_of_projects || 0,
//             workload: Math.min(100, (manager.number_of_projects || 0) * 25),
//             efficiency: 85 + Math.random() * 15,
//             avatar: manager.name?.split(" ").map((n) => n[0]).join("") || "M",
//             role: "Manager",
//             performance: 75 + Math.random() * 25,
//           }))
//         : [];

//       // Process supervisors data with safe operations
//       const processedSupervisors = supervisors.map((supervisor) => ({
//         id: supervisor.id || Math.random().toString(),
//         name: supervisor.name || "Unknown Supervisor",
//         email: supervisor.email || "unknown@email.com",
//         projectsCount: supervisor.number_of_projects || Math.floor(Math.random() * 8) + 1,
//         workload: Math.min(100, (supervisor.number_of_projects || Math.floor(Math.random() * 8) + 1) * 20),
//         efficiency: 80 + Math.random() * 20,
//         avatar: supervisor.name?.split(" ").map((n) => n[0]).join("") || "S",
//         role: "Supervisor",
//         performance: 70 + Math.random() * 30,
//       }));

//       // Process site managers data with safe operations
//       const processedSiteManagers = siteManagers.map((siteManager) => ({
//         id: siteManager.id || Math.random().toString(),
//         name: siteManager.name || "Unknown Site Manager",
//         email: siteManager.email || "unknown@email.com",
//         projectsCount: siteManager.number_of_projects || Math.floor(Math.random() * 6) + 1,
//         workload: Math.min(100, (siteManager.number_of_projects || Math.floor(Math.random() * 6) + 1) * 25),
//         efficiency: 85 + Math.random() * 15,
//         avatar: siteManager.name?.split(" ").map((n) => n[0]).join("") || "SM",
//         role: "Site Manager",
//         performance: 75 + Math.random() * 25,
//       }));

//       // Calculate statistics with safe operations
//       const statistics = {
//         totalProjects: projects.length || 0,
//         activeProjects: projects.filter((p) => p.status === "active" || p.status === "in_progress").length || 0,
//         completedProjects: projects.filter((p) => p.status === "completed").length || 0,
//         totalTasks: tasks.length || 0,
//         completedTasks: tasks.filter((t) => t.status === "completed").length || 0,
//         pendingTasks: tasks.filter((t) => t.status === "pending").length || 0,
//         overdueTasks: tasks.filter((t) => {
//           if (!t.due_date) return false;
//           return new Date(t.due_date) < new Date() && t.status !== "completed";
//         }).length || 0,
//         teamSize: (managers.length || 0) + (processedSupervisors.length || 0) + (processedSiteManagers.length || 0),
//         activeTenders: tenders.filter((t) => t.status === "active").length || 0,
//         totalBudget: projects.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0) || 0,
//         unreadNotifications: notifications.filter((n) => !n.read).length || 0,
//         todayEvents: todayEvents.length || 0,
//         avgProgress: projects.length > 0 ? projects.reduce((sum, p) => sum + parseFloat(p.progress_percentage || p.progress || 0), 0) / projects.length : 0,
//         avgTeamEfficiency: managers.length > 0 ? managers.reduce((sum, m) => sum + (m.efficiency || 0), 0) / managers.length : 0,
//       };

//       // Generate chart data with safe operations
//       const allTeamMembers = [
//         ...managers.map(m => ({ ...m, type: 'Manager', color: '#3B82F6' })),
//         ...processedSupervisors.map(s => ({ ...s, type: 'Supervisor', color: '#8B5CF6' })),
//         ...processedSiteManagers.map(sm => ({ ...sm, type: 'Site Manager', color: '#06B6D4' }))
//       ];

//       // Sort by workload and get top 10 busiest with safe operations
//       const busiestTeamMembers = allTeamMembers
//         .filter(member => member.name && member.workload != null)
//         .sort((a, b) => (b.workload || 0) - (a.workload || 0))
//         .slice(0, 10)
//         .map(member => ({
//           name: (member.name || 'Unknown').split(' ')[0] || 'Unknown',
//           workload: member.workload || 0,
//           projects: member.projectsCount || 0,
//           role: member.type || 'Team Member',
//           color: member.color || '#6B7280',
//           efficiency: member.efficiency || 0,
//           performance: member.performance || 0
//         }));

//       // Project progress data with safe operations
//       const projectProgressData = projects.slice(0, 8).map((project, index) => ({
//         name: project.title?.replace('Project ', 'P') || project.name?.replace('Project ', 'P') || `P${project.id || index + 1}`,
//         progress: parseFloat(project.progress_percentage || project.progress || 0),
//         budget: parseFloat(project.budget || 0) / 1000000,
//         status: project.status || 'unknown',
//       }));

//       // Team radar data with safe calculations
//       const teamRadarData = [
//         { 
//           metric: 'Efficiency', 
//           Managers: managers.length > 0 ? managers.reduce((sum, m) => sum + (m.efficiency || 0), 0) / managers.length : 0, 
//           Supervisors: processedSupervisors.length > 0 ? processedSupervisors.reduce((sum, s) => sum + (s.efficiency || 0), 0) / processedSupervisors.length : 0, 
//           SiteManagers: processedSiteManagers.length > 0 ? processedSiteManagers.reduce((sum, sm) => sum + (sm.efficiency || 0), 0) / processedSiteManagers.length : 0 
//         },
//         { 
//           metric: 'Workload', 
//           Managers: managers.length > 0 ? managers.reduce((sum, m) => sum + (m.workload || 0), 0) / managers.length : 0, 
//           Supervisors: processedSupervisors.length > 0 ? processedSupervisors.reduce((sum, s) => sum + (s.workload || 0), 0) / processedSupervisors.length : 0, 
//           SiteManagers: processedSiteManagers.length > 0 ? processedSiteManagers.reduce((sum, sm) => sum + (sm.workload || 0), 0) / processedSiteManagers.length : 0 
//         },
//         { 
//           metric: 'Performance', 
//           Managers: managers.length > 0 ? managers.reduce((sum, m) => sum + (m.performance || 0), 0) / managers.length : 0, 
//           Supervisors: processedSupervisors.length > 0 ? processedSupervisors.reduce((sum, s) => sum + (s.performance || 0), 0) / processedSupervisors.length : 0, 
//           SiteManagers: processedSiteManagers.length > 0 ? processedSiteManagers.reduce((sum, sm) => sum + (sm.performance || 0), 0) / processedSiteManagers.length : 0 
//         },
//         { 
//           metric: 'Projects', 
//           Managers: managers.length > 0 ? (managers.reduce((sum, m) => sum + (m.projectsCount || 0), 0) / managers.length) * 10 : 0, 
//           Supervisors: processedSupervisors.length > 0 ? (processedSupervisors.reduce((sum, s) => sum + (s.projectsCount || 0), 0) / processedSupervisors.length) * 10 : 0, 
//           SiteManagers: processedSiteManagers.length > 0 ? (processedSiteManagers.reduce((sum, sm) => sum + (sm.projectsCount || 0), 0) / processedSiteManagers.length) * 10 : 0 
//         },
//       ];

//       // Performance metrics over time (simulated)
//       const performanceMetrics = Array.from({ length: 12 }, (_, i) => ({
//         month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
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
//     const interval = setInterval(() => fetchData(true), 300000);
//     return () => clearInterval(interval);
//   }, [fetchData]);

//   const refetch = useCallback(() => fetchData(true), [fetchData]);
//   return { data, loading, error, lastUpdated, refreshing, refetch };
// };

// // Live Statistics Component - Enhanced styling
// const LiveStatistics = ({ data, theme }) => {
//   const [currentTime, setCurrentTime] = useState(new Date());

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const stats = [
//     { 
//       label: "Active Projects", 
//       value: data.statistics?.activeProjects || 0, 
//       icon: Building2, 
//       color: "text-blue-600",
//       bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
//       iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
//       change: "+2 this week",
//       trend: "up"
//     },
//     { 
//       label: "Team Members", 
//       value: data.statistics?.teamSize || 0, 
//       icon: Users, 
//       color: "text-emerald-600",
//       bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
//       iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
//       change: "85% active now",
//       trend: "neutral"
//     },
//     { 
//       label: "Pending Tasks", 
//       value: data.statistics?.pendingTasks || 0, 
//       icon: Timer, 
//       color: "text-amber-600",
//       bgColor: "bg-gradient-to-br from-amber-50 to-amber-100",
//       iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
//       change: "-8 since yesterday",
//       trend: "down"
//     },
//     { 
//       label: "Project Budget", 
//       value: `$${((data.statistics?.totalBudget || 0) / 1000000).toFixed(1)}M`, 
//       icon: DollarSign, 
//       color: "text-emerald-600",
//       bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
//       iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
//       change: "92% utilized",
//       trend: "up"
//     }
//   ];

//   return (
//     <DashboardPanel title="Live Dashboard Overview" icon={Activity}>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-2">
//             <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg"></div>
//             <span className="text-sm font-medium text-gray-700">Real-time updates</span>
//           </div>
//           <div className="text-sm text-gray-500 font-mono">
//             {currentTime.toLocaleTimeString()}
//           </div>
//         </div>
        
//         <div className="grid grid-cols-1 gap-4">
//           {stats.map((stat, index) => (
//             <div key={index} className={`relative overflow-hidden p-5 rounded-xl ${stat.bgColor} border border-gray-200/50 hover:shadow-lg transition-all duration-300 group`}>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-4">
//                   <div className={`p-3 rounded-xl ${stat.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
//                     <stat.icon className="h-6 w-6 text-white" />
//                   </div>
//                   <div>
//                     <div className={`text-3xl font-bold ${stat.color} mb-1`}>
//                       {stat.value}
//                     </div>
//                     <div className="text-sm font-semibold text-gray-700">
//                       {stat.label}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <div className={`text-xs font-medium ${
//                     stat.trend === 'up' ? 'text-emerald-600' : 
//                     stat.trend === 'down' ? 'text-red-500' : 'text-gray-600'
//                   }`}>
//                     {stat.change}
//                   </div>
//                   {stat.trend !== 'neutral' && (
//                     <div className="mt-1">
//                       {stat.trend === 'up' ? (
//                         <TrendingUp className="h-4 w-4 text-emerald-500" />
//                       ) : (
//                         <TrendingDown className="h-4 w-4 text-red-500" />
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
              
//               <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
//             </div>
//           ))}
//         </div>

//         <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200/50">
//           <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200/50">
//             <div className="text-2xl font-bold text-purple-600">
//               {Math.round(data.statistics?.avgProgress || 0)}%
//             </div>
//             <div className="text-xs font-medium text-purple-800">Avg Progress</div>
//           </div>
//           <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200/50">
//             <div className="text-2xl font-bold text-indigo-600">
//               {Math.round(data.statistics?.avgTeamEfficiency || 0)}%
//             </div>
//             <div className="text-xs font-medium text-indigo-800">Team Efficiency</div>
//           </div>
//         </div>
//       </div>
//     </DashboardPanel>
//   );
// };

// // Quick Actions Panel - Enhanced styling
// const QuickActions = ({ theme }) => {
//   const actions = [
//     { 
//       label: "New Project", 
//       icon: Plus, 
//       color: "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
//       shadow: "hover:shadow-blue-500/25"
//     },
//     { 
//       label: "Add Task", 
//       icon: Clipboard, 
//       color: "bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
//       shadow: "hover:shadow-emerald-500/25"
//     },
//     { 
//       label: "Schedule Meeting", 
//       icon: Calendar, 
//       color: "bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
//       shadow: "hover:shadow-purple-500/25"
//     },
//     { 
//       label: "Create Tender", 
//       icon: Eye, 
//       color: "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
//       shadow: "hover:shadow-orange-500/25"
//     }
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
//         .filter(task => task.status === 'completed')
//         .slice(0, 2)
//         .map(task => ({
//           action: "Task completed",
//           project: task.project_name || task.title || "Unknown Project",
//           time: "Recently",
//           type: "success",
//           icon: CheckSquare
//         }));
//       recentActivities.push(...completedTasks);
//     }

//     if (data.tenders && data.tenders.length > 0) {
//       const activeTenders = data.tenders
//         .filter(tender => tender.status === 'active')
//         .slice(0, 1)
//         .map(tender => ({
//           action: "New tender submission",
//           project: tender.title || tender.name || "Unknown Tender",
//           time: "Recently",
//           type: "info",
//           icon: Eye
//         }));
//       recentActivities.push(...activeTenders);
//     }

//     if (data.statistics && data.statistics.overdueTasks > 0) {
//       recentActivities.push({
//         action: `${data.statistics.overdueTasks} tasks overdue`,
//         project: "Multiple Projects",
//         time: "Ongoing",
//         type: "warning",
//         icon: AlertTriangle
//       });
//     }

//     if (data.events && data.events.length > 0) {
//       const recentEvents = data.events
//         .slice(0, 1)
//         .map(event => ({
//           action: "Upcoming meeting",
//           project: event.project_name || event.title || "Team Meeting",
//           time: "Soon",
//           type: "info",
//           icon: Calendar
//         }));
//       recentActivities.push(...recentEvents);
//     }

//     if (recentActivities.length === 0) {
//       recentActivities.push(
//         { 
//           action: "System initialized", 
//           project: "Dashboard", 
//           time: "Just now", 
//           type: "info",
//           icon: Activity
//         },
//         { 
//           action: "Waiting for data", 
//           project: "API Connection", 
//           time: "Ongoing", 
//           type: "warning",
//           icon: RefreshCw
//         }
//       );
//     }

//     setActivities(recentActivities.slice(0, 4));
//   }, [data]);

//   const getTypeStyles = (type) => {
//     switch (type) {
//       case 'success': return 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200/50';
//       case 'warning': return 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 border-amber-200/50';
//       case 'info': return 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border-blue-200/50';
//       default: return 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 border-gray-200/50';
//     }
//   };

//   const getIconColor = (type) => {
//     switch (type) {
//       case 'success': return 'text-emerald-600';
//       case 'warning': return 'text-amber-600';
//       case 'info': return 'text-blue-600';
//       default: return 'text-gray-600';
//     }
//   };

//   return (
//     <DashboardPanel title="Recent Activity" icon={Activity}>
//       <div className="space-y-3">
//         {activities.map((activity, index) => (
//           <div key={index} className={`p-4 rounded-xl border ${getTypeStyles(activity.type)} hover:shadow-md transition-all duration-300`}>
//             <div className="flex items-start space-x-3">
//               <div className={`p-2 rounded-lg bg-white/50 ${getIconColor(activity.type)}`}>
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
//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'active': return 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 border-emerald-300';
//       case 'evaluation': return 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 border-amber-300';
//       case 'draft': return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300';
//       case 'closed': return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300';
//       default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300';
//     }
//   };

//   const getPriorityColor = (priority) => {
//     switch (priority?.toLowerCase()) {
//       case 'high': return 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-red-300';
//       case 'medium': return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700 border-yellow-300';
//       case 'low': return 'bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-green-300';
//       default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300';
//     }
//   };

//   const formatCurrency = (amount) => {
//     if (!amount) return '$0';
//     const num = parseFloat(amount);
//     if (num >= 1000000) {
//       return `${(num / 1000000).toFixed(1)}M`;
//     } else if (num >= 1000) {
//       return `${(num / 1000).toFixed(0)}K`;
//     }
//     return `${num.toLocaleString()}`;
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'No deadline';
//     try {
//       return new Date(dateString).toLocaleDateString();
//     } catch {
//       return 'Invalid date';
//     }
//   };

//   return (
//     <DashboardPanel title="Active Tenders" icon={Eye}>
//       <div className="space-y-4">
//         {data.tenders && data.tenders.length > 0 ? (
//           <>
//             {data.tenders.slice(0, 4).map((tender) => (
//               <div key={tender.id} className="p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-300 group">
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-start space-x-4">
//                       <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-md group-hover:scale-110 transition-transform duration-300">
//                         <Eye className="h-5 w-5 text-white" />
//                       </div>
//                       <div className="flex-1">
//                         <h4 className="font-bold text-gray-900 text-lg mb-2">{tender.title || tender.name || 'Untitled Tender'}</h4>
//                         <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
//                           <span className="flex items-center space-x-1">
//                             <DollarSign className="h-4 w-4" />
//                             <span>Budget: {formatCurrency(tender.budget_estimate || tender.value || tender.amount)}</span>
//                           </span>
//                           {tender.bidders_count && (
//                             <span className="flex items-center space-x-1">
//                               <Users className="h-4 w-4" />
//                               <span>{tender.bidders_count} Bidders</span>
//                             </span>
//                           )}
//                           <span className="flex items-center space-x-1">
//                             <Calendar className="h-4 w-4" />
//                             <span>Due: {formatDate(tender.deadline || tender.submission_deadline)}</span>
//                           </span>
//                         </div>
//                         <div className="flex items-center space-x-3">
//                           <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(tender.status)}`}>
//                             {tender.status?.toUpperCase() || 'UNKNOWN'}
//                           </span>
//                           {tender.priority && (
//                             <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(tender.priority)}`}>
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
//             <p className="text-sm">Tenders will appear here when available from the API</p>
//           </div>
//         )}
//       </div>
//     </DashboardPanel>
//   );
// };

// // Projects Section
// const ProjectsSection = ({ data, theme }) => {
//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'active': return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300';
//       case 'completed': return 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 border-emerald-300';
//       case 'on-hold': return 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 border-amber-300';
//       case 'delayed': return 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-red-300';
//       default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300';
//     }
//   };

//   const getProgressColor = (progress) => {
//     if (progress >= 80) return 'from-emerald-500 to-emerald-600';
//     if (progress >= 50) return 'from-blue-500 to-blue-600';
//     if (progress >= 25) return 'from-amber-500 to-amber-600';
//     return 'from-red-500 to-red-600';
//   };

//   const formatCurrency = (amount) => {
//     if (!amount) return '$0';
//     return `${(amount / 1000000).toFixed(1)}M`;
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'No deadline';
//     try {
//       return new Date(dateString).toLocaleDateString();
//     } catch {
//       return 'Invalid date';
//     }
//   };

//   return (
//     <DashboardPanel title="Active Projects" icon={Building2}>
//       <div className="space-y-4">
//         {data.projects && data.projects.length > 0 ? (
//           <>
//             {data.projects.slice(0, 4).map((project) => (
//               <div key={project.id} className="p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-300 group">
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex items-start space-x-4">
//                     <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-md group-hover:scale-110 transition-transform duration-300">
//                       <Building2 className="h-5 w-5 text-white" />
//                     </div>
//                     <div>
//                       <h4 className="font-bold text-gray-900 text-lg mb-1">{project.title || project.name || 'Untitled Project'}</h4>
//                       <p className="text-sm text-gray-600 mb-2">Manager: {project.manager || 'Unassigned'}</p>
//                       <div className="flex items-center space-x-4 text-sm text-gray-600">
//                         <span className="flex items-center space-x-1">
//                           <MapPin className="h-4 w-4" />
//                           <span>{project.location || 'Unknown'}</span>
//                         </span>
//                         <span className="flex items-center space-x-1">
//                           <Calendar className="h-4 w-4" />
//                           <span>{formatDate(project.deadline || project.end_date)}</span>
//                         </span>
//                         <span className="flex items-center space-x-1">
//                           <DollarSign className="h-4 w-4" />
//                           <span>{formatCurrency(project.budget)}</span>
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                   <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
//                     {project.status?.toUpperCase() || 'UNKNOWN'}
//                   </span>
//                 </div>
                
//                 <div className="space-y-2">
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="font-medium text-gray-700">Progress</span>
//                     <span className="font-bold text-gray-900">{Math.round(project.progress_percentage || project.progress || 0)}%</span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
//                     <div 
//                       className={`h-full bg-gradient-to-r ${getProgressColor(project.progress_percentage || project.progress || 0)} transition-all duration-500 rounded-full shadow-sm`}
//                       style={{ width: `${project.progress_percentage || project.progress || 0}%` }}
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
//             <p className="text-sm">Projects will appear here when available from the API</p>
//           </div>
//         )}
//       </div>
//     </DashboardPanel>
//   );
// };

// // Project Managers Section with clickable navigation
// const ProjectManagersSection = ({ data, theme, onManagerClick }) => {
//   const getWorkloadColor = (workload, status) => {
//     if (status === 'overloaded' || workload >= 90) return 'from-red-500 to-red-600 text-white';
//     if (workload >= 75) return 'from-amber-500 to-amber-600 text-white';
//     if (workload >= 50) return 'from-blue-500 to-blue-600 text-white';
//     return 'from-emerald-500 to-emerald-600 text-white';
//   };

//   const getStatusBadge = (status) => {
//     switch (status) {
//       case 'overloaded': return 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-red-300';
//       case 'busy': return 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 border-amber-300';
//       case 'optimal': return 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 border-emerald-300';
//       default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300';
//     }
//   };

//   const processedManagers = data.managers?.map(manager => ({
//     ...manager,
//     status: manager.workload >= 90 ? 'overloaded' : manager.workload >= 75 ? 'busy' : 'optimal'
//   })) || [];

//   const handleManagerClick = (manager) => {
//     onManagerClick(manager);
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
//                           {manager.avatar || manager.name?.charAt(0) || 'M'}
//                         </div>
//                         {index === 0 && manager.status === 'overloaded' && (
//                           <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
//                             <AlertTriangle className="h-3 w-3 text-white" />
//                           </div>
//                         )}
//                       </div>
                      
//                       <div className="flex-1">
//                         <div className="flex items-center space-x-3 mb-1">
//                           <h4 className="font-bold text-gray-900 text-lg">{manager.name}</h4>
//                           {manager.status === 'overloaded' && (
//                             <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full">
//                               NEEDS HELP
//                             </span>
//                           )}
//                         </div>
//                         <p className="text-sm text-gray-600 mb-2">{manager.role || 'Project Manager'}</p>
//                         <div className="flex items-center space-x-4 text-sm text-gray-600">
//                           <span>{manager.projectsCount || 0} Projects</span>
//                           <span>Efficiency: {Math.round(manager.efficiency || 0)}%</span>
//                           <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(manager.status)}`}>
//                             {manager.status?.toUpperCase()}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
                    
//                     <div className="text-right">
//                       <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getWorkloadColor(manager.workload, manager.status)} font-bold text-lg shadow-md`}>
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
//             <p className="text-sm">Project managers will appear here when available from the API</p>
//           </div>
//         )}
//       </div>
//     </DashboardPanel>
//   );
// };

// // Supervisors Section
// const SupervisorsSection = ({ data, theme }) => {
//   const getWorkloadColor = (workload) => {
//     if (workload >= 80) return 'from-red-500 to-red-600';
//     if (workload >= 60) return 'from-amber-500 to-amber-600';
//     return 'from-emerald-500 to-emerald-600';
//   };

//   return (
//     <DashboardPanel title="Site Supervisors" icon={HardHat}>
//       <div className="space-y-4">
//         {data.supervisors && data.supervisors.length > 0 ? (
//           data.supervisors.slice(0, 4).map((supervisor) => (
//             <div key={supervisor.id} className="p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-300 group">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-4">
//                   <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform duration-300">
//                     {supervisor.avatar || supervisor.name?.charAt(0) || 'S'}
//                   </div>
                  
//                   <div>
//                     <h4 className="font-bold text-gray-900 text-lg mb-1">{supervisor.name}</h4>
//                     <p className="text-sm text-gray-600 mb-1">Current Site: {supervisor.currentSite || 'Multiple Sites'}</p>
//                     <div className="flex items-center space-x-4 text-sm text-gray-600">
//                       <span>{supervisor.projectsCount || 0} Projects</span>
//                       <span>{supervisor.teamsManaged || 'N/A'} Teams</span>
//                       <span>Efficiency: {Math.round(supervisor.efficiency || 0)}%</span>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="text-right">
//                   <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getWorkloadColor(supervisor.workload || 0)} text-white font-bold text-lg shadow-md`}>
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
//             <p className="text-sm">Supervisors will appear here when available from the API</p>
//           </div>
//         )}
//       </div>
//     </DashboardPanel>
//   );
// };

// // Site Managers Section
// const SiteManagersSection = ({ data, theme }) => {
//   const getWorkloadColor = (workload) => {
//     if (workload >= 80) return 'from-red-500 to-red-600';
//     if (workload >= 60) return 'from-amber-500 to-amber-600';
//     return 'from-emerald-500 to-emerald-600';
//   };

//   return (
//     <DashboardPanel title="Site Managers" icon={Clipboard}>
//       <div className="space-y-4">
//         {data.siteManagers && data.siteManagers.length > 0 ? (
//           data.siteManagers.slice(0, 4).map((manager) => (
//             <div key={manager.id} className="p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-300 group">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-4">
//                   <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform duration-300">
//                     {manager.avatar || manager.name?.charAt(0) || 'SM'}
//                   </div>
                  
//                   <div>
//                     <h4 className="font-bold text-gray-900 text-lg mb-1">{manager.name}</h4>
//                     <p className="text-sm text-gray-600 mb-1">Site: {manager.currentSite || 'Multiple Sites'}</p>
//                     <div className="flex items-center space-x-4 text-sm text-gray-600">
//                       <span>{manager.projectsCount || 0} Projects</span>
//                       <span>{manager.workersManaged || 'N/A'} Workers</span>
//                       <span>Efficiency: {Math.round(manager.efficiency || 0)}%</span>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="text-right">
//                   <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getWorkloadColor(manager.workload || 0)} text-white font-bold text-lg shadow-md`}>
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
//             <p className="text-sm">Site managers will appear here when available from the API</p>
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
//       <BarChart data={data.chartData?.teamWorkload || []} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
//         <defs>
//           <linearGradient id="workloadGradient" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
//             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6}/>
//           </linearGradient>
//           <linearGradient id="projectsGradient" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
//             <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.6}/>
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
//             backgroundColor: 'white', 
//             border: '1px solid #e2e8f0', 
//             borderRadius: '12px',
//             boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
//             padding: '12px'
//           }}
//         />
//         <Bar dataKey="workload" fill="url(#workloadGradient)" radius={[6, 6, 0, 0]} name="Workload %" />
//         <Bar dataKey="projects" fill="url(#projectsGradient)" radius={[6, 6, 0, 0]} name="Projects" />
//       </BarChart>
//     </ResponsiveContainer>
//   </DashboardPanel>
// );

// const ProjectProgressChart = ({ data, theme }) => (
//   <DashboardPanel title="Project Progress Tracker" icon={TrendingUp}>
//     <ResponsiveContainer width="100%" height={400}>
//       <ComposedChart data={data.chartData?.projectProgress || []}>
//         <defs>
//           <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
//             <stop offset="95%" stopColor="#10b981" stopOpacity={0.6}/>
//           </linearGradient>
//         </defs>
//         <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//         <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
//         <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
//         <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
//         <Tooltip 
//           contentStyle={{ 
//             backgroundColor: 'white', 
//             border: '1px solid #e2e8f0', 
//             borderRadius: '12px',
//             boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
//             padding: '12px'
//           }}
//         />
//         <Bar yAxisId="left" dataKey="progress" fill="url(#progressGradient)" radius={[6, 6, 0, 0]} name="Progress %" />
//         <Line yAxisId="right" type="monotone" dataKey="budget" stroke="#f59e0b" strokeWidth={3} name="Budget (M)" />
//       </ComposedChart>
//     </ResponsiveContainer>
//   </DashboardPanel>
// );

// const TeamRadarChart = ({ data, theme }) => (
//   <DashboardPanel title="Team Performance Analysis" icon={Target}>
//     <ResponsiveContainer width="100%" height={400}>
//       <RadarChart data={data.chartData?.teamRadar || []}>
//         <PolarGrid stroke="#e5e7eb" />
//         <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#6b7280' }} />
//         <PolarRadiusAxis angle={0} domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
//         <Radar name="Managers" dataKey="Managers" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={3} />
//         <Radar name="Supervisors" dataKey="Supervisors" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={3} />
//         <Radar name="Site Managers" dataKey="SiteManagers" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={3} />
//         <Legend />
//         <Tooltip 
//           contentStyle={{ 
//             backgroundColor: 'white', 
//             border: '1px solid #e2e8f0', 
//             borderRadius: '12px',
//             boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
//           }}
//         />
//       </RadarChart>
//     </ResponsiveContainer>
//   </DashboardPanel>
// );

// const PerformanceTrendsChart = ({ data, theme }) => (
//   <DashboardPanel title="Performance Trends" icon={TrendingUp}>
//     <ResponsiveContainer width="100%" height={400}>
//       <AreaChart data={data.chartData?.performanceMetrics || []}>
//         <defs>
//           <linearGradient id="projectsAreaGradient" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
//             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
//           </linearGradient>
//           <linearGradient id="completedAreaGradient" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
//             <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
//           </linearGradient>
//           <linearGradient id="efficiencyAreaGradient" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
//             <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
//           </linearGradient>
//         </defs>
//         <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//         <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
//         <YAxis stroke="#64748b" fontSize={12} />
//         <Tooltip 
//           contentStyle={{ 
//             backgroundColor: 'white', 
//             border: '1px solid #e2e8f0', 
//             borderRadius: '12px',
//             boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
//             padding: '12px'
//           }}
//         />
//         <Area type="monotone" dataKey="projects" stackId="1" stroke="#3b82f6" fill="url(#projectsAreaGradient)" name="Projects" />
//         <Area type="monotone" dataKey="completed" stackId="1" stroke="#10b981" fill="url(#completedAreaGradient)" name="Completed" />
//         <Area type="monotone" dataKey="efficiency" stackId="2" stroke="#8b5cf6" fill="url(#efficiencyAreaGradient)" name="Efficiency" />
//       </AreaChart>
//     </ResponsiveContainer>
//   </DashboardPanel>
// );

// // Loading Screen
// const LoadingScreen = ({ theme }) => (
//   <div className={`min-h-screen ${theme.colors.background} flex items-center justify-center`}>
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
//         Loading dashboard...
//       </p>
//     </div>
//   </div>
// );

// // Main Dashboard Component
// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const theme = useTheme();
//   const { data, loading, error, lastUpdated, refreshing, refetch } = useDashboardData();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [currentView, setCurrentView] = useState("dashboard");
//   const [selectedManager, setSelectedManager] = useState(null);
//   const [currentTime, setCurrentTime] = useState(new Date());

//   const showingManagerDetails = currentView === "manager-details" && selectedManager;

//   useEffect(() => {
//     const savedCollapsed = localStorage.getItem("sidebar-collapsed");
//     if (savedCollapsed !== null) {
//       setSidebarCollapsed(JSON.parse(savedCollapsed));
//     }
//   }, []);

//   useEffect(() => {
//     setSidebarOpen(false);
//   }, [location?.pathname]);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 60000);
//     return () => clearInterval(timer);
//   }, []);

//   const handleSidebarCollapseChange = (collapsed) => {
//     setSidebarCollapsed(collapsed);
//   };

//   const handleManagerClick = (manager) => {
//     setSelectedManager(manager);
//     setCurrentView("manager-details");
//     // Use navigate to go to the ProjectManagerDetails page
//     if (navigate) {
//       navigate(`/admin/project-managers/${manager.id}`);
//     }
//   };

//   const handleBackToDashboard = () => {
//     setCurrentView("dashboard");
//     setSelectedManager(null);
//   };

//   const toggleSidebarCollapse = () => {
//     const newCollapsed = !sidebarCollapsed;
//     setSidebarCollapsed(newCollapsed);
//     localStorage.setItem("sidebar-collapsed", JSON.stringify(newCollapsed));
//   };

//   if (loading) return <LoadingScreen theme={theme} />;

//   if (error) {
//     return (
//       <div className={`min-h-screen ${theme.colors.background} flex items-center justify-center p-8`}>
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
//     <div className={`min-h-screen w-full ${theme.colors.background} transition-all duration-300`}>
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

//       <div className={`min-h-screen w-full transition-all duration-300 ease-in-out ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-80"}`}>
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
//                       title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
//                     >
//                       {sidebarCollapsed ? (
//                         <Maximize2 className="h-5 w-5" />
//                       ) : (
//                         <Minimize2 className="h-5 w-5" />
//                       )}
//                     </button>
//                     <div className="flex items-center space-x-4">
//                       <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-xl">
//                         <Palette className="h-8 lg:h-10 w-8 lg:w-10 text-white" />
//                       </div>
//                       <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-xl">
//                         <Building2 className="h-8 lg:h-10 w-8 lg:w-10 text-white" />
//                       </div>
//                     </div>
//                     <div className="hidden sm:block">
//                       <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
//                         Ujenzi & Paints
//                       </h1>
//                       <p className="text-sm lg:text-base text-gray-600 font-medium">Construction & Paint Management Dashboard</p>
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
//                         {currentTime.toLocaleDateString('en-US', { 
//                           weekday: 'long', 
//                           year: 'numeric', 
//                           month: 'long', 
//                           day: 'numeric' 
//                         })}
//                       </p>
//                       <p className="text-xs text-gray-600">
//                         {currentTime.toLocaleTimeString('en-US', { 
//                           hour: '2-digit', 
//                           minute: '2-digit',
//                           hour12: true 
//                         })}
//                       </p>
//                     </div>
                    
//                     <div className="hidden lg:block text-right">
//                       <p className={`text-xs ${theme.colors.textSecondary}`}>
//                         Last Updated
//                       </p>
//                       <p className={`text-sm font-semibold ${theme.colors.text}`}>
//                         {lastUpdated ? lastUpdated.toLocaleTimeString() : "Never"}
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
//                           {data.statistics.unreadNotifications > 9 ? '9+' : data.statistics.unreadNotifications}
//                         </span>
//                       )}
//                     </button>
                    
//                     <button
//                       onClick={theme.toggleTheme}
//                       className="p-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all shadow-lg text-xl"
//                     >
//                       {theme.isDark ? '☀️' : '🌙'}
//                     </button>
                    
//                     <div className="flex items-center space-x-3 pl-4 border-l border-gray-300">
//                       <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
//                         AD
//                       </div>
//                       <div className="hidden lg:block">
//                         <p className="text-sm font-semibold text-gray-900">Admin User</p>
//                         <p className="text-xs text-gray-600">System Administrator</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Main Content */}
//             <div className="w-full px-6 lg:px-8 py-8 lg:py-12">
//               {/* Enhanced Hero Section */}
//               <div className="mb-12 text-center">
//                 <h2 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent mb-4">
//                   Construction Management Hub 🏗️
//                 </h2>
//                 <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
//                   Monitor your construction projects, track team performance, and manage resources in real-time with powerful analytics and insights.
//                 </p>
//               </div>

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

//               {/* New Sections Row 1 - Tenders and Projects */}
//               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
//                 <TendersSection data={data} theme={theme} />
//                 <ProjectsSection data={data} theme={theme} />
//               </div>

//               {/* New Sections Row 2 - Team Management */}
//               <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
//                 <ProjectManagersSection data={data} theme={theme} onManagerClick={handleManagerClick} />
//                 <SupervisorsSection data={data} theme={theme} />
//                 <SiteManagersSection data={data} theme={theme} />
//               </div>

//               {/* Performance Analysis Section */}
//               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
//                 <TeamRadarChart data={data} theme={theme} />
//                 <PerformanceTrendsChart data={data} theme={theme} />
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
//                     <span className="font-medium">© 2024 Ujenzi & Paints Solutions</span>
//                     <span className="hidden sm:inline">•</span>
//                     <span>Projects: {data.statistics?.totalProjects || 0}</span>
//                     <span className="hidden sm:inline">•</span>
//                     <span>Team: {data.statistics?.teamSize || 0}</span>
//                     <span className="hidden sm:inline">•</span>
//                     <span>Last updated: {currentTime.toLocaleTimeString()}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

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


import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  ComposedChart,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  Clock,
  Users,
  Building2,
  TrendingUp,
  TrendingDown,
  Zap,
  RefreshCw,
  Bell,
  Plus,
  AlertTriangle,
  CheckSquare,
  Activity,
  Calendar,
  Menu,
  Palette,
  Brush,
  BarChart3,
  Maximize2,
  Minimize2,
  HardHat,
  Clipboard,
  Search,
  PieChart as PieChartIcon,
  Globe,
  MapPin,
  DollarSign,
  Target,
  ChevronLeft,
  Timer,
  Award,
  Eye,
  CalendarDays,
  ChevronRight
} from "lucide-react";

// Import your actual API services
import ProjectManagerDetails from "../../pages/admin/ProjectManagerDetails";
import AdminSidebar from "../../pages/admin/AdminSidebar";
import {
  projectManagerAPI,
  projectsAPI,
  tendersAPI,
  tasksAPI,
  eventsAPI,
  teamMembersAPI,
  calendarAPI,
  dashboardAPI,
  notificationsAPI,
  supervisorsAPI,
  siteManagersAPI,
  fetchProjectManagers,
} from "../../services/api";

// Theme Hook
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
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50",
        card: isDark ? "bg-gray-800" : "bg-white/95 backdrop-blur-sm",
        border: isDark ? "border-gray-700" : "border-gray-200/50",
        text: isDark ? "text-gray-100" : "text-gray-900",
        textSecondary: isDark ? "text-gray-400" : "text-gray-600",
        textMuted: isDark ? "text-gray-500" : "text-gray-500",
      },
    }),
    [isDark]
  );
  return { ...theme, toggleTheme };
};

// Dashboard Panel Component
const DashboardPanel = ({ children, title, icon: Icon, className = "" }) => {
  const theme = useTheme();
  return (
    <div className={`${theme.colors.card} rounded-xl border ${theme.colors.border} shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 shadow-md">
                <Icon className="h-5 w-5 text-white" />
              </div>
            )}
            <h3 className={`text-lg font-semibold ${theme.colors.text}`}>{title}</h3>
          </div>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
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
    chartData: {
      teamWorkload: [],
      projectProgress: [],
      teamRadar: [],
      performanceMetrics: [],
    },
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

      // Fetch all data from your real API services with better error handling
      const [
        dashboardResponse,
        projectsResponse,
        managersResponse,
        eventsResponse,
        tasksResponse,
        tendersResponse,
        teamMembersResponse,
        supervisorsResponse,
        siteManagersResponse,
        notificationsResponse,
        calendarEventsResponse,
      ] = await Promise.allSettled([
        dashboardAPI.getDashboard().catch((err) => {
          console.warn("Dashboard API failed:", err.message);
          return {};
        }),
        projectsAPI.getAll().catch((err) => {
          console.warn("Projects API failed:", err.message);
          return { projects: [] };
        }),
        fetchProjectManagers().catch((err) => {
          console.warn("Project Managers API failed:", err.message);
          return [];
        }),
        eventsAPI.getUpcoming(20).catch((err) => {
          console.warn("Events API failed:", err.message);
          return { events: [] };
        }),
        tasksAPI.getAll().catch((err) => {
          console.warn("Tasks API failed:", err.message);
          return { tasks: [] };
        }),
        tendersAPI.getAll().catch((err) => {
          console.warn("Tenders API failed:", err.message);
          return { tenders: [] };
        }),
        teamMembersAPI.getAll().catch((err) => {
          console.warn("Team Members API failed:", err.message);
          return { team_members: [] };
        }),
        supervisorsAPI.getAll().catch((err) => {
          console.warn("Supervisors API failed:", err.message);
          return [];
        }),
        siteManagersAPI.getAll().catch((err) => {
          console.warn("Site Managers API failed:", err.message);
          return [];
        }),
        notificationsAPI.getAll().catch((err) => {
          console.warn("Notifications API failed:", err.message);
          return [];
        }),
        calendarAPI.getTodayEvents().catch((err) => {
          console.warn("Calendar Events API failed:", err.message);
          return [];
        }),
      ]);

      // Process responses with fallbacks
      const dashboard = dashboardResponse.status === "fulfilled" ? dashboardResponse.value : {};
      const projectsData = projectsResponse.status === "fulfilled" ? projectsResponse.value : { projects: [] };
      const managersData = managersResponse.status === "fulfilled" ? managersResponse.value : [];
      const eventsData = eventsResponse.status === "fulfilled" ? eventsResponse.value : { events: [] };
      const tasksData = tasksResponse.status === "fulfilled" ? tasksResponse.value : { tasks: [] };
      const tendersData = tendersResponse.status === "fulfilled" ? tendersResponse.value : { tenders: [] };
      const teamMembersData = teamMembersResponse.status === "fulfilled" ? teamMembersResponse.value : { team_members: [] };
      const supervisorsData = supervisorsResponse.status === "fulfilled" ? supervisorsResponse.value : [];
      const siteManagersData = siteManagersResponse.status === "fulfilled" ? siteManagersResponse.value : [];
      const notificationsData = notificationsResponse.status === "fulfilled" ? notificationsResponse.value : [];
      const calendarEventsData = calendarEventsResponse.status === "fulfilled" ? calendarEventsResponse.value : [];

      // Normalize data with safe fallbacks
      const projects = Array.isArray(projectsData.projects) ? projectsData.projects : Array.isArray(projectsData) ? projectsData : [];
      const events = Array.isArray(eventsData.events) ? eventsData.events : Array.isArray(eventsData) ? eventsData : [];
      const tasks = Array.isArray(tasksData.tasks) ? tasksData.tasks : Array.isArray(tasksData) ? tasksData : [];
      const tenders = Array.isArray(tendersData.tenders) ? tendersData.tenders : Array.isArray(tendersData) ? tendersData : [];
      const supervisors = Array.isArray(supervisorsData) ? supervisorsData : [];
      const siteManagers = Array.isArray(siteManagersData) ? siteManagersData : [];
      const notifications = Array.isArray(notificationsData) ? notificationsData : [];
      const todayEvents = Array.isArray(calendarEventsData) ? calendarEventsData : [];

      // Process managers data with safe operations
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

      // Process supervisors data with safe operations
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

      // Process site managers data with safe operations
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

      // Calculate statistics with safe operations
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
        activeTenders: tenders.filter((t) => t.status === "active").length || 0,
        totalBudget: projects.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0) || 0,
        unreadNotifications: notifications.filter((n) => !n.read).length || 0,
        todayEvents: todayEvents.length || 0,
        avgProgress: projects.length > 0 ? projects.reduce((sum, p) => sum + parseFloat(p.progress_percentage || p.progress || 0), 0) / projects.length : 0,
        avgTeamEfficiency: managers.length > 0 ? managers.reduce((sum, m) => sum + (m.efficiency || 0), 0) / managers.length : 0,
      };

      // Generate chart data with safe operations
      const allTeamMembers = [
        ...managers.map(m => ({ ...m, type: 'Manager', color: '#3B82F6' })),
        ...processedSupervisors.map(s => ({ ...s, type: 'Supervisor', color: '#8B5CF6' })),
        ...processedSiteManagers.map(sm => ({ ...sm, type: 'Site Manager', color: '#06B6D4' }))
      ];

      // Sort by workload and get top 10 busiest with safe operations
      const busiestTeamMembers = allTeamMembers
        .filter(member => member.name && member.workload != null)
        .sort((a, b) => (b.workload || 0) - (a.workload || 0))
        .slice(0, 10)
        .map(member => ({
          name: (member.name || 'Unknown').split(' ')[0] || 'Unknown',
          workload: member.workload || 0,
          projects: member.projectsCount || 0,
          role: member.type || 'Team Member',
          color: member.color || '#6B7280',
          efficiency: member.efficiency || 0,
          performance: member.performance || 0
        }));

      // Project progress data with safe operations
      const projectProgressData = projects.slice(0, 8).map((project, index) => ({
        name: project.title?.replace('Project ', 'P') || project.name?.replace('Project ', 'P') || `P${project.id || index + 1}`,
        progress: parseFloat(project.progress_percentage || project.progress || 0),
        budget: parseFloat(project.budget || 0) / 1000000,
        status: project.status || 'unknown',
      }));

      // Team radar data with safe calculations
      const teamRadarData = [
        { 
          metric: 'Efficiency', 
          Managers: managers.length > 0 ? managers.reduce((sum, m) => sum + (m.efficiency || 0), 0) / managers.length : 0, 
          Supervisors: processedSupervisors.length > 0 ? processedSupervisors.reduce((sum, s) => sum + (s.efficiency || 0), 0) / processedSupervisors.length : 0, 
          SiteManagers: processedSiteManagers.length > 0 ? processedSiteManagers.reduce((sum, sm) => sum + (sm.efficiency || 0), 0) / processedSiteManagers.length : 0 
        },
        { 
          metric: 'Workload', 
          Managers: managers.length > 0 ? managers.reduce((sum, m) => sum + (m.workload || 0), 0) / managers.length : 0, 
          Supervisors: processedSupervisors.length > 0 ? processedSupervisors.reduce((sum, s) => sum + (s.workload || 0), 0) / processedSupervisors.length : 0, 
          SiteManagers: processedSiteManagers.length > 0 ? processedSiteManagers.reduce((sum, sm) => sum + (sm.workload || 0), 0) / processedSiteManagers.length : 0 
        },
        { 
          metric: 'Performance', 
          Managers: managers.length > 0 ? managers.reduce((sum, m) => sum + (m.performance || 0), 0) / managers.length : 0, 
          Supervisors: processedSupervisors.length > 0 ? processedSupervisors.reduce((sum, s) => sum + (s.performance || 0), 0) / processedSupervisors.length : 0, 
          SiteManagers: processedSiteManagers.length > 0 ? processedSiteManagers.reduce((sum, sm) => sum + (sm.performance || 0), 0) / processedSiteManagers.length : 0 
        },
        { 
          metric: 'Projects', 
          Managers: managers.length > 0 ? (managers.reduce((sum, m) => sum + (m.projectsCount || 0), 0) / managers.length) * 10 : 0, 
          Supervisors: processedSupervisors.length > 0 ? (processedSupervisors.reduce((sum, s) => sum + (s.projectsCount || 0), 0) / processedSupervisors.length) * 10 : 0, 
          SiteManagers: processedSiteManagers.length > 0 ? (processedSiteManagers.reduce((sum, sm) => sum + (sm.projectsCount || 0), 0) / processedSiteManagers.length) * 10 : 0 
        },
      ];

      // Performance metrics over time (simulated)
      const performanceMetrics = Array.from({ length: 12 }, (_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        projects: Math.floor(Math.random() * 10) + 5,
        completed: Math.floor(Math.random() * 8) + 2,
        efficiency: 75 + Math.random() * 25,
        budget: Math.floor(Math.random() * 5) + 2,
      }));

      const chartData = {
        teamWorkload: busiestTeamMembers,
        projectProgress: projectProgressData,
        teamRadar: teamRadarData,
        performanceMetrics: performanceMetrics,
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
      console.log("✅ Dashboard data loaded successfully from real APIs");
    } catch (err) {
      console.error("❌ Dashboard data fetch failed:", err);
      setError(err.message || "Failed to load dashboard data from APIs");
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

// Live Statistics Component - Enhanced styling
const LiveStatistics = ({ data, theme }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { 
      label: "Active Projects", 
      value: data.statistics?.activeProjects || 0, 
      icon: Building2, 
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
      change: "+2 this week",
      trend: "up"
    },
    { 
      label: "Team Members", 
      value: data.statistics?.teamSize || 0, 
      icon: Users, 
      color: "text-emerald-600",
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      change: "85% active now",
      trend: "neutral"
    },
    { 
      label: "Pending Tasks", 
      value: data.statistics?.pendingTasks || 0, 
      icon: Timer, 
      color: "text-amber-600",
      bgColor: "bg-gradient-to-br from-amber-50 to-amber-100",
      iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
      change: "-8 since yesterday",
      trend: "down"
    },
    { 
      label: "Project Budget", 
      value: `$${((data.statistics?.totalBudget || 0) / 1000000).toFixed(1)}M`, 
      icon: DollarSign, 
      color: "text-emerald-600",
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      change: "92% utilized",
      trend: "up"
    }
  ];

  return (
    <DashboardPanel title="Live Dashboard Overview" icon={Activity}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg"></div>
            <span className="text-sm font-medium text-gray-700">Real-time updates</span>
          </div>
          <div className="text-sm text-gray-500 font-mono">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className={`relative overflow-hidden p-5 rounded-xl ${stat.bgColor} border border-gray-200/50 hover:shadow-lg transition-all duration-300 group`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${stat.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                      {stat.value}
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                      {stat.label}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-medium ${
                    stat.trend === 'up' ? 'text-emerald-600' : 
                    stat.trend === 'down' ? 'text-red-500' : 'text-gray-600'
                  }`}>
                    {stat.change}
                  </div>
                  {stat.trend !== 'neutral' && (
                    <div className="mt-1">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200/50">
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200/50">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(data.statistics?.avgProgress || 0)}%
            </div>
            <div className="text-xs font-medium text-purple-800">Avg Progress</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200/50">
            <div className="text-2xl font-bold text-indigo-600">
              {Math.round(data.statistics?.avgTeamEfficiency || 0)}%
            </div>
            <div className="text-xs font-medium text-indigo-800">Team Efficiency</div>
          </div>
        </div>
      </div>
    </DashboardPanel>
  );
};

// Quick Actions Panel - Enhanced styling
const QuickActions = ({ theme }) => {
  const actions = [
    { 
      label: "New Project", 
      icon: Plus, 
      color: "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      shadow: "hover:shadow-blue-500/25"
    },
    { 
      label: "Add Task", 
      icon: Clipboard, 
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
      shadow: "hover:shadow-emerald-500/25"
    },
    { 
      label: "Schedule Meeting", 
      icon: Calendar, 
      color: "bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
      shadow: "hover:shadow-purple-500/25"
    },
    { 
      label: "Create Tender", 
      icon: Eye, 
      color: "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
      shadow: "hover:shadow-orange-500/25"
    }
  ];

  return (
    <DashboardPanel title="Quick Actions" icon={Zap}>
      <div className="grid grid-cols-1 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`flex items-center space-x-3 w-full p-4 rounded-xl ${action.color} ${action.shadow} text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <div className="p-1 rounded-lg bg-white/20">
              <action.icon className="h-5 w-5" />
            </div>
            <span className="font-semibold">{action.label}</span>
          </button>
        ))}
      </div>
    </DashboardPanel>
  );
};

// Recent Activity Feed - Enhanced styling
const RecentActivity = ({ data, theme }) => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const recentActivities = [];
    
    if (data.tasks && data.tasks.length > 0) {
      const completedTasks = data.tasks
        .filter(task => task.status === 'completed')
        .slice(0, 2)
        .map(task => ({
          action: "Task completed",
          project: task.project_name || task.title || "Unknown Project",
          time: "Recently",
          type: "success",
          icon: CheckSquare
        }));
      recentActivities.push(...completedTasks);
    }

    if (data.tenders && data.tenders.length > 0) {
      const activeTenders = data.tenders
        .filter(tender => tender.status === 'active')
        .slice(0, 1)
        .map(tender => ({
          action: "New tender submission",
          project: tender.title || tender.name || "Unknown Tender",
          time: "Recently",
          type: "info",
          icon: Eye
        }));
      recentActivities.push(...activeTenders);
    }

    if (data.statistics && data.statistics.overdueTasks > 0) {
      recentActivities.push({
        action: `${data.statistics.overdueTasks} tasks overdue`,
        project: "Multiple Projects",
        time: "Ongoing",
        type: "warning",
        icon: AlertTriangle
      });
    }

    if (data.events && data.events.length > 0) {
      const recentEvents = data.events
        .slice(0, 1)
        .map(event => ({
          action: "Upcoming meeting",
          project: event.project_name || event.title || "Team Meeting",
          time: "Soon",
          type: "info",
          icon: Calendar
        }));
      recentActivities.push(...recentEvents);
    }

    if (recentActivities.length === 0) {
      recentActivities.push(
        { 
          action: "System initialized", 
          project: "Dashboard", 
          time: "Just now", 
          type: "info",
          icon: Activity
        },
        { 
          action: "Waiting for data", 
          project: "API Connection", 
          time: "Ongoing", 
          type: "warning",
          icon: RefreshCw
        }
      );
    }

    setActivities(recentActivities.slice(0, 4));
  }, [data]);

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success': return 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200/50';
      case 'warning': return 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 border-amber-200/50';
      case 'info': return 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border-blue-200/50';
      default: return 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 border-gray-200/50';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'success': return 'text-emerald-600';
      case 'warning': return 'text-amber-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <DashboardPanel title="Recent Activity" icon={Activity}>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className={`p-4 rounded-xl border ${getTypeStyles(activity.type)} hover:shadow-md transition-all duration-300`}>
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg bg-white/50 ${getIconColor(activity.type)}`}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{activity.action}</p>
                <p className="text-xs opacity-80">{activity.project}</p>
                <p className="text-xs opacity-60 mt-1">{activity.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardPanel>
  );
};

// Tenders Management Section
const TendersSection = ({ data, theme }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 border-emerald-300';
      case 'evaluation': return 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 border-amber-300';
      case 'draft': return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300';
      case 'closed': return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-red-300';
      case 'medium': return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-green-300';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    const num = parseFloat(amount);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return `${num.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <DashboardPanel title="Active Tenders" icon={Eye}>
      <div className="space-y-4">
        {data.tenders && data.tenders.length > 0 ? (
          <>
            {data.tenders.slice(0, 4).map((tender) => (
              <div key={tender.id} className="p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-md group-hover:scale-110 transition-transform duration-300">
                        <Eye className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg mb-2">{tender.title || tender.name || 'Untitled Tender'}</h4>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>Budget: {formatCurrency(tender.budget_estimate || tender.value || tender.amount)}</span>
                          </span>
                          {tender.bidders_count && (
                            <span className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{tender.bidders_count} Bidders</span>
                            </span>
                          )}
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {formatDate(tender.deadline || tender.submission_deadline)}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(tender.status)}`}>
                            {tender.status?.toUpperCase() || 'UNKNOWN'}
                          </span>
                          {tender.priority && (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(tender.priority)}`}>
                              {tender.priority?.toUpperCase()} PRIORITY
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-center pt-4">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold shadow-lg hover:shadow-xl">
                View All Tenders
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No tenders available</p>
            <p className="text-sm">Tenders will appear here when available from the API</p>
          </div>
        )}
      </div>
    </DashboardPanel>
  );
};

// Projects Section
const ProjectsSection = ({ data, theme }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300';
      case 'completed': return 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 border-emerald-300';
      case 'on-hold': return 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 border-amber-300';
      case 'delayed': return 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-red-300';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'from-emerald-500 to-emerald-600';
    if (progress >= 50) return 'from-blue-500 to-blue-600';
    if (progress >= 25) return 'from-amber-500 to-amber-600';
    return 'from-red-500 to-red-600';
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return `${(amount / 1000000).toFixed(1)}M`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <DashboardPanel title="Active Projects" icon={Building2}>
      <div className="space-y-4">
        {data.projects && data.projects.length > 0 ? (
          <>
            {data.projects.slice(0, 4).map((project) => (
              <div key={project.id} className="p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-md group-hover:scale-110 transition-transform duration-300">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-1">{project.title || project.name || 'Untitled Project'}</h4>
                      <p className="text-sm text-gray-600 mb-2">Manager: {project.manager || 'Unassigned'}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{project.location || 'Unknown'}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(project.deadline || project.end_date)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatCurrency(project.budget)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                    {project.status?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Progress</span>
                    <span className="font-bold text-gray-900">{Math.round(project.progress_percentage || project.progress || 0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${getProgressColor(project.progress_percentage || project.progress || 0)} transition-all duration-500 rounded-full shadow-sm`}
                      style={{ width: `${project.progress_percentage || project.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-center pt-4">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold shadow-lg hover:shadow-xl">
                View All Projects
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No projects available</p>
            <p className="text-sm">Projects will appear here when available from the API</p>
          </div>
        )}
      </div>
    </DashboardPanel>
  );
};

// Project Managers Section with clickable navigation
const ProjectManagersSection = ({ data, theme, onManagerClick }) => {
  const getWorkloadColor = (workload, status) => {
    if (status === 'overloaded' || workload >= 90) return 'from-red-500 to-red-600 text-white';
    if (workload >= 75) return 'from-amber-500 to-amber-600 text-white';
    if (workload >= 50) return 'from-blue-500 to-blue-600 text-white';
    return 'from-emerald-500 to-emerald-600 text-white';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'overloaded': return 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-red-300';
      case 'busy': return 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 border-amber-300';
      case 'optimal': return 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 border-emerald-300';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300';
    }
  };

  const processedManagers = data.managers?.map(manager => ({
    ...manager,
    status: manager.workload >= 90 ? 'overloaded' : manager.workload >= 75 ? 'busy' : 'optimal'
  })) || [];

  const handleManagerClick = (manager) => {
    onManagerClick(manager);
  };

  return (
    <DashboardPanel title="Project Managers Workload" icon={Users}>
      <div className="space-y-4">
        {processedManagers.length > 0 ? (
          <>
            <div className="text-sm text-gray-600 mb-4">
              Click on a manager to view detailed information
            </div>
            
            {processedManagers
              .sort((a, b) => b.workload - a.workload)
              .slice(0, 5)
              .map((manager, index) => (
                <div 
                  key={manager.id} 
                  onClick={() => handleManagerClick(manager)}
                  className="p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                          {manager.avatar || manager.name?.charAt(0) || 'M'}
                        </div>
                        {index === 0 && manager.status === 'overloaded' && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <AlertTriangle className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="font-bold text-gray-900 text-lg">{manager.name}</h4>
                          {manager.status === 'overloaded' && (
                            <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full">
                              NEEDS HELP
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{manager.role || 'Project Manager'}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{manager.projectsCount || 0} Projects</span>
                          <span>Efficiency: {Math.round(manager.efficiency || 0)}%</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(manager.status)}`}>
                            {manager.status?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getWorkloadColor(manager.workload, manager.status)} font-bold text-lg shadow-md`}>
                        {manager.workload || 0}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Workload</div>
                    </div>
                  </div>
                </div>
              ))}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No project managers available</p>
            <p className="text-sm">Project managers will appear here when available from the API</p>
          </div>
        )}
      </div>
    </DashboardPanel>
  );
};

// Supervisors Section
const SupervisorsSection = ({ data, theme }) => {
  const getWorkloadColor = (workload) => {
    if (workload >= 80) return 'from-red-500 to-red-600';
    if (workload >= 60) return 'from-amber-500 to-amber-600';
    return 'from-emerald-500 to-emerald-600';
  };

  return (
    <DashboardPanel title="Site Supervisors" icon={HardHat}>
      <div className="space-y-4">
        {data.supervisors && data.supervisors.length > 0 ? (
          data.supervisors.slice(0, 4).map((supervisor) => (
            <div key={supervisor.id} className="p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                    {supervisor.avatar || supervisor.name?.charAt(0) || 'S'}
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">{supervisor.name}</h4>
                    <p className="text-sm text-gray-600 mb-1">Current Site: {supervisor.currentSite || 'Multiple Sites'}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{supervisor.projectsCount || 0} Projects</span>
                      <span>{supervisor.teamsManaged || 'N/A'} Teams</span>
                      <span>Efficiency: {Math.round(supervisor.efficiency || 0)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getWorkloadColor(supervisor.workload || 0)} text-white font-bold text-lg shadow-md`}>
                    {supervisor.workload || 0}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Workload</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <HardHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No supervisors available</p>
            <p className="text-sm">Supervisors will appear here when available from the API</p>
          </div>
        )}
      </div>
    </DashboardPanel>
  );
};

// Site Managers Section
const SiteManagersSection = ({ data, theme }) => {
  const getWorkloadColor = (workload) => {
    if (workload >= 80) return 'from-red-500 to-red-600';
    if (workload >= 60) return 'from-amber-500 to-amber-600';
    return 'from-emerald-500 to-emerald-600';
  };

  return (
    <DashboardPanel title="Site Managers" icon={Clipboard}>
      <div className="space-y-4">
        {data.siteManagers && data.siteManagers.length > 0 ? (
          data.siteManagers.slice(0, 4).map((manager) => (
            <div key={manager.id} className="p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                    {manager.avatar || manager.name?.charAt(0) || 'SM'}
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">{manager.name}</h4>
                    <p className="text-sm text-gray-600 mb-1">Site: {manager.currentSite || 'Multiple Sites'}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{manager.projectsCount || 0} Projects</span>
                      <span>{manager.workersManaged || 'N/A'} Workers</span>
                      <span>Efficiency: {Math.round(manager.efficiency || 0)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getWorkloadColor(manager.workload || 0)} text-white font-bold text-lg shadow-md`}>
                    {manager.workload || 0}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Workload</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clipboard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No site managers available</p>
            <p className="text-sm">Site managers will appear here when available from the API</p>
          </div>
        )}
      </div>
    </DashboardPanel>
  );
};

// Chart Components with enhanced styling
const TeamWorkloadChart = ({ data, theme }) => (
  <DashboardPanel title="Team Workload Distribution" icon={BarChart3}>
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data.chartData?.teamWorkload || []} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <defs>
          <linearGradient id="workloadGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6}/>
          </linearGradient>
          <linearGradient id="projectsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.6}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="name" 
          stroke="#64748b" 
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0', 
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            padding: '12px'
          }}
        />
        <Bar dataKey="workload" fill="url(#workloadGradient)" radius={[6, 6, 0, 0]} name="Workload %" />
        <Bar dataKey="projects" fill="url(#projectsGradient)" radius={[6, 6, 0, 0]} name="Projects" />
      </BarChart>
    </ResponsiveContainer>
  </DashboardPanel>
);

const ProjectProgressChart = ({ data, theme }) => (
  <DashboardPanel title="Project Progress Tracker" icon={TrendingUp}>
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data.chartData?.projectProgress || []}>
        <defs>
          <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.6}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
        <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
        <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0', 
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            padding: '12px'
          }}
        />
        <Bar yAxisId="left" dataKey="progress" fill="url(#progressGradient)" radius={[6, 6, 0, 0]} name="Progress %" />
        <Line yAxisId="right" type="monotone" dataKey="budget" stroke="#f59e0b" strokeWidth={3} name="Budget (M)" />
      </ComposedChart>
    </ResponsiveContainer>
  </DashboardPanel>
);

const TeamRadarChart = ({ data, theme }) => (
  <DashboardPanel title="Team Performance Analysis" icon={Target}>
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={data.chartData?.teamRadar || []}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#6b7280' }} />
        <PolarRadiusAxis angle={0} domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
        <Radar name="Managers" dataKey="Managers" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={3} />
        <Radar name="Supervisors" dataKey="Supervisors" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={3} />
        <Radar name="Site Managers" dataKey="SiteManagers" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={3} />
        <Legend />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0', 
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  </DashboardPanel>
);

// Interactive Calendar Component with Event Management
const InteractiveCalendar = ({ data, theme }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'meeting',
    projectManager: '',
    project: '',
    location: ''
  });

  useEffect(() => {
    fetchCalendarEvents();
  }, [currentDate]);

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      // Combine events from different sources
      const allEvents = [];
      
      // Add project milestones
      if (data.projects) {
        data.projects.forEach(project => {
          if (project.deadline || project.end_date) {
            allEvents.push({
              id: `project-${project.id}`,
              title: `Project Deadline: ${project.title || project.name}`,
              date: project.deadline || project.end_date,
              type: 'deadline',
              project: project.title || project.name,
              manager: project.manager || 'Unassigned'
            });
          }
        });
      }

      // Add tender deadlines
      if (data.tenders) {
        data.tenders.forEach(tender => {
          if (tender.deadline || tender.submission_deadline) {
            allEvents.push({
              id: `tender-${tender.id}`,
              title: `Tender Deadline: ${tender.title || tender.name}`,
              date: tender.deadline || tender.submission_deadline,
              type: 'tender',
              project: tender.title || tender.name
            });
          }
        });
      }

      // Add task deadlines
      if (data.tasks) {
        data.tasks.forEach(task => {
          if (task.due_date) {
            allEvents.push({
              id: `task-${task.id}`,
              title: `Task Due: ${task.title}`,
              date: task.due_date,
              type: 'task',
              project: task.project_name || 'Unknown Project'
            });
          }
        });
      }

      // Add existing events
      if (data.events) {
        data.events.forEach(event => {
          allEvents.push({
            id: `event-${event.id}`,
            title: event.title || event.description,
            date: event.start_date || event.date,
            type: event.type || 'meeting',
            project: event.project_name,
            manager: event.manager
          });
        });
      }

      setCalendarEvents(allEvents);
    } catch (error) {
      console.warn("Failed to fetch calendar events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dayEvents = calendarEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === current.toDateString();
      });

      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === new Date().toDateString(),
        isSelected: current.toDateString() === selectedDate.toDateString(),
        events: dayEvents,
        hasEvents: dayEvents.length > 0,
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setNewEvent(prev => ({
      ...prev,
      date: date.toISOString().split('T')[0]
    }));
  };

  const getEventTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'meeting': return 'bg-blue-500';
      case 'deadline': return 'bg-red-500';
      case 'task': return 'bg-yellow-500';
      case 'tender': return 'bg-purple-500';
      case 'milestone': return 'bg-green-500';
      case 'inspection': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeBadgeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'meeting': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'deadline': return 'bg-red-100 text-red-700 border-red-300';
      case 'task': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'tender': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'milestone': return 'bg-green-100 text-green-700 border-green-300';
      case 'inspection': return 'bg-orange-100 text-orange-700 border-orange-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      // Here you would call your API to create the event
      // For now, we'll add it locally
      const eventToAdd = {
        id: `custom-${Date.now()}`,
        title: newEvent.title,
        description: newEvent.description,
        date: `${newEvent.date}T${newEvent.time}`,
        type: newEvent.type,
        manager: newEvent.projectManager,
        project: newEvent.project,
        location: newEvent.location
      };

      setCalendarEvents(prev => [...prev, eventToAdd]);
      setShowCreateEvent(false);
      setNewEvent({
        title: '',
        description: '',
        date: selectedDate.toISOString().split('T')[0],
        time: '',
        type: 'meeting',
        projectManager: '',
        project: '',
        location: ''
      });
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  const getSelectedDateEvents = () => {
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === selectedDate.toDateString();
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <DashboardPanel title="System Calendar" icon={CalendarDays}>
      <div className="space-y-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h4>
            <p className="text-sm text-gray-500">
              {calendarEvents.length} activities this month
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-1">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getCalendarDays().map((day, index) => (
              <button
                key={index}
                onClick={() => handleDateClick(day.date)}
                className={`
                  relative p-2 min-h-[50px] text-sm rounded-lg transition-all hover:bg-gray-100 flex flex-col items-center justify-start
                  ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  ${day.isToday ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                  ${day.isSelected && !day.isToday ? 'bg-blue-100 text-blue-700' : ''}
                  ${day.hasEvents ? 'font-semibold' : ''}
                `}
              >
                <span className="mb-1">{day.date.getDate()}</span>
                {day.hasEvents && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {day.events.slice(0, 2).map((event, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full ${getEventTypeColor(event.type)}`}
                        title={event.title}
                      ></div>
                    ))}
                    {day.events.length > 2 && (
                      <div className="text-xs text-gray-600">+{day.events.length - 2}</div>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Date Events */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-semibold text-gray-900">
              Events for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h5>
            <button 
              onClick={() => setShowCreateEvent(true)}
              className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all text-sm font-medium shadow-md flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Event</span>
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading events...</p>
              </div>
            ) : getSelectedDateEvents().length > 0 ? (
              getSelectedDateEvents().map((event, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200/50">
                  <div className={`w-3 h-3 rounded-full mt-1 ${getEventTypeColor(event.type)}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      {event.project && (
                        <span className="flex items-center space-x-1">
                          <Building2 className="h-3 w-3" />
                          <span>{event.project}</span>
                        </span>
                      )}
                      {event.manager && (
                        <span className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{event.manager}</span>
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium border ${getEventTypeBadgeColor(event.type)}`}>
                    {event.type?.toUpperCase()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No events scheduled for this day</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Summary */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {calendarEvents.filter(e => e.type === 'meeting').length}
              </div>
              <div className="text-xs text-blue-800">Meetings</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-600">
                {calendarEvents.filter(e => e.type === 'deadline').length}
              </div>
              <div className="text-xs text-red-800">Deadlines</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-600">
                {calendarEvents.filter(e => e.type === 'task').length}
              </div>
              <div className="text-xs text-yellow-800">Tasks</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {calendarEvents.filter(e => e.type === 'milestone').length}
              </div>
              <div className="text-xs text-green-800">Milestones</div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Event</h3>
              <button
                onClick={() => setShowCreateEvent(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Event description (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="meeting">Meeting</option>
                  <option value="milestone">Milestone</option>
                  <option value="inspection">Inspection</option>
                  <option value="deadline">Deadline</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Project Manager</label>
                <select
                  value={newEvent.projectManager}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, projectManager: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Manager (Optional)</option>
                  {data.managers?.map(manager => (
                    <option key={manager.id} value={manager.name}>
                      {manager.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Related Project</label>
                <select
                  value={newEvent.project}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, project: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Project (Optional)</option>
                  {data.projects?.map(project => (
                    <option key={project.id} value={project.title || project.name}>
                      {project.title || project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Event location (optional)"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateEvent(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardPanel>
  );
};

// Loading Screen
const LoadingScreen = ({ theme }) => (
  <div className={`min-h-screen ${theme.colors.background} flex items-center justify-center`}>
    <div className="text-center">
      <div className="relative">
        <div className="w-32 h-32 border-8 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-8 shadow-lg"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center space-x-2">
            <Palette className="h-8 w-8 text-blue-500 animate-pulse" />
            <Brush className="h-8 w-8 text-orange-500 animate-pulse" />
          </div>
        </div>
      </div>
      <h3 className={`text-4xl font-bold ${theme.colors.text} mb-3`}>
        Ujenzi & Paints
      </h3>
      <p className={`text-xl ${theme.colors.textSecondary} mb-2`}>
        Construction & Paint Management
      </p>
      <p className={`text-base ${theme.colors.textMuted}`}>
        Loading dashboard...
      </p>
    </div>
  </div>
);

// Main Dashboard Component
const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { data, loading, error, lastUpdated, refreshing, refetch } = useDashboardData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedManager, setSelectedManager] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const showingManagerDetails = currentView === "manager-details" && selectedManager;

  useEffect(() => {
    const savedCollapsed = localStorage.getItem("sidebar-collapsed");
    if (savedCollapsed !== null) {
      setSidebarCollapsed(JSON.parse(savedCollapsed));
    }
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location?.pathname]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSidebarCollapseChange = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const handleManagerClick = (manager) => {
    setSelectedManager(manager);
    setCurrentView("manager-details");
    // Use navigate to go to the ProjectManagerDetails page
    if (navigate) {
      navigate(`/src/pages/admin/ProjectManagerDetails.jsx${manager.id}`);
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedManager(null);
  };

  const toggleSidebarCollapse = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newCollapsed));
  };

  if (loading) return <LoadingScreen theme={theme} />;

  if (error) {
    return (
      <div className={`min-h-screen ${theme.colors.background} flex items-center justify-center p-8`}>
        <DashboardPanel className="max-w-lg w-full text-center">
          <AlertTriangle className="h-20 w-20 text-red-500 mx-auto mb-6" />
          <h3 className={`text-3xl font-bold ${theme.colors.text} mb-4`}>
            API Connection Error
          </h3>
          <p className={`text-lg ${theme.colors.textSecondary} mb-8`}>
            {error}
          </p>
          <button
            onClick={refetch}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-8 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            Retry Connection
          </button>
        </DashboardPanel>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full ${theme.colors.background} transition-all duration-300`}>
      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onCollapseChange={handleSidebarCollapseChange}
        theme={{
          isDark: theme.isDark,
          colors: {
            sidebarBg: "bg-white",
            text: "text-gray-700",
            textMuted: "text-gray-500",
            textSecondary: "text-gray-600",
            border: "border-gray-200",
          },
        }}
      />

      <div className={`min-h-screen w-full transition-all duration-300 ease-in-out ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-80"}`}>
        {showingManagerDetails ? (
          <div className="p-6">
            <div className="mb-8">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="font-semibold">Back to Dashboard</span>
              </button>
            </div>
            {selectedManager && (
              <ProjectManagerDetails managerId={selectedManager.id} />
            )}
          </div>
        ) : (
          <div className="w-full">
            {/* Enhanced Header */}
            <div className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg">
              <div className="w-full px-6 lg:px-8 py-5">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-6 flex-shrink-0">
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="lg:hidden p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
                    >
                      <Menu className="h-6 w-6" />
                    </button>
                    <button
                      onClick={toggleSidebarCollapse}
                      className="hidden lg:flex p-3 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
                      title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                      {sidebarCollapsed ? (
                        <Maximize2 className="h-5 w-5" />
                      ) : (
                        <Minimize2 className="h-5 w-5" />
                      )}
                    </button>
                    <div className="flex items-center space-x-4">
                    
                      <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-xl">
                        <Building2 className="h-8 lg:h-10 w-8 lg:w-10 text-white" />
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
                        Ujenzi & Paints
                      </h1>
                      <p className="text-sm lg:text-base text-gray-600 font-medium">Construction & Paint Management Dashboard</p>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center space-x-6 flex-1 max-w-3xl mx-8">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search projects, tasks, or team members..."
                        className="w-full pl-12 pr-6 py-4 border border-gray-200 rounded-xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 flex-shrink-0">
                    <div className="hidden xl:block text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {currentTime.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-xs text-gray-600">
                        {currentTime.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </p>
                    </div>
                    
                    <div className="hidden lg:block text-right">
                      <p className={`text-xs ${theme.colors.textSecondary}`}>
                        Last Updated
                      </p>
                      <p className={`text-sm font-semibold ${theme.colors.text}`}>
                        {lastUpdated ? lastUpdated.toLocaleTimeString() : "Never"}
                      </p>
                    </div>
                    
                    <button
                      onClick={refetch}
                      disabled={refreshing}
                      className={`p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl ${
                        refreshing ? "animate-spin" : ""
                      }`}
                    >
                      <RefreshCw className="h-5 w-5" />
                    </button>
                    
                    <button className="relative p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg">
                      <Bell className="h-5 w-5" />
                      {data.statistics?.unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                          {data.statistics.unreadNotifications > 9 ? '9+' : data.statistics.unreadNotifications}
                        </span>
                      )}
                    </button>
                    
                    <button
                      onClick={theme.toggleTheme}
                      className="p-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all shadow-lg text-xl"
                    >
                      {theme.isDark ? '☀️' : '🌙'}
                    </button>
                    
                    <div className="flex items-center space-x-3 pl-4 border-l border-gray-300">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        AD
                      </div>
                      <div className="hidden lg:block">
                        <p className="text-sm font-semibold text-gray-900">Admin User</p>
                        <p className="text-xs text-gray-600">System Administrator</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="w-full px-6 lg:px-8 py-8 lg:py-12">
              {/* Enhanced Hero Section */}
              <div className="mb-12 text-center">
                {/* <h2 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent mb-4">
                  Construction Management Hub 🏗️
                </h2>
                <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Monitor your construction projects, track team performance, and manage resources in real-time with powerful analytics and insights.
                </p> */}
              </div>

              {/* Top Row - Overview and Actions */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-12">
                <div className="xl:col-span-2">
                  <LiveStatistics data={data} theme={theme} />
                </div>
                <QuickActions theme={theme} />
                <RecentActivity data={data} theme={theme} />
              </div>

              {/* Main Charts Section */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
                <TeamWorkloadChart data={data} theme={theme} />
                <ProjectProgressChart data={data} theme={theme} />
              </div>

              {/* New Sections Row 1 - Tenders and Projects */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
                <TendersSection data={data} theme={theme} />
                <ProjectsSection data={data} theme={theme} />
              </div>

              {/* New Sections Row 2 - Team Management */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
                <ProjectManagersSection data={data} theme={theme} onManagerClick={handleManagerClick} />
                <SupervisorsSection data={data} theme={theme} />
                <SiteManagersSection data={data} theme={theme} />
              </div>

              {/* Performance Analysis Section */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
                <TeamRadarChart data={data} theme={theme} />
                <InteractiveCalendar data={data} theme={theme} />
              </div>

              {/* Enhanced Footer */}
              <div className="text-center py-12 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/50 rounded-2xl">
                <div className="flex items-center justify-center space-x-6 mb-6">
                  <div className="flex items-center space-x-3">
                    <Palette className="h-8 w-8 text-blue-500" />
                    <Building2 className="h-8 w-8 text-orange-500" />
                    <Brush className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
                    Ujenzi & Paints Enterprise
                  </h4>
                  <p className="text-base text-gray-600 font-medium">
                    Leading Construction & Paint Management Platform in Kenya
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500 mt-6">
                    <span className="font-medium">© 2025 Ujenzi & Paints Solutions</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Projects: {data.statistics?.totalProjects || 0}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Team: {data.statistics?.teamSize || 0}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Last updated: {currentTime.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

   {/* FIXED: Mobile overlay */}
   {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminDashboard;