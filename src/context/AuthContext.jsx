import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  login as apiLogin, 
  verifyOtp as apiVerifyOtp,
  resendOtp as apiResendOtp,
  signup as apiSignup,
  forgotPassword as apiForgotPassword,
  logout as apiLogout,
  getUserDetails
} from '../services/api';
import tokenStorage from '../services/tokenStorage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      
      // Check if we have stored auth data
      const isAuth = await tokenStorage.isAuthenticated();
      if (!isAuth) {
        setLoading(false);
        return;
      }

      // Validate token with backend
      const userData = await getUserDetails();
      const storedUser = await tokenStorage.getUser();
      
      setUser(userData.data || userData || storedUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid auth data
      await tokenStorage.clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const result = await apiLogin(email, password);
      
      // Check if OTP is required (status code or response structure)
      if (result.otp_required || result.requires_otp) {
        // Store email for OTP verification
        await tokenStorage.setTempEmail(email);
        return { 
          requiresOtp: true, 
          message: result.message || 'OTP sent to your email'
        };
      }
      
      // Normal login - store auth data
      if (result.access_token || result.accessToken) {
        const authData = {
          accessToken: result.access_token || result.accessToken,
          bearerToken: `Bearer ${result.access_token || result.accessToken}`,
          client: result.client,
          uid: result.uid,
          tokenType: result.token_type || 'Bearer',
          expiry: result.expiry,
          role: result.data?.admin ? 'admin' : 'user',
          user: result.data || result.user
        };
        
        await tokenStorage.setAuthData(authData);
        setUser(authData.user);
        setIsAuthenticated(true);
      }
      
      return { requiresOtp: false };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const verifyOtp = async (otp) => {
    try {
      const email = await tokenStorage.getTempEmail();
      if (!email) {
        throw new Error('Email not found. Please try logging in again.');
      }
  
      const response = await apiVerifyOtp(email, otp);
      console.log("OTP verification response in context:", response);
  
      if (response.accessToken) {
        const role =
          response.user?.role || // If role is sent as a field
          (response.user?.admin ? 'admin' : 'user'); // Fallback using admin flag
  
        const authData = {
          accessToken: response.accessToken,
          bearerToken: `Bearer ${response.accessToken}`,
          client: response.client,
          uid: response.uid,
          tokenType: response.tokenType || 'Bearer',
          expiry: response.expiry,
          role,
          user: response.user,
        };
  
        await tokenStorage.setAuthData(authData);
        await tokenStorage.clearTempEmail();
  
        setUser(response.user);
        setIsAuthenticated(true);
  
        return response;
      } else {
        throw new Error(response.message || 'No access token received');
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      throw error;
    }
  };
  

  const register = async (name, email, password, passwordConfirmation) => {
    try {
      const response = await apiSignup(name, email, password, passwordConfirmation);
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and storage
      await tokenStorage.clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await apiForgotPassword(email);
      return response;
    } catch (error) {
      console.error('Forgot password failed:', error);
      throw error;
    }
  };

  const resendOtp = async () => {
    try {
      const email = await tokenStorage.getTempEmail();
      if (!email) {
        throw new Error('Email not found. Please try logging in again.');
      }
      const response = await apiResendOtp(email);
      return response;
    } catch (error) {
      console.error('Resend OTP failed:', error);
      throw error;
    }
  };

  // Helper functions for role checking
  const isAdmin = () => {
    return user?.admin === true || user?.role === 'admin';
  };

  const isUser = () => {
    return user?.role === 'user' || (user && !isAdmin());
  };

  const hasRole = (role) => {
    if (role === 'admin') return isAdmin();
    if (role === 'user') return isUser();
    return false;
  };

  const getUserRole = () => {
    if (isAdmin()) return 'admin';
    if (isUser()) return 'user';
    return null;
  };

  const getDashboardPath = () => {
    if (isAdmin()) return '/admin';
    if (isUser()) return '/user';
    return '/login';
  };

  const value = {
    // State
    user,
    loading,
    isAuthenticated,
    
    // Auth actions
    login,
    register,
    logout,
    forgotPassword,
    verifyOtp,
    resendOtp,
    checkAuthStatus,
    
    // Role helpers
    isAdmin,
    isUser,
    hasRole,
    getUserRole,
    getDashboardPath,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
