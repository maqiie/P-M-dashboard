import React, { useState, useEffect } from 'react';
import {
  Calendar, Plus, ChevronLeft, ChevronRight, Clock, MapPin,
  Users, Building2, AlertTriangle, CheckCircle, Eye, Edit,
  Filter, Search, Bell, CalendarDays, Target, Flag, Star
} from 'lucide-react';
import { calendarAPI } from '../../services/api';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [events] = useState([
    {
      id: 1,
      title: 'Foundation Inspection',
      type: 'inspection',
      project: 'Downtown Office Complex',
      date: '2024-07-15',
      time: '09:00',
      duration: 120,
      location: 'Construction Site A',
      attendees: ['John Smith', 'Sarah Johnson', 'Mike Wilson'],
      status: 'scheduled',
      priority: 'high',
      description: 'Monthly foundation quality inspection'
    },
    {
      id: 2,
      title: 'Client Meeting - Progress Review',
      type: 'meeting',
      project: 'Riverside Residential',
      date: '2024-07-16',
      time: '14:00',
      duration: 90,
      location: 'Main Office Conference Room',
      attendees: ['Emily Davis', 'David Chen', 'Client Representative'],
      status: 'scheduled',
      priority: 'medium',
      description: 'Quarterly progress review with client'
    },
    {
      id: 3,
      title: 'Safety Training Session',
      type: 'training',
      project: 'All Projects',
      date: '2024-07-17',
      time: '10:00',
      duration: 180,
      location: 'Training Center',
      attendees: ['All Team Members'],
      status: 'scheduled',
      priority: 'high',
      description: 'Monthly safety protocols training'
    },
    {
      id: 4,
      title: 'Material Delivery',
      type: 'delivery',
      project: 'Bridge Construction',
      date: '2024-07-18',
      time: '08:00',
      duration: 240,
      location: 'Bridge Construction Site',
      attendees: ['Mike Wilson', 'Lisa Brown'],
      status: 'scheduled',
      priority: 'medium',
      description: 'Steel beam delivery and installation'
    },
    {
      id: 5,
      title: 'Project Deadline',
      type: 'deadline',
      project: 'Industrial Warehouse',
      date: '2024-07-20',
      time: '17:00',
      duration: 0,
      location: 'Industrial Site',
      attendees: ['Project Team'],
      status: 'scheduled',
      priority: 'high',
      description: 'Project completion deadline'
    },
    {
      id: 6,
      title: 'Equipment Maintenance',
      type: 'maintenance',
      project: 'All Projects',
      date: '2024-07-19',
      time: '07:00',
      duration: 480,
      location: 'Equipment Yard',
      attendees: ['Equipment Team'],
      status: 'scheduled',
      priority: 'low',
      description: 'Weekly equipment maintenance check'
    },
    {
      id: 7,
      title: 'Site Survey',
      type: 'survey',
      project: 'Shopping Mall Renovation',
      date: '2024-07-22',
      time: '11:00',
      duration: 150,
      location: 'Mall Site',
      attendees: ['Jennifer Lee', 'Robert Garcia'],
      status: 'scheduled',
      priority: 'medium',
      description: 'Pre-renovation site survey'
    },
    {
      id: 8,
      title: 'Budget Review Meeting',
      type: 'meeting',
      project: 'All Projects',
      date: '2024-07-23',
      time: '15:30',
      duration: 120,
      location: 'Main Office',
      attendees: ['Management Team'],
      status: 'scheduled',
      priority: 'high',
      description: 'Monthly budget and expense review'
    }
  ]);

  const eventTypes = [
    { value: 'all', label: 'All Events', color: 'gray' },
    { value: 'meeting', label: 'Meetings', color: 'blue' },
    { value: 'inspection', label: 'Inspections', color: 'green' },
    { value: 'training', label: 'Training', color: 'purple' },
    { value: 'delivery', label: 'Deliveries', color: 'orange' },
    { value: 'deadline', label: 'Deadlines', color: 'red' },
    { value: 'maintenance', label: 'Maintenance', color: 'yellow' },
    { value: 'survey', label: 'Surveys', color: 'teal' }
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
    return events.filter(event => event.date === dateStr);
  };

  const filteredEvents = events.filter(event => {
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
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
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDuration = (duration) => {
    if (duration === 0) return '';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <h1 className="text-6xl font-bold text-gray-900 mb-4 tracking-tight">
              Calendar
            </h1>
            <p className="text-2xl text-gray-600 leading-relaxed">
              Schedule and track all project events, meetings, and deadlines
            </p>
          </div>
          
          <button className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-semibold rounded-2xl hover:shadow-xl transition-all duration-300">
            <Plus className="h-6 w-6" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <CalendarDays className="h-10 w-10 text-blue-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">{events.length}</p>
          <p className="text-lg text-gray-600">Total Events</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <Clock className="h-10 w-10 text-green-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">{todayEvents.length}</p>
          <p className="text-lg text-gray-600">Today's Events</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">{events.filter(e => e.priority === 'high').length}</p>
          <p className="text-lg text-gray-600">High Priority</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          <Users className="h-10 w-10 text-purple-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900 mb-1">{events.filter(e => e.type === 'meeting').length}</p>
          <p className="text-lg text-gray-600">Meetings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <h2 className="text-3xl font-bold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-6 py-3 bg-blue-100 text-blue-700 rounded-xl font-semibold hover:bg-blue-200 transition-all"
              >
                Today
              </button>
              
              <button
                onClick={() => navigateMonth(1)}
                className="p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map(day => (
              <div key={day} className="text-center py-4 text-xl font-semibold text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {getDaysInMonth(currentDate).map((date, index) => {
              const dayEvents = getEventsForDate(date);
              
              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-3 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
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
                      <div className={`text-xl font-semibold mb-2 ${
                        isToday(date) ? 'text-blue-700' : 
                        isSelected(date) ? 'text-purple-700' : 'text-gray-900'
                      }`}>
                        {date.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`p-2 rounded-lg text-xs font-medium bg-${getEventTypeColor(event.type)}-100 text-${getEventTypeColor(event.type)}-700 border-l-2 border-${getEventTypeColor(event.type)}-400`}
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
        <div className="space-y-8">
          {/* Filters */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Filters</h3>
            
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Selected Date Events */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            <div className="space-y-4">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map(event => (
                  <div key={event.id} className={`p-4 rounded-2xl border-l-4 ${getPriorityColor(event.priority)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg bg-${getEventTypeColor(event.type)}-100`}>
                          {getEventIcon(event.type)}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{event.title}</h4>
                          <p className="text-sm text-gray-600">{event.project}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(event.time)} {formatDuration(event.duration)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{event.attendees.length} attendees</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mt-2">{event.description}</p>
                    
                    <div className="flex space-x-2 mt-4">
                      <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all">
                        <Eye className="h-4 w-4" />
                        <span className="font-medium">View</span>
                      </button>
                      <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all">
                        <Edit className="h-4 w-4" />
                        <span className="font-medium">Edit</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-lg text-gray-500">No events scheduled</p>
                </div>
              )}
            </div>
          </div>

          {/* Event Legend */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Event Types</h3>
            
            <div className="space-y-3">
              {eventTypes.slice(1).map(type => (
                <div key={type.value} className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded bg-${type.color}-400`} />
                  <span className="text-lg text-gray-700">{type.label}</span>
                  <span className="text-sm text-gray-500">
                    ({events.filter(e => e.type === type.value).length})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;