import React, { useState } from 'react';
import { useSupplier } from '../../context/SupplierContext';
import { DollarSign, X, CheckCircle, AlertTriangle } from 'lucide-react';

export const PaySupplierModal = ({ supplier, isOpen = true, onClose }) => {
  const { recordSupplierPayment } = useSupplier();
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState(null);

  if (!isOpen || !supplier) return null;

  const currentBal = supplier.pendingBalance !== undefined
    ? Number(supplier.pendingBalance)
    : Number(supplier.outstandingBalance || 0);

  const payAmt = Number(amount);
  const isOverPaying = !isNaN(payAmt) && payAmt > currentBal;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isNaN(payAmt) || payAmt <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid positive payment amount.' });
      return;
    }

    if (payAmt > currentBal) {
      setMessage({ type: 'error', text: `Amount exceeds current pending balance (Rs. ${currentBal.toLocaleString()})` });
      return;
    }

    recordSupplierPayment(supplier.id, payAmt, paymentMode, note);

    const remainingBal = Math.max(0, currentBal - payAmt);
    setMessage({
      type: 'success',
      text: `Payment of Rs. ${payAmt.toLocaleString()} recorded via ${paymentMode}! Remaining Balance: Rs. ${remainingBal.toLocaleString()}`,
    });

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '90%', maxWidth: '480px', padding: '1.5rem', position: 'relative', backgroundColor: '#FFFFFF', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <DollarSign size={26} color="#059669" />
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>
              Record Supplier Payment
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.15rem' }}>
              Distributor: <strong>{supplier.companyName || supplier.name}</strong>
              <span style={{ marginLeft: '0.5rem' }}>
                Pending Balance: <strong style={{ color: '#EF4444' }}>Rs. {currentBal.toLocaleString('en-PK')}</strong>
              </span>
            </div>
          </div>
        </div>

        {message && (
          <div
            style={{
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
              marginBottom: '1rem',
            }}
          >
            {message.type === 'success' ? <CheckCircle size={18} color="#059669" /> : <AlertTriangle size={18} color="#EF4444" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
              Payment Amount (Rs.) *:
            </label>
            <input
              type="number"
              min="1"
              max={currentBal}
              placeholder={`Max: ${currentBal}`}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (message) setMessage(null);
              }}
              style={{
                width: '100%',
                padding: '0.55rem',
                borderRadius: '4px',
                border: isOverPaying ? '2px solid #EF4444' : '1px solid var(--color-border)',
                fontWeight: 800,
                fontSize: '0.95rem',
              }}
              required
            />
            {isOverPaying && (
              <div style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 700, marginTop: '0.25rem' }}>
                ⚠️ Amount exceeds current pending balance (Rs. {currentBal.toLocaleString()})
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
              Payment Mode:
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontWeight: 700 }}
            >
              <option value="Cash">💵 Cash</option>
              <option value="Bank Transfer">💳 Bank Transfer / Wire</option>
              <option value="Cheque">📜 Cheque</option>
              <option value="Online / Mobile Payment">📱 Online / Mobile Payment</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
              Payment Reference / Note:
            </label>
            <input
              type="text"
              placeholder="e.g. Meezan Bank Wire Ref #99482"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isOverPaying || !amount || Number(amount) <= 0}
              className="btn btn-primary"
              style={{
                flex: 1,
                padding: '0.75rem',
                fontWeight: 800,
                backgroundColor: '#059669',
                color: '#FFF',
                opacity: isOverPaying || !amount || Number(amount) <= 0 ? 0.6 : 1,
                cursor: isOverPaying || !amount || Number(amount) <= 0 ? 'not-allowed' : 'pointer',
              }}
            >
              [Confirm & Record Payment]
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaySupplierModal;
