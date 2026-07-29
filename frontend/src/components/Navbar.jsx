import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, LogOut, Settings as SettingsIcon, Menu, ArrowLeft, X } from 'lucide-react';
import { useAuth } from '../store/useAuth';
import { useNotifications } from '../store/useNotifications';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/': 'Explore',
  '/my-polls': 'My Polls',
  '/bookmarks': 'Bookmarks',
  '/create': 'Create Poll',
  '/settings': 'Settings',
  '/about': 'About',
};

const Navbar = ({ onToggleMobile }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const searchInputRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const displayName = user?.name || user?.username || 'User';
  const pageTitle = PAGE_TITLES[location.pathname] || 'PulseVote';

  // Helper for formatting relative time
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Fetch notifications on mount and poll every 15 seconds
  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  // Focus search input when expanded on mobile
  useEffect(() => {
    if (showSearchMobile && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchMobile]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    const events = ['mousedown', 'touchstart'];
    if (showMenu || showNotifications) {
      events.forEach(event => document.addEventListener(event, handleClickOutside));
    }
    return () => {
      events.forEach(event => document.removeEventListener(event, handleClickOutside));
    };
  }, [showMenu, showNotifications]);

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
    <header className="navbar-header" style={{
      height: '72px',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      gap: '12px',
    }}>

      {showSearchMobile ? (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px' }}>
          <button
            onClick={() => setShowSearchMobile(false)}
            className="btn btn-ghost btn-icon"
            style={{ width: '40px', height: '40px', flexShrink: 0, color: 'var(--color-text-primary)' }}
            aria-label="Back to navigation"
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} strokeWidth={2.5} style={{
              position: 'absolute', left: '14px', top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-tertiary)',
              pointerEvents: 'none',
            }} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={(e) => {
                handleKeyDown(e);
                if (e.key === 'Enter') {
                  setShowSearchMobile(false);
                }
              }}
              style={{
                padding: '10px 40px 10px 40px',
                fontSize: '14px',
                borderRadius: '999px',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                transition: 'all 0.2s ease',
                width: '100%',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: 'var(--color-text-tertiary)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex', alignItems: 'center',
                }}
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Left: Mobile Toggle & Page Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <button
              onClick={onToggleMobile}
              className="btn btn-ghost btn-icon mobile-only"
              aria-label="Toggle navigation menu"
              style={{ width: '40px', height: '40px', flexShrink: 0 }}
            >
              <Menu size={22} strokeWidth={2.5} />
            </button>

            <span style={{
              fontSize: '18px',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.04em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {pageTitle}
            </span>
          </div>

          {/* Right Side Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>

            {/* Desktop Search */}
            <div className="desktop-search" style={{ position: 'relative', width: '100%', maxWidth: '240px' }}>
              <Search size={18} strokeWidth={2.5} style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-tertiary)',
                pointerEvents: 'none',
              }} />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  padding: '10px 14px 10px 40px',
                  fontSize: '13.5px',
                  borderRadius: '999px',
                  background: 'var(--color-bg)',
                  border: '1px solid transparent',
                  color: 'var(--color-text-primary)',
                  transition: 'all 0.2s ease',
                  width: '100%',
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

            {/* Mobile Search Trigger */}
            <button
              onClick={() => setShowSearchMobile(true)}
              className="btn btn-ghost btn-icon mobile-search-trigger"
              style={{ width: '40px', height: '40px' }}
              aria-label="Search polls"
            >
              <Search size={20} strokeWidth={2.5} />
            </button>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) markAsRead();
                }}
                className="btn btn-ghost btn-icon"
                style={{ width: '40px', height: '40px', position: 'relative' }}
              >
                <Bell size={20} strokeWidth={2.5} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '6px', right: '8px',
                    width: '10px', height: '10px',
                    background: 'var(--color-danger)',
                    borderRadius: '50%',
                    border: '2px solid var(--color-surface)',
                  }} />
                )}
              </button>
              
              {showNotifications && (
                <div
                  className="animate-scaleIn dropdown-menu"
                  style={{
                    position: 'absolute', top: 'calc(100% + 12px)', right: '-8px',
                    zIndex: 100, transformOrigin: 'top right',
                    width: '300px', maxWidth: 'calc(100vw - 32px)', padding: '16px', borderRadius: '20px',
                    maxHeight: '380px', overflowY: 'auto',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 800 }}>Notifications</h3>
                  {notifications.length === 0 ? (
                    <div style={{ color: 'var(--color-text-tertiary)', fontSize: '14px', textAlign: 'center', padding: '16px 0' }}>
                      No new notifications
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {notifications.map((n, i) => {
                        const actor = n.actor || n.sender;
                        const isRead = n.read !== undefined ? n.read : n.isRead;
                        const targetUrl = actor?.username ? `/profile/${actor.username}` : '#';
                        return (
                          <Link
                            key={n._id || i}
                            to={targetUrl}
                            onClick={() => setShowNotifications(false)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '12px',
                              padding: '8px 10px', borderRadius: '12px',
                              background: isRead ? 'transparent' : 'var(--color-primary-subtle)',
                              transition: 'background 0.2s ease',
                              textDecoration: 'none',
                              color: 'inherit'
                            }}
                          >
                            {actor?.avatar ? (
                              <img
                                src={actor.avatar}
                                alt={actor.username}
                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                              />
                            ) : (
                              <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: 'var(--color-text-primary)', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '12px', fontWeight: 800, flexShrink: 0
                              }}>
                                {actor?.username?.charAt(0).toUpperCase() || 'U'}
                              </div>
                            )}
                            <div style={{ fontSize: '13px', lineHeight: 1.3, flex: 1 }}>
                              <div>
                                <span style={{ fontWeight: 800 }}>@{actor?.username || 'user'}</span>{' '}
                                {n.type === 'vote' && 'voted on your poll'}
                                {n.type === 'comment' && 'commented on your poll'}
                                {n.type === 'follow' && 'started following you'}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px', fontWeight: 600 }}>
                                {formatTimeAgo(n.createdAt)}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '999px',
                  transition: 'background 0.2s ease',
                }}
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
                    minWidth: '180px',
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
        </>
      )}
    </header>
  );
};

export default Navbar;
