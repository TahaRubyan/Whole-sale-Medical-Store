import React, { useState } from 'react';
import { useSupplier } from '../../context/SupplierContext';
import { DollarSign, X, CheckCircle, AlertTriangle } from 'lucide-react';

export const RecordPaymentModal = ({ supplier, onClose }) => {
  const { recordPaymentToSupplier } = useSupplier();
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState(null);

  if (!supplier) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payAmt = Number(amount);
    if (isNaN(payAmt) || payAmt <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid positive payment amount' });
      return;
    }

    recordPaymentToSupplier(supplier.id, payAmt, paymentMode, note);
    setMessage({
      type: 'success',
      text: `Payment of Rs. ${payAmt.toLocaleString()} recorded for ${supplier.companyName}! Ledger updated.`
    });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '90%', maxWidth: '480px', padding: '1.5rem', position: 'relative', backgroundColor: '#FFFFFF', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <DollarSign size={24} color="#059669" />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>
              Record Supplier Payment
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Distributor: <strong>{supplier.companyName}</strong> | Debt Owed: <span style={{ fontWeight: 800, color: '#EF4444' }}>Rs. {supplier.pendingBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>

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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Payment Amount (Rs.):</label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontWeight: 800, fontSize: '0.95rem' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Payment Mode:</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontWeight: 700 }}
            >
              <option value="Bank Transfer">💳 Bank Transfer / Wire</option>
              <option value="Cash">💵 Cash</option>
              <option value="Cheque">📜 Cheque</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Payment Reference / Note:</label>
            <input
              type="text"
              placeholder="e.g. Meezan Bank Ref #998877"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontWeight: 800, backgroundColor: '#059669', color: '#FFF', marginTop: '0.5rem' }}
          >
            [Confirm Payment & Update Supplier Ledger]
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;
