import React, { useState, useEffect } from 'react';
import { calendarAPI } from '../../services/api';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  Loader,
  TrendingUp,
  Package,
  Flag,
  X,
  Briefcase,
  ClipboardList,
  Menu
} from 'lucide-react';

import AdminSidebar from '../admin/AdminSidebar';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState('event');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const data = await calendarAPI.getMonthEvents(year, month);
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load events:', error);
      setError('Failed to load calendar events.');
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
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(day);
    return days;
  };

  const getEventsForDate = (day) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredEvents.filter(event => event.date === dateStr);
  };

  const getEventTypeColor = (type) => {
    const colors = {
      meeting: 'bg-blue-500',
      review: 'bg-purple-500',
      inspection: 'bg-green-500',
      delivery: 'bg-orange-500',
      deadline: 'bg-red-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'border-l-red-500 bg-red-50',
      medium: 'border-l-amber-500 bg-amber-50',
      low: 'border-l-emerald-500 bg-emerald-50'
    };
    return colors[priority] || 'border-l-gray-300 bg-gray-50';
  };

  const isToday = (day) => {
    const today = new Date();
    return day && today.getDate() === day && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
  };

  const handleDateClick = (day) => {
    if (day) {
      setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
      setShowCreateModal(true);
      setCreateType('event');
    }
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setShowEventDetailModal(true);
  };

  const filteredEvents = events.filter(event => {
    if (categoryFilter !== 'all' && event.category !== categoryFilter) return false;
    return true;
  });

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
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
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

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
            <button onClick={() => loadEvents()} className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
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
            
            <button 
              onClick={() => { 
                setShowCreateModal(true); 
                setSelectedDate(new Date()); 
                setCreateType('event'); 
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Event</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
            <div className="xl:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h2 className="text-lg font-bold text-gray-900">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </h2>
                      <div className="flex items-center bg-white rounded-lg border border-gray-200">
                        <button 
                          onClick={() => navigateMonth(-1)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-l-lg"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => navigateMonth(1)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-r-lg"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none"
                      >
                        <option value="all">All</option>
                        <option value="project">Projects</option>
                        <option value="task">Tasks</option>
                        <option value="event">Events</option>
                      </select>
                      <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-semibold"
                      >
                        Today
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map(day => (
                      <div key={day} className="p-2 text-center text-xs font-bold text-gray-500 uppercase">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth(currentDate).map((day, index) => {
                      const dayEvents = getEventsForDate(day);
                      const todayClass = isToday(day) ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100' : '';
                      const dayClass = day ? 'bg-white hover:bg-gray-50 border border-gray-100 cursor-pointer' : 'bg-transparent cursor-default';
                      
                      return (
                        <div 
                          key={index}
                          onClick={() => handleDateClick(day)}
                          className={`min-h-20 p-1.5 rounded-lg transition-all ${dayClass} ${todayClass}`}
                        >
                          {day && (
                            <>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-bold ${isToday(day) ? 'text-blue-700' : 'text-gray-700'}`}>
                                  {day}
                                </span>
                                {dayEvents.length > 0 && (
                                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 rounded-full w-4 h-4 flex items-center justify-center">
                                    {dayEvents.length}
                                  </span>
                                )}
                              </div>
                              
                              <div className="space-y-0.5">
                                {dayEvents.slice(0, 2).map(event => (
                                  <div 
                                    key={event.id}
                                    onClick={(e) => handleEventClick(event, e)}
                                    className={`text-[10px] px-1.5 py-0.5 rounded text-white font-semibold truncate cursor-pointer hover:opacity-80 ${getEventTypeColor(event.type)}`}
                                  >
                                    {event.title}
                                  </div>
                                ))}
                                {dayEvents.length > 2 && (
                                  <div className="text-[10px] text-gray-500 font-semibold px-1">
                                    +{dayEvents.length - 2}
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
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-green-50 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Today</h3>
                      <p className="text-xs text-gray-600">{todayEvents.length} events</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 max-h-48 overflow-y-auto">
                  {todayEvents.length === 0 ? (
                    <div className="text-center py-6">
                      <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">No events today</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {todayEvents.map(event => (
                        <div 
                          key={event.id} 
                          onClick={(e) => handleEventClick(event, e)}
                          className={`p-2 rounded-lg border-l-2 cursor-pointer hover:shadow-sm transition-all ${getPriorityColor(event.priority)}`}
                        >
                          <h4 className="font-semibold text-gray-900 text-xs truncate">{event.title}</h4>
                          {event.time && <p className="text-[10px] text-gray-500 mt-1">{event.time}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-purple-50 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">This Week</h3>
                      <p className="text-xs text-gray-600">{upcomingEvents.length} upcoming</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 max-h-48 overflow-y-auto">
                  {upcomingEvents.length === 0 ? (
                    <div className="text-center py-6">
                      <TrendingUp className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">No upcoming events</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {upcomingEvents.slice(0, 5).map(event => (
                        <div 
                          key={event.id} 
                          onClick={(e) => handleEventClick(event, e)}
                          className={`p-2 rounded-lg border-l-2 cursor-pointer hover:shadow-sm transition-all ${getPriorityColor(event.priority)}`}
                        >
                          <h4 className="font-semibold text-gray-900 text-xs truncate">{event.title}</h4>
                          <p className="text-[10px] text-gray-500 mt-1">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Create New</h2>
                  <p className="text-xs text-gray-600">
                    {selectedDate ? selectedDate.toLocaleDateString() : ''}
                  </p>
                </div>
                <button 
                  onClick={() => { setShowCreateModal(false); setSelectedDate(null); }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => setCreateType('event')}
                  className={`p-3 rounded-xl border-2 transition-all ${createType === 'event' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Calendar className={`h-5 w-5 mx-auto mb-1 ${createType === 'event' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className="text-xs font-semibold text-gray-900">Event</p>
                </button>
                <button
                  onClick={() => setCreateType('project')}
                  className={`p-3 rounded-xl border-2 transition-all ${createType === 'project' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Briefcase className={`h-5 w-5 mx-auto mb-1 ${createType === 'project' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className="text-xs font-semibold text-gray-900">Project</p>
                </button>
                <button
                  onClick={() => setCreateType('task')}
                  className={`p-3 rounded-xl border-2 transition-all ${createType === 'task' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <ClipboardList className={`h-5 w-5 mx-auto mb-1 ${createType === 'task' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className="text-xs font-semibold text-gray-900">Task</p>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    placeholder={`Enter ${createType} title`}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      defaultValue={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex space-x-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => { setShowCreateModal(false); setSelectedDate(null); }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg text-sm font-semibold">
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEventDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className={`p-4 border-b border-gray-200 ${getEventTypeColor(selectedEvent.type)}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedEvent.title}</h2>
                  <span className="text-xs text-white/80 capitalize">{selectedEvent.type}</span>
                </div>
                <button 
                  onClick={() => { setShowEventDetailModal(false); setSelectedEvent(null); }}
                  className="p-1.5 text-white hover:bg-white/20 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {selectedEvent.description && (
                <p className="text-sm text-gray-600">{selectedEvent.description}</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Date</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(selectedEvent.date).toLocaleDateString()}
                  </p>
                </div>
                {selectedEvent.time && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Time</p>
                    <p className="text-sm font-bold text-gray-900">{selectedEvent.time}</p>
                  </div>
                )}
              </div>
              {selectedEvent.location && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Location</p>
                  <p className="text-sm font-bold text-gray-900">{selectedEvent.location}</p>
                </div>
              )}
              <div className="flex space-x-2 pt-3 border-t border-gray-200">
                <button className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-semibold flex items-center justify-center space-x-1">
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-semibold flex items-center justify-center space-x-1">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;

// / import React, { useState, useEffect } from 'react';
// import { calendarAPI } from '../../services/api';
// import { 
//   Calendar,
//   ChevronLeft,
//   ChevronRight,
//   Plus,
//   Filter,
//   Users,
//   MapPin,
//   Clock,
//   AlertTriangle,
//   CheckCircle,
//   Eye,
//   Edit,
//   Trash2,
//   MoreHorizontal,
//   Building2,
//   Target,
//   FileText,
//   Loader,
//   Search,
//   Grid3x3,
//   List,
//   Zap,
//   TrendingUp,
//   Video,
//   Phone,
//   Package,
//   Flag,
//   Star,
//   X,
//   Download,
//   Share2,
//   Bell,
//   Briefcase,
//   ClipboardList
// } from 'lucide-react';

// const CalendarPage = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [viewMode, setViewMode] = useState('month');
//   const [eventFilter, setEventFilter] = useState('all');
//   const [categoryFilter, setCategoryFilter] = useState('all');
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [createType, setCreateType] = useState('event'); // 'event', 'project', 'task'
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [showEventDetailModal, setShowEventDetailModal] = useState(false);

//   useEffect(() => {
//     loadEvents();
//   }, [currentDate]);

//   const loadEvents = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const year = currentDate.getFullYear();
//       const month = currentDate.getMonth() + 1;
      
//       const data = await calendarAPI.getMonthEvents(year, month);
//       setEvents(data);
//     } catch (error) {
//       console.error('Failed to load events:', error);
//       setError('Failed to load calendar events. Please try again.');
//       setEvents([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const navigateMonth = (direction) => {
//     const newDate = new Date(currentDate);
//     newDate.setMonth(currentDate.getMonth() + direction);
//     setCurrentDate(newDate);
//   };

//   const getDaysInMonth = (date) => {
//     const year = date.getFullYear();
//     const month = date.getMonth();
//     const firstDay = new Date(year, month, 1);
//     const lastDay = new Date(year, month + 1, 0);
//     const daysInMonth = lastDay.getDate();
//     const startingDayOfWeek = firstDay.getDay();
//     const days = [];
    
//     for (let i = 0; i < startingDayOfWeek; i++) {
//       days.push(null);
//     }
    
//     for (let day = 1; day <= daysInMonth; day++) {
//       days.push(day);
//     }
    
//     return days;
//   };

//   const getEventsForDate = (day) => {
//     if (!day) return [];
    
//     const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
//     return filteredEvents.filter(event => event.date === dateStr);
//   };

//   const getEventTypeColor = (type) => {
//     switch (type) {
//       case 'meeting': return 'from-blue-500 to-blue-600';
//       case 'review': return 'from-purple-500 to-purple-600';
//       case 'inspection': return 'from-green-500 to-green-600';
//       case 'delivery': return 'from-orange-500 to-orange-600';
//       case 'deadline': return 'from-red-500 to-red-600';
//       case 'project_start': return 'from-emerald-500 to-emerald-600';
//       case 'task_start': return 'from-cyan-500 to-cyan-600';
//       default: return 'from-gray-500 to-gray-600';
//     }
//   };

//   const getEventTypeIcon = (type) => {
//     const iconClass = "h-4 w-4";
//     switch (type) {
//       case 'meeting': return <Users className={iconClass} />;
//       case 'review': return <Eye className={iconClass} />;
//       case 'inspection': return <CheckCircle className={iconClass} />;
//       case 'delivery': return <Package className={iconClass} />;
//       case 'deadline': return <Flag className={iconClass} />;
//       case 'project_start': return <Target className={iconClass} />;
//       case 'task_start': return <FileText className={iconClass} />;
//       default: return <Calendar className={iconClass} />;
//     }
//   };

//   const getPriorityColor = (priority) => {
//     switch (priority) {
//       case 'high': return 'border-l-red-500 bg-red-50';
//       case 'medium': return 'border-l-amber-500 bg-amber-50';
//       case 'low': return 'border-l-emerald-500 bg-emerald-50';
//       default: return 'border-l-gray-300 bg-gray-50';
//     }
//   };

//   const getCategoryColor = (category) => {
//     switch (category) {
//       case 'project': return 'bg-blue-100 text-blue-700 border-blue-200';
//       case 'task': return 'bg-green-100 text-green-700 border-green-200';
//       case 'tender': return 'bg-orange-100 text-orange-700 border-orange-200';
//       case 'event': return 'bg-purple-100 text-purple-700 border-purple-200';
//       default: return 'bg-gray-100 text-gray-700 border-gray-200';
//     }
//   };

//   const isToday = (day) => {
//     const today = new Date();
//     return day && 
//            today.getDate() === day && 
//            today.getMonth() === currentDate.getMonth() && 
//            today.getFullYear() === currentDate.getFullYear();
//   };

//   const isSelected = (day) => {
//     return selectedDate && 
//            selectedDate.getDate() === day && 
//            selectedDate.getMonth() === currentDate.getMonth() && 
//            selectedDate.getFullYear() === currentDate.getFullYear();
//   };

//   const handleDateClick = (day) => {
//     if (day) {
//       const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
//       setSelectedDate(newDate);
//       setShowCreateModal(true);
//       setCreateType('event');
//     }
//   };

//   const handleEventClick = (event, e) => {
//     e.stopPropagation();
//     setSelectedEvent(event);
//     setShowEventDetailModal(true);
//   };

//   const filteredEvents = events.filter(event => {
//     if (eventFilter !== 'all' && event.type !== eventFilter) return false;
//     if (categoryFilter !== 'all' && event.category !== categoryFilter) return false;
//     return true;
//   });

//   const monthNames = [
//     "January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"
//   ];

//   const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

//   const todayEvents = filteredEvents.filter(event => {
//     const today = new Date();
//     const eventDate = new Date(event.date);
//     return eventDate.toDateString() === today.toDateString();
//   });

//   const upcomingEvents = filteredEvents.filter(event => {
//     const eventDate = new Date(event.date);
//     const today = new Date();
//     const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
//     return eventDate > today && eventDate <= weekFromNow;
//   }).sort((a, b) => new Date(a.date) - new Date(b.date));

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="relative inline-block mb-8">
//             <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
//             <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-20 blur-2xl animate-pulse"></div>
//           </div>
//           <p className="text-2xl text-gray-900 font-black mb-2">Loading Calendar</p>
//           <p className="text-sm text-gray-600 font-medium">Fetching your events and schedules...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
//         <div className="text-center max-w-md">
//           <div className="relative inline-block mb-6">
//             <AlertTriangle className="h-20 w-20 text-red-500" />
//             <div className="absolute inset-0 bg-red-400/20 rounded-full blur-3xl animate-pulse"></div>
//           </div>
//           <h3 className="text-2xl font-black text-gray-900 mb-3">Calendar Unavailable</h3>
//           <p className="text-gray-600 mb-6">{error}</p>
//           <button 
//             onClick={() => loadEvents()}
//             className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold"
//           >
//             <Zap className="h-5 w-5 mr-2" />
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
//       <div className="w-full px-6 lg:px-12 py-8">
//         {/* Modern Header */}
//         <div className="mb-8">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
//             <div>
//               <div className="flex items-center gap-4 mb-4">
//                 <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
//                   <Calendar className="h-9 w-9 text-white" />
//                 </div>
//                 <div>
//                   <h1 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
//                     Calendar
//                   </h1>
//                   <p className="text-lg text-gray-600 mt-1">
//                     {events.length} events • {todayEvents.length} today • {upcomingEvents.length} upcoming
//                   </p>
//                 </div>
//               </div>
//             </div>
            
//             <div className="flex items-center gap-3">
//               <button 
//                 onClick={() => {
//                   setShowCreateModal(true);
//                   setSelectedDate(new Date());
//                   setCreateType('event');
//                 }}
//                 className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-lg"
//               >
//                 <Plus className="h-6 w-6 mr-2" />
//                 New Event
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Main Content Grid */}
//         <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
//           {/* Calendar Section */}
//           <div className="xl:col-span-2">
//             <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
//               {/* Calendar Header */}
//               <div className="p-6 lg:p-8 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100">
//                 <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//                   <div className="flex items-center gap-4">
//                     <h2 className="text-3xl font-black text-gray-900">
//                       {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
//                     </h2>
//                     <div className="flex items-center bg-white rounded-2xl shadow-sm border-2 border-gray-200">
//                       <button 
//                         onClick={() => navigateMonth(-1)}
//                         className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-l-2xl transition-all duration-200"
//                       >
//                         <ChevronLeft className="h-6 w-6" />
//                       </button>
//                       <div className="w-px h-10 bg-gray-200"></div>
//                       <button 
//                         onClick={() => navigateMonth(1)}
//                         className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-r-2xl transition-all duration-200"
//                       >
//                         <ChevronRight className="h-6 w-6" />
//                       </button>
//                     </div>
//                   </div>
                  
//                   <div className="flex items-center gap-3 flex-wrap">
//                     <div className="bg-gray-50 rounded-2xl px-4 py-2 border border-gray-200">
//                       <select
//                         value={categoryFilter}
//                         onChange={(e) => setCategoryFilter(e.target.value)}
//                         className="bg-transparent border-0 focus:outline-none text-sm font-semibold text-gray-700 cursor-pointer"
//                       >
//                         <option value="all">All Categories</option>
//                         <option value="project">Projects</option>
//                         <option value="task">Tasks</option>
//                         <option value="tender">Tenders</option>
//                         <option value="event">Events</option>
//                       </select>
//                     </div>
                    
//                     <div className="bg-gray-50 rounded-2xl px-4 py-2 border border-gray-200">
//                       <select
//                         value={eventFilter}
//                         onChange={(e) => setEventFilter(e.target.value)}
//                         className="bg-transparent border-0 focus:outline-none text-sm font-semibold text-gray-700 cursor-pointer"
//                       >
//                         <option value="all">All Types</option>
//                         <option value="meeting">Meetings</option>
//                         <option value="review">Reviews</option>
//                         <option value="inspection">Inspections</option>
//                         <option value="delivery">Deliveries</option>
//                         <option value="deadline">Deadlines</option>
//                       </select>
//                     </div>
                    
//                     <button
//                       onClick={() => setCurrentDate(new Date())}
//                       className="px-5 py-2.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-2xl transition-all duration-200 text-sm font-bold border-2 border-blue-200"
//                     >
//                       Today
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Calendar Grid */}
//               <div className="p-6 lg:p-8">
//                 {/* Day Headers */}
//                 <div className="grid grid-cols-7 gap-2 mb-4">
//                   {dayNames.map(day => (
//                     <div key={day} className="p-4 text-center text-sm font-black text-gray-700 uppercase tracking-wider">
//                       {day}
//                     </div>
//                   ))}
//                 </div>

//                 {/* Calendar Days */}
//                 <div className="grid grid-cols-7 gap-2">
//                   {getDaysInMonth(currentDate).map((day, index) => {
//                     const dayEvents = getEventsForDate(day);
//                     const hasHighPriority = dayEvents.some(e => e.priority === 'high');
                    
//                     return (
//                       <div 
//                         key={index}
//                         onClick={() => handleDateClick(day)}
//                         className={`
//                           min-h-32 p-3 rounded-2xl cursor-pointer transition-all duration-300 group relative
//                           ${!day ? 'bg-transparent cursor-default' : 'bg-white hover:bg-gray-50 hover:shadow-xl border-2 border-gray-100 hover:border-blue-200'}
//                           ${isToday(day) ? 'bg-gradient-to-br from-blue-100 to-purple-100 border-blue-300 shadow-lg ring-4 ring-blue-100' : ''}
//                           ${isSelected(day) ? 'ring-4 ring-purple-300 shadow-2xl scale-105 border-purple-300' : ''}
//                           ${hasHighPriority && !isToday(day) ? 'ring-2 ring-red-200' : ''}
//                         `}
//                       >
//                         {day && (
//                           <>
//                             <div className="flex items-center justify-between mb-2">
//                               <span className={`
//                                 text-lg font-black transition-colors duration-200
//                                 ${isToday(day) ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'}
//                               `}>
//                                 {day}
//                               </span>
//                               {dayEvents.length > 0 && (
//                                 <span className="text-xs font-bold text-gray-500 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">
//                                   {dayEvents.length}
//                                 </span>
//                               )}
//                             </div>
                            
//                             <div className="space-y-1.5">
//                               {dayEvents.slice(0, 3).map(event => (
//                                 <div 
//                                   key={event.id}
//                                   className={`
//                                     text-xs px-2.5 py-1.5 rounded-xl text-white font-bold truncate cursor-pointer
//                                     bg-gradient-to-r ${getEventTypeColor(event.type)}
//                                     hover:shadow-lg transform hover:scale-105 transition-all duration-200
//                                     flex items-center gap-1.5
//                                   `}
//                                   title={`${event.title} - ${event.project} (${event.category})`}
//                                   onClick={(e) => handleEventClick(event, e)}
//                                 >
//                                   {getEventTypeIcon(event.type)}
//                                   <span className="truncate">{event.title}</span>
//                                 </div>
//                               ))}
//                               {dayEvents.length > 3 && (
//                                 <div className="text-xs text-gray-600 font-black px-2.5 py-1.5 bg-gray-100 rounded-xl text-center">
//                                   +{dayEvents.length - 3} more
//                                 </div>
//                               )}
//                             </div>
                            
//                             {isToday(day) && (
//                               <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg"></div>
//                             )}
//                           </>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Today's Events */}
//             <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
//               <div className="p-6 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-b border-gray-100">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
//                       <Clock className="h-5 w-5 text-white" />
//                     </div>
//                     <div>
//                       <h3 className="text-xl font-black text-gray-900">Today</h3>
//                       <p className="text-xs text-gray-600 font-semibold">{todayEvents.length} events scheduled</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="p-6 max-h-96 overflow-y-auto">
//                 {todayEvents.length === 0 ? (
//                   <div className="text-center py-12">
//                     <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
//                       <Calendar className="h-10 w-10 text-gray-400" />
//                     </div>
//                     <p className="text-sm text-gray-600 font-bold mb-1">No events today</p>
//                     <p className="text-xs text-gray-500">Enjoy your free time!</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {todayEvents.map(event => (
//                       <div 
//                         key={event.id} 
//                         onClick={(e) => handleEventClick(event, e)}
//                         className={`p-5 rounded-2xl border-l-4 transition-all duration-200 hover:shadow-lg cursor-pointer ${getPriorityColor(event.priority)}`}
//                       >
//                         <div className="flex items-start gap-3 mb-3">
//                           <div className={`p-2.5 rounded-xl text-white bg-gradient-to-r ${getEventTypeColor(event.type)} shadow-md`}>
//                             {getEventTypeIcon(event.type)}
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <h4 className="font-black text-gray-900 text-base leading-tight mb-2">{event.title}</h4>
//                             <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border ${getCategoryColor(event.category)}`}>
//                               {event.category}
//                             </span>
//                           </div>
//                         </div>
                        
//                         {event.description && (
//                           <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
//                         )}
                        
//                         <div className="flex items-center flex-wrap gap-2">
//                           {event.time && (
//                             <div className="flex items-center bg-white px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 border border-gray-200">
//                               <Clock className="h-3 w-3 mr-1.5" />
//                               {event.time}
//                             </div>
//                           )}
//                           {event.location && (
//                             <div className="flex items-center bg-white px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 border border-gray-200">
//                               <MapPin className="h-3 w-3 mr-1.5" />
//                               {event.location}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Upcoming Events */}
//             <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
//               <div className="p-6 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 border-b border-gray-100">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
//                       <TrendingUp className="h-5 w-5 text-white" />
//                     </div>
//                     <div>
//                       <h3 className="text-xl font-black text-gray-900">This Week</h3>
//                       <p className="text-xs text-gray-600 font-semibold">{upcomingEvents.length} upcoming events</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="p-6 max-h-96 overflow-y-auto">
//                 {upcomingEvents.length === 0 ? (
//                   <div className="text-center py-12">
//                     <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
//                       <TrendingUp className="h-10 w-10 text-purple-400" />
//                     </div>
//                     <p className="text-sm text-gray-600 font-bold mb-1">No upcoming events</p>
//                     <p className="text-xs text-gray-500">Time to plan ahead!</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {upcomingEvents.map(event => (
//                       <div 
//                         key={event.id} 
//                         onClick={(e) => handleEventClick(event, e)}
//                         className={`p-5 rounded-2xl border-l-4 transition-all duration-200 hover:shadow-lg cursor-pointer ${getPriorityColor(event.priority)}`}
//                       >
//                         <div className="flex items-start gap-3 mb-3">
//                           <div className={`p-2.5 rounded-xl text-white bg-gradient-to-r ${getEventTypeColor(event.type)} shadow-md`}>
//                             {getEventTypeIcon(event.type)}
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <h4 className="font-black text-gray-900 text-base leading-tight mb-2">{event.title}</h4>
//                             <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border ${getCategoryColor(event.category)}`}>
//                               {event.category}
//                             </span>
//                           </div>
//                         </div>
                        
//                         {event.project && (
//                           <p className="text-sm text-gray-600 mb-3 font-semibold">{event.project}</p>
//                         )}
                        
//                         <div className="flex items-center flex-wrap gap-2">
//                           <div className="flex items-center bg-white px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 border border-gray-200">
//                             <Calendar className="h-3 w-3 mr-1.5" />
//                             {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//                           </div>
//                           {event.time && (
//                             <div className="flex items-center bg-white px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 border border-gray-200">
//                               <Clock className="h-3 w-3 mr-1.5" />
//                               {event.time}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Create Event/Project/Task Modal */}
//         {showCreateModal && (
//           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//               <div className="p-6 lg:p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h2 className="text-3xl font-black text-gray-900">Create New</h2>
//                     <p className="text-sm text-gray-600 mt-1">
//                       {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select what to create'}
//                     </p>
//                   </div>
//                   <button 
//                     onClick={() => {
//                       setShowCreateModal(false);
//                       setSelectedDate(null);
//                     }}
//                     className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
//                   >
//                     <X className="h-6 w-6" />
//                   </button>
//                 </div>
//               </div>

//               <div className="p-6 lg:p-8">
//                 {/* Type Selection */}
//                 <div className="grid grid-cols-3 gap-4 mb-8">
//                   <button
//                     onClick={() => setCreateType('event')}
//                     className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
//                       createType === 'event'
//                         ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
//                         : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                     }`}
//                   >
//                     <Calendar className={`h-8 w-8 mx-auto mb-3 ${createType === 'event' ? 'text-blue-600' : 'text-gray-400'}`} />
//                     <h3 className="font-black text-gray-900 text-center">Event</h3>
//                   </button>

//                   <button
//                     onClick={() => setCreateType('project')}
//                     className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
//                       createType === 'project'
//                         ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
//                         : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                     }`}
//                   >
//                     <Briefcase className={`h-8 w-8 mx-auto mb-3 ${createType === 'project' ? 'text-purple-600' : 'text-gray-400'}`} />
//                     <h3 className="font-black text-gray-900 text-center">Project</h3>
//                   </button>

//                   <button
//                     onClick={() => setCreateType('task')}
//                     className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
//                       createType === 'task'
//                         ? 'border-green-500 bg-green-50 shadow-lg scale-105'
//                         : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                     }`}
//                   >
//                     <ClipboardList className={`h-8 w-8 mx-auto mb-3 ${createType === 'task' ? 'text-green-600' : 'text-gray-400'}`} />
//                     <h3 className="font-black text-gray-900 text-center">Task</h3>
//                   </button>
//                 </div>

//                 {/* Form based on type */}
//                 <div className="space-y-6">
//                   <div>
//                     <label className="block text-sm font-bold text-gray-700 mb-2">
//                       {createType === 'event' ? 'Event' : createType === 'project' ? 'Project' : 'Task'} Title
//                     </label>
//                     <input
//                       type="text"
//                       placeholder={`Enter ${createType} title`}
//                       className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
//                     <textarea
//                       rows={4}
//                       placeholder={`Describe the ${createType}`}
//                       className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
//                     />
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
//                       <input
//                         type="date"
//                         defaultValue={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
//                         className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
//                       <input
//                         type="time"
//                         className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                       />
//                     </div>
//                   </div>

//                   {createType === 'event' && (
//                     <div>
//                       <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
//                       <input
//                         type="text"
//                         placeholder="Enter location"
//                         className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                       />
//                     </div>
//                   )}

//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
//                       <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
//                         <option value="low">Low</option>
//                         <option value="medium">Medium</option>
//                         <option value="high">High</option>
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
//                       <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
//                         <option value="project">Project</option>
//                         <option value="task">Task</option>
//                         <option value="tender">Tender</option>
//                         <option value="event">Event</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div className="flex gap-4 pt-6 border-t border-gray-200">
//                     <button
//                       onClick={() => {
//                         setShowCreateModal(false);
//                         setSelectedDate(null);
//                       }}
//                       className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold"
//                     >
//                       Cancel
//                     </button>
//                     <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold">
//                       Create {createType.charAt(0).toUpperCase() + createType.slice(1)}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Event Detail Modal */}
//         {showEventDetailModal && selectedEvent && (
//           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//               <div className={`p-6 lg:p-8 border-b border-gray-200 bg-gradient-to-r ${getEventTypeColor(selectedEvent.type)}`}>
//                 <div className="flex items-start justify-between">
//                   <div className="flex items-start gap-4 flex-1">
//                     <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
//                       {getEventTypeIcon(selectedEvent.type)}
//                     </div>
//                     <div className="flex-1">
//                       <h2 className="text-3xl font-black text-white mb-2">{selectedEvent.title}</h2>
//                       <span className="inline-flex items-center px-4 py-2 bg-white/90 rounded-xl text-sm font-bold text-gray-800">
//                         {selectedEvent.category}
//                       </span>
//                     </div>
//                   </div>
//                   <button 
//                     onClick={() => {
//                       setShowEventDetailModal(false);
//                       setSelectedEvent(null);
//                     }}
//                     className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
//                   >
//                     <X className="h-6 w-6" />
//                   </button>
//                 </div>
//               </div>

//               <div className="p-6 lg:p-8 space-y-6">
//                 {selectedEvent.description && (
//                   <div>
//                     <h3 className="text-sm font-bold text-gray-700 mb-2">Description</h3>
//                     <p className="text-gray-600">{selectedEvent.description}</p>
//                   </div>
//                 )}

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="p-4 bg-gray-50 rounded-xl">
//                     <div className="flex items-center gap-3 mb-2">
//                       <Calendar className="h-5 w-5 text-blue-600" />
//                       <span className="text-sm font-bold text-gray-700">Date</span>
//                     </div>
//                     <p className="text-gray-900 font-black">
//                       {new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
//                     </p>
//                   </div>

//                   {selectedEvent.time && (
//                     <div className="p-4 bg-gray-50 rounded-xl">
//                       <div className="flex items-center gap-3 mb-2">
//                         <Clock className="h-5 w-5 text-green-600" />
//                         <span className="text-sm font-bold text-gray-700">Time</span>
//                       </div>
//                       <p className="text-gray-900 font-black">{selectedEvent.time}</p>
//                     </div>
//                   )}
//                 </div>

//                 {selectedEvent.location && (
//                   <div className="p-4 bg-gray-50 rounded-xl">
//                     <div className="flex items-center gap-3 mb-2">
//                       <MapPin className="h-5 w-5 text-red-600" />
//                       <span className="text-sm font-bold text-gray-700">Location</span>
//                     </div>
//                     <p className="text-gray-900 font-black">{selectedEvent.location}</p>
//                   </div>
//                 )}

//                 {selectedEvent.project && (
//                   <div className="p-4 bg-gray-50 rounded-xl">
//                     <div className="flex items-center gap-3 mb-2">
//                       <Building2 className="h-5 w-5 text-purple-600" />
//                       <span className="text-sm font-bold text-gray-700">Project</span>
//                     </div>
//                     <p className="text-gray-900 font-black">{selectedEvent.project}</p>
//                   </div>
//                 )}

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="p-4 bg-gray-50 rounded-xl">
//                     <div className="flex items-center gap-3 mb-2">
//                       <Flag className="h-5 w-5 text-orange-600" />
//                       <span className="text-sm font-bold text-gray-700">Priority</span>
//                     </div>
//                     <p className="text-gray-900 font-black capitalize">{selectedEvent.priority || 'Medium'}</p>
//                   </div>

//                   <div className="p-4 bg-gray-50 rounded-xl">
//                     <div className="flex items-center gap-3 mb-2">
//                       <Target className="h-5 w-5 text-indigo-600" />
//                       <span className="text-sm font-bold text-gray-700">Type</span>
//                     </div>
//                     <p className="text-gray-900 font-black capitalize">{selectedEvent.type?.replace('_', ' ')}</p>
//                   </div>
//                 </div>

//                 <div className="flex gap-4 pt-6 border-t border-gray-200">
//                   <button className="flex-1 px-6 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all font-bold flex items-center justify-center gap-2">
//                     <Edit className="h-5 w-5" />
//                     Edit
//                   </button>
//                   <button className="flex-1 px-6 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all font-bold flex items-center justify-center gap-2">
//                     <Trash2 className="h-5 w-5" />
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CalendarPage;