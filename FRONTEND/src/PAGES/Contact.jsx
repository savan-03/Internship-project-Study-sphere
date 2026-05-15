// src/components/Contact.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [activeField, setActiveField] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('general');

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: '📍',
      title: 'Visit Us',
      details: ['123 Learning Lane', 'San Francisco, CA 94105', 'United States'],
      color: 'from-blue-500 to-purple-500'
    },
    {
      icon: '📧',
      title: 'Email Us',
      details: ['hello@studysphere.com', 'support@studysphere.com', 'careers@studysphere.com'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '📞',
      title: 'Call Us',
      details: ['+1 (800) 123-4567', '+1 (888) 765-4321', 'Mon-Fri, 9am-6pm PST'],
      color: 'from-pink-500 to-orange-500'
    },
    {
      icon: '⏰',
      title: 'Office Hours',
      details: ['Monday - Friday: 9am - 6pm', 'Saturday: 10am - 4pm', 'Sunday: Closed'],
      color: 'from-orange-500 to-yellow-500'
    }
  ];

  const faqs = [
    {
      question: 'How do I get started with StudySphere?',
      answer: 'Simply create a free account and you\'ll get instant access to our AI-powered learning paths, DSA problems, and study groups.'
    },
    {
      question: 'Is StudySphere really free?',
      answer: 'Yes! We offer a generous free plan with access to core features. Premium plans are available for advanced features.'
    },
    {
      question: 'Can I switch plans anytime?',
      answer: 'Absolutely! You can upgrade, downgrade, or cancel your subscription at any time with no questions asked.'
    },
    {
      question: 'Do you offer team/enterprise plans?',
      answer: 'Yes! We have special plans for teams, schools, and enterprises. Contact our sales team for custom pricing.'
    }
  ];

  const socialLinks = [
    { icon: '𝕏', name: 'Twitter', url: '#', color: '#1DA1F2' },
    { icon: 'in', name: 'LinkedIn', url: '#', color: '#0077B5' },
    { icon: '📘', name: 'Facebook', url: '#', color: '#1877F2' },
    { icon: '📷', name: 'Instagram', url: '#', color: '#E4405F' },
    { icon: '💻', name: 'GitHub', url: '#', color: '#333' },
    { icon: '▶️', name: 'YouTube', url: '#', color: '#FF0000' }
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
          padding: '40px 0 60px'
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
              📬 GET IN TOUCH
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(48px, 8vw, 72px)',
            fontWeight: 800,
            marginBottom: '20px',
            lineHeight: 1.2
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #fff, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              We'd Love to
            </span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Hear From You
            </span>
          </h1>

          <p style={{
            fontSize: '18px',
            color: '#9ca3af',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.8
          }}>
            Have questions? We're here to help. Reach out to us anytime.
          </p>
        </section>

        {/* Contact Info Cards */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto 60px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {contactInfo.map((info, index) => (
            <div key={index} style={{
              padding: '30px',
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '20px',
              transition: 'all 0.3s ease',
              animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
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
                width: '60px',
                height: '60px',
                background: `linear-gradient(135deg, ${info.color.split(' ')[1]}, ${info.color.split(' ')[3]})`,
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                marginBottom: '20px'
              }}>
                {info.icon}
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 600,
                marginBottom: '15px',
                color: 'white'
              }}>{info.title}</h3>
              {info.details.map((detail, i) => (
                <p key={i} style={{
                  color: '#9ca3af',
                  fontSize: '14px',
                  marginBottom: i < info.details.length - 1 ? '5px' : 0
                }}>{detail}</p>
              ))}
            </div>
          ))}
        </section>

        {/* Contact Form & Map */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto 60px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px'
        }}>
          {/* Contact Form */}
          <div style={{
            padding: '40px',
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '30px'
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '10px'
            }}>
              <span style={{
                background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Send a Message
              </span>
            </h2>
            <p style={{
              color: '#9ca3af',
              fontSize: '14px',
              marginBottom: '30px'
            }}>
              We'll get back to you within 24 hours
            </p>

            {isSubmitted ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                background: 'rgba(16,185,129,0.1)',
                borderRadius: '20px',
                border: '1px solid rgba(16,185,129,0.2)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#10b981',
                  marginBottom: '10px'
                }}>Message Sent!</h3>
                <p style={{ color: '#9ca3af' }}>
                  Thank you for reaching out. We'll contact you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Topic Selection */}
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  marginBottom: '25px'
                }}>
                  {['general', 'support', 'sales'].map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setSelectedTopic(topic)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: selectedTopic === topic 
                          ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                          : 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: '10px',
                        color: selectedTopic === topic ? 'white' : '#9ca3af',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textTransform: 'capitalize'
                      }}
                    >
                      {topic}
                    </button>
                  ))}
                </div>

                {/* Name */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#9ca3af',
                    marginBottom: '8px'
                  }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setActiveField('name')}
                    onBlur={() => setActiveField(null)}
                    placeholder="John Doe"
                    required
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: activeField === 'name' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${activeField === 'name' ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>

                {/* Email */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#9ca3af',
                    marginBottom: '8px'
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setActiveField('email')}
                    onBlur={() => setActiveField(null)}
                    placeholder="john@example.com"
                    required
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: activeField === 'email' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${activeField === 'email' ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>

                {/* Subject */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#9ca3af',
                    marginBottom: '8px'
                  }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onFocus={() => setActiveField('subject')}
                    onBlur={() => setActiveField(null)}
                    placeholder="What's this about?"
                    required
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: activeField === 'subject' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${activeField === 'subject' ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>

                {/* Message */}
                <div style={{ marginBottom: '25px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#9ca3af',
                    marginBottom: '8px'
                  }}>
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setActiveField('message')}
                    onBlur={() => setActiveField(null)}
                    placeholder="Tell us how we can help..."
                    required
                    rows="5"
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: activeField === 'message' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${activeField === 'message' ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
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
                  Send Message
                  <span style={{ fontSize: '18px' }}>→</span>
                </button>
              </form>
            )}
          </div>

          {/* Map/Location */}
          <div style={{
            padding: '40px',
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '30px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '20px'
            }}>
              <span style={{
                background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Visit Our Office
              </span>
            </h2>
            
            {/* Map Placeholder */}
            <div style={{
              flex: 1,
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '20px',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '300px'
            }}>
              {/* Decorative map grid */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `
                  linear-gradient(rgba(139,92,246,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(139,92,246,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '30px 30px'
              }} />
              
              {/* Location marker */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '10px',
                  animation: 'bounce 2s infinite'
                }}>
                  📍
                </div>
                <div style={{
                  padding: '8px 16px',
                  background: 'rgba(139,92,246,0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(139,92,246,0.3)'
                }}>
                  <span style={{ color: '#a78bfa', fontWeight: 600 }}>StudySphere HQ</span>
                </div>
              </div>

              {/* Building markers */}
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  top: `${Math.random() * 80 + 10}%`,
                  left: `${Math.random() * 80 + 10}%`,
                  width: '4px',
                  height: '4px',
                  background: 'rgba(255,255,255,0.3)',
                  borderRadius: '50%'
                }} />
              ))}
            </div>

            {/* Address Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px'
            }}>
              <div style={{
                padding: '15px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '20px', marginBottom: '5px' }}>🚇</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Nearest Station</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>Montgomery St</div>
              </div>
              <div style={{
                padding: '15px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '20px', marginBottom: '5px' }}>🅿️</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Parking</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>Available nearby</div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto 60px'
        }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Frequently Asked Questions
            </span>
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '20px'
          }}>
            {faqs.map((faq, index) => (
              <div key={index} style={{
                padding: '25px',
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '20px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '10px'
                }}>
                  <span style={{
                    width: '30px',
                    height: '30px',
                    background: 'rgba(139,92,246,0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#a78bfa',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>?</span>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'white'
                  }}>{faq.question}</h3>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#9ca3af',
                  lineHeight: 1.6,
                  marginLeft: '45px'
                }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Social Media Section */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
          backdropFilter: 'blur(10px)',
          borderRadius: '40px',
          border: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '15px'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #fff, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Connect With Us
            </span>
          </h2>
          <p style={{
            color: '#9ca3af',
            marginBottom: '30px'
          }}>
            Follow us on social media for updates and learning tips
          </p>

          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                style={{
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {social.icon}
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>

      {/* Animation Styles */}
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

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};

export default Contact;