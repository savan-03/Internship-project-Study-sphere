import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  todo: '#94a3b8',
};

const difficultyTone = {
  easy: '#6ee7b7',
  medium: '#fcd34d',
  hard: '#fda4af',
};

const badgeStyle = {
  padding: '7px 12px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#cbd5e1',
  fontSize: '12px',
  fontWeight: 700,
};

const editorInputStyle = {
  width: '100%',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.08)',
  background: '#0f172a',
  color: '#e2e8f0',
  boxSizing: 'border-box',
};

const selectStyle = {
  padding: '10px 12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: '#0f172a',
  color: '#e2e8f0',
};

const optionStyle = {
  background: '#0f172a',
  color: '#e2e8f0',
};

const DsaProblemWorkbench = () => {
  const { slug } = useParams();
  const { getProblemBySlug, runAttempt, saveAttempt } = useDsa();
  const [payload, setPayload] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [error, setError] = useState('');

  const resetEditorForLanguage = (nextLanguage, nextPayload = payload) => {
    if (!nextPayload?.problem) return;
    setCode(nextPayload.problem?.starterCode?.[nextLanguage] || nextPayload.problem?.starterCode?.javascript || '');
    setExecutionResult(null);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getProblemBySlug(slug);
        setPayload(data);
        const nextLanguage = data.problem?.lastAttempt?.language || 'javascript';
        setLanguage(nextLanguage);
        setCode(data.attempts?.[0]?.code || data.problem?.starterCode?.[nextLanguage] || data.problem?.starterCode?.javascript || '');
        setNotes(data.attempts?.[0]?.notes || '');
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load this problem.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [getProblemBySlug, slug]);

  const refreshPayload = async () => {
    const refreshed = await getProblemBySlug(slug);
    setPayload(refreshed);
    return refreshed;
  };

  const handleRun = async () => {
    if (!payload?.problem?.id) return;
    setExecuting(true);
    setError('');
    try {
      const execution = await runAttempt(payload.problem.id, { language, code });
      setExecutionResult(execution);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to run this code right now.');
    } finally {
      setExecuting(false);
    }
  };

  const handleSubmit = async () => {
    if (!payload?.problem?.id) return;
    setSaving(true);
    setError('');
    try {
      const attempt = await saveAttempt(payload.problem.id, { language, code, notes });
      setResult(attempt);
      await refreshPayload();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save this attempt.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', paddingTop: '110px', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', display: 'flex', justifyContent: 'center' }}>Loading problem...</div>;
  }

  if (!payload?.problem) {
    return <div style={{ minHeight: '100vh', paddingTop: '110px', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', display: 'flex', justifyContent: 'center' }}>{error || 'Problem not found.'}</div>;
  }

  const { problem, attempts, relatedProblems = [], guidance } = payload;
  const latestAttempt = result || attempts?.[0] || problem.lastAttempt;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', paddingTop: '96px', paddingBottom: '48px' }}>
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'inline-flex', borderRadius: '999px', background: 'rgba(15,23,42,0.26)', padding: '7px 12px', fontSize: '12px', letterSpacing: '0.16em', fontWeight: 800, textTransform: 'uppercase', color: '#dbeafe' }}>
                  {problem.category}
                </div>
                <h1 style={{ margin: '14px 0 0', fontSize: '32px', fontWeight: 900 }}>{problem.title}</h1>
                <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '14px' }}>
                  {problem.topic} | {(problem.patterns || []).join(', ') || 'Core pattern practice'}
                </div>
              </div>
              <div style={{ color: difficultyTone[problem.difficulty] || '#f8fafc', fontWeight: 900, textTransform: 'capitalize' }}>{problem.difficulty}</div>
            </div>

            <p style={{ marginTop: '18px', color: '#cbd5e1', lineHeight: 1.8 }}>{problem.statement}</p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
              {(problem.tags || []).map((tag) => (
                <span key={tag} style={{ ...badgeStyle, background: 'rgba(139,92,246,0.16)', border: '1px solid rgba(139,92,246,0.28)', color: '#c4b5fd' }}>#{tag}</span>
              ))}
              {(problem.companyTags || []).map((company) => (
                <span key={company} style={{ ...badgeStyle, color: '#fde68a', border: '1px solid rgba(250,204,21,0.18)' }}>{company}</span>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '18px' }}>
              <div style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '12px' }}>
                <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Acceptance</div>
                <div style={{ marginTop: '8px', fontWeight: 800 }}>{problem.acceptanceRate}%</div>
              </div>
              <div style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '12px' }}>
                <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Estimate</div>
                <div style={{ marginTop: '8px', fontWeight: 800 }}>{problem.estimatedMinutes || 20} min</div>
              </div>
              <div style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '12px' }}>
                <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Time</div>
                <div style={{ marginTop: '8px', fontWeight: 800 }}>{problem.complexity?.time || 'TBD'}</div>
              </div>
              <div style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '12px' }}>
                <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Space</div>
                <div style={{ marginTop: '8px', fontWeight: 800 }}>{problem.complexity?.space || 'TBD'}</div>
              </div>
            </div>
          </div>

          <div style={panel}>
            <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 900 }}>Examples</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {(problem.examples || []).map((example, index) => (
                <div key={`${example.input}-${index}`} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                  <div style={{ fontWeight: 800, marginBottom: '10px' }}>Example {index + 1}</div>
                  <div style={{ color: '#cbd5e1', marginBottom: '8px' }}><strong>Input:</strong> {example.input}</div>
                  <div style={{ color: '#cbd5e1', marginBottom: '8px' }}><strong>Output:</strong> {example.output}</div>
                  {example.explanation ? <div style={{ color: '#94a3b8' }}>{example.explanation}</div> : null}
                </div>
              ))}
            </div>
          </div>

          {guidance ? (
            <div style={panel}>
              <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 900 }}>Practice focus</h2>
              <div style={{ color: '#cbd5e1', lineHeight: 1.8 }}>{guidance.note}</div>
              <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
                {(guidance.checklist || []).map((item) => (
                  <div key={item} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px', color: '#cbd5e1', lineHeight: 1.7 }}>
                    {item}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
                {(guidance.focusAreas || []).map((item) => (
                  <span key={item} style={{ ...badgeStyle, background: 'rgba(59,130,246,0.14)', border: '1px solid rgba(96,165,250,0.22)', color: '#bfdbfe' }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div style={panel}>
            <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 900 }}>Constraints and hints</h2>
            <div style={{ display: 'grid', gap: '18px' }}>
              <div>
                <div style={{ fontWeight: 800, marginBottom: '10px' }}>Constraints</div>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', lineHeight: 1.8 }}>
                  {(problem.constraints || []).map((constraint) => <li key={constraint}>{constraint}</li>)}
                </ul>
              </div>
              <div>
                <div style={{ fontWeight: 800, marginBottom: '10px' }}>Hints</div>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', lineHeight: 1.8 }}>
                  {(problem.hints || []).map((hint) => <li key={hint}>{hint}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <div style={panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900 }}>Editorial</h2>
              <div style={{ color: '#93c5fd', fontSize: '13px' }}>{problem.editorialSections?.length ? `${problem.editorialSections.length} sections ready` : 'Placeholder ready'}</div>
            </div>
            {problem.editorialSections?.length ? (
              <div style={{ display: 'grid', gap: '14px' }}>
                {problem.editorialSections.map((section) => (
                  <div key={section.heading} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                    <div style={{ fontWeight: 800 }}>{section.heading}</div>
                    <div style={{ marginTop: '8px', color: '#cbd5e1', lineHeight: 1.8 }}>{section.body}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#cbd5e1', lineHeight: 1.8 }}>{problem.editorial || 'Editorial will be expanded in the next pass.'}</div>
            )}
            <div style={{ marginTop: '18px', borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
              <div style={{ fontWeight: 800 }}>Video walkthrough</div>
              <div style={{ marginTop: '8px', color: '#cbd5e1', lineHeight: 1.7 }}>
                {problem.videoResource?.summary || 'Video explanation placeholder added so the DSA module has a clean extension point for future walkthrough content.'}
              </div>
              <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '13px' }}>
                {problem.videoResource?.title || 'Editorial walkthrough'} | {problem.videoResource?.provider || 'Internal placeholder'} | {problem.videoResource?.status || 'coming soon'}
              </div>
            </div>
          </div>

          <div style={panel}>
            <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 900 }}>Related problems</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {relatedProblems.map((related) => (
                <Link key={related.id} to={`/dsa/practice/${related.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                    <div style={{ fontWeight: 700 }}>{related.title}</div>
                    <div style={{ marginTop: '6px', color: '#94a3b8', fontSize: '13px' }}>
                      {related.topic} | {related.difficulty}
                    </div>
                  </div>
                </Link>
              ))}
              {!relatedProblems.length ? <div style={{ color: '#94a3b8' }}>Related practice suggestions will appear as more problems are added.</div> : null}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900 }}>Code editor</h2>
              <select
                value={language}
                onChange={(event) => {
                  setLanguage(event.target.value);
                  resetEditorForLanguage(event.target.value);
                }}
                style={selectStyle}
              >
                {(problem.supportedLanguages?.length ? problem.supportedLanguages : ['javascript']).map((item) => (
                  <option key={item} value={item} style={optionStyle}>{item === 'cpp' ? 'C++' : item.charAt(0).toUpperCase() + item.slice(1)}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              <div style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '12px' }}>
                <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Latest status</div>
                <div style={{ marginTop: '8px', fontWeight: 800, color: statusTone[latestAttempt?.status || problem.status] || '#f8fafc', textTransform: 'capitalize' }}>
                  {latestAttempt?.status || problem.status || 'todo'}
                </div>
              </div>
              <div style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '12px' }}>
                <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Latest score</div>
                <div style={{ marginTop: '8px', fontWeight: 800 }}>{latestAttempt?.scorePercent ?? problem.lastAttempt?.scorePercent ?? 0}%</div>
              </div>
              <div style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '12px' }}>
                <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Runner</div>
                <div style={{ marginTop: '8px', fontWeight: 800 }}>{language === 'javascript' ? 'Live public + hidden tests' : 'Draft save mode'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ color: '#93c5fd', fontSize: '13px', lineHeight: 1.6 }}>
                JavaScript runs in the local evaluator. Other languages still preserve starter code and attempt history so the workflow stays consistent.
              </div>
              <button
                onClick={() => resetEditorForLanguage(language)}
                style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontWeight: 700, cursor: 'pointer' }}
              >
                Reset Starter
              </button>
            </div>

            <textarea value={code} onChange={(event) => setCode(event.target.value)} style={{ ...editorInputStyle, minHeight: '340px', padding: '16px', background: '#020617', fontFamily: 'Consolas, monospace', fontSize: '14px', resize: 'vertical' }} />
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional notes about your approach..." style={{ ...editorInputStyle, minHeight: '96px', marginTop: '14px', padding: '14px', resize: 'vertical' }} />

            {error ? <div style={{ marginTop: '12px', color: '#fecaca' }}>{error}</div> : null}
            {result ? (
              <div style={{ marginTop: '12px', color: result.status === 'solved' ? '#6ee7b7' : '#7dd3fc', fontWeight: 700 }}>
                Latest saved result: {result.status} | {result.scorePercent || 0}% {result.runtime ? `| ${result.runtime}` : ''} {result.memory ? `| ${result.memory}` : ''}
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button onClick={handleRun} disabled={executing} style={{ border: '1px solid rgba(96,165,250,0.24)', borderRadius: '14px', background: 'rgba(59,130,246,0.14)', color: '#bfdbfe', padding: '13px 16px', fontWeight: 800, cursor: 'pointer', opacity: executing ? 0.75 : 1 }}>
                {executing ? 'Running tests...' : 'Run Tests'}
              </button>
              <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, border: 'none', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', padding: '13px 16px', fontWeight: 800, cursor: 'pointer', opacity: saving ? 0.75 : 1 }}>
                {saving ? 'Saving attempt...' : 'Run / Save Attempt'}
              </button>
            </div>

            {executionResult ? (
              <div style={{ marginTop: '18px', borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                <div style={{ fontWeight: 800, marginBottom: '10px' }}>{executionResult.executionHeadline || `Test results: ${executionResult.passedCount || 0}/${executionResult.totalTests || 0}`}</div>
                {!executionResult.supported ? (
                  <div style={{ color: '#fcd34d' }}>{executionResult.message}</div>
                ) : (
                  <div style={{ display: 'grid', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                      <div style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', padding: '12px' }}>
                        <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Public</div>
                        <div style={{ marginTop: '8px', fontWeight: 800 }}>{executionResult.publicPassedCount || 0}/{executionResult.publicTotalTests || 0}</div>
                      </div>
                      <div style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', padding: '12px' }}>
                        <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Hidden</div>
                        <div style={{ marginTop: '8px', fontWeight: 800 }}>{executionResult.hiddenPassedCount || 0}/{executionResult.hiddenTotalTests || 0}</div>
                      </div>
                      <div style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', padding: '12px' }}>
                        <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>All tests</div>
                        <div style={{ marginTop: '8px', fontWeight: 800 }}>{executionResult.passedCount || 0}/{executionResult.totalTests || 0}</div>
                      </div>
                      <div style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', padding: '12px' }}>
                        <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Score</div>
                        <div style={{ marginTop: '8px', fontWeight: 800 }}>{executionResult.scorePercent || 0}%</div>
                      </div>
                    </div>
                    <div style={{ borderRadius: '14px', background: executionResult.allPassed ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.12)', padding: '12px', border: `1px solid ${executionResult.allPassed ? 'rgba(74,222,128,0.2)' : 'rgba(96,165,250,0.22)'}` }}>
                      <div style={{ fontWeight: 800, color: '#f8fafc' }}>
                        {executionResult.allPassed ? 'All checks passed. Ready to save this solution.' : 'Runner completed. Review the failing cases and iterate.'}
                      </div>
                      <div style={{ marginTop: '6px', color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6 }}>
                        Supported live languages: {(executionResult.supportedLanguages || []).join(', ') || 'javascript'}
                      </div>
                    </div>
                    {executionResult.insight ? (
                      <div style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                        <div style={{ fontWeight: 800, color: '#93c5fd' }}>{executionResult.insight.headline}</div>
                        <div style={{ marginTop: '8px', color: '#cbd5e1', lineHeight: 1.7 }}>{executionResult.insight.nextStep}</div>
                        {(executionResult.insight.failingHighlights || []).map((item) => (
                          <div key={item.index} style={{ marginTop: '12px', borderRadius: '12px', background: 'rgba(2,6,23,0.45)', padding: '12px', color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6 }}>
                            <div style={{ fontWeight: 700, color: '#f8fafc' }}>Public test {item.index}</div>
                            {item.error ? <div style={{ marginTop: '6px', color: '#fecaca' }}>{item.error}</div> : (
                              <div style={{ marginTop: '6px' }}>
                                Expected: {JSON.stringify(item.expectedOutput)}
                                <br />
                                Actual: {JSON.stringify(item.actualOutput)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {(executionResult.results || []).map((item) => (
                      <div key={`${item.visibility}-${item.index}`} style={{ borderRadius: '14px', padding: '12px', background: item.passed ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${item.passed ? 'rgba(74,222,128,0.22)' : 'rgba(248,113,113,0.22)'}` }}>
                        <div style={{ fontWeight: 700 }}>Public test {item.index}: {item.passed ? 'Passed' : 'Failed'}</div>
                        {item.error ? <div style={{ marginTop: '6px', color: '#fecaca' }}>{item.error}</div> : null}
                        {!item.error ? (
                          <div style={{ marginTop: '6px', color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6 }}>
                            Expected: {JSON.stringify(item.expectedOutput)}
                            <br />
                            Actual: {JSON.stringify(item.actualOutput)}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div style={panel}>
            <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 900 }}>Attempt history</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {(attempts || []).map((attempt) => (
                <div key={attempt.id} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{attempt.language}</div>
                    <div style={{ color: statusTone[attempt.status] || '#94a3b8', fontWeight: 700, textTransform: 'capitalize' }}>{attempt.status}</div>
                  </div>
                  <div style={{ marginTop: '6px', color: '#94a3b8', fontSize: '13px' }}>{new Date(attempt.updatedAt).toLocaleString('en-IN')}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginTop: '12px' }}>
                    <div style={{ borderRadius: '14px', background: 'rgba(2,6,23,0.45)', padding: '10px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Score</div>
                      <div style={{ marginTop: '6px', fontWeight: 800 }}>{attempt.scorePercent || 0}%</div>
                    </div>
                    <div style={{ borderRadius: '14px', background: 'rgba(2,6,23,0.45)', padding: '10px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Public tests</div>
                      <div style={{ marginTop: '6px', fontWeight: 800 }}>{attempt.publicPassedCount || 0}/{attempt.publicTotalTests || 0}</div>
                    </div>
                    <div style={{ borderRadius: '14px', background: 'rgba(2,6,23,0.45)', padding: '10px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>All tests</div>
                      <div style={{ marginTop: '6px', fontWeight: 800 }}>{attempt.passedCount || 0}/{attempt.totalTests || 0}</div>
                    </div>
                  </div>
                  {(attempt.runtime || attempt.memory) ? (
                    <div style={{ marginTop: '10px', color: '#cbd5e1', fontSize: '13px' }}>
                      {attempt.runtime ? `Runtime: ${attempt.runtime}` : ''} {attempt.memory ? `| Memory: ${attempt.memory}` : ''}
                    </div>
                  ) : null}
                  {attempt.notes ? <div style={{ marginTop: '10px', color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6 }}>Notes: {attempt.notes}</div> : null}
                </div>
              ))}
              {!attempts?.length ? <div style={{ color: '#94a3b8' }}>No attempts yet for this problem.</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DsaProblemWorkbench;
