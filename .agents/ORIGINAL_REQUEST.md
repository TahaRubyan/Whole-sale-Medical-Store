# Original User Request

## 2026-07-31T20:22:34Z

<USER_REQUEST>
Build a high-performance, modern, feature-rich Medical Store Management System (PharmaLink ERP & POS) desktop-styled SPA using React + Vanilla CSS in d:\Code\Medical Store. The system includes 8 dedicated screens, FEFO batch selection, POS billing, expiry radar, supplier management, patient Rx logs, financial analytics, and Role-Based Access Control (RBAC) supporting live Admin ↔ Cashier switching.

Working directory: d:\Code\Medical Store
Integrity mode: development

## Requirements

### R1. React + Vanilla CSS Component Architecture
Build a Vite + React application using Vanilla CSS (CSS Modules / CSS Custom Properties) following the Ocean Blue ERP theme (#0284C7 Ocean Blue, #F7F4EF Warm Off-White Canvas, #E0F2FE Ice Blue tint, Plus Jakarta Sans typography).

### R2. Core Operational Modules (8 Screens)
1. **Dashboard & Live Monitor**: KPI Cards (Revenue, Profit, Low Stock, Near Expiry), 7-Day sales chart, urgent alert feed, and hotkey actions (F1-F4).
2. **POS & FEFO Billing Checkout**: Omni-search (Barcode/Name), auto-selected earliest expiring batch (FEFO), Rack/Shelf location display (Rack B-03 / Shelf 2), Schedule H Rx patient drawer, thermal receipt (F9) and A4 invoice (F10) preview modals.
3. **Inventory & Batch Manager**: Master catalog table, multi-batch detail side drawer, and Admin stock override modal.
4. **Expiry Radar & Quarantine**: 30/60/90 day timeline tabs, batch value loss calculation, and one-click supplier return notes.
5. **Supplier & Purchase Orders**: Supplier directory, new PO inward stock builder with batch creation.
6. **Prescriptions & Patient Records**: Patient registry table and Rx transaction history log.
7. **Financial & Sales Analytics**: Date range picker, financial KPIs (Gross sales, COGS, Net profit, GST tax), and sales ledger.
8. **Settings & Staff Management**: Store profile & licensing (Drug License Form 20/21, GSTIN), thermal printer config, and staff RBAC accounts manager.

### R3. Role-Based Access Control (RBAC)
Provide a live top-bar Role Switcher toggle (Admin vs Cashier). Restrict master catalog CRUD, profit analytics, supplier POs, and system settings when logged in as Cashier.

## Acceptance Criteria

### Functionality & Navigation
- All 8 screens are fully interactive and accessible via the Ocean Blue navigation sidebar.
- POS auto-assigns the earliest expiring batch (FEFO) when medicines are added to cart.
- Cashier mode successfully locks out master edits, financial profit metrics, and settings.
- Thermal receipt (80mm) and A4 Tax Invoice preview modals render cleanly and can be triggered via F9/F10 hotkeys.
- Application builds without errors (npm run build) and runs cleanly locally.
</USER_REQUEST>

## Follow-up — 2026-08-12T15:09:55Z

<USER_REQUEST>
Implement the Stock Summary PDF Report and Region-Based Wholesale Delivery & Settlement Ledger in the existing Wholesale Medical Store ERP & POS codebase.

Working directory: d:/Code/medical store whole sale/Medical Store Phase 2
Integrity mode: development

## Requirements

### R1. Stock Summary & Low Stock Reorder PDF Report Modal
- Add a dedicated "Stock Summary & Reorder Report" modal in StockSummaryReportModal.jsx accessible from InventoryPage.jsx.
- Show overall stock summary metrics (Total Medicines, Total Boxes Available, Estimated Inventory Cost Valuation).
- Show Low Stock Reorder Table for items at or below reorder level.
- Provide a One-Click A4 PDF Export button for generating a clean A4 Purchase Reorder Manifest.

### R2. Region-Based Delivery & Settlement Ledger Page
- Create a new dedicated page RegionLedgerPage.jsx and add "Region Delivery Ledger" option in Sidebar.jsx and App.jsx (/region-ledger).
- Allow filtering customer shop orders/invoices by Region (e.g. Karianwala, Gujrat, Tanda, Jalalpur Jattan).
- Provide an Inline Settlement Table displaying Shop Name, Region, Delivery Man, Payment Status, Net Total, Current Due, and an interactive Cash Received Today (Rs.) input field for each shop.
- Provide an inline "Settle Cash" button per shop and "Settle All Region Cash" button.
- When cash is received/submitted, update the invoice remaining debt, set payment status (PAID or PARTIAL DEBT), and append a real-time timestamped payment log entry (date, time, amountPaid, remainingDebtAfter).
- Provide a Payment History Log modal to view full timestamped payment logs (Date, Time, Amount Paid, Amount Due) for any shop invoice.
- Provide an A4 Regional Delivery Manifest & Settlement PDF export button.

### R3. Plain-Text Region Inputs
- Ensure Region is a plain text input field in CustomerDetailsModal.jsx and POS checkout panel so cashiers and admins can type any region name.

## Acceptance Criteria

### Verification Criteria
- Automated build npm run build passes with 0 errors.
- Stock Summary Modal opens from Inventory Page, displays correct low stock items, and exports A4 PDF.
- Region Ledger page filters invoices by plain text region (e.g., Karianwala).
- Entering cash received in the inline table for a shop updates remaining debt and appends timestamped log (Date, Time, Amount Paid, Remaining Due) in real-time.
- Regional Delivery Manifest exports A4 PDF cleanly.
</USER_REQUEST>

## Follow-up — 2026-08-13T00:52:29Z

<USER_REQUEST>
Implement the 9 requested fixes and enhancements in the existing Wholesale Medical Store ERP & POS codebase.

Working directory: d:/Code/medical store whole sale/Medical Store Phase 2
Integrity mode: development

## Requirements

### R1. Fix ReferenceError Bug
- In A4InvoiceModal.jsx and A4InvoicePrintModal.jsx, import getTaxConfig from '../../data/mockData' to fix ReferenceError: getTaxConfig is not defined.

### R2. 6-Month Expiry Rejection & Warning Popups
- In POSPage.jsx, check item/batch expiry when adding to cart. If expiry <= 6 months from today, block addition and show popup: "Cannot Add Item: Expiry Date Exceeded (Expires within 6 Months)".
- In NewPOModal.jsx, check batch expiry when adding inward PO batch. If expiry <= 6 months from today, block addition and show popup: "Cannot Add Batch: Expiry Date Exceeded (Must be > 6 Months)".

### R3. Date Standardization (DD-MM-YYYY)
- Standardize all displayed dates across POS, Invoices, POs, Inventory, Region Ledger, and Reports to DD-MM-YYYY format using a helper function.

### R4. Supplier Debt Payment Modal
- Create PaySupplierModal.jsx and add a "[💵 Record Payment / Pay Balance]" button to SuppliersPage.jsx so admin can pay supplier debt, reduce pending balance, and record a payment log.

### R5. Simplified Sidebar Labels
- Update Sidebar.jsx menu labels to simple terms: Home / Overview, Sales & Billing (POS), Medicine Stock, Expiry Alerts, Region Deliveries & Cash, Suppliers & Purchases, Sales & Profit Reports, Store Settings.

### R6. Fresh Customer POS Workflow & Search Dropdown
- In POSPage.jsx, do not pre-fill customer by default. Open CustomerDetailsModal.jsx with empty inputs and placeholders.
- When search bar gets focus (onFocus), immediately show full/filtered inventory dropdown so user can press ArrowDown and Enter to select items.

### R7. Region Ledger UI Redesign & Region Sync
- Redesign RegionLedgerPage.jsx for clean visual hierarchy, modern cards, and dynamic region dropdown synced with customer regions.

## Acceptance Criteria

### Verification Criteria
- Automated build npm run build passes with 0 errors.
- Invoice viewing no longer throws ReferenceError.
- Items with expiry <= 6 months are blocked on POS and PO inward entry with warning popups.
- Supplier debt payment reduces pending balance and logs transaction.
- Sidebar menu items display simplified non-technical names.
- POS search bar auto-shows inventory dropdown on focus.
</USER_REQUEST>

