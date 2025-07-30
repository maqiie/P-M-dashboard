import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Search, Filter, Calendar, DollarSign, Building2,
  Clock, CheckCircle, AlertTriangle, Eye, Edit, Download, Send,
  Star, Target, TrendingUp, Award, Briefcase, MapPin, Users,
  MoreVertical, Flag, Upload, Paperclip, MessageSquare, Loader,
  ChevronDown, ChevronUp, RefreshCw, ArrowUpRight, X, Grid,
  List, SortAsc, SortDesc, ExternalLink, Phone, Mail
} from 'lucide-react';
import { tendersAPI } from '../../services/api';

const TendersPage = ({ sidebarCollapsed = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTenders, setExpandedTenders] = useState(new Set());
  const [selectedTenders, setSelectedTenders] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // MOVED HELPER FUNCTIONS TO THE TOP - before they're used
  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700 border-gray-300',
      active: 'bg-blue-100 text-blue-700 border-blue-300',
      open: 'bg-green-100 text-green-700 border-green-300',
      submitted: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      under_review: 'bg-orange-100 text-orange-700 border-orange-300',
      won: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      lost: 'bg-red-100 text-red-700 border-red-300',
      cancelled: 'bg-gray-100 text-gray-700 border-gray-300',
      converted: 'bg-purple-100 text-purple-700 border-purple-300',
      expired: 'bg-red-100 text-red-700 border-red-300'
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
      converted: CheckCircle,
      expired: Clock
    };
    const Icon = icons[status] || FileText;
    return <Icon className="h-4 w-4 lg:h-5 lg:w-5" />;
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
      year: 'numeric',
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

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Tenders', count: 0 },
    { value: 'draft', label: 'Draft', count: 0, color: 'gray' },
    { value: 'active', label: 'Active', count: 0, color: 'blue' },
    { value: 'open', label: 'Open', count: 0, color: 'green' },
    { value: 'submitted', label: 'Submitted', count: 0, color: 'yellow' },
    { value: 'under_review', label: 'Under Review', count: 0, color: 'orange' },
    { value: 'won', label: 'Won', count: 0, color: 'emerald' },
    { value: 'lost', label: 'Lost', count: 0, color: 'red' },
    { value: 'cancelled', label: 'Cancelled', count: 0, color: 'gray' },
    { value: 'converted', label: 'Converted', count: 0, color: 'purple' },
    { value: 'expired', label: 'Expired', count: 0, color: 'red' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'construction', label: 'Construction' },
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'renovation', label: 'Renovation' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'painting', label: 'Painting' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' }
  ];

  const sortOptions = [
    { value: 'deadline', label: 'Deadline' },
    { value: 'created_at', label: 'Date Created' },
    { value: 'budget', label: 'Budget' },
    { value: 'title', label: 'Title' },
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
    { value: 'client', label: 'Client' }
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
      console.log('✅ Tenders API response:', response);
      console.log('📊 Response type:', typeof response);
      console.log('📊 Response keys:', response ? Object.keys(response) : 'No response');
      
      // Handle YOUR specific API response structure
      let tendersData = [];
      
      if (response?.tenders && Array.isArray(response.tenders)) {
        // Your API returns { tenders: [...], total: ..., status: ... }
        tendersData = response.tenders;
        console.log('📂 Using response.tenders (YOUR API structure)');
      } else if (response?.data?.tenders && Array.isArray(response.data.tenders)) {
        tendersData = response.data.tenders;
        console.log('📂 Using response.data.tenders');
      } else if (Array.isArray(response?.data)) {
        tendersData = response.data;
        console.log('📂 Using response.data as array');
      } else if (Array.isArray(response)) {
        tendersData = response;
        console.log('📂 Using response as array');
      } else {
        console.warn('⚠️ Unknown response structure:', response);
        // Try to find any array in the response
        for (const [key, value] of Object.entries(response || {})) {
          if (Array.isArray(value)) {
            console.log(`📂 Found array in response.${key}`);
            tendersData = value;
            break;
          }
        }
      }
      
      console.log('📝 Raw tenders data:', tendersData);
      console.log('📊 Tenders data length:', tendersData?.length);
      
      // Ensure we have an array
      const validTenders = Array.isArray(tendersData) ? tendersData : [];
      console.log('✅ Valid tenders count:', validTenders.length);
      
      if (validTenders.length === 0) {
        console.warn('⚠️ No valid tenders found in response');
        console.log('🔍 Full response for debugging:', JSON.stringify(response, null, 2));
      }
      
      const processedTenders = validTenders.map((tender, index) => {
        console.log(`🔄 Processing tender ${index + 1}:`, tender);
        return {
          ...tender,
          title: tender.title || tender.name || tender.tender_name || `Tender #${tender.id}`,
          description: tender.description || tender.details || tender.scope || '',
          client: tender.client || tender.client_name || tender.customer || 'Unknown Client',
          status: (tender.status || 'draft').toLowerCase(),
          type: tender.type || tender.project_type || tender.category || 'construction',
          budget: tender.budget || tender.budget_estimate || tender.estimated_value || tender.value || 0,
          deadline: tender.deadline || tender.submission_deadline || tender.due_date || tender.end_date,
          location: tender.location || tender.address || tender.site_location || 'Location TBD',
          priority: tender.priority || 'medium',
          created_at: tender.created_at || tender.date_created || new Date().toISOString(),
          updated_at: tender.updated_at || tender.date_modified || new Date().toISOString(),
          our_bid: tender.our_bid || tender.bid_amount || tender.proposed_amount || 0,
          win_probability: tender.win_probability || tender.probability || tender.success_rate || 0,
          competitors: tender.competitors || tender.competitor_count || 'Unknown',
          duration: tender.duration || tender.project_duration || tender.timeline || 'Duration TBD',
          project_manager: tender.project_manager || tender.manager_name || tender.assigned_to || 'Unassigned',
          attachments: tender.attachments || tender.attachment_count || 0,
          notes: tender.notes || tender.comment_count || tender.comments || 0,
          requirements: tender.requirements || tender.specs || []
        };
      });
      

      setTenders(processedTenders);
      setError(null);
      console.log(`✅ Loaded ${processedTenders.length} tenders`);
      
    } catch (err) {
      console.error('❌ Error fetching tenders:', err);
      setError(err.message || 'Failed to load tenders. Please try again.');
      setTenders([]); // Set empty array on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Enhanced filtering and sorting
  const filteredTenders = tenders
    .filter(tender => {
      const matchesSearch = 
        (tender.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (tender.client?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (tender.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (tender.location?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
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
        case 'created_at':
          comparison = new Date(b.created_at || 0) - new Date(a.created_at || 0);
          break;
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        case 'client':
          comparison = (a.client || '').localeCompare(b.client || '');
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
          break;
        default: 
          comparison = (a.title || '').localeCompare(b.title || '');
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  // Calculate enhanced statistics - NOW getDaysUntilDeadline is available
  const tenderStats = {
    total: tenders.length,
    active: tenders.filter(t => ['active', 'open'].includes(t.status)).length,
    submitted: tenders.filter(t => ['submitted', 'under_review'].includes(t.status)).length,
    won: tenders.filter(t => t.status === 'won').length,
    lost: tenders.filter(t => ['lost', 'cancelled', 'expired'].includes(t.status)).length,
    draft: tenders.filter(t => t.status === 'draft').length,
    converted: tenders.filter(t => t.status === 'converted').length,
    totalValue: tenders.reduce((sum, t) => sum + (t.budget || 0), 0),
    totalBidValue: tenders.reduce((sum, t) => sum + (t.our_bid || 0), 0),
    avgWinProbability: tenders.length > 0 ? 
      Math.round(tenders.reduce((sum, t) => sum + (t.win_probability || 0), 0) / tenders.length) : 0,
    winRate: (() => {
      const completedTenders = tenders.filter(t => ['won', 'lost', 'cancelled', 'expired'].includes(t.status));
      const wonTenders = tenders.filter(t => t.status === 'won');
      return completedTenders.length > 0 ? Math.round((wonTenders.length / completedTenders.length) * 100) : 0;
    })(),
    urgentTenders: tenders.filter(t => {
      if (!t.deadline || ['won', 'lost', 'cancelled', 'expired'].includes(t.status)) return false;
      const daysLeft = getDaysUntilDeadline(t.deadline);
      return daysLeft !== null && daysLeft <= 7;
    }).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader className="h-16 w-16 lg:h-24 lg:w-24 text-emerald-600 animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="h-8 w-8 lg:h-12 lg:w-12 text-emerald-500" />
            </div>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">Loading Tenders</h2>
          <p className="text-lg lg:text-xl text-slate-600">Fetching your tender opportunities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertTriangle className="h-16 w-16 lg:h-24 lg:w-24 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-4">Error Loading Tenders</h2>
          <p className="text-lg text-slate-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => fetchTenders()}
              className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              <RefreshCw className="h-5 w-5 inline mr-2" />
              Retry Loading
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      <div 
        className={`transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-80'
        }`}
      >
        <div className="p-6 lg:p-12">
          {/* Enhanced Header */}
          <div className="mb-8 lg:mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                    <Briefcase className="h-8 w-8 lg:h-12 lg:w-12 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-6xl font-black text-slate-800 tracking-tight">
                      Tender Hub
                    </h1>
                    <p className="text-lg lg:text-2xl text-slate-600 leading-relaxed">
                      Manage and track all your tender opportunities in one place
                    </p>
                  </div>
                </div>
                
                {/* Quick Stats Bar */}
                <div className="flex flex-wrap gap-4 lg:gap-6 text-sm lg:text-base">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="font-semibold text-slate-700">{tenderStats.total} Total Tenders</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-semibold text-slate-700">{tenderStats.active} Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="font-semibold text-slate-700">{tenderStats.urgentTenders} Urgent</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-semibold text-slate-700">{tenderStats.winRate}% Win Rate</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center space-x-2 px-6 py-3 bg-white text-slate-700 border-2 border-slate-200 rounded-2xl hover:border-slate-300 transition-all font-semibold"
                >
                  <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>
                <button className="flex items-center space-x-3 px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-lg lg:text-xl font-bold rounded-2xl hover:shadow-xl transition-all duration-300">
                  <Plus className="h-5 w-5 lg:h-6 lg:w-6" />
                  <span>New Tender</span>
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4 lg:gap-6 mb-8 lg:mb-12">
            {[
              { icon: FileText, label: 'Total', value: tenderStats.total, color: 'emerald' },
              { icon: Clock, label: 'Active', value: tenderStats.active, color: 'blue' },
              { icon: Send, label: 'Submitted', value: tenderStats.submitted, color: 'yellow' },
              { icon: Award, label: 'Won', value: tenderStats.won, color: 'green' },
              { icon: AlertTriangle, label: 'Lost', value: tenderStats.lost, color: 'red' },
              { icon: DollarSign, label: 'Total Value', value: formatCurrency(tenderStats.totalValue), color: 'purple' },
              { icon: Target, label: 'Bid Value', value: formatCurrency(tenderStats.totalBidValue), color: 'indigo' },
              { icon: TrendingUp, label: 'Win Rate', value: `${tenderStats.winRate}%`, color: 'orange' }
            ].map((stat, index) => (
              <div key={index} className="group bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl border-2 border-white/50 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <p className="text-3xl font-black text-slate-800 mb-2">{stat.value}</p>
                <p className="text-lg font-semibold text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Enhanced Controls */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-xl border-2 border-white/50 mb-8 lg:mb-12">
            <div className="flex flex-col xl:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search tenders, clients, locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:outline-none bg-white/80 backdrop-blur-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 transition-colors"
                    >
                      <X className="h-4 w-4 text-slate-400" />
                    </button>
                  )}
                </div>
              </div>
              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:outline-none bg-white/80 backdrop-blur-sm min-w-[160px]"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} {option.value !== 'all' && tenderStats[option.value] ? `(${tenderStats[option.value]})` : ''}
                    </option>
                  ))}
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:outline-none bg-white/80 backdrop-blur-sm min-w-[140px]"
                >
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <div className="flex rounded-2xl border-2 border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-4 py-4 text-lg focus:outline-none bg-transparent min-w-[120px]"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 border-l border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="h-5 w-5" /> : <SortDesc className="h-5 w-5" />}
                  </button>
                </div>
                <div className="flex rounded-2xl border-2 border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-4 transition-colors ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-4 border-l border-slate-200 transition-colors ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            {/* Filter Summary */}
            {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-slate-600 font-medium">Filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="ml-2 hover:text-emerald-800">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {statusFilter !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Status: {statusOptions.find(s => s.value === statusFilter)?.label}
                    <button onClick={() => setStatusFilter('all')} className="ml-2 hover:text-blue-800">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {typeFilter !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    Type: {typeOptions.find(t => t.value === typeFilter)?.label}
                    <button onClick={() => setTypeFilter('all')} className="ml-2 hover:text-purple-800">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Results Summary */}
            <div className="mt-4 text-slate-600">
              <span className="font-medium">
                Showing {filteredTenders.length} of {tenders.length} tenders
              </span>
              {filteredTenders.length !== tenders.length && (
                <span className="text-slate-500"> (filtered)</span>
              )}
            </div>
          </div>

          {/* Enhanced Tenders Display */}
          {filteredTenders.length > 0 ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8" : "space-y-6"}>
              {filteredTenders.map((tender) => {
                const deadline = tender.deadline;
                const daysUntilDeadline = getDaysUntilDeadline(deadline);
                const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 7 && !['won', 'lost', 'cancelled', 'expired'].includes(tender.status);
                const isExpired = daysUntilDeadline !== null && daysUntilDeadline < 0;
                const isExpanded = expandedTenders.has(tender.id);

                return (
                  <div key={tender.id} className="group bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-white/50 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    {/* Tender Header */}
                    <div className="p-6 lg:p-8">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          {/* Status & Priority Row */}
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`w-4 h-4 rounded-full ${getPriorityColor(tender.priority)} shadow-lg`} />
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border-2 ${getStatusColor(tender.status)}`}>
                              {getStatusIcon(tender.status)}
                              <span className="ml-2 capitalize">{tender.status.replace('_', ' ')}</span>
                            </span>
                            {isUrgent && (
                              <span className="inline-flex items-center px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold animate-pulse shadow-lg">
                                <Clock className="h-4 w-4 mr-1" />
                                {daysUntilDeadline} days left
                              </span>
                            )}
                            {isExpired && (
                              <span className="inline-flex items-center px-3 py-1 bg-gray-500 text-white rounded-full text-sm font-bold">
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Expired
                              </span>
                            )}
                          </div>

                          {/* Title & Description */}
                          <h3 className="text-2xl lg:text-3xl font-black text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">
                            {tender.title}
                          </h3>
                          <p className="text-lg text-slate-600 mb-4 line-clamp-2">
                            {tender.description || 'No description available'}
                          </p>

                          {/* Key Details Grid */}
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-emerald-100 rounded-xl">
                                <Building2 className="h-5 w-5 text-emerald-600" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-500">Client</p>
                                <p className="font-bold text-slate-800 truncate">{tender.client}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-xl">
                                <DollarSign className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-500">Budget</p>
                                <p className="font-bold text-slate-800">{formatCurrency(tender.budget)}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-red-100 rounded-xl">
                                <Calendar className="h-5 w-5 text-red-600" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-500">Deadline</p>
                                <p className={`font-bold ${isUrgent ? 'text-red-600' : 'text-slate-800'}`}>
                                  {formatDate(deadline)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions Menu */}
                        <div className="flex flex-col space-y-2">
                          <button className="p-3 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors group-hover:scale-110 transform duration-200">
                            <Eye className="h-5 w-5" />
                          </button>
                          <button className="p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors group-hover:scale-110 transform duration-200">
                            <Edit className="h-5 w-5" />
                          </button>
                          <button className="p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar (if applicable) */}
                      {tender.win_probability > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-slate-600">Win Probability</span>
                            <span className="text-lg font-bold text-slate-800">{tender.win_probability}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-1000 ${
                                tender.win_probability >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                                tender.win_probability >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                                'bg-gradient-to-r from-red-500 to-red-600'
                              }`}
                              style={{ width: `${tender.win_probability}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Quick Info Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                          <MapPin className="h-4 w-4 inline mr-1" />
                          {tender.location}
                        </span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium capitalize">
                          <Target className="h-4 w-4 inline mr-1" />
                          {tender.type}
                        </span>
                        {tender.duration && (
                          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                            <Clock className="h-4 w-4 inline mr-1" />
                            {tender.duration}
                          </span>
                        )}
                      </div>

                      {/* Expand/Collapse Button */}
                      <button
                        onClick={() => toggleTenderExpansion(tender.id)}
                        className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all text-slate-600 hover:text-emerald-600"
                      >
                        <span className="font-semibold">
                          {isExpanded ? 'Show Less' : 'Show More Details'}
                        </span>
                        {isExpanded ? 
                          <ChevronUp className="h-5 w-5" /> : 
                          <ChevronDown className="h-5 w-5" />
                        }
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t-2 border-slate-100 p-6 lg:p-8 bg-slate-50/50">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                          {/* Financial Details */}
                          <div className="space-y-4">
                            <h4 className="text-xl font-bold text-slate-800 mb-4">Financial Details</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                                <span className="font-semibold text-slate-600">Budget Estimate</span>
                                <span className="font-bold text-slate-800">{formatCurrency(tender.budget)}</span>
                              </div>
                              {tender.our_bid > 0 && (
                                <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                                  <span className="font-semibold text-slate-600">Our Bid</span>
                                  <span className="font-bold text-emerald-600">{formatCurrency(tender.our_bid)}</span>
                                </div>
                              )}
                              {tender.budget > 0 && tender.our_bid > 0 && (
                                <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                                  <span className="font-semibold text-slate-600">Bid Margin</span>
                                  <span className={`font-bold ${tender.our_bid < tender.budget ? 'text-green-600' : 'text-red-600'}`}>
                                    {tender.our_bid < tender.budget ? '-' : '+'}
                                    {Math.abs(((tender.our_bid - tender.budget) / tender.budget * 100)).toFixed(1)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Project Details */}
                          <div className="space-y-4">
                            <h4 className="text-xl font-bold text-slate-800 mb-4">Project Details</h4>
                            <div className="space-y-3">
                              <div className="p-3 bg-white rounded-xl">
                                <span className="font-semibold text-slate-600 block mb-1">Project Manager</span>
                                <span className="text-slate-800">{tender.project_manager}</span>
                              </div>
                              <div className="p-3 bg-white rounded-xl">
                                <span className="font-semibold text-slate-600 block mb-1">Competitors</span>
                                <span className="text-slate-800">{tender.competitors}</span>
                              </div>
                              <div className="flex space-x-4">
                                <div className="flex-1 p-3 bg-white rounded-xl text-center">
                                  <Paperclip className="h-6 w-6 text-slate-500 mx-auto mb-1" />
                                  <span className="font-bold text-slate-800 block">{tender.attachments}</span>
                                  <span className="text-sm text-slate-500">Files</span>
                                </div>
                                <div className="flex-1 p-3 bg-white rounded-xl text-center">
                                  <MessageSquare className="h-6 w-6 text-slate-500 mx-auto mb-1" />
                                  <span className="font-bold text-slate-800 block">{tender.notes}</span>
                                  <span className="text-sm text-slate-500">Notes</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Requirements (if any) */}
                          {tender.requirements && tender.requirements.length > 0 && (
                            <div className="lg:col-span-2 space-y-4">
                              <h4 className="text-xl font-bold text-slate-800">Requirements</h4>
                              <div className="flex flex-wrap gap-2">
                                {tender.requirements.map((req, index) => (
                                  <span key={index} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium">
                                    {req}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <button className="flex items-center justify-center space-x-2 p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-semibold">
                              <Eye className="h-5 w-5" />
                              <span>View Full</span>
                            </button>
                            <button className="flex items-center justify-center space-x-2 p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold">
                              <Edit className="h-5 w-5" />
                              <span>Edit</span>
                            </button>
                            <button className="flex items-center justify-center space-x-2 p-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-semibold">
                              <Download className="h-5 w-5" />
                              <span>Export</span>
                            </button>
                            <button className="flex items-center justify-center space-x-2 p-3 bg-slate-500 text-white rounded-xl hover:bg-slate-600 transition-colors font-semibold">
                              <ExternalLink className="h-5 w-5" />
                              <span>Share</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // Enhanced Empty State
            <div className="text-center py-16 lg:py-24">
              <div className="max-w-md mx-auto">
                <div className="relative mb-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full mx-auto flex items-center justify-center">
                    <Briefcase className="h-16 w-16 text-slate-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                <h3 className="text-3xl lg:text-4xl font-black text-slate-800 mb-4">
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' 
                    ? "No matching tenders found" 
                    : "No tenders yet"
                  }
                </h3>
                
                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                    ? "Try adjusting your search criteria or filters to find what you're looking for." 
                    : "Start by creating your first tender opportunity to begin tracking your business development."
                  }
                </p>

                <div className="space-y-4">
                  {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') ? (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                        setTypeFilter('all');
                      }}
                      className="px-8 py-4 bg-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-300 transition-all"
                    >
                      Clear All Filters
                    </button>
                  ) : (
                    <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl hover:shadow-xl transition-all duration-300">
                      <Plus className="h-6 w-6 inline mr-3" />
                      Create Your First Tender
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pagination (if needed for large datasets) */}
          {filteredTenders.length > 20 && (
            <div className="mt-12 flex justify-center">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl border-2 border-white/50">
                <div className="flex items-center space-x-4">
                  <button className="px-4 py-2 text-slate-600 hover:text-emerald-600 font-semibold">
                    Previous
                  </button>
                  <div className="flex space-x-2">
                    {[1, 2, 3, '...', 8].map((page, index) => (
                      <button
                        key={index}
                        className={`w-10 h-10 rounded-xl font-semibold transition-colors ${
                          page === 1 
                            ? 'bg-emerald-500 text-white' 
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button className="px-4 py-2 text-slate-600 hover:text-emerald-600 font-semibold">
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Section */}
          <div className="mt-16 text-center py-8 border-t-2 border-white/50">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Briefcase className="h-8 w-8 text-emerald-500" />
              <FileText className="h-8 w-8 text-teal-500" />
              <Award className="h-8 w-8 text-cyan-500" />
            </div>
            <h4 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Tender Management System
            </h4>
            <p className="text-lg text-slate-600">
              Streamline your bidding process and win more opportunities
            </p>
            <div className="flex items-center justify-center space-x-8 mt-6 text-sm text-slate-500">
              <span>© 2025 Construction Hub</span>
              <span>•</span>
              <span>{tenders.length} Total Tenders</span>
              <span>•</span>
              <span>{tenderStats.winRate}% Success Rate</span>
              <span>•</span>
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TendersPage;