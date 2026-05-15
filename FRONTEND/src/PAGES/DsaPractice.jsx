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

const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)',
  color: '#f8fafc',
  paddingTop: '96px',
  paddingBottom: '48px',
};

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '7px 12px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 700,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#cbd5e1',
};

const difficultyTone = {
  easy: '#6ee7b7',
  medium: '#fcd34d',
  hard: '#fda4af',
};

const statusTone = {
  solved: '#6ee7b7',
  attempted: '#7dd3fc',
  draft: '#c4b5fd',
  todo: '#94a3b8',
};

const selectStyle = {
  padding: '12px 14px',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: '#0f172a',
  color: '#e2e8f0',
  boxSizing: 'border-box',
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: '#0f172a',
  color: '#e2e8f0',
  boxSizing: 'border-box',
};

const optionStyle = {
  background: '#0f172a',
  color: '#e2e8f0',
};

const statCards = (stats, problems, problemSummary) => [
  {
    label: 'Solved',
    value: problemSummary?.solved ?? stats?.stats?.solvedCount ?? 0,
    tone: '#6ee7b7',
  },
  {
    label: 'Attempted',
    value: problemSummary?.attempted ?? stats?.stats?.attemptedCount ?? 0,
    tone: '#7dd3fc',
  },
  {
    label: 'To Do',
    value: problemSummary?.todo ?? 0,
    tone: '#c4b5fd',
  },
  {
    label: 'Accuracy',
    value: `${stats?.stats?.accuracy || 0}%`,
    tone: '#fcd34d',
  },
  {
    label: 'Visible Set',
    value: problemSummary?.total ?? problems.length,
    tone: '#f8fafc',
  },
];

const DsaPractice = () => {
  const {
    problems,
    categories,
    topics,
    companies,
    stats,
    loading,
    filters,
    setFilters,
    attempts,
    problemSummary,
  } = useDsa();

  const recentAttempts = (attempts || []).slice(0, 5);
  const continueProblem = recentAttempts[0]?.problem;
  const reviewProblem =
    problems.find((problem) => problem.status === 'attempted') ||
    problems.find((problem) => problem.status === 'todo');

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 16px' }}>
        <div
          style={{
            marginBottom: '24px',
            borderRadius: '30px',
            background:
              'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(139,92,246,0.22) 48%, rgba(236,72,153,0.18) 100%)',
            border: '1px solid rgba(147,197,253,0.18)',
            padding: '30px',
            boxShadow: '0 30px 80px -40px rgba(0,0,0,0.45)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              borderRadius: '999px',
              background: 'rgba(15,23,42,0.26)',
              padding: '7px 12px',
              fontSize: '12px',
              letterSpacing: '0.16em',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#dbeafe',
            }}
          >
            DSA Practice
          </div>
          <h1 style={{ margin: '14px 0 0', fontSize: '34px', fontWeight: 900 }}>
            Practice with cleaner signals and richer problem metadata
          </h1>
          <p style={{ margin: '10px 0 0', color: '#dbeafe', maxWidth: '820px', lineHeight: 1.7 }}>
            Filter by topic, company, status, and difficulty, then jump into a workbench that keeps track of your attempts,
            score, and progress.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px', marginBottom: '24px' }}>
          {statCards(stats, problems, problemSummary).map((item) => (
            <div key={item.label} style={panel}>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>{item.label}</div>
              <div style={{ marginTop: '10px', fontSize: '32px', fontWeight: 900, color: item.tone }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ ...panel, marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
            <input
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              placeholder="Search by title, topic, company, or pattern"
              style={inputStyle}
            />
            <select value={filters.difficulty} onChange={(event) => setFilters((prev) => ({ ...prev, difficulty: event.target.value }))} style={selectStyle}>
              <option value="all" style={optionStyle}>All difficulties</option>
              <option value="easy" style={optionStyle}>Easy</option>
              <option value="medium" style={optionStyle}>Medium</option>
              <option value="hard" style={optionStyle}>Hard</option>
            </select>
            <select value={filters.category} onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))} style={selectStyle}>
              <option value="all" style={optionStyle}>All categories</option>
              {categories.map((category) => (
                <option key={category} value={category} style={optionStyle}>
                  {category}
                </option>
              ))}
            </select>
            <select value={filters.topic} onChange={(event) => setFilters((prev) => ({ ...prev, topic: event.target.value }))} style={selectStyle}>
              <option value="all" style={optionStyle}>All topics</option>
              {topics.map((topic) => (
                <option key={topic} value={topic} style={optionStyle}>
                  {topic}
                </option>
              ))}
            </select>
            <select value={filters.company} onChange={(event) => setFilters((prev) => ({ ...prev, company: event.target.value }))} style={selectStyle}>
              <option value="all" style={optionStyle}>All companies</option>
              {companies.map((company) => (
                <option key={company} value={company} style={optionStyle}>
                  {company}
                </option>
              ))}
            </select>
            <select value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))} style={selectStyle}>
              <option value="all" style={optionStyle}>All status</option>
              <option value="todo" style={optionStyle}>Todo</option>
              <option value="attempted" style={optionStyle}>Attempted</option>
              <option value="solved" style={optionStyle}>Solved</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <div style={panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900 }}>Problem set</h2>
              <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                {problemSummary?.total ?? problems.length} problem{(problemSummary?.total ?? problems.length) === 1 ? '' : 's'}
              </div>
            </div>
            {loading ? (
              <div style={{ color: '#cbd5e1' }}>Loading problems...</div>
            ) : !problems.length ? (
              <div style={{ color: '#94a3b8' }}>No problems match the current filters yet. Try clearing one of the selectors.</div>
            ) : (
              <div style={{ display: 'grid', gap: '14px' }}>
                {problems.map((problem) => (
                  <Link key={problem.id} to={`/dsa/practice/${problem.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div
                      style={{
                        display: 'grid',
                        gap: '14px',
                        borderRadius: '20px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '18px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '18px' }}>{problem.title}</div>
                          <div style={{ marginTop: '6px', color: '#94a3b8', fontSize: '13px' }}>
                            {problem.category} | {problem.topic} | {(problem.patterns || []).slice(0, 2).join(', ') || 'Pattern practice'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: difficultyTone[problem.difficulty] || '#f8fafc', fontWeight: 800, textTransform: 'capitalize' }}>
                            {problem.difficulty}
                          </div>
                          <div style={{ marginTop: '6px', color: statusTone[problem.status] || '#94a3b8', fontWeight: 700, textTransform: 'capitalize' }}>
                            {problem.status || 'todo'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={badgeStyle}>{problem.acceptanceRate}% acceptance</span>
                        <span style={badgeStyle}>{problem.estimatedMinutes || 20} min</span>
                        <span style={badgeStyle}>Time: {problem.complexity?.time || 'TBD'}</span>
                        <span style={badgeStyle}>Space: {problem.complexity?.space || 'TBD'}</span>
                        {(problem.companyTags || []).slice(0, 3).map((company) => (
                          <span key={company} style={{ ...badgeStyle, color: '#fde68a', border: '1px solid rgba(250,204,21,0.18)' }}>
                            {company}
                          </span>
                        ))}
                      </div>

                      <div style={{ color: '#cbd5e1', lineHeight: 1.7 }}>
                        {(problem.tags || []).slice(0, 4).join(', ') || 'Core data structures and algorithms practice'}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                        <div style={{ borderRadius: '16px', background: 'rgba(2,6,23,0.5)', padding: '12px' }}>
                          <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Languages</div>
                          <div style={{ marginTop: '8px', color: '#f8fafc', fontWeight: 700 }}>
                            {(problem.supportedLanguages || []).join(', ') || 'javascript'}
                          </div>
                        </div>
                        <div style={{ borderRadius: '16px', background: 'rgba(2,6,23,0.5)', padding: '12px' }}>
                          <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Last score</div>
                          <div style={{ marginTop: '8px', color: '#f8fafc', fontWeight: 700 }}>
                            {problem.lastAttempt?.scorePercent ?? 0}%
                          </div>
                        </div>
                        <div style={{ borderRadius: '16px', background: 'rgba(2,6,23,0.5)', padding: '12px' }}>
                          <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Editorial</div>
                          <div style={{ marginTop: '8px', color: '#f8fafc', fontWeight: 700 }}>
                            {problem.editorialSections?.length ? `${problem.editorialSections.length} sections` : 'Placeholder ready'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gap: '24px' }}>
          <div style={panel}>
              <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Focus next</h2>
              {continueProblem ? (
                <Link to={`/dsa/practice/${continueProblem.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ borderRadius: '18px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(96,165,250,0.18)', padding: '16px' }}>
                    <div style={{ color: '#93c5fd', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Continue latest</div>
                    <div style={{ marginTop: '8px', fontWeight: 800, fontSize: '18px' }}>{continueProblem.title}</div>
                    <div style={{ marginTop: '6px', color: '#cbd5e1', lineHeight: 1.6 }}>
                      Pick up where you left off and turn your most recent attempt into a solved submission.
                    </div>
                  </div>
                </Link>
              ) : reviewProblem ? (
                <Link to={`/dsa/practice/${reviewProblem.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                    <div style={{ color: '#c4b5fd', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Suggested start</div>
                    <div style={{ marginTop: '8px', fontWeight: 800, fontSize: '18px' }}>{reviewProblem.title}</div>
                    <div style={{ marginTop: '6px', color: '#cbd5e1', lineHeight: 1.6 }}>
                      Start here to create a fresh practice signal for the rest of the module.
                    </div>
                  </div>
                </Link>
              ) : (
                <div style={{ color: '#94a3b8' }}>Once you open or attempt a problem, your next best practice target will appear here.</div>
              )}
            </div>

            <div style={panel}>
              <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Recent attempts</h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                {recentAttempts.map((attempt) => (
                  <Link key={attempt.id} to={`/dsa/practice/${attempt.problem?.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ fontWeight: 700 }}>{attempt.problem?.title}</div>
                        <div style={{ color: statusTone[attempt.status] || '#94a3b8', fontWeight: 700, textTransform: 'capitalize' }}>
                          {attempt.status}
                        </div>
                      </div>
                      <div style={{ marginTop: '6px', color: '#94a3b8', fontSize: '13px' }}>
                        {attempt.problem?.topic || attempt.problem?.category} | {attempt.language} | {attempt.scorePercent || 0}%
                      </div>
                    </div>
                  </Link>
                ))}
                {!recentAttempts.length ? <div style={{ color: '#94a3b8' }}>No attempts yet. Open a problem to get started.</div> : null}
              </div>
            </div>

            <div style={panel}>
              <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Difficulty progress</h2>
              <div style={{ display: 'grid', gap: '14px' }}>
                {(stats?.difficultyProgress || []).map((item) => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#cbd5e1', textTransform: 'capitalize' }}>{item.label}</span>
                      <span style={{ color: '#f8fafc' }}>{item.solved}</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        style={{
                          width: `${Math.min(100, item.solved * 25)}%`,
                          height: '100%',
                          borderRadius: '999px',
                          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={panel}>
              <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Topic coverage</h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                {(stats?.topicProgress || []).slice(0, 6).map((item) => (
                  <div key={item.label} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ color: '#e2e8f0', fontWeight: 700 }}>{item.label}</div>
                      <div style={{ color: '#93c5fd', fontWeight: 700 }}>{item.value} touched</div>
                    </div>
                  </div>
                ))}
                {!stats?.topicProgress?.length ? <div style={{ color: '#94a3b8' }}>Your topic coverage will appear after you start solving problems.</div> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DsaPractice;
