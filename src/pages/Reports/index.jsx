import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import { 
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  PieChart,
  LineChart,
  Users,
  DollarSign,
  Clock,
  Target,
  Building2,
  CheckCircle,
  AlertTriangle,
  FileText,
  Eye,
  Share,
  Settings
} from 'lucide-react';

const ReportsPage = () => {
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'projects', 'financial', 'team'
  const [dateRange, setDateRange] = useState('30days');
  const [selectedMetrics, setSelectedMetrics] = useState(['all']);
  const [activeMenuItem, setActiveMenuItem] = useState('reports');

  useEffect(() => {
    loadReportData();
  }, [activeTab, dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      // In a real app, you'd load different report data based on activeTab
      const data = await getMockReportData();
      setReportData(data);
    } catch (error) {
      console.error('Failed to load report data:', error);
      setReportData(getMockReportData());
    } finally {
      setLoading(false);
    }
  };

  const getMockReportData = () => ({
    overview: {
      totalProjects: 24,
      activeProjects: 8,
      completedThisMonth: 3,
      budgetUtilization: 78,
      teamEfficiency: 85,
      clientSatisfaction: 92,
      onTimeDelivery: 88,
      qualityScore: 94
    },
    projectMetrics: {
      byStatus: [
        { name: 'Planning', value: 4, color: '#f59e0b' },
        { name: 'In Progress', value: 8, color: '#3b82f6' },
        { name: 'Review', value: 3, color: '#8b5cf6' },
        { name: 'Completed', value: 9, color: '#10b981' }
      ],
      byPriority: [
        { name: 'High', value: 6, color: '#ef4444' },
        { name: 'Medium', value: 12, color: '#f59e0b' },
        { name: 'Low', value: 6, color: '#10b981' }
      ],
      completionTrend: [
        { month: 'Jan', completed: 2, started: 3 },
        { month: 'Feb', completed: 3, started: 4 },
        { month: 'Mar', completed: 4, started: 2 },
        { month: 'Apr', completed: 2, started: 5 },
        { month: 'May', completed: 5, started: 3 },
        { month: 'Jun', completed: 3, started: 2 }
      ]
    },
    financialMetrics: {
      totalBudget: 15000000,
      budgetUsed: 11700000,
      remainingBudget: 3300000,
      costByCategory: [
        { name: 'Materials', amount: 4500000, percentage: 38 },
        { name: 'Labor', amount: 3600000, percentage: 31 },
        { name: 'Equipment', amount: 2100000, percentage: 18 },
        { name: 'Permits', amount: 900000, percentage: 8 },
        { name: 'Other', amount: 600000, percentage: 5 }
      ],
      monthlySpend: [
        { month: 'Jan', budget: 2000000, actual: 1850000 },
        { month: 'Feb', budget: 2200000, actual: 2100000 },
        { month: 'Mar', budget: 1800000, actual: 1950000 },
        { month: 'Apr', budget: 2500000, actual: 2300000 },
        { month: 'May', budget: 2000000, actual: 1900000 },
        { month: 'Jun', budget: 1900000, actual: 1800000 }
      ]
    },
    teamMetrics: {
      totalMembers: 45,
      activeMembers: 38,
      efficiency: 85,
      performance: [
        { name: 'Excellent', count: 12, percentage: 27 },
        { name: 'Good', count: 20, percentage: 44 },
        { name: 'Average', count: 10, percentage: 22 },
        { name: 'Needs Improvement', count: 3, percentage: 7 }
      ],
      workload: [
        { department: 'Engineering', members: 15, utilization: 88 },
        { department: 'Construction', members: 12, utilization: 92 },
        { department: 'Design', members: 8, utilization: 75 },
        { department: 'Management', members: 6, utilization: 80 },
        { department: 'Quality', members: 4, utilization: 85 }
      ]
    }
  });

  const handleMenuItemClick = (itemId, href) => {
    console.log('Navigate to:', href);
  };

  const handleExport = (format) => {
    console.log(`Exporting report as ${format}`);
    // Implement export functionality
  };

  const MetricCard = ({ title, value, change, icon: Icon, color = "blue" }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="h-4 w-4 mr-1" />
              {change > 0 ? '+' : ''}{change}% vs last month
            </div>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children, actions }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Projects"
          value={reportData.overview?.totalProjects || 0}
          change={5.2}
          icon={Building2}
          color="blue"
        />
        <MetricCard
          title="Active Projects"
          value={reportData.overview?.activeProjects || 0}
          change={2.1}
          icon={Target}
          color="green"
        />
        <MetricCard
          title="Budget Utilization"
          value={`${reportData.overview?.budgetUtilization || 0}%`}
          change={-1.3}
          icon={DollarSign}
          color="purple"
        />
        <MetricCard
          title="Team Efficiency"
          value={`${reportData.overview?.teamEfficiency || 0}%`}
          change={3.7}
          icon={Users}
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Project Status Distribution"
          actions={[
            <button key="view" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
              <Eye className="h-4 w-4" />
            </button>
          ]}
        >
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <PieChart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-500">Project Status Chart</p>
              <p className="text-sm text-gray-400">Interactive chart would display here</p>
            </div>
          </div>
        </ChartCard>

        <ChartCard 
          title="Monthly Progress Trend"
          actions={[
            <button key="view" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
              <Eye className="h-4 w-4" />
            </button>
          ]}
        >
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <LineChart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-500">Progress Trend Chart</p>
              <p className="text-sm text-gray-400">Line chart showing monthly progress</p>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Performance Indicators */}
      <ChartCard title="Performance Indicators">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-green-600">
                {reportData.overview?.onTimeDelivery || 0}%
              </span>
            </div>
            <p className="font-medium text-gray-900">On-Time Delivery</p>
            <p className="text-sm text-gray-500">Projects completed on schedule</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-blue-600">
                {reportData.overview?.qualityScore || 0}%
              </span>
            </div>
            <p className="font-medium text-gray-900">Quality Score</p>
            <p className="text-sm text-gray-500">Average quality rating</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-purple-600">
                {reportData.overview?.clientSatisfaction || 0}%
              </span>
            </div>
            <p className="font-medium text-gray-900">Client Satisfaction</p>
            <p className="text-sm text-gray-500">Customer satisfaction rating</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-orange-600">
                {reportData.overview?.teamEfficiency || 0}%
              </span>
            </div>
            <p className="font-medium text-gray-900">Team Efficiency</p>
            <p className="text-sm text-gray-500">Overall team productivity</p>
          </div>
        </div>
      </ChartCard>
    </div>
  );

  const ProjectsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Projects by Status">
          <div className="space-y-4">
            {reportData.projectMetrics?.byStatus.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="font-medium text-gray-700">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900">{item.value}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        backgroundColor: item.color,
                        width: `${(item.value / 24) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Projects by Priority">
          <div className="space-y-4">
            {reportData.projectMetrics?.byPriority.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="font-medium text-gray-700">{item.name} Priority</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900">{item.value}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        backgroundColor: item.color,
                        width: `${(item.value / 24) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Project Completion Trend">
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500">Project Completion Trend</p>
            <p className="text-sm text-gray-400">Bar chart showing monthly completions vs starts</p>
          </div>
        </div>
      </ChartCard>
    </div>
  );

  const FinancialTab = () => (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Budget"
          value={`$${(reportData.financialMetrics?.totalBudget / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          color="blue"
        />
        <MetricCard
          title="Budget Used"
          value={`$${(reportData.financialMetrics?.budgetUsed / 1000000).toFixed(1)}M`}
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Remaining Budget"
          value={`$${(reportData.financialMetrics?.remainingBudget / 1000000).toFixed(1)}M`}
          icon={Target}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Cost by Category">
          <div className="space-y-4">
            {reportData.financialMetrics?.costByCategory.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="font-bold text-gray-900">
                    ${(item.amount / 1000000).toFixed(1)}M ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Monthly Budget vs Actual">
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-500">Budget vs Actual Spending</p>
              <p className="text-sm text-gray-400">Comparison chart would display here</p>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );

  const TeamTab = () => (
    <div className="space-y-6">
      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Team Members"
          value={reportData.teamMetrics?.totalMembers || 0}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Active Members"
          value={reportData.teamMetrics?.activeMembers || 0}
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          title="Team Efficiency"
          value={`${reportData.teamMetrics?.efficiency || 0}%`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Performance Distribution">
          <div className="space-y-4">
            {reportData.teamMetrics?.performance.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="font-medium text-gray-700">{item.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900">{item.count} ({item.percentage}%)</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Department Workload">
          <div className="space-y-4">
            {reportData.teamMetrics?.workload.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">{item.department}</span>
                  <span className="text-sm text-gray-500">{item.members} members</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className={`h-2 rounded-full ${
                        item.utilization > 90 ? 'bg-red-500' :
                        item.utilization > 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${item.utilization}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-gray-900">{item.utilization}%</span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-xl text-gray-700 font-semibold">Loading Reports...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Track performance, analyze trends, and generate insights
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 90 days</option>
                  <option value="12months">Last 12 months</option>
                </select>
                
                <button 
                  onClick={() => loadReportData()}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-colors"
                  title="Refresh Data"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleExport('pdf')}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          
          {/* Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg mb-6">
            <div className="flex items-center border-b border-gray-200">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'projects', label: 'Projects', icon: Building2 },
                { id: 'financial', label: 'Financial', icon: DollarSign },
                { id: 'team', label: 'Team', icon: Users }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'projects' && <ProjectsTab />}
          {activeTab === 'financial' && <FinancialTab />}
          {activeTab === 'team' && <TeamTab />}
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;