# Project: Medical Store Phase 2 (PharmaLink ERP & POS)

## Architecture
- **Framework**: React 18 + Vite 5
- **Styling**: Vanilla CSS Custom Properties (`src/styles/theme.css`, Ocean Blue theme tokens)
- **Icons**: Lucide React (`lucide-react`)
- **Routing**: Screen state in `App.jsx` (`currentScreen`) & `Sidebar.jsx`
- **State Management**: `InventoryContext.jsx` (catalog & batch stock), `SalesContext.jsx` (invoices, debt & payment logs), `CartContext.jsx` (POS checkout & customer details)
- **PDF Generation**: Browser native `@media print` DOM container isolation + `window.print()`

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Stock Summary Modal Trigger | Add "Stock Summary & Reorder Report" button in `InventoryPage.jsx` | M1 | R1 |
| 2 | Stock Summary Metrics | KPI cards for Total Medicines, Total Boxes Available, Estimated Inventory Cost Valuation, Low Stock Count | M1 | R1 |
| 3 | Low Stock Reorder Table | Table of items where `totalBoxes <= reorderLevel` with suggested box reorder quantities & investment cost | M1 | R1 |
| 4 | A4 Purchase Reorder Manifest PDF | One-click A4 PDF export button using `@media print` DOM isolation & `window.print()` | M1 | R1 |
| 5 | Region Ledger Navigation & Route | Add `/region-ledger` route in `App.jsx` and "Region Delivery Ledger" entry in `Sidebar.jsx` | M2 | R2 |
| 6 | Region Filter Bar | Dropdown / filter bar allowing selection of plain-text Region (Karianwala, Gujrat, Tanda, Jalalpur Jattan, etc.) | M2 | R2 |
| 7 | Inline Settlement Table | Table displaying Shop Name, Region, Delivery Man, Payment Status, Net Total, Current Due, and Cash Received Today input | M2 | R2 |
| 8 | Cash Settlement Handler | Inline "Settle Cash" per shop and "Settle All Region Cash" updating remaining debt, status, and appending timestamped payment logs | M2 | R2 |
| 9 | Payment History Log Modal | Modal showing full timestamped log entries (Date, Time, Amount Paid, Remaining Due) for shop invoices | M2 | R2 |
| 10 | Regional Delivery Manifest PDF | One-click clean A4 Regional Delivery Manifest & Settlement PDF export button | M2 | R2 |
| 11 | Plain-Text Region Inputs | Plain text input for Region in `CustomerDetailsModal.jsx` and POS checkout panel | M3 | R3 |
| 12 | Final Build Verification | Pass `npm run build` with 0 errors and complete E2E verification | M4 | Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Stock Summary & Reorder PDF Report Modal | `StockSummaryReportModal.jsx`, `InventoryPage.jsx` integration | None | DONE |
| M2 | Region-Based Delivery & Settlement Ledger | `RegionLedgerPage.jsx`, `PaymentHistoryModal.jsx`, `RegionalDeliveryManifestModal.jsx`, `Sidebar.jsx`, `App.jsx`, `SalesContext.jsx` integration | None | DONE |
| M3 | Plain-Text Region Inputs & POS Integration | `CustomerDetailsModal.jsx`, POS checkout panel region inputs | None | DONE |
| M4 | Final Build & Quality Acceptance | `npm run build`, E2E test verification, Reviewer & Auditor approval | M1, M2, M3 | DONE |

## Interface Contracts
### `StockSummaryReportModal.jsx` (COMPLETED)
- Props: `isOpen` (boolean), `onClose` (function)
- Context Dependencies: `useInventory()` from `InventoryContext.jsx`
- Exports: A4 print container `#stock-summary-pdf`

### `RegionLedgerPage.jsx` (COMPLETED)
- Context Dependencies: `useSales()` from `SalesContext.jsx`, `useInventory()`
- Functions: `recordDebtPayment(invoiceId, amount, notes)` from `SalesContext`
- Modals: `PaymentHistoryModal.jsx`, `RegionalDeliveryManifestModal.jsx`

### Plain-Text Region Data Contract (COMPLETED)
- Field: `region` (string, e.g. "Karianwala", "Gujrat", "Tanda", "Jalalpur Jattan")
- Stored on: Customer details object and Invoice record (`invoice.region`)

## Code Layout
- `src/components/inventory/StockSummaryReportModal.jsx` (Created & Verified)
- `src/components/region/RegionLedgerPage.jsx` (Created & Verified)
- `src/pages/RegionLedgerPage.jsx` (Created & Verified)
- `src/components/region/PaymentHistoryModal.jsx` (Created & Verified)
- `src/components/region/RegionalDeliveryManifestModal.jsx` (Created & Verified)
- `src/pages/InventoryPage.jsx` (Modified & Verified)
- `src/components/common/Sidebar.jsx` (Modified & Verified)
- `src/components/common/Topbar.jsx` (Modified & Verified)
- `src/App.jsx` (Modified & Verified)
- `src/components/modals/CustomerDetailsModal.jsx` (Modified & Verified)
- `src/context/SalesContext.jsx` (Modified & Verified)
- `src/context/CartContext.jsx` (Modified & Verified)
