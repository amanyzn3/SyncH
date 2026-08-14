import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { ArrowRight, Layers, Lock, Mail, User, Key, Info } from 'lucide-react';

export default function LoginPage() {
  const { login, signup } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('sarah@synhub.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [role, setRole] = useState('employee');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await signup(name, email, password, role);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail) => {
    setEmail(userEmail);
    setPassword('password123');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-app)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '460px',
        padding: '2.5rem'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '0.75rem'
          }}>
            <Layers size={26} />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
            {isSignup ? 'Create Synhub Account' : 'Synhub Enterprise Portal'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Enterprise Task Management & Project System
          </p>
        </div>

        {/* Credentials Info Box */}
        <div style={{
          backgroundColor: 'var(--bg-surface-hover)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          marginBottom: '1.5rem',
          fontSize: '0.82rem'
        }}>
          <div style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Info size={15} /> System Login Credentials
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><strong>Manager:</strong> alex@synhub.com</span>
              <button onClick={() => fillCredentials('alex@synhub.com')} style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', textDecoration: 'underline' }}>Fill</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><strong>Employee:</strong> sarah@synhub.com</span>
              <button onClick={() => fillCredentials('sarah@synhub.com')} style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', textDecoration: 'underline' }}>Fill</button>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Password for all accounts: <code>password123</code>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--accent-red-bg)',
            color: 'var(--accent-red)',
            padding: '0.6rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          
          {isSignup && (
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '0.3rem' }}>Full Name</label>
              <input
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '0.3rem' }}>Email Address</label>
            <input
              type="email"
              placeholder="sarah@synhub.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '0.3rem' }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          {isSignup && (
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '0.3rem' }}>Select Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%' }}>
                <option value="employee">Employee (Assigned Tasks & Focus List)</option>
                <option value="manager">Manager (Executive Dashboard & Quality Control)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', height: '42px', marginTop: '0.5rem' }}
          >
            {isSignup ? 'Create Account' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setIsSignup(!isSignup)}
            style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: '600' }}
          >
            {isSignup ? 'Already have an account? Sign In' : "Need an account? Register new profile"}
          </button>
        </div>

      </div>
    </div>
  );
}
