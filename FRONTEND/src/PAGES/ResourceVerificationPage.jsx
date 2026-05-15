import React, { useEffect, useState } from 'react';
import Footer from '../components/layout/Footer';
import ResourceModuleNav from '../components/resources/ResourceModuleNav';
import { useAuth } from '../components/context/AuthContext';
import { useResources } from '../components/context/ResourceContext';
import api from '../components/context/Axiosinstance';

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
};

const ResourceVerificationPage = () => {
  const { user } = useAuth();
  const { approveResource, rejectResource, addModerationNote } = useResources();
  const canVerify = user?.role === 'admin' || user?.role === 'moderator';
  const [pendingResources, setPendingResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteDrafts, setNoteDrafts] = useState({});
  const [rejectDrafts, setRejectDrafts] = useState({});
  const [workingId, setWorkingId] = useState('');

  useEffect(() => {
    const loadQueue = async () => {
      if (!canVerify) {
        setPendingResources([]);
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/admin/resources');
        setPendingResources((data.resources || []).filter((resource) => resource.status === 'pending'));
      } finally {
        setLoading(false);
      }
    };

    loadQueue();
  }, [canVerify]);

  const handleApprove = async (resourceId) => {
    setWorkingId(resourceId);
    try {
      const note = noteDrafts[resourceId]?.trim();
      if (note) {
        await addModerationNote(resourceId, note);
      }
      await approveResource(resourceId);
      setPendingResources((prev) => prev.filter((resource) => resource.id !== resourceId));
    } finally {
      setWorkingId('');
    }
  };

  const handleReject = async (resourceId) => {
    setWorkingId(resourceId);
    try {
      const reason = rejectDrafts[resourceId]?.trim() || 'Needs revision before publishing.';
      const note = noteDrafts[resourceId]?.trim();
      if (note) {
        await addModerationNote(resourceId, note);
      }
      await rejectResource(resourceId, reason);
      setPendingResources((prev) => prev.filter((resource) => resource.id !== resourceId));
    } finally {
      setWorkingId('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 55%, #1e1b4b 100%)', color: '#f8fafc' }}>
      <div style={{ paddingTop: '108px', paddingBottom: '48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ marginBottom: '24px', borderRadius: '28px', background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(139,92,246,0.2), rgba(236,72,153,0.18))', border: '1px solid rgba(255,255,255,0.08)', padding: '28px', backdropFilter: 'blur(16px)' }}>
            <p style={{ margin: 0, color: '#bfdbfe', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: '12px' }}>Verification Queue</p>
            <h1 style={{ margin: '10px 0 6px', fontSize: '34px', fontWeight: 900 }}>Moderation and publication</h1>
            <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.7 }}>Review pending submissions, confirm quality, leave notes, and publish approved materials to the library.</p>
          </div>

          <ResourceModuleNav />

          {!canVerify ? (
            <div style={{ borderRadius: '24px', background: 'rgba(127,29,29,0.24)', border: '1px solid rgba(248,113,113,0.18)', padding: '24px', color: '#fecdd3', backdropFilter: 'blur(16px)' }}>
              You need moderator or admin access to verify resources.
            </div>
          ) : loading ? (
            <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.46)', border: '1px solid rgba(255,255,255,0.08)', padding: '32px', color: '#94a3b8', textAlign: 'center', backdropFilter: 'blur(16px)' }}>Loading moderation queue...</div>
          ) : pendingResources.length === 0 ? (
            <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.46)', border: '1px solid rgba(255,255,255,0.08)', padding: '32px', color: '#94a3b8', textAlign: 'center', backdropFilter: 'blur(16px)' }}>The moderation queue is empty right now.</div>
          ) : (
            <div style={{ display: 'grid', gap: '18px' }}>
              {pendingResources.map((resource) => (
                <div key={resource.id} style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.46)', border: '1px solid rgba(245,158,11,0.28)', padding: '22px', backdropFilter: 'blur(16px)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 800 }}>{resource.title}</h3>
                      <div style={{ color: '#94a3b8', fontSize: '13px' }}>{resource.uploadedBy?.name} - {resource.category} - {resource.type}</div>
                      <p style={{ marginTop: '12px', color: '#cbd5e1', lineHeight: 1.7 }}>{resource.description || 'No description provided.'}</p>
                      <div style={{ marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {(resource.tags || []).map((tag) => (
                          <span key={tag} style={{ padding: '6px 10px', borderRadius: '999px', background: 'rgba(59,130,246,0.14)', color: '#bfdbfe', fontSize: '12px' }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span style={{ padding: '8px 12px', borderRadius: '999px', background: 'rgba(245,158,11,0.2)', color: '#fcd34d', fontWeight: 800, fontSize: '12px' }}>Pending Review</span>
                  </div>

                  <div style={{ marginTop: '18px', display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr' }}>
                    <textarea
                      value={noteDrafts[resource.id] || ''}
                      onChange={(event) =>
                        setNoteDrafts((prev) => ({ ...prev, [resource.id]: event.target.value }))
                      }
                      rows={3}
                      placeholder="Internal moderation note"
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                    <textarea
                      value={rejectDrafts[resource.id] || ''}
                      onChange={(event) =>
                        setRejectDrafts((prev) => ({ ...prev, [resource.id]: event.target.value }))
                      }
                      rows={3}
                      placeholder="Reason if you reject this resource"
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ marginTop: '18px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button disabled={workingId === resource.id} onClick={() => handleApprove(resource.id)} style={{ padding: '11px 16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #10b981, #22c55e)', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: workingId === resource.id ? 0.7 : 1 }}>Approve</button>
                    <button disabled={workingId === resource.id} onClick={() => handleReject(resource.id)} style={{ padding: '11px 16px', borderRadius: '12px', border: '1px solid rgba(248,113,113,0.24)', background: 'rgba(127,29,29,0.24)', color: '#fecaca', fontWeight: 700, cursor: 'pointer', opacity: workingId === resource.id ? 0.7 : 1 }}>Reject</button>
                    {resource.externalUrl ? (
                      <a href={resource.externalUrl} target="_blank" rel="noreferrer" style={{ padding: '11px 16px', borderRadius: '12px', border: '1px solid rgba(96,165,250,0.24)', background: 'rgba(59,130,246,0.14)', color: '#bfdbfe', fontWeight: 700, textDecoration: 'none' }}>Preview</a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResourceVerificationPage;
