import React from 'react';
import { useCart } from '../../context/CartContext';
import { CheckCircle2, AlertTriangle, Info, AlertCircle, X } from 'lucide-react';

export const NotificationToast = () => {
  const { toasts, removeToast } = useCart();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast) => {
        let bg = '#0284C7';
        let borderColor = '#0369A1';
        let IconComponent = Info;

        if (toast.type === 'success') {
          bg = '#10B981';
          borderColor = '#059669';
          IconComponent = CheckCircle2;
        } else if (toast.type === 'warning') {
          bg = '#F59E0B';
          borderColor = '#D97706';
          IconComponent = AlertTriangle;
        } else if (toast.type === 'error') {
          bg = '#EF4444';
          borderColor = '#DC2626';
          IconComponent = AlertCircle;
        }

        return (
          <div
            key={toast.id}
            style={{
              backgroundColor: '#FFFFFF',
              borderLeft: `4px solid ${bg}`,
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: '0.875rem 1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              pointerEvents: 'auto',
              animation: 'slideInRight 250ms cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div style={{ color: bg, marginTop: '2px' }}>
              <IconComponent size={20} />
            </div>

            <div style={{ flex: 1 }}>
              {toast.title && (
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
                  {toast.title}
                </div>
              )}
              {toast.message && (
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem', lineHeight: 1.4 }}>
                  {toast.message}
                </div>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: '0.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationToast;
