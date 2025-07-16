import React, { useState, useEffect } from 'react';
import { dashboardAPI, tendersAPI } from '../../services/api';
import { 
  Briefcase,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  User,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Building2,
  TrendingUp,
  Target,
  Award,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';

const TendersPage = () => {
  // State management
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('active');
  
  // UI state
  const [selectedTender, setSelectedTender] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadTenders();
  }, [activeTab]);

  const loadTenders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data = [];
      
      console.log(`Loading tenders for tab: ${activeTab}`);
      
      switch (activeTab) {
        case 'active':
          try {
            data = await tendersAPI.getByStatus('active');
            console.log('Active tenders data:', data);
          } catch (activeError) {
            console.warn('Failed to get active tenders, falling back to all tenders');
            const allTenders = await dashboardAPI.getTenders();
            data = Array.isArray(allTenders) ? allTenders : allTenders.tenders || [];
            data = data.filter(t => t.status === 'active' || !t.status);
          }
          break;
          
        case 'drafts':
          try {
            data = await tendersAPI.getByStatus('draft');
            console.log('Draft tenders data:', data);
          } catch (draftError) {
            console.warn('Failed to get draft tenders, falling back to all tenders');
            const allTenders = await dashboardAPI.getTenders();
            data = Array.isArray(allTenders) ? allTenders : allTenders.tenders || [];
            data = data.filter(t => t.status === 'draft');
          }
          break;
          
        case 'history':
          try {
            const allTenders = await dashboardAPI.getTenders();
            data = Array.isArray(allTenders) ? allTenders : allTenders.tenders || [];
            data = data.filter(t => ['completed', 'rejected', 'cancelled'].includes(t.status));
            console.log('History tenders data:', data);
          } catch (historyError) {
            console.error('Failed to get tender history:', historyError);
            data = [];
          }
          break;
          
        default:
          data = await dashboardAPI.getTenders();
          console.log('Default tenders data:', data);
      }
      
      // Ensure data is an array
      const tendersArray = Array.isArray(data) ? data : data.tenders || [];
      
      console.log(`Loaded ${tendersArray.length} tenders for ${activeTab} tab`);
      setTenders(tendersArray);
      
    } catch (error) {
      console.error('Failed to load tenders:', error);
      setError(error.message || 'Failed to load tenders. Please try again.');
      
      // Only show mock data in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock data for development');
        setTenders(getMockTenders());
      } else {
        setTenders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshTenders = async () => {
    setRefreshing(true);
    await loadTenders();
    setRefreshing(false);
  };

  const setActionLoadingState = (tenderId, action, state) => {
    setActionLoading(prev => ({
      ...prev,
      [`${tenderId}_${action}`]: state
    }));
  };

  const handleCreateTender = async () => {
    // TODO: Implement create tender modal/form
    console.log('Create tender clicked');
    alert('Create tender feature will be implemented soon!');
  };

  const handleEditTender = async (tender) => {
    // TODO: Implement edit tender modal/form
    console.log('Edit tender:', tender);
    alert(`Edit tender "${tender.title}" feature will be implemented soon!`);
  };

  const handleDeleteTender = async (tenderId) => {
    if (!window.confirm('Are you sure you want to delete this tender?')) {
      return;
    }

    try {
      setActionLoadingState(tenderId, 'delete', true);
      await tendersAPI.delete(tenderId);
      
      // Remove from local state immediately for better UX
      setTenders(prev => prev.filter(t => t.id !== tenderId));
      
      console.log('Tender deleted successfully');
      // Optionally show success message
    } catch (error) {
      console.error('Failed to delete tender:', error);
      alert('Failed to delete tender. Please try again.');
      // Refresh to ensure consistency
      await refreshTenders();
    } finally {
      setActionLoadingState(tenderId, 'delete', false);
    }
  };

  const handleConvertToProject = async (tenderId) => {
    if (!window.confirm('Are you sure you want to convert this tender to a project?')) {
      return;
    }

    try {
      setActionLoadingState(tenderId, 'convert', true);
      const result = await tendersAPI.convertToProject(tenderId);
      
      // Update the tender status in local state
      setTenders(prev => prev.map(t => 
        t.id === tenderId 
          ? { ...t, status: 'converted' }
          : t
      ));
      
      console.log('Tender converted to project successfully:', result);
      alert('Tender converted to project successfully!');
    } catch (error) {
      console.error('Failed to convert tender:', error);
      alert('Failed to convert tender to project. Please try again.');
    } finally {
      setActionLoadingState(tenderId, 'convert', false);
    }
  };

  const handleViewDetails = (tender) => {
    setSelectedTender(tender);
    // TODO: Implement tender details modal
    console.log('View tender details:', tender);
    alert(`View details for "${tender.title}" will be implemented soon!`);
  };

  const getMockTenders = () => [
    {
      id: 1,
      title: "Municipal Building Renovation",
      description: "Complete renovation of the historic municipal building including structural improvements, HVAC upgrades, and accessibility enhancements.",
      deadline: "2025-07-15",
      created_date: "2025-06-01",
      budget_estimate: 2500000,
      responsible: "Sarah Johnson",
      lead_person: "Sarah Johnson",
      project_id: 1,
      status: "active",
      priority: "high",
      category: "Renovation",
      location: "Downtown District",
      client: "City of Springfield",
      requirements: ["Licensed contractor", "5+ years experience", "Local presence"],
      submission_count: 8,
      estimated_duration: "18 months"
    },
    // Add more mock data as needed
  ];

  const filteredTenders = tenders.filter(tender => {
    const matchesSearch = tender.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tender.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tender.client?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tender.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || tender.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'converted': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Target className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4" />;
      case 'converted': return <ArrowRight className="h-4 w-4" />;
      default: return <Briefcase className="h-4 w-4" />;
    }
  };

  const getDaysUntilDeadline = (date) => {
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const tenderStats = {
    active: tenders.filter(t => t.status === 'active').length,
    draft: tenders.filter(t => t.status === 'draft').length,
    completed: tenders.filter(t => t.status === 'completed').length,
    converted: tenders.filter(t => t.status === 'converted').length,
    totalValue: tenders.reduce((sum, t) => sum + (t.budget_estimate || 0), 0),
    avgSubmissions: tenders.length > 0 ? tenders.reduce((sum, t) => sum + (t.submission_count || 0), 0) / tenders.length : 0
  };

  const TenderCard = ({ tender }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
      {/* Priority Indicator */}
      <div className={`absolute top-0 left-0 w-full h-1 ${getPriorityColor(tender.priority)}`}></div>
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {tender.title}
            </h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tender.status)}`}>
              {getStatusIcon(tender.status)}
              <span className="ml-1 capitalize">{tender.status}</span>
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
            <span className="font-medium text-blue-600">{tender.category || 'General'}</span>
            <span>•</span>
            <span>{tender.client || 'Internal'}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleEditTender(tender)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit tender"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            onClick={() => handleDeleteTender(tender.id)}
            disabled={actionLoading[`${tender.id}_delete`]}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Delete tender"
          >
            {actionLoading[`${tender.id}_delete`] ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{tender.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
            {formatCurrency(tender.budget_estimate)}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            {tender.location || 'TBD'}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-2 text-gray-400" />
            {tender.responsible}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            {tender.status === 'active' && tender.deadline && (
              <>
                Due: {new Date(tender.deadline).toLocaleDateString()}
                {getDaysUntilDeadline(tender.deadline) <= 7 && getDaysUntilDeadline(tender.deadline) > 0 && (
                  <span className="ml-2 text-xs text-red-600 font-medium">
                    ({getDaysUntilDeadline(tender.deadline)} days left)
                  </span>
                )}
              </>
            )}
            {tender.status === 'completed' && `Completed: ${new Date(tender.completion_date || tender.deadline).toLocaleDateString()}`}
            {tender.status === 'draft' && `Created: ${new Date(tender.created_date || tender.created_at).toLocaleDateString()}`}
            {tender.status === 'converted' && `Converted: ${new Date(tender.updated_at || tender.created_at).toLocaleDateString()}`}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            {tender.estimated_duration || 'TBD'}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FileText className="h-4 w-4 mr-2 text-gray-400" />
            {tender.submission_count || 0} submissions
          </div>
        </div>
      </div>

      {/* Requirements */}
      {tender.requirements && tender.requirements.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Key Requirements</h4>
          <div className="flex flex-wrap gap-1">
            {tender.requirements.slice(0, 3).map((req, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {req}
              </span>
            ))}
            {tender.requirements.length > 3 && (
              <span className="text-xs text-gray-500">+{tender.requirements.length - 3} more</span>
            )}
          </div>
        </div>
      )}

      {/* Status-specific info */}
      {tender.status === 'completed' && tender.selected_contractor && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <Award className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Selected: {tender.selected_contractor}</span>
          </div>
        </div>
      )}

      {tender.status === 'rejected' && tender.rejection_reason && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">{tender.rejection_reason}</span>
          </div>
        </div>
      )}

      {tender.status === 'converted' && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-2">
            <ArrowRight className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Successfully converted to project</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
        <button 
          onClick={() => handleViewDetails(tender)}
          className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </button>
        
        {tender.status === 'draft' && (
          <button 
            onClick={() => handleEditTender(tender)}
            className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit & Publish
          </button>
        )}
        
        {tender.status === 'active' && (
          <>
            <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <FileText className="h-4 w-4 mr-1" />
              Submissions
            </button>
            <button 
              onClick={() => handleConvertToProject(tender.id)}
              disabled={actionLoading[`${tender.id}_convert`]}
              className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
            >
              {actionLoading[`${tender.id}_convert`] ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-1" />
              )}
              Convert
            </button>
          </>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-xl text-gray-700 font-semibold">Loading Tenders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/30 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tenders Management</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Create, manage, and track construction project tenders
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={refreshTenders}
                  disabled={refreshing}
                  className={`px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 ${
                    refreshing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>
                <button 
                  onClick={handleCreateTender}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Tender
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-red-800 font-medium">Error Loading Tenders</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                  <button 
                    onClick={refreshTenders}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Try again
                  </button>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Tender Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{tenderStats.active}</p>
                  <p className="text-xs text-gray-600">Active Tenders</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{tenderStats.draft}</p>
                  <p className="text-xs text-gray-600">Draft Tenders</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{tenderStats.completed}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(tenderStats.totalValue / 1000000)}M</p>
                  <p className="text-xs text-gray-600">Total Value</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(tenderStats.avgSubmissions)}</p>
                  <p className="text-xs text-gray-600">Avg Submissions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg mb-6">
            <div className="flex items-center border-b border-gray-200">
              {[
                { id: 'active', label: 'Active Tenders', count: tenderStats.active },
                { id: 'drafts', label: 'Drafts', count: tenderStats.draft },
                { id: 'history', label: 'History', count: tenderStats.completed + tenderStats.converted }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tenders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{filteredTenders.length} tenders</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tenders Display */}
          {filteredTenders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTenders.map((tender) => (
                <TenderCard key={tender.id} tender={tender} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-16 w-16 text-gray-300" />
              <p className="mt-4 text-lg text-gray-500">
                {error ? 'Failed to load tenders' : 'No tenders found'}
              </p>
              <p className="text-sm text-gray-400">
                {error ? 'Please check your connection and try again' : 'Try adjusting your search or create a new tender'}
              </p>
              <button 
                onClick={error ? refreshTenders : handleCreateTender}
                className="mt-4 flex items-center mx-auto px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
              >
                {error ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Try Again
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    Create First Tender
                  </>
                )}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TendersPage;