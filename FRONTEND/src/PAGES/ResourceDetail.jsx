import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ResourceModuleNav from '../components/resources/ResourceModuleNav';
import ReviewList from '../components/resources/ReviewList';
import { useAuth } from '../components/context/AuthContext';
import { useResources } from '../components/context/ResourceContext';

const panelStyle = {
  marginBottom: '28px',
  borderRadius: '20px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '24px',
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '12px',
  color: '#fff',
};

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getResourceById,
    toggleBookmark,
    isBookmarked,
    collections,
    addToCollection,
    approveResource,
    rejectResource,
    addModerationNote,
    getResourceReviews,
    addReview,
    getResourceComments,
    addComment,
    addCommentReply,
    registerDownload,
  } = useResources();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentMessage, setCommentMessage] = useState('');
  const [replyDrafts, setReplyDrafts] = useState({});
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [moderationNote, setModerationNote] = useState('');
  const [moderationReason, setModerationReason] = useState('');
  const [moderating, setModerating] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      setLoading(true);
      setError('');

      try {
        const nextResource = await getResourceById(id);
        setResource(nextResource);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load this resource.');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [getResourceById, id]);

  const formatDate = (value) => {
    if (!value) return 'Recently added';
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const creatorName =
    resource?.creator?.fullName || resource?.creator?.username || 'StudySphere Community';
  const canModerate = user?.role === 'admin' || user?.role === 'moderator';
  const isOwner = user && resource?.creator?.id === user.id;
  const availableCollections = useMemo(
    () =>
      collections.filter(
        (collection) => !collection.resourceIds?.includes(resource?.id)
      ),
    [collections, resource?.id]
  );
  const comments = resource ? getResourceComments(resource.id) : [];

  const refreshResource = async () => {
    const nextResource = await getResourceById(id);
    setResource(nextResource);
  };

  const handleModeration = async (nextStatus) => {
    if (!resource) return;
    setModerating(true);
    try {
      if (moderationNote.trim()) {
        await addModerationNote(resource.id, moderationNote.trim());
      }
      if (nextStatus === 'approved') {
        await approveResource(resource.id);
      } else {
        await rejectResource(
          resource.id,
          moderationReason.trim() || 'Needs revision before publishing.'
        );
      }
      setModerationNote('');
      setModerationReason('');
      await refreshResource();
    } finally {
      setModerating(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #050816 0%, #111827 100%)',
      color: 'white',
      padding: '120px 24px 48px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        maxWidth: '1040px',
        margin: '0 auto',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        padding: '32px',
        backdropFilter: 'blur(12px)',
      }}>
        <ResourceModuleNav />
        <p style={{ color: '#a78bfa', marginBottom: '12px', fontWeight: 600 }}>
          Resource Detail
        </p>
        {loading ? (
          <div style={{ padding: '32px 0' }}>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', margin: '0 0 16px' }}>
              Loading resource...
            </h1>
            <p style={{ color: '#cbd5e1', lineHeight: 1.7 }}>
              Pulling the latest resource details from the StudySphere backend.
            </p>
          </div>
        ) : error ? (
          <div style={{
            padding: '20px',
            marginBottom: '24px',
            borderRadius: '16px',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.4)',
            color: '#fecaca'
          }}>
            {error}
          </div>
        ) : (
          <>
            {resource?.status !== 'approved' ? (
              <div style={{
                marginBottom: '20px',
                padding: '16px 18px',
                borderRadius: '16px',
                background: resource.status === 'rejected' ? 'rgba(127,29,29,0.28)' : 'rgba(245,158,11,0.16)',
                border: resource.status === 'rejected' ? '1px solid rgba(248,113,113,0.2)' : '1px solid rgba(245,158,11,0.24)',
                color: resource.status === 'rejected' ? '#fecaca' : '#fde68a',
              }}>
                This resource is currently <strong style={{ textTransform: 'capitalize' }}>{resource.status}</strong>.
                {resource.rejectionReason ? ` Reason: ${resource.rejectionReason}` : ''}
                {(isOwner || canModerate) ? (
                  <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => navigate('/resources/my-uploads')}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.14)',
                        background: 'rgba(255,255,255,0.08)',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Open My Uploads
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', margin: '0 0 16px' }}>
              {resource?.title}
            </h1>
            <p style={{ color: '#cbd5e1', lineHeight: 1.7, marginBottom: '24px' }}>
              {resource?.description || 'No description was provided for this resource yet.'}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
              marginBottom: '24px'
            }}>
              {[
                ['Type', resource?.type || 'Resource'],
                ['Category', resource?.category || 'General'],
                ['Uploaded By', creatorName],
                ['Uploaded On', formatDate(resource?.uploadedAt || resource?.createdAt)],
                ['Status', resource?.status || 'pending'],
                ['Downloads', String(resource?.downloads || 0)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>{label}</div>
                  <div style={{ fontSize: '15px', color: '#fff', fontWeight: 600, textTransform: 'capitalize' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {!!resource?.tags?.length && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {resource.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '999px',
                      background: 'rgba(167,139,250,0.16)',
                      border: '1px solid rgba(167,139,250,0.28)',
                      color: '#c4b5fd',
                      fontSize: '13px'
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {!!resource?.prerequisites?.length && (
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 800 }}>Prerequisites</h2>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {resource.prerequisites.map((item) => (
                    <span key={item} style={{ padding: '8px 12px', borderRadius: '999px', background: 'rgba(59,130,246,0.14)', border: '1px solid rgba(96,165,250,0.24)', color: '#bfdbfe', fontSize: '13px' }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
              {resource?.externalUrl ? (
                <a
                  href={resource.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    if (resource.status === 'approved') {
                      registerDownload(resource.id);
                    }
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 18px',
                    borderRadius: '12px',
                    background: 'rgba(59,130,246,0.14)',
                    border: '1px solid rgba(96,165,250,0.35)',
                    color: '#bfdbfe',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  {resource.status === 'approved'
                    ? resource.type === 'link'
                      ? 'Open Resource Link'
                      : 'Open Resource'
                    : 'Preview Resource'}
                </a>
              ) : null}
              <button
                type="button"
                onClick={() => toggleBookmark(resource.id)}
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: isBookmarked(resource.id) ? 'rgba(139,92,246,0.24)' : 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {isBookmarked(resource.id) ? 'Bookmarked' : 'Save Resource'}
              </button>
              {availableCollections.length > 0 ? (
                <>
                  <select
                    value={selectedCollectionId}
                    onChange={(event) => setSelectedCollectionId(event.target.value)}
                    style={{ ...inputStyle, width: '220px' }}
                  >
                    <option value="">Select collection</option>
                    {availableCollections.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!selectedCollectionId) return;
                      await addToCollection(selectedCollectionId, resource.id);
                      setSelectedCollectionId('');
                    }}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '12px',
                      border: '1px solid rgba(96,165,250,0.24)',
                      background: 'rgba(59,130,246,0.14)',
                      color: '#bfdbfe',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Add to Collection
                  </button>
                </>
              ) : null}
              {isOwner ? (
                <button
                  type="button"
                  onClick={() => navigate('/resources/my-uploads')}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '12px',
                    border: '1px solid rgba(167,139,250,0.28)',
                    background: 'rgba(167,139,250,0.14)',
                    color: '#ddd6fe',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Manage Upload
                </button>
              ) : null}
            </div>

            <div style={panelStyle}>
              <h2 style={{ marginTop: 0, marginBottom: '14px', fontSize: '24px', fontWeight: 800 }}>Ratings and Reviews</h2>
              <ReviewList
                reviews={getResourceReviews(resource.id)}
                onAddReview={(rating, comment) =>
                  addReview(resource.id, {
                    userName: user?.fullName || user?.username || 'StudySphere User',
                    userAvatar: user?.avatar || 'SS',
                    rating,
                    comment,
                  }).then(refreshResource)
                }
              />
            </div>

            <div style={panelStyle}>
              <h2 style={{ marginTop: 0, marginBottom: '14px', fontSize: '24px', fontWeight: 800 }}>Resource Insights</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '18px' }}>
                <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Plagiarism Score</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#fca5a5' }}>{resource?.plagiarismScore || 0}%</div>
                </div>
                <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Version Entries</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#c4b5fd' }}>{resource?.versionHistory?.length || 0}</div>
                </div>
              </div>
              {resource?.extractedSummary ? (
                <div style={{ marginBottom: '14px', color: '#cbd5e1', lineHeight: 1.7 }}>
                  <strong style={{ color: '#f8fafc' }}>Extracted Summary:</strong> {resource.extractedSummary}
                </div>
              ) : null}
              {resource?.verificationNotes ? (
                <div style={{ marginBottom: '14px', color: '#cbd5e1', lineHeight: 1.7 }}>
                  <strong style={{ color: '#f8fafc' }}>Verification Notes:</strong> {resource.verificationNotes}
                </div>
              ) : null}
              {!!resource?.plagiarismMatches?.length && (
                <div style={{ display: 'grid', gap: '10px', marginBottom: '14px' }}>
                  {resource.plagiarismMatches.map((match, index) => (
                    <div key={`${match.resourceId || match.title}-${index}`} style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700 }}>{match.title || 'Matched resource'}</div>
                      <div style={{ marginTop: '4px', color: '#94a3b8' }}>Similarity: {match.score || 0}%</div>
                    </div>
                  ))}
                </div>
              )}
              {!!resource?.versionHistory?.length && (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {resource.versionHistory.slice(0, 4).map((version, index) => (
                    <div key={`${version.updatedAt}-${index}`} style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700 }}>{version.title || 'Previous version'}</div>
                      <div style={{ marginTop: '4px', color: '#94a3b8' }}>{version.description || 'No description saved.'}</div>
                      <div style={{ marginTop: '4px', color: '#64748b', fontSize: '12px' }}>
                        Updated {formatDate(version.updatedAt)} by {version.updatedBy?.fullName || version.updatedBy?.username || 'StudySphere'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {canModerate ? (
              <div style={panelStyle}>
                <h2 style={{ marginTop: 0, marginBottom: '14px', fontSize: '24px', fontWeight: 800 }}>Moderation Controls</h2>
                <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr' }}>
                  <textarea
                    value={moderationNote}
                    onChange={(event) => setModerationNote(event.target.value)}
                    rows={4}
                    placeholder="Internal moderation note"
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                  <textarea
                    value={moderationReason}
                    onChange={(event) => setModerationReason(event.target.value)}
                    rows={4}
                    placeholder="Reason used if this resource is rejected"
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
                <div style={{ marginTop: '14px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button type="button" disabled={moderating} onClick={() => handleModeration('approved')} style={{ padding: '11px 16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #10b981, #22c55e)', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: moderating ? 0.7 : 1 }}>Approve</button>
                  <button type="button" disabled={moderating} onClick={() => handleModeration('rejected')} style={{ padding: '11px 16px', borderRadius: '12px', border: '1px solid rgba(248,113,113,0.24)', background: 'rgba(127,29,29,0.24)', color: '#fecaca', fontWeight: 700, cursor: 'pointer', opacity: moderating ? 0.7 : 1 }}>Reject</button>
                </div>
                {!!resource?.moderationHistory?.length && (
                  <div style={{ marginTop: '18px', display: 'grid', gap: '10px' }}>
                    {resource.moderationHistory.slice(0, 5).map((entry, index) => (
                      <div key={`${entry.createdAt}-${index}`} style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{entry.action?.replace(/_/g, ' ') || 'Moderation update'}</div>
                        <div style={{ marginTop: '4px', color: '#94a3b8' }}>{entry.note || 'No note provided.'}</div>
                        <div style={{ marginTop: '4px', color: '#64748b', fontSize: '12px' }}>
                          {entry.actor?.fullName || entry.actor?.username || 'Moderator'} - {formatDate(entry.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            <div style={panelStyle}>
              <h2 style={{ marginTop: 0, marginBottom: '14px', fontSize: '24px', fontWeight: 800 }}>Comments and Discussion</h2>
              <div style={{ marginBottom: '18px', display: 'grid', gap: '12px' }}>
                <textarea
                  value={commentMessage}
                  onChange={(event) => setCommentMessage(event.target.value)}
                  rows={4}
                  placeholder="Start a discussion about this resource..."
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                  }}
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!commentMessage.trim()) return;
                    await addComment(resource.id, commentMessage.trim());
                    setCommentMessage('');
                    await refreshResource();
                  }}
                  style={{
                    width: 'fit-content',
                    padding: '11px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Post Comment
                </button>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                {comments.length === 0 ? (
                  <div style={{ color: '#94a3b8' }}>No comments yet. Start the discussion.</div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px' }}>
                      <div style={{ fontWeight: 700 }}>{comment.user?.fullName || comment.user?.username || 'StudySphere User'}</div>
                      <div style={{ marginTop: '6px', color: '#cbd5e1', lineHeight: 1.7 }}>{comment.message}</div>
                      {!!comment.replies?.length && (
                        <div style={{ marginTop: '14px', display: 'grid', gap: '10px' }}>
                          {comment.replies.map((reply) => (
                            <div key={reply.id} style={{ marginLeft: '14px', borderLeft: '2px solid rgba(139,92,246,0.28)', paddingLeft: '12px' }}>
                              <div style={{ fontWeight: 700, fontSize: '13px' }}>{reply.user?.fullName || reply.user?.username || 'StudySphere User'}</div>
                              <div style={{ marginTop: '4px', color: '#cbd5e1', fontSize: '14px' }}>{reply.message}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                        <input
                          value={replyDrafts[comment.id] || ''}
                          onChange={(event) =>
                            setReplyDrafts((prev) => ({ ...prev, [comment.id]: event.target.value }))
                          }
                          placeholder="Write a reply..."
                          style={{
                            ...inputStyle,
                            flex: 1,
                            padding: '10px 12px',
                          }}
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const message = replyDrafts[comment.id];
                            if (!message?.trim()) return;
                            await addCommentReply(resource.id, comment.id, message.trim());
                            setReplyDrafts((prev) => ({ ...prev, [comment.id]: '' }));
                            await refreshResource();
                          }}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'rgba(59,130,246,0.18)',
                            color: '#bfdbfe',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link
            to="/resources"
            style={{
              padding: '12px 18px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: 'white',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Back To Library
          </Link>
          <Link
            to="/resources/upload"
            style={{
              padding: '12px 18px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'white',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Upload Resource
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetail;
