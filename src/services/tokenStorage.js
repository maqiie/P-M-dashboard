// src/services/tokenStorage.js

const TOKEN_KEY = 'authData';
const TEMP_EMAIL_KEY = 'tempEmail';

/**
 * Token Storage utility for managing authentication tokens
 */
export const tokenStorage = {
  // Store complete auth data
  setAuthData: async (authData) => {
    try {
      const dataToStore = {
        accessToken: authData.accessToken,
        bearerToken: authData.bearerToken || `Bearer ${authData.accessToken}`,
        client: authData.client,
        uid: authData.uid,
        tokenType: authData.tokenType || 'Bearer',
        expiry: authData.expiry,
        role: authData.role,
        user: authData.user,
        timestamp: Date.now()
      };
      
      localStorage.setItem(TOKEN_KEY, JSON.stringify(dataToStore));
      console.log('Stored Auth Data:', dataToStore);
      return true;
    } catch (error) {
      console.error('Failed to store auth data:', error);
      return false;
    }
  },

  // Get stored auth data
  getAuthData: async () => {
    try {
      const data = localStorage.getItem(TOKEN_KEY);
      if (data) {
        const authData = JSON.parse(data);
        
        // Check if token is expired
        if (authData.expiry && Date.now() > new Date(authData.expiry).getTime()) {
          await tokenStorage.clearAuthData();
          return null;
        }
        
        return authData;
      }
      return null;
    } catch (error) {
      console.error('Failed to get auth data:', error);
      return null;
    }
  },

  // Clear all auth data
  clearAuthData: async () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TEMP_EMAIL_KEY);
      console.log('Cleared auth data');
      return true;
    } catch (error) {
      console.error('Failed to clear auth data:', error);
      return false;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    const authData = await tokenStorage.getAuthData();
    return authData !== null;
  },

  // Get user info
  getUser: async () => {
    const authData = await tokenStorage.getAuthData();
    return authData?.user || null;
  },

  // Store temporary email for OTP flow
  setTempEmail: async (email) => {
    try {
      localStorage.setItem(TEMP_EMAIL_KEY, email);
      return true;
    } catch (error) {
      console.error('Failed to store temp email:', error);
      return false;
    }
  },

  // Get temporary email
  getTempEmail: async () => {
    try {
      return localStorage.getItem(TEMP_EMAIL_KEY);
    } catch (error) {
      console.error('Failed to get temp email:', error);
      return null;
    }
  },

  // Clear temporary email
  clearTempEmail: async () => {
    try {
      localStorage.removeItem(TEMP_EMAIL_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear temp email:', error);
      return false;
    }
  },
};

// Export getToken function for compatibility
export const getToken = async () => {
  return await tokenStorage.getAuthData();
};

export default tokenStorage;
