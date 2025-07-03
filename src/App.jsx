import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import AdminDashboard from "./components/dashboards/AdminDashboard";
import UserDashboard from "./components/dashboards/UserDashboard"; // Your existing component
import ProtectedRoute from "./routes/ProtectedRoute";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import '../index.css';

function App() {
  const { user, loading, isAuthenticated } = useAuth();
  
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

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard Role Redirect */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              user?.admin === true ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/user/dashboard" replace /> // Point to the dashboard route
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        {/* Root path redirect */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Admin Dashboard - protected route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* User Dashboard - protected route with nested routes */}
        <Route
          path="/user/*" // Changed from "/user" to "/user/*" to handle nested routes
          element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Error Pages */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;