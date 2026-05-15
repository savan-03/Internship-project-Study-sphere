// src/components/admin/components/ActivityChart.jsx
import React, { useState } from 'react';

const ActivityChart = () => {
  const [activeTab, setActiveTab] = useState('week');

  const data = {
    week: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      users: [45, 52, 48, 67, 89, 72, 65],
      resources: [12, 18, 15, 22, 28, 20, 16]
    },
    month: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      users: [245, 312, 389, 445],
      resources: [78, 92, 105, 118]
    }
  };

  const maxValue = Math.max(...data[activeTab].users, ...data[activeTab].resources);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>
          Platform Activity
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['week', 'month'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '4px 12px',
                background: activeTab === tab ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'rgba(255,255,255,0.05)',
                border: 'none',
                borderRadius: '6px',
                color: activeTab === tab ? 'white' : '#9ca3af',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {tab === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', height: '200px' }}>
        {/* Chart Bars */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'end',
          height: '150px',
          gap: '15px'
        }}>
          {data[activeTab].labels.map((label, index) => (
            <div key={index} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '100%',
                  height: `${(data[activeTab].users[index] / maxValue) * 120}px`,
                  background: 'linear-gradient(180deg, #3b82f6, #8b5cf6)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s ease'
                }} />
                <div style={{
                  width: '100%',
                  height: `${(data[activeTab].resources[index] / maxValue) * 80}px`,
                  background: 'linear-gradient(180deg, #10b981, #34d399)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s ease'
                }} />
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginTop: '20px',
          paddingTop: '15px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '2px' }} />
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>New Users</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', background: 'linear-gradient(135deg, #10b981, #34d399)', borderRadius: '2px' }} />
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>Resources</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityChart;