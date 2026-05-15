import React, { useState } from 'react';
import { sendAssistantMessage } from '../components/context/AI.service';

const AIAssistant = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const send = async () => {
    if (!message.trim()) return;
    const prompt = message.trim();
    setMessages((prev) => [...prev, { role: 'user', content: prompt }]);
    setMessage('');
    const data = await sendAssistantMessage({ message: prompt, context: 'study planning' });
    setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 55%, #1e1b4b 100%)', color: '#f8fafc', paddingTop: '96px', paddingBottom: '48px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
          <h1 style={{ marginTop: 0, fontSize: '32px', fontWeight: 900 }}>AI Assistant</h1>
          <div style={{ display: 'grid', gap: '12px', marginBottom: '18px' }}>
            {messages.map((entry, index) => (
              <div key={`${entry.role}-${index}`} style={{ borderRadius: '18px', padding: '16px', background: entry.role === 'assistant' ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)', marginLeft: entry.role === 'assistant' ? '0' : '40px', marginRight: entry.role === 'assistant' ? '40px' : '0' }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#94a3b8', marginBottom: '8px' }}>{entry.role}</div>
                <div style={{ color: '#e2e8f0', lineHeight: 1.7 }}>{entry.content}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px' }}>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask for a plan, explanation, or revision help..." style={{ minHeight: '120px', padding: '14px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', resize: 'vertical' }} />
            <button onClick={send} style={{ border: 'none', borderRadius: '14px', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', color: '#fff', padding: '12px 18px', fontWeight: 800, cursor: 'pointer', alignSelf: 'start' }}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
