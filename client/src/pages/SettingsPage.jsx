import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { fetchApi } from '../utils/api.js';
import { Settings, User, Moon, Sun, Bell, Bot, Key, Check, Sparkles } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('synhub_gemini_key') || '');
  const [savedKeyMsg, setSavedKeyMsg] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch current settings from backend if exists
    fetchApi('/settings')
      .then(res => {
        if (res.geminiApiKey) {
          setGeminiApiKey(res.geminiApiKey);
          localStorage.setItem('synhub_gemini_key', res.geminiApiKey);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanKey = geminiApiKey.trim();
      localStorage.setItem('synhub_gemini_key', cleanKey);
      
      await fetchApi('/settings', {
        method: 'POST',
        body: { geminiApiKey: cleanKey }
      });

      setSavedKeyMsg(true);
      setTimeout(() => setSavedKeyMsg(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.75rem 2rem', width: '100%' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.75rem' }}>
        <Settings size={28} style={{ color: 'var(--primary)' }} />
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
          Application Settings
        </h1>
      </div>

      {/* Fluid 2-Column Responsive Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Profile Card */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <User size={18} style={{ color: 'var(--primary)' }} /> Profile Configuration
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <img
              src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
              alt={user?.name}
              style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
            />
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>{user?.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user?.title} • {user?.email}</div>
              <span className="badge badge-status" style={{ marginTop: '0.35rem', textTransform: 'capitalize' }}>
                Role: {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Display Theme Settings */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            {theme === 'light' ? <Sun size={18} style={{ color: 'var(--accent-amber)' }} /> : <Moon size={18} style={{ color: 'var(--primary)' }} />} Display Theme
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.92rem', color: 'var(--text-primary)' }}>Current Theme: {theme === 'light' ? 'Light Mode' : 'Dark Mode'}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Toggle enterprise light or obsidian slate mode.</div>
            </div>
            <button onClick={toggleTheme} className="btn-secondary">
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />} Switch Theme
            </button>
          </div>
        </div>

        {/* Google Gemini API Configuration Card */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
          gridColumn: '1 / -1'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <Sparkles size={18} style={{ color: 'var(--primary)' }} /> Google Gemini 1.5 API Integration
          </h3>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
            Synhub is fully connected to <strong>Google Gemini 1.5 Flash API</strong> for natural language task reasoning, executive briefings, and AI habit coaching. Enter your Google Gemini API Key below to activate real-time Gemini AI responses across the platform.
          </p>

          <form onSubmit={handleSaveApiKey} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
              <Key size={15} /> Google Gemini API Key (Starts with AIzaSy...)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="password"
                placeholder="AIzaSy... (Enter your Google Gemini API Key)"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving Key...' : 'Connect Gemini API'}
              </button>
            </div>
            {savedKeyMsg && (
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Check size={15} /> Gemini API key saved & connected successfully! Your AI Assistant will now use Google Gemini 1.5.
              </span>
            )}
          </form>
        </div>

      </div>

    </div>
  );
}
