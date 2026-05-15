import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Hub', to: '/social', match: ['/social', '/community'] },
  { label: 'Groups', to: '/groups', match: ['/groups', '/social/groups', '/community/groups'] },
  { label: 'Forums', to: '/forums', match: ['/forums', '/social/forums', '/community/forums'] },
  { label: 'Chat', to: '/social/chat', match: ['/social/chat', '/social/direct', '/community/chat'] },
];

const SocialModuleNav = () => {
  const location = useLocation();

  const isActive = (item) =>
    item.match.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '24px',
      }}
    >
      {navItems.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.to}
            to={item.to}
            style={{
              textDecoration: 'none',
              padding: '11px 16px',
              borderRadius: '14px',
              fontWeight: 800,
              border: active
                ? '1px solid rgba(96,165,250,0.28)'
                : '1px solid rgba(255,255,255,0.12)',
              background: active
                ? 'linear-gradient(135deg, rgba(59,130,246,0.16), rgba(139,92,246,0.16))'
                : 'rgba(255,255,255,0.05)',
              color: active ? '#dbeafe' : '#cbd5e1',
              boxShadow: active ? '0 18px 30px -26px rgba(59,130,246,0.55)' : 'none',
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
};

export default SocialModuleNav;
