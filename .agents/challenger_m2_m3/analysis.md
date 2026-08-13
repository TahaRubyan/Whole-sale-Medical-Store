# Adversarial Challenge & Analysis Report — Milestone 2 & 3

**Target Scope**: Milestone 2 (Region Delivery Ledger & Settlement) & Milestone 3 (Plain-Text Region Inputs)  
**Evaluator**: Empirical Challenger  
**Verdict**: **APPROVE**  
**Date**: 2026-08-12  

---

## Challenge Summary

**Overall Risk Assessment**: **LOW**

All settlement workflows, debt reduction calculations, timestamp formatting in audit logs, plain-text region input handling, dynamic region extraction, and batch processing were empirically stress-tested using an automated test harness (`test_harness.mjs`). A total of 34 distinct assertions were executed against the business logic, edge cases, and UI handlers with **0 failures** (34/34 Passed). The production build command (`npm run build`) passed with zero errors.

---

## Challenges & Stress-Testing Analysis

### 1. Partial & Exact Settlement Cash Calculations
- **Scenario**: Shop invoice has an outstanding debt of Rs. 20,000. Cash of Rs. 5,000 is settled, followed by the remaining Rs. 15,000.
- **Attack Scenario**: Test whether partial payments miscalculate `remainingDebt`, fail to transition status to `PARTIAL DEBT`, or overwrite existing audit logs.
- **Empirical Result**:
  - Initial settlement of Rs. 5,000 correctly reduced debt from Rs. 20,000 to Rs. 15,000.
  - Payment status transitioned from `UNPAID_CREDIT` / `PARTIAL DEBT` as expected.
  - Subsequent settlement of Rs. 15,000 brought `remainingDebt` to exactly 0 and updated `paymentStatus` to `PAID`.
  - Payment log array preserved both historic and new entries.

### 2. Overpayment & Out-of-Bounds Cash Entry
- **Scenario**: Cash input of Rs. 20,000 entered on an invoice with only Rs. 15,000 remaining debt.
- **Attack Scenario**: Test if cashier can over-collect cash or create negative debt (`remainingDebt < 0`).
- **Empirical Result**:
  - `RegionLedgerPage.jsx` handler (`handleSettleCash`) detects `cashAmount > currentDebt` and rejects the operation with a prominent error notification: `"Entered amount (Rs. 20000) exceeds remaining debt (Rs. 15000)"`.
  - `SalesContext.jsx` fallback calculation `Math.max(0, currentDebt - paidNum)` guarantees that even direct context invocations will never cause negative debt.

### 3. Invalid, Zero & Empty Cash Inputs
- **Scenario**: Inputs such as `0`, `-500`, `""` (empty string), or `"abc"` (NaN) submitted via "Settle Cash".
- **Attack Scenario**: Test if zero or invalid entries pollute `paymentLogs` with zero-amount audit entries or throw runtime NaN exceptions.
- **Empirical Result**:
  - All non-positive or invalid inputs are caught by `!rawVal || isNaN(cashAmount) || cashAmount <= 0`.
  - User receives error notification: `"Please enter a valid cash amount greater than Rs. 0"`. No invalid log entries are appended.

### 4. "Settle All Region Cash" Batch Processing
- **Scenario**: Multiple shop invoices displayed for a region with a mix of valid inputs (e.g. Rs. 10,000), empty inputs, and zero inputs.
- **Attack Scenario**: Test batch processing when no valid inputs are present or when multiple shops are settled simultaneously.
- **Empirical Result**:
  - When no valid inputs (> 0) exist, batch handler aborts with notification: `"No valid cash amounts (> 0) entered in the input fields for this region."`.
  - When valid inputs are provided for a subset of shops, batch handler correctly iterates, settles only valid shops, updates individual debts, clears input fields, and reports total count and aggregate cash settled.

### 5. Timestamp Format Verification in `paymentLogs`
- **Scenario**: Inspect appended audit trail entries in `SalesContext.jsx` and rendering in `PaymentHistoryModal.jsx`.
- **Attack Scenario**: Test if timestamp fields are missing, unformatted, or undefined.
- **Empirical Result**:
  - `paymentLogs` entries contain explicit `date` (ISO date string format `YYYY-MM-DD`, e.g. `"2026-08-12"`) and `time` (12-hour formatted time string, e.g. `"08:28 PM"` via `toLocaleTimeString`).
  - `PaymentHistoryModal.jsx` renders both `date` with `Calendar` icon and `time` with `Clock` icon.

### 6. Plain-Text Region Inputs & Dynamic Filtering
- **Scenario**: Entering custom region names (e.g. `"Karianwala"`, `"Karianwala Custom Sector"`, `"Jalalpur Jattan"`) in `CustomerDetailsModal.jsx` and POS checkout.
- **Attack Scenario**: Test if custom region strings get lost during checkout or filtered out by hardcoded dropdown lists.
- **Empirical Result**:
  - `CustomerDetailsModal.jsx` uses a plain-text `<input type="text" name="region" ... />`.
  - `CartContext.jsx` preserves `extraDetails.region` onto `saleRecord.region`.
  - `RegionLedgerPage.jsx` computes `availableRegions` dynamically by combining preset region defaults with all unique region strings present on active invoices (`regionSet.add(inv.region.trim())`).
  - Case-insensitive filtering and global search bar match custom typed regions cleanly.

---

## Stress Test Execution Matrix

| # | Test Scenario | Expected Outcome | Actual Result | Status |
|---|---------------|------------------|---------------|--------|
| 1 | Initial Invoice Data Verification | Pre-seeded invoices loaded with valid region metadata | Loaded 4+ invoices with regions (Karianwala, Gujrat, Tanda, Jalalpur Jattan) | PASS |
| 2 | Partial Cash Settlement (Rs. 5,000 on Rs. 20,000 due) | Debt reduced to Rs. 15,000, status = PARTIAL DEBT | Debt = 15,000, status = PARTIAL DEBT | PASS |
| 3 | Payment Log Timestamp Format | Date (YYYY-MM-DD) and Time (hh:mm AM/PM) present | `date: "2026-08-12"`, `time: "08:28 PM"` | PASS |
| 4 | Exact Cash Settlement (Rs. 15,000 on Rs. 15,000 due) | Debt reduced to Rs. 0, status = PAID | Debt = 0, status = PAID | PASS |
| 5 | Overpayment Guard (Rs. 20,000 on Rs. 15,000 due) | Rejection notification, no payment recorded | Blocked with error message mentioning debt limit | PASS |
| 6 | Direct Overpayment Context Fallback | `remainingDebt` clamped to 0 | `Math.max(0, ...)` returned 0, status = PAID | PASS |
| 7 | Zero Cash Input Settlement | Rejection notification, log unchanged | Blocked with error notification | PASS |
| 8 | Negative Cash Input Settlement | Rejection notification | Blocked with error notification | PASS |
| 9 | Empty / NaN Cash Input Settlement | Rejection notification | Blocked with error notification | PASS |
| 10 | Batch Settlement with 0 inputs | Rejection notification | Blocked with empty input notice | PASS |
| 11 | Batch Settlement with valid inputs | Processed 1 shop, total settled = Rs. 10,000 | Settled 1 shop, updated debt to 10,000 | PASS |
| 12 | Dynamic Region Extraction (Custom Region) | Custom region added to available regions dropdown | "Karianwala Custom Sector" extracted into list | PASS |
| 13 | Case-Insensitive Region Filter | Matching invoices returned regardless of case | Filtered 1 invoice matching "karianwala custom sector" | PASS |
| 14 | Search Query Region Filter | Text search matches region string | Search query "Karianwala Custom" returned matching invoice | PASS |
| 15 | Automated Build (`npm run build`) | Exit code 0, 0 build errors | Built in 4.51s, exit code 0 | PASS |

---

## Unchallenged Areas

- **Backend / Database Persistence**: The application operates as a client-side SPA utilizing `localStorage` (`pharmalink_pk_invoices`, `pharmalink_pos_cart`). Remote database sync is out of scope for Phase 2.

---

## Final Verdict

**`APPROVE`** — All requirements for Milestone 2 & Milestone 3 have been rigorously tested, verified, and confirmed to meet zero-defect standards.
