import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SocialModuleNav from '../components/social/SocialModuleNav';
import {
  addGroupPost,
  fetchDirectInbox,
  fetchDirectMessages,
  fetchGroupMessages,
  fetchGroups,
  joinGroup,
  leaveGroup,
  sendDirectMessage,
} from '../components/context/Social.service';
import { useAuth } from '../components/context/AuthContext';

const shellPanel = {
  borderRadius: '24px',
  background: 'rgba(15,23,42,0.48)',
  border: '1px solid rgba(255,255,255,0.08)',
};

const inputStyle = {
  padding: '14px 16px',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
};

const SocialChatPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState('groups');
  const [groups, setGroups] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState('');
  const [groupDraft, setGroupDraft] = useState('');
  const [groupLastSync, setGroupLastSync] = useState('');
  const [groupSending, setGroupSending] = useState(false);
  const [groupSyncing, setGroupSyncing] = useState(false);
  const [groupLoading, setGroupLoading] = useState(true);
  const [groupWorkingId, setGroupWorkingId] = useState('');

  const [inbox, setInbox] = useState({ conversations: [], contacts: [] });
  const [activeDirectUserId, setActiveDirectUserId] = useState('');
  const [directConversation, setDirectConversation] = useState(null);
  const [directDraft, setDirectDraft] = useState('');
  const [directSending, setDirectSending] = useState(false);
  const [directSyncing, setDirectSyncing] = useState(false);
  const [directLoading, setDirectLoading] = useState(true);

  const [error, setError] = useState('');
  const messageRef = useRef(null);
  const groupLastSyncRef = useRef('');
  const requestedMode = searchParams.get('mode');
  const requestedUserId = searchParams.get('user');
  const requestedGroupId = searchParams.get('group');

  const loadGroups = useCallback(async () => {
    try {
      setGroupLoading(true);
      const data = await fetchGroups();
      const nextGroups = data.groups || [];
      setGroups(nextGroups);
      setActiveGroupId((current) => current || requestedGroupId || nextGroups.find((group) => group.isMember)?.id || nextGroups[0]?.id || '');
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load group spaces right now.');
    } finally {
      setGroupLoading(false);
    }
  }, [requestedGroupId]);

  const loadInbox = useCallback(async () => {
    try {
      setDirectLoading(true);
      const data = await fetchDirectInbox();
      const nextConversations = data.conversations || [];
      const nextContacts = data.contacts || [];
      setInbox({
        conversations: nextConversations,
        contacts: nextContacts,
      });
      setActiveDirectUserId((current) => {
        if (current) return current;
        return requestedUserId || nextConversations[0]?.participant?.id || nextContacts[0]?.id || '';
      });
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load direct collaboration right now.');
    } finally {
      setDirectLoading(false);
    }
  }, [requestedUserId]);

  useEffect(() => {
    loadGroups();
    loadInbox();
    const intervalId = window.setInterval(() => {
      loadGroups();
      loadInbox();
    }, 20000);
    return () => window.clearInterval(intervalId);
  }, [loadGroups, loadInbox]);

  useEffect(() => {
    if (requestedMode === 'direct') {
      setMode('direct');
    } else if (requestedMode === 'groups') {
      setMode('groups');
    }
  }, [requestedMode]);

  useEffect(() => {
    if (requestedUserId) {
      setActiveDirectUserId(requestedUserId);
    }
  }, [requestedUserId]);

  useEffect(() => {
    if (requestedGroupId) {
      setActiveGroupId(requestedGroupId);
    }
  }, [requestedGroupId]);

  useEffect(() => {
    if (mode === 'groups' && activeGroupId) {
      setSearchParams({ mode: 'groups', group: activeGroupId });
    }
    if (mode === 'direct' && activeDirectUserId) {
      setSearchParams({ mode: 'direct', user: activeDirectUserId });
    }
  }, [activeDirectUserId, activeGroupId, mode, setSearchParams]);

  useEffect(() => {
    if (!activeGroupId || mode !== 'groups') return undefined;

    const currentGroup = groups.find((group) => group.id === activeGroupId);
    if (!currentGroup?.isMember) {
      setGroupMessages([]);
      setGroupLastSync('');
      return undefined;
    }

    let mounted = true;

    const loadMessages = async (sinceValue) => {
      try {
        setGroupSyncing(true);
        const data = await fetchGroupMessages(
          activeGroupId,
          sinceValue ? { since: sinceValue, limit: 80 } : { limit: 80 }
        );
        if (!mounted) return;

        setGroupMessages((prev) => {
          const map = new Map(prev.map((item) => [item.id, item]));
          (data.messages || []).forEach((item) => map.set(item.id, item));
          return [...map.values()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        });
        const nextSyncTime = data.serverTime || new Date().toISOString();
        groupLastSyncRef.current = nextSyncTime;
        setGroupLastSync(nextSyncTime);
        setError('');
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || 'Unable to sync group chat right now.');
        }
      } finally {
        if (mounted) {
          setGroupSyncing(false);
        }
      }
    };

    setGroupMessages([]);
    groupLastSyncRef.current = '';
    setGroupLastSync('');
    loadMessages('');

    const intervalId = window.setInterval(() => {
      loadMessages(groupLastSyncRef.current);
    }, 3000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [activeGroupId, groups, mode]);

  useEffect(() => {
    if (!activeDirectUserId || mode !== 'direct') return undefined;

    let mounted = true;

    const loadConversation = async () => {
      try {
        setDirectSyncing(true);
        const data = await fetchDirectMessages(activeDirectUserId);
        if (!mounted) return;
        setDirectConversation(data.conversation || null);
        setError('');
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || 'Unable to load direct messages right now.');
        }
      } finally {
        if (mounted) {
          setDirectSyncing(false);
        }
      }
    };

    setDirectConversation(null);
    loadConversation();
    const intervalId = window.setInterval(loadConversation, 4000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [activeDirectUserId, mode]);

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollTop = messageRef.current.scrollHeight;
    }
  }, [directConversation, groupMessages]);

  const activeGroup = useMemo(
    () => groups.find((group) => group.id === activeGroupId) || groups[0] || null,
    [activeGroupId, groups]
  );

  const directList = useMemo(() => {
    const seen = new Set();
    const conversations = (inbox.conversations || []).map((conversation) => {
      if (conversation.participant?.id) {
        seen.add(conversation.participant.id);
      }
      return {
        type: 'conversation',
        id: conversation.participant?.id || conversation.id,
        conversation,
      };
    });
    const contacts = (inbox.contacts || [])
      .filter((contact) => !seen.has(contact.id))
      .map((contact) => ({
        type: 'contact',
        id: contact.id,
        conversation: {
          participant: contact,
          unreadCount: 0,
          latestMessage: null,
        },
      }));

    return [...conversations, ...contacts];
  }, [inbox.contacts, inbox.conversations]);

  const activeDirectTarget =
    directConversation?.participant ||
    inbox.contacts?.find((contact) => contact.id === activeDirectUserId) ||
    directList.find((item) => item.id === activeDirectUserId)?.conversation?.participant ||
    null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', paddingTop: '96px', paddingBottom: '48px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 16px' }}>
        <SocialModuleNav />
      </div>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 16px', display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
        <div style={{ ...shellPanel, padding: '20px', display: 'grid', gap: '12px', alignSelf: 'start' }}>
          <div style={{ fontSize: '24px', fontWeight: 900 }}>Collaboration Workspace</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setMode('groups')} style={{ flex: 1, padding: '10px 12px', borderRadius: '12px', border: 'none', background: mode === 'groups' ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'rgba(255,255,255,0.06)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Groups</button>
            <button onClick={() => setMode('direct')} style={{ flex: 1, padding: '10px 12px', borderRadius: '12px', border: 'none', background: mode === 'direct' ? 'linear-gradient(135deg, #10b981, #14b8a6)' : 'rgba(255,255,255,0.06)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Direct</button>
          </div>

          {mode === 'groups' ? (
            <>
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setActiveGroupId(group.id)}
                  style={{
                    textAlign: 'left',
                    border: activeGroupId === group.id ? '1px solid rgba(96,165,250,0.28)' : '1px solid rgba(255,255,255,0.08)',
                    background: activeGroupId === group.id ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)',
                    color: '#f8fafc',
                    borderRadius: '16px',
                    padding: '14px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ fontWeight: 800 }}>{group.name}</div>
                    {group.isMember ? <span style={{ color: '#86efac', fontSize: '12px', fontWeight: 700 }}>Joined</span> : null}
                  </div>
                  <div style={{ marginTop: '4px', color: '#94a3b8', fontSize: '13px' }}>{group.memberCount || group.members?.length || 0} members</div>
                </button>
              ))}
              {groupLoading ? <div style={{ color: '#94a3b8' }}>Loading groups...</div> : null}
              {!groups.length ? <div style={{ color: '#94a3b8' }}>No groups found yet.</div> : null}
            </>
          ) : (
            <>
              {directList.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveDirectUserId(item.id)}
                  style={{
                    textAlign: 'left',
                    border: activeDirectUserId === item.id ? '1px solid rgba(16,185,129,0.28)' : '1px solid rgba(255,255,255,0.08)',
                    background: activeDirectUserId === item.id ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)',
                    color: '#f8fafc',
                    borderRadius: '16px',
                    padding: '14px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ fontWeight: 800 }}>{item.conversation.participant?.fullName || item.conversation.participant?.username}</div>
                    {item.conversation.unreadCount ? <span style={{ color: '#86efac', fontSize: '12px', fontWeight: 700 }}>{item.conversation.unreadCount} new</span> : null}
                  </div>
                  <div style={{ marginTop: '4px', color: '#94a3b8', fontSize: '13px' }}>
                    @{item.conversation.participant?.username || 'member'}
                  </div>
                  <div style={{ marginTop: '6px', color: '#cbd5e1', fontSize: '13px' }}>
                    {item.conversation.latestMessage?.message || item.conversation.participant?.socialProfile?.headline || 'Start a conversation'}
                  </div>
                </button>
              ))}
              {directLoading ? <div style={{ color: '#94a3b8' }}>Loading direct chat...</div> : null}
              {!directList.length ? <div style={{ color: '#94a3b8' }}>Follow people to start direct conversations.</div> : null}
            </>
          )}
        </div>

        <div style={{ ...shellPanel, padding: '24px', display: 'grid', gap: '18px' }}>
          {mode === 'groups' ? (
            activeGroup ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: 900 }}>{activeGroup.name}</div>
                    <div style={{ marginTop: '6px', color: '#cbd5e1' }}>{activeGroup.description}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {!activeGroup.isMember ? (
                      <button onClick={async () => { setGroupWorkingId(activeGroup.id); try { await joinGroup(activeGroup.id); await loadGroups(); setError(''); } catch (err) { setError(err?.response?.data?.message || 'Unable to join this group right now.'); } finally { setGroupWorkingId(''); } }} disabled={groupWorkingId === activeGroup.id} style={{ padding: '11px 16px', border: 'none', borderRadius: '12px', background: 'rgba(16,185,129,0.18)', color: '#d1fae5', fontWeight: 800, cursor: 'pointer', opacity: groupWorkingId === activeGroup.id ? 0.7 : 1 }}>
                        {groupWorkingId === activeGroup.id ? 'Joining...' : 'Join Group'}
                      </button>
                    ) : null}
                    {activeGroup.isMember && String(activeGroup.owner?.id) !== String(user?.id) ? (
                      <button onClick={async () => { setGroupWorkingId(activeGroup.id); try { await leaveGroup(activeGroup.id); await loadGroups(); setGroupMessages([]); setError(''); } catch (err) { setError(err?.response?.data?.message || 'Unable to leave this group right now.'); } finally { setGroupWorkingId(''); } }} disabled={groupWorkingId === activeGroup.id} style={{ padding: '11px 16px', border: '1px solid rgba(248,113,113,0.24)', borderRadius: '12px', background: 'rgba(127,29,29,0.24)', color: '#fecaca', fontWeight: 800, cursor: 'pointer', opacity: groupWorkingId === activeGroup.id ? 0.7 : 1 }}>
                        {groupWorkingId === activeGroup.id ? 'Leaving...' : 'Leave Group'}
                      </button>
                    ) : null}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#93c5fd', fontSize: '13px' }}>
                    {groupSyncing
                      ? 'Syncing group chat...'
                      : groupLastSync
                        ? `Group rooms stay updated with short-interval polling. Last sync ${new Date(groupLastSync).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}.`
                        : 'Group rooms stay updated with short-interval polling.'}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Link to={`/groups?group=${activeGroup.id}`} style={{ color: '#c4b5fd', fontSize: '13px', textDecoration: 'none', fontWeight: 700 }}>
                      Open group page
                    </Link>
                    {error ? <div style={{ color: '#fca5a5', fontSize: '13px' }}>{error}</div> : null}
                  </div>
                </div>

                {activeGroup.isMember ? (
                  <>
                    <div ref={messageRef} style={{ display: 'grid', gap: '12px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
                      {groupMessages.map((post) => (
                        <div key={post.id} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '14px 16px' }}>
                          <div style={{ fontWeight: 800 }}>{post.author?.fullName || post.author?.username || 'Member'}</div>
                          <div style={{ marginTop: '6px', color: '#cbd5e1', lineHeight: 1.7 }}>{post.message}</div>
                          <div style={{ marginTop: '8px', color: '#64748b', fontSize: '12px' }}>
                            {new Date(post.createdAt).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                      {!groupMessages.length ? <div style={{ color: '#94a3b8' }}>No messages yet. Start the group conversation.</div> : null}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px' }}>
                      <input value={groupDraft} onChange={(event) => setGroupDraft(event.target.value)} placeholder="Send a message to the group..." style={inputStyle} />
                      <button
                        onClick={async () => {
                          if (!groupDraft.trim() || !activeGroup?.id || groupSending) return;
                          setGroupSending(true);
                          try {
                            const data = await addGroupPost(activeGroup.id, { message: groupDraft.trim() });
                            setGroupDraft('');
                            const latestMessages = data.group?.posts || [];
                            setGroupMessages([...latestMessages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
                            const nextSyncTime = new Date().toISOString();
                            groupLastSyncRef.current = nextSyncTime;
                            setGroupLastSync(nextSyncTime);
                            await loadGroups();
                          } catch (err) {
                            setError(err?.response?.data?.message || 'Unable to send your group message right now.');
                          } finally {
                            setGroupSending(false);
                          }
                        }}
                        style={{ padding: '14px 18px', border: 'none', borderRadius: '16px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: groupSending ? 0.7 : 1 }}
                      >
                        {groupSending ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '18px', color: '#cbd5e1', lineHeight: 1.7 }}>
                    Join this group to unlock the live room, message history, and peer collaboration.
                    <div style={{ marginTop: '12px' }}>
                      <Link to={`/groups?group=${activeGroup.id}`} style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 700 }}>
                        Open full group page
                      </Link>
                      {activeGroup.owner?.id ? (
                        <span style={{ marginLeft: '12px' }}>
                          <Link to={`/users/${activeGroup.owner.id}`} style={{ color: '#c4b5fd', textDecoration: 'none', fontWeight: 700 }}>
                            View owner profile
                          </Link>
                        </span>
                      ) : null}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: '#94a3b8' }}>Create or join a group to start chatting.</div>
            )
          ) : activeDirectTarget ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: 900 }}>{activeDirectTarget.fullName || activeDirectTarget.username}</div>
                  <div style={{ marginTop: '6px', color: '#93c5fd' }}>@{activeDirectTarget.username}</div>
                  <div style={{ marginTop: '6px', color: '#cbd5e1' }}>
                    {activeDirectTarget.socialProfile?.headline || activeDirectTarget.targetRole || 'StudySphere collaborator'}
                  </div>
                  {activeDirectTarget.id ? (
                    <div style={{ marginTop: '10px' }}>
                      <Link to={`/users/${activeDirectTarget.id}`} style={{ color: '#86efac', textDecoration: 'none', fontWeight: 700 }}>
                        View profile
                      </Link>
                    </div>
                  ) : null}
                </div>
                <div style={{ display: 'grid', gap: '8px', justifyItems: 'end' }}>
                  <div style={{ color: '#86efac', fontSize: '13px' }}>
                    {directSyncing ? 'Syncing direct chat...' : 'Direct collaboration is ready'}
                  </div>
                  {activeDirectTarget.id ? (
                    <Link to={`/users/${activeDirectTarget.id}`} style={{ color: '#c4b5fd', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>
                      Open public profile
                    </Link>
                  ) : null}
                </div>
              </div>

              <div ref={messageRef} style={{ display: 'grid', gap: '12px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
                {(directConversation?.messages || []).map((message) => (
                  <div
                    key={message.id}
                    style={{
                      borderRadius: '18px',
                      background: message.isMine ? 'rgba(59,130,246,0.16)' : 'rgba(255,255,255,0.04)',
                      padding: '14px 16px',
                      marginLeft: message.isMine ? '80px' : '0',
                      marginRight: message.isMine ? '0' : '80px',
                    }}
                  >
                    <div style={{ fontWeight: 800 }}>{message.author?.fullName || message.author?.username || 'Member'}</div>
                    <div style={{ marginTop: '6px', color: '#cbd5e1', lineHeight: 1.7 }}>{message.message}</div>
                    <div style={{ marginTop: '8px', color: '#64748b', fontSize: '12px' }}>
                      {new Date(message.createdAt).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
                {!(directConversation?.messages || []).length ? <div style={{ color: '#94a3b8' }}>No messages yet. Start the conversation.</div> : null}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px' }}>
                <input value={directDraft} onChange={(event) => setDirectDraft(event.target.value)} placeholder="Send a direct message..." style={inputStyle} />
                <button
                  onClick={async () => {
                    if (!directDraft.trim() || !activeDirectUserId || directSending) return;
                    setDirectSending(true);
                    try {
                      const data = await sendDirectMessage(activeDirectUserId, { message: directDraft.trim() });
                      setDirectDraft('');
                      setDirectConversation(data.conversation || null);
                      await loadInbox();
                      setError('');
                    } catch (err) {
                      setError(err?.response?.data?.message || 'Unable to send your direct message right now.');
                    } finally {
                      setDirectSending(false);
                    }
                  }}
                  style={{ padding: '14px 18px', border: 'none', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981, #14b8a6)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: directSending ? 0.7 : 1 }}
                >
                  {directSending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </>
          ) : (
            <div style={{ color: '#94a3b8' }}>Choose a person from your network to start a direct conversation.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialChatPage;
