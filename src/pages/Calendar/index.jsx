import React, { useState, useEffect } from 'react';
// import Sidebar from '../../components/Sidebar';
import { dashboardAPI } from '../../services/api';
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
  Building2
} from 'lucide-react';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [eventFilter, setEventFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('calendar');
  // const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
      setEvents(getMockEvents());
    } finally {
      setLoading(false);
    }
  };

  const getMockEvents = () => [
    {
      id: 1,
      title: "Project Kickoff - Smart City",
      description: "Initial meeting with all stakeholders",
      date: "2025-07-05",
      time: "09:00",
      type: "meeting",
      project: "Smart City Infrastructure",
      location: "Conference Room A",
      attendees: ["Sarah Johnson", "Maria Santos", "Tech Team"],
      status: "scheduled",
      priority: "high"
    },
    {
      id: 2,
      title: "Client Review - Downtown Plaza",
      description: "Present progress and get client feedback",
      date: "2025-07-08",
      time: "14:00",
      type: "review",
      project: "Downtown Plaza Development",
      location: "Client Office",
      attendees: ["Sarah Johnson", "Alex Chen", "Client"],
      status: "scheduled",
      priority: "high"
    },
    {
      id: 3,
      title: "Budget Approval Meeting",
      description: "Quarterly budget review and approval",
      date: "2025-07-10",
      time: "10:30",
      type: "meeting",
      project: "Green Energy Initiative",
      location: "Finance Department",
      attendees: ["Finance Team", "Sarah Johnson"],
      status: "scheduled",
      priority: "medium"
    },
    {
      id: 4,
      title: "Site Inspection",
      description: "Monthly safety and progress inspection",
      date: "2025-07-12",
      time: "08:00",
      type: "inspection",
      project: "Green Energy Initiative",
      location: "Industrial Zone Site",
      attendees: ["John Davis", "Safety Team"],
      status: "scheduled",
      priority: "high"
    },
    {
      id: 5,
      title: "Team Standup",
      description: "Weekly team synchronization meeting",
      date: "2025-07-15",
      time: "09:00",
      type: "meeting",
      project: "Downtown Plaza Development",
      location: "Project Office",
      attendees: ["Development Team"],
      status: "scheduled",
      priority: "low"
    },
    {
      id: 6,
      title: "Equipment Delivery",
      description: "New construction equipment arrival",
      date: "2025-07-18",
      time: "11:00",
      type: "delivery",
      project: "Highway Bridge Renovation",
      location: "Equipment Yard",
      attendees: ["Mike Wilson", "Equipment Team"],
      status: "scheduled",
      priority: "medium"
    },
    {
      id: 7,
      title: "Project Completion Review",
      description: "Final review and handover preparation",
      date: "2025-07-20",
      time: "15:00",
      type: "review",
      project: "Residential Complex Phase 2",
      location: "Site Office",
      attendees: ["Lisa Wang", "Quality Team"],
      status: "scheduled",
      priority: "high"
    }
  ];

  const handleMenuItemClick = (itemId, href) => {
    console.log('Navigate to:', href);
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
    return events.filter(event => event.date === dateStr);
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'review': return 'bg-purple-500';
      case 'inspection': return 'bg-green-500';
      case 'delivery': return 'bg-orange-500';
      case 'deadline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'meeting': return <Users className="h-3 w-3" />;
      case 'review': return <Eye className="h-3 w-3" />;
      case 'inspection': return <CheckCircle className="h-3 w-3" />;
      case 'delivery': return <Building2 className="h-3 w-3" />;
      case 'deadline': return <AlertTriangle className="h-3 w-3" />;
      default: return <Calendar className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
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

  const filteredEvents = events.filter(event => {
    if (eventFilter === 'all') return true;
    return event.type === eventFilter;
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-xl text-gray-700 font-semibold">Loading Calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      {/* <Sidebar 
        activeItem={activeMenuItem}
        onItemClick={handleMenuItemClick}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      /> */}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/30 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage project events, meetings, and deadlines
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Event
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            
            {/* Calendar */}
            <div className="xl:col-span-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg overflow-hidden">
                
                {/* Calendar Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h2 className="text-xl font-bold text-gray-900">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </h2>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => navigateMonth(-1)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => navigateMonth(1)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <select
                        value={eventFilter}
                        onChange={(e) => setEventFilter(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="all">All Events</option>
                        <option value="meeting">Meetings</option>
                        <option value="review">Reviews</option>
                        <option value="inspection">Inspections</option>
                        <option value="delivery">Deliveries</option>
                        <option value="deadline">Deadlines</option>
                      </select>
                      
                      <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                      >
                        Today
                      </button>
                    </div>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-6">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {dayNames.map(day => (
                      <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth(currentDate).map((day, index) => {
                      const dayEvents = getEventsForDate(day);
                      
                      return (
                        <div 
                          key={index}
                          onClick={() => handleDateClick(day)}
                          className={`
                            min-h-24 p-2 border border-gray-100 rounded-lg cursor-pointer transition-all duration-200
                            ${day ? 'hover:bg-blue-50 hover:border-blue-200' : 'bg-gray-50'}
                            ${isToday(day) ? 'bg-blue-100 border-blue-300' : ''}
                            ${isSelected(day) ? 'ring-2 ring-blue-500' : ''}
                          `}
                        >
                          {day && (
                            <>
                              <div className={`
                                text-sm font-medium mb-1
                                ${isToday(day) ? 'text-blue-700' : 'text-gray-700'}
                              `}>
                                {day}
                              </div>
                              <div className="space-y-1">
                                {dayEvents.slice(0, 2).map(event => (
                                  <div 
                                    key={event.id}
                                    className={`
                                      text-xs p-1 rounded text-white truncate
                                      ${getEventTypeColor(event.type)}
                                    `}
                                    title={event.title}
                                  >
                                    {event.title}
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
              </div>
            </div>

            {/* Event Details Sidebar */}
            <div className="space-y-6">
              
              {/* Event Legend */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Event Types</h3>
                <div className="space-y-2">
                  {[
                    { type: 'meeting', label: 'Meetings' },
                    { type: 'review', label: 'Reviews' },
                    { type: 'inspection', label: 'Inspections' },
                    { type: 'delivery', label: 'Deliveries' },
                    { type: 'deadline', label: 'Deadlines' }
                  ].map(({ type, label }) => (
                    <div key={type} className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded ${getEventTypeColor(type)}`}></div>
                      <span className="text-sm text-gray-700">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Events */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Events</h3>
                <div className="space-y-3">
                  {filteredEvents
                    .filter(event => {
                      const today = new Date();
                      const eventDate = new Date(event.date);
                      return eventDate.toDateString() === today.toDateString();
                    })
                    .slice(0, 3)
                    .map(event => (
                      <div key={event.id} className={`p-3 rounded-lg border-l-4 bg-gray-50 ${getPriorityColor(event.priority)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className={`p-1 rounded text-white ${getEventTypeColor(event.type)}`}>
                                {getEventTypeIcon(event.type)}
                              </div>
                              <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{event.description}</p>
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {event.time}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {event.location}
                              </div>
                            </div>
                          </div>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  
                  {filteredEvents.filter(event => {
                    const today = new Date();
                    const eventDate = new Date(event.date);
                    return eventDate.toDateString() === today.toDateString();
                  }).length === 0 && (
                    <div className="text-center py-6">
                      <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                      <p className="mt-2 text-sm text-gray-500">No events today</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming This Week</h3>
                <div className="space-y-3">
                  {filteredEvents
                    .filter(event => {
                      const eventDate = new Date(event.date);
                      const today = new Date();
                      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                      return eventDate > today && eventDate <= weekFromNow;
                    })
                    .slice(0, 5)
                    .map(event => (
                      <div key={event.id} className={`p-3 rounded-lg border-l-4 bg-gray-50 ${getPriorityColor(event.priority)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className={`p-1 rounded text-white ${getEventTypeColor(event.type)}`}>
                                {getEventTypeIcon(event.type)}
                              </div>
                              <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{event.project}</p>
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                              <span>{event.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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