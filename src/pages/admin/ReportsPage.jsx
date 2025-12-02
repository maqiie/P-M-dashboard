import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Users, Building2, CheckSquare,
  Calendar, DollarSign, Target, Loader, AlertTriangle, Menu,
  ArrowUp, ArrowDown, Activity
} from 'lucide-react';
import { reportsAPI } from '../../services/api';
import AdminSidebar from './AdminSidebar';

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [overviewData, setOverviewData] = useState(null);
  const [projectsData, setProjectsData] = useState(null);
  const [tasksData, setTasksData] = useState(null);
  const [usersData, setUsersData] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 1;

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate, activeTab]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      switch (activeTab) {
        case 'overview':
          const overviewRes = await reportsAPI.getOverview(startDate, endDate);
          setOverviewData(overviewRes.data || overviewRes);
          break;
        case 'projects':
          const projectsRes = await reportsAPI.getProjects(startDate, endDate);
          setProjectsData(projectsRes.data || projectsRes);
          break;
        case 'tasks':
          const tasksRes = await reportsAPI.getTasks(startDate, endDate);
          setTasksData(tasksRes.data || tasksRes);
          break;
        case 'users':
          if (isAdmin) {
            const usersRes = await reportsAPI.getUsers(startDate, endDate);
            setUsersData(usersRes.data || usersRes);
          }
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center space-x-1 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  const ProgressBar = ({ label, value, max, color }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-700">{label}</span>
          <span className="font-semibold text-gray-900">{value}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
        </div>
      </div>
    );
  };

  const SimpleBarChart = ({ data, title }) => {
    if (!data || data.length === 0) return null;
    const maxValue = Math.max(...data.map(d => d.count || d.value || 0));

    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{item.month || item.label || item.name}</span>
                <span className="font-semibold text-gray-900">{item.count || item.value || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${maxValue > 0 ? ((item.count || item.value || 0) / maxValue) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const OverviewTab = () => {
    if (!overviewData) return null;
    const { projects, tasks, completion_rate } = overviewData;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Building2} title="Total Projects" value={projects?.total || 0} subtitle={`${projects?.completed || 0} completed`} color="bg-blue-500" />
          <StatCard icon={CheckSquare} title="Total Tasks" value={tasks?.total || 0} subtitle={`${tasks?.completed || 0} completed`} color="bg-green-500" />
          <StatCard icon={Target} title="Completion Rate" value={`${completion_rate || 0}%`} subtitle="Task completion" color="bg-purple-500" />
          <StatCard icon={DollarSign} title="Total Budget" value={formatCurrency(projects?.total_budget)} subtitle="All projects" color="bg-orange-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Projects by Status</h3>
            <div className="space-y-3">
              <ProgressBar label="Completed" value={projects?.completed || 0} max={projects?.total || 1} color="bg-green-500" />
              <ProgressBar label="In Progress" value={projects?.in_progress || 0} max={projects?.total || 1} color="bg-blue-500" />
              <ProgressBar label="Planning" value={projects?.planning || 0} max={projects?.total || 1} color="bg-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tasks by Status</h3>
            <div className="space-y-3">
              <ProgressBar label="Completed" value={tasks?.completed || 0} max={tasks?.total || 1} color="bg-green-500" />
              <ProgressBar label="In Progress" value={tasks?.in_progress || 0} max={tasks?.total || 1} color="bg-blue-500" />
              <ProgressBar label="Pending" value={tasks?.pending || 0} max={tasks?.total || 1} color="bg-orange-500" />
              <ProgressBar label="Overdue" value={tasks?.overdue || 0} max={tasks?.total || 1} color="bg-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Average Project Progress</h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${projects?.avg_progress || 0}%` }}
                />
              </div>
            </div>
            <span className="text-2xl font-bold text-gray-900">{projects?.avg_progress || 0}%</span>
          </div>
        </div>
      </div>
    );
  };

  const ProjectsTab = () => {
    if (!projectsData) return null;
    const { summary, by_status, by_month, top_projects } = projectsData;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Building2} title="Total Projects" value={summary?.total || 0} color="bg-blue-500" />
          <StatCard icon={CheckSquare} title="Completed" value={summary?.completed || 0} color="bg-green-500" />
          <StatCard icon={Activity} title="In Progress" value={summary?.in_progress || 0} color="bg-orange-500" />
          <StatCard icon={DollarSign} title="Total Budget" value={formatCurrency(summary?.total_budget)} color="bg-purple-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Projects by Status</h3>
            <div className="space-y-3">
              {Object.entries(by_status || {}).map(([status, count]) => (
                <ProgressBar
                  key={status}
                  label={status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)}
                  value={count}
                  max={summary?.total || 1}
                  color={status === 'completed' ? 'bg-green-500' : status === 'active' || status === 'in_progress' ? 'bg-blue-500' : 'bg-orange-500'}
                />
              ))}
            </div>
          </div>

          <SimpleBarChart data={by_month} title="Projects Created by Month" />
        </div>

        {top_projects && top_projects.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Projects by Budget</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Project</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Progress</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {top_projects.map((project, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 text-sm text-gray-900">{project.title}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          project.status === 'completed' ? 'bg-green-100 text-green-700' :
                          project.status === 'active' || project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${project.progress || 0}%` }} />
                          </div>
                          <span className="text-xs text-gray-600">{project.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(project.budget)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const TasksTab = () => {
    if (!tasksData) return null;
    const { summary, by_status, by_priority, completion_rate } = tasksData;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={CheckSquare} title="Total Tasks" value={summary?.total || 0} color="bg-blue-500" />
          <StatCard icon={CheckSquare} title="Completed" value={summary?.completed || 0} color="bg-green-500" />
          <StatCard icon={Activity} title="In Progress" value={summary?.in_progress || 0} color="bg-orange-500" />
          <StatCard icon={AlertTriangle} title="Overdue" value={summary?.overdue || 0} color="bg-red-500" />
          <StatCard icon={Target} title="Completion Rate" value={`${completion_rate || 0}%`} color="bg-purple-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tasks by Status</h3>
            <div className="space-y-3">
              {Object.entries(by_status || {}).map(([status, count]) => (
                <ProgressBar
                  key={status}
                  label={status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)}
                  value={count}
                  max={summary?.total || 1}
                  color={
                    status === 'completed' ? 'bg-green-500' :
                    status === 'in_progress' ? 'bg-blue-500' :
                    status === 'pending' ? 'bg-orange-500' : 'bg-gray-500'
                  }
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tasks by Priority</h3>
            <div className="space-y-3">
              {Object.entries(by_priority || {}).map(([priority, count]) => (
                <ProgressBar
                  key={priority}
                  label={priority.charAt(0).toUpperCase() + priority.slice(1)}
                  value={count}
                  max={summary?.total || 1}
                  color={
                    priority === 'urgent' || priority === 'high' ? 'bg-red-500' :
                    priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const UsersTab = () => {
    if (!usersData || !isAdmin) return null;
    const { users, total_users } = usersData;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} title="Total Users" value={total_users || 0} color="bg-blue-500" />
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">User Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Projects</th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Tasks Created</th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Tasks Completed</th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {(users || []).map((user, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                          {(user.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center text-sm text-gray-900">{user.projects_managed || 0}</td>
                    <td className="py-3 px-2 text-center text-sm text-gray-900">{user.tasks_created || 0}</td>
                    <td className="py-3 px-2 text-center text-sm text-gray-900">{user.tasks_completed || 0}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.completion_rate >= 80 ? 'bg-green-100 text-green-700' :
                        user.completion_rate >= 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {user.completion_rate || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'projects', label: 'Projects', icon: Building2 },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    ...(isAdmin ? [{ id: 'users', label: 'Users', icon: Users }] : [])
  ];

  if (loading && !overviewData && !projectsData && !tasksData && !usersData) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-xl text-gray-600">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200">
                <Menu className="h-5 w-5 text-slate-700" />
              </button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Reports</h1>
                <p className="text-sm text-gray-600">Analytics and insights</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600">Date Range:</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'projects' && <ProjectsTab />}
              {activeTab === 'tasks' && <TasksTab />}
              {activeTab === 'users' && <UsersTab />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;