// src/components/About.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState(0);

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

  const team = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Founder & CEO',
      bio: 'Former AI researcher at Google with PhD in Computer Science from Stanford. Passionate about democratizing education through technology.',
      image: 'SC',
      social: { twitter: '#', linkedin: '#', github: '#' }
    },
    {
      name: 'Michael Rodriguez',
      role: 'CTO',
      bio: 'Ex-Amazon engineer with 10+ years in ed-tech. Leads our AI development and platform architecture.',
      image: 'MR',
      social: { twitter: '#', linkedin: '#', github: '#' }
    },
    {
      name: 'Dr. Priya Sharma',
      role: 'Head of Curriculum',
      bio: 'PhD in Computer Science Education. Designed curricula for top universities and bootcamps.',
      image: 'PS',
      social: { twitter: '#', linkedin: '#', github: '#' }
    },
    {
      name: 'James Wilson',
      role: 'Lead Instructor',
      bio: 'Former competitive programmer, Google Code Jam finalist. Mentored 1000+ students into top tech companies.',
      image: 'JW',
      social: { twitter: '#', linkedin: '#', github: '#' }
    },
    {
      name: 'Elena Koslova',
      role: 'AI/ML Specialist',
      bio: 'Research scientist with 15+ patents in machine learning. Creates our adaptive learning algorithms.',
      image: 'EK',
      social: { twitter: '#', linkedin: '#', github: '#' }
    },
    {
      name: 'David Okonkwo',
      role: 'Community Manager',
      bio: 'Built thriving communities of 50K+ developers. Ensures every learner feels supported.',
      image: 'DO',
      social: { twitter: '#', linkedin: '#', github: '#' }
    }
  ];

  const milestones = [
    { year: '2020', event: 'StudySphere founded', icon: '🚀' },
    { year: '2021', event: 'Launched AI learning paths', icon: '🧠' },
    { year: '2022', event: 'Reached 10,000 learners', icon: '🎓' },
    { year: '2023', event: 'Added 500+ DSA problems', icon: '💻' },
    { year: '2024', event: 'Launched study groups feature', icon: '👥' },
    { year: '2025', event: '1M learners milestone!', icon: '🏆' }
  ];

  const values = [
    {
      icon: '🔬',
      title: 'Innovation First',
      desc: 'We constantly push boundaries with cutting-edge AI to create the most effective learning experience.'
    },
    {
      icon: '🤝',
      title: 'Community Driven',
      desc: 'Learning is better together. We foster a supportive community where everyone helps each other grow.'
    },
    {
      icon: '🎯',
      title: 'Results Focused',
      desc: 'Every feature is designed with one goal: helping you achieve your learning objectives faster.'
    },
    {
      icon: '🌍',
      title: 'Global Access',
      desc: 'Quality education should be accessible to everyone, anywhere in the world.'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      color: 'white',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Animated Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,40,0.95) 100%)'
      }}>
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
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Navbar spacer */}
      <div style={{ height: '80px' }}></div>

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 1, padding: '40px 20px' }}>
        
        {/* Hero Section */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          padding: '60px 0'
        }}>
          <div style={{
            display: 'inline-block',
            padding: '8px 20px',
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
              fontWeight: 600
            }}>
              📖 OUR STORY
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(48px, 8vw, 72px)',
            fontWeight: 800,
            marginBottom: '30px',
            lineHeight: 1.2
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #fff, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Empowering
            </span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Tomorrow's Innovators
            </span>
          </h1>

          <p style={{
            fontSize: '18px',
            color: '#9ca3af',
            maxWidth: '700px',
            margin: '0 auto 40px',
            lineHeight: 1.8
          }}>
            We're on a mission to make quality tech education accessible to everyone. 
            Through AI-powered personalization and community-driven learning, we're 
            transforming how people master new skills.
          </p>
        </section>

        {/* Stats Section */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto 80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '30px'
        }}>
          {[
            { value: '1M+', label: 'Learners', icon: '🎓' },
            { value: '500+', label: 'Courses', icon: '📚' },
            { value: '50+', label: 'Countries', icon: '🌍' },
            { value: '95%', label: 'Success Rate', icon: '📈' }
          ].map((stat, index) => (
            <div key={index} style={{
              padding: '30px',
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '20px',
              textAlign: 'center',
              transition: 'transform 0.3s ease',
              animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>{stat.icon}</div>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '5px'
              }}>{stat.value}</div>
              <div style={{ color: '#9ca3af' }}>{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Our Values */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto 80px'
        }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '50px'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Our Core Values
            </span>
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px'
          }}>
            {values.map((value, index) => (
              <div key={index} style={{
                padding: '40px 30px',
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '20px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
              }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>{value.icon}</div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  marginBottom: '15px',
                  background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>{value.title}</h3>
                <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto 80px'
        }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '50px'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Our Journey
            </span>
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {milestones.map((item, index) => (
              <div key={index} style={{
                padding: '30px',
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'rgba(139,92,246,0.1)',
                  borderRadius: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '30px'
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '5px'
                  }}>{item.year}</div>
                  <div style={{ color: '#d1d5db' }}>{item.event}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto 80px'
        }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Meet Our Team
            </span>
          </h2>
          <p style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '18px',
            maxWidth: '600px',
            margin: '0 auto 50px'
          }}>
            Passionate experts dedicated to your success
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {team.map((member, index) => (
              <div key={index} style={{
                padding: '30px',
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '20px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  background: `linear-gradient(135deg, ${index % 2 ? '#3b82f6' : '#8b5cf6'}, ${index % 2 ? '#8b5cf6' : '#ec4899'})`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  fontWeight: 'bold',
                  margin: '0 auto 20px'
                }}>
                  {member.image}
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  marginBottom: '5px',
                  color: 'white'
                }}>{member.name}</h3>
                <p style={{
                  fontSize: '14px',
                  color: '#a78bfa',
                  marginBottom: '15px'
                }}>{member.role}</p>
                <p style={{
                  fontSize: '14px',
                  color: '#9ca3af',
                  lineHeight: 1.6,
                  marginBottom: '20px'
                }}>{member.bio}</p>
                <div style={{
                  display: 'flex',
                  gap: '15px',
                  justifyContent: 'center'
                }}>
                  <a href="#" style={{ color: '#9ca3af', fontSize: '20px' }}>𝕏</a>
                  <a href="#" style={{ color: '#9ca3af', fontSize: '20px' }}>in</a>
                  <a href="#" style={{ color: '#9ca3af', fontSize: '20px' }}>⌨️</a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '60px',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
          backdropFilter: 'blur(10px)',
          borderRadius: '40px',
          border: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 700,
            marginBottom: '20px'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #fff, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Join Our Mission
            </span>
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#9ca3af',
            marginBottom: '30px',
            lineHeight: 1.8
          }}>
            Be part of the revolution in tech education. Start your journey today.
          </p>
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
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(139,92,246,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Get Started Now 🚀
          </button>
        </section>
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
};

export default About;