// src/PAGES/Homepage.jsx (Note: I changed the path to match your structure)
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';
// Comment out useAuth for now until AuthContext is created
// import { useAuth } from '../auth/AuthContext';

const Homepage = () => {
  const navigate = useNavigate();
  // const { isAuthenticated } = useAuth(); // Comment this out temporarily
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [counters, setCounters] = useState({ learners: 0, courses: 0, success: 0 });

  // Refs for scroll animations
  const heroRef = useRef(null); 
  const showcaseRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Animated counters
  useEffect(() => {
    const targetNumbers = { learners: 10000, courses: 500, success: 95 };
    const duration = 2000;
    const stepTime = 20;
    const steps = duration / stepTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setCounters({
        learners: Math.min(Math.floor((targetNumbers.learners / steps) * currentStep), targetNumbers.learners),
        courses: Math.min(Math.floor((targetNumbers.courses / steps) * currentStep), targetNumbers.courses),
        success: Math.min(Math.floor((targetNumbers.success / steps) * currentStep), targetNumbers.success)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer at Google',
      image: 'SJ',
      text: 'StudySphere transformed my learning journey. The AI-powered paths helped me master DSA in just 3 months!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'AI/ML Researcher',
      image: 'MC',
      text: 'The collaborative study groups and interactive challenges made complex concepts so much easier to understand.',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'Full Stack Developer',
      image: 'PS',
      text: 'Best platform for interview preparation. Landed my dream job thanks to the personalized learning paths!',
      rating: 5
    },
    {
      name: 'David Kim',
      role: 'CS Student',
      image: 'DK',
      text: 'The gamification keeps me motivated every day. I love earning badges and tracking my progress!',
      rating: 5
    }
  ];

  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      color: 'white',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Animated Background - Same style as Features page */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,40,0.95) 100%)'
      }}>
        {/* Gradient orbs with mouse parallax */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(147,51,234,0.3) 0%, rgba(79,70,229,0.1) 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
          transition: 'transform 0.1s ease-out'
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(168,85,247,0.1) 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)`,
          transition: 'transform 0.1s ease-out'
        }} />

        <div style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(37,99,235,0.1) 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          transform: `translate(calc(-50% + ${mousePosition.x * 0.2}px), calc(-50% + ${mousePosition.y * 0.2}px))`,
          transition: 'transform 0.1s ease-out'
        }} />

        {/* Grid pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              background: `rgba(255,255,255,${Math.random() * 0.3})`,
              borderRadius: '50%',
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Navbar spacer */}
      <div style={{ height: '80px' }}></div>

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Hero Section */}
        <section ref={heroRef} style={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 20px',
          position: 'relative'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            {/* Animated badge */}
            <div style={{
              display: 'inline-block',
              padding: '10px 24px',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '50px',
              border: '1px solid rgba(255,255,255,0.1)',
              marginBottom: '30px'
            }}>
              <span style={{
                background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '1px'
              }}>
                🚀 WELCOME TO THE FUTURE OF LEARNING
              </span>
            </div>

            {/* Main heading with gradient animation */}
            <h1 style={{
              fontSize: 'clamp(48px, 10vw, 96px)',
              fontWeight: 800,
              marginBottom: '20px',
              lineHeight: 1.1
            }}>
              <span style={{
                background: 'linear-gradient(135deg, #fff 0%, #e0e7ff 50%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block',
                marginBottom: '10px'
              }}>
                Learn Smarter,
              </span>
              <span style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block'
              }}>
                Achieve More
              </span>
            </h1>

            {/* Description */}
            <p style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: '#9ca3af',
              maxWidth: '700px',
              margin: '0 auto 40px',
              lineHeight: 1.6
            }}>
              Experience the most advanced learning platform powered by AI. 
              Master new skills, connect with peers, and track your progress in real-time.
            </p>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              marginBottom: '60px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '16px 40px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 30px -10px rgba(59,130,246,0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(59,130,246,0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(59,130,246,0.5)';
                }}
              >
                Start Learning Free
                <span style={{ fontSize: '20px' }}>→</span>
              </button>
              
              <button
                onClick={() => navigate('/features')}
                style={{
                  padding: '16px 40px',
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Watch Demo
              </button>
            </div>

            {/* Stats with animated counters */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '60px',
              flexWrap: 'wrap'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '5px'
                }}>
                  {counters.learners}+
                </div>
                <div style={{ fontSize: '14px', color: '#9ca3af' }}>Active Learners</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #a78bfa, #f472b6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '5px'
                }}>
                  {counters.courses}+
                </div>
                <div style={{ fontSize: '14px', color: '#9ca3af' }}>Interactive Courses</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #f472b6, #fb7185)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '5px'
                }}>
                  {counters.success}%
                </div>
                <div style={{ fontSize: '14px', color: '#9ca3af' }}>Success Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* The rest of your code remains the same... */}
        {/* ... */}

      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          from {
            transform: translateY(100vh);
          }
          to {
            transform: translateY(-100vh);
          }
        }
      `}</style>
    </div>

  );
};

export default Homepage;