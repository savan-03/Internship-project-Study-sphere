import React from 'react';
import { Link } from 'react-router-dom';
import { useDsa } from '../components/context/DsaContext';

const panel = {
  borderRadius: '24px',
  background: 'rgba(15,23,42,0.48)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '24px',
  boxShadow: '0 20px 40px -32px rgba(0,0,0,0.45)',
  backdropFilter: 'blur(16px)',
};

const statusTone = {
  solved: '#6ee7b7',
  attempted: '#7dd3fc',
  draft: '#c4b5fd',
};

const summaryCards = (attemptsSummary, attempts) => [
  { label: 'Total Attempts', value: attemptsSummary?.total ?? attempts.length, tone: '#f8fafc' },
  { label: 'Solved', value: attemptsSummary?.solved ?? 0, tone: '#6ee7b7' },
  { label: 'Attempted', value: attemptsSummary?.attempted ?? 0, tone: '#7dd3fc' },
  { label: 'Drafts', value: attemptsSummary?.drafts ?? 0, tone: '#c4b5fd' },
];

const DsaAttempts = () => {
  const { attempts, attemptsSummary } = useDsa();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', paddingTop: '96px', paddingBottom: '48px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ marginBottom: '24px', borderRadius: '30px', background: 'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(139,92,246,0.22) 48%, rgba(236,72,153,0.18) 100%)', border: '1px solid rgba(147,197,253,0.18)', padding: '30px', boxShadow: '0 30px 80px -40px rgba(0,0,0,0.45)' }}>
          <h1 style={{ margin: 0, fontSize: '34px', fontWeight: 900 }}>My DSA attempts</h1>
          <p style={{ margin: '10px 0 0', color: '#dbeafe', maxWidth: '760px', lineHeight: 1.7 }}>
            Review your recent runs, revisit problem notes, and keep an eye on scores, topics, and passing progress over time.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px', marginBottom: '24px' }}>
          {summaryCards(attemptsSummary, attempts).map((item) => (
            <div key={item.label} style={panel}>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>{item.label}</div>
              <div style={{ marginTop: '10px', fontSize: '30px', fontWeight: 900, color: item.tone }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gap: '14px' }}>
          {attempts.map((attempt) => (
            <Link key={attempt.id} to={`/dsa/practice/${attempt.problem?.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ ...panel, display: 'grid', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '18px' }}>{attempt.problem?.title}</div>
                    <div style={{ marginTop: '6px', color: '#94a3b8', fontSize: '13px' }}>
                      {attempt.problem?.topic || attempt.problem?.category} | {attempt.language} | {new Date(attempt.updatedAt).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ color: statusTone[attempt.status] || '#94a3b8', textTransform: 'capitalize', fontWeight: 800 }}>{attempt.status}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                  <div style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '12px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Score</div>
                    <div style={{ marginTop: '8px', fontWeight: 800 }}>{attempt.scorePercent || 0}%</div>
                  </div>
                  <div style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '12px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Public Tests</div>
                    <div style={{ marginTop: '8px', fontWeight: 800 }}>{attempt.publicPassedCount || 0}/{attempt.publicTotalTests || 0}</div>
                  </div>
                  <div style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '12px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>All Tests</div>
                    <div style={{ marginTop: '8px', fontWeight: 800 }}>{attempt.passedCount || 0}/{attempt.totalTests || 0}</div>
                  </div>
                  <div style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '12px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Performance</div>
                    <div style={{ marginTop: '8px', fontWeight: 800 }}>{attempt.runtime || 'Draft'}</div>
                  </div>
                </div>

                {!!attempt.problem?.companyTags?.length && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {attempt.problem.companyTags.map((company) => (
                      <span key={company} style={{ padding: '7px 12px', borderRadius: '999px', background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.18)', color: '#fde68a', fontSize: '12px', fontWeight: 700 }}>
                        {company}
                      </span>
                    ))}
                  </div>
                )}

                {attempt.notes ? (
                  <div style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px', color: '#cbd5e1', lineHeight: 1.7 }}>
                    {attempt.notes}
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
          {!attempts.length ? <div style={{ color: '#94a3b8' }}>No attempts yet. Start with the practice list.</div> : null}
        </div>
      </div>
    </div>
  );
};

export default DsaAttempts;
