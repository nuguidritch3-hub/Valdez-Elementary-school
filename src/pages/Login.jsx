import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';
import { getApiUrl } from '../config';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showGreeting, setShowGreeting] = useState(false);
  const [greetingProgress, setGreetingProgress] = useState(0);
  const [greetingStatus, setGreetingStatus] = useState('Verifying credentials...');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(getApiUrl('/api/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error('Invalid username or password.');
      }

      const user = await response.json();
      setLoggedInUser(user);
      setShowGreeting(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showGreeting || !loggedInUser) return;

    // Start progress counting
    const duration = 1800; // 1.8 seconds
    const intervalTime = 30; // smooth update every 30ms
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = Math.min(Math.round((currentStep / steps) * 100), 100);
      setGreetingProgress(progress);

      // Update status messages
      if (progress < 40) {
        setGreetingStatus('Loading dashboard...');
      } else if (progress < 80) {
        setGreetingStatus('Preparing workspace...');
      } else {
        setGreetingStatus('Redirecting...');
      }

      if (progress >= 100) {
        clearInterval(timer);
        // After 100% complete, do a slight delay and then login
        setTimeout(() => {
          onLogin(loggedInUser);
          if (loggedInUser.role === 'Admin') {
            navigate('/admin');
          } else if (loggedInUser.role === 'Teacher') {
            navigate('/teacher/dashboard');
          } else {
            navigate('/student/dashboard');
          }
        }, 300);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [showGreeting, loggedInUser, navigate, onLogin]);

  if (showGreeting && loggedInUser) {
    // Determine theme colors based on role
    let themeColor = '#3b82f6'; // Admin/Teacher default Blue
    let themeGlow = 'rgba(59, 130, 246, 0.15)';
    let roleText = 'System User';
    let roleBadgeBg = 'rgba(59, 130, 246, 0.1)';
    let roleBadgeColor = '#60a5fa';

    if (loggedInUser.role === 'Admin') {
      themeColor = '#8b5cf6'; // Violet for Admin
      themeGlow = 'rgba(139, 92, 246, 0.2)';
      roleText = 'Administrator';
      roleBadgeBg = 'rgba(139, 92, 246, 0.15)';
      roleBadgeColor = '#a78bfa';
    } else if (loggedInUser.role === 'Teacher') {
      themeColor = '#3b82f6'; // Blue for Teacher
      themeGlow = 'rgba(59, 130, 246, 0.2)';
      roleText = 'Faculty Member';
      roleBadgeBg = 'rgba(59, 130, 246, 0.15)';
      roleBadgeColor = '#60a5fa';
    } else if (loggedInUser.role === 'Student') {
      themeColor = '#0d9488'; // Teal for Student
      themeGlow = 'rgba(13, 148, 136, 0.2)';
      roleText = 'Valdez Student';
      roleBadgeBg = 'rgba(13, 148, 136, 0.15)';
      roleBadgeColor = '#2dd4bf';
    }

    return (
      <div className="greeting-screen" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        backgroundImage: `url('/valdez-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#070a13',
        position: 'relative',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        overflow: 'hidden'
      }}>
        {/* Fullscreen background overlay */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(135deg, rgba(7, 10, 19, 0.95) 0%, rgba(15, 23, 42, 0.8) 100%)',
          backdropFilter: 'blur(12px)',
          zIndex: 1
        }}></div>

        {/* Ambient background glow matching the role */}
        <div className="ambient-glow" style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${themeGlow} 0%, transparent 70%)`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
          pointerEvents: 'none'
        }}></div>

        {/* Main card */}
        <div className="greeting-card" style={{
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '90%',
          maxWidth: '460px',
          padding: '48px 36px',
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          borderRadius: '28px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          textAlign: 'center',
          animation: 'greetingCardEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}>
          {/* Pulsing Avatar/Logo Container */}
          <div style={{ position: 'relative', marginBottom: '28px' }}>
            <div className="avatar-glow-ring" style={{
              position: 'absolute',
              top: -8, left: -8, right: -8, bottom: -8,
              borderRadius: '50%',
              border: `2px solid ${themeColor}`,
              opacity: 0.3,
              animation: 'pulseGlow 2s infinite ease-in-out'
            }}></div>
            <img
              src="/valdez-logo.png"
              alt="Valdez School Logo"
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                objectFit: 'contain',
                boxShadow: `0 8px 32px ${themeGlow}`,
                border: '2px solid rgba(255,255,255,0.15)',
                position: 'relative',
                zIndex: 2
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(loggedInUser.name)}&background=${themeColor.substring(1)}&color=fff&rounded=true&size=120`;
              }}
            />
          </div>

          {/* Role Badge */}
          <div style={{
            backgroundColor: roleBadgeBg,
            color: roleBadgeColor,
            padding: '6px 16px',
            borderRadius: '99px',
            fontSize: '0.8rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '16px',
            border: `1px solid ${roleBadgeBg.replace('0.15', '0.25')}`,
            display: 'inline-block'
          }}>
            {roleText}
          </div>

          {/* Greeting text */}
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '6px',
            letterSpacing: '-0.5px'
          }}>
            Welcome back,
          </h2>
          <h3 style={{
            fontSize: '1.65rem',
            fontWeight: '600',
            color: themeColor,
            marginBottom: '36px',
            opacity: 0.95
          }}>
            {loggedInUser.name}
          </h3>


          {/* Progress bar container */}
          <div style={{ width: '100%', marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.85rem',
              color: '#94a3b8',
              marginBottom: '8px'
            }}>
              <span style={{ fontWeight: '500' }}>{greetingStatus}</span>
              <span style={{ fontFamily: 'monospace', color: themeColor, fontWeight: 'bold' }}>{greetingProgress}%</span>
            </div>
            
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '99px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                height: '100%',
                width: `${greetingProgress}%`,
                background: `linear-gradient(to right, ${themeColor}, #a78bfa)`,
                borderRadius: '99px',
                transition: 'width 0.1s linear',
                boxShadow: `0 0 10px ${themeColor}`
              }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      width: '100%',
      backgroundImage: `url('/valdez-bg.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: '#0f172a',
      position: 'relative',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      {/* Dark modern gradient overlay */}
      <div style={{ 
        position: 'absolute', 
        top: 0, left: 0, right: 0, bottom: 0, 
        background: 'linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.5) 100%)',
        backdropFilter: 'blur(8px)'
      }}></div>
      
      <div style={{ 
        zIndex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        width: '100%', 
        maxWidth: '440px',
        padding: '20px'
      }}>
        
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          width: '100%', 
          padding: '48px 40px', 
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          color: 'white',
        }}>
          
          {/* Logo Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', width: '100%' }}>
            <img 
              src="/valdez-logo.png" 
              alt="Valdez Elementary School Logo" 
              style={{ 
                width: '140px', 
                height: '140px', 
                borderRadius: '50%', 
                objectFit: 'contain',
                objectPosition: 'center',
                display: 'block',
                margin: '0 auto 16px auto',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                border: '2px solid rgba(255,255,255,0.1)'
              }}
              onError={(e) => { 
                e.target.onerror = null; 
                e.target.src = 'https://ui-avatars.com/api/?name=Valdez+School&background=0ea5e9&color=fff&rounded=true&size=160';
              }} 
            />
            <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '8px', textAlign: 'center', letterSpacing: '-0.5px', width: '100%' }}>
              Welcome back
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', textAlign: 'center', margin: '0 auto', width: '100%' }}>
              Sign in to your school account
            </p>
          </div>

          {error && (
            <div style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              color: '#f87171', 
              padding: '12px 16px', 
              borderRadius: '12px', 
              marginBottom: '24px', 
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f87171', flexShrink: 0 }}></div>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <User size={20} />
              </div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  backgroundColor: 'rgba(15, 23, 42, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.4)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div style={{ marginBottom: '24px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 48px 14px 48px',
                  backgroundColor: 'rgba(15, 23, 42, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.4)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <div 
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', cursor: 'pointer', display: 'flex' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#cbd5e1', cursor: 'pointer' }}>
                <input type="checkbox" style={{ marginRight: '8px', cursor: 'pointer', accentColor: '#3b82f6' }} />
                Remember me
              </label>
              <span style={{ fontSize: '0.875rem', color: '#60a5fa', cursor: 'pointer', fontWeight: '500' }}>
                Forgot password?
              </span>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                width: '100%',
                background: 'linear-gradient(to right, #2563eb, #3b82f6)', 
                color: 'white', 
                border: 'none', 
                padding: '14px', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.7 : 1
              }}
              onMouseOver={(e) => { if(!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.4)'; } }}
              onMouseOut={(e) => { if(!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)'; } }}
            >
              {loading ? 'Signing in...' : 'Sign in'} 
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '16px', margin: '0 0 16px 0' }}>
              Don't have an account?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button style={{ 
                width: '100%', 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                color: 'white', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                padding: '12px', 
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
              >
                Register as Student/Parent
              </button>
              <button style={{ 
                width: '100%', 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                color: 'white', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                padding: '12px', 
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
              >
                New Applicant Admission
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
