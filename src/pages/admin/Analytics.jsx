import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, DollarSign, Clock, Users, Building2,
  Target, AlertTriangle, CheckCircle, Calendar, PieChart,
  Activity, ArrowUp, ArrowDown, Filter, Download, RefreshCw
} from 'lucide-react';

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    revenue: { current: 2450000, previous: 2200000, change: 11.4 },
    projects: { completed: 18, active: 12, planning: 5 },
    efficiency: { current: 94.2, previous: 91.8, change: 2.4 },
    costs: { current: 1850000, previous: 1920000, change: -3.6 }
  });

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const timeRanges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' }
  ];

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `$${(analyticsData.revenue.current / 1000000).toFixed(1)}M`,
      change: analyticsData.revenue.change,
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      description: 'vs last period'
    },
    {
      title: 'Project Efficiency',
      value: `${analyticsData.efficiency.current}%`,
      change: analyticsData.efficiency.change,
      icon: Target,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      description: 'completion rate'
    },
    {
      title: 'Active Projects',
      value: analyticsData.projects.active,
      change: 8.3,
      icon: Building2,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50',
      description: 'currently running'
    },
    {
      title: 'Cost Savings',
      value: `$${Math.abs(analyticsData.costs.current - analyticsData.costs.previous) / 1000}K`,
      change: Math.abs(analyticsData.costs.change),
      icon: TrendingUp,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      description: 'saved this period'
    }
  ];

  const chartData = [
    { month: 'Jan', revenue: 1.8, costs: 1.4, profit: 0.4 },
    { month: 'Feb', revenue: 2.1, costs: 1.6, profit: 0.5 },
    { month: 'Mar', revenue: 2.4, costs: 1.8, profit: 0.6 },
    { month: 'Apr', revenue: 2.2, costs: 1.7, profit: 0.5 },
    { month: 'May', revenue: 2.6, costs: 1.9, profit: 0.7 },
    { month: 'Jun', revenue: 2.8, costs: 2.0, profit: 0.8 }
  ];

  const performanceMetrics = [
    { metric: 'On-Time Delivery', value: 94.2, target: 95, status: 'good' },
    { metric: 'Budget Adherence', value: 91.8, target: 90, status: 'excellent' },
    { metric: 'Quality Score', value: 96.5, target: 95, status: 'excellent' },
    { metric: 'Client Satisfaction', value: 88.3, target: 90, status: 'warning' },
    { metric: 'Team Productivity', value: 92.7, target: 85, status: 'excellent' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <h1 className="text-6xl font-bold text-gray-900 mb-4 tracking-tight">
              Analytics Dashboard
            </h1>
            <p className="text-2xl text-gray-600 leading-relaxed">
              Comprehensive insights and performance metrics for your construction projects
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <Filter className="h-8 w-8 text-gray-500" />
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-xl px-6 py-4 rounded-2xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:outline-none"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-semibold rounded-2xl hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              <RefreshCw className={`h-6 w-6 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          const isPositive = kpi.change >= 0;
          
          return (
            <div key={index} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${kpi.color}`}>
                  <Icon className="h-10 w-10 text-white" />
                </div>
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-lg font-semibold ${
                  isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {isPositive ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                  <span>{Math.abs(kpi.change)}%</span>
                </div>
              </div>
              
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">{kpi.title}</h3>
              <p className="text-5xl font-bold text-gray-900 mb-2">{kpi.value}</p>
              <p className="text-xl text-gray-500">{kpi.description}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Revenue Chart */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-gray-900">Revenue Trends</h3>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
          
          <div className="space-y-6">
            {chartData.map((data, index) => (
              <div key={index} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-gray-700">{data.month}</span>
                  <span className="text-xl font-bold text-gray-900">${data.revenue}M</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${(data.revenue / 3) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-gray-900">Performance Metrics</h3>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
          
          <div className="space-y-6">
            {performanceMetrics.map((metric, index) => {
              const percentage = (metric.value / 100) * 100;
              const statusColor = metric.status === 'excellent' ? 'green' : 
                                metric.status === 'good' ? 'blue' : 'orange';
              
              return (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold text-gray-700">{metric.metric}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-xl font-bold text-gray-900">{metric.value}%</span>
                      <div className={`w-3 h-3 rounded-full bg-${statusColor}-500`} />
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`bg-gradient-to-r from-${statusColor}-400 to-${statusColor}-600 h-3 rounded-full transition-all duration-1000`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-lg text-gray-500">
                    <span>Target: {metric.target}%</span>
                    <span className={`font-semibold ${
                      metric.value >= metric.target ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {metric.value >= metric.target ? '✓ On Track' : '⚠ Below Target'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Project Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h3 className="text-3xl font-bold text-gray-900 mb-8">Project Status Distribution</h3>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">{analyticsData.projects.completed}</p>
              <p className="text-xl text-gray-600">Completed</p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center">
                <Activity className="h-12 w-12 text-white" />
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">{analyticsData.projects.active}</p>
              <p className="text-xl text-gray-600">Active</p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center">
                <Clock className="h-12 w-12 text-white" />
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">{analyticsData.projects.planning}</p>
              <p className="text-xl text-gray-600">Planning</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h3 className="text-3xl font-bold text-gray-900 mb-8">Quick Actions</h3>
          
          <div className="space-y-4">
            <button className="w-full p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold text-xl hover:shadow-xl transition-all duration-300">
              Generate Report
            </button>
            <button className="w-full p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold text-xl hover:shadow-xl transition-all duration-300">
              Export Data
            </button>
            <button className="w-full p-6 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-semibold text-xl hover:shadow-xl transition-all duration-300">
              Schedule Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;