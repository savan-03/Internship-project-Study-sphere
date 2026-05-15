import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';
import { useTheme } from '../components/context/ThemeContext';

const featureHighlights = [
  {
    title: 'Personalized paths',
    description: 'AI-guided study flows shaped around your weak topics and daily pace.',
  },
  {
    title: 'Practice that adapts',
    description: 'Move from guided revision to DSA problem-solving without losing momentum.',
  },
  {
    title: 'Community support',
    description: 'Study groups, discussions, and mentorship are ready when you need them.',
  },
];

const statPills = [
  { value: '500+', label: 'Practice sets' },
  { value: 'AI', label: 'Study copilot' },
  { value: '24/7', label: 'Learning flow' },
];

const Loginpage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '', rememberMe: false });
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    role: 'user',
    acceptTerms: false,
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, user, loading, isAuthenticated } = useAuth();
  const { isDark } = useTheme();

  useEffect(() => {
    setIsLogin(location.pathname !== '/register');
  }, [location.pathname]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setIsSubmitting(true);
    try {
      const loggedInUser = await login(loginData);
      if (loggedInUser?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (registerData.password !== registerData.confirmPassword) {
      setApiError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const registeredUser = await register(registerData);
      if (registeredUser?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = (loginMode) => {
    setIsLogin(loginMode);
    setApiError('');
    navigate(loginMode ? '/login' : '/register', { replace: true });
  };

  const passwordsMatch = registerData.password === registerData.confirmPassword;
  const isPasswordValid =
    registerData.password.length >= 8 &&
    /[A-Z]/.test(registerData.password) &&
    /[a-z]/.test(registerData.password) &&
    /\d/.test(registerData.password);
  const isFormValid =
    registerData.fullName &&
    registerData.email &&
    registerData.username &&
    registerData.password &&
    registerData.confirmPassword &&
    passwordsMatch &&
    isPasswordValid &&
    registerData.acceptTerms;

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: isDark ? 'rgba(15,23,42,0.72)' : 'rgba(255,255,255,0.94)',
    border: `1px solid ${isDark ? 'rgba(148,163,184,0.25)' : 'rgba(148,163,184,0.28)'}`,
    borderRadius: '14px',
    color: isDark ? '#f8fafc' : '#0f172a',
    fontSize: '15px',
    marginBottom: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
    boxShadow: isDark ? '0 8px 30px rgba(2,6,23,0.2)' : '0 10px 30px rgba(148,163,184,0.08)',
  };

  if (!loading && isAuthenticated && user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: isDark ? '#020617' : '#eef2ff',
        color: 'white',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style>{`
        .auth-readable-input::placeholder {
          color: ${isDark ? 'rgba(226,232,240,0.82)' : 'rgba(71,85,105,0.8)'};
          opacity: 1;
        }
        .auth-readable-input option {
          color: #0f172a;
        }
        .auth-readable-input:focus {
          border-color: ${isDark ? 'rgba(96,165,250,0.6)' : 'rgba(99,102,241,0.45)'};
          box-shadow: ${isDark ? '0 0 0 4px rgba(59,130,246,0.12)' : '0 0 0 4px rgba(99,102,241,0.1)'};
          transform: translateY(-1px);
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          background: isDark
            ? 'linear-gradient(135deg, rgba(2,6,23,1) 0%, rgba(17,24,39,1) 50%, rgba(15,23,42,1) 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 52%, #fdf2f8 100%)',
        }}
      >
        <motion.div
          style={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: '500px',
            height: '500px',
            background: isDark
              ? 'radial-gradient(circle, rgba(147,51,234,0.34) 0%, rgba(79,70,229,0.12) 70%)'
              : 'radial-gradient(circle, rgba(147,51,234,0.16) 0%, rgba(79,70,229,0.05) 70%)',
            borderRadius: '50%',
            filter: 'blur(80px)',
          }}
          animate={{
            x: mousePosition.x * 0.5,
            y: mousePosition.y * 0.5,
            scale: [1, 1.08, 1],
          }}
          transition={{
            x: { type: 'spring', stiffness: 40, damping: 20 },
            y: { type: 'spring', stiffness: 40, damping: 20 },
            scale: { duration: 8, repeat: Infinity, repeatType: 'reverse' },
          }}
        />
        <motion.div
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '5%',
            width: '600px',
            height: '600px',
            background: isDark
              ? 'radial-gradient(circle, rgba(236,72,153,0.28) 0%, rgba(168,85,247,0.12) 70%)'
              : 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, rgba(168,85,247,0.04) 70%)',
            borderRadius: '50%',
            filter: 'blur(80px)',
          }}
          animate={{
            x: -mousePosition.x * 0.35,
            y: -mousePosition.y * 0.35,
            scale: [1, 1.14, 1],
          }}
          transition={{
            x: { type: 'spring', stiffness: 40, damping: 20 },
            y: { type: 'spring', stiffness: 40, damping: 20 },
            scale: { duration: 9, repeat: Infinity, repeatType: 'reverse' },
          }}
        />
        <motion.div
          style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            width: '420px',
            height: '420px',
            background: isDark
              ? 'radial-gradient(circle, rgba(59,130,246,0.28) 0%, rgba(37,99,235,0.1) 70%)'
              : 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(37,99,235,0.04) 70%)',
            borderRadius: '50%',
            filter: 'blur(80px)',
          }}
          animate={{
            x: mousePosition.x * 0.2,
            y: mousePosition.y * 0.2,
            scale: [1, 1.1, 1],
          }}
          transition={{
            x: { type: 'spring', stiffness: 40, damping: 20 },
            y: { type: 'spring', stiffness: 40, damping: 20 },
            scale: { duration: 7, repeat: Infinity, repeatType: 'reverse' },
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: isDark
              ? 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)'
              : 'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div style={{ height: '80px', position: 'relative', zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '40px 20px 56px' }}>
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            alignItems: 'stretch',
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              background: isDark ? 'rgba(15,23,42,0.52)' : 'rgba(255,255,255,0.78)',
              backdropFilter: 'blur(16px)',
              padding: '32px',
              borderRadius: '24px',
              border: isDark ? '1px solid rgba(148,163,184,0.14)' : '1px solid rgba(148,163,184,0.18)',
              boxShadow: isDark
                ? '0 24px 80px rgba(2,6,23,0.4)'
                : '0 30px 80px rgba(148,163,184,0.18)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '100%',
            }}
          >
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                style={{
                  display: 'inline-block',
                  padding: '6px 16px',
                  background: isDark ? 'rgba(139,92,246,0.18)' : 'rgba(139,92,246,0.12)',
                  borderRadius: '999px',
                  marginBottom: '24px',
                  border: `1px solid ${isDark ? 'rgba(167,139,250,0.24)' : 'rgba(167,139,250,0.18)'}`,
                }}
              >
                <span
                  style={{
                    background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                  }}
                >
                  STUDYSPHERE ACCESS
                </span>
              </motion.div>

              <motion.h1
                key={isLogin ? 'login-title' : 'register-title'}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                style={{
                  fontSize: 'clamp(38px, 6vw, 60px)',
                  lineHeight: 1,
                  fontWeight: 800,
                  marginBottom: '18px',
                  color: isDark ? '#ffffff' : '#0f172a',
                }}
              >
                {isLogin ? 'Return to your momentum.' : 'Create your learning home.'}
              </motion.h1>

              <motion.p
                key={isLogin ? 'login-copy' : 'register-copy'}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.45 }}
                style={{
                  fontSize: '16px',
                  color: isDark ? '#cbd5e1' : '#475569',
                  marginBottom: '28px',
                  lineHeight: 1.7,
                  maxWidth: '560px',
                }}
              >
                {isLogin
                  ? 'Jump back into your personalized dashboard, recent practice, and AI-guided next steps without losing your flow.'
                  : 'Open your free account to start DSA practice, resource discovery, AI revision, and community learning from one place.'}
              </motion.p>

              <div style={{ display: 'grid', gap: '14px', marginBottom: '28px' }}>
                {featureHighlights.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16 + index * 0.08, duration: 0.45 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    style={{
                      display: 'flex',
                      gap: '14px',
                      alignItems: 'flex-start',
                      padding: '16px 18px',
                      borderRadius: '18px',
                      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.72)',
                      border: isDark ? '1px solid rgba(148,163,184,0.12)' : '1px solid rgba(148,163,184,0.16)',
                    }}
                  >
                    <div
                      style={{
                        minWidth: '42px',
                        height: '42px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.95), rgba(168,85,247,0.95))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 700,
                        boxShadow: '0 12px 30px rgba(99,102,241,0.28)',
                      }}
                    >
                      {`0${index + 1}`}
                    </div>
                    <div>
                      <div
                        style={{
                          color: isDark ? '#f8fafc' : '#0f172a',
                          fontWeight: 700,
                          marginBottom: '4px',
                          fontSize: '15px',
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          color: isDark ? '#94a3b8' : '#64748b',
                          fontSize: '14px',
                          lineHeight: 1.6,
                        }}
                      >
                        {item.description}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '12px',
              }}
            >
              {statPills.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.38 + index * 0.08, duration: 0.35 }}
                  whileHover={{ y: -3 }}
                  style={{
                    padding: '14px 12px',
                    borderRadius: '18px',
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(248,250,252,0.88)',
                    border: isDark ? '1px solid rgba(148,163,184,0.1)' : '1px solid rgba(148,163,184,0.12)',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontWeight: 800,
                      fontSize: '18px',
                      marginBottom: '4px',
                    }}
                  >
                    {item.value}
                  </div>
                  <div
                    style={{
                      color: isDark ? '#94a3b8' : '#64748b',
                      fontSize: '12px',
                    }}
                  >
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.08 }}
            style={{
              background: isDark ? 'rgba(15,23,42,0.58)' : 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(16px)',
              padding: '32px',
              borderRadius: '24px',
              border: isDark ? '1px solid rgba(148,163,184,0.14)' : '1px solid rgba(148,163,184,0.18)',
              boxShadow: isDark
                ? '0 24px 80px rgba(2,6,23,0.4)'
                : '0 30px 80px rgba(148,163,184,0.18)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <motion.div
                animate={{ rotate: [0, 6, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, repeatType: 'loop' }}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  boxShadow: '0 16px 36px rgba(99,102,241,0.28)',
                }}
              >
                SS
              </motion.div>
              <div>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: isDark ? '#ffffff' : '#0f172a',
                  }}
                >
                  StudySphere
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: isDark ? '#94a3b8' : '#64748b',
                  }}
                >
                  {isLogin ? 'Welcome back to your workspace' : 'Create your account in minutes'}
                </div>
              </div>
            </div>

            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(239,68,68,0.14)',
                  border: '1px solid rgba(239,68,68,0.35)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: '#fca5a5',
                }}
              >
                {apiError}
              </motion.div>
            )}

            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '5px',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(241,245,249,0.92)',
                borderRadius: '16px',
                marginBottom: '24px',
                border: isDark ? '1px solid rgba(148,163,184,0.1)' : '1px solid rgba(148,163,184,0.14)',
              }}
            >
              <motion.button
                type="button"
                onClick={() => handleToggle(true)}
                whileTap={{ scale: 0.98 }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: isLogin ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent',
                  border: 'none',
                  borderRadius: '12px',
                  color: isLogin ? '#ffffff' : isDark ? '#94a3b8' : '#475569',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: isLogin ? '0 14px 30px rgba(99,102,241,0.24)' : 'none',
                }}
              >
                Login
              </motion.button>
              <motion.button
                type="button"
                onClick={() => handleToggle(false)}
                whileTap={{ scale: 0.98 }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: !isLogin ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'transparent',
                  border: 'none',
                  borderRadius: '12px',
                  color: !isLogin ? '#ffffff' : isDark ? '#94a3b8' : '#475569',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: !isLogin ? '0 14px 30px rgba(168,85,247,0.24)' : 'none',
                }}
              >
                Sign Up
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: 18, y: 8 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: -18, y: -8 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  onSubmit={handleLoginSubmit}
                >
                  <input
                    className="auth-readable-input"
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="Email Address"
                    style={inputStyle}
                    required
                  />

                  <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <input
                      className="auth-readable-input"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Password"
                      style={{ ...inputStyle, paddingRight: '56px', marginBottom: 0 }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: isDark ? '#cbd5e1' : '#64748b',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '24px',
                    }}
                  >
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={loginData.rememberMe}
                      onChange={handleLoginChange}
                    />
                    <span style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>
                      Remember me
                    </span>
                  </label>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={isSubmitting ? undefined : { scale: 1.01, y: -1 }}
                    whileTap={isSubmitting ? undefined : { scale: 0.99 }}
                    style={{
                      width: '100%',
                      padding: '13px',
                      background: isSubmitting
                        ? 'rgba(255,255,255,0.1)'
                        : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      border: 'none',
                      borderRadius: '14px',
                      color: isSubmitting ? '#9ca3af' : '#ffffff',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      boxShadow: isSubmitting ? 'none' : '0 18px 36px rgba(99,102,241,0.24)',
                    }}
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form
                  key="register-form"
                  initial={{ opacity: 0, x: 18, y: 8 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: -18, y: -8 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  onSubmit={handleRegisterSubmit}
                >
                  <input
                    className="auth-readable-input"
                    type="text"
                    name="fullName"
                    value={registerData.fullName}
                    onChange={handleRegisterChange}
                    placeholder="Full Name"
                    style={inputStyle}
                    required
                  />
                  <input
                    className="auth-readable-input"
                    type="text"
                    name="username"
                    value={registerData.username}
                    onChange={handleRegisterChange}
                    placeholder="Username"
                    style={inputStyle}
                    required
                  />
                  <input
                    className="auth-readable-input"
                    type="email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    placeholder="Email Address"
                    style={inputStyle}
                    required
                  />
                  <div style={{ ...inputStyle, color: isDark ? '#cbd5e1' : '#475569', display: 'flex', alignItems: 'center' }}>
                    New accounts are created as learner profiles. Admin and moderator access is assigned later by the platform team.
                  </div>
                  <input
                    className="auth-readable-input"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    placeholder="Password"
                    style={inputStyle}
                    required
                  />
                  <input
                    className="auth-readable-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    placeholder="Confirm Password"
                    style={inputStyle}
                    required
                  />
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      marginBottom: '16px',
                    }}
                  >
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={registerData.acceptTerms}
                      onChange={handleRegisterChange}
                      required
                    />
                    <span style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>
                      I agree to the terms and privacy policy.
                    </span>
                  </label>
                  {!passwordsMatch && registerData.confirmPassword && (
                    <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px' }}>
                      Passwords do not match.
                    </p>
                  )}
                  {registerData.password && !isPasswordValid && (
                    <p style={{ color: '#f59e0b', fontSize: '12px', marginBottom: '12px' }}>
                      Use at least 8 characters with uppercase, lowercase, and a number.
                    </p>
                  )}
                  {!isPasswordValid && registerData.password && (
                    <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px' }}>
                      Password must be at least 8 characters.
                    </p>
                  )}
                  <motion.button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    whileHover={!isFormValid || isSubmitting ? undefined : { scale: 1.01, y: -1 }}
                    whileTap={!isFormValid || isSubmitting ? undefined : { scale: 0.99 }}
                    style={{
                      width: '100%',
                      padding: '13px',
                      background:
                        !isFormValid || isSubmitting
                          ? 'rgba(255,255,255,0.1)'
                          : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      border: 'none',
                      borderRadius: '14px',
                      color: !isFormValid || isSubmitting ? '#9ca3af' : '#ffffff',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: !isFormValid || isSubmitting ? 'not-allowed' : 'pointer',
                      boxShadow:
                        !isFormValid || isSubmitting ? 'none' : '0 18px 36px rgba(99,102,241,0.24)',
                    }}
                  >
                    {isSubmitting ? 'Creating account...' : 'Create Account'}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Loginpage;
