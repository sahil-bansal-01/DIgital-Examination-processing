import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Preloader } from './components/preloader/Preloader';
import { Layout } from './components/layout/Layout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AcademicSetup } from './pages/AcademicSetup';
import { ExamManagement } from './pages/ExamManagement';
import { MarksEntry } from './pages/MarksEntry';
import { ProcessingEngine } from './pages/ProcessingEngine';
import { PerformanceLab } from './pages/PerformanceLab';
import { ResultsReports } from './pages/ResultsReports';
import { StudentResults } from './pages/StudentResults';
import { ReEvaluationAdmin } from './pages/ReEvaluationAdmin';
import { AuditLogViewer } from './pages/AuditLogViewer';
import { CappLab } from './pages/capp-lab/CappLab';
import { CappInsights } from './pages/CappInsights';

// Protected Route Guard with Role check
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-mono text-sm">
        Authenticating session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Route proxy for results based on role
const ResultsReportsProxy = () => {
  const { isStudent } = useAuth();
  return isStudent ? <StudentResults /> : <ResultsReports />;
};

export const AppContent = () => {
  const [preloaderDone, setPreloaderDone] = useState(false);

  return (
    <>
      <Preloader onFinish={() => setPreloaderDone(true)} />

      <Routes>
        {/* Public Login */}
        <Route path="/login" element={<Login />} />

        {/* Authenticated Dashboard & Feature Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Academic Setup (Admin) */}
          <Route
            path="/academic"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AcademicSetup />
              </ProtectedRoute>
            }
          />

          {/* Exam Management (Admin & Teacher) */}
          <Route
            path="/exams"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <ExamManagement />
              </ProtectedRoute>
            }
          />

          {/* Marks Entry (Admin & Teacher) */}
          <Route
            path="/marks"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <MarksEntry />
              </ProtectedRoute>
            }
          />

          {/* CAPP Result Processing Engine (Admin) */}
          <Route
            path="/processing"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProcessingEngine />
              </ProtectedRoute>
            }
          />

          {/* CAPP Performance Lab (Admin & Teacher) */}
          <Route
            path="/performance-lab"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <PerformanceLab />
              </ProtectedRoute>
            }
          />

          {/* Results & Reports (Admin, Teacher & Student) */}
          <Route
            path="/results"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
                <ResultsReportsProxy />
              </ProtectedRoute>
            }
          />

          {/* Student Official Results & Marksheet (Student) */}
          <Route
            path="/my-results"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentResults />
              </ProtectedRoute>
            }
          />

          {/* Re-Evaluations (Student & Admin) */}
          <Route
            path="/reevaluation"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <ReEvaluationAdmin />
              </ProtectedRoute>
            }
          />

          {/* Audit Trail (Admin) */}
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AuditLogViewer />
              </ProtectedRoute>
            }
          />

          {/* CAPP Lab (Admin, Teacher, Student) */}
          <Route
            path="/capp-lab"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
                <CappLab />
              </ProtectedRoute>
            }
          />

          {/* CAPP Insights (Admin, Teacher, Student) */}
          <Route
            path="/capp-insights"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
                <CappInsights />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
