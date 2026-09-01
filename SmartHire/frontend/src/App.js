import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import AppLayout from "./components/AppLayout";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import JobDetailPage from "./pages/JobDetailPage";
import CompanyPage from "./pages/CompanyPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import StaffUsersPage from "./pages/StaffUsersPage";
import CandidateUsersPage from "./pages/CandidateUsersPage";
import JobsPage from "./pages/JobsPage";
import CreateJobPage from "./pages/CreateJobPage";
import EditJobPage from "./pages/EditJobPage";
import JobSkillsPage from "./pages/JobSkillsPage";
import SkillsPage from "./pages/SkillsPage";
import MyCvsPage from "./pages/MyCvsPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import ApplicationDetailPage from "./pages/ApplicationDetailPage";
import InterviewsPage from "./pages/InterviewsPage";
import NotificationsPage from "./pages/NotificationsPage";
import RankingsPage from "./pages/RankingsPage";
import StatisticsPage from "./pages/StatisticsPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/my-cvs"
            element={
              <PrivateRoute>
                <AppLayout>
                  <MyCvsPage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/my-applications"
            element={
              <PrivateRoute>
                <AppLayout>
                  <MyApplicationsPage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/jobs/new"
            element={
              <PrivateRoute>
                <AppLayout>
                  <CreateJobPage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/jobs/:id/edit"
            element={
              <PrivateRoute>
                <AppLayout>
                  <EditJobPage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/jobs/:id/skills"
            element={
              <PrivateRoute>
                <AppLayout>
                  <JobSkillsPage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/jobs/:id"
            element={
              <PrivateRoute>
                <AppLayout>
                  <JobDetailPage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/jobs"
            element={
              <PrivateRoute>
                <AppLayout>
                  <JobsPage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/applications"
            element={
              <PrivateRoute>
                <AppLayout>
                  <ApplicationsPage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/applications/:id"
            element={
              <PrivateRoute>
                <AppLayout>
                  <ApplicationDetailPage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/interviews"
            element={
              <PrivateRoute>
                <AppLayout>
                  <InterviewsPage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/rankings"
            element={
              <PrivateRoute>
                <AppLayout>
                  <RankingsPage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/statistics"
            element={
              <PrivateRoute>
                <AppLayout>
                  <StatisticsPage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <AppLayout>
                  <NotificationsPage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/company"
            element={
              <PrivateRoute>
                <AppLayout>
                  <CompanyPage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/departments"
            element={
              <PrivateRoute>
                <AppLayout>
                  <DepartmentsPage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/staff-users"
            element={
              <PrivateRoute>
                <AppLayout>
                  <StaffUsersPage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/candidate-users"
            element={
              <PrivateRoute>
                <AppLayout>
                  <CandidateUsersPage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/skills"
            element={
              <PrivateRoute>
                <AppLayout>
                  <SkillsPage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
