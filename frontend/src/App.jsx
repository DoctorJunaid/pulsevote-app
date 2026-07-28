import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './store/useAuth';

import Auth       from './pages/Auth';
import Feed       from './pages/Feed';
import CreatePoll  from './pages/CreatePoll';
import Dashboard   from './pages/Dashboard';
import MyPolls     from './pages/MyPolls';
import Bookmarks   from './pages/Bookmarks';
import Settings    from './pages/Settings';
import About       from './pages/About';
import Layout     from './components/Layout';

const pageTransition = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.16, ease: [0.45, 0, 0.55, 1] },
  },
};

const PageWrapper = ({ children }) => {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ height: '100%', willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <Layout>{children}</Layout>;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/auth" element={<Auth />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <PageWrapper><Dashboard /></PageWrapper>
          </ProtectedRoute>
        } />

        <Route path="/" element={
          <ProtectedRoute>
            <PageWrapper><Feed /></PageWrapper>
          </ProtectedRoute>
        } />

        <Route path="/my-polls" element={
          <ProtectedRoute>
            <PageWrapper><MyPolls /></PageWrapper>
          </ProtectedRoute>
        } />

        <Route path="/bookmarks" element={
          <ProtectedRoute>
            <PageWrapper><Bookmarks /></PageWrapper>
          </ProtectedRoute>
        } />

        <Route path="/create" element={
          <ProtectedRoute>
            <PageWrapper><CreatePoll /></PageWrapper>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <PageWrapper><Settings /></PageWrapper>
          </ProtectedRoute>
        } />

        <Route path="/about" element={
          <ProtectedRoute>
            <PageWrapper><About /></PageWrapper>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  const { fetchMe, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) fetchMe();
  }, [isAuthenticated, fetchMe]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            border: '2px solid var(--color-border)',
            borderRadius: '999px',
            fontSize: '14.5px',
            fontWeight: 700,
            fontFamily: 'inherit',
            boxShadow: 'var(--shadow-md)',
            padding: '12px 24px',
            maxWidth: '420px',
            letterSpacing: '-0.01em',
          },
          success: {
            iconTheme: { primary: 'var(--color-primary)', secondary: '#FFFFFF' },
          },
          error: {
            iconTheme: { primary: 'var(--color-danger)', secondary: '#FFFFFF' },
          },
        }}
      />
      <AnimatedRoutes />
    </BrowserRouter>
  );
};

export default App;
