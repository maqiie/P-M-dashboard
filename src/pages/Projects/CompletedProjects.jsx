import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Search,
  Calendar,
  DollarSign,
  Target,
  CheckCircle,
  Eye,
  FileText,
  MapPin,
  Star,
  TrendingUp,
  Activity,
  X,
  Download,
  Share2,
  Loader,
  AlertTriangle,
  Award,
  Clock,
  Users
} from 'lucide-react';
import { getCompletedProjects } from '../../services/api'; // Adjust import path as needed

const CompletedProjectsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  
  // Real data state
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load completed projects from API
  useEffect(() => {
    const loadCompletedProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const filters = {};
        
        if (searchTerm.trim()) {
          filters.search = searchTerm.trim();
        }
        
        const response = await getCompletedProjects(filters);
        setCompletedProjects(response.projects || []);
      } catch (err) {
        console.error('Failed to load completed projects:', err);
        setError('Failed to load completed projects. Please try again.');
        setCompletedProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadCompletedProjects();
  }, [searchTerm]);

  // Check for project ID in URL params on component mount
  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (projectId && completedProjects.length > 0) {
      const project = completedProjects.find(p => p.id === parseInt(projectId));
      if (project) {
        setSelectedProject(project);
        setShowProjectDetail(true);
      }
    }
  }, [searchParams, completedProjects]);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setShowProjectDetail(true);
    setSearchParams({ projectId: project.id.toString() });
  };

  const handleCloseDetail = () => {
    setShowProjectDetail(false);
    setSelectedProject(null);
    setSearchParams({});
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

  const ProjectCard = ({ project }) => (
    <div 
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer ${
        selectedProject?.id === project.id ? 'ring-2 ring-green-500 border-green-200' : ''
      }`}
      onClick={() => handleProjectClick(project)}
    >
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{project.name}</h3>
              <CheckCircle className="h-4 w-4 text-green-500 fill-current" />
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
                Completed: {project.completedDate}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 rounded-lg text-xs font-medium border bg-green-100 text-green-700 border-green-200">
              Completed
            </span>
          </div>
        </div>
        
        {/* Progress Bar - Always 100% for completed */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-green-600">100%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '100%' }}
            />
          </div>
        </div>
        
        {/* Budget Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Final Budget</p>
            <p className="text-sm font-medium text-gray-900">
              ${project.budget ? (project.budget / 1000000).toFixed(1) + 'M' : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Spent</p>
            <p className="text-sm font-medium text-gray-900">
              ${project.spent ? (project.spent / 1000000).toFixed(1) + 'M' : 'N/A'}
            </p>
          </div>
        </div>
        
        {/* Project Summary */}
        <div className="bg-green-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-green-600 mb-1">Project Summary</p>
          <p className="text-sm font-medium text-gray-900">Successfully Delivered</p>
          <p className="text-xs text-gray-600">{project.description || 'Project completed successfully'}</p>
        </div>
        
        {/* Team Avatars */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {project.team?.slice(0, 3).map((member, index) => (
                <div 
                  key={index}
                  className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
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
          
          {/* Priority */}
          <div className="flex items-center space-x-2">
            <div className={`flex items-center text-xs ${getPriorityColor(project.priority)}`}>
              <Award className="h-3 w-3 mr-1" />
              {project.priority}
            </div>
          </div>
        </div>
      </div>
      
      {/* Card Footer */}
      <div className="px-6 py-3 bg-green-50 border-t border-green-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Project completed successfully
          </div>
          <div className="flex space-x-1">
            <button className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors">
              <Eye className="h-4 w-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors">
              <FileText className="h-4 w-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading completed projects...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
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
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Completed Projects</h1>
              <p className="text-gray-600">Review and analyze successfully completed construction projects</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedProjects.length}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">100%</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total Value</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${completedProjects.reduce((sum, p) => sum + (p.budget || 0), 0) > 0 
                      ? (completedProjects.reduce((sum, p) => sum + (p.budget || 0), 0) / 1000000).toFixed(1) + 'M'
                      : '0M'
                    }
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Duration</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {completedProjects.length > 0 ? '12' : '0'}mo
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-600" />
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
                  placeholder="Search completed projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {completedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        
        {/* Empty State */}
        {completedProjects.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No completed projects found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or check back later.</p>
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
                  <CheckCircle className="h-6 w-6 text-green-500 fill-current" />
                  {selectedProject.isStarred && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
                </div>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </button>
                  <button 
                    onClick={handleCloseDetail}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Main Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Project Overview */}
                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        Project Completed Successfully
                      </h3>
                      <div className="space-y-4">
                        <p className="text-gray-700">{selectedProject.description || 'Project completed successfully with all objectives met.'}</p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium border bg-green-100 text-green-700 border-green-200">
                              Completed
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
                            <p className="font-medium text-green-600">100%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Completion</p>
                            <p className="font-medium text-gray-900">{selectedProject.completedDate}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Final Budget Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Final Budget</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Budget</span>
                            <span className="font-medium">${selectedProject.budget ? (selectedProject.budget / 1000000).toFixed(1) + 'M' : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Amount Spent</span>
                            <span className="font-medium">${selectedProject.spent ? (selectedProject.spent / 1000000).toFixed(1) + 'M' : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Budget Variance</span>
                            <span className="font-medium text-green-600">
                              {selectedProject.budget && selectedProject.spent 
                                ? ((selectedProject.budget - selectedProject.spent) / 1000000).toFixed(1) + 'M saved'
                                : 'N/A'
                              }
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                              style={{ 
                                width: selectedProject.budget && selectedProject.spent 
                                  ? `${Math.min((selectedProject.spent / selectedProject.budget) * 100, 100)}%`
                                  : '100%'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Project Timeline</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Start Date</span>
                            <span className="font-medium">{selectedProject.startDate || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Planned End</span>
                            <span className="font-medium">{selectedProject.deadline || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Actual Completion</span>
                            <span className="font-medium text-green-600">{selectedProject.completedDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duration</span>
                            <span className="font-medium">
                              {selectedProject.startDate && selectedProject.completedDate 
                                ? `${Math.ceil((new Date(selectedProject.completedDate) - new Date(selectedProject.startDate)) / (1000 * 60 * 60 * 24 * 30))} months`
                                : 'N/A'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column - Team & Documents */}
                  <div className="space-y-6">
                    {/* Team Members */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Project Team</h4>
                      <div className="space-y-3">
                        {selectedProject.team?.map((member, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-medium">
                              {member.avatar}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{member.name}</p>
                              <p className="text-sm text-gray-600">{member.role}</p>
                            </div>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        )) || (
                          <p className="text-gray-500 text-sm">No team members listed</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Project Actions */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Project Actions</h4>
                      <div className="space-y-2">
                        <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-900">View Final Report</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                          <Download className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-900">Download Documents</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                          <Share2 className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-900">Share Project</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                          <Award className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-900">Project Analytics</span>
                        </button>
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

export default CompletedProjectsPage;