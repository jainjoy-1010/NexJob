import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Layout
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { JobListPage } from './pages/job/JobListPage';
import { JobDetailPage } from './pages/job/JobDetailPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Candidate Pages
import { CandidateDashboard } from './pages/candidate/CandidateDashboard';
import { ProfilePage } from './pages/candidate/ProfilePage';
import { AppliedJobsPage } from './pages/candidate/AppliedJobsPage';
import { SavedJobsPage } from './pages/candidate/SavedJobsPage';

// Recruiter Pages
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { ManageJobsPage } from './pages/recruiter/ManageJobsPage';
import { PostJobPage } from './pages/recruiter/PostJobPage';
import { ApplicantReviewPage } from './pages/recruiter/ApplicantReviewPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <AppLayout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/jobs" element={<JobListPage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />

              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Candidate Routes */}
              <Route element={<ProtectedRoute role="CANDIDATE" />}>
                <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
                <Route path="/candidate/profile" element={<ProfilePage />} />
                <Route path="/candidate/applications" element={<AppliedJobsPage />} />
                <Route path="/candidate/saved" element={<SavedJobsPage />} />
              </Route>

              {/* Recruiter Routes */}
              <Route element={<ProtectedRoute role="RECRUITER" />}>
                <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                <Route path="/recruiter/jobs" element={<ManageJobsPage />} />
                <Route path="/recruiter/jobs/new" element={<PostJobPage />} />
                <Route path="/recruiter/jobs/:jobId/edit" element={<PostJobPage />} />
                <Route path="/recruiter/jobs/:jobId/applicants" element={<ApplicantReviewPage />} />
              </Route>

              {/* Fallback */}
              <Route path="/403" element={
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">Access Denied</h1>
                  <p className="text-slate-500">You don't have permission to access this page.</p>
                </div>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
