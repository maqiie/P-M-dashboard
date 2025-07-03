import React, { useState } from 'react';
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Clock,
  Award,
  BarChart3,
  Calendar,
  Filter,
  Download,
  Star,
  CheckCircle,
  AlertTriangle,
  Activity,
  DollarSign,
  Zap,
  Eye,
  MessageSquare,
  Settings
} from 'lucide-react';

const TeamPerformancePage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Mock team performance data
  const teamMembers = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Senior Project Manager",
      avatar: "SJ",
      efficiency: 94,
      projectsCompleted: 8,
      onTimeDelivery: 87,
      clientSatisfaction: 4.8,
      hoursWorked: 168,
      productivity: 92,
      trend: "up",
      currentProjects: 3,
      specializations: ["Commercial", "Residential"],
      recentAchievements: ["Completed Downtown Complex ahead of schedule", "Client satisfaction rating improved by 15%"],
      totalBudgetManaged: 12500000,
      costEfficiency: 96
    },
    {
      id: 2,
      name: "Mike Chen",
      role: "Lead Engineer",
      avatar: "MC",
      efficiency: 89,
      projectsCompleted: 6,
      onTimeDelivery: 92,
      clientSatisfaction: 4.6,
      hoursWorked: 172,
      productivity: 88,
      trend: "up",
      currentProjects: 2,
      specializations: ["Structural", "MEP"],
      recentAchievements: ["Innovative foundation design", "Zero safety incidents this quarter"],
      totalBudgetManaged: 8200000,
      costEfficiency: 94
    },
    {
      id: 3,
      name: "Emily Davis",
      role: "Senior Architect",
      avatar: "ED",
      efficiency: 91,
      projectsCompleted: 5,
      onTimeDelivery: 83,
      clientSatisfaction: 4.9,
      hoursWorked: 156,
      productivity: 95,
      trend: "stable",
      currentProjects: 4,
      specializations: ["Sustainable Design", "Urban Planning"],
      recentAchievements: ["LEED Platinum certification achieved", "Design innovation award"],
      totalBudgetManaged: 6800000,
      costEfficiency: 98
    },
    {
      id: 4,
      name: "Alex Rivera",
      role: "Project Manager",
      avatar: "AR",
      efficiency: 86,
      projectsCompleted: 7,
      onTimeDelivery: 79,
      clientSatisfaction: 4.4,
      hoursWorked: 164,
      productivity: 84,
      trend: "down",
      currentProjects: 2,
      specializations: ["Retail", "Mixed-Use"],
      recentAchievements: ["Successful mall renovation", "Team leadership development"],
      totalBudgetManaged: 9100000,
      costEfficiency: 88
    },
    {
      id: 5,
      name: "Lisa Park",
      role: "Design Coordinator",
      avatar: "LP",
      efficiency: 88,
      projectsCompleted: 9,
      onTimeDelivery: 95,
      clientSatisfaction: 4.7,
      hoursWorked: 148,
      productivity: 90,
      trend: "up",
      currentProjects: 3,
      specializations: ["Interior Design", "Space Planning"],
      recentAchievements: ["Perfect delivery record", "Client retention improved"],
      totalBudgetManaged: 4200000,
      costEfficiency: 93
    },
    {
      id: 6,
      name: "David Kim",
      role: "Senior Project Manager",
      avatar: "DK",
      efficiency: 93,
      projectsCompleted: 4,
      onTimeDelivery: 89,
      clientSatisfaction: 4.8,
      hoursWorked: 178,
      productivity: 89,
      trend: "up",
      currentProjects: 1,
      specializations: ["Tech Facilities", "Industrial"],
      recentAchievements: ["Tech campus phase completion", "Safety excellence award"],
      totalBudgetManaged: 15600000,
      costEfficiency: 97
    }
  ];

  // Performance metrics
  const performanceMetrics = {
    overallEfficiency: 90,
    teamProductivity: 89,
    avgClientSatisfaction: 4.7,
    onTimeDeliveryRate: 87,
    totalProjectsCompleted: 39,
    totalBudgetManaged: 56400000,
    avgCostEfficiency: 94,
    teamUtilization: 92
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceBarColor = (score) => {
    if (score >= 90) return 'from-green-500 to-emerald-600';
    if (score >= 80) return 'from-yellow-500 to-orange-500';
    if (score >= 70) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-700';
  };

  const TeamMemberCard = ({ member }) => (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {member.avatar}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
              <p className="text-sm text-gray-600">{member.role}</p>
              <div className="flex items-center space-x-2 mt-1">
                {member.specializations.map((spec, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className={`flex items-center space-x-1 ${getTrendColor(member.trend)}`}>
            {getTrendIcon(member.trend)}
            <span className="text-sm font-medium">{member.efficiency}%</span>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{member.projectsCompleted}</p>
            <p className="text-xs text-gray-500">Projects Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{member.clientSatisfaction}</p>
            <p className="text-xs text-gray-500">Client Rating</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{member.onTimeDelivery}%</p>
            <p className="text-xs text-gray-500">On-Time Delivery</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{member.currentProjects}</p>
            <p className="text-xs text-gray-500">Active Projects</p>
          </div>
        </div>

        {/* Performance Bars */}
        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Efficiency</span>
              <span className={`font-medium ${getPerformanceColor(member.efficiency)}`}>{member.efficiency}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`bg-gradient-to-r ${getPerformanceBarColor(member.efficiency)} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${member.efficiency}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Productivity</span>
              <span className={`font-medium ${getPerformanceColor(member.productivity)}`}>{member.productivity}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`bg-gradient-to-r ${getPerformanceBarColor(member.productivity)} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${member.productivity}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Cost Efficiency</span>
              <span className={`font-medium ${getPerformanceColor(member.costEfficiency)}`}>{member.costEfficiency}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`bg-gradient-to-r ${getPerformanceBarColor(member.costEfficiency)} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${member.costEfficiency}%` }}
              />
            </div>
          </div>
        </div>

        {/* Budget Managed */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Budget Managed</p>
              <p className="text-lg font-bold text-gray-900">${(member.totalBudgetManaged / 1000000).toFixed(1)}M</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900 flex items-center">
            <Award className="h-4 w-4 mr-2 text-yellow-600" />
            Recent Achievements
          </p>
          {member.recentAchievements.slice(0, 2).map((achievement, index) => (
            <div key={index} className="flex items-start space-x-2">
              <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
              <p className="text-xs text-gray-600">{achievement}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600">
            {member.hoursWorked} hours this month
          </div>
          <div className="flex space-x-1">
            <button className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors">
              <Eye className="h-4 w-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors">
              <MessageSquare className="h-4 w-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors">
              <Settings className="h-4 w-4" />
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
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Team Performance</h1>
              <p className="text-gray-600">Monitor and analyze team member performance metrics</p>
            </div>
          </div>

          {/* Overall Performance Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Team Efficiency</p>
                  <p className="text-2xl font-bold text-green-600">{performanceMetrics.overallEfficiency}%</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">+5% vs last month</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Productivity</p>
                  <p className="text-2xl font-bold text-blue-600">{performanceMetrics.teamProductivity}%</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-blue-600 mr-1" />
                    <span className="text-xs text-blue-600">+3% vs last month</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Client Rating</p>
                  <p className="text-2xl font-bold text-yellow-600">{performanceMetrics.avgClientSatisfaction}</p>
                  <div className="flex items-center mt-1">
                    <Star className="h-3 w-3 text-yellow-600 mr-1 fill-current" />
                    <span className="text-xs text-yellow-600">Excellent</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">On-Time Delivery</p>
                  <p className="text-2xl font-bold text-purple-600">{performanceMetrics.onTimeDeliveryRate}%</p>
                  <div className="flex items-center mt-1">
                    <CheckCircle className="h-3 w-3 text-purple-600 mr-1" />
                    <span className="text-xs text-purple-600">Above target</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Metrics</option>
                <option value="efficiency">Efficiency</option>
                <option value="productivity">Productivity</option>
                <option value="satisfaction">Client Satisfaction</option>
                <option value="delivery">On-Time Delivery</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                <BarChart3 className="h-4 w-4" />
                <span>View Analytics</span>
              </button>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Projects Completed</h3>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{performanceMetrics.totalProjectsCompleted}</p>
              <p className="text-xs text-gray-600 mt-1">Total this period</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Budget Managed</h3>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">${(performanceMetrics.totalBudgetManaged / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-gray-600 mt-1">Total portfolio value</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Team Utilization</h3>
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{performanceMetrics.teamUtilization}%</p>
              <p className="text-xs text-gray-600 mt-1">Resource optimization</p>
            </div>
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>

        {/* Performance Insights */}
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            Performance Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">Top Performer</p>
                  <p className="text-xs text-green-700">Sarah Johnson leads with 94% efficiency</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-900">Best Client Rating</p>
                  <p className="text-xs text-yellow-700">Emily Davis maintains 4.9/5 rating</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Delivery Champion</p>
                  <p className="text-xs text-blue-700">Lisa Park: 95% on-time delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPerformancePage;