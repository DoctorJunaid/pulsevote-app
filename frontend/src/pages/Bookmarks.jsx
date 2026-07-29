import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import PollCard from '../components/PollCard';
import { Loader2, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';

import { PollCardSkeleton } from '../components/Skeleton';

const Bookmarks = () => {
  const [polls, setPolls]     = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    try {
      const { data } = await api.get('/poll/bookmarks');
      setPolls(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookmarks(); }, []);

  return (
    <div style={{
      maxWidth: '680px', margin: '0 auto',
      display: 'flex', flexDirection: 'column', gap: '48px',
    }}>

      {/* ── Massive Editorial Header ────────────────────── */}
      <div>
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800,
          color: 'var(--color-text-primary)',
          margin: 0, letterSpacing: '-0.06em',
          lineHeight: 1.1,
        }}>
          Bookmarks.
        </h1>
        <p style={{
          margin: '8px 0 0', fontSize: '16px', fontWeight: 500,
          color: 'var(--color-text-secondary)',
          letterSpacing: '-0.01em',
        }}>
          Polls you saved for quick access
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <PollCardSkeleton />
          <PollCardSkeleton />
          <PollCardSkeleton />
        </div>
      ) : polls.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px',
        }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'var(--color-text-primary)',
            borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Bookmark size={24} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <h3 style={{
            fontSize: '24px', fontWeight: 800,
            color: 'var(--color-text-primary)',
            margin: '0 0 8px', letterSpacing: '-0.04em',
          }}>
            No bookmarks yet
          </h3>
          <p style={{
            fontSize: '16px', fontWeight: 500,
            color: 'var(--color-text-secondary)',
            margin: 0,
          }}>
            Tap the bookmark icon on any poll to save it here.
          </p>
        </div>
      ) : (
        polls.map(poll => (
          <PollCard key={poll._id} poll={poll} onVote={fetchBookmarks} />
        ))
      )}

    </div>
  );
};

export default Bookmarks;
