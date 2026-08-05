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
