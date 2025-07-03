import React, { useState } from 'react';
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
  Activity
} from 'lucide-react';

const ActiveProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Mock active projects data
  const activeProjects = [
    {
      id: 1,
      name: "Downtown Office Complex",
      client: "Metro Development Corp",
      status: "In Progress",
      priority: "High",
      progress: 67,
      budget: 2500000,
      spent: 1675000,
      startDate: "2024-03-15",
      deadline: "2024-12-20",
      daysLeft: 142,
      team: [
        { name: "Sarah Johnson", role: "Project Manager", avatar: "SJ" },
        { name: "Mike Chen", role: "Lead Engineer", avatar: "MC" },
        { name: "Emily Davis", role: "Architect", avatar: "ED" }
      ],
      location: "Downtown District",
      nextMilestone: "Foundation Completion",
      milestoneDate: "2024-08-15",
      recentActivity: "Foundation work 85% complete",
      risks: 1,
      isStarred: true
    },
    {
      id: 2,
      name: "Riverside Shopping Mall",
      client: "Retail Ventures LLC",
      status: "Planning",
      priority: "Medium",
      progress: 23,
      budget: 4200000,
      spent: 966000,
      startDate: "2024-05-01",
      deadline: "2025-03-30",
      daysLeft: 271,
      team: [
        { name: "Alex Rivera", role: "Project Manager", avatar: "AR" },
        { name: "Lisa Park", role: "Designer", avatar: "LP" }
      ],
      location: "Riverside Area",
      nextMilestone: "Design Approval",
      milestoneDate: "2024-08-30",
      recentActivity: "Design phase 60% complete",
      risks: 0,
      isStarred: false
    },
    {
      id: 3,
      name: "Tech Campus Phase 2",
      client: "Innovation Tech Inc",
      status: "In Progress",
      priority: "High",
      progress: 89,
      budget: 6800000,
      spent: 6052000,
      startDate: "2023-11-01",
      deadline: "2024-09-15",
      daysLeft: 45,
      team: [
        { name: "David Kim", role: "Project Manager", avatar: "DK" },
        { name: "Rachel Green", role: "Engineer", avatar: "RG" },
        { name: "Tom Wilson", role: "Supervisor", avatar: "TW" }
      ],
      location: "Tech District",
      nextMilestone: "Final Inspection",
      milestoneDate: "2024-08-20",
      recentActivity: "Interior work nearing completion",
      risks: 2,
      isStarred: true
    },
    {
      id: 4,
      name: "Luxury Resort Development",
      client: "Paradise Hotels Group",
      status: "At Risk",
      priority: "Critical",
      progress: 45,
      budget: 8500000,
      spent: 4250000,
      startDate: "2024-01-10",
      deadline: "2024-11-30",
      daysLeft: 91,
      team: [
        { name: "Maria Lopez", role: "Project Manager", avatar: "ML" },
        { name: "James Taylor", role: "Engineer", avatar: "JT" }
      ],
      location: "Coastal Region",
      nextMilestone: "Structural Completion",
      milestoneDate: "2024-09-01",
      recentActivity: "Weather delays affecting timeline",
      risks: 3,
      isStarred: false
    },
    {
      id: 5,
      name: "Public Library Renovation",
      client: "City Municipal Authority",
      status: "In Progress",
      priority: "Medium",
      progress: 78,
      budget: 1200000,
      spent: 936000,
      startDate: "2024-04-20",
      deadline: "2024-10-15",
      daysLeft: 75,
      team: [
        { name: "Nina Patel", role: "Project Manager", avatar: "NP" },
        { name: "Carlos Rodriguez", role: "Architect", avatar: "CR" }
      ],
      location: "City Center",
      nextMilestone: "Systems Installation",
      milestoneDate: "2024-08-25",
      recentActivity: "HVAC installation in progress",
      risks: 0,
      isStarred: true
    },
    {
      id: 6,
      name: "Industrial Warehouse Complex",
      client: "LogiFlow Solutions",
      status: "Starting Soon",
      priority: "Low",
      progress: 8,
      budget: 3100000,
      spent: 248000,
      startDate: "2024-07-01",
      deadline: "2025-01-20",
      daysLeft: 201,
      team: [
        { name: "Kevin Zhang", role: "Project Manager", avatar: "KZ" }
      ],
      location: "Industrial Zone",
      nextMilestone: "Site Preparation",
      milestoneDate: "2024-08-10",
      recentActivity: "Permits approved, site survey complete",
      risks: 0,
      isStarred: false
    }
  ];

  // Filter projects based on search and filters
  const filteredProjects = activeProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status.toLowerCase().includes(filterStatus.toLowerCase());
    const matchesPriority = filterPriority === 'all' || project.priority.toLowerCase() === filterPriority.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Planning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'At Risk': return 'bg-red-100 text-red-700 border-red-200';
      case 'Starting Soon': return 'bg-green-100 text-green-700 border-green-200';
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

  const ProjectCard = ({ project }) => (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
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
                {project.location}
              </div>
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {project.daysLeft} days left
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
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
            <p className="text-sm font-medium text-gray-900">${(project.budget / 1000000).toFixed(1)}M</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Spent</p>
            <p className="text-sm font-medium text-gray-900">${(project.spent / 1000000).toFixed(1)}M</p>
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
              {project.team.slice(0, 3).map((member, index) => (
                <div 
                  key={index}
                  className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                  title={member.name}
                >
                  {member.avatar}
                </div>
              ))}
              {project.team.length > 3 && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                  +{project.team.length - 3}
                </div>
              )}
            </div>
            <span className="ml-3 text-xs text-gray-500">{project.team.length} members</span>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
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
                    ${(filteredProjects.reduce((sum, p) => sum + p.budget, 0) / 1000000).toFixed(1)}M
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
                    {Math.round(filteredProjects.reduce((sum, p) => sum + p.progress, 0) / filteredProjects.length)}%
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or create a new project.</p>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
              Create New Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveProjectsPage;