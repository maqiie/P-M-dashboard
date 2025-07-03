import axios from "axios";
import { getToken } from "./tokenStorage";

console.log("🚀 API FILE LOADED - Updated version");

// Base URL of your Rails backend server
const API_BASE_URL = "http://192.168.1.191:3001";

// Axios instance without auth (used for login, signup, etc.)
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Authenticated axios instance
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add a request interceptor to axiosInstance to inject auth headers dynamically
axiosInstance.interceptors.request.use(
  async (config) => {
    const authData = await getToken();
    if (authData) {
      config.headers.Authorization = authData.bearerToken || `Bearer ${authData.accessToken}`;
      config.headers.client = authData.client || "";
      config.headers.uid = authData.uid || "";
      config.headers["token-type"] = authData.tokenType || "";
      config.headers["access-token"] = authData.accessToken || "";
    }
    console.log(`${config.method.toUpperCase()} ${config.url}`, config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error logging
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error?.response || error.message);
    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  console.log(`${config.method.toUpperCase()} ${config.url}`, config.headers);
  console.log("Request data:", config.data);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error?.response || error.message);
    return Promise.reject(error);
  }
);

// Utility function to get auth headers if needed separately
export const getAuthHeaders = async () => {
  const authData = await getToken();
  return {
    Authorization: authData?.bearerToken || `Bearer ${authData?.accessToken}`,
    uid: authData?.uid || "",
    client: authData?.client || "",
    "token-type": authData?.tokenType || "",
    "access-token": authData?.accessToken || "",
    "Content-Type": "application/json",
    Accept: "application/json",
  };
};

// ========== AUTH ========== //
export const login = async (email, password) => {
  const response = await api.post("/auth/sign_in", { email, password });
  return response.data;
};

export const signup = async ({ name, email, password, password_confirmation }) => {
  const response = await api.post('/auth', {
    user: { name, email, password, password_confirmation }
  });
  return response.data;
};

export const verifyOtp = async (email, otp) => {
  try {
    console.log("Verifying OTP:", { email, otp });
    
    const response = await api.post("/auth/verify_otp", { email, otp });
    
    console.log("OTP verification successful:", response);
    console.log("Response data:", response.data);
    console.log("Response status:", response.status);
    
    // Log all headers (convert to plain object for better visibility)
    const allHeaders = {};
    Object.keys(response.headers).forEach(key => {
      allHeaders[key] = response.headers[key];
    });
    console.log("All response headers:", allHeaders);
    
    // Extract token from headers (try different possible header names)
    const token =
      response.headers["authorization"]?.split(" ")[1] ||
      response.headers["access-token"] ||
      response.headers["accesstoken"] ||
      response.headers["Access-Token"] ||
      response.headers["ACCESS-TOKEN"];
      
    console.log("Extracted token:", token);
    
    // Check if token is in response body instead of headers
    const bodyToken =
    response.data['access-token'] ||      // <- this is the real fix
    response.data.access_token ||
    response.data.accessToken ||
    response.data.token ||
    response.data.data?.access_token ||
    response.data.data?.token;
  
    console.log("Token from response body:", bodyToken);
    
    const finalToken = token || bodyToken;
    
    if (!finalToken) {
      console.error("No token found in headers or body");
      console.error("Full response:", response);
      throw new Error("No token received from server");
    }
    
    // Extract user data and role
    const userData = response.data.data || response.data.user || response.data;
    const role = userData?.admin ? 'admin' : 'user';
    
    console.log("User data:", userData);
    console.log("User role:", role);
    
    return {
      message: response.data.message || "OTP verified successfully!",
      accessToken: finalToken,
      bearerToken: `Bearer ${finalToken}`,
      client: response.headers["client"] || response.data.client || "default-client",
      expiry: response.headers["expiry"] || response.data.expiry,
      uid: response.headers["uid"] || response.data.uid || userData?.uid || userData?.email,
      tokenType: response.headers["token-type"] || response.data.tokenType || "Bearer",
      role: role,
      user: userData
    };
  } catch (error) {
    console.error("OTP verification error details:", {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      message: error.message
    });
    
    // Get more specific error message
    const errorMessage = 
      error.response?.data?.errors?.join(', ') ||
      error.response?.data?.message ||
      error.response?.data?.error ||
      `OTP verification failed: ${error.response?.status} ${error.response?.statusText}`;
    
    throw new Error(errorMessage);
  }
};

export const resendOtp = async (email) => {
  const response = await api.post("/auth/resend_otp", { email });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/password", { email });
  return response.data;
};

export const resetPassword = async (
  resetToken,
  password,
  passwordConfirmation
) => {
  const response = await api.put("/auth/password", {
    reset_password_token: resetToken,
    password,
    password_confirmation: passwordConfirmation,
  });
  return response.data;
};

export const getUserDetails = async () => {
  const response = await axiosInstance.get("/auth/validate_token");
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.delete("/auth/sign_out");
  return response.data;
};

export const deleteAccount = async () => {
  const response = await axiosInstance.delete("/auth/delete_account");
  return response.data;
};

export const confirmEmail = async (confirmationToken) => {
  const response = await api.get(
    `/users/confirm_email?confirmation_token=${confirmationToken}`
  );
  return response.data;
};

// ========== PROJECT MANAGER DASHBOARD ========== //

// Main dashboard endpoint - gets all dashboard data in one call
export const getProjectManagerDashboard = async () => {
  try {
    const response = await axiosInstance.get('/project_managers/dashboard');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch project manager dashboard:', error);
    throw error;
  }
};

// Individual dashboard endpoints
export const getMyProjects = async () => {
  try {
    const response = await axiosInstance.get('/project_managers/my_projects');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    // Fallback to projects endpoint if PM endpoint fails
    try {
      const fallbackResponse = await axiosInstance.get('/projects');
      return fallbackResponse.data;
    } catch (fallbackError) {
      console.error('Fallback projects fetch also failed:', fallbackError);
      throw error;
    }
  }
};

export const getUpcomingEvents = async (limit = 10) => {
  try {
    const response = await axiosInstance.get(`/project_managers/upcoming_events?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch upcoming events:', error);
    throw error;
  }
};

export const getMyTenders = async () => {
  try {
    const response = await axiosInstance.get('/project_managers/my_tenders');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tenders:', error);
    throw error;
  }
};

export const getDashboardStatistics = async () => {
  try {
    const response = await axiosInstance.get('/project_managers/statistics');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard statistics:', error);
    throw error;
  }
};

export const getTeamMembers = async () => {
  try {
    const response = await axiosInstance.get('/project_managers/team_members');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch team members:', error);
    throw error;
  }
};

export const getProjectsProgress = async () => {
  try {
    const response = await axiosInstance.get('/project_managers/projects_progress');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch projects progress:', error);
    throw error;
  }
};

// ========== PROJECTS ========== //

export const getAllProjects = async () => {
  try {
    const response = await axiosInstance.get('/projects');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all projects:', error);
    throw error;
  }
};

export const getProject = async (id) => {
  try {
    const response = await axiosInstance.get(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch project ${id}:`, error);
    throw error;
  }
};

export const createProject = async (projectData) => {
  try {
    const response = await axiosInstance.post('/projects', { project: projectData });
    return response.data;
  } catch (error) {
    console.error('Failed to create project:', error);
    throw error;
  }
};

export const updateProject = async (id, projectData) => {
  try {
    const response = await axiosInstance.put(`/projects/${id}`, { project: projectData });
    return response.data;
  } catch (error) {
    console.error(`Failed to update project ${id}:`, error);
    throw error;
  }
};

export const deleteProject = async (id) => {
  try {
    const response = await axiosInstance.delete(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete project ${id}:`, error);
    throw error;
  }
};

export const getProjectProgress = async (id) => {
  try {
    const response = await axiosInstance.get(`/projects/${id}/progress`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch progress for project ${id}:`, error);
    throw error;
  }
};

export const updateProjectProgress = async (id, progressData) => {
  try {
    const response = await axiosInstance.patch(`/projects/${id}/update_progress`, progressData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update progress for project ${id}:`, error);
    throw error;
  }
};

export const getProjectTeam = async (id) => {
  try {
    const response = await axiosInstance.get(`/projects/${id}/team`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch team for project ${id}:`, error);
    throw error;
  }
};

export const getProjectTimeline = async (id) => {
  try {
    const response = await axiosInstance.get(`/projects/${id}/timeline`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch timeline for project ${id}:`, error);
    throw error;
  }
};

export const getProjectChartData = async () => {
  try {
    const response = await axiosInstance.get('/projects/chart_data');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch project chart data:', error);
    throw error;
  }
};

// ========== EVENTS ========== //

export const getAllEvents = async () => {
  try {
    const response = await axiosInstance.get('/events');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch events:', error);
    throw error;
  }
};

export const getMyEvents = async () => {
  try {
    const response = await axiosInstance.get('/events/my_events');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch my events:', error);
    throw error;
  }
};

export const getThisWeekEvents = async () => {
  try {
    const response = await axiosInstance.get('/events/this_week');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch this week events:', error);
    throw error;
  }
};

export const createEvent = async (eventData) => {
  try {
    const response = await axiosInstance.post('/events', { event: eventData });
    return response.data;
  } catch (error) {
    console.error('Failed to create event:', error);
    throw error;
  }
};

export const updateEvent = async (id, eventData) => {
  try {
    const response = await axiosInstance.put(`/events/${id}`, { event: eventData });
    return response.data;
  } catch (error) {
    console.error(`Failed to update event ${id}:`, error);
    throw error;
  }
};

export const deleteEvent = async (id) => {
  try {
    const response = await axiosInstance.delete(`/events/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete event ${id}:`, error);
    throw error;
  }
};

export const markEventCompleted = async (id) => {
  try {
    const response = await axiosInstance.patch(`/events/${id}/mark_completed`);
    return response.data;
  } catch (error) {
    console.error(`Failed to mark event ${id} as completed:`, error);
    throw error;
  }
};

export const rescheduleEvent = async (id, newDate) => {
  try {
    const response = await axiosInstance.patch(`/events/${id}/reschedule`, { date: newDate });
    return response.data;
  } catch (error) {
    console.error(`Failed to reschedule event ${id}:`, error);
    throw error;
  }
};

// ========== TENDERS ========== //

export const getAllTenders = async () => {
  try {
    const response = await axiosInstance.get('/tenders');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tenders:', error);
    throw error;
  }
};

export const getActiveTenders = async () => {
  try {
    const response = await axiosInstance.get('/tenders/active');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch active tenders:', error);
    throw error;
  }
};

export const getUrgentTenders = async () => {
  try {
    const response = await axiosInstance.get('/tenders/urgent');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch urgent tenders:', error);
    throw error;
  }
};

export const getDraftTenders = async () => {
  try {
    const response = await axiosInstance.get('/tenders/drafts');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch draft tenders:', error);
    throw error;
  }
};

export const createTender = async (tenderData) => {
  try {
    const response = await axiosInstance.post('/tenders', { tender: tenderData });
    return response.data;
  } catch (error) {
    console.error('Failed to create tender:', error);
    throw error;
  }
};

export const updateTender = async (id, tenderData) => {
  try {
    const response = await axiosInstance.put(`/tenders/${id}`, { tender: tenderData });
    return response.data;
  } catch (error) {
    console.error(`Failed to update tender ${id}:`, error);
    throw error;
  }
};

export const deleteTender = async (id) => {
  try {
    const response = await axiosInstance.delete(`/tenders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete tender ${id}:`, error);
    throw error;
  }
};

export const convertTenderToProject = async (id) => {
  try {
    const response = await axiosInstance.post(`/tenders/${id}/convert_to_project`);
    return response.data;
  } catch (error) {
    console.error(`Failed to convert tender ${id} to project:`, error);
    throw error;
  }
};

export const updateTenderStatus = async (id, status) => {
  try {
    const response = await axiosInstance.patch(`/tenders/${id}/update_status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Failed to update tender ${id} status:`, error);
    throw error;
  }
};

export const getTenderDetails = async (id) => {
  try {
    const response = await axiosInstance.get(`/tenders/${id}/details`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch tender ${id} details:`, error);
    throw error;
  }
};

// ========== SUPERVISORS ========== //

export const getSupervisorWorkload = async () => {
  try {
    const response = await axiosInstance.get('/supervisors/workload');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch supervisor workload:', error);
    throw error;
  }
};

export const getSupervisorProjects = async (id) => {
  try {
    const response = await axiosInstance.get(`/supervisors/${id}/projects`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch projects for supervisor ${id}:`, error);
    throw error;
  }
};

export const getSupervisorPerformance = async (id) => {
  try {
    const response = await axiosInstance.get(`/supervisors/${id}/performance`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch performance for supervisor ${id}:`, error);
    throw error;
  }
};

// ========== SEARCH ========== //

export const searchProjects = async (query) => {
  try {
    const response = await axiosInstance.get(`/search/projects?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Failed to search projects:', error);
    throw error;
  }
};

export const searchEvents = async (query) => {
  try {
    const response = await axiosInstance.get(`/search/events?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Failed to search events:', error);
    throw error;
  }
};

export const searchTenders = async (query) => {
  try {
    const response = await axiosInstance.get(`/search/tenders?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Failed to search tenders:', error);
    throw error;
  }
};

export const globalSearch = async (query) => {
  try {
    const response = await axiosInstance.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Failed to perform global search:', error);
    throw error;
  }
};

// ========== NOTIFICATIONS ========== //

export const getNotifications = async () => {
  try {
    const response = await axiosInstance.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    throw error;
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    const response = await axiosInstance.get('/notifications/unread_count');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch unread notification count:', error);
    throw error;
  }
};

export const markNotificationRead = async (id) => {
  try {
    const response = await axiosInstance.patch(`/notifications/${id}/mark_read`);
    return response.data;
  } catch (error) {
    console.error(`Failed to mark notification ${id} as read:`, error);
    throw error;
  }
};

export const markAllNotificationsRead = async () => {
  try {
    const response = await axiosInstance.patch('/notifications/mark_all_read');
    return response.data;
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    throw error;
  }
};

// ========== LEGACY DASHBOARD FUNCTIONS (for compatibility) ========== //

export const getDashboardStats = async () => {
  try {
    // Use the new project manager statistics endpoint
    return await getDashboardStatistics();
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    // Return mock data as fallback
    return {
      totalProjects: 12,
      activeProjects: 8,
      completedProjects: 4,
      activeTenders: 5,
      upcomingEvents: 3
    };
  }
};

export const getRecentActivity = async (limit = 10) => {
  try {
    const response = await axiosInstance.get(`/api/v1/dashboard/recent_activities?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recent activity:', error);
    return [
      { id: 1, description: 'New project created: Office Building Construction', created_at: '2025-07-01' },
      { id: 2, description: 'Project status updated for Bridge Renovation', created_at: '2025-06-30' },
      { id: 3, description: 'Event scheduled: Site inspection for Highway Project', created_at: '2025-06-29' }
    ];
  }
};

// ========== DASHBOARD API OBJECT ========== //

// Consolidated dashboard API object for easy importing
export const dashboardAPI = {
  // Main dashboard data
  getDashboard: getProjectManagerDashboard,
  getProjects: getMyProjects,
  getEvents: getUpcomingEvents,
  getTenders: getMyTenders,
  getStatistics: getDashboardStatistics,
  getTeamMembers: getTeamMembers,
  getProjectsProgress: getProjectsProgress,
  
  // Legacy compatibility
  getMyProjects: getMyProjects,
  getUpcomingEvents: getUpcomingEvents,
  getDashboardStats: getDashboardStats,
  getRecentActivity: getRecentActivity,
};

// Export default api for compatibility
export default api;