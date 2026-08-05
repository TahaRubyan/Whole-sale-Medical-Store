import React, { useState } from 'react';
import { useSupplier } from '../../context/SupplierContext';
import { CheckCircle, DollarSign, X } from 'lucide-react';

export const ConfirmRtvRefundModal = ({ rtv, onClose }) => {
  const { confirmVendorRtvRefund } = useSupplier();
  const [confirmedBy, setConfirmedBy] = useState('Husnain Ali (Manager)');
  const [note, setNote] = useState('Cash Refund Received from Vendor');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!rtv) return null;

  const handleConfirm = (e) => {
    e.preventDefault();
    confirmVendorRtvRefund(rtv.rtvNumber, confirmedBy);
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '90%', maxWidth: '500px', padding: '1.5rem', position: 'relative', backgroundColor: '#FFFFFF', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ width: '56px', height: '56px', backgroundColor: '#D1FAE5', color: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <CheckCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#065F46', margin: '0 0 0.4rem 0' }}>
              Vendor Refund Payment Confirmed!
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#047857', margin: 0 }}>
              RTV Note <strong>{rtv.rtvNumber}</strong> marked as Refund Received by {confirmedBy}.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <DollarSign size={24} color="#059669" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>
                Confirm Vendor Cash Refund Received
              </h2>
            </div>

            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: '#991B1B', marginBottom: '1rem' }}>
              <div><strong>Distributor:</strong> {rtv.supplierName}</div>
              <div><strong>RTV Note #:</strong> {rtv.rtvNumber} | <strong>Return Date:</strong> {rtv.date}</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, marginTop: '0.25rem' }}>
                Pending Refund Amount: Rs. {Number(rtv.totalDeduction || 0).toLocaleString()}
              </div>
            </div>

            <form onSubmit={handleConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Confirmed By (Store Manager / User):</label>
                <input
                  type="text"
                  value={confirmedBy}
                  onChange={(e) => setConfirmedBy(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontWeight: 800 }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Refund Notes / Payment Reference:</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontWeight: 900, backgroundColor: '#059669', color: '#FFF', marginTop: '0.5rem' }}
              >
                <CheckCircle size={18} /> [Confirm Refund Cash Received & Clear RTV]
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmRtvRefundModal;
