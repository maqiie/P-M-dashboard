import React, { useState, useEffect } from 'react';
import {
  Calendar, Plus, ChevronLeft, ChevronRight, Clock, MapPin,
  Users, Building2, AlertTriangle, CheckCircle, Eye, Edit,
  Filter, Search, Bell, CalendarDays, Target, Flag, Star,
  Loader, FileText, Award, TrendingUp, Menu, X
} from 'lucide-react';

import AdminSidebar from '../admin/AdminSidebar';

import { 
  calendarAPI, 
  eventsAPI, 
  projectsAPI, 
  tendersAPI, 
  tasksAPI 
} from '../../services/api';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [upcomingItems, setUpcomingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        setLoading(true);
        
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const [
          calendarEvents,
          projects,
          tenders,
          tasks,
          eventsData
        ] = await Promise.allSettled([
          calendarAPI.getEvents(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]).catch(() => []),
          projectsAPI.getAll().catch(() => []),
          tendersAPI.getAll().catch(() => ({ tenders: [] })),
          tasksAPI.getAll().catch(() => ({ tasks: [] })),
          eventsAPI.getAll().catch(() => [])
        ]);

        let allEvents = [];
        let upcomingEvents = [];

        if (calendarEvents.status === 'fulfilled') {
          const events = Array.isArray(calendarEvents.value) ? calendarEvents.value : [];
          allEvents = [...allEvents, ...events.map(event => ({
            ...event,
            type: event.type || 'event',
            source: 'calendar'
          }))];
        }

        if (eventsData.status === 'fulfilled') {
          const events = Array.isArray(eventsData.value) ? eventsData.value : [];
          allEvents = [...allEvents, ...events.map(event => ({
            ...event,
            type: event.type || 'event',
            source: 'events',
            date: event.date || event.event_date || event.start_date,
            time: event.time || event.start_time || '00:00',
            title: event.title || event.name || 'Untitled Event'
          }))];
        }

        if (projects.status === 'fulfilled') {
          const projectsArray = Array.isArray(projects.value) ? projects.value : projects.value?.projects || [];
          const projectDeadlines = projectsArray.filter(p => p.finishing_date || p.deadline).map(project => ({
            id: `project_${project.id}`,
            title: `${project.title || project.name} - Deadline`,
            type: 'deadline',
            source: 'project',
            project: project.title || project.name,
            date: project.finishing_date || project.deadline,
            time: '17:00',
            duration: 0,
            location: project.location || 'Project Site',
            attendees: ['Project Team'],
            status: 'scheduled',
            priority: project.priority || 'medium',
            description: `Project completion deadline for ${project.title || project.name}`
          }));
          
          allEvents = [...allEvents, ...projectDeadlines];
          upcomingEvents = [...upcomingEvents, ...projectDeadlines];
        }

        if (tenders.status === 'fulfilled') {
          const tendersArray = tenders.value?.tenders || tenders.value?.data || tenders.value || [];
          const tenderDeadlines = Array.isArray(tendersArray) ? tendersArray.filter(t => t.deadline || t.submission_deadline).map(tender => ({
            id: `tender_${tender.id}`,
            title: `${tender.title || tender.name} - Submission Deadline`,
            type: 'deadline',
            source: 'tender',
            project: tender.title || tender.name,
            date: tender.deadline || tender.submission_deadline,
            time: '23:59',
            duration: 0,
            location: 'Tender Submission',
            attendees: ['Bid Team'],
            status: 'scheduled',
            priority: 'high',
            description: `Tender submission deadline for ${tender.title || tender.name}`
          })) : [];
          
          allEvents = [...allEvents, ...tenderDeadlines];
          upcomingEvents = [...upcomingEvents, ...tenderDeadlines];
        }

        if (tasks.status === 'fulfilled') {
          const tasksArray = tasks.value?.tasks || tasks.value?.data || tasks.value || [];
          const taskDeadlines = Array.isArray(tasksArray) ? tasksArray.filter(t => t.due_date || t.deadline).map(task => ({
            id: `task_${task.id}`,
            title: `${task.title} - Due`,
            type: 'task',
            source: 'task',
            project: task.project || task.project_name || 'General',
            date: task.due_date || task.deadline,
            time: '17:00',
            duration: 0,
            location: task.location || 'Task Location',
            attendees: [task.assignee || task.assigned_to || 'Assignee'],
            status: task.status || 'scheduled',
            priority: task.priority || 'medium',
            description: task.description || `Task: ${task.title}`
          })) : [];
          
          allEvents = [...allEvents, ...taskDeadlines];
          upcomingEvents = [...upcomingEvents, ...taskDeadlines];
        }

        const now = new Date();
        const sortedUpcoming = upcomingEvents
          .filter(item => new Date(item.date) >= now)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 10);

        setEvents(allEvents);
        setUpcomingItems(sortedUpcoming);
        setError(null);
      } catch (err) {
        setError('Failed to load calendar data. Please try again.');
        console.error('Error fetching calendar data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, [currentDate]);

  const eventTypes = [
    { value: 'all', label: 'All Events', color: 'gray' },
    { value: 'meeting', label: 'Meetings', color: 'blue' },
    { value: 'inspection', label: 'Inspections', color: 'green' },
    { value: 'training', label: 'Training', color: 'purple' },
    { value: 'delivery', label: 'Deliveries', color: 'orange' },
    { value: 'deadline', label: 'Deadlines', color: 'red' },
    { value: 'maintenance', label: 'Maintenance', color: 'yellow' },
    { value: 'survey', label: 'Surveys', color: 'teal' },
    { value: 'task', label: 'Tasks', color: 'indigo' },
    { value: 'event', label: 'Events', color: 'pink' }
  ];

  const getEventTypeStyles = (type) => {
    const styles = {
      meeting: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-400', dot: 'bg-blue-400' },
      inspection: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-400', dot: 'bg-green-400' },
      training: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-400', dot: 'bg-purple-400' },
      delivery: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-400', dot: 'bg-orange-400' },
      deadline: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-400', dot: 'bg-red-400' },
      maintenance: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-400', dot: 'bg-yellow-400' },
      survey: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-400', dot: 'bg-teal-400' },
      task: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-400', dot: 'bg-indigo-400' },
      event: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-400', dot: 'bg-pink-400' }
    };
    return styles[type] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-400', dot: 'bg-gray-400' };
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'meeting': return <Users className="h-4 w-4" />;
      case 'inspection': return <CheckCircle className="h-4 w-4" />;
      case 'training': return <Target className="h-4 w-4" />;
      case 'delivery': return <Building2 className="h-4 w-4" />;
      case 'deadline': return <Flag className="h-4 w-4" />;
      case 'maintenance': return <AlertTriangle className="h-4 w-4" />;
      case 'survey': return <Eye className="h-4 w-4" />;
      case 'task': return <CheckCircle className="h-4 w-4" />;
      case 'event': return <Star className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'project': return <Building2 className="h-4 w-4" />;
      case 'tender': return <FileText className="h-4 w-4" />;
      case 'task': return <CheckCircle className="h-4 w-4" />;
      case 'events': return <Calendar className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = event.date ? event.date.split('T')[0] : '';
      return eventDate === dateStr;
    });
  };

  const filteredEvents = events.filter(event => {
    const matchesType = filterType === 'all' || event.type === filterType;
    const searchText = [
      event.title || '',
      event.project || '',
      event.description || ''
    ].join(' ').toLowerCase();
    const matchesSearch = searchText.includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const todayEvents = getEventsForDate(new Date());
  const selectedDateEvents = getEventsForDate(selectedDate);

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDuration = (duration) => {
    if (!duration || duration === 0) return '';
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const getDaysUntil = (date) => {
    if (!date) return null;
    const now = new Date();
    const eventDate = new Date(date);
    const diffTime = eventDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex items-center justify-center min-w-0">
          <div className="text-center">
            <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-xl text-gray-600">Loading calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex items-center justify-center min-w-0">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-xl text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <Menu className="h-5 w-5 text-slate-700" />
              </button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Calendar</h1>
                <p className="text-sm text-gray-600">{events.length} events • {todayEvents.length} today</p>
              </div>
            </div>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Event</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <CalendarDays className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-900">{events.length}</p>
              <p className="text-xs text-gray-600">Total Events</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <Clock className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-900">{todayEvents.length}</p>
              <p className="text-xs text-gray-600">Today</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-900">{events.filter(e => e.priority === 'high').length}</p>
              <p className="text-xs text-gray-600">High Priority</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <Users className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-900">{events.filter(e => e.type === 'meeting').length}</p>
              <p className="text-xs text-gray-600">Meetings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
            {/* Calendar */}
            <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Calendar Header */}
              <div className="p-4 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-bold text-gray-900">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 text-xs"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => navigateMonth(1)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-4">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="text-center py-2 text-xs font-semibold text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentDate).map((date, index) => {
                    const dayEvents = getEventsForDate(date);
                    
                    return (
                      <div
                        key={index}
                        className={`min-h-20 p-1.5 border rounded-lg cursor-pointer transition-all ${
                          date ? (
                            isToday(date) 
                              ? 'border-blue-500 bg-blue-50' 
                              : isSelected(date)
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          ) : 'border-transparent'
                        }`}
                        onClick={() => date && setSelectedDate(date)}
                      >
                        {date && (
                          <>
                            <div className={`text-xs font-semibold mb-1 ${
                              isToday(date) ? 'text-blue-700' : 
                              isSelected(date) ? 'text-purple-700' : 'text-gray-900'
                            }`}>
                              {date.getDate()}
                            </div>
                            
                            <div className="space-y-0.5">
                              {dayEvents.slice(0, 2).map(event => {
                                const styles = getEventTypeStyles(event.type);
                                return (
                                  <div
                                    key={event.id}
                                    className={`p-1 rounded text-[10px] font-medium ${styles.bg} ${styles.text} border-l-2 ${styles.border} truncate`}
                                  >
                                    {event.title}
                                  </div>
                                );
                              })}
                              {dayEvents.length > 2 && (
                                <div className="text-[10px] text-gray-500 font-medium">
                                  +{dayEvents.length - 2} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4">
              {/* Upcoming Events */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-purple-50 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900">Upcoming Events</h3>
                  <p className="text-xs text-gray-600">{upcomingItems.length} items</p>
                </div>
                
                <div className="p-3 max-h-64 overflow-y-auto">
                  {upcomingItems.length > 0 ? (
                    <div className="space-y-2">
                      {upcomingItems.slice(0, 5).map(item => {
                        const daysUntil = getDaysUntil(item.date);
                        const styles = getEventTypeStyles(item.type);
                        return (
                          <div key={item.id} className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex items-center space-x-2 min-w-0">
                                <div className={`p-1 rounded ${styles.bg}`}>
                                  {getSourceIcon(item.source)}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-semibold text-gray-900 truncate">{item.title}</h4>
                                  <p className="text-[10px] text-gray-600 truncate">{item.project}</p>
                                </div>
                              </div>
                              {daysUntil !== null && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                                  daysUntil === 0 ? 'bg-red-100 text-red-700' :
                                  daysUntil <= 3 ? 'bg-orange-100 text-orange-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {daysUntil === 0 ? 'Today' : 
                                   daysUntil === 1 ? 'Tomorrow' : 
                                   `${daysUntil}d`}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">No upcoming events</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900">Filters</h3>
                </div>
                
                <div className="p-3 space-y-3">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Date Events */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-green-50 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <p className="text-xs text-gray-600">{selectedDateEvents.length} events</p>
                </div>
                
                <div className="p-3 max-h-64 overflow-y-auto">
                  {selectedDateEvents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDateEvents.map(event => {
                        const styles = getEventTypeStyles(event.type);
                        return (
                          <div key={event.id} className={`p-2 rounded-lg border-l-2 ${getPriorityColor(event.priority)}`}>
                            <div className="flex items-center space-x-2 mb-1">
                              <div className={`p-1 rounded ${styles.bg}`}>
                                {getEventIcon(event.type)}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-semibold text-gray-900 truncate">{event.title}</h4>
                                <p className="text-[10px] text-gray-600 truncate">{event.project}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-0.5 text-[10px] text-gray-600">
                              {event.time && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTime(event.time)}</span>
                                </div>
                              )}
                              {event.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{event.location}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex space-x-1 mt-2">
                              <button className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-medium hover:bg-blue-100">
                                <Eye className="h-3 w-3" />
                                <span>View</span>
                              </button>
                              <button className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-green-50 text-green-600 rounded text-[10px] font-medium hover:bg-green-100">
                                <Edit className="h-3 w-3" />
                                <span>Edit</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">No events scheduled</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Legend */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900">Event Types</h3>
                </div>
                
                <div className="p-3 space-y-1">
                  {eventTypes.slice(1).map(type => {
                    const styles = getEventTypeStyles(type.value);
                    return (
                      <div key={type.value} className="flex items-center justify-between py-1">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded ${styles.dot}`} />
                          <span className="text-xs text-gray-700">{type.label}</span>
                        </div>
                        <span className="text-[10px] text-gray-500">
                          ({events.filter(e => e.type === type.value).length})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;