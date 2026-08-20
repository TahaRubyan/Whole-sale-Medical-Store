import React, { useState } from 'react';
import { Pill, ShieldCheck, Lock, User, CheckCircle, AlertCircle } from 'lucide-react';

export const SuperAdminLoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Authenticate Super-Admin credentials: username "rubyan", password "1234"
    if (cleanUser === 'rubyan' && cleanPass === '1234') {
      const superAdminUser = {
        name: 'Master SaaS Owner (rubyan)',
        username: 'rubyan',
        role: 'SUPERADMIN',
        token: 'mock_superadmin_jwt_token_2026',
      };
      localStorage.setItem('pharmalink_superadmin_logged_in', 'true');
      localStorage.setItem('pharmalink_superadmin_user', JSON.stringify(superAdminUser));

      setTimeout(() => {
        setIsSubmitting(false);
        if (onLoginSuccess) {
          onLoginSuccess(superAdminUser);
        }
      }, 500);
    } else {
      setTimeout(() => {
        setIsSubmitting(false);
        setErrorMsg('Invalid Super-Admin username or password. Please check credentials.');
      }, 500);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '0',
        overflow: 'hidden',
        boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.15)',
        border: '1.5px solid #E2E8F0'
      }}>
        {/* Ocean Cyan Blue Glassmorphism Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
          color: '#FFFFFF',
          padding: '2rem 1.75rem',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#FFFFFF',
            color: '#0284C7',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <ShieldCheck size={28} />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
            Super-Admin Master Portal
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#E0F2FE', marginTop: '0.35rem', margin: 0, fontWeight: 500 }}>
            PharmaLink Multi-Tenant SaaS Master Management System
          </p>
        </div>

        {/* Login Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {errorMsg && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '0.75rem',
              borderRadius: '6px',
              fontSize: '0.825rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={18} /> {errorMsg}
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
              Super-Admin Username *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (e.g. rubyan)"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem 0.6rem 2.4rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: '1.5px solid #CBD5E1',
                  outline: 'none'
                }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
              Super-Admin Password *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (e.g. 1234)"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem 0.6rem 2.4rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: '1.5px solid #CBD5E1',
                  outline: 'none'
                }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.75rem',
              fontWeight: 900,
              fontSize: '0.9rem',
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {isSubmitting ? 'Authenticating Master Credentials...' : 'Sign In to Super-Admin Portal'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.725rem', color: '#64748B', fontWeight: 600 }}>
            🔒 Master SaaS Authentication System — Access Restricted to SaaS Owner
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminLoginPage;
