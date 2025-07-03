import React, { useState } from 'react';
import { 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Calendar,
  PieChart,
  BarChart3,
  LineChart,
  AlertTriangle,
  CheckCircle,
  Target,
  Briefcase,
  CreditCard,
  Wallet,
  Receipt,
  Calculator,
  FileText,
  Eye,
  Settings,
  RefreshCw
} from 'lucide-react';

const FinancialReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');
  const [selectedProject, setSelectedProject] = useState('all');

  // Mock financial data
  const financialOverview = {
    totalRevenue: 15420000,
    totalExpenses: 12340000,
    netProfit: 3080000,
    profitMargin: 19.97,
    activeProjects: 12,
    completedProjects: 8,
    pendingInvoices: 2450000,
    cashFlow: 890000,
    monthlyGrowth: 12.5,
    quarterlyGrowth: 38.2
  };

  const projectFinancials = [
    {
      id: 1,
      name: "Downtown Office Complex",
      client: "Metro Development Corp",
      budget: 2500000,
      spent: 1675000,
      revenue: 1890000,
      profit: 215000,
      profitMargin: 11.4,
      status: "In Progress",
      completion: 67,
      invoiced: 1890000,
      collected: 1512000,
      outstanding: 378000,
      categoryBreakdown: {
        materials: 850000,
        labor: 620000,
        equipment: 125000,
        overhead: 80000
      }
    },
    {
      id: 2,
      name: "Tech Campus Phase 2",
      client: "Innovation Tech Inc",
      budget: 6800000,
      spent: 6052000,
      revenue: 6460000,
      profit: 408000,
      profitMargin: 6.3,
      status: "Near Completion",
      completion: 89,
      invoiced: 6460000,
      collected: 5814000,
      outstanding: 646000,
      categoryBreakdown: {
        materials: 3200000,
        labor: 2100000,
        equipment: 520000,
        overhead: 232000
      }
    },
    {
      id: 3,
      name: "Luxury Resort Development",
      client: "Paradise Hotels Group",
      budget: 8500000,
      spent: 4250000,
      revenue: 3825000,
      profit: -425000,
      profitMargin: -11.1,
      status: "At Risk",
      completion: 45,
      invoiced: 3825000,
      collected: 2677500,
      outstanding: 1147500,
      categoryBreakdown: {
        materials: 2200000,
        labor: 1650000,
        equipment: 280000,
        overhead: 120000
      }
    },
    {
      id: 4,
      name: "Public Library Renovation",
      client: "City Municipal Authority",
      budget: 1200000,
      spent: 936000,
      revenue: 1050000,
      profit: 114000,
      profitMargin: 10.9,
      status: "On Track",
      completion: 78,
      invoiced: 1050000,
      collected: 945000,
      outstanding: 105000,
      categoryBreakdown: {
        materials: 480000,
        labor: 320000,
        equipment: 96000,
        overhead: 40000
      }
    }
  ];

  const monthlyData = [
    { month: 'Jan', revenue: 1200000, expenses: 980000, profit: 220000 },
    { month: 'Feb', revenue: 1450000, expenses: 1150000, profit: 300000 },
    { month: 'Mar', revenue: 1380000, expenses: 1100000, profit: 280000 },
    { month: 'Apr', revenue: 1620000, expenses: 1280000, profit: 340000 },
    { month: 'May', revenue: 1850000, expenses: 1460000, profit: 390000 },
    { month: 'Jun', revenue: 2120000, expenses: 1670000, profit: 450000 }
  ];

  const expenseBreakdown = [
    { category: 'Materials', amount: 6850000, percentage: 55.5, color: 'bg-blue-500' },
    { category: 'Labor', amount: 4070000, percentage: 33.0, color: 'bg-green-500' },
    { category: 'Equipment', amount: 841000, percentage: 6.8, color: 'bg-yellow-500' },
    { category: 'Overhead', amount: 579000, percentage: 4.7, color: 'bg-purple-500' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'On Track': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Near Completion': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'At Risk': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getProfitColor = (margin) => {
    if (margin > 15) return 'text-green-600';
    if (margin > 8) return 'text-yellow-600';
    if (margin > 0) return 'text-orange-600';
    return 'text-red-600';
  };

  const ProjectFinancialCard = ({ project }) => (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{project.client}</p>
            <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>
          <div className="text-right">
            <p className={`text-lg font-bold ${getProfitColor(project.profitMargin)}`}>
              {project.profitMargin > 0 ? '+' : ''}{project.profitMargin}%
            </p>
            <p className="text-xs text-gray-500">Profit Margin</p>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Budget</p>
            <p className="text-sm font-medium text-gray-900">${(project.budget / 1000000).toFixed(1)}M</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Revenue</p>
            <p className="text-sm font-medium text-green-600">${(project.revenue / 1000000).toFixed(1)}M</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Spent</p>
            <p className="text-sm font-medium text-gray-900">${(project.spent / 1000000).toFixed(1)}M</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Profit</p>
            <p className={`text-sm font-medium ${getProfitColor(project.profitMargin)}`}>
              ${project.profit > 0 ? '+' : ''}${(project.profit / 1000).toFixed(0)}K
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Project Completion</span>
            <span className="font-medium text-gray-900">{project.completion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.completion}%` }}
            />
          </div>
        </div>

        {/* Invoice Status */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-500">Invoiced</p>
              <p className="text-sm font-medium text-gray-900">${(project.invoiced / 1000000).toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Collected</p>
              <p className="text-sm font-medium text-green-600">${(project.collected / 1000000).toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Outstanding</p>
              <p className="text-sm font-medium text-orange-600">${(project.outstanding / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div>
          <p className="text-sm font-medium text-gray-900 mb-2">Expense Breakdown</p>
          <div className="space-y-2">
            {Object.entries(project.categoryBreakdown).map(([category, amount]) => (
              <div key={category} className="flex justify-between text-xs">
                <span className="text-gray-600 capitalize">{category}</span>
                <span className="font-medium">${(amount / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600">
            Last updated: 2 hours ago
          </div>
          <div className="flex space-x-1">
            <button className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors">
              <Eye className="h-4 w-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors">
              <FileText className="h-4 w-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-purple-600 rounded transition-colors">
              <Calculator className="h-4 w-4" />
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
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Financial Reports</h1>
              <p className="text-gray-600">Comprehensive financial analysis and project profitability</p>
            </div>
          </div>

          {/* Key Financial Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${(financialOverview.totalRevenue / 1000000).toFixed(1)}M</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">+{financialOverview.monthlyGrowth}%</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Net Profit</p>
                  <p className="text-2xl font-bold text-blue-600">${(financialOverview.netProfit / 1000000).toFixed(1)}M</p>
                  <div className="flex items-center mt-1">
                    <Target className="h-3 w-3 text-blue-600 mr-1" />
                    <span className="text-xs text-blue-600">{financialOverview.profitMargin}% margin</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Cash Flow</p>
                  <p className="text-2xl font-bold text-purple-600">${(financialOverview.cashFlow / 1000).toFixed(0)}K</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-purple-600 mr-1" />
                    <span className="text-xs text-purple-600">Positive</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Outstanding</p>
                  <p className="text-2xl font-bold text-orange-600">${(financialOverview.pendingInvoices / 1000000).toFixed(1)}M</p>
                  <div className="flex items-center mt-1">
                    <Receipt className="h-3 w-3 text-orange-600 mr-1" />
                    <span className="text-xs text-orange-600">Pending</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-orange-600" />
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
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="overview">Overview</option>
                <option value="profit-loss">P&L Statement</option>
                <option value="cash-flow">Cash Flow</option>
                <option value="budget-variance">Budget Variance</option>
              </select>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Projects</option>
                <option value="active">Active Projects</option>
                <option value="completed">Completed Projects</option>
                <option value="profitable">Most Profitable</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export PDF</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                <BarChart3 className="h-4 w-4" />
                <span>Generate Report</span>
              </button>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue vs Expenses Chart */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Revenue vs Expenses</h3>
                <LineChart className="h-5 w-5 text-gray-600" />
              </div>
              <div className="space-y-4">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 w-12">{data.month}</span>
                    <div className="flex-1 mx-4">
                      <div className="flex space-x-2">
                        <div 
                          className="bg-green-500 h-4 rounded"
                          style={{ width: `${(data.revenue / 2500000) * 100}%` }}
                          title={`Revenue: $${(data.revenue / 1000000).toFixed(1)}M`}
                        />
                        <div 
                          className="bg-red-400 h-4 rounded"
                          style={{ width: `${(data.expenses / 2500000) * 100}%` }}
                          title={`Expenses: $${(data.expenses / 1000000).toFixed(1)}M`}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-16">
                      ${(data.profit / 1000).toFixed(0)}K
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2" />
                  <span className="text-gray-600">Revenue</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-400 rounded mr-2" />
                  <span className="text-gray-600">Expenses</span>
                </div>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Expense Breakdown</h3>
                <PieChart className="h-5 w-5 text-gray-600" />
              </div>
              <div className="space-y-3">
                {expenseBreakdown.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">{item.category}</span>
                      <span className="text-sm font-medium">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${item.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="text-right mt-1">
                      <span className="text-xs text-gray-500">${(item.amount / 1000000).toFixed(1)}M</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Project Financial Cards */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Financials</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
            {projectFinancials.map((project) => (
              <ProjectFinancialCard key={project.id} project={project} />
            ))}
          </div>
        </div>

        {/* Financial Alerts */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
            Financial Alerts
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Luxury Resort Development Over Budget</p>
                <p className="text-xs text-red-700">Project is $425K over budget with negative profit margin</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <Receipt className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Outstanding Invoices</p>
                <p className="text-xs text-yellow-700">$2.45M in pending invoices require follow-up</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Strong Cash Flow</p>
                <p className="text-xs text-green-700">Positive cash flow trend with 12.5% monthly growth</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReportsPage;