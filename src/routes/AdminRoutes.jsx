// src/routes/AdminRoutes.jsx
import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Pages
import AdminDashboard from "../components/dashboards/AdminDashboard";
import AnalyticsPage from "../pages/admin/Analytics";
import ProjectsPage from "../pages/admin/projects";
import TasksPage from "../pages/admin/Tasks";
import TeamPage from "../pages/admin/Team";
import CalendarPage from "../pages/admin/calender";
import TendersPage from "../pages/admin/Tenders";
import MeetingsPage from "../pages/admin/MeetingsPage";
import ReportsPage from "../pages/admin/Reports";
import HistoryPage from "../pages/admin/HistoryPage";
import NotificationsPage from "../pages/admin/Notifications";
import SettingsPage from "../pages/admin/Settings";
import Users from "../pages/admin/Users";
import Unauthorized from "../pages/Unauthorized";
import ProjectManagerDetails from "../pages/admin/ProjectManagerDetails";

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Layout route - NO wrapper needed since each page includes its own sidebar */}
      <Route
        element={
          <Outlet />
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="tenders" element={<TendersPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="meetings" element={<MeetingsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="users" element={<Users />} />
        <Route path="project-manager/:managerId" element={<ProjectManagerDetails />} />
      </Route>

      {/* No sidebar for this route */}
      <Route path="unauthorized" element={<Unauthorized />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;