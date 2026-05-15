import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SocialModuleNav from '../components/social/SocialModuleNav';
import {
  fetchActivityFeed,
  fetchNetworkOverview,
  fetchSocialSummary,
  toggleFollowUser,
} from '../components/context/Social.service';

const panel = {
  borderRadius: '24px',
  background: 'rgba(15,23,42,0.48)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '24px',
  backdropFilter: 'blur(16px)',
};

const formatTime = (value) => {
  if (!value) return 'Recently';
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const buildFeedDescription = (item) => {
  const metadata = item.metadata || {};
  if (metadata.groupName) return `${item.actor.fullName} in ${metadata.groupName}`;
  if (metadata.threadTitle) return `${item.actor.fullName} on "${metadata.threadTitle}"`;
  if (metadata.mentorshipTitle) return `${item.actor.fullName} about "${metadata.mentorshipTitle}"`;
  if (metadata.targetUsername) return `${item.actor.fullName} with @${metadata.targetUsername}`;
  return item.actor.fullName;
};

const personCard = (person, actions) => (
  <div key={person.id} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
    <Link to={`/users/${person.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ fontWeight: 800 }}>{person.fullName}</div>
      <div style={{ marginTop: '4px', color: '#93c5fd', fontSize: '13px' }}>@{person.username} | {person.role}</div>
      <div style={{ marginTop: '6px', color: '#cbd5e1', lineHeight: 1.6 }}>
        {person.socialProfile?.headline || person.targetRole || person.bio || 'Building knowledge on StudySphere.'}
      </div>
    </Link>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
      {(person.skills || []).slice(0, 3).map((skill) => (
        <span key={skill} style={{ padding: '6px 10px', borderRadius: '999px', background: 'rgba(139,92,246,0.16)', color: '#ddd6fe', fontSize: '12px' }}>
          {skill}
        </span>
      ))}
    </div>
    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
      <div style={{ color: '#94a3b8', fontSize: '12px' }}>
        {person.counts?.followers || 0} followers | {person.stats?.level || 'Beginner'}
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {actions}
      </div>
    </div>
  </div>
);

const SocialHub = () => {
  const [summary, setSummary] = useState({ groups: [], threads: [], mentorship: [] });
  const [network, setNetwork] = useState({
    following: [],
    followers: [],
    suggestions: [],
    counts: { following: 0, followers: 0 },
  });
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingUserId, setWorkingUserId] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [summaryData, networkData, feedData] = await Promise.all([
        fetchSocialSummary(),
        fetchNetworkOverview(),
        fetchActivityFeed(),
      ]);
      setSummary(summaryData);
      setNetwork(networkData);
      setFeed(feedData.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const intervalId = window.setInterval(load, 15000);
    return () => window.clearInterval(intervalId);
  }, []);

  const joinedGroups = useMemo(
    () => (summary.groups || []).filter((group) => group.isMember),
    [summary.groups]
  );

  const handleFollowToggle = async (personId) => {
    setWorkingUserId(personId);
    try {
      await toggleFollowUser(personId);
      await load();
    } finally {
      setWorkingUserId('');
    }
  };

  const renderMessageLink = (person) => (
    <Link
      to={`/social/direct/${person.id}`}
      style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(16,185,129,0.16)', color: '#d1fae5', fontWeight: 800, textDecoration: 'none' }}
    >
      Message
    </Link>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', paddingTop: '96px', paddingBottom: '48px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 16px' }}>
        <SocialModuleNav />
        <div style={{ ...panel, marginBottom: '24px', background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(139,92,246,0.22), rgba(236,72,153,0.18))' }}>
          <h1 style={{ margin: 0, fontSize: '34px', fontWeight: 900 }}>Community and Collaboration</h1>
          <p style={{ marginTop: '10px', color: '#dbeafe' }}>
            Follow learners, open public profiles, track your feed, join study groups, and turn forum activity into real collaboration.
          </p>
          <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginTop: '22px' }}>
            {[
              ['Following', network.counts?.following || 0, '#bfdbfe'],
              ['Followers', network.counts?.followers || 0, '#c4b5fd'],
              ['Joined Groups', joinedGroups.length, '#86efac'],
              ['Forum Threads', (summary.threads || []).length, '#fde68a'],
            ].map(([label, value, color]) => (
              <div key={label} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.08)', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#dbeafe' }}>{label}</div>
                <div style={{ marginTop: '8px', fontSize: '30px', fontWeight: 900, color }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
            <Link to="/groups" style={{ padding: '12px 18px', borderRadius: '14px', background: '#ffffff', color: '#312e81', textDecoration: 'none', fontWeight: 800 }}>Groups</Link>
            <Link to="/forums" style={{ padding: '12px 18px', borderRadius: '14px', background: 'rgba(255,255,255,0.08)', color: '#f8fafc', textDecoration: 'none', fontWeight: 800, border: '1px solid rgba(255,255,255,0.12)' }}>Forums</Link>
            <Link to="/social/chat" style={{ padding: '12px 18px', borderRadius: '14px', background: 'rgba(56,189,248,0.16)', color: '#e0f2fe', textDecoration: 'none', fontWeight: 800, border: '1px solid rgba(125,211,252,0.16)' }}>Community Chat</Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px', marginBottom: '24px' }}>
          <div style={panel}>
            <h2 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: 900 }}>Activity Feed</h2>
            {loading ? (
              <div style={{ color: '#94a3b8' }}>Loading social activity...</div>
            ) : feed.length === 0 ? (
              <div style={{ color: '#94a3b8' }}>Follow people and join groups to start building your social feed.</div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {feed.slice(0, 10).map((item) => (
                  <div key={item.id} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 800 }}>{item.label}</div>
                      <div style={{ color: '#64748b', fontSize: '12px' }}>{formatTime(item.createdAt)}</div>
                    </div>
                    <div style={{ marginTop: '8px', color: '#cbd5e1' }}>{buildFeedDescription(item)}</div>
                    <Link to={`/users/${item.actor.id}`} style={{ display: 'inline-block', marginTop: '10px', color: '#93c5fd', fontSize: '13px', textDecoration: 'none' }}>
                      View @{item.actor.username}
                    </Link>
                    {item.pointsAwarded ? (
                      <div style={{ marginTop: '8px', color: '#86efac', fontSize: '13px' }}>+{item.pointsAwarded} points</div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ ...panel, display: 'grid', gap: '18px', alignSelf: 'start' }}>
            <div>
              <h2 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: 900 }}>People to Follow</h2>
              {network.suggestions?.length ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {network.suggestions.slice(0, 4).map((person) =>
                    personCard(
                      person,
                      <>
                        {renderMessageLink(person)}
                        <button
                          onClick={() => handleFollowToggle(person.id)}
                          disabled={workingUserId === person.id}
                          style={{ padding: '10px 14px', border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: workingUserId === person.id ? 0.7 : 1 }}
                        >
                          {workingUserId === person.id ? 'Working...' : 'Follow'}
                        </button>
                      </>
                    )
                  )}
                </div>
              ) : (
                <div style={{ color: '#94a3b8' }}>You already follow everyone available right now.</div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div style={panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900 }}>Following</h2>
              <div style={{ color: '#94a3b8', fontSize: '13px' }}>{network.following?.length || 0} people</div>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {(network.following || []).slice(0, 5).map((person) =>
                personCard(
                  person,
                  <>
                    {renderMessageLink(person)}
                    <button
                      onClick={() => handleFollowToggle(person.id)}
                      disabled={workingUserId === person.id}
                      style={{ padding: '10px 14px', border: '1px solid rgba(248,113,113,0.24)', borderRadius: '12px', background: 'rgba(127,29,29,0.22)', color: '#fecaca', fontWeight: 800, cursor: 'pointer', opacity: workingUserId === person.id ? 0.7 : 1 }}
                    >
                      {workingUserId === person.id ? 'Working...' : 'Unfollow'}
                    </button>
                  </>
                )
              )}
              {!network.following?.length ? <div style={{ color: '#94a3b8' }}>No following yet.</div> : null}
            </div>
          </div>

          <div style={panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900 }}>Followers</h2>
              <div style={{ color: '#94a3b8', fontSize: '13px' }}>{network.followers?.length || 0} people</div>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {(network.followers || []).slice(0, 5).map((person) =>
                personCard(
                  person,
                  <>
                    <Link to={`/users/${person.id}`} style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(59,130,246,0.14)', color: '#bfdbfe', fontWeight: 800, textDecoration: 'none' }}>
                      View Profile
                    </Link>
                    {renderMessageLink(person)}
                  </>
                )
              )}
              {!network.followers?.length ? <div style={{ color: '#94a3b8' }}>No followers yet.</div> : null}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
          <div style={panel}>
            <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 900 }}>Groups</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {(summary.groups || []).slice(0, 4).map((group) => (
                <div key={group.id} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ fontWeight: 800 }}>{group.name}</div>
                    {group.isMember ? <span style={{ color: '#86efac', fontSize: '12px', fontWeight: 700 }}>Joined</span> : null}
                  </div>
                  <div style={{ marginTop: '6px', color: '#94a3b8' }}>{group.memberCount || group.members?.length || 0} members</div>
                  <Link to={`/groups?group=${group.id}`} style={{ display: 'inline-block', marginTop: '10px', color: '#93c5fd', fontSize: '13px', textDecoration: 'none' }}>
                    Open group space
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <div style={panel}>
            <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 900 }}>Forums</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {(summary.threads || []).slice(0, 4).map((thread) => (
                <div key={thread.id} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                  <div style={{ fontWeight: 800 }}>{thread.title}</div>
                  <div style={{ marginTop: '6px', color: '#94a3b8' }}>{thread.upvoteCount} upvotes | {thread.replyCount || thread.replies?.length || 0} replies</div>
                  <Link to={`/forums?thread=${thread.id}`} style={{ display: 'inline-block', marginTop: '10px', color: '#93c5fd', fontSize: '13px', textDecoration: 'none' }}>
                    Join the discussion
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <div style={panel}>
            <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 900 }}>Mentoring</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {(summary.mentorship || []).slice(0, 4).map((item) => (
                <div key={item.id} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                  <div style={{ fontWeight: 800 }}>{item.title}</div>
                  <div style={{ marginTop: '6px', color: '#94a3b8', textTransform: 'capitalize' }}>{item.status}</div>
                  {item.requester?.id ? (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                      <Link to={`/users/${item.requester.id}`} style={{ color: '#93c5fd', fontSize: '13px', textDecoration: 'none' }}>
                        View requester profile
                      </Link>
                      <Link to={`/forums?mentorship=${item.id}`} style={{ color: '#c4b5fd', fontSize: '13px', textDecoration: 'none' }}>
                        Open mentorship thread
                      </Link>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialHub;
