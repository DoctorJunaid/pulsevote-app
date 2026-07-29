import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutGrid, Compass, Vote, Bookmark, Settings,
  Plus, Zap, Info, CheckCircle2, X
} from 'lucide-react';
import { useAuth } from '../store/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'Dashboard', icon: LayoutGrid, to: '/dashboard' },
  { label: 'Home',      icon: Compass,    to: '/' },
  { label: 'My Polls',  icon: Vote,       to: '/my-polls' },
  { label: 'Voted Polls', icon: CheckCircle2, to: '/voted-polls' },
  { label: 'Bookmarks', icon: Bookmark,   to: '/bookmarks' },
  { label: 'Settings',  icon: Settings,   to: '/settings' },
  { label: 'About',     icon: Info,       to: '/about' },
];

const SidebarContent = ({ onCloseMobile }) => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const displayName = user?.name || user?.username || 'User';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand & Close Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '36px',
      }}>
        <Link 
          to="/" 
          onClick={onCloseMobile}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
          }}
        >
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            style={{
              width: '38px', height: '38px',
              background: 'var(--color-text-primary)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
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
        </Link>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="btn btn-ghost btn-icon mobile-only"
            style={{ width: '40px', height: '40px' }}
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {navItems.map(({ label, icon: Icon, to }) => {
          const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
          return (
            <Link
              key={label}
              to={to}
              onClick={onCloseMobile}
              style={{ textDecoration: 'none' }}
            >
              <motion.div
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`sidebar-nav-item${isActive ? ' active' : ''}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 20px', borderRadius: '9999px',
                  color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                  background: isActive ? 'var(--color-primary)' : 'transparent',
                  fontWeight: 600, fontSize: '15px', transition: 'background 0.2s ease',
                }}
              >
                <Icon size={18} strokeWidth={2.5} />
                <span>{label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Info & CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
        <Link to="/create" onClick={onCloseMobile} style={{ textDecoration: 'none', width: '100%' }}>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-dark" style={{
              width: '100%', padding: '14px', gap: '8px',
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            New Poll
          </motion.button>
        </Link>

        <motion.div 
          whileHover={{ y: -2 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            borderRadius: '20px',
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
          }}
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="avatar"
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                objectFit: 'cover', flexShrink: 0,
              }}
            />
          ) : (
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'var(--color-text-primary)',
              color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 800, flexShrink: 0,
            }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              letterSpacing: '-0.02em'
            }}>
              {displayName}
            </div>
            <div style={{
              fontSize: '13px', color: 'var(--color-text-tertiary)',
              fontWeight: 500,
            }}>
              @{user?.username || 'user'}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const Sidebar = ({ mobileOpen, onCloseMobile }) => {
  const { pathname } = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    if (onCloseMobile) onCloseMobile();
  }, [pathname]);

  return (
    <>
      {/* Desktop Sidebar (hidden on screens < 1024px) */}
      <aside className="desktop-only" style={{
        width: '260px',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        flexDirection: 'column',
        padding: '32px 24px',
        background: 'var(--color-sidebar-bg)',
        borderRight: '1px solid var(--color-border)',
        overflowY: 'auto',
        userSelect: 'none',
        zIndex: 50,
      }}>
        <SidebarContent />
      </aside>

      {/* Mobile Drawer (visible when mobileOpen is true on screens < 1024px) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(4px)',
                zIndex: 90,
              }}
            />
            {/* Drawer panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                width: '280px',
                maxWidth: '85vw',
                background: 'var(--color-surface)',
                padding: '24px 20px',
                zIndex: 100,
                boxShadow: 'var(--shadow-float)',
                overflowY: 'auto',
              }}
            >
              <SidebarContent onCloseMobile={onCloseMobile} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
