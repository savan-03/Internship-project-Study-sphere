import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import { useAuth } from '../components/context/AuthContext';
import { useResources } from '../components/context/ResourceContext';

const statusConfig = {
  pending: { label: 'Pending Reviews', color: '#fbbf24' },
  approved: { label: 'Approved Resources', color: '#34d399' },
  rejected: { label: 'Rejected Resources', color: '#fb7185' },
};

const ModeratorProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { allResources, loading } = useResources();
  const [selectedStatus, setSelectedStatus] = useState('pending');

  const groupedResources = useMemo(() => {
    return {
      pending: allResources.filter((resource) => resource.status === 'pending'),
      approved: allResources.filter((resource) => resource.status === 'approved'),
      rejected: allResources.filter((resource) => resource.status === 'rejected'),
    };
  }, [allResources]);

  const activeResources = groupedResources[selectedStatus] || [];

  const formatDate = (value) => {
    if (!value) return 'Recently added';
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 55%, #1e1b4b 100%)', color: '#f8fafc' }}>
      <div style={{ paddingTop: '96px', paddingBottom: '48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ marginBottom: '28px', borderRadius: '30px', background: 'linear-gradient(135deg, rgba(14,165,233,0.16) 0%, rgba(99,102,241,0.18) 55%, rgba(244,114,182,0.16) 100%)', border: '1px solid rgba(125,211,252,0.18)', padding: '32px', boxShadow: '0 30px 80px -40px rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', gap: '18px' }}>
              <div>
                <p style={{ marginBottom: '10px', display: 'inline-flex', borderRadius: '999px', background: 'rgba(14,165,233,0.16)', padding: '8px 14px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#bae6fd' }}>
                  Moderator Space
                </p>
                <h1 style={{ margin: 0, fontSize: '34px', fontWeight: 900 }}>Moderator Profile</h1>
                <p style={{ marginTop: '8px', maxWidth: '760px', color: '#cbd5e1', lineHeight: 1.8 }}>
                  Welcome, {user?.fullName}. This layout now shows live MongoDB-backed moderation data, and each review card opens the current resource list for that status.
                </p>
              </div>
              <div style={{ borderRadius: '22px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px 18px' }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.16em', color: '#94a3b8', marginBottom: '6px' }}>Profile Type</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#7dd3fc' }}>Moderator</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = groupedResources[status]?.length || 0;
              const isSelected = selectedStatus === status;
              return (
                <button
                  key={status}
                  type='button'
                  onClick={() => setSelectedStatus(status)}
                  style={{ borderRadius: '24px', background: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.46)', border: isSelected ? `1px solid ${config.color}` : '1px solid rgba(255,255,255,0.08)', padding: '22px', boxShadow: '0 20px 40px -32px rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)', textAlign: 'left', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: '14px', color: '#cbd5e1' }}>{config.label}</div>
                  <div style={{ marginTop: '10px', fontSize: '40px', fontWeight: 900, color: config.color }}>{count}</div>
                  <div style={{ marginTop: '10px', fontSize: '12px', color: isSelected ? '#e2e8f0' : '#94a3b8' }}>
                    {isSelected ? 'Showing live data below' : 'Click to view MongoDB items'}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '28px', display: 'grid', gap: '20px', gridTemplateColumns: '1.4fr 1fr' }}>
            <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.46)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', boxShadow: '0 20px 40px -32px rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)' }}>
              <h2 style={{ marginBottom: '18px', fontSize: '24px', fontWeight: 800 }}>Moderator Details</h2>
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                {[
                  ['Full Name', user?.fullName],
                  ['Email', user?.email],
                  ['Account Role', user?.role],
                  ['Workspace Focus', user?.profile?.profileType || 'moderator'],
                ].map(([label, value]) => (
                  <div key={label} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px' }}>
                    <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', marginBottom: '6px' }}>{label}</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, textTransform: 'capitalize' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.46)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', boxShadow: '0 20px 40px -32px rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)' }}>
              <h2 style={{ marginBottom: '18px', fontSize: '24px', fontWeight: 800 }}>Moderation Goals</h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                {(user?.profile?.learningGoals || ['Review pending resources', 'Keep community standards high']).slice(0, 4).map((goal) => (
                  <div key={goal} style={{ borderRadius: '18px', border: '1px solid rgba(125,211,252,0.18)', background: 'rgba(14,165,233,0.12)', padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: '#e0f2fe' }}>
                    {goal}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '28px', borderRadius: '24px', background: 'rgba(15,23,42,0.46)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', boxShadow: '0 20px 40px -32px rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
              <div>
                <h2 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 800 }}>{statusConfig[selectedStatus].label}</h2>
                <p style={{ margin: 0, color: '#94a3b8' }}>
                  This list is populated from your MongoDB resources through the shared `/api/resources` fetch.
                </p>
              </div>
              <div style={{ padding: '8px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', color: statusConfig[selectedStatus].color, fontWeight: 700 }}>
                {activeResources.length} item{activeResources.length === 1 ? '' : 's'}
              </div>
            </div>

            {loading ? (
              <p style={{ color: '#cbd5e1' }}>Loading moderation data...</p>
            ) : activeResources.length === 0 ? (
              <div style={{ borderRadius: '18px', border: '1px dashed rgba(255,255,255,0.16)', padding: '28px', color: '#94a3b8', textAlign: 'center' }}>
                No {selectedStatus} resources found in MongoDB right now.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '14px' }}>
                {activeResources.map((resource) => (
                  <button
                    key={resource.id}
                    type='button'
                    onClick={() => navigate(`/resources/${resource.id}`)}
                    style={{ width: '100%', textAlign: 'left', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', padding: '18px', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'start' }}>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>{resource.title}</div>
                        <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '10px' }}>
                          {resource.category} • {resource.type} • Uploaded by {resource.uploadedBy?.name || 'Unknown'}
                        </div>
                        <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: 1.7 }}>
                          {resource.description || 'No description provided.'}
                        </div>
                      </div>
                      <div style={{ minWidth: '140px', textAlign: 'right' }}>
                        <div style={{ color: statusConfig[selectedStatus].color, fontWeight: 800, textTransform: 'capitalize', marginBottom: '6px' }}>{resource.status}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{formatDate(resource.uploadedAt)}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ModeratorProfilePage;
