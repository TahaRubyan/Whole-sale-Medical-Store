import React from 'react';
import { FileText, X, Printer, CheckCircle, Store, MapPin } from 'lucide-react';
import { STORE_INFO } from '../../data/mockData';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';

export const CustomerLedgerStatementModal = ({ isOpen, onClose, customerName, region, invoices }) => {
  if (!isOpen || !invoices) return null;

  const customerInvoices = invoices.filter((inv) => {
    const nameMatch = (inv.shopName || inv.customerName || '').toLowerCase() === (customerName || '').toLowerCase();
    return nameMatch;
  });

  const totalBilled = customerInvoices.reduce((sum, inv) => sum + Number(inv.netTotal || inv.subtotal || 0), 0);
  const totalRemainingDebt = customerInvoices.reduce((sum, inv) => sum + (inv.remainingDebt !== undefined ? Number(inv.remainingDebt) : Number(inv.netTotal || 0)), 0);
  const totalCashPaid = totalBilled - totalRemainingDebt;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #ledger-statement-print, #ledger-statement-print * {
            visibility: visible !important;
          }
          #ledger-statement-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="card" style={{ width: '820px', maxWidth: '95vw', maxHeight: '92vh', overflowY: 'auto', padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        
        {/* Modal Top Bar */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={22} color="#0284C7" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              Customer Shop Ledger & Invoice Statement
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              className="btn btn-primary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 800, backgroundColor: '#0284C7', color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
            >
              <Printer size={16} /> Print / Export A4 Statement PDF
            </button>
            <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}>
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Printable A4 Statement Container */}
        <div id="ledger-statement-print" style={{ padding: '1rem', backgroundColor: '#FFFFFF' }}>
          
          {/* Header Branding */}
          <div style={{ borderBottom: '2px solid #000', paddingBottom: '0.85rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0284C7', margin: 0, textTransform: 'uppercase' }}>
                {STORE_INFO.name}
              </h1>
              <div style={{ fontSize: '0.825rem', color: '#475569', fontWeight: 600, marginTop: '0.2rem' }}>
                {STORE_INFO.address} | DSL #: {STORE_INFO.dslNumber} | Phone: {STORE_INFO.phone}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', border: '2px solid #0F172A', padding: '0.35rem 0.85rem', borderRadius: '4px' }}>
                STATEMENT OF ACCOUNT
              </div>
              <div style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '0.3rem' }}>
                Date Generated: {formatDateDDMMYYYY(new Date())}
              </div>
            </div>
          </div>

          {/* Customer Metadata Card */}
          <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #E2E8F0', padding: '0.85rem 1rem', borderRadius: '6px', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Customer / Shop Name:</span>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0F172A' }}>{customerName}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Region / Territory:</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0284C7' }}>📍 {region || 'General Region'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Account Status:</span>
              <div>
                {totalRemainingDebt > 0 ? (
                  <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 900, fontSize: '0.75rem' }}>
                    🔴 OUTSTANDING DEBT (Rs. {totalRemainingDebt.toFixed(2)})
                  </span>
                ) : (
                  <span style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 900, fontSize: '0.75rem' }}>
                    🟢 ALL DEBT SETTLED (PAID)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Financial Summary KPI Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
            <div style={{ border: '1px solid #CBD5E1', padding: '0.65rem 0.85rem', borderRadius: '6px', backgroundColor: '#F0F9FF' }}>
              <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#0369A1' }}>Total Gross Billed:</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0369A1' }}>Rs. {totalBilled.toFixed(2)}</div>
            </div>
            <div style={{ border: '1px solid #6EE7B7', padding: '0.65rem 0.85rem', borderRadius: '6px', backgroundColor: '#ECFDF5' }}>
              <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#065F46' }}>Total Cash Received / Settled:</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#059669' }}>Rs. {totalCashPaid.toFixed(2)}</div>
            </div>
            <div style={{ border: '1px solid #FCA5A5', padding: '0.65rem 0.85rem', borderRadius: '6px', backgroundColor: '#FEF2F2' }}>
              <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#991B1B' }}>Remaining Balance Due:</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#DC2626' }}>Rs. {totalRemainingDebt.toFixed(2)}</div>
            </div>
          </div>

          {/* Detailed Invoices & Payment Logs Table */}
          <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.5rem' }}>
            Itemized Invoices & Payment History
          </h3>

          <div className="table-container">
            <table className="table" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC' }}>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Delivery Man</th>
                  <th style={{ textAlign: 'right' }}>Invoice Net (Rs.)</th>
                  <th style={{ textAlign: 'right' }}>Cash Settled (Rs.)</th>
                  <th style={{ textAlign: 'right' }}>Due Debt (Rs.)</th>
                  <th style={{ textAlign: 'center' }}>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {customerInvoices.length > 0 ? (
                  customerInvoices.map((inv) => {
                    const origNet = Number(inv.netTotal || inv.subtotal || 0);
                    const remaining = inv.remainingDebt !== undefined ? Number(inv.remainingDebt) : origNet;
                    const paid = origNet - remaining;

                    return (
                      <tr key={inv.invoiceNo}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0284C7' }}>{inv.invoiceNo}</td>
                        <td style={{ fontWeight: 700 }}>{formatDateDDMMYYYY(inv.date)}</td>
                        <td>{inv.deliveryMan || 'Awais Ijaz'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 800 }}>Rs. {origNet.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#059669' }}>Rs. {paid.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 900, color: remaining > 0 ? '#DC2626' : '#059669' }}>
                          Rs. {remaining.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {remaining <= 0 ? (
                            <span style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.725rem' }}>
                              🟢 FULLY PAID
                            </span>
                          ) : paid > 0 ? (
                            <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.725rem' }}>
                              🟡 PARTIAL PAID
                            </span>
                          ) : (
                            <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.725rem' }}>
                              🔴 NOT PAID
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '1.5rem', color: '#64748B' }}>
                      No invoices recorded for this shop.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Signature Notice */}
          <div style={{ marginTop: '2rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.75rem', color: '#64748B' }}>
            <div>
              This is a computer-generated statement of account for {customerName}.
            </div>
            <div style={{ borderTop: '1px solid #000', width: '180px', textAlign: 'center', paddingTop: '0.25rem', fontWeight: 800, color: '#000' }}>
              Authorized Signatory
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CustomerLedgerStatementModal;
