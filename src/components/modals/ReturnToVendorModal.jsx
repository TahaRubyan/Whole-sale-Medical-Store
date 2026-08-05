import React, { useState } from 'react';
import { useSupplier } from '../../context/SupplierContext';
import { useInventory } from '../../context/InventoryContext';
import { RotateCcw, Plus, Trash2, X, CheckCircle, AlertTriangle } from 'lucide-react';

export const ReturnToVendorModal = ({ isOpen, supplier, onClose }) => {
  const { createReturnToVendor, generateRTVNumber } = useSupplier();
  const { medicines, batches } = useInventory();

  const [rtvNumber] = useState(generateRTVNumber());
  const [date] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('Damaged / Near Expiry Return');
  const [items, setItems] = useState([]);
  
  const [selectedMedicineId, setSelectedMedicineId] = useState(medicines[0]?.id || '');
  const [selectedBatchNumber, setSelectedBatchNumber] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [message, setMessage] = useState(null);

  if (!isOpen || !supplier) return null;

  const currentMedicineBatches = batches.filter((b) => b.medicineId === selectedMedicineId && b.totalTabletsAvailable > 0);

  const handleAddItem = () => {
    if (!selectedBatchNumber) {
      setMessage({ type: 'error', text: 'Please select an active batch to return' });
      return;
    }
    const med = medicines.find((m) => m.id === selectedMedicineId);
    const bat = batches.find((b) => b.medicineId === selectedMedicineId && b.batchNumber === selectedBatchNumber);

    const qty = Number(quantity);
    const unitPrice = bat ? bat.boxPrice : 500;

    const newItem = {
      id: Date.now(),
      medicineId: selectedMedicineId,
      brandName: med ? med.brandName : 'Medicine',
      batchNumber: selectedBatchNumber,
      expiryDate: bat ? bat.expiryDate : '2028-12-31',
      quantity: qty,
      unitPrice,
      totalAmount: qty * unitPrice,
    };

    setItems([...items, newItem]);
    setMessage(null);
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const totalDeduction = items.reduce((sum, i) => sum + i.totalAmount, 0);

  const handleSubmitRTV = (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setMessage({ type: 'error', text: 'An RTV Note must have at least 1 item to return' });
      return;
    }

    createReturnToVendor({
      rtvNumber,
      supplierId: supplier.id,
      supplierName: supplier.companyName,
      date,
      reason,
      items,
      totalDeduction,
    });

    setMessage({
      type: 'success',
      text: `RTV Debit Note ${rtvNumber} generated! Amount logged to Vendor Refund Ledger.`
    });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '92%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', position: 'relative', backgroundColor: '#FFFFFF', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <RotateCcw size={24} color="#EF4444" />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>
              Return to Vendor (RTV) Debit Note Generator
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Distributor: <strong>{supplier.companyName}</strong> | RTV Note #: <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#EF4444' }}>{rtvNumber}</span>
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

        <form onSubmit={handleSubmitRTV} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Reason for Return:</label>
            <input
              type="text"
              placeholder="e.g. Near Expiry Stock / Damaged Box Dispatched"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontWeight: 700 }}
              required
            />
          </div>

          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '0.85rem', borderRadius: '6px', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block' }}>Select Medicine:</label>
              <select
                value={selectedMedicineId}
                onChange={(e) => {
                  setSelectedMedicineId(e.target.value);
                  setSelectedBatchNumber('');
                }}
                style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontWeight: 700 }}
              >
                {medicines.map((m) => (
                  <option key={m.id} value={m.id}>{m.brandName}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block' }}>Select Batch #:</label>
              <select
                value={selectedBatchNumber}
                onChange={(e) => setSelectedBatchNumber(e.target.value)}
                style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontWeight: 700 }}
              >
                <option value="">-- Choose Batch --</option>
                {currentMedicineBatches.map((b) => (
                  <option key={b.id} value={b.batchNumber}>{b.batchNumber} (Exp: {b.expiryDate})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block' }}>Return Qty (Boxes):</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontWeight: 800 }}
              />
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="btn btn-primary"
              style={{ padding: '0.45rem 0.85rem', backgroundColor: '#EF4444', color: '#FFF', fontWeight: 800 }}
            >
              <Plus size={14} /> Add Return Line
            </button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Sr.</th>
                  <th>Item Name</th>
                  <th>Batch #</th>
                  <th>Expiry Date</th>
                  <th style={{ textAlign: 'center' }}>Qty (Boxes)</th>
                  <th style={{ textAlign: 'right' }}>Box Rate</th>
                  <th style={{ textAlign: 'right' }}>Deduction Total</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 800 }}>{item.brandName}</td>
                    <td style={{ fontFamily: 'monospace' }}>{item.batchNumber}</td>
                    <td>{item.expiryDate}</td>
                    <td style={{ textAlign: 'center', fontWeight: 800 }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>Rs. {Number(item.unitPrice).toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#EF4444' }}>
                      Rs. {Number(item.totalAmount).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #E2E8F0', paddingTop: '0.85rem' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1F2937' }}>
              Total RTV Deduction Amount: <span style={{ color: '#EF4444' }}>Rs. {totalDeduction.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.5rem', fontWeight: 900, backgroundColor: '#EF4444', color: '#FFF' }}
            >
              [Generate & Log RTV Debit Note]
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnToVendorModal;
