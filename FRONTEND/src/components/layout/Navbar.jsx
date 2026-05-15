import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';

const brandBadgeStyle = {
  width: '42px',
  height: '42px',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, rgba(59,130,246,0.95), rgba(168,85,247,0.92), rgba(236,72,153,0.9))',
  color: '#fff',
  fontWeight: 900,
  letterSpacing: '0.08em',
  boxShadow: '0 18px 30px -22px rgba(168,85,247,0.65)',
};

const linkButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#334155',
  fontSize: '16px',
  cursor: 'pointer',
  padding: '8px 12px',
  opacity: 0.88,
};

const authButtonStyle = {
  padding: '8px 20px',
  borderRadius: '10px',
  fontSize: '14px',
  cursor: 'pointer',
};

const workspaceButton = (background, color, border = 'none') => ({
  padding: '10px 18px',
  background,
  border,
  borderRadius: '12px',
  color,
  fontSize: '14px',
  cursor: 'pointer',
  backdropFilter: 'blur(10px)',
});

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const goTo = (path) => navigate(path);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (!loading && isAuthenticated) {
    const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';

    return (
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: '18px 28px',
          background:
            'linear-gradient(135deg, rgba(15,23,42,0.94), rgba(37,99,235,0.16) 42%, rgba(139,92,246,0.18) 100%)',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(148,163,184,0.18)',
          boxShadow: '0 18px 45px -32px rgba(15,23,42,0.6)',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px',
          }}
        >
          <div
            onClick={() => goTo(dashboardPath)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <span style={brandBadgeStyle}>SS</span>
            <div>
              <div style={{ fontSize: '23px', fontWeight: 'bold', color: '#f8fafc' }}>StudySphere</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                {user?.fullName || user?.username || 'Workspace'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => goTo('/profile')} style={workspaceButton('linear-gradient(135deg, #8b5cf6, #ec4899)', '#fff')}>
              Profile
            </button>
            <button onClick={() => goTo(dashboardPath)} style={workspaceButton('#10b981', '#fff')}>
              Dashboard
            </button>
            <button onClick={() => goTo('/resources')} style={workspaceButton('#8b5cf6', '#fff')}>
              Resources
            </button>
            <button onClick={() => goTo('/dsa')} style={workspaceButton('rgba(34,197,94,0.16)', '#bbf7d0', '1px solid rgba(74,222,128,0.2)')}>
              DSA
            </button>
            <button onClick={() => goTo('/notifications')} style={workspaceButton('rgba(59,130,246,0.18)', '#e0f2fe', '1px solid rgba(125,211,252,0.2)')}>
              Notifications
              {unreadCount ? (
                <span style={{ marginLeft: '8px', display: 'inline-flex', minWidth: '20px', height: '20px', borderRadius: '999px', alignItems: 'center', justifyContent: 'center', background: '#ffffff', color: '#2563eb', fontSize: '12px', fontWeight: 800, padding: '0 6px' }}>
                  {unreadCount}
                </span>
              ) : null}
            </button>
            <button onClick={() => goTo('/leaderboard')} style={workspaceButton('rgba(250,204,21,0.16)', '#fde68a', '1px solid rgba(253,224,71,0.22)')}>
              Leaderboard
            </button>
            <button onClick={() => goTo('/settings')} style={workspaceButton('rgba(255,255,255,0.08)', '#e2e8f0', '1px solid rgba(255,255,255,0.14)')}>
              Settings
            </button>
            <button onClick={handleLogout} style={workspaceButton('linear-gradient(135deg, rgba(248,250,252,0.98), rgba(226,232,240,0.96))', '#1e293b', '1px solid rgba(226,232,240,0.85)')}>
              Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '20px 40px',
        background: 'rgba(250,240,255,0.82)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(148,163,184,0.18)',
        boxShadow: '0 12px 40px -30px rgba(15,23,42,0.35)',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px',
        }}
      >
        <div
          onClick={() => goTo('/')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <span style={brandBadgeStyle}>SS</span>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>StudySphere</span>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => goTo('/')} style={linkButtonStyle}>Home</button>
          <button onClick={() => goTo('/features')} style={linkButtonStyle}>Features</button>
          <button onClick={() => goTo('/about')} style={linkButtonStyle}>About</button>
          <button onClick={() => goTo('/contact')} style={linkButtonStyle}>Contact</button>
          {!loading && !isAuthenticated ? (
            <>
              <button
                onClick={() => goTo('/login')}
                style={{
                  ...authButtonStyle,
                  background: 'transparent',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                }}
              >
                Login
              </button>
              <button
                onClick={() => goTo('/register')}
                style={{
                  ...authButtonStyle,
                  background: '#3b82f6',
                  border: 'none',
                  color: '#fff',
                }}
              >
                Sign Up
              </button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
