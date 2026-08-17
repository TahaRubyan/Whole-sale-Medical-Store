import React from 'react';
import { FileText, X, Printer } from 'lucide-react';
import { getStoreInfo } from '../../data/mockData';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';
import { printElementById } from '../../utils/printUtils';

export const CustomerLedgerStatementModal = ({ isOpen, onClose, customerName, region, invoices }) => {
  const [, setSettingTick] = React.useState(0);

  React.useEffect(() => {
    const handleSettingUpdate = () => setSettingTick((t) => t + 1);
    window.addEventListener('store_info_updated', handleSettingUpdate);
    window.addEventListener('warranty_config_updated', handleSettingUpdate);
    window.addEventListener('tax_config_updated', handleSettingUpdate);
    return () => {
      window.removeEventListener('store_info_updated', handleSettingUpdate);
      window.removeEventListener('warranty_config_updated', handleSettingUpdate);
      window.removeEventListener('tax_config_updated', handleSettingUpdate);
    };
  }, []);

  if (!isOpen || !invoices) return null;

  const customerInvoices = invoices.filter((inv) => {
    const nameMatch = (inv.shopName || inv.customerName || '').toLowerCase() === (customerName || '').toLowerCase();
    return nameMatch;
  });

  const totalBilled = customerInvoices.reduce((sum, inv) => sum + Number(inv.netTotal || inv.subtotal || 0), 0);
  const totalRemainingDebt = customerInvoices.reduce((sum, inv) => sum + (inv.remainingDebt !== undefined ? Number(inv.remainingDebt) : Number(inv.netTotal || 0)), 0);
  const totalCashPaid = totalBilled - totalRemainingDebt;

  const handlePrint = () => {
    printElementById('ledger-statement-print', `Statement of Account - ${customerName || 'Customer Shop'}`);
  };

  const storeInfo = getStoreInfo();

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      
      <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 5mm 6mm;
            }
            html, body, #root, .app-container, .main-viewport, .content-area {
              height: auto !important;
              min-height: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #FFFFFF !important;
              color: #000000 !important;
              font-family: Arial, sans-serif !important;
              font-size: 9pt !important;
              line-height: 1.3 !important;
              overflow: visible !important;
            }
            .sidebar, header, nav, aside, .no-print, button, .btn {
              display: none !important;
            }
            .modal-overlay {
              position: static !important;
              display: block !important;
              width: 100% !important;
              height: auto !important;
              min-height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #FFFFFF !important;
              backdrop-filter: none !important;
              box-shadow: none !important;
              border: none !important;
              inset: auto !important;
              z-index: auto !important;
            }
            .modal-card, .card {
              position: static !important;
              display: block !important;
              width: 100% !important;
              max-width: 100% !important;
              height: auto !important;
              max-height: none !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #FFFFFF !important;
              box-shadow: none !important;
              border: none !important;
              overflow: visible !important;
            }
            #ledger-statement-print {
              display: block !important;
              position: static !important;
              width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0.5rem !important;
              border: 1.5px solid #000000 !important;
              box-sizing: border-box !important;
              background: #FFFFFF !important;
              color: #000000 !important;
              overflow: visible !important;
            }
            #ledger-statement-print * {
              color: #000000 !important;
            }
          }
      `}</style>

      <div className="card modal-card" style={{ width: '850px', maxWidth: '95vw', maxHeight: '94vh', overflowY: 'auto', padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        
        {/* Modal Top Bar (Screen Only) */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={22} color="#0284C7" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              Official Customer Statement of Account (A4 Document Preview)
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', fontWeight: 900, backgroundColor: '#0284C7', color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', borderRadius: '6px' }}
            >
              <Printer size={16} /> Print / Export A4 Statement PDF
            </button>
            <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}>
              <X size={22} />
            </button>
          </div>
        </div>

        {/* 🏛️ OFFICIAL COMMERCIAL A4 STATEMENT CONTAINER */}
        <div id="ledger-statement-print" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', border: '2px solid #000000', boxSizing: 'border-box' }}>
          
          {/* 1. HEADER BRANDING */}
          <div style={{ borderBottom: '2px solid #000000', paddingBottom: '0.85rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#000000', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {storeInfo.name}
              </h1>
              <div style={{ fontSize: '0.825rem', color: '#1E293B', fontWeight: 600, marginTop: '0.25rem', lineHeight: '1.4' }}>
                {storeInfo.address}<br />
                <strong>DSL #:</strong> {storeInfo.dslNumber} | <strong>STN #:</strong> {storeInfo.stnNumber || '4442705-7'} | <strong>Phone:</strong> {storeInfo.phone}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#000000', border: '2px solid #000000', padding: '0.35rem 0.85rem', display: 'inline-block', textTransform: 'uppercase' }}>
                STATEMENT OF ACCOUNT
              </div>
              <div style={{ fontSize: '0.775rem', color: '#000000', marginTop: '0.35rem', fontWeight: 700 }}>
                Date Generated: {formatDateDDMMYYYY(new Date())}
              </div>
            </div>
          </div>

          {/* 2. CUSTOMER & STATEMENT METADATA BLOCK */}
          <div style={{ border: '1.5px solid #000000', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem', backgroundColor: '#FFF' }}>
            <div>
              <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Statement To (Customer Shop):</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#000000', marginTop: '0.1rem' }}>{customerName}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Territory / Region:</span>
              <div style={{ fontSize: '0.925rem', fontWeight: 800, color: '#000000', marginTop: '0.1rem' }}>{region || 'General Region'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Account Status:</span>
              <div style={{ marginTop: '0.1rem' }}>
                {totalRemainingDebt > 0 ? (
                  <span style={{ border: '1px solid #000000', color: '#000000', padding: '0.15rem 0.45rem', fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    OUTSTANDING DEBT
                  </span>
                ) : (
                  <span style={{ border: '1px solid #000000', color: '#000000', padding: '0.15rem 0.45rem', fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    CLEAR / PAID IN FULL
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 3. ITEMIZED INVOICES & BILLING TABLE */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 900, color: '#000000', marginBottom: '0.4rem', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '0.2rem' }}>
              Itemized Wholesale Invoices & Billing Log
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.775rem', color: '#000000' }}>
              <thead>
                <tr style={{ borderTop: '2px solid #000000', borderBottom: '2px solid #000000', textAlign: 'left', backgroundColor: '#F8FAFC' }}>
                  <th style={{ padding: '0.45rem 0.35rem' }}>Invoice #</th>
                  <th style={{ padding: '0.45rem 0.35rem' }}>Date</th>
                  <th style={{ padding: '0.45rem 0.35rem' }}>Booking Rep</th>
                  <th style={{ padding: '0.45rem 0.35rem' }}>Delivery Driver</th>
                  <th style={{ padding: '0.45rem 0.35rem', textAlign: 'right' }}>Billed Net (Rs.)</th>
                  <th style={{ padding: '0.45rem 0.35rem', textAlign: 'right' }}>Settled Cash (Rs.)</th>
                  <th style={{ padding: '0.45rem 0.35rem', textAlign: 'right' }}>Balance Due (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                {customerInvoices.length > 0 ? (
                  customerInvoices.map((inv) => {
                    const origNet = Number(inv.netTotal || inv.subtotal || 0);
                    const remaining = inv.remainingDebt !== undefined ? Number(inv.remainingDebt) : origNet;
                    const paid = origNet - remaining;

                    return (
                      <tr key={inv.invoiceNo} style={{ borderBottom: '1px solid #CBD5E1' }}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 800 }}>{inv.invoiceNo}</td>
                        <td style={{ fontWeight: 600 }}>{formatDateDDMMYYYY(inv.date)}</td>
                        <td>{inv.bookingMan || 'Tariq Mahmood'}</td>
                        <td>{inv.deliveryMan || 'Awais Ijaz'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 800 }}>Rs. {origNet.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
                        <td style={{ textAlign: 'right', fontWeight: 800 }}>Rs. {paid.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
                        <td style={{ textAlign: 'right', fontWeight: 900 }}>Rs. {remaining.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '1.5rem', color: '#475569' }}>
                      No invoices recorded for this customer shop.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 4. TIMESTAMPED CASH SETTLEMENT AUDIT LOG */}
          {customerInvoices.flatMap(inv => (inv.paymentLogs || []).map((log, lIdx) => ({ ...log, invNo: inv.invoiceNo, key: `${inv.invoiceNo}-${lIdx}` }))).length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#000000', marginBottom: '0.4rem', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '0.2rem' }}>
                Timestamped Cash Payments Received Log
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', color: '#000000' }}>
                <thead>
                  <tr style={{ borderTop: '2px solid #000000', borderBottom: '2px solid #000000', textAlign: 'left', backgroundColor: '#F8FAFC' }}>
                    <th style={{ padding: '0.4rem 0.3rem' }}>Payment Date & Time</th>
                    <th style={{ padding: '0.4rem 0.3rem' }}>Invoice #</th>
                    <th style={{ padding: '0.4rem 0.3rem', textAlign: 'right' }}>Amount Paid (Rs.)</th>
                    <th style={{ padding: '0.4rem 0.3rem' }}>Payment Mode</th>
                    <th style={{ padding: '0.4rem 0.3rem', textAlign: 'right' }}>Remaining Balance After</th>
                    <th style={{ padding: '0.4rem 0.3rem' }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {customerInvoices.flatMap(inv => (inv.paymentLogs || []).map((log, lIdx) => ({ ...log, invNo: inv.invoiceNo, key: `${inv.invoiceNo}-${lIdx}` }))).map((log) => (
                    <tr key={log.key} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ fontWeight: 700 }}>{formatDateDDMMYYYY(log.date)} at {log.time || '10:00 AM'}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{log.invNo}</td>
                      <td style={{ textAlign: 'right', fontWeight: 800 }}>Rs. {Number(log.amountPaid || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
                      <td>{log.paymentMode || 'Cash'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 800 }}>Rs. {Number(log.remainingDebtAfter || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
                      <td style={{ color: '#334155' }}>{log.note || log.notes || 'Cash Deposit'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 5. STATEMENT NET TOTALS SUMMARY BOX */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', border: '2px solid #000000', padding: '0.65rem 0.85rem', marginBottom: '1.5rem', textTransform: 'uppercase', fontSize: '0.85rem', backgroundColor: '#F8FAFC' }}>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569' }}>TOTAL GROSS BILLED:</span>
              <div style={{ fontWeight: 900, fontSize: '1rem' }}>Rs. {totalBilled.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569' }}>TOTAL CASH RECEIVED:</span>
              <div style={{ fontWeight: 900, fontSize: '1rem' }}>Rs. {totalCashPaid.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#000000' }}>NET OUTSTANDING BALANCE DUE:</span>
              <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#000000' }}>Rs. {totalRemainingDebt.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          {/* 6. OFFICIAL DIGITAL SIGNATURE & LEGAL WARRANTY FOOTER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid #000000', paddingTop: '0.85rem', marginTop: '1rem', fontSize: '0.75rem' }}>
            <div style={{ maxWidth: '420px', lineHeight: '1.4', color: '#334155' }}>
              <strong>Legal Compliance Declaration:</strong><br />
              This official computer-generated statement of account is verified and digitally authenticated under Drug Act 1976 & DRAP Rules 2014 by <strong>{storeInfo.name}</strong>.
            </div>

            <div style={{ textAlign: 'center', minWidth: '180px' }}>
              {storeInfo.signatureImage ? (
                <img
                  src={storeInfo.signatureImage}
                  alt="Official Digital Signature"
                  style={{ height: '48px', maxHeight: '55px', maxWidth: '170px', objectFit: 'contain', display: 'block', margin: '0 auto 0.2rem auto' }}
                />
              ) : (
                <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.2rem' }}>
                  {storeInfo.signatoryName || 'M. Idrees'}
                </div>
              )}
              <div style={{ borderTop: '1.5px solid #000000', marginTop: '0.2rem', paddingTop: '0.15rem', fontWeight: 'bold', fontSize: '0.75rem' }}>
                {storeInfo.signatoryName || 'M. Idrees'} ({storeInfo.signatoryTitle || 'Managing Director'})
              </div>
              <div style={{ fontSize: '0.65rem', color: '#0284C7', fontWeight: 700 }}>
                ✔ VERIFIED DIGITAL SIGNATURE
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CustomerLedgerStatementModal;
