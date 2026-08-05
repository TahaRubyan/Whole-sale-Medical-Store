## 2026-08-01T01:31:09Z

You are the Worker for Milestone 2: POS & FEFO Billing Checkout + Modals of PharmaLink ERP & POS.
Your metadata working directory is d:\Code\Medical Store\.agents\teamwork_preview_worker_m2_1. Please create it if it does not exist.

Task Scope:
Read the Explorer's analysis and plan at d:\Code\Medical Store\.agents\teamwork_preview_explorer_m2_1\analysis.md and handoff.md.

Construct all components and context providers for Milestone 2:
1. `src/context/InventoryContext.jsx`: State management for product catalog and batches with `deductStock(cartItems)` and `updateBatchStock(productId, batchNo, newQty)`.
2. `src/context/PatientContext.jsx`: State management for patient registry and Rx records with `addPatient(patientData)` and `addRxLog(patientId, rxRecord)`.
3. `src/context/SalesContext.jsx`: State management for completed transactions ledger with `recordSale(saleTransaction)`.
4. `src/context/CartContext.jsx`: Cart engine supporting FEFO batch auto-assignment (`getFEFOBatch`), item addition/removal, quantity update, batch switching, discount calculation (%/₹), GST tax split calculation, cash tendered change calculation, active modal state ('thermal' [F9], 'a4' [F10], 'patientRx', null), last completed sale state, and `processCheckout()`.
5. Update `src/App.jsx` to wrap context providers in proper order: `InventoryProvider` -> `PatientProvider` -> `SalesProvider` -> `CartProvider`.
6. Common components:
   - `src/components/common/Badge.jsx` (Rx tag, expiry alert levels, stock status).
   - `src/components/common/Modal.jsx` (Accessible modal wrapper with backdrop blur, keyboard ESC handling, close button).
   - `src/components/common/NotificationToast.jsx` (Toast alerts for cart actions, FEFO notifications, warnings).
7. Modal components:
   - `src/components/modals/PatientRxDrawer.jsx`: Schedule H patient & prescribing doctor drawer.
   - `src/components/modals/ThermalReceiptModal.jsx`: 80mm thermal receipt preview modal (F9 shortcut trigger).
   - `src/components/modals/A4InvoiceModal.jsx`: Full page A4 printable GST Tax Invoice preview modal (F10 shortcut trigger).
8. `src/pages/POSPage.jsx`: Full 2-column POS workspace:
   - Omni-search (Barcode, Medicine Name, HSN, Generic Composition) with keyboard focus support (F2 hotkey).
   - Category filter tabs (All, Schedule H, OTC, First Aid, Supplements).
   - Product catalog grid showing medicine details, Rack/Shelf bin location (e.g., Rack A-01 / Shelf 2), FEFO batch badge, stock level, and Add-to-Cart trigger.
   - Cart item list with item details, Rack/Shelf badge, inline batch selector dropdown (allowing cashiers to view or switch batches), quantity stepper buttons, line total, and remove button.
   - Schedule H Rx status banner (prompts for patient details if Schedule H items exist in cart).
   - Billing calculations section: Subtotal, Discount (% or ₹), GST split (5%, 12%, 18%), Grand Total, Payment method selector (Cash, Card, UPI), Cash tendered & change calculation.
   - Action buttons: "F9 Thermal Receipt", "F10 A4 Invoice", and "Complete Checkout & Print".
9. Update `src/components/layout/Layout.jsx`: Wire modal rendering to `CartContext`.
10. Execute `npm run build` in `d:\Code\Medical Store` using terminal commands to verify clean bundle compilation with zero errors!

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Document implementation details, build output, and verification results in `d:\Code\Medical Store\.agents\teamwork_preview_worker_m2_1\handoff.md` and send a message back to the orchestrator.
