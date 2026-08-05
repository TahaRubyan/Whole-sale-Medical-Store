## 2026-08-01T01:40:06Z

<USER_REQUEST>
You are the Worker for Milestone 3: Inventory, Expiry Radar & Supplier Management of PharmaLink ERP & POS.
Your metadata working directory is d:\Code\Medical Store\.agents\teamwork_preview_worker_m3_1. Please create it if it does not exist.

Task Scope:
Read the Explorer's analysis and plan at d:\Code\Medical Store\.agents\teamwork_preview_explorer_m3_1\analysis.md and handoff.md.

Construct all components and context providers for Milestone 3:
1. `src/context/SupplierContext.jsx`: State management for supplier directory initialized from `MOCK_SUPPLIERS` with `localStorage` key `pharmalink_suppliers`. Provides `addSupplier(supplierData)` and `createPurchaseOrder(poData)`.
2. Update `src/context/InventoryContext.jsx`: Add `addOrUpdateBatch(productId, batchData)` to enable inward stock creation/updates from purchase orders.
3. Update `src/App.jsx`: Include `SupplierProvider` in the context wrapper chain.
4. Modal Components:
   - `src/components/modals/BatchDetailDrawer.jsx`: Multi-batch side drawer displaying all batches for a selected medicine (Batch #, Expiry Date, MRP, Purchase Price, Stock Qty, Rack/Shelf location, Expiry status badge).
   - `src/components/modals/StockOverrideModal.jsx`: Stock override modal allowing Admin to modify batch stock quantity. Guarded by `permissions.canOverrideStock` (disabled/hidden for Cashiers).
   - `src/components/modals/ReturnNoteModal.jsx`: One-click supplier return note modal pre-filling supplier details, batch info, return quantity, value loss, and rendering a printable Return Debit Note.
   - `src/components/modals/NewPOModal.jsx`: Purchase Order inward stock builder allowing selecting supplier, adding medicine items with batch #, expiry date, purchase price, MRP, quantity, rack/shelf bin location, and submitting PO to inward stock directly into `InventoryContext`. Guarded by `permissions.canCreatePurchaseOrder` (disabled/hidden for Cashiers).
5. Page Updates:
   - `src/pages/InventoryPage.jsx`: Master catalog table with search by Name/HSN, category dropdown filter, Schedule H filter toggle, Low stock filter toggle, "View Batches" drawer trigger, and "Stock Override" button (RBAC locked for Cashiers).
   - `src/pages/ExpiryRadarPage.jsx`: Expiry radar dashboard with timeline tabs (`Expired`, `30 Days`, `60 Days`, `90 Days`, `All Near Expiry`), Risk KPI summary cards (Total Batches at Risk, Risk Units, Estimated Value Loss in ₹), near-expiry table, and "Generate Return Note" modal trigger.
   - `src/pages/SuppliersPage.jsx`: Supplier directory table, active purchase orders table, and "+ New Purchase Order" action button (RBAC locked for Cashiers).
6. Execute `npm run build` in `d:\Code\Medical Store` using terminal commands to verify clean compilation with zero errors!

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Document implementation details, build output, and verification results in `d:\Code\Medical Store\.agents\teamwork_preview_worker_m3_1\handoff.md` and send a message back to the orchestrator.
</USER_REQUEST>
