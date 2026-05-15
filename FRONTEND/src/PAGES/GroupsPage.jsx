import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';
import SocialModuleNav from '../components/social/SocialModuleNav';
import {
  createGroup,
  fetchGroups,
  joinGroup,
  leaveGroup,
} from '../components/context/Social.service';

const panel = {
  borderRadius: '24px',
  background: 'rgba(15,23,42,0.48)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '24px',
};

const inputStyle = {
  padding: '12px 14px',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
};

const formatTime = (value) => {
  if (!value) return 'Recently';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const GroupsPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [membershipFilter, setMembershipFilter] = useState('all');
  const [workingGroupId, setWorkingGroupId] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    tags: '',
    visibility: 'public',
  });
  const requestedGroupId = searchParams.get('group');

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await fetchGroups();
      setGroups(data.groups || []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load groups right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
    const intervalId = window.setInterval(loadGroups, 15000);
    return () => window.clearInterval(intervalId);
  }, []);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      if (visibilityFilter !== 'all' && group.visibility !== visibilityFilter) return false;
      if (membershipFilter === 'joined' && !group.isMember) return false;
      if (membershipFilter === 'discover' && group.isMember) return false;

      if (search.trim()) {
        const haystack = [
          group.name,
          group.description,
          group.owner?.fullName,
          ...(group.tags || []),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(search.trim().toLowerCase())) return false;
      }

      return true;
    });
  }, [groups, membershipFilter, search, visibilityFilter]);

  const selectedGroup =
    filteredGroups.find((group) => group.id === requestedGroupId) ||
    groups.find((group) => group.id === requestedGroupId) ||
    filteredGroups.find((group) => group.isMember) ||
    filteredGroups[0] ||
    groups[0] ||
    null;

  const joinedCount = groups.filter((group) => group.isMember).length;
  const discoverCount = groups.filter((group) => !group.isMember).length;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', paddingTop: '96px', paddingBottom: '48px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 16px', display: 'grid', gap: '24px' }}>
        <SocialModuleNav />
        <div style={{ ...panel, background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(139,92,246,0.2), rgba(16,185,129,0.14))' }}>
          <h1 style={{ margin: 0, fontSize: '34px', fontWeight: 900 }}>Study Groups</h1>
          <p style={{ marginTop: '10px', color: '#dbeafe' }}>
            Build focused circles around interview prep, DSA practice, AI learning, and peer accountability.
          </p>
          <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginTop: '20px' }}>
            {[
              ['All Groups', groups.length, '#bfdbfe'],
              ['Joined', joinedCount, '#86efac'],
              ['Discover', discoverCount, '#fde68a'],
            ].map(([label, value, color]) => (
              <div key={label} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.08)', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#dbeafe' }}>{label}</div>
                <div style={{ marginTop: '8px', fontSize: '28px', fontWeight: 900, color }}>{value}</div>
              </div>
            ))}
          </div>
          {error ? <div style={{ marginTop: '14px', color: '#fecaca' }}>{error}</div> : null}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '24px' }}>
          <div style={panel}>
            <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 900 }}>Create a Group</h2>
            <div style={{ display: 'grid', gap: '12px', marginTop: '18px' }}>
              <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Group name" style={inputStyle} />
              <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} rows={4} placeholder="What is this group for?" style={{ ...inputStyle, resize: 'vertical' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px auto', gap: '12px' }}>
                <input value={form.tags} onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))} placeholder="Tags" style={inputStyle} />
                <select value={form.visibility} onChange={(event) => setForm((prev) => ({ ...prev, visibility: event.target.value }))} style={inputStyle}>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
                <button
                  onClick={async () => {
                    if (!form.name.trim()) return;
                    setCreating(true);
                    try {
                      const response = await createGroup({
                        ...form,
                        tags: form.tags.split(',').map((item) => item.trim()).filter(Boolean),
                      });
                      setForm({ name: '', description: '', tags: '', visibility: 'public' });
                      if (response?.group?.id) {
                        setSearchParams({ group: response.group.id });
                      }
                      await loadGroups();
                    } catch (err) {
                      setError(err?.response?.data?.message || 'Unable to create the group right now.');
                    } finally {
                      setCreating(false);
                    }
                  }}
                  disabled={creating}
                  style={{ padding: '12px 18px', border: 'none', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: creating ? 0.7 : 1 }}
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>

          <div style={panel}>
            <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 900 }}>Browse Groups</h2>
            <div style={{ display: 'grid', gap: '12px', marginTop: '18px' }}>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search groups, owners, or tags" style={inputStyle} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <select value={visibilityFilter} onChange={(event) => setVisibilityFilter(event.target.value)} style={inputStyle}>
                  <option value="all">All visibility</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
                <select value={membershipFilter} onChange={(event) => setMembershipFilter(event.target.value)} style={inputStyle}>
                  <option value="all">All groups</option>
                  <option value="joined">Joined only</option>
                  <option value="discover">Discover only</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '24px' }}>
          <div style={{ display: 'grid', gap: '18px' }}>
            {filteredGroups.map((group) => {
              const recentPosts = (group.posts || []).slice(0, 2);
              return (
                <div
                  key={group.id}
                  style={{
                    ...panel,
                    border: selectedGroup?.id === group.id
                      ? '1px solid rgba(96,165,250,0.24)'
                      : panel.border,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '24px', fontWeight: 900 }}>{group.name}</div>
                        <span style={{ padding: '6px 10px', borderRadius: '999px', background: group.visibility === 'private' ? 'rgba(248,113,113,0.16)' : 'rgba(59,130,246,0.14)', color: group.visibility === 'private' ? '#fecaca' : '#bfdbfe', fontSize: '12px', fontWeight: 700 }}>
                          {group.visibility}
                        </span>
                        {group.isMember ? <span style={{ color: '#86efac', fontSize: '12px', fontWeight: 800 }}>Joined</span> : null}
                      </div>
                      <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '13px' }}>
                        Owner: {group.owner?.fullName || group.owner?.username || 'StudySphere'} | {group.memberCount || group.members?.length || 0} members
                      </div>
                      <div style={{ marginTop: '8px', color: '#cbd5e1', lineHeight: 1.7 }}>{group.description || 'A focused learning group.'}</div>
                      {!!group.tags?.length && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                          {group.tags.map((tag) => (
                            <span key={tag} style={{ padding: '6px 10px', borderRadius: '999px', background: 'rgba(139,92,246,0.16)', color: '#ddd6fe', fontSize: '12px' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => setSearchParams({ group: group.id })}
                        style={{ marginTop: '14px', border: 'none', background: 'none', color: '#93c5fd', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                      >
                        View snapshot
                      </button>
                    </div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {!group.isMember ? (
                        <button
                          onClick={async () => {
                            setWorkingGroupId(group.id);
                            try {
                              await joinGroup(group.id);
                              setSearchParams({ group: group.id });
                              await loadGroups();
                              setError('');
                            } catch (err) {
                              setError(err?.response?.data?.message || 'Unable to join this group right now.');
                            } finally {
                              setWorkingGroupId('');
                            }
                          }}
                          disabled={workingGroupId === group.id}
                          style={{ padding: '10px 14px', border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: workingGroupId === group.id ? 0.7 : 1 }}
                        >
                          {workingGroupId === group.id ? 'Joining...' : 'Join'}
                        </button>
                      ) : (
                        <Link to={`/social/chat?mode=groups&group=${group.id}`} style={{ textDecoration: 'none', padding: '10px 14px', borderRadius: '12px', background: 'rgba(16,185,129,0.18)', color: '#d1fae5', fontWeight: 800, textAlign: 'center' }}>
                          Open Chat
                        </Link>
                      )}
                      {group.isMember && String(group.owner?.id) !== String(user?.id) ? (
                        <button
                          onClick={async () => {
                            setWorkingGroupId(group.id);
                            try {
                              await leaveGroup(group.id);
                              await loadGroups();
                              setError('');
                            } catch (err) {
                              setError(err?.response?.data?.message || 'Unable to leave this group right now.');
                            } finally {
                              setWorkingGroupId('');
                            }
                          }}
                          disabled={workingGroupId === group.id}
                          style={{ padding: '10px 14px', border: '1px solid rgba(248,113,113,0.24)', borderRadius: '12px', background: 'rgba(127,29,29,0.22)', color: '#fecaca', fontWeight: 800, cursor: 'pointer', opacity: workingGroupId === group.id ? 0.7 : 1 }}
                        >
                          Leave
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {!!recentPosts.length && (
                    <div style={{ display: 'grid', gap: '10px', marginTop: '16px' }}>
                      {recentPosts.map((post) => (
                        <div key={post.id} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                          <div style={{ fontWeight: 700 }}>{post.author?.fullName || post.author?.username || 'Member'}</div>
                          <div style={{ marginTop: '6px', color: '#cbd5e1' }}>{post.message}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {!loading && !filteredGroups.length ? <div style={{ color: '#94a3b8' }}>No groups match the current filters.</div> : null}
            {loading ? <div style={{ color: '#94a3b8' }}>Loading groups...</div> : null}
          </div>

          <div style={{ ...panel, alignSelf: 'start' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: 900 }}>Selected Group Snapshot</h2>
            {selectedGroup ? (
              <>
                <div style={{ fontSize: '24px', fontWeight: 900 }}>{selectedGroup.name}</div>
                <div style={{ marginTop: '8px', color: '#cbd5e1', lineHeight: 1.7 }}>{selectedGroup.description || 'A collaborative study room.'}</div>
                <div style={{ marginTop: '14px', color: '#94a3b8', fontSize: '13px' }}>
                  Created {formatTime(selectedGroup.createdAt)} | {selectedGroup.memberCount || selectedGroup.members?.length || 0} members
                </div>

                <div style={{ marginTop: '18px' }}>
                  <div style={{ marginBottom: '10px', color: '#94a3b8', fontSize: '13px' }}>Members</div>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {(selectedGroup.members || []).slice(0, 5).map((member) => (
                      <Link key={member.id} to={`/users/${member.id}`} style={{ textDecoration: 'none', color: 'inherit', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700 }}>{member.fullName}</div>
                        <div style={{ marginTop: '4px', color: '#93c5fd', fontSize: '13px' }}>@{member.username}</div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '18px' }}>
                  <div style={{ marginBottom: '10px', color: '#94a3b8', fontSize: '13px' }}>Recent posts</div>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {(selectedGroup.posts || []).slice(0, 3).map((post) => (
                      <div key={post.id} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700 }}>{post.author?.fullName || post.author?.username || 'Member'}</div>
                        <div style={{ marginTop: '6px', color: '#cbd5e1' }}>{post.message}</div>
                      </div>
                    ))}
                    {!(selectedGroup.posts || []).length ? <div style={{ color: '#94a3b8' }}>No posts yet.</div> : null}
                  </div>
                </div>
                {selectedGroup.isMember ? (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '18px' }}>
                    <Link to={`/social/chat?mode=groups&group=${selectedGroup.id}`} style={{ display: 'inline-flex', textDecoration: 'none', padding: '11px 16px', borderRadius: '12px', background: 'rgba(59,130,246,0.16)', color: '#bfdbfe', fontWeight: 800 }}>
                      Jump into group chat
                    </Link>
                    {selectedGroup.owner?.id && String(selectedGroup.owner.id) !== String(user?.id) ? (
                      <Link to={`/social/direct/${selectedGroup.owner.id}`} style={{ display: 'inline-flex', textDecoration: 'none', padding: '11px 16px', borderRadius: '12px', background: 'rgba(16,185,129,0.16)', color: '#d1fae5', fontWeight: 800 }}>
                        Message owner
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : (
              <div style={{ color: '#94a3b8' }}>Select or join a group to see more details.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupsPage;
