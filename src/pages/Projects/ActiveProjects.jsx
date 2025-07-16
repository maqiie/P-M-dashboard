import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  MoreVertical,
  Eye,
  Edit,
  Archive,
  ChevronDown,
  MapPin,
  Star,
  TrendingUp,
  Activity,
  X,
  Save,
  FileText,
  Settings,
  MessageSquare,
  Upload,
  Download,
  Share2,
  Trash2,
  Loader
} from 'lucide-react';
import { getActiveProjects, updateProject } from '../../services/api'; // Adjust import path as needed

const ActiveProjectsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  
  // Real data state
  const [activeProjects, setActiveProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Load projects from API
  useEffect(() => {
    const loadActiveProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const filters = {};
        
        // Map frontend filter values to backend values
        if (filterStatus !== 'all') {
          const statusMapping = {
            'progress': 'in_progress',
            'planning': 'planning',
            'risk': 'at_risk',
            'starting': 'planning'
          };
          filters.status = statusMapping[filterStatus] || filterStatus;
        }
        
        if (filterPriority !== 'all') {
          filters.priority = filterPriority;
        }
        
        if (searchTerm.trim()) {
          filters.search = searchTerm.trim();
        }
        
        const response = await getActiveProjects(filters);
        setActiveProjects(response.projects || []);
      } catch (err) {
        console.error('Failed to load active projects:', err);
        setError('Failed to load projects. Please try again.');
        setActiveProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadActiveProjects();
  }, [filterStatus, filterPriority, searchTerm]);

  // Check for project ID in URL params on component mount
  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (projectId && activeProjects.length > 0) {
      const project = activeProjects.find(p => p.id === parseInt(projectId));
      if (project) {
        setSelectedProject(project);
        setEditForm(project);
        setShowProjectDetail(true);
      }
    }
  }, [searchParams, activeProjects]);

  // Filter projects (now just for display, since filtering is done server-side)
  const filteredProjects = activeProjects;

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Planning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'At Risk': return 'bg-red-100 text-red-700 border-red-200';
      case 'On Hold': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'In Review': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'text-red-600';
      case 'High': return 'text-orange-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setEditForm(project);
    setShowProjectDetail(true);
    setSearchParams({ projectId: project.id.toString() });
  };

  const handleCloseDetail = () => {
    setShowProjectDetail(false);
    setSelectedProject(null);
    setIsEditing(false);
    setSearchParams({});
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditForm(selectedProject);
    }
  };

  const handleSaveProject = async () => {
    try {
      setUpdating(true);
      
      // Map display values back to backend values
      const projectData = {
        title: editForm.name,
        description: editForm.description,
        status: editForm.status.toLowerCase().replace(' ', '_'),
        priority: editForm.priority.toLowerCase(),
        location: editForm.location,
        budget: editForm.budget
      };
      
      const updatedProject = await updateProject(selectedProject.id, projectData);
      
      // Update local state
      setActiveProjects(prev => 
        prev.map(p => p.id === selectedProject.id ? { ...p, ...editForm } : p)
      );
      setSelectedProject(editForm);
      setIsEditing(false);
      
      // Show success message
      alert('Project updated successfully!');
    } catch (error) {
      console.error('Failed to update project:', error);
      alert('Failed to update project. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const ProjectCard = ({ project }) => (
    <div 
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer ${
        selectedProject?.id === project.id ? 'ring-2 ring-blue-500 border-blue-200' : ''
      }`}
      onClick={() => handleProjectClick(project)}
    >
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{project.name}</h3>
              {project.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
            </div>
            <p className="text-sm text-gray-600 mb-2">{project.client}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {project.location || 'Location TBD'}
              </div>
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {project.daysLeft > 0 ? `${project.daysLeft} days left` : 'Overdue'}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
            <button 
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-900">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
        
        {/* Budget Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Budget</p>
            <p className="text-sm font-medium text-gray-900">
              ${project.budget ? (project.budget / 1000000).toFixed(1) + 'M' : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Spent</p>
            <p className="text-sm font-medium text-gray-900">
              ${project.spent ? (project.spent / 1000000).toFixed(1) + 'M' : 'N/A'}
            </p>
          </div>
        </div>
        
        {/* Next Milestone */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-500 mb-1">Next Milestone</p>
          <p className="text-sm font-medium text-gray-900">{project.nextMilestone}</p>
          <p className="text-xs text-gray-600">{project.milestoneDate}</p>
        </div>
        
        {/* Team Avatars */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {project.team?.slice(0, 3).map((member, index) => (
                <div 
                  key={index}
                  className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                  title={member.name}
                >
                  {member.avatar}
                </div>
              ))}
              {project.team?.length > 3 && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                  +{project.team.length - 3}
                </div>
              )}
            </div>
            <span className="ml-3 text-xs text-gray-500">{project.team?.length || 0} members</span>
          </div>
          
          {/* Priority & Risks */}
          <div className="flex items-center space-x-2">
            <div className={`flex items-center text-xs ${getPriorityColor(project.priority)}`}>
              <Target className="h-3 w-3 mr-1" />
              {project.priority}
            </div>
            {project.risks > 0 && (
              <div className="flex items-center text-red-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span className="text-xs">{project.risks}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Card Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-600">
            <Activity className="h-3 w-3 mr-1" />
            {project.recentActivity}
          </div>
          <div className="flex space-x-1">
            <button className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors">
              <Eye className="h-4 w-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors">
              <Edit className="h-4 w-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors">
              <Archive className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading active projects...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <button 
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => navigate('/user')}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Active Projects</h1>
              <p className="text-gray-600">Manage and monitor ongoing construction projects</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total Active</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredProjects.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">At Risk</p>
                  <p className="text-2xl font-bold text-red-600">
                    {filteredProjects.filter(p => p.status === 'At Risk').length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total Budget</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${filteredProjects.reduce((sum, p) => sum + (p.budget || 0), 0) > 0 
                      ? (filteredProjects.reduce((sum, p) => sum + (p.budget || 0), 0) / 1000000).toFixed(1) + 'M'
                      : '0M'
                    }
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Progress</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {filteredProjects.length > 0 
                      ? Math.round(filteredProjects.reduce((sum, p) => sum + p.progress, 0) / filteredProjects.length)
                      : 0
                    }%
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              
              {/* Filters */}
              <div className="flex space-x-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="progress">In Progress</option>
                  <option value="planning">Planning</option>
                  <option value="risk">At Risk</option>
                  <option value="starting">Starting Soon</option>
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Priority</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                <Plus className="h-4 w-4" />
                <span>New Project</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        
        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active projects found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or create a new project.</p>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
              Create New Project
            </button>
          </div>
        )}
        
        {/* Project Detail Modal */}
        {showProjectDetail && selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                <div className="flex items-center space-x-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h2>
                    <p className="text-sm text-gray-600">{selectedProject.client}</p>
                  </div>
                  {selectedProject.isStarred && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
                </div>
                <div className="flex items-center space-x-2">
                  {!isEditing ? (
                    <button 
                      onClick={handleEditToggle}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Project
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        disabled={updating}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSaveProject}
                        disabled={updating}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {updating ? (
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </button>
                    </div>
                  )}
                  <button 
                    onClick={handleCloseDetail}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Modal Body - Rest of your existing modal content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Main Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Project Overview */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Overview</h3>
                      {isEditing ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                            <input
                              type="text"
                              value={editForm.name || ''}
                              onChange={(e) => handleFormChange('name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                              value={editForm.description || ''}
                              onChange={(e) => handleFormChange('description', e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                              <select
                                value={editForm.status || 'Planning'}
                                onChange={(e) => handleFormChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="Planning">Planning</option>
                                <option value="In Progress">In Progress</option>
                                <option value="At Risk">At Risk</option>
                                <option value="On Hold">On Hold</option>
                                <option value="In Review">In Review</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                              <select
                                value={editForm.priority || 'Medium'}
                                onChange={(e) => handleFormChange('priority', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-gray-700">{selectedProject.description || 'No description available'}</p>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Status</p>
                              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedProject.status)}`}>
                                {selectedProject.status}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Priority</p>
                              <p className={`font-medium ${getPriorityColor(selectedProject.priority)}`}>
                                {selectedProject.priority}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Progress</p>
                              <p className="font-medium text-gray-900">{selectedProject.progress}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Days Left</p>
                              <p className="font-medium text-gray-900">
                                {selectedProject.daysLeft > 0 ? `${selectedProject.daysLeft} days` : 'Overdue'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Rest of your existing modal content */}
                    {/* Budget & Timeline, Milestones, Recent Updates sections */}
                  </div>
                  
                  {/* Right Column - Team & Documents */}
                  <div className="space-y-6">
                    {/* Team Members */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Team Members</h4>
                      <div className="space-y-3">
                        {selectedProject.team?.map((member, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                              {member.avatar}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{member.name}</p>
                              <p className="text-sm text-gray-600">{member.role}</p>
                            </div>
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                              <MessageSquare className="h-4 w-4" />
                            </button>
                          </div>
                        )) || (
                          <p className="text-gray-500 text-sm">No team members assigned</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveProjectsPage;