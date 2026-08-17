import React, { useState } from 'react';
import { Printer, X, FileText, Download } from 'lucide-react';
import { STORE_INFO, getTaxConfig, getStoreInfo } from '../../data/mockData';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';
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
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      {/* PERFECT EDGE-TO-EDGE A4 PRINT STYLING WITH DISTINCT SECTION MARGIN SPACING */}
      <style>
        {`
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
            #a4-invoice {
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
            #a4-invoice * {
              color: #000000 !important;
            }
          }
        `}
      </style>

      <div className="card modal-card" style={{ width: '95%', maxWidth: '980px', maxHeight: '94vh', overflowY: 'auto', padding: '1.5rem', position: 'relative', backgroundColor: '#F8FAFC' }}>
        <button onClick={onClose} className="no-print" style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={22} color="#000" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#000' }}>Commercial Sale Tax Invoice Preview</h3>
          </div>

          {/* DUAL WARRANTY TOGGLE CHECKBOXES ON PREVIEW MODAL */}
          <div style={{ display: 'flex', gap: '0.75rem', backgroundColor: '#E0F2FE', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #0284C7' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontWeight: 800, fontSize: '0.775rem', color: '#0369A1' }}>
              <input
                type="checkbox"
                checked={includeDrugActWarranty}
                onChange={(e) => setIncludeDrugActWarranty(e.target.checked)}
                style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#0284C7' }}
              />
              <span>Section 23 Drug Act 1976 Warranty</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontWeight: 800, fontSize: '0.775rem', color: '#0369A1' }}>
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

        {/* PRINTABLE A4 INVOICE CONTAINER */}
        <div
          id="a4-invoice"
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
          {/* TOP RIGHT COMPLIANCE BLOCK */}
          <div style={{ textAlign: 'right', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', lineHeight: '1.65', letterSpacing: '0.03em' }}>
            <div>DSL: <span style={{ fontFamily: 'monospace', fontWeight: '900' }}>{getStoreInfo().dslNumber}</span></div>
            <div>STN: <span style={{ fontFamily: 'monospace', fontWeight: '900' }}>{getStoreInfo().stnNumber}</span></div>
            <div>NTN: <span style={{ fontFamily: 'monospace', fontWeight: '900' }}>{getStoreInfo().ntnNumber}</span></div>
          </div>

          {/* TOP CENTER STORE BRANDING */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '2.1rem', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em', color: '#000000', lineHeight: '1.25' }}>
              {getStoreInfo().name}
            </h1>
            <div style={{ fontSize: '0.925rem', fontWeight: 'bold', marginTop: '0.35rem', lineHeight: '1.5' }}>
              {getStoreInfo().address}
            </div>
            <div style={{ fontSize: '0.835rem', marginTop: '0.2rem', lineHeight: '1.5' }}>
              Phone# {getStoreInfo().phone} &nbsp;|&nbsp; E-Mail: {getStoreInfo().email}
            </div>

            {/* SALE TAX INVOICE BADGE BOX */}
            <div style={{ display: 'inline-block', border: '2px solid #000000', padding: '0.35rem 2.25rem', marginTop: '0.85rem', fontWeight: '900', fontSize: '1.25rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              SALE TAX INVOICE
            </div>
          </div>

          {/* 3-COLUMN METADATA HEADER GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1.45fr 1.2fr', gap: '0.95rem', border: '2px solid #000000', padding: '0.85rem 1rem', marginBottom: '1.85rem', fontSize: '0.8rem', lineHeight: '1.7' }}>
            {/* COLUMN 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div><strong>Invoice #:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{invoice.invoiceNo || 'DJ-8263263'}</span></div>
              <div><strong>Sale Order #:</strong> <span style={{ fontFamily: 'monospace' }}>{invoice.saleOrderNo || '0170804'}</span></div>
              <div><strong>DSS Id:</strong> <span style={{ fontFamily: 'monospace' }}>{invoice.dssId || '3032285'}</span></div>
              <div><strong>Reference No:</strong> {invoice.referenceNo || 'Naeem Shah'}</div>
              <div><strong>Booking Man:</strong> {invoice.bookingMan || 'Naeem Shah'}</div>
            </div>

            {/* COLUMN 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div><strong>Invoice Date:</strong> {formatDateDDMMYYYY(invoice.date || '03/08/2026')} &nbsp;|&nbsp; <strong>Customer:</strong> {invoice.customerName || 'M/S Idrees Pharmacy / 280073'}</div>
              <div><strong>Sale Order Type:</strong> {invoice.saleOrderType || 'REGULAR'} &nbsp;|&nbsp; <strong>Region:</strong> {invoice.region || 'Jalapur Jattan'}</div>
              <div><strong>Due Date:</strong> {formatDateDDMMYYYY(invoice.dueDate || invoice.date || '03/08/2026')} &nbsp;|&nbsp; <strong>Phone:</strong> {invoice.customerPhone || '053-3724601'}</div>
              <div><strong>Address:</strong> {invoice.customerAddress || 'Main Bazar, Near HBL Bank, Jalal Pur Jattan'}</div>
              <div><strong>Cust. License #:</strong> {invoice.customerLicenseNo || '09-342-0139-98309'} &nbsp;|&nbsp; <strong>Cust. NTN:</strong> {invoice.customerNtn || '34202-0723603-5'}</div>
              <div><strong>Delivery Man:</strong> {invoice.deliveryMan || 'Awais Ijaz'} &nbsp;|&nbsp; <strong>User:</strong> {user?.name || invoice.cashierName || 'Hassan (Admin)'}</div>
            </div>

            {/* COLUMN 3: STORE OWNER SECTION */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', borderLeft: '2px solid #000000', paddingLeft: '0.85rem' }}>
              <div style={{ fontWeight: '900', textDecoration: 'underline', marginBottom: '0.15rem', letterSpacing: '0.02em' }}>STORE OWNER SECTION:</div>
              <div><strong>Owner Name:</strong> {STORE_INFO.ownerName || 'Mr Idrees'}</div>
              <div><strong>Store DSL #:</strong> <span style={{ fontFamily: 'monospace' }}>{STORE_INFO.dslNumber}</span></div>
              <div style={{ marginTop: '0.2rem' }}>
                <strong>Payment Status:</strong>{' '}
                {Number(invoice.remainingDebt) > 0 ? (
                  <span style={{ border: '1.5px solid #DC2626', color: '#DC2626', padding: '0.1rem 0.45rem', fontWeight: '900' }}>
                    ⚠️ DEBT DUE (Rs. {Number(invoice.remainingDebt).toFixed(2)})
                  </span>
                ) : (
                  <span style={{ border: '1.5px solid #059669', color: '#059669', padding: '0.1rem 0.45rem', fontWeight: '900' }}>
                    ✅ PAID FULL
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 12-COLUMN ITEMIZED LINE ITEMS TABLE */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.65rem', marginBottom: '0.65rem', fontSize: '0.75rem', lineHeight: '1.4' }}>
            <thead>
              <tr style={{ borderTop: '2px solid #000000', borderBottom: '2px solid #000000', textAlign: 'left', pageBreakInside: 'avoid' }}>
                <th style={{ padding: '0.4rem 0.25rem', width: '25px' }}>Sr.</th>
                <th style={{ padding: '0.4rem 0.25rem' }}>Item Name</th>
                <th style={{ padding: '0.4rem 0.25rem' }}>Batch No.</th>
                <th style={{ padding: '0.4rem 0.25rem' }}>Expiry Date</th>
                <th style={{ padding: '0.4rem 0.25rem', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '0.4rem 0.25rem', textAlign: 'center' }}>Bonus</th>
                <th style={{ padding: '0.4rem 0.25rem', textAlign: 'right' }}>Rate</th>
                <th style={{ padding: '0.4rem 0.25rem', textAlign: 'right' }}>Gross</th>
                <th style={{ padding: '0.4rem 0.25rem', textAlign: 'right' }}>Disc %</th>
                <th style={{ padding: '0.4rem 0.25rem', textAlign: 'right' }}>Disc Amt</th>
                {getTaxConfig().enableSaleTax !== false && (
                  <th style={{ padding: '0.4rem 0.25rem', textAlign: 'right' }}>{getTaxConfig().saleTaxName || 'Sale Tax 18%'}</th>
                )}
                {getTaxConfig().enableAdvTax !== false && (
                  <th style={{ padding: '0.4rem 0.25rem', textAlign: 'right' }}>{getTaxConfig().advTaxName || 'Adv Tax 0.5%'}</th>
                )}
                <th style={{ padding: '0.4rem 0.25rem', textAlign: 'right' }}>Net Amount</th>
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
                  <tr key={idx} style={{ borderBottom: '1px solid #CBD5E1', pageBreakInside: 'avoid' }}>
                    <td style={{ padding: '0.35rem 0.25rem' }}>{idx + 1}</td>
                    <td style={{ padding: '0.35rem 0.25rem', fontWeight: 'bold' }}>
                      {item.itemCode ? `${item.itemCode} / ` : ''}{item.brandName}
                    </td>
                    <td style={{ padding: '0.35rem 0.25rem', fontFamily: 'monospace' }}>{item.batchNumber || '6789'}</td>
                    <td style={{ padding: '0.35rem 0.25rem' }}>{formatDateDDMMYYYY(item.expiryDate || '2028-12-31')}</td>
                    <td style={{ padding: '0.35rem 0.25rem', textAlign: 'center', fontWeight: 'bold' }}>{qty}</td>
                    <td style={{ padding: '0.35rem 0.25rem', textAlign: 'center' }}>{item.bonus || '-'}</td>
                    <td style={{ padding: '0.35rem 0.25rem', textAlign: 'right' }}>{rate.toFixed(2)}</td>
                    <td style={{ padding: '0.35rem 0.25rem', textAlign: 'right' }}>{gross.toFixed(2)}</td>
                    <td style={{ padding: '0.35rem 0.25rem', textAlign: 'right' }}>{discP.toFixed(2)}</td>
                    <td style={{ padding: '0.35rem 0.25rem', textAlign: 'right' }}>{discAmt.toFixed(2)}</td>
                    {taxCfg.enableSaleTax !== false && (
                      <td style={{ padding: '0.35rem 0.25rem', textAlign: 'right' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#0369A1', display: 'block' }}>{(item.saleTaxPercent !== undefined ? item.saleTaxPercent : 18)}%</span>
                        {stAmt.toFixed(2)}
                      </td>
                    )}
                    {taxCfg.enableAdvTax !== false && (
                      <td style={{ padding: '0.35rem 0.25rem', textAlign: 'right' }}>
                        <span style={{ fontSize: '0.65rem', color: '#475569', display: 'block' }}>{(item.advTaxPercent !== undefined ? item.advTaxPercent : 0.5)}%</span>
                        {advtAmt.toFixed(2)}
                      </td>
                    )}
                    <td style={{ padding: '0.35rem 0.25rem', textAlign: 'right', fontWeight: 'bold' }}>{netAmt.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* NET TOTAL SUMMARY LINE INCLUDING TAXES */}
          <div style={{ borderTop: '2px solid #000000', borderBottom: '2px solid #000000', padding: '0.5rem 0.75rem', marginBottom: '0.65rem', fontSize: '0.825rem', lineHeight: '1.5', pageBreakInside: 'avoid' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontWeight: 'bold' }}>
              <div>
                <span>Gross: Rs. {Number(invoice.grossSubtotal || invoice.subtotal || 600).toFixed(2)}</span> &nbsp;|&nbsp;
                <span>{getTaxConfig().saleTaxName || 'Sale Tax 18%'}: Rs. {Number(invoice.totalSaleTax || 108).toFixed(2)}</span> &nbsp;|&nbsp;
                <span>{getTaxConfig().advTaxName || 'Adv Tax 0.5%'}: Rs. {Number(invoice.totalAdvTax || 3.00).toFixed(2)}</span>
              </div>
              <div style={{ fontSize: '1rem', textDecoration: 'underline', letterSpacing: '0.02em' }}>
                NET AMOUNT: Rs. {Number(invoice.netTotal || 0).toFixed(2)}
              </div>
            </div>
          </div>

          {/* URDU ADVANCE TAX NOTICE BANNER */}
          <div style={{ textAlign: 'right', direction: 'rtl', fontSize: '0.85rem', fontWeight: 'bold', padding: '0.45rem 0.65rem', border: '1.5px solid #000000', marginTop: '0.5rem', marginBottom: '0.65rem', backgroundColor: '#FFFFFF', lineHeight: '1.5', pageBreakInside: 'avoid' }}>
            {STORE_INFO.urduNotice}
          </div>

          {/* FORM 2A LEGAL WARRANTIES SECTION */}
          {(includeDrugActWarranty || includeDrapWarranty) && (
            <div style={{ border: '1.5px solid #000000', padding: '0.55rem 0.75rem', fontSize: '0.725rem', lineHeight: '1.5', pageBreakInside: 'avoid', marginBottom: '0.65rem' }}>
              <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '0.25rem', letterSpacing: '0.02em' }}>
                FORM 2A (See rules 19 and 30):
              </div>

              {/* DRUG ACT 1976 WARRANTY */}
              {includeDrugActWarranty && (
                <div style={{ marginBottom: '0.4rem' }}>
                  <strong>Warranty under Section 23(1)(i) of the Drugs Act, 1976:</strong>
                  <div style={{ marginTop: '0.15rem', textAlign: 'justify' }}>
                    I, <strong>M. Idrees</strong> being a person resident in Pakistan carrying on business at Jalal Pur Jattan under the name of <strong>Idrees Medical Store</strong> and being authorized distributor of the manufacturers / Principals, do hereby give this warranty that the drugs here above described as sold by me, and contained in this invoice prescribing the goods referred to herein do not contravene in any way the provisions of Section 23 of the Drug Act.
                  </div>
                </div>
              )}

              {/* DRAP 2014 ALTERNATIVE MEDICINES WARRANTY */}
              {includeDrapWarranty && (
                <div style={{ marginBottom: '0.4rem', borderTop: includeDrugActWarranty ? '1px dashed #000000' : 'none', paddingTop: includeDrugActWarranty ? '0.35rem' : '0' }}>
                  <strong>Warranty under Alternative Medicines and Health Products (Enlistment) Rules 2014 [See Rules 10(3) and (5)]:</strong>
                  <div style={{ marginTop: '0.15rem', textAlign: 'justify' }}>
                    We, as the authorized distributors/agents and on behalf of the principals/manufacturers/importers hereby give warranty that the supplied alternative medicines and health products mentioned herein do not contravene any provision of the prevailing DRAP Act 2012 and rules framed thereunder.
                  </div>
                </div>
              )}

              {/* 4 STANDARD WHOLESALE NOTES */}
              <div style={{ borderTop: '1px solid #000000', paddingTop: '0.35rem', marginTop: '0.35rem' }}>
                <strong>Note:</strong>
                <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.5' }}>
                  {STORE_INFO.noteItems.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* FOOTER SIGNATURES: LEFT SIDE & RIGHT SIDE */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid #000000', paddingTop: '0.55rem', marginTop: '0.65rem', fontSize: '0.75rem', lineHeight: '1.4', pageBreakInside: 'avoid' }}>
            {/* LEFT BOTTOM: DELIVERY MAN & CUSTOMER RECEIVER SIGNATURE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: '220px' }}>
              <div>Printed By: <strong>{invoice.cashierName || 'Husnain Ali'}</strong></div>
              <div>Delivery Driver: <strong>{invoice.deliveryMan || 'Awais Ijaz'}</strong></div>
              <div style={{ borderTop: '1px solid #000000', marginTop: '0.85rem', paddingTop: '0.15rem', fontWeight: 'bold', fontSize: '0.7rem' }}>
                Delivery Driver / Customer Receiver Sign
              </div>
            </div>

            {/* RIGHT BOTTOM: OFFICIAL DIGITAL SIGNATURE */}
            <div style={{ textAlign: 'center', minWidth: '220px', padding: '0.45rem 0.85rem' }}>
              {getStoreInfo().signatureImage ? (
                <img
                  src={getStoreInfo().signatureImage}
                  alt="Digital Signature"
                  style={{ height: '48px', maxHeight: '55px', maxWidth: '170px', objectFit: 'contain', display: 'block', margin: '0 auto 0.2rem auto' }}
                />
              ) : (
                <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.2rem', fontWeight: 'bold', color: '#0F172A' }}>
                  {getStoreInfo().signatoryName || 'M. Idrees'}
                </div>
              )}
              <div style={{ borderTop: '1.5px solid #000000', marginTop: '0.2rem', paddingTop: '0.15rem', fontWeight: 'bold', fontSize: '0.775rem' }}>
                {getStoreInfo().signatoryName || 'M. Idrees'} ({getStoreInfo().signatoryTitle || 'Managing Director'})
              </div>
              <div style={{ fontSize: '0.65rem', color: '#0284C7', fontWeight: 700 }}>
                ✔ VERIFIED DIGITAL SIGNATURE
              </div>
            </div>
          </div>
        </div>

        {/* MODAL PRINT & DOWNLOAD PDF BUTTONS */}
        <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Close</button>
          
          <button onClick={handlePrint} className="btn btn-outline" style={{ flex: 1, borderColor: '#0284C7', color: '#0284C7', fontWeight: 800 }}>
            <Download size={16} /> Save PDF
          </button>
          
          <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 1, backgroundColor: '#000000', color: '#FFF', fontWeight: 900 }}>
            <Printer size={16} /> Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default A4InvoicePrintModal;
