import React, { useState, useEffect } from 'react';
import {
  Calendar, Plus, ChevronLeft, ChevronRight, Clock, MapPin,
  Users, Building2, AlertTriangle, CheckCircle, Eye, Edit,
  Filter, Search, Bell, CalendarDays, Target, Flag, Star,
  Loader, FileText, Award, TrendingUp
} from 'lucide-react';

// Import your API functions
import { 
  calendarAPI, 
  eventsAPI, 
  projectsAPI, 
  tendersAPI, 
  tasksAPI 
} from '../../services/api';

const CalendarPage = ({ sidebarCollapsed = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [upcomingItems, setUpcomingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all calendar and upcoming data
  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        setLoading(true);
        
        // Get date range for current month
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        // Fetch all data in parallel
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

        // Process calendar events
        if (calendarEvents.status === 'fulfilled') {
          const events = Array.isArray(calendarEvents.value) ? calendarEvents.value : [];
          allEvents = [...allEvents, ...events.map(event => ({
            ...event,
            type: event.type || 'event',
            source: 'calendar'
          }))];
        }

        // Process regular events
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

        // Process projects for deadlines
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

        // Process tenders for submission deadlines
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

        // Process tasks for due dates
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

        // Sort upcoming events by date
        const now = new Date();
        const sortedUpcoming = upcomingEvents
          .filter(item => new Date(item.date) >= now)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 10); // Top 10 upcoming items

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

  const getEventTypeColor = (type) => {
    const typeConfig = eventTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.color : 'gray';
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
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-2xl text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-2xl text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Main Content Area - adjusted for dynamic sidebar */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          sidebarCollapsed 
            ? 'lg:ml-16' // Collapsed sidebar (64px)
            : 'lg:ml-80' // Expanded sidebar (320px)
        }`}
      >
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8 lg:mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-2 lg:mb-4 tracking-tight">
                  Calendar
                </h1>
                <p className="text-lg lg:text-2xl text-gray-600 leading-relaxed">
                  Schedule and track all project events, meetings, and deadlines
                </p>
              </div>
              
              <button className="flex items-center space-x-3 px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg lg:text-xl font-semibold rounded-2xl hover:shadow-xl transition-all duration-300 whitespace-nowrap">
                <Plus className="h-5 w-5 lg:h-6 lg:w-6" />
                <span>New Event</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-6 mb-8 lg:mb-12">
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <CalendarDays className="h-6 w-6 lg:h-10 lg:w-10 text-blue-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">{events.length}</p>
              <p className="text-sm lg:text-lg text-gray-600">Total Events</p>
            </div>
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <Clock className="h-6 w-6 lg:h-10 lg:w-10 text-green-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">{todayEvents.length}</p>
              <p className="text-sm lg:text-lg text-gray-600">Today's Events</p>
            </div>
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <AlertTriangle className="h-6 w-6 lg:h-10 lg:w-10 text-red-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">{events.filter(e => e.priority === 'high').length}</p>
              <p className="text-sm lg:text-lg text-gray-600">High Priority</p>
            </div>
            <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl border border-gray-100 text-center">
              <Users className="h-6 w-6 lg:h-10 lg:w-10 text-purple-500 mx-auto mb-2 lg:mb-3" />
              <p className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">{events.filter(e => e.type === 'meeting').length}</p>
              <p className="text-sm lg:text-lg text-gray-600">Meetings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2 bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-xl border border-gray-100">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6 lg:mb-8">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                </div>
                
                <div className="flex items-center space-x-2 lg:space-x-4">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 lg:p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6" />
                  </button>
                  
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 lg:px-6 py-2 lg:py-3 bg-blue-100 text-blue-700 rounded-xl font-semibold hover:bg-blue-200 transition-all text-sm lg:text-base"
                  >
                    Today
                  </button>
                  
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 lg:p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6" />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 lg:gap-2 mb-2 lg:mb-4">
                {dayNames.map(day => (
                  <div key={day} className="text-center py-2 lg:py-4 text-sm lg:text-xl font-semibold text-gray-600">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 lg:gap-2">
                {getDaysInMonth(currentDate).map((date, index) => {
                  const dayEvents = getEventsForDate(date);
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[80px] lg:min-h-[120px] p-1 lg:p-3 border-2 rounded-lg lg:rounded-2xl cursor-pointer transition-all duration-200 ${
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
                          <div className={`text-sm lg:text-xl font-semibold mb-1 lg:mb-2 ${
                            isToday(date) ? 'text-blue-700' : 
                            isSelected(date) ? 'text-purple-700' : 'text-gray-900'
                          }`}>
                            {date.getDate()}
                          </div>
                          
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map(event => (
                              <div
                                key={event.id}
                                className={`p-1 lg:p-2 rounded text-xs font-medium bg-${getEventTypeColor(event.type)}-100 text-${getEventTypeColor(event.type)}-700 border-l-2 border-${getEventTypeColor(event.type)}-400`}
                              >
                                <div className="flex items-center space-x-1">
                                  {getEventIcon(event.type)}
                                  <span className="truncate">{event.title}</span>
                                </div>
                                <div className="text-xs opacity-75">{formatTime(event.time)}</div>
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-gray-500 font-medium">
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

            {/* Right Sidebar */}
            <div className="space-y-6 lg:space-y-8">
              {/* Upcoming Events */}
              <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-xl border border-gray-100">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Upcoming Events</h3>
                
                <div className="space-y-3 lg:space-y-4">
                  {upcomingItems.length > 0 ? (
                    upcomingItems.slice(0, 5).map(item => {
                      const daysUntil = getDaysUntil(item.date);
                      return (
                        <div key={item.id} className="p-3 lg:p-4 rounded-xl bg-gray-50 border border-gray-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className={`p-1 lg:p-2 rounded-lg bg-${getEventTypeColor(item.type)}-100`}>
                                {getSourceIcon(item.source)}
                              </div>
                              <div>
                                <h4 className="text-sm lg:text-lg font-semibold text-gray-900 truncate">{item.title}</h4>
                                <p className="text-xs lg:text-sm text-gray-600">{item.project}</p>
                              </div>
                            </div>
                            {daysUntil !== null && (
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                daysUntil === 0 ? 'bg-red-100 text-red-700' :
                                daysUntil <= 3 ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {daysUntil === 0 ? 'Today' : 
                                 daysUntil === 1 ? 'Tomorrow' : 
                                 `${daysUntil} days`}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-xs lg:text-sm text-gray-600">
                            <span>{new Date(item.date).toLocaleDateString()}</span>
                            <span className="capitalize">{item.source}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 lg:py-8">
                      <Calendar className="h-8 w-8 lg:h-12 lg:w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm lg:text-lg text-gray-500">No upcoming events</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-xl border border-gray-100">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Filters</h3>
                
                <div className="space-y-3 lg:space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 text-base lg:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 text-base lg:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    >
                      {eventTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Selected Date Events */}
              <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-xl border border-gray-100">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                
                <div className="space-y-3 lg:space-y-4">
                  {selectedDateEvents.length > 0 ? (
                    selectedDateEvents.map(event => (
                      <div key={event.id} className={`p-3 lg:p-4 rounded-xl lg:rounded-2xl border-l-4 ${getPriorityColor(event.priority)}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`p-1 lg:p-2 rounded-lg bg-${getEventTypeColor(event.type)}-100`}>
                              {getEventIcon(event.type)}
                            </div>
                            <div>
                              <h4 className="text-sm lg:text-lg font-semibold text-gray-900">{event.title}</h4>
                              <p className="text-xs lg:text-sm text-gray-600">{event.project}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-1 lg:space-y-2 text-xs lg:text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3 lg:h-4 lg:w-4" />
                            <span>{formatTime(event.time)} {formatDuration(event.duration)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-3 w-3 lg:h-4 lg:w-4" />
                            <span>{event.location}</span>
                          </div>
                          {Array.isArray(event.attendees) && (
                            <div className="flex items-center space-x-2">
                              <Users className="h-3 w-3 lg:h-4 lg:w-4" />
                              <span>{event.attendees.length} attendees</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-xs lg:text-sm text-gray-700 mt-2">{event.description}</p>
                        
                        <div className="flex space-x-2 mt-3 lg:mt-4">
                          <button className="flex-1 flex items-center justify-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-1 lg:py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all">
                            <Eye className="h-3 w-3 lg:h-4 lg:w-4" />
                            <span className="text-xs lg:text-sm font-medium">View</span>
                          </button>
                          <button className="flex-1 flex items-center justify-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-1 lg:py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all">
                            <Edit className="h-3 w-3 lg:h-4 lg:w-4" />
                            <span className="text-xs lg:text-sm font-medium">Edit</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 lg:py-8">
                      <Calendar className="h-8 w-8 lg:h-12 lg:w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm lg:text-lg text-gray-500">No events scheduled</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Legend */}
              <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-xl border border-gray-100">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Event Types</h3>
                
                <div className="space-y-2 lg:space-y-3">
                  {eventTypes.slice(1).map(type => (
                    <div key={type.value} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 lg:space-x-3">
                        <div className={`w-3 h-3 lg:w-4 lg:h-4 rounded bg-${type.color}-400`} />
                        <span className="text-sm lg:text-lg text-gray-700">{type.label}</span>
                      </div>
                      <span className="text-xs lg:text-sm text-gray-500">
                        ({events.filter(e => e.type === type.value).length})
                      </span>
                    </div>
                  ))}
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