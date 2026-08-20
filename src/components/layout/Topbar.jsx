import React from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Store,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { STORE_INFO } from '../../data/mockData';
import PwaInstallButton from './PwaInstallButton';

const SCREEN_TITLES = {
  dashboard: 'Executive Dashboard',
  pos: 'POS Wholesale Billing & Checkout',
  inventory: 'Pharmaceutical Inventory Catalog',
  expiry: 'Expiry Radar & Batch Audit',
  'region-ledger': 'Region Delivery & Settlement Ledger',
  suppliers: 'Supplier Directory & Stock Orders',
  analytics: 'Financial & Profit Analytics',
  settings: 'Store Profile & System Settings'
};

import { getRandomQuote } from '../../utils/quoteUtils';

export const Topbar = ({ currentScreen }) => {
  const { user, toggleRole, isAdmin, logout } = useAuth();
  const [welcomeQuote] = React.useState(() => getRandomQuote());

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid var(--color-border)',
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: 'var(--shadow-sm)',
      zIndex: 10
    }}>
      {/* Active Screen Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
            {SCREEN_TITLES[currentScreen] || 'Executive Dashboard'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#0369A1', fontWeight: 700, marginTop: '0.15rem' }}>
            <span>💡 "{welcomeQuote}"</span>
          </div>
        </div>
      </div>

      {/* Right Controls: PWA App Install, Role Switcher, User Profile & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* PWA Install Button */}
        <PwaInstallButton />

        {/* Live RBAC Role Switcher Toggle */}
        <button
          onClick={toggleRole}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            border: isAdmin ? '1px solid #7DD3FC' : '1px solid #CBD5E1',
            backgroundColor: isAdmin ? '#E0F2FE' : '#F1F5F9',
            color: isAdmin ? '#0284C7' : 'var(--color-text-secondary)',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          title="Click to toggle active user role (Admin ↔ Cashier)"
        >
          {isAdmin ? (
            <>
              <ShieldCheck size={16} color="#0284C7" />
              <span>Role: Admin</span>
            </>
          ) : (
            <>
              <UserCheck size={16} color="#64748B" />
              <span>Role: Cashier</span>
            </>
          )}
          <RefreshCw size={12} style={{ marginLeft: '0.2rem', opacity: 0.7 }} />
        </button>

        {/* User Info Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.35rem 0.75rem',
          backgroundColor: 'var(--color-surface-hover)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: isAdmin ? '#0284C7' : '#64748B',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            {user.name ? user.name.charAt(0) : 'U'}
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-main)', lineHeight: 1.1 }}>
              {user.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', lineHeight: 1.1 }}>
              {user.staffId}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid #EF4444',
            backgroundColor: '#FEF2F2',
            color: '#EF4444',
            fontWeight: 800,
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
          title="Sign out of system"
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
