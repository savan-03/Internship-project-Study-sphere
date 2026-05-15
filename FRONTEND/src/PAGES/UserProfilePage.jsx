import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import { useAuth } from '../components/context/AuthContext';
import { useResources } from '../components/context/ResourceContext';
import { toggleFollowUser } from '../components/context/Social.service';
import {
  getProfileSummary,
  getUserProfileSummaryById,
} from '../components/context/Auth.service';

const pageShell = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)',
  color: '#f8fafc',
};

const glassCard = {
  borderRadius: '24px',
  background: 'rgba(15,23,42,0.48)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 20px 40px -32px rgba(0,0,0,0.45)',
  backdropFilter: 'blur(16px)',
};

const statTone = {
  violet: '#c4b5fd',
  blue: '#7dd3fc',
  pink: '#f9a8d4',
  emerald: '#6ee7b7',
  amber: '#fcd34d',
  slate: '#cbd5e1',
};

const formatDate = (value) => {
  if (!value) return 'Recently';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const modalInput = {
  width: '100%',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.06)',
  color: '#f8fafc',
  padding: '14px 16px',
};

const UserProfilePage = () => {
  const { user } = useAuth();
  const { uploadResource } = useResources();
  const { userId } = useParams();
  const isPublicView = Boolean(userId && userId !== user?.id);
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState({ user: null, stats: {}, uploads: [], activity: [], achievements: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [workingFollow, setWorkingFollow] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    type: 'pdf',
    category: 'General',
    tags: '',
    externalUrl: '',
    file: null,
  });

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = isPublicView && userId
        ? await getUserProfileSummaryById(userId)
        : await getProfileSummary();
      setSummary({
        user: data.user || null,
        stats: data.stats || {},
        uploads: data.uploads || [],
        activity: data.activity || [],
        achievements: data.achievements || [],
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load the profile summary.');
    } finally {
      setLoading(false);
    }
  }, [isPublicView, userId]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const viewedUser = useMemo(() => {
    if (summary.user) {
      return {
        ...summary.user,
        id: summary.user._id || summary.user.id,
        profile: {
          bio: summary.user.bio || '',
          location: summary.user.location || '',
          skills: summary.user.skills || [],
          interests: summary.user.interests || [],
          learningGoals: summary.user.learningGoals || [],
          dailyStudyHours: summary.user.dailyStudyHours || '',
          currentRole: summary.user.currentRole || '',
          yearsOfExperience: summary.user.yearsOfExperience || '',
          targetRole: summary.user.targetRole || '',
          careerGoal: summary.user.careerGoal || '',
          profileType: summary.user.profileType || 'user',
          website: summary.user.website || '',
        },
      };
    }

    return user
      ? {
          ...user,
          id: user.id || user._id,
          profile: user.profile || {},
        }
      : null;
  }, [summary.user, user]);

  const metrics = useMemo(() => ([
    { label: 'Points', value: summary.stats?.points || 0, tone: '#c4b5fd' },
    { label: 'Streak', value: summary.stats?.streak || 0, tone: '#7dd3fc' },
    { label: 'Uploads', value: summary.stats?.uploadsCount || 0, tone: '#f9a8d4' },
    { label: 'Followers', value: viewedUser?.socialCounts?.followers || 0, tone: '#6ee7b7' },
  ]), [summary.stats, viewedUser?.socialCounts?.followers]);

  const handleUpload = async (event) => {
    event.preventDefault();
    setUploading(true);
    setError('');
    try {
      await uploadResource({
        title: uploadForm.title,
        description: uploadForm.description,
        type: uploadForm.type,
        category: uploadForm.category,
        tags: uploadForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        externalUrl: uploadForm.externalUrl,
        file: uploadForm.file,
        fileName: uploadForm.file?.name || '',
        fileSize: uploadForm.file?.size || '',
      });
      setShowUploadModal(false);
      setUploadForm({
        title: '',
        description: '',
        type: 'pdf',
        category: 'General',
        tags: '',
        externalUrl: '',
        file: null,
      });
      await loadSummary();
      setActiveTab('uploads');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to upload the resource right now.');
    } finally {
      setUploading(false);
    }
  };

  const profile = viewedUser?.profile || {};
  const userName = viewedUser?.fullName || 'StudySphere User';
  const isOwnProfile = !isPublicView;
  const followerIds = viewedUser?.followerUsers || [];
  const followingIds = viewedUser?.followingUsers || [];
  const isFollowingViewedUser = Boolean(user?.id && followerIds.some((id) => String(id) === String(user.id)));
  const isFollowedByViewedUser = Boolean(user?.id && followingIds.some((id) => String(id) === String(user.id)));

  return (
    <div style={pageShell}>
      {showUploadModal && isOwnProfile ? (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(3,7,18,0.8)', padding: '16px' }}>
          <div style={{ ...glassCard, width: '100%', maxWidth: '760px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 18px', fontSize: '24px', fontWeight: 800 }}>Upload Resource</h3>
            <form onSubmit={handleUpload} style={{ display: 'grid', gap: '16px' }}>
              <input style={modalInput} placeholder="Title" value={uploadForm.title} onChange={(e) => setUploadForm((prev) => ({ ...prev, title: e.target.value }))} required />
              <textarea style={{ ...modalInput, minHeight: '110px' }} placeholder="Description" value={uploadForm.description} onChange={(e) => setUploadForm((prev) => ({ ...prev, description: e.target.value }))} required />
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                <select style={modalInput} value={uploadForm.type} onChange={(e) => setUploadForm((prev) => ({ ...prev, type: e.target.value }))}>
                  <option value="pdf">PDF</option>
                  <option value="link">Link</option>
                  <option value="notes">Notes</option>
                  <option value="video">Video</option>
                </select>
                <input style={modalInput} placeholder="Category" value={uploadForm.category} onChange={(e) => setUploadForm((prev) => ({ ...prev, category: e.target.value }))} />
              </div>
              <input style={modalInput} placeholder="External URL (optional)" value={uploadForm.externalUrl} onChange={(e) => setUploadForm((prev) => ({ ...prev, externalUrl: e.target.value }))} />
              <input type="file" style={modalInput} onChange={(e) => setUploadForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))} />
              <input style={modalInput} placeholder="Tags (comma separated)" value={uploadForm.tags} onChange={(e) => setUploadForm((prev) => ({ ...prev, tags: e.target.value }))} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" disabled={uploading} style={{ flex: 1, borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', padding: '13px 16px', fontWeight: 700, cursor: 'pointer', opacity: uploading ? 0.75 : 1 }}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button type="button" onClick={() => setShowUploadModal(false)} style={{ flex: 1, borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#f8fafc', padding: '13px 16px', fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div style={{ paddingTop: '96px', paddingBottom: '48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ marginBottom: '28px', borderRadius: '30px', background: 'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(139,92,246,0.22) 48%, rgba(236,72,153,0.18) 100%)', border: '1px solid rgba(147,197,253,0.18)', padding: '32px', boxShadow: '0 30px 80px -40px rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <div style={{ display: 'flex', height: '84px', width: '84px', alignItems: 'center', justifyContent: 'center', borderRadius: '24px', background: 'rgba(255,255,255,0.16)', fontSize: '32px', fontWeight: 800, color: '#fff' }}>
                  {viewedUser?.avatar || userName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'inline-flex', borderRadius: '999px', background: 'rgba(15,23,42,0.26)', padding: '7px 12px', fontSize: '12px', letterSpacing: '0.16em', fontWeight: 800, textTransform: 'uppercase', color: '#dbeafe' }}>
                    {isOwnProfile ? 'Learner Profile' : 'Community Profile'}
                  </div>
                  <h1 style={{ fontSize: '34px', fontWeight: 900, margin: '12px 0 0' }}>{userName}</h1>
                  <p style={{ margin: '8px 0 0', color: '#dbeafe' }}>@{viewedUser?.username || 'studysphere-user'}</p>
                  <p style={{ margin: '8px 0 0', color: '#c4b5fd', fontSize: '14px' }}>
                    {profile.currentRole || profile.targetRole || viewedUser?.socialProfile?.headline || 'Building a StudySphere journey'}
                    {summary.stats?.level ? ` | ${summary.stats.level}` : ''}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {isOwnProfile ? (
                  <>
                    <button onClick={() => setShowUploadModal(true)} style={{ borderRadius: '14px', border: 'none', background: '#ffffff', color: '#6d28d9', padding: '12px 18px', fontWeight: 800, cursor: 'pointer' }}>
                      + Upload Resource
                    </button>
                    <Link to="/settings" style={{ textDecoration: 'none', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(15,23,42,0.35)', color: '#f8fafc', padding: '12px 18px', fontWeight: 700 }}>
                      Edit Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to={`/social/direct/${viewedUser?.id || userId}`} style={{ textDecoration: 'none', borderRadius: '14px', border: '1px solid rgba(16,185,129,0.24)', background: 'rgba(16,185,129,0.18)', color: '#d1fae5', padding: '12px 18px', fontWeight: 700 }}>
                      Message
                    </Link>
                    <button
                      onClick={async () => {
                        if (!viewedUser?.id || workingFollow) return;
                        setWorkingFollow(true);
                        try {
                          await toggleFollowUser(viewedUser.id);
                          await loadSummary();
                        } catch (err) {
                          setError(err?.response?.data?.message || 'Unable to update follow status right now.');
                        } finally {
                          setWorkingFollow(false);
                        }
                      }}
                      style={{ borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#ffffff', padding: '12px 18px', fontWeight: 700, cursor: 'pointer', opacity: workingFollow ? 0.7 : 1 }}
                    >
                      {workingFollow ? 'Working...' : isFollowingViewedUser ? 'Unfollow' : 'Follow'}
                    </button>
                    <Link to="/social" style={{ textDecoration: 'none', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(15,23,42,0.35)', color: '#f8fafc', padding: '12px 18px', fontWeight: 700 }}>
                      Back to Social
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {error ? (
            <div style={{ marginBottom: '20px', borderRadius: '18px', background: 'rgba(127,29,29,0.4)', border: '1px solid rgba(248,113,113,0.3)', padding: '14px 16px', color: '#fecaca' }}>
              {error}
            </div>
          ) : null}

          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', marginBottom: '28px' }}>
            {metrics.map((metric) => (
              <div key={metric.label} style={{ ...glassCard, padding: '20px' }}>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>{metric.label}</div>
                <div style={{ marginTop: '10px', fontSize: '32px', fontWeight: 900, color: metric.tone }}>{metric.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px', flexWrap: 'wrap' }}>
            {['overview', 'uploads', 'activity', 'achievements'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 0', border: 'none', background: 'none', color: activeTab === tab ? '#c4b5fd' : '#94a3b8', borderBottom: activeTab === tab ? '2px solid #8b5cf6' : '2px solid transparent', fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer' }}>
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ ...glassCard, padding: '28px', color: '#cbd5e1' }}>Loading profile summary...</div>
          ) : null}

          {!loading && activeTab === 'overview' ? (
            <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1.6fr 1fr' }}>
              <div style={{ display: 'grid', gap: '24px' }}>
                <div style={{ ...glassCard, padding: '24px' }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '22px', fontWeight: 800 }}>About</h3>
                  <p style={{ color: '#cbd5e1', lineHeight: 1.8, margin: 0 }}>
                    {profile.bio || viewedUser?.socialProfile?.headline || 'This learner is still building out their StudySphere profile.'}
                  </p>
                </div>
                <div style={{ ...glassCard, padding: '24px' }}>
                  <h3 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 800 }}>Learning Snapshot</h3>
                  <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>Target Role</div>
                      <div style={{ marginTop: '6px', fontWeight: 700 }}>{profile.targetRole || 'Not set yet'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>Location</div>
                      <div style={{ marginTop: '6px', fontWeight: 700 }}>{profile.location || 'Not set yet'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>Daily Study Hours</div>
                      <div style={{ marginTop: '6px', fontWeight: 700 }}>{profile.dailyStudyHours || 'Not set yet'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>Career Goal</div>
                      <div style={{ marginTop: '6px', fontWeight: 700 }}>{profile.careerGoal || 'Not set yet'}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ ...glassCard, padding: '24px' }}>
                <h3 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 800 }}>
                  {isOwnProfile ? 'Account' : 'Community Snapshot'}
                </h3>
                <div style={{ display: 'grid', gap: '14px', fontSize: '14px', color: '#cbd5e1' }}>
                  <div><strong style={{ color: '#f8fafc' }}>Username:</strong> {viewedUser?.username}</div>
                  <div><strong style={{ color: '#f8fafc' }}>Role:</strong> {viewedUser?.role}</div>
                  <div><strong style={{ color: '#f8fafc' }}>Following:</strong> {viewedUser?.socialCounts?.following || 0}</div>
                  <div><strong style={{ color: '#f8fafc' }}>Followers:</strong> {viewedUser?.socialCounts?.followers || 0}</div>
                  {!isOwnProfile ? <div><strong style={{ color: '#f8fafc' }}>Relationship:</strong> {isFollowingViewedUser ? 'You follow this learner' : 'Not following yet'}{isFollowedByViewedUser ? ' | Follows you back' : ''}</div> : null}
                  {isOwnProfile ? <div><strong style={{ color: '#f8fafc' }}>Phone:</strong> {user?.phone || 'Not set yet'}</div> : null}
                  <div><strong style={{ color: '#f8fafc' }}>Website:</strong> {profile.website || 'Not set yet'}</div>
                  {isOwnProfile ? <div><strong style={{ color: '#f8fafc' }}>Bookmarks:</strong> {summary.stats?.bookmarksCount || 0}</div> : null}
                  {isOwnProfile ? <div><strong style={{ color: '#f8fafc' }}>Collections:</strong> {summary.stats?.collectionsCount || 0}</div> : null}
                </div>
                {!!profile.skills?.length && (
                  <div style={{ marginTop: '18px' }}>
                    <div style={{ marginBottom: '10px', fontSize: '13px', color: '#94a3b8' }}>Skills</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {profile.skills.slice(0, 6).map((skill) => (
                        <span key={skill} style={{ padding: '6px 10px', borderRadius: '999px', background: 'rgba(139,92,246,0.16)', color: '#ddd6fe', fontSize: '12px' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {!loading && activeTab === 'uploads' ? (
            <div style={{ ...glassCard, padding: '24px' }}>
              <h3 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 800 }}>
                {isOwnProfile ? 'Uploaded Resources' : 'Shared Resources'}
              </h3>
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                {summary.uploads.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', borderRadius: '18px', border: '1px dashed rgba(255,255,255,0.16)', padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                    {isOwnProfile ? 'No resources uploaded yet.' : 'No public resources shared yet.'}
                  </div>
                ) : (
                  summary.uploads.map((resource) => (
                    <Link key={resource.id} to={`/resources/${resource.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', padding: '18px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                          <div>
                            <h4 style={{ margin: 0, fontWeight: 800 }}>{resource.title}</h4>
                            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#94a3b8' }}>{resource.category} | {resource.type}</p>
                          </div>
                          <span style={{ borderRadius: '999px', background: 'rgba(139,92,246,0.18)', padding: '6px 10px', fontSize: '12px', color: '#c4b5fd', fontWeight: 700 }}>{resource.status}</span>
                        </div>
                        <p style={{ marginTop: '12px', fontSize: '14px', color: '#cbd5e1', lineHeight: 1.7 }}>{resource.description || 'No description added yet.'}</p>
                        <div style={{ marginTop: '14px', display: 'flex', gap: '14px', fontSize: '13px', color: '#94a3b8', flexWrap: 'wrap' }}>
                          <span>{formatDate(resource.createdAt)}</span>
                          <span>{resource.views || 0} views</span>
                          <span>{resource.downloads || 0} downloads</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {!loading && activeTab === 'activity' ? (
            <div style={{ ...glassCard, padding: '24px' }}>
              <h3 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 800 }}>
                {isOwnProfile ? 'Activity History' : 'Recent Activity'}
              </h3>
              <div style={{ display: 'grid', gap: '14px' }}>
                {summary.activity.length === 0 ? (
                  <div style={{ borderRadius: '18px', border: '1px dashed rgba(255,255,255,0.16)', padding: '24px', color: '#94a3b8' }}>
                    {isOwnProfile
                      ? 'Your activity will appear here as you update your profile, upload resources, review content, and participate.'
                      : 'No public activity to show yet.'}
                  </div>
                ) : (
                  summary.activity.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderRadius: '18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px 18px' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{item.label}</div>
                        <div style={{ marginTop: '4px', fontSize: '13px', color: '#94a3b8' }}>{formatDate(item.createdAt)}</div>
                      </div>
                      <div style={{ color: '#7dd3fc', fontWeight: 800 }}>+{item.pointsAwarded || 0} pts</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {!loading && activeTab === 'achievements' ? (
            <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1.2fr 1fr' }}>
              <div style={{ ...glassCard, padding: '24px' }}>
                <h3 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 800 }}>Achievements</h3>
                <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                  {summary.achievements.map((item) => (
                    <div key={item.id} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '18px' }}>
                      <div style={{ marginBottom: '10px', fontSize: '28px', color: statTone[item.tone] || '#cbd5e1', fontWeight: 900 }}>★</div>
                      <div style={{ fontWeight: 700 }}>{item.title}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...glassCard, padding: '24px' }}>
                <h3 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 800 }}>Progress</h3>
                <div style={{ display: 'grid', gap: '14px' }}>
                  <div style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>Current Level</div>
                    <div style={{ marginTop: '8px', fontSize: '28px', fontWeight: 900, color: '#c4b5fd' }}>{summary.stats?.level || 'Beginner'}</div>
                  </div>
                  <div style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>Approved Uploads</div>
                    <div style={{ marginTop: '8px', fontSize: '28px', fontWeight: 900, color: '#6ee7b7' }}>{summary.stats?.approvedUploads || 0}</div>
                  </div>
                  <div style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>Reviews Written</div>
                    <div style={{ marginTop: '8px', fontSize: '28px', fontWeight: 900, color: '#7dd3fc' }}>{summary.stats?.reviewsCount || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserProfilePage;
