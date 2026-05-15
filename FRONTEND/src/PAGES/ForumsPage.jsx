import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';
import SocialModuleNav from '../components/social/SocialModuleNav';
import {
  acceptMentorship,
  closeMentorship,
  createMentorship,
  createThread,
  fetchMentorship,
  fetchThreads,
  replyThread,
  upvoteThread,
} from '../components/context/Social.service';

const panel = {
  borderRadius: '24px',
  background: 'rgba(15,23,42,0.48)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '24px',
};

const fieldStyle = {
  padding: '12px 14px',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
};

const ForumsPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [threads, setThreads] = useState([]);
  const [requests, setRequests] = useState([]);
  const [threadForm, setThreadForm] = useState({ title: '', body: '', category: 'General', tags: '' });
  const [replyDrafts, setReplyDrafts] = useState({});
  const [mentorshipForm, setMentorshipForm] = useState({ title: '', goals: '', topics: '' });
  const [workingMentorshipId, setWorkingMentorshipId] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestedThreadId = searchParams.get('thread');
  const requestedMentorshipId = searchParams.get('mentorship');

  const load = async () => {
    try {
      setLoading(true);
      const [threadsData, mentorshipData] = await Promise.all([fetchThreads(), fetchMentorship()]);
      setThreads(threadsData.threads || []);
      setRequests(mentorshipData.requests || []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load forums right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const intervalId = window.setInterval(load, 12000);
    return () => window.clearInterval(intervalId);
  }, []);

  const openRequests = useMemo(
    () => requests.filter((request) => request.status === 'open'),
    [requests]
  );

  const acceptedRequests = useMemo(
    () => requests.filter((request) => request.status === 'accepted'),
    [requests]
  );

  const filteredThreads = useMemo(() => {
    return threads.filter((thread) => {
      if (categoryFilter !== 'all' && thread.category !== categoryFilter) return false;
      if (!search.trim()) return true;
      const haystack = [thread.title, thread.body, ...(thread.tags || [])].join(' ').toLowerCase();
      return haystack.includes(search.trim().toLowerCase());
    });
  }, [categoryFilter, search, threads]);

  const selectedThread =
    filteredThreads.find((thread) => thread.id === requestedThreadId) ||
    threads.find((thread) => thread.id === requestedThreadId) ||
    filteredThreads[0] ||
    null;

  const selectedMentorship =
    requests.find((request) => request.id === requestedMentorshipId) ||
    openRequests[0] ||
    acceptedRequests[0] ||
    null;

  const threadCategories = [...new Set(threads.map((thread) => thread.category).filter(Boolean))];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', paddingTop: '96px', paddingBottom: '48px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 16px', display: 'grid', gap: '24px' }}>
        <SocialModuleNav />
        <div style={{ ...panel, background: 'linear-gradient(135deg, rgba(59,130,246,0.16), rgba(139,92,246,0.18))' }}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }}>Forums and Mentorship</h1>
          <p style={{ marginTop: '10px', color: '#dbeafe' }}>Start topic-based discussions, get answers from the community, and turn mentorship requests into real collaboration.</p>
          <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginTop: '20px' }}>
            {[
              ['Threads', threads.length, '#bfdbfe'],
              ['Open Requests', openRequests.length, '#86efac'],
              ['Accepted Matches', acceptedRequests.length, '#c4b5fd'],
            ].map(([label, value, color]) => (
              <div key={label} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.08)', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#dbeafe' }}>{label}</div>
                <div style={{ marginTop: '8px', fontSize: '28px', fontWeight: 900, color }}>{value}</div>
              </div>
            ))}
          </div>
          {error ? <div style={{ marginTop: '14px', color: '#fecaca' }}>{error}</div> : null}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '24px' }}>
          <div style={panel}>
            <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 900 }}>Start a Forum Thread</h2>
            <div style={{ display: 'grid', gap: '12px', marginTop: '18px' }}>
              <input value={threadForm.title} onChange={(event) => setThreadForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Thread title" style={fieldStyle} />
              <textarea value={threadForm.body} onChange={(event) => setThreadForm((prev) => ({ ...prev, body: event.target.value }))} rows={4} placeholder="Start a discussion..." style={{ ...fieldStyle, resize: 'vertical' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px' }}>
                <input value={threadForm.category} onChange={(event) => setThreadForm((prev) => ({ ...prev, category: event.target.value }))} placeholder="Category" style={fieldStyle} />
                <input value={threadForm.tags} onChange={(event) => setThreadForm((prev) => ({ ...prev, tags: event.target.value }))} placeholder="Tags" style={fieldStyle} />
                <button onClick={async () => { try { const response = await createThread({ ...threadForm, tags: threadForm.tags.split(',').map((item) => item.trim()).filter(Boolean) }); setThreadForm({ title: '', body: '', category: 'General', tags: '' }); if (response?.thread?.id) { setSearchParams({ thread: response.thread.id }); } await load(); setError(''); } catch (err) { setError(err?.response?.data?.message || 'Unable to create a thread right now.'); } }} style={{ padding: '12px 18px', border: 'none', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                  Post
                </button>
              </div>
            </div>
          </div>

          <div style={panel}>
            <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 900 }}>Request Mentorship</h2>
            <div style={{ display: 'grid', gap: '12px', marginTop: '18px' }}>
              <input value={mentorshipForm.title} onChange={(event) => setMentorshipForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Mentorship request title" style={fieldStyle} />
              <textarea value={mentorshipForm.goals} onChange={(event) => setMentorshipForm((prev) => ({ ...prev, goals: event.target.value }))} rows={3} placeholder="What help do you need?" style={{ ...fieldStyle, resize: 'vertical' }} />
              <input value={mentorshipForm.topics} onChange={(event) => setMentorshipForm((prev) => ({ ...prev, topics: event.target.value }))} placeholder="Topics" style={fieldStyle} />
              <button onClick={async () => { try { const response = await createMentorship({ ...mentorshipForm, topics: mentorshipForm.topics.split(',').map((item) => item.trim()).filter(Boolean) }); setMentorshipForm({ title: '', goals: '', topics: '' }); if (response?.request?.id) { setSearchParams({ mentorship: response.request.id }); } await load(); setError(''); } catch (err) { setError(err?.response?.data?.message || 'Unable to create a mentorship request right now.'); } }} style={{ padding: '12px 18px', border: 'none', borderRadius: '14px', background: 'rgba(16,185,129,0.9)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                Request Mentorship
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px' }}>
          <div style={{ display: 'grid', gap: '18px' }}>
            <div style={panel}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900 }}>Filter Discussions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '12px', marginTop: '16px' }}>
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search thread title, body, or tags" style={fieldStyle} />
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} style={fieldStyle}>
                  <option value="all">All categories</option>
                  {threadCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            {filteredThreads.map((thread) => (
              <div key={thread.id} style={panel}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <div style={{ fontSize: '22px', fontWeight: 900 }}>{thread.title}</div>
                      <span style={{ padding: '6px 10px', borderRadius: '999px', background: 'rgba(59,130,246,0.14)', color: '#bfdbfe', fontSize: '12px', fontWeight: 700 }}>{thread.category}</span>
                    </div>
                    <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '13px' }}>
                      By {thread.author?.fullName || thread.author?.username || 'StudySphere'} | {thread.replyCount || thread.replies?.length || 0} replies
                    </div>
                    <div style={{ marginTop: '8px', color: '#cbd5e1', lineHeight: 1.7 }}>{thread.body}</div>
                      {!!thread.tags?.length && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                        {thread.tags.map((tag) => (
                          <span key={tag} style={{ padding: '6px 10px', borderRadius: '999px', background: 'rgba(139,92,246,0.16)', color: '#ddd6fe', fontSize: '12px' }}>
                            {tag}
                          </span>
                        ))}
                        </div>
                      )}
                      <button
                        onClick={() => setSearchParams({ thread: thread.id })}
                        style={{ marginTop: '14px', border: 'none', background: 'none', color: '#93c5fd', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                      >
                        Focus this thread
                      </button>
                    </div>
                  <button onClick={async () => { try { await upvoteThread(thread.id); await load(); setError(''); } catch (err) { setError(err?.response?.data?.message || 'Unable to update the vote right now.'); } }} style={{ padding: '10px 14px', height: 'fit-content', border: 'none', borderRadius: '12px', background: thread.hasUpvoted ? 'rgba(250,204,21,0.28)' : 'rgba(250,204,21,0.16)', color: '#fde68a', fontWeight: 800, cursor: 'pointer' }}>
                    {thread.upvoteCount} {thread.hasUpvoted ? 'Upvoted' : 'Upvote'}
                  </button>
                </div>
                <div style={{ display: 'grid', gap: '10px', marginTop: '16px' }}>
                  {(thread.replies || []).map((reply) => (
                    <div key={reply.id} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                      <div style={{ fontWeight: 700 }}>{reply.author?.fullName || reply.author?.username || 'Member'}</div>
                      <div style={{ marginTop: '6px', color: '#cbd5e1' }}>{reply.message}</div>
                    </div>
                  ))}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px' }}>
                    <input value={replyDrafts[thread.id] || ''} onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [thread.id]: event.target.value }))} placeholder="Reply to this thread..." style={fieldStyle} />
                    <button onClick={async () => { const message = replyDrafts[thread.id]; if (!message?.trim()) return; try { await replyThread(thread.id, { message }); setReplyDrafts((prev) => ({ ...prev, [thread.id]: '' })); await load(); setError(''); } catch (err) { setError(err?.response?.data?.message || 'Unable to reply to this thread right now.'); } }} style={{ padding: '12px 18px', border: 'none', borderRadius: '14px', background: 'rgba(59,130,246,0.18)', color: '#dbeafe', fontWeight: 800, cursor: 'pointer' }}>
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!loading && !filteredThreads.length ? <div style={{ color: '#94a3b8' }}>No threads match the current filters.</div> : null}
            {loading ? <div style={{ color: '#94a3b8' }}>Loading discussions...</div> : null}
          </div>

          <div style={{ display: 'grid', gap: '24px', alignSelf: 'start' }}>
            <div style={panel}>
              <h2 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: 900 }}>Focused Thread</h2>
              {selectedThread ? (
                <div style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                  <div style={{ fontWeight: 900, fontSize: '20px' }}>{selectedThread.title}</div>
                  <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '13px' }}>
                    {selectedThread.category} | {selectedThread.upvoteCount} upvotes | {selectedThread.replyCount || selectedThread.replies?.length || 0} replies
                  </div>
                  <div style={{ marginTop: '10px', color: '#cbd5e1', lineHeight: 1.7 }}>{selectedThread.body}</div>
                  {selectedThread.author?.id ? (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
                      <Link to={`/users/${selectedThread.author.id}`} style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 700 }}>
                        View author
                      </Link>
                      {selectedThread.author.id !== user?.id ? (
                        <Link to={`/social/direct/${selectedThread.author.id}`} style={{ color: '#86efac', textDecoration: 'none', fontWeight: 700 }}>
                          Message author
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div style={{ color: '#94a3b8' }}>Choose a thread to keep it in focus here.</div>
              )}
            </div>

            <div style={panel}>
              <h2 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: 900 }}>Mentorship Requests</h2>
              <div style={{ display: 'grid', gap: '14px' }}>
                {requests.map((request) => {
                  const canAccept = request.status === 'open' && !request.isRequester && !request.isMentor;
                  const canClose = request.status !== 'closed' && (request.isRequester || request.isMentor);
                  return (
                    <div key={request.id} style={{ borderRadius: '18px', background: requestedMentorshipId === request.id ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.04)', padding: '16px', border: requestedMentorshipId === request.id ? '1px solid rgba(96,165,250,0.2)' : '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ fontWeight: 800 }}>{request.title}</div>
                      <div style={{ marginTop: '6px', color: '#cbd5e1' }}>{request.goals}</div>
                      <div style={{ marginTop: '8px', color: '#94a3b8', textTransform: 'capitalize' }}>{request.status}</div>
                      {!!request.topics?.length && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                          {request.topics.map((topic) => (
                            <span key={topic} style={{ padding: '6px 10px', borderRadius: '999px', background: 'rgba(59,130,246,0.14)', color: '#bfdbfe', fontSize: '12px' }}>
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                        <button
                          onClick={() => setSearchParams({ mentorship: request.id })}
                          style={{ border: 'none', background: 'none', color: '#93c5fd', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                        >
                          Focus request
                        </button>
                        {request.requester?.id ? (
                          <Link to={`/users/${request.requester.id}`} style={{ color: '#93c5fd', fontSize: '13px', textDecoration: 'none' }}>
                            View requester profile
                          </Link>
                        ) : null}
                        {request.requester?.id && request.requester.id !== user?.id ? (
                          <Link to={`/social/direct/${request.requester.id}`} style={{ color: '#86efac', fontSize: '13px', textDecoration: 'none' }}>
                            Message requester
                          </Link>
                        ) : null}
                      </div>
                      {request.isRequester ? <div style={{ marginTop: '10px', color: '#c4b5fd', fontSize: '12px' }}>Requested by you</div> : null}
                      {request.mentor?.id ? <div style={{ marginTop: '10px', color: '#86efac', fontSize: '12px' }}>Mentor: {request.mentor.fullName || request.mentor.username}</div> : null}
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                        {canAccept ? (
                          <button
                            onClick={async () => {
                              setWorkingMentorshipId(request.id);
                              try {
                                await acceptMentorship(request.id);
                                setSearchParams({ mentorship: request.id });
                                await load();
                                setError('');
                              } catch (err) {
                                setError(err?.response?.data?.message || 'Unable to accept this mentorship request right now.');
                              } finally {
                                setWorkingMentorshipId('');
                              }
                            }}
                            disabled={workingMentorshipId === request.id}
                            style={{ padding: '10px 14px', border: 'none', borderRadius: '12px', background: 'rgba(16,185,129,0.18)', color: '#d1fae5', fontWeight: 800, cursor: 'pointer', opacity: workingMentorshipId === request.id ? 0.7 : 1 }}
                          >
                            {workingMentorshipId === request.id ? 'Accepting...' : 'Accept'}
                          </button>
                        ) : null}
                        {canClose ? (
                          <button
                            onClick={async () => {
                              setWorkingMentorshipId(request.id);
                              try {
                                await closeMentorship(request.id);
                                await load();
                                setError('');
                              } catch (err) {
                                setError(err?.response?.data?.message || 'Unable to close this mentorship request right now.');
                              } finally {
                                setWorkingMentorshipId('');
                              }
                            }}
                            disabled={workingMentorshipId === request.id}
                            style={{ padding: '10px 14px', border: '1px solid rgba(248,113,113,0.24)', borderRadius: '12px', background: 'rgba(127,29,29,0.22)', color: '#fecaca', fontWeight: 800, cursor: 'pointer', opacity: workingMentorshipId === request.id ? 0.7 : 1 }}
                          >
                            {workingMentorshipId === request.id ? 'Closing...' : 'Close'}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
                {!requests.length ? <div style={{ color: '#94a3b8' }}>No mentorship requests yet.</div> : null}
              </div>
            </div>

            <div style={panel}>
              <h2 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: 900 }}>Focused Mentorship</h2>
              {selectedMentorship ? (
                <div style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                  <div style={{ fontWeight: 900, fontSize: '20px' }}>{selectedMentorship.title}</div>
                  <div style={{ marginTop: '8px', color: '#94a3b8', textTransform: 'capitalize' }}>{selectedMentorship.status}</div>
                  <div style={{ marginTop: '10px', color: '#cbd5e1', lineHeight: 1.7 }}>{selectedMentorship.goals}</div>
                  {selectedMentorship.topics?.length ? (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                      {selectedMentorship.topics.map((topic) => (
                        <span key={topic} style={{ padding: '6px 10px', borderRadius: '999px', background: 'rgba(59,130,246,0.14)', color: '#bfdbfe', fontSize: '12px' }}>
                          {topic}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                    {selectedMentorship.requester?.id ? (
                      <Link to={`/users/${selectedMentorship.requester.id}`} style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 700 }}>
                        View requester
                      </Link>
                    ) : null}
                    {selectedMentorship.requester?.id && selectedMentorship.requester.id !== user?.id ? (
                      <Link to={`/social/direct/${selectedMentorship.requester.id}`} style={{ color: '#86efac', textDecoration: 'none', fontWeight: 700 }}>
                        Message requester
                      </Link>
                    ) : null}
                    {selectedMentorship.mentor?.id && selectedMentorship.mentor.id !== user?.id ? (
                      <Link to={`/social/direct/${selectedMentorship.mentor.id}`} style={{ color: '#c4b5fd', textDecoration: 'none', fontWeight: 700 }}>
                        Message mentor
                      </Link>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div style={{ color: '#94a3b8' }}>Choose a mentorship request to keep it visible here.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumsPage;
