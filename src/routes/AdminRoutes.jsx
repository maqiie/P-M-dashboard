// src/routes/AdminRoutes.jsx
import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Sidebar
import AdminSidebar from "../pages/admin/AdminSidebar";
// Pages
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
import Users from "../pages/admin/Users";
import Unauthorized from "../pages/Unauthorized";

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Layout route with sidebar */}
      <Route
        element={
          <div className="flex min-h-screen bg-gray-100">
            <AdminSidebar />
            <main className="flex-1 p-4 overflow-y-auto">
              <Outlet />
            </main>
          </div>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="tenders" element={<TendersPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="users" element={<Users />} />
      </Route>

      {/* No sidebar for this route */}
      <Route path="unauthorized" element={<Unauthorized />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
