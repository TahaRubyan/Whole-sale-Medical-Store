# Adversarial Analysis & Verification Report — Milestone 1
**Target Component**: `src/components/inventory/StockSummaryReportModal.jsx`  
**Challenger**: Challenger 1 (Milestone 1)  
**Date**: 2026-08-12  
**Verdict**: **`REJECT`**

---

## Executive Summary

An empirical adversarial review was performed on `StockSummaryReportModal.jsx` covering mathematical correctness, low stock threshold filtering, build pipeline health, and PDF DOM isolation. 

While the project builds cleanly (`npm run build` 0 errors) and the low stock threshold condition strictly uses `totalBoxes <= med.reorderLevel`, a **critical mathematical calculation defect** was identified in how `totalBoxes` is calculated across batches. 

When stock is inwarded via Purchase Orders (`NewPOModal.jsx`), a `totalBoxesAvailable` property is attached to the batch object. However, subsequent POS sales (`InventoryContext.deductStock`), stock returns, or manual adjustments only update `b.totalTabletsAvailable` and leave `b.totalBoxesAvailable` unchanged. Because `StockSummaryReportModal.jsx` evaluates `(b.totalBoxesAvailable || Math.floor((b.totalTabletsAvailable || 0) / (med.tabletsPerBox || 20)))`, it prioritizes the stale `b.totalBoxesAvailable` value over actual remaining tablets. This causes sold-out items to report phantom box inventory, inflates valuation metrics, and prevents low-stock items from appearing on the Purchase Reorder Manifest.

---

## Challenge Findings & Stress Test Results

### [CRITICAL] Challenge 1: Stale `totalBoxesAvailable` Property Corrupts Inventory Count & Low Stock Detection

- **Target Code**: `src/components/inventory/StockSummaryReportModal.jsx` (Lines 21–30)
```javascript
const totalBoxes = medBatches.reduce(
  (sum, b) =>
    sum +
    (b.totalBoxesAvailable ||
      Math.floor(
        (b.totalTabletsAvailable || 0) / (med.tabletsPerBox || 20)
      ) ||
      0),
  0
);
```
- **Flaw Mechanism**:
  1. Inwarding stock via `NewPOModal.jsx` sets `b.totalBoxesAvailable = boxQty` (e.g. 50 boxes) alongside `b.totalTabletsAvailable = 10,000`.
  2. POS sales invoke `InventoryContext.deductStock`, reducing `b.totalTabletsAvailable` (e.g. down to 0).
  3. `deductStock` does NOT update or delete `b.totalBoxesAvailable`.
  4. In `StockSummaryReportModal.jsx`, `(b.totalBoxesAvailable || ...)` evaluates `50` as truthy. It completely ignores `b.totalTabletsAvailable = 0`.
- **Blast Radius**:
  - `totalBoxesAvailable` is grossly overstated.
  - `estimatedCostValuation` reports cost valuation for non-existent stock.
  - `isLow` evaluates `54 <= 50` (`false`), failing to flag depleted stock on the Low Stock Reorder Manifest.
- **Empirical Test Result**:
  - Test scenario: Added PO batch `B26-PO-999` for `MED-101` (50 boxes / 10,000 tablets). Deducted all 10,000 tablets via POS sale simulation (`totalTabletsAvailable = 0`).
  - Expected `totalBoxes`: 4 (from initial batch B26-Pan-01).
  - Actual `totalBoxes` computed: 54.
  - Expected `isLow`: `true` (`4 <= 50`).
  - Actual `isLow`: `false` (`54 <= 50`). Item omitted from reorder manifest!
- **Recommended Fix**:
  Calculate `totalBoxes` dynamically from `totalTabletsAvailable`:
  ```javascript
  const totalBoxes = medBatches.reduce(
    (sum, b) =>
      sum + Math.floor((b.totalTabletsAvailable || 0) / (med.tabletsPerBox || 20)),
    0
  );
  ```

---

## Detailed Evaluation of Mission Objectives

### 1. Mathematical Correctness
- **Total Boxes Available**: **FAILED** (due to stale `b.totalBoxesAvailable` fallback bug documented in Challenge 1).
- **Total Cost Valuation**: Formula `costValuation = totalBoxes * purchasePriceBox` is mathematically sound, but inherits the corrupted `totalBoxes` value whenever PO batches exist. Uses `med.purchasePriceBox` with fallbacks `med.boxPrice * 0.8` and `480`.
- **Suggested Reorder Box Quantities**: **PASSED**. Formula `Math.max(med.reorderLevel * 2 - totalBoxes, med.reorderLevel)` correctly calculates the quantity to restore stock to `2 * reorderLevel` with a floor of `reorderLevel`.
- **Total Suggested Investment**: **PASSED**. Correctly calculates `sum(suggestedReorderBoxes * purchasePriceBox)` for low stock items.

### 2. Low Stock Threshold Filtering
- **Criteria**: Must strictly use `totalBoxes <= med.reorderLevel`.
- **Verification**: **PASSED**.
  Line 35: `const isLow = totalBoxes <= med.reorderLevel;`
  Line 61: `const lowStockItems = medicinesWithStock.filter((m) => m.isLow);`
  Includes items where `totalBoxes === reorderLevel` as required.

### 3. Build Pipeline Health
- **Command**: `npm run build`
- **Verification**: **PASSED**.
  Built cleanly in 4.23s with 0 errors (`dist/assets/index-BJTn2jFv.js`).

### 4. PDF DOM Isolation & Print Setup
- **Verification**: **PASSED**.
  Uses `@media print` CSS targeting `#stock-summary-pdf`, hiding overlay UI elements via `.no-print`, and invoking `window.print()`.

---

## Test Execution Summary (Empirical Test Harness)

Running test harness `test_harness.mjs` against pre-seeded mock data:
- Catalog Medicines: 8
- Pre-seeded Total Boxes Available: 47
- Pre-seeded Inventory Cost Valuation: Rs. 13,680.00
- Pre-seeded Low Stock Count: 8 Items
- Pre-seeded Total Suggested Purchase Investment: Rs. 228,720.00

After PO batch addition + POS tablet deduction (Test 2):
- Real remaining tablets for MED-101: 850 tablets (4 boxes)
- Reported `totalBoxes`: 54 boxes ❌
- Low stock alert triggered?: No ❌

---

## Final Verdict

**`REJECT`**

The implementation in `StockSummaryReportModal.jsx` cannot be approved until the stale `b.totalBoxesAvailable` fallback bug is resolved so that `totalBoxes` accurately reflects remaining tablet stock across all batches.
