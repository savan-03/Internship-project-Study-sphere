import React, { useState } from 'react';
import { respondInterviewSession, startInterviewSession } from '../components/context/AI.service';

const AIInterview = () => {
  const [role, setRole] = useState('Software Engineer');
  const [focus, setFocus] = useState('DSA,System Design');
  const [session, setSession] = useState(null);
  const [answer, setAnswer] = useState('');

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 55%, #1e1b4b 100%)', color: '#f8fafc', paddingTop: '96px', paddingBottom: '48px' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 16px', display: 'grid', gap: '24px' }}>
        <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
          <h1 style={{ marginTop: 0, fontSize: '32px', fontWeight: 900 }}>Interview Simulator</h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px' }}>
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" style={{ padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff' }} />
            <input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="Focus areas" style={{ padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff' }} />
            <button onClick={async () => setSession((await startInterviewSession({ role, focusAreas: focus.split(',').map((item) => item.trim()).filter(Boolean) })).session)} style={{ border: 'none', borderRadius: '14px', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', color: '#fff', padding: '12px 18px', fontWeight: 800, cursor: 'pointer' }}>Start</button>
          </div>
        </div>
        <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
          <h2 style={{ marginTop: 0, fontSize: '24px', fontWeight: 900 }}>Interview Flow</h2>
          <div style={{ display: 'grid', gap: '12px', marginBottom: '18px' }}>
            {(session?.messages || []).map((entry, index) => (
              <div key={`${entry.role}-${index}`} style={{ borderRadius: '16px', background: entry.role === 'assistant' ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)', padding: '16px' }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', marginBottom: '8px' }}>{entry.role}</div>
                <div style={{ color: '#e2e8f0', lineHeight: 1.7 }}>{entry.content}</div>
              </div>
            ))}
          </div>
          {session ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px' }}>
              <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Write your answer..." style={{ minHeight: '120px', padding: '14px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', resize: 'vertical' }} />
              <button onClick={async () => { const next = await respondInterviewSession(session._id || session.id, { answer }); setSession(next.session); setAnswer(''); }} style={{ border: 'none', borderRadius: '14px', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', color: '#fff', padding: '12px 18px', fontWeight: 800, cursor: 'pointer', alignSelf: 'start' }}>Submit</button>
            </div>
          ) : <div style={{ color: '#94a3b8' }}>Start an interview session to begin.</div>}
        </div>
      </div>
    </div>
  );
};

export default AIInterview;
