import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Search,
  Users,
  DollarSign,
  Clock,
  Target,
  AlertTriangle,
  MoreVertical,
  Eye,
  Edit,
  ChevronDown,
  MapPin,
  Star,
  TrendingUp,
  Activity,
  X,
  Save,
  FileText,
  MessageSquare,
  Share2,
  Loader,
  UserPlus,
  UserMinus,
  Briefcase,
  HardHat,
  PlusCircle
} from 'lucide-react';
import { 
  getActiveProjects, 
  updateProject,
  supervisorsAPI,
  siteManagersAPI
} from '../../services/api';

const ActiveProjectsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  
  const [activeProjects, setActiveProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [availableSupervisors, setAvailableSupervisors] = useState([]);
  const [availableSiteManagers, setAvailableSiteManagers] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  
  const [selectedSupervisors, setSelectedSupervisors] = useState([]);
  const [selectedSiteManagers, setSelectedSiteManagers] = useState([]);
  
  const [showSupervisorDropdown, setShowSupervisorDropdown] = useState(false);
  const [showSiteManagerDropdown, setShowSiteManagerDropdown] = useState(false);
  const [supervisorSearch, setSupervisorSearch] = useState('');
  const [siteManagerSearch, setSiteManagerSearch] = useState('');

  const loadStaffData = async () => {
    try {
      setLoadingStaff(true);
      const [supervisorsRes, siteManagersRes] = await Promise.all([
        supervisorsAPI.getAll(),
        siteManagersAPI.getAll()
      ]);
      setAvailableSupervisors(supervisorsRes.data || supervisorsRes || []);
      setAvailableSiteManagers(siteManagersRes.data || siteManagersRes || []);
    } catch (err) {
      console.error('Failed to load staff data:', err);
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    const loadActiveProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const filters = {};
        
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

  // Helper function to get supervisors array from project
  const getProjectSupervisors = (project) => {
    if (project.supervisors && Array.isArray(project.supervisors)) {
      return project.supervisors;
    }
    if (project.supervisor) {
      return [project.supervisor];
    }
    return [];
  };

  // Helper function to get site managers array from project
  const getProjectSiteManagers = (project) => {
    if (project.siteManagers && Array.isArray(project.siteManagers)) {
      return project.siteManagers;
    }
    if (project.site_managers && Array.isArray(project.site_managers)) {
      return project.site_managers;
    }
    if (project.siteManager) {
      return [project.siteManager];
    }
    if (project.site_manager) {
      return [project.site_manager];
    }
    return [];
  };

  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (projectId && activeProjects.length > 0) {
      const project = activeProjects.find(p => p.id === parseInt(projectId));
      if (project) {
        setSelectedProject(project);
        setEditForm({
          ...project,
          spent: project.spent || 0,
          additionalCosts: project.additionalCosts || project.additional_costs || 0
        });
        setSelectedSupervisors(getProjectSupervisors(project));
        setSelectedSiteManagers(getProjectSiteManagers(project));
        setShowProjectDetail(true);
      }
    }
  }, [searchParams, activeProjects]);

  useEffect(() => {
    if (isEditing) {
      loadStaffData();
    }
  }, [isEditing]);

  const filteredProjects = activeProjects;

  const filteredAvailableSupervisors = availableSupervisors.filter(
    sup => !selectedSupervisors.find(s => s.id === sup.id) &&
    (sup.name?.toLowerCase().includes(supervisorSearch.toLowerCase()) || 
     sup.email?.toLowerCase().includes(supervisorSearch.toLowerCase()))
  );

  const filteredAvailableSiteManagers = availableSiteManagers.filter(
    mgr => !selectedSiteManagers.find(m => m.id === mgr.id) &&
    (mgr.name?.toLowerCase().includes(siteManagerSearch.toLowerCase()) || 
     mgr.email?.toLowerCase().includes(siteManagerSearch.toLowerCase()))
  );

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
    setEditForm({
      ...project,
      spent: project.spent || 0,
      additionalCosts: project.additionalCosts || project.additional_costs || 0
    });
    setSelectedSupervisors(getProjectSupervisors(project));
    setSelectedSiteManagers(getProjectSiteManagers(project));
    setShowProjectDetail(true);
    setSearchParams({ projectId: project.id.toString() });
  };

  const handleCloseDetail = () => {
    setShowProjectDetail(false);
    setSelectedProject(null);
    setIsEditing(false);
    setSearchParams({});
    setSelectedSupervisors([]);
    setSelectedSiteManagers([]);
    setSupervisorSearch('');
    setSiteManagerSearch('');
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditForm({
        ...selectedProject,
        spent: selectedProject.spent || 0,
        additionalCosts: selectedProject.additionalCosts || selectedProject.additional_costs || 0
      });
      setSelectedSupervisors(getProjectSupervisors(selectedProject));
      setSelectedSiteManagers(getProjectSiteManagers(selectedProject));
    }
  };

  const handleSaveProject = async () => {
    try {
      setUpdating(true);
      
      const projectData = {
        title: editForm.name,
        description: editForm.description,
        status: editForm.status.toLowerCase().replace(' ', '_'),
        priority: editForm.priority.toLowerCase(),
        location: editForm.location,
        budget: parseFloat(editForm.budget) || 0,
        spent: parseFloat(editForm.spent) || 0,
        additional_costs: parseFloat(editForm.additionalCosts) || 0,
        supervisor_ids: selectedSupervisors.map(s => s.id),
        site_manager_ids: selectedSiteManagers.map(m => m.id)
      };
      
      await updateProject(selectedProject.id, projectData);
      
      const updatedProjectData = {
        ...selectedProject,
        ...editForm,
        supervisors: selectedSupervisors,
        siteManagers: selectedSiteManagers,
        site_managers: selectedSiteManagers
      };
      
      setActiveProjects(prev => 
        prev.map(p => p.id === selectedProject.id ? updatedProjectData : p)
      );
      setSelectedProject(updatedProjectData);
      setIsEditing(false);
      
      alert('Project updated successfully!');
    } catch (error) {
      console.error('Failed to update project:', error);
      alert('Failed to update project. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSupervisor = (supervisor) => {
    setSelectedSupervisors(prev => [...prev, supervisor]);
    setShowSupervisorDropdown(false);
    setSupervisorSearch('');
  };

  const handleRemoveSupervisor = (supervisorId) => {
    setSelectedSupervisors(prev => prev.filter(s => s.id !== supervisorId));
  };

  const handleAddSiteManager = (manager) => {
    setSelectedSiteManagers(prev => [...prev, manager]);
    setShowSiteManagerDropdown(false);
    setSiteManagerSearch('');
  };

  const handleRemoveSiteManager = (managerId) => {
    setSelectedSiteManagers(prev => prev.filter(m => m.id !== managerId));
  };

  // Format currency in TZS (Tanzanian Shilling)
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'TZS 0';
    const num = parseFloat(amount);
    if (num >= 1000000000) {
      return `TZS ${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `TZS ${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `TZS ${(num / 1000).toFixed(1)}K`;
    }
    return `TZS ${num.toLocaleString()}`;
  };

  // Calculate total budget (initial + client additions)
  const getTotalBudget = (project) => {
    const initial = parseFloat(project.budget) || 0;
    const additional = parseFloat(project.additionalCosts || project.additional_costs) || 0;
    return initial + additional;
  };

  // Calculate remaining budget
  const getRemainingBudget = (project) => {
    const totalBudget = getTotalBudget(project);
    const spent = parseFloat(project.spent) || 0;
    return totalBudget - spent;
  };

  const StaffMemberCard = ({ member, onRemove, type }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
          type === 'supervisor' ? 'bg-gradient-to-r from-purple-500 to-indigo-600' : 'bg-gradient-to-r from-green-500 to-teal-600'
        }`}>
          {member.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm truncate">{member.name}</p>
          <p className="text-xs text-gray-500 truncate">{member.email || member.phone || type}</p>
        </div>
      </div>
      {onRemove && (
        <button 
          onClick={() => onRemove(member.id)}
          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
        >
          <UserMinus className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  const StaffDropdown = ({ isOpen, onToggle, searchValue, onSearchChange, items, onSelect, loading, placeholder, type }) => (
    <div className="relative">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-dashed border-gray-300 rounded-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <span className="flex items-center text-gray-500 text-sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Add {type}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader className="h-5 w-5 text-blue-500 animate-spin" />
                <span className="ml-2 text-sm text-gray-500">Loading...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="py-4 text-center text-sm text-gray-500">
                No {type.toLowerCase()}s available
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    type === 'Supervisor' ? 'bg-purple-500' : 'bg-green-500'
                  }`}>
                    {item.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 truncate">{item.email || item.phone}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  const ProjectCard = ({ project }) => {
    const projectSupervisors = getProjectSupervisors(project);
    const projectSiteManagers = getProjectSiteManagers(project);
    const totalBudget = getTotalBudget(project);
    const remaining = getRemainingBudget(project);
    
    return (
      <div 
        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
        onClick={() => handleProjectClick(project)}
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
                {project.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
              </div>
              <p className="text-sm text-gray-600 truncate">{project.client}</p>
              <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {project.location || 'Location TBD'}
                </span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {project.daysLeft > 0 ? `${project.daysLeft} days left` : 'Overdue'}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
              <button 
                className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">{project.progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
          
          {/* Budget Info - Updated for TZS */}
          <div className="grid grid-cols-2 gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500">Initial Budget</p>
              <p className="font-semibold text-gray-900 text-sm">{formatCurrency(project.budget)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 flex items-center">
                <PlusCircle className="h-3 w-3 mr-1 text-green-500" />
                Client Addition
              </p>
              <p className="font-semibold text-green-600 text-sm">{formatCurrency(project.additionalCosts || project.additional_costs)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
            <div>
              <p className="text-xs text-blue-600">Spent</p>
              <p className="font-semibold text-blue-700 text-sm">{formatCurrency(project.spent)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Remaining</p>
              <p className={`font-semibold text-sm ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(remaining)}
              </p>
            </div>
          </div>

          {/* Assigned Supervisors & Site Managers Preview */}
          {(projectSupervisors.length > 0 || projectSiteManagers.length > 0) && (
            <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-green-50 rounded-lg space-y-2">
              {projectSupervisors.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  <span className="text-xs text-gray-600 font-medium">Supervisors:</span>
                  <div className="flex -space-x-2 flex-1">
                    {projectSupervisors.slice(0, 3).map((sup, idx) => (
                      <div 
                        key={sup.id || idx}
                        className="w-6 h-6 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                        title={sup.name}
                      >
                        {sup.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    ))}
                    {projectSupervisors.length > 3 && (
                      <div className="w-6 h-6 bg-purple-300 rounded-full border-2 border-white flex items-center justify-center text-purple-700 text-xs font-medium">
                        +{projectSupervisors.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-purple-600 font-medium">{projectSupervisors.length}</span>
                </div>
              )}
              {projectSiteManagers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <HardHat className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs text-gray-600 font-medium">Site Mgrs:</span>
                  <div className="flex -space-x-2 flex-1">
                    {projectSiteManagers.slice(0, 3).map((mgr, idx) => (
                      <div 
                        key={mgr.id || idx}
                        className="w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                        title={mgr.name}
                      >
                        {mgr.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    ))}
                    {projectSiteManagers.length > 3 && (
                      <div className="w-6 h-6 bg-green-300 rounded-full border-2 border-white flex items-center justify-center text-green-700 text-xs font-medium">
                        +{projectSiteManagers.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-green-600 font-medium">{projectSiteManagers.length}</span>
                </div>
              )}
            </div>
          )}

          {/* No staff assigned message */}
          {projectSupervisors.length === 0 && projectSiteManagers.length === 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-xs text-gray-500 text-center">No supervisors or site managers assigned</p>
            </div>
          )}
          
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Next Milestone</p>
            <p className="text-sm font-medium text-gray-900 truncate">{project.nextMilestone || 'No milestone set'}</p>
            <p className="text-xs text-gray-500">{project.milestoneDate}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {project.team?.slice(0, 3).map((member, index) => (
                  <div 
                    key={index}
                    className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                  >
                    {member.avatar}
                  </div>
                ))}
                {project.team?.length > 3 && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-gray-600 text-xs font-medium">
                    +{project.team.length - 3}
                  </div>
                )}
              </div>
              <span className="ml-2 text-xs text-gray-500">{project.team?.length || 0} members</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>
                <Target className="h-3 w-3 inline mr-1" />
                {project.priority}
              </span>
              {project.risks > 0 && (
                <span className="flex items-center text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {project.risks}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 flex items-center">
              <Activity className="h-3 w-3 mr-1" />
              {project.recentActivity}
            </span>
            <div className="flex items-center space-x-1">
              <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                <Eye className="h-4 w-4" />
              </button>
              <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
                <MessageSquare className="h-4 w-4" />
              </button>
              <button className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading active projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
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
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => navigate('/user')}
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Active Projects</h1>
              <p className="text-gray-600">Manage and monitor ongoing construction projects</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Active</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredProjects.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">At Risk</p>
                  <p className="text-2xl font-bold text-red-600">
                    {filteredProjects.filter(p => p.status === 'At Risk').length}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Budget</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(filteredProjects.reduce((sum, p) => sum + getTotalBudget(p), 0))}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {filteredProjects.length > 0 
                      ? Math.round(filteredProjects.reduce((sum, p) => sum + p.progress, 0) / filteredProjects.length)
                      : 0
                    }%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            
            <div className="flex gap-2">
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
        </div>
        
        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        
        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active projects found</h3>
            <p className="text-gray-600">Try adjusting your search criteria.</p>
          </div>
        )}
        
        {/* Project Detail Modal */}
        {showProjectDetail && selectedProject && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl my-8 overflow-hidden shadow-2xl">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h2 className="text-xl font-bold">{selectedProject.name}</h2>
                      <p className="text-blue-100">{selectedProject.client}</p>
                    </div>
                    {selectedProject.isStarred && <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />}
                  </div>
                  <div className="flex items-center space-x-3">
                    {!isEditing ? (
                      <button 
                        onClick={handleEditToggle}
                        className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit Project</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                          disabled={updating}
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleSaveProject}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                          disabled={updating}
                        >
                          {updating ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          <span>Save Changes</span>
                        </button>
                      </div>
                    )}
                    <button onClick={handleCloseDetail} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Project Overview */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-500" />
                        Project Overview
                      </h4>
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
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                            <input
                              type="text"
                              value={editForm.location || ''}
                              onChange={(e) => handleFormChange('location', e.target.value)}
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
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            {selectedProject.location || 'Location not specified'}
                          </div>
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

                    {/* Budget & Costs - Updated */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                        Budget & Costs (TZS)
                      </h4>
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Initial Budget (TZS)</label>
                              <input
                                type="number"
                                value={editForm.budget || ''}
                                onChange={(e) => handleFormChange('budget', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                                step="1000"
                              />
                              <p className="text-xs text-gray-500 mt-1">Original project budget</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <PlusCircle className="h-4 w-4 mr-1 text-green-500" />
                                Client Budget Addition (TZS)
                              </label>
                              <input
                                type="number"
                                value={editForm.additionalCosts || ''}
                                onChange={(e) => handleFormChange('additionalCosts', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                min="0"
                                step="1000"
                              />
                              <p className="text-xs text-green-600 mt-1">Extra money added by client</p>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount Spent (TZS)</label>
                            <input
                              type="number"
                              value={editForm.spent || ''}
                              onChange={(e) => handleFormChange('spent', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                              step="1000"
                            />
                            <p className="text-xs text-gray-500 mt-1">Total amount spent so far</p>
                          </div>
                          {/* Live calculation preview */}
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm font-medium text-blue-800 mb-2">Budget Summary Preview</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-blue-600">Total Budget:</p>
                                <p className="font-bold text-blue-900">
                                  {formatCurrency((parseFloat(editForm.budget) || 0) + (parseFloat(editForm.additionalCosts) || 0))}
                                </p>
                              </div>
                              <div>
                                <p className="text-blue-600">Remaining:</p>
                                <p className={`font-bold ${
                                  ((parseFloat(editForm.budget) || 0) + (parseFloat(editForm.additionalCosts) || 0) - (parseFloat(editForm.spent) || 0)) < 0 
                                    ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {formatCurrency((parseFloat(editForm.budget) || 0) + (parseFloat(editForm.additionalCosts) || 0) - (parseFloat(editForm.spent) || 0))}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm text-gray-500 mb-1">Initial Budget</p>
                              <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedProject.budget)}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                              <p className="text-sm text-green-600 mb-1 flex items-center">
                                <PlusCircle className="h-4 w-4 mr-1" />
                                Client Addition
                              </p>
                              <p className="text-xl font-bold text-green-700">
                                {formatCurrency(selectedProject.additionalCosts || selectedProject.additional_costs)}
                              </p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4">
                              <p className="text-sm text-blue-600 mb-1">Total Budget</p>
                              <p className="text-xl font-bold text-blue-700">{formatCurrency(getTotalBudget(selectedProject))}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-orange-50 rounded-lg p-4">
                              <p className="text-sm text-orange-600 mb-1">Amount Spent</p>
                              <p className="text-xl font-bold text-orange-700">{formatCurrency(selectedProject.spent)}</p>
                            </div>
                            <div className={`rounded-lg p-4 ${getRemainingBudget(selectedProject) < 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
                              <p className="text-sm text-gray-600 mb-1">Remaining</p>
                              <p className={`text-xl font-bold ${getRemainingBudget(selectedProject) < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                                {formatCurrency(getRemainingBudget(selectedProject))}
                              </p>
                            </div>
                          </div>
                          
                          {/* Budget Progress Bar */}
                          {getTotalBudget(selectedProject) > 0 && (
                            <div className="mt-4">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Budget Utilization</span>
                                <span className="font-medium">
                                  {Math.round((selectedProject.spent || 0) / getTotalBudget(selectedProject) * 100)}%
                                </span>
                              </div>
                              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${
                                    (selectedProject.spent || 0) > getTotalBudget(selectedProject) ? 'bg-red-500' : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${Math.min((selectedProject.spent || 0) / getTotalBudget(selectedProject) * 100, 100)}%` }}
                                />
                              </div>
                              <div className="flex items-center space-x-4 mt-2 text-xs">
                                <span className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded-full mr-1"></span>Spent</span>
                                <span className="flex items-center"><span className="w-3 h-3 bg-gray-200 rounded-full mr-1"></span>Remaining</span>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Milestones */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Target className="h-5 w-5 mr-2 text-purple-500" />
                        Milestones
                      </h4>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-sm text-purple-600 mb-1">Next Milestone</p>
                        <p className="font-medium text-gray-900">{selectedProject.nextMilestone || 'No milestone set'}</p>
                        <p className="text-sm text-gray-500 mt-1">{selectedProject.milestoneDate || 'Date TBD'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Supervisors */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Briefcase className="h-5 w-5 mr-2 text-purple-500" />
                        Supervisors
                        <span className="ml-auto text-sm font-normal text-gray-500">{selectedSupervisors.length} assigned</span>
                      </h4>
                      
                      <div className="space-y-3 mb-4">
                        {selectedSupervisors.length === 0 ? (
                          <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-lg">No supervisors assigned</p>
                        ) : (
                          selectedSupervisors.map((supervisor) => (
                            <StaffMemberCard
                              key={supervisor.id}
                              member={supervisor}
                              onRemove={isEditing ? handleRemoveSupervisor : null}
                              type="supervisor"
                            />
                          ))
                        )}
                      </div>
                      
                      {isEditing && (
                        <StaffDropdown
                          isOpen={showSupervisorDropdown}
                          onToggle={() => { setShowSupervisorDropdown(!showSupervisorDropdown); setShowSiteManagerDropdown(false); }}
                          searchValue={supervisorSearch}
                          onSearchChange={setSupervisorSearch}
                          items={filteredAvailableSupervisors}
                          onSelect={handleAddSupervisor}
                          loading={loadingStaff}
                          placeholder="Search supervisors..."
                          type="Supervisor"
                        />
                      )}
                    </div>

                    {/* Site Managers */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <HardHat className="h-5 w-5 mr-2 text-green-500" />
                        Site Managers
                        <span className="ml-auto text-sm font-normal text-gray-500">{selectedSiteManagers.length} assigned</span>
                      </h4>
                      
                      <div className="space-y-3 mb-4">
                        {selectedSiteManagers.length === 0 ? (
                          <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-lg">No site managers assigned</p>
                        ) : (
                          selectedSiteManagers.map((manager) => (
                            <StaffMemberCard
                              key={manager.id}
                              member={manager}
                              onRemove={isEditing ? handleRemoveSiteManager : null}
                              type="site manager"
                            />
                          ))
                        )}
                      </div>
                      
                      {isEditing && (
                        <StaffDropdown
                          isOpen={showSiteManagerDropdown}
                          onToggle={() => { setShowSiteManagerDropdown(!showSiteManagerDropdown); setShowSupervisorDropdown(false); }}
                          searchValue={siteManagerSearch}
                          onSearchChange={setSiteManagerSearch}
                          items={filteredAvailableSiteManagers}
                          onSelect={handleAddSiteManager}
                          loading={loadingStaff}
                          placeholder="Search site managers..."
                          type="Site Manager"
                        />
                      )}
                    </div>

                    {/* Team Members */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Users className="h-5 w-5 mr-2 text-blue-500" />
                        Team Members
                        <span className="ml-auto text-sm font-normal text-gray-500">{selectedProject.team?.length || 0}</span>
                      </h4>
                      <div className="space-y-3">
                        {selectedProject.team?.length > 0 ? (
                          selectedProject.team.map((member, index) => (
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
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-lg">No team members</p>
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