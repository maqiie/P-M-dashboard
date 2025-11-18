import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Search, Filter, Calendar, DollarSign, Building2,
  Clock, CheckCircle, AlertTriangle, Eye, Edit, Download, Send,
  Star, Target, TrendingUp, Award, Briefcase, MapPin, Users,
  MoreVertical, Flag, Upload, Paperclip, MessageSquare, Loader,
  ChevronDown, ChevronUp, RefreshCw, ArrowUpRight, X, Grid,
  List, SortAsc, SortDesc, ExternalLink, Phone, Mail, Menu
} from 'lucide-react';
import { tendersAPI } from '../../services/api';

// Import Sidebar
import AdminSidebar from './AdminSidebar';
const TendersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTenders, setExpandedTenders] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Helper functions
  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      active: 'bg-blue-100 text-blue-700',
      open: 'bg-green-100 text-green-700',
      submitted: 'bg-yellow-100 text-yellow-700',
      under_review: 'bg-orange-100 text-orange-700',
      won: 'bg-emerald-100 text-emerald-700',
      lost: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
      expired: 'bg-red-100 text-red-700'
    };
    return colors[status] || colors.draft;
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: Edit,
      active: Clock,
      open: Eye,
      submitted: Send,
      under_review: Search,
      won: Award,
      lost: AlertTriangle,
      cancelled: X,
      expired: Clock
    };
    const Icon = icons[status] || FileText;
    return <Icon className="h-3 w-3" />;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'TBD';
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleTenderExpansion = (tenderId) => {
    const newExpanded = new Set(expandedTenders);
    if (newExpanded.has(tenderId)) {
      newExpanded.delete(tenderId);
    } else {
      newExpanded.add(tenderId);
    }
    setExpandedTenders(newExpanded);
  };

  const handleRefresh = () => {
    fetchTenders(true);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'open', label: 'Open' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'construction', label: 'Construction' },
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'renovation', label: 'Renovation' }
  ];

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await tendersAPI.getAll();
      
      let tendersData = [];
      if (response?.tenders && Array.isArray(response.tenders)) {
        tendersData = response.tenders;
      } else if (Array.isArray(response)) {
        tendersData = response;
      }
      
      const processedTenders = tendersData.map((tender) => ({
        ...tender,
        title: tender.title || tender.name || `Tender #${tender.id}`,
        description: tender.description || '',
        client: tender.client || tender.client_name || 'Unknown Client',
        status: (tender.status || 'draft').toLowerCase(),
        type: tender.type || 'construction',
        budget: tender.budget || 0,
        deadline: tender.deadline || tender.submission_deadline,
        location: tender.location || 'Location TBD',
        priority: tender.priority || 'medium',
        our_bid: tender.our_bid || 0,
        win_probability: tender.win_probability || 0,
      }));

      setTenders(processedTenders);
      setError(null);
    } catch (err) {
      console.error('Error fetching tenders:', err);
      setError('Failed to load tenders. Please try again.');
      setTenders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredTenders = tenders
    .filter(tender => {
      const matchesSearch = 
        (tender.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (tender.client?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || tender.status === statusFilter;
      const matchesType = typeFilter === 'all' || tender.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'deadline': 
          const deadlineA = a.deadline ? new Date(a.deadline) : new Date('9999-12-31');
          const deadlineB = b.deadline ? new Date(b.deadline) : new Date('9999-12-31');
          comparison = deadlineA - deadlineB;
          break;
        case 'budget': 
          comparison = (b.budget || 0) - (a.budget || 0);
          break;
        default: 
          comparison = (a.title || '').localeCompare(b.title || '');
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const tenderStats = {
    total: tenders.length,
    active: tenders.filter(t => ['active', 'open'].includes(t.status)).length,
    submitted: tenders.filter(t => ['submitted', 'under_review'].includes(t.status)).length,
    won: tenders.filter(t => t.status === 'won').length,
    totalValue: tenders.reduce((sum, t) => sum + (t.budget || 0), 0),
    winRate: (() => {
      const completed = tenders.filter(t => ['won', 'lost'].includes(t.status));
      const won = tenders.filter(t => t.status === 'won');
      return completed.length > 0 ? Math.round((won.length / completed.length) * 100) : 0;
    })()
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
            <p className="text-xl text-gray-600">Loading tenders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-xl text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => fetchTenders()}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <Menu className="h-5 w-5 text-slate-700" />
              </button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Tenders</h1>
                <p className="text-sm text-gray-600">Manage tender opportunities</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Tender</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
              <FileText className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{tenderStats.total}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
              <Clock className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{tenderStats.active}</p>
              <p className="text-xs text-gray-600">Active</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
              <Send className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{tenderStats.submitted}</p>
              <p className="text-xs text-gray-600">Submitted</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
              <Award className="h-6 w-6 text-green-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{tenderStats.won}</p>
              <p className="text-xs text-gray-600">Won</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
              <DollarSign className="h-6 w-6 text-purple-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{formatCurrency(tenderStats.totalValue)}</p>
              <p className="text-xs text-gray-600">Value</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
              <TrendingUp className="h-6 w-6 text-orange-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{tenderStats.winRate}%</p>
              <p className="text-xs text-gray-600">Win Rate</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="sm:col-span-2 lg:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tenders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
              >
                <option value="deadline">Sort: Deadline</option>
                <option value="budget">Sort: Budget</option>
                <option value="title">Sort: Title</option>
              </select>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 p-2 transition-colors ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid className="h-4 w-4 mx-auto" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 p-2 border-l border-gray-200 transition-colors ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <List className="h-4 w-4 mx-auto" />
                </button>
              </div>
            </div>
            
            <div className="mt-3 text-xs text-gray-600">
              Showing {filteredTenders.length} of {tenders.length} tenders
            </div>
          </div>

          {/* Tenders Grid/List */}
          {filteredTenders.length > 0 ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
              {filteredTenders.map((tender) => {
                const daysUntilDeadline = getDaysUntilDeadline(tender.deadline);
                const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 7 && !['won', 'lost', 'cancelled', 'expired'].includes(tender.status);

                return (
                  <div key={tender.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(tender.priority)}`} />
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(tender.status)}`}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(tender.status)}
                              <span className="capitalize">{tender.status.replace('_', ' ')}</span>
                            </div>
                          </span>
                          {isUrgent && (
                            <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-semibold">
                              {daysUntilDeadline}d left
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 truncate">{tender.title}</h3>
                        <p className="text-xs text-gray-600 line-clamp-1">{tender.description || 'No description'}</p>
                      </div>
                      <button className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                      <div>
                        <p className="text-gray-500">Client</p>
                        <p className="font-semibold text-gray-900 truncate">{tender.client}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Budget</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(tender.budget)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Deadline</p>
                        <p className={`font-semibold ${isUrgent ? 'text-red-600' : 'text-gray-900'}`}>
                          {formatDate(tender.deadline)}
                        </p>
                      </div>
                    </div>

                    {/* Win Probability */}
                    {tender.win_probability > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-500">Win Probability</span>
                          <span className="text-xs font-bold text-gray-900">{tender.win_probability}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              tender.win_probability >= 70 ? 'bg-green-500' :
                              tender.win_probability >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${tender.win_probability}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {tender.location}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs capitalize">
                        {tender.type}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all text-xs font-semibold">
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </button>
                      <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-xs font-semibold">
                        <Edit className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No tenders found</h3>
              <p className="text-sm text-gray-600 mb-6">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? "Try adjusting your filters" 
                  : "Create your first tender to get started"
                }
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
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