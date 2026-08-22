import React, { useState } from 'react';
import { Edit3, X, CheckCircle } from 'lucide-react';

export const CartItemEditModal = ({ item, onSave, onClose }) => {
  if (!item) return null;

  const [quantity, setQuantity] = useState(item.quantity || 1);
  const [unitPrice, setUnitPrice] = useState(item.unitPrice || 600);
  const [discPercent, setDiscPercent] = useState(item.discPercent || 0);
  const [saleTaxPercent, setSaleTaxPercent] = useState(item.saleTaxPercent !== undefined ? item.saleTaxPercent : 18);

  const qtyNum = Number(quantity) || 1;
  const rateNum = Number(unitPrice) || 0;
  const grossAmount = qtyNum * rateNum;
  const discAmt = grossAmount * (Number(discPercent) / 100);
  const discountedGross = grossAmount - discAmt;

  const saleTaxAmt = discountedGross * (Number(saleTaxPercent) / 100);
  const netAmount = discountedGross + saleTaxAmt;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      quantity: qtyNum,
      unitPrice: rateNum,
      discPercent: Number(discPercent),
      discAmount: discAmt,
      gross: grossAmount,
      saleTaxPercent: Number(saleTaxPercent),
      saleTaxAmt: saleTaxAmt,
      total: netAmount
    });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '90%', maxWidth: '520px', padding: '1.5rem', position: 'relative', backgroundColor: '#FFFFFF', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.75rem' }}>
          <Edit3 size={24} color="#0284C7" />
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>
              Edit Line Item Discount & Tax Rates
            </h2>
            <p style={{ fontSize: '0.775rem', color: '#0284C7', fontWeight: 700, margin: '0.1rem 0 0' }}>
              {item.itemCode ? `${item.itemCode} / ` : ''}{item.brandName} ({item.batchNumber})
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Row 1: Quantity & Rate */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.775rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                Box Quantity:
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.9rem', fontWeight: 800, borderRadius: '4px', border: '1px solid #CBD5E1' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.775rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                Rate per Box (Rs.):
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.9rem', fontWeight: 800, borderRadius: '4px', border: '1px solid #CBD5E1' }}
                required
              />
            </div>
          </div>

          {/* Gross Total Preview */}
          <div style={{ backgroundColor: '#F1F5F9', padding: '0.45rem 0.75rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
            <span>Gross Amount:</span>
            <span>Rs. {grossAmount.toFixed(2)}</span>
          </div>

          {/* Discount % */}
          <div>
            <label style={{ fontSize: '0.775rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
              Item Discount %:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={discPercent}
                onChange={(e) => setDiscPercent(e.target.value)}
                style={{ flex: 1, padding: '0.45rem', fontSize: '0.9rem', fontWeight: 800, borderRadius: '4px', border: '1px solid #CBD5E1' }}
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', width: '120px', textAlign: 'right' }}>
                - Rs. {discAmt.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Tax Rates Row: Sale Tax 18% */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
              Sale Tax (FBR 18%):
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="number"
                min="0"
                step="0.1"
                value={saleTaxPercent}
                onChange={(e) => setSaleTaxPercent(e.target.value)}
                style={{ flex: 1, padding: '0.45rem', fontSize: '0.875rem', fontWeight: 700, borderRadius: '4px', border: '1px solid #CBD5E1' }}
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284C7', width: '120px', textAlign: 'right' }}>
                + Rs. {saleTaxAmt.toFixed(2)}
              </span>
            </div>
          </div>

          {/* NET AMOUNT BANNER */}
          <div style={{ backgroundColor: '#0284C7', color: '#FFFFFF', padding: '0.65rem 0.85rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>NET ITEM TOTAL:</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#E0F2FE' }}>Rs. {netAmount.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, backgroundColor: '#0284C7', color: '#FFF', fontWeight: 800 }}>
              <CheckCircle size={16} /> Save Item Updates
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CartItemEditModal;
