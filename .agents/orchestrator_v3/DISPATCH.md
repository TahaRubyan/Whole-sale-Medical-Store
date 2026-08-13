## 2026-08-13T00:52:47Z

<USER_REQUEST>
You are the Project Orchestrator for Wholesale Medical Store Phase 2 enhancements.

Working directory: d:/Code/medical store whole sale/Medical Store Phase 2
Metadata directory: d:/Code/medical store whole sale/Medical Store Phase 2/.agents/orchestrator_v3

Your mission is to orchestrate the implementation of the requested fixes and enhancements specified in ORIGINAL_REQUEST.md under ## Follow-up — 2026-08-13T00:52:29Z:

Requirements:
1. R1. Fix ReferenceError Bug:
   - In A4InvoiceModal.jsx and A4InvoicePrintModal.jsx, import getTaxConfig from '../../data/mockData' to fix ReferenceError: getTaxConfig is not defined.
2. R2. 6-Month Expiry Rejection & Warning Popups:
   - In POSPage.jsx, check item/batch expiry when adding to cart. If expiry <= 6 months from today, block addition and show popup: "Cannot Add Item: Expiry Date Exceeded (Expires within 6 Months)".
   - In NewPOModal.jsx, check batch expiry when adding inward PO batch. If expiry <= 6 months from today, block addition and show popup: "Cannot Add Batch: Expiry Date Exceeded (Must be > 6 Months)".
3. R3. Date Standardization (DD-MM-YYYY):
   - Standardize all displayed dates across POS, Invoices, POs, Inventory, Region Ledger, and Reports to DD-MM-YYYY format using a helper function.
4. R4. Supplier Debt Payment Modal:
   - Create PaySupplierModal.jsx and add a "[💵 Record Payment / Pay Balance]" button to SuppliersPage.jsx so admin can pay supplier debt, reduce pending balance, and record a payment log.
5. R5. Simplified Sidebar Labels:
   - Update Sidebar.jsx menu labels to simple terms: Home / Overview, Sales & Billing (POS), Medicine Stock, Expiry Alerts, Region Deliveries & Cash, Suppliers & Purchases, Sales & Profit Reports, Store Settings.
6. R6. Fresh Customer POS Workflow & Search Dropdown:
   - In POSPage.jsx, do not pre-fill customer by default. Open CustomerDetailsModal.jsx with empty inputs and placeholders.
   - When search bar gets focus (onFocus), immediately show full/filtered inventory dropdown so user can press ArrowDown and Enter to select items.
7. R7. Region Ledger UI Redesign & Region Sync:
   - Redesign RegionLedgerPage.jsx for clean visual hierarchy, modern cards, and dynamic region dropdown synced with customer regions.

Acceptance Criteria:
- npm run build passes cleanly with 0 errors.
- All functional and UI requirements verified.
</USER_REQUEST>
