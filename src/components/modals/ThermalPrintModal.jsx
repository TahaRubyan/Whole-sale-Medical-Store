import React from 'react';
import { Printer, X } from 'lucide-react';
import { getStoreInfo } from '../../data/mockData';

export const ThermalPrintModal = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const store = getStoreInfo();

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
          <Printer size={20} color="#0284C7" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>80mm POS Thermal Receipt</h3>
        </div>

        {/* 80mm Receipt Box */}
        <div id="thermal-receipt" style={{ backgroundColor: '#FFF', border: '1px dashed #CBD5E1', padding: '1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: '#000', lineHeight: 1.4 }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1rem' }}>{store.name}</div>
          <div style={{ textAlign: 'center', fontSize: '0.7rem' }}>{store.address} | Ph: {store.phone || '-'}</div>
          <div style={{ textAlign: 'center', fontSize: '0.7rem' }}>DSL: {store.dslNumber || '-'} | NTN: {store.ntnNumber || '-'}</div>
          <hr style={{ borderTop: '1px dashed #000', margin: '0.5rem 0' }} />

          <div>Inv #: <strong>{invoice.invoiceNo}</strong></div>
          <div>Date: {invoice.date} {invoice.time || ''}</div>
          <div>Customer: {invoice.customerName}</div>
          <hr style={{ borderTop: '1px dashed #000', margin: '0.5rem 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', fontWeight: 'bold' }}>
            <span>Item</span>
            <span style={{ textAlign: 'center' }}>Qty</span>
            <span style={{ textAlign: 'right' }}>Total</span>
          </div>

          {invoice.items && invoice.items.map((item, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', marginTop: '0.2rem' }}>
              <span>{item.brandName || item.name}</span>
              <span style={{ textAlign: 'center' }}>{item.quantity}</span>
              <span style={{ textAlign: 'right' }}>Rs. {Number(item.total || (item.quantity * (item.unitPrice || 600))).toFixed(2)}</span>
            </div>
          ))}

          <hr style={{ borderTop: '1px dashed #000', margin: '0.5rem 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span>Rs. {Number(invoice.subtotal || invoice.grossSubtotal || 0).toFixed(2)}</span>
          </div>
          {Number(invoice.discountAmount || invoice.discount || 0) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Discount:</span>
              <span>-Rs. {Number(invoice.discountAmount || invoice.discount).toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            <span>NET TOTAL:</span>
            <span>Rs. {Number(invoice.netTotal || 0).toFixed(2)}</span>
          </div>

          <hr style={{ borderTop: '1px dashed #000', margin: '0.5rem 0' }} />
          <div style={{ textAlign: 'center', fontSize: '0.7rem' }}>Thank you! Wish you good health.</div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Close</button>
          <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 1, backgroundColor: '#0284C7', color: '#FFF', fontWeight: 800 }}>
            <Printer size={16} /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThermalPrintModal;
