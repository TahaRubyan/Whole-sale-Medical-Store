# Comprehensive Analysis Report: PDF Export Mechanisms & Inventory Valuation Architecture

**Author**: Explorer 2 (PDF Export & Inventory Valuation Specialist)  
**Date**: 2026-08-12  
**Target Project**: Medical Store Phase 2 (`d:/Code/medical store whole sale/Medical Store Phase 2`)  
**Mission**: Investigate existing PDF generation/print implementations and inventory data structures; formulate exact requirements and design approach for `StockSummaryReportModal.jsx` (R1).

---

## Executive Summary

1. **PDF Export Architecture**: The codebase uses **native browser printing via `window.print()`** with **embedded `@media print` CSS overrides** to generate clean A4 PDF exports and thermal receipt prints. No third-party PDF rendering libraries (such as `jsPDF`, `html2pdf`, or `pdfmake`) are installed in `package.json`. Both "Save PDF" and "Print" modal buttons invoke `window.print()`, leveraging the browser's built-in "Save as PDF" print destination.
2. **Inventory & Cost Valuation Data Structure**: Inventory state is split into master catalog items (`medicines` array in `InventoryContext`) and active batches (`batches` array in `InventoryContext`). Stock is stored at the tablet unit level (`totalTabletsAvailable`), but wholesale operations calculate available stock in **Boxes** using `tabletsPerBox` (`Math.floor(totalTabletsAvailable / tabletsPerBox)`). Low stock is evaluated per medicine when `totalBoxes <= reorderLevel`. Cost valuation uses `purchasePriceBox` (distributor unit purchase cost per box).
3. **Design Blueprint for `StockSummaryReportModal.jsx` (R1)**: A dedicated modal accessible from `InventoryPage.jsx` that computes overall inventory KPIs (Total Medicines, Total Boxes Available, Estimated Inventory Cost Valuation), presents an itemized Low Stock Reorder Table, and exports a formatted A4 Purchase Reorder Manifest PDF using the established `@media print` DOM isolation pattern.

---

## 1. Investigation of PDF Generation & Print Modals

### 1.1 Dependency Audit
Inspection of `package.json` confirms no external PDF libraries exist in the project:
- `package.json` (`d:/Code/medical store whole sale/Medical Store Phase 2/package.json`):
  - `dependencies`: `lucide-react` (^0.344.0), `react` (^18.2.0), `react-dom` (^18.2.0)
  - `devDependencies`: `@vitejs/plugin-react` (^4.2.1), `vite` (^5.1.4)

### 1.2 Existing Print/PDF Modal Pattern
All printable documents in the codebase follow a unified 4-part design pattern:
1. **Print Handler**:
   ```javascript
   const handlePrint = () => {
     window.print();
   };
   ```
2. **DOM Isolation via Embedded `@media print` CSS**:
   An inline `<style>` block within the React component defines:
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
     #printable-container-id, #printable-container-id * {
       visibility: visible !important;
     }
     #printable-container-id {
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
3. **Dual Export Actions**:
   Both the "Save PDF" button and "Print" button execute `handlePrint()` (`window.print()`), relying on the standard browser print dialog where users can select "Save as PDF" or send directly to a printer.
4. **Header & Footer Compliance Block**:
   Every printable A4 document embeds `STORE_INFO` metadata (DSL #, STN #, NTN #, Store Address, Phone/Email) at the top, and a digital signature block (`STORE_INFO.signatureImage` or `STORE_INFO.signatoryName`) at the bottom.

### 1.3 Verified Evidence Chain for PDF Modals

| File Path | Element ID | `@page` Media Rule | Lines |
|---|---|---|---|
| `src/components/modals/A4InvoiceModal.jsx` | `#a4-invoice` | `size: A4 portrait; margin: 6mm 8mm;` | lines 16–70, 108–326 |
| `src/components/modals/AnalyticsReportPrintModal.jsx` | `#analytics-pdf-report` | `size: A4 portrait; margin: 6mm 8mm;` | lines 17–80, 93–260 |
| `src/components/modals/SupplierLedgerPrintModal.jsx` | `#supplier-ledger-print` | `size: A4 portrait; margin: 6mm 8mm;` | lines 11–105, 118–192 |
| `src/components/modals/RtvInvoicePrintModal.jsx` | `#rtv-invoice-print` | `size: A4 portrait; margin: 6mm 8mm;` | lines 15–85 |
| `src/components/modals/ThermalReceiptModal.jsx` | `#thermal-receipt` | `size: 80mm auto; margin: 0;` | lines 12–50 |

---

## 2. Inspection of Inventory Data Structures & Cost Valuation

### 2.1 State Architecture & Persistence
Inventory state is maintained in `src/context/InventoryContext.jsx` and initialized from `src/data/mockData.js` (`INITIAL_MEDICINES` and `INITIAL_BATCHES`). It persists to `localStorage` under keys `pharmalink_pk_medicines` and `pharmalink_pk_batches`.

### 2.2 Master Catalog Item Schema (`medicines`)
```javascript
{
  id: "MED-101",                     // Unique Item Code (string)
  brandName: "Panadol 500mg",        // Trade Name (string)
  genericFormula: "Paracetamol 500mg",// Formula (string)
  category: "Tablets",               // Dosage Form / Category (string)
  manufacturer: "GSK Pakistan",      // Manufacturer / Principal (string)
  hsnCode: "3004.90",                // Tax Code (string)
  rackLocation: "Rack A-01 / Shelf 2",// Physical Location (string)
  reorderLevel: 50,                  // Minimum Stock Threshold in Boxes (number)
  unitType: "Tablet",                // Smallest Unit (string)
  tabletsPerBox: 200,                // Packaging Factor (tablets per box) (number)
  boxPrice: 600,                     // Retail/Wholesale Selling Price per Box (number)
  pricePerTablet: 3.0,               // Selling Price per Tablet (number)
  purchasePriceBox: 480,             // Distributor Unit Purchase Cost per Box (number)
  requiresPrescription: false,       // Rx Flag (boolean)
  barcode: "8901234567890"           // Barcode String
}
```

### 2.3 Batch Stock Schema (`batches`)
```javascript
{
  id: "BAT-PAN-2026A",                // Unique Batch ID (string)
  medicineId: "MED-101",              // Foreign Key to medicines.id (string)
  batchNumber: "B26-Pan-01",          // Batch Lot # (string)
  mfgDate: "2025-01-10",              // Manufacturing Date YYYY-MM-DD
  expiryDate: "2027-06-30",           // Expiry Date YYYY-MM-DD
  totalTabletsAvailable: 850,         // Available Tablets Count (number)
  totalBoxesAvailable: 4,             // Optional Box Count (number)
  boxPrice: 600,                      // Selling Box Price (number)
  pricePerTablet: 3.0,                // Price per Tablet (number)
  purchasePriceBox: 480,              // Purchase Cost per Box (number)
  distributorName: "Muller & Phipps", // Supplier Name (string)
  status: "In Stock"                  // Status: "In Stock" | "Near Expiry" | "Quarantined"
}
```

### 2.4 Mathematical Calculations for Stock Metrics & Valuation

1. **Available Boxes per Medicine (`totalBoxes`)**:
   Filtered against non-quarantined batches:
   $$\text{totalBoxes} = \sum_{b \in \text{activeBatches}(med.id)} \left( b.\text{totalBoxesAvailable} \parallel \lfloor \frac{b.\text{totalTabletsAvailable}}{\text{tabletsPerBox}} \rfloor \right)$$
   *Code Reference*: `InventoryPage.jsx` lines 113–114.

2. **Low Stock Reorder Condition**:
   $$\text{isLow} = \text{totalBoxes} \le med.\text{reorderLevel}$$

3. **Distributor Purchase Unit Cost per Box**:
   $$costPerBox = med.\text{purchasePriceBox} \parallel (med.\text{boxPrice} \times 0.8)$$

4. **Estimated Inventory Cost Valuation**:
   $$\text{Total Cost Valuation} = \sum_{med \in \text{medicines}} \left( \text{totalBoxes}(med) \times costPerBox(med) \right)$$

5. **Overall Stock Summary Metrics**:
   - **Total Medicines**: `medicines.length`
   - **Total Boxes Available**: $\sum_{med} \text{totalBoxes}(med)$
   - **Low Stock Count**: Count of medicines where $\text{totalBoxes}(med) \le med.\text{reorderLevel}$
   - **Estimated Inventory Cost Valuation**: Total purchasing cost of all in-stock boxes.

---

## 3. Design Requirements & Specifications for `StockSummaryReportModal.jsx` (R1)

### 3.1 Component Location & Entry Point
- File path: `src/components/modals/StockSummaryReportModal.jsx`
- Access point: Button in `InventoryPage.jsx` header bar next to search input:
  `<button onClick={() => setShowSummaryReportModal(true)} className="btn btn-primary" style={{ backgroundColor: '#0284C7' }}><FileText size={16}/> Stock Summary & Reorder Report</button>`

### 3.2 Modal Props & Interface
```typescript
interface StockSummaryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicines: Medicine[];
  batches: Batch[];
}
```

### 3.3 Internal Logic & Summary Metric Calculations
```javascript
// 1. Calculate boxes for each medicine
const getMedicineStockBoxes = (medId, tabletsPerBox) => {
  const medBatches = batches.filter((b) => b.medicineId === medId && b.status !== 'Quarantined');
  return medBatches.reduce((sum, b) => {
    if (b.totalBoxesAvailable !== undefined) return sum + Number(b.totalBoxesAvailable);
    const tabs = Number(b.totalTabletsAvailable) || 0;
    const perBox = Number(tabletsPerBox) || 1;
    return sum + Math.floor(tabs / perBox);
  }, 0);
};

// 2. Summary KPI Calculations
const totalMedicines = medicines.length;
let totalBoxesInStock = 0;
let estimatedInventoryValuation = 0;
const lowStockMedicines = [];

medicines.forEach((med) => {
  const boxes = getMedicineStockBoxes(med.id, med.tabletsPerBox);
  const unitCost = Number(med.purchasePriceBox || (med.boxPrice * 0.8) || 0);
  
  totalBoxesInStock += boxes;
  estimatedInventoryValuation += (boxes * unitCost);

  if (boxes <= Number(med.reorderLevel || 0)) {
    const suggestedOrderBoxes = Math.max((Number(med.reorderLevel) * 2) - boxes, Number(med.reorderLevel));
    const estimatedReorderCost = suggestedOrderBoxes * unitCost;
    lowStockMedicines.push({
      ...med,
      currentStockBoxes: boxes,
      suggestedOrderBoxes,
      unitCost,
      estimatedReorderCost,
    });
  }
});
```

### 3.4 Modal Structure & A4 Print Layout

#### A. Interactive Modal Preview (Screen View)
- Modal backdrop overlay (`rgba(0,0,0,0.6)`).
- Card container (`maxWidth: '980px'`, `maxHeight: '94vh'`).
- `no-print` Header: Title "Stock Summary & Low Stock Reorder Report", Close button.
- `no-print` Action Footer:
  - `Close` button (`btn-outline`).
  - `Save PDF Report` button (`btn-outline`, invokes `window.print()`).
  - `Print Reorder Manifest` button (`btn-primary`, invokes `window.print()`).

#### B. Printable Container (`#stock-summary-report`)
- **Store Branding Header**: `STORE_INFO.name` ("Idrees Medical Store"), address ("Jalal Pur Jattan"), phone, email, DSL #, STN #, NTN #.
- **Report Title Banner**: `PURCHASE REORDER MANIFEST & STOCK VALUATION REPORT` in bold bordered box.
- **Executive KPI Summary Card (4 Grid Columns)**:
  1. Total Catalog Medicines (`totalMedicines`)
  2. Total Boxes Available (`totalBoxesInStock`)
  3. Estimated Inventory Cost Valuation (`Rs. estimatedInventoryValuation.toLocaleString()`)
  4. Low Stock Reorder Items Count (`lowStockMedicines.length`)
- **Low Stock Reorder Table**:
  - Columns:
    1. Sr. #
    2. Item Code (`med.id`)
    3. Trade Name (`med.brandName`)
    4. Generic Formula (`med.genericFormula`)
    5. Rack Location (`med.rackLocation`)
    6. Current Stock (Boxes)
    7. Reorder Level (Boxes)
    8. Suggested Order Qty (Boxes)
    9. Purchase Unit Cost (Rs.)
    10. Est. Reorder Cost (Rs.)
  - Table Footer Row: Total Reorder Boxes Needed, Total Estimated Reorder Investment (Rs.).
- **Report Metadata & Signature Footer**:
  - Left: Generated by Admin, timestamp.
  - Right: Authorized Signatory Box (`STORE_INFO.signatureImage` or `STORE_INFO.signatoryName`).

---

## 4. Verification & Testing Plan

1. **Build Verification**:
   - Command: `npm run build`
   - Target: 0 lint or build errors.
2. **Modal Opening & Calculation Test**:
   - Verify modal opens via button on `InventoryPage.jsx`.
   - Verify KPI cards match state totals.
   - Verify low stock table lists items where `totalBoxes <= reorderLevel`.
3. **Print / PDF Export Test**:
   - Trigger "Save PDF Report" / "Print Reorder Manifest".
   - Confirm browser print preview displays clean single/multi-page A4 layout without background UI artifacts.

---
*End of Analysis Report*
