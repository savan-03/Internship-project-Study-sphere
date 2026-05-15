import React, { useEffect, useMemo, useState } from 'react';
import Footer from '../components/layout/Footer';
import ResourceModuleNav from '../components/resources/ResourceModuleNav';
import ResourceCard from '../components/resources/ResourceCard';
import { useResources } from '../components/context/ResourceContext';

const panel = {
  borderRadius: '24px',
  background: 'rgba(15,23,42,0.46)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '24px',
  backdropFilter: 'blur(16px)',
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
};

const ResourceMyUploads = () => {
  const { myUploads, fetchMyUploads, updateResource, deleteResource } = useResources();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedResource, setSelectedResource] = useState(null);
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    category: 'General',
    type: 'pdf',
    externalUrl: '',
    tags: '',
    prerequisites: '',
    verificationNotes: '',
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');

  useEffect(() => {
    fetchMyUploads();
  }, [fetchMyUploads]);

  useEffect(() => {
    if (!selectedResource) return;
    setFormState({
      title: selectedResource.title || '',
      description: selectedResource.description || '',
      category: selectedResource.category || 'General',
      type: selectedResource.type || 'pdf',
      externalUrl: selectedResource.externalUrl || '',
      tags: (selectedResource.tags || []).join(', '),
      prerequisites: (selectedResource.prerequisites || []).join(', '),
      verificationNotes: selectedResource.verificationNotes || '',
    });
  }, [selectedResource]);

  const myResources = useMemo(() => {
    return myUploads.filter((resource) => {
      if (statusFilter !== 'all' && resource.status !== statusFilter) {
        return false;
      }

      if (search.trim()) {
        const haystack = [
          resource.title,
          resource.description,
          resource.category,
          ...(resource.tags || []),
        ].join(' ').toLowerCase();

        if (!haystack.includes(search.trim().toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [myUploads, search, statusFilter]);

  const selectedModerationHistory = selectedResource?.moderationHistory || [];

  const handleSave = async (event) => {
    event.preventDefault();
    if (!selectedResource) return;

    setSaving(true);
    try {
      const updated = await updateResource(selectedResource.id, {
        ...formState,
        externalUrl: formState.externalUrl,
        tags: formState.tags,
        prerequisites: formState.prerequisites,
      });
      setSelectedResource(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (resourceId) => {
    setDeletingId(resourceId);
    try {
      await deleteResource(resourceId);
      if (selectedResource?.id === resourceId) {
        setSelectedResource(null);
      }
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 55%, #1e1b4b 100%)', color: '#f8fafc' }}>
      <div style={{ paddingTop: '108px', paddingBottom: '48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ marginBottom: '24px', borderRadius: '28px', background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(139,92,246,0.2), rgba(236,72,153,0.18))', border: '1px solid rgba(255,255,255,0.08)', padding: '28px', backdropFilter: 'blur(16px)' }}>
            <p style={{ margin: 0, color: '#bfdbfe', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: '12px' }}>My Uploads</p>
            <h1 style={{ margin: '10px 0 6px', fontSize: '34px', fontWeight: 900 }}>Manage your contributions</h1>
            <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.7 }}>Track publication status, quality, and performance for every resource you share.</p>
          </div>

          <ResourceModuleNav />

          <div style={{ display: 'grid', gap: '18px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '24px' }}>
            {[
              ['Total uploads', myResources.length, '#c4b5fd'],
              ['Approved', myResources.filter((item) => item.status === 'approved').length, '#86efac'],
              ['Pending review', myResources.filter((item) => item.status === 'pending').length, '#fcd34d'],
              ['Rejected', myResources.filter((item) => item.status === 'rejected').length, '#fca5a5'],
            ].map(([label, value, color]) => (
              <div key={label} style={{ borderRadius: '22px', background: 'rgba(15,23,42,0.46)', border: '1px solid rgba(255,255,255,0.08)', padding: '22px', backdropFilter: 'blur(16px)' }}>
                <div style={{ color: '#94a3b8', fontSize: '13px' }}>{label}</div>
                <div style={{ marginTop: '8px', fontSize: '36px', fontWeight: 900, color }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ ...panel, marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 220px', gap: '14px' }}>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your uploads by title, category, or tag" style={inputStyle} />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={inputStyle}>
              <option value="all">All statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {myResources.length === 0 ? (
            <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.46)', border: '1px solid rgba(255,255,255,0.08)', padding: '36px', color: '#94a3b8', textAlign: 'center', backdropFilter: 'blur(16px)' }}>You have not uploaded any resources yet.</div>
          ) : (
            <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
              <div style={{ display: 'grid', gap: '20px', alignContent: 'start' }}>
                {myResources.map((resource) => (
                  <div key={resource.id} style={panel}>
                    <ResourceCard resource={resource} viewMode="grid" />
                    <div style={{ marginTop: '14px', display: 'grid', gap: '12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
                        <div style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', padding: '10px' }}>
                          <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase' }}>Status</div>
                          <div style={{ marginTop: '6px', fontWeight: 800, textTransform: 'capitalize' }}>{resource.status}</div>
                        </div>
                        <div style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', padding: '10px' }}>
                          <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase' }}>Reviews</div>
                          <div style={{ marginTop: '6px', fontWeight: 800 }}>{resource.reviewCount || 0}</div>
                        </div>
                        <div style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', padding: '10px' }}>
                          <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase' }}>Downloads</div>
                          <div style={{ marginTop: '6px', fontWeight: 800 }}>{resource.downloads || 0}</div>
                        </div>
                      </div>

                      {resource.rejectionReason ? (
                        <div style={{ borderRadius: '14px', background: 'rgba(127,29,29,0.25)', border: '1px solid rgba(248,113,113,0.2)', padding: '12px', color: '#fecaca', lineHeight: 1.6 }}>
                          Rejection reason: {resource.rejectionReason}
                        </div>
                      ) : null}

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => setSelectedResource(resource)}
                          style={{ flex: 1, padding: '11px 14px', borderRadius: '12px', border: '1px solid rgba(96,165,250,0.24)', background: 'rgba(59,130,246,0.14)', color: '#bfdbfe', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Edit Upload
                        </button>
                        <button
                          onClick={() => handleDelete(resource.id)}
                          disabled={deletingId === resource.id}
                          style={{ padding: '11px 14px', borderRadius: '12px', border: '1px solid rgba(248,113,113,0.24)', background: 'rgba(127,29,29,0.22)', color: '#fecaca', fontWeight: 700, cursor: 'pointer', opacity: deletingId === resource.id ? 0.7 : 1 }}
                        >
                          {deletingId === resource.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ ...panel, height: 'fit-content', position: 'sticky', top: '104px' }}>
                <h2 style={{ margin: '0 0 14px', fontSize: '24px', fontWeight: 900 }}>
                  {selectedResource ? 'Edit selected upload' : 'Select an upload'}
                </h2>
                <p style={{ margin: '0 0 18px', color: '#94a3b8', lineHeight: 1.7 }}>
                  {selectedResource
                    ? 'Changes from regular users move the resource back into moderation so the verification pipeline stays consistent.'
                    : 'Choose one of your uploads to update its metadata, notes, and moderation-facing details.'}
                </p>

                {selectedResource ? (
                  <form onSubmit={handleSave} style={{ display: 'grid', gap: '12px' }}>
                    <input value={formState.title} onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))} placeholder="Title" style={inputStyle} />
                    <textarea value={formState.description} onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))} rows={4} placeholder="Description" style={{ ...inputStyle, resize: 'vertical' }} />
                    <input value={formState.category} onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value }))} placeholder="Category" style={inputStyle} />
                    <select value={formState.type} onChange={(event) => setFormState((prev) => ({ ...prev, type: event.target.value }))} style={inputStyle}>
                      <option value="pdf">PDF</option>
                      <option value="link">Link</option>
                      <option value="notes">Notes</option>
                      <option value="video">Video</option>
                    </select>
                    {(formState.type === 'link' || formState.type === 'video') ? (
                      <input value={formState.externalUrl} onChange={(event) => setFormState((prev) => ({ ...prev, externalUrl: event.target.value }))} placeholder="External URL" style={inputStyle} />
                    ) : null}
                    <input value={formState.tags} onChange={(event) => setFormState((prev) => ({ ...prev, tags: event.target.value }))} placeholder="Tags, comma separated" style={inputStyle} />
                    <input value={formState.prerequisites} onChange={(event) => setFormState((prev) => ({ ...prev, prerequisites: event.target.value }))} placeholder="Prerequisites, comma separated" style={inputStyle} />
                    <textarea value={formState.verificationNotes} onChange={(event) => setFormState((prev) => ({ ...prev, verificationNotes: event.target.value }))} rows={4} placeholder="Verification notes" style={{ ...inputStyle, resize: 'vertical' }} />
                    <button type="submit" disabled={saving} style={{ padding: '12px 16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>

                    <div style={{ marginTop: '10px', display: 'grid', gap: '10px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Moderation timeline</h3>
                      {selectedModerationHistory.length ? (
                        selectedModerationHistory.slice(0, 5).map((entry, index) => (
                          <div key={`${entry.createdAt}-${index}`} style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', padding: '12px' }}>
                            <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{entry.action.replace(/_/g, ' ')}</div>
                            <div style={{ marginTop: '4px', color: '#94a3b8', fontSize: '13px' }}>{entry.note || 'No note provided.'}</div>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: '#94a3b8' }}>No moderation history yet.</div>
                      )}
                    </div>
                  </form>
                ) : (
                  <div style={{ color: '#94a3b8' }}>No upload selected yet.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResourceMyUploads;
