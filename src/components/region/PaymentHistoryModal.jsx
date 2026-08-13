import React from 'react';
import { X, History, DollarSign, Calendar, Clock, Store, ShieldCheck } from 'lucide-react';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';

export const PaymentHistoryModal = ({ isOpen, onClose, invoice }) => {
  if (!isOpen || !invoice) return null;

  const logs = invoice.paymentLogs || [];
  const originalNet = Number(invoice.netTotal || invoice.subtotal || 0);
  const currentRemaining = invoice.remainingDebt !== undefined ? Number(invoice.remainingDebt) : originalNet;
  const shopName = invoice.shopName || invoice.customerName || 'Shop Customer';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '95%',
          maxWidth: '720px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.5rem',
          position: 'relative',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '1rem',
            top: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#64748B',
            padding: '0.25rem',
          }}
          title="Close Modal"
        >
          <X size={22} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#E0F2FE',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <History size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Payment History Logs
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
              <Store size={14} />
              <span style={{ fontWeight: 700 }}>{shopName}</span>
              <span>•</span>
              <span>Inv #{invoice.invoiceNo}</span>
              <span>•</span>
              <span>Region: {invoice.region || 'Unassigned'}</span>
            </div>
          </div>
        </div>

        {/* Invoice Debt Summary Banner */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '0.75rem',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 600 }}>Total Invoice Net</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
              Rs. {originalNet.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 600 }}>Current Remaining Due</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: currentRemaining > 0 ? '#DC2626' : '#059669' }}>
              Rs. {currentRemaining.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 600 }}>Payment Status</div>
            <div style={{ marginTop: '0.2rem' }}>
              <span
                style={{
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  display: 'inline-block',
                  backgroundColor:
                    invoice.paymentStatus === 'PAID' || currentRemaining === 0
                      ? '#D1FAE5'
                      : invoice.paymentStatus === 'PARTIAL DEBT' || invoice.paymentStatus === 'PARTIAL_CREDIT'
                      ? '#FEF3C7'
                      : '#FEE2E2',
                  color:
                    invoice.paymentStatus === 'PAID' || currentRemaining === 0
                      ? '#065F46'
                      : invoice.paymentStatus === 'PARTIAL DEBT' || invoice.paymentStatus === 'PARTIAL_CREDIT'
                      ? '#B45309'
                      : '#991B1B',
                }}
              >
                {currentRemaining === 0 ? 'PAID' : (invoice.paymentStatus || 'UNPAID_CREDIT')}
              </span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 600 }}>Delivery Personnel</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#334155' }}>
              {invoice.deliveryMan || 'Unassigned'}
            </div>
          </div>
        </div>

        {/* Payment History Log Table */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem' }}>
            Real-Time Timestamped Audit Trail
          </h3>

          {logs.length > 0 ? (
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #CBD5E1', color: '#475569' }}>
                    <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>#</th>
                    <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>Date & Time</th>
                    <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700, textAlign: 'right' }}>Amount Paid (Rs.)</th>
                    <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700, textAlign: 'right' }}>Remaining Due (Rs.)</th>
                    <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>Mode / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: idx < logs.length - 1 ? '1px solid #F1F5F9' : 'none',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                      }}
                    >
                      <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#64748B' }}>{idx + 1}</td>
                      <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={13} color="#0284C7" />
                          <span>{formatDateDDMMYYYY(log.date || new Date())}</span>
                        </div>
                        <div style={{ fontSize: '0.725rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
                          <Clock size={12} />
                          <span>{log.time || 'N/A'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                        + Rs. {Number(log.amountPaid || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 800, color: log.remainingDebtAfter > 0 ? '#DC2626' : '#059669' }}>
                        Rs. {Number(log.remainingDebtAfter !== undefined ? log.remainingDebtAfter : 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', color: '#475569', fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: 700, color: '#0284C7', marginRight: '0.35rem' }}>
                          [{log.paymentMode || 'Cash'}]
                        </span>
                        {log.note || 'Settlement'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                backgroundColor: '#F8FAFC',
                border: '1px dashed #CBD5E1',
                borderRadius: '8px',
                color: '#64748B',
              }}
            >
              <DollarSign size={32} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }} />
              <p style={{ margin: 0, fontWeight: 600 }}>No payment logs recorded yet for this invoice.</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.775rem' }}>
                Use the "Settle Cash" input on the Region Ledger table to record collection entries.
              </p>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: '0.5rem 1.25rem', fontWeight: 700 }}
          >
            Close Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryModal;
