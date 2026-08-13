import React, { useMemo } from 'react';
import { Printer, X, FileText, Download, Package, AlertTriangle, DollarSign, Layers } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { STORE_INFO } from '../../data/mockData';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';

export const StockSummaryReportModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { medicines = [], batches = [] } = useInventory();

  // Calculate Stock Summary Metrics & Low Stock Items
  const inventoryStats = useMemo(() => {
    let totalBoxesAvailable = 0;
    let estimatedCostValuation = 0;
    let lowStockCount = 0;

    const medicinesWithStock = medicines.map((med) => {
      const medBatches = batches.filter(
        (b) => b.medicineId === med.id && b.status !== 'Quarantined'
      );
      const totalBoxes = medBatches.reduce((sum, b) => {
        const batchBoxes =
          b.totalTabletsAvailable !== undefined && b.totalTabletsAvailable !== null
            ? Math.floor(b.totalTabletsAvailable / (med.tabletsPerBox || 1))
            : (b.totalBoxesAvailable || 0);
        return sum + batchBoxes;
      }, 0);
      const purchasePriceBox = Number(
        med.purchasePriceBox || (med.boxPrice ? med.boxPrice * 0.8 : 480)
      );
      const costValuation = totalBoxes * purchasePriceBox;
      const isLow = totalBoxes <= med.reorderLevel;

      if (isLow) {
        lowStockCount += 1;
      }

      totalBoxesAvailable += totalBoxes;
      estimatedCostValuation += costValuation;

      const suggestedReorderBoxes = Math.max(
        med.reorderLevel * 2 - totalBoxes,
        med.reorderLevel
      );
      const estimatedInvestment = suggestedReorderBoxes * purchasePriceBox;

      return {
        ...med,
        totalBoxes,
        purchasePriceBox,
        costValuation,
        isLow,
        suggestedReorderBoxes,
        estimatedInvestment,
      };
    });

    const lowStockItems = medicinesWithStock.filter((m) => m.isLow);
    const totalSuggestedInvestment = lowStockItems.reduce(
      (sum, m) => sum + m.estimatedInvestment,
      0
    );

    return {
      totalMedicines: medicines.length,
      totalBoxesAvailable,
      estimatedCostValuation,
      lowStockCount,
      medicinesWithStock,
      lowStockItems,
      totalSuggestedInvestment,
    };
  }, [medicines, batches]);

  const handlePrint = () => {
    window.print();
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
      }}
    >
      {/* @media print CSS DOM isolation targeting #stock-summary-pdf */}
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
            #stock-summary-pdf, #stock-summary-pdf * {
              visibility: visible !important;
            }
            #stock-summary-pdf {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              min-height: 98vh !important;
              margin: 0 !important;
              padding: 1.75rem !important;
              border: 2px solid #000000 !important;
              box-sizing: border-box !important;
            }
            .no-print, button, .btn {
              display: none !important;
            }
          }
        `}
      </style>

      <div
        className="card modal-card"
        style={{
          width: '95%',
          maxWidth: '1000px',
          maxHeight: '94vh',
          overflowY: 'auto',
          padding: '1.5rem',
          position: 'relative',
          backgroundColor: '#F8FAFC',
        }}
      >
        {/* Modal Close Button */}
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

        {/* Modal Header Bar */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={24} color="#0284C7" />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Stock Summary & Reorder Report
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                Inventory Valuation & Purchase Reorder Manifest Preview
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
              <Printer size={16} /> Export A4 Purchase Manifest
            </button>
          </div>
        </div>

        {/* Interactive UI KPI Cards (No-print wrapper) */}
        <div
          className="no-print"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                backgroundColor: '#E0F2FE',
                padding: '0.65rem',
                borderRadius: '8px',
                color: '#0284C7',
              }}
            >
              <Package size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>
                Total Medicines
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
                {inventoryStats.totalMedicines} Items
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                backgroundColor: '#D1FAE5',
                padding: '0.65rem',
                borderRadius: '8px',
                color: '#059669',
              }}
            >
              <Layers size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>
                Total Boxes Available
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
                {inventoryStats.totalBoxesAvailable} Boxes
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                backgroundColor: '#FEF3C7',
                padding: '0.65rem',
                borderRadius: '8px',
                color: '#D97706',
              }}
            >
              <DollarSign size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>
                Inventory Cost Valuation
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A' }}>
                Rs. {inventoryStats.estimatedCostValuation.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                backgroundColor: '#FEE2E2',
                padding: '0.65rem',
                borderRadius: '8px',
                color: '#DC2626',
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>
                Low Stock Reorder Count
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#DC2626' }}>
                {inventoryStats.lowStockCount} Items
              </div>
            </div>
          </div>
        </div>

        {/* PRINTABLE A4 CONTAINER FOR DOM ISOLATION (#stock-summary-pdf) */}
        <div
          id="stock-summary-pdf"
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

            {/* DOCUMENT TITLE BADGE */}
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
              INVENTORY STOCK SUMMARY & REORDER MANIFEST
            </div>
            <div style={{ fontSize: '0.775rem', marginTop: '0.4rem', fontWeight: 'bold' }}>
              Report Generated On: {currentDateStr}
            </div>
          </div>

          {/* 4 KPI SUMMARY METRICS SECTION */}
          <div
            style={{
              border: '2px solid #000000',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              backgroundColor: '#FAFAFA',
            }}
          >
            <div
              style={{
                fontWeight: '900',
                fontSize: '0.95rem',
                textDecoration: 'underline',
                marginBottom: '0.5rem',
              }}
            >
              EXECUTIVE STOCK VALUATION & OVERALL SUMMARY:
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
                <span style={{ fontSize: '0.75rem', color: '#444' }}>Total Catalog Medicines:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '900' }}>
                  {inventoryStats.totalMedicines} Items
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#444' }}>Total Available Stock:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '900' }}>
                  {inventoryStats.totalBoxesAvailable} Boxes
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#444' }}>Estimated Inventory Cost:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '900' }}>
                  Rs. {inventoryStats.estimatedCostValuation.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#444' }}>Low Stock Items Count:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#DC2626' }}>
                  {inventoryStats.lowStockCount} Items
                </div>
              </div>
            </div>
          </div>

          {/* LOW STOCK REORDER MANIFEST TABLE */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                fontWeight: '900',
                fontSize: '1.05rem',
                borderBottom: '2px solid #000000',
                paddingBottom: '0.35rem',
                marginBottom: '0.75rem',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>⚠️ LOW STOCK REORDER MANIFEST (AT OR BELOW REORDER LEVEL):</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                {inventoryStats.lowStockItems.length} Products Requiring Purchase PO
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
                  <th style={{ padding: '0.5rem 0.3rem', width: '70px' }}>Code/SKU</th>
                  <th style={{ padding: '0.5rem 0.3rem' }}>Medicine Name</th>
                  <th style={{ padding: '0.5rem 0.3rem' }}>Rack/Shelf</th>
                  <th style={{ padding: '0.5rem 0.3rem', textAlign: 'center' }}>Current Boxes</th>
                  <th style={{ padding: '0.5rem 0.3rem', textAlign: 'center' }}>Min Reorder Level</th>
                  <th style={{ padding: '0.5rem 0.3rem', textAlign: 'center' }}>Suggested Reorder</th>
                  <th style={{ padding: '0.5rem 0.3rem', textAlign: 'right' }}>Price/Box (Rs.)</th>
                  <th style={{ padding: '0.5rem 0.3rem', textAlign: 'right' }}>Est. Investment (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                {inventoryStats.lowStockItems.length > 0 ? (
                  inventoryStats.lowStockItems.map((med, idx) => (
                    <tr
                      key={med.id || idx}
                      style={{ borderBottom: '1px solid #CBD5E1', pageBreakInside: 'avoid' }}
                    >
                      <td style={{ padding: '0.45rem 0.3rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {med.id}
                      </td>
                      <td style={{ padding: '0.45rem 0.3rem', fontWeight: 'bold' }}>
                        {med.brandName}
                        {med.genericFormula && (
                          <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'normal', color: '#475569' }}>
                            {med.genericFormula}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.45rem 0.3rem' }}>{med.rackLocation || 'Rack A'}</td>
                      <td style={{ padding: '0.45rem 0.3rem', textAlign: 'center', fontWeight: '900', color: '#DC2626' }}>
                        {med.totalBoxes}
                      </td>
                      <td style={{ padding: '0.45rem 0.3rem', textAlign: 'center' }}>{med.reorderLevel}</td>
                      <td style={{ padding: '0.45rem 0.3rem', textAlign: 'center', fontWeight: '900', color: '#0369A1' }}>
                        {med.suggestedReorderBoxes} Boxes
                      </td>
                      <td style={{ padding: '0.45rem 0.3rem', textAlign: 'right' }}>
                        {med.purchasePriceBox.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.45rem 0.3rem', textAlign: 'right', fontWeight: 'bold' }}>
                        {med.estimatedInvestment.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      style={{ textAlign: 'center', padding: '1.5rem', color: '#64748B', fontWeight: 600 }}
                    >
                      All inventory stock levels are healthy. No items are currently at or below minimum reorder level.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* TOTAL SUGGESTED INVESTMENT FOOTER BANNER */}
            {inventoryStats.lowStockItems.length > 0 && (
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
                <span>TOTAL ESTIMATED PURCHASE REORDER INVESTMENT:</span>
                <span style={{ fontSize: '1.05rem', textDecoration: 'underline' }}>
                  Rs. {inventoryStats.totalSuggestedInvestment.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>

          {/* DIGITAL SIGNATURE BLOCK & FOOTER */}
          <div
            style={{
              display: 'flex',
              justify: 'space-between',
              alignItems: 'flex-end',
              borderTop: '2px solid #000000',
              paddingTop: '0.85rem',
              marginTop: '1.5rem',
              fontSize: '0.775rem',
              lineHeight: '1.5',
              pageBreakInside: 'avoid',
            }}
          >
            <div>
              <div>Report Prepared By: <strong>Pharmacy Inventory Manager</strong></div>
              <div>System Licensee: <strong>{STORE_INFO.name} ({STORE_INFO.address})</strong></div>
            </div>

            {/* DIGITAL SIGNATURE BOX */}
            <div
              style={{
                border: '1px solid #000000',
                padding: '0.45rem 0.85rem',
                textAlign: 'center',
                minWidth: '200px',
              }}
            >
              {STORE_INFO.signatureImage ? (
                <img
                  src={STORE_INFO.signatureImage}
                  alt="Authorized Signature"
                  style={{ maxHeight: '46px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
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
              <div style={{ fontSize: '0.675rem' }}>Authorized Signatory</div>
            </div>
          </div>
        </div>

        {/* Interactive Bottom Actions Bar (No-print wrapper) */}
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
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockSummaryReportModal;
