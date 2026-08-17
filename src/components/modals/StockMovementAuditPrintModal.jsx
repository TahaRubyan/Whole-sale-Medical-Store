import React from 'react';
import { Printer, X, Download, Package } from 'lucide-react';
import { getStoreInfo } from '../../data/mockData';
import { printElementById } from '../../utils/printUtils';

export const StockMovementAuditPrintModal = ({ isOpen, onClose, movementData }) => {
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

  if (!isOpen || !movementData) return null;

  const {
    medicineName = 'All Medicines',
    category = 'Pharmaceutical',
    initialStock = 0,
    totalSold = 0,
    remainingStock = 0,
    stockTurnover = '0',
    regionalBreakdown = [],
  } = movementData;

  const handlePrint = () => {
    printElementById('stock-movement-audit-print', 'Stock Movement Audit Schedule');
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      {/* PRINT CSS STYLES */}
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 6mm 8mm;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
              background: #FFFFFF !important;
              color: #000000 !important;
              overflow: visible !important;
            }
            .no-print, button, .btn {
              display: none !important;
            }
            .modal-overlay {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              min-height: 100% !important;
              height: auto !important;
              background: #FFFFFF !important;
              backdrop-filter: none !important;
              z-index: 999999 !important;
              margin: 0 !important;
              padding: 0 !important;
              display: block !important;
            }
            .card, .modal-card {
              position: static !important;
              width: 100% !important;
              max-width: 100% !important;
              max-height: none !important;
              overflow: visible !important;
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
              background: #FFFFFF !important;
            }
            #stock-movement-audit-print {
              display: block !important;
              visibility: visible !important;
              position: static !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 1rem !important;
              box-sizing: border-box !important;
              border: 2px solid #000000 !important;
              background: #FFFFFF !important;
              color: #000000 !important;
            }
            #stock-movement-audit-print * {
              visibility: visible !important;
            }
          }
        `}
      </style>

      <div className="card modal-card" style={{ width: '95%', maxWidth: '980px', maxHeight: '92vh', overflowY: 'auto', padding: '1.5rem', position: 'relative', backgroundColor: '#F8FAFC' }}>
        <button onClick={onClose} className="no-print" style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Package size={24} color="#0284C7" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Stock Movement & Regional Distribution Audit PDF</h3>
        </div>

        {/* PRINTABLE CONTAINER */}
        <div
          id="stock-movement-audit-print"
          style={{
            backgroundColor: '#FFFFFF',
            border: '2px solid #000000',
            padding: '1.5rem',
            fontSize: '0.8rem',
            color: '#000000',
            fontFamily: 'Arial, sans-serif',
            lineHeight: 1.4,
          }}
        >
          {/* HEADER */}
          <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '2px solid #000000', paddingBottom: '0.65rem' }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              {getStoreInfo().name}
            </h2>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginTop: '0.15rem' }}>{getStoreInfo().address}</div>
            <div style={{ fontSize: '0.775rem', marginTop: '0.1rem' }}>
              Phone: {getStoreInfo().phone} | STN: {getStoreInfo().stnNumber} | NTN: {getStoreInfo().ntnNumber}
            </div>
            <div style={{ display: 'inline-block', border: '2px solid #000000', padding: '0.25rem 1.5rem', marginTop: '0.6rem', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.04em', backgroundColor: '#F8FAFC' }}>
              MEDICINE STOCK MOVEMENT & REGIONAL DISTRIBUTION AUDIT
            </div>
          </div>

          {/* MEDICINE AUDIT SUMMARY METADATA BOX */}
          <div style={{ border: '1.5px solid #000000', padding: '0.75rem', marginBottom: '1rem', backgroundColor: '#FAFAFA' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#000000', marginBottom: '0.4rem' }}>
              📦 Target Medicine: <span style={{ textDecoration: 'underline' }}>{medicineName}</span> ({category})
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.5rem', textTransform: 'uppercase' }}>
              <div style={{ border: '1px solid #000000', padding: '0.4rem', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#475569' }}>INITIAL STOCK INFLOW</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, marginTop: '0.1rem' }}>{initialStock.toLocaleString()} Boxes</div>
              </div>

              <div style={{ border: '1px solid #000000', padding: '0.4rem', textAlign: 'center', backgroundColor: '#EFF6FF' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#1D4ED8' }}>TOTAL QUANTITY SOLD</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#1E40AF', marginTop: '0.1rem' }}>{totalSold.toLocaleString()} Boxes</div>
              </div>

              <div style={{ border: '1px solid #000000', padding: '0.4rem', textAlign: 'center', backgroundColor: '#ECFDF5' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#047857' }}>REMAINING IN STOCK</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#065F46', marginTop: '0.1rem' }}>{remainingStock.toLocaleString()} Boxes</div>
              </div>

              <div style={{ border: '1px solid #000000', padding: '0.4rem', textAlign: 'center', backgroundColor: '#FFFBEB' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#B45309' }}>STOCK TURNOVER</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#92400E', marginTop: '0.1rem' }}>{stockTurnover}%</div>
              </div>
            </div>
          </div>

          {/* REGIONAL & SHOP DISTRIBUTION LEDGER TABLE */}
          <div style={{ fontWeight: 900, fontSize: '0.85rem', marginBottom: '0.4rem', borderBottom: '1px solid #000000', paddingBottom: '0.2rem' }}>
            🗺️ Regional & Shop-Wise Sales Distribution Breakdown:
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ borderTop: '2px solid #000000', borderBottom: '2px solid #000000', backgroundColor: '#F1F5F9', textAlign: 'left' }}>
                <th style={{ padding: '0.45rem 0.35rem' }}>Region</th>
                <th style={{ padding: '0.45rem 0.35rem' }}>Shop / Customer Name</th>
                <th style={{ padding: '0.45rem 0.35rem', textAlign: 'center' }}>Purchased Qty (Boxes)</th>
                <th style={{ padding: '0.45rem 0.35rem', textAlign: 'right' }}>Total Revenue (Rs.)</th>
                <th style={{ padding: '0.45rem 0.35rem', textAlign: 'center' }}>Invoices</th>
                <th style={{ padding: '0.45rem 0.35rem' }}>Last Purchase Date</th>
              </tr>
            </thead>
            <tbody>
              {regionalBreakdown.length > 0 ? (
                regionalBreakdown.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '0.35rem 0.35rem', fontWeight: 'bold' }}>{row.region}</td>
                    <td style={{ padding: '0.35rem 0.35rem', fontWeight: 'bold', color: '#0F172A' }}>{row.shopName}</td>
                    <td style={{ padding: '0.35rem 0.35rem', textAlign: 'center', fontWeight: 'bold', color: '#1E40AF' }}>{row.quantity} Boxes</td>
                    <td style={{ padding: '0.35rem 0.35rem', textAlign: 'right', fontWeight: 'bold' }}>Rs. {row.revenue.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '0.35rem 0.35rem', textAlign: 'center' }}>{row.invoiceCount}</td>
                    <td style={{ padding: '0.35rem 0.35rem' }}>{row.lastDate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: '#64748B' }}>
                    No sales distribution logs recorded for this medicine yet.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #000000', borderBottom: '2px solid #000000', fontWeight: 900, backgroundColor: '#F8FAFC' }}>
                <td colSpan="2" style={{ padding: '0.5rem 0.35rem' }}>DISTRIBUTION SUMMARY:</td>
                <td style={{ padding: '0.5rem 0.35rem', textAlign: 'center', color: '#1E40AF' }}>{totalSold} Boxes</td>
                <td style={{ padding: '0.5rem 0.35rem', textAlign: 'right' }}>
                  Rs. {regionalBreakdown.reduce((sum, r) => sum + r.revenue, 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </td>
                <td style={{ padding: '0.5rem 0.35rem', textAlign: 'center' }}>
                  {regionalBreakdown.reduce((sum, r) => sum + r.invoiceCount, 0)} Invoices
                </td>
                <td style={{ padding: '0.5rem 0.35rem' }}>Verified Log</td>
              </tr>
            </tfoot>
          </table>

          {/* AUDIT FOOTER & DIGITAL SIGNATURE */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.5rem', paddingTop: '0.85rem', borderTop: '2px solid #000000', fontSize: '0.75rem' }}>
            <div style={{ maxWidth: '420px', lineHeight: 1.4, color: '#334155' }}>
              <strong>Inventory Audit Certification:</strong><br />
              This stock movement log tracks complete inward and regional outward distribution records for <strong>{getStoreInfo().name}</strong>.
            </div>

            <div style={{ textAlign: 'center', minWidth: '180px' }}>
              {getStoreInfo().signatureImage ? (
                <img
                  src={getStoreInfo().signatureImage}
                  alt="Official Digital Signature"
                  style={{ height: '48px', maxHeight: '55px', maxWidth: '170px', objectFit: 'contain', display: 'block', margin: '0 auto 0.2rem auto' }}
                />
              ) : (
                <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {getStoreInfo().signatoryName || 'M. Idrees'}
                </div>
              )}
              <div style={{ borderTop: '1.5px solid #000000', marginTop: '0.2rem', paddingTop: '0.15rem', fontWeight: 'bold', fontSize: '0.75rem' }}>
                {getStoreInfo().signatoryName || 'M. Idrees'} ({getStoreInfo().signatoryTitle || 'Managing Director'})
              </div>
              <div style={{ fontSize: '0.65rem', color: '#0284C7', fontWeight: 700 }}>
                ✔ VERIFIED DIGITAL SIGNATURE
              </div>
            </div>
          </div>
        </div>

        {/* MODAL ACTION BUTTONS */}
        <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Close</button>
          
          <button onClick={handlePrint} className="btn btn-outline" style={{ flex: 1, borderColor: '#0284C7', color: '#0284C7', fontWeight: 800 }}>
            <Download size={16} /> Save PDF Report
          </button>
          
          <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 1, backgroundColor: '#000000', color: '#FFF', fontWeight: 900 }}>
            <Printer size={16} /> Print Stock Audit PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockMovementAuditPrintModal;
