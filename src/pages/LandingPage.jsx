import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Users, 
  Award, 
  GraduationCap, 
  Heart, 
  Building, 
  Code, 
  Music, 
  Activity, 
  Globe, 
  Send, 
  CheckCircle,
  Menu,
  X,
  Share2
} from 'lucide-react';
import ShareModal from '../components/ShareModal';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stem');
  const [scrolled, setScrolled] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Handle nav background transition on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const tabsContent = {
    stem: {
      label: 'Innovative STEM Program',
      title: 'Igniting Curiosity Through Science & Technology',
      desc: 'Our advanced STEM curriculum is designed to transform passive learners into active creators. From robotics labs to coding fundamentals, we prepare students for the modern digital era.',
      bullet1: 'Hands-on robotics and engineering design labs',
      bullet2: 'Age-appropriate block coding and digital citizenship courses',
      bullet3: 'Annual district science exposition and collaborative projects',
      img: '/valdez-bg.jpg',
      icon: <Code size={24} />
    },
    arts: {
      label: 'Creative & Language Arts',
      title: 'Cultivating Creative Expression & Bilingualism',
      desc: 'Expression and communication lie at the core of human connection. Valdez students explore visual arts, instrumental music, and modern language bilingual instruction pathways.',
      bullet1: 'Comprehensive music lessons including orchestra and choir',
      bullet2: 'Bilingual Spanish-English immersion program options',
      bullet3: 'Creative writing workshops and annual art showcase events',
      img: '/valdez-bg.jpg',
      icon: <Music size={24} />
    },
    life: {
      label: 'Extracurricular & Athletics',
      title: 'A Vibrant Environment Outside the Classroom',
      desc: 'Education goes far beyond the blackboard. Valdez offers dynamic physical education, running clubs, environmental initiatives, and visual media production teams.',
      bullet1: 'Active sports programs promoting teamwork and sportsmanship',
      bullet2: 'Eco-Guardians recycling and organic school garden program',
      bullet3: 'Interactive theater and debating societies for self-confidence',
      img: '/valdez-bg.jpg',
      icon: <Activity size={24} />
    }
  };

  return (
    <div className="landing-container">
      {/* Background Orbs */}
      <div className="landing-bg-glow">
        <div className="glow-orb-1"></div>
        <div className="glow-orb-2"></div>
        <div className="glow-orb-3"></div>
      </div>

      {/* Header Section */}
      <header className={`landing-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="logo-section" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img 
              src="/valdez-logo.png" 
              alt="Valdez Elementary School Logo" 
              className="logo-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://ui-avatars.com/api/?name=Valdez+School&background=0ea5e9&color=fff&rounded=true&size=80';
              }}
            />
            <div className="logo-text-wrapper">
              <span className="logo-main-text">Valdez</span>
              <span className="logo-sub-text">Elementary School</span>
            </div>
          </div>

          <nav className="nav-links">
            <a href="#about" className="nav-link">About Us</a>
            <a href="#academics" className="nav-link">Academics</a>
            <a href="#admissions" className="nav-link">Admissions</a>
            <a href="#life" className="nav-link">Campus Life</a>
            <button 
              className="btn-header-share" 
              onClick={() => setShareModalOpen(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f8fafc',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginRight: '8px'
              }}
              title="Share Link"
            >
              <Share2 size={16} />
            </button>
            <button 
              className="btn-header-login" 
              onClick={() => navigate('/login')}
            >
              Portal Login
              <ArrowRight size={16} />
            </button>
          </nav>

          <div className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </div>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: 0,
          right: 0,
          background: 'rgba(7, 10, 19, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '24px',
          zIndex: 99,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          animation: 'greetingCardEnter 0.3s ease forwards'
        }}>
          <a 
            href="#about" 
            className="nav-link" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1.2rem', textAlign: 'center' }}
          >
            About Us
          </a>
          <a 
            href="#academics" 
            className="nav-link" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1.2rem', textAlign: 'center' }}
          >
            Academics
          </a>
          <a 
            href="#admissions" 
            className="nav-link" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1.2rem', textAlign: 'center' }}
          >
            Admissions
          </a>
          <a 
            href="#life" 
            className="nav-link" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1.2rem', textAlign: 'center' }}
          >
            Campus Life
          </a>
          <button 
            className="btn-cta-primary" 
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/login');
            }}
          >
            Portal Login
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section" id="about">
        <div className="hero-content">
          <div className="badge-tagline">
            <span className="badge-dot"></span>
            Valdez Academic Portal Now Online
          </div>
          <h1 className="hero-title">
            Shaping the <span className="gradient-text">Innovators</span> of Tomorrow
          </h1>
          <p className="hero-subtitle">
            Welcome to Valdez Elementary School, where academic rigor meets creative curiosity. Our school cultivates high-performing, bilingual, and socially conscious leaders in a safe, inspiring educational ecosystem.
          </p>
          <div className="hero-actions">
            <button 
              className="btn-cta-primary" 
              onClick={() => navigate('/login')}
            >
              Sign In to Portal
              <ArrowRight size={18} />
            </button>
            <a href="#academics" className="btn-cta-secondary" style={{ textDecoration: 'none' }}>
              Explore Academics
            </a>
            <button 
              className="btn-cta-secondary" 
              onClick={() => setShareModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <Share2 size={18} />
              Share Portal
            </button>
          </div>
        </div>

        <div className="hero-showcase">
          <div className="showcase-frame">
            <img 
              src="/valdez-bg.jpg" 
              alt="Valdez Elementary School Building" 
              className="showcase-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80';
              }}
            />
            <div className="showcase-overlay-card">
              <div className="avatar-stack">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80" 
                  alt="Student avatar 1" 
                  className="avatar-mini"
                  style={{ left: 0 }}
                />
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80" 
                  alt="Student avatar 2" 
                  className="avatar-mini"
                  style={{ left: '14px' }}
                />
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80" 
                  alt="Student avatar 3" 
                  className="avatar-mini"
                  style={{ left: '28px' }}
                />
              </div>
              <div>
                <h4 className="showcase-card-title">Empowering Growth</h4>
                <p className="showcase-card-desc">Bilingual and STEM specialized curriculum programs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">1,200+</span>
            <span className="stat-label">Active Students</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">98%</span>
            <span className="stat-label">Graduation Rate</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">12:1</span>
            <span className="stat-label">Student-Teacher Ratio</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">25+</span>
            <span className="stat-label">Specialist Clubs</span>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="pillars-section" id="academics">
        <div className="section-title-container">
          <span className="section-tag">Valdez Core Principles</span>
          <h2 className="section-heading">Our Four Pillars of Educational Excellence</h2>
          <p className="section-subheading">We integrate research-driven teaching methodologies with creative workshops to prepare young children to flourish academically, socially, and emotionally.</p>
        </div>

        <div className="pillars-grid">
          <div className="pillar-card">
            <div className="pillar-icon-box" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <BookOpen size={26} />
            </div>
            <h3 className="pillar-title">Advanced Academics</h3>
            <p className="pillar-description">A tailored approach focusing on foundational literacies, complex mathematical logic, and deep creative exploration.</p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box" style={{ backgroundColor: 'rgba(13, 148, 136, 0.1)', color: '#0d9488' }}>
              <GraduationCap size={26} />
            </div>
            <h3 className="pillar-title">Dual Language Track</h3>
            <p className="pillar-description">Immersive English-Spanish tracks fostering cognitive dexterity and global awareness from an early age.</p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <Building size={26} />
            </div>
            <h3 className="pillar-title">Modern Facilities</h3>
            <p className="pillar-description">Eco-conscious campus architectures, dedicated creative studios, next-generation laboratories, and safety measures.</p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <Heart size={26} />
            </div>
            <h3 className="pillar-title">Mindful Community</h3>
            <p className="pillar-description">Social-emotional integration focusing on mutual respect, supportive mentoring, and active home partnerships.</p>
          </div>
        </div>
      </section>

      {/* Interactive Showcase Section */}
      <section className="tabs-section" id="life">
        <div className="tabs-wrapper">
          <div className="section-title-container">
            <span className="section-tag">Interactive Preview</span>
            <h2 className="section-heading">Explore Life at Valdez Elementary</h2>
            <p className="section-subheading">Click through the tabs below to explore some of our hallmark school programs and academic environments.</p>
          </div>

          <div className="tabs-navigation">
            <button 
              className={`tab-btn ${activeTab === 'stem' ? 'active' : ''}`}
              onClick={() => setActiveTab('stem')}
            >
              <Code size={18} />
              STEM & Robotics
            </button>
            <button 
              className={`tab-btn ${activeTab === 'arts' ? 'active' : ''}`}
              onClick={() => setActiveTab('arts')}
            >
              <Music size={18} />
              Creative Arts
            </button>
            <button 
              className={`tab-btn ${activeTab === 'life' ? 'active' : ''}`}
              onClick={() => setActiveTab('life')}
            >
              <Activity size={18} />
              Student Life
            </button>
          </div>

          <div className="tab-panel-container">
            <div className="panel-content">
              <span className="panel-label">{tabsContent[activeTab].label}</span>
              <h3 className="panel-title">{tabsContent[activeTab].title}</h3>
              <p className="panel-desc">{tabsContent[activeTab].desc}</p>
              <div className="panel-list">
                <div className="panel-list-item">
                  <span className="panel-list-icon"><CheckCircle size={18} /></span>
                  {tabsContent[activeTab].bullet1}
                </div>
                <div className="panel-list-item">
                  <span className="panel-list-icon"><CheckCircle size={18} /></span>
                  {tabsContent[activeTab].bullet2}
                </div>
                <div className="panel-list-item">
                  <span className="panel-list-icon"><CheckCircle size={18} /></span>
                  {tabsContent[activeTab].bullet3}
                </div>
              </div>
            </div>

            <div className="panel-visual">
              <img 
                src={tabsContent[activeTab].img} 
                alt={tabsContent[activeTab].label} 
                className="panel-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner Section */}
      <section className="cta-banner-section" id="admissions">
        <div className="cta-banner-card">
          <div className="cta-banner-info">
            <h2 className="cta-banner-title">Ready to Access the Valdez Portal?</h2>
            <p className="cta-banner-desc">Whether you are a student looking up assignments, a parent checking academic milestones, or an administrator orchestrating school actions, sign in to begin.</p>
          </div>
          <div className="cta-banner-actions">
            <button 
              className="btn-cta-primary" 
              onClick={() => navigate('/login')}
            >
              Portal Login
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-info">
            <div className="footer-logo">
              <img 
                src="/valdez-logo.png" 
                alt="Valdez Logo" 
                className="footer-logo-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://ui-avatars.com/api/?name=Valdez+School&background=0ea5e9&color=fff&rounded=true&size=80';
                }}
              />
              <span className="footer-logo-text">Valdez</span>
            </div>
            <p className="footer-desc">Empowering students to unlock their full intellectual, emotional, and social potential in an advanced, modern learning space.</p>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">Portal Roles</h4>
            <div className="footer-links-list">
              <span className="footer-link" onClick={() => navigate('/login')}>Student Dashboard</span>
              <span className="footer-link" onClick={() => navigate('/login')}>Teacher Workspace</span>
              <span className="footer-link" onClick={() => navigate('/login')}>Admin Console</span>
              <span className="footer-link" onClick={() => navigate('/login')}>Parent Access</span>
            </div>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">Resources</h4>
            <div className="footer-links-list">
              <a href="#about" className="footer-link">About Valdez</a>
              <a href="#academics" className="footer-link">Academics Program</a>
              <a href="#admissions" className="footer-link">Admissions Guidelines</a>
              <a href="#life" className="footer-link">Extracurriculars</a>
            </div>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-newsletter-title">Subscribe to Valdez News</h4>
            <p className="footer-newsletter-desc">Get the latest calendar announcements, curriculum news, and community highlights delivered directly to your inbox.</p>
            {subscribed ? (
              <div style={{
                color: '#2dd4bf',
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                animation: 'greetingCardEnter 0.3s ease'
              }}>
                <CheckCircle size={18} />
                Successfully Subscribed! Thank you.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="Enter email address" 
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="newsletter-input"
                  required
                />
                <button type="submit" className="newsletter-btn">
                  <Send size={18} />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-copyright">
            © {new Date().getFullYear()} Valdez Elementary School. All rights reserved. Registered under Colorado District Board of Education.
          </span>
          <div className="footer-bottom-links">
            <a href="#" className="footer-bottom-link">Privacy Policy</a>
            <a href="#" className="footer-bottom-link">Terms of Service</a>
            <a href="#" className="footer-bottom-link">Sitemap</a>
          </div>
        </div>
      </footer>
      <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} />
    </div>
  );
};

export default LandingPage;
