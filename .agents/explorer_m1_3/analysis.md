# Analysis Report: A4 PDF Print Isolation & Layout Design for `StockSummaryReportModal.jsx`

**Author**: Explorer M1-3 (A4 PDF Print Isolation Specialist)  
**Date**: 2026-08-12  
**Target Component**: `src/components/inventory/StockSummaryReportModal.jsx`  
**Integration Target**: `src/pages/InventoryPage.jsx`

---

## 1. Executive Summary

This report establishes the technical architecture, `@media print` CSS isolation, and component layout design for `StockSummaryReportModal.jsx` in Milestone 1 of the Medical Store ERP & POS system (Phase 2).

The modal serves two primary business objectives:
1. **Stock Valuation & KPI Overview**: Displaying real-time inventory metrics (Total Products, Total Available Boxes, Total Cost Valuation, Low Stock Count).
2. **Purchase Reorder Manifest Export**: Providing a one-click A4 PDF print layout (`#stock-summary-pdf`) for generating a purchase order manifest for low stock items, complete with store header branding, itemized reorder table, cost estimates, and double signature approval block for Purchase Manager and Supplier.

---

## 2. Phase 1 `@media print` Isolation Patterns & Conventions

### 2.1 Inspection Findings from Phase 1 Modals

Inspection of Phase 1 print modals (`src/components/modals/A4InvoiceModal.jsx`, `A4InvoicePrintModal.jsx`, and `AnalyticsReportPrintModal.jsx`) reveals a standardized, robust pattern for browser-native printing and PDF export.

Key conventions extracted:
1. **Overlaid Inline `<style>` Tag**:
   Print rules are embedded inside the React modal component within a `<style>` block scoped to `@media print`. This ensures styles take effect immediately upon opening the modal without requiring external CSS compilation.
2. **DOM Visibility Hijacking**:
   The CSS uses `body * { visibility: hidden !important; }` to hide the entire SPA viewport (sidebars, topbars, background modals, overlays).
3. **Container Isolation via ID Selector**:
   The specific printable container is given a unique ID (e.g. `#stock-summary-pdf`). The CSS rule `#stock-summary-pdf, #stock-summary-pdf * { visibility: visible !important; }` brings only the printable manifest into view.
4. **Absolute Positioning & Page Margin Setup**:
   The container is positioned absolutely at `top: 0; left: 0; width: 100% !important; min-height: 98vh !important;`. The `@page` rule enforces standard A4 paper size and margin:
   ```css
   @page {
     size: A4 portrait;
     margin: 6mm 8mm;
   }
   ```
5. **No-Print Class Hiding**:
   Interactive controls, action buttons, close icons, and header controls are tagged with `className="no-print"` or `.btn`, which are hidden in print mode with `display: none !important;`.

### 2.2 Standardized `@media print` Ruleset for `#stock-summary-pdf`

```css
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
```

---

## 3. A4 Print Layout Specifications

The printable container `#stock-summary-pdf` is structured into four distinct visual sections formatted for crisp black-and-white A4 printing:

### 3.1 Store Branding & Document Header Block
- **Store Name**: `PharmaLink Wholesale Medical Store` / `STORE_INFO.name` ("Idrees Medical Store")
- **Store Address & Contact**: Address (`STORE_INFO.address`), Phone (`STORE_INFO.phone`), E-mail (`STORE_INFO.email`), Drug License No. (`STORE_INFO.dslNumber`)
- **Report Title Badge**: `PURCHASE REORDER MANIFEST & STOCK SUMMARY` (Bordered 2px black box, uppercase, 1.25rem bold)
- **Metadata Sub-header Grid**:
  - Report Generation Date & Time (`new Date().toLocaleDateString(...)`, `toLocaleTimeString(...)`)
  - Prepared By: `Dr. Idrees (Purchase Manager & Admin)`
  - Total Items Analyzed: `medicines.length`
  - Reorder Status: `Urgent Reorder Required` (or `Stock Satisfactory`)

### 3.2 Inventory & Financial KPI Summary Grid
A 4-column bordered KPI grid displaying overall wholesale stock valuation:
1. **Total Catalog Medicines**: `{medicines.length} Products`
2. **Total Boxes in Stock**: `{totalBoxesInStock} Boxes`
3. **Total Inventory Cost Valuation**: `Rs. {totalInventoryCostValuation.toLocaleString()}`
4. **Low Stock Items Needing Reorder**: `{lowStockItems.length} Products` (Highlighted in bold)

### 3.3 Low Stock Purchase Reorder Table
An itemized table listing all medicines where `totalBoxes <= reorderLevel`:
- **Columns**:
  1. `Sr.` (#)
  2. `Item Code` (e.g., `MED-101`)
  3. `Medicine Trade Name` (Brand Name)
  4. `Generic Formula`
  5. `Manufacturer`
  6. `Current Stock` (Boxes)
  7. `Reorder Level` (Boxes)
  8. `Suggested Reorder Qty` (Boxes) `Math.max((reorderLevel * 2) - totalBoxes, reorderLevel)`
  9. `Purchase Cost / Box` (Rs.)
  10. `Est. Purchase Total` (Rs.) `suggestedReorderQty * purchasePriceBox`

- **Table Footer Summary**:
  - Total items to reorder
  - Total reorder box count sum
  - Total estimated purchase investment required (Rs.)

- **Print Optimization**:
  - Table rows set with `pageBreakInside: 'avoid'`
  - Border style: `1px solid #000000` / headers `2.5px solid #000000`

### 3.4 Signature & Approval Block
Dual-column authorization block placed at the bottom of the manifest:
1. **Left Column — Purchase Manager**:
   - Signature Image (`STORE_INFO.signatureImage`) or cursive signature font
   - Name: `M. Idrees` (`STORE_INFO.signatoryName`)
   - Title: `Purchase Manager & Authorized Signatory`
   - Date & Stamp line
2. **Right Column — Supplier / Vendor Acknowledgment**:
   - Signature / Stamp Line (`__________________________`)
   - Representative Name Line (`__________________________`)
   - Title: `Supplier / Distributor Representative`
   - Order Acceptance Date (`____ / ____ / 2026`)

- **Print Optimization**:
  - Wrapped in `pageBreakInside: 'avoid'` container so signature block never splits across page boundaries.

---

## 4. Full Component Implementation Code Proposals

### 4.1 Proposed `src/components/inventory/StockSummaryReportModal.jsx`

```jsx
import React from 'react';
import { Printer, X, FileText, Download, AlertTriangle, PackageCheck } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { STORE_INFO } from '../../data/mockData';

export const StockSummaryReportModal = ({ isOpen, onClose }) => {
  const { medicines = [], batches = [] } = useInventory();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Compute Stock Calculations
  let totalBoxesInStock = 0;
  let totalInventoryCostValuation = 0;

  const calculatedMedicines = medicines.map((med) => {
    const medBatches = batches.filter((b) => b.medicineId === med.id && b.status !== 'Quarantined');
    const totalBoxes = medBatches.reduce(
      (sum, b) => sum + (b.totalBoxesAvailable || Math.floor((b.totalTabletsAvailable || 0) / (med.tabletsPerBox || 200)) || 0),
      0
    );
    const purchaseCost = Number(med.purchasePriceBox || (med.boxPrice ? med.boxPrice * 0.8 : 480));
    const isLow = totalBoxes <= (med.reorderLevel || 25);
    const suggestedReorderQty = isLow ? Math.max((med.reorderLevel * 2) - totalBoxes, med.reorderLevel || 25) : 0;
    const estReorderCost = suggestedReorderQty * purchaseCost;

    totalBoxesInStock += totalBoxes;
    totalInventoryCostValuation += (totalBoxes * purchaseCost);

    return {
      ...med,
      totalBoxes,
      purchaseCost,
      isLow,
      suggestedReorderQty,
      estReorderCost
    };
  });

  const lowStockItems = calculatedMedicines.filter((m) => m.isLow);
  const totalReorderBoxes = lowStockItems.reduce((sum, m) => sum + m.suggestedReorderQty, 0);
  const totalReorderInvestment = lowStockItems.reduce((sum, m) => sum + m.estReorderCost, 0);

  const currentDateStr = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  const currentTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      {/* PRINT CSS ISOLATION OVERRIDE */}
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

      <div className="card modal-card" style={{ width: '95%', maxWidth: '980px', maxHeight: '94vh', overflowY: 'auto', padding: '1.5rem', position: 'relative', backgroundColor: '#F8FAFC' }}>
        <button onClick={onClose} className="no-print" style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <FileText size={22} color="#000" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#000' }}>Stock Summary & Purchase Reorder Report Preview</h3>
        </div>

        {/* PRINTABLE A4 PDF CONTAINER */}
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
            boxSizing: 'border-box'
          }}
        >
          {/* COMPLIANCE BLOCK TOP RIGHT */}
          <div style={{ textAlign: 'right', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', lineHeight: '1.65' }}>
            <div>DSL #: <span style={{ fontFamily: 'monospace', fontWeight: '900' }}>{STORE_INFO.dslNumber}</span></div>
            <div>STN #: <span style={{ fontFamily: 'monospace', fontWeight: '900' }}>{STORE_INFO.stnNumber}</span></div>
            <div>NTN #: <span style={{ fontFamily: 'monospace', fontWeight: '900' }}>{STORE_INFO.ntnNumber}</span></div>
          </div>

          {/* STORE BRANDING & DOCUMENT TITLE */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '2.1rem', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em', color: '#000000', lineHeight: '1.25' }}>
              PharmaLink Wholesale Medical Store
            </h1>
            <div style={{ fontSize: '0.925rem', fontWeight: 'bold', marginTop: '0.35rem', lineHeight: '1.5' }}>
              {STORE_INFO.address || 'Jalal Pur Jattan, Gujrat'}
            </div>
            <div style={{ fontSize: '0.835rem', marginTop: '0.2rem', lineHeight: '1.5' }}>
              Phone# {STORE_INFO.phone} &nbsp;|&nbsp; E-Mail: {STORE_INFO.email}
            </div>

            <div style={{ display: 'inline-block', border: '2px solid #000000', padding: '0.4rem 2rem', marginTop: '0.85rem', fontWeight: '900', fontSize: '1.15rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              PURCHASE REORDER MANIFEST & STOCK SUMMARY
            </div>
          </div>

          {/* REPORT METADATA GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', border: '2px solid #000000', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.8rem', lineHeight: '1.6' }}>
            <div>
              <div><strong>Report Date:</strong> {currentDateStr}</div>
              <div><strong>Report Time:</strong> {currentTimeStr}</div>
            </div>
            <div>
              <div><strong>Generated By:</strong> Dr. Idrees (Purchase Manager)</div>
              <div><strong>Catalog Scope:</strong> Full Stock Audit</div>
            </div>
            <div>
              <div><strong>Reorder Status:</strong> <span style={{ fontWeight: '900', color: lowStockItems.length > 0 ? '#DC2626' : '#059669' }}>{lowStockItems.length > 0 ? 'Urgent Order Required' : 'Stock Optimal'}</span></div>
              <div><strong>Total Low Stock Items:</strong> <strong>{lowStockItems.length} Products</strong></div>
            </div>
          </div>

          {/* KPI SUMMARY GRID */}
          <div style={{ border: '2px solid #000000', padding: '0.85rem 1rem', marginBottom: '1.85rem', backgroundColor: '#FAFAFA', pageBreakInside: 'avoid' }}>
            <div style={{ fontWeight: '900', fontSize: '0.95rem', textDecoration: 'underline', marginBottom: '0.6rem', letterSpacing: '0.02em' }}>
              EXECUTIVE INVENTORY & COST VALUATION METRICS:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#444' }}>Total Catalog Products:</span>
                <div style={{ fontSize: '1.15rem', fontWeight: '900' }}>{medicines.length} Products</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#444' }}>Total Stock Boxes:</span>
                <div style={{ fontSize: '1.15rem', fontWeight: '900' }}>{totalBoxesInStock.toLocaleString()} Boxes</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#444' }}>Estimated Inventory Cost:</span>
                <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0369A1' }}>Rs. {totalInventoryCostValuation.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#444' }}>Low Stock Reorder Items:</span>
                <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#DC2626' }}>{lowStockItems.length} Items</div>
              </div>
            </div>
          </div>

          {/* ITEMIZE LOW STOCK REORDER MANIFEST TABLE */}
          <div style={{ marginBottom: '1.85rem' }}>
            <div style={{ fontWeight: '900', fontSize: '1.05rem', borderBottom: '2px solid #000000', paddingBottom: '0.35rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📦 LOW STOCK REORDER MANIFEST ({lowStockItems.length} ITEMS AT OR BELOW REORDER THRESHOLD):</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.765rem', lineHeight: '1.5' }}>
              <thead>
                <tr style={{ borderTop: '2.5px solid #000000', borderBottom: '2.5px solid #000000', textAlign: 'left', backgroundColor: '#F3F4F6', pageBreakInside: 'avoid' }}>
                  <th style={{ padding: '0.55rem 0.3rem', width: '25px' }}>Sr.</th>
                  <th style={{ padding: '0.55rem 0.3rem' }}>Item Code</th>
                  <th style={{ padding: '0.55rem 0.3rem' }}>Medicine Trade Name</th>
                  <th style={{ padding: '0.55rem 0.3rem' }}>Generic Formula</th>
                  <th style={{ padding: '0.55rem 0.3rem' }}>Manufacturer</th>
                  <th style={{ padding: '0.55rem 0.3rem', textAlign: 'center' }}>Curr Stock</th>
                  <th style={{ padding: '0.55rem 0.3rem', textAlign: 'center' }}>Reorder Lvl</th>
                  <th style={{ padding: '0.55rem 0.3rem', textAlign: 'center' }}>Suggested Order</th>
                  <th style={{ padding: '0.55rem 0.3rem', textAlign: 'right' }}>Cost / Box</th>
                  <th style={{ padding: '0.55rem 0.3rem', textAlign: 'right' }}>Est. Investment</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.length > 0 ? (
                  lowStockItems.map((med, idx) => (
                    <tr key={med.id} style={{ borderBottom: '1px solid #CBD5E1', pageBreakInside: 'avoid' }}>
                      <td style={{ padding: '0.45rem 0.3rem' }}>{idx + 1}</td>
                      <td style={{ padding: '0.45rem 0.3rem', fontFamily: 'monospace', fontWeight: 'bold' }}>{med.id}</td>
                      <td style={{ padding: '0.45rem 0.3rem', fontWeight: 'bold' }}>{med.brandName}</td>
                      <td style={{ padding: '0.45rem 0.3rem', color: '#4B5563', fontSize: '0.725rem' }}>{med.genericFormula}</td>
                      <td style={{ padding: '0.45rem 0.3rem' }}>{med.manufacturer}</td>
                      <td style={{ padding: '0.45rem 0.3rem', textAlign: 'center', fontWeight: '900', color: '#DC2626' }}>{med.totalBoxes} Boxes</td>
                      <td style={{ padding: '0.45rem 0.3rem', textAlign: 'center' }}>{med.reorderLevel || 25} Boxes</td>
                      <td style={{ padding: '0.45rem 0.3rem', textAlign: 'center', fontWeight: '900' }}>{med.suggestedReorderQty} Boxes</td>
                      <td style={{ padding: '0.45rem 0.3rem', textAlign: 'right' }}>Rs. {med.purchaseCost.toFixed(2)}</td>
                      <td style={{ padding: '0.45rem 0.3rem', textAlign: 'right', fontWeight: '900' }}>Rs. {med.estReorderCost.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '1.5rem', color: '#059669', fontWeight: 'bold' }}>
                      All medicine stock levels are optimal. No low stock items require reordering at this time.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* MANIFEST TOTAL SUMMARY LINE */}
          <div style={{ borderTop: '2.5px solid #000000', borderBottom: '2.5px solid #000000', padding: '0.75rem 0.85rem', marginBottom: '1.85rem', fontSize: '0.875rem', lineHeight: '1.6', pageBreakInside: 'avoid', backgroundColor: '#FAFAFA' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontWeight: 'bold' }}>
              <div>
                <span>Low Stock Items Count: <strong>{lowStockItems.length} Products</strong></span> &nbsp;|&nbsp;
                <span>Total Reorder Box Quantity: <strong>{totalReorderBoxes} Boxes</strong></span>
              </div>
              <div style={{ fontSize: '1.05rem', textDecoration: 'underline', letterSpacing: '0.02em' }}>
                TOTAL ESTIMATED REORDER INVESTMENT: Rs. {totalReorderInvestment.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* DUAL SIGNATURE & APPROVAL BLOCK */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid #000000', paddingTop: '1.25rem', marginTop: '2rem', fontSize: '0.775rem', lineHeight: '1.5', pageBreakInside: 'avoid' }}>
            {/* PURCHASE MANAGER SIGNATURE */}
            <div style={{ border: '1px solid #000000', padding: '0.6rem 1rem', textAlign: 'center', minWidth: '240px' }}>
              {STORE_INFO.signatureImage ? (
                <img src={STORE_INFO.signatureImage} alt="Purchase Manager Signature" style={{ maxHeight: '46px', objectFit: 'contain', display: 'block', margin: '0 auto' }} />
              ) : (
                <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 'bold', fontSize: '1.05rem' }}>
                  {STORE_INFO.signatoryName || 'M. Idrees'}
                </div>
              )}
              <div style={{ borderTop: '1px solid #000000', marginTop: '0.4rem', paddingTop: '0.2rem', fontWeight: 'bold' }}>
                {STORE_INFO.signatoryName || 'M. Idrees'}
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                Purchase Manager & Authorized Signatory
              </div>
              <div style={{ fontSize: '0.675rem', color: '#555', marginTop: '0.15rem' }}>
                PharmaLink Wholesale Medical Store
              </div>
            </div>

            {/* SUPPLIER ACKNOWLEDGMENT & SIGNATURE */}
            <div style={{ border: '1px solid #000000', padding: '0.6rem 1rem', textAlign: 'center', minWidth: '240px' }}>
              <div style={{ height: '46px', borderBottom: '1px dashed #000000', marginBottom: '0.4rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize: '0.7rem', color: '#888' }}>
                (Supplier Seal & Signature)
              </div>
              <div style={{ fontWeight: 'bold' }}>
                __________________________
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, marginTop: '0.2rem' }}>
                Supplier Representative / Order Acceptance
              </div>
              <div style={{ fontSize: '0.675rem', color: '#555', marginTop: '0.15rem' }}>
                Date: ____ / ____ / 2026
              </div>
            </div>
          </div>
        </div>

        {/* MODAL ACTION BUTTONS */}
        <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Close</button>
          
          <button onClick={handlePrint} className="btn btn-outline" style={{ flex: 1, borderColor: '#0284C7', color: '#0284C7', fontWeight: 800 }}>
            <Download size={16} /> Save PDF Manifest
          </button>
          
          <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 1, backgroundColor: '#000000', color: '#FFF', fontWeight: 900 }}>
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

### 4.2 Integration into `src/pages/InventoryPage.jsx`

In `InventoryPage.jsx`:
1. Import `StockSummaryReportModal`:
   ```jsx
   import StockSummaryReportModal from '../components/modals/StockSummaryReportModal'; // or ../components/inventory/StockSummaryReportModal
   import { FileText } from 'lucide-react';
   ```
2. Add state variable:
   ```jsx
   const [isReportModalOpen, setIsReportModalOpen] = useState(false);
   ```
3. Add trigger button in the sticky toolbar (beside search/category filter or total count):
   ```jsx
   <button
     onClick={() => setIsReportModalOpen(true)}
     className="btn btn-primary"
     style={{ backgroundColor: '#0284C7', color: '#FFFFFF', fontWeight: 700, gap: '0.4rem', padding: '0.45rem 0.85rem' }}
   >
     <FileText size={16} /> Stock Summary Report
   </button>
   ```
4. Render modal at bottom of JSX return:
   ```jsx
   <StockSummaryReportModal
     isOpen={isReportModalOpen}
     onClose={() => setIsReportModalOpen(false)}
   />
   ```

---

## 5. `window.print()` Execution Flow & State Verification

1. **Trigger Phase**:
   User clicks "Print Reorder Manifest" or "Save PDF Manifest" button inside `StockSummaryReportModal`.
2. **Execution Phase**:
   `handlePrint` invokes native browser `window.print()`.
3. **Rendering & Isolation Phase**:
   - The browser applies the `@media print` CSS block.
   - All elements on `body` are hidden via `body * { visibility: hidden !important; }`.
   - The container `#stock-summary-pdf` and its child elements are explicitly overridden with `visibility: visible !important;` and `position: absolute; top: 0; left: 0; width: 100% !important;`.
   - Page margins are set to `6mm 8mm` on A4 paper.
4. **Cleanup Phase**:
   - After user completes or cancels the print prompt, the browser restores normal screen media styles (`@media screen`).
   - The SPA modal preview remains open without any UI distortion, DOM side effects, or lost state.
   - User can close the modal with the Close button or `X` icon.

---

## 6. Edge Cases & Risk Assessment

| Potential Edge Case | Risk Level | Mitigation Strategy |
|---------------------|------------|---------------------|
| No Low Stock Items found | Low | Render a clear success message row in the table ("All medicine stock levels are optimal. No low stock items require reordering."). |
| Long table spanning multiple pages | Medium | Enforce `pageBreakInside: 'avoid'` on all table rows and signature block, keeping headers fixed per page. |
| Modal height overflow on small screens | Low | Set `maxHeight: '94vh'` and `overflowY: 'auto'` on `.modal-card` in screen mode. |
| Cashier role access | Low | Both Admin and Cashier can view and print stock reports (RBAC restriction is not required for viewing stock summary). |

---

## 7. Next Steps for Implementer

1. Create `src/components/inventory/StockSummaryReportModal.jsx` (or `src/components/modals/StockSummaryReportModal.jsx`).
2. Integrate button and modal state into `src/pages/InventoryPage.jsx`.
3. Verify `npm run build` passes cleanly with 0 warnings/errors.
