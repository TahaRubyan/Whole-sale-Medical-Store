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
  { id: 'dashboard', label: 'Home / Overview', icon: LayoutDashboard, requiresAdmin: false },
  { id: 'pos', label: 'Sales & Billing (POS)', icon: ShoppingCart, requiresAdmin: false },
  { id: 'inventory', label: 'Medicine Stock', icon: Package, requiresAdmin: false },
  { id: 'expiry', label: 'Expiry Alerts', icon: AlertTriangle, requiresAdmin: false },
  { id: 'region-ledger', label: 'Region Deliveries & Cash', icon: MapPin, requiresAdmin: false },
  { id: 'suppliers', label: 'Suppliers & Purchases', icon: Truck, requiresAdmin: false },
  { id: 'analytics', label: 'Sales & Profit Reports', icon: TrendingUp, requiresAdmin: true },
  { id: 'settings', label: 'Store Settings', icon: Settings, requiresAdmin: true },
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
      width: '240px',
      backgroundColor: '#0284C7', // Ocean Cyan Blue Theme
      color: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      flexShrink: 0
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#FFFFFF',
          color: '#0284C7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <Pill size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            PharmaLink
          </h1>
          <p style={{ fontSize: '0.725rem', color: '#E0F2FE', fontWeight: 500 }}>
            Wholesale ERP System
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
        <p style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          color: '#E0F2FE',
          padding: '0.5rem 0.75rem 0.75rem',
          letterSpacing: '0.05em',
          opacity: 0.9
        }}>
          Wholesale Navigation
        </p>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: isActive 
                      ? '#0369A1' 
                      : 'transparent',
                    color: '#FFFFFF',
                    fontWeight: isActive ? 800 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon size={19} color={isActive ? '#FFFFFF' : '#BAE6FD'} />
                    <span>{item.label}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Role Footer Badge */}
      <div style={{
        padding: '0.85rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        margin: '0.75rem',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center'
      }}>
        <span style={{ fontSize: '0.75rem', color: '#E0F2FE', fontWeight: 600 }}>
          Logged in as {isCashier ? 'Cashier' : 'Admin'}
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;
