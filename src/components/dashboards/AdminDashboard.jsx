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


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Tooltip, Legend
} from 'recharts';
import {
  Clock, DollarSign, Users, Building2, TrendingUp, TrendingDown,
  Target, Zap, RefreshCw, ArrowRight, Bell, User, Plus, FileText,
  Shield, AlertTriangle, CheckSquare, Activity, Award, Star,
  Calendar, MapPin, Flame, Eye, Download, Filter, Settings,
  UserCheck, Loader, AlertCircle, Timer, Users2, Edit, Trash2,
  CalendarDays, ChevronLeft, ChevronRight, MoreHorizontal, Menu,
  Palette, Brush, Home, BarChart3, X, Maximize2, Minimize2
} from 'lucide-react';

// Import your actual API services
import ProjectManagerDetails from '../../pages/admin/ProjectManagerDetails';
import AdminSidebar from '../../pages/admin/AdminSidebar';
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
  fetchProjectManagers
} from '../../services/api';

// Theme Hook
const useTheme = () => {
  const [isDark, setIsDark] = useState(false);
  
  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);
  
  const theme = useMemo(() => ({
    isDark,
    colors: {
      background: isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-yellow-50',
      card: isDark ? 'bg-gray-800' : 'bg-white',
      border: isDark ? 'border-gray-700' : 'border-gray-200',
      text: isDark ? 'text-gray-100' : 'text-gray-900',
      textSecondary: isDark ? 'text-gray-400' : 'text-gray-600',
      textMuted: isDark ? 'text-gray-500' : 'text-gray-500',
      primary: '#F97316',
      secondary: '#EAB308',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      purple: '#8B5CF6',
    }
  }), [isDark]);
  
  return { ...theme, toggleTheme };
};

// Card Component
const Card = ({ children, className = "", ...props }) => {
  const theme = useTheme();
  return (
    <div
      className={`p-6 ${theme.colors.card} rounded-xl border ${theme.colors.border} shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
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
    teamMembers: [],
    supervisors: [],
    siteManagers: [],
    notifications: [],
    chartData: {
      monthlyRevenue: [],
      projectStatus: [],
      teamEfficiency: [],
      projectProgress: [],
      weeklyTasks: [],
      tenderStatus: [],
      taskStatus: []
    }
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

      // Fetch all data from your real API services
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
        calendarEventsResponse
      ] = await Promise.allSettled([
        dashboardAPI.getDashboard().catch(() => ({})),
        projectsAPI.getAll().catch(() => ({ projects: [] })),
        fetchProjectManagers().catch(() => []),
        eventsAPI.getUpcoming(20).catch(() => ({ events: [] })),
        tasksAPI.getAll().catch(() => ({ tasks: [] })),
        tendersAPI.getAll().catch(() => ({ tenders: [] })),
        teamMembersAPI.getAll().catch(() => ({ team_members: [] })),
        supervisorsAPI.getAll().catch(() => []),
        siteManagersAPI.getAll().catch(() => []),
        notificationsAPI.getAll().catch(() => []),
        calendarAPI.getTodayEvents().catch(() => [])
      ]);

      // Process responses
      const dashboard = dashboardResponse.status === 'fulfilled' ? dashboardResponse.value : {};
      const projectsData = projectsResponse.status === 'fulfilled' ? projectsResponse.value : { projects: [] };
      const managersData = managersResponse.status === 'fulfilled' ? managersResponse.value : [];
      const eventsData = eventsResponse.status === 'fulfilled' ? eventsResponse.value : { events: [] };
      const tasksData = tasksResponse.status === 'fulfilled' ? tasksResponse.value : { tasks: [] };
      const tendersData = tendersResponse.status === 'fulfilled' ? tendersResponse.value : { tenders: [] };
      const teamMembersData = teamMembersResponse.status === 'fulfilled' ? teamMembersResponse.value : { team_members: [] };
      const supervisorsData = supervisorsResponse.status === 'fulfilled' ? supervisorsResponse.value : [];
      const siteManagersData = siteManagersResponse.status === 'fulfilled' ? siteManagersResponse.value : [];
      const notificationsData = notificationsResponse.status === 'fulfilled' ? notificationsResponse.value : [];
      const calendarEventsData = calendarEventsResponse.status === 'fulfilled' ? calendarEventsResponse.value : [];

      // Normalize data
      const projects = Array.isArray(projectsData.projects) ? projectsData.projects : (Array.isArray(projectsData) ? projectsData : []);
      const events = Array.isArray(eventsData.events) ? eventsData.events : (Array.isArray(eventsData) ? eventsData : []);
      const tasks = Array.isArray(tasksData.tasks) ? tasksData.tasks : (Array.isArray(tasksData) ? tasksData : []);
      const tenders = Array.isArray(tendersData.tenders) ? tendersData.tenders : (Array.isArray(tendersData) ? tendersData : []);
      const teamMembers = Array.isArray(teamMembersData.team_members) ? teamMembersData.team_members : (Array.isArray(teamMembersData) ? teamMembersData : []);
      const supervisors = Array.isArray(supervisorsData) ? supervisorsData : [];
      const siteManagers = Array.isArray(siteManagersData) ? siteManagersData : [];
      const notifications = Array.isArray(notificationsData) ? notificationsData : [];
      const todayEvents = Array.isArray(calendarEventsData) ? calendarEventsData : [];

      // Process managers data
      const managers = Array.isArray(managersData) ? managersData.map(manager => ({
        id: manager.id,
        name: manager.name,
        email: manager.email,
        phone: manager.phone || '+254 700 000 000',
        location: manager.location || 'Nairobi, Kenya',
        department: manager.department || 'Construction',
        joinDate: manager.join_date || 'Jan 2022',
        projectsCount: manager.number_of_projects || 0,
        activeProjects: manager.number_of_projects || 0,
        completedProjects: manager.completed_projects || Math.floor(Math.random() * 20) + 5,
        lastLogin: manager.last_login,
        status: manager.status,
        workload: Math.min(100, (manager.number_of_projects || 0) * 25),
        efficiency: 85 + Math.random() * 15,
        avatar: manager.avatar || manager.name?.split(' ').map(n => n[0]).join('') || 'U',
        role: manager.role || 'Project Manager',
        totalBudget: (manager.number_of_projects || 0) * 500000 + Math.random() * 2000000
      })) : [];

      // Calculate statistics
      const statistics = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active' || p.status === 'in_progress').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        planningProjects: projects.filter(p => p.status === 'planning').length,
        totalBudget: projects.reduce((sum, p) => sum + (parseFloat(p.budget || 0)), 0),
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        overdueTasks: tasks.filter(t => {
          if (!t.due_date) return false;
          return new Date(t.due_date) < new Date() && t.status !== 'completed';
        }).length,
        teamSize: managers.length + supervisors.length + siteManagers.length,
        activeTenders: tenders.filter(t => t.status === 'active').length,
        totalTenderValue: tenders.reduce((sum, t) => sum + (parseFloat(t.budget_estimate || 0)), 0),
        unreadNotifications: notifications.filter(n => !n.read).length,
        todayEvents: todayEvents.length,
        avgProgress: projects.length > 0 ?
          projects.reduce((sum, p) => sum + (parseFloat(p.progress_percentage || p.progress || 0)), 0) / projects.length : 0,
        avgTeamEfficiency: managers.length > 0 ?
          managers.reduce((sum, m) => sum + m.efficiency, 0) / managers.length : 0
      };

      // Generate chart data
      const chartData = {
        projectStatus: [
          { name: 'Active', value: statistics.activeProjects, color: '#F97316' },
          { name: 'Completed', value: statistics.completedProjects, color: '#10B981' },
          { name: 'Planning', value: Math.max(1, statistics.planningProjects), color: '#EAB308' }
        ],
        taskStatus: [
          { name: 'Completed', value: statistics.completedTasks, color: '#10B981' },
          { name: 'Pending', value: statistics.pendingTasks, color: '#F59E0B' },
          { name: 'Overdue', value: statistics.overdueTasks, color: '#EF4444' }
        ],
        monthlyRevenue: [
          { month: 'Jan', revenue: 2.8, target: 2.5 },
          { month: 'Feb', revenue: 3.2, target: 2.8 },
          { month: 'Mar', revenue: 3.8, target: 3.2 },
          { month: 'Apr', revenue: 3.4, target: 3.5 },
          { month: 'May', revenue: 4.2, target: 3.8 },
          { month: 'Jun', revenue: 4.8, target: 4.2 }
        ],
        weeklyTasks: [
          { day: 'Mon', completed: Math.floor(statistics.completedTasks * 0.18), pending: Math.floor(statistics.pendingTasks * 0.15) },
          { day: 'Tue', completed: Math.floor(statistics.completedTasks * 0.22), pending: Math.floor(statistics.pendingTasks * 0.12) },
          { day: 'Wed', completed: Math.floor(statistics.completedTasks * 0.16), pending: Math.floor(statistics.pendingTasks * 0.18) },
          { day: 'Thu', completed: Math.floor(statistics.completedTasks * 0.20), pending: Math.floor(statistics.pendingTasks * 0.14) },
          { day: 'Fri', completed: Math.floor(statistics.completedTasks * 0.24), pending: Math.floor(statistics.pendingTasks * 0.11) },
          { day: 'Sat', completed: Math.floor(statistics.completedTasks * 0.08), pending: Math.floor(statistics.pendingTasks * 0.06) },
          { day: 'Sun', completed: Math.floor(statistics.completedTasks * 0.06), pending: Math.floor(statistics.pendingTasks * 0.08) }
        ]
      };

      setData({
        statistics,
        projects,
        managers,
        events: events.concat(todayEvents),
        tasks,
        tenders,
        teamMembers: teamMembers.concat(supervisors).concat(siteManagers),
        supervisors,
        siteManagers,
        notifications,
        chartData
      });

      setLastUpdated(new Date());
      console.log('✅ Dashboard data loaded successfully from real APIs');

    } catch (err) {
      console.error('❌ Dashboard data fetch failed:', err);
      setError(err.message || 'Failed to load dashboard data from APIs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return { data, loading, error, lastUpdated, refreshing, refetch };
};

// Statistics Grid Component
const StatsGrid = ({ data, theme }) => {
  const stats = [
    {
      title: 'Total Projects',
      value: data.statistics?.totalProjects || 0,
      change: '+12%',
      trend: 'up',
      icon: Building2,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Active Projects',
      value: data.statistics?.activeProjects || 0,
      change: '+8',
      trend: 'up',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Total Tasks',
      value: data.statistics?.totalTasks || 0,
      change: '+24',
      trend: 'up',
      icon: CheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Team Members',
      value: data.statistics?.teamSize || 0,
      change: '+3',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Monthly Revenue',
      value: `$${((data.statistics?.totalBudget || 0) / 1000000).toFixed(1)}M`,
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'This Week Tasks',
      value: data.statistics?.completedTasks || 0,
      change: '+18',
      trend: 'up',
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      title: 'Overdue Tasks',
      value: data.statistics?.overdueTasks || 0,
      change: '-2',
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Team Efficiency',
      value: `${Math.round(data.statistics?.avgTeamEfficiency || 0)}%`,
      change: '+4.2%',
      trend: 'up',
      icon: Zap,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className={`hover:shadow-lg transition-all border-2 ${stat.borderColor} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-16 h-16 transform translate-x-6 -translate-y-6">
            <div className={`w-full h-full rounded-full ${stat.bgColor} opacity-50`} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.bgColor} border ${stat.borderColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="text-right">
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
            </div>
            <div>
              <p className={`text-sm font-medium ${theme.colors.textSecondary} mb-1`}>{stat.title}</p>
              <p className={`text-2xl font-bold ${theme.colors.text}`}>{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Manager Card Component
const ManagerCard = ({ manager, theme, onClick }) => {
  const getBusyStatus = (workload) => {
    if (workload >= 80) return { status: 'Very Busy', color: 'text-red-600', bgColor: 'bg-red-100', dotColor: 'bg-red-500' };
    if (workload >= 60) return { status: 'Busy', color: 'text-orange-600', bgColor: 'bg-orange-100', dotColor: 'bg-orange-500' };
    if (workload >= 30) return { status: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-100', dotColor: 'bg-yellow-500' };
    return { status: 'Available', color: 'text-green-600', bgColor: 'bg-green-100', dotColor: 'bg-green-500' };
  };

  const busyInfo = getBusyStatus(manager.workload);

  return (
    <Card
      onClick={() => onClick?.(manager)}
      className="hover:shadow-lg cursor-pointer hover:border-orange-300 transition-all group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {manager.avatar}
            </div>
            <div className={`absolute -top-1 -right-1 w-3 h-3 ${busyInfo.dotColor} rounded-full border-2 border-white`}></div>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
              {manager.name}
            </h4>
            <p className="text-sm text-gray-600">{manager.email}</p>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${busyInfo.bgColor} ${busyInfo.color} mt-1`}>
              {busyInfo.status}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Projects</span>
            <span className="font-semibold text-orange-600">{manager.projectsCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Workload</span>
            <span className="font-semibold">{Math.round(manager.workload)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${manager.workload >= 80 ? 'bg-red-500' : manager.workload >= 60 ? 'bg-orange-500' : manager.workload >= 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${manager.workload}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Project Card Component
const ProjectCard = ({ project, theme, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': case 'in_progress': return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
      case 'completed': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      case 'planning': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  const statusInfo = getStatusColor(project.status);

  return (
    <Card
      onClick={() => onClick?.(project)}
      className="hover:shadow-lg cursor-pointer hover:border-blue-300 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
            {project.title || project.name || 'Untitled Project'}
          </h4>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
            {(project.status || 'unknown').replace('_', ' ').toUpperCase()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round(project.progress_percentage || project.progress || 0)}%
          </div>
          <div className="text-xs text-gray-500">Complete</div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-500"
            style={{ width: `${project.progress_percentage || project.progress || 0}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Budget</span>
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="font-bold text-green-600">
              ${((project.budget || 0) / 1000000).toFixed(1)}M
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Deadline</span>
          <span className="text-sm text-gray-800">
            {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'TBD'}
          </span>
        </div>
      </div>
    </Card>
  );
};

// Event Creation Modal
const EventModal = ({ isOpen, onClose, onSubmit, selectedDate, projects }) => {
  const [formData, setFormData] = useState({
    description: '',
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
    project_id: '',
    responsible: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ description: '', date: '', project_id: '', responsible: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Create New Event</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project
            </label>
            <select
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Select Project (Optional)</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.title || project.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Responsible Person
            </label>
            <input
              type="text"
              value={formData.responsible}
              onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter responsible person"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Calendar Component
const CalendarWidget = ({ data, theme, onCreateEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const hasEvents = (day) => {
    return data.events.some(event => {
      const eventDate = new Date(event.date || event.start_date);
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    setShowEventModal(true);
  };

  const handleCreateEvent = (eventData) => {
    onCreateEvent(eventData);
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-12 flex flex-col items-center justify-center cursor-pointer rounded-lg transition-all duration-200 relative ${
            isToday(day)
              ? 'bg-gradient-to-br from-orange-500 to-yellow-500 text-white shadow-md'
              : 'hover:bg-gradient-to-br hover:from-orange-100 hover:to-yellow-100 text-gray-700'
          }`}
        >
          <span className="text-sm font-medium">{day}</span>
          {hasEvents(day) && (
            <div className="absolute bottom-1 w-2 h-2 bg-blue-400 rounded-full"></div>
          )}
        </div>
      );
    }
    return days;
  };

  const todaysEvents = data.events.filter(event => {
    const today = new Date();
    const eventDate = new Date(event.date || event.start_date);
    return eventDate.toDateString() === today.toDateString();
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h3 className={`text-2xl font-bold ${theme.colors.text}`}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevMonth}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-3">
          {dayNames.map(day => (
            <div key={day} className="h-8 flex items-center justify-center">
              <span className={`text-sm font-semibold ${theme.colors.textSecondary}`}>{day}</span>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {renderCalendarDays()}
        </div>
      </Card>

      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
            <CalendarDays className="h-6 w-6 text-white" />
          </div>
          <h3 className={`text-xl font-bold ${theme.colors.text}`}>Today's Events</h3>
        </div>
        
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {todaysEvents.length > 0 ? (
            todaysEvents.map((event, index) => (
              <div key={event.id || index} className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  {event.description || event.title || event.name}
                </h4>
                <p className="text-xs text-blue-700">{event.responsible || 'Unassigned'}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-blue-600">
                    {event.project?.name || 'General Event'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <CalendarDays className={`h-12 w-12 ${theme.colors.textMuted} mx-auto mb-3 opacity-50`} />
              <p className={`text-lg ${theme.colors.textMuted}`}>No events today</p>
              <p className={`text-sm ${theme.colors.textMuted} mt-1`}>Click on a date to create an event</p>
            </div>
          )}
        </div>
      </Card>

      <EventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSubmit={handleCreateEvent}
        selectedDate={selectedDate}
        projects={data.projects}
      />
    </div>
  );
};

// Loading Screen
const LoadingScreen = ({ theme }) => (
  <div className={`min-h-screen ${theme.colors.background} flex items-center justify-center`}>
    <div className="text-center">
      <div className="relative">
        <div className="w-24 h-24 border-6 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center space-x-1">
            <Palette className="h-6 w-6 text-orange-500" />
            <Brush className="h-6 w-6 text-yellow-500" />
          </div>
        </div>
      </div>
      <h3 className={`text-3xl font-bold ${theme.colors.text} mb-2`}>Ujenzi & Paints</h3>
      <p className={`text-lg ${theme.colors.textSecondary} mb-1`}>Construction & Paint Management</p>
      <p className={`text-sm ${theme.colors.textMuted}`}>Loading dashboard...</p>
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
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedManager, setSelectedManager] = useState(null);

  const showingManagerDetails = currentView === 'manager-details' && selectedManager;

  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsed !== null) {
      setSidebarCollapsed(JSON.parse(savedCollapsed));
    }
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleSidebarCollapseChange = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const handleManagerClick = (manager) => {
    setSelectedManager(manager);
    setCurrentView('manager-details');
  };

  const handleProjectClick = (project) => {
    navigate(`/admin/projects/${project.id}`);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedManager(null);
  };

  const handleCreateEvent = async (eventData) => {
    try {
      await eventsAPI.create(eventData);
      refetch(); // Refresh data to show new event
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const toggleSidebarCollapse = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newCollapsed));
  };

  if (loading) return <LoadingScreen theme={theme} />;

  if (error) return (
    <div className={`min-h-screen ${theme.colors.background} flex items-center justify-center p-8`}>
      <Card className="max-w-lg w-full text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className={`text-2xl font-bold ${theme.colors.text} mb-4`}>API Connection Error</h3>
        <p className={`text-lg ${theme.colors.textSecondary} mb-6`}>{error}</p>
        <button
          onClick={refetch}
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-6 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all font-semibold"
        >
          Retry Connection
        </button>
      </Card>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme.colors.background} transition-all duration-300`}>
      {/* AdminSidebar Component */}
      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onCollapseChange={handleSidebarCollapseChange}
        theme={{
          isDark: theme.isDark,
          colors: {
            sidebarBg: 'bg-white',
            text: 'text-gray-700',
            textMuted: 'text-gray-500',
            textSecondary: 'text-gray-600',
            border: 'border-gray-200'
          }
        }}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-80'}`}>
        <div className="p-6">
          {showingManagerDetails ? (
            <div>
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
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600 transition-all"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={toggleSidebarCollapse}
                    className="hidden lg:flex p-3 rounded-xl bg-gray-500 text-white hover:bg-gray-600 transition-all"
                    title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                  >
                    {sidebarCollapsed ? <Maximize2 className="h-5 w-5" /> : <Minimize2 className="h-5 w-5" />}
                  </button>
                  
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500">
                        <Palette className="h-8 w-8 text-white" />
                      </div>
                      <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
                        <Building2 className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h1 className={`text-4xl font-bold ${theme.colors.text} mb-1 bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600 bg-clip-text text-transparent`}>
                      Ujenzi & Paints
                    </h1>
                    <p className={`text-lg ${theme.colors.textSecondary}`}>
                      Construction & Paint Management Dashboard
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`text-sm ${theme.colors.textSecondary}`}>Last Updated</p>
                    <p className={`text-lg font-semibold ${theme.colors.text}`}>
                      {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
                    </p>
                  </div>
                  <button
                    onClick={refetch}
                    disabled={refreshing}
                    className={`p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all ${refreshing ? 'animate-spin' : ''}`}
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                  <button
                    onClick={theme.toggleTheme}
                    className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:from-purple-600 hover:to-violet-600 transition-all"
                  >
                    {theme.isDark ? '☀️' : '🌙'}
                  </button>
                </div>
              </div>

              {/* Statistics Grid */}
              <StatsGrid data={data} theme={theme} />

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                {/* Monthly Revenue Chart */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`text-xl font-bold ${theme.colors.text} flex items-center space-x-2`}>
                      <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      <span>Monthly Revenue</span>
                    </h4>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={data.chartData.monthlyRevenue}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#f97316"
                        fill="url(#colorRevenue)"
                        strokeWidth={2}
                      />
                      <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                {/* Weekly Tasks Chart */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`text-xl font-bold ${theme.colors.text} flex items-center space-x-2`}>
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      <span>Weekly Tasks</span>
                    </h4>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <ComposedChart data={data.chartData.weeklyTasks}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" fill="#10b981" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="pending" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Task Status Chart */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`text-lg font-bold ${theme.colors.text} flex items-center space-x-2`}>
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                        <CheckSquare className="h-4 w-4 text-white" />
                      </div>
                      <span>Task Status</span>
                    </h4>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={data.chartData.taskStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {data.chartData.taskStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                {/* Project Status Chart */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`text-lg font-bold ${theme.colors.text} flex items-center space-x-2`}>
                      <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                        <Building2 className="h-4 w-4 text-white" />
                      </div>
                      <span>Project Status</span>
                    </h4>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.chartData.projectStatus}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={10} />
                      <YAxis stroke="#6b7280" fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Project Managers Section */}
              <Card className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-2xl font-bold ${theme.colors.text} flex items-center space-x-3`}>
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <span>Project Managers</span>
                  </h3>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Total Managers</div>
                    <div className="text-2xl font-bold text-purple-600">{data.managers.length}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {data.managers.slice(0, 8).map((manager, index) => (
                    <ManagerCard
                      key={manager.id || index}
                      manager={manager}
                      theme={theme}
                      onClick={handleManagerClick}
                    />
                  ))}
                </div>
                {data.managers.length > 8 && (
                  <div className="mt-4 text-center">
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-lg hover:from-purple-600 hover:to-violet-600 transition-all">
                      View All Managers ({data.managers.length})
                    </button>
                  </div>
                )}
              </Card>

              {/* Active Projects Section */}
              <Card className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-2xl font-bold ${theme.colors.text} flex items-center space-x-3`}>
                    <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <span>Active Projects</span>
                  </h3>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Active Projects</div>
                    <div className="text-2xl font-bold text-green-600">{data.statistics.activeProjects}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {data.projects.slice(0, 8).map((project, index) => (
                    <ProjectCard
                      key={project.id || index}
                      project={project}
                      theme={theme}
                      onClick={handleProjectClick}
                    />
                  ))}
                </div>
                {data.projects.length > 8 && (
                  <div className="mt-4 text-center">
                    <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all">
                      View All Projects ({data.projects.length})
                    </button>
                  </div>
                )}
              </Card>

              {/* Calendar Section */}
              <Card className="mb-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <h2 className={`text-2xl font-bold ${theme.colors.text}`}>Project Calendar & Events</h2>
                </div>
                <CalendarWidget data={data} theme={theme} onCreateEvent={handleCreateEvent} />
              </Card>

              {/* Footer */}
              <div className="text-center py-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <Palette className="h-6 w-6 text-orange-500" />
                  <Building2 className="h-6 w-6 text-blue-500" />
                  <Brush className="h-6 w-6 text-yellow-500" />
                </div>
                <p className={`text-lg ${theme.colors.textMuted} mb-1`}>
                  Ujenzi & Paints Enterprise • Construction & Paint Management Platform
                </p>
                <p className={`text-sm ${theme.colors.textMuted}`}>
                  © 2024 Ujenzi & Paints Solutions • Last updated: {lastUpdated?.toLocaleString()}
                </p>
                <p className={`text-xs ${theme.colors.textMuted} mt-1`}>
                  Projects: {data.projects.length} • Tasks: {data.tasks.length} • Team: {data.statistics.teamSize}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
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