import React, { useState } from 'react';
import { MapPin, X, Plus, CheckCircle } from 'lucide-react';

export const AddRegionModal = ({ isOpen, onClose, onAddRegion }) => {
  const [regionName, setRegionName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = regionName.trim();
    if (!name) {
      setError('Please enter a valid region name.');
      return;
    }

    onAddRegion(name);
    setRegionName('');
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="card" style={{ width: '420px', maxWidth: '92vw', padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1.5px solid #F1F5F9', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Add New Delivery Region
            </h3>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
              Region Name:
            </label>
            <input
              type="text"
              placeholder="e.g. Lalamusa, Dingha, Bhimber, Kharian"
              value={regionName}
              onChange={(e) => {
                setRegionName(e.target.value);
                setError('');
              }}
              style={{ width: '100%', padding: '0.6rem 0.75rem', fontSize: '0.9rem', fontWeight: 700, borderRadius: '6px', border: '1.5px solid #CBD5E1', outline: 'none' }}
              autoFocus
              required
            />
            {error && (
              <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 700, marginTop: '0.25rem', display: 'block' }}>
                {error}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', fontWeight: 700 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', fontWeight: 800, backgroundColor: '#0284C7', color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={16} /> Save Region
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AddRegionModal;
