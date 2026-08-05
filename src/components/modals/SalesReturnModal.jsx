import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { useInventory } from '../../context/InventoryContext';
import { RotateCcw, Search, CheckCircle, X } from 'lucide-react';

export const SalesReturnModal = ({ onClose }) => {
  const { invoices, recordReturn } = useSales();
  const { restoreStock } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [refundMethod, setRefundMethod] = useState('Cash');
  const [returnSuccess, setReturnSuccess] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const q = searchQuery.trim().toLowerCase();
    const found = invoices.find(
      (inv) => inv.invoiceNo.toLowerCase() === q || (inv.customerPhone && inv.customerPhone.toLowerCase() === q)
    );

    if (found) {
      setSelectedInvoice(found);
      // Initialize return quantities to 0
      setReturnItems(
        found.items.map((item) => ({
          ...item,
          returnQty: 0,
        }))
      );
    } else {
      alert('No invoice found matching invoice number or customer phone.');
      setSelectedInvoice(null);
    }
  };

  const updateReturnQty = (batchNumber, qty) => {
    setReturnItems((prev) =>
      prev.map((item) => {
        if (item.batchNumber === batchNumber) {
          const maxAllowed = item.quantity;
          return { ...item, returnQty: Math.min(maxAllowed, Math.max(0, Number(qty) || 0)) };
        }
        return item;
      })
    );
  };

  // Calculate Total Refund
  const totalRefund = returnItems.reduce((sum, item) => sum + (item.unitPrice * item.returnQty), 0);

  const handleConfirmReturn = () => {
    const itemsToReturn = returnItems.filter((item) => item.returnQty > 0);

    if (itemsToReturn.length === 0) {
      alert('Please select at least 1 item quantity to return.');
      return;
    }

    const returnRecord = {
      returnNo: `RET-${Date.now().toString().slice(-6)}`,
      originalInvoiceNo: selectedInvoice.invoiceNo,
      date: '2026-08-01',
      customerName: selectedInvoice.customerName,
      customerPhone: selectedInvoice.customerPhone,
      returnedItems: itemsToReturn.map((item) => ({
        medicineId: item.medicineId,
        brandName: item.brandName,
        batchNumber: item.batchNumber,
        unitSelection: item.unitSelection || 'Tablet',
        quantity: item.returnQty,
        unitPrice: item.unitPrice,
        totalRefund: item.unitPrice * item.returnQty,
      })),
      totalRefund,
      refundMethod,
    };

    // 1. Restore Stock in inventory
    restoreStock(itemsToReturn.map((item) => ({
      batchNumber: item.batchNumber,
      unitSelection: item.unitSelection || 'Tablet',
      quantity: item.returnQty,
      tabletsPerBox: item.tabletsPerBox || 1,
    })));

    // 2. Record Return in SalesContext
    recordReturn(returnRecord);

    setReturnSuccess(true);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '90%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <RotateCcw size={22} color="#EF4444" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Sales Return & Item Exchange</h2>
        </div>

        {returnSuccess ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle size={48} color="#10B981" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10B981' }}>Sales Return Processed Successfully!</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
              Returned items have been restored to inventory stock and Rs. {totalRefund.toFixed(2)} refunded to customer.
            </p>
            <button onClick={onClose} className="btn btn-primary" style={{ marginTop: '1.5rem', fontWeight: 700 }}>
              Close
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Search Invoice */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Enter Invoice No (e.g. INV-20260801-001) or Customer Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
              />
              <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                <Search size={16} /> Search Invoice
              </button>
            </form>

            {/* Invoice Items & Return Selection */}
            {selectedInvoice && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Invoice: <strong>{selectedInvoice.invoiceNo}</strong> ({selectedInvoice.date})</span>
                  <span>Customer: <strong>{selectedInvoice.customerName}</strong></span>
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '0.25rem' }}>Select Items & Quantities to Return:</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {returnItems.map((item) => (
                    <div key={item.batchNumber} style={{ border: '1px solid #E2E8F0', padding: '0.75rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>{item.brandName}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          Batch: {item.batchNumber} | Billed Qty: {item.quantity} | Unit Price: Rs. {item.unitPrice}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Return Qty:</span>
                        <input
                          type="number"
                          min="0"
                          max={item.quantity}
                          value={item.returnQty}
                          onChange={(e) => updateReturnQty(item.batchNumber, e.target.value)}
                          style={{ width: '60px', padding: '0.3rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, borderRadius: '4px', border: '1px solid #CBD5E1' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Refund Total Summary */}
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#FEE2E2', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#991B1B' }}>Total Customer Refund:</span>
                  <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#EF4444' }}>Rs. {totalRefund.toFixed(2)}</span>
                </div>

                {/* Confirm Action Button */}
                <button
                  onClick={handleConfirmReturn}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', fontWeight: 800, backgroundColor: '#10B981', color: '#FFFFFF', marginTop: '0.5rem' }}
                >
                  <CheckCircle size={18} /> [Save & Confirm Return]
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReturnModal;
