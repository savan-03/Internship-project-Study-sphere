// src/components/admin/components/StatCard.jsx
import React from 'react';

const StatCard = ({ title, value, icon, change, color }) => {
  const isPositive = change && change.includes('+');
  const changeColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid rgba(255,255,255,0.1)',
      transition: 'transform 0.3s ease'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        marginBottom: '15px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: `linear-gradient(135deg, ${color.split(' ')[1]}, ${color.split(' ')[3]})`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          {icon}
        </div>
        {change && (
          <span style={{
            fontSize: '12px',
            color: changeColor,
            background: `${changeColor}20`,
            padding: '4px 8px',
            borderRadius: '20px'
          }}>
            {change}
          </span>
        )}
      </div>
      
      <div style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: 'white',
        marginBottom: '5px'
      }}>
        {typeof value === 'number' && value > 999 ? (value / 1000).toFixed(1) + 'K' : value}
      </div>
      
      <div style={{
        fontSize: '14px',
        color: '#9ca3af'
      }}>
        {title}
      </div>
    </div>
  );
};

export default StatCard;