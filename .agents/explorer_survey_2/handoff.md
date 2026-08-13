# Handoff Report — Explorer 2 (Requirements R2 & R6)

## 1. Observation
- **Codebase Path**: `d:/Code/medical store whole sale/Medical Store Phase 2`
- **Files Inspected**:
  - `src/pages/POSPage.jsx` (lines 45-58, 86-96, 108-123, 126-144, 242-244)
  - `src/components/modals/NewPOModal.jsx` (lines 22-33, 72-175)
  - `src/components/modals/CustomerDetailsModal.jsx` (lines 5-18, 51-211)
  - `src/context/CartContext.jsx` (lines 43-123)
  - `src/context/InventoryContext.jsx` (lines 41-52, 215-220)
  - `src/pages/ExpiryRadarPage.jsx` (lines 9-34)
- **Direct Observations**:
  - In `POSPage.jsx` (line 108-123), `handleAddItemToCart(med)` filters active batches and selects `activeBatches[0]` via FEFO without checking if `expiryDate <= 6 months from today`.
  - In `NewPOModal.jsx` (lines 72-175), `handleSubmit` loops over `poItems` and commits them to context without validating if any item's `expiryDate <= 6 months from today`.
  - In `POSPage.jsx` (lines 45-58) & `CustomerDetailsModal.jsx` (lines 5-18), `customerDetails` state is initialized with default mock values (`M/S Idrees Pharmacy / 280073`, `Jalapur Jattan`, etc.).
  - In `POSPage.jsx` (lines 86-96), `filteredSuggestions` returns `false` for empty `searchQuery`, and `onFocus` (line 243) requires `searchQuery.trim().length > 0` before setting `showDropdown(true)`.

## 2. Logic Chain
1. **R2 POS Expiry Check**: `handleAddItemToCart` receives a medicine object, retrieves available batches sorted by FEFO (`expiryDate`), and immediately adds `activeBatches[0]` to the cart. By parsing `activeBatches[0].expiryDate` and checking if it is `<= cutoffDate` (where `cutoffDate` = today + 6 months), we can block `addToCart` and fire `alert("Cannot Add Item: Expiry Date Exceeded (Expires within 6 Months)")`.
2. **R2 Purchase Order Inward Expiry Check**: `NewPOModal.jsx`'s `handleSubmit` receives user-entered `poItems`. By checking `new Date(item.expiryDate) <= cutoffDate` for every row in `poItems` before running `setBatches` and `createPurchaseOrder`, we can abort submission and fire `alert("Cannot Add Batch: Expiry Date Exceeded (Must be > 6 Months)")`.
3. **R6 Fresh Customer State**: Currently `POSPage.jsx` and `CustomerDetailsModal.jsx` use fallback initial states containing `'M/S Idrees Pharmacy / 280073'`. Replacing these fallback object values with empty strings `''` and adding standard `placeholder` strings ensures the page loads with no pre-filled customer and `CustomerDetailsModal.jsx` opens with clean, empty inputs and placeholders.
4. **R6 Search Dropdown & Keyboard Navigation**: `filteredSuggestions` in `POSPage.jsx` returns `[]` when `searchQuery` is empty. By returning `true` (all items) when `searchQuery` is empty, and updating `onFocus={() => setShowDropdown(true)}`, clicking/focusing the search input will open the full inventory dropdown. The existing `handleKeyDown` function already handles `ArrowDown`, `ArrowUp`, and `Enter` to navigate and select items.

## 3. Caveats
- Date strings in `batches` are primarily `YYYY-MM-DD`. A robust date parsing helper should handle both `YYYY-MM-DD` and `DD-MM-YYYY` formats cleanly.
- No source code modifications were performed during this survey phase (read-only investigation).

## 4. Conclusion
- Requirements R2 and R6 can be implemented concisely in `POSPage.jsx`, `NewPOModal.jsx`, and `CustomerDetailsModal.jsx` without breaking existing workflows or context logic.
- Implementation guidance, exact line ranges, and validation formulas are fully documented in `survey_report.md`.

## 5. Verification Method
1. **POS Expiry Rejection Test**: Attempt adding an item whose earliest batch expires within 6 months -> verify alert popup `"Cannot Add Item: Expiry Date Exceeded (Expires within 6 Months)"` and cart remains unchanged.
2. **PO Inward Expiry Rejection Test**: Attempt submitting a PO with an inward batch expiry date <= 6 months from today -> verify alert popup `"Cannot Add Batch: Expiry Date Exceeded (Must be > 6 Months)"` and PO is not created.
3. **Fresh Customer Test**: Load POS page -> verify customer state is empty by default; open `CustomerDetailsModal.jsx` -> verify inputs are empty with placeholders.
4. **Search `onFocus` & Arrow Navigation Test**: Click search input in POS without typing -> verify full inventory dropdown opens; press `ArrowDown` and `Enter` -> verify item is selected.
5. **Build Test**: Run `npm run build` to confirm zero build or lint errors.
