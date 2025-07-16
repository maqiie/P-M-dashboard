import { axiosInstance } from './api';

export const progressAPI = {
  // Get current progress with timeline & variance
  getProgress: async (projectId) => {
    try {
      const response = await axiosInstance.get(`/projects/${projectId}/progress`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch project progress:', error);
      throw error;
    }
  },

  // Update progress and log with timeline stats
  updateProgress: async (projectId, progressData) => {
    try {
      const response = await axiosInstance.patch(`/projects/${projectId}/update_progress`, {
        progress_percentage: progressData.progress_percentage,
        note: progressData.note
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update project progress:', error);
      throw error;
    }
  },

  // Get detailed history including timeline variance
  getProgressHistory: async (projectId) => {
    try {
      const response = await axiosInstance.get(`/projects/${projectId}/progress_history`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch progress history:', error);
      throw error;
    }
  },

  // Get timeline-aligned summary across all projects
  getProgressSummary: async () => {
    try {
      const response = await axiosInstance.get('/projects/progress_summary');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch progress summary:', error);
      throw error;
    }
  },

  // NEW: Fetch timeline trend data (for chart)
  getProgressTrends: async (projectId) => {
    try {
      const response = await axiosInstance.get(`/projects/${projectId}/progress_trends`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch progress trends:', error);
      throw error;
    }
  }
};
