import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Search, Filter, Calendar, DollarSign, Building2,
  Clock, CheckCircle, AlertTriangle, Eye, Edit, Download, Send,
  Star, Target, TrendingUp, Award, Briefcase, MapPin, Users,
  MoreVertical, Flag, Upload, Paperclip, MessageSquare
} from 'lucide-react';

const TendersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');

  const [tenders] = useState([
    {
      id: 1,
      title: 'Metro Shopping Center Renovation',
      client: 'Metro Development Corp',
      type: 'renovation',
      status: 'active',
      budget: 4500000,
      ourBid: 4200000,
      submissionDate: '2024-07-25',
      deadline: '2024-07-30',
      createdDate: '2024-07-01',
      location: 'Downtown Metro Area',
      duration: '18 months',
      projectManager: 'John Smith',
      winProbability: 75,
      competitors: 3,
      priority: 'high',
      description: 'Complete renovation of existing shopping center including structural updates, modern amenities, and energy-efficient systems.',
      requirements: ['Licensed General Contractor', 'LEED Certification', 'Minimum 10 years experience'],
      attachments: 8,
      notes: 12,
      lastActivity: '2024-07-12'
    },
    {
      id: 2,
      title: 'Riverside Housing Development',
      client: 'City Housing Authority',
      type: 'residential',
      status: 'submitted',
      budget: 12000000,
      ourBid: 11500000,
      submissionDate: '2024-07-10',
      deadline: '2024-07-15',
      createdDate: '2024-06-15',
      location: 'Riverside District',
      duration: '24 months',
      projectManager: 'Sarah Johnson',
      winProbability: 60,
      competitors: 5,
      priority: 'high',
      description: 'Construction of 120 affordable housing units with community facilities and green spaces.',
      requirements: ['Affordable Housing Experience', 'OSHA 30 Certification', 'Local Hiring Commitment'],
      attachments: 15,
      notes: 8,
      lastActivity: '2024-07-10'
    },
    {
      id: 3,
      title: 'Industrial Warehouse Complex',
      client: 'LogiTech Solutions',
      type: 'industrial',
      status: 'won',
      budget: 8500000,
      ourBid: 8200000,
      submissionDate: '2024-06-20',
      deadline: '2024-06-25',
      createdDate: '2024-05-20',
      location: 'Industrial Zone East',
      duration: '14 months',
      projectManager: 'Mike Wilson',
      winProbability: 100,
      competitors: 4,
      priority: 'medium',
      description: 'State-of-the-art warehouse facility with automated systems and loading docks.',
      requirements: ['Industrial Construction Experience', 'Crane Operation Certification', 'Safety Track Record'],
      attachments: 12,
      notes: 20,
      lastActivity: '2024-06-25'
    },
    {
      id: 4,
      title: 'University Science Building',
      client: 'State University',
      type: 'educational',
      status: 'lost',
      budget: 15000000,
      ourBid: 14800000,
      submissionDate: '2024-05-30',
      deadline: '2024-06-05',
      createdDate: '2024-04-15',
      location: 'University Campus',
      duration: '30 months',
      projectManager: 'Emily Davis',
      winProbability: 0,
      competitors: 6,
      priority: 'high',
      description: 'Modern science building with specialized laboratories and research facilities.',
      requirements: ['Educational Building Experience', 'LEED Gold Certification', 'Laboratory Construction'],
      attachments: 22,
      notes: 15,
      lastActivity: '2024-06-05'
    },
    {
      id: 5,
      title: 'Highway Bridge Replacement',
      client: 'Department of Transportation',
      type: 'infrastructure',
      status: 'draft',
      budget: 25000000,
      ourBid: 0,
      submissionDate: '2024-08-15',
      deadline: '2024-08-20',
      createdDate: '2024-07-08',
      location: 'Highway 95 Crossing',
      duration: '36 months',
      projectManager: 'David Chen',
      winProbability: 45,
      competitors: 8,
      priority: 'high',
      description: 'Replacement of aging highway bridge with modern, earthquake-resistant structure.',
      requirements: ['Bridge Construction Certification', 'DOT Prequalification', 'Heavy Civil Experience'],
      attachments: 5,
      notes: 3,
      lastActivity: '2024-07-11'
    },
    {
      id: 6,
      title: 'Medical Center Expansion',
      client: 'Regional Medical Center',
      type: 'healthcare',
      status: 'active',
      budget: 18000000,
      ourBid: 17200000,
      submissionDate: '2024-07-28',
      deadline: '2024-08-02',
      createdDate: '2024-07-05',
      location: 'Medical District',
      duration: '28 months',
      projectManager: 'Lisa Brown',
      winProbability: 70,
      competitors: 4,
      priority: 'medium',
      description: 'Expansion of existing medical facility with new patient wings and surgical suites.',
      requirements: ['Healthcare Construction Experience', 'OSHPD Certification', 'Infection Control Protocols'],
      attachments: 18,
      notes: 9,
      lastActivity: '2024-07-12'
    }
  ]);

  const statusOptions = [
    { value: 'all', label: 'All Tenders' },
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'educational', label: 'Educational' },
    { value: 'renovation', label: 'Renovation' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'active': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'submitted': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'won': return 'bg-green-100 text-green-700 border-green-200';
      case 'lost': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <Edit className="h-5 w-5" />;
      case 'active': return <Clock className="h-5 w-5" />;
      case 'submitted': return <Send className="h-5 w-5" />;
      case 'won': return <Award className="h-5 w-5" />;
      case 'lost': return <AlertTriangle className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'residential': return <Building2 className="h-5 w-5" />;
      case 'commercial': return <Briefcase className="h-5 w-5" />;
      case 'industrial': return <Target className="h-5 w-5" />;
      case 'infrastructure': return <Flag className="h-5 w-5" />;
      case 'healthcare': return <Star className="h-5 w-5" />;
      case 'educational': return <Award className="h-5 w-5" />;
      case 'renovation': return <TrendingUp className="h-5 w-5" />;
      default: return <Building2 className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredTenders = tenders
    .filter(tender => {
      const matchesSearch = tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tender.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tender.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || tender.status === statusFilter;
      const matchesType = typeFilter === 'all' || tender.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'deadline': return new Date(a.deadline) - new Date(b.deadline);
        case 'budget': return b.budget - a.budget;
        case 'probability': return b.winProbability - a.winProbability;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default: return a.title.localeCompare(b.title);
      }
    });

  const tenderStats = {
    total: tenders.length,
    active: tenders.filter(t => t.status === 'active').length,
    submitted: tenders.filter(t => t.status === 'submitted').length,
    won: tenders.filter(t => t.status === 'won').length,
    lost: tenders.filter(t => t.status === 'lost').length,
    totalValue: tenders.reduce((sum, t) => sum + t.budget, 0),
    winRate: Math.round((tenders.filter(t => t.status === 'won').length / tenders.filter(t => t.status === 'won' || t.status === 'lost').length) * 100) || 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <h1 className="text-6xl font-bold text-gray-900 mb-4 tracking-tight">
              Tenders
            </h1>
            <p className="text-2xl text-gray-600 leading-relaxed">
              Manage bid opportunities and track tender submissions across all projects
            </p>
          </div>
          
          <button className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-semibold rounded-2xl hover:shadow-xl transition-all duration-300">
            <Plus className="h-6 w-6" />
            <span>New Tender</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6 mb-12">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <FileText className="h-10 w-10 text-blue-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">{tenderStats.total}</p>
          <p className="text-lg text-gray-600">Total</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <Clock className="h-10 w-10 text-blue-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">{tenderStats.active}</p>
          <p className="text-lg text-gray-600">Active</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <Send className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">{tenderStats.submitted}</p>
          <p className="text-lg text-gray-600">Submitted</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <Award className="h-10 w-10 text-green-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">{tenderStats.won}</p>
          <p className="text-lg text-gray-600">Won</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">{tenderStats.lost}</p>
          <p className="text-lg text-gray-600">Lost</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <DollarSign className="h-10 w-10 text-purple-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">${(tenderStats.totalValue / 1000000).toFixed(0)}M</p>
          <p className="text-lg text-gray-600">Total Value</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <TrendingUp className="h-10 w-10 text-orange-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">{tenderStats.winRate}%</p>
          <p className="text-lg text-gray-600">Win Rate</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search tenders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-xl border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xl px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
          >
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xl px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
          >
            <option value="deadline">Sort by Deadline</option>
            <option value="budget">Sort by Budget</option>
            <option value="probability">Sort by Win Probability</option>
            <option value="priority">Sort by Priority</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>
      </div>

      {/* Tenders List */}
      <div className="space-y-6">
        {filteredTenders.map((tender) => {
          const daysUntilDeadline = getDaysUntilDeadline(tender.deadline);
          const isUrgent = daysUntilDeadline <= 7 && tender.status !== 'won' && tender.status !== 'lost';
          
          return (
            <div key={tender.id} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                {/* Main Tender Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className={`w-4 h-4 rounded-full ${getPriorityColor(tender.priority)}`} />
                        <span className={`px-4 py-2 rounded-full text-lg font-semibold border ${getStatusColor(tender.status)}`}>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(tender.status)}
                            <span className="capitalize">{tender.status}</span>
                          </div>
                        </span>
                        {isUrgent && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold animate-pulse">
                            URGENT - {daysUntilDeadline} days left
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">{tender.title}</h3>
                      <p className="text-xl text-gray-600 mb-4">{tender.description}</p>
                      
                      <div className="flex items-center space-x-6 text-lg text-gray-600">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(tender.type)}
                          <span className="capitalize">{tender.type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-5 w-5" />
                          <span>{tender.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-5 w-5" />
                          <span>{tender.duration}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button className="p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
                      <MoreVertical className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Progress/Win Probability Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-700">Win Probability</span>
                      <span className="text-lg font-bold text-gray-900">{tender.winProbability}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          tender.winProbability >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                          tender.winProbability >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                          'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                        style={{ width: `${tender.winProbability}%` }}
                      />
                    </div>
                  </div>

                  {/* Tender Details Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-500">Budget</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ${(tender.budget / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">Our Bid</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {tender.ourBid > 0 ? `$${(tender.ourBid / 1000000).toFixed(1)}M` : 'TBD'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-sm text-gray-500">Deadline</p>
                        <p className={`text-lg font-semibold ${isUrgent ? 'text-red-600' : 'text-gray-900'}`}>
                          {new Date(tender.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-500">Competitors</p>
                        <p className="text-lg font-semibold text-gray-900">{tender.competitors}</p>
                      </div>
                    </div>
                  </div>

                  {/* Client & Manager */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-lg font-semibold text-gray-700 mb-1">Client</p>
                        <p className="text-xl text-gray-900">{tender.client}</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-700 mb-1">Project Manager</p>
                        <p className="text-xl text-gray-900">{tender.projectManager}</p>
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Requirements</h4>
                    <div className="flex flex-wrap gap-2">
                      {tender.requirements.map((req, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions Sidebar */}
                <div className="flex lg:flex-col space-x-3 lg:space-x-0 lg:space-y-3 shrink-0">
                  <button className="flex items-center space-x-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all">
                    <Eye className="h-5 w-5" />
                    <span className="font-semibold">View</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 px-4 py-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all">
                    <Edit className="h-5 w-5" />
                    <span className="font-semibold">Edit</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 px-4 py-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all">
                    <Download className="h-5 w-5" />
                    <span className="font-semibold">Export</span>
                  </button>
                  
                  <div className="flex items-center space-x-4 px-4 py-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Paperclip className="h-5 w-5" />
                      <span className="text-sm font-medium">{tender.attachments}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MessageSquare className="h-5 w-5" />
                      <span className="text-sm font-medium">{tender.notes}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTenders.length === 0 && (
        <div className="text-center py-16">
          <FileText className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-gray-900 mb-4">No tenders found</h3>
          <p className="text-xl text-gray-600 mb-8">Try adjusting your search or filter criteria</p>
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-semibold rounded-2xl hover:shadow-xl transition-all duration-300">
            Create New Tender
          </button>
        </div>
      )}
    </div>
  );
};

export default TendersPage;  