import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../store/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff, Upload, Camera, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

const variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.2 } },
};

const Auth = () => {
  const [mode, setMode] = useState('login'); // login | register | verify | forgot | reset
  const [verifyEmail, setVerifyEmail] = useState('');

  const handleNeedVerify = (email) => { setVerifyEmail(email); setMode('verify'); };
  const handleForgotSuccess = (email) => { setVerifyEmail(email); setMode('reset'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      
      {/* ── Left Side (Image) ── */}
      <div className="desktop-only" style={{
        flex: 1,
        padding: '24px',
        paddingRight: 0,
      }}>
        <div style={{
          width: '100%', height: '100%',
          borderRadius: '32px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'var(--shadow-float)',
        }}>
          <img 
            src="/auth-bg.png" 
            alt="PulseVote Premium Experience" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '48px', left: '48px', right: '48px',
            color: '#FFFFFF',
          }}>
            <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', color: '#FFF', letterSpacing: '-0.04em' }}>
              Next-generation polling.
            </h2>
            <p style={{ fontSize: '18px', fontWeight: 500, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
              Join thousands of communities making data-driven decisions in real-time with PulseVote.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Side (Form) ── */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        padding: '32px',
      }}>
        {/* ── Brand Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'var(--color-text-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFFFFF',
          }}>
            <Zap size={20} strokeWidth={2.5} />
          </div>
          <div style={{
            fontSize: '24px', fontWeight: 800,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.06em',
            lineHeight: 1,
          }}>
            PulseVote.
          </div>
        </div>

        <div style={{
          flex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '100%',
        }}>
          <div style={{
            width: '100%', maxWidth: '460px',
          }}>

          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '28px',
            fontSize: '15px',
            fontWeight: 700,
            letterSpacing: '-0.01em',
          }}>
            <Link
              to="/"
              style={{
                color: 'var(--color-text-tertiary)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
              Home
            </Link>
            <span style={{ color: 'var(--color-text-tertiary)', opacity: 0.4 }}>/</span>
            <span style={{ color: 'var(--color-text-primary)' }}>
              {mode === 'login' ? 'Sign In' 
                : mode === 'register' ? 'Sign Up'
                : mode === 'verify' ? 'Verify Email'
                : mode === 'forgot' ? 'Forgot Password'
                : 'Reset Password'}
            </span>
          </nav>

          {/* Typography Greeting */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800,
              color: 'var(--color-text-primary)', margin: '0 0 12px',
              letterSpacing: '-0.06em',
              lineHeight: 1.1,
            }}>
              {mode === 'login' ? 'Welcome back.' 
                : mode === 'register' ? 'Join the community.'
                : mode === 'verify' ? 'Verify your email.'
                : mode === 'forgot' ? 'Reset password.'
                : 'Set new password.'}
            </h1>
            <p style={{
              fontSize: '16px', fontWeight: 500,
              color: 'var(--color-text-secondary)',
              letterSpacing: '-0.01em',
            }}>
              {mode === 'verify' ? 'Enter the code sent to your inbox.'
                : mode === 'forgot' ? 'We\'ll send a recovery code to your email.'
                : 'Experience the next generation of polling.'}
            </p>
          </div>

          {/* Auth Card */}
          <div className="card">

            {/* Mode Switcher Tabs */}
            {(mode === 'login' || mode === 'register') && (
              <div style={{
                display: 'flex',
                background: 'var(--color-bg)',
                borderRadius: '999px',
                padding: '4px',
                marginBottom: '32px',
                gap: '4px',
              }}>
                {['login', 'register'].map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '999px',
                      fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                      border: 'none',
                      transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
                      background: mode === m ? 'var(--color-surface)' : 'transparent',
                      color: mode === m ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                      boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
                      fontFamily: 'inherit',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {m === 'login' ? 'Sign In' : 'Sign Up'}
                  </button>
                ))}
              </div>
            )}

            {/* Back button for secondary views */}
            {mode !== 'login' && mode !== 'register' && (
              <button
                onClick={() => setMode('login')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 700,
                  padding: '0 0 24px', fontFamily: 'inherit',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
              >
                ← Back to Sign In
              </button>
            )}

            <AnimatePresence mode="wait">
              {mode === 'login'    && <LoginForm    key="login"    onNeedVerify={handleNeedVerify} onForgot={() => setMode('forgot')} />}
              {mode === 'register' && <RegisterForm key="register" onNeedVerify={handleNeedVerify} />}
              {mode === 'verify'   && <OtpForm      key="verify"   initialEmail={verifyEmail} />}
              {mode === 'forgot'   && <ForgotForm   key="forgot"   onSuccess={handleForgotSuccess} />}
              {mode === 'reset'    && <ResetForm    key="reset"    initialEmail={verifyEmail} onDone={() => setMode('login')} />}
            </AnimatePresence>

          </div>
        </div>
      </div>
      </div>

    </div>
  );
};

/* ── Reusable Field ────────────────────────────────────── */
const Field = ({ label, type = 'text', value, onChange, placeholder, required, maxLength }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="form-group">
      <label className="label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value} onChange={onChange}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          style={{ paddingRight: isPassword ? '44px' : undefined }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            style={{
              position: 'absolute', right: '16px', top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-tertiary)', display: 'flex',
              padding: 0,
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
          >
            {show ? <EyeOff size={20} strokeWidth={2.5} /> : <Eye size={20} strokeWidth={2.5} />}
          </button>
        )}
      </div>
    </div>
  );
};

/* ── Login Form ────────────────────────────────────────── */
const LoginForm = ({ onNeedVerify, onForgot }) => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error(res.error);
      if (res.needsVerification) onNeedVerify(res.email || email);
    }
  };

  return (
    <motion.form variants={variants} initial="initial" animate="animate" exit="exit"
      onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Field label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
      <div>
        <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        <div style={{ textAlign: 'right', marginTop: '12px' }}>
          <button type="button" onClick={onForgot} style={{
            background: 'none', border: 'none',
            color: 'var(--color-text-tertiary)', fontSize: '13px', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
          >
            Forgot password?
          </button>
        </div>
      </div>
      <button disabled={isLoading} type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </motion.form>
  );
};

/* ── Register Form ──────────────────── */
const RegisterForm = ({ onNeedVerify }) => {
  const { register, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let payload;
    if (avatarFile) {
      payload = new FormData();
      payload.append('name', name);
      payload.append('username', username);
      payload.append('email', email);
      payload.append('password', password);
      payload.append('image', avatarFile);
    } else {
      payload = { name, username, email, password };
    }

    const res = await register(payload);
    if (res.success) {
      toast.success('Account created! Check your email for OTP.');
      if (res.needsVerification) onNeedVerify(res.email || email);
    } else {
      toast.error(res.error);
    }
  };

  const getStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (pass.match(/[A-Z]/)) score += 25;
    if (pass.match(/[0-9]/)) score += 25;
    if (pass.match(/[^A-Za-z0-9]/)) score += 25;
    return Math.min(100, score);
  };
  const strength = getStrength(password);

  const getStrengthColor = (score) => {
    if (score <= 25) return 'var(--color-danger)';
    if (score <= 50) return '#F59E0B'; // orange
    if (score <= 75) return '#3B82F6'; // blue
    return '#10B981'; // green
  };

  return (
    <motion.form variants={variants} initial="initial" animate="animate" exit="exit"
      onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Profile Picture Upload */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '16px',
        background: 'var(--color-bg)',
        borderRadius: '20px',
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: previewUrl ? `url(${previewUrl}) center/cover` : 'var(--color-surface)',
          border: previewUrl ? 'none' : '1px dashed var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, color: 'var(--color-text-tertiary)', overflow: 'hidden',
        }}>
          {!previewUrl && <Camera size={24} strokeWidth={2} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Profile Picture
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-tertiary)' }}>
            Optional
          </div>
        </div>
        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
          <Upload size={16} strokeWidth={2.5} /> Upload
          <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Field label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Johnson" required />
        <Field label="Username"  value={username} onChange={e => setUsername(e.target.value)} placeholder="alexj" required />
      </div>
      <Field label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
      
      <div>
        <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" required />
        {password.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
              {[1, 2, 3, 4].map(level => (
                <div key={level} style={{
                  flex: 1,
                  borderRadius: '2px',
                  background: strength >= level * 25 ? getStrengthColor(strength) : 'var(--color-border)',
                  transition: 'background 0.3s ease'
                }} />
              ))}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: getStrengthColor(strength), marginTop: '4px', textAlign: 'right' }}>
              {strength <= 25 ? 'Weak' : strength <= 50 ? 'Fair' : strength <= 75 ? 'Good' : 'Strong'}
            </div>
          </div>
        )}
      </div>
      <button disabled={isLoading} type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
        {isLoading ? 'Creating account...' : 'Create Account'}
      </button>
    </motion.form>
  );
};

/* ── OTP Verification Form ─────────────────────────────── */
const OtpForm = ({ initialEmail }) => {
  const { verifyOtp, resendOtp, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(initialEmail || '');
  const [otp, setOtp] = useState('');
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return toast.error('Please enter the OTP code');
    const res = await verifyOtp(email, otp.trim());
    if (res.success) { toast.success('Email verified!'); navigate('/'); }
    else toast.error(res.error);
  };

  const handleResend = async () => {
    if (!email) return toast.error('Enter your email address');
    setResending(true);
    const res = await resendOtp(email);
    setResending(false);
    if (res.success) toast.success(res.message || 'OTP resent!');
    else toast.error(res.error);
  };

  return (
    <motion.form variants={variants} initial="initial" animate="animate" exit="exit"
      onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Field label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="label" style={{ margin: 0 }}>Verification Code</label>
          <button type="button" onClick={handleResend} disabled={resending || isLoading}
            style={{
              fontSize: '13px', fontWeight: 800,
              color: 'var(--color-primary)', background: 'none',
              border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: 'inherit',
            }}>
            {resending ? 'Sending...' : 'Resend Code'}
          </button>
        </div>
        <input
          type="text" required maxLength={6}
          value={otp} onChange={e => setOtp(e.target.value)}
          placeholder="000000"
          style={{
            textAlign: 'center',
            fontFamily: '"Plus Jakarta Sans", monospace',
            fontSize: '32px',
            letterSpacing: '0.3em',
            fontWeight: 800,
            padding: '16px',
          }}
        />
      </div>
      <button disabled={isLoading} type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
        {isLoading ? 'Verifying...' : 'Verify & Sign In'}
      </button>
    </motion.form>
  );
};

/* ── Forgot Password Form ──────────────────────────────── */
const ForgotForm = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Recovery code sent to your email');
      onSuccess(email);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send recovery email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form variants={variants} initial="initial" animate="animate" exit="exit"
      onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Field label="Account Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
      <button disabled={loading} type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
        {loading ? 'Sending...' : 'Send Recovery Code'}
      </button>
    </motion.form>
  );
};

/* ── Reset Password Form ───────────────────────────────── */
const ResetForm = ({ initialEmail, onDone }) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      toast.success('Password reset successfully! Please sign in.');
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form variants={variants} initial="initial" animate="animate" exit="exit"
      onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Field label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
      <Field label="OTP Code" value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit code" required maxLength={6} />
      <Field label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 8 characters" required />
      <button disabled={loading} type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </motion.form>
  );
};

export default Auth;
