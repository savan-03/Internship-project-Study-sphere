import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';

const baseButtonStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  textAlign: 'left',
  padding: '14px 16px',
  borderRadius: '18px',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  border: '1px solid rgba(255,255,255,0.08)',
  outline: 'none',
  boxShadow: 'none',
  transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
  WebkitTapHighlightColor: 'transparent',
  appearance: 'none',
};

const AuthenticatedSidebar = ({ isDesktop = true, isOpen = true, onClose = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator';
  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
  const profilePath = isAdmin ? '/admin/profile' : '/profile';
  const settingsPath = isAdmin ? '/admin/settings' : '/settings';
  const directMatches = ['/profile', '/dashboard', '/resources', '/resources/verification', '/ai', '/social', '/dsa', '/notifications', '/leaderboard', '/settings', '/admin/users', '/admin/resources', '/admin/analytics'];

  const goTo = (path) => {
    navigate(path);
    if (!isDesktop) {
      onClose();
    }
  };

  const navItems = isAdmin
    ? [
        {
          label: 'Profile',
          path: profilePath,
          background: 'linear-gradient(135deg, rgba(139,92,246,0.22), rgba(236,72,153,0.18))',
          color: '#fdf2f8',
          borderColor: 'rgba(236,72,153,0.24)',
        },
        {
          label: 'Dashboard',
          path: dashboardPath,
          background: 'linear-gradient(135deg, rgba(16,185,129,0.24), rgba(45,212,191,0.18))',
          color: '#ecfdf5',
          borderColor: 'rgba(45,212,191,0.24)',
        },
        {
          label: 'Users',
          path: '/admin/users',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.24), rgba(14,165,233,0.16))',
          color: '#e0f2fe',
          borderColor: 'rgba(125,211,252,0.24)',
        },
        {
          label: 'Resources',
          path: '/admin/resources',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.24), rgba(168,85,247,0.18))',
          color: '#eef2ff',
          borderColor: 'rgba(129,140,248,0.24)',
        },
        {
          label: 'Analytics',
          path: '/admin/analytics',
          background: 'linear-gradient(135deg, rgba(250,204,21,0.18), rgba(249,115,22,0.12))',
          color: '#fde68a',
          borderColor: 'rgba(253,224,71,0.22)',
        },
        {
          label: 'Settings',
          path: settingsPath,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(148,163,184,0.06))',
          color: '#e2e8f0',
          borderColor: 'rgba(255,255,255,0.14)',
        },
      ]
    : [
        {
          label: 'Profile',
          path: profilePath,
          background: 'linear-gradient(135deg, rgba(139,92,246,0.22), rgba(236,72,153,0.18))',
          color: '#fdf2f8',
          borderColor: 'rgba(236,72,153,0.24)',
        },
        {
          label: 'Dashboard',
          path: dashboardPath,
          background: 'linear-gradient(135deg, rgba(16,185,129,0.24), rgba(45,212,191,0.18))',
          color: '#ecfdf5',
          borderColor: 'rgba(45,212,191,0.24)',
        },
        {
          label: 'Resources',
          path: '/resources',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.24), rgba(168,85,247,0.18))',
          color: '#eef2ff',
          borderColor: 'rgba(129,140,248,0.24)',
        },
        ...(isModerator
          ? [
              {
                label: 'Verification',
                path: '/resources/verification',
                background: 'linear-gradient(135deg, rgba(250,204,21,0.18), rgba(249,115,22,0.12))',
                color: '#fde68a',
                borderColor: 'rgba(253,224,71,0.22)',
              },
            ]
          : [
              {
                label: 'AI Studio',
                path: '/ai',
                background: 'linear-gradient(135deg, rgba(244,114,182,0.18), rgba(168,85,247,0.16))',
                color: '#fce7f3',
                borderColor: 'rgba(244,114,182,0.2)',
              },
            ]),
        {
          label: 'Community',
          path: '/social',
          background: 'linear-gradient(135deg, rgba(56,189,248,0.18), rgba(34,197,94,0.12))',
          color: '#e0f2fe',
          borderColor: 'rgba(56,189,248,0.2)',
        },
        {
          label: 'DSA Practice',
          path: '/dsa',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.16), rgba(16,185,129,0.14))',
          color: '#bbf7d0',
          borderColor: 'rgba(74,222,128,0.2)',
        },
        {
          label: 'Notifications',
          path: '/notifications',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(14,165,233,0.14))',
          color: '#e0f2fe',
          borderColor: 'rgba(125,211,252,0.2)',
          badge: unreadCount || 0,
        },
        {
          label: 'Leaderboard',
          path: '/leaderboard',
          background: 'linear-gradient(135deg, rgba(250,204,21,0.18), rgba(249,115,22,0.12))',
          color: '#fde68a',
          borderColor: 'rgba(253,224,71,0.22)',
        },
        {
          label: 'Settings',
          path: settingsPath,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(148,163,184,0.06))',
          color: '#e2e8f0',
          borderColor: 'rgba(255,255,255,0.14)',
        },
      ];

  const isItemActive = (path) => {
    if (path === '/dashboard' || path === '/admin/dashboard') {
      return location.pathname === path;
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`) || (!directMatches.includes(location.pathname) && path === '/social' && ['/groups', '/forums'].includes(location.pathname));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
    onClose();
  };

  if (!isDesktop && !isOpen) {
    return null;
  }

  return (
    <>
      {!isDesktop ? (
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 998,
            border: 'none',
            background: 'rgba(2,6,23,0.56)',
            cursor: 'pointer',
          }}
        />
      ) : null}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '280px',
          zIndex: 1000,
          padding: isDesktop ? '20px 16px' : '76px 16px 20px',
          background:
            'linear-gradient(180deg, rgba(7,13,28,0.98), rgba(16,24,40,0.97) 40%, rgba(43,18,74,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(148,163,184,0.14)',
          boxShadow: '18px 0 45px -30px rgba(2,6,23,0.7)',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          transform: !isDesktop && isOpen ? 'translateX(0)' : undefined,
        }}
      >
      <div
        style={{
          position: 'absolute',
          top: '-70px',
          right: '-30px',
          width: '180px',
          height: '180px',
          borderRadius: '999px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0) 72%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '120px',
          left: '-45px',
          width: '170px',
          height: '170px',
          borderRadius: '999px',
          background: 'radial-gradient(circle, rgba(236,72,153,0.24) 0%, rgba(236,72,153,0) 74%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          gap: '18px',
          paddingRight: '4px',
        }}
      >
        {!isDesktop ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)',
                color: '#f8fafc',
                fontSize: '18px',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>
        ) : null}
        <div
          onClick={() => goTo(dashboardPath)}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 10px 18px',
            borderRadius: '22px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 18px 40px -32px rgba(59,130,246,0.55)',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(59,130,246,0.95), rgba(168,85,247,0.92), rgba(236,72,153,0.9))',
              color: '#fff',
              fontWeight: 900,
              letterSpacing: '0.08em',
              boxShadow: '0 18px 30px -22px rgba(168,85,247,0.65)',
            }}
          >
            SS
          </div>
          <div>
            <div style={{ fontSize: '23px', fontWeight: 'bold', color: '#f8fafc' }}>StudySphere</div>
            <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
              {user?.fullName || user?.username || 'Workspace'}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => goTo(item.path)}
              style={{
                ...baseButtonStyle,
                background: isItemActive(item.path) ? item.background : 'rgba(255,255,255,0.03)',
                color: item.color,
                borderColor: isItemActive(item.path) ? item.borderColor : 'rgba(255,255,255,0.08)',
                boxShadow: isItemActive(item.path) ? '0 18px 30px -26px rgba(59,130,246,0.55)' : 'none',
                transform: isItemActive(item.path) ? 'translateX(4px)' : 'none',
              }}
            >
              <span>{item.label}</span>
              {item.badge ? (
                <span style={{ display: 'inline-flex', minWidth: '22px', height: '22px', borderRadius: '999px', alignItems: 'center', justifyContent: 'center', background: '#ffffff', color: '#2563eb', fontSize: '12px', fontWeight: 800, padding: '0 6px', boxShadow: '0 10px 18px -14px rgba(255,255,255,0.9)' }}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {!isAdmin && !user?.profileSetupCompleted ? (
          <div
            style={{
              padding: '16px',
              borderRadius: '22px',
              background: 'linear-gradient(135deg, rgba(250,204,21,0.18), rgba(249,115,22,0.12))',
              border: '1px solid rgba(253,224,71,0.22)',
              boxShadow: '0 20px 32px -28px rgba(250,204,21,0.5)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#fde68a',
                marginBottom: '8px',
                fontWeight: 800,
              }}
            >
              Next Step
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#fef3c7', marginBottom: '8px' }}>
              Complete your profile
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#fef3c7', opacity: 0.92, marginBottom: '14px' }}>
              Finish your setup whenever you're ready to personalize the experience.
            </div>
            <button
              onClick={() => goTo('/profile/setup')}
              style={{
                ...baseButtonStyle,
                background: '#fef3c7',
                border: '1px solid rgba(254,243,199,0.92)',
                color: '#78350f',
                fontWeight: 800,
              }}
            >
              <span>Complete Profile</span>
            </button>
          </div>
        ) : null}

        <div
          style={{
            marginTop: 'auto',
            padding: '14px',
            borderRadius: '22px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '10px' }}>
            Active Space
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', marginBottom: '14px' }}>
            {user?.role === 'admin' ? 'Admin Control' : 'Learning Workspace'}
          </div>
          <button
            onClick={handleLogout}
            style={{
              ...baseButtonStyle,
              background: 'linear-gradient(135deg, rgba(248,250,252,0.98), rgba(226,232,240,0.96))',
              border: '1px solid rgba(226,232,240,0.85)',
              color: '#1e293b',
            }}
          >
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
    </>
  );
};

export default AuthenticatedSidebar;
