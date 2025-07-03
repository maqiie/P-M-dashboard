import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import { 
  Briefcase,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  User,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Building2,
  TrendingUp,
  Target,
  Award,
  ArrowRight
} from 'lucide-react';

const TendersPage = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'drafts', 'history'
  const [selectedTender, setSelectedTender] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState('tenders');

  useEffect(() => {
    loadTenders();
  }, [activeTab]);

  const loadTenders = async () => {
    try {
      setLoading(true);
      let data;
      switch (activeTab) {
        case 'active':
          data = await dashboardAPI.getTenders();
          break;
        case 'drafts':
          // data = await dashboardAPI.getDraftTenders();
          data = getMockTenders().filter(t => t.status === 'draft');
          break;
        case 'history':
          // data = await dashboardAPI.getTenderHistory();
          data = getMockTenders().filter(t => t.status === 'completed' || t.status === 'rejected');
          break;
        default:
          data = await dashboardAPI.getTenders();
      }
      setTenders(data);
    } catch (error) {
      console.error('Failed to load tenders:', error);
      setTenders(getMockTenders());
    } finally {
      setLoading(false);
    }
  };

  const getMockTenders = () => [
    {
      id: 1,
      title: "Municipal Building Renovation",
      description: "Complete renovation of the historic municipal building including structural improvements, HVAC upgrades, and accessibility enhancements.",
      deadline: "2025-07-15",
      created_date: "2025-06-01",
      budget_estimate: 2500000,
      responsible: "Sarah Johnson",
      lead_person: "Sarah Johnson",
      project_id: 1,
      status: "active",
      priority: "high",
      category: "Renovation",
      location: "Downtown District",
      client: "City of Springfield",
      requirements: ["Licensed contractor", "5+ years experience", "Local presence"],
      submission_count: 8,
      estimated_duration: "18 months"
    },
    {
      id: 2,
      title: "Park Infrastructure Upgrade",
      description: "Modernization of Central Park infrastructure including new playground equipment, walking paths, lighting, and landscaping improvements.",
      deadline: "2025-07-20",
      created_date: "2025-06-05",
      budget_estimate: 850000,
      responsible: "Mike Wilson",
      lead_person: "Sarah Johnson",
      project_id: 2,
      status: "active",
      priority: "medium",
      category: "Infrastructure",
      location: "Central Park",
      client: "Parks & Recreation Dept",
      requirements: ["Park construction experience", "Environmental compliance", "Safety certification"],
      submission_count: 5,
      estimated_duration: "8 months"
    },
    {
      id: 3,
      title: "Highway Bridge Expansion",
      description: "Expansion and reinforcement of the Main Street Bridge to accommodate increased traffic flow and improve structural integrity.",
      deadline: "2025-08-01",
      created_date: "2025-06-10",
      budget_estimate: 4200000,
      responsible: "Alex Chen",
      lead_person: "Sarah Johnson",
      project_id: 3,
      status: "draft",
      priority: "high",
      category: "Infrastructure",
      location: "Highway 101",
      client: "Department of Transportation",
      requirements: ["Bridge construction expertise", "Heavy equipment", "Traffic management"],
      submission_count: 0,
      estimated_duration: "24 months"
    },
    {
      id: 4,
      title: "School Campus Development",
      description: "Construction of new elementary school campus including classrooms, gymnasium, cafeteria, and administrative buildings.",
      deadline: "2025-06-30",
      created_date: "2025-05-01",
      budget_estimate: 8500000,
      responsible: "Lisa Wang",
      lead_person: "Sarah Johnson",
      project_id: 4,
      status: "completed",
      priority: "high",
      category: "Education",
      location: "Suburban District",
      client: "School District 42",
      requirements: ["Educational facility experience", "LEED certification", "Local hiring preference"],
      submission_count: 12,
      estimated_duration: "30 months",
      selected_contractor: "BuildRight Construction",
      completion_date: "2025-06-15"
    },
    {
      id: 5,
      title: "Residential Complex Phase 3",
      description: "Third phase of luxury residential development with 150 units, amenities, and underground parking.",
      deadline: "2025-05-15",
      created_date: "2025-04-01",
      budget_estimate: 12000000,
      responsible: "John Davis",
      lead_person: "Sarah Johnson",
      project_id: 5,
      status: "rejected",
      priority: "medium",
      category: "Residential",
      location: "Riverside Development",
      client: "Riverside Properties LLC",
      requirements: ["Residential construction", "Quality track record", "Financial stability"],
      submission_count: 6,
      estimated_duration: "36 months",
      rejection_reason: "Budget constraints - project postponed"
    }
  ];

  const handleMenuItemClick = (itemId, href) => {
    console.log('Navigate to:', href);
  };

  const filteredTenders = tenders.filter(tender => {
    const matchesSearch = tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tender.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tender.client.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tender.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || tender.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
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
      case 'active': return <Target className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4" />;
      default: return <Briefcase className="h-4 w-4" />;
    }
  };

  const getDaysUntilDeadline = (date) => {
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const tenderStats = {
    active: tenders.filter(t => t.status === 'active').length,
    draft: tenders.filter(t => t.status === 'draft').length,
    completed: tenders.filter(t => t.status === 'completed').length,
    totalValue: tenders.reduce((sum, t) => sum + (t.budget_estimate || 0), 0),
    avgSubmissions: tenders.reduce((sum, t) => sum + (t.submission_count || 0), 0) / tenders.length || 0
  };

  const TenderCard = ({ tender }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
      {/* Priority Indicator */}
      <div className={`absolute top-0 left-0 w-full h-1 ${getPriorityColor(tender.priority)}`}></div>
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {tender.title}
            </h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tender.status)}`}>
              {getStatusIcon(tender.status)}
              <span className="ml-1 capitalize">{tender.status}</span>
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
            <span className="font-medium text-blue-600">{tender.category}</span>
            <span>•</span>
            <span>{tender.client}</span>
          </div>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{tender.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
            {formatCurrency(tender.budget_estimate)}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            {tender.location}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-2 text-gray-400" />
            {tender.responsible}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            {tender.status === 'active' && (
              <>
                Due: {new Date(tender.deadline).toLocaleDateString()}
                {getDaysUntilDeadline(tender.deadline) <= 7 && (
                  <span className="ml-2 text-xs text-red-600 font-medium">
                    ({getDaysUntilDeadline(tender.deadline)} days left)
                  </span>
                )}
              </>
            )}
            {tender.status === 'completed' && `Completed: ${new Date(tender.completion_date).toLocaleDateString()}`}
            {tender.status === 'draft' && `Created: ${new Date(tender.created_date).toLocaleDateString()}`}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            {tender.estimated_duration}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FileText className="h-4 w-4 mr-2 text-gray-400" />
            {tender.submission_count} submissions
          </div>
        </div>
      </div>

      {/* Requirements */}
      {tender.requirements && tender.requirements.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Key Requirements</h4>
          <div className="flex flex-wrap gap-1">
            {tender.requirements.slice(0, 3).map((req, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {req}
              </span>
            ))}
            {tender.requirements.length > 3 && (
              <span className="text-xs text-gray-500">+{tender.requirements.length - 3} more</span>
            )}
          </div>
        </div>
      )}

      {/* Status-specific info */}
      {tender.status === 'completed' && tender.selected_contractor && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <Award className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Selected: {tender.selected_contractor}</span>
          </div>
        </div>
      )}

      {tender.status === 'rejected' && tender.rejection_reason && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">{tender.rejection_reason}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
        <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </button>
        {tender.status === 'draft' && (
          <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors">
            <Edit className="h-4 w-4 mr-1" />
            Edit & Publish
          </button>
        )}
        {tender.status === 'active' && (
          <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <FileText className="h-4 w-4 mr-1" />
            Submissions
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-xl text-gray-700 font-semibold">Loading Tenders...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Tenders Management</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Create, manage, and track construction project tenders
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium">
                  <Plus className="h-5 w-5 mr-2" />
                  New Tender
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          
          {/* Tender Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{tenderStats.active}</p>
                  <p className="text-xs text-gray-600">Active Tenders</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{tenderStats.draft}</p>
                  <p className="text-xs text-gray-600">Draft Tenders</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{tenderStats.completed}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(tenderStats.totalValue / 1000000)}M</p>
                  <p className="text-xs text-gray-600">Total Value</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(tenderStats.avgSubmissions)}</p>
                  <p className="text-xs text-gray-600">Avg Submissions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg mb-6">
            <div className="flex items-center border-b border-gray-200">
              {[
                { id: 'active', label: 'Active Tenders', count: tenderStats.active },
                { id: 'drafts', label: 'Drafts', count: tenderStats.draft },
                { id: 'history', label: 'History', count: tenderStats.completed }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tenders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
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
                  <span className="text-sm text-gray-600">{filteredTenders.length} tenders</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tenders Display */}
          {filteredTenders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTenders.map((tender) => (
                <TenderCard key={tender.id} tender={tender} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-16 w-16 text-gray-300" />
              <p className="mt-4 text-lg text-gray-500">No tenders found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or create a new tender</p>
              <button className="mt-4 flex items-center mx-auto px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium">
                <Plus className="h-5 w-5 mr-2" />
                Create First Tender
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TendersPage;