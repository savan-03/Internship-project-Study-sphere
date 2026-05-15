// src/components/admin/components/ResourceTable.jsx
import React, { useMemo, useState } from 'react';

const ResourceTable = ({ resources, approveResource, rejectResource, fetchResourceDetail, addModerationNote }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [moderationNote, setModerationNote] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);

  const selectedResource = useMemo(
    () => resources.find((resource) => resource.id === selectedResourceId) || null,
    [resources, selectedResourceId]
  );

  const openReview = async (resourceId) => {
    setSelectedResourceId(resourceId);
    if (!fetchResourceDetail) return;
    setReviewLoading(true);
    try {
      await fetchResourceDetail(resourceId);
    } finally {
      setReviewLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return { color: '#10b981', text: 'Approved' };
      case 'pending':
        return { color: '#f59e0b', text: 'Pending' };
      case 'rejected':
        return { color: '#ef4444', text: 'Rejected' };
      default:
        return { color: '#6b7280', text: status };
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'pdf': return '📄';
      case 'link': return '🔗';
      case 'notes': return '📝';
      default: return '📁';
    }
  };

  const handleReject = (id) => {
    if (rejectReason.trim()) {
      rejectResource(id, rejectReason);
      setShowRejectModal(null);
      setRejectReason('');
    }
  };

  return (
    <>
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
                <th style={{ padding: '16px', textAlign: 'left', color: '#9ca3af', fontSize: '12px', fontWeight: 500 }}>Resource</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#9ca3af', fontSize: '12px', fontWeight: 500 }}>Type</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#9ca3af', fontSize: '12px', fontWeight: 500 }}>Uploader</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#9ca3af', fontSize: '12px', fontWeight: 500 }}>Date</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#9ca3af', fontSize: '12px', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#9ca3af', fontSize: '12px', fontWeight: 500 }}>Quality</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#9ca3af', fontSize: '12px', fontWeight: 500 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map(resource => {
                const statusBadge = getStatusBadge(resource.status);
                return (
                  <tr key={resource.id} style={{
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '16px' }}>
                      <div>
                        <div style={{ fontWeight: 500, color: 'white', marginBottom: '4px' }}>
                          {resource.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                          {resource.category}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '20px' }}>{getTypeIcon(resource.type)}</span>
                      <span style={{ fontSize: '12px', marginLeft: '8px', color: '#9ca3af', textTransform: 'capitalize' }}>
                        {resource.type}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#9ca3af', fontSize: '13px' }}>
                      {resource.uploadedBy?.name || resource.creator?.fullName || resource.creator?.username || 'Unknown'}
                    </td>
                    <td style={{ padding: '16px', color: '#9ca3af', fontSize: '13px' }}>
                      {formatDate(resource.uploadedAt)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        background: `rgba(${statusBadge.color === '#10b981' ? '16,185,129' : statusBadge.color === '#f59e0b' ? '245,158,11' : '239,68,68'}, 0.2)`,
                        border: `1px solid ${statusBadge.color}`,
                        borderRadius: '20px',
                        color: statusBadge.color,
                        fontSize: '12px'
                      }}>
                        {statusBadge.text}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#9ca3af', fontSize: '13px' }}>
                      <div>{resource.rating || 0} rating</div>
                      <div style={{ marginTop: '4px', color: '#64748b' }}>
                        {resource.plagiarismScore || 0}% similarity
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openReview(resource.id)}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(96,165,250,0.18)',
                            border: '1px solid rgba(96,165,250,0.28)',
                            borderRadius: '6px',
                            color: '#bfdbfe',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Review
                        </button>
                        {resource.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveResource(resource.id)}
                              style={{
                                padding: '6px 12px',
                                background: 'rgba(16,185,129,0.2)',
                                border: '1px solid #10b981',
                                borderRadius: '6px',
                                color: '#10b981',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setShowRejectModal(resource.id)}
                              style={{
                                padding: '6px 12px',
                                background: 'rgba(239,68,68,0.2)',
                                border: '1px solid #ef4444',
                                borderRadius: '6px',
                                color: '#ef4444',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {resource.status !== 'pending' && (
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                            {resource.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedResource && (
        <div style={{
          marginTop: '20px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'start' }}>
              <div>
                <h3 style={{ margin: 0, color: 'white', fontSize: '24px', fontWeight: 700 }}>{selectedResource.title}</h3>
                <div style={{ marginTop: '8px', color: '#9ca3af' }}>
                  {selectedResource.creator?.email || selectedResource.uploadedBy?.name || 'Unknown uploader'}
                </div>
              </div>
              <button
                onClick={() => setSelectedResourceId('')}
                style={{
                  padding: '8px 12px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: '8px',
                  color: '#cbd5e1',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
            <p style={{ marginTop: '14px', color: '#cbd5e1', lineHeight: 1.7 }}>
              {selectedResource.description || 'No description provided.'}
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(selectedResource.tags || []).map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '999px',
                    background: 'rgba(168,85,247,0.16)',
                    border: '1px solid rgba(168,85,247,0.24)',
                    color: '#ddd6fe',
                    fontSize: '12px'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            {selectedResource.verificationNotes ? (
              <div style={{ marginTop: '16px' }}>
                <div style={{ color: 'white', fontWeight: 600, marginBottom: '6px' }}>Verification notes</div>
                <div style={{ color: '#cbd5e1', lineHeight: 1.6 }}>{selectedResource.verificationNotes}</div>
              </div>
            ) : null}
            <div style={{ marginTop: '18px' }}>
              <div style={{ color: 'white', fontWeight: 600, marginBottom: '8px' }}>Add moderation note</div>
              <textarea
                value={moderationNote}
                onChange={(event) => setModerationNote(event.target.value)}
                rows="4"
                placeholder="Add a reviewer note, version guidance, or moderation context..."
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                  {reviewLoading ? 'Refreshing full resource review payload...' : 'Notes are stored in moderation history and visible to other reviewers.'}
                </div>
                <button
                  onClick={async () => {
                    if (!selectedResource?.id || !moderationNote.trim() || !addModerationNote || noteSaving) return;
                    setNoteSaving(true);
                    try {
                      await addModerationNote(selectedResource.id, moderationNote.trim());
                      setModerationNote('');
                    } finally {
                      setNoteSaving(false);
                    }
                  }}
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(168,85,247,0.2)',
                    border: '1px solid rgba(168,85,247,0.28)',
                    borderRadius: '10px',
                    color: '#e9d5ff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: noteSaving ? 0.7 : 1
                  }}
                >
                  {noteSaving ? 'Saving note...' : 'Save Note'}
                </button>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gap: '14px' }}>
            <div style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
              <div style={{ color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Insights</div>
              <div style={{ marginTop: '10px', color: '#f8fafc' }}>Downloads: {selectedResource.downloads || 0}</div>
              <div style={{ marginTop: '6px', color: '#f8fafc' }}>Views: {selectedResource.views || 0}</div>
              <div style={{ marginTop: '6px', color: '#f8fafc' }}>Similarity score: {selectedResource.plagiarismScore || 0}%</div>
            </div>
            <div style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
              <div style={{ color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Prerequisites</div>
              <div style={{ marginTop: '10px', color: '#cbd5e1', lineHeight: 1.6 }}>
                {(selectedResource.prerequisites || []).length ? selectedResource.prerequisites.join(', ') : 'No prerequisites listed.'}
              </div>
            </div>
            <div style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
              <div style={{ color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Potential matches</div>
              <div style={{ marginTop: '10px', display: 'grid', gap: '8px' }}>
                {(selectedResource.plagiarismMatches || []).length ? (
                  selectedResource.plagiarismMatches.map((match) => (
                    <div key={`${match.resourceId}-${match.title}`} style={{ color: '#cbd5e1', fontSize: '13px' }}>
                      {match.title} ({match.score}%)
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: '13px' }}>No strong overlap detected.</div>
                )}
              </div>
            </div>
            <div style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
              <div style={{ color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Version history</div>
              <div style={{ marginTop: '10px', display: 'grid', gap: '8px' }}>
                {(selectedResource.versions || []).length ? (
                  selectedResource.versions.map((version, index) => (
                    <div key={`${version.version || index}-${version.updatedAt || index}`} style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6 }}>
                      <strong>{version.version || `Version ${index + 1}`}</strong>
                      <br />
                      {version.summary || 'No summary provided.'}
                      {version.updatedBy?.fullName || version.updatedBy?.username ? (
                        <>
                          <br />
                          Updated by {version.updatedBy.fullName || version.updatedBy.username}
                        </>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: '13px' }}>No resource versions recorded yet.</div>
                )}
              </div>
            </div>
            <div style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
              <div style={{ color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Moderation timeline</div>
              <div style={{ marginTop: '10px', display: 'grid', gap: '10px' }}>
                {(selectedResource.moderationHistory || []).length ? (
                  selectedResource.moderationHistory.map((item, index) => (
                    <div key={`${item.createdAt || index}-${item.action || index}`} style={{ borderLeft: '2px solid rgba(96,165,250,0.35)', paddingLeft: '10px' }}>
                      <div style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 700 }}>
                        {item.action?.replaceAll('_', ' ') || 'update'}
                      </div>
                      <div style={{ color: '#cbd5e1', fontSize: '13px', marginTop: '4px' }}>
                        {item.note || `Status: ${item.status || 'n/a'}`}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>
                        {item.actor?.fullName || item.actor?.username || 'System'} • {item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN') : 'Unknown time'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: '13px' }}>No moderation history yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(20,20,40,0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'white' }}>
              Reject Resource
            </h3>
            <p style={{ color: '#9ca3af', marginBottom: '16px', fontSize: '14px' }}>
              Please provide a reason for rejection
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows="4"
              placeholder="e.g., Duplicate content, Inappropriate material, etc."
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: '20px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason('');
                }}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: '#9ca3af',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={!rejectReason.trim()}
                style={{
                  padding: '8px 16px',
                  background: !rejectReason.trim() ? 'rgba(239,68,68,0.3)' : '#ef4444',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: !rejectReason.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResourceTable;
