import React, { useEffect, useMemo, useState } from 'react';
import {
  fetchAiPersonalization,
  fetchAiSession,
  fetchAiSummary,
  sendAssistantMessage,
} from '../components/context/AI.service';
import { useAuth } from '../components/context/AuthContext';

const cardStyle = {
  borderRadius: '24px',
  background: 'rgba(15,23,42,0.48)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '24px',
};

const AiAssistantPage = () => {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [message, setMessage] = useState('');
  const [context, setContext] = useState('general');
  const [messages, setMessages] = useState([]);
  const [summary, setSummary] = useState({ sessions: [] });
  const [activeSessionId, setActiveSessionId] = useState('');
  const [personalization, setPersonalization] = useState({
    assistantPrompts: [],
    roadmap: [],
    weakTopics: [],
    recommendedResources: [],
    nextActions: [],
  });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    let isMounted = true;

    const load = async () => {
      try {
        const [summaryData, personalizationData] = await Promise.all([
          fetchAiSummary(),
          fetchAiPersonalization(),
        ]);
        if (isMounted) {
          setSummary(summaryData);
          setPersonalization(personalizationData);
          setPageError('');
        }
      } catch (err) {
        if (isMounted) {
          setPageError(err?.response?.data?.message || err.message || 'Unable to load your AI assistant workspace right now.');
          setSummary({ sessions: [] });
        }
      } finally {
        if (isMounted) {
          setPageLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [authLoading, isAuthenticated]);

  const assistantHistory = useMemo(
    () => (summary.sessions || []).filter((item) => item.type === 'assistant').slice(0, 6),
    [summary.sessions]
  );

  const handleLoadSession = async (sessionId) => {
    if (!sessionId || loading) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await fetchAiSession(sessionId);
      setMessages(data.session?.messages || []);
      setActiveSessionId(data.session?.id || '');
      setContext(data.session?.context?.context || 'general');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to load this assistant thread right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (nextMessage = message.trim()) => {
    if (!nextMessage || loading || pageLoading || authLoading || !isAuthenticated) return;
    setError('');
    setLoading(true);
    try {
      const data = await sendAssistantMessage({ message: nextMessage, context, sessionId: activeSessionId || undefined });
      setMessages(data.session?.messages || []);
      setActiveSessionId(data.session?.id || '');
      if (data.personalization) {
        setPersonalization(data.personalization);
      }
      setMessage('');
      const nextSummary = await fetchAiSummary();
      setSummary(nextSummary);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to reach the AI assistant right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartFresh = () => {
    setActiveSessionId('');
    setMessages([]);
    setMessage('');
    setError('');
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '96px' }}>
        Restoring your AI assistant workspace...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', paddingTop: '96px', paddingBottom: '48px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px', display: 'grid', gap: '24px' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }}>AI Study Assistant</h1>
              <p style={{ marginTop: '10px', color: '#cbd5e1' }}>Ask for a study plan, revision notes, or next-step guidance based on your profile, weak DSA topics, and saved learning direction.</p>
            </div>
            <button
              type="button"
              onClick={handleStartFresh}
              style={{ padding: '11px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontWeight: 700, cursor: 'pointer' }}
            >
              New thread
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '18px' }}>
            <select value={context} disabled={pageLoading || loading} onChange={(event) => setContext(event.target.value)} style={{ padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff' }}>
              <option value="general">General</option>
              <option value="resources">Resources</option>
              <option value="dsa">DSA</option>
              <option value="career">Career</option>
            </select>
            <input value={message} disabled={pageLoading || loading} onChange={(event) => setMessage(event.target.value)} placeholder="Ask the assistant something useful..." style={{ padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff' }} />
            <button onClick={() => handleSend()} disabled={loading || pageLoading} style={{ padding: '12px 18px', border: 'none', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>

          <div style={{ marginTop: '18px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {(personalization.assistantPrompts || []).map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={loading || pageLoading}
                onClick={() => handleSend(prompt)}
                style={{ padding: '10px 14px', borderRadius: '999px', border: '1px solid rgba(96,165,250,0.2)', background: 'rgba(59,130,246,0.12)', color: '#bfdbfe', cursor: 'pointer' }}
              >
                {prompt}
              </button>
            ))}
          </div>
          <div style={{ marginTop: '12px', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>
            {(personalization.nextActions || []).find((item) => item.id === 'assistant-plan')?.reason || 'The assistant works best when it can combine your profile, weak topics, and recent practice into one short plan.'}
          </div>
          {activeSessionId ? (
            <div style={{ marginTop: '12px', color: '#93c5fd', fontSize: '13px' }}>
              Active thread loaded. Continue this conversation or start fresh for a new plan.
            </div>
          ) : null}
          {pageError ? <div style={{ marginTop: '12px', color: '#fca5a5' }}>{pageError}</div> : null}
          {error ? <div style={{ marginTop: '12px', color: '#fecaca' }}>{error}</div> : null}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ ...cardStyle, display: 'grid', gap: '14px' }}>
              {messages.length === 0 ? <div style={{ color: '#94a3b8' }}>Your assistant responses will appear here.</div> : null}
              {messages.map((item, index) => (
                <div key={`${item.role}-${index}`} style={{ borderRadius: '18px', background: item.role === 'assistant' ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${item.role === 'assistant' ? 'rgba(96,165,250,0.18)' : 'rgba(255,255,255,0.06)'}`, padding: '16px' }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', color: item.role === 'assistant' ? '#93c5fd' : '#cbd5e1', marginBottom: '8px' }}>{item.role}</div>
                  <div style={{ color: '#f8fafc', lineHeight: 1.7 }}>{item.content}</div>
                </div>
              ))}
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 14px', fontSize: '22px', fontWeight: 900 }}>Assistant history</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {assistantHistory.map((historyItem) => (
                  <button
                    key={historyItem.id}
                    type="button"
                    onClick={() => handleLoadSession(historyItem.id)}
                    style={{ textAlign: 'left', borderRadius: '16px', background: historyItem.id === activeSessionId ? 'rgba(59,130,246,0.14)' : 'rgba(255,255,255,0.04)', border: `1px solid ${historyItem.id === activeSessionId ? 'rgba(96,165,250,0.22)' : 'rgba(255,255,255,0.06)'}`, padding: '12px 14px', color: '#f8fafc', cursor: 'pointer' }}
                  >
                    <div style={{ fontWeight: 800 }}>{historyItem.title}</div>
                    <div style={{ marginTop: '4px', color: '#94a3b8', fontSize: '13px' }}>{historyItem.context?.context || 'general'} context | Score {historyItem.score || 0}</div>
                  </button>
                ))}
                {!assistantHistory.length ? <div style={{ color: '#94a3b8' }}>No assistant history yet.</div> : null}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 14px', fontSize: '22px', fontWeight: 900 }}>Current roadmap</h3>
              {pageLoading ? <div style={{ color: '#94a3b8' }}>Loading...</div> : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {(personalization.roadmap || []).map((stage, index) => (
                    <div key={`${stage.title}-${index}`} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '12px 14px' }}>
                      <div style={{ fontWeight: 800 }}>{stage.title}</div>
                      <div style={{ marginTop: '4px', color: '#94a3b8', fontSize: '13px' }}>{stage.focus}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 14px', fontSize: '22px', fontWeight: 900 }}>Weak topics</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {(personalization.weakTopics || []).map((topicItem) => (
                  <span key={topicItem.label} style={{ padding: '8px 12px', borderRadius: '999px', background: 'rgba(239,68,68,0.14)', border: '1px solid rgba(248,113,113,0.22)', color: '#fecaca', fontSize: '13px' }}>
                    {topicItem.label}
                  </span>
                ))}
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 14px', fontSize: '22px', fontWeight: 900 }}>Helpful resources</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {(personalization.recommendedResources || []).map((resource) => (
                  <div key={resource.id} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '12px 14px' }}>
                    <div style={{ fontWeight: 800 }}>{resource.title}</div>
                    <div style={{ marginTop: '4px', color: '#94a3b8', fontSize: '13px' }}>{resource.category}</div>
                    <div style={{ marginTop: '8px', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>{resource.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantPage;
