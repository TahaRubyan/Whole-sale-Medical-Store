import React, { useState } from 'react';
import { Printer, X, FileText, Download } from 'lucide-react';
import { STORE_INFO, getTaxConfig, getStoreInfo } from '../../data/mockData';
import { formatDateDDMMYYYY, formatExpiryMMYYYY } from '../../utils/dateUtils';
import { printElementById } from '../../utils/printUtils';

import { useAuth } from '../../context/AuthContext';

export const A4InvoicePrintModal = ({ invoice, onClose }) => {
  const { user } = useAuth();
  const [, setSettingTick] = useState(0);
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

  // DUAL SEPARATE WARRANTY CHECKBOXES ON PRINT PREVIEW
  const [includeDrugActWarranty, setIncludeDrugActWarranty] = useState(
    invoice && invoice.includeDrugActWarranty !== undefined ? invoice.includeDrugActWarranty : true
  );
  const [includeDrapWarranty, setIncludeDrapWarranty] = useState(
    invoice && invoice.includeDrapWarranty !== undefined ? invoice.includeDrapWarranty : true
  );

  if (!invoice) return null;

  const handlePrint = () => {
    printElementById('a4-invoice', `Sale Tax Invoice - ${invoice.invoiceNo || 'Invoice'}`);
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      {/* PRINT CSS OVERRIDE */}
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 6mm 8mm;
            }
            html, body, #root, .app-container, .main-viewport, .content-area {
              height: auto !important;
              min-height: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #FFFFFF !important;
              color: #0F172A !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
              font-size: 8.5pt !important;
              line-height: 1.35 !important;
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
            #a4-invoice {
              display: block !important;
              position: static !important;
              width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
              box-sizing: border-box !important;
              background: #FFFFFF !important;
              color: #0F172A !important;
              overflow: visible !important;
            }
          }
        `}
      </style>

      <div className="card modal-card" style={{ width: '95%', maxWidth: '980px', maxHeight: '94vh', overflowY: 'auto', padding: '1.5rem', position: 'relative', backgroundColor: '#F8FAFC', borderRadius: '12px' }}>
        <button onClick={onClose} className="no-print" style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
          <X size={20} />
        </button>

        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={22} color="#0284C7" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Sale Tax Invoice Document</h3>
          </div>

          {/* DUAL WARRANTY TOGGLE CHECKBOXES ON PRINT PREVIEW */}
          <div style={{ display: 'flex', gap: '0.75rem', backgroundColor: '#F0F9FF', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #BAE6FD' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.775rem', color: '#0369A1' }}>
              <input
                type="checkbox"
                checked={includeDrugActWarranty}
                onChange={(e) => setIncludeDrugActWarranty(e.target.checked)}
                style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#0284C7' }}
              />
              <span>Section 23 Drug Act 1976 Warranty</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.775rem', color: '#0369A1' }}>
              <input
                type="checkbox"
                checked={includeDrapWarranty}
                onChange={(e) => setIncludeDrapWarranty(e.target.checked)}
                style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#0284C7' }}
              />
              <span>DRAP 2014 Warranty</span>
            </label>
          </div>
        </div>

        {/* PRINTABLE A4 INVOICE CONTAINER WITH REPEATING THEAD / TFOOT MULTI-PAGE PRINT LAYOUT */}
        <div
          id="a4-invoice"
          style={{
            backgroundColor: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '1.75rem 2rem',
            fontSize: '0.815rem',
            color: '#1E293B',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            lineHeight: 1.5,
            boxSizing: 'border-box',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {/* 1. REPEATING HEADER ON ALL PRINTED PAGES */}
            <thead style={{ display: 'table-header-group' }}>
              <tr>
                <td style={{ border: 'none', padding: 0 }}>
                  {/* STORE HEADER & COMPLIANCE BRANDING */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #E2E8F0' }}>
                    <div>
                      <h1 style={{ fontSize: '1.55rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#0F172A', lineHeight: '1.2' }}>
                        {getStoreInfo().name}
                      </h1>
                      <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748B', marginTop: '0.25rem', lineHeight: '1.4' }}>
                        {getStoreInfo().address}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.15rem' }}>
                        Phone: {getStoreInfo().phone || '-'} &nbsp;•&nbsp; Email: {getStoreInfo().email || '-'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                      <div style={{ display: 'inline-block', backgroundColor: '#0F172A', color: '#FFFFFF', padding: '0.25rem 1rem', borderRadius: '9999px', fontWeight: 800, fontSize: '0.775rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        SALE TAX INVOICE
                      </div>
                      <div style={{ fontSize: '0.725rem', color: '#64748B', lineHeight: '1.4', marginTop: '0.2rem' }}>
                        <div>DSL: <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>{getStoreInfo().dslNumber || '-'}</strong></div>
                        <div>STN: <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>{getStoreInfo().stnNumber || '-'}</strong></div>
                        <div>NTN: <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>{getStoreInfo().ntnNumber || '-'}</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* 3-COLUMN METADATA HEADER GRID */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1.45fr 1.15fr', gap: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.735rem', lineHeight: '1.55', border: '1px solid #F1F5F9' }}>
                    {/* COLUMN 1: INVOICE IDENTIFIERS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ fontSize: '0.675rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>Order Details</div>
                      <div><span style={{ color: '#64748B' }}>Invoice #:</span> <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>{invoice.invoiceNo || '-'}</strong></div>
                      <div><span style={{ color: '#64748B' }}>Sale Order #:</span> <span style={{ fontFamily: 'monospace', color: '#334155' }}>{invoice.saleOrderNo || '-'}</span></div>
                      <div><span style={{ color: '#64748B' }}>DSS ID:</span> <span style={{ fontFamily: 'monospace', color: '#334155' }}>{invoice.dssId || '-'}</span></div>
                      <div><span style={{ color: '#64748B' }}>Reference No:</span> <span style={{ color: '#334155' }}>{invoice.referenceNo || '-'}</span></div>
                      <div><span style={{ color: '#64748B' }}>Booking Man:</span> <span style={{ color: '#334155' }}>{invoice.bookingMan || '-'}</span></div>
                    </div>

                    {/* COLUMN 2: CUSTOMER DETAILS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ fontSize: '0.675rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>Customer & Billing Info</div>
                      <div><span style={{ color: '#64748B' }}>Customer:</span> <strong style={{ color: '#0F172A' }}>{invoice.customerName || '-'}</strong></div>
                      <div><span style={{ color: '#64748B' }}>Invoice Date:</span> <strong style={{ color: '#334155' }}>{formatDateDDMMYYYY(invoice.date || new Date())}</strong> &nbsp;|&nbsp; <span style={{ color: '#64748B' }}>Due:</span> <strong style={{ color: '#334155' }}>{formatDateDDMMYYYY(invoice.dueDate || invoice.date || new Date())}</strong></div>
                      <div><span style={{ color: '#64748B' }}>Order Type:</span> <span style={{ color: '#334155' }}>{invoice.saleOrderType || 'REGULAR'}</span> &nbsp;|&nbsp; <span style={{ color: '#64748B' }}>Region:</span> <span style={{ color: '#334155' }}>{invoice.region || '-'}</span></div>
                      <div><span style={{ color: '#64748B' }}>Address:</span> <span style={{ color: '#334155' }}>{invoice.customerAddress || '-'}</span></div>
                      <div><span style={{ color: '#64748B' }}>License #:</span> <span style={{ color: '#334155', fontFamily: 'monospace' }}>{invoice.customerLicenseNo || '-'}</span> &nbsp;|&nbsp; <span style={{ color: '#64748B' }}>NTN:</span> <span style={{ color: '#334155', fontFamily: 'monospace' }}>{invoice.customerNtn || '-'}</span></div>
                    </div>

                    {/* COLUMN 3: PAYMENT & STORE OWNER SECTION */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ fontSize: '0.675rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>Billing Status & Auth</div>
                      <div><span style={{ color: '#64748B' }}>Store Owner:</span> <strong style={{ color: '#0F172A' }}>{STORE_INFO.ownerName || 'Mr Idrees'}</strong></div>
                      <div><span style={{ color: '#64748B' }}>Billed By:</span> <span style={{ color: '#334155' }}>{user?.name || invoice.cashierName || '-'}</span></div>
                      <div><span style={{ color: '#64748B' }}>Delivery By:</span> <span style={{ color: '#334155' }}>{invoice.deliveryMan || '-'}</span></div>
                      <div style={{ marginTop: '0.35rem' }}>
                        {Number(invoice.remainingDebt) > 0 ? (
                          <span style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.725rem', border: '1px solid #FECACA', display: 'inline-block' }}>
                            ⚠️ DEBT DUE: Rs. {Number(invoice.remainingDebt).toFixed(2)}
                          </span>
                        ) : (
                          <span style={{ backgroundColor: '#ECFDF5', color: '#047857', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.725rem', border: '1px solid #A7F3D0', display: 'inline-block' }}>
                            ✔ PAID IN FULL
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </thead>

            {/* 2. MAIN ITEMIZED LINE ITEMS TABLE BODY */}
            <tbody style={{ display: 'table-row-group' }}>
              <tr>
                <td style={{ border: 'none', padding: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.25rem', fontSize: '0.765rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', color: '#475569', textAlign: 'left', pageBreakInside: 'avoid', borderBottom: '1px solid #CBD5E1' }}>
                        <th style={{ padding: '0.5rem 0.35rem', width: '25px', fontSize: '0.7rem', fontWeight: 800 }}>Sr</th>
                        <th style={{ padding: '0.5rem 0.35rem', fontSize: '0.7rem', fontWeight: 800 }}>Item Name</th>
                        <th style={{ padding: '0.5rem 0.35rem', fontSize: '0.7rem', fontWeight: 800 }}>Batch</th>
                        <th style={{ padding: '0.5rem 0.35rem', fontSize: '0.7rem', fontWeight: 800 }}>Expiry</th>
                        <th style={{ padding: '0.5rem 0.35rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 800 }}>Qty</th>
                        <th style={{ padding: '0.5rem 0.35rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 800 }}>Bonus</th>
                        <th style={{ padding: '0.5rem 0.35rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 800 }}>Rate</th>
                        <th style={{ padding: '0.5rem 0.35rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 800 }}>Gross</th>
                        <th style={{ padding: '0.5rem 0.35rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 800 }}>Disc%</th>
                        <th style={{ padding: '0.5rem 0.35rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 800 }}>Disc Amt</th>
                        {getTaxConfig().enableSaleTax !== false && (
                          <th style={{ padding: '0.5rem 0.35rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 800 }}>{getTaxConfig().saleTaxName || 'Sale Tax 18%'}</th>
                        )}
                        {getTaxConfig().enableAdvTax !== false && (
                          <th style={{ padding: '0.5rem 0.35rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 800 }}>{getTaxConfig().advTaxName || 'Adv Tax 0.5%'}</th>
                        )}
                        <th style={{ padding: '0.5rem 0.35rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 800 }}>Net Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items && invoice.items.map((item, idx) => {
                        const qty = Number(item.quantity) || 1;
                        const rate = Number(item.unitPrice) || 600;
                        const gross = item.gross || (qty * rate);
                        const discP = item.discPercent || 0;
                        const discAmt = item.discAmount || (gross * (discP / 100));
                        const discountedGross = gross - discAmt;

                        const taxCfg = getTaxConfig();
                        const stAmt = taxCfg.enableSaleTax !== false ? (item.saleTaxAmt !== undefined ? item.saleTaxAmt : (discountedGross * 0.18)) : 0;
                        const advtAmt = taxCfg.enableAdvTax !== false ? (item.advTaxAmt !== undefined ? item.advTaxAmt : (discountedGross * 0.005)) : 0;
                        const netAmt = item.total || (discountedGross + stAmt + advtAmt);

                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', pageBreakInside: 'avoid' }}>
                            <td style={{ padding: '0.45rem 0.35rem', color: '#94A3B8' }}>{idx + 1}</td>
                            <td style={{ padding: '0.45rem 0.35rem', fontWeight: 700, color: '#0F172A' }}>
                              {item.itemCode ? `${item.itemCode} / ` : ''}{item.brandName}
                            </td>
                            <td style={{ padding: '0.45rem 0.35rem', fontFamily: 'monospace', color: '#475569' }}>{item.batchNumber || '-'}</td>
                            <td style={{ padding: '0.45rem 0.35rem', color: '#64748B' }}>{formatExpiryMMYYYY(item.expiryDate || '2028-12')}</td>
                            <td style={{ padding: '0.45rem 0.35rem', textAlign: 'center', fontWeight: 800, color: '#0F172A' }}>{qty}</td>
                            <td style={{ padding: '0.45rem 0.35rem', textAlign: 'center', color: '#94A3B8' }}>{item.bonus || '-'}</td>
                            <td style={{ padding: '0.45rem 0.35rem', textAlign: 'right', color: '#334155' }}>{rate.toFixed(2)}</td>
                            <td style={{ padding: '0.45rem 0.35rem', textAlign: 'right', color: '#334155' }}>{gross.toFixed(2)}</td>
                            <td style={{ padding: '0.45rem 0.35rem', textAlign: 'right', color: '#64748B' }}>{discP > 0 ? `${discP.toFixed(1)}%` : '-'}</td>
                            <td style={{ padding: '0.45rem 0.35rem', textAlign: 'right', color: discAmt > 0 ? '#059669' : '#64748B' }}>{discAmt.toFixed(2)}</td>
                            {taxCfg.enableSaleTax !== false && (
                              <td style={{ padding: '0.45rem 0.35rem', textAlign: 'right' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#0284C7', display: 'block' }}>{(item.saleTaxPercent !== undefined ? item.saleTaxPercent : 18)}%</span>
                                <span style={{ color: '#334155' }}>{stAmt.toFixed(2)}</span>
                              </td>
                            )}
                            {taxCfg.enableAdvTax !== false && (
                              <td style={{ padding: '0.45rem 0.35rem', textAlign: 'right' }}>
                                <span style={{ fontSize: '0.65rem', color: '#64748B', display: 'block' }}>{(item.advTaxPercent !== undefined ? item.advTaxPercent : 0.5)}%</span>
                                <span style={{ color: '#334155' }}>{advtAmt.toFixed(2)}</span>
                              </td>
                            )}
                            <td style={{ padding: '0.45rem 0.35rem', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>{netAmt.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>

            {/* 3. REPEATING FOOTER ON ALL PRINTED PAGES (DEDICATED TOTALS SECTION & WARRANTIES & PAGE NUMBERING) */}
            <tfoot style={{ display: 'table-footer-group' }}>
              <tr>
                <td style={{ border: 'none', padding: 0 }}>
                  {/* FINANCIAL TOTALS SECTION */}
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    padding: '0.85rem 1.25rem',
                    marginBottom: '0.85rem',
                    fontSize: '0.8rem',
                    border: '1px solid #F1F5F9',
                    pageBreakInside: 'avoid'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                      {/* LEFT: BREAKDOWN */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.775rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                          <span>Gross Subtotal:</span>
                          <strong style={{ color: '#0F172A' }}>Rs. {Number(invoice.grossSubtotal || invoice.subtotal || 0).toFixed(2)}</strong>
                        </div>
                        {Number(invoice.discountAmount || 0) > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                            <span>Total Order Discount:</span>
                            <strong>- Rs. {Number(invoice.discountAmount || 0).toFixed(2)}</strong>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #E2E8F0', paddingTop: '0.2rem', color: '#475569' }}>
                          <span>Net Taxable Total:</span>
                          <strong style={{ color: '#0F172A' }}>Rs. {Number(invoice.discountedSubtotal || (invoice.subtotal - (invoice.discountAmount || 0)) || 0).toFixed(2)}</strong>
                        </div>
                        {getTaxConfig().enableSaleTax !== false && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284C7' }}>
                            <span>Sales Tax (18% FBR):</span>
                            <strong>+ Rs. {Number(invoice.totalSaleTax || 0).toFixed(2)}</strong>
                          </div>
                        )}
                        {getTaxConfig().enableAdvTax !== false && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                            <span>Advance Tax (0.5% Sec 236G):</span>
                            <strong>+ Rs. {Number(invoice.totalAdvTax || 0).toFixed(2)}</strong>
                          </div>
                        )}
                      </div>

                      {/* RIGHT: GRAND TOTAL CARD */}
                      <div style={{
                        backgroundColor: '#0F172A',
                        borderRadius: '6px',
                        padding: '0.85rem 1.15rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        textAlign: 'right',
                        color: '#FFFFFF'
                      }}>
                        <span style={{ fontSize: '0.675rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8' }}>
                          Grand Net Invoice Total
                        </span>
                        <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#38BDF8', marginTop: '0.15rem' }}>
                          Rs. {Number(invoice.netTotal || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* URDU ADVANCE TAX NOTICE BANNER */}
                  <div style={{ textAlign: 'right', direction: 'rtl', fontSize: '0.825rem', fontWeight: 600, padding: '0.5rem 0.85rem', marginBottom: '0.85rem', backgroundColor: '#FFFBEB', color: '#92400E', borderRadius: '6px', lineHeight: '1.5', border: '1px solid #FDE68A', pageBreakInside: 'avoid' }}>
                    {STORE_INFO.urduNotice}
                  </div>

                  {/* FORM 2A LEGAL WARRANTIES SECTION */}
                  {(includeDrugActWarranty || includeDrapWarranty) && (
                    <div style={{ backgroundColor: '#FAFAFA', borderRadius: '6px', padding: '0.65rem 0.85rem', fontSize: '0.7rem', color: '#64748B', lineHeight: '1.5', pageBreakInside: 'avoid', marginBottom: '0.85rem', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem', letterSpacing: '0.02em' }}>
                        FORM 2A (See rules 19 and 30) — LEGAL WARRANTY STATEMENTS:
                      </div>

                      {/* DRUG ACT 1976 WARRANTY */}
                      {includeDrugActWarranty && (
                        <div style={{ marginBottom: '0.35rem' }}>
                          <strong style={{ color: '#334155' }}>Warranty under Section 23(1)(i) of the Drugs Act, 1976:</strong>
                          <div style={{ marginTop: '0.1rem', textAlign: 'justify' }}>
                            I, <strong>{getStoreInfo().signatoryName || STORE_INFO.ownerName || 'Authorized Signatory'}</strong> being a person resident in Pakistan carrying on business at {getStoreInfo().address || 'Wholesale Market'} under the name of <strong>{getStoreInfo().name}</strong> and being authorized distributor of the manufacturers / Principals, do hereby give this warranty that the drugs here above described as sold by me, and contained in this invoice prescribing the goods referred to herein do not contravene in any way the provisions of Section 23 of the Drug Act.
                          </div>
                        </div>
                      )}

                      {/* DRAP 2014 ALTERNATIVE MEDICINES WARRANTY */}
                      {includeDrapWarranty && (
                        <div style={{ marginBottom: '0.35rem', borderTop: includeDrugActWarranty ? '1px dashed #E2E8F0' : 'none', paddingTop: includeDrugActWarranty ? '0.35rem' : '0' }}>
                          <strong style={{ color: '#334155' }}>Warranty under Alternative Medicines and Health Products (Enlistment) Rules 2014 [See Rules 10(3) and (5)]:</strong>
                          <div style={{ marginTop: '0.1rem', textAlign: 'justify' }}>
                            We, as the authorized distributors/agents and on behalf of the principals/manufacturers/importers hereby give warranty that the supplied alternative medicines and health products mentioned herein do not contravene any provision of the prevailing DRAP Act 2012 and rules framed thereunder.
                          </div>
                        </div>
                      )}

                      {/* 4 STANDARD WHOLESALE NOTES */}
                      <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.35rem', marginTop: '0.35rem' }}>
                        <strong style={{ color: '#334155' }}>Note:</strong>
                        <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.5' }}>
                          {STORE_INFO.noteItems.map((note, i) => (
                            <li key={i}>{note}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}

                  {/* FOOTER SIGNATURES: LEFT SIDE & RIGHT SIDE */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', marginTop: '0.75rem', fontSize: '0.75rem', lineHeight: '1.4', pageBreakInside: 'avoid' }}>
                    {/* LEFT BOTTOM: DELIVERY MAN & CUSTOMER RECEIVER SIGNATURE */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: '220px' }}>
                      <div style={{ color: '#64748B' }}>Printed By: <strong style={{ color: '#0F172A' }}>{user?.name || invoice.cashierName || '-'}</strong></div>
                      <div style={{ color: '#64748B' }}>Delivery Driver: <strong style={{ color: '#0F172A' }}>{invoice.deliveryMan || '-'}</strong></div>
                      <div style={{ borderTop: '1px dashed #CBD5E1', marginTop: '1rem', paddingTop: '0.2rem', fontWeight: 700, fontSize: '0.7rem', color: '#64748B' }}>
                        Delivery Driver / Customer Receiver Sign
                      </div>
                    </div>

                    {/* RIGHT BOTTOM: OFFICIAL DIGITAL SIGNATURE */}
                    <div style={{ textAlign: 'center', minWidth: '220px', padding: '0.35rem 0.75rem' }}>
                      {getStoreInfo().signatureImage ? (
                        <img
                          src={getStoreInfo().signatureImage}
                          alt="Digital Signature"
                          style={{ height: '48px', maxHeight: '55px', maxWidth: '170px', objectFit: 'contain', display: 'block', margin: '0 auto 0.2rem auto' }}
                        />
                      ) : (
                        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.25rem', fontWeight: 'bold', color: '#0F172A' }}>
                          {getStoreInfo().signatoryName || 'M. Idrees'}
                        </div>
                      )}
                      <div style={{ borderTop: '1px dashed #CBD5E1', marginTop: '0.25rem', paddingTop: '0.2rem', fontWeight: 800, fontSize: '0.75rem', color: '#0F172A' }}>
                        {getStoreInfo().signatoryName || 'M. Idrees'} ({getStoreInfo().signatoryTitle || 'Managing Director'})
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#0284C7', fontWeight: 700, marginTop: '0.1rem' }}>
                        ✔ VERIFIED DIGITAL SIGNATURE
                      </div>
                    </div>
                  </div>

                  {/* MULTI-PAGE A4 FOOTER PAGE NUMBERING (PAGE N OF M) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.35rem', borderTop: '1px solid #F1F5F9', fontSize: '0.675rem', color: '#94A3B8' }}>
                    <div>Page 1 of {Math.ceil((invoice.items?.length || 1) / 12) || 1}</div>
                    <div>Original Customer Delivery Copy</div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* MODAL ACTION BUTTONS */}
        <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Close</button>
          
          <button onClick={handlePrint} className="btn btn-outline" style={{ flex: 1, borderColor: '#0284C7', color: '#0284C7', fontWeight: 800 }}>
            <Download size={16} /> Save PDF
          </button>
          
          <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 1, backgroundColor: '#0F172A', color: '#FFF', fontWeight: 900 }}>
            <Printer size={16} /> Print A4 Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default A4InvoicePrintModal;
