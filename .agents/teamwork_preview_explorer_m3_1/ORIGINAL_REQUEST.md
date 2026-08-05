## 2026-08-01T01:38:53Z
You are an Explorer for Milestone 3: Inventory, Expiry Radar & Supplier Management of PharmaLink ERP & POS.
Your metadata working directory is d:\Code\Medical Store\.agents\teamwork_preview_explorer_m3_1. Please create it if it does not exist.

Task Scope:
1. Examine the codebase in d:\Code\Medical Store.
2. Review d:\Code\Medical Store\.agents\orchestrator\PROJECT.md and plan.md.
3. Formulate a detailed file-by-file implementation plan for Milestone 3:
   - **Screen 3: Inventory & Batch Manager (`src/pages/InventoryPage.jsx`)**:
     - Master Catalog Table (Item Name, Category, HSN, Schedule H Rx tag, Total Stock, Active Batches Count, Action buttons).
     - Search & Filter Bar (Search by Name/HSN, Category dropdown/tabs, Schedule H filter toggle, Low Stock filter toggle).
     - Multi-batch side drawer component (`src/components/modals/BatchDetailDrawer.jsx`): Shows batch-wise detail table for selected medicine (Batch #, Expiry Date, MRP, Purchase Price, Stock Qty, Rack/Shelf location, Expiry Status badge).
     - Admin Stock Override modal (`src/components/modals/StockOverrideModal.jsx`): Allows Admin to override batch stock quantity (disabled/hidden for Cashier role via AuthContext `permissions.canOverrideStock`).
   - **Screen 4: Expiry Radar & Quarantine (`src/pages/ExpiryRadarPage.jsx`)**:
     - Timeline tabs (`Expired`, `30 Days`, `60 Days`, `90 Days`, `All Near Expiry`).
     - Expiry Risk KPI summary cards: Total Batches at Risk, Total Risk Units, Total Estimated Value Loss (₹ calculated dynamically from batch qty × purchase price / MRP).
     - Expiry Radar Table: Batch #, Medicine Name, Rack/Shelf bin location, Expiry Date, Days Remaining count, Stock Qty, Estimated Value Loss, Action button "Generate Return Note".
     - One-click Supplier Return Note Modal (`src/components/modals/ReturnNoteModal.jsx`): Pre-populates supplier name, batch details, return qty, estimated value loss, reason ("Near Expiry Quarantine"), and generates a printable Return Debit Note.
   - **Screen 5: Supplier & Purchase Orders (`src/pages/SuppliersPage.jsx`)**:
     - Supplier Context provider or state (`src/context/SupplierContext.jsx`): Manages supplier list and purchase order inward stock history.
     - Supplier Directory Table: Supplier Name, Contact Person, Phone, Email, GSTIN, Address, Active Orders count, "New PO" action button. (Create PO button disabled/hidden for Cashier role via AuthContext `permissions.canCreatePurchaseOrder`).
     - New PO / Inward Stock Builder Modal (`src/components/modals/NewPOModal.jsx`): Select supplier, add product items (select medicine, enter batch #, expiry date, purchase price, MRP, quantity, rack/shelf location), and submit to inward stock directly into `InventoryContext` (creating new batches or updating existing batch stock).
4. Write your detailed analysis and plan to `d:\Code\Medical Store\.agents\teamwork_preview_explorer_m3_1\analysis.md` and `handoff.md`.
5. Send a message back to the orchestrator.
