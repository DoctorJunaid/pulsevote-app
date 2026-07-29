import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import PollCard from '../components/PollCard';
import { Loader2, ArrowLeft, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConnections, setShowConnections] = useState(false);
  const [connections, setConnections] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/user/${username}`);
      setProfileData(data);
    } catch (err) {
      toast.error('Failed to load profile');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const toggleFollow = async () => {
    try {
      const { data } = await api.post(`/user/${username}/follow`);
      setProfileData(prev => ({
        ...prev,
        isFollowing: data.following,
        stats: { ...prev.stats, followers: data.followers }
      }));
      toast.success(data.following ? `Following ${username}` : `Unfollowed ${username}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update follow status');
    }
  };

  const loadConnections = async () => {
    if (!connections) {
      try {
        const { data } = await api.get(`/user/${username}/connections`);
        setConnections(data);
      } catch (err) {
        toast.error('Failed to load connections');
      }
    }
    setShowConnections(true);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Loader2 className="spin" size={32} /></div>;
  }

  if (!profileData) return null;

  const { user, isFollowing, isMe, stats, polls } = profileData;

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', paddingBottom: '80px' }}>
      
      <div style={{
        display: 'flex', alignItems: 'center', gap: '20px',
        marginBottom: '48px',
      }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-icon"
          style={{ width: '48px', height: '48px' }}
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '32px', display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        {user.avatar ? (
          <img src={user.avatar} alt="avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%', background: 'var(--color-text-primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 800
          }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>{user.name || user.username}</h1>
              <p style={{ margin: '4px 0 16px 0', fontSize: '16px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>@{user.username}</p>
            </div>
            {!isMe && (
              <button 
                onClick={toggleFollow}
                className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                style={{ borderRadius: '999px', padding: '8px 24px' }}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
          
          <p style={{ margin: '0 0 24px 0', fontSize: '15px', lineHeight: 1.5 }}>
            {user.bio || 'No bio yet.'}
          </p>

          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '20px', fontWeight: 800 }}>{stats.created}</span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Polls</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '20px', fontWeight: 800 }}>{stats.voted}</span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Votes</span>
            </div>
            <div 
              onClick={loadConnections}
              style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = 0.7}
              onMouseLeave={e => e.currentTarget.style.opacity = 1}
            >
              <span style={{ fontSize: '20px', fontWeight: 800 }}>{stats.followers}</span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Followers</span>
            </div>
            <div 
              onClick={loadConnections}
              style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = 0.7}
              onMouseLeave={e => e.currentTarget.style.opacity = 1}
            >
              <span style={{ fontSize: '20px', fontWeight: 800 }}>{stats.following}</span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Following</span>
            </div>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Polls by @{user.username}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {polls.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>No polls created yet.</div>
        ) : (
          polls.map(poll => <PollCard key={poll._id} poll={poll} />)
        )}
      </div>

      {showConnections && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShowConnections(false)}>
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--color-surface)', padding: '32px', borderRadius: '24px',
              width: '100%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto'
            }}
          >
            <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 800 }}>Connections</h3>
            
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--color-text-secondary)' }}>Followers</h4>
            {connections?.followers?.length === 0 && <p style={{ fontSize: '14px', color: 'var(--color-text-tertiary)' }}>No followers yet.</p>}
            {connections?.followers?.map(f => (
              <div key={f._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-text-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  {f.username.charAt(0).toUpperCase()}
                </div>
                <div style={{ fontWeight: 700 }}>@{f.username}</div>
              </div>
            ))}

            <h4 style={{ margin: '32px 0 12px 0', fontSize: '14px', color: 'var(--color-text-secondary)' }}>Following</h4>
            {connections?.following?.length === 0 && <p style={{ fontSize: '14px', color: 'var(--color-text-tertiary)' }}>Not following anyone.</p>}
            {connections?.following?.map(f => (
              <div key={f._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-text-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  {f.username.charAt(0).toUpperCase()}
                </div>
                <div style={{ fontWeight: 700 }}>@{f.username}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
