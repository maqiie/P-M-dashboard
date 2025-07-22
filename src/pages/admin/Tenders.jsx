import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Search, Filter, Calendar, DollarSign, Building2,
  Clock, CheckCircle, AlertTriangle, Eye, Edit, Download, Send,
  Star, Target, TrendingUp, Award, Briefcase, MapPin, Users,
  MoreVertical, Flag, Upload, Paperclip, MessageSquare, Loader
} from 'lucide-react';

// Import your API functions
import { tendersAPI } from '../../services/api';

const TendersPage = ({ sidebarCollapsed = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statusOptions = [
    { value: 'all', label: 'All Tenders' },
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' },
    { value: 'converted', label: 'Converted' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'educational', label: 'Educational' },
    { value: 'renovation', label: 'Renovation' }
  ];

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        setLoading(true);
        const response = await tendersAPI.getAll();
        console.log('API response:', response);
  
        // Adjust this depending on actual response structure
        const tendersData = response.tenders || response.data || response || [];
        setTenders(Array.isArray(tendersData) ? tendersData : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching tenders:', err);
        setError('Failed to load tenders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchTenders();
  }, []);
  

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'active': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'submitted': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'won': return 'bg-green-100 text-green-700 border-green-200';
      case 'lost': return 'bg-red-100 text-red-700 border-red-200';
      case 'converted': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'rejected': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <Edit className="h-5 w-5" />;
      case 'active': return <Clock className="h-5 w-5" />;
      case 'submitted': return <Send className="h-5 w-5" />;
      case 'won': return <Award className="h-5 w-5" />;
      case 'lost': return <AlertTriangle className="h-5 w-5" />;
      case 'converted': return <CheckCircle className="h-5 w-5" />;
      case 'rejected': return <AlertTriangle className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'residential': return <Building2 className="h-5 w-5" />;
      case 'commercial': return <Briefcase className="h-5 w-5" />;
      case 'industrial': return <Target className="h-5 w-5" />;
      case 'infrastructure': return <Flag className="h-5 w-5" />;
      case 'healthcare': return <Star className="h-5 w-5" />;
      case 'educational': return <Award className="h-5 w-5" />;
      case 'renovation': return <TrendingUp className="h-5 w-5" />;
      default: return <Building2 className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredTenders = tenders
    .filter(tender => {
      const matchesSearch = (tender.title || tender.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (tender.client || tender.client_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (tender.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || tender.status === statusFilter;
      const matchesType = typeFilter === 'all' || tender.type === typeFilter || tender.project_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'deadline': 
          const deadlineA = a.deadline || a.submission_deadline || a.due_date;
          const deadlineB = b.deadline || b.submission_deadline || b.due_date;
          if (!deadlineA && !deadlineB) return 0;
          if (!deadlineA) return 1;
          if (!deadlineB) return -1;
          return new Date(deadlineA) - new Date(deadlineB);
        case 'budget': 
          const budgetA = a.budget || a.budget_estimate || a.estimated_value || 0;
          const budgetB = b.budget || b.budget_estimate || b.estimated_value || 0;
          return budgetB - budgetA;
        case 'probability': 
          const probA = a.win_probability || a.probability || 0;
          const probB = b.win_probability || b.probability || 0;
          return probB - probA;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const priorityA = priorityOrder[a.priority] || 0;
          const priorityB = priorityOrder[b.priority] || 0;
          return priorityB - priorityA;
        default: 
          const titleA = a.title || a.name || '';
          const titleB = b.title || b.name || '';
          return titleA.localeCompare(titleB);
      }
    });

  const tenderStats = {
    total: tenders.length,
    active: tenders.filter(t => t.status === 'active').length,
    submitted: tenders.filter(t => t.status === 'submitted').length,
    won: tenders.filter(t => t.status === 'won').length,
    lost: tenders.filter(t => t.status === 'lost').length,
    draft: tenders.filter(t => t.status === 'draft').length,
    converted: tenders.filter(t => t.status === 'converted').length,
    totalValue: tenders.reduce((sum, t) => sum + (t.budget || t.budget_estimate || t.estimated_value || 0), 0),
    winRate: (() => {
      const completedTenders = tenders.filter(t => t.status === 'won' || t.status === 'lost');
      const wonTenders = tenders.filter(t => t.status === 'won');
      return completedTenders.length > 0 ? Math.round((wonTenders.length / completedTenders.length) * 100) : 0;
    })()
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-2xl text-gray-600">Loading tenders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-2xl text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Main Content Area - adjusted for dynamic sidebar */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          sidebarCollapsed 
            ? 'lg:ml-16' // Collapsed sidebar (64px)
            : 'lg:ml-80' // Expanded sidebar (320px)
        }`}
      >
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8 lg:mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-2 lg:mb-4 tracking-tight">
                  Tenders
                </h1>
                <p className="text-lg lg:text-2xl text-gray-600 leading-relaxed">
                  Manage bid opportunities and track tender submissions across all projects
                </p>
              </div>
              
              <button className="flex items-center space-x-3 px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg lg:text-xl font-semibold rounded-2xl hover:shadow-xl transition-all duration-300 whitespace-nowrap">
                <Plus className="h-5 w-5 lg:h-6 lg:w-6" />
                <span>New Tender</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 lg:gap-6 mb-8 lg:mb-12">
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <FileText className="h-6 w-6 lg:h-10 lg:w-10 text-blue-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">{tenderStats.total}</p>
              <p className="text-sm lg:text-lg text-gray-600">Total</p>
            </div>
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <Clock className="h-6 w-6 lg:h-10 lg:w-10 text-blue-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">{tenderStats.active}</p>
              <p className="text-sm lg:text-lg text-gray-600">Active</p>
            </div>
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <Send className="h-6 w-6 lg:h-10 lg:w-10 text-yellow-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">{tenderStats.submitted}</p>
              <p className="text-sm lg:text-lg text-gray-600">Submitted</p>
            </div>
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <Award className="h-6 w-6 lg:h-10 lg:w-10 text-green-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">{tenderStats.won}</p>
              <p className="text-sm lg:text-lg text-gray-600">Won</p>
            </div>
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <AlertTriangle className="h-6 w-6 lg:h-10 lg:w-10 text-red-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">{tenderStats.lost}</p>
              <p className="text-sm lg:text-lg text-gray-600">Lost</p>
            </div>
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <DollarSign className="h-6 w-6 lg:h-10 lg:w-10 text-purple-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">${(tenderStats.totalValue / 1000000).toFixed(0)}M</p>
              <p className="text-sm lg:text-lg text-gray-600">Total Value</p>
            </div>
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <TrendingUp className="h-6 w-6 lg:h-10 lg:w-10 text-orange-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">{tenderStats.winRate}%</p>
              <p className="text-sm lg:text-lg text-gray-600">Win Rate</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-xl border border-gray-100 mb-8 lg:mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 lg:h-6 lg:w-6 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tenders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 lg:pl-12 pr-4 py-3 lg:py-4 text-base lg:text-xl border-2 border-gray-200 rounded-xl lg:rounded-2xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-base lg:text-xl px-3 lg:px-4 py-3 lg:py-4 border-2 border-gray-200 rounded-xl lg:rounded-2xl focus:border-blue-500 focus:outline-none"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-base lg:text-xl px-3 lg:px-4 py-3 lg:py-4 border-2 border-gray-200 rounded-xl lg:rounded-2xl focus:border-blue-500 focus:outline-none"
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-base lg:text-xl px-3 lg:px-4 py-3 lg:py-4 border-2 border-gray-200 rounded-xl lg:rounded-2xl focus:border-blue-500 focus:outline-none"
              >
                <option value="deadline">Sort by Deadline</option>
                <option value="budget">Sort by Budget</option>
                <option value="probability">Sort by Win Probability</option>
                <option value="priority">Sort by Priority</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
          </div>

          {/* Tenders List */}
          <div className="space-y-4 lg:space-y-6">
            {filteredTenders.map((tender) => {
              const deadline = tender.deadline || tender.submission_deadline || tender.due_date;
              const daysUntilDeadline = getDaysUntilDeadline(deadline);
              const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 7 && tender.status !== 'won' && tender.status !== 'lost';
              const budget = tender.budget || tender.budget_estimate || tender.estimated_value || 0;
              const ourBid = tender.our_bid || tender.bid_amount || 0;
              const winProbability = tender.win_probability || tender.probability || 0;
              
              return (
                <div key={tender.id} className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 lg:gap-6">
                    {/* Main Tender Info */}
                    <div className="flex-1 space-y-3 lg:space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 lg:space-x-4 mb-2 lg:mb-3">
                            <div className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full ${getPriorityColor(tender.priority)}`} />
                            <span className={`px-3 lg:px-4 py-1 lg:py-2 rounded-full text-sm lg:text-lg font-semibold border ${getStatusColor(tender.status)}`}>
                              <div className="flex items-center space-x-1 lg:space-x-2">
                                {getStatusIcon(tender.status)}
                                <span className="capitalize">{tender.status}</span>
                              </div>
                            </span>
                            {isUrgent && (
                              <span className="px-2 lg:px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs lg:text-sm font-semibold animate-pulse">
                                URGENT - {daysUntilDeadline} days left
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-xl lg:text-3xl font-bold text-gray-900 mb-1 lg:mb-2">{tender.title || tender.name}</h3>
                          <p className="text-base lg:text-xl text-gray-600 mb-2 lg:mb-4">{tender.description || 'No description available'}</p>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-sm lg:text-lg text-gray-600">
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(tender.type || tender.project_type)}
                              <span className="capitalize">{tender.type || tender.project_type || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 lg:h-5 lg:w-5" />
                              <span>{tender.location || 'Location not specified'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
                              <span>{tender.duration || tender.project_duration || 'Duration TBD'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <button className="p-2 lg:p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
                          <MoreVertical className="h-5 w-5 lg:h-6 lg:w-6" />
                        </button>
                      </div>

                      {/* Progress/Win Probability Bar */}
                      {winProbability > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm lg:text-lg font-semibold text-gray-700">Win Probability</span>
                            <span className="text-sm lg:text-lg font-bold text-gray-900">{winProbability}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
                            <div 
                              className={`h-2 lg:h-3 rounded-full transition-all duration-1000 ${
                                winProbability >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                                winProbability >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                                'bg-gradient-to-r from-red-500 to-red-600'
                              }`}
                              style={{ width: `${winProbability}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Tender Details Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 pt-3 lg:pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2 lg:space-x-3">
                          <DollarSign className="h-4 w-4 lg:h-5 lg:w-5 text-green-500" />
                          <div>
                            <p className="text-xs lg:text-sm text-gray-500">Budget</p>
                            <p className="text-sm lg:text-lg font-semibold text-gray-900">
                              {budget > 0 ? `$${(budget / 1000000).toFixed(1)}M` : 'TBD'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 lg:space-x-3">
                          <Target className="h-4 w-4 lg:h-5 lg:w-5 text-blue-500" />
                          <div>
                            <p className="text-xs lg:text-sm text-gray-500">Our Bid</p>
                            <p className="text-sm lg:text-lg font-semibold text-gray-900">
                              {ourBid > 0 ? `$${(ourBid / 1000000).toFixed(1)}M` : 'TBD'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 lg:space-x-3">
                          <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-red-500" />
                          <div>
                            <p className="text-xs lg:text-sm text-gray-500">Deadline</p>
                            <p className={`text-sm lg:text-lg font-semibold ${isUrgent ? 'text-red-600' : 'text-gray-900'}`}>
                              {deadline ? new Date(deadline).toLocaleDateString() : 'TBD'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 lg:space-x-3">
                          <Users className="h-4 w-4 lg:h-5 lg:w-5 text-purple-500" />
                          <div>
                            <p className="text-xs lg:text-sm text-gray-500">Competitors</p>
                            <p className="text-sm lg:text-lg font-semibold text-gray-900">{tender.competitors || tender.competitor_count || 'Unknown'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Client & Manager */}
                      <div className="border-t border-gray-100 pt-3 lg:pt-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6">
                          <div>
                            <p className="text-sm lg:text-lg font-semibold text-gray-700 mb-1">Client</p>
                            <p className="text-base lg:text-xl text-gray-900">{tender.client || tender.client_name || 'Client not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm lg:text-lg font-semibold text-gray-700 mb-1">Project Manager</p>
                            <p className="text-base lg:text-xl text-gray-900">{tender.project_manager || tender.manager_name || 'Not assigned'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Requirements */}
                      {tender.requirements && tender.requirements.length > 0 && (
                        <div className="border-t border-gray-100 pt-3 lg:pt-4">
                          <h4 className="text-sm lg:text-lg font-semibold text-gray-900 mb-2 lg:mb-3">Key Requirements</h4>
                          <div className="flex flex-wrap gap-1 lg:gap-2">
                            {tender.requirements.map((req, index) => (
                              <span key={index} className="px-2 lg:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs lg:text-sm font-medium">
                                {req}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions Sidebar */}
                    <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-3 shrink-0">
                      <button className="flex items-center space-x-1 lg:space-x-2 px-3 lg:px-4 py-2 lg:py-3 bg-blue-50 text-blue-600 rounded-lg lg:rounded-xl hover:bg-blue-100 transition-all">
                        <Eye className="h-4 w-4 lg:h-5 lg:w-5" />
                        <span className="text-sm lg:text-base font-semibold">View</span>
                      </button>
                      
                      <button className="flex items-center space-x-1 lg:space-x-2 px-3 lg:px-4 py-2 lg:py-3 bg-green-50 text-green-600 rounded-lg lg:rounded-xl hover:bg-green-100 transition-all">
                        <Edit className="h-4 w-4 lg:h-5 lg:w-5" />
                        <span className="text-sm lg:text-base font-semibold">Edit</span>
                      </button>
                      
                      <button className="flex items-center space-x-1 lg:space-x-2 px-3 lg:px-4 py-2 lg:py-3 bg-purple-50 text-purple-600 rounded-lg lg:rounded-xl hover:bg-purple-100 transition-all">
                        <Download className="h-4 w-4 lg:h-5 lg:w-5" />
                        <span className="text-sm lg:text-base font-semibold">Export</span>
                      </button>
                      
                      <div className="flex items-center space-x-2 lg:space-x-4 px-3 lg:px-4 py-2 lg:py-3 bg-gray-50 rounded-lg lg:rounded-xl">
                        <div className="flex items-center space-x-1 lg:space-x-2 text-gray-600">
                          <Paperclip className="h-4 w-4 lg:h-5 lg:w-5" />
                          <span className="text-xs lg:text-sm font-medium">{tender.attachments || tender.attachment_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1 lg:space-x-2 text-gray-600">
                          <MessageSquare className="h-4 w-4 lg:h-5 lg:w-5" />
                          <span className="text-xs lg:text-sm font-medium">{tender.notes || tender.comment_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredTenders.length === 0 && !loading && (
            <div className="text-center py-12 lg:py-16">
              <FileText className="h-16 w-16 lg:h-24 lg:w-24 text-gray-300 mx-auto mb-4 lg:mb-6" />
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 lg:mb-4">No tenders found</h3>
              <p className="text-lg lg:text-xl text-gray-600 mb-6 lg:mb-8">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? "Try adjusting your search or filter criteria" 
                  : "Get started by creating your first tender"
                }
              </p>
              <button className="px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg lg:text-xl font-semibold rounded-xl lg:rounded-2xl hover:shadow-xl transition-all duration-300">
                Create New Tender
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TendersPage;