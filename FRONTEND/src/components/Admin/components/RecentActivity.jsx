// src/components/admin/components/RecentActivity.jsx
import React from 'react';

const RecentActivity = ({ activities = [] }) => {
  const getActionIcon = (action) => {
    switch(action) {
      case 'approved': return '✅';
      case 'uploaded': return '📤';
      case 'joined': return '👋';
      case 'reported': return '⚠️';
      case 'rejected': return '❌';
      case 'updated role for': return '👑';
      case 'changed status of': return '🔧';
      default: return '📌';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: 600,
        color: 'white',
        marginBottom: '20px'
      }}>
        Recent Activity
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {activities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            No recent activity
          </div>
        ) : (
          activities.map(activity => (
            <div
              key={activity.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '10px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            >
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                color: 'white'
              }}>
                {activity.user.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: 'white' }}>
                  <span style={{ fontWeight: 600 }}>{activity.user.name}</span>
                  {' '}
                  <span style={{ color: '#a78bfa' }}>{activity.action}</span>
                  {' '}
                  <span>{activity.target}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                  {formatTime(activity.timestamp)}
                </div>
              </div>
              <div style={{ fontSize: '16px' }}>
                {getActionIcon(activity.action)}
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <button
          style={{
            width: '100%',
            marginTop: '15px',
            padding: '8px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#9ca3af',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#9ca3af';
          }}
        >
          View All Activity
        </button>
      )}
    </div>
  );
};

export default RecentActivity;
