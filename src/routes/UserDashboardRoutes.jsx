// src/routes/UserDashboardRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Import main page components that definitely exist
import ProjectsPage from '../pages/Projects';
import CalendarPage from '../pages/Calendar';
import LocationsPage from '../pages/Locations';
import TendersPage from '../pages/Tenders';
import ReportsPage from '../pages/Reports';
import NotificationsPage from '../pages/Notifications';
import SettingsPage from '../pages/Settings';
import ActiveProjectsPage from '../pages/Projects/ActiveProjects';
import TeamPerformancePage from '../pages/Reports/TeamReports';
import FinancialReportsPage from '../pages/Reports/FinancialReports';

// Import TeamPage (the actual component name from your file)
import TeamOverview from '../pages/Team';

// Import Tasks page
import TasksPage from '../pages/Tasks';

// Fallback component for sub-pages that might have issues
const ComingSoonPage = ({ title, description }) => (
  <div className="p-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600">{description || 'This page is coming soon.'}</p>
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-600">
          <strong>Note:</strong> This component may need to be fixed or implemented.
        </p>
      </div>
    </div>
  </div>
);

// Safe imports with fallbacks for sub-pages
const CompletedProjects = () => <ComingSoonPage title="Completed Projects" />;
const ProjectTemplates = () => <ComingSoonPage title="Project Templates" />;
const TeamSchedule = () => <ComingSoonPage title="Team Schedule" />;
const ActiveTenders = () => <ComingSoonPage title="Active Tenders" />;
const DraftTenders = () => <ComingSoonPage title="Draft Tenders" />;
const TenderHistory = () => <ComingSoonPage title="Tender History" />;
const ProjectReports = () => <ComingSoonPage title="Project Reports" />;
const FinancialReports = () => <ComingSoonPage title="Financial Reports" />;
const TeamReports = () => <ComingSoonPage title="Team Reports" />;
const ProfilePage = () => <ComingSoonPage title="User Profile" />;

// Task view components - These will use the same TasksPage but with different props/state
const ActiveTasks = () => <TasksPage initialView="active" />;
const MyTasks = () => <TasksPage initialView="my-tasks" />;
const OverdueTasks = () => <TasksPage initialView="overdue" />;
const CompletedTasks = () => <TasksPage initialView="completed" />;

const UserDashboardRoutes = () => {
  const location = useLocation();
  
  // Simple debug log
  console.log('📍 UserDashboardRoutes:', location.pathname);
  
  return (
    <Routes>
      {/* Default route - dashboard is handled by parent UserDashboard component */}
      <Route path="/" element={<Navigate to="/user/dashboard" replace />} />
      
      {/* Note: dashboard route is handled by UserDashboard component's conditional rendering */}
      
      {/* Projects routes */}
      <Route path="projects" element={<ProjectsPage />} />
      <Route path="projects/active" element={<ActiveProjectsPage />} />
      <Route path="projects/completed" element={<CompletedProjects />} />
      <Route path="projects/templates" element={<ProjectTemplates />} />
      
      {/* Tasks routes */}
      <Route path="tasks" element={<TasksPage />} />
      <Route path="tasks/active" element={<ActiveTasks />} />
      <Route path="tasks/my-tasks" element={<MyTasks />} />
      <Route path="tasks/overdue" element={<OverdueTasks />} />
      <Route path="tasks/completed" element={<CompletedTasks />} />
      
      {/* Calendar */}
      <Route path="calendar" element={<CalendarPage />} />
      
      {/* Team routes */}
      <Route path="team" element={<Navigate to="/user/team/overview" replace />} />
      <Route path="team/overview" element={<TeamOverview />} />
      <Route path="team/performance" element={<TeamPerformancePage />} />
      <Route path="team/schedule" element={<TeamSchedule />} />
      
      {/* Tenders */}
      <Route path="tenders" element={<TendersPage />} />
      <Route path="tenders/active" element={<ActiveTenders />} />
      <Route path="tenders/drafts" element={<DraftTenders />} />
      <Route path="tenders/history" element={<TenderHistory />} />
      
      {/* Locations */}
      <Route path="locations" element={<LocationsPage />} />
      
      {/* Reports */}
      <Route path="reports" element={<ReportsPage />} />
      <Route path="reports/projects" element={<ProjectReports />} />
      <Route path="reports/financial" element={<FinancialReportsPage />} />
      <Route path="reports/team" element={<TeamReports />} />
      
      {/* Notifications */}
      <Route path="notifications" element={<NotificationsPage />} />
      
      {/* Settings */}
      <Route path="settings" element={<SettingsPage />} />
      
      {/* Profile page route (referenced in sidebar) */}
      <Route path="profile" element={<ProfilePage />} />
      
      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
    </Routes>
  );
};

export default UserDashboardRoutes;