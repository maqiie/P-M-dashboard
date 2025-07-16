import React, { useState, useEffect } from 'react';
import {
  BarChart3, Download, Filter, Calendar, Eye, Plus, Search,
  TrendingUp, DollarSign, Clock, Users, Building2, Target,
  FileText, PieChart, Activity, AlertTriangle, CheckCircle,
  Star, Award, Briefcase, Settings, RefreshCw, Share2
} from 'lucide-react';

const ReportsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [reportData] = useState({
    overview: {
      totalRevenue: 24500000,
      revenueGrowth: 12.4,
      activeProjects: 12,
      completedProjects: 8,
      teamProductivity: 94.2,
      clientSatisfaction: 4.7,
      budgetUtilization: 87.3,
      profitMargin: 18.5
    },
    financial: {
      monthlyRevenue: [
        { month: 'Jan', revenue: 3200000, expenses: 2400000, profit: 800000 },
        { month: 'Feb', revenue: 3800000, expenses: 2850000, profit: 950000 },
        { month: 'Mar', revenue: 4200000, expenses: 3100000, profit: 1100000 },
        { month: 'Apr', revenue: 3900000, expenses: 2900000, profit: 1000000 },
        { month: 'May', revenue: 4500000, expenses: 3300000, profit: 1200000 },
        { month: 'Jun', revenue: 4900000, expenses: 3500000, profit: 1400000 }
      ],
      costBreakdown: [
        { category: 'Materials', amount: 12500000, percentage: 51 },
        { category: 'Labor', amount: 7200000, percentage: 29 },
        { category: 'Equipment', amount: 3100000, percentage: 13 },
        { category: 'Overhead', amount: 1700000, percentage: 7 }
      ]
    },
    projects: {
      statusDistribution: [
        { status: 'Completed', count: 8, percentage: 40 },
        { status: 'Active', count: 12, percentage: 60 },
        { status: 'Planning', count: 5, percentage: 25 },
        { status: 'On Hold', count: 2, percentage: 10 }
      ],
      performanceMetrics: [
        { metric: 'On-Time Delivery', value: 94.2, target: 95, trend: 'up' },
        { metric: 'Budget Adherence', value: 87.3, target: 90, trend: 'down' },
        { metric: 'Quality Score', value: 96.5, target: 95, trend: 'up' },
        { metric: 'Safety Rating', value: 98.1, target: 95, trend: 'up' }
      ]
    },
    team: {
      productivity: [
        { member: 'John Smith', projects: 3, efficiency: 94.2, hours: 160 },
        { member: 'Sarah Johnson', projects: 2, efficiency: 91.8, hours: 168 },
        { member: 'Mike Wilson', projects: 4, efficiency: 96.1, hours: 172 },
        { member: 'Emily Davis', projects: 2, efficiency: 88.5, hours: 155 },
        { member: 'David Chen', projects: 1, efficiency: 93.7, hours: 164 }
      ],
      departmentStats: [
        { department: 'Project Management', members: 4, utilization: 92 },
        { department: 'Engineering', members: 6, utilization: 88 },
        { department: 'Operations', members: 12, utilization: 95 },
        { department: 'Quality Control', members: 3, utilization: 85 }
      ]
    }
  });

  const reportCategories = [
    { id: 'overview', label: 'Executive Overview', icon: BarChart3, color: 'blue' },
    { id: 'financial', label: 'Financial Reports', icon: DollarSign, color: 'green' },
    { id: 'projects', label: 'Project Performance', icon: Building2, color: 'purple' },
    { id: 'team', label: 'Team Analytics', icon: Users, color: 'orange' },
    { id: 'safety', label: 'Safety Reports', icon: AlertTriangle, color: 'red' },
    { id: 'quality', label: 'Quality Metrics', icon: Award, color: 'yellow' }
  ];

  const predefinedReports = [
    {
      id: 1,
      title: 'Monthly Executive Summary',
      description: 'Comprehensive overview of all KPIs and metrics',
      category: 'overview',
      lastGenerated: '2024-07-10',
      format: 'PDF',
      size: '2.4 MB'
    },
    {
      id: 2,
      title: 'Financial Performance Q2',
      description: 'Detailed financial analysis and budget tracking',
      category: 'financial',
      lastGenerated: '2024-07-08',
      format: 'Excel',
      size: '1.8 MB'
    },
    {
      id: 3,
      title: 'Project Status Dashboard',
      description: 'Current status of all active and completed projects',
      category: 'projects',
      lastGenerated: '2024-07-12',
      format: 'PDF',
      size: '3.1 MB'
    },
    {
      id: 4,
      title: 'Team Productivity Analysis',
      description: 'Individual and department performance metrics',
      category: 'team',
      lastGenerated: '2024-07-09',
      format: 'PDF',
      size: '1.5 MB'
    },
    {
      id: 5,
      title: 'Safety Compliance Report',
      description: 'Safety incidents, training, and compliance status',
      category: 'safety',
      lastGenerated: '2024-07-11',
      format: 'PDF',
      size: '2.7 MB'
    },
    {
      id: 6,
      title: 'Quality Assurance Metrics',
      description: 'Quality control measurements and improvement tracking',
      category: 'quality',
      lastGenerated: '2024-07-07',
      format: 'Excel',
      size: '2.2 MB'
    }
  ];

  const dateRanges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const generateReport = async (reportId) => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const exportReport = (reportId, format) => {
    console.log(`Exporting report ${reportId} as ${format}`);
  };

  const getCategoryColor = (category) => {
    const cat = reportCategories.find(c => c.id === category);
    return cat ? cat.color : 'gray';
  };

  const filteredReports = predefinedReports.filter(report =>
    report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <h1 className="text-6xl font-bold text-gray-900 mb-4 tracking-tight">
              Reports
            </h1>
            <p className="text-2xl text-gray-600 leading-relaxed">
              Generate comprehensive reports and analytics for data-driven decision making
            </p>
          </div>
          
          <button className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-semibold rounded-2xl hover:shadow-xl transition-all duration-300">
            <Plus className="h-6 w-6" />
            <span>Custom Report</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-12 w-12 text-green-500" />
            <div className="text-right">
              <p className="text-4xl font-bold text-gray-900">
                ${(reportData.overview.totalRevenue / 1000000).toFixed(1)}M
              </p>
              <p className="text-xl text-gray-600">Total Revenue</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-green-600">
            <TrendingUp className="h-5 w-5" />
            <span className="text-lg font-semibold">+{reportData.overview.revenueGrowth}%</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Building2 className="h-12 w-12 text-blue-500" />
            <div className="text-right">
              <p className="text-4xl font-bold text-gray-900">{reportData.overview.activeProjects}</p>
              <p className="text-xl text-gray-600">Active Projects</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-blue-600">
            <Activity className="h-5 w-5" />
            <span className="text-lg font-semibold">In Progress</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Target className="h-12 w-12 text-purple-500" />
            <div className="text-right">
              <p className="text-4xl font-bold text-gray-900">{reportData.overview.teamProductivity}%</p>
              <p className="text-xl text-gray-600">Team Productivity</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-purple-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-lg font-semibold">Excellent</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Star className="h-12 w-12 text-yellow-500" />
            <div className="text-right">
              <p className="text-4xl font-bold text-gray-900">{reportData.overview.clientSatisfaction}</p>
              <p className="text-xl text-gray-600">Client Rating</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-yellow-600">
            <Award className="h-5 w-5" />
            <span className="text-lg font-semibold">Outstanding</span>
          </div>
        </div>
      </div>

      {/* Report Categories */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Report Categories</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reportCategories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                  isSelected 
                    ? `border-${category.color}-500 bg-${category.color}-50` 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-4 mb-3">
                  <div className={`p-3 rounded-xl bg-${category.color}-100`}>
                    <Icon className={`h-8 w-8 text-${category.color}-600`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{category.label}</h3>
                </div>
                <p className="text-lg text-gray-600">
                  {category.id === 'overview' && 'Executive summary and KPI dashboard'}
                  {category.id === 'financial' && 'Revenue, costs, and budget analysis'}
                  {category.id === 'projects' && 'Project status and performance metrics'}
                  {category.id === 'team' && 'Team productivity and efficiency reports'}
                  {category.id === 'safety' && 'Safety compliance and incident tracking'}
                  {category.id === 'quality' && 'Quality control and improvement metrics'}
                </p>
              </button>
            );
          })}
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center space-x-6 pt-6 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-gray-500" />
            <span className="text-xl font-semibold text-gray-700">Date Range:</span>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="text-xl px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <button
            onClick={() => generateReport(selectedCategory)}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Predefined Reports */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Recent Reports</h2>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map((report) => (
            <div key={report.id} className="border-2 border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-3 h-3 rounded-full bg-${getCategoryColor(report.category)}-500`} />
                    <h3 className="text-2xl font-bold text-gray-900">{report.title}</h3>
                  </div>
                  <p className="text-lg text-gray-600 mb-3">{report.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Last generated: {new Date(report.lastGenerated).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{report.format}</span>
                    <span>•</span>
                    <span>{report.size}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all">
                  <Eye className="h-5 w-5" />
                  <span className="font-semibold">View</span>
                </button>
                
                <button 
                  onClick={() => exportReport(report.id, 'PDF')}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all"
                >
                  <Download className="h-5 w-5" />
                  <span className="font-semibold">Download</span>
                </button>
                
                <button className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Category Data Visualization */}
      {selectedCategory === 'financial' && (
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Financial Performance</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue Chart */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Monthly Revenue Trend</h3>
              <div className="space-y-4">
                {reportData.financial.monthlyRevenue.map((data, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-700">{data.month}</span>
                      <span className="text-lg font-bold text-gray-900">
                        ${(data.revenue / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${(data.revenue / 5000000) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Cost Breakdown</h3>
              <div className="space-y-4">
                {reportData.financial.costBreakdown.map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-orange-500' : 'bg-purple-500'
                      }`} />
                      <span className="text-lg font-semibold text-gray-700">{data.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ${(data.amount / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-sm text-gray-500">{data.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;