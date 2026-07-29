import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, BarChart2, Shield, Users, ArrowRight, ExternalLink, Globe } from 'lucide-react';
import { useAuth } from '../store/useAuth';

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
    <path d="M9 18c-4.51 2-5-2-7-2"></path>
  </svg>
);

const LandingNav = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      padding: '16px 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 100,
      background: 'rgba(244, 242, 238, 0.85)', // var(--color-bg) with opacity
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <motion.div 
          whileHover={{ rotate: 15, scale: 1.1 }}
          style={{
            width: '38px', height: '38px',
            background: 'var(--color-text-primary)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Zap size={20} color="#FFFFFF" strokeWidth={2.5} />
        </motion.div>
        <div style={{
          fontSize: '22px',
          fontWeight: 800,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.06em',
          lineHeight: 1,
        }}>
          PulseVote.
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        {isAuthenticated ? (
          <Link to="/explore" style={{ textDecoration: 'none' }}>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary"
            >
              Go to App <ArrowRight size={18} />
            </motion.button>
          </Link>
        ) : (
          <>
            <Link to="/auth" style={{ textDecoration: 'none' }}>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-ghost"
              >
                Log In
              </motion.button>
            </Link>
            <Link to="/auth" style={{ textDecoration: 'none' }}>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-dark"
              >
                Sign Up
              </motion.button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="card"
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}
  >
    <div style={{
      width: '48px', height: '48px',
      borderRadius: '16px',
      background: 'var(--color-primary-subtle)',
      color: 'var(--color-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={24} strokeWidth={2} />
    </div>
    <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>{title}</h3>
    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0, fontSize: '15px' }}>{desc}</p>
  </motion.div>
);

const ProjectCard = ({ title, desc, tags, link, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.4 }}
    className="card"
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>{title}</h3>
      <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-tertiary)', transition: 'color 0.2s' }}>
        <ExternalLink size={20} />
      </a>
    </div>
    
    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0, fontSize: '15px' }}>{desc}</p>
    
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto' }}>
      {tags.map((tag, i) => (
        <span key={i} className="badge badge-brand" style={{ background: 'var(--color-bg)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
          {tag}
        </span>
      ))}
    </div>
  </motion.div>
);

const Landing = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      color: 'var(--color-text-primary)',
      fontFamily: 'inherit',
      overflowX: 'hidden'
    }}>
      <LandingNav />
      
      {/* Hero Section */}
      <section style={{
        padding: '180px 20px 120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* Abstract Background Element (Subtle Editorial Glow) */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60vw', height: '60vw', maxWidth: '600px', maxHeight: '600px',
          background: 'radial-gradient(circle, var(--color-primary-subtle) 0%, rgba(244, 242, 238, 0) 70%)',
          zIndex: 0, pointerEvents: 'none'
        }} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ maxWidth: '840px', zIndex: 1 }}
        >

          
          <h1 style={{
            fontSize: 'clamp(48px, 8vw, 84px)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.05em',
            margin: '0 0 24px 0',
            color: 'var(--color-text-primary)'
          }}>
            Capture opinions in <span style={{ color: 'var(--color-primary)' }}>real-time</span>.
          </h1>
          
          <p style={{
            fontSize: 'clamp(18px, 2vw, 22px)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            margin: '0 auto 48px auto',
            maxWidth: '640px',
            fontWeight: 500
          }}>
            Create beautiful polls, vote instantly, and see results update live. The most carefully crafted polling platform on the web.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/auth" style={{ textDecoration: 'none' }}>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-primary btn-lg"
              >
                Get Started Free <ArrowRight size={20} style={{ marginLeft: '4px' }} />
              </motion.button>
            </Link>
            <a href="#projects" style={{ textDecoration: 'none' }}>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-secondary btn-lg"
              >
                View Developer Portfolio
              </motion.button>
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '100px 20px', background: 'var(--color-surface)', position: 'relative', zIndex: 1, borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.04em' }}>Premium Features</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '18px', maxWidth: '500px', margin: '0 auto', fontWeight: 500 }}>
              Everything you need to gather feedback efficiently, packaged in a stunning editorial interface.
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            <FeatureCard 
              delay={0.1}
              icon={BarChart2} 
              title="Real-Time Analytics" 
              desc="Watch the votes roll in instantly. No refreshing required. The charts update smoothly as data arrives." 
            />
            <FeatureCard 
              delay={0.2}
              icon={Users} 
              title="Community Feed" 
              desc="Explore trending polls from the community. Vote, like, and bookmark your favorite topics effortlessly." 
            />
            <FeatureCard 
              delay={0.3}
              icon={Shield} 
              title="Secure Voting" 
              desc="Robust authentication and fraud prevention ensures every vote is unique and securely recorded." 
            />
          </div>
        </div>
      </section>

      {/* Projects Showcase Section */}
      <section id="projects" style={{ padding: '100px 20px', background: 'var(--color-bg)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div className="card card-dark" style={{ padding: '48px', marginBottom: '48px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
             <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.04em' }}>Meet the Developer</h2>
             <p style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', marginBottom: '32px', maxWidth: '700px' }}>
               Hi, I'm Muhammad Junaid. I specialize in building highly interactive, scalable web applications with a massive focus on user experience and design engineering.
             </p>
             <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <a href="https://muhammadjunaid.dev" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ border: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Globe size={16} /> Portfolio Website
                </a>
                <a href="https://github.com/doctorJunaid" target="_blank" rel="noopener noreferrer" className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <GithubIcon /> GitHub
                </a>
             </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '48px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.04em' }}>Featured Projects</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '16px', fontWeight: 500 }}>
                A showcase of premium applications built with modern web technologies.
              </p>
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            <ProjectCard 
              delay={0.1}
              title="PulseVote"
              desc="A premium, real-time polling application with optimistic UI updates, responsive design, and robust security."
              tags={['React', 'Node.js', 'MongoDB', 'Socket.io', 'Framer Motion']}
              link="#"
            />
            <ProjectCard 
              delay={0.2}
              title="E-Commerce Storefront"
              desc="High-performance online store with seamless checkout, inventory management, and a beautiful user interface."
              tags={['Next.js', 'Stripe', 'TailwindCSS', 'PostgreSQL']}
              link="#"
            />
            <ProjectCard 
              delay={0.3}
              title="Task Management Dashboard"
              desc="A drag-and-drop kanban board for teams to organize work, complete with real-time collaboration features."
              tags={['React', 'Redux', 'Express', 'Firebase']}
              link="#"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '64px 20px',
        borderTop: '1px solid var(--color-border)',
        textAlign: 'center',
        background: 'var(--color-surface)',
        color: 'var(--color-text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'var(--color-text-primary)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={16} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.06em' }}>PulseVote.</span>
        </div>
        <p style={{ marginBottom: '24px', fontWeight: 500 }}>Built with passion and modern web technologies.</p>
        <p style={{ fontSize: '14px' }}>&copy; {new Date().getFullYear()} Muhammad Junaid. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
