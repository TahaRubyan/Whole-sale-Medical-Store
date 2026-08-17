import React from 'react';
import { Printer, X, Download, ShieldCheck } from 'lucide-react';
import { STORE_INFO, getStoreInfo } from '../../data/mockData';
import { printElementById } from '../../utils/printUtils';

export const FbrTaxAuditPrintModal = ({ isOpen, onClose, auditData }) => {
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

  if (!isOpen || !auditData) return null;

  const {
    periodLabel = 'Current Month',
    startDate,
    endDate,
    items = [],
    totalInvoicesCount = 0,
    totalTaxableSales = 0,
    totalSalesTax = 0,
  } = auditData;

  const handlePrint = () => {
    printElementById('fbr-tax-audit-print', 'FBR Sales Tax Audit Schedule');
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
            #fbr-tax-audit-print {
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
            #fbr-tax-audit-print * {
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
          <ShieldCheck size={24} color="#0284C7" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>FBR Official Sales Tax Audit & Lawyer Report</h3>
        </div>

        {/* PRINTABLE CONTAINER */}
        <div
          id="fbr-tax-audit-print"
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
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginTop: '0.1rem' }}>
              DSL (Form 20): {getStoreInfo().dslNumber} | DSL (Form 21): {getStoreInfo().dlNumber}
            </div>
            <div style={{ display: 'inline-block', border: '2px solid #000000', padding: '0.25rem 1.5rem', marginTop: '0.6rem', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.04em', backgroundColor: '#F8FAFC' }}>
              OFFICIAL FBR SALES TAX AUDIT & LAWYER REPORT
            </div>
          </div>

          {/* AUDIT METADATA & PERIOD BOX */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', border: '1.5px solid #000000', padding: '0.65rem', marginBottom: '1rem', fontSize: '0.8rem', backgroundColor: '#FAFAFA' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div><strong>Audit Report Period:</strong> <span style={{ textDecoration: 'underline', fontWeight: 800 }}>{periodLabel}</span></div>
              <div><strong>Date Window:</strong> {startDate} to {endDate}</div>
              <div><strong>Total Sales Invoices Issued:</strong> <strong>{totalInvoicesCount} Invoice(s)</strong></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div><strong>Generated Date:</strong> {new Date().toLocaleDateString('en-PK')}</div>
              <div><strong>FBR Tax Return Reference:</strong> Annexure-C Sales Register</div>
              <div><strong>Legal Jurisdiction:</strong> Federal Board of Revenue (FBR) Pakistan</div>
            </div>
          </div>

          {/* TAX SUMMARY CARDS TABLE */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ border: '1.5px solid #000000', padding: '0.5rem', textAlign: 'center', backgroundColor: '#F8FAFC' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#475569' }}>TOTAL TAXABLE SALES</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, marginTop: '0.15rem' }}>Rs. {totalTaxableSales.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</div>
            </div>

            <div style={{ border: '1.5px solid #000000', padding: '0.5rem', textAlign: 'center', backgroundColor: '#F0F9FF' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0369A1' }}>SALES TAX (18%) RATE</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0284C7', marginTop: '0.15rem' }}>18.00% Standard</div>
            </div>

            <div style={{ border: '2px solid #000000', padding: '0.5rem', textAlign: 'center', backgroundColor: '#EFF6FF' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#1E3A8A' }}>NET TOTAL SALES TAX COLLECTED</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1E40AF', marginTop: '0.15rem' }}>Rs. {totalSalesTax.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          {/* ITEMIZED SALES TAX SCHEDULE TABLE */}
          <div style={{ fontWeight: 900, fontSize: '0.85rem', marginBottom: '0.4rem', borderBottom: '1px solid #000000', paddingBottom: '0.2rem' }}>
            📋 Itemized Medicine Sales & Sales Tax Audit Schedule:
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ borderTop: '2px solid #000000', borderBottom: '2px solid #000000', backgroundColor: '#F1F5F9', textAlign: 'left' }}>
                <th style={{ padding: '0.45rem 0.35rem' }}>#</th>
                <th style={{ padding: '0.45rem 0.35rem' }}>Medicine Brand Name</th>
                <th style={{ padding: '0.45rem 0.35rem' }}>Generic / Category</th>
                <th style={{ padding: '0.45rem 0.35rem', textAlign: 'center' }}>Sold Qty (Boxes/Units)</th>
                <th style={{ padding: '0.45rem 0.35rem', textAlign: 'right' }}>Taxable Sales (Rs.)</th>
                <th style={{ padding: '0.45rem 0.35rem', textAlign: 'right' }}>Sales Tax 18% (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '0.35rem 0.35rem', fontWeight: 'bold' }}>{idx + 1}</td>
                    <td style={{ padding: '0.35rem 0.35rem', fontWeight: 'bold' }}>{item.brandName}</td>
                    <td style={{ padding: '0.35rem 0.35rem', color: '#475569' }}>{item.genericFormula || item.category || 'Pharmaceutical'}</td>
                    <td style={{ padding: '0.35rem 0.35rem', textAlign: 'center', fontWeight: 'bold' }}>{item.quantitySold}</td>
                    <td style={{ padding: '0.35rem 0.35rem', textAlign: 'right' }}>Rs. {item.taxableSales.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '0.35rem 0.35rem', textAlign: 'right', fontWeight: 'bold', color: '#0369A1' }}>Rs. {item.salesTax.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: '#64748B' }}>
                    No sales tax transaction items found for the selected date period.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #000000', borderBottom: '2px solid #000000', fontWeight: 900, backgroundColor: '#F8FAFC' }}>
                <td colSpan="3" style={{ padding: '0.5rem 0.35rem' }}>GRAND TOTAL SUMMARY:</td>
                <td style={{ padding: '0.5rem 0.35rem', textAlign: 'center' }}>
                  {items.reduce((sum, i) => sum + i.quantitySold, 0)} Units
                </td>
                <td style={{ padding: '0.5rem 0.35rem', textAlign: 'right' }}>
                  Rs. {totalTaxableSales.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </td>
                <td style={{ padding: '0.5rem 0.35rem', textAlign: 'right', color: '#0284C7', fontSize: '0.85rem' }}>
                  Rs. {totalSalesTax.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* AUDIT FOOTER & DIGITAL SIGNATURE */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.5rem', paddingTop: '0.85rem', borderTop: '2px solid #000000', fontSize: '0.75rem' }}>
            <div style={{ maxWidth: '420px', lineHeight: 1.4, color: '#334155' }}>
              <strong>Legal Compliance Declaration:</strong><br />
              This official Sales Tax Audit Schedule is compiled from certified POS invoice registers of <strong>{getStoreInfo().name}</strong> under the Sales Tax Act, 1990 and DRAP Act 2012 for FBR Tax Lawyer review.
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
            <Printer size={16} /> Print Official FBR Audit PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default FbrTaxAuditPrintModal;
