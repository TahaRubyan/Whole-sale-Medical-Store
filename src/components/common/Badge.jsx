import React from 'react';
import { AlertCircle, Clock, MapPin, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const Badge = ({
  type = 'custom',
  variant,
  label,
  children,
  daysRemaining,
  expiryDate,
  quantity,
  minStockLevel = 20,
  style,
  className = ''
}) => {
  if (type === 'rx') {
    return (
      <span
        className={`badge badge-rx ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          backgroundColor: '#FEE2E2',
          color: '#991B1B',
          border: '1px solid #FCA5A5',
          borderRadius: 'var(--radius-full)',
          padding: '0.2rem 0.55rem',
          fontSize: '0.725rem',
          fontWeight: 700,
          lineHeight: 1,
          ...style
        }}
      >
        <ShieldAlert size={12} />
        {label || children || 'Rx Schedule H'}
      </span>
    );
  }

  if (type === 'expiry') {
    let bg = '#E2E8F0';
    let color = '#334155';
    let icon = <Clock size={12} />;
    let text = label || expiryDate || '';

    if (daysRemaining !== undefined && daysRemaining !== null) {
      if (daysRemaining <= 0) {
        bg = '#FEE2E2';
        color = '#991B1B';
        text = `EXPIRED (${Math.abs(daysRemaining)}d ago)`;
        icon = <AlertCircle size={12} />;
      } else if (daysRemaining <= 90) {
        bg = '#FEF3C7';
        color = '#92400E';
        text = `Expiring in ${daysRemaining}d (${expiryDate || ''})`;
        icon = <AlertCircle size={12} />;
      } else {
        bg = '#D1FAE5';
        color = '#065F46';
        text = `Exp: ${expiryDate}`;
        icon = <CheckCircle2 size={12} />;
      }
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          backgroundColor: bg,
          color: color,
          borderRadius: 'var(--radius-full)',
          padding: '0.2rem 0.55rem',
          fontSize: '0.725rem',
          fontWeight: 600,
          lineHeight: 1,
          ...style
        }}
        className={className}
      >
        {icon}
        {text}
      </span>
    );
  }

  if (type === 'stock') {
    let bg = '#D1FAE5';
    let color = '#065F46';
    let text = `In Stock (${quantity})`;

    if (quantity === 0) {
      bg = '#FEE2E2';
      color = '#991B1B';
      text = 'Out of Stock';
    } else if (quantity <= minStockLevel) {
      bg = '#FEF3C7';
      color = '#92400E';
      text = `Low Stock (${quantity})`;
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          backgroundColor: bg,
          color: color,
          borderRadius: 'var(--radius-full)',
          padding: '0.2rem 0.55rem',
          fontSize: '0.725rem',
          fontWeight: 600,
          lineHeight: 1,
          ...style
        }}
        className={className}
      >
        {text}
      </span>
    );
  }

  if (type === 'location') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          backgroundColor: '#F1F5F9',
          color: '#475569',
          border: '1px solid #CBD5E1',
          borderRadius: 'var(--radius-sm)',
          padding: '0.15rem 0.45rem',
          fontSize: '0.7rem',
          fontWeight: 600,
          fontFamily: 'var(--font-mono)',
          ...style
        }}
        className={className}
      >
        <MapPin size={11} color="#64748B" />
        {label || children || 'Rack General'}
      </span>
    );
  }

  // Fallback custom variant
  const variantClass = variant ? `badge-${variant}` : 'badge-primary';
  return (
    <span className={`badge ${variantClass} ${className}`} style={style}>
      {children || label}
    </span>
  );
};

export default Badge;
