import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import PollCard from '../components/PollCard';
import { Loader2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import { PollCardSkeleton } from '../components/Skeleton';

const SORT_OPTIONS   = ['Latest', 'Top Voted', 'Trending'];
const CAT_OPTIONS    = ['All', 'Technology', 'Science', 'Sports', 'Politics', 'Entertainment', 'General'];

const Feed = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  const [polls, setPolls]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [sort, setSort]         = useState('Latest');
  const [category, setCategory] = useState('All');
  const [openMenu, setOpenMenu] = useState(null);

  const fetchPolls = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = {};
      if (category && category !== 'All') params.category = category;
      if (sort) params.sort = sort;
      if (searchQuery) params.search = searchQuery;
      const { data } = await api.get('/poll', { params });
      setPolls(Array.isArray(data) ? data : (data?.data || []));
    } catch {
      toast.error('Failed to load feed');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => { fetchPolls(); }, [sort, category, searchQuery]);

  const toggleMenu = (name) => setOpenMenu(prev => prev === name ? null : name);

  return (
    <>
      {/* ── Massive Editorial Header ────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: '48px',
        }}
      >
        <div>
          <h1 style={{
            fontSize: '48px', fontWeight: 800,
            color: 'var(--color-text-primary)',
            margin: 0, letterSpacing: '-0.06em',
            lineHeight: 1.1,
          }}>
            Explore.
          </h1>
          <p style={{
            margin: '12px 0 0', fontSize: '18px', fontWeight: 500,
            color: 'var(--color-text-secondary)',
            letterSpacing: '-0.01em',
          }}>
            {polls.length} active polls · sorted by {sort.toLowerCase()}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <FilterDropdown
            label="Sort"
            value={sort}
            options={SORT_OPTIONS}
            open={openMenu === 'sort'}
            onToggle={() => toggleMenu('sort')}
            onSelect={v => { setSort(v); setOpenMenu(null); }}
          />
          <FilterDropdown
            label="Category"
            value={category}
            options={CAT_OPTIONS}
            open={openMenu === 'cat'}
            onToggle={() => toggleMenu('cat')}
            onSelect={v => { setCategory(v); setOpenMenu(null); }}
          />
        </div>
      </motion.div>

      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <PollCardSkeleton />
            <PollCardSkeleton />
            <PollCardSkeleton />
          </div>
        ) : polls.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', padding: '80px 20px' }}
          >
            <div style={{
              width: '64px', height: '64px',
              background: 'var(--color-text-primary)',
              borderRadius: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', fontSize: '28px',
              color: '#FFFFFF',
            }}>
              📭
            </div>
            <h3 style={{
              fontSize: '24px', fontWeight: 800,
              color: 'var(--color-text-primary)',
              margin: '0 0 8px', letterSpacing: '-0.04em',
            }}>
              No polls found
            </h3>
            <p style={{
              fontSize: '16px', fontWeight: 500,
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}>
              Be the first to create one!
            </p>
          </motion.div>
        ) : (
          polls.map((poll, idx) => (
            <PollCard key={poll._id} poll={poll} onVote={() => fetchPolls(true)} />
          ))
        )}
      </div>
    </>
  );
};

/* ── Filter Dropdown ──────────────────────────────────── */
const FilterDropdown = ({ label, value, options, open, onToggle, onSelect }) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onToggle();
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <motion.button 
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        className="btn btn-secondary" 
        onClick={onToggle} 
        style={{ gap: '8px', padding: '12px 20px', borderRadius: '999px', outline: 'none' }}
      >
        <span style={{ color: 'var(--color-text-tertiary)', fontWeight: 600 }}>{label}:</span>
        <span style={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>{value}</span>
        <ChevronDown
          size={16} strokeWidth={2.5}
          color="var(--color-text-primary)"
          style={{
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="dropdown-menu"
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              zIndex: 100,
              transformOrigin: 'top right',
              padding: '8px', borderRadius: '20px',
            }}
          >
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => onSelect(opt)}
                className="dropdown-item"
                style={{
                  fontWeight: opt === value ? 800 : 600,
                  color: opt === value ? 'var(--color-primary)' : undefined,
                  background: opt === value ? 'var(--color-primary-subtle)' : undefined,
                }}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Feed;
