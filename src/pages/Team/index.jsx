import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import { 
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  TrendingUp,
  Building2,
  Briefcase,
  User
} from 'lucide-react';

const TeamPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState('team');

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      const [teamData, projectsData] = await Promise.allSettled([
        dashboardAPI.getTeamMembers(),
        dashboardAPI.getProjects()
      ]);
      
      setTeamMembers(teamData.status === 'fulfilled' ? teamData.value : getMockTeamMembers());
      setProjects(projectsData.status === 'fulfilled' ? projectsData.value : []);
    } catch (error) {
      console.error('Failed to load team data:', error);
      setTeamMembers(getMockTeamMembers());
    } finally {
      setLoading(false);
    }
  };

  const getMockTeamMembers = () => [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Project Manager",
      email: "sarah.johnson@company.com",
      phone: "+1 (555) 123-4567",
      location: "New York, NY",
      avatar: null,
      status: "active",
      join_date: "2023-01-15",
      experience_years: 8,
      current_projects: ["Downtown Plaza Development", "Smart City Infrastructure"],
      completed_projects: 12,
      skills: ["Project Management", "Leadership", "Risk Assessment", "Budgeting"],
      performance_rating: 4.8,
      availability: "available",
      department: "Construction Management"
    },
    {
      id: 2,
      name: "Alex Chen",
      role: "Senior Engineer",
      email: "alex.chen@company.com",
      phone: "+1 (555) 234-5678",
      location: "San Francisco, CA",
      avatar: null,
      status: "active",
      join_date: "2022-03-20",
      experience_years: 6,
      current_projects: ["Downtown Plaza Development"],
      completed_projects: 8,
      skills: ["Structural Engineering", "AutoCAD", "3D Modeling", "Quality Control"],
      performance_rating: 4.6,
      availability: "busy",
      department: "Engineering"
    },
    {
      id: 3,
      name: "Maria Santos",
      role: "Civil Engineer",
      email: "maria.santos@company.com",
      phone: "+1 (555) 345-6789",
      location: "Austin, TX",
      avatar: null,
      status: "active",
      join_date: "2022-07-10",
      experience_years: 4,
      current_projects: ["Smart City Infrastructure"],
      completed_projects: 5,
      skills: ["Infrastructure Design", "Environmental Planning", "GIS", "Sustainability"],
      performance_rating: 4.7,
      availability: "available",
      department: "Engineering"
    },
    {
      id: 4,
      name: "John Davis",
      role: "Site Supervisor",
      email: "john.davis@company.com",
      phone: "+1 (555) 456-7890",
      location: "Denver, CO",
      avatar: null,
      status: "active",
      join_date: "2021-11-05",
      experience_years: 10,
      current_projects: ["Green Energy Initiative"],
      completed_projects: 15,
      skills: ["Site Management", "Safety Compliance", "Team Leadership", "Quality Assurance"],
      performance_rating: 4.9,
      availability: "available",
      department: "Operations"
    },
    {
      id: 5,
      name: "Lisa Wang",
      role: "Architect",
      email: "lisa.wang@company.com",
      phone: "+1 (555) 567-8901",
      location: "Seattle, WA",
      avatar: null,
      status: "active",
      join_date: "2023-05-12",
      experience_years: 7,
      current_projects: ["Residential Complex Phase 2"],
      completed_projects: 9,
      skills: ["Architectural Design", "Building Codes", "Sustainable Design", "Client Relations"],
      performance_rating: 4.5,
      availability: "vacation",
      department: "Design"
    },
    {
      id: 6,
      name: "Mike Wilson",
      role: "Construction Manager",
      email: "mike.wilson@company.com",
      phone: "+1 (555) 678-9012",
      location: "Chicago, IL",
      avatar: null,
      status: "active",
      join_date: "2020-09-18",
      experience_years: 12,
      current_projects: ["Highway Bridge Renovation"],
      completed_projects: 20,
      skills: ["Construction Planning", "Resource Management", "Contract Negotiation", "Cost Control"],
      performance_rating: 4.8,
      availability: "busy",
      department: "Construction Management"
    }
  ];

  const handleMenuItemClick = (itemId, href) => {
    console.log('Navigate to:', href);
  };

  const filteredTeamMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.role.toLowerCase().includes(roleFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.availability === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'busy': return 'bg-red-100 text-red-800 border-red-200';
      case 'vacation': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAvailabilityIcon = (availability) => {
    switch (availability) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'busy': return <AlertTriangle className="h-4 w-4" />;
      case 'vacation': return <Calendar className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getRoleIcon = (role) => {
    if (role.toLowerCase().includes('manager')) return <Briefcase className="h-5 w-5" />;
    if (role.toLowerCase().includes('engineer')) return <Building2 className="h-5 w-5" />;
    if (role.toLowerCase().includes('architect')) return <Target className="h-5 w-5" />;
    return <User className="h-5 w-5" />;
  };

  const teamStats = {
    totalMembers: teamMembers.length,
    availableMembers: teamMembers.filter(m => m.availability === 'available').length,
    busyMembers: teamMembers.filter(m => m.availability === 'busy').length,
    onVacation: teamMembers.filter(m => m.availability === 'vacation').length,
    avgExperience: teamMembers.reduce((sum, m) => sum + m.experience_years, 0) / teamMembers.length,
    avgRating: teamMembers.reduce((sum, m) => sum + m.performance_rating, 0) / teamMembers.length
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 font-semibold">Loading Team Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Overview</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage team members, assignments, and performance
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium">
              <UserPlus className="h-5 w-5 mr-2" />
              Add Member
            </button>
          </div>
        </div>
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{teamStats.totalMembers}</p>
              <p className="text-xs text-gray-600">Total Members</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{teamStats.availableMembers}</p>
              <p className="text-xs text-gray-600">Available</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{teamStats.busyMembers}</p>
              <p className="text-xs text-gray-600">Busy</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{teamStats.onVacation}</p>
              <p className="text-xs text-gray-600">On Vacation</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{teamStats.avgExperience.toFixed(1)}</p>
              <p className="text-xs text-gray-600">Avg Experience</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Star className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{teamStats.avgRating.toFixed(1)}</p>
              <p className="text-xs text-gray-600">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="manager">Managers</option>
              <option value="engineer">Engineers</option>
              <option value="architect">Architects</option>
              <option value="supervisor">Supervisors</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="vacation">On Vacation</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{filteredTeamMembers.length} members</span>
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      {filteredTeamMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTeamMembers.map((member) => (
            <div key={member.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 group">
              
              {/* Member Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{member.name}</h3>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(member.role)}
                      <span className="text-sm text-gray-600">{member.role}</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              {/* Availability Status */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor(member.availability)}`}>
                  {getAvailabilityIcon(member.availability)}
                  <span className="ml-1 capitalize">{member.availability}</span>
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {member.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  {member.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  {member.location}
                </div>
              </div>

              {/* Performance & Experience */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold text-gray-900">{member.performance_rating}</span>
                  </div>
                  <span className="text-xs text-gray-600">Rating</span>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-bold text-gray-900 mb-1">{member.experience_years}y</div>
                  <span className="text-xs text-gray-600">Experience</span>
                </div>
              </div>

              {/* Current Projects */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Projects</h4>
                {member.current_projects.length > 0 ? (
                  <div className="space-y-1">
                    {member.current_projects.slice(0, 2).map((project, index) => (
                      <div key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {project}
                      </div>
                    ))}
                    {member.current_projects.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{member.current_projects.length - 2} more
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">No active projects</span>
                )}
              </div>

              {/* Skills */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Key Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {member.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                  {member.skills.length > 3 && (
                    <span className="text-xs text-gray-500">+{member.skills.length - 3}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4 border-t border-gray-100">
                <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <User className="h-4 w-4 mr-1" />
                  Profile
                </button>
                <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <Mail className="h-4 w-4 mr-1" />
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="mx-auto h-16 w-16 text-gray-300" />
          <p className="mt-4 text-lg text-gray-500">No team members found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default TeamPage;