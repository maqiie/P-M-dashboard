import axios from "axios";
import { getToken } from "./tokenStorage";

console.log("🚀 API FILE LOADED - Complete Upgraded Version v2.0");

// Configuration
const API_BASE_URL = "https://p-m-backend.fly.dev";
// const API_BASE_URL = "http://127.0.0.1:3000";
const API_TIMEOUT = 30000; // 30 seconds
const RETRY_ATTEMPTS = 3;

// Create axios instances
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Enhanced request interceptor with retry logic
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
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = Math.random().toString(36).substring(7);
    
    console.log(`🚀 ${config.method.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data,
      params: config.params
    });
    
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with better error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`, {
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Retry logic for network errors
    if (!config || !config.retry) {
      config.retry = 0;
    }
    
    if (config.retry < RETRY_ATTEMPTS && (
      error.code === 'NETWORK_ERROR' || 
      error.code === 'TIMEOUT' ||
      (error.response && error.response.status >= 500)
    )) {
      config.retry++;
      console.log(`🔄 Retrying request (${config.retry}/${RETRY_ATTEMPTS}): ${config.method.toUpperCase()} ${config.url}`);
      return axiosInstance(config);
    }
    
    console.error("❌ API Error:", {
      method: error.config?.method,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    return Promise.reject(error);
  }
);

// Add interceptors for non-authenticated requests
api.interceptors.request.use((config) => {
  config.headers['X-Request-ID'] = Math.random().toString(36).substring(7);
  console.log(`🚀 [NO-AUTH] ${config.method.toUpperCase()} ${config.url}`, {
    headers: config.headers,
    data: config.data
  });
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`✅ [NO-AUTH] ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error("❌ [NO-AUTH] API Error:", error?.response || error.message);
    return Promise.reject(error);
  }
);


export const getProjectManagers = async () => {
  const response = await axios.get('/project_managers/list');
  return response.data;
};


// Utility functions
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

const apiRequest = async (endpoint, options = {}) => {
  try {
    const config = {
      url: endpoint,
      method: options.method || 'GET',
      ...options
    };
    
    if (options.body && typeof options.body === 'string') {
      config.data = JSON.parse(options.body);
    } else if (options.data) {
      config.data = options.data;
    }
    
    const response = await axiosInstance.request(config);
    return response.data;
  } catch (error) {
    console.error(`❌ API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Helper function to handle different response formats
const normalizeResponse = (response, arrayKey = null) => {
  if (!response) return [];
  
  // If response has the expected array key
  if (arrayKey && response[arrayKey]) {
    return Array.isArray(response[arrayKey]) ? response[arrayKey] : [];
  }
  
  // If response is already an array
  if (Array.isArray(response)) {
    return response;
  }
  
  // If response is an object with data
  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }
  
  // Return empty array as fallback
  return [];
};

// ========== AUTHENTICATION API ========== //
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/sign_in", { email, password });
      return response.data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  signup: async ({ name, email, password, password_confirmation }) => {
    try {
      const response = await api.post('/auth', {
        user: { name, email, password, password_confirmation }
      });
      return response.data;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  },

  verifyOtp: async (email, otp) => {
    try {
      console.log("🔐 Verifying OTP:", { email, otp });
      
      const response = await api.post("/auth/verify_otp", { email, otp });
      
      console.log("✅ OTP verification successful:", {
        status: response.status,
        data: response.data
      });
      
      // Extract token from multiple possible locations
      const token =
        response.headers["authorization"]?.split(" ")[1] ||
        response.headers["access-token"] ||
        response.data['access-token'] ||
        response.data.access_token ||
        response.data.accessToken ||
        response.data.token ||
        response.data.data?.access_token;
      
      if (!token) {
        console.error("❌ No token found in response");
        throw new Error("No authentication token received from server");
      }
      
      // Extract user data
      const userData = response.data.data || response.data.user || response.data;
      const role = userData?.admin ? 'admin' : 'user';
      
      return {
        message: response.data.message || "OTP verified successfully!",
        accessToken: token,
        bearerToken: `Bearer ${token}`,
        client: response.headers["client"] || response.data.client || "default-client",
        expiry: response.headers["expiry"] || response.data.expiry,
        uid: response.headers["uid"] || response.data.uid || userData?.uid || userData?.email,
        tokenType: response.headers["token-type"] || response.data.tokenType || "Bearer",
        role: role,
        user: userData
      };
    } catch (error) {
      console.error("❌ OTP verification failed:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      const errorMessage = 
        error.response?.data?.errors?.join(', ') ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        `OTP verification failed: ${error.response?.status} ${error.response?.statusText}`;
      
      throw new Error(errorMessage);
    }
  },

  resendOtp: async (email) => {
    try {
      const response = await api.post("/auth/resend_otp", { email });
      return response.data;
    } catch (error) {
      console.error("Resend OTP failed:", error);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/password", { email });
      return response.data;
    } catch (error) {
      console.error("Forgot password failed:", error);
      throw error;
    }
  },

  resetPassword: async (resetToken, password, passwordConfirmation) => {
    try {
      const response = await api.put("/auth/password", {
        reset_password_token: resetToken,
        password,
        password_confirmation: passwordConfirmation,
      });
      return response.data;
    } catch (error) {
      console.error("Reset password failed:", error);
      throw error;
    }
  },

  getUserDetails: async () => {
    try {
      const response = await axiosInstance.get("/auth/validate_token");
      return response.data;
    } catch (error) {
      console.error("Get user details failed:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await axiosInstance.delete("/auth/sign_out");
      return response.data;
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  },

  deleteAccount: async () => {
    try {
      const response = await axiosInstance.delete("/auth/delete_account");
      return response.data;
    } catch (error) {
      console.error("Delete account failed:", error);
      throw error;
    }
  },

  confirmEmail: async (confirmationToken) => {
    try {
      const response = await api.get(`/users/confirm_email?confirmation_token=${confirmationToken}`);
      return response.data;
    } catch (error) {
      console.error("Email confirmation failed:", error);
      throw error;
    }
  }
};

// ========== ENHANCED TENDERS API ========== //
export const tendersAPI = {
  // Get all tenders with advanced filtering
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add all possible filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          queryParams.append(key, value);
        }
      });
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/tenders?${queryString}` : '/tenders';
      
      const response = await axiosInstance.get(endpoint);
      console.log("📋 Tenders getAll response:", response.data);
      
      // Handle different response structures
      if (response.data.tenders) {
        return { 
          tenders: response.data.tenders, 
          total: response.data.total || response.data.tenders.length,
          status: 'success'
        };
      } else if (Array.isArray(response.data)) {
        return { 
          tenders: response.data, 
          total: response.data.length,
          status: 'success'
        };
      } else {
        return response.data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch tenders:", error);
      throw error;
    }
  },

  // Get user's tenders with fallback strategy
  getMy: async (filters = {}) => {
    try {
      console.log("📋 Getting my tenders...");
      
      let response;
      try {
        // Try project managers endpoint first
        response = await axiosInstance.get('/project_managers/my_tenders');
        console.log("✅ Project managers tenders endpoint success");
      } catch (pmError) {
        console.warn("⚠️ Project managers endpoint failed, trying /tenders:", pmError.message);
        // Fallback to regular tenders endpoint
        response = await axiosInstance.get('/tenders');
        console.log("✅ Regular tenders endpoint success");
      }
      
      // Handle different response formats
      const tenders = normalizeResponse(response.data, 'tenders');
      console.log(`📋 Retrieved ${tenders.length} tenders`);
      
      return tenders;
    } catch (error) {
      console.error("❌ Failed to fetch my tenders:", error);
      throw error;
    }
  },

  // Get tenders by status with smart fallback
  getByStatus: async (status) => {
    try {
      console.log(`📋 Getting tenders by status: ${status}`);
      
      let response;
      try {
        // Try specific status endpoint
        response = await axiosInstance.get(`/tenders/${status}`);
        const tenders = normalizeResponse(response.data, 'tenders');
        console.log(`✅ Status endpoint success: ${tenders.length} tenders`);
        return tenders;
      } catch (statusError) {
        console.warn(`⚠️ Status endpoint failed, trying filtered approach:`, statusError.message);
        
        // Fallback to filtered request
        try {
          const result = await tendersAPI.getAll({ status });
          return result.tenders || [];
        } catch (filteredError) {
          console.warn("⚠️ Filtered approach failed, trying client-side filtering");
          
          // Final fallback: get all and filter client-side
          const allTenders = await tendersAPI.getMy();
          return allTenders.filter(tender => tender.status === status);
        }
      }
    } catch (error) {
      console.error(`❌ Failed to fetch tenders by status ${status}:`, error);
      throw error;
    }
  },

  // Get specific tender
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/tenders/${id}`);
      return response.data.tender || response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch tender ${id}:`, error);
      throw error;
    }
  },

  // Create tender
  create: async (tenderData) => {
    try {
      console.log("📋 Creating tender:", tenderData);
      const response = await axiosInstance.post('/tenders', { tender: tenderData });
      const tender = response.data.tender || response.data;
      console.log("✅ Tender created successfully:", tender);
      return tender;
    } catch (error) {
      console.error("❌ Failed to create tender:", error);
      throw error;
    }
  },

  // Update tender
  update: async (id, tenderData) => {
    try {
      console.log(`📋 Updating tender ${id}:`, tenderData);
      const response = await axiosInstance.put(`/tenders/${id}`, { tender: tenderData });
      const tender = response.data.tender || response.data;
      console.log("✅ Tender updated successfully:", tender);
      return tender;
    } catch (error) {
      console.error(`❌ Failed to update tender ${id}:`, error);
      throw error;
    }
  },

  // Delete tender
  delete: async (id) => {
    try {
      console.log(`📋 Deleting tender ${id}`);
      const response = await axiosInstance.delete(`/tenders/${id}`);
      console.log("✅ Tender deleted successfully");
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to delete tender ${id}:`, error);
      throw error;
    }
  },

  // Convert tender to project
convertToProject: async (id, projectData = {}) => {
  try {
    console.log(`📋 Converting tender ${id} to project`, projectData);
    const response = await axiosInstance.post(`/tenders/${id}/convert_to_project`, projectData);
    console.log("✅ Tender converted to project successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to convert tender ${id} to project:`, error);
    throw error;
  }
},

  // Update tender status
  updateStatus: async (id, status) => {
    try {
      console.log(`📋 Updating tender ${id} status to: ${status}`);
      const response = await axiosInstance.patch(`/tenders/${id}/update_status`, { status });
      const tender = response.data.tender || response.data;
      console.log("✅ Tender status updated successfully");
      return tender;
    } catch (error) {
      console.error(`❌ Failed to update tender ${id} status:`, error);
      throw error;
    }
  },

  // Get tender details
  getDetails: async (id) => {
    try {
      const response = await axiosInstance.get(`/tenders/${id}/details`);
      return response.data.tender || response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch tender ${id} details:`, error);
      throw error;
    }
  },

  // Get tender statistics
  getStatistics: async () => {
    try {
      // Try server endpoint first
      try {
        const response = await axiosInstance.get('/tenders/statistics');
        return response.data;
      } catch (serverError) {
        console.warn("⚠️ Server statistics not available, calculating client-side");
        
        // Fallback to client-side calculation
        const allTenders = await tendersAPI.getMy();
        const today = new Date();
        
        const stats = {
          total: allTenders.length,
          active: allTenders.filter(t => t.status === 'active').length,
          draft: allTenders.filter(t => t.status === 'draft').length,
          completed: allTenders.filter(t => t.status === 'completed').length,
          rejected: allTenders.filter(t => t.status === 'rejected').length,
          converted: allTenders.filter(t => t.status === 'converted').length,
          urgent: allTenders.filter(t => {
            if (!t.deadline) return false;
            const deadline = new Date(t.deadline);
            const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
            return daysUntil <= 3 && daysUntil >= 0;
          }).length,
          expired: allTenders.filter(t => {
            if (!t.deadline) return false;
            return new Date(t.deadline) < today;
          }).length,
          totalValue: allTenders.reduce((sum, t) => sum + (t.budget_estimate || 0), 0),
          avgSubmissions: allTenders.length > 0 ? 
            allTenders.reduce((sum, t) => sum + (t.submission_count || 0), 0) / allTenders.length : 0
        };
        
        return { statistics: stats };
      }
    } catch (error) {
      console.error("❌ Failed to get tender statistics:", error);
      throw error;
    }
  },

  // Convenience methods
  getActive: async () => tendersAPI.getByStatus('active'),
  getDrafts: async () => tendersAPI.getByStatus('draft'),
  getCompleted: async () => tendersAPI.getByStatus('completed'),
  getUrgent: async () => tendersAPI.getByStatus('urgent'),
  
  // Search tenders
  search: async (query, filters = {}) => {
    try {
      return await tendersAPI.getAll({ ...filters, search: query });
    } catch (error) {
      console.error("❌ Failed to search tenders:", error);
      throw error;
    }
  }
};

// ========== PROJECT MANAGER DASHBOARD API ========== //
export const projectManagerAPI = {
  getDashboard: async () => {
    try {
      const response = await axiosInstance.get('/project_managers/dashboard');
      console.log("📊 Dashboard data loaded:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch dashboard:", error);
      throw error;
    }
  },

  getMyProjects: async () => {
    try {
      const response = await axiosInstance.get('/project_managers/my_projects');
      return response.data;
    } catch (error) {
      console.warn("⚠️ Project managers projects endpoint failed, trying fallback");
      try {
        const fallbackResponse = await axiosInstance.get('/projects');
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error("❌ Both project endpoints failed:", fallbackError);
        throw error;
      }
    }
  },

  getUpcomingEvents: async (limit = 10) => {
    try {
      const response = await axiosInstance.get(`/project_managers/upcoming_events?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch upcoming events:", error);
      throw error;
    }
  },

  getMyTenders: async () => {
    return await tendersAPI.getMy();
  },

  getStatistics: async () => {
    try {
      const response = await axiosInstance.get('/project_managers/statistics');
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch statistics:", error);
      throw error;
    }
  },
  

  getTeamMembers: async () => {
    try {
      const response = await axiosInstance.get('/project_managers/team_members');
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch team members:", error);
      throw error;
    }
  },

  getProjectsProgress: async () => {
    try {
      const response = await axiosInstance.get('/project_managers/projects_progress');
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch projects progress:", error);
      throw error;
    }
  }
};

// ========== PROJECTS API ========== //
export const projectsAPI = {
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          queryParams.append(key, value);
        }
      });
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/projects?${queryString}` : '/projects';
      
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch projects:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch project ${id}:`, error);
      throw error;
    }
  },

  create: async (projectData) => {
    try {
      const response = await axiosInstance.post('/projects', { project: projectData });
      return response.data;
    } catch (error) {
      console.error("❌ Failed to create project:", error);
      throw error;
    }
  },

  update: async (id, projectData) => {
    try {
      const response = await axiosInstance.put(`/projects/${id}`, { project: projectData });
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to update project ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to delete project ${id}:`, error);
      throw error;
    }
  },

  getProgress: async (id) => {
    try {
      const response = await axiosInstance.get(`/projects/${id}/progress`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch progress for project ${id}:`, error);
      throw error;
    }
  },

  updateProgress: async (id, progressData) => {
    try {
      const response = await axiosInstance.patch(`/projects/${id}/update_progress`, progressData);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to update progress for project ${id}:`, error);
      throw error;
    }
  },

  getTeam: async (id) => {
    try {
      const response = await axiosInstance.get(`/projects/${id}/team`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch team for project ${id}:`, error);
      throw error;
    }
  },

  getTimeline: async (id) => {
    try {
      const response = await axiosInstance.get(`/projects/${id}/timeline`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch timeline for project ${id}:`, error);
      throw error;
    }
  },

  getChartData: async () => {
    try {
      const response = await axiosInstance.get('/projects/chart_data');
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch project chart data:", error);
      throw error;
    }
  },

  getActive: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/projects/active?${queryParams}` : '/projects/active';
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch active projects:", error);
      throw error;
    }
  },

  getCompleted: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/projects/completed?${queryParams}` : '/projects/completed';
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch completed projects:", error);
      throw error;
    }
  },
  // Inside projectsAPI
markAsCompleted: async (id) => {
  try {
    const response = await axiosInstance.patch(`/projects/${id}/mark_as_completed`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to mark project ${id} as completed:`, error);
    throw error;
  }
},

};

// ========== EVENTS API ========== //
export const eventsAPI = {
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/events?${queryParams}` : '/events';
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch events:", error);
      throw error;
    }
  },

  getMy: async () => {
    try {
      const response = await axiosInstance.get('/events/my_events');
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch my events:", error);
      throw error;
    }
  },

  getThisWeek: async () => {
    try {
      const response = await axiosInstance.get('/events/this_week');
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch this week events:", error);
      throw error;
    }
  },

  getUpcoming: async (limit = 10) => {
    try {
      const response = await axiosInstance.get(`/events/upcoming?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch upcoming events:", error);
      throw error;
    }
  },

  create: async (eventData) => {
    try {
      const response = await axiosInstance.post('/events', { event: eventData });
      return response.data;
    } catch (error) {
      console.error("❌ Failed to create event:", error);
      throw error;
    }
  },

  update: async (id, eventData) => {
    try {
      const response = await axiosInstance.put(`/events/${id}`, { event: eventData });
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to update event ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to delete event ${id}:`, error);
      throw error;
    }
  },

  markCompleted: async (id) => {
    try {
      const response = await axiosInstance.patch(`/events/${id}/mark_completed`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to mark event ${id} as completed:`, error);
      throw error;
    }
  },

  reschedule: async (id, newDate) => {
    try {
      const response = await axiosInstance.patch(`/events/${id}/reschedule`, { date: newDate });
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to reschedule event ${id}:`, error);
      throw error;
    }
  }
};

// ========== COMPREHENSIVE TASKS API ========== //
export const tasksAPI = {
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
      
      const response = await axiosInstance.get(endpoint);
      const responseData = response.data;
      
      if (responseData.tasks) {
        return responseData;
      } else if (Array.isArray(responseData)) {
        return { tasks: responseData };
      } else {
        return responseData;
      }
    } catch (error) {
      console.error("❌ Failed to fetch tasks:", error);
      throw error;
    }
  },

  getAllForProjectManager: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/project_managers/tasks?${queryParams}` : '/project_managers/tasks';
      
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch project manager tasks:", error);
      // Fallback to regular tasks endpoint
      return await tasksAPI.getAll(filters);
    }
  },

  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch task ${id}:`, error);
      throw error;
    }
  },

  create: async (taskData) => {
    try {
      const response = await axiosInstance.post('/tasks', {
        task: {
          title: taskData.title,
          description: taskData.description,
          due_date: taskData.due_date,
          start_date: taskData.start_date,
          status: taskData.status || 'pending',
          priority: taskData.priority || 'medium',
          estimated_hours: taskData.estimated_hours,
          project_id: taskData.project_id,
          assignee_ids: taskData.assignee_ids || [],
          watcher_ids: taskData.watcher_ids || [],
          tags: taskData.tags || [],
          custom_fields: taskData.custom_fields || {}
        }
      });
      return response.data;
    } catch (error) {
      console.error("❌ Failed to create task:", error);
      throw error;
    }
  },

  createWithCustomFields: async (taskData, customFields) => {
    try {
      const response = await axiosInstance.post('/tasks', {
        task: {
          ...taskData,
          custom_fields: customFields
        }
      });
      return response.data;
    } catch (error) {
      console.error("❌ Failed to create task with custom fields:", error);
      throw error;
    }
  },

  update: async (id, taskData) => {
    try {
      const response = await axiosInstance.put(`/tasks/${id}`, {
        task: {
          title: taskData.title,
          description: taskData.description,
          due_date: taskData.due_date,
          start_date: taskData.start_date,
          status: taskData.status,
          priority: taskData.priority,
          estimated_hours: taskData.estimated_hours,
          project_id: taskData.project_id,
          assignee_ids: taskData.assignee_ids,
          watcher_ids: taskData.watcher_ids,
          tags: taskData.tags,
          custom_fields: taskData.custom_fields
        }
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to update task ${id}:`, error);
      throw error;
    }
  },

  partialUpdate: async (id, updates) => {
    try {
      const response = await axiosInstance.patch(`/tasks/${id}`, {
        task: updates
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to partial update task ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to delete task ${id}:`, error);
      throw error;
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await axiosInstance.patch(`/tasks/${id}`, {
        task: { status: status }
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to update task ${id} status:`, error);
      throw error;
    }
  },

  updatePriority: async (id, priority) => {
    try {
      const response = await axiosInstance.patch(`/tasks/${id}`, {
        task: { priority: priority }
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to update task ${id} priority:`, error);
      throw error;
    }
  },

  assign: async (id, assigneeIds) => {
    try {
      const response = await axiosInstance.patch(`/tasks/${id}/assign`, {
        assignee_ids: assigneeIds
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to assign task ${id}:`, error);
      throw error;
    }
  },

  addWatchers: async (id, watcherIds) => {
    try {
      const response = await axiosInstance.patch(`/tasks/${id}/add_watchers`, {
        watcher_ids: watcherIds
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to add watchers to task ${id}:`, error);
      throw error;
    }
  },

  getByStatus: async (status) => {
    try {
      return await tasksAPI.getAll({ status: status });
    } catch (error) {
      console.error(`❌ Failed to fetch tasks by status ${status}:`, error);
      try {
        const allTasks = await tasksAPI.getAll();
        const tasks = allTasks.tasks || allTasks;
        return { tasks: tasks.filter(task => task.status === status) };
      } catch (fallbackError) {
        throw error;
      }
    }
  },

  getOverdue: async () => {
    try {
      return await tasksAPI.getAll({ filter: 'overdue' });
    } catch (error) {
      console.error("❌ Failed to fetch overdue tasks:", error);
      try {
        const allTasks = await tasksAPI.getAll();
        const tasks = allTasks.tasks || allTasks;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const overdueTasks = tasks.filter(task => {
          const dueDate = new Date(task.due_date);
          return dueDate < today && !['completed', 'cancelled'].includes(task.status);
        });
        
        return { tasks: overdueTasks };
      } catch (fallbackError) {
        throw error;
      }
    }
  },

  getDueToday: async () => {
    try {
      return await tasksAPI.getAll({ filter: 'due_today' });
    } catch (error) {
      console.error("❌ Failed to fetch tasks due today:", error);
      try {
        const allTasks = await tasksAPI.getAll();
        const tasks = allTasks.tasks || allTasks;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dueTodayTasks = tasks.filter(task => {
          const dueDate = new Date(task.due_date);
          return dueDate >= today && dueDate < tomorrow;
        });
        
        return { tasks: dueTodayTasks };
      } catch (fallbackError) {
        throw error;
      }
    }
  },

  getActive: async () => {
    try {
      return await tasksAPI.getAll({ filter: 'active' });
    } catch (error) {
      console.error("❌ Failed to fetch active tasks:", error);
      try {
        const allTasks = await tasksAPI.getAll();
        const tasks = allTasks.tasks || allTasks;
        
        const activeTasks = tasks.filter(task => 
          !['completed', 'cancelled'].includes(task.status)
        );
        
        return { tasks: activeTasks };
      } catch (fallbackError) {
        throw error;
      }
    }
  },

  getCompleted: async () => {
    try {
      return await tasksAPI.getByStatus('completed');
    } catch (error) {
      console.error("❌ Failed to fetch completed tasks:", error);
      throw error;
    }
  },

  getStatistics: async () => {
    try {
      const response = await axiosInstance.get('/tasks/statistics');
      return response.data;
    } catch (error) {
      console.warn("⚠️ Statistics endpoint not available, calculating from tasks");
      
      try {
        const allTasks = await tasksAPI.getAll();
        const tasks = allTasks.tasks || allTasks;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const stats = {
          total: tasks.length,
          completed: tasks.filter(t => t.status === 'completed').length,
          pending: tasks.filter(t => t.status === 'pending').length,
          in_progress: tasks.filter(t => t.status === 'in_progress').length,
          in_review: tasks.filter(t => t.status === 'in_review').length,
          cancelled: tasks.filter(t => t.status === 'cancelled').length,
          on_hold: tasks.filter(t => t.status === 'on_hold').length,
          overdue: tasks.filter(t => {
            const dueDate = new Date(t.due_date);
            return dueDate < today && !['completed', 'cancelled'].includes(t.status);
          }).length,
          due_today: tasks.filter(t => {
            const dueDate = new Date(t.due_date);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return dueDate >= today && dueDate < tomorrow;
          }).length,
          high_priority: tasks.filter(t => ['high', 'urgent'].includes(t.priority)).length,
          unassigned: tasks.filter(t => !t.assignees || t.assignees.length === 0).length
        };
        
        return { statistics: stats };
      } catch (fallbackError) {
        throw error;
      }
    }
  },

  getStats: async () => {
    const result = await tasksAPI.getStatistics();
    return result.statistics || result;
  },

  // Time tracking
  logTime: async (taskId, timeEntry) => {
    try {
      const response = await axiosInstance.post(`/tasks/${taskId}/time_entries`, {
        time_entry: {
          hours: timeEntry.hours,
          description: timeEntry.description,
          billable: timeEntry.billable || false,
          date: timeEntry.date || new Date().toISOString().split('T')[0]
        }
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to log time for task ${taskId}:`, error);
      throw error;
    }
  },

  getTimeEntries: async (taskId) => {
    try {
      const response = await axiosInstance.get(`/tasks/${taskId}/time_entries`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch time entries for task ${taskId}:`, error);
      throw error;
    }
  },

  startTimer: async (taskId) => {
    try {
      const response = await axiosInstance.post(`/tasks/${taskId}/start_timer`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to start timer for task ${taskId}:`, error);
      throw error;
    }
  },

  stopTimer: async (taskId) => {
    try {
      const response = await axiosInstance.post(`/tasks/${taskId}/stop_timer`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to stop timer for task ${taskId}:`, error);
      throw error;
    }
  },

  getActiveTimer: async () => {
    try {
      const response = await axiosInstance.get('/tasks/active_timer');
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch active timer:", error);
      throw error;
    }
  },

  // Comments
  getComments: async (taskId) => {
    try {
      const response = await axiosInstance.get(`/tasks/${taskId}/comments`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch comments for task ${taskId}:`, error);
      throw error;
    }
  },

  addComment: async (taskId, comment) => {
    try {
      const response = await axiosInstance.post(`/tasks/${taskId}/comments`, {
        comment: {
          content: comment.content,
          parent_id: comment.parent_id || null
        }
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to add comment to task ${taskId}:`, error);
      throw error;
    }
  },

  // Attachments
  getAttachments: async (taskId) => {
    try {
      const response = await axiosInstance.get(`/tasks/${taskId}/attachments`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch attachments for task ${taskId}:`, error);
      throw error;
    }
  },

  uploadAttachment: async (taskId, file, description = '') => {
    try {
      const formData = new FormData();
      formData.append('attachment[file]', file);
      formData.append('attachment[description]', description);
      const response = await axiosInstance.post(`/tasks/${taskId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to upload attachment to task ${taskId}:`, error);
      throw error;
    }
  },

  // Additional task operations
  duplicate: async (taskId) => {
    try {
      const response = await axiosInstance.post(`/tasks/${taskId}/duplicate`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to duplicate task ${taskId}:`, error);
      throw error;
    }
  },

  archive: async (taskId) => {
    try {
      const response = await axiosInstance.patch(`/tasks/${taskId}/archive`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to archive task ${taskId}:`, error);
      throw error;
    }
  },

  unarchive: async (taskId) => {
    try {
      const response = await axiosInstance.patch(`/tasks/${taskId}/unarchive`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to unarchive task ${taskId}:`, error);
      throw error;
    }
  },

  star: async (taskId) => {
    try {
      const response = await axiosInstance.patch(`/tasks/${taskId}/star`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to star task ${taskId}:`, error);
      throw error;
    }
  },

  unstar: async (taskId) => {
    try {
      const response = await axiosInstance.patch(`/tasks/${taskId}/unstar`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to unstar task ${taskId}:`, error);
      throw error;
    }
  },

  // Bulk operations
  bulkUpdate: async (taskIds, updates) => {
    try {
      const response = await axiosInstance.patch('/tasks/bulk_update', {
        task_ids: taskIds,
        updates: updates
      });
      return response.data;
    } catch (error) {
      console.error("❌ Failed to bulk update tasks:", error);
      throw error;
    }
  },

  bulkDelete: async (taskIds) => {
    try {
      const response = await axiosInstance.delete('/tasks/bulk_delete', {
        data: { task_ids: taskIds }
      });
      return response.data;
    } catch (error) {
      console.error("❌ Failed to bulk delete tasks:", error);
      throw error;
    }
  },

  // Projects sub-API for tasks interface
  projects: {
    getAll: async () => {
      try {
        const response = await axiosInstance.get('/projects');
        return response.data;
      } catch (error) {
        console.error("❌ Failed to fetch projects for tasks:", error);
        throw error;
      }
    },
    getById: async (id) => {
      try {
        const response = await axiosInstance.get(`/projects/${id}`);
        return response.data;
      } catch (error) {
        console.error(`❌ Failed to fetch project ${id}:`, error);
        throw error;
      }
    }
  },

  // Search and filtering
  search: async (query, filters = {}) => {
    try {
      const searchFilters = { ...filters, search: query };
      return await tasksAPI.getAll(searchFilters);
    } catch (error) {
      console.error("❌ Failed to search tasks:", error);
      throw error;
    }
  },

  // Export tasks
  export: async (format = 'csv', filters = {}) => {
    try {
      const queryParams = new URLSearchParams({ ...filters, format }).toString();
      const response = await axiosInstance.get(`/tasks/export?${queryParams}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error("❌ Failed to export tasks:", error);
      throw error;
    }
  },

  // Get task history/audit log
  getHistory: async (taskId) => {
    try {
      const response = await axiosInstance.get(`/tasks/${taskId}/history`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch history for task ${taskId}:`, error);
      throw error;
    }
  }
};

// ========== TEAM MANAGEMENT API ========== //
export const supervisorsAPI = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/supervisors');
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch supervisors:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/supervisors/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch supervisor ${id}:`, error);
      throw error;
    }
  },

  create: async (supervisorData) => {
    try {
      const response = await axiosInstance.post('/supervisors', { supervisor: supervisorData });
      return response.data;
    } catch (error) {
      console.error("❌ Failed to create supervisor:", error);
      throw error;
    }
  },

  update: async (id, supervisorData) => {
    try {
      const response = await axiosInstance.put(`/supervisors/${id}`, { supervisor: supervisorData });
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to update supervisor ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/supervisors/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to delete supervisor ${id}:`, error);
      throw error;
    }
  },

  getWorkload: async () => {
    try {
      const response = await axiosInstance.get('/supervisors/workload');
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch supervisor workload:", error);
      throw error;
    }
  },

  getProjects: async (id) => {
    try {
      const response = await axiosInstance.get(`/supervisors/${id}/projects`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch projects for supervisor ${id}:`, error);
      throw error;
    }
  },

  getPerformance: async (id) => {
    try {
      const response = await axiosInstance.get(`/supervisors/${id}/performance`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch performance for supervisor ${id}:`, error);
      throw error;
    }
  }
};

export const siteManagersAPI = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/site_managers');
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch site managers:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/site_managers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch site manager ${id}:`, error);
      throw error;
    }
  },

  create: async (siteManagerData) => {
    try {
      const response = await axiosInstance.post('/site_managers', { site_manager: siteManagerData });
      return response.data;
    } catch (error) {
      console.error("❌ Failed to create site manager:", error);
      throw error;
    }
  },

  update: async (id, siteManagerData) => {
    try {
      const response = await axiosInstance.put(`/site_managers/${id}`, { site_manager: siteManagerData });
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to update site manager ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/site_managers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to delete site manager ${id}:`, error);
      throw error;
    }
  }
};

export const teamAPI = {
  getAllTeamMembers: async () => {
    try {
      const [supervisors, siteManagers] = await Promise.all([
        supervisorsAPI.getAll(),
        siteManagersAPI.getAll()
      ]);
      
      const normalizedSupervisors = supervisors.map(supervisor => ({
        ...supervisor,
        role: 'Supervisor',
        roleType: 'supervisor',
        department: 'Operations'
      }));
      
      const normalizedSiteManagers = siteManagers.map(manager => ({
        ...manager,
        role: 'Site Manager',
        roleType: 'site_manager',
        department: 'Site Management'
      }));
      
      return [...normalizedSupervisors, ...normalizedSiteManagers];
    } catch (error) {
      console.error("❌ Failed to fetch team members:", error);
      throw error;
    }
  },

  getTeamStats: async () => {
    try {
      const teamMembers = await teamAPI.getAllTeamMembers();
      
      return {
        totalMembers: teamMembers.length,
        supervisors: teamMembers.filter(m => m.roleType === 'supervisor').length,
        siteManagers: teamMembers.filter(m => m.roleType === 'site_manager').length,
        available: teamMembers.filter(m => m.availability === 'available').length,
        busy: teamMembers.filter(m => m.availability === 'busy').length,
        onVacation: teamMembers.filter(m => m.availability === 'vacation').length,
        avgExperience: teamMembers.length > 0 ? 
          teamMembers.reduce((sum, m) => sum + (m.experience_years || 0), 0) / teamMembers.length : 0
      };
    } catch (error) {
      console.error("❌ Failed to calculate team stats:", error);
      throw error;
    }
  }
};

// ========== TEAM MEMBERS API ========== //
export const teamMembersAPI = {
  getAll: async () => {
    try {
      // First try the project managers team endpoint
      const response = await axiosInstance.get('/project_managers/team_members');
      return response.data;
    } catch (error) {
      console.warn("⚠️ Failed to fetch from /project_managers/team_members, using combined approach");
      // Fallback to your existing teamAPI.getAllTeamMembers
      try {
        const teamMembers = await teamAPI.getAllTeamMembers();
        return { team_members: teamMembers };
      } catch (fallbackError) {
        console.error("❌ Failed to fetch team members:", fallbackError);
        // Return empty structure if all fails
        return { team_members: [] };
      }
    }
  },

  getById: async (id) => {
    try {
      // Try supervisors first
      try {
        const supervisor = await supervisorsAPI.getById(id);
        return { ...supervisor, role: 'Supervisor', roleType: 'supervisor' };
      } catch (supervisorError) {
        // Try site managers
        const siteManager = await siteManagersAPI.getById(id);
        return { ...siteManager, role: 'Site Manager', roleType: 'site_manager' };
      }
    } catch (error) {
      console.error(`❌ Failed to fetch team member ${id}:`, error);
      throw error;
    }
  },

  create: async (memberData) => {
    try {
      if (memberData.role === 'supervisor' || memberData.roleType === 'supervisor') {
        return await supervisorsAPI.create(memberData);
      } else if (memberData.role === 'site_manager' || memberData.roleType === 'site_manager') {
        return await siteManagersAPI.create(memberData);
      } else {
        throw new Error('Invalid role type. Must be supervisor or site_manager');
      }
    } catch (error) {
      console.error("❌ Failed to create team member:", error);
      throw error;
    }
  },

  update: async (id, memberData) => {
    try {
      if (memberData.role === 'supervisor' || memberData.roleType === 'supervisor') {
        return await supervisorsAPI.update(id, memberData);
      } else if (memberData.role === 'site_manager' || memberData.roleType === 'site_manager') {
        return await siteManagersAPI.update(id, memberData);
      } else {
        // Try to determine type by fetching the member first
        const member = await teamMembersAPI.getById(id);
        if (member.roleType === 'supervisor') {
          return await supervisorsAPI.update(id, memberData);
        } else {
          return await siteManagersAPI.update(id, memberData);
        }
      }
    } catch (error) {
      console.error(`❌ Failed to update team member ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      // Try to determine type by fetching the member first
      const member = await teamMembersAPI.getById(id);
      if (member.roleType === 'supervisor') {
        return await supervisorsAPI.delete(id);
      } else {
        return await siteManagersAPI.delete(id);
      }
    } catch (error) {
      console.error(`❌ Failed to delete team member ${id}:`, error);
      throw error;
    }
  }
};

// ========== CUSTOM FIELDS API ========== //
export const customFieldsAPI = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/custom_fields');
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch custom fields:", error);
      // Return empty structure if endpoint doesn't exist yet
      return { custom_fields: [] };
    }
  },

  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/custom_fields/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch custom field ${id}:`, error);
      throw error;
    }
  },

  create: async (fieldData) => {
    try {
      const response = await axiosInstance.post('/custom_fields', {
        custom_field: fieldData
      });
      return response.data;
    } catch (error) {
      console.error("❌ Failed to create custom field:", error);
      throw error;
    }
  },

  update: async (id, fieldData) => {
    try {
      const response = await axiosInstance.put(`/custom_fields/${id}`, {
        custom_field: fieldData
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to update custom field ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/custom_fields/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to delete custom field ${id}:`, error);
      throw error;
    }
  },

  getByEntityType: async (entityType) => {
    try {
      const response = await axiosInstance.get(`/custom_fields?entity_type=${entityType}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch custom fields for ${entityType}:`, error);
      return { custom_fields: [] };
    }
  }
};

// ========== NOTIFICATIONS API ========== //
export const notificationsAPI = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/notifications');
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch notifications:", error);
      throw error;
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await axiosInstance.get('/notifications/unread_count');
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch unread notification count:", error);
      throw error;
    }
  },

  markRead: async (id) => {
    try {
      const response = await axiosInstance.patch(`/notifications/${id}/mark_read`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to mark notification ${id} as read:`, error);
      throw error;
    }
  },

  markAllRead: async () => {
    try {
      const response = await axiosInstance.patch('/notifications/mark_all_read');
      return response.data;
    } catch (error) {
      console.error("❌ Failed to mark all notifications as read:", error);
      throw error;
    }
  }
};

// ========== SEARCH API ========== //
export const searchAPI = {
  projects: async (query) => {
    try {
      const response = await axiosInstance.get(`/search/projects?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to search projects:", error);
      throw error;
    }
  },

  events: async (query) => {
    try {
      const response = await axiosInstance.get(`/search/events?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to search events:", error);
      throw error;
    }
  },

  tenders: async (query) => {
    try {
      const response = await axiosInstance.get(`/search/tenders?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to search tenders:", error);
      throw error;
    }
  },

  global: async (query) => {
    try {
      const response = await axiosInstance.get(`/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to perform global search:", error);
      throw error;
    }
  }
};

// ========== CALENDAR API ========== //
export const calendarAPI = {
  getEvents: async (startDate = null, endDate = null) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const queryString = params.toString();
      const endpoint = queryString ? `/calendar/events?${queryString}` : '/calendar/events';
      
      const response = await axiosInstance.get(endpoint);
      return response.data.events || [];
    } catch (error) {
      console.error("❌ Failed to fetch calendar events:", error);
      throw error;
    }
  },

  getMonthEvents: async (year, month) => {
    try {
      const response = await axiosInstance.get(`/calendar/month/${year}/${month}`);
      return response.data.events || [];
    } catch (error) {
      console.error(`❌ Failed to fetch events for ${year}-${month}:`, error);
      throw error;
    }
  },

  getTodayEvents: async () => {
    try {
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      return await calendarAPI.getEvents(startDate, startDate);
    } catch (error) {
      console.error("❌ Failed to fetch today events:", error);
      throw error;
    }
  },

  getUpcomingEvents: async () => {
    try {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const startDate = today.toISOString().split('T')[0];
      const endDate = nextWeek.toISOString().split('T')[0];
      
      return await calendarAPI.getEvents(startDate, endDate);
    } catch (error) {
      console.error("❌ Failed to fetch upcoming events:", error);
      throw error;
    }
  }
};

// ========== CONSOLIDATED DASHBOARD API ========== //
export const dashboardAPI = {
  // Main dashboard functions
  getDashboard: projectManagerAPI.getDashboard,
  getProjects: projectManagerAPI.getMyProjects,
  getEvents: projectManagerAPI.getUpcomingEvents,
  getTenders: tendersAPI.getMy,
  getStatistics: projectManagerAPI.getStatistics,
  getTeamMembers: projectManagerAPI.getTeamMembers,
  getProjectsProgress: projectManagerAPI.getProjectsProgress,
  
  // Enhanced with fallbacks
  getDashboardStats: async () => {
    try {
      return await projectManagerAPI.getStatistics();
    } catch (error) {
      console.warn("⚠️ Failed to fetch dashboard stats, using fallback");
      return {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        activeTenders: 0,
        upcomingEvents: 0
      };
    }
  },

  getRecentActivity: async (limit = 10) => {
    try {
      const response = await axiosInstance.get(`/api/v1/dashboard/recent_activities?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.warn("⚠️ Recent activity endpoint not available");
      return [];
    }
  },

  // Legacy compatibility
  getMyProjects: projectManagerAPI.getMyProjects,
  getUpcomingEvents: projectManagerAPI.getUpcomingEvents,

  // Sub-APIs
  tenders: tendersAPI,
  projects: projectsAPI,
  events: eventsAPI,
  tasks: tasksAPI,
  team: teamAPI,
  notifications: notificationsAPI,
  search: searchAPI,
  calendar: calendarAPI
};

// ========== ENHANCED DASHBOARD API ========== //
export const enhancedDashboardAPI = {
  ...dashboardAPI,
  supervisors: supervisorsAPI,
  siteManagers: siteManagersAPI,
  customFields: customFieldsAPI,
  teamMembers: teamMembersAPI,
  
  getTeamMembers: async () => {
    try {
      const response = await axiosInstance.get('/project_managers/team_members');
      return response.data;
    } catch (error) {
      console.warn("⚠️ Failed to fetch from /project_managers/team_members, using combined approach");
      return await teamAPI.getAllTeamMembers();
    }
  }
};





// =======project manger fetchinhg=-=========//
export const fetchProjectManagers = async () => {
  try {
    console.log("🔄 Fetching project managers from:", `${API_BASE_URL}/project_managers/list`);
    const response = await axiosInstance.get('/project_managers/list');
    console.log("✅ Project managers fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch project managers:", error);
    // Return empty array instead of throwing to prevent dashboard crash
    return [];
  }
};
// ==========Activities============//

// Fetch paginated & filtered activities list
export const fetchActivities = async (params = {}) => {
  // params can include: limit, type, page, etc.
  try {
    const response = await axiosInstance.get('/activities', { params });
    return response.data; // expected: { activities: [...], pagination: {...} }
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    throw error;
  }
};

// Fetch single activity by ID
export const fetchActivityById = async (id) => {
  try {
    const response = await axiosInstance.get(`/activities/${id}`);
    return response.data; // expected: { activity: {...} }
  } catch (error) {
    console.error(`Failed to fetch activity ${id}:`, error);
    throw error;
  }
};

// Fetch activity stats (optional, if you implement stats route)
export const fetchActivityStats = async () => {
  try {
    const response = await axiosInstance.get('/activities/stats');
    return response.data; // expected: { stats: {...} }
  } catch (error) {
    console.error("Failed to fetch activity stats:", error);
    throw error;
  }
};

// Fetch recent activities (optional, if you implement recent route)
export const fetchRecentActivities = async (limit = 10) => {
  try {
    const response = await axiosInstance.get('/activities/recent', { params: { limit } });
    return response.data; // expected: { activities: [...] }
  } catch (error) {
    console.error("Failed to fetch recent activities:", error);
    throw error;
  }
};



// ========== MEETINGS API ========== //
export const meetingsAPI = {
  getAll: (params = {}) => axiosInstance.get('/meetings', { params }),
  getById: (id) => axiosInstance.get(`/meetings/${id}`),
  create: (data) => axiosInstance.post('/meetings', { meeting: data }),
  update: (id, data) => axiosInstance.put(`/meetings/${id}`, { meeting: data }),
  delete: (id) => axiosInstance.delete(`/meetings/${id}`),
  respond: (id, response) => axiosInstance.post(`/meetings/${id}/respond`, { response })
};


// ========== REPORTS API ========== //
export const reportsAPI = {
  getOverview: (startDate, endDate) =>
    axiosInstance.get('/reports/overview', {
      params: { start_date: startDate, end_date: endDate }
    }),

  getProjects: (startDate, endDate) =>
    axiosInstance.get('/reports/projects', {
      params: { start_date: startDate, end_date: endDate }
    }),

  getTasks: (startDate, endDate) =>
    axiosInstance.get('/reports/tasks', {
      params: { start_date: startDate, end_date: endDate }
    }),

  getUsers: (startDate, endDate) =>
    axiosInstance.get('/reports/users', {
      params: { start_date: startDate, end_date: endDate }
    })
};


// ========== HISTORY API ========== //
export const historyAPI = {
  getAll: () => axiosInstance.get('/history'),
  
  getTimeline: (startDate, endDate) =>
    axiosInstance.get('/history/timeline', {
      params: { start_date: startDate, end_date: endDate }
    })
};


// ========== USERS API ========== //
export const usersAPI = {
  getAll: () => axiosInstance.get('/users')
};


// ========== PROJECT MANAGERS API (the one failing 401) ========== //
export const projectManagersAPI = {
  list: () => axiosInstance.get('/project_managers/list')
};

// ========== LEGACY EXPORTS FOR BACKWARD COMPATIBILITY ========== //
export const login = authAPI.login;
export const signup = authAPI.signup;
export const verifyOtp = authAPI.verifyOtp;
export const resendOtp = authAPI.resendOtp;
export const forgotPassword = authAPI.forgotPassword;
export const resetPassword = authAPI.resetPassword;
export const getUserDetails = authAPI.getUserDetails;
export const logout = authAPI.logout;
export const deleteAccount = authAPI.deleteAccount;
export const confirmEmail = authAPI.confirmEmail;

export const getProjectManagerDashboard = projectManagerAPI.getDashboard;
export const getMyProjects = projectManagerAPI.getMyProjects;
export const getUpcomingEvents = projectManagerAPI.getUpcomingEvents;
export const getMyTenders = tendersAPI.getMy;
export const getDashboardStatistics = projectManagerAPI.getStatistics;
export const getTeamMembers = projectManagerAPI.getTeamMembers;
export const getProjectsProgress = projectManagerAPI.getProjectsProgress;

export const getAllProjects = projectsAPI.getAll;
export const getProject = projectsAPI.getById;
export const createProject = projectsAPI.create;
export const updateProject = projectsAPI.update;
export const deleteProject = projectsAPI.delete;
export const getProjectProgress = projectsAPI.getProgress;
export const updateProjectProgress = projectsAPI.updateProgress;
export const getProjectTeam = projectsAPI.getTeam;
export const getProjectTimeline = projectsAPI.getTimeline;
export const getProjectChartData = projectsAPI.getChartData;

export const getAllEvents = eventsAPI.getAll;
export const getMyEvents = eventsAPI.getMy;
export const getThisWeekEvents = eventsAPI.getThisWeek;
export const createEvent = eventsAPI.create;
export const updateEvent = eventsAPI.update;
export const deleteEvent = eventsAPI.delete;
export const markEventCompleted = eventsAPI.markCompleted;
export const rescheduleEvent = eventsAPI.reschedule;

export const getAllTenders = tendersAPI.getAll;
export const getActiveTenders = tendersAPI.getActive;
export const getUrgentTenders = tendersAPI.getUrgent;
export const getDraftTenders = tendersAPI.getDrafts;
export const createTender = tendersAPI.create;
export const updateTender = tendersAPI.update;
export const deleteTender = tendersAPI.delete;
export const convertTenderToProject = tendersAPI.convertToProject;
export const updateTenderStatus = tendersAPI.updateStatus;
export const getTenderDetails = tendersAPI.getDetails;

export const getAllTasks = tasksAPI.getAll;
export const getTask = tasksAPI.getById;
export const createTask = tasksAPI.create;
export const updateTask = tasksAPI.update;
export const deleteTask = tasksAPI.delete;
export const getTasksByStatus = tasksAPI.getByStatus;
export const getOverdueTasks = tasksAPI.getOverdue;
export const getTasksDueToday = tasksAPI.getDueToday;
export const getActiveTasks = tasksAPI.getActive;
export const getCompletedTasks = tasksAPI.getCompleted;
export const getTaskStats = tasksAPI.getStats;

export const getNotifications = notificationsAPI.getAll;
export const getUnreadNotificationCount = notificationsAPI.getUnreadCount;
export const markNotificationRead = notificationsAPI.markRead;
export const markAllNotificationsRead = notificationsAPI.markAllRead;

export const searchProjects = searchAPI.projects;
export const searchEvents = searchAPI.events;
export const searchTenders = searchAPI.tenders;
export const globalSearch = searchAPI.global;

export const getCalendarEvents = calendarAPI.getEvents;

export const getActiveProjects = projectsAPI.getActive;
export const getCompletedProjects = projectsAPI.getCompleted;

export const getSupervisorWorkload = supervisorsAPI.getWorkload;
export const getSupervisorProjects = supervisorsAPI.getProjects;
export const getSupervisorPerformance = supervisorsAPI.getPerformance;

// Additional legacy functions
export const getDashboardStats = dashboardAPI.getDashboardStats;
export const getRecentActivity = dashboardAPI.getRecentActivity;

// Export default for compatibility
export default api;




// import axios from "axios";
// import { getToken } from "./tokenStorage";

// console.log("🚀 API FILE LOADED - Complete Upgraded Version v2.1");

// // Configuration
// const API_BASE_URL = "http://192.168.1.200:3001";
// const API_TIMEOUT = 30000;
// const RETRY_ATTEMPTS = 3;

// // Create axios instances
// export const api = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: API_TIMEOUT,
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
// });

// export const axiosInstance = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: API_TIMEOUT,
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
// });

// // Enhanced request interceptor with retry logic
// axiosInstance.interceptors.request.use(
//   async (config) => {
//     const authData = await getToken();
//     if (authData) {
//       config.headers.Authorization = authData.bearerToken || `Bearer ${authData.accessToken}`;
//       config.headers.client = authData.client || "";
//       config.headers.uid = authData.uid || "";
//       config.headers["token-type"] = authData.tokenType || "";
//       config.headers["access-token"] = authData.accessToken || "";
//     }
    
//     config.headers['X-Request-ID'] = Math.random().toString(36).substring(7);
    
//     console.log(`🚀 ${config.method.toUpperCase()} ${config.url}`, {
//       headers: config.headers,
//       data: config.data,
//       params: config.params
//     });
    
//     return config;
//   },
//   (error) => {
//     console.error("❌ Request interceptor error:", error);
//     return Promise.reject(error);
//   }
// );

// // Enhanced response interceptor with better error handling
// axiosInstance.interceptors.response.use(
//   (response) => {
//     console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`, {
//       data: response.data,
//       headers: response.headers
//     });
//     return response;
//   },
//   async (error) => {
//     const config = error.config;
    
//     if (!config || !config.retry) {
//       config.retry = 0;
//     }
    
//     if (config.retry < RETRY_ATTEMPTS && (
//       error.code === 'NETWORK_ERROR' || 
//       error.code === 'TIMEOUT' ||
//       (error.response && error.response.status >= 500)
//     )) {
//       config.retry++;
//       console.log(`🔄 Retrying request (${config.retry}/${RETRY_ATTEMPTS}): ${config.method.toUpperCase()} ${config.url}`);
//       return axiosInstance(config);
//     }
    
//     console.error("❌ API Error:", {
//       method: error.config?.method,
//       url: error.config?.url,
//       status: error.response?.status,
//       data: error.response?.data,
//       message: error.message
//     });
    
//     return Promise.reject(error);
//   }
// );

// // Add interceptors for non-authenticated requests
// api.interceptors.request.use((config) => {
//   config.headers['X-Request-ID'] = Math.random().toString(36).substring(7);
//   console.log(`🚀 [NO-AUTH] ${config.method.toUpperCase()} ${config.url}`, {
//     headers: config.headers,
//     data: config.data
//   });
//   return config;
// });

// api.interceptors.response.use(
//   (response) => {
//     console.log(`✅ [NO-AUTH] ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
//     return response;
//   },
//   (error) => {
//     console.error("❌ [NO-AUTH] API Error:", error?.response || error.message);
//     return Promise.reject(error);
//   }
// );

// // Utility functions
// export const getAuthHeaders = async () => {
//   const authData = await getToken();
//   return {
//     Authorization: authData?.bearerToken || `Bearer ${authData?.accessToken}`,
//     uid: authData?.uid || "",
//     client: authData?.client || "",
//     "token-type": authData?.tokenType || "",
//     "access-token": authData?.accessToken || "",
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   };
// };

// // Helper function to handle different response formats
// const normalizeResponse = (response, arrayKey = null) => {
//   if (!response) return [];
//   if (arrayKey && response[arrayKey]) {
//     return Array.isArray(response[arrayKey]) ? response[arrayKey] : [];
//   }
//   if (Array.isArray(response)) return response;
//   if (response.data && Array.isArray(response.data)) return response.data;
//   return [];
// };

// // ========== AUTHENTICATION API ========== //
// export const authAPI = {
//   login: async (email, password) => {
//     try {
//       const response = await api.post("/auth/sign_in", { email, password });
//       return response.data;
//     } catch (error) {
//       console.error("Login failed:", error);
//       throw error;
//     }
//   },

//   signup: async ({ name, email, password, password_confirmation }) => {
//     try {
//       const response = await api.post('/auth', {
//         user: { name, email, password, password_confirmation }
//       });
//       return response.data;
//     } catch (error) {
//       console.error("Signup failed:", error);
//       throw error;
//     }
//   },

//   verifyOtp: async (email, otp) => {
//     try {
//       console.log("🔐 Verifying OTP:", { email, otp });
//       const response = await api.post("/auth/verify_otp", { email, otp });
      
//       const token =
//         response.headers["authorization"]?.split(" ")[1] ||
//         response.headers["access-token"] ||
//         response.data['access-token'] ||
//         response.data.access_token ||
//         response.data.accessToken ||
//         response.data.token ||
//         response.data.data?.access_token;
      
//       if (!token) {
//         throw new Error("No authentication token received from server");
//       }
      
//       const userData = response.data.data || response.data.user || response.data;
//       const role = userData?.admin ? 'admin' : 'user';
      
//       return {
//         message: response.data.message || "OTP verified successfully!",
//         accessToken: token,
//         bearerToken: `Bearer ${token}`,
//         client: response.headers["client"] || response.data.client || "default-client",
//         expiry: response.headers["expiry"] || response.data.expiry,
//         uid: response.headers["uid"] || response.data.uid || userData?.uid || userData?.email,
//         tokenType: response.headers["token-type"] || response.data.tokenType || "Bearer",
//         role: role,
//         user: userData
//       };
//     } catch (error) {
//       console.error("❌ OTP verification failed:", error);
//       const errorMessage = 
//         error.response?.data?.errors?.join(', ') ||
//         error.response?.data?.message ||
//         error.response?.data?.error ||
//         `OTP verification failed: ${error.response?.status} ${error.response?.statusText}`;
//       throw new Error(errorMessage);
//     }
//   },

//   resendOtp: async (email) => {
//     const response = await api.post("/auth/resend_otp", { email });
//     return response.data;
//   },

//   forgotPassword: async (email) => {
//     const response = await api.post("/auth/password", { email });
//     return response.data;
//   },

//   resetPassword: async (resetToken, password, passwordConfirmation) => {
//     const response = await api.put("/auth/password", {
//       reset_password_token: resetToken,
//       password,
//       password_confirmation: passwordConfirmation,
//     });
//     return response.data;
//   },

//   getUserDetails: async () => {
//     const response = await axiosInstance.get("/auth/validate_token");
//     return response.data;
//   },

//   logout: async () => {
//     const response = await axiosInstance.delete("/auth/sign_out");
//     return response.data;
//   },

//   deleteAccount: async () => {
//     const response = await axiosInstance.delete("/auth/delete_account");
//     return response.data;
//   },

//   confirmEmail: async (confirmationToken) => {
//     const response = await api.get(`/users/confirm_email?confirmation_token=${confirmationToken}`);
//     return response.data;
//   }
// };

// // ========== PROJECTS API ========== //
// export const projectsAPI = {
//   getAll: async (filters = {}) => {
//     try {
//       const queryParams = new URLSearchParams();
//       Object.entries(filters).forEach(([key, value]) => {
//         if (value && value !== 'all') queryParams.append(key, value);
//       });
      
//       const queryString = queryParams.toString();
//       const endpoint = queryString ? `/projects?${queryString}` : '/projects';
//       const response = await axiosInstance.get(endpoint);
//       return response.data;
//     } catch (error) {
//       console.error("❌ Failed to fetch projects:", error);
//       throw error;
//     }
//   },

//   getById: async (id) => {
//     const response = await axiosInstance.get(`/projects/${id}`);
//     return response.data;
//   },

//   create: async (projectData) => {
//     const response = await axiosInstance.post('/projects', { project: projectData });
//     return response.data;
//   },

//   update: async (id, projectData) => {
//     const response = await axiosInstance.put(`/projects/${id}`, { project: projectData });
//     return response.data;
//   },

//   delete: async (id) => {
//     const response = await axiosInstance.delete(`/projects/${id}`);
//     return response.data;
//   },

//   getProgress: async (id) => {
//     const response = await axiosInstance.get(`/projects/${id}/progress`);
//     return response.data;
//   },

//   updateProgress: async (id, progressData) => {
//     const response = await axiosInstance.patch(`/projects/${id}/update_progress`, progressData);
//     return response.data;
//   },

//   getTeam: async (id) => {
//     const response = await axiosInstance.get(`/projects/${id}/team`);
//     return response.data;
//   },

//   getTimeline: async (id) => {
//     const response = await axiosInstance.get(`/projects/${id}/timeline`);
//     return response.data;
//   },

//   getChartData: async () => {
//     const response = await axiosInstance.get('/projects/chart_data');
//     return response.data;
//   },

//   getActive: async (filters = {}) => {
//     const queryParams = new URLSearchParams(filters).toString();
//     const endpoint = queryParams ? `/projects/active?${queryParams}` : '/projects/active';
//     const response = await axiosInstance.get(endpoint);
//     return response.data;
//   },

//   getCompleted: async (filters = {}) => {
//     const queryParams = new URLSearchParams(filters).toString();
//     const endpoint = queryParams ? `/projects/completed?${queryParams}` : '/projects/completed';
//     const response = await axiosInstance.get(endpoint);
//     return response.data;
//   }
// };
// export const markProjectAsCompleted = async (projectId) => {
//   try {
//     const headers = await getAuthHeaders();
//     const response = await axiosInstance.patch(`/projects/${projectId}/mark_as_completed`, {}, { headers });
//     console.log("✅ Project marked as completed:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Failed to mark project as completed:", error?.response?.data || error.message);
//     throw error;
//   }
// };


// // ========== TENDERS API ========== //
// export const tendersAPI = {
//   getAll: async (filters = {}) => {
//     try {
//       const queryParams = new URLSearchParams();
//       Object.entries(filters).forEach(([key, value]) => {
//         if (value && value !== 'all') queryParams.append(key, value);
//       });
      
//       const queryString = queryParams.toString();
//       const endpoint = queryString ? `/tenders?${queryString}` : '/tenders';
//       const response = await axiosInstance.get(endpoint);
      
//       if (response.data.tenders) {
//         return { 
//           tenders: response.data.tenders, 
//           total: response.data.total || response.data.tenders.length,
//           status: 'success'
//         };
//       } else if (Array.isArray(response.data)) {
//         return { tenders: response.data, total: response.data.length, status: 'success' };
//       }
//       return response.data;
//     } catch (error) {
//       console.error("❌ Failed to fetch tenders:", error);
//       throw error;
//     }
//   },

//   getMy: async () => {
//     try {
//       let response;
//       try {
//         response = await axiosInstance.get('/project_managers/my_tenders');
//       } catch (pmError) {
//         response = await axiosInstance.get('/tenders');
//       }
//       return normalizeResponse(response.data, 'tenders');
//     } catch (error) {
//       console.error("❌ Failed to fetch my tenders:", error);
//       throw error;
//     }
//   },

//   getByStatus: async (status) => {
//     try {
//       const response = await axiosInstance.get(`/tenders/${status}`);
//       return normalizeResponse(response.data, 'tenders');
//     } catch (error) {
//       const result = await tendersAPI.getAll({ status });
//       return result.tenders || [];
//     }
//   },

//   getById: async (id) => {
//     const response = await axiosInstance.get(`/tenders/${id}`);
//     return response.data.tender || response.data;
//   },

//   create: async (tenderData) => {
//     const response = await axiosInstance.post('/tenders', { tender: tenderData });
//     return response.data.tender || response.data;
//   },

//   update: async (id, tenderData) => {
//     const response = await axiosInstance.put(`/tenders/${id}`, { tender: tenderData });
//     return response.data.tender || response.data;
//   },

//   delete: async (id) => {
//     const response = await axiosInstance.delete(`/tenders/${id}`);
//     return response.data;
//   },

//   convertToProject: async (id) => {
//     const response = await axiosInstance.post(`/tenders/${id}/convert_to_project`);
//     return response.data;
//   },

//   updateStatus: async (id, status) => {
//     const response = await axiosInstance.patch(`/tenders/${id}/update_status`, { status });
//     return response.data.tender || response.data;
//   },

//   getDetails: async (id) => {
//     const response = await axiosInstance.get(`/tenders/${id}/details`);
//     return response.data.tender || response.data;
//   },

//   getStatistics: async () => {
//     try {
//       const response = await axiosInstance.get('/tenders/statistics');
//       return response.data;
//     } catch (error) {
//       const allTenders = await tendersAPI.getMy();
//       const today = new Date();
      
//       return {
//         statistics: {
//           total: allTenders.length,
//           active: allTenders.filter(t => t.status === 'active').length,
//           draft: allTenders.filter(t => t.status === 'draft').length,
//           completed: allTenders.filter(t => t.status === 'completed').length,
//           totalValue: allTenders.reduce((sum, t) => sum + (t.budget_estimate || 0), 0),
//         }
//       };
//     }
//   },

//   getActive: async () => tendersAPI.getByStatus('active'),
//   getDrafts: async () => tendersAPI.getByStatus('draft'),
//   getCompleted: async () => tendersAPI.getByStatus('completed'),
//   getUrgent: async () => tendersAPI.getByStatus('urgent'),

//   search: async (query, filters = {}) => {
//     return await tendersAPI.getAll({ ...filters, search: query });
//   }
// };

// // ========== TASKS API ========== //
// export const tasksAPI = {
//   getAll: async (filters = {}) => {
//     try {
//       const queryParams = new URLSearchParams();
//       Object.entries(filters).forEach(([key, value]) => {
//         if (value) queryParams.append(key, value);
//       });
      
//       const queryString = queryParams.toString();
//       const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
//       const response = await axiosInstance.get(endpoint);
      
//       if (response.data.tasks) return response.data;
//       if (Array.isArray(response.data)) return { tasks: response.data };
//       return response.data;
//     } catch (error) {
//       console.error("❌ Failed to fetch tasks:", error);
//       throw error;
//     }
//   },

//   getById: async (id) => {
//     const response = await axiosInstance.get(`/tasks/${id}`);
//     return response.data;
//   },

//   create: async (taskData) => {
//     const response = await axiosInstance.post('/tasks', {
//       task: {
//         title: taskData.title,
//         description: taskData.description,
//         due_date: taskData.due_date,
//         start_date: taskData.start_date,
//         status: taskData.status || 'pending',
//         priority: taskData.priority || 'medium',
//         estimated_hours: taskData.estimated_hours,
//         project_id: taskData.project_id,
//         assignee_ids: taskData.assignee_ids || [],
//         watcher_ids: taskData.watcher_ids || [],
//         tags: taskData.tags || [],
//         custom_fields: taskData.custom_fields || {}
//       }
//     });
//     return response.data;
//   },

//   update: async (id, taskData) => {
//     const response = await axiosInstance.put(`/tasks/${id}`, { task: taskData });
//     return response.data;
//   },

//   delete: async (id) => {
//     const response = await axiosInstance.delete(`/tasks/${id}`);
//     return response.data;
//   },

//   updateStatus: async (id, status) => {
//     const response = await axiosInstance.patch(`/tasks/${id}`, { task: { status } });
//     return response.data;
//   },

//   updatePriority: async (id, priority) => {
//     const response = await axiosInstance.patch(`/tasks/${id}`, { task: { priority } });
//     return response.data;
//   },

//   assign: async (id, assigneeIds) => {
//     const response = await axiosInstance.patch(`/tasks/${id}/assign`, { assignee_ids: assigneeIds });
//     return response.data;
//   },

//   getByStatus: async (status) => tasksAPI.getAll({ status }),

//   getOverdue: async () => {
//     try {
//       return await tasksAPI.getAll({ filter: 'overdue' });
//     } catch (error) {
//       const allTasks = await tasksAPI.getAll();
//       const tasks = allTasks.tasks || allTasks;
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
      
//       return {
//         tasks: tasks.filter(task => {
//           const dueDate = new Date(task.due_date);
//           return dueDate < today && !['completed', 'cancelled'].includes(task.status);
//         })
//       };
//     }
//   },

//   getDueToday: async () => tasksAPI.getAll({ filter: 'due_today' }),
//   getActive: async () => tasksAPI.getAll({ filter: 'active' }),
//   getCompleted: async () => tasksAPI.getByStatus('completed'),

//   getStatistics: async () => {
//     try {
//       const response = await axiosInstance.get('/tasks/statistics');
//       return response.data;
//     } catch (error) {
//       const allTasks = await tasksAPI.getAll();
//       const tasks = allTasks.tasks || allTasks;
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
      
//       return {
//         statistics: {
//           total: tasks.length,
//           completed: tasks.filter(t => t.status === 'completed').length,
//           pending: tasks.filter(t => t.status === 'pending').length,
//           in_progress: tasks.filter(t => t.status === 'in_progress').length,
//           overdue: tasks.filter(t => {
//             const dueDate = new Date(t.due_date);
//             return dueDate < today && !['completed', 'cancelled'].includes(t.status);
//           }).length,
//         }
//       };
//     }
//   },

//   getStats: async () => {
//     const result = await tasksAPI.getStatistics();
//     return result.statistics || result;
//   },

//   // Comments
//   getComments: async (taskId) => {
//     const response = await axiosInstance.get(`/tasks/${taskId}/comments`);
//     return response.data;
//   },

//   addComment: async (taskId, comment) => {
//     const response = await axiosInstance.post(`/tasks/${taskId}/comments`, {
//       comment: { content: comment.content, parent_id: comment.parent_id || null }
//     });
//     return response.data;
//   },

//   // Attachments
//   uploadAttachment: async (taskId, file, description = '') => {
//     const formData = new FormData();
//     formData.append('attachment[file]', file);
//     formData.append('attachment[description]', description);
//     const response = await axiosInstance.post(`/tasks/${taskId}/attachments`, formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//     return response.data;
//   },

//   // Bulk operations
//   bulkUpdate: async (taskIds, updates) => {
//     const response = await axiosInstance.patch('/tasks/bulk_update', {
//       task_ids: taskIds,
//       updates: updates
//     });
//     return response.data;
//   },

//   bulkDelete: async (taskIds) => {
//     const response = await axiosInstance.delete('/tasks/bulk_delete', {
//       data: { task_ids: taskIds }
//     });
//     return response.data;
//   },

//   search: async (query, filters = {}) => {
//     return await tasksAPI.getAll({ ...filters, search: query });
//   }
// };

// // ========== EVENTS API ========== //
// export const eventsAPI = {
//   getAll: async (filters = {}) => {
//     const queryParams = new URLSearchParams(filters).toString();
//     const endpoint = queryParams ? `/events?${queryParams}` : '/events';
//     const response = await axiosInstance.get(endpoint);
//     return response.data;
//   },

//   getMy: async () => {
//     const response = await axiosInstance.get('/events/my_events');
//     return response.data;
//   },

//   getThisWeek: async () => {
//     const response = await axiosInstance.get('/events/this_week');
//     return response.data;
//   },

//   getUpcoming: async (limit = 10) => {
//     const response = await axiosInstance.get(`/events/upcoming?limit=${limit}`);
//     return response.data;
//   },

//   create: async (eventData) => {
//     const response = await axiosInstance.post('/events', { event: eventData });
//     return response.data;
//   },

//   update: async (id, eventData) => {
//     const response = await axiosInstance.put(`/events/${id}`, { event: eventData });
//     return response.data;
//   },

//   delete: async (id) => {
//     const response = await axiosInstance.delete(`/events/${id}`);
//     return response.data;
//   },

//   markCompleted: async (id) => {
//     const response = await axiosInstance.patch(`/events/${id}/mark_completed`);
//     return response.data;
//   },

//   reschedule: async (id, newDate) => {
//     const response = await axiosInstance.patch(`/events/${id}/reschedule`, { date: newDate });
//     return response.data;
//   }
// };

// // ========== TEAM MANAGEMENT API ========== //
// export const supervisorsAPI = {
//   getAll: async () => {
//     const response = await axiosInstance.get('/supervisors');
//     return response.data;
//   },

//   getById: async (id) => {
//     const response = await axiosInstance.get(`/supervisors/${id}`);
//     return response.data;
//   },

//   create: async (supervisorData) => {
//     const response = await axiosInstance.post('/supervisors', { supervisor: supervisorData });
//     return response.data;
//   },

//   update: async (id, supervisorData) => {
//     const response = await axiosInstance.put(`/supervisors/${id}`, { supervisor: supervisorData });
//     return response.data;
//   },

//   delete: async (id) => {
//     const response = await axiosInstance.delete(`/supervisors/${id}`);
//     return response.data;
//   },

//   getWorkload: async () => {
//     const response = await axiosInstance.get('/supervisors/workload');
//     return response.data;
//   },

//   getProjects: async (id) => {
//     const response = await axiosInstance.get(`/supervisors/${id}/projects`);
//     return response.data;
//   },

//   getPerformance: async (id) => {
//     const response = await axiosInstance.get(`/supervisors/${id}/performance`);
//     return response.data;
//   }
// };

// export const siteManagersAPI = {
//   getAll: async () => {
//     const response = await axiosInstance.get('/site_managers');
//     return response.data;
//   },

//   getById: async (id) => {
//     const response = await axiosInstance.get(`/site_managers/${id}`);
//     return response.data;
//   },

//   create: async (siteManagerData) => {
//     const response = await axiosInstance.post('/site_managers', { site_manager: siteManagerData });
//     return response.data;
//   },

//   update: async (id, siteManagerData) => {
//     const response = await axiosInstance.put(`/site_managers/${id}`, { site_manager: siteManagerData });
//     return response.data;
//   },

//   delete: async (id) => {
//     const response = await axiosInstance.delete(`/site_managers/${id}`);
//     return response.data;
//   }
// };

// export const teamAPI = {
//   getAllTeamMembers: async () => {
//     try {
//       const [supervisors, siteManagers] = await Promise.all([
//         supervisorsAPI.getAll(),
//         siteManagersAPI.getAll()
//       ]);
      
//       const normalizedSupervisors = (Array.isArray(supervisors) ? supervisors : []).map(supervisor => ({
//         ...supervisor,
//         role: 'Supervisor',
//         roleType: 'supervisor',
//         department: 'Operations'
//       }));
      
//       const normalizedSiteManagers = (Array.isArray(siteManagers) ? siteManagers : []).map(manager => ({
//         ...manager,
//         role: 'Site Manager',
//         roleType: 'site_manager',
//         department: 'Site Management'
//       }));
      
//       return [...normalizedSupervisors, ...normalizedSiteManagers];
//     } catch (error) {
//       console.error("❌ Failed to fetch team members:", error);
//       return [];
//     }
//   },

//   getTeamStats: async () => {
//     const teamMembers = await teamAPI.getAllTeamMembers();
    
//     return {
//       totalMembers: teamMembers.length,
//       supervisors: teamMembers.filter(m => m.roleType === 'supervisor').length,
//       siteManagers: teamMembers.filter(m => m.roleType === 'site_manager').length,
//     };
//   }
// };

// // ========== NOTIFICATIONS API ========== //
// export const notificationsAPI = {
//   getAll: async () => {
//     try {
//       const response = await axiosInstance.get('/notifications');
//       return response.data;
//     } catch (error) {
//       console.error("❌ Failed to fetch notifications:", error);
//       return [];
//     }
//   },

//   getUnreadCount: async () => {
//     try {
//       const response = await axiosInstance.get('/notifications/unread_count');
//       return response.data;
//     } catch (error) {
//       console.error("❌ Failed to fetch unread notification count:", error);
//       return { count: 0 };
//     }
//   },

//   markRead: async (id) => {
//     const response = await axiosInstance.patch(`/notifications/${id}/mark_read`);
//     return response.data;
//   },

//   markAllRead: async () => {
//     const response = await axiosInstance.patch('/notifications/mark_all_read');
//     return response.data;
//   }
// };

// // ========== CALENDAR API ========== //
// export const calendarAPI = {
//   getEvents: async (startDate = null, endDate = null) => {
//     try {
//       const params = new URLSearchParams();
//       if (startDate) params.append('start_date', startDate);
//       if (endDate) params.append('end_date', endDate);
      
//       const queryString = params.toString();
//       const endpoint = queryString ? `/calendar/events?${queryString}` : '/calendar/events';
//       const response = await axiosInstance.get(endpoint);
//       return response.data.events || [];
//     } catch (error) {
//       console.error("❌ Failed to fetch calendar events:", error);
//       return [];
//     }
//   },

//   getMonthEvents: async (year, month) => {
//     const response = await axiosInstance.get(`/calendar/month/${year}/${month}`);
//     return response.data.events || [];
//   },

//   getTodayEvents: async () => {
//     try {
//       const today = new Date().toISOString().split('T')[0];
//       return await calendarAPI.getEvents(today, today);
//     } catch (error) {
//       console.error("❌ Failed to fetch today events:", error);
//       return [];
//     }
//   },

//   getUpcomingEvents: async () => {
//     const today = new Date();
//     const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
//     return await calendarAPI.getEvents(
//       today.toISOString().split('T')[0],
//       nextWeek.toISOString().split('T')[0]
//     );
//   }
// };

// // ========== SEARCH API ========== //
// export const searchAPI = {
//   projects: async (query) => {
//     const response = await axiosInstance.get(`/search/projects?q=${encodeURIComponent(query)}`);
//     return response.data;
//   },

//   events: async (query) => {
//     const response = await axiosInstance.get(`/search/events?q=${encodeURIComponent(query)}`);
//     return response.data;
//   },

//   tenders: async (query) => {
//     const response = await axiosInstance.get(`/search/tenders?q=${encodeURIComponent(query)}`);
//     return response.data;
//   },

//   global: async (query) => {
//     const response = await axiosInstance.get(`/search?q=${encodeURIComponent(query)}`);
//     return response.data;
//   }
// };

// // ========== PROJECT MANAGER DASHBOARD API ========== //
// export const projectManagerAPI = {
//   getDashboard: async () => {
//     const response = await axiosInstance.get('/project_managers/dashboard');
//     return response.data;
//   },

//   getMyProjects: async () => {
//     try {
//       const response = await axiosInstance.get('/project_managers/my_projects');
//       return response.data;
//     } catch (error) {
//       const fallbackResponse = await axiosInstance.get('/projects');
//       return fallbackResponse.data;
//     }
//   },

//   getUpcomingEvents: async (limit = 10) => {
//     const response = await axiosInstance.get(`/project_managers/upcoming_events?limit=${limit}`);
//     return response.data;
//   },

//   getMyTenders: async () => tendersAPI.getMy(),

//   getStatistics: async () => {
//     const response = await axiosInstance.get('/project_managers/statistics');
//     return response.data;
//   },

//   getTeamMembers: async () => {
//     const response = await axiosInstance.get('/project_managers/team_members');
//     return response.data;
//   },

//   getProjectsProgress: async () => {
//     const response = await axiosInstance.get('/project_managers/projects_progress');
//     return response.data;
//   }
// };

// // ========== DASHBOARD API ========== //
// export const dashboardAPI = {
//   getDashboard: projectManagerAPI.getDashboard,
//   getProjects: projectManagerAPI.getMyProjects,
//   getEvents: projectManagerAPI.getUpcomingEvents,
//   getTenders: tendersAPI.getMy,
//   getStatistics: projectManagerAPI.getStatistics,
//   getTeamMembers: projectManagerAPI.getTeamMembers,
//   getProjectsProgress: projectManagerAPI.getProjectsProgress,

//   getDashboardStats: async () => {
//     try {
//       return await projectManagerAPI.getStatistics();
//     } catch (error) {
//       return {
//         totalProjects: 0,
//         activeProjects: 0,
//         completedProjects: 0,
//         activeTenders: 0,
//         upcomingEvents: 0
//       };
//     }
//   },

//   tenders: tendersAPI,
//   projects: projectsAPI,
//   events: eventsAPI,
//   tasks: tasksAPI,
//   team: teamAPI,
//   notifications: notificationsAPI,
//   search: searchAPI,
//   calendar: calendarAPI
// };

// // ========== FETCH PROJECT MANAGERS ========== //
// export const fetchProjectManagers = async () => {
//   try {
//     const response = await axiosInstance.get('/project_managers/list');
//     return response.data;
//   } catch (error) {
//     console.error("❌ Failed to fetch project managers:", error);
//     return [];
//   }
// };

// // ========== ACTIVITIES API ========== //
// export const fetchActivities = async (params = {}) => {
//   const response = await axiosInstance.get('/activities', { params });
//   return response.data;
// };

// export const fetchActivityById = async (id) => {
//   const response = await axiosInstance.get(`/activities/${id}`);
//   return response.data;
// };

// export const fetchActivityStats = async () => {
//   const response = await axiosInstance.get('/activities/stats');
//   return response.data;
// };

// export const fetchRecentActivities = async (limit = 10) => {
//   const response = await axiosInstance.get('/activities/recent', { params: { limit } });
//   return response.data;
// };

// // ========== LEGACY EXPORTS ========== //
// export const login = authAPI.login;
// export const signup = authAPI.signup;
// export const verifyOtp = authAPI.verifyOtp;
// export const resendOtp = authAPI.resendOtp;
// export const forgotPassword = authAPI.forgotPassword;
// export const resetPassword = authAPI.resetPassword;
// export const getUserDetails = authAPI.getUserDetails;
// export const logout = authAPI.logout;
// export const deleteAccount = authAPI.deleteAccount;
// export const confirmEmail = authAPI.confirmEmail;

// export const getProjectManagerDashboard = projectManagerAPI.getDashboard;
// export const getMyProjects = projectManagerAPI.getMyProjects;
// export const getUpcomingEvents = projectManagerAPI.getUpcomingEvents;
// export const getMyTenders = tendersAPI.getMy;
// export const getDashboardStatistics = projectManagerAPI.getStatistics;
// export const getTeamMembers = projectManagerAPI.getTeamMembers;
// export const getProjectsProgress = projectManagerAPI.getProjectsProgress;

// export const getAllProjects = projectsAPI.getAll;
// export const getProject = projectsAPI.getById;
// export const createProject = projectsAPI.create;
// export const updateProject = projectsAPI.update;
// export const deleteProject = projectsAPI.delete;
// export const getProjectProgress = projectsAPI.getProgress;
// export const updateProjectProgress = projectsAPI.updateProgress;
// export const getProjectTeam = projectsAPI.getTeam;
// export const getProjectTimeline = projectsAPI.getTimeline;
// export const getProjectChartData = projectsAPI.getChartData;
// export const getActiveProjects = projectsAPI.getActive;
// export const getCompletedProjects = projectsAPI.getCompleted;

// export const getAllEvents = eventsAPI.getAll;
// export const getMyEvents = eventsAPI.getMy;
// export const getThisWeekEvents = eventsAPI.getThisWeek;
// export const createEvent = eventsAPI.create;
// export const updateEvent = eventsAPI.update;
// export const deleteEvent = eventsAPI.delete;
// export const markEventCompleted = eventsAPI.markCompleted;
// export const rescheduleEvent = eventsAPI.reschedule;

// export const getAllTenders = tendersAPI.getAll;
// export const getActiveTenders = tendersAPI.getActive;
// export const getUrgentTenders = tendersAPI.getUrgent;
// export const getDraftTenders = tendersAPI.getDrafts;
// export const createTender = tendersAPI.create;
// export const updateTender = tendersAPI.update;
// export const deleteTender = tendersAPI.delete;
// export const convertTenderToProject = tendersAPI.convertToProject;
// export const updateTenderStatus = tendersAPI.updateStatus;
// export const getTenderDetails = tendersAPI.getDetails;

// export const getAllTasks = tasksAPI.getAll;
// export const getTask = tasksAPI.getById;
// export const createTask = tasksAPI.create;
// export const updateTask = tasksAPI.update;
// export const deleteTask = tasksAPI.delete;
// export const getTasksByStatus = tasksAPI.getByStatus;
// export const getOverdueTasks = tasksAPI.getOverdue;
// export const getTasksDueToday = tasksAPI.getDueToday;
// export const getActiveTasks = tasksAPI.getActive;
// export const getCompletedTasks = tasksAPI.getCompleted;
// export const getTaskStats = tasksAPI.getStats;

// export const getNotifications = notificationsAPI.getAll;
// export const getUnreadNotificationCount = notificationsAPI.getUnreadCount;
// export const markNotificationRead = notificationsAPI.markRead;
// export const markAllNotificationsRead = notificationsAPI.markAllRead;

// export const searchProjects = searchAPI.projects;
// export const searchEvents = searchAPI.events;
// export const searchTenders = searchAPI.tenders;
// export const globalSearch = searchAPI.global;
// export const getCalendarEvents = calendarAPI.getEvents;

// export const getSupervisorWorkload = supervisorsAPI.getWorkload;
// export const getSupervisorProjects = supervisorsAPI.getProjects;
// export const getSupervisorPerformance = supervisorsAPI.getPerformance;
// export const getDashboardStats = dashboardAPI.getDashboardStats;

// export default api;