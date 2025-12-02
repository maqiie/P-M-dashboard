import React, { useState, useEffect } from 'react';
import {
  Calendar, Plus, Search, Clock, MapPin, Users, Video,
  AlertTriangle, CheckCircle, XCircle, Loader,
  Menu, X, Building2, Link as LinkIcon, FileText, Trash2,
  Edit, Bell, ChevronRight, MoreVertical, User, Copy
} from 'lucide-react';
import { meetingsAPI, projectsAPI } from '../../services/api';
import AdminSidebar from './AdminSidebar';

const MeetingsPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 1;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meeting_date: '',
    meeting_time: '',
    location: '',
    meeting_type: 'in_person',
    duration_minutes: 60,
    meeting_link: '',
    agenda: '',
    project_id: '',
    participant_ids: []
  });

  const extractArray = (res, key) => {
    if (!res) return [];
    if (Array.isArray(res.data)) return res.data;
    if (key && res.data && Array.isArray(res.data[key])) return res.data[key];
    return [];
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [meetingsRes, projectsRes] = await Promise.all([
        meetingsAPI.getAll().catch(err => {
          console.error('Error fetching meetings:', err);
          return null;
        }),
        projectsAPI.getAll().catch(err => {
          console.error('Error fetching projects:', err);
          return null;
        })
      ]);

      const meetingsData = extractArray(meetingsRes, 'meetings');
      const projectsData = extractArray(projectsRes, 'projects');

      setMeetings(meetingsData);
      setProjects(projectsData);

      // Collect unique users from participants
      const allParticipants = meetingsData.flatMap(m => m.participants || []);
      const uniqueUsers = [];
      const ids = new Set();
      allParticipants.forEach(u => {
        if (u.id && !ids.has(u.id)) {
          ids.add(u.id);
          uniqueUsers.push(u);
        }
      });

      setUsers(uniqueUsers.length > 0 ? uniqueUsers : [currentUser]);
    } catch (err) {
      console.error(err);
      setError('Failed to load meetings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      meeting_date: '',
      meeting_time: '',
      location: '',
      meeting_type: 'in_person',
      duration_minutes: 60,
      meeting_link: '',
      agenda: '',
      project_id: '',
      participant_ids: []
    });
    setIsEditing(false);
    setSelectedMeeting(null);
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      if (!formData.title.trim() || !formData.meeting_date || !formData.meeting_time) {
        alert('Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      const meetingDateTime = new Date(`${formData.meeting_date}T${formData.meeting_time}`);
      if (meetingDateTime <= new Date()) {
        alert('Meeting date and time must be in the future');
        setSubmitting(false);
        return;
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        meeting_date: meetingDateTime.toISOString(),
        location: formData.location.trim(),
        meeting_type: formData.meeting_type,
        duration_minutes: parseInt(formData.duration_minutes),
        meeting_link: formData.meeting_link.trim(),
        agenda: formData.agenda.trim(),
        project_id: formData.project_id || null,
        participant_ids: formData.participant_ids
      };

      let response;
      if (isEditing && selectedMeeting) {
        response = await meetingsAPI.update(selectedMeeting.id, payload);
      } else {
        response = await meetingsAPI.create(payload);
      }

      if (response?.status === 200 || response?.status === 201) {
        alert(isEditing ? 'Meeting updated successfully!' : 'Meeting created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchData();
      } else {
        alert('Failed to save meeting');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save meeting');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMeeting = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) return;
    try {
      await meetingsAPI.delete(id);
      alert('Meeting deleted successfully!');
      setShowDetailModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete meeting');
    }
  };

  const handleRespondToMeeting = async (meetingId, response) => {
    try {
      await meetingsAPI.respond(meetingId, response);
      alert('Response recorded!');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to submit response');
    }
  };

  const openEditModal = (meeting) => {
    const date = new Date(meeting.meeting_date);
    setFormData({
      title: meeting.title || '',
      description: meeting.description || '',
      meeting_date: date.toISOString().split('T')[0],
      meeting_time: date.toTimeString().slice(0, 5),
      location: meeting.location || '',
      meeting_type: meeting.meeting_type || 'in_person',
      duration_minutes: meeting.duration_minutes || 60,
      meeting_link: meeting.meeting_link || '',
      agenda: meeting.agenda || '',
      project_id: meeting.project?.id || '',
      participant_ids: meeting.participants?.map(p => p.id) || []
    });
    setSelectedMeeting(meeting);
    setIsEditing(true);
    setShowCreateModal(true);
    setShowDetailModal(false);
  };

  const openDetailModal = (meeting) => {
    setSelectedMeeting(meeting);
    setShowDetailModal(true);
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white',
      in_progress: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white',
      completed: 'bg-gradient-to-r from-emerald-500 to-green-400 text-white',
      cancelled: 'bg-gradient-to-r from-rose-500 to-pink-400 text-white'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getMeetingIcon = (type) => {
    switch(type) {
      case 'virtual': return <Video className="w-5 h-5 text-blue-400" />;
      case 'hybrid': return <Users className="w-5 h-5 text-purple-400" />;
      default: return <MapPin className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredMeetings = meetings.filter(m => {
    const matchesSearch = (m.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      || (m.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'today' && new Date(m.meeting_date).toDateString() === new Date().toDateString()) ||
      (activeTab === 'upcoming' && new Date(m.meeting_date) > new Date() && new Date(m.meeting_date).toDateString() !== new Date().toDateString());
    return matchesSearch && matchesStatus && matchesTab;
  });

  const stats = {
    total: meetings.length,
    today: meetings.filter(m => new Date(m.meeting_date).toDateString() === new Date().toDateString()).length,
    upcoming: meetings.filter(m => new Date(m.meeting_date) > new Date()).length,
    completed: meetings.filter(m => m.status === 'completed').length
  };

  if (loading) return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse mx-auto"></div>
            <Loader className="w-12 h-12 text-white animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading meetings...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <p className="mt-4 text-gray-800 font-semibold text-lg">{error}</p>
          <button onClick={fetchData} className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 overflow-hidden">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
          <div className="relative backdrop-blur-sm bg-white/80 border-b border-white/30">
            <div className="px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-xl bg-white/50 backdrop-blur-sm border border-white/30 hover:bg-white/70 transition-all">
                    <Menu className="w-5 h-5 text-gray-700" />
                  </button>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Meetings
                    </h1>
                    <p className="text-sm text-gray-600">Schedule and collaborate with your team</p>
                  </div>
                </div>
                
                <button onClick={() => setShowCreateModal(true)} className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>New Meeting</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm border border-white/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Meetings</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-white to-amber-50 backdrop-blur-sm border border-white/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.today}</p>
                  <p className="text-sm text-gray-600 mt-1">Today</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-white to-emerald-50 backdrop-blur-sm border border-white/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.upcoming}</p>
                  <p className="text-sm text-gray-600 mt-1">Upcoming</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-400 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-white to-rose-50 backdrop-blur-sm border border-white/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
                  <p className="text-sm text-gray-600 mt-1">Completed</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-400 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 lg:px-8">
          <div className="flex space-x-2 border-b border-gray-200">
            {['all', 'today', 'upcoming'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${activeTab === tab 
                  ? 'bg-white border-t border-l border-r border-gray-200 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="px-6 lg:px-8 py-6">
          <div className="bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm border border-white/30 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search meetings by title, description..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Meetings Grid */}
        <div className="px-6 lg:px-8 pb-8 flex-1 overflow-y-auto">
          {filteredMeetings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              <p className="mt-4 text-gray-600">No meetings found</p>
              <button onClick={() => setShowCreateModal(true)} className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                Create Your First Meeting
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMeetings.map(meeting => (
                <div
                  key={meeting.id}
                  onClick={() => openDetailModal(meeting)}
                  className="group bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(meeting.status)}`}>
                        {meeting.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getMeetingIcon(meeting.meeting_type)}
                      <button className="p-1 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3 line-clamp-1">
                    {meeting.title}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 text-blue-500 mr-3" />
                      <span className="text-sm">{formatDateTime(meeting.meeting_date)}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 text-amber-500 mr-3" />
                      <span className="text-sm">{meeting.duration_minutes} minutes</span>
                    </div>

                    {meeting.location && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 text-emerald-500 mr-3" />
                        <span className="text-sm truncate">{meeting.location}</span>
                      </div>
                    )}
                  </div>

                  {meeting.participants && meeting.participants.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {meeting.participants.slice(0, 3).map((p, idx) => (
                            <div
                              key={p.id}
                              className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                              style={{ zIndex: 3 - idx }}
                            >
                              {getInitials(p.name || p.email)}
                            </div>
                          ))}
                          {meeting.participants.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold border-2 border-white">
                              +{meeting.participants.length - 3}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm border border-white/30 rounded-3xl shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Meeting' : 'Create Meeting'}</h2>
                  <p className="text-sm text-gray-600 mt-1">Schedule a new meeting with your team</p>
                </div>
                <button
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleCreateMeeting} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Meeting Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="Team sync, Client meeting..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Meeting Type</label>
                    <select
                      value={formData.meeting_type}
                      onChange={e => setFormData({ ...formData, meeting_type: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="in_person">In Person</option>
                      <option value="virtual">Virtual</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.meeting_date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setFormData({ ...formData, meeting_date: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Time *</label>
                    <input
                      type="time"
                      required
                      value={formData.meeting_time}
                      onChange={e => setFormData({ ...formData, meeting_time: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                    <select
                      value={formData.duration_minutes}
                      onChange={e => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      {[15, 30, 45, 60, 90, 120, 180].map(m => (
                        <option key={m} value={m}>{m} minutes</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="Conference Room, Zoom link..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Project</label>
                    <select
                      value={formData.project_id}
                      onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="">No project</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Participants</label>
                  <div className="border border-gray-200 rounded-xl p-4 max-h-48 overflow-y-auto">
                    {users.filter(u => u.id !== currentUser.id).map(u => (
                      <label key={u.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.participant_ids.includes(u.id)}
                          onChange={e => {
                            if (e.target.checked)
                              setFormData({ ...formData, participant_ids: [...formData.participant_ids, u.id] });
                            else
                              setFormData({ ...formData, participant_ids: formData.participant_ids.filter(id => id !== u.id) });
                          }}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                            {getInitials(u.name || u.email)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{u.name || u.email}</p>
                            {u.email && <p className="text-xs text-gray-500">{u.email}</p>}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="What is this meeting about?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Agenda</label>
                  <textarea
                    rows={3}
                    value={formData.agenda}
                    onChange={e => setFormData({ ...formData, agenda: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Meeting agenda items..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
                  >
                    {submitting ? 'Saving...' : isEditing ? 'Update Meeting' : 'Create Meeting'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm border border-white/30 rounded-3xl shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedMeeting.status)}`}>
                      {selectedMeeting.status.replace('_', ' ')}
                    </span>
                    <span className="flex items-center space-x-1 text-xs text-gray-500">
                      {getMeetingIcon(selectedMeeting.meeting_type)}
                      <span className="capitalize">{selectedMeeting.meeting_type?.replace('_', ' ')}</span>
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedMeeting.title}</h2>
                </div>
                <div className="flex items-center space-x-2">
                  {isAdmin && (
                    <>
                      <button onClick={() => openEditModal(selectedMeeting)} className="p-2 hover:bg-gray-100 rounded-xl">
                        <Edit className="w-5 h-5 text-gray-600" />
                      </button>
                      <button onClick={() => handleDeleteMeeting(selectedMeeting.id)} className="p-2 hover:bg-red-50 rounded-xl">
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </>
                  )}
                  <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-10 h-10 text-blue-600" />
                    <div>
                      <p className="text-lg font-bold text-blue-900">{formatDateTime(selectedMeeting.meeting_date)}</p>
                      <p className="text-sm text-blue-700">Duration: {selectedMeeting.duration_minutes} minutes</p>
                    </div>
                  </div>
                </div>

                {selectedMeeting.location && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Location</p>
                      <p className="text-sm text-gray-600">{selectedMeeting.location}</p>
                    </div>
                  </div>
                )}

                {selectedMeeting.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">{selectedMeeting.description}</p>
                  </div>
                )}

                {selectedMeeting.participants && selectedMeeting.participants.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Participants</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedMeeting.participants.map(p => (
                        <div key={p.id} className="flex items-center space-x-3 bg-gray-50 rounded-xl p-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {getInitials(p.name || p.email)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{p.name || p.email}</p>
                            {p.email && <p className="text-xs text-gray-500">{p.email}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isAdmin && selectedMeeting.status === 'scheduled' && new Date(selectedMeeting.meeting_date) > new Date() && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">Your response</p>
                    <div className="flex space-x-3">
                      <button onClick={() => handleRespondToMeeting(selectedMeeting.id, 'accepted')} className="flex-1 py-2 bg-green-100 text-green-700 font-semibold rounded-xl hover:bg-green-200 transition-all">
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        Accept
                      </button>
                      <button onClick={() => handleRespondToMeeting(selectedMeeting.id, 'tentative')} className="flex-1 py-2 bg-yellow-100 text-yellow-700 font-semibold rounded-xl hover:bg-yellow-200 transition-all">
                        Maybe
                      </button>
                      <button onClick={() => handleRespondToMeeting(selectedMeeting.id, 'declined')} className="flex-1 py-2 bg-red-100 text-red-700 font-semibold rounded-xl hover:bg-red-200 transition-all">
                        <XCircle className="w-4 h-4 inline mr-2" />
                        Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsPage;

