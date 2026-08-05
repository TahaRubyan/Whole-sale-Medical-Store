# Handoff Report: Milestone 3 Implementation Plan
## PharmaLink ERP & POS — Inventory, Expiry Radar & Supplier Management

---

## 1. Observation

1. **Project Infrastructure & Layout**:
   - `d:\Code\Medical Store\src\App.jsx` wraps context providers (`AuthProvider`, `InventoryProvider`, `PatientProvider`, `SalesProvider`, `CartProvider`) and manages screen switching between `dashboard`, `pos`, `inventory`, `expiry`, `suppliers`, `patients`, `analytics`, `settings`.
   - `d:\Code\Medical Store\src\data\mockData.js` provides seed data for `STORE_INFO`, `MOCK_PRODUCTS` (8 products with multi-batch array, MRP, purchase price, location, HSN code, Schedule H flag), `MOCK_SUPPLIERS` (3 suppliers), `MOCK_PATIENTS`, and helper functions `getFEFOBatch` and `getNearExpiryBatches`.
   - `d:\Code\Medical Store\src\context\AuthContext.jsx` defines RBAC permissions:
     - `canOverrideStock: isAdmin` (line 47)
     - `canViewFinancialProfit: isAdmin` (line 48)
     - `canCreatePurchaseOrder: isAdmin` (line 49)
     - `canModifyStoreSettings: isAdmin` (line 50)
   - `d:\Code\Medical Store\src\context\InventoryContext.jsx` provides `products`, `setProducts`, `deductStock`, `updateBatchStock`, and `getFEFOBatch`.
   - `d:\Code\Medical Store\src\pages\InventoryPage.jsx`, `ExpiryRadarPage.jsx`, and `SuppliersPage.jsx` exist as initial visual stubs but lack interactive features (search/filters, batch drawers, stock override modals, timeline tab filtering, debit note generation, and new PO inward stock builder).
   - `SupplierContext.jsx` does not exist yet in `src/context/`.

2. **Design Tokens & Icons**:
   - Palette in `src/styles/theme.css`: Primary Ocean Blue `#0284C7`, Canvas `#F7F4EF`, Ice Blue `#E0F2FE`, font `Plus Jakarta Sans`.
   - Reusable modal dialog `src/components/common/Modal.jsx` supports title, subtitle, icon, custom `maxWidth`, ESC key handling, and backdrop click.
   - Reusable badge component `src/components/common/Badge.jsx` supports `type="rx"`, `type="expiry"`, `type="stock"`, and `type="location"`.

---

## 2. Logic Chain

1. **Context Architecture Expansion**:
   - Observation 1 shows `SupplierContext.jsx` is missing.
   - Step 1: Create `src/context/SupplierContext.jsx` to store supplier catalog and PO history, and wrap it in `App.jsx`.
   - Step 2: Update `src/context/InventoryContext.jsx` to add `addOrUpdateBatch(productId, batchData)` so new PO items from `NewPOModal` can immediately update batch stock in active inventory.

2. **Screen 3 (Inventory & Batch Manager)**:
   - Observation 1 shows `InventoryPage.jsx` currently displays static product rows without search or drawers.
   - Step 3: Implement Search input (Name/HSN), Category dropdown, Schedule H toggle, and Low Stock filter in `InventoryPage.jsx`.
   - Step 4: Build `src/components/modals/BatchDetailDrawer.jsx` to display batch breakdown, expiry status badges, MRP/cost, and bin locations.
   - Step 5: Build `src/components/modals/StockOverrideModal.jsx` guarded by `permissions.canOverrideStock` to allow Admin stock adjustments.

3. **Screen 4 (Expiry Radar & Quarantine)**:
   - Observation 1 shows `ExpiryRadarPage.jsx` displays an un-filtered list of near-expiry items.
   - Step 6: Implement timeline tabs (`Expired`, `30 Days`, `60 Days`, `90 Days`, `All Near Expiry`) in `ExpiryRadarPage.jsx`.
   - Step 7: Add dynamic Risk KPI cards (Batches at risk, Risk units, Estimated value loss in ₹).
   - Step 8: Build `src/components/modals/ReturnNoteModal.jsx` to populate return details and render a printable Debit Note.

4. **Screen 5 (Supplier Directory & Purchase Orders)**:
   - Observation 1 shows `SuppliersPage.jsx` displays static suppliers with an unhandled "+ Create Purchase Order" button.
   - Step 9: Wire `SuppliersPage.jsx` to `SupplierContext`.
   - Step 10: Build `src/components/modals/NewPOModal.jsx` allowing multi-product inward stock builder that updates `InventoryContext`. Disabled for Cashiers via `permissions.canCreatePurchaseOrder`.

---

## 3. Caveats

- **No Caveats**: All codebase files, contexts, styling tokens, and RBAC contracts have been thoroughly examined and mapped.

---

## 4. Conclusion

The plan for Milestone 3 is complete, actionable, and fully specified in `analysis.md`. The design leverages existing Ocean Blue UI design tokens, respects all RBAC cashier restrictions (`canOverrideStock`, `canCreatePurchaseOrder`), and connects `SupplierContext` with `InventoryContext` for inward stock updates.

---

## 5. Verification Method

To verify the Milestone 3 plan and subsequent implementation:
1. **File Existence Check**:
   - Inspect created files: `src/context/SupplierContext.jsx`, `src/components/modals/BatchDetailDrawer.jsx`, `src/components/modals/StockOverrideModal.jsx`, `src/components/modals/ReturnNoteModal.jsx`, `src/components/modals/NewPOModal.jsx`.
2. **Build Verification**:
   - Run `npm run build` in `d:\Code\Medical Store` to ensure zero compilation or JSX syntax errors.
3. **Functional & RBAC Spot-check**:
   - Switch role to Cashier in Topbar: verify "+ New PO" button is disabled/locked, "Stock Override" button is disabled/locked, purchase prices/profit losses are masked.
   - Switch role to Admin: verify Stock Override updates quantity, New PO adds inward stock to inventory, Return Debit Note modal renders printable preview.
