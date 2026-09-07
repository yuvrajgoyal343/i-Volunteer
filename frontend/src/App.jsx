// App.jsx — Main router and application entry
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import DonatePage from './pages/DonatePage';
import VolunteerPage from './pages/VolunteerPage';
import OrganisationsPage from './pages/OrganisationsPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

// Redirect logged-in users away from Login and Signup pages to home
function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

// When opening the website, start from sign-in page if not authenticated
function RootRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', fontSize: '1rem', color: 'var(--color-text-secondary)'
      }}>
        Loading…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <HomePage />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/index.html" element={<Navigate to="/" replace />} />

          {/* Auth pages */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route path="/login.html" element={<Navigate to="/login" replace />} />

          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <SignupPage />
              </PublicOnlyRoute>
            }
          />
          <Route path="/signup.html" element={<Navigate to="/signup" replace />} />

          {/* Protected profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile.html" element={<Navigate to="/profile" replace />} />

          {/* Public content pages */}
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/donate.html" element={<Navigate to="/donate" replace />} />

          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/volunteer.html" element={<Navigate to="/volunteer" replace />} />

          <Route path="/organisations" element={<OrganisationsPage />} />
          <Route path="/organisations.html" element={<Navigate to="/organisations" replace />} />

          <Route path="/about" element={<AboutPage />} />
          <Route path="/about.html" element={<Navigate to="/about" replace />} />

          {/* 404 */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/404.html" element={<Navigate to="/404" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
