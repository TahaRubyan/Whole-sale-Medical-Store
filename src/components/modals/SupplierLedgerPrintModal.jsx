import React from 'react';
import { Printer, X, FileText, Download } from 'lucide-react';
import { STORE_INFO, getStoreInfo } from '../../data/mockData';
import { useSupplier } from '../../context/SupplierContext';
import { printElementById } from '../../utils/printUtils';

export const SupplierLedgerPrintModal = ({ isOpen, onClose, supplier }) => {
  const { purchaseOrders, paymentsLog, rtvNotes } = useSupplier();
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

  if (!isOpen || !supplier) return null;

  const handlePrint = () => {
    printElementById('supplier-ledger-print', `Supplier Ledger Statement - ${supplier.companyName || 'Supplier'}`);
  };

  // Filter supplier transaction history
  const supPOs = purchaseOrders.filter((po) => po.distributorName && po.distributorName.toLowerCase().trim() === supplier.companyName.toLowerCase().trim());
  const supPays = paymentsLog.filter((p) => p.supplierId === supplier.id || (p.supplierName && p.supplierName.toLowerCase().trim() === supplier.companyName.toLowerCase().trim()));
  const supRTVs = rtvNotes.filter((r) => r.supplierId === supplier.id || (r.supplierName && r.supplierName.toLowerCase().trim() === supplier.companyName.toLowerCase().trim()));

  // Combine into chronological transactions
  const transactions = [
    ...supPOs.map((po) => ({
      date: po.inwardDate,
      type: 'INWARD_PO',
      ref: po.poNumber,
      description: `Inward PO (${po.items ? po.items.length : 1} Line Items)`,
      debit: po.totalAmount, // Increases pending payable balance
      credit: 0,
    })),
    ...supPays.map((pay) => ({
      date: pay.date,
      type: 'PAYMENT',
      ref: pay.id,
      description: `Payment via ${pay.paymentMode} ${pay.note ? `(${pay.note})` : ''}`,
      debit: 0,
      credit: pay.amount, // Deducts from balance
    })),
    ...supRTVs.map((rtv) => ({
      date: rtv.date,
      type: 'RTV_DEBIT_NOTE',
      ref: rtv.rtvNumber,
      description: `RTV Debit Note (${rtv.reason})`,
      debit: 0,
      credit: rtv.totalDeduction, // Deducts from balance
    })),
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Running balance calculation
  let runningBalance = 0;
  const ledgerRows = transactions.map((t) => {
    runningBalance += t.debit - t.credit;
    return { ...t, balance: runningBalance };
  });

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      {/* PRINT CSS STYLING OVERRIDE */}
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 5mm 6mm;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
              background: #FFFFFF !important;
              color: #000000 !important;
              font-family: Arial, sans-serif !important;
              font-size: 9.5pt !important;
              line-height: 1.35 !important;
            }
            body * {
              visibility: hidden !important;
            }
            #supplier-ledger-print, #supplier-ledger-print * {
              visibility: visible !important;
            }
            #supplier-ledger-print {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0.65rem !important;
              box-sizing: border-box !important;
              border: 2px solid #000000 !important;
              background: #FFFFFF !important;
              color: #000000 !important;
            }
            .no-print, button, .btn {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="card modal-card" style={{ width: '95%', maxWidth: '900px', maxHeight: '92vh', overflowY: 'auto', padding: '1.5rem', position: 'relative', backgroundColor: '#F8FAFC' }}>
        <button onClick={onClose} className="no-print" style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <FileText size={22} color="#000" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#000' }}>Distributor Account Ledger Statement</h3>
        </div>

        {/* PRINTABLE LEDGER CONTAINER */}
        <div
          id="supplier-ledger-print"
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
          {/* STORE BRANDING HEADER */}
          <div style={{ textAlign: 'center', marginBottom: '1.1rem', borderBottom: '2px solid #000000', paddingBottom: '0.65rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              {getStoreInfo().name}
            </h2>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginTop: '0.15rem' }}>{getStoreInfo().address}</div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.1rem' }}>Phone: {getStoreInfo().phone} | STN: {getStoreInfo().stnNumber}</div>
            <div style={{ display: 'inline-block', border: '2px solid #000000', padding: '0.25rem 1.5rem', marginTop: '0.65rem', fontWeight: 900, fontSize: '1.15rem', letterSpacing: '0.03em' }}>
              DISTRIBUTOR LEDGER ACCOUNT STATEMENT
            </div>
          </div>

          {/* SUPPLIER PROFILE METADATA */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', border: '1.5px solid #000000', padding: '0.75rem', marginBottom: '1.1rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div><strong>Distributor Name:</strong> {supplier.companyName}</div>
              <div><strong>Contact Person:</strong> {supplier.contactPerson || '-'}</div>
              <div><strong>Phone Number:</strong> {supplier.phone || '-'}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div><strong>GSTIN / Tax ID:</strong> {supplier.gstin || 'STN: 3277876174544'}</div>
              <div><strong>Credit Terms:</strong> {supplier.creditDays || 30} Days Credit</div>
              <div><strong>Current Pending Payable Balance:</strong> <strong style={{ textDecoration: 'underline' }}>Rs. {Number(supplier.pendingBalance || 0).toLocaleString()}</strong></div>
            </div>
          </div>

          {/* LEDGER TRANSACTION TABLE */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.1rem', fontSize: '0.775rem' }}>
            <thead>
              <tr style={{ borderTop: '2px solid #000000', borderBottom: '2px solid #000000', textAlign: 'left' }}>
                <th style={{ padding: '0.45rem 0.35rem' }}>Date</th>
                <th style={{ padding: '0.45rem 0.35rem' }}>Ref #</th>
                <th style={{ padding: '0.45rem 0.35rem' }}>Transaction Details</th>
                <th style={{ padding: '0.45rem 0.35rem', textAlign: 'right' }}>Debit (PO Cost)</th>
                <th style={{ padding: '0.45rem 0.35rem', textAlign: 'right' }}>Credit (Paid/RTV)</th>
                <th style={{ padding: '0.45rem 0.35rem', textAlign: 'right' }}>Running Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledgerRows.length > 0 ? (
                ledgerRows.map((r, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #CBD5E1' }}>
                    <td style={{ padding: '0.4rem 0.35rem' }}>{r.date}</td>
                    <td style={{ padding: '0.4rem 0.35rem', fontFamily: 'monospace', fontWeight: 'bold' }}>{r.ref}</td>
                    <td style={{ padding: '0.4rem 0.35rem' }}>{r.description}</td>
                    <td style={{ padding: '0.4rem 0.35rem', textAlign: 'right' }}>{r.debit > 0 ? `Rs. ${r.debit.toLocaleString()}` : '-'}</td>
                    <td style={{ padding: '0.4rem 0.35rem', textAlign: 'right', color: '#059669', fontWeight: 'bold' }}>{r.credit > 0 ? `Rs. ${r.credit.toLocaleString()}` : '-'}</td>
                    <td style={{ padding: '0.4rem 0.35rem', textAlign: 'right', fontWeight: 'bold' }}>Rs. {r.balance.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No transaction history logged for this distributor yet.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* NET BALANCE FOOTER SUMMARY */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px solid #000000', borderBottom: '2px solid #000000', padding: '0.65rem', fontWeight: 'bold', fontSize: '0.95rem' }}>
            <span>NET OUTSTANDING PAYABLE BALANCE: Rs. {Number(supplier.pendingBalance || 0).toLocaleString()}</span>
          </div>

          {/* OFFICIAL DIGITAL SIGNATURE FOOTER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.5rem', paddingTop: '0.85rem', borderTop: '1px solid #000000', fontSize: '0.75rem' }}>
            <div>
              <div>Verified By: <strong>{getStoreInfo().name}</strong></div>
              <div>Account Statement Date: {new Date().toLocaleDateString('en-PK')}</div>
            </div>
            <div style={{ textAlign: 'center', minWidth: '180px' }}>
              {getStoreInfo().signatureImage ? (
                <img
                  src={getStoreInfo().signatureImage}
                  alt="Digital Signature"
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

        {/* MODAL PRINT BUTTONS */}
        <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Close</button>
          <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 1, backgroundColor: '#000000', color: '#FFF', fontWeight: 900 }}>
            <Printer size={16} /> Print / Save Ledger PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierLedgerPrintModal;
