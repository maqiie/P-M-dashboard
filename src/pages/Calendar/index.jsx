import React, { useState, useEffect } from 'react';
import { calendarAPI } from '../../services/api'; // Adjust path as needed
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Users,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Building2,
  Target,
  FileText,
  Loader,
  Search,
  Grid3x3,
  List,
  Zap,
  TrendingUp
} from 'lucide-react';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month');
  const [eventFilter, setEventFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get events for the current month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const data = await calendarAPI.getMonthEvents(year, month);
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
      setError('Failed to load calendar events. Please try again.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDate = (day) => {
    if (!day) return [];
    
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredEvents.filter(event => event.date === dateStr);
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'meeting': return 'from-blue-500 to-blue-600';
      case 'review': return 'from-purple-500 to-purple-600';
      case 'inspection': return 'from-green-500 to-green-600';
      case 'delivery': return 'from-orange-500 to-orange-600';
      case 'deadline': return 'from-red-500 to-red-600';
      case 'project_start': return 'from-emerald-500 to-emerald-600';
      case 'task_start': return 'from-cyan-500 to-cyan-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getEventTypeIcon = (type) => {
    const iconClass = "h-3 w-3";
    switch (type) {
      case 'meeting': return <Users className={iconClass} />;
      case 'review': return <Eye className={iconClass} />;
      case 'inspection': return <CheckCircle className={iconClass} />;
      case 'delivery': return <Building2 className={iconClass} />;
      case 'deadline': return <AlertTriangle className={iconClass} />;
      case 'project_start': return <Target className={iconClass} />;
      case 'task_start': return <FileText className={iconClass} />;
      default: return <Calendar className={iconClass} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-400 bg-red-50/50';
      case 'medium': return 'border-l-amber-400 bg-amber-50/50';
      case 'low': return 'border-l-emerald-400 bg-emerald-50/50';
      default: return 'border-l-gray-300 bg-gray-50/50';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'project': return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
      case 'task': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'tender': return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
      case 'event': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const isToday = (day) => {
    const today = new Date();
    return day && 
           today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };

  const isSelected = (day) => {
    return selectedDate && 
           selectedDate.getDate() === day && 
           selectedDate.getMonth() === currentDate.getMonth() && 
           selectedDate.getFullYear() === currentDate.getFullYear();
  };

  const handleDateClick = (day) => {
    if (day) {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      setSelectedDate(newDate);
    }
  };

  // Filter events based on selected filters
  const filteredEvents = events.filter(event => {
    if (eventFilter !== 'all' && event.type !== eventFilter) return false;
    if (categoryFilter !== 'all' && event.category !== categoryFilter) return false;
    return true;
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const todayEvents = filteredEvents.filter(event => {
    const today = new Date();
    const eventDate = new Date(event.date);
    return eventDate.toDateString() === today.toDateString();
  });

  const upcomingEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate > today && eventDate <= weekFromNow;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader className="h-16 w-16 text-indigo-600 animate-spin mx-auto" />
            <div className="absolute inset-0 rounded-full bg-indigo-100 opacity-20 animate-ping"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-800">Loading Calendar</h3>
            <p className="text-gray-600">Fetching your events and schedules...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-rose-100">
        <div className="text-center space-y-6 max-w-md mx-auto p-8">
          <div className="relative">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
            <div className="absolute inset-0 rounded-full bg-red-100 opacity-30 animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-gray-800">Calendar Unavailable</h3>
            <p className="text-red-600 leading-relaxed">{error}</p>
          </div>
          <button 
            onClick={() => loadEvents()} 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Zap className="h-5 w-5 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex-1 flex flex-col">
        {/* Modern Header */}
        <header className="bg-white/70 backdrop-blur-xl border-b border-white/50 sticky top-0 z-40 shadow-sm">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Calendar
                  </h1>
                  <p className="text-gray-600 mt-1 font-medium">
                    Track projects, tasks, deadlines & events
                  </p>
                </div>
                
                {/* Quick Stats */}
                <div className="hidden lg:flex items-center space-x-6 ml-8">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">{events.length} Events</span>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">{todayEvents.length} Today</span>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl">
                    <TrendingUp className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-700">{upcomingEvents.length} Upcoming</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="group flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                  New Event
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            
            {/* Calendar Section */}
            <div className="xl:col-span-3">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl overflow-hidden">
                
                {/* Calendar Header */}
                <div className="p-8 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-4">
                        <h2 className="text-2xl font-bold text-gray-800">
                          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-200/50">
                          <button 
                            onClick={() => navigateMonth(-1)}
                            className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-l-xl transition-all duration-200"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <div className="w-px h-8 bg-gray-200"></div>
                          <button 
                            onClick={() => navigateMonth(1)}
                            className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-r-xl transition-all duration-200"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2.5 bg-white/80 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-sm font-medium shadow-sm backdrop-blur-sm"
                      >
                        <option value="all">All Categories</option>
                        <option value="project">Projects</option>
                        <option value="task">Tasks</option>
                        <option value="tender">Tenders</option>
                        <option value="event">Events</option>
                      </select>
                      
                      <select
                        value={eventFilter}
                        onChange={(e) => setEventFilter(e.target.value)}
                        className="px-4 py-2.5 bg-white/80 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-sm font-medium shadow-sm backdrop-blur-sm"
                      >
                        <option value="all">All Types</option>
                        <option value="meeting">Meetings</option>
                        <option value="review">Reviews</option>
                        <option value="inspection">Inspections</option>
                        <option value="delivery">Deliveries</option>
                        <option value="deadline">Deadlines</option>
                        <option value="project_start">Project Starts</option>
                        <option value="task_start">Task Starts</option>
                      </select>
                      
                      <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-5 py-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all duration-200 text-sm font-semibold border border-indigo-200/50"
                      >
                        Today
                      </button>
                    </div>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-8">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-2 mb-6">
                    {dayNames.map(day => (
                      <div key={day} className="p-4 text-center text-sm font-bold text-gray-600 uppercase tracking-wider">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-2">
                    {getDaysInMonth(currentDate).map((day, index) => {
                      const dayEvents = getEventsForDate(day);
                      
                      return (
                        <div 
                          key={index}
                          onClick={() => handleDateClick(day)}
                          className={`
                            min-h-28 p-3 rounded-2xl cursor-pointer transition-all duration-300 group relative overflow-hidden
                            ${!day ? 'bg-transparent cursor-default' : 'bg-white/60 hover:bg-white/90 hover:shadow-lg border border-gray-100/50 hover:border-gray-200/50'}
                            ${isToday(day) ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 shadow-md ring-2 ring-indigo-100' : ''}
                            ${isSelected(day) ? 'ring-2 ring-indigo-400 shadow-lg scale-105' : ''}
                          `}
                        >
                          {day && (
                            <>
                              <div className={`
                                text-sm font-bold mb-2 transition-colors duration-200
                                ${isToday(day) ? 'text-indigo-700' : 'text-gray-700 group-hover:text-gray-900'}
                              `}>
                                {day}
                              </div>
                              <div className="space-y-1">
                                {dayEvents.slice(0, 2).map(event => (
                                  <div 
                                    key={event.id}
                                    className={`
                                      text-xs px-2 py-1 rounded-lg text-white font-medium truncate cursor-pointer
                                      bg-gradient-to-r ${getEventTypeColor(event.type)}
                                      hover:shadow-md transform hover:scale-105 transition-all duration-200
                                    `}
                                    title={`${event.title} - ${event.project} (${event.category})`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEvent(event);
                                    }}
                                  >
                                    {event.title}
                                  </div>
                                ))}
                                {dayEvents.length > 2 && (
                                  <div className="text-xs text-gray-500 font-semibold px-2 py-1 bg-gray-100 rounded-lg">
                                    +{dayEvents.length - 2} more
                                  </div>
                                )}
                              </div>
                              {/* Today indicator */}
                              {isToday(day) && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              
              {/* Event Legend */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <Grid3x3 className="h-5 w-5 mr-3 text-indigo-600" />
                  Categories
                </h3>
                <div className="space-y-3">
                  {[
                    { category: 'project', label: 'Projects', color: 'from-blue-500 to-indigo-500', count: events.filter(e => e.category === 'project').length },
                    { category: 'task', label: 'Tasks', color: 'from-green-500 to-emerald-500', count: events.filter(e => e.category === 'task').length },
                    { category: 'tender', label: 'Tenders', color: 'from-amber-500 to-orange-500', count: events.filter(e => e.category === 'tender').length },
                    { category: 'event', label: 'Events', color: 'from-purple-500 to-pink-500', count: events.filter(e => e.category === 'event').length }
                  ].map(({ category, label, color, count }) => (
                    <div key={category} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50/50 transition-colors duration-200">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-lg bg-gradient-to-r ${color} shadow-sm`}></div>
                        <span className="text-sm font-semibold text-gray-700">{label}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Events */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-green-600" />
                  Today's Events
                  {todayEvents.length > 0 && (
                    <span className="ml-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                      {todayEvents.length}
                    </span>
                  )}
                </h3>
                <div className="space-y-4">
                  {todayEvents.slice(0, 3).map(event => (
                    <div key={event.id} className={`p-4 rounded-2xl border-l-4 transition-all duration-200 hover:shadow-md cursor-pointer ${getPriorityColor(event.priority)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`p-2 rounded-xl text-white bg-gradient-to-r ${getEventTypeColor(event.type)} shadow-sm`}>
                              {getEventTypeIcon(event.type)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-800 text-sm leading-tight">{event.title}</h4>
                              <span className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold mt-1 ${getCategoryColor(event.category)}`}>
                                {event.category}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-3 leading-relaxed">{event.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center bg-gray-100 px-2 py-1 rounded-lg">
                              <Clock className="h-3 w-3 mr-1" />
                              {event.time}
                            </div>
                            <div className="flex items-center bg-gray-100 px-2 py-1 rounded-lg">
                              <MapPin className="h-3 w-3 mr-1" />
                              {event.location}
                            </div>
                          </div>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {todayEvents.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">No events scheduled for today</p>
                      <p className="text-xs text-gray-400 mt-1">Enjoy your free time!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-3 text-purple-600" />
                  This Week
                  {upcomingEvents.length > 0 && (
                    <span className="ml-2 bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">
                      {upcomingEvents.length}
                    </span>
                  )}
                </h3>
                <div className="space-y-4">
                  {upcomingEvents.slice(0, 4).map(event => (
                    <div key={event.id} className={`p-4 rounded-2xl border-l-4 transition-all duration-200 hover:shadow-md cursor-pointer ${getPriorityColor(event.priority)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`p-2 rounded-xl text-white bg-gradient-to-r ${getEventTypeColor(event.type)} shadow-sm`}>
                              {getEventTypeIcon(event.type)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-800 text-sm leading-tight">{event.title}</h4>
                              <span className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold mt-1 ${getCategoryColor(event.category)}`}>
                                {event.category}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-3 leading-relaxed">{event.project}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center bg-gray-100 px-2 py-1 rounded-lg">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(event.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center bg-gray-100 px-2 py-1 rounded-lg">
                              <Clock className="h-3 w-3 mr-1" />
                              {event.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {upcomingEvents.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="h-8 w-8 text-purple-400" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">No upcoming events this week</p>
                      <p className="text-xs text-gray-400 mt-1">Time to plan ahead!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CalendarPage;