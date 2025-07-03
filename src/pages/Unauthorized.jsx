import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Home, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const { user, logout, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if logout fails
      navigate('/login');
    }
  };

  const handleGoBack = () => {
    // Go back in history, or to dashboard if no history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(getDashboardPath());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full text-center">
        
        {/* Error Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-12 h-12 text-red-500" />
          </div>
        </div>
        
        {/* Error Content */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-2">
            You don't have permission to access this page.
          </p>
          
          {/* Show user info if logged in */}
          {user && (
            <div className="bg-gray-50 rounded-lg p-4 mt-4 mb-6">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Logged in as:</span> {user.name || user.email}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Role:</span> {user.admin ? 'Administrator' : 'User'}
              </p>
            </div>
          )}
          
          <p className="text-sm text-gray-500">
            Contact your administrator if you believe this is an error.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Go Back Button */}
          <button
            onClick={handleGoBack}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
          
          {/* Dashboard Button - if user is authenticated */}
          {user && (
            <Link
              to={getDashboardPath()}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Link>
          )}
          
          {/* Login Button - if user is not authenticated */}
          {!user && (
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Sign In
            </Link>
          )}
          
          {/* Logout Button - if user is authenticated */}
          {user && (
            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-red-300 text-base font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </button>
          )}
        </div>
        
        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-700">
            If you need access to this area, please contact your system administrator 
            or check with your project manager about your permissions.
          </p>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-100 rounded-full opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-100 rounded-full opacity-20"></div>
      </div>
    </div>
  );
};

export default Unauthorized;