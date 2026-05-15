// src/pages/Features.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';

const Features = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Refs for scroll animations
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  // Animation controls
  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.3 });
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.3 });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.3 });

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

  const features = [
    {
      id: 1,
      icon: '🧠',
      title: 'AI-PERSONALIZED LEARNING',
      description: 'Our advanced AI analyzes your learning patterns and creates custom study paths tailored to your unique needs and goals.',
      stats: '94% improvement rate',
      details: [
        'Adaptive difficulty based on your performance',
        'Personalized problem recommendations',
        'Smart spaced repetition for better retention',
        'Real-time progress adjustments'
      ]
    },
    {
      id: 2,
      icon: '💻',
      title: 'INTERACTIVE DSA PRACTICE',
      description: 'Master Data Structures & Algorithms with our interactive coding environment, real-time feedback, and comprehensive problem sets.',
      stats: '1000+ problems',
      details: [
        'Live code execution & debugging',
        'Step-by-step visualizations',
        'Company-specific interview preparation',
        'Competitive programming challenges'
      ]
    },
    {
      id: 3,
      icon: '👥',
      title: 'COLLABORATIVE STUDY GROUPS',
      description: 'Join or create study groups, collaborate on problems, learn from peers, and grow together in our vibrant community.',
      stats: '50+ active groups',
      details: [
        'Real-time collaborative coding sessions',
        'Peer code reviews & feedback',
        'Group challenges & leaderboards',
        'Mentorship opportunities'
      ]
    },
    {
      id: 4,
      icon: '🏆',
      title: 'GAMIFIED ACHIEVEMENTS',
      description: 'Stay motivated with our gamification system. Earn badges, unlock achievements, and track your progress in style.',
      stats: '50+ achievements',
      details: [
        'Daily streaks & challenges',
        'Skill-based badges & trophies',
        'Global & friend leaderboards',
        'Achievement-based rewards'
      ]
    },
    {
      id: 5,
      icon: '📊',
      title: 'ADVANCED ANALYTICS',
      description: 'Track your learning journey with detailed analytics. Identify strengths, areas for improvement, and optimize your study time.',
      stats: 'Real-time insights',
      details: [
        'Performance heatmaps & trends',
        'Time management analytics',
        'Skill proficiency tracking',
        'Learning pace optimization'
      ]
    },
    {
      id: 6,
      icon: '🎯',
      title: 'INTERVIEW PREPARATION',
      description: 'Comprehensive interview prep with company-specific questions, mock interviews, and expert-curated resources.',
      stats: '90% success rate',
      details: [
        'Company-wise question banks',
        'Mock interviews with AI feedback',
        'Resume & portfolio review',
        'Salary negotiation guides'
      ]
    }
  ];

  const stats = [
    { value: '10K+', label: 'ACTIVE LEARNERS', icon: '🎓' },
    { value: '500+', label: 'DSA PROBLEMS', icon: '⚡' },
    { value: '50+', label: 'STUDY GROUPS', icon: '👥' },
    { value: '95%', label: 'SUCCESS RATE', icon: '📈' }
  ];

  const testimonials = [
    {
      name: 'Sarah Patel',
      role: 'Software Engineer at Google',
      image: 'SP',
      text: 'The personalized learning paths and AI recommendations helped me crack my dream job. The platform adapts to your pace and ensures you master each concept before moving forward.',
      rating: 5
    },
    {
      name: 'Rajesh Kumar',
      role: 'Full Stack Developer',
      image: 'RK',
      text: 'The collaborative study groups were a game-changer. I found study partners, solved problems together, and learned so much more than studying alone.',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'AI/ML Engineer',
      image: 'PS',
      text: 'The analytics and progress tracking helped me identify my weak areas and focus my efforts. The visualizations are beautiful and incredibly insightful.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        
        {/* Animated gradient orbs */}
        <motion.div 
          className="absolute top-20 left-20 w-96 h-96 bg-purple-500/30 rounded-full filter blur-[100px]"
          animate={{
            x: mousePosition.x * 2,
            y: mousePosition.y * 2,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/30 rounded-full filter blur-[100px]"
          animate={{
            x: mousePosition.x * -2,
            y: mousePosition.y * -2,
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Navbar spacer */}
      <div style={{ height: '80px' }}></div>

      {/* Main Content */}
      <div className="relative z-10">
        
        {/* Hero Section */}
        <motion.section 
          ref={heroRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={heroInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="py-20 px-6"
        >
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={heroInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block bg-white/5 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-white/10"
            >
              <span className="text-sm bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
                ✨ DISCOVER THE FUTURE OF LEARNING
              </span>
            </motion.div>

            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={heroInView ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-6xl md:text-8xl font-bold mb-8"
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                TRANSFORM
              </span>
              <br />
              <span className="text-white">YOUR LEARNING JOURNEY</span>
            </motion.h1>

            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              animate={heroInView ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-12"
            >
              Experience the most advanced learning platform designed to help you master DSA, AI/ML, and more through personalized paths, interactive challenges, and collaborative tools.
            </motion.p>

            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={heroInView ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex gap-4 justify-center flex-wrap"
            >
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/25"
              >
                Start Learning Free
              </button>
              <button
                onClick={() => {
                  featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all transform hover:scale-105"
              >
                Explore Features
              </button>
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          ref={statsRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={statsInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="py-16 px-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={statsInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.05 }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-center cursor-pointer"
                >
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Features Grid */}
        <motion.section
          ref={featuresRef}
          initial={{ opacity: 0 }}
          animate={featuresInView ? { opacity: 1 } : {}}
          className="py-20 px-6"
        >
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              initial={{ y: 30, opacity: 0 }}
              animate={featuresInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold text-center mb-16"
            >
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                POWERFUL FEATURES
              </span>
              <br />
              FOR MODERN LEARNERS
            </motion.h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={featuresInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:border-white/30"
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  
                  <h3 className="text-xl font-bold mb-3 text-white">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="text-sm font-semibold mb-4 text-purple-400">
                    ⚡ {feature.stats}
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <ul className="space-y-2 text-sm text-gray-300">
                      {feature.details.map((detail, i) => (
                        <li key={i} className="flex items-center">
                          <span className="text-purple-400 mr-2">→</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          ref={testimonialsRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={testimonialsInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="py-20 px-6"
        >
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              initial={{ y: 30, opacity: 0 }}
              animate={testimonialsInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold text-center mb-16"
            >
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                SUCCESS STORIES
              </span>
              <br />
              FROM OUR LEARNERS
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={testimonialsInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 relative"
                >
                  <div className="absolute -top-3 -right-3">
                    <div className="text-4xl">💬</div>
                  </div>

                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.image}
                    </div>
                    <div className="ml-3">
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-xs text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>

                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>

                  <p className="text-gray-300 text-sm italic leading-relaxed">
                    "{testimonial.text}"
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          ref={ctaRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={ctaInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="py-20 px-6 mb-20"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/20 rounded-3xl p-12"
            >
              <motion.h2 
                initial={{ scale: 0.9 }}
                animate={ctaInView ? { scale: 1 } : {}}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-4xl md:text-5xl font-bold mb-6"
              >
                READY TO{' '}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  TRANSFORM
                </span>
                {' '}YOUR FUTURE?
              </motion.h2>

              <p className="text-xl text-gray-300 mb-8">
                Join thousands of successful learners who have already started their journey with StudySphere.
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-2xl shadow-purple-500/25"
              >
                Start Your Journey Today 🚀
              </motion.button>

              <p className="mt-6 text-sm text-gray-400">
                No credit card required • Free forever plan • Cancel anytime
              </p>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Features;