import React, { useState } from 'react';
import { ShieldCheck, User, Lock, LogIn, Store, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = ({ onOpenSuperAdmin }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const success = login(username.trim(), password);
    if (!success) {
      setErrorMsg('Invalid Username or Password. Please try admin / admin123 or cashier / cashier123');
    }
  };

  const handleQuickFill = (userType) => {
    if (userType === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('cashier');
      setPassword('cashier123');
    }
    setErrorMsg('');
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', backgroundColor: '#0284C7', backgroundImage: 'radial-gradient(at 0% 0%, #0369A1 0px, transparent 50%), radial-gradient(at 100% 100%, #0F172A 0px, transparent 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'sans-serif' }}>
      
      <div style={{ width: '420px', maxWidth: '95vw', backgroundColor: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(16px)', borderRadius: '16px', padding: '2.25rem 2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
        
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '14px', backgroundColor: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.85rem auto', color: '#FFFFFF', boxShadow: '0 10px 15px -3px rgba(2, 132, 199, 0.4)' }}>
            <Store size={34} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Idrees Medical Store
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#64748B', marginTop: '0.25rem', fontWeight: 600 }}>
            Wholesale Pharmacy ERP & Commercial POS System
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
              Username:
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#64748B" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Enter username (e.g. admin or cashier)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.4rem', fontSize: '0.9rem', fontWeight: 700, borderRadius: '8px', border: '1.5px solid #CBD5E1', outline: 'none' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
              Password:
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#64748B" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.4rem', fontSize: '0.9rem', fontWeight: 700, borderRadius: '8px', border: '1.5px solid #CBD5E1', outline: 'none' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', fontWeight: 900, backgroundColor: '#0284C7', color: '#FFFFFF', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.3)' }}
          >
            <LogIn size={18} /> Sign In to System
          </button>
        </form>



        {/* Super-Admin Discreet Portal Link */}
        {onOpenSuperAdmin && (
          <div style={{ textAlign: 'center', marginTop: '1.25rem', borderTop: '1px dashed #E2E8F0', paddingTop: '0.75rem' }}>
            <button
              type="button"
              onClick={onOpenSuperAdmin}
              style={{ background: 'none', border: 'none', color: '#0284C7', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <ShieldCheck size={14} /> Open Super-Admin SaaS Portal (rubyan)
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default LoginPage;
