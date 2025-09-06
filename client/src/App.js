import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import Chatbot from './components/Chatbot';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
// import UserDashboard from './pages/UserDashboard'; // Removed - using UserProfile as main dashboard
import AdminDashboard from './pages/AdminDashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UserProfile from './pages/UserProfile';
import ApplicationForm from './pages/ApplicationForm';
import ApplicationFormWithPayment from './components/ApplicationFormWithPayment';
import ScholarshipDetail from './pages/ScholarshipDetail';
import ScholarshipApplicationForm from './pages/ScholarshipApplicationForm';
import BookmarksPage from './pages/BookmarksPage';
import ProfileDashboard from './pages/ProfileDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (adminOnly) {
    return isAdmin ? children : <Navigate to="/admin-login" />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const { loading } = useAuth();
  const location = useLocation();

  // Define pages where footer should be shown
  const showFooterPages = ['/', '/courses'];
  const shouldShowFooter = showFooterPages.includes(location.pathname) || 
                          location.pathname.startsWith('/courses/');

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/scholarships/:id" element={<ScholarshipDetail />} />
          
          {/* Protected User Routes */}
          <Route 
            path="/dashboard" 
            element={<Navigate to="/profile" replace />}
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfileDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/apply/:id" 
            element={
              <ProtectedRoute>
                <ApplicationFormWithPayment />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/apply/scholarship/:id" 
            element={
              <ProtectedRoute>
                <ApplicationFormWithPayment />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/apply-scholarship/:scholarshipId" 
            element={
              <ProtectedRoute>
                <ScholarshipApplicationForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bookmarks" 
            element={
              <ProtectedRoute>
                <BookmarksPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {shouldShowFooter && <Footer />}
      <Chatbot />
    </div>
  );
}

export default App;