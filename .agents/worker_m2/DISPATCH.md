## 2026-08-12T15:23:37Z

<USER_REQUEST>
You are Worker M2 (Region-Based Delivery & Settlement Ledger Developer).
Your working directory is: d:/Code/medical store whole sale/Medical Store Phase 2/.agents/worker_m2/
The original user request is at: d:/Code/medical store whole sale/Medical Store Phase 2/.agents/ORIGINAL_REQUEST.md
The project plan is at: d:/Code/medical store whole sale/Medical Store Phase 2/.agents/orchestrator_phase2/PROJECT.md

Your mission for Milestone 2:
Implement the Region-Based Delivery & Settlement Ledger feature set.

Requirements & Specifications:
1. Create `src/pages/RegionLedgerPage.jsx` (or `src/components/region/RegionLedgerPage.jsx` and re-export):
   - Access `invoices` and `recordDebtPayment` from `useSales()`.
   - Provide Region Filter Bar (dropdown and search box) that extracts all unique plain-text region strings from customer invoices (e.g., "Karianwala", "Gujrat", "Tanda", "Jalalpur Jattan", "All Regions").
   - Provide Summary KPI Cards for the selected Region (Total Region Shops/Invoices, Total Region Sales Net Total, Total Outstanding Debt, Total Cash Settled Today).
   - Render Inline Settlement Table with columns:
     - Shop Name (`customerName` / `shopName`)
     - Region (`region`)
     - Delivery Man (`deliveryMan` || "Unassigned")
     - Payment Status (`PAID`, `PARTIAL DEBT`, `UNPAID_CREDIT`)
     - Net Total (Rs.)
     - Current Due / Remaining Debt (Rs.)
     - Cash Received Today (Rs.) (interactive number input field per shop)
     - Actions: "Settle Cash" button per shop, "Payment Logs" history button.
   - Implement "Settle Cash" handler per shop:
     - Submits cash amount from input field.
     - Calls `SalesContext.recordDebtPayment(invoiceId, cashAmount)`.
     - Updates remaining debt, payment status (`PAID` if remaining debt === 0 else `PARTIAL DEBT`), and appends real-time timestamped payment log entry (`date`, `time`, `amountPaid`, `remainingDebtAfter`).
   - Implement "Settle All Region Cash" button:
     - Iterates through all shops in the currently filtered region that have a valid `Cash Received Today` input > 0 and calls `recordDebtPayment` for each.
   - Provide Payment History Log Modal (`src/components/region/PaymentHistoryModal.jsx`):
     - Opens when clicking "Payment Logs" for any shop invoice.
     - Displays full timestamped payment logs table (Date, Time, Amount Paid, Remaining Due, Notes/ID).
   - Provide A4 Regional Delivery Manifest & Settlement PDF export button:
     - Opens/triggers A4 printable manifest view (`#region-manifest-pdf`) with `@media print` DOM isolation and `window.print()`.
     - Includes Store Branding, Region Name, Delivery Man, Itemized Shop Delivery & Dues Table, Settlement Log, and Signature Blocks.
2. Update `src/components/common/Sidebar.jsx` & `src/App.jsx`:
   - Add "Region Delivery Ledger" option in `Sidebar.jsx` with Lucide icon (`MapPin` or `Truck`).
   - Add `/region-ledger` (or `case 'region-ledger':`) screen handler in `App.jsx`.
3. Verification:
   - Run `npm run build` using command line to verify 0 errors.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write implementation details and build verification results to `d:/Code/medical store whole sale/Medical Store Phase 2/.agents/worker_m2/handoff.md` and send a message when complete.
</USER_REQUEST>
