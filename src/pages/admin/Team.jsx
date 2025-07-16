import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Search, Filter, Mail, Phone, MapPin, Calendar,
  Award, TrendingUp, Clock, CheckCircle, Building2, Star,
  Edit, Eye, MoreVertical, Target, Activity, Shield, Crown,
  Briefcase, GraduationCap, MessageCircle, UserPlus
} from 'lucide-react';

const TeamPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const [teamMembers] = useState([
    {
      id: 1,
      name: 'John Smith',
      role: 'Project Manager',
      department: 'Management',
      email: 'john.smith@constructpro.com',
      phone: '+1 (555) 123-4567',
      avatar: 'JS',
      status: 'active',
      location: 'Main Office',
      joinDate: '2022-01-15',
      currentProjects: ['Downtown Office Complex', 'Bridge Construction'],
      completedProjects: 8,
      tasksCompleted: 145,
      efficiency: 94,
      hoursThisMonth: 160,
      certification: ['PMP', 'OSHA 30'],
      specialties: ['Project Planning', 'Risk Management', 'Team Leadership'],
      rating: 4.8,
      experience: '8 years'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'Site Supervisor',
      department: 'Operations',
      email: 'sarah.johnson@constructpro.com',
      phone: '+1 (555) 234-5678',
      avatar: 'SJ',
      status: 'active',
      location: 'Downtown Site',
      joinDate: '2021-08-20',
      currentProjects: ['Downtown Office Complex'],
      completedProjects: 12,
      tasksCompleted: 198,
      efficiency: 91,
      hoursThisMonth: 168,
      certification: ['OSHA 30', 'First Aid'],
      specialties: ['Site Management', 'Safety Protocols', 'Quality Control'],
      rating: 4.6,
      experience: '6 years'
    },
    {
      id: 3,
      name: 'Mike Wilson',
      role: 'Construction Foreman',
      department: 'Operations',
      email: 'mike.wilson@constructpro.com',
      phone: '+1 (555) 345-6789',
      avatar: 'MW',
      status: 'active',
      location: 'Industrial Site',
      joinDate: '2020-03-10',
      currentProjects: ['Industrial Warehouse'],
      completedProjects: 15,
      tasksCompleted: 267,
      efficiency: 96,
      hoursThisMonth: 172,
      certification: ['OSHA 30', 'Crane Operator'],
      specialties: ['Heavy Equipment', 'Structural Work', 'Crew Management'],
      rating: 4.9,
      experience: '12 years'
    },
    {
      id: 4,
      name: 'Emily Davis',
      role: 'Civil Engineer',
      department: 'Engineering',
      email: 'emily.davis@constructpro.com',
      phone: '+1 (555) 456-7890',
      avatar: 'ED',
      status: 'active',
      location: 'Engineering Office',
      joinDate: '2023-02-01',
      currentProjects: ['Shopping Mall Renovation', 'Bridge Construction'],
      completedProjects: 3,
      tasksCompleted: 89,
      efficiency: 88,
      hoursThisMonth: 155,
      certification: ['PE License', 'AutoCAD'],
      specialties: ['Structural Design', 'AutoCAD', 'Project Analysis'],
      rating: 4.4,
      experience: '4 years'
    },
    {
      id: 5,
      name: 'David Chen',
      role: 'Electrical Contractor',
      department: 'Trades',
      email: 'david.chen@constructpro.com',
      phone: '+1 (555) 567-8901',
      avatar: 'DC',
      status: 'active',
      location: 'Riverside Site',
      joinDate: '2021-11-12',
      currentProjects: ['Riverside Residential'],
      completedProjects: 9,
      tasksCompleted: 156,
      efficiency: 93,
      hoursThisMonth: 164,
      certification: ['Master Electrician', 'OSHA 10'],
      specialties: ['Electrical Systems', 'Industrial Wiring', 'Code Compliance'],
      rating: 4.7,
      experience: '10 years'
    },
    {
      id: 6,
      name: 'Lisa Brown',
      role: 'Safety Inspector',
      department: 'Safety',
      email: 'lisa.brown@constructpro.com',
      phone: '+1 (555) 678-9012',
      avatar: 'LB',
      status: 'active',
      location: 'Mobile',
      joinDate: '2022-06-30',
      currentProjects: ['All Active Projects'],
      completedProjects: 25,
      tasksCompleted: 312,
      efficiency: 97,
      hoursThisMonth: 148,
      certification: ['CSP', 'OSHA 30', 'CHST'],
      specialties: ['Safety Audits', 'Compliance', 'Risk Assessment'],
      rating: 4.9,
      experience: '7 years'
    },
    {
      id: 7,
      name: 'Robert Garcia',
      role: 'Quality Control',
      department: 'Quality',
      email: 'robert.garcia@constructpro.com',
      phone: '+1 (555) 789-0123',
      avatar: 'RG',
      status: 'on-leave',
      location: 'Quality Lab',
      joinDate: '2020-09-14',
      currentProjects: [],
      completedProjects: 18,
      tasksCompleted: 203,
      efficiency: 89,
      hoursThisMonth: 0,
      certification: ['CQE', 'NDT Level II'],
      specialties: ['Materials Testing', 'Quality Assurance', 'Documentation'],
      rating: 4.5,
      experience: '9 years'
    },
    {
      id: 8,
      name: 'Jennifer Lee',
      role: 'Architect',
      department: 'Design',
      email: 'jennifer.lee@constructpro.com',
      phone: '+1 (555) 890-1234',
      avatar: 'JL',
      status: 'active',
      location: 'Design Studio',
      joinDate: '2023-04-18',
      currentProjects: ['Shopping Mall Renovation'],
      completedProjects: 2,
      tasksCompleted: 67,
      efficiency: 85,
      hoursThisMonth: 162,
      certification: ['Licensed Architect', 'LEED AP'],
      specialties: ['Architectural Design', 'Sustainable Design', '3D Modeling'],
      rating: 4.3,
      experience: '5 years'
    }
  ]);

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'Project Manager', label: 'Project Manager' },
    { value: 'Site Supervisor', label: 'Site Supervisor' },
    { value: 'Construction Foreman', label: 'Construction Foreman' },
    { value: 'Civil Engineer', label: 'Civil Engineer' },
    { value: 'Electrical Contractor', label: 'Electrical Contractor' },
    { value: 'Safety Inspector', label: 'Safety Inspector' },
    { value: 'Quality Control', label: 'Quality Control' },
    { value: 'Architect', label: 'Architect' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'on-leave', label: 'On Leave' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'on-leave': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'inactive': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Project Manager': return <Crown className="h-6 w-6" />;
      case 'Site Supervisor': return <Shield className="h-6 w-6" />;
      case 'Construction Foreman': return <Briefcase className="h-6 w-6" />;
      case 'Civil Engineer': return <GraduationCap className="h-6 w-6" />;
      case 'Electrical Contractor': return <Activity className="h-6 w-6" />;
      case 'Safety Inspector': return <Shield className="h-6 w-6" />;
      case 'Quality Control': return <Target className="h-6 w-6" />;
      case 'Architect': return <Building2 className="h-6 w-6" />;
      default: return <Users className="h-6 w-6" />;
    }
  };

  const filteredMembers = teamMembers
    .filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'efficiency': return b.efficiency - a.efficiency;
        case 'experience': return parseInt(b.experience) - parseInt(a.experience);
        case 'rating': return b.rating - a.rating;
        case 'joinDate': return new Date(b.joinDate) - new Date(a.joinDate);
        default: return a.name.localeCompare(b.name);
      }
    });

  const teamStats = {
    total: teamMembers.length,
    active: teamMembers.filter(m => m.status === 'active').length,
    onLeave: teamMembers.filter(m => m.status === 'on-leave').length,
    avgEfficiency: Math.round(teamMembers.reduce((sum, m) => sum + m.efficiency, 0) / teamMembers.length),
    totalHours: teamMembers.reduce((sum, m) => sum + m.hoursThisMonth, 0),
    avgRating: (teamMembers.reduce((sum, m) => sum + m.rating, 0) / teamMembers.length).toFixed(1)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <h1 className="text-6xl font-bold text-gray-900 mb-4 tracking-tight">
              Team
            </h1>
            <p className="text-2xl text-gray-600 leading-relaxed">
              Manage your construction team members and monitor their performance
            </p>
          </div>
          
          <button className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-semibold rounded-2xl hover:shadow-xl transition-all duration-300">
            <UserPlus className="h-6 w-6" />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-12">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <Users className="h-10 w-10 text-blue-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">{teamStats.total}</p>
          <p className="text-lg text-gray-600">Total Members</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">{teamStats.active}</p>
          <p className="text-lg text-gray-600">Active</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <Calendar className="h-10 w-10 text-orange-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">{teamStats.onLeave}</p>
          <p className="text-lg text-gray-600">On Leave</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <TrendingUp className="h-10 w-10 text-purple-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">{teamStats.avgEfficiency}%</p>
          <p className="text-lg text-gray-600">Avg Efficiency</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <Clock className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">{teamStats.totalHours}</p>
          <p className="text-lg text-gray-600">Hours This Month</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <Star className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">{teamStats.avgRating}</p>
          <p className="text-lg text-gray-600">Avg Rating</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-xl border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xl px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
          >
            {roleOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xl px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xl px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
          >
            <option value="name">Sort by Name</option>
            <option value="efficiency">Sort by Efficiency</option>
            <option value="experience">Sort by Experience</option>
            <option value="rating">Sort by Rating</option>
            <option value="joinDate">Sort by Join Date</option>
          </select>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
            {/* Member Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  {member.avatar}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{member.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getRoleIcon(member.role)}
                    <span className="text-lg text-gray-600">{member.role}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(member.status)}`}>
                  {member.status.replace('-', ' ').toUpperCase()}
                </span>
                <button className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Member Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-2xl">
                <p className="text-2xl font-bold text-blue-600">{member.efficiency}%</p>
                <p className="text-sm text-gray-600">Efficiency</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-2xl">
                <p className="text-2xl font-bold text-green-600">{member.rating}</p>
                <p className="text-sm text-gray-600">Rating</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-2xl">
                <p className="text-2xl font-bold text-purple-600">{member.completedProjects}</p>
                <p className="text-sm text-gray-600">Projects</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-2xl">
                <p className="text-2xl font-bold text-orange-600">{member.tasksCompleted}</p>
                <p className="text-sm text-gray-600">Tasks</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <span className="text-lg text-gray-700">{member.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <span className="text-lg text-gray-700">{member.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="text-lg text-gray-700">{member.location}</span>
              </div>
            </div>

            {/* Current Projects */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Current Projects</h4>
              {member.currentProjects.length > 0 ? (
                <div className="space-y-2">
                  {member.currentProjects.map((project, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                      <Building2 className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-700">{project}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No active projects</p>
              )}
            </div>

            {/* Specialties */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {member.specialties.map((specialty, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Certifications</h4>
              <div className="flex flex-wrap gap-2">
                {member.certification.map((cert, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <Award className="h-3 w-3 inline mr-1" />
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-100">
              <div>
                <p className="text-sm text-gray-500">Experience</p>
                <p className="text-lg font-semibold text-gray-900">{member.experience}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Hours This Month</p>
                <p className="text-lg font-semibold text-gray-900">{member.hoursThisMonth}h</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all">
                <Eye className="h-5 w-5" />
                <span className="font-semibold">Profile</span>
              </button>
              <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all">
                <MessageCircle className="h-5 w-5" />
                <span className="font-semibold">Message</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-16">
          <Users className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-gray-900 mb-4">No team members found</h3>
          <p className="text-xl text-gray-600 mb-8">Try adjusting your search or filter criteria</p>
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-semibold rounded-2xl hover:shadow-xl transition-all duration-300">
            Add Team Member
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamPage;