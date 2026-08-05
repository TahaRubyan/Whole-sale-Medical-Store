## 2026-08-01T01:30:00Z

<USER_REQUEST>
You are an Explorer for Milestone 2: POS & FEFO Billing Checkout + Modals of PharmaLink ERP & POS.
Your metadata working directory is d:\Code\Medical Store\.agents\teamwork_preview_explorer_m2_1. Please create it if it does not exist.

Task Scope:
1. Examine the codebase in d:\Code\Medical Store.
2. Review d:\Code\Medical Store\.agents\orchestrator\PROJECT.md and plan.md.
3. Formulate a detailed file-by-file implementation plan for Milestone 2:
   - State & Context management for Cart & Billing (`src/context/CartContext.jsx` or state in POSPage/Layout) with inventory integration.
   - POS Omni-Search (`POSPage.jsx`): Real-time search filter by Barcode, Medicine Name, Generic Composition, or HSN Code. Quick category filters (All, Schedule H, OTC, First Aid, Supplements).
   - FEFO Auto-Assignment Logic: When adding a medicine to cart, automatically search all active batches for that medicine and pick the earliest expiring batch (`expiryDate`) where `quantity > 0`.
   - Batch Selection & Rack/Shelf Display: Display picked batch number, expiry date badge (highlighting near-expiry), stock remaining, and Rack/Shelf bin location (e.g. `Rack B-03 / Shelf 2`). Allow manual batch switching if needed.
   - Schedule H Rx Patient Drawer Modal (`src/components/modals/PatientRxDrawer.jsx` or inline drawer): Triggered when any Schedule H medicine is added or at checkout if Rx patient info is required. Captures Patient Name, Patient Phone, Prescribing Doctor Name, and Rx Date. Pre-populates from existing patient registry or adds new patient.
   - Cart Summary & Payment Calculation: Cart items table, quantity controls, price/MRP calculation, GST percentage calculation, payment mode selector (Cash, Card, UPI), discount input, and Checkout action button.
   - Thermal Receipt Modal (`src/components/modals/ThermalReceiptModal.jsx`): Rendered in 80mm POS style with store header, DL Form 20/21, GSTIN, invoice #, date/time, cashier name, patient details if Rx, itemized batch list with HSN/expiry/qty/amount, subtotal, GST split, final paid amount, payment mode, barcode, and print/close actions. Triggerable via F9 key shortcut or POS action.
   - A4 Tax Invoice Modal (`src/components/modals/A4InvoiceModal.jsx`): Full page A4 printable GST Tax Invoice preview with official store header, license numbers, customer/patient details, prescription doctor info, comprehensive table (Item, HSN, Batch, Expiry, Qty, MRP, Rate, GST %, Taxable Value, Total), tax breakdown summary table, terms & conditions, authorized signature block, and print/close actions. Triggerable via F10 key shortcut or POS action.
   - Inventory & Ledger Update on Checkout: Deducts purchased batch quantities from stock and appends a sale record to `MOCK_SALES_HISTORY` / `SalesContext`.
4. Write your detailed analysis and plan to `d:\Code\Medical Store\.agents\teamwork_preview_explorer_m2_1\analysis.md` and `handoff.md`.
5. Send a message back to the orchestrator.
</USER_REQUEST>
