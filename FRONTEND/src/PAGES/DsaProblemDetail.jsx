import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDsa } from '../components/context/DsaContext';

const panel = {
  borderRadius: '24px',
  background: 'rgba(15,23,42,0.48)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '24px',
  boxShadow: '0 20px 40px -32px rgba(0,0,0,0.45)',
  backdropFilter: 'blur(16px)',
};

const DsaProblemDetail = () => {
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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getProblemBySlug(slug);
        setPayload(data);
        const nextLanguage = data.problem?.lastAttempt?.language || 'javascript';
        setLanguage(nextLanguage);
        setCode(
          data.attempts?.[0]?.code ||
            data.problem?.starterCode?.[nextLanguage] ||
            data.problem?.starterCode?.javascript ||
            ''
        );
        setNotes(data.attempts?.[0]?.notes || '');
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load this problem.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [getProblemBySlug, slug]);

  useEffect(() => {
    if (payload?.problem?.starterCode?.[language] && !payload?.attempts?.[0]?.code) {
      setCode(payload.problem.starterCode[language]);
    }
  }, [language, payload]);

  const handleSubmit = async () => {
    if (!payload?.problem?.id) return;
    setSaving(true);
    setError('');
    try {
      const attempt = await saveAttempt(payload.problem.id, { language, code, notes });
      setResult(attempt);
      const refreshed = await getProblemBySlug(slug);
      setPayload(refreshed);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save this attempt.');
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return <div style={{ minHeight: '100vh', paddingTop: '110px', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', display: 'flex', justifyContent: 'center' }}>Loading problem...</div>;
  }

  if (!payload?.problem) {
    return <div style={{ minHeight: '100vh', paddingTop: '110px', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', display: 'flex', justifyContent: 'center' }}>{error || 'Problem not found.'}</div>;
  }

  const { problem, attempts } = payload;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', paddingTop: '96px', paddingBottom: '48px' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 16px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '24px' }}>
        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'inline-flex', borderRadius: '999px', background: 'rgba(15,23,42,0.26)', padding: '7px 12px', fontSize: '12px', letterSpacing: '0.16em', fontWeight: 800, textTransform: 'uppercase', color: '#dbeafe' }}>
                  {problem.category}
                </div>
                <h1 style={{ margin: '14px 0 0', fontSize: '32px', fontWeight: 900 }}>{problem.title}</h1>
              </div>
              <div style={{ color: problem.difficulty === 'easy' ? '#6ee7b7' : problem.difficulty === 'medium' ? '#fcd34d' : '#fda4af', fontWeight: 900, textTransform: 'capitalize' }}>{problem.difficulty}</div>
            </div>
            <p style={{ marginTop: '18px', color: '#cbd5e1', lineHeight: 1.8 }}>{problem.statement}</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
              {(problem.tags || []).map((tag) => (
                <span key={tag} style={{ padding: '8px 12px', borderRadius: '999px', background: 'rgba(139,92,246,0.16)', border: '1px solid rgba(139,92,246,0.28)', color: '#c4b5fd', fontSize: '13px' }}>#{tag}</span>
              ))}
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
              <div>
                <div style={{ fontWeight: 800, marginBottom: '10px' }}>Editorial</div>
                <div style={{ color: '#cbd5e1', lineHeight: 1.8 }}>{problem.editorial || 'Editorial will be expanded in the next pass.'}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900 }}>Code editor</h2>
              <select value={language} onChange={(event) => setLanguage(event.target.value)} style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff' }}>
                <option value='javascript'>JavaScript</option>
                <option value='python'>Python</option>
                <option value='java'>Java</option>
                <option value='cpp'>C++</option>
              </select>
            </div>
            <textarea value={code} onChange={(event) => setCode(event.target.value)} style={{ width: '100%', minHeight: '320px', padding: '16px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(2,6,23,0.75)', color: '#e2e8f0', fontFamily: 'Consolas, monospace', fontSize: '14px', resize: 'vertical' }} />
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder='Optional notes about your approach...' style={{ width: '100%', minHeight: '90px', marginTop: '14px', padding: '14px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', resize: 'vertical' }} />
            {error ? <div style={{ marginTop: '12px', color: '#fecaca' }}>{error}</div> : null}
            {result ? <div style={{ marginTop: '12px', color: result.status === 'solved' ? '#6ee7b7' : '#7dd3fc', fontWeight: 700 }}>Latest result: {result.status}{result.runtime ? ` • ${result.runtime}` : ''}{result.memory ? ` • ${result.memory}` : ''}</div> : null}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, border: 'none', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', padding: '13px 16px', fontWeight: 800, cursor: 'pointer', opacity: saving ? 0.75 : 1 }}>
                {saving ? 'Saving attempt...' : 'Run / Save Attempt'}
              </button>
            </div>
          </div>

          <div style={panel}>
            <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 900 }}>Attempt history</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {(attempts || []).map((attempt) => (
                <div key={attempt.id} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{attempt.language}</div>
                    <div style={{ color: attempt.status === 'solved' ? '#6ee7b7' : attempt.status === 'attempted' ? '#7dd3fc' : '#94a3b8', fontWeight: 700, textTransform: 'capitalize' }}>{attempt.status}</div>
                  </div>
                  <div style={{ marginTop: '6px', color: '#94a3b8', fontSize: '13px' }}>{new Date(attempt.updatedAt).toLocaleString('en-IN')}</div>
                  {attempt.runtime || attempt.memory ? (
                    <div style={{ marginTop: '8px', color: '#cbd5e1', fontSize: '13px' }}>
                      {attempt.runtime ? `Runtime: ${attempt.runtime}` : ''} {attempt.memory ? `• Memory: ${attempt.memory}` : ''}
                    </div>
                  ) : null}
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

export default DsaProblemDetail;
