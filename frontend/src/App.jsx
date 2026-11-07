import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import BusinessSearchPage from './pages/BusinessSearchPage';
import SearchResultsPage from './pages/SearchResultsPage';
import BulkSearchPage from './pages/BulkSearchPage';
import SavedLeadsPage from './pages/SavedLeadsPage';
import SearchHistoryPage from './pages/SearchHistoryPage';
import ReportsPage from './pages/ReportsPage';
import SubscriptionPlansPage from './pages/SubscriptionPlansPage';
import PaymentPage from './pages/PaymentPage';
import UserProfilePage from './pages/UserProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';

// Route guards
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-slate-400">Loading account...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-slate-400">Verifying privileges...</div>;
  }
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/pricing" element={<SubscriptionPlansPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Customer Protected Pages */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><BusinessSearchPage /></ProtectedRoute>} />
              <Route path="/results" element={<ProtectedRoute><SearchResultsPage /></ProtectedRoute>} />
              <Route path="/bulk-search" element={<ProtectedRoute><BulkSearchPage /></ProtectedRoute>} />
              <Route path="/leads" element={<ProtectedRoute><SavedLeadsPage /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><SearchHistoryPage /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
              <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />

              {/* Admin Protected Pages */}
              <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

              {/* Catch-all redirect to Home or Dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
