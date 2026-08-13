# Stock Summary & Low Stock Reorder PDF Report Modal Specification (`StockSummaryReportModal.jsx`)

## Executive Summary
This document provides the complete architecture, data calculation formulas, UI layout, and JSX component blueprint for `StockSummaryReportModal.jsx`. This component fulfills Requirement 1 (R1) of Milestone 1 in the Medical Store Phase 2 (PharmaLink ERP & POS) project.

---

## 1. Context & Data Structure Analysis

### 1.1 Source Files Inspected
- `src/context/InventoryContext.jsx`: Provides `medicines`, `batches`, and inventory management state.
- `src/data/mockData.js`: Pre-seeded catalog data model and `STORE_INFO` object (store name, address, phone, email, signatory name, signature image).
- `src/pages/InventoryPage.jsx`: Host page displaying the catalog table and inventory search/filters.
- `src/components/modals/AnalyticsReportPrintModal.jsx`: Reference implementation for A4 print isolation (`@media print` and DOM `#analytics-pdf-report`).
- `src/components/common/Modal.jsx`: Shared modal layout wrapper.

### 1.2 Data Contracts

#### Medicine Item Schema (`medicines[]`)
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique Item Code (e.g. `"MED-001"`) |
| `brandName` | string | Commercial Trade Name (e.g. `"Panadol 500mg"`) |
| `genericFormula` | string | Active Salt / Composition (e.g. `"Paracetamol 500mg"`) |
| `category` | string | Dosage form (e.g. `"Tablet"`, `"Syrup"`, `"Injection"`) |
| `manufacturer` | string | Producing company (e.g. `"GSK Pakistan"`) |
| `rackLocation` | string | Physical storage location (e.g. `"Rack B-03 / Shelf 2"`) |
| `reorderLevel` | number | Minimum threshold in boxes (e.g. `50`) |
| `purchasePriceBox` | number | Wholesale cost price per box in PKR (e.g. `480.00`) |
| `boxPrice` | number | Wholesale selling price per box in PKR (e.g. `600.00`) |
| `tabletsPerBox` | number | Units per box (e.g. `200`) |
| `requiresPrescription` | boolean | Rx requirement flag |

#### Batch Item Schema (`batches[]`)
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique Batch ID (e.g. `"BAT-001"`) |
| `medicineId` | string | Foreign key referencing `medicine.id` |
| `batchNumber` | string | Manufacturer Batch No. (e.g. `"B26-Pan-01"`) |
| `totalBoxesAvailable` | number | Direct box stock available |
| `totalTabletsAvailable` | number | Total individual tablet/unit stock |
| `purchasePriceBox` | number | Cost price for this specific batch |
| `status` | string | `"Active"`, `"Near Expiry"`, or `"Quarantined"` |

---

## 2. KPI Calculation Formulas

### 2.1 Metric 1: Total Medicines Catalog Count
- **Description**: Total count of unique active items in the inventory catalog.
- **Formula**:
  $$\text{TotalMedicines} = \text{medicines.length}$$

### 2.2 Metric 2: Total Boxes Available
- **Description**: Aggregate number of available boxes across all active (non-quarantined) batches.
- **Formula**:
  For each medicine $m \in \text{medicines}$:
  $$\text{MedicineBatches}(m) = \{ b \in \text{batches} \mid b.\text{medicineId} = m.\text{id} \land b.\text{status} \neq \text{'Quarantined'} \}$$
  $$\text{totalBoxes}(m) = \sum_{b \in \text{MedicineBatches}(m)} \left( b.\text{totalBoxesAvailable} \parallel \lfloor \frac{b.\text{totalTabletsAvailable}}{m.\text{tabletsPerBox} \parallel 20} \rfloor \right)$$
  $$\text{TotalBoxesAvailable} = \sum_{m \in \text{medicines}} \text{totalBoxes}(m)$$

### 2.3 Metric 3: Estimated Inventory Cost Valuation
- **Description**: Total monetary value of current non-quarantined stock calculated at wholesale purchase cost.
- **Formula**:
  $$\text{unitCost}(m) = m.\text{purchasePriceBox} \parallel (m.\text{boxPrice} \times 0.8) \parallel 0$$
  $$\text{EstimatedValuation} = \sum_{m \in \text{medicines}} \left( \text{totalBoxes}(m) \times \text{unitCost}(m) \right)$$

### 2.4 Metric 4: Low Stock Items Count
- **Description**: Total number of catalog items where current available box stock is at or below the defined reorder level.
- **Formula**:
  $$\text{IsLowStock}(m) = \text{totalBoxes}(m) \le m.\text{reorderLevel}$$
  $$\text{LowStockCount} = |\{ m \in \text{medicines} \mid \text{IsLowStock}(m) \}|$$

---

## 3. Low Stock Reorder Table & Purchase Manifest Formulas

### 3.1 Table Filter & Column Definitions
The table lists all medicines satisfying $\text{totalBoxes}(m) \le m.\text{reorderLevel}$.

| Col # | Column Header | Data Source / Calculation | Format |
|-------|---------------|---------------------------|--------|
| 1 | Sr. # | Index position (`idx + 1`) | Number |
| 2 | Item Code & Trade Name | `m.id` & `m.brandName` | Monospace ID + Bold Name |
| 3 | Generic Formula | `m.genericFormula` | Muted Text |
| 4 | Rack Location | `m.rackLocation` || `'Rack A'` | Text Badge |
| 5 | Available Stock | `totalBoxes(m)` | Bold Red/Warning Text |
| 6 | Reorder Level | `m.reorderLevel` | Number |
| 7 | Suggested Reorder Qty | $\text{suggestedBoxes}(m)$ | Bold Accent Number |
| 8 | Unit Purchase Cost | $\text{unitCost}(m)$ | Currency (`Rs. X.XX`) |
| 9 | Est. Total Investment | $\text{suggestedBoxes}(m) \times \text{unitCost}(m)$ | Currency (`Rs. X.XX`) |

### 3.2 Suggested Reorder Quantity Formula
To ensure stock is restored to double the safety buffer (or at least one full reorder level cycle):
$$\text{suggestedBoxes}(m) = \max\left( m.\text{reorderLevel} \times 2 - \text{totalBoxes}(m),\, m.\text{reorderLevel} \right)$$

### 3.3 Reorder Total Investment Formula
$$\text{itemInvestment}(m) = \text{suggestedBoxes}(m) \times \text{unitCost}(m)$$
$$\text{TotalEstimatedInvestment} = \sum_{m \in \text{LowStockItems}} \text{itemInvestment}(m)$$

---

## 4. Complete Component Blueprint (`StockSummaryReportModal.jsx`)

```jsx
import React, { useMemo } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Package, 
  Boxes, 
  TrendingUp, 
  AlertTriangle, 
  FileText,
  MapPin
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { STORE_INFO } from '../../data/mockData';

export const StockSummaryReportModal = ({ isOpen, onClose }) => {
  const { medicines = [], batches = [] } = useInventory();

  if (!isOpen) return null;

  // 1. Calculate stock per medicine & stock summary metrics
  const { summaryMetrics, lowStockMedicines } = useMemo(() => {
    let totalBoxesAvailable = 0;
    let totalCostValuation = 0;
    const lowStockList = [];

    medicines.forEach((med) => {
      // Filter non-quarantined batches
      const medBatches = batches.filter(
        (b) => b.medicineId === med.id && b.status !== 'Quarantined'
      );

      // Total available boxes for this medicine
      const medTotalBoxes = medBatches.reduce((sum, b) => {
        if (b.totalBoxesAvailable !== undefined) {
          return sum + Number(b.totalBoxesAvailable || 0);
        }
        const tabs = Number(b.totalTabletsAvailable || 0);
        const perBox = Number(med.tabletsPerBox || 20);
        return sum + Math.floor(tabs / perBox);
      }, 0);

      // Purchase cost per box
      const unitCost = Number(med.purchasePriceBox || (med.boxPrice ? med.boxPrice * 0.8 : 0) || 0);

      totalBoxesAvailable += medTotalBoxes;
      totalCostValuation += medTotalBoxes * unitCost;

      const reorderLvl = Number(med.reorderLevel || 0);
      const isLow = medTotalBoxes <= reorderLvl;

      if (isLow) {
        // Formula: max(reorderLevel * 2 - currentBoxes, reorderLevel)
        const suggestedBoxes = Math.max(reorderLvl * 2 - medTotalBoxes, reorderLvl);
        const estInvestment = suggestedBoxes * unitCost;

        lowStockList.push({
          ...med,
          currentBoxes: medTotalBoxes,
          reorderLevel: reorderLvl,
          suggestedBoxes,
          unitCost,
          estInvestment
        });
      }
    });

    // Total investment for all low stock items
    const totalReorderBoxes = lowStockList.reduce((acc, item) => acc + item.suggestedBoxes, 0);
    const totalReorderInvestment = lowStockList.reduce((acc, item) => acc + item.estInvestment, 0);

    return {
      summaryMetrics: {
        totalMedicinesCount: medicines.length,
        totalBoxesAvailable,
        totalCostValuation,
        lowStockCount: lowStockList.length,
        totalReorderBoxes,
        totalReorderInvestment
      },
      lowStockMedicines: lowStockList
    };
  }, [medicines, batches]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
    >
      {/* A4 PRINT ISOLATION STYLE BLOCK */}
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
              font-size: 10pt !important;
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
              padding: 1.5rem !important;
              border: 2px solid #000000 !important;
              box-sizing: border-box !important;
            }
            .no-print, button, .btn {
              display: none !important;
            }
          }
        `}
      </style>

      {/* SCREEN MODAL CARD */}
      <div
        className="card modal-card"
        style={{
          width: '95%',
          maxWidth: '980px',
          maxHeight: '94vh',
          overflowY: 'auto',
          padding: '1.5rem',
          position: 'relative',
          backgroundColor: '#F8FAFC',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="no-print"
          style={{
            position: 'absolute',
            right: '1.25rem',
            top: '1.25rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#64748B',
            padding: '0.25rem',
            borderRadius: '4px'
          }}
          aria-label="Close Modal"
        >
          <X size={22} />
        </button>

        {/* Modal Title Header */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: '#E0F2FE', color: '#0284C7', borderRadius: '6px', display: 'flex' }}>
            <FileText size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Stock Summary & Purchase Reorder Report
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.15rem 0 0 0' }}>
              Real-time inventory valuation summary and low-stock procurement manifest
            </p>
          </div>
        </div>

        {/* SCREEN KPI SUMMARY CARDS (ON SCREEN VIEW) */}
        <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem', marginBottom: '1.25rem' }}>
          <div style={{ padding: '0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.75rem', fontWeight: 700 }}>
              <Package size={16} color="#0284C7" /> TOTAL MEDICINES
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', marginTop: '0.35rem' }}>
              {summaryMetrics.totalMedicinesCount} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Items</span>
            </div>
          </div>

          <div style={{ padding: '0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.75rem', fontWeight: 700 }}>
              <Boxes size={16} color="#059669" /> TOTAL BOXES STOCK
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', marginTop: '0.35rem' }}>
              {summaryMetrics.totalBoxesAvailable.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Boxes</span>
            </div>
          </div>

          <div style={{ padding: '0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.75rem', fontWeight: 700 }}>
              <TrendingUp size={16} color="#2563EB" /> EST. INVENTORY COST
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0284C7', marginTop: '0.35rem' }}>
              Rs. {summaryMetrics.totalCostValuation.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ padding: '0.85rem', backgroundColor: summaryMetrics.lowStockCount > 0 ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${summaryMetrics.lowStockCount > 0 ? '#FCA5A5' : '#86EFAC'}`, borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: summaryMetrics.lowStockCount > 0 ? '#DC2626' : '#166534', fontSize: '0.75rem', fontWeight: 700 }}>
              <AlertTriangle size={16} /> LOW STOCK REORDER
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: summaryMetrics.lowStockCount > 0 ? '#DC2626' : '#166534', marginTop: '0.35rem' }}>
              {summaryMetrics.lowStockCount} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Products</span>
            </div>
          </div>
        </div>

        {/* PRINTABLE A4 PDF CONTAINER */}
        <div
          id="stock-summary-pdf"
          style={{
            backgroundColor: '#FFFFFF',
            border: '2px solid #000000',
            padding: '1.5rem',
            fontSize: '0.825rem',
            color: '#000000',
            fontFamily: 'Arial, sans-serif',
            lineHeight: 1.5,
            boxSizing: 'border-box'
          }}
        >
          {/* STORE HEADER BRANDING */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '2px solid #000000' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em', color: '#000000' }}>
              {STORE_INFO.name}
            </h1>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginTop: '0.25rem' }}>
              {STORE_INFO.address}
            </div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.15rem' }}>
              Phone: {STORE_INFO.phone} &nbsp;|&nbsp; Email: {STORE_INFO.email}
            </div>
            {STORE_INFO.dslNumber && (
              <div style={{ fontSize: '0.75rem', marginTop: '0.15rem', color: '#333' }}>
                Drug Sale License (Form 20/21): <strong>{STORE_INFO.dslNumber}</strong> &nbsp;|&nbsp; STN/GSTIN: <strong>{STORE_INFO.gstin}</strong>
              </div>
            )}

            {/* REPORT TITLE BANNER */}
            <div style={{ display: 'inline-block', border: '2px solid #000000', padding: '0.35rem 1.75rem', marginTop: '0.75rem', fontWeight: '900', fontSize: '1.1rem', letterSpacing: '0.04em', textTransform: 'uppercase', backgroundColor: '#F8FAFC' }}>
              STOCK SUMMARY & PURCHASE REORDER MANIFEST
            </div>
          </div>

          {/* OVERALL STOCK SUMMARY METRICS BAR */}
          <div style={{ border: '2px solid #000000', padding: '0.75rem 1rem', marginBottom: '1.25rem', backgroundColor: '#FAFAFA' }}>
            <div style={{ fontWeight: '900', fontSize: '0.9rem', textDecoration: 'underline', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              OVERALL INVENTORY COST & VALUATION METRICS:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.725rem', color: '#555' }}>Catalog Total Items:</span>
                <div style={{ fontSize: '1.05rem', fontWeight: '900' }}>{summaryMetrics.totalMedicinesCount} Products</div>
              </div>
              <div>
                <span style={{ fontSize: '0.725rem', color: '#555' }}>Total Available Stock:</span>
                <div style={{ fontSize: '1.05rem', fontWeight: '900' }}>{summaryMetrics.totalBoxesAvailable.toLocaleString()} Boxes</div>
              </div>
              <div>
                <span style={{ fontSize: '0.725rem', color: '#555' }}>Est. Cost Valuation:</span>
                <div style={{ fontSize: '1.05rem', fontWeight: '900' }}>Rs. {summaryMetrics.totalCostValuation.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.725rem', color: '#555' }}>Low Stock Items Count:</span>
                <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#DC2626' }}>{summaryMetrics.lowStockCount} Items Below Threshold</div>
              </div>
            </div>
          </div>

          {/* LOW STOCK REORDER MANIFEST TABLE */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: '900', fontSize: '1rem', borderBottom: '2px solid #000000', paddingBottom: '0.35rem', marginBottom: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>⚠️ LOW STOCK REORDER MANIFEST (PROCUREMENT ADVISORY):</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Items At or Below Reorder Level</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.765rem', lineHeight: '1.4' }}>
              <thead>
                <tr style={{ borderTop: '2px solid #000000', borderBottom: '2px solid #000000', textAlign: 'left', backgroundColor: '#F1F5F9' }}>
                  <th style={{ padding: '0.45rem 0.3rem', width: '25px', textAlign: 'center' }}>Sr.</th>
                  <th style={{ padding: '0.45rem 0.3rem', width: '75px' }}>Item Code</th>
                  <th style={{ padding: '0.45rem 0.3rem' }}>Trade Name & Generic Formula</th>
                  <th style={{ padding: '0.45rem 0.3rem', width: '90px' }}>Rack Location</th>
                  <th style={{ padding: '0.45rem 0.3rem', textAlign: 'center', width: '70px' }}>Current Stock</th>
                  <th style={{ padding: '0.45rem 0.3rem', textAlign: 'center', width: '70px' }}>Reorder Level</th>
                  <th style={{ padding: '0.45rem 0.3rem', textAlign: 'center', width: '85px' }}>Suggested Reorder</th>
                  <th style={{ padding: '0.45rem 0.3rem', textAlign: 'right', width: '85px' }}>Est. Unit Cost</th>
                  <th style={{ padding: '0.45rem 0.3rem', textAlign: 'right', width: '105px' }}>Est. Investment</th>
                </tr>
              </thead>
              <tbody>
                {lowStockMedicines.length > 0 ? (
                  lowStockMedicines.map((med, idx) => (
                    <tr key={med.id || idx} style={{ borderBottom: '1px solid #CBD5E1', pageBreakInside: 'avoid' }}>
                      <td style={{ padding: '0.4rem 0.3rem', textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                      <td style={{ padding: '0.4rem 0.3rem', fontFamily: 'monospace', fontWeight: 'bold' }}>{med.id}</td>
                      <td style={{ padding: '0.4rem 0.3rem' }}>
                        <div style={{ fontWeight: 'bold' }}>{med.brandName}</div>
                        <div style={{ fontSize: '0.7rem', color: '#475569' }}>{med.genericFormula}</div>
                      </td>
                      <td style={{ padding: '0.4rem 0.3rem', fontWeight: '600' }}>{med.rackLocation || 'Rack A'}</td>
                      <td style={{ padding: '0.4rem 0.3rem', textAlign: 'center', fontWeight: '900', color: '#DC2626' }}>
                        {med.currentBoxes} Box{med.currentBoxes !== 1 ? 'es' : ''}
                      </td>
                      <td style={{ padding: '0.4rem 0.3rem', textAlign: 'center', fontWeight: 'bold' }}>
                        {med.reorderLevel} Box{med.reorderLevel !== 1 ? 'es' : ''}
                      </td>
                      <td style={{ padding: '0.4rem 0.3rem', textAlign: 'center', fontWeight: '900', color: '#0369A1' }}>
                        +{med.suggestedBoxes} Boxes
                      </td>
                      <td style={{ padding: '0.4rem 0.3rem', textAlign: 'right' }}>
                        Rs. {med.unitCost.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.4rem 0.3rem', textAlign: 'right', fontWeight: '900' }}>
                        Rs. {med.estInvestment.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '1.5rem', color: '#475569', fontWeight: 'bold' }}>
                      ✅ All inventory catalog items have sufficient stock levels above their reorder threshold.
                    </td>
                  </tr>
                )}
              </tbody>
              {lowStockMedicines.length > 0 && (
                <tfoot>
                  <tr style={{ borderTop: '2px solid #000000', borderBottom: '2px solid #000000', backgroundColor: '#F8FAFC', fontWeight: '900' }}>
                    <td colSpan="4" style={{ padding: '0.5rem 0.3rem', textAlign: 'right', textTransform: 'uppercase' }}>
                      TOTAL REORDER PROCUREMENT SUMMARY:
                    </td>
                    <td style={{ padding: '0.5rem 0.3rem', textAlign: 'center' }}>
                      {lowStockMedicines.reduce((acc, m) => acc + m.currentBoxes, 0)} Boxes
                    </td>
                    <td style={{ padding: '0.5rem 0.3rem', textAlign: 'center' }}>
                      -
                    </td>
                    <td style={{ padding: '0.5rem 0.3rem', textAlign: 'center', color: '#0369A1' }}>
                      +{summaryMetrics.totalReorderBoxes} Boxes
                    </td>
                    <td style={{ padding: '0.5rem 0.3rem', textAlign: 'right' }}>
                      -
                    </td>
                    <td style={{ padding: '0.5rem 0.3rem', textAlign: 'right', color: '#0284C7', fontSize: '0.85rem' }}>
                      Rs. {summaryMetrics.totalReorderInvestment.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* SIGNATURE & REPORT FOOTER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid #000000', paddingTop: '0.75rem', marginTop: '1.25rem', fontSize: '0.75rem', lineHeight: '1.4', pageBreakInside: 'avoid' }}>
            <div>
              <div>Generated By: <strong>Dr. Idrees (Store Admin)</strong></div>
              <div>Generated Date: <strong>{new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></div>
              <div>Manifest Status: <strong>{lowStockMedicines.length > 0 ? 'Pending Supplier Purchase Order' : 'Sufficient Stock'}</strong></div>
            </div>

            {/* AUTHORIZED SIGNATURE BOX */}
            <div style={{ border: '1px solid #000000', padding: '0.4rem 0.85rem', textAlign: 'center', minWidth: '190px' }}>
              {STORE_INFO.signatureImage ? (
                <img src={STORE_INFO.signatureImage} alt="Authorized Signature" style={{ maxHeight: '42px', objectFit: 'contain', display: 'block', margin: '0 auto' }} />
              ) : (
                <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 'bold' }}>
                  {STORE_INFO.signatoryName || 'M. Idrees'}
                </div>
              )}
              <div style={{ borderTop: '1px solid #000000', marginTop: '0.25rem', paddingTop: '0.15rem', fontWeight: 'bold' }}>
                {STORE_INFO.signatoryName || 'M. Idrees'}
              </div>
              <div style={{ fontSize: '0.65rem' }}>
                Authorized Pharmacist / Manager
              </div>
            </div>
          </div>
        </div>

        {/* MODAL BOTTOM ACTION BUTTONS */}
        <div className="no-print" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', fontWeight: 700 }}
          >
            Close
          </button>

          <button
            onClick={handlePrint}
            className="btn btn-outline"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', fontWeight: 800, borderColor: '#0284C7', color: '#0284C7', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Download size={16} /> Save A4 PDF Report
          </button>

          <button
            onClick={handlePrint}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', fontWeight: 900, backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Printer size={16} /> Print Reorder Manifest
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockSummaryReportModal;
```

---

## 5. Integration Blueprint for `InventoryPage.jsx`

To expose the Stock Summary Report modal to users on the Inventory Page, `InventoryPage.jsx` should be updated with:

1. Import `StockSummaryReportModal`:
   ```jsx
   import StockSummaryReportModal from '../components/modals/StockSummaryReportModal'; // or ../components/inventory/StockSummaryReportModal
   ```
2. State variable for modal visibility:
   ```jsx
   const [isStockSummaryOpen, setIsStockSummaryOpen] = useState(false);
   ```
3. Trigger button in the sticky filter toolbar:
   ```jsx
   <button
     onClick={() => setIsStockSummaryOpen(true)}
     className="btn btn-primary"
     style={{
       padding: '0.45rem 0.95rem',
       fontSize: '0.825rem',
       fontWeight: 800,
       backgroundColor: '#0284C7',
       color: '#FFFFFF',
       display: 'flex',
       alignItems: 'center',
       gap: '0.4rem',
       borderRadius: '6px',
       border: 'none',
       cursor: 'pointer'
     }}
   >
     <FileText size={16} /> Stock Summary & Reorder Report
   </button>
   ```
4. Render modal at the bottom of `InventoryPage.jsx`:
   ```jsx
   <StockSummaryReportModal
     isOpen={isStockSummaryOpen}
     onClose={() => setIsStockSummaryOpen(false)}
   />
   ```

---

## 6. Summary Matrix

| Metric / Item | Definition / Source | Formula / Logic |
|---------------|---------------------|-----------------|
| Total Medicines | `medicines[]` catalog items | `medicines.length` |
| Total Boxes Available | Active batch box count | $\sum \text{totalBoxesAvailable}(m)$ |
| Est. Inventory Cost | Total stock monetary value | $\sum (\text{totalBoxes}(m) \times \text{unitCost}(m))$ |
| Low Stock Items | Items at or below reorder level | $|\{m \mid \text{totalBoxes}(m) \le m.\text{reorderLevel}\}|$ |
| Suggested Reorder Qty | Recommended box procurement | $\max(m.\text{reorderLevel} \times 2 - \text{totalBoxes}(m),\, m.\text{reorderLevel})$ |
| Reorder Investment | Cost to fulfill reorder quantity | $\text{suggestedBoxes}(m) \times \text{unitCost}(m)$ |
| Print Format | A4 Portrait PDF Export | `@media print` + `#stock-summary-pdf` isolation |

