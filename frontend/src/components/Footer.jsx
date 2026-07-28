import React from 'react';
import { Globe, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const Footer = () => {
  return (
    <footer style={{
      marginTop: '64px',
      padding: '48px',
      background: 'var(--color-text-primary)',
      borderRadius: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '15px',
      fontWeight: 500,
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
        
        {/* Brand & Creator */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.04em' }}>
              PulseVote.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Designed & Developed with <Heart size={14} color="var(--color-primary)" fill="var(--color-primary)" /> by 
            <span style={{ fontWeight: 800, color: '#FFFFFF' }}>Muhammad Junaid</span>
          </div>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: '32px', fontWeight: 600 }}>
          <a href="https://github.com/doctorJunaid" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none' }} className="hover-text-white">
            <GithubIcon /> GitHub
          </a>
          <a href="https://www.linkedin.com/in/dev-muhammad-junaid" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none' }} className="hover-text-white">
            <LinkedinIcon /> LinkedIn
          </a>
          <a href="https://muhammadjunaid.dev" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none' }} className="hover-text-white">
            <Globe size={18} /> Portfolio
          </a>
          <Link to="/about" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none' }} className="hover-text-white">
            About Project
          </Link>
        </div>
      </div>
      
      <div style={{ 
        fontSize: '14px', 
        color: 'rgba(255, 255, 255, 0.5)', 
        display: 'flex', 
        justifyContent: 'space-between',
        paddingTop: '24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <span>&copy; {new Date().getFullYear()} PulseVote. All rights reserved.</span>
        <span>Made for the modern web.</span>
      </div>
      
      <style>{`
        .hover-text-white { transition: color 0.2s ease; }
        .hover-text-white:hover { color: #FFFFFF !important; }
      `}</style>
    </footer>
  );
};

export default Footer;
