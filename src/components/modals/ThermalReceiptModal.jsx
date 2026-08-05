import React from 'react';
import Modal from '../common/Modal';
import { useCart } from '../../context/CartContext';
import { STORE_INFO } from '../../data/mockData';
import { Printer, CheckCircle, ShieldAlert } from 'lucide-react';

export const ThermalReceiptModal = () => {
  const { activeModal, closeModal, lastCompletedSale, cart, calculations, rxPatient, addToast } = useCart();

  const isOpen = activeModal === 'thermal';

  // Use last completed sale if available, otherwise construct preview from active cart
  const sale = lastCompletedSale || {
    invoiceNo: 'PREVIEW-RECEIPT',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cashier: 'Dr. Vikrant Sharma',
    patient: rxPatient || { name: 'Walk-in Cash Patient', phone: '-' },
    items: cart,
    subtotal: calculations.subtotal,
    discountAmount: calculations.discountAmount,
    taxableAmount: calculations.taxableAmount,
    gstTotal: calculations.gstTotal,
    grandTotal: calculations.grandTotal,
    paymentMode: 'Cash',
    cashTendered: 0,
    changeDue: 0
  };

  const handlePrint = () => {
    addToast('Printing', 'Thermal receipt sent to 80mm POS Printer spooler.', 'success');
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="80mm POS Thermal Receipt Preview (F9)"
      subtitle="Standard thermal receipt layout for instant POS printing"
      icon={Printer}
      maxWidth="420px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Printable 80mm Receipt Container */}
        <div
          id="printable-thermal-receipt"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px dashed #CBD5E1',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.775rem',
            lineHeight: 1.4,
            color: '#0F172A',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.5px' }}>{STORE_INFO.name}</div>
            <div style={{ fontSize: '0.7rem', color: '#475569' }}>{STORE_INFO.address}</div>
            <div style={{ fontSize: '0.7rem', color: '#475569' }}>Ph: {STORE_INFO.phone}</div>
            <div style={{ fontSize: '0.7rem', color: '#475569' }}>DL: {STORE_INFO.dlNumber}</div>
            <div style={{ fontSize: '0.7rem', color: '#475569' }}>GSTIN: {STORE_INFO.gstin}</div>
          </div>

          <div style={{ borderTop: '1px dashed #94A3B8', margin: '0.5rem 0' }} />

          {/* Metadata */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
            <span>Inv #: <strong>{sale.invoiceNo}</strong></span>
            <span>{sale.date} {sale.time}</span>
          </div>
          <div style={{ fontSize: '0.725rem' }}>Cashier: {sale.cashier || 'Dr. Vikrant Sharma'}</div>
          {sale.patient && (
            <div style={{ fontSize: '0.725rem', marginTop: '2px' }}>
              Patient: {sale.patient.name} {sale.patient.phone !== '-' ? `(${sale.patient.phone})` : ''}
              {sale.patient.doctorName && sale.patient.doctorName !== '-' && (
                <div>Dr: {sale.patient.doctorName}</div>
              )}
            </div>
          )}

          <div style={{ borderTop: '1px dashed #94A3B8', margin: '0.5rem 0' }} />

          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', fontWeight: 700, fontSize: '0.725rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '3px' }}>
            <span>Item</span>
            <span style={{ textAlign: 'center' }}>Qty</span>
            <span style={{ textAlign: 'right' }}>MRP</span>
            <span style={{ textAlign: 'right' }}>Amt</span>
          </div>

          {/* Item List */}
          {sale.items && sale.items.length > 0 ? (
            sale.items.map((item, idx) => (
              <div key={idx} style={{ padding: '0.35rem 0', borderBottom: '1px dotted #F1F5F9' }}>
                <div style={{ fontWeight: 600, fontSize: '0.75rem' }}>{item.name}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', fontSize: '0.7rem', color: '#475569' }}>
                  <span>B: {item.batchNumber}</span>
                  <span style={{ textAlign: 'center' }}>{item.quantity}</span>
                  <span style={{ textAlign: 'right' }}>₹{Number(item.mrp).toFixed(2)}</span>
                  <span style={{ textAlign: 'right', fontWeight: 600, color: '#0F172A' }}>
                    ₹{(item.mrp * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#94A3B8' }}>No items in receipt</div>
          )}

          <div style={{ borderTop: '1px dashed #94A3B8', margin: '0.5rem 0' }} />

          {/* Calculations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.725rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span>₹{Number(sale.subtotal || 0).toFixed(2)}</span>
            </div>
            {sale.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D97706' }}>
                <span>Discount:</span>
                <span>-₹{Number(sale.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>Taxable Base:</span>
              <span>₹{Number(sale.taxableAmount || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>CGST (6%) + SGST (6%):</span>
              <span>₹{Number(sale.gstTotal || 0).toFixed(2)}</span>
            </div>
            <div style={{ borderTop: '1px dashed #94A3B8', paddingTop: '0.35rem', marginTop: '0.2rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.875rem' }}>
              <span>NET GRAND TOTAL:</span>
              <span>₹{Number(sale.grandTotal || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginTop: '0.2rem', color: '#475569' }}>
              <span>Payment Mode:</span>
              <span style={{ fontWeight: 700 }}>{sale.paymentMode || 'Cash'}</span>
            </div>
            {sale.cashTendered > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#475569' }}>
                  <span>Cash Tendered:</span>
                  <span>₹{Number(sale.cashTendered).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>
                  <span>Change Returned:</span>
                  <span>₹{Number(sale.changeDue).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          <div style={{ borderTop: '1px dashed #94A3B8', margin: '0.5rem 0' }} />

          {/* Barcode & Footer Notice */}
          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '3px', fontWeight: 700, margin: '0.25rem 0' }}>
              ||||||| | ||||| || |||||||
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748B' }}>{sale.invoiceNo}</div>
            <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '0.35rem', fontStyle: 'italic' }}>
              Thank you for choosing PharmaLink! Wish you good health.
            </div>
            {sale.items && sale.items.some((i) => i.isScheduleH) && (
              <div style={{ fontSize: '0.65rem', color: '#991B1B', marginTop: '0.25rem', fontWeight: 700 }}>
                *** Schedule H drugs dispensed under prescription ***
              </div>
            )}
          </div>
        </div>

        {/* Modal Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button type="button" className="btn btn-outline" onClick={closeModal}>
            Close (Esc)
          </button>
          <button type="button" className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Print Receipt
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ThermalReceiptModal;
