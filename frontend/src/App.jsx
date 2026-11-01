import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import { LoadingSpinner } from './components/ui/index';

// =========================================================
// Lazy-loaded routes — Week 8: Code splitting
// Each import() creates a separate JS chunk in the build
// =========================================================
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

// Authenticated pages (heavier — benefit most from lazy loading)
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const AiAssistantPage = lazy(() => import('./pages/AiAssistantPage'));
const GitHubExplorerPage = lazy(() => import('./pages/GitHubExplorerPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const PerformancePage = lazy(() => import('./pages/PerformancePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Portfolio routes (separate code chunk)
const PortfolioLayout = lazy(() => import('./pages/portfolio/PortfolioLayout'));
const PortfolioHomePage = lazy(() => import('./pages/portfolio/PortfolioHomePage'));
const PortfolioProjectsPage = lazy(() => import('./pages/portfolio/PortfolioProjectsPage'));
const PortfolioContactPage = lazy(() => import('./pages/portfolio/PortfolioContactPage'));

// Global loading fallback for Suspense boundaries
const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <LoadingSpinner size={32} message="Loading page..." />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Portfolio routes — accessible without auth */}
              <Route path="/portfolio" element={<PortfolioLayout />}>
                <Route index element={<PortfolioHomePage />} />
                <Route path="projects" element={<PortfolioProjectsPage />} />
                <Route path="contact" element={<PortfolioContactPage />} />
              </Route>

              {/* Protected authenticated routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="ai-assistant" element={<AiAssistantPage />} />
                <Route path="github" element={<GitHubExplorerPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="performance" element={<PerformancePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={
                <div className="not-found-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '4rem', fontWeight: 900, color: '#3d3d5c' }}>404</div>
                  <h1>Page not found</h1>
                  <p>The page you're looking for doesn't exist.</p>
                  <a href="/" className="btn-brand">Go Home</a>
                </div>
              } />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
