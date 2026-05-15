import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../components/context/NotificationsContext';

const typeTone = {
  register: '#a5b4fc',
  login: '#93c5fd',
  profile_update: '#f9a8d4',
  resource_upload: '#67e8f9',
  bookmark_added: '#c4b5fd',
  collection_created: '#fcd34d',
  collection_add_resource: '#fde68a',
  review_added: '#7dd3fc',
  comment_added: '#f9a8d4',
  reply_added: '#fbcfe8',
  resource_approved: '#6ee7b7',
  resource_rejected: '#fda4af',
  resource_pending: '#fcd34d',
  resource_review: '#7dd3fc',
  resource_comment: '#c4b5fd',
  comment_reply: '#f9a8d4',
  role_update: '#93c5fd',
  account_status: '#fca5a5',
  social_follow: '#86efac',
  social_direct_message: '#7dd3fc',
  social_group_post: '#c4b5fd',
  social_thread_reply: '#f9a8d4',
  social_thread_upvote: '#fde68a',
  social_mentorship: '#6ee7b7',
  ai_quiz: '#93c5fd',
};

const formatTime = (value) =>
  new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const Notifications = () => {
  const navigate = useNavigate();
  const {
    notifications,
    notificationsLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    preferences,
    savePreferences,
    summary,
    reminderCards,
    categories,
    digestSummary,
    dismissNotification,
    clearReadNotifications,
  } = useNotifications();
  const [activeFilter, setActiveFilter] = useState('all');
  const [savingPrefs, setSavingPrefs] = useState(false);

  const grouped = useMemo(() => ({
    unread: notifications.filter((item) => !item.isRead),
    read: notifications.filter((item) => item.isRead),
  }), [notifications]);

  const filterMap = useMemo(() => ({
    all: notifications,
    unread: notifications.filter((item) => !item.isRead),
    resources: notifications.filter((item) => item.category === 'resources'),
    social: notifications.filter((item) => item.category === 'social'),
    dsa: notifications.filter((item) => item.category === 'dsa'),
    ai: notifications.filter((item) => item.category === 'ai'),
    system: notifications.filter((item) => item.category === 'system'),
  }), [notifications]);

  const openNotification = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const savePrefPatch = async (payload) => {
    setSavingPrefs(true);
    try {
      await savePreferences(payload);
    } finally {
      setSavingPrefs(false);
    }
  };

  const renderCard = (notification) => (
    <div
      key={notification.id}
      style={{
        borderRadius: '20px',
        border: `1px solid ${notification.isRead ? 'rgba(255,255,255,0.08)' : 'rgba(125,211,252,0.25)'}`,
        background: notification.isRead ? 'rgba(255,255,255,0.03)' : 'rgba(59,130,246,0.08)',
        padding: '18px 20px',
        color: '#f8fafc',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
        <div>
          <div style={{ display: 'inline-flex', borderRadius: '999px', padding: '6px 10px', background: 'rgba(15,23,42,0.35)', color: typeTone[notification.type] || '#cbd5e1', fontSize: '12px', fontWeight: 800, marginBottom: '12px', textTransform: 'capitalize' }}>
            {notification.category} | {notification.type.replace(/_/g, ' ')}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800 }}>{notification.title}</div>
          <div style={{ marginTop: '8px', color: '#cbd5e1', lineHeight: 1.7 }}>{notification.message}</div>
        </div>
        {!notification.isRead ? (
          <span style={{ height: '10px', width: '10px', borderRadius: '999px', background: '#60a5fa', marginTop: '8px', flexShrink: 0 }} />
        ) : null}
      </div>
      <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '13px', color: '#94a3b8' }}>{formatTime(notification.createdAt)}</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => openNotification(notification)}
            style={{ borderRadius: '10px', border: '1px solid rgba(96,165,250,0.22)', background: 'rgba(59,130,246,0.14)', color: '#bfdbfe', padding: '8px 12px', fontWeight: 700, cursor: 'pointer' }}
          >
            {notification.link ? 'Open' : 'Mark read'}
          </button>
          <button
            onClick={() => dismissNotification(notification.id)}
            style={{ borderRadius: '10px', border: '1px solid rgba(248,113,113,0.22)', background: 'rgba(127,29,29,0.22)', color: '#fecaca', padding: '8px 12px', fontWeight: 700, cursor: 'pointer' }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: '#f8fafc', paddingTop: '96px', paddingBottom: '48px' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ marginBottom: '24px', borderRadius: '30px', background: 'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(139,92,246,0.22) 48%, rgba(236,72,153,0.18) 100%)', border: '1px solid rgba(147,197,253,0.18)', padding: '30px', boxShadow: '0 30px 80px -40px rgba(0,0,0,0.45)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'inline-flex', borderRadius: '999px', background: 'rgba(15,23,42,0.26)', padding: '7px 12px', fontSize: '12px', letterSpacing: '0.16em', fontWeight: 800, textTransform: 'uppercase', color: '#dbeafe' }}>
                Notification Center
              </div>
              <h1 style={{ margin: '14px 0 0', fontSize: '34px', fontWeight: 900 }}>Stay in sync with your activity</h1>
              <p style={{ margin: '10px 0 0', color: '#dbeafe' }}>{unreadCount} unread notification{unreadCount === 1 ? '' : 's'} across resources, social activity, AI, and system actions.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={markAllAsRead}
                disabled={!unreadCount}
                style={{
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: unreadCount ? '#ffffff' : 'rgba(255,255,255,0.14)',
                  color: unreadCount ? '#6d28d9' : '#cbd5e1',
                  padding: '12px 18px',
                  fontWeight: 800,
                  cursor: unreadCount ? 'pointer' : 'default',
                }}
              >
                Mark all as read
              </button>
              <button
                onClick={clearReadNotifications}
                style={{
                  borderRadius: '14px',
                  border: '1px solid rgba(248,113,113,0.22)',
                  background: 'rgba(127,29,29,0.2)',
                  color: '#fecaca',
                  padding: '12px 18px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Clear read
              </button>
            </div>
          </div>
        </div>

        {notificationsLoading ? (
          <div style={{ borderRadius: '22px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', color: '#cbd5e1' }}>
            Loading notifications...
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
              {[
                ['Total', summary?.total || notifications.length, '#c4b5fd'],
                ['Unread', summary?.unread || unreadCount, '#93c5fd'],
                ['Social', summary?.countsByCategory?.social || 0, '#86efac'],
                ['DSA', summary?.countsByCategory?.dsa || 0, '#fca5a5'],
                ['AI', summary?.countsByCategory?.ai || 0, '#fcd34d'],
              ].map(([label, value, color]) => (
                <div key={label} style={{ borderRadius: '20px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '18px 20px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '13px' }}>{label}</div>
                  <div style={{ marginTop: '8px', fontSize: '30px', fontWeight: 900, color }}>{value}</div>
                </div>
              ))}
            </div>

            {!!reminderCards?.length && (
              <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                {reminderCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => navigate(card.route)}
                    style={{ textAlign: 'left', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15,23,42,0.48)', padding: '18px 20px', color: '#f8fafc', cursor: 'pointer' }}
                  >
                    <div style={{ fontWeight: 800 }}>{card.title}</div>
                    <div style={{ marginTop: '8px', color: '#cbd5e1', lineHeight: 1.6 }}>{card.message}</div>
                    <div style={{ marginTop: '12px', color: '#93c5fd', fontWeight: 700 }}>{card.actionLabel}</div>
                  </button>
                ))}
              </div>
            )}

            {digestSummary?.enabled ? (
              <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '12px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#93c5fd', fontWeight: 800 }}>
                      {digestSummary.frequency === 'weekly' ? 'Weekly digest' : 'Daily digest'}
                    </div>
                    <h2 style={{ margin: '12px 0 0', fontSize: '24px', fontWeight: 900 }}>Your notification brief</h2>
                    <p style={{ margin: '10px 0 0', color: '#cbd5e1', lineHeight: 1.7 }}>
                      {digestSummary.unread
                        ? `${digestSummary.unread} unread item${digestSummary.unread === 1 ? '' : 's'} still need attention.`
                        : 'You are caught up right now. Fresh updates will land here as they happen.'}
                      {digestSummary.unreadPriority ? ` Priority area: ${digestSummary.unreadPriority.id}.` : ''}
                    </p>
                  </div>
                  <div style={{ minWidth: '240px', borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '13px' }}>Busiest category</div>
                    <div style={{ marginTop: '8px', fontSize: '22px', fontWeight: 900, textTransform: 'capitalize' }}>
                      {digestSummary.busiestCategory?.id || 'system'}
                    </div>
                    <div style={{ marginTop: '6px', color: '#cbd5e1' }}>
                      {digestSummary.busiestCategory?.total || 0} total update{digestSummary.busiestCategory?.total === 1 ? '' : 's'}
                    </div>
                    {digestSummary.quietHours ? (
                      <div style={{ marginTop: '12px', color: '#a5b4fc', fontSize: '13px' }}>
                        Quiet hours: {digestSummary.quietHours.start} to {digestSummary.quietHours.end}
                      </div>
                    ) : null}
                  </div>
                </div>

                {digestSummary.highlights?.length ? (
                  <div style={{ marginTop: '18px', display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                    {digestSummary.highlights.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => item.link ? navigate(item.link) : setActiveFilter(item.category)}
                        style={{ textAlign: 'left', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#f8fafc', padding: '16px', cursor: 'pointer' }}
                      >
                        <div style={{ fontSize: '12px', color: typeTone[item.type] || '#cbd5e1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {item.category}
                        </div>
                        <div style={{ marginTop: '10px', fontWeight: 800 }}>{item.title}</div>
                        <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '13px' }}>
                          {item.isRead ? 'Reviewed' : 'Unread'} • {formatTime(item.createdAt)}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'resources', label: 'Resources' },
                { id: 'social', label: 'Social' },
                { id: 'dsa', label: 'DSA' },
                { id: 'ai', label: 'AI' },
                { id: 'system', label: 'System' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  style={{
                    borderRadius: '999px',
                    border: activeFilter === filter.id ? '1px solid rgba(196,181,253,0.55)' : '1px solid rgba(255,255,255,0.08)',
                    background: activeFilter === filter.id ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.03)',
                    color: activeFilter === filter.id ? '#e9d5ff' : '#cbd5e1',
                    padding: '10px 16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1.2fr 1fr' }}>
              <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
                <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 800 }}>
                  {activeFilter === 'all'
                    ? 'All notifications'
                    : activeFilter === 'unread'
                      ? 'Unread'
                      : activeFilter === 'resources'
                        ? 'Resource activity'
                        : activeFilter === 'social'
                          ? 'Social activity'
                          : activeFilter === 'dsa'
                            ? 'DSA updates'
                          : activeFilter === 'ai'
                            ? 'AI updates'
                            : 'System updates'}
                </h2>
                <div style={{ display: 'grid', gap: '14px' }}>
                  {filterMap[activeFilter]?.length ? filterMap[activeFilter].map(renderCard) : (
                    <div style={{ borderRadius: '18px', border: '1px dashed rgba(255,255,255,0.16)', padding: '28px', color: '#94a3b8' }}>
                      No notifications in this view yet.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
                <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 800 }}>Category snapshots</h2>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {(categories || []).map((category) => (
                    <div key={category.id} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                        <div style={{ fontWeight: 800, textTransform: 'capitalize' }}>{category.id}</div>
                        <button
                          onClick={() => setActiveFilter(category.id)}
                          style={{ borderRadius: '10px', border: '1px solid rgba(96,165,250,0.22)', background: 'rgba(59,130,246,0.14)', color: '#bfdbfe', padding: '7px 10px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Open
                        </button>
                      </div>
                      <div style={{ marginTop: '10px', color: '#cbd5e1' }}>
                        {category.total} total | {category.unread} unread
                      </div>
                    </div>
                  ))}
                </div>

                {preferences ? (
                  <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
                    <h3 style={{ margin: '0 0 14px', fontSize: '18px', fontWeight: 800 }}>Preferences</h3>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {[
                        ['inApp', 'In-app notifications'],
                        ['email', 'Email notifications'],
                        ['push', 'Push notifications'],
                        ['digest', 'Digest summaries'],
                        ['studyReminders', 'Study reminders'],
                        ['doNotDisturb', 'Do not disturb'],
                      ].map(([key, label]) => (
                        <label key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#cbd5e1' }}>
                          <span>{label}</span>
                          <input
                            type="checkbox"
                            checked={Boolean(preferences[key])}
                            onChange={(event) => savePrefPatch({
                              ...preferences,
                              [key]: event.target.checked,
                            })}
                          />
                        </label>
                      ))}

                      <label style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#cbd5e1' }}>
                        <span>Digest cadence</span>
                        <select
                          value={preferences.digestFrequency || 'daily'}
                          onChange={(event) => savePrefPatch({
                            ...preferences,
                            digestFrequency: event.target.value,
                          })}
                          style={{ background: 'rgba(255,255,255,0.08)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '6px 8px' }}
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </label>

                      <label style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#cbd5e1' }}>
                        <span>Reminder hour</span>
                        <input
                          type="time"
                          value={preferences.reminderHour || '19:00'}
                          onChange={(event) => savePrefPatch({
                            ...preferences,
                            reminderHour: event.target.value,
                          })}
                          style={{ background: 'rgba(255,255,255,0.08)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '6px 8px' }}
                        />
                      </label>

                      <label style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#cbd5e1' }}>
                        <span>Quiet hours start</span>
                        <input
                          type="time"
                          value={preferences.quietHoursStart || '22:00'}
                          onChange={(event) => savePrefPatch({
                            ...preferences,
                            quietHoursStart: event.target.value,
                          })}
                          style={{ background: 'rgba(255,255,255,0.08)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '6px 8px' }}
                        />
                      </label>

                      <label style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#cbd5e1' }}>
                        <span>Quiet hours end</span>
                        <input
                          type="time"
                          value={preferences.quietHoursEnd || '07:00'}
                          onChange={(event) => savePrefPatch({
                            ...preferences,
                            quietHoursEnd: event.target.value,
                          })}
                          style={{ background: 'rgba(255,255,255,0.08)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '6px 8px' }}
                        />
                      </label>

                      {Object.entries(preferences.categories || {}).map(([key, value]) => (
                        <label key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#cbd5e1', textTransform: 'capitalize' }}>
                          <span>{key}</span>
                          <input
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={(event) => savePrefPatch({
                              ...preferences,
                              categories: {
                                ...preferences.categories,
                                [key]: event.target.checked,
                              },
                            })}
                          />
                        </label>
                      ))}

                      {savingPrefs ? <div style={{ color: '#94a3b8', fontSize: '13px' }}>Saving preferences...</div> : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.48)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 800 }}>Earlier</h2>
              <div style={{ display: 'grid', gap: '14px' }}>
                {grouped.read.length ? grouped.read.map(renderCard) : (
                  <div style={{ borderRadius: '18px', border: '1px dashed rgba(255,255,255,0.16)', padding: '28px', color: '#94a3b8' }}>
                    Read notifications will stay here so you can revisit approvals, replies, and status changes.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
