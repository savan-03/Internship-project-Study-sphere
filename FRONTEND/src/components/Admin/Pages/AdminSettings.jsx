// src/components/admin/pages/AdminSettings.jsx
import React, { useState, useEffect } from 'react';

const AdminSettings = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [settings, setSettings] = useState({
    siteName: 'StudySphere',
    siteDescription: 'AI-powered learning platform for DSA, AI/ML, and more',
    contactEmail: 'support@studysphere.com',
    maintenanceMode: false,
    allowUploads: true,
    requireApproval: true,
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'mp4', 'zip'],
    defaultUserRole: 'user',
    enableNotifications: true,
    enableAnalytics: true,
    enableSocialLogin: true
  });

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

  const [saveStatus, setSaveStatus] = useState('');

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 1000);
  };

  const sections = [
    {
      title: 'General Settings',
      icon: '⚙️',
      fields: [
        { label: 'Site Name', key: 'siteName', type: 'text', placeholder: 'StudySphere' },
        { label: 'Site Description', key: 'siteDescription', type: 'textarea', rows: 2 },
        { label: 'Contact Email', key: 'contactEmail', type: 'email', placeholder: 'support@studysphere.com' }
      ]
    },
    {
      title: 'Platform Settings',
      icon: '🌐',
      fields: [
        { label: 'Maintenance Mode', key: 'maintenanceMode', type: 'checkbox' },
        { label: 'Allow Uploads', key: 'allowUploads', type: 'checkbox' },
        { label: 'Require Admin Approval', key: 'requireApproval', type: 'checkbox' },
        { label: 'Max File Size (MB)', key: 'maxFileSize', type: 'number', min: 1, max: 100 },
        { label: 'Default User Role', key: 'defaultUserRole', type: 'select', options: ['user', 'moderator', 'admin'] }
      ]
    },
    {
      title: 'Feature Settings',
      icon: '✨',
      fields: [
        { label: 'Enable Notifications', key: 'enableNotifications', type: 'checkbox' },
        { label: 'Enable Analytics', key: 'enableAnalytics', type: 'checkbox' },
        { label: 'Enable Social Login', key: 'enableSocialLogin', type: 'checkbox' }
      ]
    }
  ];

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

      <div style={{ height: '80px', position: 'relative', zIndex: 1 }}></div>

      <div style={{ position: 'relative', zIndex: 1, padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        
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
            System Settings
          </h1>
          <p style={{ color: '#9ca3af' }}>
            Configure your platform settings and preferences
          </p>
        </div>

        {/* Settings Sections */}
        {sections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.1)',
              marginBottom: '20px'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <span style={{ fontSize: '24px' }}>{section.icon}</span>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'white' }}>
                {section.title}
              </h2>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              {section.fields.map((field, fieldIndex) => (
                <div key={fieldIndex}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    marginBottom: '8px',
                    color: '#9ca3af'
                  }}>
                    {field.label}
                  </label>
                  
                  {field.type === 'checkbox' ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings[field.key]}
                        onChange={(e) => handleChange(field.key, e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', color: 'white' }}>
                        {settings[field.key] ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={settings[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      rows={field.rows}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={settings[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={settings[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      min={field.min}
                      max={field.max}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Danger Zone */}
        <div style={{
          background: 'rgba(239,68,68,0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(239,68,68,0.3)',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#ef4444',
            marginBottom: '16px'
          }}>
            ⚠️ Danger Zone
          </h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                  alert('Data cleared (demo)');
                }
              }}
              style={{
                padding: '10px 20px',
                background: 'rgba(239,68,68,0.2)',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Clear All Data
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all settings?')) {
                  setSettings({
                    siteName: 'StudySphere',
                    siteDescription: 'AI-powered learning platform',
                    contactEmail: 'support@studysphere.com',
                    maintenanceMode: false,
                    allowUploads: true,
                    requireApproval: true,
                    maxFileSize: 10,
                    allowedFileTypes: ['pdf', 'mp4', 'zip'],
                    defaultUserRole: 'user',
                    enableNotifications: true,
                    enableAnalytics: true,
                    enableSocialLogin: true
                  });
                }
              }}
              style={{
                padding: '10px 20px',
                background: 'rgba(107,114,128,0.2)',
                border: '1px solid #6b7280',
                borderRadius: '8px',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Reset Settings
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '20px'
        }}>
          <button
            onClick={handleSave}
            style={{
              padding: '12px 32px',
              background: saveStatus === 'saving' ? '#6b7280' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (saveStatus !== 'saving') {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(139,92,246,0.5)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;