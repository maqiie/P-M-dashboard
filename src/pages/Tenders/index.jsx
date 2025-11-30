import React, { useState, useEffect, useCallback } from "react";
import { tendersAPI } from "../../services/api";
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
  Zap,
  Users,
  Star,
  Activity,
  Package,
  Loader
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const TendersPage = () => {
  const { user } = useAuth();
  
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
    avgSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("active");

  // UI state
  const [selectedTender, setSelectedTender] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTender, setEditingTender] = useState(null);

  // Convert to Project Modal state
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertingTender, setConvertingTender] = useState(null);
  const [projectDates, setProjectDates] = useState({
    start_date: "",
    finishing_date: "",
    supervisor_id: ""
  });

  const [newTender, setNewTender] = useState({
    title: "",
    description: "",
    location: "",
    budget_estimate: "",
    priority: "medium",
    deadline: "",
    category: "General",
    client: "",
    estimated_duration: "",
    requirements: [],
    responsible: user ? user.name || user.email : "",
  });

  // Load tenders based on active tab
  const loadTenders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let data = [];
      
      console.log(`Loading tenders for tab: ${activeTab}`);
      
      switch (activeTab) {
        case "active":
          try {
            data = await tendersAPI.getActive();
          } catch (error) {
            console.warn("Active endpoint failed, using filtered approach");
            const allTenders = await tendersAPI.getMy();
            data = allTenders.filter((t) => t.status === "active");
          }
          break;
        case "drafts":
          try {
            data = await tendersAPI.getDrafts();
          } catch (error) {
            console.warn("Drafts endpoint failed, using filtered approach");
            const allTenders = await tendersAPI.getMy();
            data = allTenders.filter((t) => t.status === "draft");
          }
          break;
        case "urgent":
          try {
            data = await tendersAPI.getUrgent();
          } catch (error) {
            console.warn("Urgent endpoint failed, using filtered approach");
            const allTenders = await tendersAPI.getMy();
            data = allTenders.filter((t) => t.urgent);
          }
          break;
        case "history":
          const allTenders = await tendersAPI.getMy();
          data = allTenders.filter((t) =>
            ["completed", "rejected", "cancelled", "converted"].includes(t.status)
          );
          break;
        default:
          data = await tendersAPI.getMy();
      }
      
      console.log(`Loaded ${data.length} tenders for ${activeTab} tab`);
      setTenders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load tenders:", error);
      setError(error.message || "Failed to load tenders. Please try again.");
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
      console.error("Failed to load statistics:", error);
      calculateLocalStatistics();
    }
  }, [tenders]);

  // Calculate statistics from local data
  const calculateLocalStatistics = useCallback(() => {
    const stats = {
      total: tenders.length,
      active: tenders.filter((t) => t.status === "active").length,
      draft: tenders.filter((t) => t.status === "draft").length,
      completed: tenders.filter((t) => t.status === "completed").length,
      rejected: tenders.filter((t) => t.status === "rejected").length,
      converted: tenders.filter((t) => t.status === "converted").length,
      urgent: tenders.filter((t) => t.urgent).length,
      expired: tenders.filter((t) => t.expired).length,
      totalValue: tenders.reduce((sum, t) => sum + (t.budget_estimate || 0), 0),
      avgSubmissions:
        tenders.length > 0
          ? tenders.reduce((sum, t) => sum + (t.submission_count || 0), 0) / tenders.length
          : 0,
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
    setActionLoading((prev) => ({
      ...prev,
      [`${tenderId}_${action}`]: state,
    }));
  };

  const resetForm = () => {
    setNewTender({
      title: "",
      description: "",
      location: "",
      budget_estimate: "",
      priority: "medium",
      deadline: "",
      category: "General",
      client: "",
      estimated_duration: "",
      requirements: [],
      responsible: user ? user.name || user.email : "",
    });
  };

  const handleCreateTender = async (e) => {
    e.preventDefault();
    try {
      setActionLoadingState("create", "submit", true);
      const tenderData = {
        ...newTender,
        budget_estimate: parseFloat(newTender.budget_estimate) || 0,
        status: "draft",
      };
      const createdTender = await tendersAPI.create(tenderData);
      console.log("Tender created successfully:", createdTender);
      setTenders((prev) => [createdTender, ...prev]);
      resetForm();
      setShowCreateForm(false);
      alert("Tender created successfully!");
    } catch (error) {
      console.error("Failed to create tender:", error);
      alert("Failed to create tender. Please try again.");
    } finally {
      setActionLoadingState("create", "submit", false);
    }
  };

  const handleEditTender = async (tender, updatedData = null) => {
    if (!updatedData) {
      setEditingTender({
        ...tender,
        budget_estimate: tender.budget_estimate?.toString() || "",
        deadline: tender.deadline || "",
      });
      return;
    }
    try {
      setActionLoadingState(tender.id, "edit", true);
      const processedData = {
        ...updatedData,
        budget_estimate: parseFloat(updatedData.budget_estimate) || 0,
      };
      const updatedTender = await tendersAPI.update(tender.id, processedData);
      console.log("Tender updated successfully:", updatedTender);
      setTenders((prev) =>
        prev.map((t) => (t.id === tender.id ? { ...t, ...updatedTender } : t))
      );
      setEditingTender(null);
      alert("Tender updated successfully!");
    } catch (error) {
      console.error("Failed to update tender:", error);
      alert("Failed to update tender. Please try again.");
    } finally {
      setActionLoadingState(tender.id, "edit", false);
    }
  };

  const handleDeleteTender = async (tenderId) => {
    if (!window.confirm("Are you sure you want to delete this tender? This action cannot be undone.")) {
      return;
    }
    try {
      setActionLoadingState(tenderId, "delete", true);
      await tendersAPI.delete(tenderId);
      setTenders((prev) => prev.filter((t) => t.id !== tenderId));
      console.log("Tender deleted successfully");
      alert("Tender deleted successfully!");
    } catch (error) {
      console.error("Failed to delete tender:", error);
      alert("Failed to delete tender. Please try again.");
      await refreshTenders();
    } finally {
      setActionLoadingState(tenderId, "delete", false);
    }
  };

  // Opens the convert modal
  const handleConvertToProject = (tender) => {
    setConvertingTender(tender);
    setProjectDates({
      start_date: new Date().toISOString().split('T')[0], // Default to today
      finishing_date: "",
      supervisor_id: ""
    });
    setShowConvertModal(true);
  };

  // Actually submits the conversion with dates
  const submitConvertToProject = async () => {
    if (!convertingTender) return;
    
    if (!projectDates.finishing_date) {
      alert("Please select a project finishing date");
      return;
    }

    if (!projectDates.start_date) {
      alert("Please select a project start date");
      return;
    }

    // Validate dates
    if (new Date(projectDates.finishing_date) <= new Date(projectDates.start_date)) {
      alert("Finishing date must be after the start date");
      return;
    }

    try {
      setActionLoadingState(convertingTender.id, "convert", true);
      
      const result = await tendersAPI.convertToProject(convertingTender.id, {
        start_date: projectDates.start_date,
        finishing_date: projectDates.finishing_date,
        supervisor_id: projectDates.supervisor_id || null
      });
      
      setTenders((prev) =>
        prev.map((t) =>
          t.id === convertingTender.id 
            ? { ...t, status: "converted", project_id: result.project?.id } 
            : t
        )
      );
      
      console.log("Tender converted to project successfully:", result);
      alert(`Tender converted to project successfully! Project ID: ${result.project?.id}`);
      
      // Close modal and reset
      setShowConvertModal(false);
      setConvertingTender(null);
      setProjectDates({ start_date: "", finishing_date: "", supervisor_id: "" });
      
      // Refresh to update the list
      await refreshTenders();
      
    } catch (error) {
      console.error("Failed to convert tender:", error);
      alert("Failed to convert tender to project. Please try again.");
    } finally {
      setActionLoadingState(convertingTender.id, "convert", false);
    }
  };

  const handleUpdateStatus = async (tenderId, newStatus) => {
    try {
      setActionLoadingState(tenderId, "status", true);
      await tendersAPI.updateStatus(tenderId, newStatus);
      setTenders((prev) =>
        prev.map((t) => (t.id === tenderId ? { ...t, status: newStatus } : t))
      );
      console.log("Tender status updated successfully");
      alert(`Tender status updated to ${newStatus}!`);
    } catch (error) {
      console.error("Failed to update tender status:", error);
      alert("Failed to update tender status. Please try again.");
    } finally {
      setActionLoadingState(tenderId, "status", false);
    }
  };

  const handlePublishDraft = async (tenderId) => {
    await handleUpdateStatus(tenderId, "active");
  };

  const handleViewDetails = async (tender) => {
    try {
      const detailedTender = await tendersAPI.getDetails(tender.id);
      setSelectedTender(detailedTender);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Failed to get tender details:", error);
      setSelectedTender(tender);
      setShowDetailModal(true);
    }
  };

  // Filter tenders based on current filters
  const filteredTenders = tenders.filter((tender) => {
    const matchesSearch =
      tender.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || tender.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || tender.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Utility functions
  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-700 border-green-200",
      draft: "bg-amber-100 text-amber-700 border-amber-200",
      completed: "bg-blue-100 text-blue-700 border-blue-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
      converted: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "bg-red-500",
      medium: "bg-yellow-500",
      low: "bg-green-500",
    };
    return colors[priority] || "bg-gray-400";
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: <Activity className="h-4 w-4" />,
      draft: <FileText className="h-4 w-4" />,
      completed: <CheckCircle className="h-4 w-4" />,
      rejected: <AlertTriangle className="h-4 w-4" />,
      converted: <ArrowRight className="h-4 w-4" />,
    };
    return icons[status] || <Briefcase className="h-4 w-4" />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getDaysUntilDeadline = (date) => {
    if (!date) return null;
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const calculateProjectDuration = () => {
    if (!projectDates.start_date || !projectDates.finishing_date) return null;
    const days = Math.ceil(
      (new Date(projectDates.finishing_date) - new Date(projectDates.start_date)) / 
      (1000 * 60 * 60 * 24)
    );
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
      <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Edit className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Edit Tender</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Budget</label>
              <input
                type="number"
                value={formData.budget_estimate}
                onChange={(e) => setFormData({ ...formData, budget_estimate: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="4"
              required
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={actionLoading[`${tender.id}_edit`]}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-xl transition-all font-bold disabled:opacity-50"
            >
              {actionLoading[`${tender.id}_edit`] ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Save className="h-5 w-5 mr-2" />
              )}
              Save Changes
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Tender Card Component
  const TenderCard = ({ tender }) => (
    <div className="group bg-white rounded-3xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-300 overflow-hidden">
      {/* Priority stripe */}
      <div className={`h-2 ${getPriorityColor(tender.priority)} group-hover:h-3 transition-all duration-300`}></div>

      {/* Editing Mode */}
      {editingTender?.id === tender.id ? (
        <div className="p-6">
          <EditForm
            tender={editingTender}
            onSave={(data) => handleEditTender(tender, data)}
            onCancel={() => setEditingTender(null)}
          />
        </div>
      ) : (
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                {tender.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${getStatusColor(tender.status)}`}>
                  {getStatusIcon(tender.status)}
                  <span className="capitalize">{tender.status}</span>
                </span>
                {tender.urgent && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold">
                    <Zap className="h-3 w-3" />
                    Urgent
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold">
                  <Building2 className="h-3 w-3" />
                  {tender.category || "General"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => handleEditTender(tender)}
                className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                title="Edit"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDeleteTender(tender.id)}
                disabled={actionLoading[`${tender.id}_delete`]}
                className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                title="Delete"
              >
                {actionLoading[`${tender.id}_delete`] ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6 line-clamp-2">{tender.description}</p>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-600 mb-0.5">Budget</p>
                <p className="font-black text-gray-900 text-sm truncate">{formatCurrency(tender.budget_estimate)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-600 mb-0.5">Location</p>
                <p className="font-black text-gray-900 text-sm truncate">{tender.location || "TBD"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-600 mb-0.5">Deadline</p>
                <p className="font-black text-gray-900 text-sm truncate">
                  {tender.deadline ? new Date(tender.deadline).toLocaleDateString() : "No deadline"}
                </p>
                {getDaysUntilDeadline(tender.deadline) <= 7 && getDaysUntilDeadline(tender.deadline) > 0 && (
                  <p className="text-xs text-red-600 font-bold">{getDaysUntilDeadline(tender.deadline)} days left</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-600 mb-0.5">Responsible</p>
                <p className="font-black text-gray-900 text-sm truncate">{tender.responsible || "TBD"}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button
              onClick={() => handleViewDetails(tender)}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all font-bold text-sm transform hover:scale-105"
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </button>
            {tender.status === "draft" && (
              <button
                onClick={() => handlePublishDraft(tender.id)}
                disabled={actionLoading[`${tender.id}_status`]}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-xl hover:from-green-100 hover:to-green-200 transition-all font-bold text-sm transform hover:scale-105 disabled:opacity-50"
              >
                {actionLoading[`${tender.id}_status`] ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Publish
              </button>
            )}
            {tender.status === "active" && (
              <button
                onClick={() => handleConvertToProject(tender)}
                disabled={actionLoading[`${tender.id}_convert`]}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all font-bold text-sm transform hover:scale-105 disabled:opacity-50"
              >
                {actionLoading[`${tender.id}_convert`] ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Convert
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-20 blur-2xl animate-pulse"></div>
          </div>
          <p className="text-2xl text-gray-900 font-black mb-2">Loading Tenders</p>
          <p className="text-sm text-gray-600 font-medium">Fetching your tender data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="w-full px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Briefcase className="h-9 w-9 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Tenders
                  </h1>
                  <p className="text-lg text-gray-600 mt-1">
                    {tenders.length} tenders • {statistics.active} active • {statistics.draft} drafts
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refreshTenders}
                disabled={refreshing}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all font-bold disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-lg"
              >
                <Plus className="h-6 w-6 mr-2" />
                New Tender
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-black text-red-900">Error Loading Tenders</h3>
                <p className="text-red-700 mt-2">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-8 bg-white rounded-3xl border-2 border-gray-200 shadow-xl overflow-hidden">
            <div className="p-6 lg:p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-gray-900">Create New Tender</h2>
                  <p className="text-sm text-gray-600 mt-1">Fill in the details below</p>
                </div>
                <button onClick={() => setShowCreateForm(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <form onSubmit={handleCreateTender} className="p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={newTender.title}
                    onChange={(e) => setNewTender({ ...newTender, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter tender title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                  <select
                    value={newTender.category}
                    onChange={(e) => setNewTender({ ...newTender, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="General">General</option>
                    <option value="Construction">Construction</option>
                    <option value="Renovation">Renovation</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Budget</label>
                  <input
                    type="number"
                    value={newTender.budget_estimate}
                    onChange={(e) => setNewTender({ ...newTender, budget_estimate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Deadline</label>
                  <input
                    type="date"
                    value={newTender.deadline}
                    onChange={(e) => setNewTender({ ...newTender, deadline: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                <textarea
                  required
                  value={newTender.description}
                  onChange={(e) => setNewTender({ ...newTender, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="4"
                  placeholder="Enter tender description"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading["create_submit"]}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold disabled:opacity-50"
                >
                  {actionLoading["create_submit"] ? (
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    "Create Tender"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs and Filters */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 mb-8">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {[
                { id: "active", label: "Active", count: statistics.active, icon: Activity },
                { id: "drafts", label: "Drafts", count: statistics.draft, icon: FileText },
                { id: "urgent", label: "Urgent", count: statistics.urgent, icon: Zap },
                { id: "history", label: "History", count: statistics.completed, icon: CheckCircle },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-8 py-6 font-bold border-b-4 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full text-xs font-black">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tenders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tenders Grid */}
        {filteredTenders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTenders.map((tender) => (
              <TenderCard key={tender.id} tender={tender} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="relative inline-block mb-6">
              <Briefcase className="h-32 w-32 text-gray-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
            </div>
            <h3 className="text-4xl font-black text-gray-900 mb-4">No Tenders Found</h3>
            <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto">
              {error ? "Failed to load tenders. Please try again." : "Create your first tender to get started"}
            </p>
            <button
              onClick={error ? refreshTenders : () => setShowCreateForm(true)}
              className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-xl"
            >
              {error ? <RefreshCw className="h-7 w-7 mr-3" /> : <Plus className="h-7 w-7 mr-3" />}
              {error ? "Try Again" : "Create First Tender"}
            </button>
          </div>
        )}

        {/* Convert to Project Modal */}
        {showConvertModal && convertingTender && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 mb-1">Convert to Project</h2>
                    <p className="text-sm text-gray-600">Set project dates for "{convertingTender.title}"</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowConvertModal(false);
                      setConvertingTender(null);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Info about tender deadline */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-amber-800">Tender Submission Deadline</p>
                      <p className="text-sm text-amber-700">
                        {convertingTender.deadline 
                          ? new Date(convertingTender.deadline).toLocaleDateString() 
                          : "No deadline set"}
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        This is when tender submissions are due, not the project completion date.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Project Start Date */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Project Start Date *
                  </label>
                  <input
                    type="date"
                    value={projectDates.start_date}
                    onChange={(e) => setProjectDates({ ...projectDates, start_date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">When will the project work begin?</p>
                </div>

                {/* Project Finishing Date */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <Target className="h-4 w-4 inline mr-2" />
                    Project Finishing Date *
                  </label>
                  <input
                    type="date"
                    value={projectDates.finishing_date}
                    onChange={(e) => setProjectDates({ ...projectDates, finishing_date: e.target.value })}
                    min={projectDates.start_date}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">When should the project be completed?</p>
                </div>

                {/* Estimated Duration Display */}
                {calculateProjectDuration() !== null && calculateProjectDuration() > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-bold text-blue-800">Project Duration</p>
                        <p className="text-sm text-blue-700">
                          {calculateProjectDuration()} days
                          {calculateProjectDuration() > 30 && (
                            <span className="ml-1">
                              (~{Math.round(calculateProjectDuration() / 30)} months)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Budget Info */}
                {convertingTender.budget_estimate > 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-bold text-green-800">Budget from Tender</p>
                        <p className="text-sm text-green-700">
                          {formatCurrency(convertingTender.budget_estimate)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowConvertModal(false);
                      setConvertingTender(null);
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitConvertToProject}
                    disabled={!projectDates.finishing_date || !projectDates.start_date || actionLoading[`${convertingTender.id}_convert`]}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-xl transition-all font-bold disabled:opacity-50"
                  >
                    {actionLoading[`${convertingTender.id}_convert`] ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <ArrowRight className="h-5 w-5 mr-2" />
                        Convert to Project
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedTender && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 lg:p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">{selectedTender.title}</h2>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${getStatusColor(selectedTender.status)}`}>
                        {getStatusIcon(selectedTender.status)}
                        <span className="capitalize">{selectedTender.status}</span>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedTender(null);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 lg:p-8 space-y-6">
                {selectedTender.description && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedTender.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-bold text-gray-700">Budget</span>
                    </div>
                    <p className="text-gray-900 font-black">{formatCurrency(selectedTender.budget_estimate)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-bold text-gray-700">Deadline</span>
                    </div>
                    <p className="text-gray-900 font-black">
                      {selectedTender.deadline ? new Date(selectedTender.deadline).toLocaleDateString() : "No deadline"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-bold text-gray-700">Location</span>
                    </div>
                    <p className="text-gray-900 font-black">{selectedTender.location || "TBD"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-bold text-gray-700">Responsible</span>
                    </div>
                    <p className="text-gray-900 font-black">{selectedTender.responsible || "TBD"}</p>
                  </div>
                </div>
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleEditTender(selectedTender);
                    }}
                    className="flex-1 px-6 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all font-bold"
                  >
                    <Edit className="h-5 w-5 inline mr-2" />
                    Edit
                  </button>
                  {selectedTender.status === "active" && (
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleConvertToProject(selectedTender);
                      }}
                      className="flex-1 px-6 py-3 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-all font-bold"
                    >
                      <ArrowRight className="h-5 w-5 inline mr-2" />
                      Convert
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleDeleteTender(selectedTender.id);
                    }}
                    className="flex-1 px-6 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all font-bold"
                  >
                    <Trash2 className="h-5 w-5 inline mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TendersPage;