import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { downloadAdminAnalyticsExport } from '../../context/Analytics.service';

const panel = {
  borderRadius: '24px',
  background: 'rgba(15,23,42,0.48)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '24px',
  boxShadow: '0 20px 40px -32px rgba(0,0,0,0.45)',
  backdropFilter: 'blur(16px)',
};

const AdminAnalytics = () => {
  const { analytics, stats, loading, error } = useAdmin();
  const [exporting, setExporting] = useState(false);

  const maxUsers = useMemo(
    () => Math.max(...(analytics?.growthSeries || []).map((item) => item.users || 0), 1),
    [analytics]
  );

  const maxResources = useMemo(
    () => Math.max(...(analytics?.growthSeries || []).map((item) => item.resources || 0), 1),
    [analytics]
  );

  const maxAttempts = useMemo(
    () => Math.max(...(analytics?.growthSeries || []).map((item) => item.attempts || 0), 1),
    [analytics]
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', paddingTop: '96px', paddingBottom: '48px' }}>
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ marginBottom: '24px', borderRadius: '30px', background: 'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(139,92,246,0.22) 48%, rgba(236,72,153,0.18) 100%)', border: '1px solid rgba(147,197,253,0.18)', padding: '30px', boxShadow: '0 30px 80px -40px rgba(0,0,0,0.45)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'inline-flex', borderRadius: '999px', background: 'rgba(15,23,42,0.26)', padding: '7px 12px', fontSize: '12px', letterSpacing: '0.16em', fontWeight: 800, textTransform: 'uppercase', color: '#dbeafe' }}>
                Admin Analytics
              </div>
              <h1 style={{ margin: '14px 0 0', fontSize: '34px', fontWeight: 900 }}>Platform analytics and learner health</h1>
              <p style={{ margin: '10px 0 0', color: '#dbeafe' }}>
                Monitor adoption across DSA, resources, AI, community, and moderation from one dashboard.
              </p>
            </div>
            <button
              onClick={async () => {
                setExporting(true);
                try {
                  await downloadAdminAnalyticsExport();
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

        {error ? <div style={{ ...panel, marginBottom: '24px', color: '#fecaca', background: 'rgba(127,29,29,0.35)' }}>{error}</div> : null}

        {loading ? (
          <div style={panel}>Loading analytics...</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '18px', marginBottom: '24px' }}>
              {[
                ['Users', analytics?.overview?.totalUsers ?? stats.totalUsers, '#c4b5fd'],
                ['Resources', analytics?.overview?.totalResources ?? stats.totalResources, '#7dd3fc'],
                ['Active Users', analytics?.overview?.activeUsers ?? stats.activeUsers, '#6ee7b7'],
                ['DSA Attempts', analytics?.overview?.totalDsaAttempts || 0, '#fcd34d'],
                ['AI Sessions', analytics?.overview?.aiSessions || 0, '#bfdbfe'],
                ['Pending Review', analytics?.overview?.pendingResources ?? stats.pendingResources, '#f9a8d4'],
              ].map(([label, value, tone]) => (
                <div key={label} style={panel}>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>{label}</div>
                  <div style={{ marginTop: '10px', fontSize: '28px', fontWeight: 900, color: tone }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 0.65fr', gap: '24px', marginBottom: '24px' }}>
              <div style={panel}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Growth and usage trend</h2>
                <div style={{ display: 'flex', alignItems: 'end', gap: '16px', height: '260px' }}>
                  {(analytics?.growthSeries || []).map((item) => (
                    <div key={item.label} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'center', gap: '8px', height: '200px' }}>
                        <div style={{ width: '20px', height: `${(item.users / maxUsers) * 180 || 10}px`, background: 'linear-gradient(180deg, #3b82f6, #8b5cf6)', borderRadius: '10px 10px 0 0' }} />
                        <div style={{ width: '20px', height: `${(item.resources / maxResources) * 170 || 10}px`, background: 'linear-gradient(180deg, #10b981, #38bdf8)', borderRadius: '10px 10px 0 0' }} />
                        <div style={{ width: '20px', height: `${(item.attempts / maxAttempts) * 160 || 10}px`, background: 'linear-gradient(180deg, #f59e0b, #f97316)', borderRadius: '10px 10px 0 0' }} />
                      </div>
                      <div style={{ marginTop: '10px', color: '#e2e8f0', fontSize: '13px', fontWeight: 700 }}>{item.label}</div>
                      <div style={{ marginTop: '4px', color: '#64748b', fontSize: '11px' }}>{item.aiSessions} AI</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={panel}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Engagement</h2>
                <div style={{ display: 'grid', gap: '14px' }}>
                  {[
                    ['Active Users Rate', `${analytics?.engagement?.activeUsersRate || 0}%`],
                    ['Avg Resources / User', analytics?.engagement?.avgResourcesPerUser || 0],
                    ['Avg Attempts / Learner', analytics?.engagement?.avgAttemptsPerLearner || 0],
                    ['Avg Quiz Score', `${analytics?.engagement?.avgQuizScore || 0}%`],
                  ].map(([label, value]) => (
                    <div key={label} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>{label}</div>
                      <div style={{ marginTop: '8px', fontSize: '28px', fontWeight: 900 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={panel}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Feature adoption</h2>
                <div style={{ display: 'grid', gap: '14px' }}>
                  {(analytics?.featureAdoption || []).map((item) => (
                    <div key={item.label} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 800 }}>{item.label}</div>
                        <div style={{ color: '#c4b5fd', fontWeight: 800 }}>{item.percentage}%</div>
                      </div>
                      <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                        <div style={{ width: `${item.percentage}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />
                      </div>
                      <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '12px' }}>{item.summary}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={panel}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Moderation insights</h2>
                <div style={{ display: 'grid', gap: '14px' }}>
                  {(analytics?.moderationInsights || []).map((item) => (
                    <div key={item.label} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>{item.label}</div>
                      <div style={{ marginTop: '8px', fontSize: '28px', fontWeight: 900 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '24px', marginBottom: '24px' }}>
              <div style={panel}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Platform brief</h2>
                <div style={{ borderRadius: '18px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(96,165,250,0.18)', padding: '18px', marginBottom: '16px' }}>
                  <div style={{ color: '#bfdbfe', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Headline</div>
                  <div style={{ marginTop: '8px', fontSize: '20px', fontWeight: 900 }}>{analytics?.report?.headline || 'The platform summary will appear here once enough activity is recorded.'}</div>
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {(analytics?.report?.nextSteps || []).map((item, index) => (
                    <div key={`${index}-${item}`} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px', color: '#dbeafe', lineHeight: 1.7 }}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gap: '24px' }}>
                <div style={panel}>
                  <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Strengths</h2>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {(analytics?.report?.strengths || []).map((item, index) => (
                      <div key={`${index}-${item}`} style={{ borderRadius: '16px', background: 'rgba(6,78,59,0.24)', padding: '14px', color: '#d1fae5', lineHeight: 1.7 }}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={panel}>
                  <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Risks</h2>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {(analytics?.report?.risks || []).map((item, index) => (
                      <div key={`${index}-${item}`} style={{ borderRadius: '16px', background: 'rgba(127,29,29,0.24)', padding: '14px', color: '#fecaca', lineHeight: 1.7 }}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={panel}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Learner health</h2>
                <div style={{ display: 'grid', gap: '14px' }}>
                  {(analytics?.learnerHealth || []).map((item) => (
                    <div key={item.label} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>{item.label}</div>
                      <div style={{ marginTop: '8px', fontSize: '28px', fontWeight: 900 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={panel}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Topic demand</h2>
                <div style={{ display: 'grid', gap: '14px' }}>
                  {(analytics?.topicDemand || []).map((item) => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
                        <span style={{ color: '#e2e8f0', fontWeight: 700 }}>{item.label}</span>
                        <span style={{ color: '#94a3b8', fontSize: '13px' }}>{item.attempts} attempts</span>
                      </div>
                      <div style={{ height: '9px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                        <div style={{ width: `${Math.min(100, item.attempts * 8)}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #10b981, #38bdf8)' }} />
                      </div>
                      <div style={{ marginTop: '6px', display: 'flex', gap: '16px', color: '#94a3b8', fontSize: '12px' }}>
                        <span>{item.solvedRate}% solved rate</span>
                        <span>{item.averageScore}% avg score</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={panel}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Resource categories</h2>
                <div style={{ display: 'grid', gap: '14px' }}>
                  {(analytics?.categoryBreakdown || []).map((item) => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: '#cbd5e1' }}>{item.label}</span>
                        <span style={{ color: '#f8fafc' }}>{item.value}</span>
                      </div>
                      <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                        <div style={{ width: `${Math.min(100, item.value * 14)}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #8b5cf6, #ec4899)' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {!!analytics?.difficultyBreakdown?.length && (
                  <div style={{ marginTop: '18px', display: 'grid', gap: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Difficulty split</h3>
                    {(analytics?.difficultyBreakdown || []).map((item) => (
                      <div key={item.label} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{item.label}</span>
                          <span style={{ color: '#93c5fd' }}>{item.attempts} attempts</span>
                        </div>
                        <div style={{ marginTop: '4px', color: '#94a3b8', fontSize: '12px' }}>{item.solvedRate}% solved rate</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={panel}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Top contributors</h2>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {(analytics?.topContributors || []).map((contributor, index) => (
                    <div key={contributor.id} style={{ display: 'grid', gridTemplateColumns: '52px 1fr auto', gap: '14px', alignItems: 'center', borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                      <div style={{ height: '44px', width: '44px', borderRadius: '999px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{contributor.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 800 }}>{contributor.name}</div>
                        <div style={{ marginTop: '4px', color: '#94a3b8', fontSize: '13px' }}>{contributor.contributions} resources - {contributor.downloads} downloads</div>
                      </div>
                      <div style={{ color: index === 0 ? '#fcd34d' : '#cbd5e1', fontWeight: 900 }}>#{index + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={panel}>
              <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Recent platform activity</h2>
              <div style={{ display: 'grid', gap: '14px' }}>
                {(analytics?.recentPlatformActivity || []).map((item) => (
                  <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr auto auto auto', gap: '16px', alignItems: 'center', borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{item.title}</div>
                      <div style={{ marginTop: '4px', color: '#94a3b8', fontSize: '13px' }}>{item.creator}</div>
                    </div>
                    <div style={{ color: '#bfdbfe', fontWeight: 700, textTransform: 'capitalize' }}>{item.type}</div>
                    <div style={{ color: item.status === 'approved' ? '#6ee7b7' : item.status === 'pending' ? '#fcd34d' : '#cbd5e1', fontWeight: 800 }}>{item.status}</div>
                    <div style={{ color: '#94a3b8', fontSize: '13px' }}>{new Date(item.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
