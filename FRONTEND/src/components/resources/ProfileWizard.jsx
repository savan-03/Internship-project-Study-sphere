import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  calculateProfileCompletion,
  dailyStudyHourOptions,
  experienceOptions,
  interestOptions,
  learningGoalOptions,
  skillOptions,
} from '../profile/profileOptions';

const steps = [
  { number: 1, title: 'Basics', subtitle: 'Only the essentials so you can get into the app quickly.' },
  { number: 2, title: 'Learning', subtitle: 'Tell StudySphere what you are learning and aiming for.' },
  { number: 3, title: 'Community', subtitle: 'Set your collaboration tone and finish your profile.' },
];

const pageBackground = {
  minHeight: '100vh',
  backgroundColor: '#000000',
  color: '#0f172a',
  position: 'relative',
  overflow: 'hidden',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const surfaceTint = 'rgba(15,23,42,0.78)';
const surfaceMuted = 'rgba(30,41,59,0.72)';

const glassCard = {
  background: 'rgba(15,23,42,0.72)',
  border: '1px solid rgba(148,163,184,0.18)',
  boxShadow: '0 32px 80px -48px rgba(0,0,0,0.68)',
  backdropFilter: 'blur(16px)',
};

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '14px',
  border: '1px solid rgba(148,163,184,0.22)',
  background: surfaceTint,
  color: '#e2e8f0',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 700,
  marginBottom: '10px',
  color: '#cbd5e1',
};

const chipBase = (selected) => ({
  padding: '10px 14px',
  borderRadius: '14px',
  border: selected ? '1px solid #8b5cf6' : '1px solid rgba(148,163,184,0.22)',
  background: selected ? 'linear-gradient(135deg, #818cf8, #ec4899)' : surfaceTint,
  color: selected ? '#ffffff' : '#cbd5e1',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 600,
  transition: 'all 0.2s ease',
  boxShadow: selected ? '0 18px 30px -22px rgba(139,92,246,0.7)' : 'none',
});

const emptyForm = {
  fullName: '',
  username: '',
  email: '',
  bio: '',
  location: '',
  currentRole: '',
  targetRole: '',
  yearsOfExperience: '',
  dailyStudyHours: '',
  careerGoal: '',
  skills: [],
  interests: [],
  learningGoals: [],
  socialHeadline: '',
  website: '',
  phone: '',
  openToMentoring: false,
  openToCollaboration: true,
};

const ProfileWizard = ({ onComplete }) => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    setFormData({
      fullName: user.fullName || '',
      username: user.username || '',
      email: user.email || '',
      bio: user.profile?.bio || user.bio || '',
      location: user.profile?.location || user.location || '',
      currentRole: user.profile?.currentRole || user.currentRole || '',
      targetRole: user.profile?.targetRole || user.targetRole || '',
      yearsOfExperience: user.profile?.yearsOfExperience || user.yearsOfExperience || '',
      dailyStudyHours: user.profile?.dailyStudyHours || user.dailyStudyHours || '',
      careerGoal: user.profile?.careerGoal || user.careerGoal || '',
      skills: user.profile?.skills || user.skills || [],
      interests: user.profile?.interests || user.interests || [],
      learningGoals: user.profile?.learningGoals || user.learningGoals || [],
      socialHeadline: user.socialProfile?.headline || '',
      website: user.profile?.website || user.website || '',
      phone: user.profile?.phone || user.phone || '',
      openToMentoring: Boolean(user.socialProfile?.openToMentoring),
      openToCollaboration: user.socialProfile?.openToCollaboration !== false,
    });
  }, [user]);

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const toggleArrayItem = (field, item) => {
    updateFormData(
      field,
      formData[field].includes(item)
        ? formData[field].filter((value) => value !== item)
        : [...formData[field], item]
    );
  };

  const validateStep = (step) => {
    const nextErrors = {};

    if (step === 1) {
      if (!formData.fullName.trim()) nextErrors.fullName = 'Full name is required';
      if (!formData.username.trim()) nextErrors.username = 'Username is required';
      if (!formData.email.trim()) nextErrors.email = 'Email is required';
    }

    if (step === 2) {
      if (!formData.targetRole.trim()) nextErrors.targetRole = 'Target role is required';
      if (formData.skills.length === 0) nextErrors.skills = 'Pick at least one skill';
      if (formData.learningGoals.length === 0) nextErrors.learningGoals = 'Pick at least one learning goal';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        location: formData.location,
        currentRole: formData.currentRole,
        targetRole: formData.targetRole,
        yearsOfExperience: formData.yearsOfExperience,
        dailyStudyHours: formData.dailyStudyHours,
        careerGoal: formData.careerGoal,
        skills: formData.skills,
        interests: formData.interests,
        learningGoals: formData.learningGoals,
        website: formData.website,
        phone: formData.phone,
        socialProfile: {
          headline: formData.socialHeadline,
          openToMentoring: formData.openToMentoring,
          openToCollaboration: formData.openToCollaboration,
        },
      };

      await updateProfile(payload);
      localStorage.setItem('userProfile', JSON.stringify(payload));
      if (onComplete) onComplete(payload);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error.response?.data?.message || 'Unable to save profile right now.',
      }));
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);
  };

  const handleSkipForNow = () => {
    navigate('/dashboard', { replace: true });
  };

  const completionScore = calculateProfileCompletion(formData);

  const renderChipGrid = (items, field) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
      {items.map((item) => (
        <button key={item} type="button" onClick={() => toggleArrayItem(field, item)} style={chipBase(formData[field].includes(item))}>
          {item}
        </button>
      ))}
    </div>
  );

  const renderStep = () => {
    if (currentStep === 1) {
      return (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input style={{ ...inputStyle, borderColor: errors.fullName ? '#fda4af' : '#cbd5e1' }} value={formData.fullName} onChange={(e) => updateFormData('fullName', e.target.value)} placeholder="John Doe" />
              {errors.fullName && <p style={{ marginTop: '6px', fontSize: '12px', color: '#e11d48' }}>{errors.fullName}</p>}
            </div>
            <div>
              <label style={labelStyle}>Username</label>
              <input style={{ ...inputStyle, borderColor: errors.username ? '#fda4af' : '#cbd5e1' }} value={formData.username} onChange={(e) => updateFormData('username', e.target.value)} placeholder="johndoe" />
              {errors.username && <p style={{ marginTop: '6px', fontSize: '12px', color: '#e11d48' }}>{errors.username}</p>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" style={{ ...inputStyle, borderColor: errors.email ? '#fda4af' : '#cbd5e1' }} value={formData.email} onChange={(e) => updateFormData('email', e.target.value)} placeholder="john@example.com" />
              {errors.email && <p style={{ marginTop: '6px', fontSize: '12px', color: '#e11d48' }}>{errors.email}</p>}
            </div>
            <div>
              <label style={labelStyle}>Location</label>
              <input style={inputStyle} value={formData.location} onChange={(e) => updateFormData('location', e.target.value)} placeholder="Ahmedabad, India" />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Bio</label>
            <textarea rows="4" style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} value={formData.bio} onChange={(e) => updateFormData('bio', e.target.value)} placeholder="A short intro is enough. You can expand it later in settings." />
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Current Role</label>
              <input style={inputStyle} value={formData.currentRole} onChange={(e) => updateFormData('currentRole', e.target.value)} placeholder="Student, Software Engineer, etc." />
            </div>
            <div>
              <label style={labelStyle}>Target Role</label>
              <input style={{ ...inputStyle, borderColor: errors.targetRole ? '#fda4af' : '#cbd5e1' }} value={formData.targetRole} onChange={(e) => updateFormData('targetRole', e.target.value)} placeholder="Frontend Developer, Data Scientist" />
              {errors.targetRole && <p style={{ marginTop: '6px', fontSize: '12px', color: '#e11d48' }}>{errors.targetRole}</p>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Years of Experience</label>
              <select style={inputStyle} value={formData.yearsOfExperience} onChange={(e) => updateFormData('yearsOfExperience', e.target.value)}>
                <option value="">Select experience</option>
                {experienceOptions.map((option) => <option key={option} value={option}>{option} years</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Daily Study Hours</label>
              <select style={inputStyle} value={formData.dailyStudyHours} onChange={(e) => updateFormData('dailyStudyHours', e.target.value)}>
                <option value="">Select study hours</option>
                {dailyStudyHourOptions.map((option) => <option key={option} value={option}>{option} hrs</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={labelStyle}>Skills</label>
            {renderChipGrid(skillOptions, 'skills')}
            {errors.skills && <p style={{ marginTop: '8px', fontSize: '12px', color: '#e11d48' }}>{errors.skills}</p>}
          </div>

          <div>
            <label style={labelStyle}>Learning Goals</label>
            {renderChipGrid(learningGoalOptions, 'learningGoals')}
            {errors.learningGoals && <p style={{ marginTop: '8px', fontSize: '12px', color: '#e11d48' }}>{errors.learningGoals}</p>}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div style={{ marginBottom: '22px' }}>
          <label style={labelStyle}>Interests</label>
          {renderChipGrid(interestOptions, 'interests')}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Career Goal</label>
          <textarea rows="4" style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} value={formData.careerGoal} onChange={(e) => updateFormData('careerGoal', e.target.value)} placeholder="What are you trying to achieve next?" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Website</label>
            <input style={inputStyle} value={formData.website} onChange={(e) => updateFormData('website', e.target.value)} placeholder="https://your-portfolio.com" />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} value={formData.phone} onChange={(e) => updateFormData('phone', e.target.value)} placeholder="+91..." />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Social Headline</label>
          <input style={inputStyle} value={formData.socialHeadline} onChange={(e) => updateFormData('socialHeadline', e.target.value)} placeholder="Frontend learner building stronger DSA and AI habits" />
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '16px', background: surfaceTint, border: '1px solid rgba(148,163,184,0.22)', color: '#cbd5e1', cursor: 'pointer' }}>
            <input type="checkbox" checked={formData.openToMentoring} onChange={(e) => updateFormData('openToMentoring', e.target.checked)} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Show mentor availability on my profile</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '16px', background: surfaceTint, border: '1px solid rgba(148,163,184,0.22)', color: '#cbd5e1', cursor: 'pointer' }}>
            <input type="checkbox" checked={formData.openToCollaboration} onChange={(e) => updateFormData('openToCollaboration', e.target.checked)} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Allow direct collaboration messages</span>
          </label>
        </div>
      </div>
    );
  };

  return (
    <div style={pageBackground}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,40,0.95) 100%)' }}>
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(147,51,234,0.3) 0%, rgba(79,70,229,0.1) 70%)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(168,85,247,0.1) 70%)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '50%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(37,99,235,0.1) 70%)', borderRadius: '50%', filter: 'blur(80px)', transform: 'translate(-50%, -50%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      <div style={{ height: '92px' }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '24px 20px 48px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ ...glassCard, borderRadius: '30px', padding: '22px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', padding: '7px 14px', borderRadius: '999px', background: '#ede9fe', color: '#7c3aed', fontSize: '12px', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Profile Setup
                </div>
                <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.05, margin: '0 0 8px', fontWeight: 900 }}>Short onboarding, same live profile</h1>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '15px', lineHeight: 1.7, maxWidth: '720px' }}>
                  This flow now uses the same fields as settings, keeps only what the backend actually saves, and gets you into the app faster.
                </p>
              </div>
              <div style={{ minWidth: '220px', padding: '18px 20px', borderRadius: '24px', background: 'rgba(30,41,59,0.82)', border: '1px solid rgba(148,163,184,0.18)' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '8px' }}>Completion</div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#f8fafc' }}>{completionScore}%</div>
                <div style={{ marginTop: '10px', height: '8px', borderRadius: '999px', background: 'rgba(148,163,184,0.2)' }}>
                  <div style={{ width: `${completionScore}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(135deg, #818cf8, #ec4899)' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr)', gap: '20px' }}>
            <aside style={{ ...glassCard, borderRadius: '28px', padding: '22px', alignSelf: 'start' }}>
              {steps.map((step) => {
                const isActive = currentStep === step.number;
                const isComplete = currentStep > step.number;
                return (
                  <div key={step.number} style={{ display: 'flex', gap: '14px', padding: '14px 0', borderBottom: step.number === steps.length ? 'none' : '1px solid #e2e8f0' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, background: isComplete ? 'rgba(34,197,94,0.18)' : isActive ? 'linear-gradient(135deg, #818cf8, #ec4899)' : 'rgba(30,41,59,0.9)', color: isComplete ? '#86efac' : isActive ? '#ffffff' : '#94a3b8', border: isActive ? 'none' : '1px solid rgba(148,163,184,0.18)' }}>
                      {isComplete ? 'OK' : step.number}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>{step.title}</div>
                      <div style={{ fontSize: '12px', lineHeight: 1.6, color: '#94a3b8' }}>{step.subtitle}</div>
                    </div>
                  </div>
                );
              })}
            </aside>

            <section style={{ ...glassCard, borderRadius: '30px', overflow: 'hidden' }}>
              <div style={{ padding: '28px 28px 10px' }}>
                <h2 style={{ fontSize: '30px', margin: '0 0 8px', fontWeight: 900, color: '#f8fafc' }}>{steps[currentStep - 1].title}</h2>
                <p style={{ color: '#94a3b8', margin: '0 0 26px', lineHeight: 1.7 }}>{steps[currentStep - 1].subtitle}</p>
                {errors.submit && (
                  <div style={{ marginBottom: '18px', padding: '14px 16px', borderRadius: '16px', border: '1px solid #fecdd3', background: '#fff1f2', color: '#be123c', fontSize: '14px' }}>
                    {errors.submit}
                  </div>
                )}
                <div style={{ marginBottom: '18px', padding: '12px 14px', borderRadius: '14px', background: surfaceMuted, border: '1px solid rgba(148,163,184,0.18)', color: '#94a3b8', fontSize: '13px', lineHeight: 1.7 }}>
                  Only a few fields are required. Everything else can be adjusted later in settings without blocking the rest of the app.
                </div>
                {renderStep()}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '20px 28px 28px', background: 'rgba(15,23,42,0.86)', borderTop: '1px solid rgba(148,163,184,0.18)' }}>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                  {currentStep === 1 && 'Start with identity basics so navigation, social profile, and uploads have the right ownership.'}
                  {currentStep === 2 && 'This powers AI, DSA suggestions, analytics, and dashboard guidance.'}
                  {currentStep === 3 && 'Finish the social and collaboration tone for your profile.'}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={handleSkipForNow} type="button" style={{ padding: '12px 18px', borderRadius: '14px', border: '1px solid rgba(148,163,184,0.22)', background: surfaceTint, color: '#cbd5e1', cursor: 'pointer', fontWeight: 700 }}>
                    Skip for now
                  </button>
                  {currentStep > 1 && (
                    <button onClick={() => setCurrentStep((step) => step - 1)} style={{ padding: '12px 18px', borderRadius: '14px', border: '1px solid rgba(148,163,184,0.22)', background: surfaceTint, color: '#cbd5e1', cursor: 'pointer', fontWeight: 700 }}>
                      Back
                    </button>
                  )}
                  {currentStep < steps.length ? (
                    <button onClick={() => { if (validateStep(currentStep)) setCurrentStep((step) => step + 1); }} style={{ padding: '12px 18px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #818cf8, #ec4899)', color: '#ffffff', cursor: 'pointer', fontWeight: 800, boxShadow: '0 20px 36px -24px rgba(139,92,246,0.8)' }}>
                      Continue
                    </button>
                  ) : (
                    <button onClick={handleSubmit} disabled={isSubmitting} style={{ padding: '12px 18px', borderRadius: '14px', border: 'none', background: isSubmitting ? '#cbd5e1' : 'linear-gradient(135deg, #818cf8, #ec4899)', color: '#ffffff', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 800, boxShadow: isSubmitting ? 'none' : '0 20px 36px -24px rgba(139,92,246,0.8)' }}>
                      {isSubmitting ? 'Saving...' : 'Complete Setup'}
                    </button>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileWizard;
