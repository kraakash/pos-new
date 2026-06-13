import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './components/Dashboard';
import ProblemsPage from './pages/ProblemsPage';
import PracticePage from './pages/PracticePage';
import ResumePage from './pages/ResumePage';
import InterviewPage from './pages/InterviewPage';
import ProfilePage from './pages/ProfilePage';

// Database-driven Roadmap pages
import RoadmapPage from './pages/RoadmapPage';
import RoadmapDashboard from './pages/RoadmapDashboard';
import RoadmapSectionPage from './pages/RoadmapSectionPage';

import { useAuthStore } from './store/authStore';
import { dashboardPath, profilePath, userHandle } from './lib/routes';

/**
 * Route Boundary Wrapper requiring user authorization.
 * Redirects guests back to login.
 * 
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Guarded children elements
 */
function ProtectedRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }
  return children;
}

/**
 * Redirects signed-in candidates to their personal userHandle dashboard,
 * otherwise redirects guests to login.
 */
function DashboardRedirect() {
  const user = useAuthStore((s) => s.user);
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <Navigate to={dashboardPath(user)} replace />;
}

/**
 * Redirects authenticated profiles to the username path.
 */
function ProfileRedirect() {
  const user = useAuthStore((s) => s.user);
  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }
  return <Navigate to={profilePath(user)} replace />;
}

/**
 * Renders the dashboard if the logged-in candidate is viewing their own profile handle,
 * otherwise falls back to the public view-only profile layout page.
 */
function PublicOrOwnerDashboardRoute() {
  const { username } = useParams();
  const user = useAuthStore((s) => s.user);
  
  const isOwner = user && username === userHandle(user);
  return isOwner ? <DashboardPage /> : <ProfilePage />;
}

/**
 * App Main Root Router Component
 * Declares all routes, auth parameters, and path bindings.
 */
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Core Marketing / Setup routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

        {/* Dashboard redirects */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Database-driven Roadmap pathways */}
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/roadmap/dashboard" element={<RoadmapDashboard />} />
        <Route path="/roadmap/:sectionId" element={<RoadmapSectionPage />} />

        {/* Practice and Problems Library */}
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/practice/:id" element={<PracticePage />} />

        {/* Resume Analyzer and Mock Interviews */}
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/interview" element={<InterviewPage />} />

        {/* Profiles */}
        <Route path="/profile" element={<ProfileRedirect />} />
        <Route path="/profile/:username" element={<ProfilePage />} />

        {/* Custom username dashboard/public view route */}
        <Route path="/:username" element={<PublicOrOwnerDashboardRoute />} />

        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
