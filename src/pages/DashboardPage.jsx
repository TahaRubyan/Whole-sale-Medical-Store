import React from 'react';
import { 
  TrendingUp, 
  PackageX, 
  Calendar, 
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import { useSales } from '../context/SalesContext';

export const DashboardPage = ({ onNavigate }) => {
  const { user, isCashier } = useAuth();
  const { medicines, batches } = useInventory();
  const { invoices } = useSales();

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter Today's Wholesale Invoices
  const todayInvoices = invoices.filter((inv) => inv.date === todayStr || inv.date === '31/07/2026' || inv.date === '03/08/2026');
  const todayRevenue = todayInvoices.reduce((sum, inv) => sum + (inv.netTotal || inv.subtotal || 0), 0);
  const todayOrdersCount = todayInvoices.length;

  // Calculate Low Stock Medicines (Box Count - Limit Disabled per User Request)
  const lowStockCount = 0;

  // Calculate Est. Today Profit (~25% margin)
  const todayEstProfit = todayRevenue * 0.25;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Welcome Header (Ocean Cyan Blue Theme) */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
        color: '#FFFFFF',
        padding: '1.5rem 1.75rem',
        border: 'none',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="flex-between" style={{ position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <Calendar size={13} />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
              Welcome back, {user?.name || 'Idrees'} 👋
            </h2>
            <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              Idrees Medical Store — Commercial Wholesale POS Billing & Inventory Management System.
            </p>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards Grid (Wholesale Focus) */}
      <div className="grid-3">
        {/* Today's Sales */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Today's Wholesale Turnover
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#E0F2FE',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Rs</span>
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '0.4rem' }}>
            Rs. {todayRevenue.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#0284C7', fontWeight: 700 }}>
            <TrendingUp size={14} />
            <span>Today's Counter Orders ({todayOrdersCount} Wholesale Orders)</span>
          </div>
        </div>

        {/* Est. Gross Profit (Admin Only) */}
        {!isCashier && (
          <div className="card">
            <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Est. Today's Commercial Profit
              </span>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#D1FAE5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Rs</span>
              </div>
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#059669', marginBottom: '0.4rem' }}>
              Rs. {todayEstProfit.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              25% Estimated Gross Wholesale Margin
            </div>
          </div>
        )}

        {/* Low Stock Alerts */}
        <div 
          className="card" 
          onClick={() => onNavigate('inventory')}
          style={{ cursor: 'pointer' }}
        >
          <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Low Stock Warnings (Box Count)
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PackageX size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '0.4rem' }}>
            {lowStockCount} Items
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: '#D97706', fontWeight: 600 }}>Reorder Required</span>
            <span style={{ color: '#0284C7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              View Catalog <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
