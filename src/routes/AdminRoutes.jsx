// src/routes/AdminRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Import all page components
import AdminDashboard from "../components/dashboards/AdminDashboard";
import AnalyticsPage from "../pages/admin/Analytics";
import ProjectsPage from "../pages/admin/projects";
import TasksPage from "../pages/admin/Tasks";
import TeamPage from "../pages/admin/Team";
import CalendarPage from "../pages/admin/calender";
import TendersPage from "../pages/admin/Tenders";
import ReportsPage from "../pages/admin/Reports";
import NotificationsPage from "../pages/admin/Notifications";
import SettingsPage from "../pages/admin/Settings";

// Existing components
import Users from "../pages/admin/Users";
import Unauthorized from "../pages/Unauthorized";

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Default route for /admin - Dashboard */}
      <Route index element={<AdminDashboard />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      
      {/* Overview Routes */}
      <Route path="analytics" element={<AnalyticsPage />} />
      
      {/* Project Management Routes */}
      <Route path="projects" element={<ProjectsPage />} />
      <Route path="tasks" element={<TasksPage />} />
      <Route path="tenders" element={<TendersPage />} />
      
      {/* Team & Resources Routes */}
      <Route path="team" element={<TeamPage />} />
      <Route path="calendar" element={<CalendarPage />} />
      <Route path="reports" element={<ReportsPage />} />
      
      {/* System Routes */}
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="settings" element={<SettingsPage />} />
      
      {/* Existing routes */}
      <Route path="users" element={<Users />} />
      <Route path="unauthorized" element={<Unauthorized />} />
      
      {/* Catch all: redirect unknown admin paths back to /admin */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;