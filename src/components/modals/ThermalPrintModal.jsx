import React from 'react';
import { Printer, X } from 'lucide-react';

export const ThermalPrintModal = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '90%', maxWidth: '400px', padding: '1.25rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Printer size={20} color="#10B981" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>80mm Customer Thermal Receipt</h3>
        </div>

        {/* 80mm Receipt Box */}
        <div id="thermal-receipt" style={{ backgroundColor: '#FFF', border: '1px dashed #CBD5E1', padding: '1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: '#000', lineHeight: 1.4 }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1rem' }}>PHARMALINK MEDICAL STORE</div>
          <div style={{ textAlign: 'center', fontSize: '0.7rem' }}>F-7 Markaz, Islamabad | Ph: 051-2345678</div>
          <div style={{ textAlign: 'center', fontSize: '0.7rem' }}>Form 20/21 DL: PK-DL-20-45812</div>
          <hr style={{ borderTop: '1px dashed #000', margin: '0.5rem 0' }} />

          <div>Inv #: <strong>{invoice.invoiceNo}</strong></div>
          <div>Date: {invoice.date} {invoice.time}</div>
          <div>Customer: {invoice.customerName}</div>
          {invoice.doctorName && invoice.doctorName !== '-' && <div>Dr: {invoice.doctorName}</div>}
          <hr style={{ borderTop: '1px dashed #000', margin: '0.5rem 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', fontWeight: 'bold' }}>
            <span>Item</span>
            <span style={{ textAlign: 'center' }}>Qty</span>
            <span style={{ textAlign: 'right' }}>Total</span>
          </div>

          {invoice.items.map((item, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', marginTop: '0.2rem' }}>
              <span>{item.brandName}</span>
              <span style={{ textAlign: 'center' }}>{item.quantity} {item.unitSelection || 'Tab'}</span>
              <span style={{ textAlign: 'right' }}>Rs. {item.total.toFixed(2)}</span>
            </div>
          ))}

          <hr style={{ borderTop: '1px dashed #000', margin: '0.5rem 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span>Rs. {invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Discount:</span>
              <span>-Rs. {invoice.discount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            <span>NET TOTAL:</span>
            <span>Rs. {invoice.netTotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
            <span>Cash Tendered:</span>
            <span>Rs. {invoice.tendered.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
            <span>Change Return:</span>
            <span>Rs. {invoice.change.toFixed(2)}</span>
          </div>

          <hr style={{ borderTop: '1px dashed #000', margin: '0.5rem 0' }} />
          <div style={{ textAlign: 'center', fontSize: '0.7rem' }}>Thank you! Wish you good health.</div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Close</button>
          <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 1, backgroundColor: '#10B981', color: '#FFF', fontWeight: 800 }}>
            <Printer size={16} /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThermalPrintModal;
