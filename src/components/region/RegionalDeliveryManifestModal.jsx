import React, { useMemo } from 'react';
import { Printer, X, Download, MapPin, Truck, FileText, CheckCircle } from 'lucide-react';
import { STORE_INFO } from '../../data/mockData';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';
import { printElementById } from '../../utils/printUtils';

export const RegionalDeliveryManifestModal = ({ isOpen, onClose, selectedRegion, invoices = [] }) => {
  if (!isOpen) return null;

  // Filter invoices for selected region if specific region chosen
  const manifestInvoices = useMemo(() => {
    if (!selectedRegion || selectedRegion === 'All Regions') {
      return invoices;
    }
    return invoices.filter((inv) => inv.region === selectedRegion);
  }, [invoices, selectedRegion]);

  // Aggregate Delivery Stats
  const manifestStats = useMemo(() => {
    let totalShops = manifestInvoices.length;
    let totalSalesNet = 0;
    let totalOutstandingDebt = 0;
    let totalCashSettled = 0;

    manifestInvoices.forEach((inv) => {
      const net = Number(inv.netTotal || inv.subtotal || 0);
      const remaining = inv.remainingDebt !== undefined ? Number(inv.remainingDebt) : net;
      totalSalesNet += net;
      totalOutstandingDebt += remaining;

      // Sum up cash settled from logs
      const logs = inv.paymentLogs || [];
      const invoiceSettled = logs.reduce((sum, l) => sum + Number(l.amountPaid || 0), 0);
      totalCashSettled += invoiceSettled;
    });

    // Extract primary delivery personnel for region
    const deliveryPersons = Array.from(
      new Set(manifestInvoices.map((inv) => inv.deliveryMan).filter(Boolean))
    );
    const primaryDeliveryMan = deliveryPersons.length > 0 ? deliveryPersons.join(', ') : 'Unassigned Route';

    return {
      totalShops,
      totalSalesNet,
      totalOutstandingDebt,
      totalCashSettled,
      primaryDeliveryMan,
    };
  }, [manifestInvoices]);

  const handlePrint = () => {
    printElementById('region-manifest-pdf', `Regional Delivery Manifest - ${selectedRegion || 'All Regions'}`);
  };

  const currentDateStr = formatDateDDMMYYYY(new Date());

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justify: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      {/* @media print CSS DOM isolation targeting #region-manifest-pdf */}
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
              margin: 0 !important;
              padding: 0 !important;
              background: #FFFFFF !important;
              backdrop-filter: none !important;
              box-shadow: none !important;
              border: none !important;
            }
            .modal-card, .card {
              position: static !important;
              display: block !important;
              width: 100% !important;
              max-width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #FFFFFF !important;
              box-shadow: none !important;
              border: none !important;
            }
            #region-manifest-pdf {
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
            }
            #region-manifest-pdf * {
              color: #000000 !important;
            }
          }
        `}
      </style>

      <div
        className="card modal-card"
        style={{
          width: '95%',
          maxWidth: '1020px',
          maxHeight: '94vh',
          overflowY: 'auto',
          padding: '1.5rem',
          position: 'relative',
          backgroundColor: '#F8FAFC',
          borderRadius: '12px',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="no-print"
          style={{
            position: 'absolute',
            right: '1rem',
            top: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#64748B',
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Top Controls Bar */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={24} color="#0284C7" />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                A4 Regional Delivery Manifest & Settlement PDF
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                Region: <strong style={{ color: '#0284C7' }}>{selectedRegion || 'All Regions'}</strong> | Delivery Man: <strong>{manifestStats.primaryDeliveryMan}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              className="btn btn-outline"
              style={{
                borderColor: '#0284C7',
                color: '#0284C7',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                fontSize: '0.85rem',
              }}
            >
              <Download size={16} /> Save PDF
            </button>

            <button
              onClick={handlePrint}
              className="btn btn-primary"
              style={{
                backgroundColor: '#0284C7',
                color: '#FFF',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                fontSize: '0.85rem',
              }}
            >
              <Printer size={16} /> Export A4 Manifest
            </button>
          </div>
        </div>

        {/* PRINTABLE A4 CONTAINER FOR DOM ISOLATION (#region-manifest-pdf) */}
        <div
          id="region-manifest-pdf"
          style={{
            backgroundColor: '#FFFFFF',
            border: '2px solid #000000',
            padding: '1.75rem',
            fontSize: '0.835rem',
            color: '#000000',
            fontFamily: 'Arial, sans-serif',
            lineHeight: 1.6,
            boxSizing: 'border-box',
          }}
        >
          {/* STORE HEADER BRANDING */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <h1
              style={{
                fontSize: '2.1rem',
                fontWeight: '900',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                color: '#000000',
                lineHeight: '1.25',
              }}
            >
              {STORE_INFO.name}
            </h1>
            <div style={{ fontSize: '0.925rem', fontWeight: 'bold', marginTop: '0.35rem' }}>
              {STORE_INFO.address}
            </div>
            <div style={{ fontSize: '0.835rem', marginTop: '0.2rem' }}>
              Phone# {STORE_INFO.phone} &nbsp;|&nbsp; E-Mail: {STORE_INFO.email}
            </div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.2rem', fontFamily: 'monospace' }}>
              DSL: {STORE_INFO.dslNumber} | STN: {STORE_INFO.stnNumber} | NTN: {STORE_INFO.ntnNumber}
            </div>

            {/* MANIFEST TITLE BADGE */}
            <div
              style={{
                display: 'inline-block',
                border: '2px solid #000000',
                padding: '0.35rem 2rem',
                marginTop: '0.85rem',
                fontWeight: '900',
                fontSize: '1.15rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              REGIONAL DELIVERY MANIFEST & SETTLEMENT LEDGER
            </div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 'bold' }}>
              Region: <u>{selectedRegion || 'All Regions'}</u> &nbsp;|&nbsp; Delivery Person: <u>{manifestStats.primaryDeliveryMan}</u>
            </div>
            <div style={{ fontSize: '0.775rem', marginTop: '0.2rem' }}>
              Manifest Date: {currentDateStr}
            </div>
          </div>

          {/* MANIFEST SUMMARY KPI BOX */}
          <div
            style={{
              border: '2px solid #000000',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              backgroundColor: '#FAFAFA',
            }}
          >
            <div
              style={{
                fontWeight: '900',
                fontSize: '0.925rem',
                textDecoration: 'underline',
                marginBottom: '0.5rem',
              }}
            >
              REGIONAL DELIVERY & CASH SETTLEMENT SUMMARY:
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: '1rem',
                fontSize: '0.825rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#444' }}>Total Route Shops / Invoices:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '900' }}>
                  {manifestStats.totalShops} Invoices
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#444' }}>Total Region Net Sales:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '900' }}>
                  Rs. {manifestStats.totalSalesNet.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#444' }}>Total Outstanding Debt:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#DC2626' }}>
                  Rs. {manifestStats.totalOutstandingDebt.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#444' }}>Total Settled To Date:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#059669' }}>
                  Rs. {manifestStats.totalCashSettled.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* ITEMIZED SHOP DELIVERY & DUES TABLE */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                fontWeight: '900',
                fontSize: '1rem',
                borderBottom: '2px solid #000000',
                paddingBottom: '0.35rem',
                marginBottom: '0.75rem',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>🚚 ITEMIZED SHOP DELIVERIES & DEBT SETTLEMENT LOG:</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                {manifestInvoices.length} Shop Record(s)
              </span>
            </div>

            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.765rem',
                lineHeight: '1.5',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderTop: '2px solid #000000',
                    borderBottom: '2px solid #000000',
                    textAlign: 'left',
                    backgroundColor: '#F3F4F6',
                  }}
                >
                  <th style={{ padding: '0.5rem 0.3rem', width: '30px' }}>S.N</th>
                  <th style={{ padding: '0.5rem 0.3rem' }}>Inv #</th>
                  <th style={{ padding: '0.5rem 0.3rem' }}>Shop / Customer Name</th>
                  <th style={{ padding: '0.5rem 0.3rem' }}>Region</th>
                  <th style={{ padding: '0.5rem 0.3rem' }}>Delivery Man</th>
                  <th style={{ padding: '0.5rem 0.3rem', textAlign: 'right' }}>Net Total (Rs.)</th>
                  <th style={{ padding: '0.5rem 0.3rem', textAlign: 'right' }}>Current Due (Rs.)</th>
                  <th style={{ padding: '0.5rem 0.3rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.5rem 0.3rem', textAlign: 'right' }}>Cash Settled (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                {manifestInvoices.length > 0 ? (
                  manifestInvoices.map((inv, idx) => {
                    const originalNet = Number(inv.netTotal || inv.subtotal || 0);
                    const remaining = inv.remainingDebt !== undefined ? Number(inv.remainingDebt) : originalNet;
                    const logs = inv.paymentLogs || [];
                    const invoiceSettled = logs.reduce((sum, l) => sum + Number(l.amountPaid || 0), 0);
                    const statusText = remaining === 0 ? 'PAID' : (inv.paymentStatus || (remaining < originalNet ? 'PARTIAL DEBT' : 'UNPAID_CREDIT'));

                    return (
                      <tr
                        key={inv.invoiceNo || idx}
                        style={{ borderBottom: '1px solid #CBD5E1', pageBreakInside: 'avoid' }}
                      >
                        <td style={{ padding: '0.45rem 0.3rem', fontWeight: 'bold' }}>{idx + 1}</td>
                        <td style={{ padding: '0.45rem 0.3rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                          {inv.invoiceNo}
                        </td>
                        <td style={{ padding: '0.45rem 0.3rem', fontWeight: 'bold' }}>
                          {inv.shopName || inv.customerName || 'Shop Customer'}
                          {inv.customerPhone && (
                            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'normal', color: '#475569' }}>
                              Ph: {inv.customerPhone}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.45rem 0.3rem' }}>{inv.region || 'Unassigned'}</td>
                        <td style={{ padding: '0.45rem 0.3rem' }}>{inv.deliveryMan || 'Unassigned'}</td>
                        <td style={{ padding: '0.45rem 0.3rem', textAlign: 'right' }}>
                          {originalNet.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '0.45rem 0.3rem', textAlign: 'right', fontWeight: 'bold', color: remaining > 0 ? '#DC2626' : '#059669' }}>
                          {remaining.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '0.45rem 0.3rem', textAlign: 'center', fontWeight: 'bold' }}>
                          {statusText}
                        </td>
                        <td style={{ padding: '0.45rem 0.3rem', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>
                          {invoiceSettled > 0 ? invoiceSettled.toLocaleString('en-PK', { minimumFractionDigits: 2 }) : '0.00'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      style={{ textAlign: 'center', padding: '1.5rem', color: '#64748B', fontWeight: 600 }}
                    >
                      No shop delivery invoices found for the selected region.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* MANIFEST TOTALS FOOTER BANNER */}
            <div
              style={{
                borderTop: '2.5px solid #000000',
                borderBottom: '2.5px solid #000000',
                padding: '0.6rem 0.85rem',
                marginTop: '0.85rem',
                fontSize: '0.875rem',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                fontWeight: 'bold',
                backgroundColor: '#FAFAFA',
                pageBreakInside: 'avoid',
              }}
            >
              <span>TOTAL MANIFEST OUTSTANDING DEBT TO COLLECT:</span>
              <span style={{ fontSize: '1.05rem', textDecoration: 'underline', color: '#000000' }}>
                Rs. {manifestStats.totalOutstandingDebt.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* DUAL SIGNATURE BLOCKS & STAMP */}
          <div
            style={{
              display: 'flex',
              justify: 'space-between',
              alignItems: 'flex-end',
              borderTop: '2px solid #000000',
              paddingTop: '1rem',
              marginTop: '2rem',
              fontSize: '0.775rem',
              lineHeight: '1.5',
              pageBreakInside: 'avoid',
            }}
          >
            {/* DELIVERY MAN SIGNATURE */}
            <div style={{ textAlign: 'center', width: '220px' }}>
              <div style={{ borderBottom: '1px solid #000000', height: '40px', marginBottom: '0.35rem' }}></div>
              <div style={{ fontWeight: 'bold' }}>
                {manifestStats.primaryDeliveryMan || 'Delivery Officer'}
              </div>
              <div style={{ fontSize: '0.7rem' }}>Delivery Man Signature & Date</div>
            </div>

            {/* STORE MANAGER / AUTHORIZED SIGNATURE */}
            <div
              style={{
                border: '1px solid #000000',
                padding: '0.45rem 0.85rem',
                textAlign: 'center',
                minWidth: '220px',
              }}
            >
              {STORE_INFO.signatureImage ? (
                <img
                  src={STORE_INFO.signatureImage}
                  alt="Authorized Signature"
                  style={{ maxHeight: '44px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                />
              ) : (
                <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 'bold' }}>
                  {STORE_INFO.signatoryName}
                </div>
              )}
              <div
                style={{
                  borderTop: '1px solid #000000',
                  marginTop: '0.3rem',
                  paddingTop: '0.15rem',
                  fontWeight: 'bold',
                }}
              >
                {STORE_INFO.signatoryName || 'M. Idrees'}
              </div>
              <div style={{ fontSize: '0.675rem' }}>Authorized Store Stamp & Sign</div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions Bar */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '1.25rem',
            justify: 'flex-end',
          }}
        >
          <button onClick={onClose} className="btn btn-outline" style={{ minWidth: '100px' }}>
            Close
          </button>

          <button
            onClick={handlePrint}
            className="btn btn-outline"
            style={{
              borderColor: '#0284C7',
              color: '#0284C7',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Download size={16} /> Save PDF
          </button>

          <button
            onClick={handlePrint}
            className="btn btn-primary"
            style={{
              backgroundColor: '#0284C7',
              color: '#FFF',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Printer size={16} /> Print Manifest
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegionalDeliveryManifestModal;
