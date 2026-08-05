import React from 'react';
import { Package, Layers, MapPin, AlertCircle, Edit, Lock } from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { useAuth } from '../../context/AuthContext';

export const BatchDetailDrawer = ({ isOpen, onClose, product, onOpenOverride }) => {
  const { isAdmin, isCashier, permissions } = useAuth();

  if (!product) return null;

  const totalStock = (product.batches || []).reduce((sum, b) => sum + (b.quantity || 0), 0);
  const activeBatches = (product.batches || []).filter((b) => b.quantity > 0);

  const getDaysRemaining = (expiryDateStr) => {
    if (!expiryDateStr) return 0;
    const today = new Date('2026-08-01');
    const exp = new Date(expiryDateStr);
    return Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Batches for ${product.name}`}
      subtitle={`Master Catalog SKU: ${product.id} | Generic: ${product.genericName}`}
      icon={Layers}
      maxWidth="780px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Product Meta Header Card */}
        <div
          style={{
            backgroundColor: 'var(--color-background)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {product.name}
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                {product.genericName} • Manufacturer: {product.manufacturer || 'N/A'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {product.isScheduleH ? (
                <Badge type="rx" />
              ) : (
                <span className="badge" style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}>
                  OTC Medicine
                </span>
              )}
              <span className="badge badge-info">HSN: {product.hsnCode || '3004'}</span>
              <span className="badge badge-secondary">GST: {product.gstPercentage || 12}%</span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px dashed var(--color-border)'
            }}
          >
            <div>
              <span style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', display: 'block' }}>
                Storage Location
              </span>
              <Badge type="location" label={product.location || 'Rack Unassigned'} />
            </div>

            <div>
              <span style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', display: 'block' }}>
                Total Catalog Stock
              </span>
              <span
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: totalStock <= product.minStockLevel ? 'var(--color-danger-text)' : 'var(--color-success-text)'
                }}
              >
                {totalStock} units
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', display: 'block' }}>
                Min Threshold Level
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                {product.minStockLevel} units
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', display: 'block' }}>
                Active Batches
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                {activeBatches.length} / {product.batches?.length || 0} Available
              </span>
            </div>
          </div>
        </div>

        {/* Batches Table */}
        <div>
          <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              Available Stock Batches (FEFO Sorted)
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Earliest expiring batches are dispatched first in POS
            </span>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Batch #</th>
                  <th>Expiry Date</th>
                  <th>Expiry Status</th>
                  <th>MRP (₹)</th>
                  <th>Purchase Price</th>
                  <th>Stock Qty</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(!product.batches || product.batches.length === 0) ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-muted)' }}>
                      No stock batches found for this medicine.
                    </td>
                  </tr>
                ) : (
                  product.batches.map((b, idx) => {
                    const daysLeft = getDaysRemaining(b.expiryDate);
                    return (
                      <tr key={`${b.batchNumber}-${idx}`}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text-main)' }}>
                          {b.batchNumber}
                        </td>
                        <td style={{ fontWeight: 600 }}>{b.expiryDate}</td>
                        <td>
                          <Badge type="expiry" daysRemaining={daysLeft} expiryDate={b.expiryDate} />
                        </td>
                        <td style={{ fontWeight: 700 }}>₹{Number(b.mrp).toFixed(2)}</td>
                        <td>
                          {isAdmin ? (
                            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                              ₹{Number(b.purchasePrice).toFixed(2)}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              🔒 Locked
                            </span>
                          )}
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 800,
                              color: b.quantity === 0 ? 'var(--color-danger-text)' : 'var(--color-text-main)'
                            }}
                          >
                            {b.quantity} units
                          </span>
                        </td>
                        <td>
                          {permissions.canOverrideStock ? (
                            <button
                              className="btn btn-outline"
                              onClick={() => {
                                onClose();
                                if (onOpenOverride) onOpenOverride(product, b);
                              }}
                              style={{
                                fontSize: '0.725rem',
                                padding: '0.25rem 0.5rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem'
                              }}
                            >
                              <Edit size={12} /> Override
                            </button>
                          ) : (
                            <button
                              className="btn btn-outline"
                              disabled
                              style={{
                                fontSize: '0.725rem',
                                padding: '0.25rem 0.5rem',
                                opacity: 0.5,
                                cursor: 'not-allowed'
                              }}
                            >
                              <Lock size={12} /> Locked
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close Drawer
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BatchDetailDrawer;
