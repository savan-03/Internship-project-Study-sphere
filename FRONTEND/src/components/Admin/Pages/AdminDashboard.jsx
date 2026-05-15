// src/components/admin/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import StatCard from '../components/StatCard';
import ActivityChart from '../components/ActivityChart';
import RecentActivity from '../components/RecentActivity';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { stats, activities, loading } = useAdmin();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      change: '+12%',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Total Resources',
      value: stats.totalResources,
      icon: '📚',
      change: '+8%',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Pending Approval',
      value: stats.pendingResources,
      icon: '⏳',
      change: '+3',
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Total Downloads',
      value: stats.totalDownloads,
      icon: '⬇️',
      change: '+15%',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: '🟢',
      change: '+5%',
      color: 'from-teal-500 to-green-500'
    },
    {
      title: 'Avg Rating',
      value: stats.averageRating,
      icon: '⭐',
      change: '+0.2',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const quickActions = [
    { title: 'Manage Users', icon: '👥', path: '/admin/users', color: '#3b82f6' },
    { title: 'Review Resources', icon: '📄', path: '/admin/resources', color: '#8b5cf6' },
    { title: 'View Analytics', icon: '📊', path: '/admin/analytics', color: '#10b981' },
    { title: 'System Settings', icon: '⚙️', path: '/admin/settings', color: '#6b7280' }
  ];

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'black',
        color: 'white'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(139,92,246,0.3)',
          borderTopColor: '#a78bfa',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      color: 'white',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Animated Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,40,0.95) 100%)'
      }}>
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(147,51,234,0.3) 0%, rgba(79,70,229,0.1) 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(168,85,247,0.1) 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)`
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Navbar spacer */}
      <div style={{ height: '80px', position: 'relative', zIndex: 1 }}></div>

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 1, padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#9ca3af' }}>
            Welcome back, Admin! Here's what's happening with your platform.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {statCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '20px',
            color: '#a78bfa'
          }}>
            Quick Actions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px'
          }}>
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                style={{
                  padding: '20px',
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.borderColor = action.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: `rgba(${action.color === '#3b82f6' ? '59,130,246' : action.color === '#8b5cf6' ? '139,92,246' : action.color === '#10b981' ? '16,185,129' : '107,114,128'}, 0.2)`,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  {action.icon}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '16px', fontWeight: 500, color: 'white' }}>
                    {action.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    Click to manage
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Charts and Activity */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px'
        }}>
          <ActivityChart />
          <RecentActivity activities={activities} />
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;