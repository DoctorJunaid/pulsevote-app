import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence, useSpring } from 'framer-motion';
import { Check, Droplets } from 'lucide-react';

// ─── Animated spring counter ──────────────────────────────────────────────
const AnimatedNumber = ({ value }) => {
  const spring = useSpring(0, { stiffness: 85, damping: 20 });
  const [shown, setShown] = useState(0);
  useEffect(() => { spring.set(value); }, [value]);
  useEffect(() => spring.on('change', v => setShown(Math.round(v))), [spring]);
  return <>{shown}</>;
};

// ─── Particle burst ───────────────────────────────────────────────────────
const Particle = ({ ox, oy, color, size }) => {
  const angle = Math.random() * Math.PI * 2;
  const dist  = 28 + Math.random() * 55;
  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: 0, opacity: 0 }}
      transition={{ duration: 0.45 + Math.random() * 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'absolute', left: ox, top: oy, pointerEvents: 'none', zIndex: 20,
        width: size, height: size, borderRadius: size / 3,
        background: color,
        boxShadow: `0 0 ${size}px ${color}`,
      }}
    />
  );
};

// ─── Text Poll Option (Click to Vote) ─────────────────────────────────────────
const TextCard = ({
  option, index, onVote, isClosed, isVoted, percentage, votesCount, isMyVote
}) => {
  const [hovered, setHovered] = useState(false);
  const [voting, setVoting]   = useState(false);
  const [parts, setParts]     = useState([]);

  const canInteract = !isClosed && !voting && (!isVoted || !isMyVote);
  const showResults = isVoted || isClosed || voting;

  useEffect(() => {
    if (isVoted && !isMyVote && voting) setVoting(false);
  }, [isVoted, isMyVote]);

  const handleClick = async () => {
    if (!canInteract) return;
    setVoting(true);
    setParts(Array.from({ length: 8 }, (_, i) => ({
      id: i, ox: '90%', oy: '50%',
      color: ['var(--color-primary)', '#fff', '#FFD4CC'][i % 3],
      size: 5 + Math.random() * 8,
    })));
    setTimeout(() => setParts([]), 900);
    await new Promise(r => setTimeout(r, 400));
    onVote(index);
  };

  const GRAD = 'linear-gradient(90deg, #D42E10 0%, var(--color-primary) 45%, #FF5C38 100%)';
  const GLOW = 'rgba(255,52,26,0.5)';

  return (
    <motion.div
      onClick={handleClick}
      onHoverStart={() => canInteract && setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={canInteract ? { scale: 1.015, zIndex: 2 } : {}}
      whileTap={canInteract ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      style={{
        position: 'relative', width: '100%', height: 68, borderRadius: 999,
        background: isMyVote ? 'rgba(255,82,56,0.07)' : 'var(--color-bg)',
        border: `2px solid ${isMyVote ? 'rgba(255,82,56,0.45)' : hovered && canInteract ? 'rgba(255,82,56,0.25)' : 'rgba(0,0,0,0.08)'}`,
        overflow: 'hidden', userSelect: 'none', cursor: canInteract ? 'pointer' : 'default',
        boxShadow: isMyVote ? '0 0 0 3px rgba(255,82,56,0.15)' : hovered && canInteract ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* ── Results fill */}
      {showResults && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, mass: 1 }}
          style={{
            position: 'absolute', top: 0, left: 0, bottom: 0,
            background: GRAD, borderRadius: 999, zIndex: 0,
            boxShadow: isMyVote ? `3px 0 18px ${GLOW}` : 'none',
          }}
        />
      )}

      {/* ── Top highlight inner line */}
      <div style={{
        position: 'absolute', top: 3, left: 10, right: 10, height: 2,
        borderRadius: 1, background: 'rgba(255,255,255,0.18)', pointerEvents: 'none', zIndex: 3,
      }} />

      {/* ── Label + thumbnail */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        padding: showResults ? '0 118px 0 20px' : '0 20px',
        zIndex: 5, pointerEvents: 'none', gap: 10,
        transition: 'padding 0.28s ease',
      }}>
        {option.image && (
          <img
            src={option.image.includes('cloudinary.com')
              ? option.image.replace('/upload/', '/upload/f_auto,q_auto,w_80,h_80,c_fill/')
              : option.image}
            alt="" style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
          />
        )}
        <span style={{
          fontSize: 15, fontWeight: 800, letterSpacing: '-0.025em', flex: 1,
          color: showResults ? (percentage > 35 ? '#fff' : 'var(--color-text-primary)') : 'var(--color-text-primary)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          transition: 'color 0.2s',
        }}>
          {option.text}
        </span>
      </div>

      {/* ── Hover interaction overlay */}
      <AnimatePresence>
        {canInteract && hovered && !voting && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, zIndex: 4,
              background: 'linear-gradient(90deg, transparent, rgba(255,82,56,0.15))',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 20,
            }}
          >
            <Droplets size={20} color="var(--color-primary)" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Voting ripple */}
      <AnimatePresence>
        {voting && (
          <>
            <motion.div
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 8, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{
                position: 'absolute', right: 20, top: '50%',
                width: 40, height: 40, marginTop: -20, borderRadius: '50%',
                background: 'rgba(255,82,56,0.4)', zIndex: 4, pointerEvents: 'none',
              }}
            />
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.38, ease: 'backOut' }}
              style={{
                position: 'absolute', right: 18, top: '50%',
                width: 32, height: 32, marginTop: -16,
                borderRadius: '50%', background: '#fff', zIndex: 5,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              }}
            >
              <Check size={18} color="var(--color-primary)" strokeWidth={3.5} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Stats panel (shown when voted/closed) */}
      <AnimatePresence>
        {showResults && !voting && (
          <motion.div
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ delay: 0.1, duration: 0.28 }}
            style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              display: 'flex', alignItems: 'center', gap: 8, zIndex: 6, pointerEvents: 'none',
            }}
          >
            {isMyVote && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.95)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.22)',
                }}
              >
                <Check size={12} color="var(--color-primary)" strokeWidth={3.5} />
              </motion.div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.78)', lineHeight: 1.1 }}>
                {votesCount} votes
              </span>
              <span style={{ fontSize: 17, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                <AnimatedNumber value={percentage} />%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Particles */}
      {parts.map(p => <Particle key={p.id} ox={p.ox} oy={p.oy} color={p.color} size={p.size} />)}
    </motion.div>
  );
};

// ─── Image Poll Card ──────────────────────────────────────────────────────
const ImageCard = ({ option, index, onVote, isClosed, isVoted, percentage, votesCount, isMyVote }) => {
  const [hovered, setHovered] = useState(false);
  const [voting, setVoting]   = useState(false);
  const [parts, setParts]     = useState([]);

  const canInteract = !isClosed && !voting && (!isVoted || !isMyVote);
  const showResults = isVoted || isClosed;

  useEffect(() => {
    if (isVoted && !isMyVote && voting) setVoting(false);
  }, [isVoted, isMyVote]);

  const handleClick = async () => {
    if (!canInteract) return;
    setVoting(true);
    setParts(Array.from({ length: 10 }, (_, i) => ({
      id: i, ox: '50%', oy: '50%',
      color: ['var(--color-primary)', '#fff', '#FFD4CC'][i % 3],
      size: 5 + Math.random() * 8,
    })));
    setTimeout(() => setParts([]), 900);
    await new Promise(r => setTimeout(r, 400));
    onVote(index);
  };

  const R = 22, CIRC = 2 * Math.PI * R;
  const strokeDash = CIRC - (percentage / 100) * CIRC;

  return (
    <motion.div
      onClick={handleClick}
      onHoverStart={() => canInteract && setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={canInteract ? { scale: 1.03, zIndex: 2 } : {}}
      whileTap={canInteract ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      style={{
        position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: 20, overflow: 'hidden',
        border: isMyVote ? '3px solid var(--color-primary)' : '3px solid transparent',
        cursor: canInteract ? 'pointer' : 'default',
        boxShadow: isMyVote
          ? '0 0 0 4px rgba(255,82,56,0.22), 0 10px 28px rgba(255,82,56,0.18)'
          : hovered ? '0 10px 24px rgba(0,0,0,0.22)' : '0 2px 8px rgba(0,0,0,0.10)',
        transition: 'border-color 0.25s, box-shadow 0.25s',
      }}
    >
      {/* Photo */}
      {option.image ? (
        <img
          src={option.image.includes('cloudinary.com')
            ? option.image.replace('/upload/', '/upload/f_auto,q_auto,w_400,h_400,c_fill/')
            : option.image}
          alt={option.text}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            transform: hovered && canInteract ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}
          loading="lazy"
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #FF8A50 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{option.text}</span>
        </div>
      )}

      {/* Bottom scrim */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
        background: 'linear-gradient(to top,rgba(0,0,0,0.82) 0%,transparent 100%)',
        zIndex: 1, pointerEvents: 'none',
      }} />

      {/* ── Voted edge glow (subtle, keeps photo visible) */}
      {showResults && isMyVote && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          boxShadow: 'inset 0 0 0 3px rgba(255,52,26,0.55)',
          borderRadius: 'inherit',
        }} />
      )}



      {/* Hover overlay */}
      <AnimatePresence>
        {canInteract && hovered && !voting && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 3,
              background: 'radial-gradient(circle at center, rgba(255,82,56,0.32) 0%, transparent 70%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'rgba(255,255,255,0.94)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 24px rgba(0,0,0,0.28), 0 0 0 10px rgba(255,255,255,0.15)',
              }}
            >
              <Droplets size={26} color="var(--color-primary)" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vote ripples */}
      <AnimatePresence>
        {voting && (
          <>
            {[0, 1, 2].map(i => (
              <motion.div key={i}
                initial={{ scale: 0, opacity: 0.65 - i * 0.18 }}
                animate={{ scale: 3.5 + i, opacity: 0 }}
                transition={{ duration: 0.65 + i * 0.12, delay: i * 0.1, ease: 'easeOut' }}
                style={{
                  position: 'absolute', top: '50%', left: '50%',
                  width: 60, height: 60, marginTop: -30, marginLeft: -30,
                  borderRadius: '50%', background: 'rgba(255,82,56,0.45)', zIndex: 5, pointerEvents: 'none',
                }}
              />
            ))}
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: [0, 1.18, 1] }}
              transition={{ duration: 0.38, ease: 'backOut' }}
              style={{
                position: 'absolute', top: '50%', left: '50%',
                width: 62, height: 62, marginTop: -31, marginLeft: -31,
                borderRadius: '50%', background: '#fff', zIndex: 7,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <Check size={30} color="var(--color-primary)" strokeWidth={3} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* My-vote badge */}
      <AnimatePresence>
        {isMyVote && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 480, damping: 22 }}
            style={{
              position: 'absolute', top: 10, left: 10, zIndex: 8,
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(255,82,56,0.5)',
            }}
          >
            <Check size={15} color="#fff" strokeWidth={3.5} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Label */}
      {option.text && (
        <div style={{ position: 'absolute', bottom: 42, left: 0, right: 0, zIndex: 5, padding: '0 12px' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
            {option.text}
          </span>
        </div>
      )}

      {/* Frosted glass stats bar with left-to-right fill */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 6,
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        background: 'rgba(0,0,0,0.38)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden', // Contain the fill
      }}>
        {showResults && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 70, damping: 16, mass: 1.2 }}
            style={{
              position: 'absolute', top: 0, left: 0, bottom: 0,
              zIndex: 0,
              background: isMyVote ? 'var(--color-primary)' : 'rgba(204, 45, 14, 0.85)',
              borderRight: isMyVote ? '2px solid #fff' : '2px solid rgba(255,255,255,0.5)',
            }}
          />
        )}
        <div style={{
          position: 'relative', zIndex: 1, padding: '7px 10px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {showResults && (
            <svg width={30} height={30} viewBox="0 0 52 52" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
              <circle cx={26} cy={26} r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={5} />
              <motion.circle
                cx={26} cy={26} r={R} fill="none" stroke="var(--color-primary)" strokeWidth={5}
                strokeLinecap="round"
                initial={{ strokeDasharray: `${CIRC}`, strokeDashoffset: CIRC }}
                animate={{ strokeDasharray: `${CIRC}`, strokeDashoffset: strokeDash }}
                transition={{ type: 'spring', stiffness: 62, damping: 15, delay: 0.1 }}
              />
            </svg>
          )}
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>
            {votesCount} {votesCount === 1 ? 'vote' : 'votes'}
          </span>
        </div>
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
              style={{ fontSize: 17, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}
            >
              <AnimatedNumber value={percentage} />%
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      {parts.map(p => <Particle key={p.id} ox={p.ox} oy={p.oy} color={p.color} size={p.size} />)}
    </motion.div>
  );
};

// ─── Main Export ─────────────────────────────────────────────────────────────
const LiquidVoting = ({
  option, index, onVote, isClosed, isVoted,
  percentage, votesCount, isMyVote, type,
  activeDragIndex, setActiveDragIndex,
}) => {
  if (type === 'image') {
    return (
      <ImageCard
        option={option} index={index} onVote={onVote}
        isClosed={isClosed} isVoted={isVoted}
        percentage={percentage} votesCount={votesCount} isMyVote={isMyVote}
      />
    );
  }
  return (
    <TextCard
      option={option} index={index} onVote={onVote}
      isClosed={isClosed} isVoted={isVoted}
      percentage={percentage} votesCount={votesCount} isMyVote={isMyVote}
    />
  );
};

export default LiquidVoting;
