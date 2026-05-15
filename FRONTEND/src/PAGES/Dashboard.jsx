import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { fetchAiPersonalization } from '../components/context/AI.service';
import { fetchMyAnalytics } from '../components/context/Analytics.service';
import { useAuth } from '../components/context/AuthContext';
import { useGamification } from '../components/context/GamificationContext';
import { useResources } from '../components/context/ResourceContext';

const roleThemes = {
  user: {
    hero: 'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(139,92,246,0.22) 50%, rgba(236,72,153,0.18) 100%)',
    card: 'rgba(255,255,255,0.08)',
    border: 'rgba(147,197,253,0.18)',
    accent: '#7c3aed',
    accentSoft: '#60a5fa',
    badge: 'rgba(99,102,241,0.18)',
    badgeText: '#c4b5fd',
    text: '#f8fafc',
    muted: '#cbd5e1',
    panel: 'rgba(15,23,42,0.46)',
    panelAlt: 'rgba(255,255,255,0.06)',
  },
  moderator: {
    hero: 'linear-gradient(135deg, rgba(14,165,233,0.16) 0%, rgba(99,102,241,0.18) 55%, rgba(244,114,182,0.16) 100%)',
    card: 'rgba(255,255,255,0.08)',
    border: 'rgba(125,211,252,0.18)',
    accent: '#0284c7',
    accentSoft: '#38bdf8',
    badge: 'rgba(14,165,233,0.16)',
    badgeText: '#bae6fd',
    text: '#f8fafc',
    muted: '#cbd5e1',
    panel: 'rgba(15,23,42,0.46)',
    panelAlt: 'rgba(255,255,255,0.06)',
  },
};

const emptyAiSnapshot = {
  overview: {},
  nextActions: [],
  roadmap: [],
  weakTopics: [],
  suggestedQuizTopic: 'Algorithms',
};

const emptyAnalyticsSnapshot = {
  overview: {},
  priorityBoard: [],
  goalAlignment: {},
  focusAlerts: [],
  report: {
    headline: '',
    wins: [],
    risks: [],
  },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { allResources, loading: resourcesLoading } = useResources();
  const { summary: gamificationSummary } = useGamification();
  const [aiSnapshot, setAiSnapshot] = useState(emptyAiSnapshot);
  const [analyticsSnapshot, setAnalyticsSnapshot] = useState(emptyAnalyticsSnapshot);
  const [aiLoading, setAiLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const experienceRole = user?.role === 'user' ? (user?.profile?.profileType || 'user') : user?.role;
  const theme = roleThemes[experienceRole] || roleThemes.user;

  const myResources = useMemo(() => {
    if (!user) return [];
    return allResources.filter(
      (resource) => resource.creator?.id === user.id || resource.uploadedBy?.id === user.id
    );
  }, [allResources, user]);

  useEffect(() => {
    let isMounted = true;

    if (!isAuthenticated || !user || user.role === 'admin') {
      setAiLoading(false);
      setAnalyticsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const loadSnapshots = async () => {
      try {
        const [aiData, analyticsData] = await Promise.all([
          fetchAiPersonalization(),
          fetchMyAnalytics(),
        ]);
        if (isMounted) {
          setAiSnapshot(aiData);
          setAnalyticsSnapshot(analyticsData);
        }
      } catch {
        if (isMounted) {
          setAiSnapshot(emptyAiSnapshot);
          setAnalyticsSnapshot(emptyAnalyticsSnapshot);
        }
      } finally {
        if (isMounted) {
          setAiLoading(false);
          setAnalyticsLoading(false);
        }
      }
    };

    loadSnapshots();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #050816 0%, #111827 55%, #1e1b4b 100%)', color: '#f8fafc', paddingTop: '80px' }}>
        Loading dashboard...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const displayName = user.fullName || user.name || 'Learner';
  const firstName = displayName.split(' ')[0] || 'Learner';
  const bio = user.profile?.bio || 'Complete your profile to personalize StudySphere.';
  const location = user.profile?.location || 'Add your location';
  const points = gamificationSummary?.stats?.points || user?.stats?.points || 0;
  const streak = gamificationSummary?.stats?.streak || user?.stats?.streak || 0;
  const skillCount = user.profile?.skills?.length || 0;
  const goalCount = user.profile?.learningGoals?.length || 0;
  const approvedResources = myResources.filter((item) => item.status === 'approved').length;
  const pendingResources = myResources.filter((item) => item.status === 'pending').length;

  const stats = [
    ['Uploaded Resources', myResources.length],
    ['Approved Resources', approvedResources],
    ['Pending Review', pendingResources],
    ['Skills Added', skillCount],
    ['Learning Goals', goalCount],
    ['Badges Earned', gamificationSummary?.earnedBadges?.length || 0],
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 55%, #1e1b4b 100%)', color: theme.text, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ paddingTop: '96px', paddingBottom: '48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          {!user.profileSetupCompleted ? (
            <section style={{ background: 'rgba(250,204,21,0.12)', border: '1px solid rgba(253,224,71,0.22)', borderRadius: '22px', padding: '18px 20px', marginBottom: '20px', boxShadow: '0 18px 40px -32px rgba(250,204,21,0.45)', backdropFilter: 'blur(14px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#fde68a' }}>Complete your profile later</div>
                  <div style={{ marginTop: '6px', color: '#fef3c7', lineHeight: 1.6 }}>
                    You can use StudySphere now. Finish onboarding whenever you want to personalize your dashboard, recommendations, and profile.
                  </div>
                </div>
                <button onClick={() => navigate('/profile/setup')} style={{ background: '#fef3c7', color: '#78350f', border: 'none', padding: '11px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 800 }}>
                  Continue Setup
                </button>
              </div>
            </section>
          ) : null}

          <section style={{ background: theme.hero, border: `1px solid ${theme.border}`, borderRadius: '32px', padding: '32px', boxShadow: '0 30px 80px -50px rgba(0,0,0,0.45)', marginBottom: '28px', backdropFilter: 'blur(18px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '999px', background: theme.badge, color: theme.badgeText, fontSize: '12px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '14px' }}>
                  {experienceRole} workspace
                </div>
                <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.02, margin: '0 0 12px', fontWeight: 900 }}>Welcome back, {firstName}</h1>
                <p style={{ maxWidth: '760px', color: theme.muted, fontSize: '16px', lineHeight: 1.7, margin: 0 }}>{bio}</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/resources/upload')} style={{ background: theme.accent, color: 'white', border: 'none', padding: '13px 18px', borderRadius: '14px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 20px 35px -22px rgba(124,58,237,0.65)' }}>Upload Resource</button>
                <button onClick={() => navigate('/profile')} style={{ background: 'rgba(255,255,255,0.08)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.12)', padding: '13px 18px', borderRadius: '14px', cursor: 'pointer', fontWeight: 600, backdropFilter: 'blur(12px)' }}>Open Profile</button>
                <button onClick={() => navigate('/analytics')} style={{ background: 'rgba(125,211,252,0.14)', color: '#bae6fd', border: '1px solid rgba(125,211,252,0.24)', padding: '13px 18px', borderRadius: '14px', cursor: 'pointer', fontWeight: 600, backdropFilter: 'blur(12px)' }}>View Analytics</button>
              </div>
            </div>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            {stats.map(([label, value]) => (
              <div key={label} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: '24px', padding: '22px', boxShadow: '0 20px 40px -32px rgba(0,0,0,0.45)', backdropFilter: 'blur(14px)' }}>
                <div style={{ width: '46px', height: '6px', borderRadius: '999px', background: theme.accent, marginBottom: '16px', opacity: 0.85 }} />
                <div style={{ fontSize: '14px', color: theme.muted, marginBottom: '8px' }}>{label}</div>
                <div style={{ fontSize: '34px', fontWeight: 900 }}>{value}</div>
              </div>
            ))}
          </div>

          <section style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: '28px', padding: '26px', boxShadow: '0 20px 40px -32px rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '18px', flexWrap: 'wrap', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 900 }}>AI Focus Board</h3>
                <p style={{ margin: 0, color: theme.muted, maxWidth: '760px', lineHeight: 1.7 }}>
                  StudySphere now turns your DSA work, profile, and activity into a short next-step plan instead of leaving AI as a separate module.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/ai')} style={{ background: 'rgba(59,130,246,0.14)', color: '#bfdbfe', border: '1px solid rgba(96,165,250,0.26)', padding: '11px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 }}>
                  Open AI Hub
                </button>
                <button onClick={() => navigate('/ai/quiz')} style={{ background: 'rgba(236,72,153,0.12)', color: '#f9a8d4', border: '1px solid rgba(244,114,182,0.24)', padding: '11px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 }}>
                  Start Quiz
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              {[
                ['Readiness', `${aiSnapshot.overview?.readinessScore || 0}%`],
                ['Solve Rate', `${aiSnapshot.overview?.overallSolveRate || 0}%`],
                ['Recent Practice', aiSnapshot.overview?.recentPracticeCount || 0],
                ['Momentum', aiSnapshot.overview?.momentumLabel || 'Low'],
              ].map(([label, value]) => (
                <div key={label} style={{ borderRadius: '18px', background: theme.panelAlt, border: '1px solid rgba(255,255,255,0.08)', padding: '16px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
                  <div style={{ marginTop: '8px', fontSize: '28px', fontWeight: 900 }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              <div style={{ display: 'grid', gap: '14px' }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8' }}>Next Actions</div>
                {aiLoading ? <div style={{ color: theme.muted }}>Loading AI guidance...</div> : (aiSnapshot.nextActions || []).slice(0, 3).map((action) => (
                  <div key={action.id} style={{ borderRadius: '18px', background: theme.panelAlt, border: '1px solid rgba(255,255,255,0.08)', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'start' }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{action.title}</div>
                        <div style={{ marginTop: '6px', color: theme.muted, lineHeight: 1.6 }}>{action.description}</div>
                        <div style={{ marginTop: '8px', color: '#93c5fd', fontSize: '14px', lineHeight: 1.6 }}>{action.reason}</div>
                      </div>
                      <button onClick={() => navigate(action.route)} style={{ background: 'rgba(59,130,246,0.16)', color: '#bfdbfe', border: '1px solid rgba(96,165,250,0.24)', padding: '9px 12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>
                        {action.ctaLabel}
                      </button>
                    </div>
                  </div>
                ))}
                {!aiLoading && !(aiSnapshot.nextActions || []).length ? (
                  <div style={{ padding: '18px', borderRadius: '18px', background: theme.panelAlt, border: '1px dashed rgba(255,255,255,0.12)', color: theme.muted }}>
                    Use DSA practice and the AI pages once to unlock your first personalized action plan.
                  </div>
                ) : null}
              </div>

              <div style={{ display: 'grid', gap: '14px' }}>
                <div style={{ borderRadius: '18px', background: theme.panelAlt, border: '1px solid rgba(255,255,255,0.08)', padding: '16px' }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8' }}>Current AI focus</div>
                  <div style={{ marginTop: '10px', color: theme.text, lineHeight: 1.8 }}>
                    Quiz topic: <strong>{aiSnapshot.suggestedQuizTopic || 'Algorithms'}</strong><br />
                    Weak areas: <strong>{(aiSnapshot.weakTopics || []).slice(0, 2).map((topic) => topic.label).join(', ') || 'Not enough data yet'}</strong>
                  </div>
                </div>
                <div style={{ borderRadius: '18px', background: theme.panelAlt, border: '1px solid rgba(255,255,255,0.08)', padding: '16px' }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8' }}>Roadmap preview</div>
                  <div style={{ marginTop: '10px', fontWeight: 800 }}>{aiSnapshot.roadmap?.[0]?.title || 'Generate your first roadmap'}</div>
                  <div style={{ marginTop: '6px', color: theme.muted, lineHeight: 1.6 }}>{aiSnapshot.roadmap?.[0]?.reason || 'The roadmap will adapt once StudySphere sees more of your practice data.'}</div>
                </div>
              </div>
            </div>
          </section>

          <section style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: '28px', padding: '26px', boxShadow: '0 20px 40px -32px rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '18px', flexWrap: 'wrap', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 900 }}>Performance Pulse</h3>
                <p style={{ margin: 0, color: theme.muted, maxWidth: '760px', lineHeight: 1.7 }}>
                  A short analytics brief so you can see what is working, what is slipping, and what to fix next without leaving the dashboard.
                </p>
              </div>
              <button onClick={() => navigate('/analytics')} style={{ background: 'rgba(125,211,252,0.14)', color: '#bae6fd', border: '1px solid rgba(125,211,252,0.24)', padding: '11px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 }}>
                Full Analytics
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              {[
                ['Readiness', `${analyticsSnapshot.overview?.readinessScore || 0}%`],
                ['Solved', analyticsSnapshot.overview?.solvedProblems || 0],
                ['Avg Score', `${analyticsSnapshot.overview?.averageDsaScore || 0}%`],
                ['Active Days', `${analyticsSnapshot.overview?.activeDaysLast14 || 0}/14`],
                ['Goal Alignment', `${analyticsSnapshot.goalAlignment?.score || 0}%`],
              ].map(([label, value]) => (
                <div key={label} style={{ borderRadius: '18px', background: theme.panelAlt, border: '1px solid rgba(255,255,255,0.08)', padding: '16px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
                  <div style={{ marginTop: '8px', fontSize: '28px', fontWeight: 900 }}>{analyticsLoading ? '...' : value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              <div style={{ borderRadius: '18px', background: theme.panelAlt, border: '1px solid rgba(255,255,255,0.08)', padding: '18px' }}>
                <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Headline</div>
                <div style={{ marginTop: '10px', fontWeight: 800, lineHeight: 1.7 }}>
                  {analyticsLoading ? 'Loading analytics brief...' : analyticsSnapshot.report?.headline || 'Keep using StudySphere to generate your first analytics brief.'}
                </div>
                <div style={{ display: 'grid', gap: '10px', marginTop: '16px' }}>
                  {(analyticsSnapshot.report?.wins || []).slice(0, 2).map((item, index) => (
                    <div key={`${index}-${item}`} style={{ borderRadius: '14px', background: 'rgba(6,78,59,0.24)', padding: '12px 14px', color: '#d1fae5', lineHeight: 1.6 }}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gap: '14px' }}>
                {(analyticsSnapshot.priorityBoard || []).slice(0, 1).map((item) => (
                  <div key={item.id} style={{ borderRadius: '18px', background: item.tone === 'risk' ? 'rgba(127,29,29,0.28)' : item.tone === 'warning' ? 'rgba(120,53,15,0.28)' : 'rgba(30,41,59,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px' }}>
                    <div style={{ fontWeight: 800 }}>{item.title}</div>
                    <div style={{ marginTop: '8px', color: theme.muted, lineHeight: 1.6 }}>{item.detail}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginTop: '10px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '12px' }}>{item.metric}</div>
                      <button onClick={() => navigate(item.route)} style={{ background: 'rgba(255,255,255,0.08)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>
                        {item.ctaLabel}
                      </button>
                    </div>
                  </div>
                ))}
                {((analyticsSnapshot.focusAlerts || []).slice(0, 2)).map((alert) => (
                  <div key={alert.title} style={{ borderRadius: '18px', background: alert.tone === 'risk' ? 'rgba(127,29,29,0.28)' : alert.tone === 'warning' ? 'rgba(120,53,15,0.28)' : 'rgba(30,41,59,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px' }}>
                    <div style={{ fontWeight: 800 }}>{alert.title}</div>
                    <div style={{ marginTop: '8px', color: theme.muted, lineHeight: 1.6 }}>{alert.detail}</div>
                  </div>
                ))}
                {!analyticsLoading && !(analyticsSnapshot.focusAlerts || []).length ? (
                  <div style={{ borderRadius: '18px', background: theme.panelAlt, border: '1px dashed rgba(255,255,255,0.12)', padding: '16px', color: theme.muted }}>
                    No urgent risk signal right now. Keep your current momentum going.
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            <section style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: '24px', padding: '24px', boxShadow: '0 20px 40px -32px rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>Your Resources</h3>
                <button onClick={() => navigate('/resources')} style={{ background: theme.panelAlt, color: theme.accentSoft, border: `1px solid ${theme.border}`, padding: '9px 14px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 }}>View Library</button>
              </div>
              {resourcesLoading ? (
                <p style={{ color: theme.muted }}>Loading your resources...</p>
              ) : myResources.length === 0 ? (
                <div style={{ padding: '22px', borderRadius: '18px', background: theme.panelAlt, color: theme.muted, border: '1px dashed rgba(255,255,255,0.16)' }}>
                  No resources yet. Upload your first one to make this dashboard feel alive.
                </div>
              ) : (
                myResources.slice(0, 5).map((resource) => (
                  <div key={resource.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: '6px' }}>{resource.title}</div>
                      <div style={{ fontSize: '13px', color: theme.muted }}>{resource.category} | {resource.type} | {resource.status}</div>
                    </div>
                    <button onClick={() => navigate(`/resources/${resource.id}`)} style={{ background: 'rgba(59,130,246,0.16)', color: '#bfdbfe', border: '1px solid rgba(96,165,250,0.26)', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>Open</button>
                  </div>
                ))
              )}
            </section>

            <section style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: '24px', padding: '24px', boxShadow: '0 20px 40px -32px rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)' }}>
              <h3 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 800 }}>Profile Snapshot</h3>
              {[
                ['Location', location],
                ['Current Role', user.profile?.currentRole || 'Add your current role'],
                ['Target Role', user.profile?.targetRole || 'Set your target role'],
                ['Daily Study Hours', user.profile?.dailyStudyHours || 'Not selected yet'],
                ['Study Points', points],
                ['Streak', `${streak} day streak`],
                ['Current Level', gamificationSummary?.stats?.level || user?.stats?.level || 'Beginner'],
              ].map(([label, value]) => (
                <div key={label} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </section>
          </div>

          <section style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: '28px', padding: '26px', boxShadow: '0 20px 40px -32px rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: '0 0 10px', fontSize: '24px', fontWeight: 900 }}>Your Learning Focus</h3>
                <p style={{ margin: 0, color: theme.muted, maxWidth: '760px', lineHeight: 1.7 }}>
                  {goalCount > 0
                    ? `You have ${goalCount} learning goal${goalCount > 1 ? 's' : ''} saved. Keep your momentum by refining your setup and using the resource library often.`
                    : 'Set your learning goals in profile setup to unlock a more personalized dashboard experience.'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/leaderboard')} style={{ background: 'rgba(250,204,21,0.14)', color: '#fde68a', border: '1px solid rgba(253,224,71,0.22)', padding: '11px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 }}>Open Leaderboard</button>
                <button onClick={() => navigate('/profile/setup')} style={{ background: 'rgba(236,72,153,0.12)', color: '#f9a8d4', border: '1px solid rgba(244,114,182,0.24)', padding: '11px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 }}>Update Setup</button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '22px' }}>
              {(user.profile?.skills || []).slice(0, 8).map((skill) => (
                <span key={skill} style={{ padding: '10px 14px', borderRadius: '999px', background: theme.panelAlt, border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>
                  {skill}
                </span>
              ))}
            </div>
            {gamificationSummary?.challenges?.length ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginTop: '22px' }}>
                {gamificationSummary.challenges.map((challenge) => (
                  <div key={challenge.id} style={{ borderRadius: '18px', background: theme.panelAlt, border: '1px solid rgba(255,255,255,0.08)', padding: '16px' }}>
                    <div style={{ fontWeight: 800, marginBottom: '6px' }}>{challenge.title}</div>
                    <div style={{ color: theme.muted, fontSize: '14px', lineHeight: 1.6 }}>{challenge.description}</div>
                    <div style={{ marginTop: '12px', height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                      <div style={{ width: `${challenge.progress}%`, height: '100%', borderRadius: '999px', background: theme.accent }} />
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', color: theme.muted, fontSize: '13px' }}>
                      <span>{challenge.current}/{challenge.target}</span>
                      <span>{challenge.reward}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
