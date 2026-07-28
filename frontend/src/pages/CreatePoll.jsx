import React, { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Trash2, ChevronDown, ArrowLeft } from 'lucide-react';

const CATEGORIES = ['General', 'Technology', 'Science', 'Sports', 'Politics', 'Entertainment', 'Education', 'Health', 'Finance', 'Other'];
const TYPES = [
  { value: 'single', label: 'Single Choice' },
  { value: 'yesno',  label: 'Yes / No'      },
  { value: 'rating', label: 'Rating Scale'  },
  { value: 'image',  label: 'Image Match / vs.' },
];

const CreatePoll = () => {
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ question: '', type: 'single', category: 'General' });
  const [options,  setOptions]  = useState([{ text: '' }, { text: '' }]);

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const handleAddOption    = () => options.length < 5 && setOptions([...options, { text: '', file: null }]);
  const handleRemoveOption = (i) => options.length > 2 && setOptions(options.filter((_, idx) => idx !== i));
  const handleOptionChange = (i, val) => {
    const next = [...options]; next[i].text = val; setOptions(next);
  };
  const handleFileChange = (i, file) => {
    const next = [...options]; next[i].file = file; setOptions(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim()) return toast.error('Please enter a question');
    
    let submitData;
    let config = {};

    if (formData.type === 'image') {
      if (options.slice(0, 2).some(o => !o.file)) return toast.error('Please upload at least 2 images');
      submitData = new FormData();
      submitData.append('question', formData.question);
      submitData.append('type', formData.type);
      submitData.append('category', formData.category);
      options.forEach(o => {
        if (o.file) submitData.append('images', o.file);
      });
      config = { headers: { 'Content-Type': 'multipart/form-data' } };
    } else {
      if (formData.type !== 'yesno' && options.some(o => !o.text.trim())) {
        return toast.error('Please fill in all options');
      }
      submitData = { ...formData, options };
    }

    setLoading(true);
    try {
      await api.post('/poll', submitData, config);
      toast.success('Poll created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', paddingBottom: '80px' }}>

      {/* ── Massive Editorial Header ────────────────────── */}
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
        <div>
          <h1 style={{
            fontSize: '48px', fontWeight: 800,
            color: 'var(--color-text-primary)',
            margin: 0, letterSpacing: '-0.06em',
            lineHeight: 1.1,
          }}>
            Create Poll.
          </h1>
          <p style={{
            margin: '12px 0 0', fontSize: '18px', fontWeight: 500,
            color: 'var(--color-text-secondary)',
            letterSpacing: '-0.01em',
          }}>
            Ask the community anything
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Question */}
        <div className="card" style={{ padding: '32px' }}>
          <div className="form-group">
            <label className="label" style={{ fontSize: '16px', marginBottom: '8px' }}>What's your question?</label>
            <textarea
              required
              rows={3}
              value={formData.question}
              onChange={e => set('question', e.target.value)}
              placeholder="Type your question here..."
              style={{
                resize: 'none', lineHeight: 1.5,
                fontSize: '20px', fontWeight: 700,
                padding: '24px',
              }}
            />
          </div>
        </div>

        {/* Type & Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="card" style={{ padding: '32px' }}>
            <div className="form-group">
              <label className="label" style={{ fontSize: '16px', marginBottom: '8px' }}>Poll Type</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={formData.type}
                  onChange={e => set('type', e.target.value)}
                  style={{ fontWeight: 700 }}
                >
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <ChevronDown size={20} strokeWidth={2.5} style={{
                  position: 'absolute', right: '16px', top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-primary)', pointerEvents: 'none',
                }} />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '32px' }}>
            <div className="form-group">
              <label className="label" style={{ fontSize: '16px', marginBottom: '8px' }}>Category</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={formData.category}
                  onChange={e => set('category', e.target.value)}
                  style={{ fontWeight: 700 }}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={20} strokeWidth={2.5} style={{
                  position: 'absolute', right: '16px', top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-primary)', pointerEvents: 'none',
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="card" style={{ padding: '32px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '24px',
          }}>
            <label className="label" style={{ fontSize: '16px', margin: 0 }}>Answer Options</label>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-tertiary)' }}>
              {options.length} / 5
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {options.map((opt, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                animation: `fadeInUp 300ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 50}ms both`,
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: 'var(--color-text-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '15px', fontWeight: 800,
                  color: '#FFFFFF',
                  flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                {formData.type === 'image' ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleFileChange(i, e.target.files[0])}
                    style={{ flex: 1, fontWeight: 700 }}
                  />
                ) : (
                  <input
                    type="text" required
                    value={opt.text}
                    onChange={e => handleOptionChange(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    style={{ flex: 1, fontWeight: 700 }}
                  />
                )}
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(i)}
                    className="btn btn-ghost btn-icon"
                    style={{
                      color: 'var(--color-text-tertiary)',
                      width: '48px', height: '48px', flexShrink: 0,
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-danger)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
                  >
                    <Trash2 size={20} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {options.length < 5 && (
            <button
              type="button"
              onClick={handleAddOption}
              style={{
                marginTop: '24px', width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                padding: '16px',
                border: '2px dashed var(--color-border)',
                borderRadius: '999px',
                background: 'transparent',
                color: 'var(--color-text-primary)',
                fontSize: '15px', fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-text-primary)';
                e.currentTarget.style.background = 'rgba(0,0,0,0.02)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Plus size={20} strokeWidth={2.5} />
              Add Another Option
            </button>
          )}
        </div>

        {/* Submit */}
        <div style={{
          display: 'flex', gap: '16px', marginTop: '16px',
        }}>
          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={() => navigate(-1)}
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ flex: 2 }}
          >
            {loading ? 'Creating...' : 'Publish Poll'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreatePoll;
