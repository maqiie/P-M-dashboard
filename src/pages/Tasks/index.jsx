import React, { useState, useEffect } from "react";
import { tasksAPI, customFieldsAPI, teamMembersAPI } from "../../services/api";
import CustomFieldsManager from "./CustomFieldsManager";
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Users,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  MoreVertical,
  Eye,
  Edit,
  Grid3X3,
  List,
  CalendarDays,
  Flag,
  User,
  MessageSquare,
  Paperclip,
  PlayCircle,
  PauseCircle,
  X,
  Save,
  Tag,
  Copy,
  Trash2,
  ChevronDown,
  ChevronRight,
  Star,
  Timer,
  FileText,
  Settings,
  Hash,
  Folder,
  Repeat,
  GitBranch,
  CheckSquare,
  Activity,
  TrendingUp,
  BarChart3,
  Columns,
  ArrowUpDown,
  RotateCcw,
  Loader,
  UserPlus,
  DollarSign,
  Send,
  Link2,
} from "lucide-react";

const TasksPage = ({ initialView = "list" }) => {
  // Core state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskStats, setTaskStats] = useState({});

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCustomFields, setShowCustomFields] = useState(false);
  const [groupBy, setGroupBy] = useState("none");
  const [sortBy, setSortBy] = useState("due_date");
  const [currentList, setCurrentList] = useState("all-tasks");

  // Data for dropdowns
  const [teamMembers, setTeamMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [customFields, setCustomFields] = useState([]);

  // Form state
  const [newTaskForm, setNewTaskForm] = useState({
    title: "",
    description: "",
    due_date: "",
    start_date: "",
    status: "pending",
    priority: "medium",
    estimated_hours: "",
    project_id: "",
    assignee_ids: [],
    watcher_ids: [],
    tags: [],
    custom_fields: {},
  });

  // Time tracking state
  const [activeTimer, setActiveTimer] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [timeEntry, setTimeEntry] = useState({
    hours: "",
    description: "",
    billable: false,
  });

  // Lists configuration
  const lists = [
    {
      id: "all-tasks",
      name: "All Tasks",
      color: "#6B7280",
      count: taskStats.total || 0,
    },
    {
      id: "active-tasks",
      name: "Active Tasks",
      color: "#3B82F6",
      count: (taskStats.pending || 0) + (taskStats.in_progress || 0),
    },
    {
      id: "in-progress",
      name: "In Progress",
      color: "#8B5CF6",
      count: taskStats.in_progress || 0,
    },
    {
      id: "overdue",
      name: "Overdue",
      color: "#EF4444",
      count: taskStats.overdue || 0,
    },
    {
      id: "completed",
      name: "Completed",
      color: "#10B981",
      count: taskStats.completed || 0,
    },
  ];

  // Status and priority configurations
  const statusOptions = [
    { value: "pending", label: "Pending", color: "#6B7280" },
    { value: "in_progress", label: "In Progress", color: "#3B82F6" },
    { value: "in_review", label: "In Review", color: "#8B5CF6" },
    { value: "completed", label: "Completed", color: "#10B981" },
    { value: "cancelled", label: "Cancelled", color: "#EF4444" },
    { value: "on_hold", label: "On Hold", color: "#F59E0B" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low", color: "#10B981", icon: "⬇️" },
    { value: "medium", label: "Medium", color: "#6B7280", icon: "➖" },
    { value: "high", label: "High", color: "#F59E0B", icon: "⚡" },
    { value: "urgent", label: "Urgent", color: "#EF4444", icon: "🔥" },
  ];

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [currentList]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [tasksData, teamData, projectsData, customFieldsData, statsData] =
        await Promise.all([
          tasksAPI.getAll(),
          teamMembersAPI.getAll(),
          tasksAPI.projects.getAll(),
          customFieldsAPI.getAll(),
          tasksAPI.getStatistics(),
        ]);

      setTasks(tasksData.tasks || []);
      setTeamMembers(teamData.team_members || teamData || []);
      setProjects(projectsData.projects || projectsData || []);
      setCustomFields(customFieldsData.custom_fields || []);
      setTaskStats(statsData.statistics || {});
    } catch (error) {
      console.error("Failed to load initial data:", error);
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);

      let filters = {};
      switch (currentList) {
        case "active-tasks":
          filters.filter = "active";
          break;
        case "in-progress":
          filters.status = "in_progress";
          break;
        case "overdue":
          filters.filter = "overdue";
          break;
        case "completed":
          filters.status = "completed";
          break;
        default:
          break;
      }

      const response = await tasksAPI.getAll(filters);
      setTasks(response.tasks || []);
      setTaskStats(response.statistics || {});
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  // Create new task
  const handleCreateTask = async () => {
    try {
      setLoading(true);
      await tasksAPI.createWithCustomFields(
        newTaskForm,
        newTaskForm.custom_fields
      );

      await loadTasks();

      setNewTaskForm({
        title: "",
        description: "",
        due_date: "",
        start_date: "",
        status: "pending",
        priority: "medium",
        estimated_hours: "",
        project_id: "",
        assignee_ids: [],
        watcher_ids: [],
        tags: [],
        custom_fields: {},
      });
      setShowCreateTask(false);

      alert("Task created successfully!");
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update task status
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      await loadTasks();
    } catch (error) {
      console.error("Failed to update task status:", error);
      alert("Failed to update task status.");
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await tasksAPI.delete(taskId);
      await loadTasks();
      alert("Task deleted successfully!");
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("Failed to delete task.");
    }
  };

  // Time tracking
  const startTimer = (taskId) => {
    setActiveTimer(taskId);
    setTimeElapsed(0);
    // In real app, start actual timer interval
  };

  const stopTimer = () => {
    if (activeTimer) {
      setShowTimeModal(true);
    }
    setActiveTimer(null);
    setTimeElapsed(0);
  };

  const logTime = async () => {
    try {
      await tasksAPI.logTime(activeTimer, timeEntry);
      setShowTimeModal(false);
      setTimeEntry({ hours: "", description: "", billable: false });
      await loadTasks();
    } catch (error) {
      console.error("Failed to log time:", error);
      alert("Failed to log time.");
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.id?.toString().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || task.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || task.priority === filterPriority;
    const matchesAssignee =
      filterAssignee === "all" ||
      (task.assignees &&
        task.assignees.some((a) => a.id.toString() === filterAssignee));
    const matchesProject =
      filterProject === "all" || task.project_id?.toString() === filterProject;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesAssignee &&
      matchesProject
    );
  });

  // Custom field value component
  const CustomFieldValue = ({ field, value, onChange, disabled = false }) => {
    const renderField = () => {
      switch (field.field_type) {
        case "text":
          return (
            <input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          );
        case "long_text":
          return (
            <textarea
              value={value || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              disabled={disabled}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          );
        case "number":
        case "currency":
          return (
            <input
              type="number"
              value={value || ""}
              onChange={(e) =>
                onChange(field.id, parseFloat(e.target.value) || 0)
              }
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          );
        case "date":
          return (
            <input
              type="date"
              value={value || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          );
        case "dropdown":
          return (
            <select
              value={value || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select...</option>
              {field.options?.values?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        case "checkbox":
          return (
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(field.id, e.target.checked)}
              disabled={disabled}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 disabled:opacity-50"
            />
          );
        case "user":
          return (
            <select
              value={value || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select user...</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          );
        default:
          return (
            <input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          );
      }
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.name}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {renderField()}
        {field.description && (
          <p className="text-xs text-gray-500 mt-1">{field.description}</p>
        )}
      </div>
    );
  };

  // Task card component
  const TaskCard = ({ task }) => (
    <div
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300 p-4 cursor-pointer group"
      onClick={() => setSelectedTask(task) || setShowTaskDetail(true)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 font-mono">#{task.id}</span>
          {task.is_starred && (
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
          )}
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span
            className="px-2 py-1 rounded text-xs font-medium text-white"
            style={{
              backgroundColor:
                statusOptions.find((s) => s.value === task.status)?.color ||
                "#6B7280",
            }}
          >
            {statusOptions.find((s) => s.value === task.status)?.label ||
              task.status}
          </span>
          <button
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="flex items-start space-x-2 mb-2">
        <div
          className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
          style={{
            backgroundColor:
              priorityOptions.find((p) => p.value === task.priority)?.color ||
              "#6B7280",
          }}
        />
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
          {task.title}
        </h3>
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Assignees */}
      {task.assignees && task.assignees.length > 0 && (
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex -space-x-1">
            {task.assignees.slice(0, 3).map((assignee, index) => (
              <div
                key={index}
                className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                title={assignee.name}
              >
                {assignee.name?.charAt(0) || "U"}
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
          {task.watchers && task.watchers.length > 0 && (
            <div className="flex items-center text-xs text-gray-500">
              <Eye className="h-3 w-3 mr-1" />
              {task.watchers.length}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          {task.due_date && <span>Due: {task.due_date}</span>}
          {task.estimated_hours && (
            <span className="flex items-center">
              <Timer className="h-3 w-3 mr-1" />
              {task.estimated_hours}h
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {activeTimer === task.id ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                stopTimer();
              }}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
              title="Stop timer"
            >
              <PauseCircle className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                startTimer(task.id);
              }}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
              title="Start timer"
            >
              <PlayCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Custom fields preview */}
      {task.custom_fields && Object.keys(task.custom_fields).length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            {Object.entries(task.custom_fields)
              .slice(0, 2)
              .map(([fieldName, value]) => (
                <span
                  key={fieldName}
                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                >
                  {fieldName}: {value}
                </span>
              ))}
            {Object.keys(task.custom_fields).length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{Object.keys(task.custom_fields).length - 2} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (loading && tasks.length === 0) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Tasks
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadTasks}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header with Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200">
        {/* Breadcrumb */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-500">Construction Projects</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <button
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              onClick={() => setCurrentList("all-tasks")}
            >
              <Hash className="h-4 w-4" />
              <span>Tasks</span>
            </button>
            {currentList !== "all-tasks" && (
              <>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 font-medium">
                  {lists.find((l) => l.id === currentList)?.name}
                </span>
              </>
            )}
          </div>
        </div>

        {/* List Navigation */}
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {lists.map((list) => (
              <button
                key={list.id}
                onClick={() => setCurrentList(list.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${
                  currentList === list.id
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: list.color }}
                />
                <span>{list.name}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    currentList === list.id
                      ? "bg-blue-200 text-blue-800"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {list.count}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCustomFields(true)}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
          >
            <Settings className="h-4 w-4" />
            <span>Custom Fields</span>
          </button>
        </div>

        {/* Main Toolbar */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  showFilters
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Filter className="h-4 w-4" /> <span>Filters</span>
                {(filterStatus !== "all" ||
                  filterPriority !== "all" ||
                  filterAssignee !== "all" ||
                  filterProject !== "all") && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </button>

              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("board")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "board"
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowCreateTask(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>New Task</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-4 gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Statuses</option>
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>

                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Priorities</option>
                  {priorityOptions.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>

                <select
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Assignees</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => {
                    setFilterStatus("all");
                    setFilterPriority("all");
                    setFilterAssignee("all");
                    setFilterProject("all");
                  }}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Views */}
      <div className="flex-1 overflow-auto">
        {viewMode === "list" && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {viewMode === "board" && (
          <div className="p-6">
            <div className="flex space-x-6 overflow-x-auto min-h-full">
              {statusOptions.map((status) => {
                const statusTasks = filteredTasks.filter(
                  (t) => t.status === status.value
                );
                return (
                  <div key={status.value} className="flex-shrink-0 w-80">
                    <div className="bg-gray-50 rounded-lg p-4 h-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: status.color }}
                          />
                          <h3 className="font-medium text-gray-900">
                            {status.label}
                          </h3>
                        </div>
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                          {statusTasks.length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {statusTasks.map((task) => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredTasks.length === 0 && !loading && (
          <div className="p-6">
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No tasks found
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first task to get started
              </p>
              <button
                onClick={() => setShowCreateTask(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Task
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Create New Task
              </h2>
              <button
                onClick={() => setShowCreateTask(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Task Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Task Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTaskForm.title}
                      onChange={(e) =>
                        setNewTaskForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="What needs to be done?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newTaskForm.description}
                      onChange={(e) =>
                        setNewTaskForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={4}
                      placeholder="Add more details..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={newTaskForm.status}
                        onChange={(e) =>
                          setNewTaskForm((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {statusOptions.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={newTaskForm.priority}
                        onChange={(e) =>
                          setNewTaskForm((prev) => ({
                            ...prev,
                            priority: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {priorityOptions.map((priority) => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={newTaskForm.start_date}
                        onChange={(e) =>
                          setNewTaskForm((prev) => ({
                            ...prev,
                            start_date: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={newTaskForm.due_date}
                        onChange={(e) =>
                          setNewTaskForm((prev) => ({
                            ...prev,
                            due_date: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      value={newTaskForm.estimated_hours}
                      onChange={(e) =>
                        setNewTaskForm((prev) => ({
                          ...prev,
                          estimated_hours: e.target.value,
                        }))
                      }
                      placeholder="e.g., 8"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project
                    </label>
                    <select
                      value={newTaskForm.project_id}
                      onChange={(e) =>
                        setNewTaskForm((prev) => ({
                          ...prev,
                          project_id: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select project...</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Custom Fields */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Custom Fields
                  </h3>
                  {customFields.length > 0 ? (
                    <div className="space-y-4">
                      {customFields.map((field) => (
                        <CustomFieldValue
                          key={field.id}
                          field={field}
                          value={newTaskForm.custom_fields[field.id]}
                          onChange={(fieldId, value) =>
                            setNewTaskForm((prev) => ({
                              ...prev,
                              custom_fields: {
                                ...prev.custom_fields,
                                [fieldId]: value,
                              },
                            }))
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        No custom fields configured
                      </p>
                      <button
                        onClick={() => setShowCustomFields(true)}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        Add Custom Fields
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowCreateTask(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!newTaskForm.title.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Fields Manager Modal */}
      {showCustomFields && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Manage Custom Fields
              </h2>
              <button
                onClick={() => setShowCustomFields(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <CustomFieldsManager
              onFieldsChange={() => {
                loadInitialData();
              }}
            />
          </div>
        </div>
      )}

      {/* Time Logging Modal */}
      {showTimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Log Time</h3>
              <button
                onClick={() => setShowTimeModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hours
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={timeEntry.hours}
                  onChange={(e) =>
                    setTimeEntry((prev) => ({ ...prev, hours: e.target.value }))
                  }
                  placeholder="e.g., 2.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={timeEntry.description}
                  onChange={(e) =>
                    setTimeEntry((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="What did you work on?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={timeEntry.billable}
                  onChange={(e) =>
                    setTimeEntry((prev) => ({
                      ...prev,
                      billable: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <label className="text-sm text-gray-700">Billable time</label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowTimeModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={logTime}
                disabled={!timeEntry.hours}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Log Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
