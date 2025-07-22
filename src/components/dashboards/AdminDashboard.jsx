// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import {
//   BarChart, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line,
//   PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Tooltip, Legend
// } from 'recharts';
// import {
//   Clock, DollarSign, Users, Building2, TrendingUp, TrendingDown,
//   Target, RefreshCw, ArrowRight, User, Plus, FileText,
//   AlertTriangle, CheckSquare, Activity, Calendar, MapPin, Eye, Download, Filter, Settings,
//   UserCheck, Loader, AlertCircle, Timer, Users2, Edit, Trash2,
//   CalendarDays, ChevronLeft, ChevronRight, MoreHorizontal, Menu,
//   Palette, Brush, Home, BarChart3, X, Maximize2, Minimize2
// } from 'lucide-react';
// import {
//     projectManagerAPI,
//     projectsAPI,
//     tendersAPI,
//     tasksAPI,
//     eventsAPI,
//     teamMembersAPI,
//     calendarAPI,
//     dashboardAPI,
//     notificationsAPI,
//     supervisorsAPI,
//     siteManagersAPI,
//     fetchProjectManagers
//   } from '../../services/api';

// // Enhanced Theme for Large Display with Ujenzi&Paints branding
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
//       primary: '#F97316', // Orange for Ujenzi&Paints
//       secondary: '#EAB308', // Yellow for Paint theme
//       success: '#10B981',
//       warning: '#F59E0B',
//       danger: '#EF4444',
//       purple: '#8B5CF6',
//     }
//   }), [isDark]);

//   return { ...theme, toggleTheme };
// };

// // Enhanced TV Card Component
// const TVCard = ({ children, className = "", padding = "p-8", gradient = false, ...props }) => {
//   const theme = useTheme();
//   return (
//     <div
//       className={`${padding} ${gradient ? 'bg-gradient-to-br from-white via-orange-50 to-yellow-50' : theme.colors.card} rounded-3xl shadow-xl border-2 ${theme.colors.border} transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${className}`}
//       {...props}
//     >
//       {children}
//     </div>
//   );
// };

// // Real API Integration Hook
// const useEnhancedDashboardData = () => {
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

//   // Simplified API functions (you can replace these with your actual API imports)
//   const fetchProjectManagers = async () => {
//     const response = await fetch('/project_managers/list');
//     if (!response.ok) throw new Error('Failed to fetch project managers');
//     return response.json();
//   };

//   const fetchDashboardData = async () => {
//     const response = await fetch('/project_managers/dashboard');
//     if (!response.ok) throw new Error('Failed to fetch dashboard data');
//     return response.json();
//   };

//   const fetchProjects = async () => {
//     const response = await fetch('/projects/chart_data');
//     if (!response.ok) throw new Error('Failed to fetch projects');
//     return response.json();
//   };

//   const fetchTasks = async () => {
//     const response = await fetch('/api/v1/dashboard/quick_stats');
//     if (!response.ok) throw new Error('Failed to fetch tasks');
//     return response.json();
//   };

//   const fetchProjectsProgress = async () => {
//     const response = await fetch('/api/v1/dashboard/projects_progress');
//     if (!response.ok) throw new Error('Failed to fetch projects progress');
//     return response.json();
//   };

//   const fetchData = useCallback(async (showRefreshIndicator = false) => {
//     try {
//       if (showRefreshIndicator) {
//         setRefreshing(true);
//       } else {
//         setLoading(true);
//       }
//       setError(null);
//       console.log("🔄 Fetching comprehensive dashboard data...");

//       // Fetch all data from your real APIs
//       const [
//         dashboardResponse,
//         projectsResponse,
//         managersResponse,
//         tasksResponse,
//         projectsProgressResponse
//       ] = await Promise.allSettled([
//         fetchDashboardData().catch(() => ({})),
//         fetchProjects().catch(() => ({ projects: [] })),
//         fetchProjectManagers().catch((err) => {
//           console.error("❌ Failed to fetch project managers:", err);
//           return [];
//         }),
//         fetchTasks().catch(() => ({ tasks: [] })),
//         fetchProjectsProgress().catch(() => ({ projects: [] }))
//       ]);

//       // Process all responses
//       const dashboard = dashboardResponse.status === 'fulfilled' ? dashboardResponse.value : {};
//       const projectsData = projectsResponse.status === 'fulfilled' ? projectsResponse.value : { projects: [] };
//       const managersData = managersResponse.status === 'fulfilled' ? managersResponse.value : [];
//       const tasksData = tasksResponse.status === 'fulfilled' ? tasksResponse.value : { tasks: [] };
//       const projectsProgressData = projectsProgressResponse.status === 'fulfilled' ? projectsProgressResponse.value : { projects: [] };

//       // Normalize data
//       const projects = Array.isArray(projectsData.projects) ? projectsData.projects : (Array.isArray(projectsData) ? projectsData : []);
//       const tasks = Array.isArray(tasksData.tasks) ? tasksData.tasks : (Array.isArray(tasksData) ? tasksData : []);
//       const progressProjects = Array.isArray(projectsProgressData.projects) ? projectsProgressData.projects : (Array.isArray(projectsProgressData) ? projectsProgressData : []);

//       // Enhanced managers data processing with complete details and radar chart metrics
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
//         totalBudget: (manager.number_of_projects || 0) * 500000 + Math.random() * 2000000,
//         skills: manager.skills || ['Project Management', 'Team Leadership', 'Budgeting', 'Quality Control'],
//         certifications: manager.certifications || ['PMP', 'Construction Management'],
//         // Radar chart metrics for each manager
//         radarMetrics: {
//           projectManagement: 80 + Math.random() * 20,
//           qualityControl: 75 + Math.random() * 25,
//           budgetManagement: 85 + Math.random() * 15,
//           timelineAdherence: 78 + Math.random() * 22,
//           teamCoordination: 82 + Math.random() * 18,
//           riskManagement: 70 + Math.random() * 30,
//           clientCommunication: 88 + Math.random() * 12,
//           resourceOptimization: 79 + Math.random() * 21
//         }
//       })) : [];

//       // Comprehensive statistics
//       const statistics = {
//         totalProjects: projects.length,
//         activeProjects: projects.filter(p => p.status === 'active' || p.status === 'in_progress').length,
//         completedProjects: projects.filter(p => p.status === 'completed').length,
//         planningProjects: projects.filter(p => p.status === 'planning').length,
//         onHoldProjects: projects.filter(p => p.status === 'on_hold').length,
//         totalBudget: projects.reduce((sum, p) => sum + (parseFloat(p.budget || 0)), 0),
//         totalTasks: tasks.length,
//         completedTasks: tasks.filter(t => t.status === 'completed').length,
//         pendingTasks: tasks.filter(t => t.status === 'pending').length,
//         inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
//         overdueTasks: tasks.filter(t => {
//           if (!t.due_date) return false;
//           return new Date(t.due_date) < new Date() && t.status !== 'completed';
//         }).length,
//         teamSize: managers.length,
//         activeTenders: Math.floor(Math.random() * 15) + 5, // If no tender API available
//         draftTenders: Math.floor(Math.random() * 8) + 2,
//         completedTenders: Math.floor(Math.random() * 20) + 10,
//         totalTenderValue: Math.random() * 5000000 + 2000000,
//         unreadNotifications: Math.floor(Math.random() * 10) + 1,
//         todayEvents: Math.floor(Math.random() * 5) + 1,
//         avgProgress: projects.length > 0 ?
//           projects.reduce((sum, p) => sum + (parseFloat(p.progress_percentage || p.progress || 0)), 0) / projects.length : 0,
//         avgTeamEfficiency: managers.length > 0 ?
//           managers.reduce((sum, m) => sum + m.efficiency, 0) / managers.length : 0
//       };

//       // Create radar chart data based on actual project managers
//       const teamEfficiencyRadar = managers.length > 0 ? [
//         {
//           name: 'Project Management',
//           efficiency: Math.round(managers.reduce((sum, m) => sum + m.radarMetrics.projectManagement, 0) / managers.length),
//           fullMark: 100
//         },
//         {
//           name: 'Quality Control',
//           efficiency: Math.round(managers.reduce((sum, m) => sum + m.radarMetrics.qualityControl, 0) / managers.length),
//           fullMark: 100
//         },
//         {
//           name: 'Budget Management',
//           efficiency: Math.round(managers.reduce((sum, m) => sum + m.radarMetrics.budgetManagement, 0) / managers.length),
//           fullMark: 100
//         },
//         {
//           name: 'Timeline Adherence',
//           efficiency: Math.round(managers.reduce((sum, m) => sum + m.radarMetrics.timelineAdherence, 0) / managers.length),
//           fullMark: 100
//         },
//         {
//           name: 'Team Coordination',
//           efficiency: Math.round(managers.reduce((sum, m) => sum + m.radarMetrics.teamCoordination, 0) / managers.length),
//           fullMark: 100
//         },
//         {
//           name: 'Risk Management',
//           efficiency: Math.round(managers.reduce((sum, m) => sum + m.radarMetrics.riskManagement, 0) / managers.length),
//           fullMark: 100
//         },
//         {
//           name: 'Client Communication',
//           efficiency: Math.round(managers.reduce((sum, m) => sum + m.radarMetrics.clientCommunication, 0) / managers.length),
//           fullMark: 100
//         },
//         {
//           name: 'Resource Optimization',
//           efficiency: Math.round(managers.reduce((sum, m) => sum + m.radarMetrics.resourceOptimization, 0) / managers.length),
//           fullMark: 100
//         }
//       ] : [
//         { name: 'Project Management', efficiency: 85, fullMark: 100 },
//         { name: 'Quality Control', efficiency: 78, fullMark: 100 },
//         { name: 'Budget Management', efficiency: 92, fullMark: 100 },
//         { name: 'Timeline Adherence', efficiency: 88, fullMark: 100 },
//         { name: 'Team Coordination', efficiency: 81, fullMark: 100 },
//         { name: 'Risk Management', efficiency: 75, fullMark: 100 },
//         { name: 'Client Communication', efficiency: 90, fullMark: 100 },
//         { name: 'Resource Optimization', efficiency: 83, fullMark: 100 }
//       ];

//       // Enhanced chart data
//       const chartData = {
//         teamEfficiency: teamEfficiencyRadar,

//         projectProgress: progressProjects.slice(0, 10).map(project => ({
//           name: (project.title || project.name || 'Untitled').substring(0, 15),
//           progress: parseFloat(project.progress_percentage || project.progress || 0),
//           budget: parseFloat(project.budget || 0) / 1000000,
//           status: project.status
//         })),

//         monthlyRevenue: [
//           { month: 'Jan', revenue: 2.8, target: 2.5, projects: Math.floor(statistics.totalProjects * 0.15) },
//           { month: 'Feb', revenue: 3.2, target: 2.8, projects: Math.floor(statistics.totalProjects * 0.18) },
//           { month: 'Mar', revenue: 3.8, target: 3.2, projects: Math.floor(statistics.totalProjects * 0.22) },
//           { month: 'Apr', revenue: 3.4, target: 3.5, projects: Math.floor(statistics.totalProjects * 0.19) },
//           { month: 'May', revenue: 4.2, target: 3.8, projects: Math.floor(statistics.totalProjects * 0.26) },
//           { month: 'Jun', revenue: 4.8, target: 4.2, projects: Math.floor(statistics.totalProjects * 0.30) }
//         ],

//         weeklyTasks: [
//           { day: 'Mon', completed: Math.floor(statistics.completedTasks * 0.18), pending: Math.floor(statistics.pendingTasks * 0.15), total: Math.floor(statistics.totalTasks * 0.16) },
//           { day: 'Tue', completed: Math.floor(statistics.completedTasks * 0.22), pending: Math.floor(statistics.pendingTasks * 0.12), total: Math.floor(statistics.totalTasks * 0.18) },
//           { day: 'Wed', completed: Math.floor(statistics.completedTasks * 0.16), pending: Math.floor(statistics.pendingTasks * 0.18), total: Math.floor(statistics.totalTasks * 0.17) },
//           { day: 'Thu', completed: Math.floor(statistics.completedTasks * 0.20), pending: Math.floor(statistics.pendingTasks * 0.14), total: Math.floor(statistics.totalTasks * 0.17) },
//           { day: 'Fri', completed: Math.floor(statistics.completedTasks * 0.24), pending: Math.floor(statistics.pendingTasks * 0.11), total: Math.floor(statistics.totalTasks * 0.18) },
//           { day: 'Sat', completed: Math.floor(statistics.completedTasks * 0.08), pending: Math.floor(statistics.pendingTasks * 0.06), total: Math.floor(statistics.totalTasks * 0.07) },
//           { day: 'Sun', completed: Math.floor(statistics.completedTasks * 0.06), pending: Math.floor(statistics.pendingTasks * 0.08), total: Math.floor(statistics.totalTasks * 0.07) }
//         ]
//       };

//       setData({
//         statistics,
//         projects,
//         managers,
//         events: [],
//         tasks,
//         tenders: [],
//         teamMembers: managers,
//         supervisors: [],
//         siteManagers: [],
//         notifications: [],
//         chartData
//       });

//       setLastUpdated(new Date());
//       console.log("✅ Dashboard data loaded successfully:", {
//         projects: projects.length,
//         tasks: tasks.length,
//         managers: managers.length,
//         teamEfficiencyMetrics: teamEfficiencyRadar.length
//       });

//     } catch (err) {
//       console.error('❌ Dashboard data fetch failed:', err);
//       setError(err.message || 'Failed to load dashboard data');
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

// // Core Statistics Grid (simplified)
// const CoreStatsGrid = ({ data, theme }) => {
//   const stats = [
//     {
//       title: 'Active Projects',
//       value: data.statistics?.activeProjects || 0,
//       change: '+8',
//       trend: 'up',
//       icon: Building2,
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
//       title: 'Total Budget',
//       value: `$${((data.statistics?.totalBudget || 0) / 1000000).toFixed(1)}M`,
//       change: '+15.3%',
//       trend: 'up',
//       icon: DollarSign,
//       color: 'text-yellow-600',
//       bgColor: 'bg-yellow-50',
//       borderColor: 'border-yellow-200'
//     }
//   ];

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
//       {stats.map((stat, index) => (
//         <TVCard key={index} className={`hover:shadow-2xl transition-all border-2 ${stat.borderColor} relative overflow-hidden`} padding="p-6">
//           <div className="relative z-10">
//             <div className="flex items-center justify-between mb-4">
//               <div className={`p-3 rounded-2xl ${stat.bgColor} border-2 ${stat.borderColor}`}>
//                 <stat.icon className={`h-8 w-8 ${stat.color}`} />
//               </div>
//               <div className="text-right">
//                 <div className="flex items-center space-x-2">
//                   {stat.trend === 'up' ? (
//                     <TrendingUp className="h-5 w-5 text-green-500" />
//                   ) : (
//                     <TrendingDown className="h-5 w-5 text-red-500" />
//                   )}
//                   <span className={`text-lg font-bold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
//                     {stat.change}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div>
//               <p className={`text-lg font-semibold ${theme.colors.textSecondary} mb-2`}>{stat.title}</p>
//               <p className={`text-4xl font-bold ${theme.colors.text} mb-1`}>{stat.value}</p>
//             </div>
//           </div>
//         </TVCard>
//       ))}
//     </div>
//   );
// };

// // Team Efficiency Radar Chart Component - Now specifically for Project Managers
// const ProjectManagersRadarChart = ({ data, theme }) => {
//   const chartData = data.chartData?.teamEfficiency || [];
//   const managers = data.managers || [];

//   return (
//     <TVCard className="mt-8" padding="p-6" gradient>
//       <div className="flex items-center space-x-3 mb-6">
//         <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500">
//           <Target className="h-8 w-8 text-white" />
//         </div>
//         <h2 className="text-2xl font-bold text-gray-900">Project Managers Performance Analytics</h2>
//         <div className="ml-auto text-right">
//           <div className="text-sm text-gray-600">Active Managers</div>
//           <div className="text-2xl font-bold text-purple-600">{managers.length}</div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* Radar Chart */}
//         <div>
//           <h3 className="text-lg font-semibold text-gray-700 mb-4">Team Average Performance Metrics</h3>
//           <ResponsiveContainer width="100%" height={400}>
//             <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
//               <PolarGrid stroke="#e5e7eb" />
//               <PolarAngleAxis
//                 dataKey="name"
//                 tick={{ fontSize: 12, fill: '#6b7280' }}
//                 className="text-xs"
//               />
//               <PolarRadiusAxis
//                 angle={30}
//                 domain={[0, 100]}
//                 tick={{ fontSize: 10, fill: '#9ca3af' }}
//                 tickCount={5}
//               />
//               <Radar
//                 name="Efficiency %"
//                 dataKey="efficiency"
//                 stroke="#8B5CF6"
//                 fill="#8B5CF6"
//                 fillOpacity={0.3}
//                 strokeWidth={2}
//                 dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
//               />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: 'white',
//                   border: '2px solid #8B5CF6',
//                   borderRadius: '12px',
//                   boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
//                 }}
//                 formatter={(value) => [`${value}%`, 'Team Average']}
//               />
//             </RadarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Performance Breakdown */}
//         <div>
//           <h3 className="text-lg font-semibold text-gray-700 mb-4">Performance Breakdown</h3>
//           <div className="space-y-4">
//             {chartData.map((item, index) => (
//               <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
//                 <span className="text-sm font-medium text-gray-700">{item.name}</span>
//                 <div className="flex items-center space-x-3">
//                   <div className="w-24 h-2 bg-gray-200 rounded-full">
//                     <div
//                       className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-500"
//                       style={{ width: `${item.efficiency}%` }}
//                     />
//                   </div>
//                   <span className="text-sm font-bold text-purple-600 w-12 text-right">
//                     {item.efficiency}%
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
//             <div className="grid grid-cols-2 gap-4">
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-purple-600">
//                   {Math.round(chartData.reduce((sum, item) => sum + item.efficiency, 0) / chartData.length)}%
//                 </div>
//                 <div className="text-sm text-gray-600">Average Performance</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-green-600">
//                   {chartData.filter(item => item.efficiency >= 80).length}/{chartData.length}
//                 </div>
//                 <div className="text-sm text-gray-600">High Performance Areas</div>
//               </div>
//             </div>
//           </div>

//           {managers.length > 0 && (
//             <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
//               <h4 className="text-sm font-semibold text-orange-900 mb-2">Top Performer</h4>
//               <div className="flex items-center space-x-3">
//                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold text-sm">
//                   {managers.reduce((top, manager) =>
//                     manager.efficiency > (top.efficiency || 0) ? manager : top, {}
//                   ).avatar || 'TM'}
//                 </div>
//                 <div>
//                   <div className="font-bold text-orange-900">
//                     {managers.reduce((top, manager) =>
//                       manager.efficiency > (top.efficiency || 0) ? manager : top, {}
//                     ).name || 'N/A'}
//                   </div>
//                   <div className="text-sm text-orange-700">
//                     {Math.round(managers.reduce((top, manager) =>
//                       manager.efficiency > (top.efficiency || 0) ? manager : top, {}
//                     ).efficiency || 0)}% efficiency
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </TVCard>
//   );
// };

// // Project Manager Card Component
// const ProjectManagerCard = ({ manager, theme, onClick }) => {
//   const getBusyStatus = (workload) => {
//     if (workload >= 80) return { status: 'Very Busy', color: 'text-red-600', bgColor: 'bg-red-100', dotColor: 'bg-red-500' };
//     if (workload >= 60) return { status: 'Busy', color: 'text-orange-600', bgColor: 'bg-orange-100', dotColor: 'bg-orange-500' };
//     if (workload >= 30) return { status: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-100', dotColor: 'bg-yellow-500' };
//     return { status: 'Available', color: 'text-green-600', bgColor: 'bg-green-100', dotColor: 'bg-green-500' };
//   };

//   const busyInfo = getBusyStatus(manager.workload);

//   return (
//     <div
//       onClick={() => onClick && onClick(manager)}
//       className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-orange-300 transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-105 group relative overflow-hidden"
//     >
//       <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

//       <div className="relative z-10">
//         <div className="flex items-center space-x-4 mb-4">
//           <div className="relative">
//             <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
//               {manager.avatar}
//             </div>
//             <div className={`absolute -top-1 -right-1 w-4 h-4 ${busyInfo.dotColor} rounded-full border-2 border-white animate-pulse`}></div>
//           </div>
//           <div className="flex-1">
//             <h4 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
//               {manager.name}
//             </h4>
//             <p className="text-sm text-gray-600">{manager.email}</p>
//             <p className="text-xs text-gray-500">{manager.department}</p>
//             <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${busyInfo.bgColor} ${busyInfo.color} mt-1`}>
//               {busyInfo.status}
//             </div>
//           </div>
//         </div>

//         <div className="space-y-3">
//           <div className="flex justify-between items-center">
//             <span className="text-sm text-gray-600">Active Projects</span>
//             <div className="flex items-center space-x-2">
//               <Building2 className="h-4 w-4 text-orange-500" />
//               <span className="font-bold text-orange-600">{manager.projectsCount}</span>
//             </div>
//           </div>

//           <div className="flex justify-between items-center">
//             <span className="text-sm text-gray-600">Workload</span>
//             <div className="flex items-center space-x-2">
//               <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
//                 <div
//                   className={`h-full transition-all duration-500 ${manager.workload >= 80 ? 'bg-red-500' : manager.workload >= 60 ? 'bg-orange-500' : manager.workload >= 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
//                   style={{ width: `${manager.workload}%` }}
//                 ></div>
//               </div>
//               <span className="text-sm font-medium">{Math.round(manager.workload)}%</span>
//             </div>
//           </div>

//           <div className="flex justify-between items-center">
//             <span className="text-sm text-gray-600">Efficiency</span>
//             <div className="flex items-center space-x-2">
//               <Target className="h-4 w-4 text-blue-500" />
//               <span className="font-bold text-blue-600">{Math.round(manager.efficiency)}%</span>
//             </div>
//           </div>
//         </div>

//         <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//           <div className="p-1 bg-orange-500 rounded-full">
//             <ArrowRight className="h-3 w-3 text-white" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Enhanced Charts Section
// const ChartsSection = ({ data, theme }) => {
//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
//       {/* Monthly Revenue Chart */}
//       <TVCard gradient>
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
//             <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
//               <DollarSign className="h-6 w-6 text-white" />
//             </div>
//             <span>Monthly Revenue</span>
//           </h3>
//         </div>
//         <ResponsiveContainer width="100%" height={300}>
//           <AreaChart data={data.chartData.monthlyRevenue}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
//             <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
//             <YAxis stroke="#6b7280" fontSize={12} />
//             <Tooltip
//               contentStyle={{
//                 backgroundColor: 'white',
//                 border: '2px solid #f97316',
//                 borderRadius: '12px',
//                 boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
//                 fontSize: '14px'
//               }}
//             />
//             <Area
//               type="monotone"
//               dataKey="revenue"
//               stroke="#f97316"
//               fill="#f97316"
//               fillOpacity={0.3}
//               strokeWidth={3}
//             />
//             <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
//           </AreaChart>
//         </ResponsiveContainer>
//       </TVCard>

//       {/* Weekly Tasks Chart */}
//       <TVCard gradient>
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
//             <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
//               <CheckSquare className="h-6 w-6 text-white" />
//             </div>
//             <span>Weekly Tasks</span>
//           </h3>
//         </div>
//         <ResponsiveContainer width="100%" height={300}>
//           <ComposedChart data={data.chartData.weeklyTasks}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
//             <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
//             <YAxis stroke="#6b7280" fontSize={12} />
//             <Tooltip
//               contentStyle={{
//                 backgroundColor: 'white',
//                 border: '2px solid #10b981',
//                 borderRadius: '12px',
//                 boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
//                 fontSize: '14px'
//               }}
//             />
//             <Bar dataKey="completed" fill="#10b981" radius={[2, 2, 0, 0]} />
//             <Bar dataKey="pending" fill="#f59e0b" radius={[2, 2, 0, 0]} />
//             <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2} />
//           </ComposedChart>
//         </ResponsiveContainer>
//       </TVCard>
//     </div>
//   );
// };

// // Loading Screen
// const LoadingScreen = ({ theme }) => (
//   <div className={`min-h-screen ${theme.colors.background} flex items-center justify-center`}>
//     <div className="text-center">
//       <div className="relative">
//         <div className="w-32 h-32 border-8 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-8"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
//           <div className="flex items-center space-x-2">
//             <Palette className="h-8 w-8 text-orange-500" />
//             <Brush className="h-8 w-8 text-yellow-500" />
//           </div>
//         </div>
//       </div>
//       <h3 className={`text-5xl font-bold ${theme.colors.text} mb-4`}>Ujenzi & Paints</h3>
//       <p className={`text-2xl ${theme.colors.textSecondary} mb-2`}>Construction & Paint Management System</p>
//       <p className={`text-xl ${theme.colors.textMuted}`}>Loading dashboard...</p>
//     </div>
//   </div>
// );

// // Main Dashboard Component
// const AdminDashboard = () => {
//   const theme = useTheme();
//   const { data, loading, error, lastUpdated, refetch } = useEnhancedDashboardData();

//   const handleManagerClick = (manager) => {
//     console.log('Manager clicked:', manager);
//     // You can navigate to manager details here
//   };

//   if (loading) return <LoadingScreen theme={theme} />;

//   return (
//     <div className={`min-h-screen ${theme.colors.background} transition-all duration-300`}>
//       <div className="p-8">
//         {/* Enhanced Header */}
//         <div className="flex items-center justify-between mb-12">
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center space-x-3">
//               <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 shadow-lg">
//                 <Palette className="h-12 w-12 text-white" />
//               </div>
//               <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg">
//                 <Building2 className="h-12 w-12 text-white" />
//               </div>
//             </div>
//             <div>
//               <h1 className={`text-6xl font-bold ${theme.colors.text} mb-2 bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600 bg-clip-text text-transparent`}>
//                 Ujenzi & Paints
//               </h1>
//               <p className={`text-2xl ${theme.colors.textSecondary}`}>
//                 Modern Construction & Paint Management Dashboard
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center space-x-6">
//             <div className="text-right">
//               <p className={`text-xl ${theme.colors.textSecondary}`}>Last Updated</p>
//               <p className={`text-2xl font-bold ${theme.colors.text}`}>
//                 {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
//               </p>
//             </div>

//             <button
//               onClick={refetch}
//               className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
//             >
//               <RefreshCw className="h-8 w-8" />
//             </button>
//           </div>
//         </div>

//         {/* Core Statistics Grid */}
//         <CoreStatsGrid data={data} theme={theme} />

//         {        /* Project Managers Radar Chart */}
//         <ProjectManagersRadarChart data={data} theme={theme} />

//         {/* Project Managers Section */}
//         <TVCard className="mt-12 mb-12" gradient>
//           <div className="flex items-center justify-between mb-8">
//             <h3 className={`text-3xl font-bold ${theme.colors.text} flex items-center space-x-3`}>
//               <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500">
//                 <Users className="h-8 w-8 text-white" />
//               </div>
//               <span>Project Managers</span>
//             </h3>
//             <div className="text-right">
//               <div className="text-lg text-gray-600">Total Managers</div>
//               <div className="text-3xl font-bold text-purple-600">{data.managers.length}</div>
//             </div>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {data.managers.map((manager, index) => (
//               <ProjectManagerCard
//                 key={manager.id || index}
//                 manager={manager}
//                 theme={theme}
//                 onClick={handleManagerClick}
//               />
//             ))}
//           </div>
//         </TVCard>

//         {/* Analytics Charts */}
//         <ChartsSection data={data} theme={theme} />

//         {/* Project Progress Overview */}
//         <TVCard gradient>
//           <div className="flex items-center justify-between mb-8">
//             <h3 className={`text-3xl font-bold ${theme.colors.text} flex items-center space-x-3`}>
//               <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
//                 <Building2 className="h-8 w-8 text-white" />
//               </div>
//               <span>Project Progress Overview</span>
//             </h3>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Progress Chart */}
//             <div>
//               <h4 className="text-xl font-semibold text-gray-700 mb-4">Progress by Project</h4>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={data.chartData.projectProgress} layout="horizontal">
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
//                   <XAxis type="number" domain={[0, 100]} stroke="#6b7280" fontSize={12} />
//                   <YAxis type="category" dataKey="name" stroke="#6b7280" fontSize={12} width={100} />
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: 'white',
//                       border: '2px solid #10b981',
//                       borderRadius: '12px',
//                       boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
//                     }}
//                     formatter={(value) => [`${value}%`, 'Progress']}
//                   />
//                   <Bar dataKey="progress" fill="#10b981" radius={[0, 4, 4, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>

//             {/* Project Cards */}
//             <div>
//               <h4 className="text-xl font-semibold text-gray-700 mb-4">Active Projects</h4>
//               <div className="space-y-4 max-h-80 overflow-y-auto">
//                 {data.projects.map((project, index) => (
//                   <div key={project.id || index} className="p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-green-300 transition-all">
//                     <div className="flex items-start justify-between mb-3">
//                       <div className="flex-1">
//                         <h5 className="text-lg font-bold text-gray-900 mb-1">{project.title}</h5>
//                         <div className="flex items-center space-x-4 text-sm text-gray-600">
//                           <div className="flex items-center space-x-1">
//                             <MapPin className="h-4 w-4" />
//                             <span>{project.location}</span>
//                           </div>
//                           <div className="flex items-center space-x-1">
//                             <Calendar className="h-4 w-4" />
//                             <span>{new Date(project.end_date).toLocaleDateString()}</span>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <div className="text-2xl font-bold text-green-600">{project.progress}%</div>
//                         <div className="text-sm text-gray-500">Complete</div>
//                       </div>
//                     </div>

//                     <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
//                       <div
//                         className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
//                         style={{ width: `${project.progress}%` }}
//                       />
//                     </div>

//                     <div className="flex justify-between items-center">
//                       <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//                         project.status === 'active' ? 'bg-blue-100 text-blue-800' :
//                         project.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
//                         'bg-gray-100 text-gray-800'
//                       }`}>
//                         {project.status.replace('_', ' ').toUpperCase()}
//                       </span>
//                       <div className="flex items-center space-x-1 text-green-600 font-bold">
//                         <DollarSign className="h-4 w-4" />
//                         <span>${(project.budget / 1000000).toFixed(1)}M</span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </TVCard>

//         {/* Performance Insights */}
//         <TVCard className="mt-12" gradient>
//           <div className="flex items-center space-x-3 mb-8">
//             <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
//               <Activity className="h-8 w-8 text-white" />
//             </div>
//             <h3 className="text-3xl font-bold text-gray-900">Performance Insights</h3>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {/* Key Metrics */}
//             <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
//               <div className="flex items-center space-x-3 mb-4">
//                 <div className="p-2 rounded-lg bg-blue-500">
//                   <Target className="h-6 w-6 text-white" />
//                 </div>
//                 <h4 className="text-xl font-bold text-blue-900">Efficiency Score</h4>
//               </div>
//               <div className="text-4xl font-bold text-blue-600 mb-2">
//                 {Math.round(data.statistics.avgTeamEfficiency)}%
//               </div>
//               <p className="text-blue-700">Team average performance across all metrics</p>
//             </div>

//             <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
//               <div className="flex items-center space-x-3 mb-4">
//                 <div className="p-2 rounded-lg bg-green-500">
//                   <CheckSquare className="h-6 w-6 text-white" />
//                 </div>
//                 <h4 className="text-xl font-bold text-green-900">Completion Rate</h4>
//               </div>
//               <div className="text-4xl font-bold text-green-600 mb-2">
//                 {Math.round((data.statistics.completedTasks / data.statistics.totalTasks) * 100)}%
//               </div>
//               <p className="text-green-700">Tasks completed on time this month</p>
//             </div>

//             <div className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200">
//               <div className="flex items-center space-x-3 mb-4">
//                 <div className="p-2 rounded-lg bg-orange-500">
//                   <DollarSign className="h-6 w-6 text-white" />
//                 </div>
//                 <h4 className="text-xl font-bold text-orange-900">Budget Efficiency</h4>
//               </div>
//               <div className="text-4xl font-bold text-orange-600 mb-2">94%</div>
//               <p className="text-orange-700">Projects staying within budget</p>
//             </div>
//           </div>

//           {/* Recent Achievements */}
//           <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
//             <h4 className="text-xl font-bold text-purple-900 mb-4 flex items-center space-x-2">
//               <div className="p-2 rounded-lg bg-purple-500">
//                 <User className="h-5 w-5 text-white" />
//               </div>
//               <span>Recent Achievements</span>
//             </h4>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
//                 <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//                 <span className="text-gray-700">CBD Office Tower reached 82% completion</span>
//               </div>
//               <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
//                 <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
//                 <span className="text-gray-700">Sarah Johnson exceeded efficiency targets</span>
//               </div>
//               <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
//                 <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
//                 <span className="text-gray-700">Q2 revenue target exceeded by 15%</span>
//               </div>
//               <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
//                 <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
//                 <span className="text-gray-700">Zero safety incidents this month</span>
//               </div>
//             </div>
//           </div>
//         </TVCard>

//         {/* Footer */}
//         <div className="text-center py-8 mt-12 border-t-2 border-gradient-to-r from-orange-200 to-yellow-200">
//           <div className="flex items-center justify-center space-x-4 mb-4">
//             <Palette className="h-8 w-8 text-orange-500" />
//             <Building2 className="h-8 w-8 text-blue-500" />
//             <Brush className="h-8 w-8 text-yellow-500" />
//           </div>
//           <p className={`text-xl ${theme.colors.textMuted} mb-2`}>
//             Ujenzi & Paints Enterprise • Modern Construction & Paint Management Platform
//           </p>
//           <p className={`text-lg ${theme.colors.textMuted}`}>
//             © 2024 Ujenzi & Paints Solutions • Last updated: {lastUpdated?.toLocaleString()}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

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


// Enhanced Project Card
// Tenders Management Panel
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
  Eye
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
    <div className={`${theme.colors.card} rounded-xl border ${theme.colors.border} shadow-lg overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
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

// Key Metrics Bar - Enhanced with more metrics
const KeyMetricsBar = ({ data, theme }) => {
  const metrics = [
    { label: "Projects", value: data.statistics?.totalProjects || 0, icon: Building2, color: "text-blue-600", change: "+12%" },
    { label: "Active", value: data.statistics?.activeProjects || 0, icon: Activity, color: "text-green-600", change: "+8%" },
    { label: "Completed", value: data.statistics?.completedProjects || 0, icon: CheckSquare, color: "text-emerald-600", change: "+15%" },
    { label: "Tasks", value: data.statistics?.totalTasks || 0, icon: Timer, color: "text-purple-600", change: "+24%" },
    { label: "Team", value: data.statistics?.teamSize || 0, icon: Users, color: "text-orange-600", change: "+3%" },
    { label: "Budget", value: `$${((data.statistics?.totalBudget || 0) / 1000000).toFixed(1)}M`, icon: DollarSign, color: "text-emerald-600", change: "+18%" },
    { label: "Efficiency", value: `${Math.round(data.statistics?.avgTeamEfficiency || 0)}%`, icon: Target, color: "text-indigo-600", change: "+4.2%" },
    { label: "Tenders", value: data.statistics?.activeTenders || 0, icon: Eye, color: "text-cyan-600", change: "+7%" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
      {metrics.map((metric, index) => (
        <div key={index} className="flex flex-col p-4 bg-white/80 rounded-xl border border-gray-200/50 hover:shadow-lg transition-all transform hover:scale-105">
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg bg-gray-50 ${metric.color}`}>
              <metric.icon className="h-5 w-5" />
            </div>
            <div className="text-xs font-medium text-green-600">
              {metric.change}
            </div>
          </div>
          <div className={`text-2xl font-bold ${theme.colors.text} mb-1`}>{metric.value}</div>
          <div className={`text-sm ${theme.colors.textSecondary}`}>{metric.label}</div>
        </div>
      ))}
    </div>
  );
};

// Live Data Stats Component
const LiveDataStats = ({ data, theme }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const liveStats = [
    {
      title: "Active Right Now",
      items: [
        { label: "Online Team Members", value: Math.floor((data.statistics?.teamSize || 0) * 0.8), icon: Users, color: "text-green-500" },
        { label: "Active Projects", value: data.statistics?.activeProjects || 0, icon: Building2, color: "text-blue-500" },
        { label: "Tasks in Progress", value: data.statistics?.pendingTasks || 0, icon: Timer, color: "text-yellow-500" },
        { label: "Today's Events", value: data.statistics?.todayEvents || 0, icon: Calendar, color: "text-purple-500" },
      ]
    },
    {
      title: "Performance Metrics",
      items: [
        { label: "Completion Rate", value: `${data.statistics?.totalTasks > 0 ? Math.round((data.statistics.completedTasks / data.statistics.totalTasks) * 100) : 0}%`, icon: Target, color: "text-green-500" },
        { label: "On-Time Delivery", value: `${85 + Math.floor(Math.random() * 10)}%`, icon: Clock, color: "text-blue-500" },
        { label: "Budget Efficiency", value: `${90 + Math.floor(Math.random() * 8)}%`, icon: DollarSign, color: "text-emerald-500" },
        { label: "Team Satisfaction", value: `${88 + Math.floor(Math.random() * 12)}%`, icon: Award, color: "text-orange-500" },
      ]
    }
  ];

  return (
    <DashboardPanel title="Live Statistics" icon={Activity}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Live Data Stream</span>
          </div>
          <div className="text-sm text-gray-500">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
        
        {liveStats.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-3">
            <h4 className="font-semibold text-gray-800 text-sm">{section.title}</h4>
            <div className="grid grid-cols-1 gap-3">
              {section.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded ${item.color.replace('text-', 'bg-').replace('-500', '-100')}`}>
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                  <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardPanel>
  );
};

// Enhanced Team Performance List
const TeamPerformanceList = ({ data, theme }) => {
  const sortedTeamMembers = React.useMemo(() => {
    const teamMembers = data.chartData?.teamWorkload || [];
    return [...teamMembers].sort((a, b) => b.workload - a.workload);
  }, [data.chartData?.teamWorkload]);

  return (
    <DashboardPanel title="Team Performance Ranking" icon={Award}>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-medium text-gray-500 px-3 pb-2 border-b">
          <span>Rank & Member</span>
          <div className="flex space-x-8">
            <span>Workload</span>
            <span>Projects</span>
            <span>Efficiency</span>
          </div>
        </div>
        
        {sortedTeamMembers.slice(0, 12).map((member, index) => {
          const getRankBadge = (rank) => {
            if (rank === 0) return "🥇";
            if (rank === 1) return "🥈";
            if (rank === 2) return "🥉";
            return `#${rank + 1}`;
          };
          
          const getWorkloadColor = (workload) => {
            if (workload >= 90) return "text-red-600 bg-red-50";
            if (workload >= 75) return "text-orange-600 bg-orange-50";
            if (workload >= 50) return "text-yellow-600 bg-yellow-50";
            return "text-green-600 bg-green-50";
          };

          return (
            <div key={`${member.name}-${index}`} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border hover:shadow-md transition-all">
              <div className="flex items-center space-x-3">
                <div className="text-lg font-bold text-gray-600 w-8">
                  {getRankBadge(index)}
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  member.role === 'Manager' ? 'bg-blue-500' : 
                  member.role === 'Supervisor' ? 'bg-purple-500' : 'bg-cyan-500'
                }`}>
                  {member.name ? member.name[0] : 'U'}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{member.name || 'Unknown'}</div>
                  <div className="text-xs text-gray-500">{member.role || 'Team Member'}</div>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <div className={`px-2 py-1 rounded-full text-xs font-bold ${getWorkloadColor(member.workload || 0)}`}>
                  {member.workload || 0}%
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-purple-600">{member.projects || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-green-600">{Math.round(member.efficiency || 0)}%</div>
                </div>
              </div>
            </div>
          );
        })}
        
        {sortedTeamMembers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No team members data available</p>
          </div>
        )}
      </div>
    </DashboardPanel>
  );
};

// Tenders Management Panel
const TendersManagement = ({ data, theme }) => {
  const tenderData = [
    { id: 1, title: "Commercial Building Construction", value: 2500000, status: "active", bidders: 8, deadline: "2024-02-15", priority: "high" },
    { id: 2, title: "Road Infrastructure Project", value: 1800000, status: "active", bidders: 12, deadline: "2024-02-20", priority: "medium" },
    { id: 3, title: "Residential Complex Phase 2", value: 3200000, status: "evaluation", bidders: 6, deadline: "2024-01-30", priority: "high" },
    { id: 4, title: "Paint Supply Contract", value: 450000, status: "draft", bidders: 0, deadline: "2024-03-01", priority: "low" },
    { id: 5, title: "School Renovation Project", value: 920000, status: "active", bidders: 4, deadline: "2024-02-25", priority: "medium" },
    { id: 6, title: "Office Complex Painting", value: 680000, status: "closed", bidders: 15, deadline: "2024-01-15", priority: "completed" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'evaluation': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'closed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tenderStats = {
    total: tenderData.length,
    active: tenderData.filter(t => t.status === 'active').length,
    evaluation: tenderData.filter(t => t.status === 'evaluation').length,
    totalValue: tenderData.reduce((sum, t) => sum + t.value, 0),
    averageBidders: Math.round(tenderData.reduce((sum, t) => sum + t.bidders, 0) / tenderData.length)
  };

  return (
    <DashboardPanel title="Tenders Management" icon={Eye}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{tenderStats.total}</div>
            <div className="text-xs text-blue-800">Total Tenders</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{tenderStats.active}</div>
            <div className="text-xs text-green-800">Active</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{tenderStats.evaluation}</div>
            <div className="text-xs text-yellow-800">In Evaluation</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">${(tenderStats.totalValue / 1000000).toFixed(1)}M</div>
            <div className="text-xs text-purple-800">Total Value</div>
          </div>
          <div className="text-center p-3 bg-indigo-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{tenderStats.averageBidders}</div>
            <div className="text-xs text-indigo-800">Avg Bidders</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 text-sm">Recent Tenders</h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {tenderData.map((tender) => (
              <div key={tender.id} className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900 text-sm mb-1">{tender.title}</h5>
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          <span>Value: ${(tender.value / 1000000).toFixed(1)}M</span>
                          <span>Bidders: {tender.bidders}</span>
                          <span>Deadline: {new Date(tender.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tender.status)}`}>
                      {tender.status.toUpperCase()}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(tender.priority)}`}>
                      {tender.priority.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardPanel>
  );
};

// Chart Components
const TeamWorkloadChart = ({ data, theme }) => (
  <DashboardPanel title="Busiest Team Members" icon={BarChart3}>
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data.chartData?.teamWorkload || []} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Bar dataKey="workload" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Workload %" />
        <Bar dataKey="projects" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Projects" />
      </BarChart>
    </ResponsiveContainer>
  </DashboardPanel>
);

const TeamRadarChart = ({ data, theme }) => (
  <DashboardPanel title="Team Performance Radar" icon={Target}>
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart data={data.chartData?.teamRadar || []}>
        <PolarGrid />
        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis angle={0} domain={[0, 100]} tick={{ fontSize: 10 }} />
        <Radar name="Managers" dataKey="Managers" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
        <Radar name="Supervisors" dataKey="Supervisors" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} strokeWidth={2} />
        <Radar name="Site Managers" dataKey="SiteManagers" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} strokeWidth={2} />
        <Legend />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  </DashboardPanel>
);

const ProjectProgressChart = ({ data, theme }) => (
  <DashboardPanel title="Project Progress Tracker" icon={TrendingUp}>
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data.chartData?.projectProgress || []}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
        <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
        <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
        <Tooltip />
        <Bar yAxisId="left" dataKey="progress" fill="#10b981" radius={[4, 4, 0, 0]} name="Progress %" />
        <Line yAxisId="right" type="monotone" dataKey="budget" stroke="#f59e0b" strokeWidth={3} name="Budget (M)" />
      </ComposedChart>
    </ResponsiveContainer>
  </DashboardPanel>
);

const PerformanceTrendsChart = ({ data, theme }) => (
  <DashboardPanel title="Performance Trends" icon={Activity}>
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data.chartData?.performanceMetrics || []}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip />
        <Area type="monotone" dataKey="projects" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Projects" />
        <Area type="monotone" dataKey="completed" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Completed" />
        <Area type="monotone" dataKey="efficiency" stackId="2" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} name="Efficiency" />
      </AreaChart>
    </ResponsiveContainer>
  </DashboardPanel>
);

const StatisticsSummary = ({ data, theme }) => (
  <DashboardPanel title="Statistics Overview" icon={PieChartIcon}>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
          <span className="text-sm font-medium text-blue-900">Total Projects</span>
          <span className="text-lg font-bold text-blue-600">{data.statistics?.totalProjects || 0}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <span className="text-sm font-medium text-green-900">Completed</span>
          <span className="text-lg font-bold text-green-600">{data.statistics?.completedProjects || 0}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
          <span className="text-sm font-medium text-orange-900">Pending Tasks</span>
          <span className="text-lg font-bold text-orange-600">{data.statistics?.pendingTasks || 0}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
          <span className="text-sm font-medium text-red-900">Overdue</span>
          <span className="text-lg font-bold text-red-600">{data.statistics?.overdueTasks || 0}</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
          <span className="text-sm font-medium text-purple-900">Active Tenders</span>
          <span className="text-lg font-bold text-purple-600">{data.statistics?.activeTenders || 0}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
          <span className="text-sm font-medium text-indigo-900">Today's Events</span>
          <span className="text-lg font-bold text-indigo-600">{data.statistics?.todayEvents || 0}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
          <span className="text-sm font-medium text-pink-900">Notifications</span>
          <span className="text-lg font-bold text-pink-600">{data.statistics?.unreadNotifications || 0}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg">
          <span className="text-sm font-medium text-cyan-900">Avg Progress</span>
          <span className="text-lg font-bold text-cyan-600">{Math.round(data.statistics?.avgProgress || 0)}%</span>
        </div>
      </div>
    </div>
  </DashboardPanel>
);

const LoadingScreen = ({ theme }) => (
  <div className={`min-h-screen ${theme.colors.background} flex items-center justify-center`}>
    <div className="text-center">
      <div className="relative">
        <div className="w-24 h-24 border-6 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center space-x-1">
            <Palette className="h-6 w-6 text-blue-500" />
            <Brush className="h-6 w-6 text-orange-500" />
          </div>
        </div>
      </div>
      <h3 className={`text-3xl font-bold ${theme.colors.text} mb-2`}>
        Ujenzi & Paints
      </h3>
      <p className={`text-lg ${theme.colors.textSecondary} mb-1`}>
        Construction & Paint Management
      </p>
      <p className={`text-sm ${theme.colors.textMuted}`}>
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
  }, [location.pathname]);

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
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className={`text-2xl font-bold ${theme.colors.text} mb-4`}>
            API Connection Error
          </h3>
          <p className={`text-lg ${theme.colors.textSecondary} mb-6`}>
            {error}
          </p>
          <button
            onClick={refetch}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-semibold"
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
          <div className="p-4">
            <div className="mb-6">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            {selectedManager && (
              <ProjectManagerDetails managerId={selectedManager.id} />
            )}
          </div>
        ) : (
          <div className="w-full">
            <div className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
              <div className="w-full px-4 lg:px-6 py-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-4 flex-shrink-0">
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="lg:hidden p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                    <button
                      onClick={toggleSidebarCollapse}
                      className="hidden lg:flex p-3 rounded-xl bg-gray-500 text-white hover:bg-gray-600 transition-all"
                      title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                      {sidebarCollapsed ? (
                        <Maximize2 className="h-5 w-5" />
                      ) : (
                        <Minimize2 className="h-5 w-5" />
                      )}
                    </button>
                    <div className="flex items-center space-x-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
                        <Palette className="h-6 lg:h-8 w-6 lg:w-8 text-white" />
                      </div>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                        <Building2 className="h-6 lg:h-8 w-6 lg:w-8 text-white" />
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
                        Ujenzi & Paints
                      </h1>
                      <p className="text-xs lg:text-sm text-gray-600">Construction & Paint Management Dashboard</p>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center space-x-4 flex-1 max-w-2xl mx-4 lg:mx-8">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search projects, tasks, or team members..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
                    <div className="hidden xl:block text-right">
                      <p className="text-sm font-medium text-gray-900">
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
                      className={`p-2 lg:p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all ${
                        refreshing ? "animate-spin" : ""
                      }`}
                    >
                      <RefreshCw className="h-4 lg:h-5 w-4 lg:w-5" />
                    </button>
                    
                    <button className="relative p-2 lg:p-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                      <Bell className="h-4 lg:h-5 w-4 lg:w-5" />
                      {data.statistics?.unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                      )}
                    </button>
                    
                    <button
                      onClick={theme.toggleTheme}
                      className="p-2 lg:p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      {theme.isDark ? '☀️' : '🌙'}
                    </button>
                    
                    <div className="flex items-center space-x-3 pl-2 lg:pl-4 border-l border-gray-200">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm lg:text-base">
                        AD
                      </div>
                      <div className="hidden lg:block">
                        <p className="text-sm font-medium text-gray-900">Admin User</p>
                        <p className="text-xs text-gray-600">System Administrator</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full px-4 lg:px-6 py-6 lg:py-8">
              <div className="mb-6 lg:mb-8 w-full">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h2 className={`text-2xl lg:text-4xl font-bold ${theme.colors.text} mb-2`}>
                      Construction Management Dashboard 🏗️
                    </h2>
                    <p className={`text-base lg:text-lg ${theme.colors.textSecondary}`}>
                      Real-time insights into your construction projects and team performance.
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-colors font-medium text-sm lg:text-base">
                      <Plus className="h-4 w-4 mr-2 inline" />
                      New Project
                    </button>
                  </div>
                </div>
              </div>

              <KeyMetricsBar data={data} theme={theme} />

              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8 mb-8">
                <div className="xl:col-span-2">
                  <TeamWorkloadChart data={data} theme={theme} />
                </div>
                <LiveDataStats data={data} theme={theme} />
                <StatisticsSummary data={data} theme={theme} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-8">
                <TeamRadarChart data={data} theme={theme} />
                <ProjectProgressChart data={data} theme={theme} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 mb-8">
                <PerformanceTrendsChart data={data} theme={theme} />
                <TeamPerformanceList data={data} theme={theme} />
                <TendersManagement data={data} theme={theme} />
              </div>

              <div className="w-full text-center py-6 lg:py-8 border-t border-gray-200/50">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Palette className="h-6 w-6 text-blue-500" />
                    <Building2 className="h-6 w-6 text-orange-500" />
                    <Brush className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
                    Ujenzi & Paints Enterprise
                  </h4>
                  <p className={`text-sm ${theme.colors.textMuted}`}>
                    Leading Construction & Paint Management Platform in Kenya
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500 mt-4">
                    <span>© 2024 Ujenzi & Paints Solutions</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Projects: {data.projects?.length || 0}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Tasks: {data.tasks?.length || 0}</span>
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

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminDashboard;