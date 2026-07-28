import React from 'react';
import { motion } from 'framer-motion';

// Base Skeleton Block
export const SkeletonBlock = ({ width, height, borderRadius = '8px', style = {} }) => (
  <div
    className="skeleton-shimmer"
    style={{
      width,
      height,
      borderRadius,
      backgroundColor: 'var(--color-bg)', // Base color before shimmer
      ...style
    }}
  />
);

// Poll Card Skeleton
export const PollCardSkeleton = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="card" 
      style={{
        padding: 0,
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ padding: '32px 32px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <SkeletonBlock width="32px" height="32px" borderRadius="50%" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <SkeletonBlock width="80px" height="14px" />
            <SkeletonBlock width="60px" height="10px" />
          </div>
        </div>
        
        {/* Question Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          <SkeletonBlock width="85%" height="28px" borderRadius="12px" />
          <SkeletonBlock width="60%" height="28px" borderRadius="12px" />
        </div>
        
        {/* Tags */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          <SkeletonBlock width="60px" height="14px" />
        </div>
      </div>

      {/* Options */}
      <div style={{ padding: '0 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[1, 2].map(i => (
          <div key={i} style={{
            width: '100%', padding: '16px 24px',
            borderRadius: '999px',
            background: 'var(--color-bg)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
             <SkeletonBlock width="120px" height="18px" />
             <div style={{ display: 'flex', gap: '12px' }}>
                <SkeletonBlock width="60px" height="16px" />
                <SkeletonBlock width="30px" height="16px" />
             </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '24px 32px', marginTop: '32px',
        borderTop: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <SkeletonBlock width="80px" height="16px" />
          <SkeletonBlock width="80px" height="16px" />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <SkeletonBlock width="24px" height="24px" borderRadius="50%" />
          <SkeletonBlock width="24px" height="24px" borderRadius="50%" />
        </div>
      </div>
    </motion.div>
  );
};

// Dashboard Skeleton
export const DashboardSkeleton = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <SkeletonBlock width="300px" height="52px" borderRadius="16px" style={{ marginBottom: '8px' }} />
          <SkeletonBlock width="200px" height="52px" borderRadius="16px" />
          <SkeletonBlock width="340px" height="20px" style={{ marginTop: '20px' }} />
        </div>
        <SkeletonBlock width="160px" height="56px" borderRadius="999px" />
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
            <SkeletonBlock width="48px" height="48px" borderRadius="14px" />
            <div>
              <SkeletonBlock width="100px" height="14px" style={{ marginBottom: '8px' }} />
              <SkeletonBlock width="60px" height="40px" borderRadius="12px" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        <div className="card" style={{ minHeight: '360px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
             <div>
                <SkeletonBlock width="140px" height="24px" style={{ marginBottom: '8px' }} />
                <SkeletonBlock width="200px" height="14px" />
             </div>
             <SkeletonBlock width="120px" height="14px" />
          </div>
          <SkeletonBlock width="100%" height="240px" borderRadius="16px" />
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <SkeletonBlock width="120px" height="24px" style={{ marginBottom: '8px' }} />
          <SkeletonBlock width="180px" height="14px" style={{ marginBottom: '32px' }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', height: '100%' }}>
            <SkeletonBlock width="160px" height="160px" borderRadius="50%" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                  <SkeletonBlock width="70px" height="14px" style={{ marginBottom: '6px' }} />
                  <SkeletonBlock width="40px" height="20px" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
