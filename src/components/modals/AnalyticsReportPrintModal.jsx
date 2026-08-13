import React from 'react';
import { Printer, X, FileText, Download } from 'lucide-react';
import { STORE_INFO } from '../../data/mockData';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';

export const AnalyticsReportPrintModal = ({
  isOpen,
  onClose,
  invoices = [],
  dateRangePreset = '30DAYS',
  startDate = '',
  endDate = '',
  topSellingMedicines = [],
  financialSummary = {},
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getPeriodTitle = () => {
    if (dateRangePreset === 'TODAY') return 'Today\'s Sales & Financial Report';
    if (dateRangePreset === '7DAYS') return '7-Day Executive Sales & Financial Report';
    if (dateRangePreset === '30DAYS') return '30-Day Executive Sales & Financial Report';
    if (dateRangePreset === 'CUSTOM' && startDate && endDate) return `Custom Period Sales Report (${formatDateDDMMYYYY(startDate)} to ${formatDateDDMMYYYY(endDate)})`;
    if (dateRangePreset === 'CREDIT_DEBT') return 'Unpaid Customer Credit Debt Statement';
    return 'Executive Sales & Financial Report';
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      {/* PRINT CSS OVERRIDE */}
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 6mm 8mm;
            }
            html, body {
              width: 100% !important;
              height: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #FFFFFF !important;
              font-size: 11pt !important;
            }
            body * {
              visibility: hidden !important;
            }
            .modal-overlay, .modal-card, div {
              position: static !important;
              max-height: none !important;
              overflow: visible !important;
              background: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              border: none !important;
            }
            #analytics-pdf-report, #analytics-pdf-report * {
              visibility: visible !important;
            }
            #analytics-pdf-report {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              min-height: 98vh !important;
              margin: 0 !important;
              padding: 1.65rem !important;
              border: 2px solid #000000 !important;
              box-sizing: border-box !important;
            }
            .no-print, button, .btn {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="card modal-card" style={{ width: '95%', maxWidth: '980px', maxHeight: '94vh', overflowY: 'auto', padding: '1.5rem', position: 'relative', backgroundColor: '#F8FAFC' }}>
        <button onClick={onClose} className="no-print" style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <FileText size={22} color="#000" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#000' }}>Downloadable Executive Analytics & PDF Report</h3>
        </div>

        {/* PRINTABLE A4 ANALYTICS PDF CONTAINER */}
        <div
          id="analytics-pdf-report"
          style={{
            backgroundColor: '#FFFFFF',
            border: '2px solid #000000',
            padding: '1.75rem',
            fontSize: '0.835rem',
            color: '#000000',
            fontFamily: 'Arial, sans-serif',
            lineHeight: 1.6,
            boxSizing: 'border-box'
          }}
        >
          {/* STORE HEADER BRANDING (NO DSL/STN/NTN AS REQUESTED) */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingTop: '0.5rem' }}>
            <h1 style={{ fontSize: '2.1rem', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em', color: '#000000', lineHeight: '1.25' }}>
              {STORE_INFO.name}
            </h1>
            <div style={{ fontSize: '0.925rem', fontWeight: 'bold', marginTop: '0.35rem', lineHeight: '1.5' }}>
              {STORE_INFO.address}
            </div>
            <div style={{ fontSize: '0.835rem', marginTop: '0.2rem', lineHeight: '1.5' }}>
              Phone# {STORE_INFO.phone} &nbsp;|&nbsp; E-Mail: {STORE_INFO.email}
            </div>

            {/* PERIOD BANNER */}
            <div style={{ display: 'inline-block', border: '2px solid #000000', padding: '0.4rem 2rem', marginTop: '0.85rem', fontWeight: '900', fontSize: '1.15rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {getPeriodTitle()}
            </div>
          </div>

          {/* FINANCIAL SUMMARY KPI GRID */}
          <div style={{ border: '2px solid #000000', padding: '0.85rem 1rem', marginBottom: '1.85rem', fontSize: '0.85rem', lineHeight: '1.6', backgroundColor: '#FAFAFA' }}>
            <div style={{ fontWeight: '900', fontSize: '0.95rem', textDecoration: 'underline', marginBottom: '0.5rem' }}>
              EXECUTIVE FINANCIAL METRICS SUMMARY:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#555' }}>Total Invoices Billed:</span>
                <div style={{ fontSize: '1.15rem', fontWeight: '900' }}>{invoices.length} Orders</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#555' }}>Gross Sales Revenue:</span>
                <div style={{ fontSize: '1.15rem', fontWeight: '900' }}>Rs. {financialSummary.grossSales ? financialSummary.grossSales.toLocaleString('en-PK', { minimumFractionDigits: 2 }) : '0.00'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#555' }}>Net Estimated Profit:</span>
                <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#059669' }}>Rs. {financialSummary.netProfit ? financialSummary.netProfit.toLocaleString('en-PK', { minimumFractionDigits: 2 }) : '0.00'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#555' }}>Unpaid Customer Debt:</span>
                <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#DC2626' }}>Rs. {financialSummary.unpaidDebt ? financialSummary.unpaidDebt.toLocaleString('en-PK', { minimumFractionDigits: 2 }) : '0.00'}</div>
              </div>
            </div>
          </div>

          {/* MOST SELLING MEDICINES SECTION IN PDF */}
          <div style={{ marginBottom: '1.85rem' }}>
            <div style={{ fontWeight: '900', fontSize: '1.05rem', borderBottom: '2px solid #000000', paddingBottom: '0.35rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🏆 MOST SELLING & FAST-MOVING MEDICINES (TOP PERFORMERS):</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Ranked by Total Boxes Sold</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.785rem', lineHeight: '1.5' }}>
              <thead>
                <tr style={{ borderTop: '2px solid #000000', borderBottom: '2px solid #000000', textAlign: 'left', backgroundColor: '#F3F4F6' }}>
                  <th style={{ padding: '0.5rem 0.35rem', width: '35px' }}>Rank</th>
                  <th style={{ padding: '0.5rem 0.35rem' }}>Medicine Trade Name</th>
                  <th style={{ padding: '0.5rem 0.35rem' }}>Generic Formula</th>
                  <th style={{ padding: '0.5rem 0.35rem', textAlign: 'center' }}>Total Qty Sold</th>
                  <th style={{ padding: '0.5rem 0.35rem', textAlign: 'right' }}>Unit Box Rate</th>
                  <th style={{ padding: '0.5rem 0.35rem', textAlign: 'right' }}>Generated Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topSellingMedicines && topSellingMedicines.length > 0 ? (
                  topSellingMedicines.slice(0, 8).map((med, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '0.45rem 0.35rem', fontWeight: '900', textAlign: 'center' }}>#{idx + 1}</td>
                      <td style={{ padding: '0.45rem 0.35rem', fontWeight: 'bold' }}>{med.brandName}</td>
                      <td style={{ padding: '0.45rem 0.35rem', color: '#4B5563', fontSize: '0.75rem' }}>{med.genericFormula}</td>
                      <td style={{ padding: '0.45rem 0.35rem', textAlign: 'center', fontWeight: '900' }}>{med.totalQty} Boxes</td>
                      <td style={{ padding: '0.45rem 0.35rem', textAlign: 'right' }}>Rs. {Number(med.unitPrice).toFixed(2)}</td>
                      <td style={{ padding: '0.45rem 0.35rem', textAlign: 'right', fontWeight: '900' }}>Rs. {Number(med.totalRevenue).toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
                      No medicine sales recorded for this selected date period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ITEMIZED SALES TRANSACTIONS LOG FOR THE PERIOD */}
          <div style={{ marginBottom: '1.85rem' }}>
            <div style={{ fontWeight: '900', fontSize: '1.05rem', borderBottom: '2px solid #000000', paddingBottom: '0.35rem', marginBottom: '0.75rem' }}>
              📋 SALES TRANSACTIONS AUDIT LOG ({invoices.length} INVOICES):
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.765rem', lineHeight: '1.5' }}>
              <thead>
                <tr style={{ borderTop: '2px solid #000000', borderBottom: '2px solid #000000', textAlign: 'left', backgroundColor: '#F3F4F6' }}>
                  <th style={{ padding: '0.5rem 0.3rem', width: '25px' }}>Sr.</th>
                  <th style={{ padding: '0.5rem 0.3rem' }}>Invoice #</th>
                  <th style={{ padding: '0.5rem 0.3rem' }}>Date</th>
                  <th style={{ padding: '0.5rem 0.3rem' }}>Customer / Store Name</th>
                  <th style={{ padding: '0.5rem 0.3rem' }}>Payment Method</th>
                  <th style={{ padding: '0.5rem 0.3rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.5rem 0.3rem', textAlign: 'right' }}>Invoice Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? (
                  invoices.map((inv, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #CBD5E1', pageBreakInside: 'avoid' }}>
                      <td style={{ padding: '0.45rem 0.3rem' }}>{idx + 1}</td>
                      <td style={{ padding: '0.45rem 0.3rem', fontFamily: 'monospace', fontWeight: 'bold' }}>{inv.invoiceNo}</td>
                      <td style={{ padding: '0.45rem 0.3rem' }}>{formatDateDDMMYYYY(inv.date)}</td>
                      <td style={{ padding: '0.45rem 0.3rem', fontWeight: 'bold' }}>{inv.customerName}</td>
                      <td style={{ padding: '0.45rem 0.3rem' }}>{inv.paymentMode}</td>
                      <td style={{ padding: '0.45rem 0.3rem', textAlign: 'center', fontWeight: 'bold' }}>
                        {inv.paymentStatus === 'UNPAID_CREDIT' ? 'UNPAID CREDIT' : 'PAID'}
                      </td>
                      <td style={{ padding: '0.45rem 0.3rem', textAlign: 'right', fontWeight: 'bold' }}>
                        Rs. {Number(inv.netTotal || inv.subtotal || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '1.5rem', color: '#666' }}>
                      No sales transactions found for the selected date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* DIGITAL SIGNATURE BOX & REPORT METADATA FOOTER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid #000000', paddingTop: '0.85rem', marginTop: '1.5rem', fontSize: '0.775rem', lineHeight: '1.5', pageBreakInside: 'avoid' }}>
            <div>
              <div>Report Generated By: <strong>Hassan (Admin)</strong></div>
              <div>Report Generated On: <strong>{formatDateDDMMYYYY(new Date())}</strong></div>
            </div>

            {/* DIGITAL SIGNATURE BOX */}
            <div style={{ border: '1px solid #000000', padding: '0.45rem 0.85rem', textAlign: 'center', minWidth: '200px' }}>
              {STORE_INFO.signatureImage ? (
                <img src={STORE_INFO.signatureImage} alt="Authorized Signature" style={{ maxHeight: '46px', objectFit: 'contain', display: 'block', margin: '0 auto' }} />
              ) : (
                <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 'bold' }}>
                  {STORE_INFO.signatoryName}
                </div>
              )}
              <div style={{ borderTop: '1px solid #000000', marginTop: '0.3rem', paddingTop: '0.15rem', fontWeight: 'bold' }}>
                {STORE_INFO.signatoryName || 'M. Idrees'}
              </div>
              <div style={{ fontSize: '0.675rem' }}>
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>

        {/* MODAL PRINT & DOWNLOAD PDF BUTTONS */}
        <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Close</button>
          
          <button onClick={handlePrint} className="btn btn-outline" style={{ flex: 1, borderColor: '#0284C7', color: '#0284C7', fontWeight: 800 }}>
            <Download size={16} /> Save PDF Report
          </button>
          
          <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 1, backgroundColor: '#000000', color: '#FFF', fontWeight: 900 }}>
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReportPrintModal;
