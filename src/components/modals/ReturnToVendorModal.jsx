import React, { useState } from 'react';
import { useSupplier } from '../../context/SupplierContext';
import { useInventory } from '../../context/InventoryContext';
import { RotateCcw, X, CheckCircle, Package, AlertTriangle } from 'lucide-react';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';

export const ReturnToVendorModal = ({ isOpen, onClose, initialSupplier, onSuccessPrint }) => {
  const { suppliers, createRtvNote, generateRTVNumber } = useSupplier();
  const { medicines, batches, setBatches } = useInventory();

  const [rtvNumber] = useState(generateRTVNumber());
  const [selectedSupplierId, setSelectedSupplierId] = useState(initialSupplier?.id || '');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [returnedBoxes, setReturnedBoxes] = useState(1);
  const [customRefundAmount, setCustomRefundAmount] = useState('');
  const [reason, setReason] = useState('Near Expiry Stock Return to Distributor');

  if (!isOpen) return null;

  // Selected Supplier
  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId) || initialSupplier || suppliers[0];

  // Filter batches for selected supplier (or all active batches)
  const availableBatches = batches.filter((b) => {
    if (b.status === 'Quarantined' || (b.totalBoxesAvailable <= 0 && b.totalTabletsAvailable <= 0)) return false;
    if (selectedSupplier) {
      const sName = (selectedSupplier.companyName || selectedSupplier.name || '').toLowerCase().trim();
      const bDist = (b.distributorName || '').toLowerCase().trim();
      return bDist.includes(sName) || sName.includes(bDist) || true; // Fallback to all batches
    }
    return true;
  });

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || availableBatches[0];
  const linkedMedicine = selectedBatch ? medicines.find((m) => m.id === selectedBatch.medicineId) : null;

  const maxBoxesAvailable = selectedBatch ? (selectedBatch.totalBoxesAvailable || Math.floor((selectedBatch.totalTabletsAvailable || 0) / (linkedMedicine?.tabletsPerBox || 20))) : 0;
  const suggestedRefund = selectedBatch ? (Number(returnedBoxes) * (Number(selectedBatch.purchasePriceBox) || 480)) : 0;
  const finalRefundAmount = customRefundAmount !== '' ? Number(customRefundAmount) : suggestedRefund;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBatch) return;

    const qty = Number(returnedBoxes) || 1;
    if (qty > maxBoxesAvailable) {
      alert(`Cannot return ${qty} boxes. Only ${maxBoxesAvailable} boxes available in batch stock!`);
      return;
    }

    const brandName = linkedMedicine?.brandName || selectedBatch.medicineName || 'Medicine';
    const genericFormula = linkedMedicine?.genericFormula || '';
    const distName = selectedSupplier?.companyName || selectedSupplier?.name || selectedBatch.distributorName || 'Pharma Distributor';

    // 1. Record RTV Debit Note in SupplierContext (Reduces supplier balance & logs credit)
    const rtvRecord = createRtvNote({
      rtvNumber,
      distributorName: distName,
      supplierId: selectedSupplier?.id || '',
      brandName,
      genericFormula,
      batchNumber: selectedBatch.batchNumber,
      expiryDate: selectedBatch.expiryDate,
      returnedBoxes: qty,
      agreedRefundAmount: finalRefundAmount,
      reason,
    });

    // 2. Deduct returned stock from InventoryContext batch
    setBatches((prevBatches) =>
      prevBatches.map((b) => {
        if (b.id === selectedBatch.id) {
          const newBoxes = Math.max(0, (b.totalBoxesAvailable || 0) - qty);
          const tblsPerBox = linkedMedicine?.tabletsPerBox || 200;
          const newTablets = Math.max(0, (b.totalTabletsAvailable || 0) - (qty * tblsPerBox));
          return {
            ...b,
            totalBoxesAvailable: newBoxes,
            totalTabletsAvailable: newTablets,
            status: newBoxes === 0 ? 'Depleted' : b.status,
          };
        }
        return b;
      })
    );

    onClose();

    // 3. Trigger printable A4 RTV Debit Note Invoice Modal
    if (onSuccessPrint) {
      onSuccessPrint(rtvRecord);
    }
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="card" style={{ width: '680px', maxWidth: '94vw', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '12px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RotateCcw size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Return Near-Expiry Stock to Distributor (RTV Debit Note)
              </h2>
              <p style={{ fontSize: '0.775rem', color: '#64748B', margin: '0.15rem 0 0 0' }}>
                Ref #: <strong style={{ color: '#0284C7' }}>{rtvNumber}</strong> | Deducts inventory & credits supplier ledger balance
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}>
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Target Distributor Selector */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
              Target Pharma Distributor / Supplier *:
            </label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', fontSize: '0.875rem', fontWeight: 800, borderRadius: '6px', border: '1.5px solid #0284C7', backgroundColor: '#FFFFFF' }}
              required
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.companyName || s.name} (License #: {s.licenseNo || 'N/A'}) - [Due Debt: Rs. {Number(s.pendingBalance || 0).toLocaleString('en-PK')}]
                </option>
              ))}
            </select>
          </div>

          {/* Near-Expiry Batch Picker */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
              Select Near-Expiry / Target Inventory Batch *:
            </label>
            <select
              value={selectedBatchId || (availableBatches[0] && availableBatches[0].id)}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', fontSize: '0.875rem', fontWeight: 800, borderRadius: '6px', border: '1.5px solid #0284C7', backgroundColor: '#FFFFFF' }}
              required
            >
              {availableBatches.map((b) => {
                const med = medicines.find((m) => m.id === b.medicineId);
                return (
                  <option key={b.id} value={b.id}>
                    {med?.brandName || 'Medicine'} — Batch: {b.batchNumber} (Exp: {formatDateDDMMYYYY(b.expiryDate)}) | Available: {b.totalBoxesAvailable} Boxes
                  </option>
                );
              })}
            </select>
          </div>

          {/* Batch Details Card */}
          {selectedBatch && (
            <div style={{ backgroundColor: '#FFFBEB', border: '1.5px solid #F59E0B', padding: '0.75rem 1rem', borderRadius: '6px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#B45309', display: 'block' }}>SELECTED MEDICINE:</span>
                <strong style={{ fontSize: '0.9rem', color: '#92400E' }}>{linkedMedicine?.brandName || selectedBatch.medicineName}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#B45309', display: 'block' }}>BATCH & EXPIRY:</span>
                <strong style={{ fontSize: '0.85rem', color: '#92400E' }}>{selectedBatch.batchNumber} ({formatDateDDMMYYYY(selectedBatch.expiryDate)})</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#B45309', display: 'block' }}>STOCK AVAILABLE:</span>
                <strong style={{ fontSize: '0.9rem', color: '#D97706' }}>{maxBoxesAvailable} Boxes</strong>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            {/* Returned Boxes Input */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                Returned Boxes Quantity *:
              </label>
              <input
                type="number"
                min="1"
                max={maxBoxesAvailable || 9999}
                value={returnedBoxes}
                onChange={(e) => setReturnedBoxes(Math.max(1, Number(e.target.value)))}
                style={{ width: '100%', padding: '0.5rem', fontSize: '0.9rem', fontWeight: 900, borderRadius: '6px', border: '1px solid #CBD5E1' }}
                required
              />
            </div>

            {/* Custom Refund Amount Input (User Specified) */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0369A1', display: 'block', marginBottom: '0.25rem' }}>
                Agreed Refund / Credit Amount (Rs.) *:
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={customRefundAmount !== '' ? customRefundAmount : suggestedRefund}
                onChange={(e) => setCustomRefundAmount(e.target.value)}
                placeholder={`Suggested: Rs. ${suggestedRefund.toFixed(2)}`}
                style={{ width: '100%', padding: '0.5rem', fontSize: '0.9rem', fontWeight: 900, color: '#059669', borderRadius: '6px', border: '1.5px solid #059669', backgroundColor: '#ECFDF5' }}
                required
              />
            </div>
          </div>

          {/* Reason for Return */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
              Reason for Return / Debit Note Notes:
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Near Expiry Stock Return to Distributor"
              style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: '6px', border: '1px solid #CBD5E1' }}
            />
          </div>

          {/* Return Summary Bar */}
          <div style={{ backgroundColor: '#FEF2F2', border: '1.5px solid #FCA5A5', padding: '0.75rem 1rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#991B1B' }}>TOTAL RTV DEBIT NOTE CREDIT VALUE:</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#DC2626' }}>
              Rs. {Number(finalRefundAmount).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, backgroundColor: '#DC2626', color: '#FFF', fontWeight: 900, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', border: 'none' }}>
              <CheckCircle size={18} /> [Process RTV & Print Debit Note PDF]
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ReturnToVendorModal;
