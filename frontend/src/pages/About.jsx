import React from 'react';
import { Zap, Shield, Globe } from 'lucide-react';

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
    <path d="M9 18c-4.51 2-5-2-7-2"></path>
  </svg>
);

const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const About = () => {
  return (
    <div style={{
      maxWidth: '760px', margin: '0 auto',
      display: 'flex', flexDirection: 'column', gap: '32px',
      paddingBottom: '80px',
    }}>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800,
          color: 'var(--color-text-primary)',
          margin: 0, letterSpacing: '-0.06em',
          lineHeight: 1.1,
        }}>
          About PulseVote.
        </h1>
        <p style={{
          margin: '8px 0 0', fontSize: '16px', fontWeight: 500,
          color: 'var(--color-text-secondary)',
          letterSpacing: '-0.01em',
        }}>
          Built for the modern web, crafted with a genuine passion for UX.
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.04em' }}>The Story</h2>
        <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
          PulseVote was built out of a desire to create a polling application that doesn't just work, but feels <strong>premium</strong>. In a world full of generic templates, I wanted to craft an experience that is lightning-fast, visually stunning, and packed with micro-interactions that make users smile.
        </p>
        <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
          Every animation, every shadow, and every state transition has been carefully engineered to provide a truly seamless, native-like feel right in your browser. From Optimistic UI interactions to smooth Lenis scrolling, it's all about the details.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="card" style={{ padding: '32px' }}>
          <Zap size={32} color="var(--color-primary)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Optimistic UI</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Zero-latency interactions. Votes and bookmarks update instantly on the screen before the server even responds.
          </p>
        </div>
        <div className="card" style={{ padding: '32px' }}>
          <Shield size={32} color="var(--color-success)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Secure</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Robust authentication, OTP email verification, and client-side password strength validation built right in.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '40px', background: 'var(--color-text-primary)', color: 'white' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.04em' }}>Meet the Developer</h2>
        <p style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', marginBottom: '24px' }}>
          Hi, I'm Muhammad Junaid. I specialize in building highly interactive, scalable web applications with a massive focus on user experience and design engineering.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <a href="https://muhammadjunaid.dev" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ border: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Globe size={16} /> Portfolio Website
          </a>
          <a href="https://github.com/doctorJunaid" target="_blank" rel="noopener noreferrer" className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <GithubIcon /> GitHub
          </a>
          <a href="https://www.linkedin.com/in/dev-muhammad-junaid" target="_blank" rel="noopener noreferrer" className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <LinkedinIcon /> LinkedIn
          </a>
        </div>
      </div>

    </div>
  );
};

export default About;
