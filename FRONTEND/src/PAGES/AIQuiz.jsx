import React, { useState } from 'react';
import { generateAiQuiz } from '../components/context/AI.service';

const AIQuiz = () => {
  const [topic, setTopic] = useState('Arrays');
  const [difficulty, setDifficulty] = useState('mixed');
  const [session, setSession] = useState(null);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 55%, #1e1b4b 100%)', color: '#f8fafc', paddingTop: '96px', paddingBottom: '48px' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 16px', display: 'grid', gap: '24px' }}>
        <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
          <h1 style={{ marginTop: 0, fontSize: '32px', fontWeight: 900 }}>AI Quiz Generator</h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px' }}>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" style={{ padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff' }} />
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff' }}>
              <option value="mixed">Mixed</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <button onClick={async () => setSession((await generateAiQuiz({ topic, difficulty, count: 5 })).session)} style={{ border: 'none', borderRadius: '14px', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', color: '#fff', padding: '12px 18px', fontWeight: 800, cursor: 'pointer' }}>Generate</button>
          </div>
        </div>

        <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
          <h2 style={{ marginTop: 0, fontSize: '24px', fontWeight: 900 }}>Generated questions</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {(session?.questions || []).map((question, index) => (
              <div key={`${question.question}-${index}`} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '18px' }}>
                <div style={{ fontWeight: 800, marginBottom: '8px' }}>Q{index + 1}. {question.question}</div>
                <div style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
                  {(question.options || []).map((option) => (
                    <div key={option} style={{ padding: '10px 12px', borderRadius: '12px', background: option === question.answer ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>{option}</div>
                  ))}
                </div>
                <div style={{ color: '#cbd5e1' }}>{question.explanation}</div>
              </div>
            ))}
            {!session ? <div style={{ color: '#94a3b8' }}>Generate a quiz to see questions here.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIQuiz;
