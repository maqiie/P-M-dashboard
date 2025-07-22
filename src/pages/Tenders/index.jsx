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
} from "lucide-react";

import { useContext } from "react";
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
  // const { user } = useContext(AuthContext);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("active");

  // UI state
  const [selectedTender, setSelectedTender] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTender, setEditingTender] = useState(null);

  // Now you can prefill responsible in your newTender state like:
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
    responsible: user ? user.name || user.email : "", // example fallback to user email
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
            ["completed", "rejected", "cancelled", "converted"].includes(
              t.status
            )
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
      // Calculate from current tenders if API fails
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
          ? tenders.reduce((sum, t) => sum + (t.submission_count || 0), 0) /
            tenders.length
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
    if (
      !window.confirm(
        "Are you sure you want to delete this tender? This action cannot be undone."
      )
    ) {
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

  const handleConvertToProject = async (tenderId) => {
    if (
      !window.confirm(
        "Are you sure you want to convert this tender to a project? This will create a new project and mark the tender as converted."
      )
    ) {
      return;
    }

    try {
      setActionLoadingState(tenderId, "convert", true);
      const result = await tendersAPI.convertToProject(tenderId);

      setTenders((prev) =>
        prev.map((t) =>
          t.id === tenderId
            ? { ...t, status: "converted", project_id: result.project?.id }
            : t
        )
      );

      console.log("Tender converted to project successfully:", result);
      alert(
        `Tender converted to project successfully! Project ID: ${result.project?.id}`
      );
    } catch (error) {
      console.error("Failed to convert tender:", error);
      alert("Failed to convert tender to project. Please try again.");
    } finally {
      setActionLoadingState(tenderId, "convert", false);
    }
  };

  const handleUpdateStatus = async (tenderId, newStatus) => {
    try {
      setActionLoadingState(tenderId, "status", true);
      const updatedTender = await tendersAPI.updateStatus(tenderId, newStatus);

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
      console.log("Tender details:", detailedTender);
      alert(
        `Viewing details for "${tender.title}". Full details modal will be implemented soon!`
      );
    } catch (error) {
      console.error("Failed to get tender details:", error);
      setSelectedTender(tender);
      alert(
        `Basic details for "${tender.title}" loaded. Full details modal coming soon!`
      );
    }
  };

  // Filter tenders based on current filters
  const filteredTenders = tenders.filter((tender) => {
    const matchesSearch =
      tender.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || tender.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || tender.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Utility functions
  const getStatusColor = (status) => {
    const colors = {
      active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      draft: "bg-amber-50 text-amber-700 border border-amber-200",
      completed: "bg-blue-50 text-blue-700 border border-blue-200",
      rejected: "bg-red-50 text-red-700 border border-red-200",
      converted: "bg-purple-50 text-purple-700 border border-purple-200",
    };
    return (
      colors[status] || "bg-slate-50 text-slate-700 border border-slate-200"
    );
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "bg-gradient-to-r from-red-500 to-red-600",
      medium: "bg-gradient-to-r from-amber-500 to-amber-600",
      low: "bg-gradient-to-r from-emerald-500 to-emerald-600",
    };
    return colors[priority] || "bg-gradient-to-r from-slate-400 to-slate-500";
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
    const days = Math.ceil(
      (new Date(date) - new Date()) / (1000 * 60 * 60 * 24)
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
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200 shadow-inner">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Edit className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">
              Edit Tender
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Budget Estimate
              </label>
              <input
                type="number"
                value={formData.budget_estimate}
                onChange={(e) =>
                  setFormData({ ...formData, budget_estimate: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Deadline
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows="4"
              required
            />
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <button
              type="submit"
              disabled={actionLoading[`${tender.id}_edit`]}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="flex items-center px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-xl hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-lg"
            >
              <X className="h-5 w-5 mr-2" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Tender Card Component
  const TenderCard = ({ tender }) => (
    <div className="group relative bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
      {/* Priority Gradient Bar */}
      <div
        className={`h-1.5 w-full ${getPriorityColor(tender.priority)}`}
      ></div>

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
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors truncate">
                  {tender.title}
                </h3>
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(
                    tender.status
                  )}`}
                >
                  {getStatusIcon(tender.status)}
                  <span className="ml-1.5 capitalize">{tender.status}</span>
                </span>
              </div>

              {tender.urgent && (
                <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 mb-2">
                  <Zap className="h-3 w-3 mr-1" />
                  Urgent
                </div>
              )}

              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <span className="flex items-center font-medium text-blue-600">
                  <Building2 className="h-4 w-4 mr-1" />
                  {tender.category || "General"}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {tender.client || "Internal"}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => handleEditTender(tender)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Edit tender"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteTender(tender.id)}
                disabled={actionLoading[`${tender.id}_delete`]}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
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

          {/* Description */}
          <p className="text-slate-600 mb-6 leading-relaxed line-clamp-2">
            {tender.description}
          </p>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-lg mr-3">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {formatCurrency(tender.budget_estimate)}
                  </p>
                  <p className="text-xs text-slate-500">Budget</p>
                </div>
              </div>

              <div className="flex items-center text-sm">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mr-3">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {tender.location || "TBD"}
                  </p>
                  <p className="text-xs text-slate-500">Location</p>
                </div>
              </div>

              <div className="flex items-center text-sm">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mr-3">
                  <User className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {tender.responsible || tender.lead_person || "TBD"}
                  </p>
                  <p className="text-xs text-slate-500">Responsible</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mr-3">
                  <Calendar className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  {tender.deadline ? (
                    <>
                      <p className="font-semibold text-slate-900">
                        {new Date(tender.deadline).toLocaleDateString()}
                      </p>
                      {getDaysUntilDeadline(tender.deadline) <= 7 &&
                        getDaysUntilDeadline(tender.deadline) > 0 && (
                          <p className="text-xs text-red-600 font-semibold">
                            {getDaysUntilDeadline(tender.deadline)} days left
                          </p>
                        )}
                      {!getDaysUntilDeadline(tender.deadline) && (
                        <p className="text-xs text-slate-500">Deadline</p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-slate-900">
                        No deadline
                      </p>
                      <p className="text-xs text-slate-500">Deadline</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center text-sm">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-lg mr-3">
                  <Clock className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {tender.estimated_duration || "TBD"}
                  </p>
                  <p className="text-xs text-slate-500">Duration</p>
                </div>
              </div>

              <div className="flex items-center text-sm">
                <div className="flex items-center justify-center w-8 h-8 bg-cyan-100 rounded-lg mr-3">
                  <FileText className="h-4 w-4 text-cyan-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {tender.submission_count || 0}
                  </p>
                  <p className="text-xs text-slate-500">Submissions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          {tender.requirements && tender.requirements.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <Star className="h-4 w-4 mr-2 text-amber-500" />
                Key Requirements
              </h4>
              <div className="flex flex-wrap gap-2">
                {tender.requirements.slice(0, 3).map((req, index) => (
                  <span
                    key={index}
                    className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-medium"
                  >
                    {req}
                  </span>
                ))}
                {tender.requirements.length > 3 && (
                  <span className="text-xs text-slate-500 px-3 py-1.5">
                    +{tender.requirements.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-6 border-t border-slate-200">
            <button
              onClick={() => handleViewDetails(tender)}
              className="flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </button>

            {tender.status === "draft" && (
              <button
                onClick={() => handlePublishDraft(tender.id)}
                disabled={actionLoading[`${tender.id}_status`]}
                className="flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all duration-200 disabled:opacity-50"
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
                onClick={() => handleConvertToProject(tender.id)}
                disabled={actionLoading[`${tender.id}_convert`]}
                className="flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all duration-200 disabled:opacity-50"
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-500 rounded-full animate-spin mx-auto"
              style={{ animationDelay: "0.3s", animationDuration: "1.5s" }}
            ></div>
          </div>
          <div className="mt-8 space-y-2">
            <h3 className="text-2xl font-bold text-slate-800">
              Loading Tenders
            </h3>
            <p className="text-slate-600">
              Fetching your tender management data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-xl shadow-xl border-b border-slate-200/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Tenders Management
                  </h1>
                  <p className="text-slate-600 mt-1 font-medium">
                    Create, manage, and track construction project tenders
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={refreshTenders}
                  disabled={refreshing}
                  className={`group flex items-center space-x-2 px-4 py-2.5 text-sm font-medium border-2 border-slate-300 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200 ${
                    refreshing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      refreshing ? "animate-spin" : "group-hover:rotate-45"
                    } transition-transform duration-200`}
                  />
                  <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
                </button>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-5 w-5" />
                  <span>New Tender</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
          {/* Error Message */}
          {error && (
            <div className="mb-8 bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-2 bg-red-100 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-800">
                    Error Loading Tenders
                  </h3>
                  <p className="text-red-700 mt-2 leading-relaxed">{error}</p>
                  <button
                    onClick={refreshTenders}
                    className="mt-4 text-sm text-red-600 hover:text-red-800 underline underline-offset-2 font-medium"
                  >
                    Try again
                  </button>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="flex-shrink-0 p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Create Form */}
          {showCreateForm && (
            <div className="mb-8 bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Plus className="h-7 w-7 mr-3" />
                  Create New Tender
                </h2>
                <p className="text-blue-100 mt-2">
                  Fill in the details below to create a new tender for your
                  project
                </p>
              </div>

              <form onSubmit={handleCreateTender} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">
                      Tender Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter tender title"
                      value={newTender.title}
                      onChange={(e) =>
                        setNewTender({ ...newTender, title: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">
                      Category
                    </label>
                    <select
                      value={newTender.category}
                      onChange={(e) =>
                        setNewTender({ ...newTender, category: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="General">General</option>
                      <option value="Construction">Construction</option>
                      <option value="Renovation">Renovation</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Nairobi, Kenya"
                      value={newTender.location}
                      onChange={(e) =>
                        setNewTender({ ...newTender, location: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">
                      Client
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., City Council"
                      value={newTender.client}
                      onChange={(e) =>
                        setNewTender({ ...newTender, client: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">
                      Budget Estimate
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 5000000"
                      value={newTender.budget_estimate}
                      onChange={(e) =>
                        setNewTender({
                          ...newTender,
                          budget_estimate: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">
                      Estimated Duration
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 6 months"
                      value={newTender.estimated_duration}
                      onChange={(e) =>
                        setNewTender({
                          ...newTender,
                          estimated_duration: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">
                      Priority
                    </label>
                    <select
                      value={newTender.priority}
                      onChange={(e) =>
                        setNewTender({ ...newTender, priority: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">
                      Deadline
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]} // today's date as minimum
                      value={newTender.deadline}
                      onChange={(e) =>
                        setNewTender({ ...newTender, deadline: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-8">
                  <label className="block text-sm font-bold text-slate-700">
                    Description *
                  </label>
                  <textarea
                    required
                    placeholder="Enter detailed tender description..."
                    value={newTender.description}
                    onChange={(e) =>
                      setNewTender({
                        ...newTender,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows="4"
                  />
                </div>

                <div className="flex items-center justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="px-6 py-3 text-slate-600 border-2 border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading["create_submit"]}
                    className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading["create_submit"] ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <Save className="h-5 w-5" />
                    )}
                    <span>Create Tender</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {[
              {
                label: "Active Tenders",
                value: statistics.active,
                icon: Activity,
                color: "emerald",
              },
              {
                label: "Draft Tenders",
                value: statistics.draft,
                icon: FileText,
                color: "amber",
              },
              {
                label: "Completed",
                value: statistics.completed,
                icon: CheckCircle,
                color: "blue",
              },
              {
                label: "Total Value",
                value: `${formatCurrency(statistics.totalValue / 1000000)}M`,
                icon: DollarSign,
                color: "purple",
              },
              {
                label: "Avg Submissions",
                value: Math.round(statistics.avgSubmissions),
                icon: TrendingUp,
                color: "orange",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 bg-${stat.color}-100 rounded-2xl group-hover:scale-110 transition-transform duration-200`}
                  >
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                    <p className="text-sm font-medium text-slate-600">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs and Filters */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl mb-8 overflow-hidden">
            {/* Tabs */}
            <div className="border-b-2 border-slate-200">
              <div className="flex items-center">
                {[
                  {
                    id: "active",
                    label: "Active Tenders",
                    count: statistics.active,
                    icon: Activity,
                  },
                  {
                    id: "drafts",
                    label: "Drafts",
                    count: statistics.draft,
                    icon: FileText,
                  },
                  {
                    id: "urgent",
                    label: "Urgent",
                    count: statistics.urgent,
                    icon: Zap,
                  },
                  {
                    id: "history",
                    label: "History",
                    count: statistics.completed + statistics.converted,
                    icon: CheckCircle,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-3 px-8 py-6 font-semibold text-sm border-b-4 transition-all duration-200 ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 bg-blue-50"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className="bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-xs font-bold">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search tenders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3 w-full sm:w-80 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
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
                    className="px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-sm font-semibold text-slate-600">
                    {filteredTenders.length} tender
                    {filteredTenders.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tenders Grid */}
          {filteredTenders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredTenders.map((tender) => (
                <TenderCard key={tender.id} tender={tender} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="p-6 bg-slate-100 rounded-full w-32 h-32 mx-auto flex items-center justify-center mb-8">
                  <Briefcase className="h-16 w-16 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-700 mb-4">
                  {error ? "Failed to Load Tenders" : "No Tenders Found"}
                </h3>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  {error
                    ? "There was an issue connecting to the server. Please check your connection and try again."
                    : "No tenders match your current filters. Try adjusting your search criteria or create a new tender to get started."}
                </p>
                <button
                  onClick={
                    error ? refreshTenders : () => setShowCreateForm(true)
                  }
                  className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl"
                >
                  {error ? (
                    <>
                      <RefreshCw className="h-6 w-6" />
                      <span>Try Again</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-6 w-6" />
                      <span>Create First Tender</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TendersPage;
