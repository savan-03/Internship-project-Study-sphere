import React from 'react';
import Footer from '../components/layout/Footer';
import { useAuth } from '../components/context/AuthContext';
import { useAdmin } from '../components/Admin/context/AdminContext';

const AdminProfilePage = () => {
  const { user } = useAuth();
  const { stats, users, resources, loading, error } = useAdmin();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 55%, #1e1b4b 100%)', color: '#f8fafc' }}>
      <div style={{ paddingTop: '96px', paddingBottom: '48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ marginBottom: '28px', borderRadius: '30px', background: 'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(59,130,246,0.16) 52%, rgba(236,72,153,0.16) 100%)', border: '1px solid rgba(196,181,253,0.2)', padding: '32px', boxShadow: '0 30px 80px -40px rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', gap: '18px' }}>
              <div>
                <p style={{ marginBottom: '10px', display: 'inline-flex', borderRadius: '999px', background: 'rgba(139,92,246,0.16)', padding: '8px 14px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ddd6fe' }}>
                  Admin Space
                </p>
                <h1 style={{ margin: 0, fontSize: '34px', fontWeight: 900 }}>Admin Profile</h1>
                <p style={{ marginTop: '8px', maxWidth: '760px', color: '#cbd5e1', lineHeight: 1.8 }}>
                  Signed in as {user?.fullName}. This admin profile now follows the same dashboard theme so management pages feel like part of the same product.
                </p>
              </div>
              <div style={{ borderRadius: '22px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px 18px' }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.16em', color: '#94a3b8', marginBottom: '6px' }}>Account Role</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#c4b5fd' }}>Admin</div>
              </div>
            </div>
          </div>

          {error && <div style={{ marginBottom: '18px', borderRadius: '18px', border: '1px solid rgba(251,113,133,0.26)', background: 'rgba(244,63,94,0.12)', padding: '14px 16px', color: '#fecdd3' }}>{error}</div>}

          <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
            {[
              ['Total Users', stats.totalUsers || 0],
              ['Total Resources', stats.totalResources || 0],
              ['Pending Resources', stats.pendingResources || 0],
              ['Approved Resources', stats.approvedResources || 0],
            ].map(([label, value]) => (
              <div key={label} style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.46)', border: '1px solid rgba(255,255,255,0.08)', padding: '22px', boxShadow: '0 20px 40px -32px rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)' }}>
                <div style={{ fontSize: '14px', color: '#cbd5e1' }}>{label}</div>
                <div style={{ marginTop: '10px', fontSize: '40px', fontWeight: 900 }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '28px', display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.46)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', boxShadow: '0 20px 40px -32px rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)' }}>
              <h3 style={{ marginBottom: '18px', fontSize: '22px', fontWeight: 800 }}>Recent Users</h3>
              {loading ? <p style={{ color: '#94a3b8' }}>Loading...</p> : users.slice(0, 5).map((member) => (
                <div key={member.id} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', borderRadius: '18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px 16px' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{member.name}</div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>{member.email}</div>
                  </div>
                  <span style={{ borderRadius: '999px', background: 'rgba(139,92,246,0.16)', padding: '6px 10px', fontSize: '12px', color: '#c4b5fd', fontWeight: 700 }}>{member.role}</span>
                </div>
              ))}
            </div>

            <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.46)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', boxShadow: '0 20px 40px -32px rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)' }}>
              <h3 style={{ marginBottom: '18px', fontSize: '22px', fontWeight: 800 }}>Recent Resources</h3>
              {loading ? <p style={{ color: '#94a3b8' }}>Loading...</p> : resources.slice(0, 5).map((resource) => (
                <div key={resource.id} style={{ marginBottom: '12px', borderRadius: '18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{resource.title}</div>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>{resource.uploadedBy?.name || 'Unknown'} • {resource.category}</div>
                    </div>
                    <span style={{ borderRadius: '999px', background: 'rgba(52,211,153,0.14)', padding: '6px 10px', fontSize: '12px', color: '#86efac', fontWeight: 700 }}>{resource.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminProfilePage;
