import React, { useState, useEffect } from 'react';
import { FileText, Printer, Check, ArrowLeft, Building2 } from 'lucide-react';
import Modal from '../common/Modal';
import { useSupplier } from '../../context/SupplierContext';
import { STORE_INFO } from '../../data/mockData';

export const ReturnNoteModal = ({ isOpen, onClose, item }) => {
  const { suppliers } = useSupplier();
  const [mode, setMode] = useState('edit'); // 'edit' | 'preview'

  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [returnQty, setReturnQty] = useState(0);
  const [reason, setReason] = useState('Near Expiry Quarantine & Supplier Return');
  const [notes, setNotes] = useState('');
  const [debitNoteNumber, setDebitNoteNumber] = useState('');

  useEffect(() => {
    if (item) {
      setReturnQty(item.quantity || 0);
      setDebitNoteNumber(`DN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      
      // Pre-select supplier if item has supplier name
      if (item.supplier && suppliers) {
        const found = suppliers.find(s => s.name.toLowerCase().includes(item.supplier.toLowerCase()));
        if (found) {
          setSelectedSupplierId(found.id);
        } else if (suppliers.length > 0) {
          setSelectedSupplierId(suppliers[0].id);
        }
      } else if (suppliers && suppliers.length > 0) {
        setSelectedSupplierId(suppliers[0].id);
      }
    }
    setMode('edit');
  }, [item, suppliers]);

  if (!isOpen || !item) return null;

  const currentSupplier = suppliers?.find(s => s.id === selectedSupplierId) || suppliers?.[0] || {
    name: item.supplier || 'Sun Pharma Distributors',
    contactPerson: 'Ramesh Patel',
    phone: '+91 98200 11223',
    gstin: '27AAACS1234F1Z8',
    address: 'Gala #4, Central Warehouse, Thane'
  };

  const unitPrice = item.purchasePrice || (item.mrp ? item.mrp * 0.7 : 0);
  const totalValueLoss = (Number(returnQty) || 0) * unitPrice;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? "Supplier Return Note Builder" : "Debit Note Preview"}
      subtitle={mode === 'edit' ? `Prepare debit return note for batch ${item.batchNumber}` : `Debit Note #${debitNoteNumber}`}
      icon={FileText}
      maxWidth={mode === 'edit' ? "600px" : "750px"}
    >
      {mode === 'edit' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Target Product Summary */}
          <div
            style={{
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.875rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
              {item.productName}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Batch #: <strong style={{ fontFamily: 'var(--font-mono)' }}>{item.batchNumber}</strong> | Expiry: {item.expiryDate} ({item.daysRemaining} days left)
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Available Stock Qty: {item.quantity} units | Purchase Rate: ₹{unitPrice.toFixed(2)}
            </div>
          </div>

          {/* Supplier Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Select Distributor / Supplier *
            </label>
            <select
              className="input"
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              style={{ width: '100%' }}
            >
              {suppliers?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.gstin})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Reason */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Return Quantity (Units) *
              </label>
              <input
                type="number"
                min="1"
                max={item.quantity}
                className="input"
                value={returnQty}
                onChange={(e) => setReturnQty(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Estimated Cost Value Loss
              </label>
              <div
                style={{
                  padding: '0.55rem 0.75rem',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 800,
                  color: '#991B1B',
                  fontSize: '0.95rem'
                }}
              >
                ₹{totalValueLoss.toFixed(2)}
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Return Reason
            </label>
            <input
              type="text"
              className="input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Additional Notes
            </label>
            <textarea
              className="input"
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Courier tracking # or Credit note reference..."
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setMode('preview')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FileText size={16} /> Generate Debit Note Preview
            </button>
          </div>
        </div>
      ) : (
        /* Printable Debit Note Mode */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            id="printable-debit-note"
            style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #000000',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              color: '#000000',
              fontFamily: 'sans-serif'
            }}
          >
            {/* Header */}
            <div style={{ borderBottom: '2px solid #000000', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div className="flex-between">
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {STORE_INFO.name}
                  </h2>
                  <p style={{ fontSize: '0.75rem', margin: '0.15rem 0' }}>{STORE_INFO.address}</p>
                  <p style={{ fontSize: '0.75rem' }}>
                    <strong>DL Numbers:</strong> {STORE_INFO.dlNumber} | <strong>GSTIN:</strong> {STORE_INFO.gstin}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#991B1B' }}>SUPPLIER DEBIT NOTE</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace' }}>#{debitNoteNumber}</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>Date: {new Date().toISOString().split('T')[0]}</div>
                </div>
              </div>
            </div>

            {/* Supplier Meta */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '0.75rem 1rem',
                borderRadius: '4px',
                marginBottom: '1rem',
                fontSize: '0.8rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                  Debit Issued To (Distributor):
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', marginTop: '0.15rem' }}>{currentSupplier.name}</div>
                <div>{currentSupplier.address}</div>
                <div>Phone: {currentSupplier.phone} | Email: {currentSupplier.email}</div>
                <div><strong>GSTIN:</strong> {currentSupplier.gstin}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                  Return Audit Reference:
                </div>
                <div style={{ marginTop: '0.15rem' }}><strong>Reason:</strong> {reason}</div>
                <div><strong>Pharmacist in Charge:</strong> {STORE_INFO.pharmacistInCharge}</div>
                {notes && <div><strong>Notes:</strong> {notes}</div>}
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '2px solid #000000', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem' }}>S.No</th>
                  <th style={{ padding: '0.5rem' }}>Medicine Description</th>
                  <th style={{ padding: '0.5rem' }}>Batch #</th>
                  <th style={{ padding: '0.5rem' }}>Expiry Date</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Return Qty</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Purchase Rate (₹)</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total Debit (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '0.5rem' }}>1</td>
                  <td style={{ padding: '0.5rem', fontWeight: 700 }}>
                    {item.productName}
                    <div style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>{item.category}</div>
                  </td>
                  <td style={{ padding: '0.5rem', fontFamily: 'monospace', fontWeight: 700 }}>{item.batchNumber}</td>
                  <td style={{ padding: '0.5rem' }}>{item.expiryDate}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700 }}>{returnQty} units</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>₹{unitPrice.toFixed(2)}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 800 }}>₹{totalValueLoss.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Total & Signatures */}
            <div className="flex-between" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #000000' }}>
              <div style={{ fontSize: '0.75rem', maxWidth: '350px' }}>
                <p style={{ fontWeight: 700 }}>Terms & Conditions:</p>
                <p style={{ color: '#475569' }}>
                  Amount credited to our account against supplier credit note or adjusted against future invoice payments.
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Total Amount Claimed</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#991B1B' }}>
                  ₹{totalValueLoss.toFixed(2)}
                </div>
                <div style={{ marginTop: '2.5rem', borderTop: '1px solid #000000', paddingTop: '0.3rem', fontSize: '0.75rem', fontWeight: 700 }}>
                  For {STORE_INFO.name}<br />(Authorized Signatory)
                </div>
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setMode('edit')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <ArrowLeft size={16} /> Back to Edit
            </button>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
              <button className="btn btn-primary" onClick={handlePrint} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Printer size={16} /> Print Debit Note
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ReturnNoteModal;
