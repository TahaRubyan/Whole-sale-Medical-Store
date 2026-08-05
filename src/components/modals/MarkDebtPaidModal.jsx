import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { CheckCircle, DollarSign, X } from 'lucide-react';

export const MarkDebtPaidModal = ({ invoice, onClose }) => {
  const { recordDebtPayment } = useSales();

  const originalNet = Number(invoice?.netTotal || invoice?.subtotal || 0);
  const currentOutstanding = invoice?.remainingDebt !== undefined ? Number(invoice.remainingDebt) : originalNet;

  const [amountPaid, setAmountPaid] = useState(currentOutstanding);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [note, setNote] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);

  if (!invoice) return null;

  const paidNum = Number(amountPaid) || 0;
  const remainingAfter = Math.max(0, currentOutstanding - paidNum);

  const handleConfirm = (e) => {
    e.preventDefault();
    if (paidNum <= 0) return;

    recordDebtPayment(invoice.invoiceNo, paidNum, paymentMode, note);
    
    setPaymentResult({
      paid: paidNum,
      remaining: remainingAfter,
      isFullyCleared: remainingAfter <= 0,
    });

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '90%', maxWidth: '520px', padding: '1.5rem', position: 'relative', backgroundColor: '#FFFFFF', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        {paymentResult ? (
          /* SUCCESS NOTIFICATION CARD */
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ width: '56px', height: '56px', backgroundColor: '#D1FAE5', color: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <CheckCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#065F46', margin: '0 0 0.4rem 0' }}>
              {paymentResult.isFullyCleared ? 'Debt Fully Cleared!' : 'Partial Debt Payment Recorded!'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#047857', margin: 0, lineHeight: 1.5 }}>
              Received <strong>Rs. {paymentResult.paid.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</strong> via {paymentMode}.
              {paymentResult.isFullyCleared ? (
                <span style={{ display: 'block', fontWeight: 800, marginTop: '0.25rem' }}>Invoice status updated to PAID!</span>
              ) : (
                <span style={{ display: 'block', fontWeight: 800, color: '#DC2626', marginTop: '0.25rem' }}>
                  Remaining Balance Left: Rs. {paymentResult.remaining.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </span>
              )}
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <DollarSign size={24} color="#059669" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>
                Receive Payment & Collect Customer Debt
              </h2>
            </div>

            <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: '#166534', marginBottom: '1rem' }}>
              <div><strong>Customer / Pharmacy:</strong> {invoice.customerName || 'Consumer'}</div>
              <div><strong>Invoice #:</strong> {invoice.invoiceNo} | <strong>Date:</strong> {invoice.date}</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, marginTop: '0.25rem', color: '#DC2626' }}>
                Current Outstanding Debt: Rs. {currentOutstanding.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <form onSubmit={handleConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '0.2rem', color: '#0369A1' }}>
                  Amount Received Today (Rs.) *:
                </label>
                <input
                  type="number"
                  min="1"
                  max={currentOutstanding}
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', fontSize: '1.1rem', fontWeight: 900, borderRadius: '4px', border: '2px solid #059669', color: '#059669' }}
                  required
                />
                {paidNum < currentOutstanding && paidNum > 0 && (
                  <div style={{ fontSize: '0.775rem', fontWeight: 800, color: '#DC2626', marginTop: '0.25rem' }}>
                    ⚠️ Remaining Balance Left to be Paid: Rs. {remainingAfter.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Payment Collection Mode:</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontWeight: 800 }}
                >
                  <option value="Cash">💵 Cash Counter</option>
                  <option value="Bank Transfer">💳 Bank Transfer / Wire</option>
                  <option value="Cheque">📜 Cheque</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Payment Reference / Collection Note:</label>
                <input
                  type="text"
                  placeholder="e.g. Partial cash received at counter"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontWeight: 900, backgroundColor: '#059669', color: '#FFF', marginTop: '0.4rem', fontSize: '0.95rem' }}
              >
                <CheckCircle size={18} /> [Confirm Payment Collection]
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default MarkDebtPaidModal;
