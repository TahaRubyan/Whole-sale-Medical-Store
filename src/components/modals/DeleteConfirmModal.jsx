import React from 'react';
import { Trash2, X } from 'lucide-react';

export const DeleteConfirmModal = ({ itemName, title, message, onConfirm, onClose, onCancel }) => {
  const handleClose = onClose || onCancel || (() => {});
  const displayTitle = title || `Confirm Item Deletion`;
  const displayItemName = itemName || 'selected item';
  const displayMessage = message || `Are you sure you want to permanently delete "${displayItemName}" from the catalog? This action cannot be undone.`;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="card" style={{ width: '90%', maxWidth: '440px', padding: '1.5rem', position: 'relative', backgroundColor: '#FFFFFF', boxShadow: '0 10px 25px rgba(0,0,0,0.25)', borderRadius: '10px' }}>
        <button onClick={handleClose} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: '44px', height: '44px', backgroundColor: '#FEF2F2', color: '#EF4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Trash2 size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#991B1B', margin: 0 }}>
              {displayTitle}
            </h3>
            <div style={{ fontSize: '0.775rem', color: '#64748B', fontWeight: 600 }}>Admin Authorization Action</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '0.85rem', borderRadius: '6px', fontSize: '0.85rem', color: '#991B1B', marginBottom: '1.25rem', lineHeight: '1.4' }}>
          {displayMessage}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" onClick={handleClose} className="btn btn-outline" style={{ flex: 1, padding: '0.65rem', fontWeight: 700 }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (onConfirm) onConfirm();
              handleClose();
            }}
            className="btn btn-primary"
            style={{ flex: 1, padding: '0.65rem', backgroundColor: '#EF4444', borderColor: '#EF4444', color: '#FFF', fontWeight: 900, cursor: 'pointer' }}
          >
            Permanently Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
