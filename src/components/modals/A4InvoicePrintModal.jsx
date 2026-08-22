import React, { useState } from 'react';
import { Printer, X, FileText, Download } from 'lucide-react';
import { STORE_INFO, getTaxConfig, getStoreInfo } from '../../data/mockData';
import { formatDateDDMMYYYY, formatExpiryMMYYYY } from '../../utils/dateUtils';
import { numberToWordsPKR } from '../../utils/numberUtils';
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

  // Dual warranty switches
  const [includeDrugActWarranty, setIncludeDrugActWarranty] = useState(
    invoice && invoice.includeDrugActWarranty !== undefined ? invoice.includeDrugActWarranty : true
  );
  const [includeDrapWarranty, setIncludeDrapWarranty] = useState(
    invoice && invoice.includeDrapWarranty !== undefined ? invoice.includeDrapWarranty : true
  );

  if (!invoice) return null;

  const handlePrint = () => {
    printElementById('a4-invoice-container', `Invoice - ${invoice.invoiceNo || 'Document'}`);
  };

  const store = getStoreInfo();
  const items = invoice.items || [];
  
  // Page capacity: 10 items per page. Data exceeds to next page ONLY when first page limit is reached
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));

  // Partition items into pages
  const pages = [];
  for (let i = 0; i < totalPages; i++) {
    pages.push(items.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));
  }

  // Summary Totals Calculation (FBR Sales Tax 18% Only)
  const totalQty = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const totalGross = Number(invoice.grossSubtotal || invoice.subtotal || items.reduce((sum, item) => sum + ((Number(item.quantity) || 1) * (Number(item.unitPrice) || 600)), 0));
  const totalDiscount = Number(invoice.discountAmount || 0);
  const totalST = Number(invoice.totalSaleTax || 0);
  const netPayable = Number(invoice.netTotal || 0);
  const netInWords = numberToWordsPKR(netPayable);

  const printTimestamp = new Date().toLocaleString('en-PK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      {/* HIGH-CONTRAST COMMERCIAL INVOICE PRINT STYLING */}
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 6mm 8mm 8mm 8mm;
            }
            html, body, #root, .app-container, .main-viewport, .content-area {
              height: auto !important;
              min-height: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #FFFFFF !important;
              color: #000000 !important;
              font-family: Arial, Helvetica, sans-serif !important;
              font-size: 8pt !important;
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
              margin: 0 !important;
              padding: 0 !important;
              background: #FFFFFF !important;
              box-shadow: none !important;
              border: none !important;
            }
            .modal-card {
              position: static !important;
              display: block !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #FFFFFF !important;
              box-shadow: none !important;
              border: none !important;
            }
            #a4-invoice-container {
              display: block !important;
              width: 100% !important;
              background: #FFFFFF !important;
              color: #000000 !important;
            }
            .a4-page {
              page-break-after: always !important;
              break-after: page !important;
              min-height: 280mm !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
              display: flex !important;
              flex-direction: column !important;
              justifyContent: space-between !important;
            }
            .a4-page:last-child {
              page-break-after: auto !important;
              break-after: auto !important;
            }
          }
        `}
      </style>

      <div className="modal-card" style={{ width: '96%', maxWidth: '1020px', maxHeight: '95vh', overflowY: 'auto', padding: '1.5rem', position: 'relative', backgroundColor: '#F1F5F9', borderRadius: '8px' }}>
        {/* TOP MODAL CONTROLS */}
        <button onClick={onClose} className="no-print" style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
          <X size={22} />
        </button>

        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={22} color="#0F172A" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Commercial Sales Invoice ({totalPages} Page{totalPages > 1 ? 's' : ''})
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', backgroundColor: '#FFFFFF', padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', color: '#0F172A' }}>
              <input
                type="checkbox"
                checked={includeDrugActWarranty}
                onChange={(e) => setIncludeDrugActWarranty(e.target.checked)}
                style={{ width: '14px', height: '14px', cursor: 'pointer', accentColor: '#000000' }}
              />
              <span>Section 23 Drugs Act Warranty</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', color: '#0F172A' }}>
              <input
                type="checkbox"
                checked={includeDrapWarranty}
                onChange={(e) => setIncludeDrapWarranty(e.target.checked)}
                style={{ width: '14px', height: '14px', cursor: 'pointer', accentColor: '#000000' }}
              />
              <span>DRAP 2014 / Form-5 Warranty</span>
            </label>
          </div>
        </div>

        {/* CONTAINER FOR ALL A4 PAGES (EACH PAGE HAS FULL HEADER & FOOTER) */}
        <div id="a4-invoice-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {pages.map((pageItems, pageIdx) => {
            return (
              <div
                key={pageIdx}
                className="a4-page"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#000000',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  padding: '24px 28px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  fontSize: '8pt',
                  lineHeight: 1.35,
                  minHeight: '1050px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box'
                }}
              >
                {/* 1. TOP HEADER & METADATA SECTION */}
                <div>
                  {/* TITLE & HEADER BAR */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #000000', paddingBottom: '6px', marginBottom: '8px' }}>
                    {/* LEFT: SHOP OWNER / DISTRIBUTOR DETAILS */}
                    <div style={{ flex: 1.3, lineHeight: '1.35' }}>
                      <div style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', color: '#000000', letterSpacing: '-0.01em' }}>
                        {store.name || 'Idrees Medical Store'}
                      </div>
                      <div style={{ fontSize: '7.5pt', color: '#000000', marginTop: '2px' }}>
                        <div><strong>Owner N.T.N.:</strong> {store.ntnNumber || '-'}</div>
                        <div><strong>Owner S.T.R.N. / GSTN:</strong> {store.stnNumber || '-'}</div>
                        <div><strong>Store Address:</strong> {store.address || 'Commercial Wholesale Market'} {store.phone ? `• Tel: ${store.phone}` : ''}</div>
                        <div style={{ marginTop: '1px' }}>
                          <strong>Depot DSL#:</strong> {store.dslNumber || '-'}
                        </div>
                      </div>
                    </div>

                    {/* CENTER: INVOICE TITLE */}
                    <div style={{ flex: 0.8, textAlign: 'center' }}>
                      <span style={{ fontSize: '14pt', fontWeight: '900', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '2px solid #000000', paddingBottom: '2px' }}>
                        INVOICE
                      </span>
                    </div>

                    {/* RIGHT: PRINT META & PAGE N OF M */}
                    <div style={{ flex: 0.9, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                      <div style={{ fontSize: '7.5pt', fontWeight: 'bold' }}>Printed On: {printTimestamp}</div>
                      <div style={{ fontSize: '9pt', fontWeight: '900', border: '1px solid #000000', padding: '2px 8px', borderRadius: '3px', marginTop: '2px' }}>
                        Page {pageIdx + 1} of {totalPages}
                      </div>
                    </div>
                  </div>

                  {/* 2 DISTINCT METADATA SECTIONS: CUSTOMER DETAILS vs INVOICE DETAILS */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '16px', borderBottom: '1px solid #000000', paddingBottom: '6px', marginBottom: '8px', fontSize: '7.5pt', lineHeight: '1.4' }}>
                    {/* LEFT COLUMN: CUSTOMER SECTION */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5px' }}>
                      <div style={{ fontSize: '7.5pt', fontWeight: 'bold', textDecoration: 'underline', textTransform: 'uppercase', marginBottom: '2px' }}>
                        Customer Details
                      </div>
                      <div><span style={{ width: '115px', display: 'inline-block', fontWeight: 'bold' }}>Customer Code:</span> {invoice.customerId || invoice.customerCode || '-'}</div>
                      <div><span style={{ width: '115px', display: 'inline-block', fontWeight: 'bold' }}>Customer Name:</span> <strong>{invoice.customerName || '-'}</strong></div>
                      <div><span style={{ width: '115px', display: 'inline-block', fontWeight: 'bold' }}>Customer Address:</span> {invoice.customerAddress || '-'}</div>
                      <div><span style={{ width: '115px', display: 'inline-block', fontWeight: 'bold' }}>Customer NTN/CNIC:</span> {invoice.customerNtn || invoice.customerCnic || '-'}</div>
                      <div><span style={{ width: '115px', display: 'inline-block', fontWeight: 'bold' }}>Customer STRN:</span> {invoice.customerStrn || '-'}</div>
                      <div><span style={{ width: '115px', display: 'inline-block', fontWeight: 'bold' }}>Delivered By:</span> {invoice.deliveryMan || '-'} &nbsp;&nbsp;&nbsp; <strong>Delivery Date:</strong> {formatDateDDMMYYYY(invoice.date || new Date())}</div>
                    </div>

                    {/* RIGHT COLUMN: INVOICE DETAILS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5px' }}>
                      <div style={{ fontSize: '7.5pt', fontWeight: 'bold', textDecoration: 'underline', textTransform: 'uppercase', marginBottom: '2px' }}>
                        Invoice Details
                      </div>
                      <div><span style={{ width: '110px', display: 'inline-block', fontWeight: 'bold' }}>Invoice Number:</span> <strong>{invoice.invoiceNo || '-'}</strong></div>
                      <div><span style={{ width: '110px', display: 'inline-block', fontWeight: 'bold' }}>Invoice Date:</span> {formatDateDDMMYYYY(invoice.date || new Date())}</div>
                      <div><span style={{ width: '110px', display: 'inline-block', fontWeight: 'bold' }}>Booked By:</span> {invoice.bookingMan || invoice.cashierName || user?.name || '-'}</div>
                      <div><span style={{ width: '110px', display: 'inline-block', fontWeight: 'bold' }}>Payment Due Date:</span> {formatDateDDMMYYYY(invoice.dueDate || invoice.date || new Date())}</div>
                    </div>
                  </div>

                  {/* CONTINUED FROM PREVIOUS PAGE INDICATOR */}
                  {pageIdx > 0 && (
                    <div style={{ fontStyle: 'italic', fontWeight: 'bold', fontSize: '7.5pt', marginBottom: '4px' }}>
                      ...Continued from Page {pageIdx}
                    </div>
                  )}

                  {/* 2. ITEMIZED PRODUCTS TABLE */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7.5pt', marginBottom: '6px' }}>
                    <thead>
                      <tr style={{ borderTop: '1px solid #000000', borderBottom: '1px solid #000000', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#F8FAFC' }}>
                        <th style={{ padding: '5px 3px', width: '28px' }}>Sr.</th>
                        <th style={{ padding: '5px 3px' }}>Item Name</th>
                        <th style={{ padding: '5px 3px', width: '70px' }}>Batch No.</th>
                        <th style={{ padding: '5px 3px', width: '60px' }}>Expiry</th>
                        <th style={{ padding: '5px 3px', textAlign: 'center', width: '35px' }}>Qty</th>
                        <th style={{ padding: '5px 3px', textAlign: 'right', width: '60px' }}>Rate</th>
                        <th style={{ padding: '5px 3px', textAlign: 'right', width: '70px' }}>Gross</th>
                        <th style={{ padding: '5px 3px', textAlign: 'right', width: '50px' }}>Disc %</th>
                        <th style={{ padding: '5px 3px', textAlign: 'right', width: '75px' }}>Sale Tax 18%</th>
                        <th style={{ padding: '5px 3px', textAlign: 'right', width: '85px' }}>Net Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((item, idx) => {
                        const globalIndex = pageIdx * ITEMS_PER_PAGE + idx;
                        const qty = Number(item.quantity) || 1;
                        const rate = Number(item.unitPrice) || 600;
                        const gross = item.gross || (qty * rate);
                        const discP = item.discPercent || 0;
                        const discAmt = item.discAmount || (gross * (discP / 100));
                        const discountedGross = gross - discAmt;

                        const taxCfg = getTaxConfig();
                        const stAmt = taxCfg.enableSaleTax !== false ? (item.saleTaxAmt !== undefined ? item.saleTaxAmt : (discountedGross * 0.18)) : 0;
                        const netAmt = item.total || (discountedGross + stAmt);

                        return (
                          <tr key={idx} style={{ borderBottom: '1px dotted #CCCCCC' }}>
                            <td style={{ padding: '4px 3px', color: '#000000', fontWeight: 'bold' }}>{globalIndex + 1}</td>
                            <td style={{ padding: '4px 3px', fontWeight: 'bold' }}>
                              {item.brandName} {item.genericFormula ? `(${item.genericFormula})` : ''}
                            </td>
                            <td style={{ padding: '4px 3px', fontFamily: 'monospace', fontWeight: 'bold' }}>{item.batchNumber || '-'}</td>
                            <td style={{ padding: '4px 3px' }}>{formatExpiryMMYYYY(item.expiryDate || '2028-12')}</td>
                            <td style={{ padding: '4px 3px', textAlign: 'center', fontWeight: '900' }}>{qty}</td>
                            <td style={{ padding: '4px 3px', textAlign: 'right' }}>{rate.toFixed(2)}</td>
                            <td style={{ padding: '4px 3px', textAlign: 'right' }}>{gross.toFixed(2)}</td>
                            <td style={{ padding: '4px 3px', textAlign: 'right' }}>{discP > 0 ? `${discP.toFixed(1)}%` : '-'}</td>
                            <td style={{ padding: '4px 3px', textAlign: 'right' }}>{stAmt.toFixed(2)}</td>
                            <td style={{ padding: '4px 3px', textAlign: 'right', fontWeight: '900' }}>{netAmt.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 3. FINANCIAL TOTALS, URDU NOTE, FORM 2A WARRANTIES & SIGNATURES (ON EVERY PAGE) */}
                <div>
                  {/* SUMMARY TOTALS BREAKDOWN */}
                  <div style={{ borderTop: '1px solid #000000', borderBottom: '1px solid #000000', padding: '6px 4px', marginBottom: '6px', display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '12px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '7.5pt' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Gross Total:</span>
                        <strong>Rs. {totalGross.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</strong>
                      </div>
                      {totalDiscount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Discount Total:</span>
                          <strong>- Rs. {totalDiscount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</strong>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Sales Tax (FBR 18%):</span>
                        <strong>+ Rs. {totalST.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</strong>
                      </div>
                      <div style={{ marginTop: '3px', fontWeight: 'bold' }}>
                        Net Total In Words: <span style={{ textTransform: 'capitalize' }}>{netInWords}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '1px solid #E2E8F0', paddingLeft: '12px' }}>
                      <div style={{ fontSize: '7.5pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Grand Net Total
                      </div>
                      <div style={{ fontSize: '13pt', fontWeight: '900', marginTop: '2px' }}>
                        Rs. {netPayable.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* URDU NOTICE BANNER */}
                  <div style={{ textAlign: 'right', direction: 'rtl', fontSize: '7.5pt', fontWeight: 'bold', padding: '3px 8px', marginBottom: '4px', border: '1px solid #000000', backgroundColor: '#F8FAFC', lineHeight: '1.4' }}>
                    {store.urduNotice || 'برائے مہربانی انوائس پر اپنا این-ٹی-این اور شناختی کارڈ نمبر چیک کر لیں غلط ٹیکس جمع ہونے کی صورت میں کمپنی ذمہ دار نہیں ہوگی'}
                  </div>

                  {/* FORM 2A LEGAL WARRANTIES SECTION */}
                  {(includeDrugActWarranty || includeDrapWarranty) && (
                    <div style={{ borderTop: '1px solid #000000', paddingTop: '4px', fontSize: '6.5pt', lineHeight: '1.25', color: '#000000', marginBottom: '6px' }}>
                      <div style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '2px' }}>
                        FORM 2A (SEE RULES 19 & 30)
                      </div>

                      {includeDrugActWarranty && (
                        <div style={{ marginBottom: '2px', textAlign: 'justify' }}>
                          <strong>(i) WARRANTY UNDER SECTION 23(1)(i) OF THE DRUGS ACT, 1976:</strong> I, <strong>{store.signatoryName || 'Authorized Signatory'}</strong> being a person resident in Pakistan, carrying on business at the aforesaid address under the name of <strong>{store.name}</strong> having valid license(s) as mentioned above issued by Licensing Authority, and being Importers/Authorized Distributors of the Manufacturers / Principals, do hereby give this warranty that the drugs here above described as sold by me/specified and contained in the invoice or other document describing the goods referred to herein do not contravene in any way the provisions of section 23 of the Drugs Act, 1976.
                        </div>
                      )}

                      {includeDrapWarranty && (
                        <>
                          <div style={{ marginBottom: '2px', textAlign: 'justify' }}>
                            <strong>(ii) FORM-5 [see rule 6(2)(1), 8(5)(b), 16(7) and 49(1)(i)] Warranty under Medical Devices Rules, 2017:</strong> I, <strong>{store.signatoryName || 'Authorized Signatory'}</strong> being a person resident in Pakistan, carrying on business at aforesaid address under the name of <strong>{store.name}</strong> holding valid license issued by Licensing Authority and having authority or being authorized by Manufacturers / Principals vide letters, do hereby give this warranty that the medical devices hereabove described as sold by me and contained in the bill of sale, invoice, bill of lading or other document describing the medical devices referred to herein do not contravene in any way the provisions of the DRAP Act, 2012 and the rules framed thereunder.
                          </div>

                          <div style={{ textAlign: 'justify' }}>
                            <strong>(iii) Warranty Under Alternative Medicines & Health Products (Enlistment) Rules, 2014. [See rule 10 (3) & (5)]:</strong> We, as the authorized distributors/agents and on behalf of the Principals / Manufacturers / Importers hereby give warranty that the supplied alternative medicines and health products mentioned herein do not contravene any provision of the prevailing DRAP Act and rules framed thereunder.
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* DUAL SIGNATURES SECTION */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #000000', paddingTop: '6px', fontSize: '7.5pt' }}>
                    {/* LEFT SIGNATURE: DIGITAL SIGNATURE WITH IMAGE & NAME */}
                    <div style={{ minWidth: '220px' }}>
                      {store.signatureImage ? (
                        <img
                          src={store.signatureImage}
                          alt="Signature"
                          style={{ height: '36px', maxHeight: '40px', maxWidth: '140px', objectFit: 'contain', display: 'block', marginBottom: '2px' }}
                        />
                      ) : (
                        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '10pt', fontWeight: 'bold', marginBottom: '2px' }}>
                          {store.signatoryName || 'Authorized Signatory'}
                        </div>
                      )}
                      <div style={{ borderTop: '1px solid #000000', paddingTop: '2px', fontWeight: 'bold' }}>
                        Signature of Warrantor: For {store.name} ({store.signatoryName || 'Authorized Signatory'})
                      </div>
                    </div>

                    {/* RIGHT SIGNATURE: CUSTOMER RECEIVER SIGNATURE */}
                    <div style={{ textAlign: 'right', minWidth: '260px' }}>
                      <div style={{ height: '28px' }}></div>
                      <div style={{ borderTop: '1px solid #000000', paddingTop: '2px', fontSize: '6.5pt', fontWeight: 'bold' }}>
                        Customer Receiver Sign: I Confirm that I have read and agree with Terms printed overleaf.
                      </div>
                    </div>
                  </div>

                  {/* FOOTER BOTTOM PAGE NUMBER (PAGE N OF M) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '2px', borderTop: '1px dotted #000000', fontSize: '6.5pt', color: '#000000' }}>
                    <span>Original Customer Delivery Copy</span>
                    <span style={{ fontWeight: 'bold' }}>Page {pageIdx + 1} of {totalPages}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Close</button>
          
          <button onClick={handlePrint} className="btn btn-outline" style={{ flex: 1, borderColor: '#000000', color: '#000000', fontWeight: 800 }}>
            <Download size={16} /> Save PDF
          </button>
          
          <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 1, backgroundColor: '#000000', color: '#FFF', fontWeight: 900 }}>
            <Printer size={16} /> Print Invoice ({totalPages} Page{totalPages > 1 ? 's' : ''})
          </button>
        </div>
      </div>
    </div>
  );
};

export default A4InvoicePrintModal;
