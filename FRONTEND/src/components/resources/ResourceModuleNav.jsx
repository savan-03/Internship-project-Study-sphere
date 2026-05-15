import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ResourceModuleNav = () => {
  const { user } = useAuth();
  const canVerify = user?.role === 'admin' || user?.role === 'moderator';
  const links = [
    { to: '/resources', label: 'Library' },
    { to: '/resources/upload', label: 'Upload' },
    { to: '/resources/my-uploads', label: 'My Uploads' },
    { to: '/resources/saved', label: 'Bookmarks' },
    { to: '/resources/collections', label: 'Collections' },
    { to: '/resources/reviews', label: 'Reviews' },
    ...(canVerify ? [{ to: '/resources/verification', label: 'Verification' }] : []),
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '20px',
      }}
    >
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          style={({ isActive }) => ({
            padding: '11px 16px',
            borderRadius: '999px',
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: '13px',
            letterSpacing: '0.01em',
            color: isActive ? '#ffffff' : '#cbd5e1',
            background: isActive
              ? 'linear-gradient(135deg, rgba(59,130,246,0.96), rgba(139,92,246,0.96))'
              : 'rgba(15,23,42,0.74)',
            border: `1px solid ${isActive ? 'rgba(96,165,250,0.18)' : 'rgba(148,163,184,0.14)'}`,
            boxShadow: isActive ? '0 16px 30px -20px rgba(59,130,246,0.92)' : 'none',
          })}
        >
          {link.label}
        </NavLink>
      ))}
    </div>
  );
};

export default ResourceModuleNav;
