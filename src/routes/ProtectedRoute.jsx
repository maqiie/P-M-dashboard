import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role, requireAuth = true }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - Auth Check:', {
    loading,
    isAuthenticated,
    user,
    userRole: user?.role,
    requiredRole: role,
    location: location.pathname
  });

  // Loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check - FIXED
  const hasRole = () => {
    if (!role) return true; // No role required
    if (!user) return false;
    
    console.log('Role Check:', {
      requiredRole: role,
      userRole: user.role,
      match: user.role === role
    });
    
    // FIXED: Check user.role instead of user.admin
    return user.role === role;
  };

  if (!hasRole()) {
    // Show access denied page with correct role information
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">403</h3>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="mt-2 text-sm text-gray-500">
              You don't have permission to access this page.
            </p>
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Logged in as:</span> {user?.email}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-semibold">Role:</span> {user?.role || 'Unknown'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-semibold">Required Role:</span> {role}
              </p>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              Contact your administrator if you believe this is an error.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => window.history.back()}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  if (user?.role === 'admin') {
                    window.location.href = '/admin/dashboard';
                  } else {
                    window.location.href = '/dashboard';
                  }
                }}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated and role OK
  return children;
};

export default ProtectedRoute;


// import React from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const ProtectedRoute = ({ children, role, requireAuth = true }) => {
//   const { user, loading, isAuthenticated, hasRole } = useAuth();
//   const location = useLocation();

//   // Show loading spinner while checking authentication
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   // If authentication is required but user is not authenticated
//   if (requireAuth && !isAuthenticated) {
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   // If user is authenticated but doesn't have the required role
//   if (role && isAuthenticated && !hasRole(role)) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   // If user is authenticated and has the correct role (or no role required)
//   return children;
// };

// export default ProtectedRoute;