import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import { 
  Building2,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Calendar,
  MapPin,
  Users,
  Clock,
  MoreHorizontal,
  User,
  Target,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  Activity
} from 'lucide-react';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('projects');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
      // Fallback to mock data
      setProjects(getMockProjects());
    } finally {
      setLoading(false);
    }
  };

  const getMockProjects = () => [
    {
      id: 1,
      title: "Downtown Plaza Development",
      status: "in_progress",
      finishing_date: "2025-09-15",
      location: "Downtown District",
      responsible: "Alex Chen",
      lead_person: "Sarah Johnson",
      progress: 65,
      priority: "high",
      team_size: 8,
      budget_used: 75,
      description: "Large-scale commercial development project in the heart of downtown.",
      created_at: "2025-01-15"
    },
    {
      id: 2,
      title: "Smart City Infrastructure",
      status: "planning",
      finishing_date: "2025-12-30",
      location: "Tech Park",
      responsible: "Maria Santos",
      lead_person: "Sarah Johnson",
      progress: 25,
      priority: "medium",
      team_size: 5,
      budget_used: 20,
      description: "Implementation of IoT and smart systems across city infrastructure.",
      created_at: "2025-02-01"
    },
    {
      id: 3,
      title: "Green Energy Initiative",
      status: "review",
      finishing_date: "2025-08-20",
      location: "Industrial Zone",
      responsible: "John Davis",
      lead_person: "Sarah Johnson",
      progress: 90,
      priority: "high",
      team_size: 12,
      budget_used: 85,
      description: "Solar panel installation and renewable energy systems deployment.",
      created_at: "2024-12-10"
    },
    {
      id: 4,
      title: "Residential Complex Phase 2",
      status: "completed",
      finishing_date: "2025-06-30",
      location: "Suburban Area",
      responsible: "Lisa Wang",
      lead_person: "Sarah Johnson",
      progress: 100,
      priority: "low",
      team_size: 10,
      budget_used: 98,
      description: "Second phase of luxury residential development with 200 units.",
      created_at: "2024-10-05"
    },
    {
      id: 5,
      title: "Highway Bridge Renovation",
      status: "on_hold",
      finishing_date: "2025-11-15",
      location: "Highway 101",
      responsible: "Mike Wilson",
      lead_person: "Sarah Johnson",
      progress: 45,
      priority: "medium",
      team_size: 15,
      budget_used: 40,
      description: "Structural renovation and seismic retrofitting of main highway bridge.",
      created_at: "2025-01-20"
    },
    {
      id: 6,
      title: "Municipal Park Upgrade",
      status: "in_progress",
      finishing_date: "2025-07-30",
      location: "Central Park",
      responsible: "Emma Brown",
      lead_person: "Sarah Johnson",
      progress: 55,
      priority: "low",
      team_size: 6,
      budget_used: 50,
      description: "Landscaping, playground equipment, and facility improvements.",
      created_at: "2025-03-01"
    }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.responsible.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'on_hold': return 'bg-orange-100 text-orange-800 border-orange-200';
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
      case 'in_progress': return <Activity className="h-4 w-4" />;
      case 'planning': return <Clock className="h-4 w-4" />;
      case 'review': return <Eye className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'on_hold': return <AlertTriangle className="h-4 w-4" />;
      default: return <Building2 className="h-4 w-4" />;
    }
  };

  const getDaysUntilDeadline = (date) => {
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleMenuItemClick = (itemId, href) => {
    console.log('Navigate to:', href);
  };

  const ProjectCard = ({ project }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
      {/* Priority Indicator */}
      <div className={`absolute top-0 left-0 w-full h-1 ${getPriorityColor(project.priority)}`}></div>
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {project.title}
          </h3>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
              {getStatusIcon(project.status)}
              <span className="ml-1">{project.status.replace('_', ' ')}</span>
            </span>
            <span className={`w-2 h-2 rounded-full ${getPriorityColor(project.priority)}`} title={`${project.priority} priority`}></span>
          </div>
        </div>
        <div className="relative">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
          {project.location}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <User className="h-4 w-4 mr-2 text-gray-400" />
          {project.responsible}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
          Due: {new Date(project.finishing_date).toLocaleDateString()}
          {getDaysUntilDeadline(project.finishing_date) < 30 && (
            <span className="ml-2 text-xs text-orange-600 font-medium">
              ({getDaysUntilDeadline(project.finishing_date)} days left)
            </span>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold text-gray-900">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500" 
            style={{width: `${project.progress}%`}}
          ></div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center text-xs text-gray-500">
            <Users className="h-3 w-3 mr-1" />
            {project.team_size} members
          </div>
          <div className="text-xs text-gray-500">
            Budget: {project.budget_used}%
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
        <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <Eye className="h-4 w-4 mr-1" />
          View
        </button>
        <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </button>
      </div>
    </div>
  );

  const ProjectListItem = ({ project }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className={`w-1 h-12 rounded-full ${getPriorityColor(project.priority)}`}></div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {project.title}
            </h3>
            <p className="text-sm text-gray-600 truncate">{project.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
              {getStatusIcon(project.status)}
              <span className="ml-1">{project.status.replace('_', ' ')}</span>
            </span>
          </div>
          
          <div className="text-center">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              {project.location}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-1" />
              {project.responsible}
            </div>
          </div>
          
          <div className="text-center min-w-0">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
                style={{width: `${project.progress}%`}}
              ></div>
            </div>
            <span className="text-xs text-gray-500 mt-1">{project.progress}%</span>
          </div>
          
          <div className="text-center">
            <span className="text-sm text-gray-600">{new Date(project.finishing_date).toLocaleDateString()}</span>
          </div>
          
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-xl text-gray-700 font-semibold">Loading Projects...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage and track all your construction projects
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Project
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Filters and Controls */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
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
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
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
                <span className="text-sm text-gray-600">{filteredProjects.length} projects</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'} rounded-l-lg transition-colors`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'} rounded-r-lg transition-colors`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Display */}
          {filteredProjects.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {filteredProjects.map((project) => (
                viewMode === 'grid' 
                  ? <ProjectCard key={project.id} project={project} />
                  : <ProjectListItem key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-16 w-16 text-gray-300" />
              <p className="mt-4 text-lg text-gray-500">No projects found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProjectsPage;