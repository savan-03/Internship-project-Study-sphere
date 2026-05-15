import React, { useEffect, useMemo, useState } from 'react';
import {
  fetchAiPersonalization,
  fetchAiSession,
  fetchAiSummary,
  generateAiQuiz,
  submitAiQuiz,
} from '../components/context/AI.service';
import { useAuth } from '../components/context/AuthContext';

const card = {
  borderRadius: '24px',
  background: 'rgba(15,23,42,0.48)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '24px',
  backdropFilter: 'blur(16px)',
};

const buildReviewFromSession = (quizSession) => {
  const selectedAnswers = quizSession?.context?.selectedAnswers || [];
  if (!selectedAnswers.length) {
    return null;
  }

  return (quizSession.questions || []).map((question, index) => ({
    index,
    question: question.question,
    selectedAnswer: selectedAnswers[index] || '',
    correctAnswer: question.answer,
    isCorrect: selectedAnswers[index] === question.answer,
    explanation: question.explanation,
  }));
};

const optionButtonStyle = ({ selected, correct, incorrect, locked }) => ({
  width: '100%',
  textAlign: 'left',
  padding: '12px 14px',
  borderRadius: '12px',
  cursor: locked ? 'default' : 'pointer',
  border: `1px solid ${
    correct
      ? 'rgba(74,222,128,0.28)'
      : incorrect
        ? 'rgba(248,113,113,0.28)'
        : selected
          ? 'rgba(96,165,250,0.28)'
          : 'rgba(255,255,255,0.06)'
  }`,
  background: correct
    ? 'rgba(34,197,94,0.14)'
    : incorrect
      ? 'rgba(239,68,68,0.14)'
      : selected
        ? 'rgba(59,130,246,0.14)'
        : 'rgba(255,255,255,0.04)',
  color: '#f8fafc',
  fontWeight: selected || correct ? 700 : 500,
});

const AiQuizPage = () => {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [topic, setTopic] = useState('Arrays');
  const [difficulty, setDifficulty] = useState('mixed');
  const [session, setSession] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState('');
  const [answers, setAnswers] = useState({});
  const [review, setReview] = useState(null);
  const [summary, setSummary] = useState({ sessions: [] });
  const [personalization, setPersonalization] = useState({
    weakTopics: [],
    suggestedQuizTopic: 'Arrays',
    nextActions: [],
    recommendedProblems: [],
  });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageError, setPageError] = useState('');

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
          setPageError('');
          if (personalizationData?.suggestedQuizTopic) {
            setTopic(personalizationData.suggestedQuizTopic);
          }
        }
      } catch (err) {
        if (isMounted) {
          setPageError(err?.response?.data?.message || err.message || 'Unable to load your AI quiz workspace right now.');
          setSummary({ sessions: [] });
        }
      } finally {
        if (isMounted) {
          setPageLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [authLoading, isAuthenticated]);

  const quizHistory = useMemo(
    () => (summary.sessions || []).filter((item) => item.type === 'quiz').slice(0, 6),
    [summary.sessions]
  );

  const scoreSummary = useMemo(() => {
    if (!review?.length) {
      return null;
    }

    const correctCount = review.filter((item) => item.isCorrect).length;
    return {
      correctCount,
      totalQuestions: review.length,
      score: Math.round((correctCount / review.length) * 100),
    };
  }, [review]);

  const hydrateQuizSession = (quizSession) => {
    setSession(quizSession);
    setActiveSessionId(quizSession?.id || '');
    const nextReview = buildReviewFromSession(quizSession);
    setReview(nextReview);

    const nextAnswers = {};
    if (nextReview?.length) {
      nextReview.forEach((item) => {
        nextAnswers[item.index] = item.selectedAnswer;
      });
    }
    setAnswers(nextAnswers);
  };

  const handleLoadHistory = async (sessionId) => {
    if (!sessionId || loading) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await fetchAiSession(sessionId);
      hydrateQuizSession(data.session);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load this quiz session right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (mode = 'manual') => {
    if (authLoading || !isAuthenticated || loading) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload =
        mode === 'personalized'
          ? { mode: 'personalized', difficulty, count: 5 }
          : { topic, difficulty, count: 5 };
      const data = await generateAiQuiz(payload);
      hydrateQuizSession(data.session);
      if (data.personalization) {
        setPersonalization(data.personalization);
      }
      const nextSummary = await fetchAiSummary();
      setSummary(nextSummary);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to generate an AI quiz right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, option) => {
    if (review) {
      return;
    }

    setAnswers((current) => ({
      ...current,
      [questionIndex]: option,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeSessionId || loading || review) {
      return;
    }

    const questionCount = session?.questions?.length || 0;
    if (Object.keys(answers).length < questionCount) {
      setError('Choose an answer for each question before submitting the quiz.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const orderedAnswers = (session.questions || []).map((_, index) => answers[index] || '');
      const data = await submitAiQuiz(activeSessionId, { answers: orderedAnswers });
      setReview(data.review || []);
      setSession(data.session);
      const nextSummary = await fetchAiSummary();
      setSummary(nextSummary);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to submit this quiz right now.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '96px' }}>
        Restoring your AI quiz workspace...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', paddingTop: '96px', paddingBottom: '48px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px', display: 'grid', gap: '24px' }}>
        <div style={card}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }}>AI Quiz Generator</h1>
          <p style={{ marginTop: '10px', color: '#cbd5e1' }}>Generate a manual quiz or let StudySphere choose a topic based on your current weak areas.</p>
          <div style={{ marginTop: '8px', color: '#93c5fd', fontSize: '13px' }}>
            Suggested focus right now: <strong>{personalization.suggestedQuizTopic}</strong>
          </div>
          <div style={{ marginTop: '8px', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>
            {(personalization.nextActions || []).find((item) => item.id === 'focus-quiz')?.reason || 'Personalized quiz recommendations will sharpen as you solve more DSA problems.'}
          </div>
          {pageError ? <div style={{ marginTop: '12px', color: '#fca5a5' }}>{pageError}</div> : null}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '18px' }}>
            <input value={topic} onChange={(event) => setTopic(event.target.value)} disabled={pageLoading || loading} style={{ padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff' }} />
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} disabled={pageLoading || loading} style={{ padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff' }}>
              <option value="mixed">Mixed</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <button onClick={() => handleGenerate('manual')} disabled={loading || pageLoading} style={{ padding: '12px 18px', border: 'none', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
              {loading ? 'Generating...' : 'Generate'}
            </button>
            <button onClick={() => handleGenerate('personalized')} disabled={loading || pageLoading} style={{ padding: '12px 18px', border: '1px solid rgba(96,165,250,0.24)', borderRadius: '14px', background: 'rgba(59,130,246,0.14)', color: '#bfdbfe', fontWeight: 800, cursor: 'pointer' }}>
              Personalized
            </button>
          </div>
          {error ? <div style={{ marginTop: '12px', color: '#fecaca' }}>{error}</div> : null}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div style={{ display: 'grid', gap: '24px' }}>
            {session ? (
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900 }}>{session.title}</h2>
                    <div style={{ marginTop: '12px', color: '#cbd5e1', fontSize: '13px' }}>
                      Generation mode: {session.context?.providerEnabled ? 'Real AI provider' : 'StudySphere fallback engine'} | Focus: {session.context?.topic}
                    </div>
                  </div>
                  {scoreSummary ? (
                    <div style={{ minWidth: '170px', borderRadius: '18px', background: scoreSummary.score >= 70 ? 'rgba(34,197,94,0.14)' : 'rgba(59,130,246,0.12)', border: `1px solid ${scoreSummary.score >= 70 ? 'rgba(74,222,128,0.22)' : 'rgba(96,165,250,0.22)'}`, padding: '14px 16px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Latest score</div>
                      <div style={{ marginTop: '8px', fontSize: '28px', fontWeight: 900 }}>{scoreSummary.score}%</div>
                      <div style={{ marginTop: '4px', color: '#cbd5e1', fontSize: '13px' }}>
                        {scoreSummary.correctCount}/{scoreSummary.totalQuestions} correct
                      </div>
                    </div>
                  ) : null}
                </div>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {(session.questions || []).map((question, index) => {
                    const questionReview = review?.[index];
                    const selectedAnswer = answers[index];
                    return (
                      <div key={`${question.question}-${index}`} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '18px' }}>
                        <div style={{ fontWeight: 800, marginBottom: '12px' }}>Q{index + 1}. {question.question}</div>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {(question.options || []).map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handleAnswerChange(index, option)}
                              style={optionButtonStyle({
                                selected: selectedAnswer === option,
                                correct: questionReview?.correctAnswer === option,
                                incorrect: questionReview?.selectedAnswer === option && !questionReview?.isCorrect,
                                locked: Boolean(review),
                              })}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                        {questionReview ? (
                          <div style={{ marginTop: '12px', color: '#cbd5e1', lineHeight: 1.7 }}>
                            <div style={{ fontWeight: 700, color: questionReview.isCorrect ? '#86efac' : '#fecaca' }}>
                              {questionReview.isCorrect ? 'Correct' : `Correct answer: ${questionReview.correctAnswer}`}
                            </div>
                            <div style={{ marginTop: '6px' }}>{questionReview.explanation}</div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '18px', flexWrap: 'wrap' }}>
                  {!review ? (
                    <button onClick={handleSubmitQuiz} disabled={loading} style={{ border: 'none', borderRadius: '14px', background: 'rgba(16,185,129,0.92)', color: '#fff', padding: '13px 18px', fontWeight: 800, cursor: 'pointer' }}>
                      {loading ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                  ) : (
                    <button onClick={() => handleGenerate('personalized')} disabled={loading} style={{ border: 'none', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', padding: '13px 18px', fontWeight: 800, cursor: 'pointer' }}>
                      Try Another Personalized Quiz
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={card}>
                <div style={{ color: '#94a3b8' }}>No quiz generated yet. Start with the suggested topic or use the personalized mode.</div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={card}>
              <h3 style={{ margin: '0 0 14px', fontSize: '22px', fontWeight: 900 }}>Weak topic signals</h3>
              {pageLoading ? <div style={{ color: '#94a3b8' }}>Loading...</div> : (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {(personalization.weakTopics || []).map((topicItem) => (
                    <div key={topicItem.label} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '12px 14px' }}>
                      <div style={{ fontWeight: 800 }}>{topicItem.label}</div>
                      <div style={{ marginTop: '4px', color: '#94a3b8', fontSize: '13px' }}>Solve rate {topicItem.solveRate}% | Avg score {topicItem.averageScore}%</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={card}>
              <h3 style={{ margin: '0 0 14px', fontSize: '22px', fontWeight: 900 }}>Quiz history</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {quizHistory.map((historyItem) => (
                  <button
                    key={historyItem.id}
                    type="button"
                    onClick={() => handleLoadHistory(historyItem.id)}
                    style={{ textAlign: 'left', borderRadius: '16px', background: historyItem.id === activeSessionId ? 'rgba(59,130,246,0.14)' : 'rgba(255,255,255,0.04)', border: `1px solid ${historyItem.id === activeSessionId ? 'rgba(96,165,250,0.24)' : 'rgba(255,255,255,0.06)'}`, padding: '12px 14px', color: '#f8fafc', cursor: 'pointer' }}
                  >
                    <div style={{ fontWeight: 800 }}>{historyItem.title}</div>
                    <div style={{ marginTop: '4px', color: '#94a3b8', fontSize: '13px' }}>
                      Score {historyItem.score || 0}% | {historyItem.context?.mode || 'manual'}
                    </div>
                  </button>
                ))}
                {!quizHistory.length ? <div style={{ color: '#94a3b8' }}>No quiz history yet.</div> : null}
              </div>
            </div>

            <div style={card}>
              <h3 style={{ margin: '0 0 14px', fontSize: '22px', fontWeight: 900 }}>Recommended practice after the quiz</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {(personalization.recommendedProblems || []).slice(0, 3).map((problem) => (
                  <div key={problem.id} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '12px 14px' }}>
                    <div style={{ fontWeight: 800 }}>{problem.title}</div>
                    <div style={{ marginTop: '4px', color: '#94a3b8', fontSize: '13px' }}>{problem.topic} | {problem.difficulty}</div>
                    <div style={{ marginTop: '8px', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>{problem.reason}</div>
                  </div>
                ))}
                {!personalization.recommendedProblems?.length ? <div style={{ color: '#94a3b8' }}>Recommended problems will appear here after personalization loads.</div> : null}
              </div>
            </div>

            {session?.context?.practiceChecklist?.length ? (
              <div style={card}>
                <h3 style={{ margin: '0 0 14px', fontSize: '22px', fontWeight: 900 }}>Practice checklist</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {session.context.practiceChecklist.map((item) => (
                    <div key={item} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '12px 14px', color: '#cbd5e1', lineHeight: 1.6 }}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiQuizPage;
