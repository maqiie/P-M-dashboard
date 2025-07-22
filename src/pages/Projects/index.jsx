import React, { useState, useEffect, useCallback } from 'react';
import { tendersAPI } from '../../services/api';
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
  X,
  Save,
  Send,
  PaperclipIcon as Paperclip
} from 'lucide-react';

const TendersPage = () => {
  // State management
  const [tenders, setTenders] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    draft: 0,
    completed: 0,
    rejected: 0,
    converted: 0,
    urgent: 0,
    expired: 0,
    totalValue: 0,
    avgSubmissions: 0
  });
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTender, setEditingTender] = useState(null);
  
  // Form state
  const [newTender, setNewTender] = useState({
    title: '',
    description: '',
    location: '',
    budget_estimate: '',
    priority: 'medium',
    deadline: '',
    category: 'General',
    client: '',
    estimated_duration: '',
    requirements: []
  });

  // Load tenders based on active tab
  const loadTenders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data = [];
      
      console.log(`Loading tenders for tab: ${activeTab}`);
      
      switch (activeTab) {
        case 'active':
          data = await tendersAPI.getActive();
          break;
        case 'drafts':
          data = await tendersAPI.getDrafts();
          break;
        case 'urgent':
          data = await tendersAPI.getUrgent();
          break;
        case 'history':
          const allTenders = await tendersAPI.getMy();
          data = allTenders.filter(t => ['completed', 'rejected', 'cancelled', 'converted'].includes(t.status));
          break;
        default:
          data = await tendersAPI.getMy();
      }
      
      console.log(`Loaded ${data.length} tenders for ${activeTab} tab`);
      setTenders(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error('Failed to load tenders:', error);
      setError(error.message || 'Failed to load tenders. Please try again.');
      setTenders([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      const statsResponse = await tendersAPI.getStatistics();
      setStatistics(statsResponse.statistics || statsResponse);
    } catch (error) {
      console.error('Failed to load statistics:', error);
      // Calculate from current tenders if API fails
      calculateLocalStatistics();
    }
  }, [tenders]);

  // Calculate statistics from local data
  const calculateLocalStatistics = useCallback(() => {
    const stats = {
      total: tenders.length,
      active: tenders.filter(t => t.status === 'active').length,
      draft: tenders.filter(t => t.status === 'draft').length,
      completed: tenders.filter(t => t.status === 'completed').length,
      rejected: tenders.filter(t => t.status === 'rejected').length,
      converted: tenders.filter(t => t.status === 'converted').length,
      urgent: tenders.filter(t => t.urgent).length,
      expired: tenders.filter(t => t.expired).length,
      totalValue: tenders.reduce((sum, t) => sum + (t.budget_estimate || 0), 0),
      avgSubmissions: tenders.length > 0 ? 
        tenders.reduce((sum, t) => sum + (t.submission_count || 0), 0) / tenders.length : 0
    };
    setStatistics(stats);
  }, [tenders]);

  // Initial load
  useEffect(() => {
    loadTenders();
  }, [loadTenders]);

  // Update statistics when tenders change
  useEffect(() => {
    if (tenders.length > 0) {
      loadStatistics();
    }
  }, [loadStatistics, tenders]);

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

  const resetForm = () => {
    setNewTender({
      title: '',
      description: '',
      location: '',
      budget_estimate: '',
      priority: 'medium',
      deadline: '',
      category: 'General',
      client: '',
      estimated_duration: '',
      requirements: []
    });
  };

  const handleCreateTender = async (e) => {
    e.preventDefault();
    try {
      setActionLoadingState('create', 'submit', true);
      
      const tenderData = {
        ...newTender,
        budget_estimate: parseFloat(newTender.budget_estimate) || 0,
        status: 'draft' // New tenders start as drafts
      };
      
      const createdTender = await tendersAPI.create(tenderData);
      console.log("Tender created successfully:", createdTender);
      
      // Update local state
      setTenders(prev => [createdTender, ...prev]);
      
      // Reset form and close
      resetForm();
      setShowCreateForm(false);
      
      // Show success message
      alert("Tender created successfully!");
      
    } catch (error) {
      console.error("Failed to create tender:", error);
      alert("Failed to create tender. Please try again.");
    } finally {
      setActionLoadingState('create', 'submit', false);
    }
  };

  const handleEditTender = async (tender, updatedData = null) => {
    if (!updatedData) {
      // Start editing mode
      setEditingTender({
        ...tender,
        budget_estimate: tender.budget_estimate?.toString() || '',
        deadline: tender.deadline || ''
      });
      return;
    }

    try {
      setActionLoadingState(tender.id, 'edit', true);
      
      const processedData = {
        ...updatedData,
        budget_estimate: parseFloat(updatedData.budget_estimate) || 0
      };
      
      const updatedTender = await tendersAPI.update(tender.id, processedData);
      console.log("Tender updated successfully:", updatedTender);
      
      // Update local state
      setTenders(prev => prev.map(t => 
        t.id === tender.id ? { ...t, ...updatedTender } : t
      ));
      
      setEditingTender(null);
      alert("Tender updated successfully!");
      
    } catch (error) {
      console.error("Failed to update tender:", error);
      alert("Failed to update tender. Please try again.");
    } finally {
      setActionLoadingState(tender.id, 'edit', false);
    }
  };

  const handleDeleteTender = async (tenderId) => {
    if (!window.confirm('Are you sure you want to delete this tender? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoadingState(tenderId, 'delete', true);
      await tendersAPI.delete(tenderId);
      
      // Remove from local state immediately
      setTenders(prev => prev.filter(t => t.id !== tenderId));
      
      console.log('Tender deleted successfully');
      alert('Tender deleted successfully!');
      
    } catch (error) {
      console.error('Failed to delete tender:', error);
      alert('Failed to delete tender. Please try again.');
      await refreshTenders(); // Refresh to ensure consistency
    } finally {
      setActionLoadingState(tenderId, 'delete', false);
    }
  };

  const handleConvertToProject = async (tenderId) => {
    if (!window.confirm('Are you sure you want to convert this tender to a project? This will create a new project and mark the tender as converted.')) {
      return;
    }

    try {
      setActionLoadingState(tenderId, 'convert', true);
      const result = await tendersAPI.convertToProject(tenderId);
      
      // Update the tender status in local state
      setTenders(prev => prev.map(t => 
        t.id === tenderId 
          ? { ...t, status: 'converted', project_id: result.project?.id }
          : t
      ));
      
      console.log('Tender converted to project successfully:', result);
      alert(`Tender converted to project successfully! Project ID: ${result.project?.id}`);
      
    } catch (error) {
      console.error('Failed to convert tender:', error);
      alert('Failed to convert tender to project. Please try again.');
    } finally {
      setActionLoadingState(tenderId, 'convert', false);
    }
  };

  const handleUpdateStatus = async (tenderId, newStatus) => {
    try {
      setActionLoadingState(tenderId, 'status', true);
      const updatedTender = await tendersAPI.updateStatus(tenderId, newStatus);
      
      // Update local state
      setTenders(prev => prev.map(t => 
        t.id === tenderId ? { ...t, status: newStatus } : t
      ));
      
      console.log('Tender status updated successfully');
      alert(`Tender status updated to ${newStatus}!`);
      
    } catch (error) {
      console.error('Failed to update tender status:', error);
      alert('Failed to update tender status. Please try again.');
    } finally {
      setActionLoadingState(tenderId, 'status', false);
    }
  };

  const handlePublishDraft = async (tenderId) => {
    await handleUpdateStatus(tenderId, 'active');
  };

  const handleViewDetails = async (tender) => {
    try {
      const detailedTender = await tendersAPI.getDetails(tender.id);
      setSelectedTender(detailedTender);
      console.log('Tender details:', detailedTender);
      alert(`Viewing details for "${tender.title}". Full details modal will be implemented soon!`);
    } catch (error) {
      console.error('Failed to get tender details:', error);
      setSelectedTender(tender);
      alert(`Basic details for "${tender.title}" loaded. Full details modal coming soon!`);
    }
  };

  // Filter tenders based on current filters
  const filteredTenders = tenders.filter(tender => {
    const matchesSearch = tender.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tender.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tender.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tender.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tender.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || tender.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Utility functions
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getDaysUntilDeadline = (date) => {
    if (!date) return null;
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Edit form component
  const EditForm = ({ tender, onSave, onCancel }) => {
    const [formData, setFormData] = useState(tender);

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Estimate</label>
            <input
              type="number"
              value={formData.budget_estimate}
              onChange={(e) => setFormData({...formData, budget_estimate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            required
          />
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="submit"
            disabled={actionLoading[`${tender.id}_edit`]}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {actionLoading[`${tender.id}_edit`] ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
        </div>
      </form>
    );
  };

  // Tender Card Component
  const TenderCard = ({ tender }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
      {/* Priority Indicator */}
      <div className={`absolute top-0 left-0 w-full h-1 ${getPriorityColor(tender.priority)}`}></div>
      
      {/* Editing Mode */}
      {editingTender?.id === tender.id ? (
        <EditForm
          tender={editingTender}
          onSave={(data) => handleEditTender(tender, data)}
          onCancel={() => setEditingTender(null)}
        />
      ) : (
        <>
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
                {tender.urgent && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Urgent
                  </span>
                )}
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
                {tender.responsible || tender.lead_person || 'TBD'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                {tender.deadline && (
                  <>
                    Due: {new Date(tender.deadline).toLocaleDateString()}
                    {getDaysUntilDeadline(tender.deadline) <= 7 && getDaysUntilDeadline(tender.deadline) > 0 && (
                      <span className="ml-2 text-xs text-red-600 font-medium">
                        ({getDaysUntilDeadline(tender.deadline)} days left)
                      </span>
                    )}
                  </>
                )}
                {!tender.deadline && 'No deadline set'}
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

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
            <button 
              onClick={() => handleViewDetails(tender)}
              className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Eye className="h-4 w-4 mr-1" />
              Details
            </button>
            
            {tender.status === 'draft' && (
              <button 
                onClick={() => handlePublishDraft(tender.id)}
                disabled={actionLoading[`${tender.id}_status`]}
                className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading[`${tender.id}_status`] ? (
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-1" />
                )}
                Publish
              </button>
            )}
            
            {tender.status === 'active' && (
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
            )}
          </div>
        </>
      )}
    </div>
  );

  // Loading state
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
                  onClick={() => setShowCreateForm(!showCreateForm)}
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

          {/* Create Form */}
          {showCreateForm && (
            <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Tender</h2>
              <form onSubmit={handleCreateTender} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tender Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter tender title"
                      value={newTender.title}
                      onChange={(e) => setNewTender({ ...newTender, title: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newTender.category}
                      onChange={(e) => setNewTender({ ...newTender, category: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="General">General</option>
                      <option value="Construction">Construction</option>
                      <option value="Renovation">Renovation</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      placeholder="e.g., Nairobi, Kenya"
                      value={newTender.location}
                      onChange={(e) => setNewTender({ ...newTender, location: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                    <input
                      type="text"
                      placeholder="e.g., City Council"
                      value={newTender.client}
                      onChange={(e) => setNewTender({ ...newTender, client: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget Estimate</label>
                    <input
                      type="number"
                      placeholder="e.g., 5000000"
                      value={newTender.budget_estimate}
                      onChange={(e) => setNewTender({ ...newTender, budget_estimate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration</label>
                    <input
                      type="text"
                      placeholder="e.g., 6 months"
                      value={newTender.estimated_duration}
                      onChange={(e) => setNewTender({ ...newTender, estimated_duration: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={newTender.priority}
                      onChange={(e) => setNewTender({ ...newTender, priority: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                    <input
                      type="date"
                      value={newTender.deadline}
                      onChange={(e) => setNewTender({ ...newTender, deadline: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    required
                    placeholder="Enter detailed tender description..."
                    value={newTender.description}
                    onChange={(e) => setNewTender({ ...newTender, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  />
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading['create_submit']}
                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading['create_submit'] ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Create Tender
                  </button>
                </div>
              </form>
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
                  <p className="text-2xl font-bold text-gray-900">{statistics.active}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{statistics.draft}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{statistics.completed}</p>
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
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(statistics.totalValue / 1000000)}M</p>
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
                  <p className="text-2xl font-bold text-gray-900">{Math.round(statistics.avgSubmissions)}</p>
                  <p className="text-xs text-gray-600">Avg Submissions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg mb-6">
            <div className="flex items-center border-b border-gray-200">
              {[
                { id: 'active', label: 'Active Tenders', count: statistics.active },
                { id: 'drafts', label: 'Drafts', count: statistics.draft },
                { id: 'urgent', label: 'Urgent', count: statistics.urgent },
                { id: 'history', label: 'History', count: statistics.completed + statistics.converted }
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
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                    <option value="converted">Converted</option>
                  </select>
                  
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
                onClick={error ? refreshTenders : () => setShowCreateForm(true)}
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