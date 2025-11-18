import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Building2, 
  FileText, 
  Clock, 
  Calendar,
  User,
  MapPin,
  DollarSign,
  TrendingUp,
  Award,
  Filter,
  Search,
  ArrowRight,
  Eye,
  Download,
  BarChart3,
  Target,
  Briefcase,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Trophy,
  Star,
  Zap
} from 'lucide-react';
import { projectsAPI, dashboardAPI } from '../../services/api';

const CompletedHistory = () => {
  const navigate = useNavigate();
  
  // Data states
  const [completedProjects, setCompletedProjects] = useState([]);
  const [completedTenders, setCompletedTenders] = useState([]);
  const [pastTasks, setPastTasks] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [expandedProject, setExpandedProject] = useState(null);
  
  // Statistics
  const [stats, setStats] = useState({
    totalCompleted: 0,
    totalBudget: 0,
    avgDuration: 0,
    successRate: 100
  });

  useEffect(() => {
    loadCompletedData();
  }, []);

  const loadCompletedData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load completed projects
      const projectsResponse = await projectsAPI.getCompleted();
      const projects = projectsResponse.projects || projectsResponse || [];
      setCompletedProjects(projects);

      // Load completed/past tenders
      try {
        const tendersResponse = await dashboardAPI.getTenders();
        const allTenders = tendersResponse || [];
        // Filter for completed/awarded/closed tenders
        const completedTendersList = allTenders.filter(t => 
          t.status === 'awarded' || 
          t.status === 'completed' || 
          t.status === 'closed' ||
          new Date(t.deadline) < new Date()
        );
        setCompletedTenders(completedTendersList);
      } catch (e) {
        console.warn('Failed to load tenders:', e);
        setCompletedTenders([]);
      }

      // Generate past tasks from completed projects
      const tasks = generatePastTasks(projects);
      setPastTasks(tasks);

      // Calculate statistics
      calculateStats(projects);

    } catch (error) {
      console.error('Failed to load completed data:', error);
      setError('Failed to load completed data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generatePastTasks = (projects) => {
    const tasks = [];
    
    projects.forEach(project => {
      // Final review task
      tasks.push({
        id: `${project.id}_final_review`,
        task: `Final review for ${project.name || project.title}`,
        project: project.name || project.title,
        projectId: project.id,
        completedDate: project.completedDate || project.updated_at,
        status: 'completed',
        priority: 'high'
      });

      // Documentation task
      tasks.push({
        id: `${project.id}_documentation`,
        task: `Documentation completed for ${project.name || project.title}`,
        project: project.name || project.title,
        projectId: project.id,
        completedDate: project.completedDate || project.updated_at,
        status: 'completed',
        priority: 'medium'
      });

      // Handover task
      tasks.push({
        id: `${project.id}_handover`,
        task: `Project handover - ${project.name || project.title}`,
        project: project.name || project.title,
        projectId: project.id,
        completedDate: project.completedDate || project.updated_at,
        status: 'completed',
        priority: 'high'
      });
    });

    return tasks.sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));
  };

  const calculateStats = (projects) => {
    const totalCompleted = projects.length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    
    // Calculate average duration (mock - replace with actual data)
    const avgDuration = projects.length > 0 ? Math.round(projects.length * 45 / projects.length) : 0;
    
    setStats({
      totalCompleted,
      totalBudget,
      avgDuration,
      successRate: 100
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    const num = parseFloat(amount);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter and sort data based on search and sort options
  const getFilteredData = (data) => {
    let filtered = [...data];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        (item.name || item.title || item.task || '').toLowerCase().includes(query) ||
        (item.location || '').toLowerCase().includes(query) ||
        (item.client || '').toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'date_desc':
        filtered.sort((a, b) => new Date(b.completedDate || b.updated_at) - new Date(a.completedDate || a.updated_at));
        break;
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.completedDate || a.updated_at) - new Date(b.completedDate || b.updated_at));
        break;
      case 'budget_desc':
        filtered.sort((a, b) => (b.budget || 0) - (a.budget || 0));
        break;
      case 'name_asc':
        filtered.sort((a, b) => (a.name || a.title || a.task || '').localeCompare(b.name || b.title || b.task || ''));
        break;
      default:
        break;
    }
    
    return filtered;
  };

  // Render completed projects
  const renderCompletedProjects = () => {
    const filteredProjects = getFilteredData(completedProjects);

    if (filteredProjects.length === 0) {
      return (
        <div className="text-center py-16">
          <Trophy className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No completed projects yet</h3>
          <p className="text-gray-500 mt-2">Completed projects will appear here</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredProjects.map((project) => (
          <div 
            key={project.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            {/* Project Header */}
            <div 
              className="p-5 cursor-pointer"
              onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{project.name || project.title}</h4>
                      <p className="text-sm text-gray-500">{project.client || 'Client'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">{formatCurrency(project.budget)}</p>
                    <p className="text-xs text-gray-500">Budget</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatDate(project.completedDate || project.updated_at)}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                  {expandedProject === project.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Quick Info */}
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                  {project.location || 'N/A'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-1 text-gray-400" />
                  {project.team?.length || 0} team members
                </div>
                <div className="flex items-center text-sm text-green-600">
                  <Star className="h-4 w-4 mr-1" />
                  100% Complete
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedProject === project.id && (
              <div className="border-t border-gray-100 bg-gray-50 p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Start Date</p>
                    <p className="font-medium text-gray-900">{formatDate(project.startDate || project.start_date)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">End Date</p>
                    <p className="font-medium text-gray-900">{formatDate(project.deadline || project.finishing_date)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Budget Spent</p>
                    <p className="font-medium text-gray-900">{formatCurrency(project.spent || project.budget)}</p>
                  </div>
                </div>

                {project.description && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Description</p>
                    <p className="text-sm text-gray-700">{project.description}</p>
                  </div>
                )}

                {/* Team */}
                {project.team && project.team.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Team Members</p>
                    <div className="flex flex-wrap gap-2">
                      {project.team.map((member, idx) => (
                        <div key={idx} className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full border border-gray-200">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                            {member.avatar || member.name?.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-700">{member.name}</span>
                          <span className="text-xs text-gray-500">({member.role})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate(`/user/projects?projectId=${project.id}`)}
                    className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </button>
                  <button className="flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render completed tenders
  const renderCompletedTenders = () => {
    const filteredTenders = getFilteredData(completedTenders);

    if (filteredTenders.length === 0) {
      return (
        <div className="text-center py-16">
          <FileText className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No completed tenders</h3>
          <p className="text-gray-500 mt-2">Past tenders will appear here</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredTenders.map((tender) => (
          <div 
            key={tender.id}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  tender.status === 'awarded' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <FileText className={`h-5 w-5 ${
                    tender.status === 'awarded' ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{tender.title}</h4>
                  <p className="text-sm text-gray-500">{tender.responsible || tender.client}</p>
                </div>
              </div>
              
              <div className="text-right">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                  tender.status === 'awarded' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {tender.status === 'awarded' ? 'Awarded' : 'Closed'}
                </span>
                <p className="text-xs text-gray-500 mt-1">{formatDate(tender.deadline)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6 mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                {formatCurrency(tender.budget || tender.value)}
              </div>
              {tender.project_title && (
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="h-4 w-4 mr-1 text-gray-400" />
                  {tender.project_title}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render past tasks
  const renderPastTasks = () => {
    const filteredTasks = getFilteredData(pastTasks);

    if (filteredTasks.length === 0) {
      return (
        <div className="text-center py-16">
          <CheckCircle className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No completed tasks</h3>
          <p className="text-gray-500 mt-2">Completed tasks will appear here</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <div 
            key={task.id}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">{task.task}</h4>
                  <p className="text-xs text-gray-500">{task.project}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-gray-500">{formatDate(task.completedDate)}</p>
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                  task.priority === 'high' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {task.priority}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading completed items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Completed History</h1>
            <p className="text-gray-600 mt-1">View all your completed projects, tenders, and tasks</p>
          </div>
          <button
            onClick={loadCompletedData}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-all duration-200"
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Trophy className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCompleted}</p>
              <p className="text-xs text-gray-500">Completed Projects</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalBudget)}</p>
              <p className="text-xs text-gray-500">Total Budget</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.avgDuration}</p>
              <p className="text-xs text-gray-500">Avg. Days</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
              <p className="text-xs text-gray-500">Success Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                activeTab === 'projects'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Projects</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                  {completedProjects.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('tenders')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                activeTab === 'tenders'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Tenders</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                  {completedTenders.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                activeTab === 'tasks'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Tasks</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                  {pastTasks.length}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="budget_desc">Highest Budget</option>
              <option value="name_asc">Name A-Z</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {activeTab === 'projects' && renderCompletedProjects()}
          {activeTab === 'tenders' && renderCompletedTenders()}
          {activeTab === 'tasks' && renderPastTasks()}
        </div>
      </div>
    </div>
  );
};

export default CompletedHistory;