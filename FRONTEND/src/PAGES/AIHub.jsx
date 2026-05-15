import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAiPersonalization, fetchAiSummary } from '../components/context/AI.service';
import { useAuth } from '../components/context/AuthContext';

const panel = {
  borderRadius: '24px',
  background: 'rgba(15,23,42,0.48)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '24px',
  boxShadow: '0 20px 40px -32px rgba(0,0,0,0.45)',
  backdropFilter: 'blur(16px)',
};

const emptyPersonalization = {
  weakTopics: [],
  strongTopics: [],
  overview: {},
  roadmap: [],
  nextActions: [],
  weeklyPlan: [],
  recommendedProblems: [],
  recommendedResources: [],
  suggestedQuizTopic: 'Algorithms',
  suggestedInterviewRole: 'Software Engineer',
  history: { totals: {} },
};

const AiHub = () => {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [summary, setSummary] = useState({
    sessions: [],
    suggestions: [],
    resources: [],
    featuredTopics: [],
    highlights: {},
  });
  const [personalization, setPersonalization] = useState(emptyPersonalization);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || err.message || 'Unable to load your AI workspace right now.');
          setSummary({
            sessions: [],
            suggestions: [],
            resources: [],
            featuredTopics: [],
            highlights: {},
          });
          setPersonalization(emptyPersonalization);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [authLoading, isAuthenticated]);

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '96px' }}>
        Restoring your AI workspace...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', paddingTop: '96px', paddingBottom: '48px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ ...panel, marginBottom: '24px', background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(139,92,246,0.22), rgba(236,72,153,0.18))' }}>
          <div style={{ display: 'inline-flex', borderRadius: '999px', background: 'rgba(15,23,42,0.26)', padding: '7px 12px', fontSize: '12px', letterSpacing: '0.16em', fontWeight: 800, textTransform: 'uppercase', color: '#dbeafe' }}>
            AI Workspace
          </div>
          <h1 style={{ margin: '14px 0 0', fontSize: '34px', fontWeight: 900 }}>Personalized quiz, roadmap, and mock interview support</h1>
          <p style={{ margin: '10px 0 0', color: '#dbeafe' }}>This workspace uses your StudySphere profile, DSA attempts, and resource activity to suggest what to study next and why.</p>
          {error ? <div style={{ marginTop: '12px', color: '#fecaca' }}>{error}</div> : null}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
            <Link to="/ai/quiz" style={{ padding: '12px 18px', borderRadius: '14px', background: '#ffffff', color: '#312e81', textDecoration: 'none', fontWeight: 800 }}>Personalized Quiz</Link>
            <Link to="/ai/assistant" style={{ padding: '12px 18px', borderRadius: '14px', background: 'rgba(255,255,255,0.08)', color: '#f8fafc', textDecoration: 'none', fontWeight: 800, border: '1px solid rgba(255,255,255,0.12)' }}>Open Assistant</Link>
            <Link to="/ai/interview" style={{ padding: '12px 18px', borderRadius: '14px', background: 'rgba(255,255,255,0.08)', color: '#f8fafc', textDecoration: 'none', fontWeight: 800, border: '1px solid rgba(255,255,255,0.12)' }}>Interview Coach</Link>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '18px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '24px' }}>
          {[
            ['Readiness score', `${personalization.overview?.readinessScore || 0}%`, '#c4b5fd'],
            ['Current solve rate', `${personalization.overview?.overallSolveRate || 0}%`, '#fca5a5'],
            ['Recent practice signals', personalization.overview?.recentPracticeCount || 0, '#93c5fd'],
            ['Momentum', personalization.overview?.momentumLabel || 'Low', '#86efac'],
          ].map(([label, value, color]) => (
            <div key={label} style={panel}>
              <div style={{ color: '#94a3b8', fontSize: '13px' }}>{label}</div>
              <div style={{ marginTop: '8px', fontSize: '36px', fontWeight: 900, color }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px' }}>
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={panel}>
              <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 900 }}>Study roadmap</h2>
              {loading ? <div style={{ color: '#cbd5e1' }}>Loading roadmap...</div> : (
                <div style={{ display: 'grid', gap: '14px' }}>
                  {(personalization.roadmap || []).map((stage, index) => (
                    <div key={`${stage.title}-${index}`} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '18px' }}>
                      <div style={{ fontSize: '12px', color: '#93c5fd', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Stage {index + 1}</div>
                      <div style={{ marginTop: '8px', fontSize: '20px', fontWeight: 900 }}>{stage.title}</div>
                      <div style={{ marginTop: '6px', color: '#cbd5e1' }}>Focus: {stage.focus}</div>
                      <div style={{ marginTop: '8px', color: '#a5b4fc', fontSize: '14px', lineHeight: 1.6 }}>{stage.reason}</div>
                      <div style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
                        {(stage.actionItems || []).map((item) => (
                          <div key={item} style={{ color: '#dbeafe', lineHeight: 1.6 }}>- {item}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {!personalization.roadmap?.length ? <div style={{ color: '#94a3b8' }}>No roadmap yet. Try generating a quiz to create your first AI signal.</div> : null}
                </div>
              )}
            </div>

            <div style={panel}>
              <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 900 }}>Next best actions</h2>
              {loading ? <div style={{ color: '#cbd5e1' }}>Loading actions...</div> : (
                <div style={{ display: 'grid', gap: '14px' }}>
                  {(personalization.nextActions || []).map((action) => (
                    <div key={action.id} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'start' }}>
                        <div>
                          <div style={{ fontWeight: 900, fontSize: '18px' }}>{action.title}</div>
                          <div style={{ marginTop: '6px', color: '#cbd5e1', lineHeight: 1.6 }}>{action.description}</div>
                          <div style={{ marginTop: '8px', color: '#93c5fd', fontSize: '14px', lineHeight: 1.6 }}>{action.reason}</div>
                        </div>
                        <span style={{ padding: '8px 10px', borderRadius: '999px', background: action.priority === 'high' ? 'rgba(239,68,68,0.16)' : 'rgba(59,130,246,0.14)', color: action.priority === 'high' ? '#fecaca' : '#bfdbfe', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                          {action.priority}
                        </span>
                      </div>
                      <Link to={action.route} style={{ display: 'inline-flex', marginTop: '14px', padding: '10px 14px', borderRadius: '12px', background: 'rgba(59,130,246,0.14)', color: '#bfdbfe', textDecoration: 'none', fontWeight: 800 }}>
                        {action.ctaLabel}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={panel}>
              <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 900 }}>Recent AI sessions</h2>
              {loading ? <div style={{ color: '#cbd5e1' }}>Loading AI sessions...</div> : (
                <div style={{ display: 'grid', gap: '14px' }}>
                  {(summary.sessions || []).slice(0, 6).map((session) => (
                    <div key={session.id} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                      <div style={{ fontWeight: 800 }}>{session.title}</div>
                      <div style={{ marginTop: '6px', color: '#94a3b8', textTransform: 'capitalize' }}>{session.type} | {session.status}</div>
                      <div style={{ marginTop: '8px', color: '#cbd5e1', fontSize: '14px' }}>Score: {session.score || 0}</div>
                    </div>
                  ))}
                  {!summary.sessions?.length ? <div style={{ color: '#94a3b8' }}>No AI sessions yet. Start with a quiz or interview.</div> : null}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={panel}>
              <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 900 }}>Personalized signals</h2>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Weak topics</div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {(personalization.weakTopics || []).map((topic) => (
                      <span key={topic.label} style={{ padding: '8px 12px', borderRadius: '999px', background: 'rgba(239,68,68,0.14)', border: '1px solid rgba(248,113,113,0.22)', color: '#fecaca', fontSize: '13px' }}>
                        {topic.label} ({topic.solveRate}%)
                      </span>
                    ))}
                    {!personalization.weakTopics?.length ? <span style={{ color: '#94a3b8' }}>No weak areas detected yet.</span> : null}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Strong topics</div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {(personalization.strongTopics || []).map((topic) => (
                      <span key={topic.label} style={{ padding: '8px 12px', borderRadius: '999px', background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(74,222,128,0.22)', color: '#bbf7d0', fontSize: '13px' }}>
                        {topic.label} ({topic.solveRate}%)
                      </span>
                    ))}
                    {!personalization.strongTopics?.length ? <span style={{ color: '#94a3b8' }}>Strong topics will appear after a few solved problems.</span> : null}
                  </div>
                </div>
                <div style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Current AI focus</div>
                  <div style={{ marginTop: '10px', color: '#f8fafc', lineHeight: 1.7 }}>
                    Quiz focus: <strong>{personalization.suggestedQuizTopic}</strong><br />
                    Interview focus: <strong>{personalization.suggestedInterviewRole}</strong><br />
                    Profile completion score: <strong>{personalization.overview?.profileCompletionScore || 0}%</strong>
                  </div>
                </div>
              </div>
            </div>

            <div style={panel}>
              <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 900 }}>4-day AI plan</h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                {(personalization.weeklyPlan || []).map((step) => (
                  <div key={step.id} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                    <div style={{ color: '#93c5fd', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{step.label}</div>
                    <div style={{ marginTop: '6px', fontWeight: 900 }}>{step.title}</div>
                    <div style={{ marginTop: '6px', color: '#cbd5e1', lineHeight: 1.6 }}>{step.action}</div>
                    <div style={{ marginTop: '8px', color: '#a5b4fc', fontSize: '14px', lineHeight: 1.6 }}>{step.reason}</div>
                    <Link to={step.route} style={{ display: 'inline-flex', marginTop: '12px', color: '#bfdbfe', textDecoration: 'none', fontWeight: 800 }}>
                      {step.ctaLabel}
                    </Link>
                  </div>
                ))}
                {!personalization.weeklyPlan?.length ? <div style={{ color: '#94a3b8' }}>Your short AI plan will appear after the first personalization snapshot loads.</div> : null}
              </div>
            </div>

            <div style={panel}>
              <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 900 }}>Recommended problems</h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                {(personalization.recommendedProblems || []).map((problem) => (
                  <div key={problem.id} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                    <div style={{ fontWeight: 800 }}>{problem.title}</div>
                    <div style={{ marginTop: '6px', color: '#94a3b8', fontSize: '13px' }}>{problem.topic} | {problem.difficulty} | {problem.estimatedMinutes} mins</div>
                    <div style={{ marginTop: '8px', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>{problem.reason}</div>
                  </div>
                ))}
                {!personalization.recommendedProblems?.length ? <div style={{ color: '#94a3b8' }}>Recommended problems will appear once you have DSA activity.</div> : null}
              </div>
            </div>

            <div style={panel}>
              <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 900 }}>Recommended resources</h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                {(personalization.recommendedResources || []).map((resource) => (
                  <div key={resource.id} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                    <div style={{ fontWeight: 800 }}>{resource.title}</div>
                    <div style={{ marginTop: '6px', color: '#94a3b8', fontSize: '13px' }}>{resource.category} | Rating {Number(resource.rating || 0).toFixed(1)} | {resource.downloads} downloads</div>
                    <div style={{ marginTop: '8px', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>{resource.reason}</div>
                  </div>
                ))}
                {!personalization.recommendedResources?.length ? <div style={{ color: '#94a3b8' }}>Recommended resources will appear once your AI profile has enough study signals.</div> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiHub;
