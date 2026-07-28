import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { Share2, Bookmark, MoreHorizontal, Users, MessageSquare, Trash2, Lock, Unlock, Send, Edit, BarChart3, X } from 'lucide-react';
import { useAuth } from '../store/useAuth';
import { Link } from 'react-router-dom';

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
  const [comments, setComments]   = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showMenu, setShowMenu]   = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [editTitle, setEditTitle] = useState(poll.question);
  const [editCategory, setEditCategory] = useState(poll.category || 'General');
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
      if (isSameOption) {
        await api.delete(`/poll/${optimisticPoll._id}/vote`);
      } else {
        await api.post(`/poll/${optimisticPoll._id}/vote`, { value: voteValue });
      }
    } catch (err) {
      // 4. Revert and notify on failure
      setOptimisticPoll(previousPoll);
      toast.error(err.response?.data?.message || 'Failed to update vote. Reverting...');
    }
  };

  const handleFetchAnalytics = async () => {
    try {
      const { data } = await api.get(`/poll/${optimisticPoll._id}/analytics`);
      setAnalyticsData(data);
      setShowAnalytics(true);
      setShowMenu(false);
    } catch (err) {
      toast.error('Failed to load analytics');
    }
  };

  const handleSaveEdit = async () => {
    try {
      const { data } = await api.patch(`/poll/${optimisticPoll._id}`, { question: editTitle, category: editCategory });
      setOptimisticPoll(prev => ({ ...prev, question: editTitle, category: editCategory }));
      setShowEdit(false);
      toast.success('Poll updated');
    } catch (err) {
      toast.error('Failed to update poll');
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
    if (nextState && comments === null) {
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
    
    const textToSubmit = newComment.trim();
    const parentId = replyingTo?._id || null;
    
    // Optimistic UI setup
    const tempId = `temp-${Date.now()}`;
    const optimisticComment = {
      _id: tempId,
      text: textToSubmit,
      parent: parentId,
      user: {
        _id: user?._id,
        name: user?.name,
        username: user?.username,
        avatar: user?.avatar,
      },
      createdAt: new Date().toISOString(),
      isPending: true
    };

    setComments([...(comments || []), optimisticComment]);
    setNewComment('');
    setReplyingTo(null);

    // Scroll to the new comment
    setTimeout(() => {
      const el = document.getElementById(`comment-${tempId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);

    // Backend request
    try {
      const { data } = await api.post(`/comment/${optimisticPoll._id}`, { 
        text: textToSubmit,
        parent: parentId 
      });
      const savedComment = data.comment || data.data || data;
      setComments(prev => prev.map(c => c._id === tempId ? savedComment : c));
      toast.success(parentId ? 'Reply added!' : 'Comment added!');
    } catch (err) {
      toast.error('Failed to add comment');
      setComments(prev => prev.filter(c => c._id !== tempId));
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comment/${commentId}`);
      toast.success('Comment deleted');
      setComments((comments || []).filter(c => c._id !== commentId && c.parent !== commentId));
    } catch (err) {
      toast.error('Failed to delete comment');
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
              <Link to={`/user/${creatorName}`} style={{
                fontSize: '14px', fontWeight: 800,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                textDecoration: 'none'
              }}>
                @{creatorName}
              </Link>
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
                  <button onClick={() => { setShowEdit(true); setShowMenu(false); }} className="dropdown-item">
                    <Edit size={16} strokeWidth={2.5} />
                    Edit Poll
                  </button>
                  <button onClick={handleFetchAnalytics} className="dropdown-item">
                    <BarChart3 size={16} strokeWidth={2.5} />
                    View Analytics
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
            {comments === null ? (optimisticPoll.comments > 0 ? `${optimisticPoll.comments} Comments` : 'Discuss') : (comments.length > 0 ? `${comments.length} Comments` : 'Discuss')}
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
                  id="commentInput"
                  type="text"
                  placeholder={replyingTo ? `Replying to @${replyingTo.user?.username}...` : "Add to the discussion..."}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  style={{
                    borderRadius: '999px',
                  }}
                />
                {replyingTo && (
                  <button type="button" onClick={() => { setReplyingTo(null); setNewComment(''); }} style={{
                    background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', fontSize: '12px', fontWeight: 700
                  }}>
                    Cancel
                  </button>
                )}
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
              ) : (comments || []).length === 0 ? (
                <div style={{
                  fontSize: '14px', color: 'var(--color-text-tertiary)', fontWeight: 600,
                  textAlign: 'center', padding: '16px 0',
                }}>
                  Be the first to comment.
                </div>
              ) : (
                <div 
                  id={`comments-${optimisticPoll._id}`}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: '16px',
                    maxHeight: '300px', overflowY: 'auto', paddingRight: '8px',
                  }}
                >
                  {(comments || []).filter(c => !c.parent).map((c, i) => (
                    <motion.div 
                      key={c._id || i} 
                      id={`comment-${c._id}`}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: c.isPending ? 0.5 : 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                    >
                      <div style={{ display: 'flex', gap: '12px' }}>
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
                            <Link to={`/user/${c.user?.username}`} style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-text-primary)', textDecoration: 'none' }}>
                              @{c.user?.username || 'user'}
                            </Link>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                              {c.isPending ? 'Posting...' : new Date(c.createdAt || Date.now()).toLocaleTimeString([], {
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
                          <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                            <button onClick={() => { setReplyingTo(c); document.querySelector('#commentInput')?.focus(); }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                              Reply
                            </button>
                            {user?._id === c.user?._id && (
                              <button onClick={() => handleDeleteComment(c._id)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {(comments || []).filter(reply => reply.parent === c._id).map(reply => (
                        <div key={reply._id} id={`comment-${reply._id}`} style={{ display: 'flex', gap: '12px', marginLeft: '32px', borderLeft: '2px solid var(--color-border)', paddingLeft: '16px', opacity: reply.isPending ? 0.5 : 1 }}>
                          <div style={{
                            width: '24px', height: '24px', borderRadius: '50%',
                            background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '10px', fontWeight: 800, flexShrink: 0,
                          }}>
                            {reply.user?.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              display: 'flex', alignItems: 'baseline', gap: '8px',
                            }}>
                              <Link to={`/user/${reply.user?.username}`} style={{ fontWeight: 800, fontSize: '13px', color: 'var(--color-text-primary)', textDecoration: 'none' }}>
                                @{reply.user?.username || 'user'}
                              </Link>
                              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                                {reply.isPending ? 'Posting...' : new Date(reply.createdAt || Date.now()).toLocaleTimeString([], {
                                  hour: '2-digit', minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <div style={{
                              fontSize: '14px', color: 'var(--color-text-secondary)',
                              lineHeight: 1.5, marginTop: '2px',
                            }}>
                              {reply.text}
                            </div>
                            <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                              {user?._id === reply.user?._id && (
                                <button onClick={() => handleDeleteComment(reply._id)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      {showEdit && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'var(--color-surface)', padding: '32px', borderRadius: '24px',
            width: '100%', maxWidth: '500px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Edit Poll</h3>
              <button onClick={() => setShowEdit(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="label">Question</label>
              <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="label">Category</label>
              <select value={editCategory} onChange={e => setEditCategory(e.target.value)}>
                <option value="General">General</option>
                <option value="Technology">Technology</option>
                <option value="Science">Science</option>
                <option value="Sports">Sports</option>
                <option value="Politics">Politics</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '999px' }} onClick={handleSaveEdit}>
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && analyticsData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'var(--color-surface)', padding: '32px', borderRadius: '24px',
            width: '100%', maxWidth: '500px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Poll Analytics</h3>
              <button onClick={() => setShowAnalytics(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ flex: 1, padding: '16px', background: 'var(--color-bg)', borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>{analyticsData.totalVotes}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Total Votes</div>
              </div>
              <div style={{ flex: 1, padding: '16px', background: 'var(--color-bg)', borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>{analyticsData.totalComments}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Comments</div>
              </div>
            </div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--color-text-secondary)' }}>Vote Breakdown</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {analyticsData.options.map(opt => (
                <div key={opt._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{opt.text}</span>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{opt.count} votes ({opt.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
};

export default PollCard;
