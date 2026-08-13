# Project: Wholesale Medical Store Phase 2 Enhancements

## Architecture
- React SPA built with Vite + Vanilla CSS.
- Context API state management (`SalesContext`, `SupplierContext`, `InventoryContext`, etc.).
- Modular UI structure: `src/components/common/`, `src/components/modals/`, `src/pages/`, `src/data/`, `src/utils/`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | R1: Fix ReferenceError Bug | Import `getTaxConfig` from `../../data/mockData` in `A4InvoiceModal.jsx` and `A4InvoicePrintModal.jsx` | Milestone 1 | survey |
| 2 | R5: Simplified Sidebar Labels | Update menu labels in `Sidebar.jsx` to simplified terminology | Milestone 1 | survey |
| 3 | R2: 6-Month Expiry Rejection & Warnings | Block item/batch additions <= 6 months in `POSPage.jsx` & `NewPOModal.jsx` with warning popups | Milestone 2 | survey |
| 4 | R3: Date Standardization (DD-MM-YYYY) | Implement `src/utils/dateUtils.js` (`formatDateDDMMYYYY`) and apply across POS, Invoices, POs, Inventory, Region Ledger, and Reports | Milestone 2 | survey |
| 5 | R4: Supplier Debt Payment Modal | Create `PaySupplierModal.jsx`, add pay button to `SuppliersPage.jsx`, update `SupplierContext.jsx` for timestamped logs and balance reduction | Milestone 3 | survey |
| 6 | R6: Fresh Customer POS Workflow & Search Dropdown | Clear default customer pre-fill in POS / `CustomerDetailsModal.jsx`; show full/filtered dropdown on POS search focus | Milestone 3 | survey |
| 7 | R7: Region Ledger UI Redesign & Region Sync | Redesign `RegionLedgerPage.jsx` for modern visual hierarchy, cards, and dynamic region dropdown synced with customer regions | Milestone 4 | survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: R1 Fix & R5 Sidebar Labels | Fix ReferenceError in A4 invoice modals & update Sidebar navigation labels | None | DONE |
| 2 | M2: R2 6-Month Expiry & R3 Date Standardization | Add expiry checks (POS & PO) and create `src/utils/dateUtils.js` for app-wide DD-MM-YYYY dates | None | DONE |
| 3 | M3: R4 Supplier Payment Modal & R6 POS Workflow | Create `PaySupplierModal.jsx`, update supplier state, clear POS customer pre-fill, and enable search dropdown on focus | None | DONE |
| 4 | M4: R7 Region Ledger Redesign & Final Build | Redesign `RegionLedgerPage.jsx`, sync regions dynamically, and run clean `npm run build` verification | M1, M2, M3 | PLANNED |

## Interface Contracts
### `dateUtils.js` ↔ All Components
- `formatDateDDMMYYYY(dateStringOrObj)` -> returns string in `DD-MM-YYYY` format (or fallback if invalid).

### `PaySupplierModal.jsx` ↔ `SupplierContext.jsx`
- `recordSupplierPayment(supplierId, amountPaid, paymentMode, note)` -> reduces `pendingBalance` and appends `{ id, date, time, amountPaid, paymentMode, note, remainingBalanceAfter }` to `paymentLogs`.

### `POSPage.jsx` / `CustomerDetailsModal.jsx`
- Default `customerDetails`: `{ shopName: '', licenseNo: '', phone: '', address: '', region: '' }`.

## Code Layout
- `src/components/modals/A4InvoiceModal.jsx`
- `src/components/modals/A4InvoicePrintModal.jsx`
- `src/components/modals/PaySupplierModal.jsx` (New)
- `src/components/modals/CustomerDetailsModal.jsx`
- `src/components/modals/NewPOModal.jsx`
- `src/components/common/Sidebar.jsx`
- `src/components/layout/Sidebar.jsx`
- `src/pages/POSPage.jsx`
- `src/pages/SuppliersPage.jsx`
- `src/pages/RegionLedgerPage.jsx`
- `src/pages/InventoryPage.jsx`
- `src/pages/FinancialReportsPage.jsx` / `FinancialAnalyticsPage.jsx`
- `src/pages/ExpiryRadarPage.jsx`
- `src/utils/dateUtils.js` (New)
