import React from 'react';
import Modal from '../common/Modal';
import { useCart } from '../../context/CartContext';
import { getStoreInfo } from '../../data/mockData';
import { Printer, CheckCircle, ShieldAlert } from 'lucide-react';

export const ThermalReceiptModal = () => {
  const { activeModal, closeModal, lastCompletedSale, cart, calculations, rxPatient, addToast } = useCart();

  const isOpen = activeModal === 'thermal';
  const store = getStoreInfo();

  // Use last completed sale if available, otherwise construct preview from active cart
  const sale = lastCompletedSale || {
    invoiceNo: 'PREVIEW-RECEIPT',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cashier: 'Hassan (Cashier)',
    patient: rxPatient || { name: 'Walk-in Cash Customer', phone: '-' },
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
            <div style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.5px' }}>{store.name}</div>
            <div style={{ fontSize: '0.7rem', color: '#475569' }}>{store.address}</div>
            <div style={{ fontSize: '0.7rem', color: '#475569' }}>Ph: {store.phone || '-'}</div>
            <div style={{ fontSize: '0.7rem', color: '#475569' }}>DSL: {store.dslNumber || '-'} | NTN: {store.ntnNumber || '-'}</div>
          </div>

          <div style={{ borderTop: '1px dashed #94A3B8', margin: '0.5rem 0' }} />

          {/* Metadata */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
            <span>Inv #: <strong>{sale.invoiceNo}</strong></span>
            <span>{sale.date} {sale.time}</span>
          </div>
          <div style={{ fontSize: '0.725rem' }}>Billed By: {sale.cashier || 'Hassan (Cashier)'}</div>
          {sale.patient && (
            <div style={{ fontSize: '0.725rem', marginTop: '2px' }}>
              Customer: {sale.patient.name} {sale.patient.phone !== '-' ? `(${sale.patient.phone})` : ''}
            </div>
          )}

          <div style={{ borderTop: '1px dashed #94A3B8', margin: '0.5rem 0' }} />

          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', fontWeight: 700, fontSize: '0.725rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '3px' }}>
            <span>Item</span>
            <span style={{ textAlign: 'center' }}>Qty</span>
            <span style={{ textAlign: 'right' }}>Rate</span>
            <span style={{ textAlign: 'right' }}>Amt</span>
          </div>

          {/* Item List */}
          {sale.items && sale.items.length > 0 ? (
            sale.items.map((item, idx) => {
              const qty = Number(item.quantity) || 1;
              const rate = Number(item.unitPrice || item.mrp || 600);
              const total = Number(item.total || (qty * rate));

              return (
                <div key={idx} style={{ padding: '0.35rem 0', borderBottom: '1px dotted #F1F5F9' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.75rem' }}>{item.brandName || item.name}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', fontSize: '0.7rem', color: '#475569' }}>
                    <span>B: {item.batchNumber || '-'}</span>
                    <span style={{ textAlign: 'center' }}>{qty}</span>
                    <span style={{ textAlign: 'right' }}>Rs.{rate.toFixed(2)}</span>
                    <span style={{ textAlign: 'right', fontWeight: 600, color: '#0F172A' }}>
                      Rs.{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#94A3B8' }}>No items in receipt</div>
          )}

          <div style={{ borderTop: '1px dashed #94A3B8', margin: '0.5rem 0' }} />

          {/* Calculations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.725rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Gross Subtotal:</span>
              <span>Rs. {Number(sale.subtotal || calculations.grossSubtotal || 0).toFixed(2)}</span>
            </div>
            {Number(sale.discountAmount || calculations.discountAmount || 0) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D97706' }}>
                <span>Discount:</span>
                <span>-Rs. {Number(sale.discountAmount || calculations.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>Sales Tax (18%):</span>
              <span>+Rs. {Number(calculations.totalSaleTax || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.875rem', color: '#0284C7', borderTop: '1px solid #E2E8F0', paddingTop: '0.3rem', marginTop: '0.2rem' }}>
              <span>NET TOTAL:</span>
              <span>Rs. {Number(sale.grandTotal || calculations.netTotal || 0).toFixed(2)}</span>
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #94A3B8', margin: '0.5rem 0' }} />

          {/* Footer */}
          <div style={{ textAlign: 'center', fontSize: '0.675rem', color: '#64748B' }}>
            <div>Goods once sold can only be returned as per policy.</div>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>Thank you for your business!</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={closeModal}
            className="btn btn-outline"
            style={{ flex: 1 }}
          >
            Close (Esc)
          </button>
          <button
            onClick={handlePrint}
            className="btn btn-primary"
            style={{ flex: 1, backgroundColor: '#0284C7' }}
          >
            <Printer size={16} /> Print Receipt
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ThermalReceiptModal;
