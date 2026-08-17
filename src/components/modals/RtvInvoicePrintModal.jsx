import React from 'react';
import { Printer, X, FileText } from 'lucide-react';
import { getStoreInfo } from '../../data/mockData';
import { printElementById } from '../../utils/printUtils';

export const RtvInvoicePrintModal = ({ rtv, onClose }) => {
  if (!rtv) return null;

  const handlePrint = () => {
    printElementById('rtv-invoice-print', `RTV Debit Note Voucher - ${rtv.rtvNumber || 'RTV'}`);
  };

  const storeInfo = getStoreInfo();
  const distributorName = rtv.distributorName || rtv.supplierName || 'Pharma Supplier';
  const refundTotal = Number(rtv.agreedRefundAmount !== undefined ? rtv.agreedRefundAmount : (rtv.totalDeduction || 0));
  const itemBrand = rtv.brandName || (rtv.items && rtv.items[0] && rtv.items[0].medicineName) || 'Near-Expiry Stock Return';
  const batchNo = rtv.batchNumber || (rtv.items && rtv.items[0] && rtv.items[0].batchNumber) || '-';
  const boxQty = rtv.returnedBoxes || (rtv.items && rtv.items[0] && rtv.items[0].quantity) || 1;

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
            #rtv-invoice-print {
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
            #rtv-invoice-print * {
              visibility: visible !important;
            }
          }
        `}
      </style>

      <div className="card modal-card" style={{ width: '95%', maxWidth: '850px', maxHeight: '92vh', overflowY: 'auto', padding: '1.5rem', position: 'relative', backgroundColor: '#F8FAFC' }}>
        <button onClick={onClose} className="no-print" style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <FileText size={22} color="#EF4444" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#000' }}>Return to Vendor (RTV) Debit Note Voucher</h3>
        </div>

        {/* PRINTABLE RTV INVOICE CONTAINER */}
        <div
          id="rtv-invoice-print"
          style={{
            backgroundColor: '#FFFFFF',
            border: '2px solid #000000',
            padding: '1.5rem',
            fontSize: '0.825rem',
            color: '#000000',
            fontFamily: 'Arial, sans-serif',
            lineHeight: 1.4
          }}
        >
          {/* STORE HEADER */}
          <div style={{ textAlign: 'center', marginBottom: '1.1rem', borderBottom: '2px solid #000000', paddingBottom: '0.65rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              {storeInfo.name}
            </h1>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginTop: '0.15rem' }}>{storeInfo.address}</div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.1rem' }}>Phone# {storeInfo.phone} | STN: {storeInfo.stnNumber}</div>

            <div style={{ display: 'inline-block', border: '2px solid #000000', padding: '0.25rem 1.5rem', marginTop: '0.65rem', fontWeight: 900, fontSize: '1.15rem', letterSpacing: '0.03em' }}>
              RETURN TO VENDOR (RTV) DEBIT NOTE
            </div>
          </div>

          {/* RTV METADATA GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', border: '1.5px solid #000000', padding: '0.75rem', marginBottom: '1.1rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div><strong>RTV Debit Note #:</strong> {rtv.rtvNumber}</div>
              <div><strong>Return Date:</strong> {rtv.date || rtv.createdAt}</div>
              <div><strong>Return Reason:</strong> {rtv.reason}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div><strong>Vendor / Supplier:</strong> {distributorName}</div>
              <div><strong>Authorized Seller:</strong> {storeInfo.signatoryName || 'M. Idrees'}</div>
              <div><strong>Agreed Refund Amount:</strong> <strong style={{ textDecoration: 'underline', color: '#059669' }}>Rs. {refundTotal.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</strong></div>
            </div>
          </div>

          {/* RETURNED ITEMS TABLE */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.1rem', fontSize: '0.775rem' }}>
            <thead>
              <tr style={{ borderTop: '2px solid #000000', borderBottom: '2px solid #000000', textAlign: 'left' }}>
                <th style={{ padding: '0.45rem 0.35rem', width: '30px' }}>Sr.</th>
                <th style={{ padding: '0.45rem 0.35rem' }}>Item Description</th>
                <th style={{ padding: '0.45rem 0.35rem' }}>Batch #</th>
                <th style={{ padding: '0.45rem 0.35rem', textAlign: 'center' }}>Returned Boxes</th>
                <th style={{ padding: '0.45rem 0.35rem', textAlign: 'right' }}>Agreed Refund Total</th>
              </tr>
            </thead>
            <tbody>
              {rtv.items ? (
                rtv.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #CBD5E1' }}>
                    <td style={{ padding: '0.4rem 0.35rem' }}>{idx + 1}</td>
                    <td style={{ padding: '0.4rem 0.35rem', fontWeight: 'bold' }}>{item.medicineName || item.brandName}</td>
                    <td style={{ padding: '0.4rem 0.35rem', fontFamily: 'monospace' }}>{item.batchNumber}</td>
                    <td style={{ padding: '0.4rem 0.35rem', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity || item.returnedBoxes}</td>
                    <td style={{ padding: '0.4rem 0.35rem', textAlign: 'right', fontWeight: 'bold' }}>Rs. {Number(item.totalAmount || refundTotal).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr style={{ borderBottom: '1px solid #CBD5E1' }}>
                  <td style={{ padding: '0.4rem 0.35rem' }}>1</td>
                  <td style={{ padding: '0.4rem 0.35rem', fontWeight: 'bold' }}>{itemBrand}</td>
                  <td style={{ padding: '0.4rem 0.35rem', fontFamily: 'monospace' }}>{batchNo}</td>
                  <td style={{ padding: '0.4rem 0.35rem', textAlign: 'center', fontWeight: 'bold' }}>{boxQty}</td>
                  <td style={{ padding: '0.4rem 0.35rem', textAlign: 'right', fontWeight: 'bold' }}>Rs. {refundTotal.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* TOTAL SUMMARY */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px solid #000000', borderBottom: '2px solid #000000', padding: '0.65rem', marginBottom: '1.1rem', fontWeight: 900, fontSize: '1rem' }}>
            <span>TOTAL RTV CREDIT REFUND: Rs. {refundTotal.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* REASON NOTE & FOOTER METADATA */}
          <div style={{ border: '1.5px solid #000000', padding: '0.65rem', marginBottom: '1.1rem', fontSize: '0.775rem' }}>
            <strong>Discrepancy / Return Note:</strong>
            <p style={{ margin: '0.25rem 0 0 0' }}>
              The near-expiry stock listed above has been officially returned to distributor <strong>{distributorName}</strong>. The credit refund amount of <strong>Rs. {refundTotal.toLocaleString('en-PK')}</strong> has been adjusted on the supplier ledger under Drug Act 1976 & DRAP Rules 2014.
            </p>
          </div>

          {/* DIGITAL SIGNATURE BOX */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1.5px solid #000000', paddingTop: '0.65rem', fontSize: '0.75rem' }}>
            <div>
              <div>Processed By: <strong>{rtv.createdBy || 'Husnain Ali (Store Manager)'}</strong></div>
            </div>

            <div style={{ border: '1px solid #000000', padding: '0.4rem 0.75rem', textAlign: 'center', minWidth: '190px' }}>
              {storeInfo.signatureImage ? (
                <img src={storeInfo.signatureImage} alt="Authorized Signature" style={{ maxHeight: '40px', objectFit: 'contain' }} />
              ) : (
                <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {storeInfo.signatoryName || 'M. Idrees'}
                </div>
              )}
              <div style={{ borderTop: '1px solid #000000', marginTop: '0.25rem', paddingTop: '0.1rem', fontWeight: 'bold' }}>
                {storeInfo.signatoryName || 'M. Idrees'} ({storeInfo.signatoryTitle || 'Managing Director'})
              </div>
              <div style={{ fontSize: '0.65rem', color: '#0284C7', fontWeight: 700 }}>
                ✔ VERIFIED RTV DEBIT NOTE
              </div>
            </div>
          </div>
        </div>

        {/* MODAL PRINT BUTTONS */}
        <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Close</button>
          <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 1, backgroundColor: '#000000', color: '#FFF', fontWeight: 900 }}>
            <Printer size={16} /> Print RTV Debit Note Voucher
          </button>
        </div>
      </div>
    </div>
  );
};

export default RtvInvoicePrintModal;
