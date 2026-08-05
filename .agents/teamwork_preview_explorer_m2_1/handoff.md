# Handoff Report: Milestone 2 — POS & FEFO Billing Checkout + Modals

## 1. Observation
- **Project Structure**:
  - `d:\Code\Medical Store\src\App.jsx`: Entry component currently wrapping application in `AuthProvider`.
  - `d:\Code\Medical Store\src\data\mockData.js`: Central seed database containing `STORE_INFO`, `MOCK_PRODUCTS` (with multi-batch dates and `location` rack/shelf data), `MOCK_PATIENTS`, `MOCK_SALES_HISTORY`, and `getFEFOBatch` helper function.
  - `d:\Code\Medical Store\src\hooks\useHotkeys.js`: Key listener configured for `F1`-`F4` screen navigation, `F9` (Thermal Receipt), `F10` (A4 Tax Invoice).
  - `d:\Code\Medical Store\src\components\layout\Layout.jsx`: Prototype shell with placeholder pop-ups for F9 and F10.
  - `d:\Code\Medical Store\src\pages\POSPage.jsx`: M1 placeholder page.
- **Identified Needs for Milestone 2**:
  - Four state management providers (`InventoryContext.jsx`, `PatientContext.jsx`, `SalesContext.jsx`, `CartContext.jsx`) are required to support real-time stock deduction, patient prescription recording, sales ledger history, and cart/billing operations.
  - Three modal components (`PatientRxDrawer.jsx`, `ThermalReceiptModal.jsx`, `A4InvoiceModal.jsx`) and common components (`Modal.jsx`, `Badge.jsx`, `NotificationToast.jsx`) are needed.
  - Full rewrite of `POSPage.jsx` into an interactive 2-column POS workspace with omni-search, category filters, FEFO batch selection, rack/shelf display, manual batch switching, cart summary, discount/GST calculation, payment modes, and checkout execution.

---

## 2. Logic Chain
1. **Context Architecture**: `CartContext` needs access to live product catalog, patient registry, and sales transaction log. Establishing `InventoryContext`, `PatientContext`, and `SalesContext` alongside `CartContext` ensures clean data flow where POS checkout seamlessly deducts stock from batches, saves new Schedule H patient records, and records completed sales.
2. **FEFO Auto-Assignment**: When adding a product to cart without an explicit batch override, `CartContext` searches `product.batches`, filters for `quantity > 0`, sorts by `expiryDate` ascending, and selects batch index 0. If no batch has `quantity > 0`, item addition is blocked and an out-of-stock toast is shown.
3. **Batch Switcher & Location Display**: The UI needs to show the exact rack/shelf bin location (e.g. `Rack A-01 / Shelf 2`) and expiry badge. A inline batch selector dropdown within cart items allows cashiers to switch from the default FEFO batch to an alternate available batch if necessary.
4. **Schedule H Rx Enforcement**: Any cart item with `isScheduleH === true` requires patient and doctor details (`PatientRxDrawer.jsx`). If a cashier clicks "Complete Checkout" without capturing Rx details, `CartContext` intercepts the flow, opens `PatientRxDrawer`, and prevents checkout until required fields are saved.
5. **Print Hotkeys (F9 & F10)**: `Layout.jsx` binds `useHotkeys` handlers for F9 and F10 to `CartContext.openModal('thermal')` and `CartContext.openModal('a4')`, displaying the last completed sale or active cart data.

---

## 3. Caveats
- **Read-Only Scope**: This analysis and implementation plan were created in read-only exploration mode. Source code under `src/` has not been altered by this explorer.
- **Stock Depletion Handling**: Batches reaching 0 stock remain in `product.batches` with `quantity: 0` to preserve historical integrity, but are excluded from future FEFO auto-assignments.
- **Printer Hardware**: Browser `window.print()` triggers the system print dialog; hardware POS printer integration relies on browser print styles or standard receipt spooler.

---

## 4. Conclusion
Milestone 2 requires creating 4 context modules (`InventoryContext`, `PatientContext`, `SalesContext`, `CartContext`), 3 modal components (`PatientRxDrawer`, `ThermalReceiptModal`, `A4InvoiceModal`), 3 common components (`Modal`, `Badge`, `NotificationToast`), updating `App.jsx` and `Layout.jsx`, and fully implementing `POSPage.jsx`.

The step-by-step implementation sequence is:
1. `src/context/InventoryContext.jsx` (New)
2. `src/context/PatientContext.jsx` (New)
3. `src/context/SalesContext.jsx` (New)
4. `src/context/CartContext.jsx` (New)
5. `src/App.jsx` (Wrap providers)
6. `src/components/common/Badge.jsx` (New)
7. `src/components/common/Modal.jsx` (New)
8. `src/components/common/NotificationToast.jsx` (New)
9. `src/components/modals/PatientRxDrawer.jsx` (New)
10. `src/components/modals/ThermalReceiptModal.jsx` (New)
11. `src/components/modals/A4InvoiceModal.jsx` (New)
12. `src/pages/POSPage.jsx` (Full implementation)
13. `src/components/layout/Layout.jsx` (Wire global modal handlers to `CartContext`)

---

## 5. Verification Method

### 5.1 Verification Commands
- **Vite Development Server**: `npm run dev`
- **Production Build Verification**: `npm run build`

### 5.2 Manual UI Verification Steps
1. **POS Omni-Search**:
   - Navigate to POS Billing (`F2`).
   - Type `Augmentin` in search bar -> Verify `Augmentin 625 Duo` appears.
   - Type `3004` (HSN) -> Verify all HSN 3004 medicines appear.
   - Click filter pills `Schedule H`, `OTC`, `All` -> Verify instant category filtering.
2. **FEFO Batch Selection & Rack Display**:
   - Add `Augmentin 625 Duo` to cart -> Verify batch `BT-2026-08` (earliest expiry 2026-08-15) is auto-assigned.
   - Verify Rack location `Rack A-01 / Shelf 2` is displayed.
   - Click batch selector dropdown in cart item -> Switch to batch `BT-2026-11` -> Verify batch number and expiry update.
3. **Schedule H Rx Patient Drawer**:
   - Add a Schedule H medicine (`Augmentin 625 Duo`) to cart.
   - Click "Complete Checkout" -> Verify `PatientRxDrawer` pops up asking for Patient Name, Phone, and Doctor Name.
   - Select existing patient `Rajesh Kumar` -> Verify details fill automatically -> Click "Save Prescription Details".
4. **Calculations & Payment**:
   - Enter a 10% discount -> Verify Subtotal, Discount Amount, GST breakdown, and Grand Total update dynamically.
   - Select `Cash` payment mode and enter cash tendered -> Verify "Change Due" updates.
5. **Checkout & Modals**:
   - Click "Complete Checkout" -> Verify stock quantity is deducted in `InventoryContext`, sale is recorded in `SalesContext`, cart clears, and `ThermalReceiptModal` opens.
   - Press `F9` -> Verify Thermal Receipt modal opens with completed sale details.
   - Press `F10` -> Verify A4 Tax Invoice modal opens with complete GST breakdown table and signature block.
