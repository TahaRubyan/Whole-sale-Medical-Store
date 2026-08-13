import React from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

export const AlertWarningModal = ({ isOpen, onClose, title = "Warning", message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="card" style={{ width: '440px', maxWidth: '92vw', padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '2px solid #FEF3C7', animation: 'scaleUp 0.15s ease-out' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1.5px solid #F3F4F6', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
              <AlertTriangle size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#92400E', margin: 0 }}>
              {title}
            </h3>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}>
            <X size={20} />
          </button>
        </div>

        {/* Message Body */}
        <div style={{ backgroundColor: '#FFFBEB', padding: '1rem', borderRadius: '8px', border: '1px solid #FCD34D', marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.9rem', color: '#B45309', margin: 0, fontWeight: 700, lineHeight: 1.5 }}>
            {message}
          </p>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.5rem', fontSize: '0.875rem', fontWeight: 800, backgroundColor: '#D97706', borderColor: '#D97706', color: '#FFFFFF', borderRadius: '6px' }}
          >
            I Understand / Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertWarningModal;
