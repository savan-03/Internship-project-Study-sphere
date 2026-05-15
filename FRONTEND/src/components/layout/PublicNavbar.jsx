import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const PublicNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { isDark } = useTheme();
  const isHomePage = location.pathname === '/';
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isMarketingPage = ['/', '/features', '/about', '/contact', '/login', '/register'].includes(
    location.pathname
  );
  const isCenteredGlass = isHomePage || isAuthPage || isMarketingPage;
  const showSetupCta =
    !loading && isAuthenticated && user && !user.profileSetupCompleted;

  const buttonStyle = {
    background: 'none',
    border: 'none',
    color: isCenteredGlass ? '#f8fafc' : isDark ? '#e2e8f0' : '#334155',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '8px 12px',
    opacity: 0.92,
  };

  const pillStyle = {
    padding: '9px 18px',
    borderRadius: '999px',
    fontSize: '14px',
    cursor: 'pointer',
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: isCenteredGlass ? '24px 28px' : '18px 32px',
        background: isCenteredGlass
          ? 'transparent'
          : isDark
            ? 'rgba(9,14,29,0.78)'
            : 'rgba(250,240,255,0.82)',
        backdropFilter: isCenteredGlass ? 'none' : 'blur(16px)',
        borderBottom: isCenteredGlass ? 'none' : '1px solid rgba(148,163,184,0.18)',
        boxShadow: isCenteredGlass ? 'none' : '0 12px 40px -30px rgba(15,23,42,0.35)',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: isCenteredGlass ? 'center' : 'space-between',
          alignItems: 'center',
          gap: '18px',
          flexWrap: 'wrap',
        }}
      >
        {!isCenteredGlass ? (
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px', color: '#7c3aed' }}>SS</span>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: isDark ? '#f8fafc' : '#0f172a' }}>StudySphere</span>
          </div>
        ) : null}

        <div
          style={{
            display: 'flex',
            gap: '14px',
            alignItems: 'center',
            flexWrap: 'wrap',
            padding: isCenteredGlass ? '14px 22px' : 0,
            borderRadius: isCenteredGlass ? '999px' : 0,
            background: isCenteredGlass ? 'rgba(15,23,42,0.34)' : 'transparent',
            backdropFilter: isCenteredGlass ? 'blur(18px)' : 'none',
            border: isCenteredGlass ? '1px solid rgba(255,255,255,0.12)' : 'none',
            boxShadow: isCenteredGlass ? '0 20px 46px -30px rgba(15,23,42,0.62)' : 'none',
          }}
        >
          <button onClick={() => navigate('/')} style={buttonStyle}>Home</button>
          <button onClick={() => navigate('/features')} style={buttonStyle}>Features</button>
          <button onClick={() => navigate('/about')} style={buttonStyle}>About</button>
          <button onClick={() => navigate('/contact')} style={buttonStyle}>Contact</button>
          {showSetupCta ? (
            <>
              <button
                onClick={() => navigate('/profile/setup')}
                style={{
                  ...pillStyle,
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  border: 'none',
                  color: '#ffffff',
                  boxShadow: '0 18px 36px -24px rgba(59,130,246,0.72)',
                }}
              >
                Complete Setup
              </button>
              <button
                onClick={async () => {
                  await logout();
                  navigate('/login', { replace: true });
                }}
                style={{
                  ...pillStyle,
                  background: 'transparent',
                  border: `1px solid ${isCenteredGlass || isDark ? 'rgba(255,255,255,0.18)' : '#cbd5e1'}`,
                  color: isCenteredGlass ? '#f8fafc' : isDark ? '#f8fafc' : '#0f172a',
                }}
              >
                Logout
              </button>
            </>
          ) : null}
          {!loading && !isAuthenticated && !isAuthPage ? (
            <>
              <button
                onClick={() => navigate('/login')}
                style={{
                  ...pillStyle,
                  background: 'transparent',
                  border: `1px solid ${isCenteredGlass || isDark ? 'rgba(255,255,255,0.18)' : '#cbd5e1'}`,
                  color: isCenteredGlass ? '#f8fafc' : isDark ? '#f8fafc' : '#0f172a',
                }}
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                style={{
                  ...pillStyle,
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  border: 'none',
                  color: '#ffffff',
                  boxShadow: '0 18px 36px -24px rgba(59,130,246,0.72)',
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

export default PublicNavbar;
