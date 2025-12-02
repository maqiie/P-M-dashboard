import React, { useState, useEffect } from 'react';
import {
  History, Building2, CheckSquare, Calendar, Clock,
  Trophy, DollarSign, Users, Loader, AlertTriangle,
  Menu, Search, TrendingUp, Award, FileText,
  Target, BarChart, Filter, Download, Share2,
  ChevronRight, Star, CircleDollarSign, Clock3,
  Briefcase, Handshake, Wallet, Percent
} from 'lucide-react';
import { historyAPI } from '../../services/api';
import AdminSidebar from './AdminSidebar';

const HistoryPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const [historyData, setHistoryData] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [tendersData, setTendersData] = useState([]);

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchHistory();
  }, [activeTab, startDate, endDate]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'overview') {
        const response = await historyAPI.getAll();
        setHistoryData(response.data || response);
      } else if (activeTab === 'timeline') {
        const response = await historyAPI.getTimeline(startDate, endDate);
        setTimelineData(response.data?.timeline || response.timeline || []);
      } else if (activeTab === 'tenders') {
        // Fetch tenders data
        const response = await historyAPI.getTenders(startDate, endDate);
        setTendersData(response.data?.tenders || response.tenders || []);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load history data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCurrencyTZS = (amount) => {
    if (!amount || amount === 0) return 'TZS 0';
    const formatter = new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return formatter.format(amount);
  };

  const getTimelineIcon = (type) => {
    switch (type) {
      case 'project_completed': return <Building2 className="h-5 w-5 text-white" />;
      case 'task_completed': return <CheckSquare className="h-5 w-5 text-white" />;
      case 'meeting_completed': return <Users className="h-5 w-5 text-white" />;
      case 'tender_awarded': return <Award className="h-5 w-5 text-white" />;
      case 'tender_submitted': return <FileText className="h-5 w-5 text-white" />;
      default: return <Clock className="h-5 w-5 text-white" />;
    }
  };

  const getTimelineColor = (type) => {
    switch (type) {
      case 'project_completed': return 'bg-gradient-to-br from-blue-500 to-cyan-400';
      case 'task_completed': return 'bg-gradient-to-br from-emerald-500 to-green-400';
      case 'meeting_completed': return 'bg-gradient-to-br from-purple-500 to-pink-400';
      case 'tender_awarded': return 'bg-gradient-to-br from-amber-500 to-orange-400';
      case 'tender_submitted': return 'bg-gradient-to-br from-indigo-500 to-blue-400';
      default: return 'bg-gradient-to-br from-gray-500 to-gray-400';
    }
  };

  const getTenderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'awarded': return 'bg-gradient-to-r from-emerald-500 to-green-400 text-white';
      case 'submitted': return 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white';
      case 'pending': return 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white';
      case 'lost': return 'bg-gradient-to-r from-rose-500 to-pink-400 text-white';
      case 'under_review': return 'bg-gradient-to-r from-indigo-500 to-purple-400 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-400 text-white';
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, gradient }) => (
    <div className="group relative overflow-hidden bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
      <div className="relative">
        <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center mb-4`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600 mt-1">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
      </div>
    </div>
  );

  const OverviewTab = () => {
    if (!historyData) return null;
    const { completed_projects = [], completed_tasks = [], milestones = {}, tenders = [] } = historyData;
    
    const completedTenders = tenders?.filter(t => t.status === 'awarded') || [];
    const totalTenderValue = completedTenders.reduce((sum, tender) => sum + (tender.value || 0), 0);
    const winRate = tenders?.length > 0 ? Math.round((completedTenders.length / tenders.length) * 100) : 0;

    return (
      <div className="space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={Building2} 
            title="Projects Completed" 
            value={milestones?.total_projects_completed || 0} 
            color="bg-gradient-to-r from-blue-500 to-cyan-400"
            gradient="bg-gradient-to-r from-blue-500 to-cyan-400"
          />
          <StatCard 
            icon={CheckSquare} 
            title="Tasks Completed" 
            value={milestones?.total_tasks_completed || 0} 
            subtitle={`${milestones?.tasks_completion_rate || 0}% completion rate`}
            color="bg-gradient-to-r from-emerald-500 to-green-400"
            gradient="bg-gradient-to-r from-emerald-500 to-green-400"
          />
          <StatCard 
            icon={CircleDollarSign} 
            title="Budget Managed" 
            value={formatCurrencyTZS(milestones?.total_budget_managed || 0)} 
            color="bg-gradient-to-r from-purple-500 to-pink-400"
            gradient="bg-gradient-to-r from-purple-500 to-pink-400"
          />
          <StatCard 
            icon={Briefcase} 
            title="Tenders Won" 
            value={completedTenders.length} 
            subtitle={`${formatCurrencyTZS(totalTenderValue)} value`}
            color="bg-gradient-to-r from-amber-500 to-orange-400"
            gradient="bg-gradient-to-r from-amber-500 to-orange-400"
          />
        </div>

        {/* Tender Performance */}
        {tenders && tenders.length > 0 && (
          <div className="bg-gradient-to-br from-white to-amber-50 backdrop-blur-sm border border-white/30 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Award className="h-6 w-6 text-amber-500 mr-3" />
                    Tender Performance
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Overview of tender submissions and awards</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{winRate}%</p>
                    <p className="text-xs text-gray-500">Win Rate</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-500" />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tender Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tenders.slice(0, 5).map((tender, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${tender.status === 'awarded' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                          <div>
                            <p className="font-medium text-gray-900">{tender.name || tender.title}</p>
                            <p className="text-xs text-gray-500">Ref: {tender.reference || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-gray-900">{tender.client}</p>
                        <p className="text-xs text-gray-500">{tender.location || 'Tanzania'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-semibold text-gray-900">{formatCurrencyTZS(tender.value)}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getTenderStatusColor(tender.status)}`}>
                          {tender.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(tender.date || tender.submission_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {tenders.length > 5 && (
              <div className="p-4 border-t border-gray-100 text-center">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View all tenders <ChevronRight className="h-4 w-4 inline ml-1" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Completed Projects */}
        <div className="bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm border border-white/30 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Trophy className="h-6 w-6 text-blue-500 mr-3" />
                  Recently Completed Projects
                </h3>
                <p className="text-sm text-gray-600 mt-1">Successfully delivered projects</p>
              </div>
              <span className="text-sm text-gray-500">
                Total: {formatCurrencyTZS(completed_projects.reduce((sum, p) => sum + (p.budget || 0), 0))}
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {completed_projects.length > 0 ? (
              completed_projects.map((project, index) => (
                <div key={index} className="group p-6 hover:bg-blue-50/50 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{project.title}</h4>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                            {project.location && (
                              <span className="flex items-center">
                                <Building2 className="h-3 w-3 mr-1" />
                                {project.location}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Completed: {formatDate(project.completed_at)}
                            </span>
                            <span className="flex items-center">
                              <CheckSquare className="h-3 w-3 mr-1" />
                              {project.tasks_completed || 0}/{project.tasks_count || 0} tasks
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-6">
                      <p className="text-xl font-bold text-gray-900">{formatCurrencyTZS(project.budget)}</p>
                      <div className="mt-2 w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-green-400 h-full w-full rounded-full"></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">100% completed</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-10 w-10 text-gray-400" />
                </div>
                <h4 className="text-gray-900 font-semibold mb-2">No completed projects yet</h4>
                <p className="text-gray-600 text-sm">Start your first project to see history here</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-white to-emerald-50 backdrop-blur-sm border border-white/30 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <CheckSquare className="h-6 w-6 text-emerald-500 mr-3" />
                Recently Completed Tasks
              </h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {completed_tasks.length > 0 ? (
                completed_tasks.slice(0, 8).map((task, index) => (
                  <div key={index} className="p-4 hover:bg-emerald-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-green-400 flex items-center justify-center">
                          <CheckSquare className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            {task.project && (
                              <span className="text-xs text-gray-500 flex items-center">
                                <Building2 className="h-2 w-2 mr-1" />
                                {task.project.title}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${
                          task.priority === 'urgent' || task.priority === 'high' ? 'bg-gradient-to-r from-rose-500 to-pink-400 text-white' :
                          task.priority === 'medium' ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white' :
                          'bg-gradient-to-r from-emerald-500 to-green-400 text-white'
                        }`}>
                          {task.priority}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(task.completed_at)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No completed tasks yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-gradient-to-br from-white to-purple-50 backdrop-blur-sm border border-white/30 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <BarChart className="h-6 w-6 text-purple-500 mr-3" />
                Performance Summary
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Project Completion Rate</span>
                  <span className="text-sm font-semibold text-gray-900">{milestones?.project_completion_rate || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full" style={{ width: `${milestones?.project_completion_rate || 0}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">On-time Delivery</span>
                  <span className="text-sm font-semibold text-gray-900">{milestones?.on_time_delivery || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-400 h-2 rounded-full" style={{ width: `${milestones?.on_time_delivery || 0}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Client Satisfaction</span>
                  <span className="text-sm font-semibold text-gray-900">{milestones?.client_satisfaction || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-400 h-2 rounded-full" style={{ width: `${milestones?.client_satisfaction || 0}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Budget Utilization</span>
                  <span className="text-sm font-semibold text-gray-900">{milestones?.budget_utilization || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-400 h-2 rounded-full" style={{ width: `${milestones?.budget_utilization || 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TimelineTab = () => {
    const filteredTimeline = timelineData.filter(item =>
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-8">
        {/* Search and Filter */}
        <div className="bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search timeline by title, description, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-2.5 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-2.5 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              <button className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                <Filter className="h-4 w-4 inline mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm border border-white/30 rounded-2xl shadow-sm p-6">
          {filteredTimeline.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500" />

              <div className="space-y-8">
                {filteredTimeline.map((item, index) => (
                  <div key={index} className="relative flex items-start space-x-6 group">
                    {/* Timeline dot */}
                    <div className={`relative z-10 w-16 h-16 rounded-2xl ${getTimelineColor(item.type)} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {getTimelineIcon(item.type)}
                    </div>

                    {/* Content card */}
                    <div className="flex-1 min-w-0">
                      <div className="bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group-hover:border-blue-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-bold text-gray-900">{item.title}</h4>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getTenderStatusColor(item.type === 'tender_awarded' ? 'awarded' : 'submitted')}`}>
                                {item.type?.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-4">{item.description}</p>
                            
                            {item.data && (
                              <div className="flex flex-wrap items-center gap-3 text-sm">
                                {item.data.budget && (
                                  <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-lg font-medium">
                                    <Wallet className="h-3 w-3 mr-1.5" />
                                    {formatCurrencyTZS(item.data.budget)}
                                  </span>
                                )}
                                {item.data.project && (
                                  <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-lg font-medium">
                                    <Building2 className="h-3 w-3 mr-1.5" />
                                    {item.data.project}
                                  </span>
                                )}
                                {item.data.user && (
                                  <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-lg font-medium">
                                    <Users className="h-3 w-3 mr-1.5" />
                                    {item.data.user}
                                  </span>
                                )}
                                {item.data.participants && (
                                  <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-lg font-medium">
                                    <Users className="h-3 w-3 mr-1.5" />
                                    {item.data.participants} participants
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="ml-4 text-right">
                            <span className="inline-flex items-center text-sm text-gray-500">
                              <Clock3 className="h-3 w-3 mr-1.5" />
                              {formatDateTime(item.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-gray-500/10 to-gray-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <History className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No activity found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'Try adjusting your search criteria' : 'No completed items in this date range'}
              </p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setStartDate(new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0]);
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Show Last 6 Months
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const TendersTab = () => {
    const filteredTenders = tendersData.filter(tender =>
      (tender.name || tender.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tender.client || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tender.reference || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalValue = filteredTenders.reduce((sum, tender) => sum + (tender.value || 0), 0);
    const awardedTenders = filteredTenders.filter(t => t.status === 'awarded');
    const winRate = filteredTenders.length > 0 ? Math.round((awardedTenders.length / filteredTenders.length) * 100) : 0;

    return (
      <div className="space-y-8">
        {/* Tender Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={Briefcase} 
            title="Total Tenders" 
            value={filteredTenders.length} 
            color="bg-gradient-to-r from-blue-500 to-cyan-400"
            gradient="bg-gradient-to-r from-blue-500 to-cyan-400"
          />
          <StatCard 
            icon={Award} 
            title="Awarded" 
            value={awardedTenders.length} 
            subtitle={`${winRate}% win rate`}
            color="bg-gradient-to-r from-emerald-500 to-green-400"
            gradient="bg-gradient-to-r from-emerald-500 to-green-400"
          />
          <StatCard 
            icon={CircleDollarSign} 
            title="Total Value" 
            value={formatCurrencyTZS(totalValue)} 
            color="bg-gradient-to-r from-purple-500 to-pink-400"
            gradient="bg-gradient-to-r from-purple-500 to-pink-400"
          />
          <StatCard 
            icon={TrendingUp} 
            title="Avg. Value" 
            value={formatCurrencyTZS(filteredTenders.length > 0 ? totalValue / filteredTenders.length : 0)} 
            subtitle="Per tender"
            color="bg-gradient-to-r from-amber-500 to-orange-400"
            gradient="bg-gradient-to-r from-amber-500 to-orange-400"
          />
        </div>

        {/* Search and Filter */}
        <div className="bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tenders by name, client, or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-2.5 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-2.5 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              <button className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                <Download className="h-4 w-4 inline mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Tenders Table */}
        <div className="bg-gradient-to-br from-white to-amber-50 backdrop-blur-sm border border-white/30 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Handshake className="h-6 w-6 text-amber-500 mr-3" />
                  Tender History
                </h3>
                <p className="text-sm text-gray-600 mt-1">All tender submissions and awards</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-900">{winRate}% win rate</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-400 h-2 rounded-full" style={{ width: `${winRate}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {filteredTenders.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-amber-50/50 to-orange-50/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tender Details</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Dates</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTenders.map((tender, index) => (
                      <tr key={index} className="hover:bg-amber-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-xl ${getTenderStatusColor(tender.status)} flex items-center justify-center mr-3`}>
                              {tender.status === 'awarded' ? <Award className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{tender.name || tender.title}</p>
                              <p className="text-xs text-gray-500">Ref: {tender.reference || 'N/A'}</p>
                              <div className="flex items-center mt-1">
                                <Star className="h-3 w-3 text-amber-400 mr-1" />
                                <span className="text-xs text-gray-600">{tender.category || 'Construction'}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{tender.client}</p>
                          <p className="text-xs text-gray-500">{tender.location || 'Dar es Salaam, TZ'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 text-lg">{formatCurrencyTZS(tender.value)}</p>
                          {tender.profit_margin && (
                            <p className="text-xs text-emerald-600 font-medium">
                              <Percent className="h-2 w-2 inline mr-1" />
                              {tender.profit_margin}% margin
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold ${getTenderStatusColor(tender.status)}`}>
                            {tender.status?.replace('_', ' ').toUpperCase()}
                          </span>
                          {tender.award_date && tender.status === 'awarded' && (
                            <p className="text-xs text-emerald-600 mt-1">Awarded on {formatDate(tender.award_date)}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-gray-900">Submitted: {formatDate(tender.submission_date)}</p>
                            <p className="text-gray-500 text-xs">Deadline: {formatDate(tender.deadline)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors" title="View Details">
                              <ChevronRight className="h-4 w-4" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors" title="Download Documents">
                              <Download className="h-4 w-4" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors" title="Share">
                              <Share2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {filteredTenders.length} tenders • Total value: <span className="font-semibold text-gray-900">{formatCurrencyTZS(totalValue)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
                      Previous
                    </button>
                    <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-amber-500/10 to-orange-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Handshake className="h-12 w-12 text-amber-400" />
              </div>
              <h4 className="text-gray-900 font-bold text-lg mb-2">No tenders found</h4>
              <p className="text-gray-600 mb-6">Try adjusting your search or date range</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Trophy },
    { id: 'timeline', label: 'Timeline', icon: History },
    { id: 'tenders', label: 'Tenders', icon: Briefcase }
  ];

  if (loading && !historyData && timelineData.length === 0) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50">
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse opacity-20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader className="h-12 w-12 text-amber-600 animate-spin" />
            </div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Loading historical data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 overflow-hidden">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-red-600/20"></div>
          <div className="relative backdrop-blur-sm bg-white/80 border-b border-white/30">
            <div className="px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-xl bg-white/50 backdrop-blur-sm border border-white/30 hover:bg-white/70 transition-all">
                    <Menu className="w-5 h-5 text-gray-700" />
                  </button>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      History & Tenders
                    </h1>
                    <p className="text-sm text-gray-600">Track completed work and tender performance</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <Download className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <Share2 className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-3">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative overflow-hidden flex items-center space-x-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200'
                }`}
              >
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                )}
                <tab.icon className="h-5 w-5 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-8 pb-8">
          {loading && (historyData || timelineData.length > 0 || tendersData.length > 0) ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <Loader className="h-8 w-8 text-amber-600 animate-spin" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-2">{error}</h3>
              <button 
                onClick={fetchHistory} 
                className="mt-6 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'timeline' && <TimelineTab />}
              {activeTab === 'tenders' && <TendersTab />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;