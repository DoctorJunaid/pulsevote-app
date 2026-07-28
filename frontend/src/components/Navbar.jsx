import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../store/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/': 'Explore',
  '/my-polls': 'My Polls',
  '/bookmarks': 'Bookmarks',
  '/create': 'Create Poll',
  '/settings': 'Settings',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const displayName = user?.name || user?.username || 'User';
  const pageTitle = PAGE_TITLES[location.pathname] || 'PulseVote';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const [search, setSearch] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (search.trim()) {
        navigate(`/?search=${encodeURIComponent(search.trim())}`);
      } else {
        navigate('/');
      }
    }
  };

  return (
    <header style={{
      height: '72px', /* Taller for editorial feel */
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 48px',
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>

      {/* Page Title / Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontSize: '18px',
          fontWeight: 800,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.04em',
        }}>
          {pageTitle}
        </span>
      </div>

      {/* Right Side Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={18} strokeWidth={2.5} style={{
            position: 'absolute', left: '16px', top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-tertiary)',
            pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Search polls..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              padding: '12px 16px 12px 44px',
              fontSize: '14px',
              borderRadius: '999px', /* Pill search bar */
              background: 'var(--color-bg)',
              border: '1px solid transparent',
              color: 'var(--color-text-primary)',
              transition: 'all 0.2s ease',
            }}
            onFocus={e => {
              e.target.style.background = 'var(--color-surface)';
              e.target.style.borderColor = 'var(--color-text-primary)';
            }}
            onBlur={e => {
              e.target.style.background = 'var(--color-bg)';
              e.target.style.borderColor = 'transparent';
            }}
          />
        </div>

        {/* Notification Bell */}
        <button
          className="btn btn-ghost btn-icon"
          style={{ width: '44px', height: '44px' }}
        >
          <Bell size={20} strokeWidth={2.5} />
        </button>

        {/* Separator */}
        <div style={{
          width: '1px', height: '24px',
          background: 'var(--color-border)',
          margin: '0 4px',
        }} />

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '999px',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1px solid var(--color-border)',
                }}
              />
            ) : (
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'var(--color-text-primary)',
                color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 800,
              }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <ChevronDown
              size={16} strokeWidth={2.5}
              color="var(--color-text-primary)"
              style={{
                transition: 'transform 0.2s ease',
                transform: showMenu ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>

          {showMenu && (
            <div
              className="animate-scaleIn dropdown-menu"
              style={{
                position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                zIndex: 100,
                transformOrigin: 'top right',
                minWidth: '200px',
                padding: '8px',
                borderRadius: '20px',
              }}
            >
              <Link
                to="/settings"
                onClick={() => setShowMenu(false)}
                className="dropdown-item"
              >
                <SettingsIcon size={18} strokeWidth={2.5} />
                Settings
              </Link>
              <div style={{
                height: '1px',
                background: 'var(--color-border)',
                margin: '8px',
              }} />
              <button
                onClick={handleLogout}
                className="dropdown-item danger"
              >
                <LogOut size={18} strokeWidth={2.5} />
                Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
