import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';
import {
  changePassword,
  deactivateAccount,
  deleteAccount,
  fetchAccountActivity,
  fetchActiveSessions,
  fetchSettingsSummary,
  revokeOtherSessions,
  revokeSession,
  updatePrivacySettings,
} from '../components/context/Settings.service';
import {
  calculateProfileCompletion,
  dailyStudyHourOptions,
  experienceOptions,
  interestOptions,
  learningGoalOptions,
  skillOptions,
} from '../components/profile/profileOptions';

const sectionCard = {
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '30px',
  padding: '28px',
};

const fieldStyle = {
  width: '100%',
  padding: '13px 14px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '14px',
  color: 'white',
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  color: '#94a3b8',
  fontSize: '14px',
};

const chipStyle = (selected) => ({
  padding: '10px 14px',
  borderRadius: '999px',
  border: selected ? '1px solid rgba(96,165,250,0.35)' : '1px solid rgba(255,255,255,0.1)',
  background: selected ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.04)',
  color: selected ? '#bfdbfe' : '#e5e7eb',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 700,
});

const formatDateTime = (value) => {
  if (!value) return 'Recently';
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [saveState, setSaveState] = useState({ loading: false, success: '', error: '' });
  const [privacyState, setPrivacyState] = useState({ loading: false, success: '', error: '' });
  const [passwordState, setPasswordState] = useState({ loading: false, success: '', error: '' });
  const [dangerState, setDangerState] = useState({ loading: false, success: '', error: '', mode: '' });
  const [sessionsState, setSessionsState] = useState({ loading: true, items: [], currentSessionId: '', error: '', workingId: '', revokingOthers: false });
  const [activityState, setActivityState] = useState({ loading: true, items: [], error: '' });
  const [settingsSummary, setSettingsSummary] = useState({ notificationPreferences: null, privacy: { openToMentoring: false, openToCollaboration: true } });
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    username: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    phone: '',
    currentRole: '',
    targetRole: '',
    dailyStudyHours: '',
    yearsOfExperience: '',
    careerGoal: '',
    profileType: 'user',
    skills: [],
    interests: [],
    learningGoals: [],
    socialHeadline: '',
    openToMentoring: false,
    openToCollaboration: true,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [dangerPassword, setDangerPassword] = useState('');

  useEffect(() => {
    if (!user) return;

    setProfileForm({
      fullName: user.fullName || '',
      username: user.username || '',
      email: user.email || '',
      bio: user.profile?.bio || '',
      location: user.profile?.location || '',
      website: user.profile?.website || user.website || '',
      phone: user.profile?.phone || user.phone || '',
      currentRole: user.profile?.currentRole || '',
      targetRole: user.profile?.targetRole || '',
      dailyStudyHours: user.profile?.dailyStudyHours || '',
      yearsOfExperience: user.profile?.yearsOfExperience || '',
      careerGoal: user.profile?.careerGoal || '',
      profileType: user.profile?.profileType || user.profileType || 'user',
      skills: user.profile?.skills || [],
      interests: user.profile?.interests || [],
      learningGoals: user.profile?.learningGoals || [],
      socialHeadline: user.socialProfile?.headline || '',
      openToMentoring: Boolean(user.socialProfile?.openToMentoring),
      openToCollaboration: user.socialProfile?.openToCollaboration !== false,
    });
  }, [user]);

  const loadAccountPanels = async () => {
    try {
      const [summary, sessions, activity] = await Promise.all([
        fetchSettingsSummary(),
        fetchActiveSessions(),
        fetchAccountActivity(),
      ]);

      setSettingsSummary(summary);
      setProfileForm((prev) => ({
        ...prev,
        openToMentoring: Boolean(summary.privacy?.openToMentoring),
        openToCollaboration: summary.privacy?.openToCollaboration !== false,
      }));
      setSessionsState((prev) => ({
        ...prev,
        loading: false,
        items: sessions.sessions || [],
        currentSessionId: sessions.currentSessionId || '',
        error: '',
      }));
      setActivityState({
        loading: false,
        items: activity.activities || [],
        error: '',
      });
    } catch (err) {
      setSessionsState((prev) => ({
        ...prev,
        loading: false,
        error: err?.response?.data?.message || 'Unable to load active sessions.',
      }));
      setActivityState({
        loading: false,
        items: [],
        error: err?.response?.data?.message || 'Unable to load account activity.',
      });
    }
  };

  useEffect(() => {
    loadAccountPanels();
  }, []);

  const sections = useMemo(() => ([
    { id: 'profile', label: 'Profile' },
    { id: 'learning', label: 'Learning' },
    { id: 'security', label: 'Security' },
  ]), []);

  const completionScore = calculateProfileCompletion({
    fullName: profileForm.fullName,
    username: profileForm.username,
    email: profileForm.email,
    bio: profileForm.bio,
    location: profileForm.location,
    currentRole: profileForm.currentRole,
    targetRole: profileForm.targetRole,
    careerGoal: profileForm.careerGoal,
    dailyStudyHours: profileForm.dailyStudyHours,
    skills: profileForm.skills,
    interests: profileForm.interests,
    learningGoals: profileForm.learningGoals,
    socialHeadline: profileForm.socialHeadline,
  });

  const handleToggleListItem = (field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleSaveProfile = async () => {
    setSaveState({ loading: true, success: '', error: '' });
    try {
      await updateProfile({
        fullName: profileForm.fullName,
        username: profileForm.username,
        email: profileForm.email,
        bio: profileForm.bio,
        location: profileForm.location,
        website: profileForm.website,
        phone: profileForm.phone,
        currentRole: profileForm.currentRole,
        targetRole: profileForm.targetRole,
        dailyStudyHours: profileForm.dailyStudyHours,
        yearsOfExperience: profileForm.yearsOfExperience,
        careerGoal: profileForm.careerGoal,
        profileType: profileForm.profileType,
        skills: profileForm.skills,
        interests: profileForm.interests,
        learningGoals: profileForm.learningGoals,
        socialProfile: {
          headline: profileForm.socialHeadline,
          openToMentoring: profileForm.openToMentoring,
          openToCollaboration: profileForm.openToCollaboration,
        },
      });

      await updatePrivacySettings({
        makeProfilePublic: profileForm.openToMentoring,
        allowMessages: profileForm.openToCollaboration,
      });

      setSaveState({ loading: false, success: 'Profile and onboarding settings were saved.', error: '' });
    } catch (err) {
      setSaveState({ loading: false, success: '', error: err?.response?.data?.message || 'Unable to save profile settings.' });
    }
  };

  const handleSavePrivacyOnly = async () => {
    setPrivacyState({ loading: true, success: '', error: '' });
    try {
      await updatePrivacySettings({
        makeProfilePublic: profileForm.openToMentoring,
        allowMessages: profileForm.openToCollaboration,
      });
      setPrivacyState({ loading: false, success: 'Privacy settings updated.', error: '' });
    } catch (err) {
      setPrivacyState({ loading: false, success: '', error: err?.response?.data?.message || 'Unable to update privacy settings.' });
    }
  };

  const handleChangePassword = async () => {
    setPasswordState({ loading: true, success: '', error: '' });
    try {
      await changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordState({ loading: false, success: 'Password changed successfully.', error: '' });
    } catch (err) {
      setPasswordState({ loading: false, success: '', error: err?.response?.data?.message || 'Unable to change password.' });
    }
  };

  const handleRevokeSession = async (sessionId) => {
    setSessionsState((prev) => ({ ...prev, workingId: sessionId, error: '' }));
    try {
      const result = await revokeSession(sessionId);
      if (result.revokedCurrent) {
        await logout();
        navigate('/login', { replace: true });
        return;
      }
      await loadAccountPanels();
    } catch (err) {
      setSessionsState((prev) => ({
        ...prev,
        error: err?.response?.data?.message || 'Unable to revoke the selected session.',
      }));
    } finally {
      setSessionsState((prev) => ({ ...prev, workingId: '' }));
    }
  };

  const handleRevokeOthers = async () => {
    setSessionsState((prev) => ({ ...prev, revokingOthers: true, error: '' }));
    try {
      await revokeOtherSessions();
      await loadAccountPanels();
    } catch (err) {
      setSessionsState((prev) => ({
        ...prev,
        error: err?.response?.data?.message || 'Unable to revoke other sessions.',
      }));
    } finally {
      setSessionsState((prev) => ({ ...prev, revokingOthers: false }));
    }
  };

  const handleDangerAction = async (mode) => {
    setDangerState({ loading: true, success: '', error: '', mode });
    try {
      if (!dangerPassword.trim()) {
        throw new Error('Password is required to continue.');
      }

      if (mode === 'deactivate') {
        await deactivateAccount(dangerPassword.trim());
      } else {
        await deleteAccount(dangerPassword.trim());
      }

      setDangerPassword('');
      setDangerState({
        loading: false,
        success:
          mode === 'deactivate'
            ? 'Account deactivated. You will be signed out now.'
            : 'Account deleted. You will be signed out now.',
        error: '',
        mode,
      });
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setDangerState({
        loading: false,
        success: '',
        error: err?.response?.data?.message || err.message || 'Unable to complete that account action.',
        mode,
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 52%, #1e1b4b 100%)', color: 'white', position: 'relative' }}>
      <div style={{ height: '84px' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '40px 20px 60px' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Settings
              </h1>
              <p style={{ color: '#94a3b8', marginTop: '10px' }}>Manage your live profile, onboarding quality, password, and active sessions from one place.</p>
            </div>
            <button onClick={handleSaveProfile} disabled={saveState.loading} style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '14px', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: saveState.loading ? 0.75 : 1 }}>
              {saveState.loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>

          {!user?.profileSetupCompleted ? (
            <div style={{ marginBottom: '18px', borderRadius: '18px', padding: '16px 18px', background: 'rgba(250,204,21,0.12)', border: '1px solid rgba(253,224,71,0.22)', color: '#fef3c7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '16px', color: '#fde68a' }}>Profile setup is still optional</div>
                  <div style={{ marginTop: '6px', color: '#f8fafc', lineHeight: 1.6 }}>
                    You can keep using the app and finish the guided onboarding any time. The fields below already save directly to the same live profile.
                  </div>
                </div>
                <button onClick={() => navigate('/profile/setup')} style={{ padding: '11px 16px', background: '#fef3c7', border: 'none', borderRadius: '12px', color: '#78350f', fontWeight: 800, cursor: 'pointer' }}>
                  Continue Setup
                </button>
              </div>
            </div>
          ) : null}

          {saveState.success ? <div style={{ marginBottom: '18px', borderRadius: '16px', padding: '12px 16px', background: 'rgba(5,150,105,0.2)', border: '1px solid rgba(52,211,153,0.3)', color: '#bbf7d0' }}>{saveState.success}</div> : null}
          {saveState.error ? <div style={{ marginBottom: '18px', borderRadius: '16px', padding: '12px 16px', background: 'rgba(127,29,29,0.35)', border: '1px solid rgba(248,113,113,0.3)', color: '#fecaca' }}>{saveState.error}</div> : null}

          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '30px' }}>
            <div style={{ ...sectionCard, height: 'fit-content' }}>
              {sections.map((section) => (
                <button key={section.id} onClick={() => setActiveSection(section.id)} style={{ width: '100%', padding: '14px', background: activeSection === section.id ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent', border: 'none', borderRadius: '12px', color: activeSection === section.id ? 'white' : '#9ca3af', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginBottom: '6px', textAlign: 'left' }}>
                  {section.label}
                </button>
              ))}

              <div style={{ marginTop: '22px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', padding: '18px' }}>
                <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Profile completion</div>
                <div style={{ marginTop: '10px', fontSize: '34px', fontWeight: 900 }}>{completionScore}%</div>
                <div style={{ marginTop: '10px', height: '10px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ width: `${completionScore}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }} />
                </div>
                <div style={{ marginTop: '10px', color: '#cbd5e1', fontSize: '13px', lineHeight: 1.7 }}>
                  Settings and onboarding now use the same profile fields, so you can finish setup from either place.
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '24px' }}>
              {activeSection === 'profile' && (
                <>
                  <div style={sectionCard}>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 24px', color: '#e2e8f0' }}>Profile Information</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div><label style={labelStyle}>Full Name</label><input name="fullName" value={profileForm.fullName} onChange={(event) => setProfileForm((prev) => ({ ...prev, fullName: event.target.value }))} style={fieldStyle} /></div>
                      <div><label style={labelStyle}>Username</label><input name="username" value={profileForm.username} onChange={(event) => setProfileForm((prev) => ({ ...prev, username: event.target.value }))} style={fieldStyle} /></div>
                      <div><label style={labelStyle}>Email</label><input name="email" value={profileForm.email} onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))} style={fieldStyle} /></div>
                      <div><label style={labelStyle}>Phone</label><input name="phone" value={profileForm.phone} onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))} style={fieldStyle} /></div>
                      <div><label style={labelStyle}>Location</label><input name="location" value={profileForm.location} onChange={(event) => setProfileForm((prev) => ({ ...prev, location: event.target.value }))} style={fieldStyle} /></div>
                      <div><label style={labelStyle}>Website</label><input name="website" value={profileForm.website} onChange={(event) => setProfileForm((prev) => ({ ...prev, website: event.target.value }))} style={fieldStyle} /></div>
                    </div>
                    <div style={{ marginTop: '20px' }}>
                      <label style={labelStyle}>Bio</label>
                      <textarea name="bio" value={profileForm.bio} onChange={(event) => setProfileForm((prev) => ({ ...prev, bio: event.target.value }))} style={{ ...fieldStyle, minHeight: '130px', resize: 'vertical' }} />
                    </div>
                    <div style={{ marginTop: '20px' }}>
                      <label style={labelStyle}>Social Headline</label>
                      <input name="socialHeadline" value={profileForm.socialHeadline} onChange={(event) => setProfileForm((prev) => ({ ...prev, socialHeadline: event.target.value }))} style={fieldStyle} placeholder="Frontend learner building stronger DSA and AI habits" />
                    </div>
                  </div>

                  <div style={sectionCard}>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 24px', color: '#e2e8f0' }}>Privacy and Collaboration</h2>
                    {settingsSummary.notificationPreferences ? (
                      <div style={{ marginBottom: '16px', padding: '14px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1', lineHeight: 1.7 }}>
                        In-app notifications are <strong>{settingsSummary.notificationPreferences.inApp ? 'enabled' : 'disabled'}</strong>, email notifications are <strong>{settingsSummary.notificationPreferences.email ? 'enabled' : 'disabled'}</strong>, and push notifications are <strong>{settingsSummary.notificationPreferences.push ? 'enabled' : 'disabled'}</strong>.
                      </div>
                    ) : null}
                    <div style={{ display: 'grid', gap: '14px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '18px', padding: '16px', borderRadius: '18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>Show mentor availability</div>
                          <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Let people see that you are open to mentoring or guided collaboration.</div>
                        </div>
                        <input type="checkbox" checked={profileForm.openToMentoring} onChange={(event) => setProfileForm((prev) => ({ ...prev, openToMentoring: event.target.checked }))} />
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '18px', padding: '16px', borderRadius: '18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>Allow direct collaboration messages</div>
                          <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Controls whether other learners can reach you through the collaboration module.</div>
                        </div>
                        <input type="checkbox" checked={profileForm.openToCollaboration} onChange={(event) => setProfileForm((prev) => ({ ...prev, openToCollaboration: event.target.checked }))} />
                      </label>
                    </div>
                    {privacyState.success ? <div style={{ marginTop: '16px', color: '#bbf7d0' }}>{privacyState.success}</div> : null}
                    {privacyState.error ? <div style={{ marginTop: '16px', color: '#fecaca' }}>{privacyState.error}</div> : null}
                    <button onClick={handleSavePrivacyOnly} disabled={privacyState.loading} style={{ marginTop: '18px', padding: '12px 18px', background: 'rgba(59,130,246,0.16)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '14px', color: '#dbeafe', fontWeight: 700, cursor: 'pointer', opacity: privacyState.loading ? 0.7 : 1 }}>
                      {privacyState.loading ? 'Saving...' : 'Save Privacy'}
                    </button>
                  </div>
                </>
              )}

              {activeSection === 'learning' && (
                <>
                  <div style={sectionCard}>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 24px', color: '#e2e8f0' }}>Learning Profile</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div><label style={labelStyle}>Current Role</label><input value={profileForm.currentRole} onChange={(event) => setProfileForm((prev) => ({ ...prev, currentRole: event.target.value }))} style={fieldStyle} /></div>
                      <div><label style={labelStyle}>Target Role</label><input value={profileForm.targetRole} onChange={(event) => setProfileForm((prev) => ({ ...prev, targetRole: event.target.value }))} style={fieldStyle} /></div>
                      <div><label style={labelStyle}>Daily Study Hours</label><select value={profileForm.dailyStudyHours} onChange={(event) => setProfileForm((prev) => ({ ...prev, dailyStudyHours: event.target.value }))} style={fieldStyle}><option value="">Select study time</option>{dailyStudyHourOptions.map((option) => <option key={option} value={option}>{option} hrs</option>)}</select></div>
                      <div><label style={labelStyle}>Years of Experience</label><select value={profileForm.yearsOfExperience} onChange={(event) => setProfileForm((prev) => ({ ...prev, yearsOfExperience: event.target.value }))} style={fieldStyle}><option value="">Select experience</option>{experienceOptions.map((option) => <option key={option} value={option}>{option} years</option>)}</select></div>
                    </div>
                    <div style={{ marginTop: '20px' }}>
                      <label style={labelStyle}>Career Goal</label>
                      <textarea value={profileForm.careerGoal} onChange={(event) => setProfileForm((prev) => ({ ...prev, careerGoal: event.target.value }))} style={{ ...fieldStyle, minHeight: '110px', resize: 'vertical' }} />
                    </div>
                  </div>

                  <div style={sectionCard}>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 24px', color: '#e2e8f0' }}>Skills, Interests, and Goals</h2>

                    <div style={{ marginBottom: '22px' }}>
                      <div style={labelStyle}>Skills</div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {skillOptions.map((skill) => (
                          <button key={skill} type="button" onClick={() => handleToggleListItem('skills', skill)} style={chipStyle(profileForm.skills.includes(skill))}>
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: '22px' }}>
                      <div style={labelStyle}>Interests</div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {interestOptions.map((interest) => (
                          <button key={interest} type="button" onClick={() => handleToggleListItem('interests', interest)} style={chipStyle(profileForm.interests.includes(interest))}>
                            {interest}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={labelStyle}>Learning Goals</div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {learningGoalOptions.map((goal) => (
                          <button key={goal} type="button" onClick={() => handleToggleListItem('learningGoals', goal)} style={chipStyle(profileForm.learningGoals.includes(goal))}>
                            {goal}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeSection === 'security' && (
                <>
                  <div style={sectionCard}>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 24px', color: '#e2e8f0' }}>Password</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '14px', alignItems: 'end' }}>
                      <div><label style={labelStyle}>Current Password</label><input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))} style={fieldStyle} /></div>
                      <div><label style={labelStyle}>New Password</label><input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))} style={fieldStyle} /></div>
                      <div><label style={labelStyle}>Confirm Password</label><input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))} style={fieldStyle} /></div>
                      <button onClick={handleChangePassword} disabled={passwordState.loading} style={{ padding: '12px 18px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '14px', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: passwordState.loading ? 0.75 : 1 }}>
                        {passwordState.loading ? 'Saving...' : 'Change'}
                      </button>
                    </div>
                    {passwordState.success ? <div style={{ marginTop: '14px', color: '#bbf7d0' }}>{passwordState.success}</div> : null}
                    {passwordState.error ? <div style={{ marginTop: '14px', color: '#fecaca' }}>{passwordState.error}</div> : null}
                  </div>

                  <div style={sectionCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#e2e8f0' }}>Active Sessions</h2>
                        <p style={{ color: '#94a3b8', marginTop: '8px' }}>Review your current StudySphere sessions and revoke anything you no longer trust.</p>
                      </div>
                      <button onClick={handleRevokeOthers} disabled={sessionsState.revokingOthers} style={{ padding: '12px 18px', background: 'rgba(248,113,113,0.16)', border: '1px solid rgba(248,113,113,0.18)', borderRadius: '14px', color: '#fecaca', fontWeight: 700, cursor: 'pointer', opacity: sessionsState.revokingOthers ? 0.75 : 1 }}>
                        {sessionsState.revokingOthers ? 'Revoking...' : 'Logout Other Sessions'}
                      </button>
                    </div>
                    {sessionsState.error ? <div style={{ marginTop: '14px', color: '#fecaca' }}>{sessionsState.error}</div> : null}
                    <div style={{ display: 'grid', gap: '14px', marginTop: '18px' }}>
                      {sessionsState.loading ? (
                        <div style={{ color: '#94a3b8' }}>Loading sessions...</div>
                      ) : sessionsState.items.length ? (
                        sessionsState.items.map((session) => (
                          <div key={session.id} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div>
                                  <div style={{ fontWeight: 800 }}>{session.displayName || 'StudySphere session'} {session.isCurrent ? <span style={{ color: '#86efac', fontSize: '12px' }}>(Current)</span> : null}</div>
                                  <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>
                                  {session.deviceLabel || 'Browser session'} | {session.location || 'Unknown location'} | Started {formatDateTime(session.createdAt)} | Last active {formatDateTime(session.lastActivityAt)}
                                  </div>
                                  <div style={{ color: '#64748b', fontSize: '12px', marginTop: '6px' }}>
                                    {session.provider || 'local'} | {session.persistent ? 'Remembered device' : 'Session-only login'} | {session.ipAddress || 'IP unavailable'}
                                  </div>
                                </div>
                              {!session.isCurrent ? (
                                <button onClick={() => handleRevokeSession(session.id)} disabled={sessionsState.workingId === session.id} style={{ padding: '10px 14px', background: 'rgba(127,29,29,0.22)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '12px', color: '#fecaca', fontWeight: 700, cursor: 'pointer', opacity: sessionsState.workingId === session.id ? 0.75 : 1 }}>
                                  {sessionsState.workingId === session.id ? 'Revoking...' : 'Revoke'}
                                </button>
                              ) : null}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: '#94a3b8' }}>No session records found.</div>
                      )}
                    </div>
                  </div>

                  <div style={sectionCard}>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 18px', color: '#e2e8f0' }}>Recent Account Activity</h2>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {activityState.loading ? (
                        <div style={{ color: '#94a3b8' }}>Loading account activity...</div>
                      ) : activityState.items.length ? (
                        activityState.items.slice(0, 10).map((activity) => (
                          <div key={activity._id || `${activity.action}-${activity.createdAt}`} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px 16px' }}>
                            <div style={{ fontWeight: 700 }}>{activity.label || activity.action}</div>
                            <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>{formatDateTime(activity.createdAt)}</div>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: '#94a3b8' }}>No recent activity yet.</div>
                      )}
                    </div>
                  </div>

                  <div style={{ ...sectionCard, border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(127,29,29,0.14)' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 14px', color: '#fecaca' }}>Danger Zone</h2>
                    <p style={{ color: '#fecaca', marginTop: 0, lineHeight: 1.7 }}>
                      Deactivate your account if you want to pause access, or permanently delete it if you want everything removed.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '14px', alignItems: 'end' }}>
                      <div>
                        <label style={labelStyle}>Confirm with password</label>
                        <input
                          type="password"
                          value={dangerPassword}
                          onChange={(event) => setDangerPassword(event.target.value)}
                          style={fieldStyle}
                          placeholder="Enter your current password"
                        />
                      </div>
                      <button
                        onClick={() => handleDangerAction('deactivate')}
                        disabled={dangerState.loading}
                        style={{ padding: '12px 16px', background: 'rgba(251,191,36,0.18)', border: '1px solid rgba(251,191,36,0.24)', borderRadius: '14px', color: '#fde68a', fontWeight: 700, cursor: 'pointer', opacity: dangerState.loading ? 0.75 : 1 }}
                      >
                        {dangerState.loading && dangerState.mode === 'deactivate' ? 'Working...' : 'Deactivate'}
                      </button>
                      <button
                        onClick={() => handleDangerAction('delete')}
                        disabled={dangerState.loading}
                        style={{ padding: '12px 16px', background: 'rgba(127,29,29,0.28)', border: '1px solid rgba(248,113,113,0.24)', borderRadius: '14px', color: '#fecaca', fontWeight: 700, cursor: 'pointer', opacity: dangerState.loading ? 0.75 : 1 }}
                      >
                        {dangerState.loading && dangerState.mode === 'delete' ? 'Working...' : 'Delete Account'}
                      </button>
                    </div>
                    {dangerState.success ? <div style={{ marginTop: '14px', color: '#bbf7d0' }}>{dangerState.success}</div> : null}
                    {dangerState.error ? <div style={{ marginTop: '14px', color: '#fecaca' }}>{dangerState.error}</div> : null}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
