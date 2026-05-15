import React, { useEffect, useMemo, useState } from 'react';
import {
  fetchAiPersonalization,
  fetchAiSession,
  fetchAiSummary,
  respondInterviewSession,
  startInterviewSession,
} from '../components/context/AI.service';
import { useAuth } from '../components/context/AuthContext';

const cardStyle = {
  borderRadius: '24px',
  background: 'rgba(15,23,42,0.48)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '24px',
};

const AiInterviewPage = () => {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [role, setRole] = useState('Software Engineer');
  const [focusAreas, setFocusAreas] = useState('DSA, System Design');
  const [session, setSession] = useState(null);
  const [summary, setSummary] = useState({ sessions: [] });
  const [personalization, setPersonalization] = useState({
    suggestedInterviewRole: 'Software Engineer',
    suggestedFocusAreas: [],
    nextActions: [],
    weeklyPlan: [],
  });
  const [answer, setAnswer] = useState('');
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
          if (personalizationData?.suggestedInterviewRole) {
            setRole(personalizationData.suggestedInterviewRole);
          }
          if (personalizationData?.suggestedFocusAreas?.length) {
            setFocusAreas(personalizationData.suggestedFocusAreas.join(', '));
          }
        }
      } catch (err) {
        if (isMounted) {
          setPageError(err?.response?.data?.message || err.message || 'Unable to load your AI interview workspace right now.');
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

  const interviewHistory = useMemo(
    () => (summary.sessions || []).filter((item) => item.type === 'interview').slice(0, 6),
    [summary.sessions]
  );

  const roundProgress = useMemo(() => {
    const currentRound = Number(session?.context?.currentRound || 1);
    const targetRounds = Number(session?.context?.targetRounds || 3);
    return {
      currentRound,
      targetRounds,
      progress: Math.min(100, Math.round((currentRound / targetRounds) * 100)),
    };
  }, [session]);

  const handleLoadSession = async (sessionId) => {
    if (!sessionId || loading) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await fetchAiSession(sessionId);
      setSession(data.session);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load this interview session right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (authLoading || !isAuthenticated || loading) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await startInterviewSession({
        role,
        focusAreas: focusAreas.split(',').map((item) => item.trim()).filter(Boolean),
      });
      setSession(data.session);
      if (data.personalization) {
        setPersonalization(data.personalization);
      }
      setAnswer('');
      const nextSummary = await fetchAiSummary();
      setSummary(nextSummary);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to start the AI interview right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!session?.id || !answer.trim()) return;
    if (authLoading || !isAuthenticated || loading) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await respondInterviewSession(session.id, { answer: answer.trim() });
      setSession(data.session);
      setAnswer('');
      const nextSummary = await fetchAiSummary();
      setSummary(nextSummary);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to send your interview answer right now.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '96px' }}>
        Restoring your AI interview workspace...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', paddingTop: '96px', paddingBottom: '48px' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 16px', display: 'grid', gap: '24px' }}>
        <div style={cardStyle}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }}>AI Interview Simulator</h1>
          <p style={{ marginTop: '10px', color: '#cbd5e1' }}>Your interview coach now preloads role and focus areas from your profile and current learning signals.</p>
          <div style={{ marginTop: '8px', color: '#93c5fd', fontSize: '13px' }}>
            Suggested role: <strong>{personalization.suggestedInterviewRole}</strong>
          </div>
          <div style={{ marginTop: '8px', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>
            {(personalization.nextActions || []).find((item) => item.id === 'interview-round')?.reason || 'Your interview role suggestion improves as your profile and DSA practice become more complete.'}
          </div>
          {pageError ? <div style={{ marginTop: '12px', color: '#fca5a5' }}>{pageError}</div> : null}
          {error ? <div style={{ marginTop: '12px', color: '#fecaca' }}>{error}</div> : null}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '18px' }}>
            <input value={role} onChange={(event) => setRole(event.target.value)} disabled={pageLoading || loading} placeholder="Interview role" style={{ padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff' }} />
            <input value={focusAreas} onChange={(event) => setFocusAreas(event.target.value)} disabled={pageLoading || loading} placeholder="Focus areas" style={{ padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff' }} />
            <button onClick={handleStart} disabled={loading || pageLoading} style={{ padding: '12px 18px', border: 'none', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
              {loading ? 'Starting...' : 'Start'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div style={{ display: 'grid', gap: '24px' }}>
            {session ? (
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: 900 }}>{session.title}</div>
                    <div style={{ color: '#94a3b8', marginTop: '6px' }}>Status: {session.status} | Score: {session.score || 0}</div>
                  </div>
                  <div style={{ padding: '10px 14px', borderRadius: '14px', background: 'rgba(59,130,246,0.14)', color: '#bfdbfe', fontWeight: 700 }}>
                    Focus: {(session.context?.focusAreas || []).join(', ') || 'General'}
                  </div>
                </div>

                <div style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 800 }}>Interview progress</div>
                    <div style={{ color: '#93c5fd', fontSize: '13px' }}>
                      Round {Math.min(roundProgress.currentRound, roundProgress.targetRounds)} / {roundProgress.targetRounds}
                    </div>
                  </div>
                  <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                    <div style={{ width: `${roundProgress.progress}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '14px' }}>
                  {(session.messages || []).map((messageItem, index) => (
                    <div key={`${messageItem.role}-${index}`} style={{ borderRadius: '18px', background: messageItem.role === 'assistant' ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.04)', padding: '16px' }}>
                      <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', color: messageItem.role === 'assistant' ? '#93c5fd' : '#cbd5e1', marginBottom: '8px' }}>{messageItem.role}</div>
                      <div style={{ lineHeight: 1.7 }}>{messageItem.content}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '18px' }}>
                  <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} disabled={loading || session.status === 'completed'} rows={4} placeholder="Write your answer..." style={{ padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', resize: 'vertical' }} />
                  <button onClick={handleRespond} disabled={loading || session.status === 'completed'} style={{ padding: '12px 18px', border: 'none', borderRadius: '14px', background: 'rgba(16,185,129,0.9)', color: '#fff', fontWeight: 800, cursor: 'pointer', alignSelf: 'start' }}>
                    {loading ? 'Sending...' : session.status === 'completed' ? 'Completed' : 'Respond'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={cardStyle}>
                <div style={{ color: '#94a3b8' }}>No interview session running yet. Start one with the suggested role and focus areas.</div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 14px', fontSize: '22px', fontWeight: 900 }}>Suggested focus areas</h3>
              {pageLoading ? <div style={{ color: '#94a3b8' }}>Loading...</div> : (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {(personalization.suggestedFocusAreas || []).map((item) => (
                    <span key={item} style={{ padding: '8px 12px', borderRadius: '999px', background: 'rgba(59,130,246,0.14)', border: '1px solid rgba(96,165,250,0.24)', color: '#bfdbfe', fontSize: '13px' }}>
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 14px', fontSize: '22px', fontWeight: 900 }}>Interview history</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {interviewHistory.map((historyItem) => (
                  <button
                    key={historyItem.id}
                    type="button"
                    onClick={() => handleLoadSession(historyItem.id)}
                    style={{ textAlign: 'left', borderRadius: '16px', background: session?.id === historyItem.id ? 'rgba(59,130,246,0.14)' : 'rgba(255,255,255,0.04)', border: `1px solid ${session?.id === historyItem.id ? 'rgba(96,165,250,0.22)' : 'rgba(255,255,255,0.06)'}`, padding: '12px 14px', color: '#f8fafc', cursor: 'pointer' }}
                  >
                    <div style={{ fontWeight: 800 }}>{historyItem.title}</div>
                    <div style={{ marginTop: '4px', color: '#94a3b8', fontSize: '13px' }}>Score {historyItem.score || 0} | {historyItem.status}</div>
                  </button>
                ))}
                {!interviewHistory.length ? <div style={{ color: '#94a3b8' }}>No interview history yet.</div> : null}
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 14px', fontSize: '22px', fontWeight: 900 }}>Where this fits in your AI plan</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {(personalization.weeklyPlan || []).filter((item) => item.route === '/ai/interview').map((step) => (
                  <div key={step.id} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '12px 14px' }}>
                    <div style={{ color: '#93c5fd', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{step.label}</div>
                    <div style={{ marginTop: '6px', fontWeight: 800 }}>{step.title}</div>
                    <div style={{ marginTop: '6px', color: '#cbd5e1', lineHeight: 1.6 }}>{step.reason}</div>
                  </div>
                ))}
                {!personalization.weeklyPlan?.some((item) => item.route === '/ai/interview') ? <div style={{ color: '#94a3b8' }}>Your interview plan step will appear here once the AI roadmap loads.</div> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiInterviewPage;
