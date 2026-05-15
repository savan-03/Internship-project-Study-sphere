// src/components/admin/components/UserTable.jsx
import React, { useState } from 'react';

const UserTable = ({ users, updateUserRole, updateUserStatus }) => {
  const [expandedUser, setExpandedUser] = useState(null);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return '#ef4444';
      case 'moderator': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const getStatusBadgeColor = (status) => {
    return status === 'active' ? '#10b981' : '#6b7280';
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '16px', textAlign: 'left', color: '#9ca3af', fontSize: '12px', fontWeight: 500 }}>User</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#9ca3af', fontSize: '12px', fontWeight: 500 }}>Role</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#9ca3af', fontSize: '12px', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#9ca3af', fontSize: '12px', fontWeight: 500 }}>Joined</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#9ca3af', fontSize: '12px', fontWeight: 500 }}>Resources</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#9ca3af', fontSize: '12px', fontWeight: 500 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <React.Fragment key={user.id}>
                <tr style={{
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: 'white'
                      }}>
                        {user.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: 'white' }}>{user.name}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      style={{
                        padding: '6px 12px',
                        background: `rgba(${getRoleBadgeColor(user.role) === '#ef4444' ? '239,68,68' : getRoleBadgeColor(user.role) === '#f59e0b' ? '245,158,11' : '16,185,129'}, 0.2)`,
                        border: `1px solid ${getRoleBadgeColor(user.role)}`,
                        borderRadius: '6px',
                        color: getRoleBadgeColor(user.role),
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button
                      onClick={() => updateUserStatus(user.id, user.status === 'active' ? 'inactive' : 'active')}
                      style={{
                        padding: '6px 12px',
                        background: `rgba(${getStatusBadgeColor(user.status) === '#10b981' ? '16,185,129' : '107,114,128'}, 0.2)`,
                        border: `1px solid ${getStatusBadgeColor(user.status)}`,
                        borderRadius: '6px',
                        color: getStatusBadgeColor(user.status),
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td style={{ padding: '16px', color: '#9ca3af', fontSize: '13px' }}>
                    {formatDate(user.joinDate)}
                  </td>
                  <td style={{ padding: '16px', color: '#9ca3af', fontSize: '13px' }}>
                    {user.resourcesUploaded}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '6px',
                          color: '#9ca3af',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {expandedUser === user.id ? 'Hide' : 'Details'}
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedUser === user.id && (
                  <tr>
                    <td colSpan="6" style={{ padding: '20px', background: 'rgba(0,0,0,0.3)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Last Active</div>
                          <div style={{ fontSize: '14px', color: 'white' }}>{formatDate(user.lastActive)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Total Points</div>
                          <div style={{ fontSize: '14px', color: 'white' }}>{user.points}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;