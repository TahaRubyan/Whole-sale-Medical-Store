import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { PackagePlus, MinusCircle, X, CheckCircle, AlertTriangle } from 'lucide-react';

export const StockManagementModal = ({ medicine, batch, onClose }) => {
  const { extendStockBatch, deductStockBatch } = useInventory();
  const [activeTab, setActiveTab] = useState('ADD'); // 'ADD' | 'DEDUCT'
  
  // Stock Addition state
  const [addedBoxes, setAddedBoxes] = useState('');
  const [isOverride, setIsOverride] = useState(false);

  // Stock Deduction state
  const [deductBoxes, setDeductBoxes] = useState('');
  const [deductReason, setDeductReason] = useState('Damaged / Expired');

  // Success / Error Banner State
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text: string }

  if (!medicine || !batch) return null;

  const currentAvailableBoxes = batch.availableBoxes !== undefined ? batch.availableBoxes : Math.floor((batch.totalTabletsAvailable || 0) / 200);

  const handleAddStock = (e) => {
    e.preventDefault();
    const qty = Number(addedBoxes);
    if (isNaN(qty) || qty <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid positive number of boxes' });
      return;
    }

    extendStockBatch(medicine.id, batch.batchNumber, qty, isOverride);
    setMessage({
      type: 'success',
      text: `Stock ${isOverride ? 'overridden' : 'extended'} for ${medicine.brandName}! New balance logged to Stock Audit Log.`
    });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleDeductStock = (e) => {
    e.preventDefault();
    const qty = Number(deductBoxes);
    if (isNaN(qty) || qty <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid positive number of boxes to deduct' });
      return;
    }

    deductStockBatch(medicine.id, batch.batchNumber, qty, deductReason);
    setMessage({
      type: 'success',
      text: `Deducted ${qty} Boxes from ${medicine.brandName}! Action recorded in Stock Audit Log.`
    });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '90%', maxWidth: '520px', padding: '1.5rem', position: 'relative', backgroundColor: '#FFFFFF', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284C7', margin: 0 }}>
            Dual-Mode Stock Management & Audit Logger
          </h2>
          <div style={{ fontSize: '0.825rem', color: '#64748B', marginTop: '0.2rem' }}>
            Medicine: <strong>{medicine.brandName}</strong> | Batch #: <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{batch.batchNumber}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#0369A1', fontWeight: 700, marginTop: '0.1rem' }}>
            Current Available Stock: {currentAvailableBoxes} Boxes
          </div>
        </div>

        {/* INLINE SYSTEM MESSAGE BANNER (REPLACING NATIVE ALERT) */}
        {message && (
          <div style={{
            backgroundColor: message.type === 'success' ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${message.type === 'success' ? '#86EFAC' : '#FCA5A5'}`,
            color: message.type === 'success' ? '#166534' : '#991B1B',
            padding: '0.65rem 0.85rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            {message.type === 'success' ? <CheckCircle size={18} color="#059669" /> : <AlertTriangle size={18} color="#EF4444" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* DUAL MODE NAV BAR TABS */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => { setActiveTab('ADD'); setMessage(null); }}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'ADD' ? '#0284C7' : '#F1F5F9',
              color: activeTab === 'ADD' ? '#FFF' : '#475569',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <PackagePlus size={16} /> Mode 1: Extend / Override Stock
          </button>
          <button
            onClick={() => { setActiveTab('DEDUCT'); setMessage(null); }}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'DEDUCT' ? '#EF4444' : '#F1F5F9',
              color: activeTab === 'DEDUCT' ? '#FFF' : '#475569',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <MinusCircle size={16} /> Mode 2: Deduct Stock
          </button>
        </div>

        {/* TAB 1: ADD / OVERRIDE STOCK FORM */}
        {activeTab === 'ADD' && (
          <form onSubmit={handleAddStock} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                Quantity of Boxes to Add / Set:
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 50"
                value={addedBoxes}
                onChange={(e) => setAddedBoxes(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontWeight: 800, fontSize: '0.95rem' }}
                required
              />
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isOverride}
                  onChange={(e) => setIsOverride(e.target.checked)}
                />
                <span>Set as Exact Stock Count (Override existing total)</span>
              </label>
              <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '0.2rem', paddingLeft: '1.5rem' }}>
                If checked, total stock count will be set directly to this value.
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontWeight: 800, backgroundColor: '#0284C7', color: '#FFF' }}
            >
              <PackagePlus size={16} /> [Confirm Stock Update & Log to Audit]
            </button>
          </form>
        )}

        {/* TAB 2: DEDUCT STOCK FORM */}
        {activeTab === 'DEDUCT' && (
          <form onSubmit={handleDeductStock} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                Quantity of Boxes to Deduct:
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 10"
                value={deductBoxes}
                onChange={(e) => setDeductBoxes(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontWeight: 800, fontSize: '0.95rem' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                Reason for Stock Deduction:
              </label>
              <select
                value={deductReason}
                onChange={(e) => setDeductReason(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontWeight: 700 }}
              >
                <option value="Damaged / Expired">Damaged / Expired Stock</option>
                <option value="Breakage / Theft">Breakage / Shrinkage</option>
                <option value="Sample / Internal Use">Sample / Internal Distribution</option>
                <option value="Manual Audit Adjustment">Manual Audit Adjustment</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontWeight: 800, backgroundColor: '#EF4444', color: '#FFF' }}
            >
              <MinusCircle size={16} /> [Confirm Stock Deduction & Log to Audit]
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default StockManagementModal;
