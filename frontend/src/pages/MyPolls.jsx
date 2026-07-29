import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import PollCard from '../components/PollCard';
import { Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { PollCardSkeleton } from '../components/Skeleton';

const MyPolls = () => {
  const [polls, setPolls]     = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyPolls = async () => {
    try {
      const { data } = await api.get('/poll/mine');
      setPolls(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      toast.error('Failed to load your polls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyPolls(); }, []);

  return (
    <div style={{
      maxWidth: '680px', margin: '0 auto',
      display: 'flex', flexDirection: 'column', gap: '48px',
    }}>

      {/* ── Massive Editorial Header ────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        flexWrap: 'wrap', gap: '16px',
        marginBottom: '16px',
      }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800,
            color: 'var(--color-text-primary)',
            margin: 0, letterSpacing: '-0.06em',
            lineHeight: 1.1,
          }}>
            My Polls.
          </h1>
          <p style={{
            margin: '8px 0 0', fontSize: '16px', fontWeight: 500,
            color: 'var(--color-text-secondary)',
            letterSpacing: '-0.01em',
          }}>
            Polls you've created and manage
          </p>
        </div>
        <Link to="/create" style={{ textDecoration: 'none' }}>
          <button className="btn btn-primary btn-lg" style={{ gap: '8px' }}>
            <Plus size={20} strokeWidth={2.5} />
            Create Poll
          </button>
        </Link>
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
            margin: '0 auto 24px', fontSize: '28px',
            color: '#FFFFFF',
          }}>
            📊
          </div>
          <h3 style={{
            fontSize: '24px', fontWeight: 800,
            color: 'var(--color-text-primary)',
            margin: '0 0 8px', letterSpacing: '-0.04em',
          }}>
            No polls yet
          </h3>
          <p style={{
            fontSize: '16px', fontWeight: 500,
            color: 'var(--color-text-secondary)',
            margin: '0 0 32px',
          }}>
            Create your first poll and start engaging the community.
          </p>
          <Link to="/create" style={{ textDecoration: 'none' }}>
            <button className="btn btn-primary btn-lg">Create Your First Poll</button>
          </Link>
        </div>
      ) : (
        polls.map(poll => (
          <PollCard key={poll._id} poll={poll} onVote={fetchMyPolls} isOwner={true} />
        ))
      )}

    </div>
  );
};

export default MyPolls;
