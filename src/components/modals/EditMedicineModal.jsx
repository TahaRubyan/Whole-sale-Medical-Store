import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Edit3, X, CheckCircle, AlertTriangle } from 'lucide-react';

export const EditMedicineModal = ({ medicine, onClose }) => {
  const { updateMedicineDetails } = useInventory();

  const [purchasePrice, setPurchasePrice] = useState(
    medicine ? medicine.purchasePriceBox || medicine.boxPrice * 0.8 || 480 : ''
  );
  const [sellingPrice, setSellingPrice] = useState(
    medicine ? medicine.boxPrice || 600 : ''
  );
  const [message, setMessage] = useState(null);

  if (!medicine) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const purchaseNum = Number(purchasePrice);
    const sellingNum = Number(sellingPrice);

    if (isNaN(purchaseNum) || purchaseNum < 0 || isNaN(sellingNum) || sellingNum < 0) {
      setMessage({ type: 'error', text: 'Negative or invalid price values are strictly not allowed.' });
      return;
    }

    updateMedicineDetails(medicine.id, {
      purchasePriceBox: purchaseNum,
      boxPrice: sellingNum,
    });

    setMessage({
      type: 'success',
      text: `Updated prices for ${medicine.brandName}! Purchase Price: Rs. ${purchaseNum}, Selling Price: Rs. ${sellingNum}`
    });

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '90%', maxWidth: '450px', padding: '1.5rem', position: 'relative', backgroundColor: '#FFFFFF', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Edit3 size={22} color="#0284C7" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>
            Edit Wholesale Box Prices
          </h2>
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

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
              Item Code & Trade Name:
            </label>
            <input
              type="text"
              value={`${medicine.id} — ${medicine.brandName}`}
              disabled
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: '#F1F5F9', fontWeight: 800, color: '#0284C7' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
              Wholesale Purchase Price Box (Rs.):
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 480.00"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontWeight: 800, fontSize: '0.95rem' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
              Wholesale Selling Box Price (Rs.):
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 600.00"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontWeight: 800, fontSize: '0.95rem' }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontWeight: 900, backgroundColor: '#0284C7', color: '#FFF', marginTop: '0.5rem' }}
          >
            [Save Box Price Updates]
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditMedicineModal;
