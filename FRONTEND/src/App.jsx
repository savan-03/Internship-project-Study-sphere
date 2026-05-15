// src/App.jsx
import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/context/AuthContext';
import { DsaProvider } from './components/context/DsaContext';
import { GamificationProvider } from './components/context/GamificationContext';
import { ResourceProvider } from './components/context/ResourceContext';
import { NotificationsProvider } from './components/context/NotificationsContext';
import { ThemeProvider } from './components/context/ThemeContext';
import Navbar from './components/layout/PublicNavbar';
import AuthenticatedSidebar from './components/layout/AuthenticatedSidebar';


// Pages
import Homepage from './PAGES/Homepage';
import Loginpage from './auth/Loginpage';
import Dashboard from './PAGES/Dashboard';
import DsaPractice from './PAGES/DsaPractice';
import DsaProblemWorkbench from './PAGES/DsaProblemWorkbench';
import DsaAttempts from './PAGES/DsaAttempts';
import AiHub from './PAGES/AIHub';
import AiQuizPage from './PAGES/AiQuizPage';
import AiInterviewPage from './PAGES/AiInterviewPage';
import AiAssistantPage from './PAGES/AiAssistantPage';
import Analytics from './PAGES/Analytics';
import Settings from './PAGES/Settings';
import Features from './PAGES/Features';
import SocialHub from './PAGES/SocialHub';
import GroupsPage from './PAGES/GroupsPage';
import ForumsPage from './PAGES/ForumsPage';
import SocialChatPage from './PAGES/SocialChatPage';
import Leaderboard from './PAGES/Leaderboard';
import About from './PAGES/About';
import Contact from './PAGES/Contact';
import NotFound from './PAGES/NotFound';
import UserProfilePage from './PAGES/UserProfilePage';
import AdminProfilePage from './PAGES/AdminProfilePage';
import ModeratorProfilePage from './PAGES/ModeratorProfilePage';


// Resource Pages
import ResourceLibrary from './PAGES/ResourceLibrary';
import ResourceSaved from './PAGES/ResourceSaved';
import ResourceCollections from './PAGES/ResourceCollections';
import ResourceCollectionDetail from './PAGES/ResourceCollectionDetail';
import ResourceMyUploads from './PAGES/ResourceMyUploads';
import ResourceReviewsPage from './PAGES/ResourceReviewsPage';
import ResourceVerificationPage from './PAGES/ResourceVerificationPage';
import Notifications from './PAGES/Notifications';
import UploadResource from './components/resources/UploadResource';
import ResourceDetail from './PAGES/ResourceDetail';
import ProfileWizard from './components/resources/ProfileWizard';


// Admin
import AdminDashboard from './components/Admin/Pages/AdminDashboard';
import AdminUsers from './components/Admin/Pages/AdminUsers';
import AdminResources from './components/Admin/Pages/AdminResources';
import AdminAnalytics from './components/Admin/Pages/AdminAnalytics';
import AdminSettings from './components/Admin/Pages/AdminSettings';
import { AdminProvider } from './components/Admin/context/AdminContext';


const resolveProfileExperience = (user) => {
  if (!user) return 'guest';
  if (user.role === 'admin') return 'admin';
  if (user.role === 'moderator') return 'moderator';
  return 'user';
};

const FullScreenLoader = ({ label = 'Loading StudySphere...' }) => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #050816 0%, #111827 55%, #1e1b4b 100%)',
      color: '#f8fafc',
      padding: '24px',
      textAlign: 'center',
    }}
  >
    <div
      style={{
        padding: '22px 26px',
        borderRadius: '22px',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(15,23,42,0.5)',
        boxShadow: '0 20px 50px -34px rgba(15,23,42,0.7)',
        backdropFilter: 'blur(14px)',
        fontWeight: 700,
      }}
    >
      {label}
    </div>
  </div>
);


const AuthPageRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <FullScreenLoader label="Restoring your account..." />;
  if (!isAuthenticated || !user) return <Loginpage />;

  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};


const DashboardRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <FullScreenLoader label="Opening your dashboard..." />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Dashboard />;
};

const AnalyticsRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <FullScreenLoader label="Loading analytics..." />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/analytics" replace />;
  return <Analytics />;
};

const SettingsRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <FullScreenLoader label="Opening settings..." />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/settings" replace />;
  return <Settings />;
};


const ProfileRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <FullScreenLoader label="Loading your profile..." />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  switch (resolveProfileExperience(user)) {
    case 'admin':
      return (
        <AdminProvider>
          <AdminProfilePage />
        </AdminProvider>
      );
    case 'moderator':
      return <ModeratorProfilePage />;
    default:
      return <UserProfilePage />;
  }
};


const SetupRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <FullScreenLoader label="Preparing profile setup..." />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  return <ProfileWizard />;
};


const ModerationRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <FullScreenLoader label="Loading moderation tools..." />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (resolveProfileExperience(user) !== 'moderator') return <Navigate to="/profile" replace />;
  return <ModeratorProfilePage />;
};


const NotificationsRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <FullScreenLoader label="Loading notifications..." />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  return <Notifications />;
};

const DirectChatLegacyRoute = () => {
  const { userId } = useParams();
  return <Navigate to={`/social/chat?mode=direct&user=${encodeURIComponent(userId || '')}`} replace />;
};

const GroupFocusLegacyRoute = () => {
  const { groupId } = useParams();
  return <Navigate to={`/groups?group=${encodeURIComponent(groupId || '')}`} replace />;
};

const ForumFocusLegacyRoute = () => {
  const { threadId } = useParams();
  return <Navigate to={`/forums?thread=${encodeURIComponent(threadId || '')}`} replace />;
};

const WorkspaceRoute = ({ element }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <FullScreenLoader label="Opening workspace..." />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  return element;
};

const DsaRoute = ({ element }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <FullScreenLoader label="Opening DSA practice..." />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  return element;
};


const AdminOnlyRoute = ({ element }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <FullScreenLoader label="Checking admin access..." />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/profile" replace />;
  return element;
};


const withAdminShell = (component) => (
  <AdminOnlyRoute
    element={(
      <AdminProvider>
        {component}
      </AdminProvider>
    )}
  />
);

const AppShell = () => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const [isDesktopSidebar, setIsDesktopSidebar] = useState(() =>
    typeof window === 'undefined' ? true : window.innerWidth >= 1080
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const hiddenPublicNavbarRoutes = [];
  const shouldHidePublicNavbar = hiddenPublicNavbarRoutes.includes(location.pathname);
  const showSidebar = !loading && isAuthenticated;
  const pageLabel = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/resources')) return 'Resources';
    if (path.startsWith('/dsa')) return 'DSA Practice';
    if (path.startsWith('/ai')) return 'AI Studio';
    if (path.startsWith('/social') || path.startsWith('/community') || path.startsWith('/groups') || path.startsWith('/forums')) return 'Community';
    if (path.startsWith('/notifications')) return 'Notifications';
    if (path.startsWith('/leaderboard')) return 'Leaderboard';
    if (path.startsWith('/analytics')) return 'Analytics';
    if (path.startsWith('/settings')) return 'Settings';
    if (path.startsWith('/profile')) return 'Profile';
    if (path.startsWith('/admin')) return 'Admin';
    return 'StudySphere';
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      const nextDesktop = window.innerWidth >= 1080;
      setIsDesktopSidebar(nextDesktop);
      if (nextDesktop) {
        setMobileSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  if (loading) {
    return <FullScreenLoader label="Loading StudySphere..." />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        marginLeft: showSidebar && isDesktopSidebar ? '280px' : '0',
        transition: 'margin-left 0.25s ease',
      }}
    >
      {showSidebar ? (
        <AuthenticatedSidebar
          isDesktop={isDesktopSidebar}
          isOpen={isDesktopSidebar || mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
      ) : null}
      {showSidebar && !isDesktopSidebar ? (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 950,
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(7,13,28,0.96), rgba(43,18,74,0.92))',
            borderBottom: '1px solid rgba(148,163,184,0.14)',
            backdropFilter: 'blur(18px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={() => setMobileSidebarOpen((current) => !current)}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              color: '#f8fafc',
              fontSize: '20px',
              cursor: 'pointer',
            }}
          >
            {mobileSidebarOpen ? '×' : '☰'}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              StudySphere
            </div>
            <div style={{ color: '#f8fafc', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {pageLabel}
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
            style={{
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(59,130,246,0.14)',
              color: '#bfdbfe',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Top
          </button>
        </div>
      ) : null}
      {!showSidebar && !shouldHidePublicNavbar ? <Navbar /> : null}
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<AuthPageRoute />} />
        <Route path="/register" element={<AuthPageRoute />} />

        <Route path="/features" element={<Features />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/dashboard" element={<DashboardRoute />} />
        <Route path="/analytics" element={<AnalyticsRoute />} />
        <Route path="/profile" element={<ProfileRoute />} />
        <Route path="/profile/setup" element={<SetupRoute />} />
        <Route path="/profile/me" element={<ProfileRoute />} />
        <Route path="/users/:userId" element={<WorkspaceRoute element={<UserProfilePage />} />} />
        <Route path="/settings" element={<SettingsRoute />} />

        <Route path="/resources" element={<WorkspaceRoute element={<ResourceLibrary />} />} />
        <Route path="/resources/upload" element={<WorkspaceRoute element={<UploadResource />} />} />
        <Route path="/resources/my-uploads" element={<WorkspaceRoute element={<ResourceMyUploads />} />} />
        <Route path="/resources/saved" element={<WorkspaceRoute element={<ResourceSaved />} />} />
        <Route path="/resources/collections" element={<WorkspaceRoute element={<ResourceCollections />} />} />
        <Route path="/resources/collections/:collectionId" element={<WorkspaceRoute element={<ResourceCollectionDetail />} />} />
        <Route path="/resources/reviews" element={<WorkspaceRoute element={<ResourceReviewsPage />} />} />
        <Route path="/resources/verification" element={<WorkspaceRoute element={<ResourceVerificationPage />} />} />
        <Route path="/resources/:id" element={<WorkspaceRoute element={<ResourceDetail />} />} />
        <Route path="/upload-resource" element={<Navigate to="/resources/upload" replace />} />
        <Route path="/resource/:id" element={<WorkspaceRoute element={<ResourceDetail />} />} />

        <Route path="/dsa" element={<DsaRoute element={<DsaPractice />} />} />
        <Route path="/dsa/practice" element={<DsaRoute element={<DsaPractice />} />} />
        <Route path="/dsa/practice/:slug" element={<DsaRoute element={<DsaProblemWorkbench />} />} />
        <Route path="/dsa/problem/:slug" element={<DsaRoute element={<DsaProblemWorkbench />} />} />
        <Route path="/dsa/attempts" element={<DsaRoute element={<DsaAttempts />} />} />
        <Route path="/ai" element={<WorkspaceRoute element={<AiHub />} />} />
        <Route path="/ai/quiz" element={<WorkspaceRoute element={<AiQuizPage />} />} />
        <Route path="/ai/interview" element={<WorkspaceRoute element={<AiInterviewPage />} />} />
        <Route path="/ai/assistant" element={<WorkspaceRoute element={<AiAssistantPage />} />} />
        <Route path="/social" element={<WorkspaceRoute element={<SocialHub />} />} />
        <Route path="/community" element={<Navigate to="/social" replace />} />
        <Route path="/community/groups" element={<Navigate to="/groups" replace />} />
        <Route path="/community/forums" element={<Navigate to="/forums" replace />} />
        <Route path="/community/chat" element={<Navigate to="/social/chat" replace />} />
        <Route path="/groups" element={<WorkspaceRoute element={<GroupsPage />} />} />
        <Route path="/groups/:groupId" element={<WorkspaceRoute element={<GroupFocusLegacyRoute />} />} />
        <Route path="/social/groups" element={<Navigate to="/groups" replace />} />
        <Route path="/social/groups/:groupId" element={<WorkspaceRoute element={<GroupFocusLegacyRoute />} />} />
        <Route path="/forums" element={<WorkspaceRoute element={<ForumsPage />} />} />
        <Route path="/forums/:threadId" element={<WorkspaceRoute element={<ForumFocusLegacyRoute />} />} />
        <Route path="/social/forums" element={<Navigate to="/forums" replace />} />
        <Route path="/social/forums/:threadId" element={<WorkspaceRoute element={<ForumFocusLegacyRoute />} />} />
        <Route path="/social/chat" element={<WorkspaceRoute element={<SocialChatPage />} />} />
        <Route path="/social/direct/:userId" element={<WorkspaceRoute element={<DirectChatLegacyRoute />} />} />
        <Route path="/leaderboard" element={<WorkspaceRoute element={<Leaderboard />} />} />
        <Route path="/notifications" element={<WorkspaceRoute element={<Notifications />} />} />
        <Route path="/moderation" element={<ModerationRoute />} />

        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={withAdminShell(<AdminDashboard />)} />
        <Route path="/admin/profile" element={withAdminShell(<AdminProfilePage />)} />
        <Route path="/admin/users" element={withAdminShell(<AdminUsers />)} />
        <Route path="/admin/resources" element={withAdminShell(<AdminResources />)} />
        <Route path="/admin/analytics" element={withAdminShell(<AdminAnalytics />)} />
        <Route path="/admin/settings" element={withAdminShell(<AdminSettings />)} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};


const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationsProvider>
          <GamificationProvider>
            <DsaProvider>
              <ResourceProvider>
                <AppShell />
              </ResourceProvider>
            </DsaProvider>
          </GamificationProvider>
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};


export default App;
