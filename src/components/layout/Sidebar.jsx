import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  AlertTriangle, 
  Truck, 
  MapPin,
  TrendingUp, 
  Settings, 
  Pill,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard, requiresAdmin: false },
  { id: 'pos', label: 'POS Sale', icon: ShoppingCart, requiresAdmin: false },
  { id: 'inventory', label: 'Stock', icon: Package, requiresAdmin: false },
  { id: 'expiry', label: 'Expiry', icon: AlertTriangle, requiresAdmin: false },
  { id: 'region-ledger', label: 'Ledger', icon: MapPin, requiresAdmin: false },
  { id: 'suppliers', label: 'Suppliers', icon: Truck, requiresAdmin: false },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, requiresAdmin: true },
  { id: 'settings', label: 'Settings', icon: Settings, requiresAdmin: true },
];

export const Sidebar = ({ currentScreen, onNavigate }) => {
  const { isCashier } = useAuth();

  // Filter items for Cashier so restricted pages are hidden completely
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (isCashier && item.requiresAdmin) {
      return false;
    }
    return true;
  });

  return (
    <aside style={{
      width: '210px',
      backgroundColor: '#0284C7', // Ocean Cyan Blue Theme
      color: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      flexShrink: 0
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '1.1rem 1.25rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem'
      }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#FFFFFF',
          color: '#0284C7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <Pill size={20} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0 }}>
            PharmaLink
          </h1>
          <span style={{ fontSize: '0.675rem', color: '#E0F2FE', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Wholesale ERP
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
        <div style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', fontWeight: 800, color: '#BAE6FD', letterSpacing: '0.05em' }}>
          NAVIGATION
        </div>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id || (item.id === 'region-ledger' && currentScreen === '/region-ledger');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isActive ? '#0369A1' : 'transparent',
                color: '#FFFFFF',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? 'inset 0 1px 0 rgba(255,255,255,0.2)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon size={18} opacity={isActive ? 1 : 0.85} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div style={{
        padding: '0.85rem 1rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
        fontSize: '0.7rem',
        color: '#E0F2FE'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ADE80' }}></span>
          <span style={{ fontWeight: 700 }}>System Ready</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
