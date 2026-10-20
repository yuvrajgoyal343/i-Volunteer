import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ThemeProvider, useAuth } from './context';
import { ProtectedRoute } from './components';
import {
  HomePage,
  LoginPage,
  SignupPage,
  ProfilePage,
  DonatePage,
  VolunteerPage,
  OrganisationsPage,
  AboutPage,
  NotFoundPage
} from './pages';

// Redirect users who are already logged-in away from Login and Signup pages
function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/profile" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
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
    </ThemeProvider>
  );
}
