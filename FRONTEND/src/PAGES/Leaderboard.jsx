import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';
import { useGamification } from '../components/context/GamificationContext';

const rankTone = ['#fcd34d', '#cbd5e1', '#fca5a5'];

const Leaderboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { summary, leaderboard, gamificationLoading, streakFreezeLoading, activateStreakFreeze } = useGamification();

  const currentUserEntry = leaderboard.find((entry) => String(entry.id) === String(user?.id));

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', paddingTop: '96px', paddingBottom: '48px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ marginBottom: '24px', borderRadius: '30px', background: 'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(139,92,246,0.22) 48%, rgba(236,72,153,0.18) 100%)', border: '1px solid rgba(147,197,253,0.18)', padding: '30px', boxShadow: '0 30px 80px -40px rgba(0,0,0,0.45)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'inline-flex', borderRadius: '999px', background: 'rgba(15,23,42,0.26)', padding: '7px 12px', fontSize: '12px', letterSpacing: '0.16em', fontWeight: 800, textTransform: 'uppercase', color: '#dbeafe' }}>
                Gamification Arena
              </div>
              <h1 style={{ margin: '14px 0 0', fontSize: '34px', fontWeight: 900 }}>Leaderboard and rewards</h1>
              <p style={{ margin: '10px 0 0', color: '#dbeafe' }}>
                Track the community standings, unlock badges, finish weekly missions, and keep your streak alive.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/profile')}
                style={{ borderRadius: '14px', border: '1px solid rgba(255,255,255,0.12)', background: '#ffffff', color: '#6d28d9', padding: '12px 18px', fontWeight: 800, cursor: 'pointer' }}
              >
                Open Profile
              </button>
              <button
                onClick={() => navigate('/resources/upload')}
                style={{ borderRadius: '14px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.12)', color: '#f8fafc', padding: '12px 18px', fontWeight: 800, cursor: 'pointer' }}
              >
                Earn faster
              </button>
            </div>
          </div>
        </div>

        {gamificationLoading ? (
          <div style={{ borderRadius: '22px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', color: '#cbd5e1' }}>
            Loading leaderboard...
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              {[
                ['Rank', currentUserEntry ? `#${currentUserEntry.rank}` : 'Unranked', '#c4b5fd'],
                ['Level', summary?.stats?.level || 'Beginner', '#7dd3fc'],
                ['Percentile', `${summary?.rankSnapshot?.percentile || 0}%`, '#86efac'],
                ['Completed missions', summary?.rankSnapshot?.completedChallenges || 0, '#fcd34d'],
                ['Solved problems', summary?.stats?.solvedAttempts || 0, '#fca5a5'],
              ].map(([label, value, color]) => (
                <div key={label} style={{ borderRadius: '20px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '18px 20px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '13px' }}>{label}</div>
                  <div style={{ marginTop: '8px', fontSize: '30px', fontWeight: 900, color }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1.4fr 1fr' }}>
              <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
                <h2 style={{ margin: '0 0 18px', fontSize: '24px', fontWeight: 900 }}>Top learners</h2>
                <div style={{ display: 'grid', gap: '14px' }}>
                  {leaderboard.map((entry, index) => (
                    <div key={entry.id} style={{ display: 'grid', gridTemplateColumns: '70px 1fr auto', gap: '16px', alignItems: 'center', borderRadius: '20px', background: entry.id === user?.id ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)', border: entry.id === user?.id ? '1px solid rgba(96,165,250,0.26)' : '1px solid rgba(255,255,255,0.08)', padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '44px', width: '44px', borderRadius: '999px', background: rankTone[index] || 'rgba(255,255,255,0.08)', color: index < 3 ? '#0f172a' : '#f8fafc', fontWeight: 900 }}>
                        #{entry.rank}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800 }}>{entry.fullName}</div>
                        <div style={{ marginTop: '4px', fontSize: '13px', color: '#94a3b8' }}>
                          {entry.level} | {entry.uploadsCount} uploads | {entry.solvedCount || 0} solves | {entry.streak} day streak
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '28px', fontWeight: 900, color: '#c4b5fd' }}>{entry.points}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>points</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gap: '24px' }}>
                <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
                  <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Your standing</h2>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>Longest Streak</div>
                      <div style={{ marginTop: '8px', fontSize: '28px', fontWeight: 900, color: '#fcd34d' }}>{summary?.stats?.longestStreak || 0}</div>
                    </div>
                    <div style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>Next Level</div>
                      <div style={{ marginTop: '8px', fontSize: '28px', fontWeight: 900, color: '#7dd3fc' }}>{summary?.stats?.nextLevel || 'Master'}</div>
                    </div>
                    <div style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>Streak Freeze</div>
                    <div style={{ marginTop: '8px', fontSize: '20px', fontWeight: 900, color: summary?.rankSnapshot?.streakFreezeAvailable ? '#86efac' : '#fca5a5' }}>
                      {summary?.rankSnapshot?.streakFreezeAvailable ? `${summary?.rankSnapshot?.streakFreezeCount || 1} available` : 'Locked'}
                    </div>
                    {summary?.rankSnapshot?.streakFreezeArmed ? (
                      <div style={{ marginTop: '8px', color: '#93c5fd', fontSize: '13px' }}>Armed for your next missed day</div>
                    ) : null}
                  </div>
                </div>
                </div>

                <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
                  <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Next unlocks</h2>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {(summary?.nextUnlocks || []).length ? summary.nextUnlocks.map((item) => (
                      <div key={item.id} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                        <div style={{ fontWeight: 800 }}>{item.title}</div>
                        <div style={{ marginTop: '6px', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>{item.description}</div>
                        <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '13px' }}>{item.remaining} remaining | {item.progress}% progress</div>
                      </div>
                    )) : (
                      <div style={{ borderRadius: '18px', border: '1px dashed rgba(255,255,255,0.16)', padding: '22px', color: '#94a3b8' }}>
                        You have unlocked everything currently available.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Season snapshot</h2>
                <div style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '18px' }}>
                  <div style={{ fontSize: '12px', color: '#93c5fd', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 800 }}>
                    {summary?.season?.label || 'Momentum Season'}
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '24px', fontWeight: 900 }}>
                    {summary?.season?.focus || 'Keep your progress moving.'}
                  </div>
                  <div style={{ marginTop: '10px', color: '#cbd5e1', lineHeight: 1.7 }}>
                    {summary?.season?.daysRemaining || 0} days left in this cycle with {summary?.season?.completedChallenges || 0}/{summary?.season?.totalChallenges || 0} challenges completed.
                  </div>
                  <div style={{ marginTop: '16px', height: '10px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                    <div style={{ width: `${summary?.season?.completionScore || 0}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }} />
                  </div>
                </div>

                <div style={{ marginTop: '16px', display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                  {[
                    ['Engagement', summary?.momentum?.engagementScore || 0, '#c4b5fd'],
                    ['Approval rate', `${summary?.momentum?.approvalRate || 0}%`, '#86efac'],
                    ['Downloads', summary?.momentum?.downloadVelocity || 0, '#fcd34d'],
                  ].map(([label, value, color]) => (
                    <div key={label} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>{label}</div>
                      <div style={{ marginTop: '8px', fontSize: '26px', fontWeight: 900, color }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Reward locker</h2>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {[
                    ['Streak freezes', summary?.rewardLocker?.streakFreezes || 0, '#86efac'],
                    ['Spotlight entries', summary?.rewardLocker?.spotlightEntries || 0, '#93c5fd'],
                    ['Community boosts', summary?.rewardLocker?.communityBoosts || 0, '#f9a8d4'],
                    ['Problem tokens', summary?.rewardLocker?.problemTokens || 0, '#fca5a5'],
                  ].map(([label, value, color]) => (
                    <div key={label} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>{label}</div>
                      <div style={{ marginTop: '8px', fontSize: '28px', fontWeight: 900, color }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '16px', borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                  <div style={{ fontWeight: 800 }}>{summary?.rewardLocker?.nextReward?.title || 'Next reward'}</div>
                  <div style={{ marginTop: '6px', color: '#cbd5e1', lineHeight: 1.6 }}>
                    {summary?.rewardLocker?.nextReward?.remaining || 0} steps remaining.
                  </div>
                  <div style={{ marginTop: '8px', color: '#93c5fd', fontSize: '13px' }}>
                    {summary?.rewardLocker?.standingNote || 'Keep moving to unlock your next reward.'}
                  </div>
                  {summary?.rewardLocker?.streakFreezes > 0 ? (
                    <button
                      onClick={() => activateStreakFreeze()}
                      disabled={streakFreezeLoading || summary?.rewardLocker?.streakFreezeArmed}
                      style={{ marginTop: '12px', borderRadius: '10px', border: '1px solid rgba(134,239,172,0.22)', background: summary?.rewardLocker?.streakFreezeArmed ? 'rgba(134,239,172,0.08)' : 'rgba(16,185,129,0.16)', color: '#bbf7d0', padding: '9px 12px', fontWeight: 700, cursor: summary?.rewardLocker?.streakFreezeArmed ? 'default' : 'pointer' }}
                    >
                      {summary?.rewardLocker?.streakFreezeArmed
                        ? 'Streak freeze armed'
                        : streakFreezeLoading
                          ? 'Arming freeze...'
                          : 'Arm streak freeze'}
                    </button>
                  ) : null}
                  {summary?.rewardLocker?.nextReward?.route ? (
                    <button
                      onClick={() => navigate(summary.rewardLocker.nextReward.route)}
                      style={{ marginTop: '12px', borderRadius: '10px', border: '1px solid rgba(96,165,250,0.22)', background: 'rgba(59,130,246,0.14)', color: '#bfdbfe', padding: '9px 12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Open next step
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Problem-solving lane</h2>
                <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                  {[
                    ['Solved', summary?.dsaLane?.solvedAttempts || 0, '#fca5a5'],
                    ['Unique solved', summary?.dsaLane?.uniqueSolvedProblems || 0, '#93c5fd'],
                    ['Avg score', `${summary?.dsaLane?.averageScore || 0}%`, '#86efac'],
                    ['Precision runs', summary?.dsaLane?.perfectAttempts || 0, '#fcd34d'],
                  ].map(([label, value, color]) => (
                    <div key={label} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>{label}</div>
                      <div style={{ marginTop: '8px', fontSize: '26px', fontWeight: 900, color }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '16px', borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                  <div style={{ fontWeight: 800 }}>Strongest topic</div>
                  <div style={{ marginTop: '6px', color: '#cbd5e1', lineHeight: 1.6 }}>
                    {summary?.dsaLane?.strongestTopic?.topic || 'Build more DSA history to reveal your strongest lane.'}
                  </div>
                  {summary?.dsaLane?.strongestTopic ? (
                    <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '13px' }}>
                      {summary.dsaLane.strongestTopic.solved} solved from {summary.dsaLane.strongestTopic.attempts} attempts
                    </div>
                  ) : null}
                </div>
              </div>

              <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Active missions</h2>
                <div style={{ display: 'grid', gap: '18px' }}>
                  <div>
                    <div style={{ marginBottom: '12px', color: '#93c5fd', fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800 }}>Weekly</div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {(summary?.weeklyMissions || []).map((mission) => (
                        <div key={mission.id} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                            <div style={{ fontWeight: 800 }}>{mission.title}</div>
                            <div style={{ color: mission.completed ? '#86efac' : '#fcd34d', fontSize: '12px', fontWeight: 800 }}>{mission.completed ? 'Completed' : mission.reward}</div>
                          </div>
                          <div style={{ marginTop: '6px', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>{mission.description}</div>
                          <div style={{ marginTop: '12px', height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                            <div style={{ width: `${mission.progress}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }} />
                          </div>
                          <div style={{ marginTop: '10px', color: '#94a3b8', fontSize: '13px' }}>{mission.current}/{mission.target}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ marginBottom: '12px', color: '#fca5a5', fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800 }}>Practice lane</div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {(summary?.practiceMissions || []).map((mission) => (
                        <div key={mission.id} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                            <div style={{ fontWeight: 800 }}>{mission.title}</div>
                            <div style={{ color: mission.completed ? '#86efac' : '#fca5a5', fontSize: '12px', fontWeight: 800 }}>{mission.completed ? 'Completed' : mission.reward}</div>
                          </div>
                          <div style={{ marginTop: '6px', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>{mission.description}</div>
                          <div style={{ marginTop: '12px', height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                            <div style={{ width: `${mission.progress}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(135deg, #f97316, #ef4444)' }} />
                          </div>
                          <div style={{ marginTop: '10px', color: '#94a3b8', fontSize: '13px' }}>{mission.current}/{mission.target}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Focus rewards</h2>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {(summary?.focusRewards || []).length ? summary.focusRewards.map((reward) => (
                    <button
                      key={reward.id}
                      onClick={() => navigate(reward.route)}
                      style={{ textAlign: 'left', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', padding: '16px', color: '#f8fafc', cursor: 'pointer' }}
                    >
                      <div style={{ fontWeight: 800 }}>{reward.title}</div>
                      <div style={{ marginTop: '6px', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>{reward.description}</div>
                      <div style={{ marginTop: '8px', color: '#93c5fd', fontSize: '13px' }}>{reward.reason}</div>
                    </button>
                  )) : (
                    <div style={{ borderRadius: '18px', border: '1px dashed rgba(255,255,255,0.16)', padding: '22px', color: '#94a3b8' }}>
                      Your current profile already has good momentum. Keep showing up.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Competition ladder</h2>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {(summary?.competitions || []).map((competition) => (
                    <button
                      key={competition.id}
                      onClick={() => navigate(competition.route)}
                      style={{ textAlign: 'left', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', padding: '16px', color: '#f8fafc', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                        <div style={{ fontWeight: 800 }}>{competition.title}</div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#93c5fd' }}>{competition.status}</div>
                      </div>
                      <div style={{ marginTop: '6px', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>{competition.description}</div>
                      <div style={{ marginTop: '12px', height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                        <div style={{ width: `${competition.progress}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(135deg, #22c55e, #14b8a6)' }} />
                      </div>
                      <div style={{ marginTop: '10px', color: '#94a3b8', fontSize: '13px' }}>{competition.detail}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Challenge tracks</h2>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {(summary?.challengeTracks || []).map((track) => (
                    <div key={track.id} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                        <div style={{ fontWeight: 800 }}>{track.title}</div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#c4b5fd' }}>{track.completed}/{track.total}</div>
                      </div>
                      <div style={{ marginTop: '12px', height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                        <div style={{ width: `${track.progress}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }} />
                      </div>
                      <div style={{ marginTop: '10px', color: '#94a3b8', fontSize: '13px' }}>{track.progress}% average completion</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>Earned badges</h2>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {(summary?.earnedBadges || []).length ? (
                    summary.earnedBadges.map((badge) => (
                      <div key={badge.id} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                        <div style={{ fontWeight: 800 }}>{badge.title}</div>
                        <div style={{ marginTop: '6px', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>{badge.description}</div>
                        <div style={{ marginTop: '8px', color: '#86efac', fontSize: '13px' }}>Tier: {badge.tier}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ borderRadius: '18px', border: '1px dashed rgba(255,255,255,0.16)', padding: '22px', color: '#94a3b8' }}>
                      Keep participating to unlock your first badge.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
                <h2 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 900 }}>All badges</h2>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {(summary?.badges || []).map((badge) => (
                    <div key={badge.id} style={{ borderRadius: '18px', background: badge.earned ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)', padding: '16px', border: badge.earned ? '1px solid rgba(74,222,128,0.18)' : '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                        <div style={{ fontWeight: 800 }}>{badge.title}</div>
                        <div style={{ color: badge.earned ? '#86efac' : '#94a3b8', fontSize: '12px', fontWeight: 800 }}>{badge.earned ? 'Unlocked' : badge.tier}</div>
                      </div>
                      <div style={{ marginTop: '6px', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>{badge.description}</div>
                      <div style={{ marginTop: '12px', height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                        <div style={{ width: `${badge.progress}%`, height: '100%', borderRadius: '999px', background: badge.earned ? 'linear-gradient(135deg, #10b981, #14b8a6)' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }} />
                      </div>
                      <div style={{ marginTop: '10px', color: '#94a3b8', fontSize: '13px' }}>{badge.current}/{badge.target}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
