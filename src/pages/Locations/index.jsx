import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import { 
  MapPin,
  Plus,
  Search,
  Filter,
  Building2,
  Navigation,
  Users,
  Calendar,
  Phone,
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Map,
  Layers,
  Target,
  Activity,
  Briefcase
} from 'lucide-react';

const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'map'
  const [activeMenuItem, setActiveMenuItem] = useState('locations');

  useEffect(() => {
    loadLocationData();
  }, []);

  const loadLocationData = async () => {
    try {
      setLoading(true);
      const [projectsData] = await Promise.allSettled([
        dashboardAPI.getProjects()
      ]);
      
      setProjects(projectsData.status === 'fulfilled' ? projectsData.value : []);
      setLocations(getMockLocations());
    } catch (error) {
      console.error('Failed to load location data:', error);
      setLocations(getMockLocations());
    } finally {
      setLoading(false);
    }
  };

  const getMockLocations = () => [
    {
      id: 1,
      name: "Downtown District",
      type: "commercial",
      address: "123 Main Street, Downtown",
      city: "Springfield",
      state: "IL",
      zip: "62701",
      country: "USA",
      coordinates: { lat: 39.7817, lng: -89.6501 },
      status: "active",
      description: "Prime commercial district with mixed-use development opportunities",
      active_projects: ["Downtown Plaza Development", "Municipal Building Renovation"],
      total_projects: 5,
      project_manager: "Sarah Johnson",
      site_contact: "Alex Chen",
      contact_phone: "+1 (555) 123-4567",
      contact_email: "alex.chen@company.com",
      established_date: "2020-03-15",
      area_sqft: 125000,
      zoning: "Commercial Mixed-Use",
      permits_required: ["Building Permit", "Environmental Clearance", "Traffic Impact"],
      safety_rating: "A",
      accessibility: "Full ADA Compliance",
      utilities: ["Electric", "Water", "Sewer", "Gas", "Fiber"],
      parking_spaces: 450,
      public_transport: true
    },
    {
      id: 2,
      name: "Tech Park",
      type: "technology",
      address: "456 Innovation Drive",
      city: "Springfield",
      state: "IL", 
      zip: "62702",
      country: "USA",
      coordinates: { lat: 39.7901, lng: -89.6440 },
      status: "active",
      description: "Modern technology park with smart infrastructure and sustainable design",
      active_projects: ["Smart City Infrastructure"],
      total_projects: 3,
      project_manager: "Maria Santos",
      site_contact: "John Tech",
      contact_phone: "+1 (555) 234-5678",
      contact_email: "john.tech@company.com",
      established_date: "2021-06-20",
      area_sqft: 200000,
      zoning: "Technology Park",
      permits_required: ["Special Use Permit", "Environmental Assessment", "Utility Connections"],
      safety_rating: "A+",
      accessibility: "Full ADA Compliance",
      utilities: ["Electric", "Water", "Sewer", "High-Speed Fiber", "Solar Grid"],
      parking_spaces: 600,
      public_transport: true
    },
    {
      id: 3,
      name: "Industrial Zone",
      type: "industrial",
      address: "789 Industrial Blvd",
      city: "Springfield",
      state: "IL",
      zip: "62703",
      country: "USA",
      coordinates: { lat: 39.7640, lng: -89.6680 },
      status: "active",
      description: "Heavy industrial zone with specialized facilities and equipment access",
      active_projects: ["Green Energy Initiative"],
      total_projects: 8,
      project_manager: "John Davis",
      site_contact: "Mike Industrial",
      contact_phone: "+1 (555) 345-6789",
      contact_email: "mike.industrial@company.com",
      established_date: "2019-01-10",
      area_sqft: 500000,
      zoning: "Heavy Industrial",
      permits_required: ["Industrial Permit", "Environmental Impact Study", "Hazmat Clearance"],
      safety_rating: "B+",
      accessibility: "Limited - Industrial Access",
      utilities: ["Electric", "Water", "Sewer", "Natural Gas", "Steam"],
      parking_spaces: 200,
      public_transport: false
    },
    {
      id: 4,
      name: "Suburban Area",
      type: "residential",
      address: "321 Maple Avenue",
      city: "Springfield",
      state: "IL",
      zip: "62704",
      country: "USA",
      coordinates: { lat: 39.8120, lng: -89.6350 },
      status: "completed",
      description: "Family-friendly suburban development with parks and amenities",
      active_projects: [],
      total_projects: 12,
      project_manager: "Lisa Wang",
      site_contact: "Sarah Residential",
      contact_phone: "+1 (555) 456-7890",
      contact_email: "sarah.residential@company.com",
      established_date: "2018-05-05",
      area_sqft: 300000,
      zoning: "Residential",
      permits_required: ["Residential Permit", "Subdivision Approval", "Utility Extensions"],
      safety_rating: "A",
      accessibility: "Full ADA Compliance",
      utilities: ["Electric", "Water", "Sewer", "Cable", "Fiber"],
      parking_spaces: 800,
      public_transport: true
    },
    {
      id: 5,
      name: "Highway 101 Corridor",
      type: "infrastructure",
      address: "Highway 101, Mile Marker 15",
      city: "Springfield",
      state: "IL",
      zip: "62705",
      country: "USA",
      coordinates: { lat: 39.7500, lng: -89.7000 },
      status: "planning",
      description: "Major transportation corridor with bridge and roadway improvements",
      active_projects: ["Highway Bridge Renovation"],
      total_projects: 4,
      project_manager: "Mike Wilson",
      site_contact: "Transportation Dept",
      contact_phone: "+1 (555) 567-8901",
      contact_email: "transport@state.gov",
      established_date: "2022-02-28",
      area_sqft: 750000,
      zoning: "Transportation Corridor",
      permits_required: ["DOT Approval", "Environmental Clearance", "Traffic Management Plan"],
      safety_rating: "B",
      accessibility: "N/A - Infrastructure",
      utilities: ["Electric", "Emergency Systems"],
      parking_spaces: 50,
      public_transport: false
    },
    {
      id: 6,
      name: "Central Park",
      type: "recreational",
      address: "100 Park Avenue",
      city: "Springfield", 
      state: "IL",
      zip: "62706",
      country: "USA",
      coordinates: { lat: 39.7950, lng: -89.6520 },
      status: "active",
      description: "Historic central park with recreational facilities and event spaces",
      active_projects: ["Municipal Park Upgrade"],
      total_projects: 6,
      project_manager: "Emma Brown",
      site_contact: "Parks & Rec Dept",
      contact_phone: "+1 (555) 678-9012",
      contact_email: "parks@city.gov",
      established_date: "1950-07-04",
      area_sqft: 180000,
      zoning: "Public Recreation",
      permits_required: ["Parks Permit", "Event Permits", "Environmental Protection"],
      safety_rating: "A",
      accessibility: "Full ADA Compliance",
      utilities: ["Electric", "Water", "Sewer", "Lighting"],
      parking_spaces: 300,
      public_transport: true
    }
  ];

  const handleMenuItemClick = (itemId, href) => {
    console.log('Navigate to:', href);
  };

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || location.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || location.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'commercial': return 'bg-blue-500';
      case 'residential': return 'bg-green-500';
      case 'industrial': return 'bg-orange-500';
      case 'technology': return 'bg-purple-500';
      case 'infrastructure': return 'bg-red-500';
      case 'recreational': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'commercial': return <Building2 className="h-4 w-4" />;
      case 'residential': return <Users className="h-4 w-4" />;
      case 'industrial': return <Activity className="h-4 w-4" />;
      case 'technology': return <Target className="h-4 w-4" />;
      case 'infrastructure': return <Navigation className="h-4 w-4" />;
      case 'recreational': return <MapPin className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'planning': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <AlertTriangle className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const locationStats = {
    total: locations.length,
    active: locations.filter(l => l.status === 'active').length,
    planning: locations.filter(l => l.status === 'planning').length,
    completed: locations.filter(l => l.status === 'completed').length,
    totalArea: locations.reduce((sum, l) => sum + (l.area_sqft || 0), 0),
    totalProjects: locations.reduce((sum, l) => sum + (l.total_projects || 0), 0)
  };

  const LocationCard = ({ location }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
      {/* Type Indicator */}
      <div className={`absolute top-0 left-0 w-full h-1 ${getTypeColor(location.type)}`}></div>
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {location.name}
            </h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(location.status)}`}>
              {getStatusIcon(location.status)}
              <span className="ml-1 capitalize">{location.status}</span>
            </span>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <div className={`p-1 rounded text-white ${getTypeColor(location.type)}`}>
              {getTypeIcon(location.type)}
            </div>
            <span className="text-sm font-medium text-gray-600 capitalize">{location.type}</span>
          </div>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">{location.description}</p>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
          {location.address}, {location.city}, {location.state} {location.zip}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-2 text-gray-400" />
          {location.project_manager}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="h-4 w-4 mr-2 text-gray-400" />
          {location.contact_phone}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="h-4 w-4 mr-2 text-gray-400" />
          {location.contact_email}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="font-bold text-gray-900 text-sm">{location.total_projects}</div>
          <div className="text-xs text-gray-600">Projects</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="font-bold text-gray-900 text-sm">{(location.area_sqft / 1000).toFixed(0)}K</div>
          <div className="text-xs text-gray-600">Sq Ft</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="font-bold text-gray-900 text-sm">{location.safety_rating}</div>
          <div className="text-xs text-gray-600">Safety</div>
        </div>
      </div>

      {/* Active Projects */}
      {location.active_projects && location.active_projects.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Active Projects</h4>
          <div className="space-y-1">
            {location.active_projects.slice(0, 2).map((project, index) => (
              <div key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                {project}
              </div>
            ))}
            {location.active_projects.length > 2 && (
              <div className="text-xs text-gray-500">
                +{location.active_projects.length - 2} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Facilities */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Facilities</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>Parking: {location.parking_spaces} spaces</div>
          <div>Transit: {location.public_transport ? 'Available' : 'Not available'}</div>
          <div>Zoning: {location.zoning}</div>
          <div>Utilities: {location.utilities?.length || 0} types</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
        <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </button>
        <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
          <Map className="h-4 w-4 mr-1" />
          View Map
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-xl text-gray-700 font-semibold">Loading Locations...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Project Locations</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage construction sites, facilities, and project locations
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-2 ${viewMode === 'cards' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'} rounded-l-lg transition-colors`}
                  >
                    <Layers className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-2 ${viewMode === 'map' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'} rounded-r-lg transition-colors`}
                  >
                    <Map className="h-4 w-4" />
                  </button>
                </div>
                <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Location
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          
          {/* Location Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{locationStats.total}</p>
                  <p className="text-xs text-gray-600">Total Locations</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{locationStats.active}</p>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{locationStats.planning}</p>
                  <p className="text-xs text-gray-600">Planning</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{locationStats.completed}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{locationStats.totalProjects}</p>
                  <p className="text-xs text-gray-600">Total Projects</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Layers className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{(locationStats.totalArea / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-gray-600">Total Sq Ft</p>
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
                    placeholder="Search locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="commercial">Commercial</option>
                  <option value="residential">Residential</option>
                  <option value="industrial">Industrial</option>
                  <option value="technology">Technology</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="recreational">Recreational</option>
                </select>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="planning">Planning</option>
                  <option value="completed">Completed</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{filteredLocations.length} locations</span>
              </div>
            </div>
          </div>

          {/* Locations Display */}
          {viewMode === 'cards' ? (
            filteredLocations.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredLocations.map((location) => (
                  <LocationCard key={location.id} location={location} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="mx-auto h-16 w-16 text-gray-300" />
                <p className="mt-4 text-lg text-gray-500">No locations found</p>
                <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
              </div>
            )
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <Map className="mx-auto h-16 w-16 text-gray-300" />
                <p className="mt-4 text-lg text-gray-500">Map View</p>
                <p className="text-sm text-gray-400">Interactive map integration would go here</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LocationsPage;