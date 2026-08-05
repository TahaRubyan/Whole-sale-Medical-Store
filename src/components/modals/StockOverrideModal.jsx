import React, { useState, useEffect } from 'react';
import { Edit, ShieldAlert, Check, Lock } from 'lucide-react';
import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { useCart } from '../../context/CartContext';

export const StockOverrideModal = ({ isOpen, onClose, product, batch }) => {
  const { permissions } = useAuth();
  const { updateBatchStock } = useInventory();
  const { addToast } = useCart();

  const [newQuantity, setNewQuantity] = useState('');
  const [reason, setReason] = useState('Physical Stock Count Adjustment');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (batch) {
      setNewQuantity(batch.quantity !== undefined ? String(batch.quantity) : '0');
    }
  }, [batch]);

  if (!isOpen) return null;

  // RBAC Access Check Guard
  if (!permissions.canOverrideStock) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Stock Override - Access Denied"
        icon={ShieldAlert}
        maxWidth="480px"
      >
        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-danger-text)' }}>
          <Lock size={48} style={{ marginBottom: '1rem', opacity: 0.8 }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Admin Authorization Required
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Cashiers are not permitted to manually override batch stock levels. Please contact the Managing Pharmacist or Administrator.
          </p>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </Modal>
    );
  }

  if (!product || !batch) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const qtyVal = Math.max(0, parseInt(newQuantity, 10) || 0);

    updateBatchStock(product.id, batch.batchNumber, qtyVal);

    if (addToast) {
      addToast(
        'Stock Adjusted',
        `Batch ${batch.batchNumber} stock updated from ${batch.quantity} to ${qtyVal} units.`,
        'success'
      );
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Admin Stock Override Audit"
      subtitle={`Adjust stock for ${product.name} (Batch: ${batch.batchNumber})`}
      icon={Edit}
      maxWidth="540px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Info Box */}
        <div
          style={{
            backgroundColor: 'var(--color-background)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.875rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem'
          }}
        >
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
            {product.name}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Batch #: <strong style={{ fontFamily: 'var(--font-mono)' }}>{batch.batchNumber}</strong> | Expiry: {batch.expiryDate}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Current System Qty: <strong style={{ color: 'var(--color-primary)' }}>{batch.quantity} units</strong>
          </div>
        </div>

        {/* Form Fields */}
        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            New Stock Quantity (Units) *
          </label>
          <input
            type="number"
            min="0"
            required
            className="input"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            placeholder="Enter physical count quantity"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            Reason for Adjustment *
          </label>
          <select
            className="input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="Physical Stock Count Adjustment">Physical Stock Count Adjustment</option>
            <option value="Damaged / Broken Vials">Damaged / Broken Vials</option>
            <option value="Expired Goods Removal">Expired Goods Removal</option>
            <option value="Supplier Return Inward">Supplier Return Inward</option>
            <option value="Other Audit Correction">Other Audit Correction</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            Audit Notes / Remarks
          </label>
          <textarea
            className="input"
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add verification notes or invoice references for auditor records..."
            style={{ width: '100%', resize: 'vertical' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Check size={16} /> Confirm Stock Override
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StockOverrideModal;
