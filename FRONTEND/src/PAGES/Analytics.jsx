import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';
import {
  downloadMyAnalyticsExport,
  fetchMyAnalytics,
} from '../components/context/Analytics.service';

const panelStyle = {
  borderRadius: '24px',
  background: 'rgba(15,23,42,0.48)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '24px',
  boxShadow: '0 20px 40px -32px rgba(0,0,0,0.45)',
  backdropFilter: 'blur(16px)',
};

const Analytics = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMyAnalytics();
        setAnalytics(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load analytics.');
      } finally {
        setAnalyticsLoading(false);
      }
    };

    if (isAuthenticated) {
      load();
    } else {
      setAnalyticsLoading(false);
    }
  }, [isAuthenticated]);

  const maxPoints = useMemo(
    () => Math.max(...(analytics?.progressSeries || []).map((item) => item.points || 0), 1),
    [analytics]
  );

  const maxTopicAttempts = useMemo(
    () => Math.max(...(analytics?.topicPerformance || []).map((item) => item.attempts || 0), 1),
    [analytics]
  );

  const maxContribution = useMemo(
    () => Math.max(...(analytics?.contributionSeries || []).map((item) => item.uploads || 0), 1),
    [analytics]
  );

  const maxTopicMinutes = useMemo(
    () => Math.max(...(analytics?.timeByTopic || []).map((item) => item.minutes || 0), 1),
    [analytics]
  );

  const heatMax = useMemo(
    () => Math.max(...(analytics?.activityHeatmap || []).map((item) => item.activityCount || 0), 1),
    [analytics]
  );

  const weekdayMax = useMemo(
    () => Math.max(...(analytics?.weekdayPattern || []).map((item) => item.value || 0), 1),
    [analytics]
  );

  if (loading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/analytics" replace />;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', paddingTop: '96px', paddingBottom: '48px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ marginBottom: '24px', borderRadius: '30px', background: 'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(139,92,246,0.22) 48%, rgba(236,72,153,0.18) 100%)', border: '1px solid rgba(147,197,253,0.18)', padding: '30px', boxShadow: '0 30px 80px -40px rgba(0,0,0,0.45)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'inline-flex', borderRadius: '999px', background: 'rgba(15,23,42,0.26)', padding: '7px 12px', fontSize: '12px', letterSpacing: '0.16em', fontWeight: 800, textTransform: 'uppercase', color: '#dbeafe' }}>
                Advanced Analytics
              </div>
              <h1 style={{ margin: '14px 0 0', fontSize: '34px', fontWeight: 900 }}>Study momentum and learning insights</h1>
              <p style={{ margin: '10px 0 0', color: '#dbeafe' }}>
                Track DSA progress, profile goals, AI usage, community activity, and resource impact in one place.
              </p>
            </div>
            <button
              onClick={async () => {
                setExporting(true);
                try {
                  await downloadMyAnalyticsExport();
                } catch (err) {
                  setError(err?.response?.data?.message || 'Unable to export analytics right now.');
                } finally {
                  setExporting(false);
                }
              }}
              disabled={exporting}
              style={{
                border: '1px solid rgba(255,255,255,0.16)',
                background: 'rgba(15,23,42,0.28)',
                color: '#f8fafc',
                padding: '12px 16px',
                borderRadius: '14px',
                cursor: exporting ? 'not-allowed' : 'pointer',
                fontWeight: 800,
                opacity: exporting ? 0.7 : 1,
              }}
            >
              {exporting ? 'Exporting...' : 'Export Report'}
            </button>
          </div>
        </div>

        {error ? <div style={{ ...panelStyle, marginBottom: '24px', color: '#fecaca', background: 'rgba(127,29,29,0.35)' }}>{error}</div> : null}

        {analyticsLoading ? (
          <div style={panelStyle}>Loading analytics...</div>
        ) : analytics ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '18px', marginBottom: '24px' }}>
              {[
                ['Points', analytics.overview.points, '#c4b5fd'],
                ['Readiness', `${analytics.overview.readinessScore || 0}%`, '#fde68a'],
                ['Solved Problems', analytics.overview.solvedProblems, '#6ee7b7'],
                ['Attempts', analytics.overview.attemptsCount, '#93c5fd'],
                ['Avg DSA Score', `${analytics.overview.averageDsaScore}%`, '#f9a8d4'],
                ['Active Days', `${analytics.overview.activeDaysLast14}/14`, '#fcd34d'],
                ['Goal Alignment', `${analytics.goalAlignment?.score || 0}%`, '#bfdbfe'],
                ['AI Sessions', analytics.overview.aiSessions, '#bfdbfe'],
                ['Study Hours', analytics.overview.estimatedStudyHours || 0, '#a7f3d0'],
              ].map(([label, value, tone]) => (
                <div key={label} style={panelStyle}>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>{label}</div>
                  <div style={{ marginTop: '10px', fontSize: '28px', fontWeight: 900, color: tone }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '24px', marginBottom: '24px' }}>
              <div style={panelStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '18px' }}>
                  <div>
                    <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 900 }}>Action board</h2>
                    <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.7 }}>
                      The fastest next moves based on your current DSA, profile, AI, and resource signals.
                    </p>
                  </div>
                  <div style={{ padding: '10px 14px', borderRadius: '14px', background: 'rgba(250,204,21,0.12)', border: '1px solid rgba(253,224,71,0.18)', color: '#fde68a', fontWeight: 800 }}>
                    {analytics.overview.readinessLabel || 'Tracking'} readiness
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '14px' }}>
                  {(analytics.priorityBoard || []).length === 0 ? (
                    <div style={{ color: '#94a3b8' }}>Keep using DSA, AI, and resources to unlock your next analytics action board.</div>
                  ) : (
                    (analytics.priorityBoard || []).map((item) => (
                      <div key={item.id} style={{ borderRadius: '18px', background: item.tone === 'risk' ? 'rgba(127,29,29,0.24)' : item.tone === 'warning' ? 'rgba(120,53,15,0.24)' : 'rgba(59,130,246,0.08)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'start' }}>
                          <div>
                            <div style={{ fontWeight: 900 }}>{item.title}</div>
                            <div style={{ marginTop: '8px', color: '#cbd5e1', lineHeight: 1.7 }}>{item.detail}</div>
                            <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '12px' }}>{item.metric}</div>
                          </div>
                          <button onClick={() => navigate(item.route)} style={{ background: 'rgba(255,255,255,0.08)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.12)', padding: '9px 12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>
                            {item.ctaLabel}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gap: '24px' }}>
                <div style={panelStyle}>
                  <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Readiness pulse</h2>
                  <div style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>Overall readiness</div>
                    <div style={{ marginTop: '8px', fontSize: '34px', fontWeight: 900, color: '#fde68a' }}>{analytics.overview.readinessScore || 0}%</div>
                    <div style={{ marginTop: '8px', color: '#cbd5e1' }}>{analytics.overview.readinessLabel || 'Tracking'} learning readiness</div>
                  </div>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {[
                      ['Consistency', `${analytics.studyHabits?.consistencyScore || 0}%`],
                      ['Goal alignment', `${analytics.goalAlignment?.score || 0}%`],
                      ['Strongest topic', analytics.studyHabits?.strongestTopic || 'Not enough data'],
                      ['Weakest topic', analytics.studyHabits?.weakestTopic || 'Not enough data'],
                    ].map(([label, value]) => (
                      <div key={label} style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>{label}</div>
                        <div style={{ marginTop: '6px', fontWeight: 900 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={panelStyle}>
                  <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Peer comparison</h2>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {[
                      ['Points percentile', `${analytics.peerComparison?.pointsPercentile || 0}%`],
                      ['Solved percentile', `${analytics.peerComparison?.solvedPercentile || 0}%`],
                      ['Upload percentile', `${analytics.peerComparison?.uploadPercentile || 0}%`],
                      ['Platform avg points', analytics.peerComparison?.platformAverages?.points || 0],
                    ].map(([label, value]) => (
                      <div key={label} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>{label}</div>
                        <div style={{ marginTop: '6px', fontWeight: 900 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={panelStyle}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Weekly change</h2>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {(analytics.trendSignals || analytics.weeklySummary || []).map((item) => (
                    <div key={item.label} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ fontWeight: 800 }}>{item.label}</div>
                        <div style={{ color: item.delta >= 0 ? '#86efac' : '#fca5a5', fontWeight: 800 }}>
                          {item.delta >= 0 ? '+' : ''}{item.delta}
                        </div>
                      </div>
                      <div style={{ marginTop: '6px', color: '#cbd5e1' }}>
                        This week: <strong>{item.current}</strong>
                      </div>
                      <div style={{ marginTop: '4px', color: '#94a3b8', fontSize: '12px' }}>
                        Previous week: {item.previous}
                      </div>
                      <div style={{ marginTop: '4px', color: '#64748b', fontSize: '12px' }}>
                        {item.summary || 'Trend signal'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={panelStyle}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Analytics brief</h2>
                <div style={{ borderRadius: '18px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(96,165,250,0.18)', padding: '18px', marginBottom: '16px' }}>
                  <div style={{ color: '#bfdbfe', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Headline</div>
                  <div style={{ marginTop: '8px', fontSize: '20px', fontWeight: 900 }}>{analytics.report?.headline || 'Your latest learning story will appear here once enough activity is recorded.'}</div>
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {(analytics.report?.nextSteps || []).map((item, index) => (
                    <div key={`${index}-${item}`} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px', color: '#dbeafe', lineHeight: 1.7 }}>
                      {item}
                    </div>
                  ))}
                  {!analytics.report?.nextSteps?.length ? (
                    <div style={{ color: '#94a3b8' }}>Recommended actions will appear after your first few DSA, AI, or resource signals.</div>
                  ) : null}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={panelStyle}>
                  <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Wins to keep</h2>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {(analytics.report?.wins || []).map((item, index) => (
                      <div key={`${index}-${item}`} style={{ borderRadius: '16px', background: 'rgba(6,78,59,0.24)', padding: '14px', color: '#d1fae5', lineHeight: 1.7 }}>
                        {item}
                      </div>
                    ))}
                    {!analytics.report?.wins?.length ? <div style={{ color: '#94a3b8' }}>As momentum builds, your strongest patterns will show up here.</div> : null}
                  </div>
                </div>

                <div style={panelStyle}>
                  <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Risks to watch</h2>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {(analytics.report?.risks || []).map((item, index) => (
                      <div key={`${index}-${item}`} style={{ borderRadius: '16px', background: 'rgba(127,29,29,0.24)', padding: '14px', color: '#fecaca', lineHeight: 1.7 }}>
                        {item}
                      </div>
                    ))}
                    {!analytics.report?.risks?.length ? <div style={{ color: '#94a3b8' }}>No urgent risk signals right now.</div> : null}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ ...panelStyle, marginBottom: '24px' }}>
              <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Focus alerts</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                {(analytics.focusAlerts || []).length === 0 ? (
                  <div style={{ color: '#94a3b8' }}>No urgent alerts right now. Your analytics signals look stable.</div>
                ) : (
                  (analytics.focusAlerts || []).map((alert) => (
                    <div key={alert.title} style={{ borderRadius: '18px', background: alert.tone === 'risk' ? 'rgba(127,29,29,0.28)' : alert.tone === 'warning' ? 'rgba(120,53,15,0.28)' : alert.tone === 'success' ? 'rgba(6,78,59,0.28)' : 'rgba(30,41,59,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px' }}>
                      <div style={{ fontWeight: 900 }}>{alert.title}</div>
                      <div style={{ marginTop: '8px', color: '#cbd5e1', lineHeight: 1.7 }}>{alert.detail}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={panelStyle}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Study habit patterns</h2>
                <div style={{ display: 'grid', gap: '12px', marginBottom: '18px' }}>
                  {[
                    ['Best day', analytics.studyHabits?.mostActiveWeekday || 'Mon'],
                    ['Consistency score', `${analytics.studyHabits?.consistencyScore || 0}%`],
                    ['Avg sessions per active day', analytics.studyHabits?.averageSessionsPerActiveDay || 0],
                    ['Momentum', analytics.studyHabits?.momentum || 'Tracking'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '12px' }}>{label}</div>
                      <div style={{ marginTop: '6px', fontWeight: 900 }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {(analytics.weekdayPattern || []).map((item) => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: '#cbd5e1' }}>{item.label}</span>
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>{item.value} actions</span>
                      </div>
                      <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                        <div style={{ width: `${(item.value / weekdayMax) * 100 || 0}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #10b981, #38bdf8)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={panelStyle}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Goal alignment</h2>
                <div style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>Alignment score</div>
                  <div style={{ marginTop: '8px', fontSize: '32px', fontWeight: 900, color: '#c4b5fd' }}>{analytics.goalAlignment?.score || 0}%</div>
                  <div style={{ marginTop: '8px', color: '#cbd5e1', lineHeight: 1.7 }}>{analytics.goalAlignment?.message}</div>
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>Aligned topics</div>
                    <div style={{ marginTop: '6px', fontWeight: 800 }}>{(analytics.goalAlignment?.alignedTopics || []).join(', ') || 'No clear alignment yet'}</div>
                  </div>
                  <div style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>Aligned resource categories</div>
                    <div style={{ marginTop: '6px', fontWeight: 800 }}>{analytics.goalAlignment?.alignedResourceCategories || 0}</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={panelStyle}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Study momentum</h2>
                <div style={{ display: 'flex', alignItems: 'end', gap: '14px', height: '260px' }}>
                  {(analytics.progressSeries || []).map((item) => (
                    <div key={item.label} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'center', height: '200px' }}>
                        <div style={{ width: '100%', maxWidth: '62px', height: `${(item.points / maxPoints) * 180 || 10}px`, background: 'linear-gradient(180deg, #3b82f6, #8b5cf6)', borderRadius: '16px 16px 0 0' }} />
                      </div>
                      <div style={{ marginTop: '10px', color: '#e2e8f0', fontSize: '13px', fontWeight: 700 }}>{item.label}</div>
                      <div style={{ marginTop: '6px', color: '#94a3b8', fontSize: '12px' }}>{item.attempts} attempts</div>
                      <div style={{ marginTop: '4px', color: '#64748b', fontSize: '11px' }}>{item.aiSessions} AI sessions</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={panelStyle}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Goal tracking</h2>
                <div style={{ display: 'grid', gap: '14px' }}>
                  {(analytics.goalsProgress || []).map((item) => (
                    <div key={item.label} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 800 }}>{item.label}</div>
                        <div style={{ color: '#c4b5fd', fontWeight: 800 }}>{item.progress}%</div>
                      </div>
                      <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                        <div style={{ width: `${item.progress}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />
                      </div>
                      <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '12px' }}>{item.current}</div>
                      <div style={{ marginTop: '4px', color: '#64748b', fontSize: '12px' }}>{item.target}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={panelStyle}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Weak and strong areas</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <div style={{ marginBottom: '10px', color: '#fca5a5', fontWeight: 800 }}>Needs focus</div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {(analytics.weakAreas || []).map((item) => (
                        <div key={item.label} style={{ borderRadius: '16px', background: 'rgba(127,29,29,0.24)', padding: '14px' }}>
                          <div style={{ fontWeight: 800 }}>{item.label}</div>
                          <div style={{ marginTop: '4px', color: '#fecaca', fontSize: '13px' }}>{item.averageScore}% avg score | {item.solvedRate}% solved</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ marginBottom: '10px', color: '#86efac', fontWeight: 800 }}>Working well</div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {(analytics.strongAreas || []).map((item) => (
                        <div key={item.label} style={{ borderRadius: '16px', background: 'rgba(6,78,59,0.24)', padding: '14px' }}>
                          <div style={{ fontWeight: 800 }}>{item.label}</div>
                          <div style={{ marginTop: '4px', color: '#bbf7d0', fontSize: '13px' }}>{item.averageScore}% avg score | {item.solvedRate}% solved</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={panelStyle}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Recent wins</h2>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {(analytics.recentWins || []).length === 0 ? (
                    <div style={{ color: '#94a3b8' }}>Your next meaningful wins will appear here as you practice and contribute.</div>
                  ) : (
                    (analytics.recentWins || []).map((item) => (
                      <div key={item.title} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                        <div style={{ fontWeight: 900 }}>{item.title}</div>
                        <div style={{ marginTop: '8px', color: '#cbd5e1', lineHeight: 1.7 }}>{item.detail}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginBottom: '24px' }}>
              <div style={panelStyle}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>DSA topic performance</h2>
                <div style={{ display: 'grid', gap: '14px' }}>
                  {(analytics.topicPerformance || []).slice(0, 6).map((item) => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '6px' }}>
                        <span style={{ color: '#e2e8f0', fontWeight: 700 }}>{item.label}</span>
                        <span style={{ color: '#94a3b8', fontSize: '13px' }}>{item.solved}/{item.attempts} solved</span>
                      </div>
                      <div style={{ height: '9px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                        <div style={{ width: `${(item.attempts / maxTopicAttempts) * 100 || 0}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #10b981, #38bdf8)' }} />
                      </div>
                      <div style={{ marginTop: '6px', display: 'flex', gap: '16px', color: '#94a3b8', fontSize: '12px' }}>
                        <span>{item.averageScore}% avg score</span>
                        <span>{item.solvedRate}% solved rate</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gap: '24px' }}>
                <div style={panelStyle}>
                  <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Difficulty mix</h2>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {(analytics.difficultyBreakdown || []).map((item) => (
                      <div key={item.label} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 800, textTransform: 'capitalize' }}>{item.label}</span>
                          <span style={{ color: '#c4b5fd' }}>{item.attempts} attempts</span>
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>{item.solvedRate}% solved rate</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={panelStyle}>
                  <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Language breakdown</h2>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {(analytics.languageBreakdown || []).slice(0, 4).map((item) => (
                      <div key={item.label} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 800, textTransform: 'capitalize' }}>{item.label}</span>
                          <span style={{ color: '#93c5fd' }}>{item.attempts}</span>
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>{item.averageScore}% avg score</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginBottom: '24px' }}>
              <div style={panelStyle}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>14-day activity heatmap</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '10px' }}>
                  {(analytics.activityHeatmap || []).map((item) => (
                    <div key={item.date} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.03)', padding: '12px', textAlign: 'center' }}>
                      <div style={{ height: '42px', borderRadius: '12px', background: `rgba(59,130,246,${0.12 + ((item.activityCount || 0) / heatMax) * 0.55})`, marginBottom: '8px' }} />
                      <div style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 700 }}>{item.label}</div>
                      <div style={{ marginTop: '4px', fontSize: '11px', color: '#94a3b8' }}>{item.activityCount} actions</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gap: '24px' }}>
                <div style={panelStyle}>
                  <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>AI insights</h2>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {[
                      ['Assistant sessions', analytics.aiInsights?.assistantSessions || 0],
                      ['Quiz sessions', analytics.aiInsights?.quizSessions || 0],
                      ['Interview sessions', analytics.aiInsights?.interviewSessions || 0],
                      ['Avg quiz score', `${analytics.aiInsights?.averageQuizScore || 0}%`],
                    ].map(([label, value]) => (
                      <div key={label} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>{label}</div>
                        <div style={{ marginTop: '6px', fontWeight: 900 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={panelStyle}>
                  <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Community footprint</h2>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {[
                      ['Groups owned', analytics.socialInsights?.groupsOwned || 0],
                      ['Groups joined', analytics.socialInsights?.groupsJoined || 0],
                      ['Forum threads', analytics.socialInsights?.forumThreads || 0],
                      ['Mentorship accepted', analytics.socialInsights?.mentorshipAccepted || 0],
                    ].map(([label, value]) => (
                      <div key={label} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>{label}</div>
                        <div style={{ marginTop: '6px', fontWeight: 900 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '24px', marginBottom: '24px' }}>
              <div style={panelStyle}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Time by topic</h2>
                <div style={{ display: 'grid', gap: '14px' }}>
                  {(analytics.timeByTopic || []).map((item) => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', marginBottom: '6px' }}>
                        <span style={{ color: '#e2e8f0', fontWeight: 700 }}>{item.label}</span>
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>{item.hours}h | {item.attempts} attempts</span>
                      </div>
                      <div style={{ height: '10px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                        <div style={{ width: `${(item.minutes / maxTopicMinutes) * 100 || 0}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #8b5cf6, #ec4899)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gap: '24px' }}>
                <div style={panelStyle}>
                  <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Milestone progress</h2>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {(analytics.milestoneProgress || []).map((item) => (
                      <div key={item.label} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 800 }}>{item.label}</span>
                          <span style={{ color: '#c4b5fd', fontWeight: 800 }}>{item.progress}%</span>
                        </div>
                        <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                          <div style={{ width: `${item.progress}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />
                        </div>
                        <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '12px' }}>{item.current}/{item.target}</div>
                        <div style={{ marginTop: '4px', color: '#64748b', fontSize: '12px' }}>{item.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={panelStyle}>
                  <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Certificate readiness</h2>
                  <div style={{ borderRadius: '18px', background: analytics.certificateReadiness?.ready ? 'rgba(6,78,59,0.24)' : 'rgba(255,255,255,0.04)', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>StudySphere Momentum Certificate</div>
                    <div style={{ marginTop: '8px', fontSize: '30px', fontWeight: 900, color: analytics.certificateReadiness?.ready ? '#86efac' : '#fde68a' }}>
                      {analytics.certificateReadiness?.readinessPercent || 0}%
                    </div>
                    <div style={{ marginTop: '6px', color: '#cbd5e1', fontWeight: 800 }}>
                      {analytics.certificateReadiness?.statusLabel || 'Tracking'}
                    </div>
                    <div style={{ marginTop: '8px', color: '#cbd5e1', lineHeight: 1.7 }}>
                      {analytics.certificateReadiness?.summary || 'Keep building your profile, DSA, and AI activity to unlock certificate readiness.'}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {(analytics.certificateReadiness?.remainingCriteria || []).length ? (
                      (analytics.certificateReadiness?.remainingCriteria || []).map((item) => (
                        <div key={item.label} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 800 }}>{item.label}</span>
                            <span style={{ color: '#fca5a5', fontWeight: 800 }}>{item.progress}%</span>
                          </div>
                          <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                            <div style={{ width: `${item.progress}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }} />
                          </div>
                          <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '12px' }}>
                            {item.current}/{item.target}{item.unit || ''}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ borderRadius: '16px', background: 'rgba(6,78,59,0.24)', padding: '14px', color: '#d1fae5', lineHeight: 1.7 }}>
                        All certificate criteria are met. You are ready to claim this milestone once certificates are enabled for the platform.
                      </div>
                    )}
                  </div>
                  {!analytics.certificateReadiness?.ready ? (
                    <button
                      onClick={() => navigate(analytics.certificateReadiness?.nextRoute || '/analytics')}
                      style={{ marginTop: '14px', background: 'rgba(59,130,246,0.16)', color: '#bfdbfe', border: '1px solid rgba(96,165,250,0.24)', padding: '11px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Work On Main Gap
                    </button>
                  ) : null}
                </div>

                <div style={panelStyle}>
                  <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Company readiness</h2>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {(analytics.companyReadiness || []).length === 0 ? (
                      <div style={{ color: '#94a3b8' }}>Company-tag readiness will appear once you attempt tagged DSA problems.</div>
                    ) : (
                      (analytics.companyReadiness || []).map((item) => (
                        <div key={item.label} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                            <span style={{ fontWeight: 800 }}>{item.label}</span>
                            <span style={{ color: '#93c5fd' }}>{item.attempts} attempts</span>
                          </div>
                          <div style={{ marginTop: '6px', color: '#94a3b8', fontSize: '12px' }}>{item.solvedRate}% solved rate</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={panelStyle}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Contribution analytics</h2>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {(analytics.contributionSeries || []).map((item) => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', marginBottom: '6px' }}>
                        <span>{item.label}</span>
                        <span>{item.uploads} uploads</span>
                      </div>
                      <div style={{ height: '10px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                        <div style={{ width: `${(item.uploads / maxContribution) * 100 || 0}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #10b981, #38bdf8)' }} />
                      </div>
                      <div style={{ marginTop: '6px', display: 'flex', gap: '14px', color: '#94a3b8', fontSize: '12px' }}>
                        <span>{item.views} views</span>
                        <span>{item.downloads} downloads</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={panelStyle}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Top performing resources</h2>
                <div style={{ display: 'grid', gap: '14px' }}>
                  {(analytics.topResources || []).length === 0 ? (
                    <div style={{ color: '#94a3b8' }}>Upload resources to unlock performance tracking here.</div>
                  ) : (
                    (analytics.topResources || []).map((resource) => (
                      <div key={resource.id} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                        <div style={{ fontWeight: 800 }}>{resource.title}</div>
                        <div style={{ marginTop: '4px', color: '#94a3b8', fontSize: '13px' }}>{resource.category} - {resource.status}</div>
                        <div style={{ marginTop: '10px', display: 'flex', gap: '14px', color: '#cbd5e1', fontSize: '12px' }}>
                          <span>{resource.views} views</span>
                          <span>{resource.downloads} downloads</span>
                          <span>{resource.rating} rating</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={panelStyle}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Resource impact by category</h2>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {(analytics.resourceImpact || []).length === 0 ? (
                    <div style={{ color: '#94a3b8' }}>Upload more resources to unlock category-level impact insights.</div>
                  ) : (
                    (analytics.resourceImpact || []).map((item) => (
                      <div key={item.label} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                          <span style={{ fontWeight: 800 }}>{item.label}</span>
                          <span style={{ color: '#f9a8d4' }}>{item.uploads} uploads</span>
                        </div>
                        <div style={{ marginTop: '6px', display: 'flex', gap: '14px', color: '#94a3b8', fontSize: '12px' }}>
                          <span>{item.views} views</span>
                          <span>{item.downloads} downloads</span>
                          <span>score {item.engagementScore}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={panelStyle}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Performance snapshots</h2>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {(analytics.performanceInsights || []).map((item) => (
                    <div key={item.label} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '12px' }}>{item.label}</div>
                      <div style={{ marginTop: '6px', fontWeight: 900 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={panelStyle}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Category mix</h2>
                <div style={{ display: 'grid', gap: '14px' }}>
                  {(analytics.categoryBreakdown || []).map((item) => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: '#cbd5e1' }}>{item.label}</span>
                        <span style={{ color: '#f8fafc' }}>{item.value}</span>
                      </div>
                      <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                        <div style={{ width: `${Math.min(100, item.value * 20)}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #8b5cf6, #ec4899)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={panelStyle}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Recommended next actions</h2>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {(analytics.recommendations || []).length === 0 ? (
                    <div style={{ color: '#94a3b8' }}>You are in a healthy zone right now. Keep your recent momentum going.</div>
                  ) : (
                    (analytics.recommendations || []).map((item, index) => (
                      <div key={`${index}-${item}`} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px', color: '#dbeafe', lineHeight: 1.7 }}>
                        {item}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Analytics;
