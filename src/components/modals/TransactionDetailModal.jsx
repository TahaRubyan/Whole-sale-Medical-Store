import React from 'react';
import Modal from '../common/Modal';
import { useCart } from '../../context/CartContext';
import { STORE_INFO } from '../../data/mockData';
import { Receipt, Printer, FileText, CheckCircle, User, Calendar, CreditCard, ShieldCheck } from 'lucide-react';

export const TransactionDetailModal = ({
  isOpen = false,
  onClose,
  transaction = null
}) => {
  const { setLastCompletedSale, openModal, addToast } = useCart();

  if (!isOpen || !transaction) return null;

  const handlePrintThermal = () => {
    setLastCompletedSale(transaction);
    openModal('thermal');
    if (addToast) addToast('Thermal Print Preview', `Loaded ${transaction.invoiceNo} into 80mm printer spooler`, 'info');
  };

  const handlePrintA4 = () => {
    setLastCompletedSale(transaction);
    openModal('a4');
    if (addToast) addToast('A4 Tax Invoice Preview', `Loaded ${transaction.invoiceNo} into A4 printer spooler`, 'info');
  };

  const patientName = transaction.patient?.name || 'Walk-in Cash Patient';
  const patientPhone = transaction.patient?.phone || '-';
  const doctorName = transaction.patient?.doctorName || '-';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Transaction Breakdown — #${transaction.invoiceNo || transaction.id}`}
      subtitle={`Detailed line-by-line itemized receipt & tax breakdown`}
      icon={Receipt}
      maxWidth="680px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Header Metadata Grid */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-hover)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            fontSize: '0.825rem'
          }}
        >
          <div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>INVOICE NUMBER</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
              {transaction.invoiceNo || transaction.id}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>DATE & TIME</div>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={14} color="var(--color-primary)" />
              {transaction.date} {transaction.time || ''}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>PATIENT / CUSTOMER</div>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <User size={14} color="var(--color-text-muted)" />
              {patientName} {patientPhone !== '-' ? `(${patientPhone})` : ''}
            </div>
            {doctorName && doctorName !== '-' && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Dr: {doctorName}
              </div>
            )}
          </div>

          <div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>CASHIER & PAYMENT MODE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
              <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                <CreditCard size={12} style={{ marginRight: '3px' }} /> {transaction.paymentMode || 'Cash'}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                {transaction.cashier || 'Dr. Vikrant Sharma'}
              </span>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Itemized Products & FEFO Batches</h4>
          <div className="table-container" style={{ maxHeight: '240px', overflowY: 'auto' }}>
            <table className="table" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>FEFO Batch</th>
                  <th>Exp Date</th>
                  <th>MRP</th>
                  <th>Qty</th>
                  <th>GST %</th>
                  <th style={{ textAlign: 'right' }}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {transaction.items && transaction.items.length > 0 ? (
                  transaction.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>
                        {item.name}
                        {item.isScheduleH && (
                          <span className="badge badge-danger" style={{ fontSize: '0.65rem', marginLeft: '0.35rem', padding: '0.1rem 0.35rem' }}>
                            Sch H
                          </span>
                        )}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{item.batchNumber}</td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{item.expiryDate}</td>
                      <td>₹{Number(item.mrp).toFixed(2)}</td>
                      <td style={{ fontWeight: 700 }}>{item.quantity}</td>
                      <td>{item.gstPercentage || 12}%</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        ₹{((item.salePrice || item.mrp) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No items found in transaction
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial & GST Summary Box */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            fontSize: '0.8rem'
          }}
        >
          {/* Tax Breakdown Left */}
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.4rem', fontSize: '0.75rem' }}>
              GST TAX BREAKDOWN
            </div>
            {transaction.gstBreakdown ? (
              Object.entries(transaction.gstBreakdown).map(([rate, data]) => (
                <div key={rate} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0', borderBottom: '1px dotted #E2E8F0', fontSize: '0.75rem' }}>
                  <span>GST Rate {rate}:</span>
                  <span>CGST ₹{(data.cgst || 0).toFixed(2)} + SGST ₹{(data.sgst || 0).toFixed(2)}</span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>GST included in total</div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: '0.4rem', paddingTop: '0.3rem', borderTop: '1px solid #CBD5E1', fontSize: '0.775rem' }}>
              <span>Total GST Collected:</span>
              <span>₹{Number(transaction.gstTotal || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Totals Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Subtotal MRP:</span>
              <span>₹{Number(transaction.subtotal || 0).toFixed(2)}</span>
            </div>
            {transaction.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D97706' }}>
                <span>Discount Allowed:</span>
                <span>-₹{Number(transaction.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Taxable Net Base:</span>
              <span>₹{Number(transaction.taxableAmount || 0).toFixed(2)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justify: 'space-between',
                fontWeight: 800,
                fontSize: '1rem',
                color: 'var(--color-primary)',
                paddingTop: '0.4rem',
                borderTop: '1px dashed var(--color-border)',
                marginTop: '0.2rem'
              }}
            >
              <span>GRAND TOTAL:</span>
              <span>₹{Number(transaction.grandTotal || 0).toFixed(2)}</span>
            </div>
            {transaction.cashTendered > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                <span>Tendered / Change:</span>
                <span>₹{Number(transaction.cashTendered).toFixed(2)} / ₹{Number(transaction.changeDue || 0).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions / Print Triggers */}
        <div
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            paddingTop: '1rem',
            borderTop: '1px solid var(--color-border)'
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handlePrintThermal}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            >
              <Printer size={15} /> Thermal Receipt (F9)
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handlePrintA4}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            >
              <FileText size={15} /> A4 Tax Invoice (F10)
            </button>
          </div>

          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close Receipt
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TransactionDetailModal;
