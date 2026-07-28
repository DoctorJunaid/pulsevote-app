import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/useAuth';
import toast from 'react-hot-toast';
import { User, Lock, AlertTriangle, Upload, Edit2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Settings = () => {
  const { user, updateProfile, changePassword, deleteAccount } = useAuth();

  /* Profile State */
  const [name, setName]         = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio]           = useState(user?.bio || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar || '');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Sync state when user object loads
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setBio(user.bio || '');
      if (!avatarFile) setPreviewUrl(user.avatar || '');
    }
  }, [user, avatarFile]);

  /* Password State */
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  const getStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (pass.match(/[A-Z]/)) score += 25;
    if (pass.match(/[0-9]/)) score += 25;
    if (pass.match(/[^A-Za-z0-9]/)) score += 25;
    return Math.min(100, score);
  };
  const strength = getStrength(newPassword);

  const getStrengthColor = (score) => {
    if (score <= 25) return 'var(--color-danger)';
    if (score <= 50) return '#F59E0B'; // orange
    if (score <= 75) return '#3B82F6'; // blue
    return '#10B981'; // green
  };

  /* Delete State */
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    let payload;
    if (avatarFile) {
      payload = new FormData();
      payload.append('name', name);
      payload.append('username', username);
      payload.append('bio', bio);
      payload.append('image', avatarFile);
    } else {
      payload = { name, username, bio };
    }

    const res = await updateProfile(payload);
    setLoadingProfile(false);
    if (res.success) {
      toast.success('Profile updated successfully!');
      setIsEditingProfile(false);
    } else {
      toast.error(res.error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) return toast.error('New password must be at least 8 characters');
    if (newPassword !== confirmNewPassword) return toast.error('New passwords do not match');
    setLoadingPassword(true);
    const res = await changePassword(currentPassword, newPassword);
    setLoadingPassword(false);
    if (res.success) {
      toast.success(res.message || 'Password changed!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setIsEditingPassword(false);
    } else {
      toast.error(res.error);
    }
  };

  const handleDeleteAccount = async () => {
    const res = await deleteAccount();
    if (res.success) toast.success('Account deleted successfully');
    else toast.error(res.error);
  };

  const displayInitial = user?.username?.charAt(0).toUpperCase() || 'U';

  return (
    <div style={{
      maxWidth: '760px', margin: '0 auto',
      display: 'flex', flexDirection: 'column', gap: '32px',
      paddingBottom: '80px',
    }}>

      {/* ── Massive Editorial Header ────────────────────── */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{
          fontSize: '48px', fontWeight: 800,
          color: 'var(--color-text-primary)',
          margin: 0, letterSpacing: '-0.06em',
          lineHeight: 1.1,
        }}>
          Settings.
        </h1>
        <p style={{
          margin: '12px 0 0', fontSize: '18px', fontWeight: 500,
          color: 'var(--color-text-secondary)',
          letterSpacing: '-0.01em',
        }}>
          Manage your profile, security, and account
        </p>
      </div>

      {/* ── Profile Card ──────────────────────────────── */}
      <div className="card" style={{ padding: '40px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          marginBottom: '32px',
          paddingBottom: '20px',
          borderBottom: '2px solid var(--color-border)',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'var(--color-text-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFFFFF',
          }}>
            <User size={20} strokeWidth={2.5} />
          </div>
          <h2 style={{
            fontSize: '24px', fontWeight: 800,
            color: 'var(--color-text-primary)',
            margin: 0, letterSpacing: '-0.04em',
          }}>
            Public Profile
          </h2>
          {!isEditingProfile && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
              <Link
                to={`/user/${user?.username}`}
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: '999px', padding: '8px 16px', textDecoration: 'none' }}
              >
                <ExternalLink size={16} strokeWidth={2.5} /> View
              </Link>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: '999px', padding: '8px 16px' }}
              >
                <Edit2 size={16} strokeWidth={2.5} /> Edit
              </button>
            </div>
          )}
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Avatar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '24px',
            }}>
              <div style={{
                width: '96px', height: '96px', borderRadius: '24px',
                background: previewUrl ? `url(${previewUrl}) center/cover` : 'var(--color-text-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#FFFFFF', fontSize: '32px', fontWeight: 800,
                flexShrink: 0, overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
              }}>
                {!previewUrl && displayInitial}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '16px', fontWeight: 800,
                  color: 'var(--color-text-primary)',
                }}>
                  Profile Picture
                </div>
                <div style={{
                  fontSize: '14px', fontWeight: 500,
                  color: 'var(--color-text-tertiary)',
                  marginTop: '4px', marginBottom: '12px',
                }}>
                  JPG, PNG or GIF · max 5MB
                </div>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0, borderRadius: '999px' }}>
                  <Upload size={16} strokeWidth={2.5} /> Change Photo
                  <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="label" style={{ fontSize: '15px' }}>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ fontWeight: 700 }} />
              </div>
              <div className="form-group">
                <label className="label" style={{ fontSize: '15px' }}>Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} required style={{ fontWeight: 700 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="label" style={{ fontSize: '15px' }}>Bio</label>
              <textarea
                rows={4}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell the community about yourself..."
                style={{ resize: 'none', fontWeight: 500 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button type="button" onClick={() => {
                setIsEditingProfile(false);
                if (user) {
                  setName(user.name || '');
                  setUsername(user.username || '');
                  setBio(user.bio || '');
                  setAvatarFile(null);
                  setPreviewUrl(user.avatar || '');
                }
              }} className="btn btn-secondary btn-lg">
                Cancel
              </button>
              <button disabled={loadingProfile} type="submit" className="btn btn-primary btn-lg">
                {loadingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{
                width: '96px', height: '96px', borderRadius: '24px',
                background: previewUrl ? `url(${previewUrl}) center/cover` : 'var(--color-text-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#FFFFFF', fontSize: '32px', fontWeight: 800,
                flexShrink: 0, overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
              }}>
                {!previewUrl && displayInitial}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                  {name || 'No Name Set'}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
                  @{username || 'unknown'}
                </div>
              </div>
            </div>
            
            <div>
              <label className="label" style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bio</label>
              <div style={{
                fontSize: '16px', fontWeight: 500, color: 'var(--color-text-secondary)',
                lineHeight: 1.6, marginTop: '8px',
                padding: '20px', background: 'var(--color-bg)', borderRadius: '16px',
                border: '1px solid var(--color-border)'
              }}>
                {bio || 'No bio provided.'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Password Card ─────────────────────────────── */}
      <div className="card" style={{ padding: '40px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          marginBottom: '32px',
          paddingBottom: '20px',
          borderBottom: '2px solid var(--color-border)',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'var(--color-text-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFFFFF',
          }}>
            <Lock size={20} strokeWidth={2.5} />
          </div>
          <h2 style={{
            fontSize: '24px', fontWeight: 800,
            color: 'var(--color-text-primary)',
            margin: 0, letterSpacing: '-0.04em',
          }}>
            Security
          </h2>
          {!isEditingPassword && (
            <button
              onClick={() => setIsEditingPassword(true)}
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: 'auto', borderRadius: '999px', padding: '8px 16px' }}
            >
              <Edit2 size={16} strokeWidth={2.5} /> Edit
            </button>
          )}
        </div>

        {isEditingPassword ? (
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="label" style={{ fontSize: '15px' }}>Current Password</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" required style={{ fontWeight: 700 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="label" style={{ fontSize: '15px' }}>New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 8 characters" required style={{ fontWeight: 700 }} />
                  {newPassword.length > 0 && (
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
                <div className="form-group">
                  <label className="label" style={{ fontSize: '15px' }}>Confirm New Password</label>
                  <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder="Repeat new password" required style={{ fontWeight: 700 }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button type="button" onClick={() => {
                setIsEditingPassword(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
              }} className="btn btn-secondary btn-lg">
                Cancel
              </button>
              <button disabled={loadingPassword} type="submit" className="btn btn-dark btn-lg">
                {loadingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label className="label" style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Password</label>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '0.2em', marginTop: '8px' }}>
                  ••••••••
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Danger Zone ───────────────────────────────── */}
      <div className="card" style={{
        border: '2px solid var(--color-danger)',
        padding: '40px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          marginBottom: '16px',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'var(--color-danger)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFFFFF',
          }}>
            <AlertTriangle size={20} strokeWidth={2.5} />
          </div>
          <h2 style={{
            fontSize: '24px', fontWeight: 800,
            color: 'var(--color-danger)',
            margin: 0, letterSpacing: '-0.04em',
          }}>
            Danger Zone
          </h2>
        </div>
        <p style={{
          fontSize: '15px', fontWeight: 600,
          color: 'var(--color-text-secondary)',
          margin: '0 0 24px',
          lineHeight: 1.5,
        }}>
          Permanently delete your account and all associated data including polls, votes, and comments. This action is irreversible.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn btn-lg"
            style={{
              background: 'transparent',
              color: 'var(--color-danger)',
              fontWeight: 800,
              border: '2px solid var(--color-danger)',
            }}
          >
            Delete Account
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={handleDeleteAccount}
              className="btn btn-lg"
              style={{
                background: 'var(--color-danger)',
                color: '#FFFFFF',
                fontWeight: 800,
              }}
            >
              Yes, Delete Permanently
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="btn btn-secondary btn-lg"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default Settings;
