
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  DollarSign,
  Users,
  CheckSquare,
  TrendingUp,
  AlertTriangle,
  Briefcase,
  Menu,
  HardHat,
  Wrench,
  FileText,
} from "lucide-react";
import {
  fetchProjectManagers,
  projectsAPI,
  tasksAPI,
  tendersAPI,
  supervisorsAPI,
  siteManagersAPI,
} from "../../services/api";
import AdminSidebar from "./AdminSidebar";

// Utility Functions
const formatCurrency = (amount) => {
  if (!amount) return "$0";
  const num = parseFloat(amount);
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num.toLocaleString()}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString; // Return raw string if date parsing fails
  }
};

// Data Hook - Updated to handle all member types
const useTeamMemberData = (memberId, memberType) => {
  const [data, setData] = useState({
    member: null,
    projects: [],
    tasks: [],
    tenders: [],
    statistics: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!memberId) {
      setLoading(false);
      setError("No member ID provided");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // --- 1. Fetch team member data based on type ---
      let memberData = null;
      let allMembers = [];

      if (memberType === "manager") {
        allMembers = await fetchProjectManagers();
        memberData = allMembers.find((m) => String(m.id) === String(memberId));
      } else if (memberType === "supervisor") {
        const supervisorsResponse = await supervisorsAPI.getAll();
        allMembers = Array.isArray(supervisorsResponse) ? supervisorsResponse : [];
        memberData = allMembers.find((s) => String(s.id) === String(memberId));
      } else if (memberType === "siteManager") {
        const siteManagersResponse = await siteManagersAPI.getAll();
        allMembers = Array.isArray(siteManagersResponse) ? siteManagersResponse : [];
        memberData = allMembers.find((sm) => String(sm.id) === String(memberId));
      }

      if (!memberData) {
        throw new Error(`Team member with ID ${memberId} not found`);
      }

      // --- 2. Fetch related entity data ---
      const [projectsResult, tasksResult, tendersResult] = await Promise.allSettled([
        projectsAPI.getAll(),
        tasksAPI.getAll(),
        tendersAPI.getAll(),
      ]);

      const projectsData = projectsResult.status === "fulfilled" ? projectsResult.value : { projects: [] };
      const tasksData = tasksResult.status === "fulfilled" ? tasksResult.value : { tasks: [] };
      const tendersData = tendersResult.status === "fulfilled" ? tendersResult.value : { tenders: [] };

      // Normalize arrays
      const allProjects = Array.isArray(projectsData.projects) ? projectsData.projects : Array.isArray(projectsData) ? projectsData : [];
      const allTasks = Array.isArray(tasksData.tasks) ? tasksData.tasks : Array.isArray(tasksData) ? tasksData : [];
      const allTenders = Array.isArray(tendersData.tenders) ? tendersData.tenders : Array.isArray(tendersData) ? tendersData : [];

      // Determine role configuration
      const roleConfig = {
        manager: {
          title: "Project Manager",
          department: "Project Management",
          color: "blue",
          icon: Briefcase,
        },
        supervisor: {
          title: "Site Supervisor",
          department: "Field Operations",
          color: "purple",
          icon: HardHat,
        },
        siteManager: {
          title: "Site Manager",
          department: "Site Operations",
          color: "cyan",
          icon: Wrench,
        },
      };

      const config = roleConfig[memberType] || roleConfig.manager;

      // --- 3. Enhanced member data (using API data with necessary fallbacks) ---
      const enhancedMember = {
        id: memberData.id,
        name: memberData.name || "Unknown",
        email: memberData.email || "no-email@example.com",
        phone: memberData.phone || "N/A",
        position: memberData.position || memberData.role || config.title,
        department: memberData.department || config.department,
        joinDate: memberData.join_date || memberData.created_at || "N/A",
        avatar: memberData.name ? memberData.name.split(" ").map((n) => n[0]).join("").toUpperCase() : "U",
        location: memberData.location || memberData.current_site || "Head Office",
        memberType: memberType,
        colorScheme: config.color,
        icon: config.icon,
        teamsManaged: memberData.teams_managed || 0,
        workersManaged: memberData.workers_managed || 0,
        currentSite: memberData.current_site || "Multiple Sites",
      };

      // --- 4. Filter data for this member ---
      const memberProjects = allProjects.filter((project) =>
        // Match based on ID (preferred) or Name (fallback)
        project.project_manager_id === parseInt(memberId) ||
        project.manager_id === parseInt(memberId) ||
        project.supervisor_id === parseInt(memberId) ||
        project.site_manager_id === parseInt(memberId) ||
        project.project_manager === enhancedMember.name ||
        project.supervisor === enhancedMember.name ||
        project.site_manager === enhancedMember.name
      );

      const memberTasks = allTasks.filter((task) =>
        task.assigned_to === parseInt(memberId) ||
        task.assignee_id === parseInt(memberId) ||
        // Also include tasks in projects this member manages/supervises
        memberProjects.some((p) => p.id === task.project_id)
      );

      const memberTenders = allTenders.filter((tender) =>
        tender.project_manager_id === parseInt(memberId) ||
        tender.manager_id === parseInt(memberId) ||
        tender.project_manager === enhancedMember.name
      );

      // Process projects
      const processedProjects = memberProjects.map((project) => ({
        id: project.id,
        title: project.title || project.name || "Untitled Project",
        status: (project.status || "planning").toLowerCase(),
        progress: Math.max(0, Math.min(100, parseFloat(project.progress_percentage || project.progress || 0))),
        budget: parseFloat(project.budget || 0),
        startDate: project.start_date || project.created_at,
        endDate: project.end_date || project.deadline,
        location: project.location || "Location TBD",
        client: project.client || project.client_name || "Internal Project",
      }));

      // Process tasks
      const processedTasks = memberTasks.map((task) => ({
        id: task.id,
        title: task.title || task.name || "Untitled Task",
        status: (task.status || "pending").toLowerCase(),
        priority: task.priority || "medium",
        dueDate: task.due_date || task.deadline,
        progress: Math.max(0, Math.min(100, parseFloat(task.progress || 0))),
        projectName: task.project_name || "",
      }));

      // Process tenders
      const processedTenders = memberTenders.map((tender) => ({
        id: tender.id,
        title: tender.title || tender.name || "Untitled Tender",
        status: (tender.status || "draft").toLowerCase(),
        budget: parseFloat(tender.budget_estimate || tender.budget || tender.value || 0),
        deadline: tender.deadline || tender.submission_deadline,
        client: tender.client || tender.client_name || "",
      }));

      // --- 5. Calculate statistics ---
      const statistics = {
        totalProjects: processedProjects.length,
        activeProjects: processedProjects.filter((p) => ["active", "in_progress"].includes(p.status)).length,
        completedProjects: processedProjects.filter((p) => p.status === "completed").length,
        totalBudget: processedProjects.reduce((sum, p) => sum + p.budget, 0),
        totalTasks: processedTasks.length,
        completedTasks: processedTasks.filter((t) => t.status === "completed").length,
        pendingTasks: processedTasks.filter((t) => t.status === "pending").length,
        overdueTasks: processedTasks.filter((t) => {
          if (!t.dueDate) return false;
          return new Date(t.dueDate) < new Date() && t.status !== "completed";
        }).length,
        totalTenders: processedTenders.length,
        activeTenders: processedTenders.filter((t) => t.status === "active").length,
        avgProgress: processedProjects.length > 0
          ? processedProjects.reduce((sum, p) => sum + p.progress, 0) / processedProjects.length
          : 0,
        teamsManaged: enhancedMember.teamsManaged,
        workersManaged: enhancedMember.workersManaged,
      };

      setData({
        member: enhancedMember,
        projects: processedProjects,
        tasks: processedTasks,
        tenders: processedTenders,
        statistics,
      });
    } catch (err) {
      console.error("Failed to fetch member data:", err);
      setError(err.message || "Failed to load team member data");
    } finally {
      setLoading(false);
    }
  }, [memberId, memberType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Main Component
const ProjectManagerDetails = () => {
  const { managerId, supervisorId, siteManagerId } = useParams();
  const navigate = useNavigate();

  // Determine which type of member we're viewing
  const memberId = managerId || supervisorId || siteManagerId;
  const memberType = managerId ? "manager" : supervisorId ? "supervisor" : "siteManager";

  const { data, loading, error, refetch } = useTeamMemberData(memberId, memberType);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const handleCollapseChange = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-blue-100 text-blue-700 border-blue-200",
      in_progress: "bg-blue-100 text-blue-700 border-blue-200",
      completed: "bg-green-100 text-green-700 border-green-200",
      planning: "bg-yellow-100 text-yellow-700 border-yellow-200",
      on_hold: "bg-red-100 text-red-700 border-red-200",
      pending: "bg-gray-100 text-gray-700 border-gray-200",
      draft: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[status] || colors.pending;
  };

  const getColorScheme = (color) => {
    const schemes = {
      blue: {
        gradient: "from-blue-500 to-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-600",
        textDark: "text-blue-700",
      },
      purple: {
        gradient: "from-purple-500 to-purple-600",
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-600",
        textDark: "text-purple-700",
      },
      cyan: {
        gradient: "from-cyan-500 to-cyan-600",
        bg: "bg-cyan-50",
        border: "border-cyan-200",
        text: "text-cyan-600",
        textDark: "text-cyan-700",
      },
    };
    return schemes[color] || schemes.blue;
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
        <AdminSidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          onCollapseChange={handleCollapseChange}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Loading Details</h3>
            <p className="text-slate-600">Fetching team member data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !data.member) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
        <AdminSidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          onCollapseChange={handleCollapseChange}
        />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Data</h3>
            <p className="text-slate-600 mb-6">{error || "Member data is missing or corrupted."}</p>
            <div className="space-y-3">
              <button
                onClick={refetch}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-semibold"
              >
                <RefreshCw className="h-5 w-5 inline mr-2" />
                Retry
              </button>
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="w-full px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all font-semibold"
              >
                <ArrowLeft className="h-5 w-5 inline mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { member, projects, tasks, tenders, statistics } = data;
  const colorScheme = getColorScheme(member.colorScheme);
  const MemberIcon = member.icon;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onCollapseChange={handleCollapseChange}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-auto">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </button>
        </div>

        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)} // Go back to the previous list view
                className="p-3 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{member.position} Profile</h1>
                <p className="text-slate-600">Detailed overview and performance</p>
              </div>
            </div>
            <button
              onClick={refetch}
              className={`p-3 rounded-xl bg-gradient-to-r ${colorScheme.gradient} text-white hover:opacity-90 transition-all`}
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Profile Info */}
              <div className="flex items-start space-x-6">
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${colorScheme.gradient} flex items-center justify-center text-white font-bold text-3xl shadow-lg`}>
                  {member.avatar}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">{member.name}</h2>
                  <div className="flex items-center space-x-2 mb-4">
                    <MemberIcon className={`h-5 w-5 ${colorScheme.text}`} />
                    <p className="text-lg text-slate-600">{member.position} • {member.department}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 text-slate-600">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{member.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-600">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{member.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-600">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{member.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Joined {formatDate(member.joinDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`text-center p-4 ${colorScheme.bg} rounded-xl border ${colorScheme.border}`}>
                  <div className={`text-2xl font-bold ${colorScheme.text}`}>{statistics.activeProjects}</div>
                  <div className={`text-sm ${colorScheme.textDark}`}>Active Projects</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{Math.round(statistics.avgProgress)}%</div>
                  <div className="text-sm text-green-700">Avg Progress</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{statistics.completedTasks}</div>
                  <div className="text-sm text-purple-700">Tasks Done</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">{formatCurrency(statistics.totalBudget)}</div>
                  <div className="text-sm text-orange-700">Budget</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${colorScheme.bg}`}>
                  <Building2 className={`h-5 w-5 ${colorScheme.text}`} />
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{statistics.totalProjects}</div>
              <div className="text-sm text-slate-600">Total Projects</div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(statistics.totalBudget)}</div>
              <div className="text-sm text-slate-600">Total Budget</div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <CheckSquare className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{statistics.completedTasks}/{statistics.totalTasks}</div>
              <div className="text-sm text-slate-600">Tasks Completed</div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{statistics.activeTenders}</div>
              <div className="text-sm text-slate-600">Active Tenders</div>
            </div>
          </div>

          {/* Additional Stats for Supervisors/Site Managers */}
          {(memberType === "supervisor" || memberType === "siteManager") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {statistics.teamsManaged > 0 && (
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-indigo-100">
                      <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{statistics.teamsManaged}</div>
                  <div className="text-sm text-slate-600">Teams Managed</div>
                </div>
              )}
              {statistics.workersManaged > 0 && (
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-teal-100">
                      <Users className="h-5 w-5 text-teal-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{statistics.workersManaged}</div>
                  <div className="text-sm text-slate-600">Workers Managed</div>
                </div>
              )}
              {statistics.overdueTasks > 0 && (
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-red-100">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-red-600">{statistics.overdueTasks}</div>
                  <div className="text-sm text-slate-600">Overdue Tasks</div>
                </div>
              )}
            </div>
          )}

          {/* Projects List */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <Building2 className={`h-5 w-5 ${colorScheme.text}`} />
                <span>Projects ({projects.length})</span>
              </h3>
            </div>

            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-all cursor-pointer"
                    onClick={() => navigate(`/admin/projects/${project.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900">{project.title}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                            {project.status.replace("_", " ").toUpperCase()}
                          </span>
                          <span className="text-sm text-slate-500">{project.client}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${colorScheme.text}`}>{Math.round(project.progress)}%</div>
                        <div className="text-xs text-slate-500">Progress</div>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full bg-gradient-to-r ${colorScheme.gradient} transition-all duration-500`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-1 text-slate-600">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatCurrency(project.budget)}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{project.location}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>{project.endDate ? formatDate(project.endDate) : "TBD"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No projects assigned to this {member.position.toLowerCase()}</p>
              </div>
            )}
          </div>

          {/* Tasks & Tenders Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Tasks */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <CheckSquare className="h-5 w-5 text-purple-600" />
                <span>Recent Tasks ({tasks.length})</span>
              </h3>

              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-900 truncate flex-1">{task.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <span className="capitalize">{task.priority} priority</span>
                        <span>{task.dueDate ? formatDate(task.dueDate) : "No due date"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No tasks assigned</p>
                </div>
              )}
            </div>

            {/* Active Tenders */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-orange-600" />
                <span>Tenders ({tenders.length})</span>
              </h3>

              {tenders.length > 0 ? (
                <div className="space-y-3">
                  {tenders.slice(0, 5).map((tender) => (
                    <div
                      key={tender.id}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:border-orange-300 transition-all"
                      onClick={() => navigate(`/admin/tenders/${tender.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-900 truncate flex-1">{tender.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(tender.status)}`}>
                          {tender.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-green-600">{formatCurrency(tender.budget)}</span>
                        <span className="text-slate-500">{tender.deadline ? formatDate(tender.deadline) : "No deadline"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No tenders assigned</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <div className={`text-2xl font-bold ${colorScheme.text}`}>{statistics.totalProjects}</div>
                <div className="text-sm text-slate-600">Projects</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(statistics.totalBudget)}</div>
                <div className="text-sm text-slate-600">Budget Managed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{statistics.completedTasks}</div>
                <div className="text-sm text-slate-600">Tasks Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{Math.round(statistics.avgProgress)}%</div>
                <div className="text-sm text-slate-600">Avg Progress</div>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              © 2025 Ujenzi & Paints • Construction Management Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectManagerDetails;