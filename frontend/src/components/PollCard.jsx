import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { Share2, Bookmark, MoreHorizontal, Users, MessageSquare, Trash2, Lock, Unlock, Send } from 'lucide-react';
import { useAuth } from '../store/useAuth';

// Premium entrance animation for the whole card
const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30, mass: 1 }
  }
};

const PollCard = ({ poll, onVote, isOwner: propIsOwner }) => {
  const { user } = useAuth();
  const [optimisticPoll, setOptimisticPoll] = useState(poll);
  const [isBookmarked, setIsBookmarked] = useState(poll.isBookmarked || false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments]   = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showMenu, setShowMenu]   = useState(false);
  const menuRef = useRef(null);

  const isOwner = propIsOwner || (user && optimisticPoll.creator && (user._id === optimisticPoll.creator._id || user._id === optimisticPoll.creator));

  // Sync with upstream changes
  useEffect(() => {
    setOptimisticPoll(poll);
    setIsBookmarked(poll.isBookmarked || false);
  }, [poll]);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    if (showMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu]);

  const handleVote = async (optionIndex) => {
    if (optimisticPoll.isClosed) return;

    // 1. Save previous state for rollback
    const previousPoll = { ...optimisticPoll };

    const option = optimisticPoll.options[optionIndex];
    const voteValue = option._id || option.text;
    
    // Check if clicking the same option (toggle off)
    const isSameOption = optimisticPoll.votedOption === voteValue || optimisticPoll.votedOption === String(optionIndex) || optimisticPoll.votedOption === option.text;

    let newTotalVotes = optimisticPoll.totalVotes || 0;
    
    // 2. Apply optimistic math
    const newOptions = optimisticPoll.options.map((opt, idx) => {
      let count = opt.votesCount || 0;
      const optValue = opt._id || opt.text;
      const isOldVote = optimisticPoll.votedOption === optValue || optimisticPoll.votedOption === String(idx) || optimisticPoll.votedOption === opt.text;

      if (isSameOption) {
        // Toggle OFF (remove vote)
        if (idx === optionIndex) count = Math.max(0, count - 1);
      } else if (optimisticPoll.userVoted) {
        // Switch vote
        if (isOldVote) count = Math.max(0, count - 1);
        if (idx === optionIndex) count += 1;
      } else {
        // New vote
        if (idx === optionIndex) count += 1;
      }
      return { ...opt, votesCount: count };
    });

    if (isSameOption) {
      newTotalVotes = Math.max(0, newTotalVotes - 1);
    } else if (!optimisticPoll.userVoted) {
      newTotalVotes += 1;
    }

    // Calculate new percentages
    newOptions.forEach(opt => {
      opt.percentage = newTotalVotes > 0 ? Math.round((opt.votesCount / newTotalVotes) * 100) : 0;
    });

    setOptimisticPoll({
      ...optimisticPoll,
      options: newOptions,
      totalVotes: newTotalVotes,
      userVoted: !isSameOption,
      votedOption: isSameOption ? null : voteValue
    });

    // 3. Perform background request
    try {
      await api.post(`/poll/${optimisticPoll._id}/vote`, { value: voteValue });
    } catch (err) {
      // 4. Revert and notify on failure
      setOptimisticPoll(previousPoll);
      toast.error(err.response?.data?.message || 'Failed to vote. Reverting...');
    }
  };

  const handleToggleBookmark = async () => {
    const previousState = isBookmarked;
    setIsBookmarked(!isBookmarked); // Optimistic UI update
    
    try {
      await api.post(`/poll/${optimisticPoll._id}/bookmark`);
      toast.success(isBookmarked ? 'Bookmark removed' : 'Poll bookmarked');
    } catch (err) {
      setIsBookmarked(previousState); // Revert
      toast.error('Failed to update bookmark');
    }
  };

  const handleToggleClose = async () => {
    try {
      const { data } = await api.patch(`/poll/${optimisticPoll._id}/close`);
      toast.success(data.message || 'Poll status updated');
      if (onVote) onVote();
    } catch (err) {
      toast.error('Failed to update poll status');
    }
  };

  const handleDeletePoll = async () => {
    try {
      await api.delete(`/poll/${optimisticPoll._id}`);
      toast.success('Poll deleted successfully');
      if (onVote) onVote();
    } catch (err) {
      toast.error('Failed to delete poll');
    }
  };

  const toggleComments = async () => {
    const nextState = !showComments;
    setShowComments(nextState);
    if (nextState && comments.length === 0) {
      setLoadingComments(true);
      try {
        const { data } = await api.get(`/comment/${optimisticPoll._id}`);
        setComments(Array.isArray(data) ? data : (data?.data || []));
      } catch {
        toast.error('Failed to load comments');
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const { data } = await api.post(`/comment/${optimisticPoll._id}`, { text: newComment.trim() });
      toast.success('Comment added!');
      setComments([data.comment || data.data, ...comments]);
      setNewComment('');
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const totalVotes = optimisticPoll.totalVotes || 0;
  const creatorName = optimisticPoll.creator?.username || 'user';

  const getTimeAgo = () => {
    if (!optimisticPoll.createdAt) return 'Just now';
    const diff = Date.now() - new Date(optimisticPoll.createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const hasVotedGlobal = optimisticPoll.userVoted || optimisticPoll.hasVotedLocally;

  return (
    <motion.div 
      className="card card-hover" 
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      style={{
        padding: 0,
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
      }}
    >

      {/* ── Editorial Header ──────────────────────────── */}
      <div style={{
        padding: '32px 32px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '16px',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--color-text-primary)',
              color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 800, flexShrink: 0,
            }}>
              {creatorName.charAt(0).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: '14px', fontWeight: 800,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}>
                @{creatorName}
              </span>
              <span style={{
                fontSize: '12px',
                color: 'var(--color-text-tertiary)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginTop: '4px',
              }}>
                {getTimeAgo()}
              </span>
            </div>
          </div>

          <h2 style={{
            fontSize: '24px', fontWeight: 800,
            color: 'var(--color-text-primary)',
            margin: '0 0 8px 0', lineHeight: 1.3,
            letterSpacing: '-0.04em',
          }}>
            {optimisticPoll.question}
          </h2>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
            <span style={{
              fontSize: '12px', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              color: 'var(--color-primary)',
            }}>
              {optimisticPoll.category || 'General'}
            </span>
            {optimisticPoll.isClosed && (
              <span style={{
                fontSize: '12px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                color: 'var(--color-danger)',
              }}>
                · Closed
              </span>
            )}
          </div>
        </div>

        {/* Owner Menu */}
        {isOwner && (
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setShowMenu(!showMenu)}
              style={{ width: '40px', height: '40px', color: 'var(--color-text-primary)' }}
            >
              <MoreHorizontal size={20} strokeWidth={2.5} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="dropdown-menu"
                  style={{
                    position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                    zIndex: 30, transformOrigin: 'top right',
                    padding: '8px', borderRadius: '20px',
                  }}
                >
                  <button onClick={handleToggleClose} className="dropdown-item">
                    {optimisticPoll.isClosed ? <Unlock size={16} strokeWidth={2.5} /> : <Lock size={16} strokeWidth={2.5} />}
                    {optimisticPoll.isClosed ? 'Reopen Poll' : 'Close Poll'}
                  </button>
                  <button onClick={handleDeletePoll} className="dropdown-item danger">
                    <Trash2 size={16} strokeWidth={2.5} />
                    Delete Poll
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Vote Options ────────────────────────────── */}
      <div style={{ padding: '0 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {optimisticPoll.options?.map((opt, i) => {
          const voteCount = opt.votesCount || 0;
          const pct = opt.percentage || 0;
          const isMyVote = optimisticPoll.userVoted && (optimisticPoll.votedOption === opt._id || optimisticPoll.votedOption === String(i) || optimisticPoll.votedOption === opt.text);
          
          return (
            <motion.button
              key={opt._id || i}
              whileTap={(!optimisticPoll.isClosed) ? { scale: 0.98 } : {}}
              onClick={() => handleVote(i)}
              disabled={optimisticPoll.isClosed}
              style={{
                position: 'relative',
                width: '100%',
                background: 'var(--color-bg)',
                borderRadius: '999px',
                padding: '16px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: optimisticPoll.isClosed ? 'not-allowed' : 'pointer',
                overflow: 'hidden',
                border: isMyVote ? '2px solid var(--color-primary)' : '2px solid transparent',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            >
              {/* Progress fill - premium spring animation */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20, mass: 1 }}
                style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  background: 'var(--color-primary)',
                  borderRadius: '999px',
                }}
              />
              
              <span style={{
                position: 'relative', zIndex: 1,
                fontSize: '15px', fontWeight: 800,
                color: pct > 15 ? '#FFFFFF' : 'var(--color-text-primary)',
                transition: 'color 0.3s ease',
                letterSpacing: '-0.02em',
              }}>
                {opt.text}
              </span>

              <div style={{
                position: 'relative', zIndex: 1,
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <span style={{
                  fontSize: '13px',
                  color: pct > 85 ? 'rgba(255,255,255,0.8)' : 'var(--color-text-tertiary)',
                  fontWeight: 600,
                  transition: 'color 0.3s ease',
                }}>
                  {voteCount} votes
                </span>
                <span style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: pct > 95 ? '#FFFFFF' : 'var(--color-text-primary)',
                  fontVariantNumeric: 'tabular-nums',
                  transition: 'color 0.3s ease',
                }}>
                  {pct}%
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ── Card Footer ───────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '24px 32px',
        marginTop: '32px',
        borderTop: '1px solid var(--color-border)',
      }}>
        <div style={{
          display: 'flex', gap: '24px',
          fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: 700,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={16} strokeWidth={2.5} />
            {totalVotes} Votes
          </span>
          <button onClick={toggleComments} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', gap: '6px',
            color: showComments ? 'var(--color-primary)' : 'var(--color-text-primary)',
            fontSize: '14px', fontWeight: 700,
            fontFamily: 'inherit',
            transition: 'color 0.2s ease',
          }}>
            <MessageSquare size={16} strokeWidth={2.5} />
            {comments.length ? `${comments.length} Comments` : 'Discuss'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={handleToggleBookmark}
            className="btn btn-ghost btn-icon"
            style={{ color: isBookmarked ? 'var(--color-primary)' : 'var(--color-text-primary)' }}
          >
            <Bookmark size={20} fill={isBookmarked ? 'var(--color-primary)' : 'none'} strokeWidth={2.5} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Link copied!');
            }}
            className="btn btn-ghost btn-icon"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <Share2 size={20} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>

      {/* ── Comments Thread ───────────────────────────── */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '0 32px 32px',
            }}>
              <form onSubmit={handleAddComment} style={{
                display: 'flex', gap: '12px',
                marginBottom: '20px',
              }}>
                <input
                  type="text"
                  placeholder="Add to the discussion..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  style={{
                    borderRadius: '999px',
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  disabled={submittingComment || !newComment.trim()}
                  type="submit"
                  className="btn btn-primary btn-icon"
                  style={{ flexShrink: 0, width: '54px', height: '54px' }}
                >
                  <Send size={18} strokeWidth={2.5} />
                </motion.button>
              </form>

              {loadingComments ? (
                <div style={{
                  fontSize: '14px', color: 'var(--color-text-tertiary)', fontWeight: 600,
                  textAlign: 'center', padding: '16px 0',
                }}>
                  Loading...
                </div>
              ) : comments.length === 0 ? (
                <div style={{
                  fontSize: '14px', color: 'var(--color-text-tertiary)', fontWeight: 600,
                  textAlign: 'center', padding: '16px 0',
                }}>
                  Be the first to comment.
                </div>
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '16px',
                  maxHeight: '300px', overflowY: 'auto', paddingRight: '8px',
                }}>
                  {comments.map((c, i) => (
                    <motion.div 
                      key={c._id || i} 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      style={{ display: 'flex', gap: '12px' }}
                    >
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 800, flexShrink: 0,
                      }}>
                        {c.user?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex', alignItems: 'baseline', gap: '8px',
                        }}>
                          <span style={{ fontWeight: 800, fontSize: '14px' }}>
                            @{c.user?.username || 'user'}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                            {new Date(c.createdAt || Date.now()).toLocaleTimeString([], {
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div style={{
                          fontSize: '14.5px', color: 'var(--color-text-secondary)',
                          lineHeight: 1.5, marginTop: '2px',
                        }}>
                          {c.text}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default PollCard;
