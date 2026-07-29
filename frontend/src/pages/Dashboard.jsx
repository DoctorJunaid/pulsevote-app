import React, { useEffect, useState } from 'react';
import { useAuth } from '../store/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Vote, Bookmark, BarChart2, CheckCircle2, ArrowRight } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { DashboardSkeleton } from '../components/Skeleton';

/* ── Activity Chart Mock Data ─────────────────────────── */
const votingActivityData = [
  { day: 'Mon', votes: 120, voters: 85 },
  { day: 'Tue', votes: 240, voters: 140 },
  { day: 'Wed', votes: 190, voters: 110 },
  { day: 'Thu', votes: 380, voters: 230 },
  { day: 'Fri', votes: 450, voters: 310 },
  { day: 'Sat', votes: 520, voters: 390 },
  { day: 'Sun', votes: 610, voters: 440 },
];

const CATEGORY_COLORS = ['#FF5238', '#111111', '#059669', '#3B82F6', '#E11D48', '#757169'];

/* ── Custom Tooltip ───────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#111111',
      color: '#FFFFFF',
      borderRadius: '12px',
      padding: '12px 16px',
      boxShadow: 'var(--shadow-md)',
      fontSize: '13px',
      lineHeight: 1.6,
      border: 'none',
    }}>
      <div style={{ fontWeight: 800, marginBottom: '8px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ fontWeight: 600 }}>{p.name}:</span>
          <span style={{ fontWeight: 800, color: '#FFFFFF' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Stat Card ────────────────────────────────────────── */
const StatCard = ({ title, value, icon: Icon, isDark = false, isAccent = false, delayIndex = 0 }) => {
  let bgColor = 'var(--color-card)';
  let textColor = 'var(--color-text-primary)';
  let subtextColor = 'var(--color-text-secondary)';
  let iconBg = 'var(--color-bg)';
  let iconColor = 'var(--color-text-primary)';

  if (isDark) {
    bgColor = 'var(--color-brand-dark)';
    textColor = '#FFFFFF';
    subtextColor = 'rgba(255,255,255,0.7)';
    iconBg = 'rgba(255,255,255,0.1)';
    iconColor = '#FFFFFF';
  } else if (isAccent) {
    bgColor = 'var(--color-primary)';
    textColor = '#FFFFFF';
    subtextColor = 'rgba(255,255,255,0.8)';
    iconBg = 'rgba(255,255,255,0.2)';
    iconColor = '#FFFFFF';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: delayIndex * 0.1 }}
      whileHover={{ y: -4, boxShadow: 'var(--shadow-float)' }}
      style={{
        background: bgColor,
        borderRadius: '24px',
        padding: '24px',
        display: 'flex', flexDirection: 'column', gap: '20px',
        boxShadow: isDark || isAccent ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        border: isDark || isAccent ? 'none' : '1px solid var(--color-border)',
      }}
    >
      <div style={{
        width: '48px', height: '48px', borderRadius: '14px',
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={22} color={iconColor} strokeWidth={2.5} />
      </div>
      <div>
        <div style={{
          fontSize: '14px', fontWeight: 700,
          color: subtextColor,
          marginBottom: '6px',
        }}>
          {title}
        </div>
        <div style={{
          fontSize: '40px', fontWeight: 800,
          color: textColor,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {value}
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user, userStats, fetchMe } = useAuth();
  const navigate = useNavigate();
  const [recentPolls, setRecentPolls]   = useState([]);
  const [trendingData, setTrendingData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    fetchMe();
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [pollsRes, trendingRes] = await Promise.all([
        api.get('/poll'),
        api.get('/poll/trending')
      ]);

      const polls = Array.isArray(pollsRes.data) ? pollsRes.data : (pollsRes.data?.data || []);
      setRecentPolls(polls.slice(0, 5));

      const catCounts = {};
      polls.forEach(p => {
        const cat = p.category || 'General';
        catCounts[cat] = (catCounts[cat] || 0) + 1;
      });

      const catPie = Object.keys(catCounts).map((cat, i) => ({
        name: cat,
        value: catCounts[cat],
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
      }));

      setCategoryData(catPie.length ? catPie : [
        { name: 'Technology', value: 40, color: '#FF5238' },
        { name: 'General',    value: 30, color: '#111111' },
        { name: 'Sports',     value: 20, color: '#059669' },
        { name: 'Science',    value: 10, color: '#3B82F6' },
      ]);

      setTrendingData(Array.isArray(trendingRes.data) ? trendingRes.data : []);

    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  const displayName = user?.name || user?.username || 'User';

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

      {/* ── Massive Editorial Header ────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}
      >
        <div>
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800,
            color: 'var(--color-text-primary)',
            margin: 0, letterSpacing: '-0.06em',
            lineHeight: 1.1,
          }}>
            Welcome back,<br/>
            {displayName}.
          </h1>
          <p style={{
            margin: '12px 0 0',
            fontSize: '16px', fontWeight: 500,
            color: 'var(--color-text-secondary)',
            letterSpacing: '-0.01em',
          }}>
            Here's your community polling activity overview
          </p>
        </div>
        <Link to="/create" style={{ textDecoration: 'none' }}>
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="btn btn-primary btn-lg" style={{ gap: '8px' }}
          >
            <Plus size={20} strokeWidth={2.5} />
            Create Poll
          </motion.button>
        </Link>
      </motion.div>

      {/* ── Stat Cards ──────────────── */}
      <div className="dashboard-stat-grid">
        <StatCard title="Polls Created" value={userStats.created || 0} icon={BarChart2} isAccent={true} delayIndex={1} />
        <StatCard title="Polls Voted" value={userStats.voted || 0} icon={CheckCircle2} isDark={true} delayIndex={2} />
        <StatCard title="Bookmarks" value={userStats.bookmark || 0} icon={Bookmark} delayIndex={3} />
        <StatCard title="Community Polls" value={recentPolls.length || 0} icon={Vote} delayIndex={4} />
      </div>

      {/* ── Charts Row ─────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ type: 'spring', damping: 25 }}
        className="dashboard-split-grid"
      >
        <div className="card card-hover" style={{ minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.04em' }}>Voting Activity</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-tertiary)', marginTop: '4px' }}>Weekly votes and voter engagement</div>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5238' }} />Votes</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#111111' }} />Voters</span>
            </div>
          </div>
          <div style={{ flex: 1, width: '100%', minHeight: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={votingActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF5238" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FF5238" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorVoters" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111111" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#111111" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#757169', fontSize: 13, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: '#757169', fontSize: 13, fontWeight: 700 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="votes" name="Votes" stroke="#FF5238" strokeWidth={3} fill="url(#colorVotes)" animationDuration={1500} />
                <Area type="monotone" dataKey="voters" name="Voters" stroke="#111111" strokeWidth={3} fill="url(#colorVoters)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.04em', marginBottom: '4px' }}>Categories</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: '24px' }}>Distribution across topics</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', gap: '24px' }}>
            <div style={{ width: '160px', height: '160px', position: 'relative', flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={52} outerRadius={76} paddingAngle={4} dataKey="value" stroke="none" cornerRadius={4} animationDuration={1500}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', overflowY: 'auto' }}>
              {categoryData.map((item, idx) => (
                <motion.div key={item.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + idx * 0.1 }} style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-tertiary)', fontWeight: 700 }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: item.color, flexShrink: 0 }} />
                    {item.name}
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px' }}>{item.value}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Bottom Section ─────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ type: 'spring', damping: 25 }}
        className="dashboard-split-grid"
      >
        <div className="card card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.04em' }}>Recent Polls</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-tertiary)', marginTop: '4px' }}>Latest community discussions</div>
            </div>
            <Link to="/" style={{ fontSize: '14px', color: 'var(--color-primary)', fontWeight: 800, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              View All <ArrowRight size={16} strokeWidth={3} />
            </Link>
          </div>
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0 0 16px 0', textAlign: 'left', fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '2px solid var(--color-border)' }}>Question</th>
                  <th style={{ padding: '0 0 16px', textAlign: 'left', fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '2px solid var(--color-border)' }}>Category</th>
                  <th style={{ padding: '0 0 16px', textAlign: 'right', fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '2px solid var(--color-border)' }}>Votes</th>
                </tr>
              </thead>
              <tbody>
                {recentPolls.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-tertiary)', fontSize: '15px', fontWeight: 600 }}>No recent polls found</td>
                  </tr>
                ) : (
                  recentPolls.map((p, idx) => (
                    <motion.tr
                      key={p._id}
                      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}
                      style={{ cursor: 'pointer', transition: 'background 0.2s ease' }}
                      onClick={() => navigate('/')}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 16px 16px 0', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ fontWeight: 800, fontSize: '14.5px', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px', letterSpacing: '-0.01em' }}>{p.question}</div>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-tertiary)', marginTop: '2px' }}>by @{p.creator?.username || 'user'}</div>
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
                        <span className="badge badge-brand">{p.category || 'General'}</span>
                      </td>
                      <td style={{ padding: '16px 0 16px 16px', textAlign: 'right', fontWeight: 800, fontSize: '15px', color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)' }}>
                        {p.totalVotes || (p.votes?.length) || 0}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.04em', marginBottom: '4px' }}>Poll Types</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: '24px' }}>Distribution by format</div>
          <div style={{ flex: 1, width: '100%', minHeight: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendingData.length ? trendingData : [{ type: 'Single', count: 18 }, { type: 'Yes/No', count: 12 }, { type: 'Rating', count: 8 }, { type: 'Image', count: 6 }]} barGap={8} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="type" tick={{ fill: '#757169', fontSize: 13, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: '#757169', fontSize: 13, fontWeight: 700 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <Bar dataKey="count" name="Polls" fill="#111111" radius={[8, 8, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
